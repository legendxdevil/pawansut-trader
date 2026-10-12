import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/require-admin";
import { adminDb } from "@/lib/firebase-admin";
import type { Banner } from "@/types";

export const runtime = "nodejs";

const bannerSchema = z.object({
  id: z.string().optional(),
  imageUrl: z.string().min(1, "Banner image is required"),
  mobileImageUrl: z.string().optional().or(z.literal("")),
  alt: z.string().min(1, "Alt text is required"),
  link: z.string().optional().or(z.literal("")),
  isActive: z.boolean().default(true),
  order: z.number().int().default(1),
});

export async function GET() {
  try {
    await requireAdmin();
    const snap = await adminDb.collection("banners").orderBy("order", "asc").get();
    let banners: Banner[] = [];

    if (!snap.empty) {
      banners = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Banner));
    }

    return NextResponse.json({ data: banners });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error fetching banners";
    return NextResponse.json({ error: { code: "ADMIN_ERROR", message } }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const parsed = bannerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid banner payload",
            fields: parsed.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const { id, imageUrl, mobileImageUrl, alt, link, isActive, order } = parsed.data;
    const bannerId = id || `banner-${Date.now()}`;

    const bannerData: Banner = {
      id: bannerId,
      imageUrl,
      alt,
      isActive,
      order,
      createdAt: Date.now(),
      ...(mobileImageUrl ? { mobileImageUrl } : {}),
      ...(link ? { link } : {}),
    };

    await adminDb.collection("banners").doc(bannerId).set(bannerData, { merge: true });

    revalidatePath("/");

    return NextResponse.json({ data: bannerData });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to save banner";
    return NextResponse.json({ error: { code: "ADMIN_ERROR", message } }, { status: 500 });
  }
}
