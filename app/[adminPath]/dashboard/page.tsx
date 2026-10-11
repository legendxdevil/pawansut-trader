import React from "react";
import Link from "next/link";
import {
  Package,
  ShoppingBag,
  Layers,
  Tag,
  Megaphone,
  Settings,
  AlertTriangle,
  ArrowRight,
  Truck,
} from "lucide-react";
import { getProducts } from "@/lib/data/products";
import { getCategories } from "@/lib/data/categories";
import { getActiveAnnouncements } from "@/lib/data/announcements";
import { getStoreSettings } from "@/lib/data/settings";

interface AdminDashboardProps {
  params: { adminPath: string };
}

export default async function AdminDashboardPage({ params }: AdminDashboardProps) {
  const [products, categories, announcements, settings] = await Promise.all([
    getProducts(),
    getCategories(),
    getActiveAnnouncements(),
    getStoreSettings(),
  ]);

  const lowStockProducts = products.filter((p) =>
    p.variants.some((v) => v.stock > 0 && v.stock <= 3)
  );
  const outOfStockProducts = products.filter((p) =>
    p.variants.every((v) => v.stock <= 0)
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-porcelain">
          Store Operations Dashboard
        </h1>
        <p className="text-ash text-xs mt-1">
          Monitor catalog, track inventory thresholds, and manage store operations.
        </p>
      </div>

      {/* Metrics Row (28px tiles per §5.3, §5.4) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-carbon rounded-tile border border-steel/30 p-5 space-y-2">
          <div className="flex items-center justify-between text-ash text-xs">
            <span>Total Catalog Products</span>
            <Package size={16} className="text-apple-blue" />
          </div>
          <p className="text-2xl font-bold text-porcelain">{products.length}</p>
          <p className="text-[11px] text-ash">Active in store catalog</p>
        </div>

        <div className="bg-carbon rounded-tile border border-steel/30 p-5 space-y-2">
          <div className="flex items-center justify-between text-ash text-xs">
            <span>Low Stock Items (≤ 3)</span>
            <AlertTriangle size={16} className="text-warning" />
          </div>
          <p className="text-2xl font-bold text-warning">{lowStockProducts.length}</p>
          <p className="text-[11px] text-ash">Needs restock attention</p>
        </div>

        <div className="bg-carbon rounded-tile border border-steel/30 p-5 space-y-2">
          <div className="flex items-center justify-between text-ash text-xs">
            <span>Out of Stock</span>
            <AlertTriangle size={16} className="text-error" />
          </div>
          <p className="text-2xl font-bold text-error">{outOfStockProducts.length}</p>
          <p className="text-[11px] text-ash">Unavailable for purchase</p>
        </div>

        <div className="bg-carbon rounded-tile border border-steel/30 p-5 space-y-2">
          <div className="flex items-center justify-between text-ash text-xs">
            <span>Hospital Delivery Mode</span>
            <Truck size={16} className="text-success" />
          </div>
          <p className="text-2xl font-bold text-success">
            {settings.restrictDeliveryToHospital ? "Restricted" : "Open Area"}
          </p>
          <p className="text-[11px] text-ash truncate">
            {settings.restrictDeliveryToHospital ? "Satyawadi Raja Harish Chandra Hospital" : "Any location"}
          </p>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="space-y-4">
        <h2 className="text-base font-semibold tracking-tight text-porcelain">
          Management Sections
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            href={`/${params.adminPath}/products`}
            className="bg-carbon hover:bg-steel/30 border border-steel/30 rounded-tile p-5 space-y-2 transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm text-porcelain group-hover:text-electric-link flex items-center gap-2">
                <Package size={16} /> Manage Products
              </span>
              <ArrowRight size={14} className="text-ash group-hover:translate-x-1 transition-transform" />
            </div>
            <p className="text-xs text-ash">Add products, configure variants, pricing, and warranty cards.</p>
          </Link>

          <Link
            href={`/${params.adminPath}/orders`}
            className="bg-carbon hover:bg-steel/30 border border-steel/30 rounded-tile p-5 space-y-2 transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm text-porcelain group-hover:text-electric-link flex items-center gap-2">
                <ShoppingBag size={16} /> Customer Orders
              </span>
              <ArrowRight size={14} className="text-ash group-hover:translate-x-1 transition-transform" />
            </div>
            <p className="text-xs text-ash">View orders, advance statuses, issue warranty cards, print invoices.</p>
          </Link>

          <Link
            href={`/${params.adminPath}/categories`}
            className="bg-carbon hover:bg-steel/30 border border-steel/30 rounded-tile p-5 space-y-2 transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm text-porcelain group-hover:text-electric-link flex items-center gap-2">
                <Layers size={16} /> Product Categories
              </span>
              <ArrowRight size={14} className="text-ash group-hover:translate-x-1 transition-transform" />
            </div>
            <p className="text-xs text-ash">Organize store hierarchy across {categories.length} active categories.</p>
          </Link>

          <Link
            href={`/${params.adminPath}/coupons`}
            className="bg-carbon hover:bg-steel/30 border border-steel/30 rounded-tile p-5 space-y-2 transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm text-porcelain group-hover:text-electric-link flex items-center gap-2">
                <Tag size={16} /> Promo Coupons
              </span>
              <ArrowRight size={14} className="text-ash group-hover:translate-x-1 transition-transform" />
            </div>
            <p className="text-xs text-ash">Create discount promo codes with percentage/flat limits.</p>
          </Link>

          <Link
            href={`/${params.adminPath}/announcements`}
            className="bg-carbon hover:bg-steel/30 border border-steel/30 rounded-tile p-5 space-y-2 transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm text-porcelain group-hover:text-electric-link flex items-center gap-2">
                <Megaphone size={16} /> Announcement Carousel
              </span>
              <ArrowRight size={14} className="text-ash group-hover:translate-x-1 transition-transform" />
            </div>
            <p className="text-xs text-ash">{announcements.length} top banners currently live on customer pages.</p>
          </Link>

          <Link
            href={`/${params.adminPath}/settings`}
            className="bg-carbon hover:bg-steel/30 border border-steel/30 rounded-tile p-5 space-y-2 transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm text-porcelain group-hover:text-electric-link flex items-center gap-2">
                <Settings size={16} /> Store Settings
              </span>
              <ArrowRight size={14} className="text-ash group-hover:translate-x-1 transition-transform" />
            </div>
            <p className="text-xs text-ash">Configure hospital delivery rules, WhatsApp phone, and fees.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
