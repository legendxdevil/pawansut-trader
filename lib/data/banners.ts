import { adminDb } from "@/lib/firebase-admin";
import type { Banner } from "@/types";
import { SAMPLE_BANNERS } from "@/scripts/seed-data";

/**
 * Server data layer for hero banners.
 * Reads active banners from Firestore 'banners' collection,
 * falling back to canonical sample dataset if uninitialized or offline.
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
    return SAMPLE_BANNERS.filter((b) => b.isActive);
  } catch {
    return SAMPLE_BANNERS.filter((b) => b.isActive);
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
    return [...SAMPLE_BANNERS];
  } catch {
    return [...SAMPLE_BANNERS];
  }
}

export async function getBannerById(id: string): Promise<Banner | null> {
  try {
    const doc = await adminDb.collection("banners").doc(id).get();
    if (doc.exists) {
      return { id: doc.id, ...doc.data() } as Banner;
    }
    return SAMPLE_BANNERS.find((b) => b.id === id) || null;
  } catch {
    return SAMPLE_BANNERS.find((b) => b.id === id) || null;
  }
}
