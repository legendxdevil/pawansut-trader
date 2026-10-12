import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";
import { adminDb } from "@/lib/firebase-admin";
import type { Product } from "@/types";

export const runtime = "nodejs";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
    const doc = await adminDb.collection("products").doc(params.id).get();
    if (!doc.exists) {
      return NextResponse.json({ error: { code: "NOT_FOUND", message: "Product not found" } }, { status: 404 });
    }
    return NextResponse.json({ data: { id: doc.id, ...doc.data() } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error fetching product";
    return NextResponse.json({ error: { code: "ADMIN_ERROR", message } }, { status: 401 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
    const updates = await req.json();
    const docRef = adminDb.collection("products").doc(params.id);
    const existing = await docRef.get();

    if (!existing.exists) {
      return NextResponse.json({ error: { code: "NOT_FOUND", message: "Product not found" } }, { status: 404 });
    }

    const currentData = existing.data() as Product;
    const now = Date.now();

    // Sanitize slug if provided
    if (updates.slug) {
      updates.slug = String(updates.slug)
        .toLowerCase()
        .trim()
        .replace(/[\s_+]+/g, "-")
        .replace(/[^a-z0-9-]/g, "")
        .replace(/-+/g, "-")
        .replace(/^-+|-+$/g, "");
    }

    // Sanitize prices
    if (updates.price !== undefined) {
      updates.price = Math.max(0, Number(updates.price) || 0);
    }
    if (updates.mrp !== undefined) {
      const basePrice = updates.price !== undefined ? updates.price : currentData.price;
      updates.mrp = Math.max(basePrice, Number(updates.mrp) || basePrice);
    }

    // Sanitize variants
    if (Array.isArray(updates.variants)) {
      updates.variants = updates.variants.map((v: unknown, idx: number) => {
        const item = typeof v === "object" && v !== null ? (v as Record<string, unknown>) : {};
        const pOverride = item.priceOverride ? Number(item.priceOverride) : undefined;
        return {
          id: String(item.id || `var-${idx + 1}-${Date.now().toString(36)}`),
          label: String(item.label || "").trim() || `Option ${idx + 1}`,
          size: item.size ? String(item.size) : undefined,
          color: item.color ? String(item.color) : undefined,
          stock: Math.max(0, Number(item.stock) || 0),
          ...(pOverride && pOverride > 0 ? { priceOverride: pOverride } : {}),
        };
      });
    }

    const updatedPayload = {
      ...updates,
      updatedAt: now,
    };

    await docRef.update(updatedPayload);

    // Revalidate affected paths per spec §11 & §19
    revalidatePath("/");
    revalidatePath("/products");
    const targetCategory = updates.category || currentData.category;
    if (targetCategory) revalidatePath(`/category/${targetCategory}`);
    if (currentData.slug) revalidatePath(`/products/${currentData.slug}`);
    if (updates.slug && updates.slug !== currentData.slug) revalidatePath(`/products/${updates.slug}`);

    return NextResponse.json({ data: { ...currentData, ...updatedPayload, id: params.id } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Update failed";
    return NextResponse.json({ error: { code: "ADMIN_ERROR", message } }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
    const docRef = adminDb.collection("products").doc(params.id);
    const existing = await docRef.get();

    if (existing.exists) {
      const p = existing.data() as Product;
      await docRef.delete();
      revalidatePath("/");
      revalidatePath("/products");
      if (p.category) revalidatePath(`/category/${p.category}`);
      if (p.slug) revalidatePath(`/products/${p.slug}`);
    }

    return NextResponse.json({ data: { success: true } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Delete failed";
    return NextResponse.json({ error: { code: "ADMIN_ERROR", message } }, { status: 500 });
  }
}
