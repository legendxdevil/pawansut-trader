import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { adminDb } from "@/lib/firebase-admin";
import type { Order } from "@/types";
import { ORDER_STATUS_LABELS } from "@/lib/order-status";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireAdmin();

    let orders: Order[] = [];

    try {
      const snap = await adminDb.collection("orders").orderBy("createdAt", "desc").get();
      if (!snap.empty) {
        orders = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Order));
      }
    } catch {
      // In offline/demo mode, use simulated dataset
    }

    if (orders.length === 0) {
      // Canonical sample orders for demonstration
      // SAMPLE DATA
      const now = Date.now();
      const dayMs = 86400000;
      orders = [
        {
          id: "ord-1",
          orderId: "PT-000001",
          customer: { name: "Aman Sharma", phone: "8505856763", address: "Satyawadi Raja Harish Chandra Hospital", city: "Delhi", pincode: "110040" },
          items: [
            { productId: "prod-cable-braided-c", variantId: "black-1m", name: "Braided USB-C Cable", variantLabel: "1 Meter - Black", price: 299, qty: 2, image: "", warranty: { enabled: true, months: 6 } },
            { productId: "prod-case-impact-frost", variantId: "smoke-15pro", name: "Frost Impact Matte Case", variantLabel: "Smoke Black", price: 499, qty: 1, image: "", warranty: null },
          ],
          subtotal: 1097,
          discount: 100,
          deliveryCharge: 0,
          total: 997,
          payment: { method: "cod", status: "paid" },
          status: "delivered",
          statusHistory: [],
          warrantyCards: [],
          warrantyCardIssued: true,
          createdAt: now - dayMs * 6,
          updatedAt: now - dayMs * 5,
        },
        {
          id: "ord-2",
          orderId: "PT-000002",
          customer: { name: "Dr. Vikas Verma", phone: "9811223344", address: "Doctors Hostel, SRHC Hospital", city: "Delhi", pincode: "110040" },
          items: [
            { productId: "prod-charger-65w-gan", variantId: "dual-white", name: "65W GaN Dual Port Fast Charger", variantLabel: "White", price: 1499, qty: 1, image: "", warranty: { enabled: true, months: 12 } },
          ],
          subtotal: 1499,
          discount: 0,
          deliveryCharge: 0,
          total: 1499,
          payment: { method: "cod", status: "paid" },
          status: "delivered",
          statusHistory: [],
          warrantyCards: [],
          warrantyCardIssued: true,
          createdAt: now - dayMs * 5,
          updatedAt: now - dayMs * 4,
        },
        {
          id: "ord-3",
          orderId: "PT-000003",
          customer: { name: "Pooja Gupta", phone: "9873445566", address: "OPD Counter 4, SRHC Hospital", city: "Delhi", pincode: "110040" },
          items: [
            { productId: "prod-earphones-pro-anc", variantId: "graphite", name: "Pawansut Pro Wireless Earphones", variantLabel: "Graphite", price: 1999, qty: 1, image: "", warranty: { enabled: true, months: 12 } },
          ],
          subtotal: 1999,
          discount: 199,
          deliveryCharge: 0,
          total: 1800,
          payment: { method: "cod", status: "paid" },
          status: "delivered",
          statusHistory: [],
          warrantyCards: [],
          warrantyCardIssued: true,
          createdAt: now - dayMs * 4,
          updatedAt: now - dayMs * 3,
        },
        {
          id: "ord-4",
          orderId: "PT-000004",
          customer: { name: "Sunil Rawat", phone: "9910002233", address: "Emergency Ward, SRHC Hospital", city: "Delhi", pincode: "110040" },
          items: [
            { productId: "prod-powerbank-20000", variantId: "black", name: "20000mAh Ultra Slim Power Bank", variantLabel: "Black", price: 1299, qty: 1, image: "", warranty: { enabled: true, months: 6 } },
            { productId: "prod-cable-braided-c", variantId: "black-1m", name: "Braided USB-C Cable", variantLabel: "1 Meter - Black", price: 299, qty: 1, image: "", warranty: { enabled: true, months: 6 } },
          ],
          subtotal: 1598,
          discount: 0,
          deliveryCharge: 0,
          total: 1598,
          payment: { method: "cod", status: "pending" },
          status: "dispatched",
          statusHistory: [],
          warrantyCards: [],
          warrantyCardIssued: false,
          createdAt: now - dayMs * 2,
          updatedAt: now - dayMs * 1,
        },
        {
          id: "ord-5",
          orderId: "PT-000005",
          customer: { name: "Neha Mishra", phone: "9818889900", address: "Staff Quarter B-12, SRHC Hospital", city: "Delhi", pincode: "110040" },
          items: [
            { productId: "prod-glass-9h-shield", variantId: "single-15", name: "9H Edge-to-Edge Tempered Glass", variantLabel: "Single Pack", price: 249, qty: 1, image: "", warranty: null },
          ],
          subtotal: 249,
          discount: 0,
          deliveryCharge: 80,
          total: 329,
          payment: { method: "cod", status: "pending" },
          status: "confirmed",
          statusHistory: [],
          warrantyCards: [],
          warrantyCardIssued: false,
          createdAt: now - dayMs * 1,
          updatedAt: now,
        },
        {
          id: "ord-6",
          orderId: "PT-000006",
          customer: { name: "Ramesh Kumar", phone: "9711223344", address: "Gate 1 Security, SRHC Hospital", city: "Delhi", pincode: "110040" },
          items: [
            { productId: "prod-stand-aluminum-desk", variantId: "silver", name: "Foldable Aluminum Phone Stand", variantLabel: "Silver", price: 399, qty: 1, image: "", warranty: null },
          ],
          subtotal: 399,
          discount: 0,
          deliveryCharge: 80,
          total: 479,
          payment: { method: "cod", status: "pending" },
          status: "placed",
          statusHistory: [],
          warrantyCards: [],
          warrantyCardIssued: false,
          createdAt: now,
          updatedAt: now,
        },
      ];
    }

    // Compute metrics
    const nonCancelled = orders.filter((o) => o.status !== "cancelled");
    const totalRevenue = nonCancelled.reduce((sum, o) => sum + (o.total || 0), 0);
    const totalOrders = orders.length;
    const deliveredCount = orders.filter((o) => o.status === "delivered").length;
    const avgOrderValue = nonCancelled.length > 0 ? Math.round(totalRevenue / nonCancelled.length) : 0;

    // 1. Revenue by Day
    const dayMap = new Map<string, { revenue: number; orders: number }>();
    nonCancelled.forEach((o) => {
      const dateKey = new Date(o.createdAt).toISOString().split("T")[0];
      const current = dayMap.get(dateKey) || { revenue: 0, orders: 0 };
      current.revenue += o.total || 0;
      current.orders += 1;
      dayMap.set(dateKey, current);
    });

    const revenueByDay = Array.from(dayMap.entries())
      .map(([date, data]) => ({ date, revenue: data.revenue, orders: data.orders }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // 2. Orders by Status
    const statusCounts: Record<string, number> = {};
    orders.forEach((o) => {
      statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
    });

    const ordersByStatus = Object.entries(statusCounts).map(([status, count]) => ({
      status,
      label: ORDER_STATUS_LABELS[status as keyof typeof ORDER_STATUS_LABELS] || status,
      count,
    }));

    // 3. Top Products by Revenue and Units
    const productAgg = new Map<string, { name: string; unitsSold: number; revenue: number }>();
    nonCancelled.forEach((o) => {
      o.items?.forEach((item) => {
        const current = productAgg.get(item.productId) || { name: item.name, unitsSold: 0, revenue: 0 };
        current.unitsSold += item.qty || 1;
        current.revenue += (item.price * (item.qty || 1));
        productAgg.set(item.productId, current);
      });
    });

    const topProducts = Array.from(productAgg.entries())
      .map(([productId, data]) => ({
        productId,
        name: data.name,
        unitsSold: data.unitsSold,
        revenue: data.revenue,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalRevenue,
          totalOrders,
          avgOrderValue,
          deliveredCount,
        },
        revenueByDay,
        ordersByStatus,
        topProducts,
      },
    });
  } catch (error) {
    const err = error as Error;
    const isUnauthorized = err.message?.includes("UNAUTHORIZED");
    return NextResponse.json(
      { error: { code: isUnauthorized ? "UNAUTHORIZED" : "INTERNAL_ERROR", message: err.message } },
      { status: isUnauthorized ? 401 : 500 }
    );
  }
}
