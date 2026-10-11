import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/require-admin";
import { adminDb } from "@/lib/firebase-admin";
import { getStoreSettings } from "@/lib/data/settings";
import type { StoreSettings } from "@/types";

export const runtime = "nodejs";

const settingsSchema = z.object({
  storeName: z.string().min(2),
  whatsappNumber: z.string().regex(/^\d{10}$/),
  freeDeliveryAbove: z.number().int().min(0),
  deliveryCharge: z.number().int().min(0),
  restrictDeliveryToHospital: z.boolean(),
  deliveryLocationName: z.string().min(2),
  supportEmail: z.string().email().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
});

export async function GET() {
  try {
    await requireAdmin();
    const settings = await getStoreSettings();
    return NextResponse.json({ data: settings });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error fetching settings";
    return NextResponse.json({ error: { code: "ADMIN_ERROR", message } }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const parsed = settingsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid settings payload", fields: parsed.error.flatten().fieldErrors } },
        { status: 400 }
      );
    }

    const data: StoreSettings = {
      ...parsed.data,
      supportEmail: parsed.data.supportEmail || undefined,
      address: parsed.data.address || undefined,
    };

    await adminDb.collection("settings").doc("store").set(data, { merge: true });

    revalidatePath("/");
    revalidatePath("/checkout");
    revalidatePath("/cart");

    return NextResponse.json({ data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update settings";
    return NextResponse.json({ error: { code: "ADMIN_ERROR", message } }, { status: 500 });
  }
}
