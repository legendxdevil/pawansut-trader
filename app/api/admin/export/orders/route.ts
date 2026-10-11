import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { adminDb } from "@/lib/firebase-admin";
import type { Order } from "@/types";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireAdmin();
    const snap = await adminDb.collection("orders").orderBy("createdAt", "desc").get();
    let orders: Order[] = [];

    if (!snap.empty) {
      orders = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Order));
    }

    // Escape CSV cell text
    const esc = (text: string | number | undefined) => {
      if (text === undefined || text === null) return '""';
      const str = String(text).replace(/"/g, '""');
      return `"${str}"`;
    };

    const headers = [
      "Order ID",
      "Customer Name",
      "Phone",
      "Address",
      "City",
      "Pincode",
      "Items Count",
      "Items Description",
      "Subtotal",
      "Discount",
      "Delivery Fee",
      "Grand Total",
      "Payment Mode",
      "Payment Status",
      "Order Status",
      "Warranty Cards Issued",
      "Created Date",
    ];

    const rows = orders.map((o) => {
      const itemsDesc = o.items
        .map((it) => `${it.name} (${it.variantLabel}) x${it.qty}`)
        .join("; ");

      return [
        esc(o.orderId),
        esc(o.customer.name),
        esc(o.customer.phone),
        esc(o.customer.address),
        esc(o.customer.city),
        esc(o.customer.pincode),
        esc(o.items.length),
        esc(itemsDesc),
        esc(o.subtotal),
        esc(o.discount),
        esc(o.deliveryCharge),
        esc(o.total),
        esc(o.payment.method),
        esc(o.payment.status),
        esc(o.status),
        esc(o.warrantyCardIssued ? "Yes" : "No"),
        esc(new Date(o.createdAt).toISOString()),
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    const dateStr = new Date().toISOString().split("T")[0];

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="pawansut-orders-${dateStr}.csv"`,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Export failed";
    return NextResponse.json({ error: { code: "ADMIN_ERROR", message } }, { status: 401 });
  }
}
