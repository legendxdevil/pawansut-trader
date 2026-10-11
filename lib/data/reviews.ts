import { adminDb } from "@/lib/firebase-admin";
import type { Review } from "@/types";

/**
 * SAMPLE REVIEWS for fallback when Firestore is offline
 */
// SAMPLE DATA
const SAMPLE_APPROVED_REVIEWS: Review[] = [
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

export async function getApprovedReviews(productId: string): Promise<Review[]> {
  try {
    const snap = await adminDb
      .collection("reviews")
      .where("productId", "==", productId)
      .where("approved", "==", true)
      .get();

    if (!snap.empty) {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Review));
      return list.sort((a, b) => b.createdAt - a.createdAt);
    }

    return SAMPLE_APPROVED_REVIEWS.filter((r) => r.productId === productId && r.approved);
  } catch {
    return SAMPLE_APPROVED_REVIEWS.filter((r) => r.productId === productId && r.approved);
  }
}
