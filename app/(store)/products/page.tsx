import React from "react";
import type { Metadata } from "next";
import { getProducts } from "@/lib/data/products";
import { getCategories } from "@/lib/data/categories";
import { CatalogView } from "@/components/store/catalog-view";

export const metadata: Metadata = {
  title: "All Products — Mobile Accessories",
  description:
    "Explore our complete catalog of high-speed chargers, durable cables, TWS earphones, and shockproof cases with physical warranty support.",
};

export const revalidate = 60;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams?: { category?: string; search?: string };
}) {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 py-8 space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">Accessories Catalog</h1>
        <p className="text-ash text-sm">
          Browse verified chargers, cables, audio gear, and protection.
        </p>
      </div>

      <CatalogView
        initialProducts={products}
        categories={categories}
        initialCategory={searchParams?.category || "all"}
        initialSearch={searchParams?.search || ""}
      />
    </div>
  );
}
