import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { getProductBySlug } from "@/lib/data/products";
import { getApprovedReviews } from "@/lib/data/reviews";
import { ProductInteractiveSection } from "@/components/store/product-interactive-section";
import { ProductReviews } from "@/components/store/product-reviews";
import { ProductGallery } from "@/components/store/product-gallery";
import { STORE_CONFIG } from "@/lib/store-config";

interface ProductPageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  if (!product) {
    return {
      title: "Product Not Found",
    };
  }

  // Note: WhatsApp caches previews aggressively. Ensure og:image is absolute and under 300KB (spec §14).
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const ogImage = product.images?.[0]
    ? product.images[0].startsWith("http")
      ? product.images[0]
      : `${siteUrl}${product.images[0]}`
    : `${siteUrl}/og-default.png`;

  return {
    title: product.name,
    description: `${product.shortDescription || product.description.slice(0, 140)} — ₹${product.price} at Pawansut Trader.`,
    openGraph: {
      type: "website",
      title: product.name,
      description: `${product.shortDescription || product.description.slice(0, 140)} — ₹${product.price}`,
      images: [
        {
          url: ogImage,
          width: 800,
          height: 800,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: `${product.shortDescription || product.description.slice(0, 140)} — ₹${product.price}`,
      images: [ogImage],
    },
  };
}

export const revalidate = 60;

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProductBySlug(params.slug);
  if (!product) {
    notFound(); // Acceptance criteria: invalid slug -> 404
  }

  const reviews = await getApprovedReviews(product.id);
  const totalStock = product.variants.reduce((acc, v) => acc + (v.stock || 0), 0);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images,
    description: product.description,
    category: product.category,
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: STORE_CONFIG.currencyCode,
      availability:
        totalStock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: STORE_CONFIG.storeName,
      },
    },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
      {/* JSON-LD Product Structured Data (§7.4, §14) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-ash">
        <Link href="/" className="hover:text-porcelain transition-colors">
          Home
        </Link>
        <ChevronRight size={12} />
        <Link href="/products" className="hover:text-porcelain transition-colors">
          Products
        </Link>
        <ChevronRight size={12} />
        <Link
          href={`/category/${product.category}`}
          className="hover:text-porcelain transition-colors capitalize"
        >
          {product.category.replace("-", " ")}
        </Link>
        <ChevronRight size={12} />
        <span className="text-porcelain truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Product Top Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        {/* Left: Pale Comparison Card White 28px Image Canvas with Thumbnails (§5.4, §7.4) */}
        <ProductGallery
          images={product.images || []}
          productName={product.name}
          category={product.category}
          isOutOfStock={totalStock <= 0}
        />

        {/* Right: Info and Interactive Controls */}
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-porcelain">
              {product.name}
            </h1>
            {product.shortDescription && (
              <p className="text-ash text-sm sm:text-base leading-relaxed">
                {product.shortDescription}
              </p>
            )}
          </div>

          <ProductInteractiveSection product={product} />
        </div>
      </div>

      {/* Bottom Section: Full Description & Specs Table (§7.4) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-steel/30 pt-10">
        {/* Description */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold tracking-tight">Product Overview</h2>
          <div className="text-ash text-sm leading-relaxed whitespace-pre-line bg-carbon/40 rounded-tile p-6 border border-steel/20">
            {product.description}
          </div>
        </div>

        {/* Specs Table */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold tracking-tight">Technical Specifications</h2>
          {product.specs && product.specs.length > 0 ? (
            <div className="bg-carbon/40 rounded-tile border border-steel/20 overflow-hidden">
              <table className="w-full text-left text-xs sm:text-sm">
                <tbody>
                  {product.specs.map((spec, index) => (
                    <tr
                      key={index}
                      className={index % 2 === 0 ? "bg-carbon/60" : "bg-transparent"}
                    >
                      <td className="py-3 px-4 text-ash font-medium w-1/3 border-b border-steel/20">
                        {spec.label}
                      </td>
                      <td className="py-3 px-4 text-porcelain font-normal border-b border-steel/20">
                        {spec.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-ash text-xs">Standard specifications apply.</p>
          )}
        </div>
      </div>

      {/* Verified Reviews Section (§7.9, §19 Phase 7) */}
      <ProductReviews
        productId={product.id}
        productName={product.name}
        initialReviews={reviews}
      />
    </div>
  );
}
