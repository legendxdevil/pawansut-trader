import { adminDb } from "@/lib/firebase-admin";
import type { Review } from "@/types";

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

    return [];
  } catch {
    return [];
  }
}
