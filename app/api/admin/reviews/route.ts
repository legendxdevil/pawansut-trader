import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { adminDb } from "@/lib/firebase-admin";
import type { Review } from "@/types";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireAdmin();

    const snap = await adminDb.collection("reviews").orderBy("createdAt", "desc").get();
    let reviews: Review[] = [];

    if (!snap.empty) {
      reviews = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Review));
    } else {
      // Sample reviews fallback
      reviews = [
        {
          id: "rev-sample-1",
          productId: "prod-cable-braided-c",
          orderId: "PT-000001",
          name: "Aman Sharma",
          rating: 5,
          text: "Very strong build quality. Charges my OnePlus at full Dash/SuperVOOC speeds without heating up. Delivered on time at Raja Harish Chandra Hospital.",
          approved: true,
          createdAt: Date.now() - 86400000 * 5,
        },
        {
          id: "rev-sample-2",
          productId: "prod-charger-65w-gan",
          orderId: "PT-000002",
          name: "Dr. Vikas Verma",
          rating: 5,
          text: "Excellent GaN charger. Ultra compact and charges my laptop and iPhone simultaneously. The physical warranty card gave me total peace of mind.",
          approved: true,
          createdAt: Date.now() - 86400000 * 3,
        },
      ];
    }

    return NextResponse.json({ success: true, data: reviews });
  } catch (error) {
    const err = error as Error;
    const isUnauthorized = err.message?.includes("UNAUTHORIZED");
    return NextResponse.json(
      { error: { code: isUnauthorized ? "UNAUTHORIZED" : "INTERNAL_ERROR", message: err.message } },
      { status: isUnauthorized ? 401 : 500 }
    );
  }
}
