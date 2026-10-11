import { adminDb } from "@/lib/firebase-admin";
import type { Announcement } from "@/types";

export async function getActiveAnnouncements(): Promise<Announcement[]> {
  try {
    const snap = await adminDb
      .collection("announcements")
      .where("isActive", "==", true)
      .orderBy("order", "asc")
      .get();

    if (!snap.empty) {
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Announcement));
    }
    return [];
  } catch {
    return [];
  }
}
