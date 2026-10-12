import React from "react";
import Link from "next/link";
import { Plus, ShieldCheck, Edit, ExternalLink, PackageOpen } from "lucide-react";
import { getProducts } from "@/lib/data/products";

interface AdminProductsProps {
  params: { adminPath: string };
}

export default async function AdminProductsPage({ params }: AdminProductsProps) {
  const products = await getProducts({ includeInactive: true });

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
          className="bg-apple-blue hover:bg-apple-blue/90 text-white text-xs font-semibold px-4 py-2.5 rounded-pill flex items-center gap-1.5 transition-transform active:scale-95 shadow-sm"
        >
          <Plus size={16} />
          <span>Add Product</span>
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="bg-carbon rounded-tile border border-steel/20 p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-apple-blue/10 border border-apple-blue/20 flex items-center justify-center mx-auto text-apple-blue">
            <PackageOpen size={32} />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-bold text-porcelain">No products in Firestore yet</h2>
            <p className="text-xs text-ash max-w-sm mx-auto">
              Your catalog is currently empty. Add your first phone charger, cable, audio gear, or tempered glass.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href={`/${params.adminPath}/products/new`}
              className="inline-flex items-center gap-2 bg-apple-blue hover:bg-apple-blue/90 text-white text-xs font-semibold px-6 py-2.5 rounded-pill transition-transform active:scale-95"
            >
              <Plus size={14} />
              <span>Add Your First Product</span>
            </Link>
          </div>
        </div>
      ) : (
        /* Container: Mobile Cards (< md) + Desktop Table (md+) */
        <div className="bg-carbon rounded-tile border border-steel/30 overflow-hidden">
        {/* Mobile Cards (< md) */}
        <div className="md:hidden divide-y divide-steel/20">
          {products.map((p) => {
            const totalStock = p.variants.reduce((acc, v) => acc + (v.stock || 0), 0);
            return (
              <div key={p.id} className="p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-14 h-14 bg-white rounded-lg flex items-center justify-center p-1.5 flex-shrink-0">
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
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/${params.adminPath}/products/${p.id}`}
                        className="font-semibold text-sm text-porcelain hover:text-electric-link line-clamp-2"
                      >
                        {p.name}
                      </Link>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-pill shrink-0 ${
                          p.isActive
                            ? "bg-success/20 text-success"
                            : "bg-error/20 text-error"
                        }`}
                      >
                        {p.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <span className="text-[11px] text-ash capitalize block mt-0.5">
                      {p.category.replace("-", " ")}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <div>
                    <span className="text-base font-bold text-porcelain">₹{p.price}</span>
                    {p.mrp > p.price && (
                      <span className="text-[11px] text-ash line-through ml-1.5">₹{p.mrp}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`font-semibold ${
                        totalStock <= 0
                          ? "text-error"
                          : totalStock <= 3
                          ? "text-warning"
                          : "text-success"
                      }`}
                    >
                      {totalStock} in stock
                    </span>

                    {p.warranty.enabled && (
                      <span className="bg-steel/60 text-optical-yellow text-[10px] font-medium px-2 py-0.5 rounded-pill inline-flex items-center gap-1">
                        <ShieldCheck size={10} />
                        {p.warranty.months}m
                      </span>
                    )}
                  </div>
                </div>

                {/* 44px Action buttons */}
                <div className="flex items-center gap-2 pt-2 border-t border-steel/15">
                  <Link
                    href={`/${params.adminPath}/products/${p.id}`}
                    className="flex-1 bg-apple-blue hover:bg-apple-blue/90 text-white text-xs font-semibold py-2.5 px-3 rounded-pill flex items-center justify-center gap-1.5 min-h-[44px] transition-colors"
                  >
                    <Edit size={14} />
                    <span>Edit Listing</span>
                  </Link>
                  <Link
                    href={`/products/${p.slug}`}
                    target="_blank"
                    className="bg-steel/40 hover:bg-steel text-porcelain text-xs font-medium py-2.5 px-4 rounded-pill flex items-center justify-center gap-1.5 min-h-[44px] transition-colors"
                  >
                    <ExternalLink size={14} />
                    <span>View</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop Table (md+) */}
        <div className="hidden md:block overflow-x-auto">
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
      )}
    </div>
  );
}
