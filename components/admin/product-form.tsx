"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Plus,
  Trash2,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Upload,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Star,
} from "lucide-react";
import type { Product, Category, ProductVariant, ProductSpec } from "@/types";

interface ProductFormProps {
  initialProduct?: Product;
  categories: Category[];
  adminPath: string;
}

/**
 * Client-side canvas image compression helper per §12.3 & spec requirements:
 * Scales image to maximum ~1200px width/height and compresses to WebP (quality 0.85, target <= 1MB).
 */
async function compressImage(file: File): Promise<File> {
  return new Promise((resolve) => {
    if (!file.type.startsWith("image/")) {
      resolve(file);
      return;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const maxDim = 1200;
      let { width, height } = img;

      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(file);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      const outputType = "image/webp";
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          const compressedFile = new File(
            [blob],
            file.name.replace(/\.[^/.]+$/, "") + ".webp",
            { type: outputType, lastModified: Date.now() }
          );
          resolve(compressedFile);
        },
        outputType,
        0.85
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file);
    };

    img.src = objectUrl;
  });
}

export function ProductForm({ initialProduct, categories, adminPath }: ProductFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
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
  
  // Images array state (supports multiple images + reordering)
  const [images, setImages] = useState<string[]>(
    initialProduct?.images && initialProduct.images.length > 0
      ? initialProduct.images
      : []
  );
  const [manualImageUrl, setManualImageUrl] = useState("");

  // Uploading status
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadError(null);
    setUploading(true);

    try {
      const uploadedUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgress(`Compressing ${file.name} (${i + 1}/${files.length})...`);
        const compressed = await compressImage(file);

        setUploadProgress(`Uploading ${file.name} to ImgBB (${i + 1}/${files.length})...`);
        const formData = new FormData();
        formData.append("image", compressed);

        const res = await fetch("/api/admin/upload-image", {
          method: "POST",
          body: formData,
        });

        const json = await res.json();
        if (!res.ok) {
          throw new Error(json.error?.message || "Failed to upload image to ImgBB");
        }

        const newUrl = json.url || json.thumbUrl;
        if (newUrl) {
          uploadedUrls.push(newUrl);
        }
      }

      setImages((prev) => [...prev, ...uploadedUrls]);
      setUploadProgress("Image(s) uploaded successfully!");
      setTimeout(() => setUploadProgress(null), 3000);
    } catch (err) {
      setUploadError((err as Error).message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleMoveImage = (index: number, direction: "left" | "right") => {
    setImages((prev) => {
      const targetIndex = direction === "left" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddManualImage = () => {
    const trimmed = manualImageUrl.trim();
    if (!trimmed) return;
    setImages((prev) => [...prev, trimmed]);
    setManualImageUrl("");
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
      images: images.filter(Boolean),
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
      setError("Network or server error while saving product.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl pb-16">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-steel/20 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href={`/${adminPath}/products`}
            className="p-2 rounded-full hover:bg-carbon text-ash hover:text-porcelain transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-porcelain">
              {isEditing ? `Edit Product: ${initialProduct?.name}` : "Create New Product"}
            </h1>
            <p className="text-xs text-ash">
              Manage product details, multiple images, stock variants, and physical warranty.
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || uploading}
          className="bg-apple-blue hover:bg-apple-blue/90 disabled:opacity-50 text-white font-medium text-xs px-6 py-2.5 rounded-pill transition-transform active:scale-95 flex items-center gap-2"
        >
          {loading && <Loader2 size={14} className="animate-spin" />}
          {isEditing ? "Save Changes" : "Publish Product"}
        </button>
      </div>

      {error && (
        <div className="bg-error/10 border border-error/30 text-error rounded-tile p-4 text-xs flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-success/10 border border-success/30 text-success rounded-tile p-4 text-xs flex items-center gap-2">
          <CheckCircle2 size={16} className="shrink-0" />
          <span>Product saved successfully. Redirecting to catalog...</span>
        </div>
      )}

      {/* SECTION 1: Basic Information */}
      <div className="bg-carbon rounded-tile border border-steel/20 p-6 space-y-4">
        <h2 className="text-sm font-semibold tracking-tight text-porcelain border-b border-steel/20 pb-2">
          Basic Information
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-medium text-porcelain">
              Product Name <span className="text-red-500">*</span>
            </label>
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
            <label className="text-xs font-medium text-porcelain">
              Slug (URL identifier) <span className="text-red-500">*</span>
            </label>
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
            <label className="text-xs font-medium text-porcelain">
              Category <span className="text-red-500">*</span>
            </label>
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
            <label className="text-xs font-medium text-porcelain">
              Selling Price (₹) <span className="text-red-500">*</span>
            </label>
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
            <label className="text-xs font-medium text-porcelain">
              MRP (₹) <span className="text-red-500">*</span>
            </label>
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
            <label className="text-xs font-medium text-ash">Short Description</label>
            <input
              type="text"
              placeholder="One-line summary for cards and search results"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              className="w-full bg-[rgba(255,255,255,0.04)] text-porcelain px-4 py-2.5 rounded-pill border border-slate focus:border-apple-blue text-sm"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-medium text-porcelain">
              Full Product Overview / Description <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              placeholder="Detailed product specifications, compatibility, and features..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full bg-[rgba(255,255,255,0.04)] text-porcelain p-4 rounded-tile border border-slate focus:border-apple-blue text-sm"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-medium text-ash">Search Tags (comma-separated)</label>
            <input
              type="text"
              placeholder="fast charger, gan, type-c, pd, 65w"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full bg-[rgba(255,255,255,0.04)] text-porcelain px-4 py-2.5 rounded-pill border border-slate focus:border-apple-blue text-sm"
            />
          </div>
        </div>
      </div>

      {/* SECTION 2: Product Images (ImgBB API v1 Integration) */}
      <div className="bg-carbon rounded-tile border border-steel/20 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-steel/20 pb-2">
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-porcelain flex items-center gap-2">
              <ImageIcon size={16} className="text-apple-blue" />
              Product Images ({images.length})
            </h2>
            <p className="text-[11px] text-ash">
              Uploaded to ImgBB with client-side compression (max 1200px, WebP, $\le$ 1MB). First image serves as primary cover.
            </p>
          </div>

          {/* Hidden File Input (accept="image/*" for camera/gallery per §STEP 4) */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileUpload}
            className="hidden"
          />

          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-pill bg-white text-black text-xs font-semibold hover:bg-neutral-200 transition-colors shrink-0 disabled:opacity-50 min-h-[44px]"
          >
            {uploading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Upload size={14} />
            )}
            <span>Upload from Device</span>
          </button>
        </div>

        {/* Upload Status / Progress Banner */}
        {uploadProgress && (
          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 flex items-center gap-2">
            <Loader2 size={14} className="animate-spin shrink-0" />
            <span>{uploadProgress}</span>
          </div>
        )}

        {uploadError && (
          <div className="p-3 rounded-xl bg-red-900/20 border border-red-800/40 text-xs text-red-300 flex items-center gap-2">
            <AlertCircle size={14} className="shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}

        {/* Uploaded Images List with Reordering */}
        {images.length === 0 ? (
          <div className="p-8 text-center bg-[rgba(255,255,255,0.02)] rounded-tile border border-dashed border-slate text-ash text-xs space-y-1">
            <p>No product images added yet.</p>
            <p className="text-[11px] text-neutral-500">
              Click &quot;Upload from Device&quot; to upload compressed product shots to ImgBB, or paste an image URL below.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
            {images.map((imgUrl, idx) => (
              <div
                key={`${imgUrl}-${idx}`}
                className="group relative rounded-tile bg-black/40 border border-steel/30 p-2 flex flex-col justify-between space-y-2 overflow-hidden"
              >
                {/* Image Preview Canvas */}
                <div className="aspect-square w-full rounded-xl bg-white/5 flex items-center justify-center overflow-hidden relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imgUrl}
                    alt={`Product image ${idx + 1}`}
                    className="object-contain max-h-full max-w-full"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                  {idx === 0 && (
                    <span className="absolute top-1.5 left-1.5 bg-apple-blue text-white text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                      <Star size={10} className="fill-white" />
                      Cover
                    </span>
                  )}
                </div>

                {/* Controls: Reorder Left/Right and Delete (Touch-friendly 36px+ tap area) */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveImage(idx, "left")}
                      title="Move left (higher priority)"
                      className="p-2 min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg bg-carbon hover:bg-neutral-800 disabled:opacity-30 text-ash hover:text-porcelain"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      type="button"
                      disabled={idx === images.length - 1}
                      onClick={() => handleMoveImage(idx, "right")}
                      title="Move right"
                      className="p-2 min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg bg-carbon hover:bg-neutral-800 disabled:opacity-30 text-ash hover:text-porcelain"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    title="Remove image"
                    className="p-2 min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg bg-carbon hover:bg-red-950/40 text-ash hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Manual Image URL Input fallback */}
        <div className="pt-2 flex items-center gap-2">
          <input
            type="url"
            placeholder="Or paste direct image URL (e.g. https://i.ibb.co/... or /sample/...)"
            value={manualImageUrl}
            onChange={(e) => setManualImageUrl(e.target.value)}
            className="flex-1 bg-[rgba(255,255,255,0.04)] text-porcelain px-4 py-2 rounded-pill border border-slate focus:border-apple-blue text-xs font-mono"
          />
          <button
            type="button"
            onClick={handleAddManualImage}
            className="px-4 py-2 rounded-pill bg-carbon hover:bg-neutral-800 text-porcelain text-xs font-medium border border-steel/30 shrink-0"
          >
            Add URL
          </button>
        </div>
      </div>

      {/* SECTION 3: Inventory Variants */}
      <div className="bg-carbon rounded-tile border border-steel/20 p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-steel/20 pb-2">
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-porcelain">
              Variants &amp; Inventory Stock
            </h2>
            <p className="text-[11px] text-ash">
              Define product options (e.g., Color, Length, Storage) and live stock counts.
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddVariant}
            className="text-apple-blue hover:text-apple-blue/80 text-xs font-medium flex items-center gap-1"
          >
            <Plus size={14} /> Add Variant
          </button>
        </div>

        <div className="space-y-3">
          {variants.map((v, idx) => (
            <div
              key={v.id || idx}
              className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center bg-[rgba(255,255,255,0.02)] p-3 rounded-tile border border-slate"
            >
              <div className="sm:col-span-5 space-y-1">
                <label className="text-[10px] text-ash uppercase tracking-wider">
                  Option Label *
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1 Meter - Black"
                  value={v.label}
                  onChange={(e) => handleUpdateVariant(idx, "label", e.target.value)}
                  required
                  className="w-full bg-[rgba(255,255,255,0.04)] text-porcelain px-3 py-1.5 rounded-pill border border-slate text-xs"
                />
              </div>

              <div className="sm:col-span-3 space-y-1">
                <label className="text-[10px] text-ash uppercase tracking-wider">
                  Stock Units *
                </label>
                <input
                  type="number"
                  min={0}
                  placeholder="10"
                  value={v.stock}
                  onChange={(e) => handleUpdateVariant(idx, "stock", Number(e.target.value))}
                  required
                  className="w-full bg-[rgba(255,255,255,0.04)] text-porcelain px-3 py-1.5 rounded-pill border border-slate text-xs"
                />
              </div>

              <div className="sm:col-span-3 space-y-1">
                <label className="text-[10px] text-ash uppercase tracking-wider">
                  Price Override (Optional ₹)
                </label>
                <input
                  type="number"
                  min={0}
                  placeholder="Leave empty for base price"
                  value={v.priceOverride || ""}
                  onChange={(e) => handleUpdateVariant(idx, "priceOverride", e.target.value)}
                  className="w-full bg-[rgba(255,255,255,0.04)] text-porcelain px-3 py-1.5 rounded-pill border border-slate text-xs"
                />
              </div>

              <div className="sm:col-span-1 flex justify-end pt-4 sm:pt-0">
                <button
                  type="button"
                  disabled={variants.length <= 1}
                  onClick={() => handleRemoveVariant(idx)}
                  className="text-ash hover:text-error disabled:opacity-30 p-1.5 rounded-full transition-colors"
                  title="Remove Variant"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 4: Physical Warranty (§16) */}
      <div className="bg-carbon rounded-tile border border-steel/20 p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-steel/20 pb-2">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-apple-blue" />
            <div>
              <h2 className="text-sm font-semibold tracking-tight text-porcelain">
                Physical Warranty Configuration (§16)
              </h2>
              <p className="text-[11px] text-ash">
                Warranty products require hand-over of a physical serialized warranty card (e.g., PT-W-0001).
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={warrantyEnabled}
              onChange={(e) => setWarrantyEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-apple-blue"></div>
          </label>
        </div>

        {warrantyEnabled && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-porcelain">
                Warranty Period (Months) *
              </label>
              <input
                type="number"
                min={1}
                max={60}
                value={warrantyMonths}
                onChange={(e) => setWarrantyMonths(e.target.value)}
                required={warrantyEnabled}
                className="w-full bg-[rgba(255,255,255,0.04)] text-porcelain px-4 py-2.5 rounded-pill border border-slate focus:border-apple-blue text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-ash">Warranty Terms / Note</label>
              <input
                type="text"
                placeholder="e.g. Covers capacitor and charging faults. Physical card mandatory."
                value={warrantyNote}
                onChange={(e) => setWarrantyNote(e.target.value)}
                className="w-full bg-[rgba(255,255,255,0.04)] text-porcelain px-4 py-2.5 rounded-pill border border-slate focus:border-apple-blue text-sm"
              />
            </div>
          </div>
        )}
      </div>

      {/* SECTION 5: Technical Specifications Table */}
      <div className="bg-carbon rounded-tile border border-steel/20 p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-steel/20 pb-2">
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-porcelain">
              Technical Specifications Table
            </h2>
            <p className="text-[11px] text-ash">
              Key-value pairs rendered in the technical specs table on the product details page.
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddSpec}
            className="text-apple-blue hover:text-apple-blue/80 text-xs font-medium flex items-center gap-1"
          >
            <Plus size={14} /> Add Spec
          </button>
        </div>

        <div className="space-y-3">
          {specs.map((s, idx) => (
            <div
              key={idx}
              className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center bg-[rgba(255,255,255,0.02)] p-3 rounded-tile border border-slate"
            >
              <div className="sm:col-span-5 space-y-1">
                <input
                  type="text"
                  placeholder="Label (e.g. Output Wattage)"
                  value={s.label}
                  onChange={(e) => handleUpdateSpec(idx, "label", e.target.value)}
                  className="w-full bg-[rgba(255,255,255,0.04)] text-porcelain px-3 py-1.5 rounded-pill border border-slate text-xs"
                />
              </div>

              <div className="sm:col-span-6 space-y-1">
                <input
                  type="text"
                  placeholder="Value (e.g. 65W Max USB-C PD 3.0)"
                  value={s.value}
                  onChange={(e) => handleUpdateSpec(idx, "value", e.target.value)}
                  className="w-full bg-[rgba(255,255,255,0.04)] text-porcelain px-3 py-1.5 rounded-pill border border-slate text-xs"
                />
              </div>

              <div className="sm:col-span-1 flex justify-end">
                <button
                  type="button"
                  onClick={() => handleRemoveSpec(idx)}
                  className="text-ash hover:text-error p-1.5 rounded-full transition-colors"
                  title="Remove Spec"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 6: Visibility & Badges */}
      <div className="bg-carbon rounded-tile border border-steel/20 p-6 space-y-4">
        <h2 className="text-sm font-semibold tracking-tight text-porcelain border-b border-steel/20 pb-2">
          Visibility &amp; Promotional Badges
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <label className="flex items-center gap-3 p-3 rounded-tile bg-[rgba(255,255,255,0.02)] border border-slate cursor-pointer">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 rounded text-apple-blue bg-carbon border-slate"
            />
            <div>
              <p className="text-xs font-medium text-porcelain">Active in Catalog</p>
              <p className="text-[10px] text-ash">Visible on public store pages</p>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 rounded-tile bg-[rgba(255,255,255,0.02)] border border-slate cursor-pointer">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="w-4 h-4 rounded text-apple-blue bg-carbon border-slate"
            />
            <div>
              <p className="text-xs font-medium text-porcelain">Featured Badge</p>
              <p className="text-[10px] text-ash">Highlighted in home showcase</p>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 rounded-tile bg-[rgba(255,255,255,0.02)] border border-slate cursor-pointer">
            <input
              type="checkbox"
              checked={isNew}
              onChange={(e) => setIsNew(e.target.checked)}
              className="w-4 h-4 rounded text-apple-blue bg-carbon border-slate"
            />
            <div>
              <p className="text-xs font-medium text-porcelain">New Arrival Badge</p>
              <p className="text-[10px] text-ash">Displays &quot;New&quot; indicator</p>
            </div>
          </label>
        </div>
      </div>

      {/* Sticky Bottom Action Bar (§STEP 4) */}
      <div className="sticky bottom-0 bg-carbon/95 backdrop-blur-md -mx-3.5 sm:-mx-6 -mb-3.5 sm:-mb-6 p-4 border-t border-steel/30 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] z-30 flex items-center justify-between gap-3 shadow-2xl">
        <Link
          href={`/${adminPath}/products`}
          className="px-5 py-2.5 rounded-pill text-xs font-medium text-ash hover:text-porcelain transition-colors min-h-[44px] flex items-center"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={loading || uploading}
          className="bg-apple-blue hover:bg-apple-blue/90 disabled:opacity-50 text-white font-semibold text-xs px-6 sm:px-8 py-2.5 rounded-pill transition-transform active:scale-95 flex items-center gap-2 min-h-[44px]"
        >
          {loading && <Loader2 size={14} className="animate-spin" />}
          <span>{isEditing ? "Save Changes" : "Publish Product"}</span>
        </button>
      </div>
    </form>
  );
}
