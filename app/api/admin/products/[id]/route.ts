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
    const updatedPayload = {
      ...updates,
      updatedAt: now,
    };

    await docRef.update(updatedPayload);

    // Revalidate affected paths per spec §11 & §19
    revalidatePath("/");
    revalidatePath("/products");
    if (currentData.category) revalidatePath(`/category/${currentData.category}`);
    if (currentData.slug) revalidatePath(`/products/${currentData.slug}`);

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
