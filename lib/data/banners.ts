import { adminDb } from "@/lib/firebase-admin";
import type { Banner } from "@/types";

/**
 * Server data layer for hero banners.
 * Reads active banners from Firestore 'banners' collection.
 */
export async function getActiveBanners(): Promise<Banner[]> {
  try {
    const snap = await adminDb
      .collection("banners")
      .where("isActive", "==", true)
      .orderBy("order", "asc")
      .get();

    if (!snap.empty) {
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Banner));
    }
    return [];
  } catch {
    return [];
  }
}

export async function getAllBanners(): Promise<Banner[]> {
  try {
    const snap = await adminDb
      .collection("banners")
      .orderBy("order", "asc")
      .get();

    if (!snap.empty) {
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Banner));
    }
    return [];
  } catch {
    return [];
  }
}

export async function getBannerById(id: string): Promise<Banner | null> {
  try {
    const doc = await adminDb.collection("banners").doc(id).get();
    if (doc.exists) {
      return { id: doc.id, ...doc.data() } as Banner;
    }
    return null;
  } catch {
    return null;
  }
}
