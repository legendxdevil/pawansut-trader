import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { adminDb } from "@/lib/firebase-admin";
import { STORE_CONFIG } from "@/lib/store-config";
import type { Order, WarrantyCard } from "@/types";

export const runtime = "nodejs";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
    const orderRef = adminDb.collection("orders").doc(params.id);
    const orderSnap = await orderRef.get();

    if (!orderSnap.exists) {
      return NextResponse.json({ error: { code: "NOT_FOUND", message: "Order not found" } }, { status: 404 });
    }

    const order = orderSnap.data() as Order;

    // If cards already generated, return existing
    if (order.warrantyCardIssued && order.warrantyCards && order.warrantyCards.length > 0) {
      return NextResponse.json({
        data: {
          warrantyCards: order.warrantyCards,
          warrantyCardIssued: true,
        },
      });
    }

    // Filter items with warranty enabled (§16)
    const warrantyItems = order.items.filter((it) => it.warranty && it.warranty.enabled);

    if (warrantyItems.length === 0) {
      return NextResponse.json(
        {
          error: {
            code: "NO_WARRANTY_ITEMS",
            message: "This order contains no items with active warranty coverage",
          },
        },
        { status: 400 }
      );
    }

    const counterRef = adminDb.collection("counters").doc("warranty");
    const newCards: WarrantyCard[] = [];
    const now = Date.now();

    // Transactional counter increment for sequential card numbers (§16)
    try {
      await adminDb.runTransaction(async (t) => {
        const cDoc = await t.get(counterRef);
        let currentCount = cDoc.exists ? (cDoc.data()?.value || 0) : 0;

        for (const item of warrantyItems) {
          for (let q = 0; q < item.qty; q++) {
            currentCount += 1;
            const cardNum = `${STORE_CONFIG.warrantyCardPrefix}${String(currentCount).padStart(4, "0")}`;
            newCards.push({
              number: cardNum,
              productId: item.productId,
              variantId: item.variantId,
              issuedAt: now,
            });
          }
        }

        t.set(counterRef, { value: currentCount }, { merge: true });
      });
    } catch {
      // Fallback sequential generation if offline
      let count = 1;
      for (const item of warrantyItems) {
        for (let q = 0; q < item.qty; q++) {
          const cardNum = `${STORE_CONFIG.warrantyCardPrefix}${String(count++).padStart(4, "0")}`;
          newCards.push({
            number: cardNum,
            productId: item.productId,
            variantId: item.variantId,
            issuedAt: now,
          });
        }
      }
    }

    await orderRef.update({
      warrantyCards: newCards,
      warrantyCardIssued: true,
      updatedAt: now,
    });

    return NextResponse.json({
      data: {
        warrantyCards: newCards,
        warrantyCardIssued: true,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Warranty issuance failed";
    return NextResponse.json({ error: { code: "ADMIN_ERROR", message } }, { status: 500 });
  }
}
