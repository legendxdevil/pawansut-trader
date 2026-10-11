"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Trash2, ArrowLeft, Loader2, AlertCircle, CheckCircle2, ShieldCheck } from "lucide-react";
import type { Product, Category, ProductVariant, ProductSpec } from "@/types";

interface ProductFormProps {
  initialProduct?: Product;
  categories: Category[];
  adminPath: string;
}

export function ProductForm({ initialProduct, categories, adminPath }: ProductFormProps) {
  const router = useRouter();
  const isEditing = Boolean(initialProduct);

  const [name, setName] = useState(initialProduct?.name || "");
  const [slug, setSlug] = useState(initialProduct?.slug || "");
  const [category, setCategory] = useState(
    initialProduct?.category || (categories[0]?.slug || "chargers-adapters")
  );
  const [price, setPrice] = useState(initialProduct?.price ? String(initialProduct.price) : "");
  const [mrp, setMrp] = useState(initialProduct?.mrp ? String(initialProduct.mrp) : "");
  const [shortDescription, setShortDescription] = useState(initialProduct?.shortDescription || "");
  const [description, setDescription] = useState(initialProduct?.description || "");
  const [imageUrl, setImageUrl] = useState(initialProduct?.images?.[0] || "");
  const [tags, setTags] = useState(initialProduct?.tags?.join(", ") || "");

  // Variants state
  const [variants, setVariants] = useState<ProductVariant[]>(
    initialProduct?.variants && initialProduct.variants.length > 0
      ? initialProduct.variants
      : [{ id: "var-1", label: "Standard", stock: 10 }]
  );

  // Specs state
  const [specs, setSpecs] = useState<ProductSpec[]>(
    initialProduct?.specs && initialProduct.specs.length > 0
      ? initialProduct.specs
      : [{ label: "Brand Compatibility", value: "Universal" }]
  );

  // Warranty state (§16)
  const [warrantyEnabled, setWarrantyEnabled] = useState(
    initialProduct?.warranty?.enabled || false
  );
  const [warrantyMonths, setWarrantyMonths] = useState(
    initialProduct?.warranty?.months ? String(initialProduct.warranty.months) : "6"
  );
  const [warrantyNote, setWarrantyNote] = useState(initialProduct?.warranty?.note || "");

  // Flags
  const [isActive, setIsActive] = useState(initialProduct?.isActive ?? true);
  const [isFeatured, setIsFeatured] = useState(initialProduct?.isFeatured ?? false);
  const [isNew, setIsNew] = useState(initialProduct?.isNew ?? false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Auto-slugify on name change if not manually touched
  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEditing && !slug) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")
      );
    }
  };

  const handleAddVariant = () => {
    setVariants((prev) => [
      ...prev,
      {
        id: `var-${Date.now()}`,
        label: `Variant ${prev.length + 1}`,
        stock: 5,
      },
    ]);
  };

  const handleUpdateVariant = (
    idx: number,
    field: keyof ProductVariant,
    val: string | number | undefined
  ) => {
    setVariants((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: val };
      return copy;
    });
  };

  const handleRemoveVariant = (idx: number) => {
    if (variants.length <= 1) return;
    setVariants((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleAddSpec = () => {
    setSpecs((prev) => [...prev, { label: "", value: "" }]);
  };

  const handleUpdateSpec = (idx: number, field: "label" | "value", val: string) => {
    setSpecs((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: val };
      return copy;
    });
  };

  const handleRemoveSpec = (idx: number) => {
    setSpecs((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const priceNum = Number(price);
    const mrpNum = Number(mrp) || priceNum;

    if (mrpNum < priceNum) {
      setError("MRP must be greater than or equal to the selling price.");
      setLoading(false);
      return;
    }

    const payload = {
      name: name.trim(),
      slug: slug.trim().toLowerCase(),
      category,
      price: priceNum,
      mrp: mrpNum,
      shortDescription: shortDescription.trim() || undefined,
      description: description.trim(),
      images: imageUrl.trim() ? [imageUrl.trim()] : [],
      tags: tags
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean),
      variants: variants.map((v) => ({
        ...v,
        stock: Number(v.stock) || 0,
        priceOverride: v.priceOverride ? Number(v.priceOverride) : undefined,
      })),
      specs: specs.filter((s) => s.label.trim() && s.value.trim()),
      warranty: {
        enabled: warrantyEnabled,
        months: warrantyEnabled ? Number(warrantyMonths) || 0 : 0,
        note: warrantyNote.trim() || undefined,
      },
      isActive,
      isFeatured,
      isNew,
    };

    try {
      const url = isEditing
        ? `/api/admin/products/${initialProduct?.id}`
        : "/api/admin/products";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok || json.error) {
        setError(json.error?.message || "Failed to save product.");
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push(`/${adminPath}/products`);
          router.refresh();
        }, 1000);
      }
    } catch {
      setError("Network error while saving product.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!initialProduct || !confirm("Are you sure you want to delete this product?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/products/${initialProduct.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.push(`/${adminPath}/products`);
        router.refresh();
      } else {
        setError("Failed to delete product.");
      }
    } catch {
      setError("Network error during delete.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      <div className="flex items-center justify-between border-b border-steel/20 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href={`/${adminPath}/products`}
            className="p-1.5 text-ash hover:text-porcelain rounded-full hover:bg-steel/30"
          >
            <ArrowLeft size={18} />
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-porcelain">
            {isEditing ? `Edit: ${initialProduct?.name}` : "New Product Listing"}
          </h1>
        </div>

        {isEditing && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="text-error hover:bg-error/15 text-xs font-semibold px-3 py-1.5 rounded-pill flex items-center gap-1 transition-colors"
          >
            <Trash2 size={14} /> Delete
          </button>
        )}
      </div>

      {error && (
        <div className="bg-error/15 border border-error/40 text-error text-xs p-4 rounded-tile flex items-center gap-2">
          <AlertCircle size={16} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-success/15 border border-success/40 text-success text-xs p-4 rounded-tile flex items-center gap-2">
          <CheckCircle2 size={16} className="flex-shrink-0" />
          <span>Product saved successfully! Redirecting...</span>
        </div>
      )}

      {/* Main Details Card */}
      <div className="bg-carbon rounded-tile border border-steel/30 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-porcelain border-b border-steel/20 pb-2">
          General Information
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-medium text-porcelain">Product Name *</label>
            <input
              type="text"
              placeholder="e.g. 65W GaN Dual Port Charger"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
              className="w-full bg-[rgba(255,255,255,0.04)] text-porcelain px-4 py-2.5 rounded-pill border border-slate focus:border-apple-blue text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-porcelain">Slug (URL identifier) *</label>
            <input
              type="text"
              placeholder="65w-gan-dual-port-charger"
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase())}
              required
              className="w-full bg-[rgba(255,255,255,0.04)] text-porcelain px-4 py-2.5 rounded-pill border border-slate focus:border-apple-blue text-sm font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-porcelain">Category *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              aria-label="Product Category"
              className="w-full bg-[rgba(255,255,255,0.04)] text-porcelain px-4 py-2.5 rounded-pill border border-slate focus:border-apple-blue text-sm"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.slug} className="bg-carbon text-porcelain">
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-porcelain">Selling Price (₹) *</label>
            <input
              type="number"
              min={1}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              className="w-full bg-[rgba(255,255,255,0.04)] text-porcelain px-4 py-2.5 rounded-pill border border-slate focus:border-apple-blue text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-porcelain">MRP (₹) *</label>
            <input
              type="number"
              min={1}
              value={mrp}
              onChange={(e) => setMrp(e.target.value)}
              required
              className="w-full bg-[rgba(255,255,255,0.04)] text-porcelain px-4 py-2.5 rounded-pill border border-slate focus:border-apple-blue text-sm"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-medium text-ash">Image URL or Storage Path</label>
            <input
              type="text"
              placeholder="/sample/charger-30w.png or Firebase Storage URL"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full bg-[rgba(255,255,255,0.04)] text-porcelain px-4 py-2.5 rounded-pill border border-slate focus:border-apple-blue text-sm"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-medium text-ash">Short Description</label>
            <input
              type="text"
              placeholder="High speed PD fast charging with thermal protection"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              className="w-full bg-[rgba(255,255,255,0.04)] text-porcelain px-4 py-2.5 rounded-pill border border-slate focus:border-apple-blue text-sm"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-medium text-porcelain">Full Description *</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full bg-[rgba(255,255,255,0.04)] text-porcelain p-4 rounded-tile border border-slate focus:border-apple-blue text-sm resize-none"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-medium text-ash">Tags (comma separated)</label>
            <input
              type="text"
              placeholder="fast charging, gan, type-c"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full bg-[rgba(255,255,255,0.04)] text-porcelain px-4 py-2.5 rounded-pill border border-slate focus:border-apple-blue text-sm"
            />
          </div>
        </div>
      </div>

      {/* Variants Manager (§7.4) */}
      <div className="bg-carbon rounded-tile border border-steel/30 p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-steel/20 pb-2">
          <h2 className="text-sm font-semibold text-porcelain">Inventory Variants</h2>
          <button
            type="button"
            onClick={handleAddVariant}
            className="text-xs text-electric-link hover:underline flex items-center gap-1 font-medium"
          >
            <Plus size={14} /> Add Variant
          </button>
        </div>

        <div className="space-y-3">
          {variants.map((v, i) => (
            <div
              key={v.id || i}
              className="bg-graphite/60 border border-steel/30 rounded-tile p-3 flex flex-wrap items-center gap-3"
            >
              <div className="flex-1 min-w-[140px] space-y-1">
                <span className="text-[10px] text-ash uppercase font-semibold">Variant Label</span>
                <input
                  type="text"
                  placeholder="e.g. 1 Meter / Black"
                  value={v.label}
                  onChange={(e) => handleUpdateVariant(i, "label", e.target.value)}
                  required
                  className="w-full bg-[rgba(255,255,255,0.04)] text-porcelain px-3 py-1.5 rounded-pill border border-slate text-xs"
                />
              </div>

              <div className="w-24 space-y-1">
                <span className="text-[10px] text-ash uppercase font-semibold">Stock Qty</span>
                <input
                  type="number"
                  min={0}
                  value={v.stock}
                  onChange={(e) => handleUpdateVariant(i, "stock", Number(e.target.value))}
                  required
                  className="w-full bg-[rgba(255,255,255,0.04)] text-porcelain px-3 py-1.5 rounded-pill border border-slate text-xs"
                />
              </div>

              <div className="w-28 space-y-1">
                <span className="text-[10px] text-ash uppercase font-semibold">Price Override</span>
                <input
                  type="number"
                  min={1}
                  placeholder="Optional"
                  value={v.priceOverride || ""}
                  onChange={(e) =>
                    handleUpdateVariant(
                      i,
                      "priceOverride",
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                  className="w-full bg-[rgba(255,255,255,0.04)] text-porcelain px-3 py-1.5 rounded-pill border border-slate text-xs"
                />
              </div>

              {variants.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveVariant(i)}
                  className="text-ash hover:text-error p-1.5 mt-4"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Warranty Configuration (§16) */}
      <div className="bg-carbon rounded-tile border border-steel/30 p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-steel/20 pb-2">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-optical-yellow" />
            <h2 className="text-sm font-semibold text-porcelain">Warranty Protection</h2>
          </div>
          <label className="flex items-center gap-2 cursor-pointer text-xs text-porcelain select-none">
            <input
              type="checkbox"
              checked={warrantyEnabled}
              onChange={(e) => setWarrantyEnabled(e.target.checked)}
              className="w-4 h-4 rounded text-apple-blue bg-graphite border-steel"
            />
            <span className="font-semibold">Enable Warranty</span>
          </label>
        </div>

        {warrantyEnabled && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-porcelain">Warranty Duration (Months)</label>
              <input
                type="number"
                min={1}
                max={60}
                value={warrantyMonths}
                onChange={(e) => setWarrantyMonths(e.target.value)}
                required={warrantyEnabled}
                className="w-full bg-[rgba(255,255,255,0.04)] text-porcelain px-4 py-2 rounded-pill border border-slate focus:border-apple-blue text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-ash">Warranty Terms / Note</label>
              <input
                type="text"
                placeholder="Covers manufacturing defects; physical card mandatory"
                value={warrantyNote}
                onChange={(e) => setWarrantyNote(e.target.value)}
                className="w-full bg-[rgba(255,255,255,0.04)] text-porcelain px-4 py-2 rounded-pill border border-slate focus:border-apple-blue text-sm"
              />
            </div>
          </div>
        )}
      </div>

      {/* Technical Specifications */}
      <div className="bg-carbon rounded-tile border border-steel/30 p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-steel/20 pb-2">
          <h2 className="text-sm font-semibold text-porcelain">Technical Specifications</h2>
          <button
            type="button"
            onClick={handleAddSpec}
            className="text-xs text-electric-link hover:underline flex items-center gap-1 font-medium"
          >
            <Plus size={14} /> Add Spec Row
          </button>
        </div>

        <div className="space-y-2">
          {specs.map((s, i) => (
            <div key={i} className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Spec Label (e.g. Wattage)"
                value={s.label}
                onChange={(e) => handleUpdateSpec(i, "label", e.target.value)}
                className="w-1/3 bg-[rgba(255,255,255,0.04)] text-porcelain px-3 py-1.5 rounded-pill border border-slate text-xs"
              />
              <input
                type="text"
                placeholder="Value (e.g. 65W Max)"
                value={s.value}
                onChange={(e) => handleUpdateSpec(i, "value", e.target.value)}
                className="flex-1 bg-[rgba(255,255,255,0.04)] text-porcelain px-3 py-1.5 rounded-pill border border-slate text-xs"
              />
              <button
                type="button"
                onClick={() => handleRemoveSpec(i)}
                className="text-ash hover:text-error p-1"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Visibility Flags */}
      <div className="bg-carbon rounded-tile border border-steel/30 p-6 flex flex-wrap gap-6 text-xs">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="w-4 h-4 rounded text-apple-blue bg-graphite border-steel"
          />
          <span className="font-semibold text-porcelain">Active (Visible in Catalog)</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={isFeatured}
            onChange={(e) => setIsFeatured(e.target.checked)}
            className="w-4 h-4 rounded text-apple-blue bg-graphite border-steel"
          />
          <span className="font-semibold text-porcelain">Featured Product (Home Spotlight)</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={isNew}
            onChange={(e) => setIsNew(e.target.checked)}
            className="w-4 h-4 rounded text-apple-blue bg-graphite border-steel"
          />
          <span className="font-semibold text-copper-new">New Arrival Badge</span>
        </label>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-apple-blue hover:bg-apple-blue/90 disabled:bg-steel/60 text-white font-semibold text-sm py-3.5 rounded-pill transition-transform active:scale-[0.98] flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            <span>Saving Product & Revalidating...</span>
          </>
        ) : (
          <span>{isEditing ? "Save Changes" : "Create Product Listing"}</span>
        )}
      </button>
    </form>
  );
}
