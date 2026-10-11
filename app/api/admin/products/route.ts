import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/require-admin";
import { adminDb } from "@/lib/firebase-admin";
import type { Product } from "@/types";

export const runtime = "nodejs";

const productSchema = z.object({
  name: z.string().min(2, "Product name is required"),
  slug: z.string().min(2, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  description: z.string().min(5, "Description is required"),
  shortDescription: z.string().optional(),
  images: z.array(z.string()).default([]),
  category: z.string().min(1, "Category is required"),
  tags: z.array(z.string()).default([]),
  price: z.number().positive("Price must be greater than zero"),
  mrp: z.number().positive("MRP must be greater than zero"),
  specs: z.array(z.object({ label: z.string(), value: z.string() })).default([]),
  variants: z
    .array(
      z.object({
        id: z.string(),
        label: z.string(),
        size: z.string().optional(),
        color: z.string().optional(),
        stock: z.number().int().min(0, "Stock cannot be negative"),
        priceOverride: z.number().positive().optional(),
      })
    )
    .min(1, "At least one variant required"),
  warranty: z.object({
    enabled: z.boolean(),
    months: z.number().int().min(0),
    note: z.string().optional(),
  }),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  isNew: z.boolean().default(false),
});

export async function GET() {
  try {
    await requireAdmin();
    const snap = await adminDb.collection("products").orderBy("createdAt", "desc").get();
    let products: Product[] = [];

    if (!snap.empty) {
      products = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Product));
    }

    return NextResponse.json({ data: products });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load products";
    return NextResponse.json({ error: { code: "ADMIN_ERROR", message } }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const parsed = productSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid product data",
            fields: parsed.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Check slug uniqueness
    const slugSnap = await adminDb
      .collection("products")
      .where("slug", "==", data.slug)
      .limit(1)
      .get();

    if (!slugSnap.empty) {
      return NextResponse.json(
        { error: { code: "SLUG_EXISTS", message: "A product with this slug already exists" } },
        { status: 400 }
      );
    }

    const now = Date.now();
    const docRef = adminDb.collection("products").doc();
    const newProduct: Product = {
      id: docRef.id,
      ...data,
      ratingAvg: 5.0,
      ratingCount: 0,
      createdAt: now,
      updatedAt: now,
    };

    await docRef.set(newProduct);

    // Revalidate public pages per spec §11 & §19
    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath(`/category/${data.category}`);
    revalidatePath(`/products/${data.slug}`);

    return NextResponse.json({ data: newProduct }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create product";
    return NextResponse.json({ error: { code: "ADMIN_ERROR", message } }, { status: 500 });
  }
}
