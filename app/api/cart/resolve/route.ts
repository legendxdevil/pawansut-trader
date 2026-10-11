import { NextResponse } from "next/server";
import { z } from "zod";
import { getProductById } from "@/lib/data/products";
import { calculateDeliveryCharge } from "@/lib/delivery";

export const runtime = "nodejs";

const cartResolveSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string().min(1),
      variantId: z.string().min(1),
      qty: z.number().int().positive().max(10),
    })
  ),
  couponCode: z.string().optional(),
});

export interface HydratedCartItem {
  productId: string;
  variantId: string;
  qty: number;
  name: string;
  slug: string;
  variantLabel: string;
  price: number; // Server-authoritative unit price snapshot (§7.5)
  mrp: number;
  image?: string;
  availableStock: number;
  isActive: boolean;
  isOutOfStock: boolean;
  warranty: {
    enabled: boolean;
    months: number;
  } | null;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = cartResolveSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_INPUT",
            message: "Invalid cart items payload",
            fields: parsed.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const { items } = parsed.data;
    const hydratedItems: HydratedCartItem[] = [];
    let subtotal = 0;
    let hasStockIssue = false;

    for (const item of items) {
      const product = await getProductById(item.productId);

      if (!product || !product.isActive) {
        hasStockIssue = true;
        hydratedItems.push({
          productId: item.productId,
          variantId: item.variantId,
          qty: item.qty,
          name: product ? product.name : "Unavailable Product",
          slug: product ? product.slug : "",
          variantLabel: "Unavailable",
          price: 0,
          mrp: 0,
          availableStock: 0,
          isActive: false,
          isOutOfStock: true,
          warranty: null,
        });
        continue;
      }

      const variant = product.variants.find((v) => v.id === item.variantId) || product.variants[0];
      const availableStock = variant ? variant.stock : 0;
      const unitPrice = variant?.priceOverride ?? product.price; // Server authoritative (§8.2)
      const isOutOfStock = availableStock < item.qty;

      if (isOutOfStock) {
        hasStockIssue = true;
      }

      subtotal += unitPrice * item.qty;

      hydratedItems.push({
        productId: product.id,
        variantId: variant ? variant.id : item.variantId,
        qty: item.qty,
        name: product.name,
        slug: product.slug,
        variantLabel: variant ? variant.label : "Standard",
        price: unitPrice,
        mrp: product.mrp,
        image: product.images?.[0] || "",
        availableStock,
        isActive: product.isActive,
        isOutOfStock,
        warranty: product.warranty.enabled
          ? { enabled: true, months: product.warranty.months }
          : null,
      });
    }

    // Server-side authoritative delivery charge calculation (§7.10)
    const discount = 0; // Handled with coupon validation in Phase 4
    const delivery = calculateDeliveryCharge({ subtotal, discount });

    return NextResponse.json({
      data: {
        items: hydratedItems,
        subtotal,
        discount,
        deliveryCharge: delivery.charge,
        isFreeDelivery: delivery.isFree,
        amountNeededForFree: delivery.amountNeededForFree,
        total: subtotal + delivery.charge,
        hasStockIssue,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json(
      {
        error: {
          code: "SERVER_ERROR",
          message,
        },
      },
      { status: 500 }
    );
  }
}
