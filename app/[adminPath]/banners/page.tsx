/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Plus,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Upload,
  ArrowUp,
  ArrowDown,
  Trash2,
  Edit2,
  Eye,
  Smartphone,
  Monitor,
  X,
  Link as LinkIcon,
} from "lucide-react";
import type { Banner } from "@/types";

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [mobileImageUrl, setMobileImageUrl] = useState("");
  const [alt, setAlt] = useState("");
  const [link, setLink] = useState("");
  const [order, setOrder] = useState("1");
  const [isActive, setIsActive] = useState(true);

  // Upload state
  const [uploadingDesktop, setUploadingDesktop] = useState(false);
  const [uploadingMobile, setUploadingMobile] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const desktopFileInputRef = useRef<HTMLInputElement>(null);
  const mobileFileInputRef = useRef<HTMLInputElement>(null);

  // Form Submission State
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Preview Mode: desktop vs mobile
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/banners");
      const json = await res.json();
      if (json.data) {
        setBanners(json.data);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleFileUpload = async (file: File, target: "desktop" | "mobile") => {
    const isDesk = target === "desktop";
    if (isDesk) {
      setUploadingDesktop(true);
    } else {
      setUploadingMobile(true);
    }
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload-image", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || "Failed to upload image");
      }

      const uploadedUrl = json.url || json.thumbUrl;
      if (uploadedUrl) {
        if (isDesk) {
          setImageUrl(uploadedUrl);
        } else {
          setMobileImageUrl(uploadedUrl);
        }
      }
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      if (isDesk) {
        setUploadingDesktop(false);
      } else {
        setUploadingMobile(false);
      }
      if (isDesk && desktopFileInputRef.current) {
        desktopFileInputRef.current.value = "";
      }
      if (!isDesk && mobileFileInputRef.current) {
        mobileFileInputRef.current.value = "";
      }
    }
  };

  const handleEdit = (banner: Banner) => {
    setEditingId(banner.id);
    setImageUrl(banner.imageUrl);
    setMobileImageUrl(banner.mobileImageUrl || "");
    setAlt(banner.alt);
    setLink(banner.link || "");
    setOrder(String(banner.order));
    setIsActive(banner.isActive);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setImageUrl("");
    setMobileImageUrl("");
    setAlt("");
    setLink("");
    setOrder(String(banners.length + 1));
    setIsActive(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    if (!imageUrl.trim()) {
      setError("Desktop banner image URL is required");
      setSaving(false);
      return;
    }

    if (!alt.trim()) {
      setError("Alt text is required for accessibility");
      setSaving(false);
      return;
    }

    try {
      const payload = {
        imageUrl: imageUrl.trim(),
        mobileImageUrl: mobileImageUrl.trim() || undefined,
        alt: alt.trim(),
        link: link.trim() || undefined,
        isActive,
        order: Number(order) || 1,
      };

      const url = editingId ? `/api/admin/banners/${editingId}` : "/api/admin/banners";
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || json.error) {
        setError(json.error?.message || "Failed to save banner");
      } else {
        setSuccess(editingId ? "Banner updated successfully!" : "Banner added successfully!");
        handleCancelEdit();
        fetchBanners();
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch {
      setError("Network error while saving banner");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this hero banner?")) return;
    try {
      const res = await fetch(`/api/admin/banners/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchBanners();
      }
    } catch {
      // Ignore
    }
  };

  const handleToggleActive = async (banner: Banner) => {
    try {
      await fetch(`/api/admin/banners/${banner.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !banner.isActive }),
      });
      fetchBanners();
    } catch {
      // Ignore
    }
  };

  const handleMoveOrder = async (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= banners.length) return;

    const currentBanner = banners[index];
    const targetBanner = banners[targetIdx];

    try {
      // Swap their orders
      await Promise.all([
        fetch(`/api/admin/banners/${currentBanner.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: targetBanner.order }),
        }),
        fetch(`/api/admin/banners/${targetBanner.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: currentBanner.order }),
        }),
      ]);
      fetchBanners();
    } catch {
      // Ignore
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-porcelain">Hero Slider Banners</h1>
        <p className="text-xs text-ash mt-0.5">
          Manage full-bleed interactive picture carousel on the customer storefront.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Column (5 cols) */}
        <div className="lg:col-span-5 bg-carbon rounded-tile border border-steel/30 p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-steel/20 pb-3">
            <h2 className="text-sm font-semibold text-porcelain flex items-center gap-2">
              <Plus size={16} className="text-apple-blue" />
              <span>{editingId ? "Edit Hero Banner" : "Add New Hero Banner"}</span>
            </h2>
            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="text-xs text-ash hover:text-white flex items-center gap-1"
              >
                <X size={12} />
                Cancel
              </button>
            )}
          </div>

          {error && (
            <div className="bg-error/15 border border-error/30 text-error text-xs p-3 rounded-tile flex items-center gap-2">
              <AlertCircle size={14} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-success/15 border border-success/30 text-success text-xs p-3 rounded-tile flex items-center gap-2">
              <CheckCircle2 size={14} className="flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {uploadError && (
            <div className="bg-error/15 border border-error/30 text-error text-xs p-3 rounded-tile flex items-center gap-2">
              <AlertCircle size={14} className="flex-shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            {/* Desktop Image */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-porcelain">
                  Desktop Image URL *
                </label>
                <span className="text-[11px] text-ash font-mono">1920x720 recommended</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://... (1920x720)"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  required
                  className="flex-1 bg-[rgba(255,255,255,0.04)] text-porcelain px-3 py-2.5 rounded-pill border border-slate focus:border-apple-blue text-base sm:text-xs placeholder:text-ash"
                />
                <input
                  ref={desktopFileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFileUpload(f, "desktop");
                  }}
                />
                <button
                  type="button"
                  disabled={uploadingDesktop}
                  onClick={() => desktopFileInputRef.current?.click()}
                  className="bg-steel/40 hover:bg-steel/70 text-porcelain px-3 py-2.5 rounded-pill text-xs flex items-center gap-1.5 min-h-[44px] shrink-0"
                >
                  {uploadingDesktop ? (
                    <Loader2 size={14} className="animate-spin text-apple-blue" />
                  ) : (
                    <Upload size={14} />
                  )}
                  <span>Upload</span>
                </button>
              </div>
              <p className="text-[11px] text-ash">
                Shown on screens ≥ 768px. Upload via ImgBB or enter direct image URL.
              </p>
            </div>

            {/* Mobile Image */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-porcelain">
                  Mobile Image URL (Optional)
                </label>
                <span className="text-[11px] text-ash font-mono">1080x1080 or 4:3</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://... (1080x1080 or 4:3)"
                  value={mobileImageUrl}
                  onChange={(e) => setMobileImageUrl(e.target.value)}
                  className="flex-1 bg-[rgba(255,255,255,0.04)] text-porcelain px-3 py-2.5 rounded-pill border border-slate focus:border-apple-blue text-base sm:text-xs placeholder:text-ash"
                />
                <input
                  ref={mobileFileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFileUpload(f, "mobile");
                  }}
                />
                <button
                  type="button"
                  disabled={uploadingMobile}
                  onClick={() => mobileFileInputRef.current?.click()}
                  className="bg-steel/40 hover:bg-steel/70 text-porcelain px-3 py-2.5 rounded-pill text-xs flex items-center gap-1.5 min-h-[44px] shrink-0"
                >
                  {uploadingMobile ? (
                    <Loader2 size={14} className="animate-spin text-apple-blue" />
                  ) : (
                    <Upload size={14} />
                  )}
                  <span>Upload</span>
                </button>
              </div>
              <p className="text-[11px] text-ash">
                Shown on screens under 768px. If blank, desktop image is used on mobile.
              </p>
            </div>

            {/* Alt text */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-porcelain">Alt Description *</label>
              <input
                type="text"
                placeholder="e.g. Ultra-Fast 65W GaN Chargers Collection"
                value={alt}
                onChange={(e) => setAlt(e.target.value)}
                required
                className="w-full bg-[rgba(255,255,255,0.04)] text-porcelain px-4 py-2.5 rounded-pill border border-slate focus:border-apple-blue text-base sm:text-xs placeholder:text-ash"
              />
            </div>

            {/* Link */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-porcelain">
                Destination Link (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. /category/chargers-adapters or /products"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                className="w-full bg-[rgba(255,255,255,0.04)] text-porcelain px-4 py-2.5 rounded-pill border border-slate focus:border-apple-blue text-base sm:text-xs font-mono placeholder:text-ash"
              />
            </div>

            {/* Order & Status */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-porcelain">Display Order</label>
                <input
                  type="number"
                  min={1}
                  value={order}
                  onChange={(e) => setOrder(e.target.value)}
                  required
                  className="w-full bg-[rgba(255,255,255,0.04)] text-porcelain px-4 py-2.5 rounded-pill border border-slate focus:border-apple-blue text-base sm:text-xs"
                />
              </div>

              <div className="space-y-1.5 flex flex-col justify-end">
                <label className="flex items-center gap-2 cursor-pointer py-3 text-xs text-porcelain">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-apple-blue bg-graphite border-steel/50 focus:ring-apple-blue"
                  />
                  <span>Active in Slider</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-apple-blue hover:bg-apple-blue/90 disabled:bg-steel/60 text-white font-semibold text-xs py-3 rounded-pill transition-transform active:scale-95 flex items-center justify-center gap-2 min-h-[44px]"
            >
              {saving ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Saving Banner...</span>
                </>
              ) : (
                <span>{editingId ? "Update Banner" : "Save Banner"}</span>
              )}
            </button>
          </form>

          {/* Live Preview of currently edited banner */}
          {(imageUrl || mobileImageUrl) && (
            <div className="pt-4 border-t border-steel/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-ash flex items-center gap-1.5">
                  <Eye size={14} />
                  Live Banner Preview
                </span>
                <div className="flex bg-obsidian rounded-pill p-0.5 border border-steel/30">
                  <button
                    type="button"
                    onClick={() => setPreviewMode("desktop")}
                    className={`px-2 py-1 rounded-pill text-[10px] flex items-center gap-1 ${
                      previewMode === "desktop"
                        ? "bg-steel text-white"
                        : "text-ash hover:text-white"
                    }`}
                  >
                    <Monitor size={12} />
                    Desktop
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode("mobile")}
                    className={`px-2 py-1 rounded-pill text-[10px] flex items-center gap-1 ${
                      previewMode === "mobile"
                        ? "bg-steel text-white"
                        : "text-ash hover:text-white"
                    }`}
                  >
                    <Smartphone size={12} />
                    Mobile
                  </button>
                </div>
              </div>

              <div
                className={`w-full overflow-hidden rounded-tile border border-steel/40 bg-obsidian relative ${
                  previewMode === "desktop" ? "aspect-[8/3]" : "aspect-[4/3] max-w-[280px] mx-auto"
                }`}
              >
                <img
                  src={
                    previewMode === "mobile" && mobileImageUrl
                      ? mobileImageUrl
                      : imageUrl || mobileImageUrl
                  }
                  alt={alt || "Preview"}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 right-2 bg-obsidian/70 backdrop-blur-sm px-2.5 py-1 rounded-pill text-[11px] text-porcelain truncate">
                  {alt || "Banner Preview"}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Existing Banners List (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-carbon rounded-tile border border-steel/30 overflow-hidden">
            <div className="p-4 border-b border-steel/20 flex items-center justify-between">
              <span className="text-xs font-semibold text-ash uppercase">
                Active &amp; Stored Banners ({banners.length})
              </span>
              <span className="text-[11px] text-ash">
                {banners.filter((b) => b.isActive).length} currently active on storefront
              </span>
            </div>

            {loading ? (
              <div className="p-12 text-center text-ash text-xs">Loading banners...</div>
            ) : banners.length === 0 ? (
              <div className="p-12 text-center text-ash text-xs">
                No hero banners configured yet. Add your first banner using the form.
              </div>
            ) : (
              <div className="divide-y divide-steel/20">
                {banners.map((b, idx) => (
                  <div
                    key={b.id}
                    className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                      editingId === b.id ? "bg-apple-blue/10" : "hover:bg-steel/10"
                    }`}
                  >
                    {/* Thumbnail & Info */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-20 h-12 rounded-lg overflow-hidden bg-obsidian border border-steel/40 shrink-0 relative">
                        <img
                          src={b.imageUrl}
                          alt={b.alt}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="min-w-0">
                        <p className="font-semibold text-porcelain text-xs truncate max-w-xs sm:max-w-sm">
                          {b.alt}
                        </p>
                        {b.link && (
                          <p className="text-electric-link text-[11px] flex items-center gap-1 truncate font-mono">
                            <LinkIcon size={10} />
                            {b.link}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-0.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                              b.isActive
                                ? "bg-success/20 text-success border border-success/30"
                                : "bg-steel/40 text-ash"
                            }`}
                          >
                            {b.isActive ? "Active" : "Disabled"}
                          </span>
                          <span className="text-[10px] text-ash font-mono">
                            Order: {b.order}
                          </span>
                          {b.mobileImageUrl && (
                            <span className="text-[10px] text-copper-new">
                              +Mobile Image
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                      {/* Reorder Buttons */}
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMoveOrder(idx, "up")}
                        aria-label="Move banner up"
                        className="p-2 rounded-lg bg-steel/30 hover:bg-steel/60 disabled:opacity-30 text-porcelain min-h-[36px] min-w-[36px] flex items-center justify-center transition-colors"
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        type="button"
                        disabled={idx === banners.length - 1}
                        onClick={() => handleMoveOrder(idx, "down")}
                        aria-label="Move banner down"
                        className="p-2 rounded-lg bg-steel/30 hover:bg-steel/60 disabled:opacity-30 text-porcelain min-h-[36px] min-w-[36px] flex items-center justify-center transition-colors"
                      >
                        <ArrowDown size={14} />
                      </button>

                      {/* Enable/Disable Toggle */}
                      <button
                        type="button"
                        onClick={() => handleToggleActive(b)}
                        aria-label={b.isActive ? "Disable banner" : "Enable banner"}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-medium min-h-[36px] flex items-center gap-1 transition-colors ${
                          b.isActive
                            ? "bg-steel/40 hover:bg-steel text-ash hover:text-white"
                            : "bg-success/20 hover:bg-success/30 text-success border border-success/30"
                        }`}
                      >
                        {b.isActive ? "Disable" : "Enable"}
                      </button>

                      {/* Edit */}
                      <button
                        type="button"
                        onClick={() => handleEdit(b)}
                        aria-label="Edit banner"
                        className="p-2 rounded-lg bg-steel/30 hover:bg-steel/60 text-porcelain min-h-[36px] min-w-[36px] flex items-center justify-center transition-colors"
                      >
                        <Edit2 size={14} />
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => handleDelete(b.id)}
                        aria-label="Delete banner"
                        className="p-2 rounded-lg bg-error/20 hover:bg-error/30 text-error min-h-[36px] min-w-[36px] flex items-center justify-center transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
