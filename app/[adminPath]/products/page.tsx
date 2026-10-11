import React from "react";
import Link from "next/link";
import { Plus, ShieldCheck, Edit, ExternalLink } from "lucide-react";
import { getProducts } from "@/lib/data/products";

interface AdminProductsProps {
  params: { adminPath: string };
}

export default async function AdminProductsPage({ params }: AdminProductsProps) {
  const products = await getProducts();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-steel/20 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-porcelain">Product Listings</h1>
          <p className="text-xs text-ash mt-0.5">
            Manage your mobile accessory catalog, inventory variants, and warranties.
          </p>
        </div>

        <Link
          href={`/${params.adminPath}/products/new`}
          className="bg-apple-blue hover:bg-apple-blue/90 text-white text-xs font-semibold px-4 py-2.5 rounded-pill flex items-center gap-1.5 transition-transform active:scale-95"
        >
          <Plus size={16} />
          <span>Add Product</span>
        </Link>
      </div>

      {/* Table (28px tiles and 1px keylines per §5.4) */}
      <div className="bg-carbon rounded-tile border border-steel/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-graphite text-ash uppercase font-semibold border-b border-steel/30">
              <tr>
                <th className="py-3 px-4">Item</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4">Warranty</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-steel/20">
              {products.map((p) => {
                const totalStock = p.variants.reduce((acc, v) => acc + (v.stock || 0), 0);
                return (
                  <tr key={p.id} className="hover:bg-steel/10 transition-colors">
                    {/* Item with Thumbnail */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center p-1 flex-shrink-0">
                          {p.images && p.images[0] ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={p.images[0]}
                              alt={p.name}
                              className="max-h-full max-w-full object-contain mix-blend-multiply"
                            />
                          ) : (
                            <span className="text-[10px] font-bold text-obsidian/60">PT</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/${params.adminPath}/products/${p.id}`}
                            className="font-semibold text-porcelain hover:text-electric-link transition-colors truncate block"
                          >
                            {p.name}
                          </Link>
                          <span className="text-[10px] text-ash font-mono">{p.slug}</span>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4 text-porcelain capitalize">
                      {p.category.replace("-", " ")}
                    </td>

                    {/* Price */}
                    <td className="py-3 px-4 font-semibold text-porcelain">
                      ₹{p.price}
                      {p.mrp > p.price && (
                        <span className="text-[10px] text-ash block line-through">₹{p.mrp}</span>
                      )}
                    </td>

                    {/* Stock */}
                    <td className="py-3 px-4">
                      <span
                        className={`font-semibold ${
                          totalStock <= 0
                            ? "text-error"
                            : totalStock <= 3
                            ? "text-warning"
                            : "text-success"
                        }`}
                      >
                        {totalStock} units
                      </span>
                      <span className="text-[10px] text-ash block">
                        ({p.variants.length} {p.variants.length === 1 ? "variant" : "variants"})
                      </span>
                    </td>

                    {/* Warranty */}
                    <td className="py-3 px-4">
                      {p.warranty.enabled ? (
                        <span className="bg-steel/60 text-optical-yellow text-[10px] font-medium px-2 py-0.5 rounded-pill inline-flex items-center gap-1">
                          <ShieldCheck size={10} />
                          {p.warranty.months}m
                        </span>
                      ) : (
                        <span className="text-ash/60">None</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-pill ${
                          p.isActive
                            ? "bg-success/20 text-success"
                            : "bg-error/20 text-error"
                        }`}
                      >
                        {p.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/products/${p.slug}`}
                          target="_blank"
                          title="View on Store"
                          className="p-1.5 text-ash hover:text-porcelain hover:bg-steel/30 rounded-full transition-colors"
                        >
                          <ExternalLink size={14} />
                        </Link>
                        <Link
                          href={`/${params.adminPath}/products/${p.id}`}
                          title="Edit Product"
                          className="p-1.5 text-ash hover:text-apple-blue hover:bg-steel/30 rounded-full transition-colors"
                        >
                          <Edit size={14} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
