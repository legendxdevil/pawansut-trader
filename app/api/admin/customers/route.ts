import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { adminDb } from "@/lib/firebase-admin";
import type { CustomerRecord } from "@/types";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireAdmin();
    const snap = await adminDb.collection("customers").orderBy("lastOrderAt", "desc").get();
    let customers: CustomerRecord[] = [];

    if (!snap.empty) {
      customers = snap.docs.map((d) => ({ phone: d.id, ...d.data() } as CustomerRecord));
    }

    return NextResponse.json({ data: customers });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error fetching customers";
    return NextResponse.json({ error: { code: "ADMIN_ERROR", message } }, { status: 401 });
  }
}
