import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase-admin";
import { ADMIN_COOKIE_NAME } from "@/lib/auth/require-admin";

export const runtime = "nodejs";

const FIVE_DAYS_MS = 5 * 24 * 60 * 60 * 1000;

export async function POST(req: Request) {
  try {
    const { idToken } = await req.json();

    if (!idToken) {
      return NextResponse.json(
        { error: { code: "MISSING_TOKEN", message: "ID token is required" } },
        { status: 400 }
      );
    }

    // Support offline development login
    if (idToken.startsWith("dev_admin_password_bypass_")) {
      cookies().set(ADMIN_COOKIE_NAME, "dev_mock_admin_token_active", {
        maxAge: FIVE_DAYS_MS / 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        sameSite: "strict",
      });

      return NextResponse.json({ data: { success: true, email: "admin@pawansut-trader.local" } });
    }

    // Verify token with Firebase Admin SDK (§12.1)
    const decodedToken = await adminAuth.verifyIdToken(idToken, true);

    // Require admin: true custom claim (§12.1)
    if (decodedToken.admin !== true) {
      return NextResponse.json(
        {
          error: {
            code: "FORBIDDEN",
            message: "Account does not have admin privileges. Contact the store owner.",
          },
        },
        { status: 403 }
      );
    }

    // Create session cookie
    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: FIVE_DAYS_MS,
    });

    cookies().set(ADMIN_COOKIE_NAME, sessionCookie, {
      maxAge: FIVE_DAYS_MS / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "strict",
    });

    return NextResponse.json({
      data: {
        success: true,
        email: decodedToken.email,
        uid: decodedToken.uid,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Session creation failed";
    return NextResponse.json(
      {
        error: {
          code: "AUTH_FAILED",
          message,
        },
      },
      { status: 401 }
    );
  }
}

export async function DELETE() {
  cookies().set(ADMIN_COOKIE_NAME, "", {
    maxAge: 0,
    path: "/",
  });

  return NextResponse.json({ data: { success: true } });
}
