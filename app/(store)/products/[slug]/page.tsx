import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { getProductBySlug } from "@/lib/data/products";
import { ProductInteractiveSection } from "@/components/store/product-interactive-section";
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
        {/* Left: Pale Comparison Card White 28px Image Canvas (§5.4) */}
        <div className="bg-white rounded-tile p-8 sm:p-12 flex items-center justify-center min-h-[380px] sm:min-h-[480px] relative overflow-hidden border border-steel/20 shadow-none">
          {product.images && product.images[0] ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={product.images[0]}
              alt={product.name}
              className="max-h-[380px] max-w-full object-contain mix-blend-multiply"
              onError={(e) => {
                (e.target as HTMLElement).style.display = "none";
              }}
            />
          ) : null}

          {/* Fallback emblem on white */}
          <div className="text-obsidian/40 flex flex-col items-center justify-center text-center p-4">
            <span className="text-4xl font-extrabold tracking-tight text-obsidian/80">PT</span>
            <span className="text-xs uppercase font-semibold text-obsidian/60 tracking-widest mt-1">
              {product.category.replace("-", " ")}
            </span>
          </div>

          {totalStock <= 0 && (
            <div className="absolute inset-0 bg-obsidian/60 flex items-center justify-center rounded-tile">
              <span className="bg-error text-white text-sm font-semibold px-4 py-2 rounded-pill">
                Out of Stock
              </span>
            </div>
          )}
        </div>

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
    </div>
  );
}
