import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { adminDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    const { id } = params;
    const body = await req.json();
    const { approved } = body;

    if (typeof approved !== "boolean") {
      return NextResponse.json(
        { error: { code: "INVALID_INPUT", message: "approved boolean is required" } },
        { status: 400 }
      );
    }

    const reviewRef = adminDb.collection("reviews").doc(id);
    await reviewRef.update({
      approved,
      moderatedAt: Date.now(),
    });

    return NextResponse.json({
      success: true,
      message: approved ? "Review approved" : "Review unapproved",
    });
  } catch (error) {
    const err = error as Error;
    const isUnauthorized = err.message?.includes("UNAUTHORIZED");
    return NextResponse.json(
      { error: { code: isUnauthorized ? "UNAUTHORIZED" : "INTERNAL_ERROR", message: err.message } },
      { status: isUnauthorized ? 401 : 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    const { id } = params;
    await adminDb.collection("reviews").doc(id).delete();

    return NextResponse.json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    const err = error as Error;
    const isUnauthorized = err.message?.includes("UNAUTHORIZED");
    return NextResponse.json(
      { error: { code: isUnauthorized ? "UNAUTHORIZED" : "INTERNAL_ERROR", message: err.message } },
      { status: isUnauthorized ? 401 : 500 }
    );
  }
}
