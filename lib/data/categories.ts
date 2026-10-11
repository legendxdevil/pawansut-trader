import { adminDb } from "@/lib/firebase-admin";
import type { Category } from "@/types";
import { SAMPLE_CATEGORIES } from "@/scripts/seed-data";

export async function getCategories(): Promise<Category[]> {
  try {
    const snap = await adminDb.collection("categories").orderBy("order", "asc").get();
    if (!snap.empty) {
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Category));
    }
    return SAMPLE_CATEGORIES;
  } catch {
    return SAMPLE_CATEGORIES;
  }
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const categories = await getCategories();
  return categories.find((c) => c.slug === slug) || null;
}
