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

          <h1 className="display-clamp font-semibold tracking-tight text-porcelain max-w-4xl">
            Pure Precision. Uncompromising Power.
          </h1>

          <p className="text-ash text-sm sm:text-base md:text-lg max-w-2xl leading-relaxed">
            Engineered GaN chargers, ballistic cables, crystal acoustics, and heavy-duty protection. Delivered swiftly at Satyawadi Raja Harish Chandra Hospital.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 pt-2 w-full sm:w-auto">
            <Link
              href="/products"
              className="w-full sm:w-auto min-h-[44px] bg-apple-blue hover:bg-apple-blue/90 text-white font-medium text-sm sm:text-base px-8 py-3 rounded-pill transition-transform active:scale-95 flex items-center justify-center gap-2"
            >
              Shop Catalog
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/track"
              className="w-full sm:w-auto min-h-[44px] bg-transparent hover:bg-steel/30 text-porcelain border border-slate font-medium text-sm sm:text-base px-8 py-3 rounded-pill transition-transform active:scale-95 flex items-center justify-center"
            >
              Track Existing Order
            </Link>
          </div>

          {/* Delivery & Warranty highlight capsules */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-6 max-w-2xl w-full">
            <div className="bg-carbon/80 rounded-tile p-3.5 sm:p-4 border border-steel/30 flex items-center gap-3 text-left">
              <div className="bg-steel/60 p-2.5 rounded-full text-success shrink-0">
                <Truck size={20} />
              </div>
              <div>
                <p className="text-xs text-porcelain font-semibold">Free Hospital Delivery</p>
                <p className="text-[11px] text-ash">On all orders above ₹499 (or ₹80 flat)</p>
              </div>
            </div>

            <div className="bg-carbon/80 rounded-tile p-3.5 sm:p-4 border border-steel/30 flex items-center gap-3 text-left">
              <div className="bg-steel/60 p-2.5 rounded-full text-optical-yellow shrink-0">
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

      {/* Category Icons Row: Horizontal scroll with scroll-snap per STEP 3 */}
      <section className="max-w-7xl mx-auto px-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-2xl font-semibold tracking-tight text-porcelain">
            Browse by Category
          </h2>
          <Link href="/products" className="text-electric-link text-xs sm:text-sm hover:underline font-medium min-h-[44px] flex items-center">
            View all &rarr;
          </Link>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1 -mx-4 px-4 snap-x snap-mandatory scrollbar-none">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className="snap-start shrink-0 min-w-[76px] sm:min-w-[96px] bg-carbon hover:bg-steel/40 border border-steel/30 rounded-tile p-3 text-center flex flex-col items-center justify-center transition-all group"
            >
              <div className="w-12 h-12 rounded-full bg-steel/40 group-hover:bg-steel flex items-center justify-center mb-1.5 text-porcelain font-bold text-xs shrink-0">
                {cat.name.slice(0, 2).toUpperCase()}
              </div>
              <span className="text-[11px] sm:text-xs text-porcelain/90 font-medium line-clamp-1 text-center w-full">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* New Arrivals Section: 2 cols on mobile, 3 on md, 4 on lg per STEP 3 */}
      {newArrivals.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between border-b border-steel/20 pb-3">
            <div>
              <span className="text-copper-new text-xs font-semibold uppercase tracking-wider block">
                Fresh Stock
              </span>
              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-porcelain">New Arrivals</h2>
            </div>
            <Link href="/products" className="text-electric-link text-xs sm:text-sm hover:underline font-medium min-h-[44px] flex items-center">
              Explore all &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Featured Products Section: 2 cols on mobile, 3 on md, 4 on lg */}
      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between border-b border-steel/20 pb-3">
            <div>
              <span className="text-electric-link text-xs font-semibold uppercase tracking-wider block">
                Editor&apos;s Pick
              </span>
              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-porcelain">Featured Gear</h2>
            </div>
            <Link href="/products" className="text-electric-link text-xs sm:text-sm hover:underline font-medium min-h-[44px] flex items-center">
              See collection &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Full Catalog Grid Preview: 2 cols on mobile, 3 on md, 4 on lg */}
      <section className="max-w-7xl mx-auto px-4 space-y-4 sm:space-y-6">
        <div className="flex items-center justify-between border-b border-steel/20 pb-3">
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-porcelain">All Mobile Accessories</h2>
          <Link href="/products" className="text-electric-link text-xs sm:text-sm hover:underline font-medium min-h-[44px] flex items-center">
            Search &amp; Filter &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {allProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
