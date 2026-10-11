import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/require-admin";
import { adminDb } from "@/lib/firebase-admin";
import { SAMPLE_COUPON } from "@/scripts/seed-data";
import type { Coupon } from "@/types";

export const runtime = "nodejs";

const couponCreateSchema = z.object({
  code: z
    .string()
    .min(3)
    .max(20)
    .regex(/^[A-Z0-9]{3,20}$/i, "Code must be 3-20 uppercase alphanumeric characters"),
  type: z.enum(["percent", "flat"]),
  value: z.number().positive(),
  minOrder: z.number().int().min(0).default(0),
  maxDiscount: z.number().positive().optional(),
  usageLimit: z.number().int().positive().optional(),
  isActive: z.boolean().default(true),
});

export async function GET() {
  try {
    await requireAdmin();
    const snap = await adminDb.collection("coupons").get();
    let list: Coupon[] = [];

    if (!snap.empty) {
      list = snap.docs.map((d) => ({ code: d.id, ...d.data() } as Coupon));
    } else {
      list = [SAMPLE_COUPON];
    }

    return NextResponse.json({ data: list });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error fetching coupons";
    return NextResponse.json({ error: { code: "ADMIN_ERROR", message } }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const parsed = couponCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid coupon payload", fields: parsed.error.flatten().fieldErrors } },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const codeUpper = data.code.toUpperCase().trim();

    const newCoupon: Coupon = {
      code: codeUpper,
      type: data.type,
      value: data.value,
      minOrder: data.minOrder,
      maxDiscount: data.maxDiscount,
      usageLimit: data.usageLimit,
      usedCount: 0,
      isActive: data.isActive,
    };

    await adminDb.collection("coupons").doc(codeUpper).set(newCoupon);

    return NextResponse.json({ data: newCoupon }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create coupon";
    return NextResponse.json({ error: { code: "ADMIN_ERROR", message } }, { status: 500 });
  }
}
