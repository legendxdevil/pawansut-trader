import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/require-admin";
import { adminDb } from "@/lib/firebase-admin";
import { SAMPLE_CATEGORIES } from "@/scripts/seed-data";
import type { Category } from "@/types";

export const runtime = "nodejs";

const categorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Category name is required"),
  slug: z.string().min(2, "Category slug is required").regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  order: z.number().int().default(1),
  image: z.string().optional(),
});

export async function GET() {
  try {
    await requireAdmin();
    const snap = await adminDb.collection("categories").orderBy("order", "asc").get();
    let categories: Category[] = [];

    if (!snap.empty) {
      categories = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Category));
    } else {
      categories = [...SAMPLE_CATEGORIES];
    }

    return NextResponse.json({ data: categories });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error fetching categories";
    return NextResponse.json({ error: { code: "ADMIN_ERROR", message } }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const parsed = categorySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid category payload", fields: parsed.error.flatten().fieldErrors } },
        { status: 400 }
      );
    }

    const { id, name, slug, order, image } = parsed.data;
    const catId = id || `cat-${slug}`;

    const catData: Category = {
      id: catId,
      name,
      slug,
      order,
      image,
    };

    await adminDb.collection("categories").doc(catId).set(catData, { merge: true });

    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath(`/category/${slug}`);

    return NextResponse.json({ data: catData });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to save category";
    return NextResponse.json({ error: { code: "ADMIN_ERROR", message } }, { status: 500 });
  }
}
