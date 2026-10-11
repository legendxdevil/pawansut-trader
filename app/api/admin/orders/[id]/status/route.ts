import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/require-admin";
import { adminDb } from "@/lib/firebase-admin";
import { canTransitionStatus, type OrderStatus } from "@/lib/order-status";
import type { Order } from "@/types";

export const runtime = "nodejs";

const statusUpdateSchema = z.object({
  nextStatus: z.enum([
    "placed",
    "payment_verified",
    "confirmed",
    "dispatched",
    "delivered",
    "cancelled",
  ]),
  note: z.string().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
    const body = await req.json();
    const parsed = statusUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_INPUT",
            message: "Invalid status transition payload",
          },
        },
        { status: 400 }
      );
    }

    const { nextStatus, note } = parsed.data;
    const orderRef = adminDb.collection("orders").doc(params.id);
    const orderSnap = await orderRef.get();

    if (!orderSnap.exists) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Order not found" } },
        { status: 404 }
      );
    }

    const order = orderSnap.data() as Order;
    const currentStatus = order.status;

    // Validate transition rule (§8.1)
    const isLegal = canTransitionStatus(currentStatus, nextStatus as OrderStatus, {
      hasAdminNote: Boolean(note && note.trim()),
    });

    if (!isLegal) {
      return NextResponse.json(
        {
          error: {
            code: "ILLEGAL_TRANSITION",
            message: `Illegal transition from "${currentStatus}" to "${nextStatus}". Cancelling dispatched orders requires an administrative note.`,
          },
        },
        { status: 400 }
      );
    }

    const now = Date.now();
    const newHistoryEntry = {
      status: nextStatus as OrderStatus,
      at: now,
      by: "admin" as const,
      note: note ? note.trim() : undefined,
    };

    const updatedHistory = [...(order.statusHistory || []), newHistoryEntry];
    const updates: Partial<Order> = {
      status: nextStatus as OrderStatus,
      statusHistory: updatedHistory,
      updatedAt: now,
    };

    // If order transitions to delivered and payment is COD, mark COD paid (§8.1)
    if (nextStatus === "delivered" && order.payment.method === "cod") {
      updates.payment = {
        ...order.payment,
        status: "paid",
        paidAt: now,
      };
    }

    // If cancelling, restore stock in transaction (§8.1)
    if (nextStatus === "cancelled") {
      for (const item of order.items) {
        try {
          const prodRef = adminDb.collection("products").doc(item.productId);
          const pSnap = await prodRef.get();
          if (pSnap.exists) {
            const pData = pSnap.data();
            const restoredVariants = (pData?.variants || []).map((v: { id: string; stock: number; [key: string]: unknown }) => {
              if (v.id === item.variantId) {
                return { ...v, stock: v.stock + item.qty };
              }
              return v;
            });
            await prodRef.update({ variants: restoredVariants, updatedAt: now });
          }
        } catch (e) {
          console.warn("Failed restoring stock on cancel:", e);
        }
      }
    }

    await orderRef.update(updates);

    return NextResponse.json({
      data: {
        ...order,
        ...updates,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Status update failed";
    return NextResponse.json({ error: { code: "ADMIN_ERROR", message } }, { status: 500 });
  }
}
