import { adminDb } from "@/lib/firebase-admin";
import type { Banner } from "@/types";

/**
 * Server data layer for hero banners.
 * Reads active banners from Firestore 'banners' collection.
 */
export async function getActiveBanners(): Promise<Banner[]> {
  try {
    const snap = await adminDb.collection("banners").get();

    if (!snap.empty) {
      const banners = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Banner));
      return banners
        .filter((b) => b.isActive !== false)
        .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
    }
    return [];
  } catch (err) {
    console.error("Error in getActiveBanners:", err);
    return [];
  }
}

export async function getAllBanners(): Promise<Banner[]> {
  try {
    const snap = await adminDb.collection("banners").get();

    if (!snap.empty) {
      const banners = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Banner));
      return banners.sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
    }
    return [];
  } catch (err) {
    console.error("Error in getAllBanners:", err);
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
