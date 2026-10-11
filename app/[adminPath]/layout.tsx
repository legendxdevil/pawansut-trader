import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminNav } from "@/components/admin/admin-nav";
import { getAdminSession } from "@/lib/auth/require-admin";
import { STORE_CONFIG } from "@/lib/store-config";

interface AdminLayoutProps {
  children: React.ReactNode;
  params: { adminPath: string };
}

// Robots protection (§6, §12.1): never index the secret admin section
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLayout({ children, params }: AdminLayoutProps) {
  const configuredAdminPath = process.env.ADMIN_PATH || "manage-admin";

  // Strict path guard (§6): Mismatch immediately yields notFound()
  if (params.adminPath !== configuredAdminPath) {
    notFound();
  }

  const session = await getAdminSession();

  // If this is the login page, render children without sidebar
  if (!session) {
    return (
      <div className="min-h-screen bg-obsidian text-porcelain">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-obsidian text-porcelain flex flex-col lg:flex-row">
      {/* Responsive Navigation: Mobile Header + Drawer (< lg) and Sidebar (lg+) */}
      <AdminNav
        adminPath={params.adminPath}
        sessionEmail={session.email}
        storeName={STORE_CONFIG.storeName}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-3.5 sm:p-6 lg:p-10 max-w-7xl w-full mx-auto pb-16 lg:pb-10">
          {children}
        </main>
      </div>
    </div>
  );
}
