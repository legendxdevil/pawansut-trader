import { NextResponse } from "next/server";
import { z } from "zod";
import { adminDb } from "@/lib/firebase-admin";
import type { Order } from "@/types";

export const runtime = "nodejs";

const trackOrderSchema = z.object({
  orderId: z.string().min(3, "Enter a valid Order ID"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = trackOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_INPUT",
            message: "Please enter both your Order ID and 10-digit mobile number",
            fields: parsed.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const { orderId, phone } = parsed.data;
    const cleanOrderId = orderId.trim().toUpperCase();
    const cleanPhone = phone.trim();

    // Query Firestore orders by orderId
    const snap = await adminDb
      .collection("orders")
      .where("orderId", "==", cleanOrderId)
      .limit(1)
      .get();

    if (snap.empty) {
      return NextResponse.json(
        {
          error: {
            code: "ORDER_NOT_FOUND",
            message: "No order found matching this Order ID and mobile number combination",
          },
        },
        { status: 404 }
      );
    }

    const orderDoc = snap.docs[0];
    const order = orderDoc.data() as Order;

    // Strict validation: phone number must match (§7.9)
    if (order.customer.phone !== cleanPhone) {
      return NextResponse.json(
        {
          error: {
            code: "ORDER_NOT_FOUND",
            message: "No order found matching this Order ID and mobile number combination",
          },
        },
        { status: 404 }
      );
    }

    // Return limited order tracking view
    return NextResponse.json({
      data: {
        orderId: order.orderId,
        status: order.status,
        statusHistory: order.statusHistory || [],
        items: order.items.map((it) => ({
          name: it.name,
          variantLabel: it.variantLabel,
          qty: it.qty,
          price: it.price,
          warranty: it.warranty,
        })),
        subtotal: order.subtotal,
        discount: order.discount,
        deliveryCharge: order.deliveryCharge,
        total: order.total,
        payment: {
          method: order.payment.method,
          status: order.payment.status,
        },
        warrantyCardIssued: order.warrantyCardIssued || false,
        warrantyCards: order.warrantyCards || [],
        createdAt: order.createdAt,
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
