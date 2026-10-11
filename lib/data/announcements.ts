import { adminDb } from "@/lib/firebase-admin";
import type { Announcement } from "@/types";
import { SAMPLE_ANNOUNCEMENTS } from "@/scripts/seed-data";

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
    return SAMPLE_ANNOUNCEMENTS.filter((a) => a.isActive);
  } catch {
    return SAMPLE_ANNOUNCEMENTS.filter((a) => a.isActive);
  }
}
