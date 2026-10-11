import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { adminDb } from "@/lib/firebase-admin";
import type { Order } from "@/types";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    await requireAdmin();
    const url = new URL(req.url);
    const status = url.searchParams.get("status");
    const search = url.searchParams.get("search")?.toLowerCase().trim();

    let query: FirebaseFirestore.Query = adminDb.collection("orders");

    if (status && status !== "all") {
      query = query.where("status", "==", status);
    }

    const snap = await query.get();
    let orders: Order[] = [];

    if (!snap.empty) {
      orders = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Order));
      // Sort in memory by createdAt descending
      orders.sort((a, b) => b.createdAt - a.createdAt);
    }

    if (search) {
      orders = orders.filter(
        (o) =>
          o.orderId.toLowerCase().includes(search) ||
          o.customer.phone.includes(search) ||
          o.customer.name.toLowerCase().includes(search)
      );
    }

    return NextResponse.json({ data: orders });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch orders";
    return NextResponse.json({ error: { code: "ADMIN_ERROR", message } }, { status: 401 });
  }
}
