"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  Menu,
  X,
  ShieldCheck,
  Images,
} from "lucide-react";

interface AdminNavProps {
  adminPath: string;
  sessionEmail?: string;
  storeName: string;
}

export function AdminNav({ adminPath, sessionEmail, storeName }: AdminNavProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Close drawer on path change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const navItems = [
    { label: "Dashboard", href: `/${adminPath}/dashboard`, icon: LayoutDashboard },
    { label: "Products", href: `/${adminPath}/products`, icon: Package },
    { label: "Categories", href: `/${adminPath}/categories`, icon: Layers },
    { label: "Banners", href: `/${adminPath}/banners`, icon: Images },
    { label: "Orders", href: `/${adminPath}/orders`, icon: ShoppingBag },
    { label: "Customers", href: `/${adminPath}/customers`, icon: Users },
    { label: "Coupons", href: `/${adminPath}/coupons`, icon: Tag },
    { label: "Announcements", href: `/${adminPath}/announcements`, icon: Megaphone },
    { label: "Reviews", href: `/${adminPath}/reviews`, icon: Star },
    { label: "Analytics", href: `/${adminPath}/analytics`, icon: BarChart3 },
    { label: "Store Settings", href: `/${adminPath}/settings`, icon: Settings },
  ];

  return (
    <>
      {/* Mobile Top Header (< lg) - Fixed and permanently pinned on scroll */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-carbon/95 backdrop-blur-md border-b border-steel/30 px-4 flex items-center justify-between z-40">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="p-2 -ml-1 text-porcelain hover:bg-steel/30 rounded-full min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
            aria-label="Open admin menu"
          >
            <Menu size={20} />
          </button>
          <div className="leading-tight">
            <span className="font-bold text-sm tracking-tight text-porcelain block">
              {storeName}
            </span>
            <span className="text-[10px] text-apple-blue font-semibold uppercase tracking-wider block">
              Admin Panel
            </span>
          </div>
        </div>

        <Link
          href="/"
          target="_blank"
          className="text-xs text-electric-link hover:underline flex items-center gap-1 p-2 min-h-[44px]"
        >
          <span>Store</span>
          <ExternalLink size={12} />
        </Link>
      </header>

      {/* Mobile Drawer Overlay (< lg) */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm animate-fadeIn"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <div className="relative w-72 max-w-[85vw] bg-carbon border-r border-steel/30 flex flex-col justify-between z-10 h-[100dvh] shadow-2xl animate-slideIn">
            {/* Top header inside drawer */}
            <div className="p-5 border-b border-steel/20 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-sm text-porcelain">{storeName}</h2>
                <div className="flex items-center gap-1 text-[11px] text-success font-medium mt-0.5">
                  <ShieldCheck size={12} />
                  <span>Admin Session</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="p-2 text-ash hover:text-porcelain rounded-full hover:bg-steel/30 min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Close navigation"
              >
                <X size={18} />
              </button>
            </div>

            {/* Nav list */}
            <div className="p-4 flex-1 overflow-y-auto space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-3 rounded-tile text-sm font-medium min-h-[44px] transition-colors ${
                      isActive
                        ? "bg-apple-blue text-white shadow-sm"
                        : "text-porcelain/80 hover:text-white hover:bg-steel/30"
                    }`}
                  >
                    <Icon size={18} className="shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Bottom info & actions */}
            <div className="p-4 border-t border-steel/20 space-y-3 bg-graphite/40">
              <div className="text-xs text-ash">
                <p className="text-porcelain font-medium truncate">{sessionEmail}</p>
                <p className="text-[10px] text-ash">Signed in</p>
              </div>

              <div className="flex items-center justify-between pt-1">
                <Link
                  href="/"
                  target="_blank"
                  className="text-xs text-electric-link hover:underline flex items-center gap-1.5 p-2 min-h-[44px]"
                >
                  <ExternalLink size={14} />
                  <span>Public Store</span>
                </Link>

                <form action="/api/admin/session" method="DELETE">
                  <button
                    type="submit"
                    className="text-xs text-error hover:text-error/80 flex items-center gap-1.5 p-2 min-h-[44px] rounded-pill hover:bg-error/10 transition-colors"
                  >
                    <LogOut size={14} />
                    <span>Sign Out</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar (lg+) - Fixed and permanently pinned on scroll */}
      <aside className="hidden lg:flex fixed top-0 left-0 bottom-0 w-64 h-screen bg-carbon border-r border-steel/30 flex-col justify-between shrink-0 z-40 overflow-y-auto">
        <div className="p-6 space-y-6">
          <div className="space-y-1">
            <h1 className="font-bold text-sm tracking-tight text-porcelain">
              {storeName}
            </h1>
            <p className="text-[11px] text-ash">Admin Control Center</p>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-tile text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-apple-blue text-white shadow-sm"
                      : "text-porcelain/80 hover:text-white hover:bg-steel/30"
                  }`}
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
            <p className="text-porcelain/90 font-medium truncate">{sessionEmail}</p>
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

      {/* Desktop Top Header (lg+) - Fixed and permanently pinned on scroll */}
      <header className="hidden lg:flex fixed top-0 left-64 right-0 h-14 bg-carbon/95 backdrop-blur-md border-b border-steel/30 px-6 items-center justify-between z-30">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-sm text-porcelain">
            {navItems.find((item) => pathname === item.href || pathname?.startsWith(item.href + "/"))?.label || "Dashboard"}
          </span>
          <span className="text-[10px] text-apple-blue font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-apple-blue/10 border border-apple-blue/20">
            Admin Center
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <Link
            href="/"
            target="_blank"
            className="text-electric-link hover:underline flex items-center gap-1.5 px-3 py-1.5 rounded-pill bg-steel/20 hover:bg-steel/30 transition-colors"
          >
            <span>Live Store</span>
            <ExternalLink size={12} />
          </Link>

          <div className="text-ash flex items-center gap-2 border-l border-steel/30 pl-4">
            <span className="text-porcelain/90 font-medium truncate max-w-[220px]">{sessionEmail}</span>
            <form action="/api/admin/session" method="DELETE">
              <button
                type="submit"
                className="text-xs text-ash hover:text-error flex items-center gap-1 p-1.5 hover:bg-error/10 rounded-full transition-colors"
                title="Sign out"
              >
                <LogOut size={14} />
              </button>
            </form>
          </div>
        </div>
      </header>
    </>
  );
}
