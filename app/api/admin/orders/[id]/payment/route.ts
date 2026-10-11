import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/require-admin";
import { adminDb } from "@/lib/firebase-admin";
import type { Order } from "@/types";

export const runtime = "nodejs";

const paymentUpdateSchema = z.object({
  status: z.enum(["pending", "paid", "failed", "refunded"]),
});

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
    const body = await req.json();
    const parsed = paymentUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "INVALID_INPUT", message: "Invalid payment status payload" } },
        { status: 400 }
      );
    }

    const { status } = parsed.data;
    const orderRef = adminDb.collection("orders").doc(params.id);
    const orderSnap = await orderRef.get();

    if (!orderSnap.exists) {
      return NextResponse.json({ error: { code: "NOT_FOUND", message: "Order not found" } }, { status: 404 });
    }

    const order = orderSnap.data() as Order;
    const now = Date.now();

    const updatedPayment = {
      ...order.payment,
      status,
      paidAt: status === "paid" ? now : order.payment.paidAt,
    };

    await orderRef.update({
      payment: updatedPayment,
      updatedAt: now,
    });

    return NextResponse.json({
      data: {
        ...order,
        payment: updatedPayment,
        updatedAt: now,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Payment update failed";
    return NextResponse.json({ error: { code: "ADMIN_ERROR", message } }, { status: 500 });
  }
}
