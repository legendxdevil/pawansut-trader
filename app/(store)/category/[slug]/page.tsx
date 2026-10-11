import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategories, getCategoryBySlug } from "@/lib/data/categories";
import { getProducts } from "@/lib/data/products";
import { CatalogView } from "@/components/store/catalog-view";

interface CategoryPageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const category = await getCategoryBySlug(params.slug);
  if (!category) {
    return {
      title: "Category Not Found",
    };
  }

  return {
    title: `${category.name} — Mobile Accessories`,
    description: `Shop high-performance ${category.name.toLowerCase()} at Pawansut Trader with physical warranty and hospital doorstep delivery.`,
  };
}

export const revalidate = 60;

export default async function CategoryPage({ params }: CategoryPageProps) {
  const category = await getCategoryBySlug(params.slug);
  if (!category) {
    notFound();
  }

  const [products, categories] = await Promise.all([
    getProducts({ category: category.slug }),
    getCategories(),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">{category.name}</h1>
        <p className="text-ash text-sm">
          Discover verified products in {category.name.toLowerCase()} designed for everyday reliability.
        </p>
      </div>

      <CatalogView
        initialProducts={products}
        categories={categories}
        initialCategory={category.slug}
      />
    </div>
  );
}
