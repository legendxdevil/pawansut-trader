import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/require-admin";
import { adminDb } from "@/lib/firebase-admin";
import { SAMPLE_ANNOUNCEMENTS } from "@/scripts/seed-data";
import type { Announcement } from "@/types";

export const runtime = "nodejs";

const announcementSchema = z.object({
  id: z.string().optional(),
  text: z.string().min(5, "Announcement text is required"),
  link: z.string().optional().or(z.literal("")),
  isActive: z.boolean().default(true),
  order: z.number().int().default(1),
});

export async function GET() {
  try {
    await requireAdmin();
    const snap = await adminDb.collection("announcements").orderBy("order", "asc").get();
    let list: Announcement[] = [];

    if (!snap.empty) {
      list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Announcement));
    } else {
      list = [...SAMPLE_ANNOUNCEMENTS];
    }

    return NextResponse.json({ data: list });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error fetching announcements";
    return NextResponse.json({ error: { code: "ADMIN_ERROR", message } }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const parsed = announcementSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid payload", fields: parsed.error.flatten().fieldErrors } },
        { status: 400 }
      );
    }

    const { id, text, link, isActive, order } = parsed.data;
    const docId = id || adminDb.collection("announcements").doc().id;

    const data: Announcement = {
      id: docId,
      text,
      isActive,
      order,
      ...(link ? { link } : {}),
    };

    await adminDb.collection("announcements").doc(docId).set(data, { merge: true });

    revalidatePath("/");

    return NextResponse.json({ data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to save announcement";
    return NextResponse.json({ error: { code: "ADMIN_ERROR", message } }, { status: 500 });
  }
}
