import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/require-admin";
import { adminDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";

const patchBannerSchema = z.object({
  imageUrl: z.string().url("Valid image URL is required").optional(),
  mobileImageUrl: z.string().url("Valid mobile image URL").optional().or(z.literal("")),
  alt: z.string().min(1, "Alt text is required").optional(),
  link: z.string().optional().or(z.literal("")),
  isActive: z.boolean().optional(),
  order: z.number().int().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
    const body = await req.json();
    const parsed = patchBannerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid banner update payload",
            fields: parsed.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const bannerId = params.id;
    const docRef = adminDb.collection("banners").doc(bannerId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Banner not found" } },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {
      ...parsed.data,
      updatedAt: Date.now(),
    };

    if (parsed.data.mobileImageUrl === "") {
      updateData.mobileImageUrl = null;
    }
    if (parsed.data.link === "") {
      updateData.link = null;
    }

    await docRef.update(updateData);
    revalidatePath("/");

    return NextResponse.json({
      data: { id: bannerId, ...doc.data(), ...updateData },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update banner";
    return NextResponse.json({ error: { code: "ADMIN_ERROR", message } }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
    const bannerId = params.id;
    await adminDb.collection("banners").doc(bannerId).delete();
    revalidatePath("/");

    return NextResponse.json({ data: { id: bannerId, deleted: true } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete banner";
    return NextResponse.json({ error: { code: "ADMIN_ERROR", message } }, { status: 500 });
  }
}
