import React from "react";
import { getCategories } from "@/lib/data/categories";
import { ProductForm } from "@/components/admin/product-form";

interface NewProductPageProps {
  params: { adminPath: string };
}

export default async function NewProductPage({ params }: NewProductPageProps) {
  const categories = await getCategories();

  return (
    <div className="space-y-6">
      <ProductForm categories={categories} adminPath={params.adminPath} />
    </div>
  );
}
