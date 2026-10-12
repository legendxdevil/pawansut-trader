import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/require-admin";
import { adminDb } from "@/lib/firebase-admin";
import type { Product } from "@/types";

export const runtime = "nodejs";

function slugify(text: string): string {
  return (text || "")
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s_+]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  slug: z.string().default("").transform((s) => slugify(s)),
  description: z.string().default("").transform((d) => d.trim()),
  shortDescription: z.string().optional().default(""),
  images: z.array(z.string()).default([]),
  category: z.string().default("chargers-adapters"),
  tags: z.array(z.string()).default([]),
  price: z.coerce.number().min(0, "Price must be at least 0"),
  mrp: z.coerce.number().min(0).optional(),
  specs: z
    .array(
      z.object({
        label: z.string().default(""),
        value: z.string().default(""),
      })
    )
    .default([]),
  variants: z
    .array(
      z.object({
        id: z.string().default(() => `var-${Date.now()}`),
        label: z.string().default("Standard"),
        size: z.string().optional(),
        color: z.string().optional(),
        stock: z.coerce.number().int().min(0).default(0),
        priceOverride: z.coerce.number().positive().optional().nullable(),
      })
    )
    .default([{ id: "var-1", label: "Standard", stock: 10 }]),
  warranty: z
    .object({
      enabled: z.boolean().default(false),
      months: z.coerce.number().int().min(0).default(0),
      note: z.string().optional().nullable(),
    })
    .default({ enabled: false, months: 0 }),
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

    // 1. Sanitize variants
    if (Array.isArray(body.variants) && body.variants.length > 0) {
      body.variants = body.variants.map((v: unknown, idx: number) => {
        const item = typeof v === "object" && v !== null ? (v as Record<string, unknown>) : {};
        const pOverride = item.priceOverride ? Number(item.priceOverride) : undefined;
        return {
          id: String(item.id || `var-${idx + 1}-${Date.now().toString(36)}`),
          label: String(item.label || "").trim() || `Option ${idx + 1}`,
          size: item.size ? String(item.size) : undefined,
          color: item.color ? String(item.color) : undefined,
          stock: Math.max(0, Number(item.stock) || 0),
          priceOverride: pOverride && pOverride > 0 ? pOverride : undefined,
        };
      });
    } else {
      body.variants = [{ id: "var-1", label: "Standard", stock: 10 }];
    }

    // 2. Sanitize specs
    if (Array.isArray(body.specs)) {
      body.specs = body.specs
        .filter((s: unknown) => {
          const item = typeof s === "object" && s !== null ? (s as Record<string, unknown>) : {};
          return String(item.label || "").trim() && String(item.value || "").trim();
        })
        .map((s: unknown) => {
          const item = s as Record<string, unknown>;
          return { label: String(item.label).trim(), value: String(item.value).trim() };
        });
    } else {
      body.specs = [];
    }

    // 3. Price & MRP calculation
    const price = Math.max(0, Number(body.price) || 0);
    const mrp = Math.max(price, Number(body.mrp) || price);
    body.price = price;
    body.mrp = mrp;

    // 4. Description fallback
    const rawDesc = String(body.description || "").trim();
    const rawShort = String(body.shortDescription || "").trim();
    const rawName = String(body.name || "").trim();
    body.description = rawDesc || rawShort || rawName || "Genuine product from Pawansut Trader.";

    // 5. Slug fallback
    let derivedSlug = slugify(String(body.slug || ""));
    if (!derivedSlug || derivedSlug.length < 2) {
      derivedSlug = slugify(rawName) || `product-${Date.now().toString(36).slice(-4)}`;
    }
    body.slug = derivedSlug;

    const parsed = productSchema.safeParse(body);

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      const details = Object.entries(fieldErrors)
        .map(([field, errs]) => `${field}: ${errs?.join(", ")}`)
        .join("; ");
      console.error("[POST /api/admin/products] Validation error:", details);
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: `Validation error: ${details || "Invalid product data"}`,
            fields: fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // 6. Check slug uniqueness & auto-uniquify if needed
    let finalSlug = data.slug || derivedSlug;
    const slugSnap = await adminDb
      .collection("products")
      .where("slug", "==", finalSlug)
      .limit(1)
      .get();

    if (!slugSnap.empty) {
      finalSlug = `${finalSlug}-${Date.now().toString(36).slice(-4)}`;
    }

    const now = Date.now();
    const docRef = adminDb.collection("products").doc();
    const newProduct: Product = {
      id: docRef.id,
      name: data.name,
      slug: finalSlug,
      description: data.description,
      ...(data.shortDescription ? { shortDescription: data.shortDescription } : {}),
      images: Array.isArray(data.images) ? data.images : [],
      category: data.category || "chargers-adapters",
      tags: Array.isArray(data.tags) ? data.tags : [],
      price: data.price,
      mrp: data.mrp || data.price,
      specs: data.specs,
      variants: data.variants.map((v) => ({
        id: v.id,
        label: v.label,
        stock: v.stock,
        ...(v.size ? { size: v.size } : {}),
        ...(v.color ? { color: v.color } : {}),
        ...(v.priceOverride ? { priceOverride: v.priceOverride } : {}),
      })),
      warranty: {
        enabled: Boolean(data.warranty?.enabled),
        months: Number(data.warranty?.months) || 0,
        ...(data.warranty?.note ? { note: data.warranty.note } : {}),
      },
      isActive: data.isActive ?? true,
      isFeatured: data.isFeatured ?? false,
      isNew: data.isNew ?? false,
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
    revalidatePath(`/products/${finalSlug}`);

    return NextResponse.json({ data: newProduct }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create product";
    console.error("[POST /api/admin/products] Error:", message);
    return NextResponse.json({ error: { code: "ADMIN_ERROR", message } }, { status: 500 });
  }
}

