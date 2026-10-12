import { NextResponse } from "next/server";
import { couponValidateSchema } from "@/lib/validation/coupon";
import { adminDb } from "@/lib/firebase-admin";
import type { Coupon } from "@/types";
import { SAMPLE_COUPON } from "@/scripts/seed-data";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = couponValidateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_INPUT",
            message: "Invalid coupon payload",
            fields: parsed.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const { code, subtotal } = parsed.data;
    const normalizedCode = code.toUpperCase().trim();

    let coupon: Coupon | null = null;

    try {
      const doc = await adminDb.collection("coupons").doc(normalizedCode).get();
      if (doc.exists) {
        coupon = doc.data() as Coupon;
      }
    } catch {
      // Not found or error
    }

    if (!coupon && normalizedCode === SAMPLE_COUPON.code) {
      coupon = SAMPLE_COUPON;
    }

    if (!coupon) {
      return NextResponse.json(
        {
          error: {
            code: "COUPON_NOT_FOUND",
            message: "Coupon code does not exist",
          },
        },
        { status: 404 }
      );
    }

    // Spec §12.4 rules:
    if (!coupon.isActive) {
      return NextResponse.json(
        {
          error: {
            code: "COUPON_INACTIVE",
            message: "This coupon is currently inactive",
          },
        },
        { status: 400 }
      );
    }

    const now = Date.now();
    if (coupon.startsAt && now < coupon.startsAt) {
      return NextResponse.json(
        {
          error: {
            code: "COUPON_NOT_STARTED",
            message: "This coupon promotion has not started yet",
          },
        },
        { status: 400 }
      );
    }

    if (coupon.expiresAt && now > coupon.expiresAt) {
      return NextResponse.json(
        {
          error: {
            code: "COUPON_EXPIRED",
            message: "This coupon has expired",
          },
        },
        { status: 400 }
      );
    }

    if (subtotal < coupon.minOrder) {
      return NextResponse.json(
        {
          error: {
            code: "MIN_ORDER_NOT_MET",
            message: `Minimum order amount of ₹${coupon.minOrder} required for this coupon`,
          },
        },
        { status: 400 }
      );
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json(
        {
          error: {
            code: "USAGE_LIMIT_EXCEEDED",
            message: "Coupon usage limit has been reached",
          },
        },
        { status: 400 }
      );
    }

    // Compute discount
    let discount = 0;
    if (coupon.type === "percent") {
      discount = Math.round((subtotal * coupon.value) / 100);
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else {
      discount = coupon.value;
    }

    // Flat discount never exceeds subtotal
    discount = Math.min(discount, subtotal);

    return NextResponse.json({
      data: {
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        discount,
        newSubtotal: subtotal - discount,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
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
