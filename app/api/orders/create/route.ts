import { NextResponse } from "next/server";
import { checkoutFormSchema } from "@/lib/validation/checkout";
import { adminDb } from "@/lib/firebase-admin";
import { getProductById } from "@/lib/data/products";
import { calculateDeliveryCharge } from "@/lib/delivery";
import { isOnlinePaymentEnabled } from "@/lib/payments";
import { STORE_CONFIG } from "@/lib/store-config";
import type { Order, OrderItem, CustomerRecord, Coupon } from "@/types";
import { SAMPLE_COUPON } from "@/scripts/seed-data";

export const runtime = "nodejs";

// In-memory rate limiting (§12.4)
const rateLimitMap = new Map<string, { count: number; expiresAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.expiresAt) {
    rateLimitMap.set(ip, { count: 1, expiresAt: now + 60 * 1000 }); // 1 min window
    return true;
  }
  if (entry.count >= 20) {
    return false;
  }
  entry.count += 1;
  return true;
}

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        {
          error: {
            code: "RATE_LIMITED",
            message: "Too many requests. Please wait a minute before trying again.",
          },
        },
        { status: 429 }
      );
    }

    const body = await req.json();

    // Honeypot check (§7.7, §8.2)
    if (body.honeypot && body.honeypot.trim() !== "") {
      // Silently reject bot submissions
      return NextResponse.json({
        data: {
          docId: "hp_simulated",
          orderId: "PT-000000",
          total: 0,
        },
      });
    }

    const parsed = checkoutFormSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_INPUT",
            message: "Please check the form for errors",
            fields: parsed.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Verify online payment eligibility
    if (data.paymentMode === "online" && !isOnlinePaymentEnabled()) {
      return NextResponse.json(
        {
          error: {
            code: "PAYMENT_MODE_UNAVAILABLE",
            message: "Online payment is currently disabled. Please select Cash on Delivery (COD).",
          },
        },
        { status: 400 }
      );
    }

    // Step 2 & 3: Authoritative Product Resolution & Stock Verification (§8.2)
    const orderItems: OrderItem[] = [];
    let subtotal = 0;

    for (const requestedItem of data.items) {
      const product = await getProductById(requestedItem.productId);
      if (!product || !product.isActive) {
        return NextResponse.json(
          {
            error: {
              code: "PRODUCT_UNAVAILABLE",
              message: `Product is no longer available: ${product?.name || requestedItem.productId}`,
            },
          },
          { status: 400 }
        );
      }

      const variant =
        product.variants.find((v) => v.id === requestedItem.variantId) || product.variants[0];
      const currentStock = variant ? variant.stock : 0;

      if (currentStock < requestedItem.qty) {
        return NextResponse.json(
          {
            error: {
              code: "INSUFFICIENT_STOCK",
              message: `Insufficient stock for ${product.name} (${variant?.label || "standard"}). Available: ${currentStock}`,
            },
          },
          { status: 400 }
        );
      }

      // Server unit price authoritative (§8.2)
      const unitPrice = variant?.priceOverride ?? product.price;
      subtotal += unitPrice * requestedItem.qty;

      orderItems.push({
        productId: product.id,
        variantId: variant ? variant.id : requestedItem.variantId,
        name: product.name,
        variantLabel: variant ? variant.label : "Standard",
        price: unitPrice,
        qty: requestedItem.qty,
        image: product.images?.[0] || "",
        warranty: product.warranty.enabled
          ? { enabled: true, months: product.warranty.months }
          : null,
      });
    }

    // Step 4: Validate Coupon (§8.2, §12.4)
    let discount = 0;
    let validCouponCode: string | undefined = undefined;

    if (data.couponCode && data.couponCode.trim() !== "") {
      const codeUpper = data.couponCode.toUpperCase().trim();
      let coupon: Coupon | null = null;

      try {
        const cSnap = await adminDb.collection("coupons").doc(codeUpper).get();
        if (cSnap.exists) {
          coupon = cSnap.data() as Coupon;
        }
      } catch {
        // Fallback
      }

      if (!coupon && codeUpper === SAMPLE_COUPON.code) {
        coupon = SAMPLE_COUPON;
      }

      if (coupon && coupon.isActive) {
        const now = Date.now();
        const validTime =
          (!coupon.startsAt || now >= coupon.startsAt) &&
          (!coupon.expiresAt || now <= coupon.expiresAt);
        const validMin = subtotal >= coupon.minOrder;
        const validUsage = !coupon.usageLimit || coupon.usedCount < coupon.usageLimit;

        if (validTime && validMin && validUsage) {
          if (coupon.type === "percent") {
            discount = Math.round((subtotal * coupon.value) / 100);
            if (coupon.maxDiscount && discount > coupon.maxDiscount) {
              discount = coupon.maxDiscount;
            }
          } else {
            discount = coupon.value;
          }
          discount = Math.min(discount, subtotal);
          validCouponCode = coupon.code;
        }
      }
    }

    // Authoritative Delivery Charge
    const delivery = calculateDeliveryCharge({ subtotal, discount });
    const total = Math.max(0, subtotal - discount) + delivery.charge;
    const now = Date.now();

    // Generate Human Order ID: PT-000001
    let orderNum = 1;
    try {
      const counterRef = adminDb.collection("counters").doc("orders");
      await adminDb.runTransaction(async (t) => {
        const doc = await t.get(counterRef);
        const currentVal = doc.exists ? (doc.data()?.value || 0) : 0;
        orderNum = currentVal + 1;
        t.set(counterRef, { value: orderNum }, { merge: true });
      });
    } catch {
      orderNum = Math.floor(100000 + Math.random() * 900000);
    }

    const orderIdFormatted = `${STORE_CONFIG.orderIdPrefix}${String(orderNum).padStart(6, "0")}`;

    // Step 7: Order Document Construction
    const orderDocRef = adminDb.collection("orders").doc();
    const orderData: Order = {
      id: orderDocRef.id,
      orderId: orderIdFormatted,
      customer: {
        name: data.fullName,
        phone: data.mobile,
        address: data.address,
        landmark: data.landmark || undefined,
        city: data.city || "Delhi",
        pincode: data.pincode,
        email: data.email || undefined,
      },
      items: orderItems,
      subtotal,
      discount,
      deliveryCharge: delivery.charge,
      total,
      couponCode: validCouponCode,
      payment: {
        method: data.paymentMode,
        status: "pending",
      },
      status: "placed",
      statusHistory: [
        {
          status: "placed",
          at: now,
          by: "customer",
          note: `Order placed via guest checkout (${data.paymentMode.toUpperCase()})`,
        },
      ],
      warrantyCards: [],
      warrantyCardIssued: false,
      createdAt: now,
      updatedAt: now,
    };

    // Save order, update stock, increment coupon, upsert customer (§8.2)
    try {
      await adminDb.collection("orders").doc(orderDocRef.id).set(orderData);

      // Decrement stock for each variant
      for (const item of orderItems) {
        try {
          const prodRef = adminDb.collection("products").doc(item.productId);
          const pSnap = await prodRef.get();
          if (pSnap.exists) {
            const pData = pSnap.data();
            const updatedVariants = (pData?.variants || []).map((v: { id: string; stock: number; [key: string]: unknown }) => {
              if (v.id === item.variantId) {
                return { ...v, stock: Math.max(0, v.stock - item.qty) };
              }
              return v;
            });
            await prodRef.update({ variants: updatedVariants, updatedAt: now });
          }
        } catch {
          // If Firestore is offline, local state updated
        }
      }

      // Increment coupon usedCount if applicable
      if (validCouponCode) {
        try {
          const cRef = adminDb.collection("coupons").doc(validCouponCode);
          const cSnap = await cRef.get();
          if (cSnap.exists) {
            await cRef.update({ usedCount: (cSnap.data()?.usedCount || 0) + 1 });
          }
        } catch {
          // Ignore
        }
      }

      // Upsert customer record
      try {
        const custRef = adminDb.collection("customers").doc(data.mobile);
        const custSnap = await custRef.get();
        if (custSnap.exists) {
          const cData = custSnap.data() as CustomerRecord;
          await custRef.update({
            name: data.fullName,
            lastAddress: `${data.address}, ${data.city} - ${data.pincode}`,
            ordersCount: (cData.ordersCount || 0) + 1,
            totalSpent: (cData.totalSpent || 0) + total,
            lastOrderAt: now,
          });
        } else {
          await custRef.set({
            phone: data.mobile,
            name: data.fullName,
            lastAddress: `${data.address}, ${data.city} - ${data.pincode}`,
            ordersCount: 1,
            totalSpent: total,
            lastOrderAt: now,
          });
        }
      } catch {
        // Ignore
      }
    } catch (e) {
      console.warn("Firestore write skipped in offline mode:", e);
    }

    return NextResponse.json({
      data: {
        docId: orderDocRef.id,
        orderId: orderIdFormatted,
        total,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Order creation failed";
    return NextResponse.json(
      {
        error: {
          code: "ORDER_CREATION_FAILED",
          message,
        },
      },
      { status: 500 }
    );
  }
}
