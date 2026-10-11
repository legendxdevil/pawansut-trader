import React from "react";
import { getCategories } from "@/lib/data/categories";
import { getProducts } from "@/lib/data/products";
import { getActiveBanners } from "@/lib/data/banners";
import { getStoreSettings } from "@/lib/data/settings";
import { HeroSlider } from "@/components/store/hero-slider";
import { HeroInfoStrip } from "@/components/store/hero-info-strip";
import { CategoryRow } from "@/components/store/category-row";
import { CatalogView } from "@/components/store/catalog-view";
import { STORE_CONFIG } from "@/lib/store-config";

export const revalidate = 60; // ISR 60 seconds per spec §12.2

export default async function HomePage() {
  const [categories, allProducts, banners, settings] = await Promise.all([
    getCategories(),
    getProducts(),
    getActiveBanners(),
    getStoreSettings(),
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
    <div className="w-full">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Part A & D: Hero Slider - Full-bleed (100% width, no side margins) */}
      <HeroSlider banners={banners} />

      {/* Part D: Slim one-line info strip below hero slider */}
      <HeroInfoStrip settings={settings} />

      {/* Main Content: Single shared container (max-w-[1440px], px-4 md:px-6 lg:px-8) */}
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 py-8 sm:py-12 space-y-12 sm:space-y-16">
        {/* Part B: Browse by Category - Clean, no boxes, single mobile scroll, centered desktop */}
        <CategoryRow categories={categories} />

        {/* Part C: All Mobile Accessories Grid with search, sort & filter */}
        <section className="space-y-6">
          <div className="border-b border-steel/20 pb-3">
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-porcelain">
              All Mobile Accessories
            </h2>
            <p className="text-ash text-xs sm:text-sm mt-0.5">
              Premium GaN chargers, ballistic cables, crystal acoustics, and tough protection.
            </p>
          </div>

          <CatalogView
            initialProducts={allProducts}
            categories={categories}
            initialCategory="all"
          />
        </section>
      </div>
    </div>
  );
}
