import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Users,
  Tag,
  Megaphone,
  Star,
  BarChart3,
  Settings,
  LogOut,
  ExternalLink,
} from "lucide-react";
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
  // (We check by presence of session vs login route in client components or server check)
  if (!session) {
    return (
      <div className="min-h-screen bg-obsidian text-porcelain">
        {children}
      </div>
    );
  }

  const navItems = [
    { label: "Dashboard", href: `/${params.adminPath}/dashboard`, icon: LayoutDashboard },
    { label: "Products", href: `/${params.adminPath}/products`, icon: Package },
    { label: "Categories", href: `/${params.adminPath}/categories`, icon: Layers },
    { label: "Orders", href: `/${params.adminPath}/orders`, icon: ShoppingBag },
    { label: "Customers", href: `/${params.adminPath}/customers`, icon: Users },
    { label: "Coupons", href: `/${params.adminPath}/coupons`, icon: Tag },
    { label: "Announcements", href: `/${params.adminPath}/announcements`, icon: Megaphone },
    { label: "Reviews", href: `/${params.adminPath}/reviews`, icon: Star },
    { label: "Analytics", href: `/${params.adminPath}/analytics`, icon: BarChart3 },
    { label: "Store Settings", href: `/${params.adminPath}/settings`, icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-obsidian text-porcelain flex">
      {/* Sidebar (Admin dark panel per §5.4) */}
      <aside className="w-64 bg-carbon border-r border-steel/30 flex flex-col justify-between hidden md:flex">
        <div className="p-6 space-y-6">
          <div className="space-y-1">
            <h1 className="font-bold text-sm tracking-tight text-porcelain">
              {STORE_CONFIG.storeName}
            </h1>
            <p className="text-[11px] text-ash">Admin Control Center</p>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-tile text-xs font-medium text-porcelain/80 hover:text-white hover:bg-steel/30 transition-colors"
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer info & Logout */}
        <div className="p-6 border-t border-steel/20 space-y-3">
          <div className="text-[11px] text-ash">
            <p className="text-porcelain/90 font-medium truncate">{session.email}</p>
            <p className="text-[10px] text-success">Verified Admin</p>
          </div>

          <div className="flex items-center justify-between pt-2">
            <Link
              href="/"
              target="_blank"
              className="text-[11px] text-electric-link hover:underline flex items-center gap-1"
            >
              <span>View Store</span>
              <ExternalLink size={12} />
            </Link>

            <form action="/api/admin/session" method="DELETE">
              <button
                type="submit"
                className="text-xs text-ash hover:text-error flex items-center gap-1 p-1"
                title="Sign out"
              >
                <LogOut size={14} />
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 bg-carbon/50 border-b border-steel/30 px-6 flex items-center justify-between md:hidden">
          <span className="font-semibold text-sm">{STORE_CONFIG.storeName} Admin</span>
          <Link href={`/${params.adminPath}/dashboard`} className="text-xs text-electric-link">
            Menu
          </Link>
        </header>

        <main className="flex-1 p-6 sm:p-10 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
