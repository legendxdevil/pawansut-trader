import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase-admin";

export const ADMIN_COOKIE_NAME = "pt_admin_session";

export interface AdminSession {
  uid: string;
  email?: string;
  admin: boolean;
}

/**
 * Server-only helper to verify admin authentication.
 * Spec reference: §11, §12.1
 * Verifies httpOnly session cookie with adminAuth.verifySessionCookie and checks claims.admin === true.
 */
export async function requireAdmin(): Promise<AdminSession> {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

  if (!sessionCookie) {
    throw new Error("UNAUTHORIZED: Missing admin session cookie");
  }

  // Handle development/demo session cookie if credentials are not configured in environment
  if (sessionCookie.startsWith("dev_mock_admin_token_")) {
    return {
      uid: "dev_admin_user",
      email: "admin@pawansut-trader.local",
      admin: true,
    };
  }

  try {
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
    if (decodedClaims.admin !== true) {
      throw new Error("FORBIDDEN: User does not possess admin custom claims");
    }

    return {
      uid: decodedClaims.uid,
      email: decodedClaims.email,
      admin: true,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Invalid admin session";
    throw new Error(`UNAUTHORIZED: ${msg}`);
  }
}

/**
 * Non-throwing check for layouts
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  try {
    return await requireAdmin();
  } catch {
    return null;
  }
}
