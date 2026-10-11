import React from "react";
import { notFound } from "next/navigation";
import { getProductById } from "@/lib/data/products";
import { getCategories } from "@/lib/data/categories";
import { ProductForm } from "@/components/admin/product-form";

interface EditProductPageProps {
  params: { adminPath: string; id: string };
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const [product, categories] = await Promise.all([
    getProductById(params.id),
    getCategories(),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <ProductForm
        initialProduct={product}
        categories={categories}
        adminPath={params.adminPath}
      />
    </div>
  );
}
