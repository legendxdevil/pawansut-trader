import React from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Truck, Sparkles } from "lucide-react";
import { getCategories } from "@/lib/data/categories";
import { getFeaturedProducts, getNewArrivals, getProducts } from "@/lib/data/products";
import { ProductCard } from "@/components/store/product-card";
import { STORE_CONFIG } from "@/lib/store-config";

export const revalidate = 60; // ISR 60 seconds per spec §12.2

export default async function HomePage() {
  const [categories, featured, newArrivals, allProducts] = await Promise.all([
    getCategories(),
    getFeaturedProducts(4),
    getNewArrivals(4),
    getProducts({ limit: 8 }),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ElectronicsStore",
    name: STORE_CONFIG.storeName,
    description: "Premium mobile accessories online store serving Satyawadi Raja Harish Chandra Hospital, Delhi.",
    telephone: `+${STORE_CONFIG.whatsappFullNumber}`,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Delhi",
      addressRegion: "Delhi",
      postalCode: "110040",
      streetAddress: STORE_CONFIG.shopAddress,
      addressCountry: "IN",
    },
    currenciesAccepted: "INR",
    priceRange: "₹₹",
  };

  return (
    <div className="space-y-16 pb-16">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero: Obsidian Stage (§7.2, §5.1) */}
      <section className="bg-obsidian pt-12 pb-16 px-4 border-b border-steel/20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-carbon px-4 py-1.5 rounded-pill border border-steel/40 text-xs font-medium text-copper-new">
            <Sparkles size={14} />
            <span>Next-Generation Mobile Accessories</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-semibold tracking-tight text-porcelain max-w-4xl">
            Pure Precision. Uncompromising Power.
          </h1>

          <p className="text-ash text-base sm:text-lg max-w-2xl leading-relaxed">
            Engineered GaN chargers, ballistic cables, crystal acoustics, and heavy-duty protection. Delivered swiftly at Satyawadi Raja Harish Chandra Hospital.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/products"
              className="bg-apple-blue hover:bg-apple-blue/90 text-white font-medium text-sm sm:text-base px-8 py-3 rounded-pill transition-transform active:scale-95 flex items-center gap-2"
            >
              Shop Catalog
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/track"
              className="bg-transparent hover:bg-steel/30 text-porcelain border border-slate font-medium text-sm sm:text-base px-8 py-3 rounded-pill transition-transform active:scale-95"
            >
              Track Existing Order
            </Link>
          </div>

          {/* Delivery & Warranty highlight capsules */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 max-w-2xl w-full">
            <div className="bg-carbon/80 rounded-tile p-4 border border-steel/30 flex items-center gap-3 text-left">
              <div className="bg-steel/60 p-2.5 rounded-full text-success">
                <Truck size={20} />
              </div>
              <div>
                <p className="text-xs text-porcelain font-semibold">Free Hospital Delivery</p>
                <p className="text-[11px] text-ash">On all orders above ₹499 (or ₹80 flat)</p>
              </div>
            </div>

            <div className="bg-carbon/80 rounded-tile p-4 border border-steel/30 flex items-center gap-3 text-left">
              <div className="bg-steel/60 p-2.5 rounded-full text-optical-yellow">
                <ShieldCheck size={20} />
              </div>
              <div>
                <p className="text-xs text-porcelain font-semibold">Physical Warranty Card</p>
                <p className="text-[11px] text-ash">Delivered with product for guaranteed support</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Chips / Tiles (§7.2) */}
      <section className="max-w-7xl mx-auto px-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">Browse by Category</h2>
          <Link href="/products" className="text-electric-link text-xs sm:text-sm hover:underline font-medium">
            View all &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className="bg-carbon hover:bg-steel/40 border border-steel/30 rounded-tile p-3 text-center flex flex-col items-center justify-center transition-all group"
            >
              <div className="w-10 h-10 rounded-full bg-steel/40 group-hover:bg-steel flex items-center justify-center mb-2 text-porcelain font-bold text-xs">
                {cat.name.slice(0, 2).toUpperCase()}
              </div>
              <span className="text-xs text-porcelain/90 font-medium line-clamp-2">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* New Arrivals Section */}
      {newArrivals.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 space-y-6">
          <div className="flex items-center justify-between border-b border-steel/20 pb-3">
            <div>
              <span className="text-copper-new text-xs font-semibold uppercase tracking-wider block">
                Fresh Stock
              </span>
              <h2 className="text-2xl font-semibold tracking-tight">New Arrivals</h2>
            </div>
            <Link href="/products" className="text-electric-link text-xs sm:text-sm hover:underline font-medium">
              Explore all &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Featured Products Section */}
      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 space-y-6">
          <div className="flex items-center justify-between border-b border-steel/20 pb-3">
            <div>
              <span className="text-electric-link text-xs font-semibold uppercase tracking-wider block">
                Editor&apos;s Pick
              </span>
              <h2 className="text-2xl font-semibold tracking-tight">Featured Gear</h2>
            </div>
            <Link href="/products" className="text-electric-link text-xs sm:text-sm hover:underline font-medium">
              See full collection &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Full Catalog Grid Preview */}
      <section className="max-w-7xl mx-auto px-4 space-y-6">
        <div className="flex items-center justify-between border-b border-steel/20 pb-3">
          <h2 className="text-2xl font-semibold tracking-tight">All Mobile Accessories</h2>
          <Link href="/products" className="text-electric-link text-xs sm:text-sm hover:underline font-medium">
            Search & Filter &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {allProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
