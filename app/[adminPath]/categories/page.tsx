"use client";

import React, { useState, useEffect } from "react";
import { Plus, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import type { Category } from "@/types";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [order, setOrder] = useState("1");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/categories");
      const json = await res.json();
      if (json.data) {
        setCategories(json.data);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!slug) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")
      );
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          slug: slug.trim().toLowerCase(),
          order: Number(order) || 1,
        }),
      });

      const json = await res.json();
      if (!res.ok || json.error) {
        setError(json.error?.message || "Failed to create category");
      } else {
        setSuccess(true);
        setName("");
        setSlug("");
        setOrder(String(categories.length + 2));
        fetchCategories();
      }
    } catch {
      setError("Network error while creating category");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-porcelain">Product Categories</h1>
        <p className="text-xs text-ash mt-0.5">
          Organize accessory taxonomy and storefront navigation tabs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Create Form (1 col) */}
        <form onSubmit={handleCreate} className="bg-carbon rounded-tile border border-steel/30 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-porcelain border-b border-steel/20 pb-2 flex items-center gap-2">
            <Plus size={16} className="text-apple-blue" />
            <span>Add New Category</span>
          </h2>

          {error && (
            <div className="bg-error/15 border border-error/30 text-error text-xs p-3 rounded-tile flex items-center gap-2">
              <AlertCircle size={14} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-success/15 border border-success/30 text-success text-xs p-3 rounded-tile flex items-center gap-2">
              <CheckCircle2 size={14} className="flex-shrink-0" />
              <span>Category added successfully!</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-porcelain">Category Name *</label>
            <input
              type="text"
              placeholder="e.g. Wireless Chargers"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
              className="w-full bg-[rgba(255,255,255,0.04)] text-porcelain px-4 py-2 rounded-pill border border-slate focus:border-apple-blue text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-porcelain">Slug *</label>
            <input
              type="text"
              placeholder="wireless-chargers"
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase())}
              required
              className="w-full bg-[rgba(255,255,255,0.04)] text-porcelain px-4 py-2 rounded-pill border border-slate focus:border-apple-blue text-xs font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-porcelain">Display Order</label>
            <input
              type="number"
              min={1}
              value={order}
              onChange={(e) => setOrder(e.target.value)}
              required
              className="w-full bg-[rgba(255,255,255,0.04)] text-porcelain px-4 py-2 rounded-pill border border-slate focus:border-apple-blue text-xs"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-apple-blue hover:bg-apple-blue/90 disabled:bg-steel/60 text-white font-semibold text-xs py-2.5 rounded-pill transition-transform active:scale-95 flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <span>Add Category</span>
            )}
          </button>
        </form>

        {/* Existing Categories List (2 cols) */}
        <div className="lg:col-span-2 bg-carbon rounded-tile border border-steel/30 overflow-hidden">
          <div className="p-4 border-b border-steel/20 flex items-center justify-between">
            <span className="text-xs font-semibold text-ash uppercase">
              Current Categories ({categories.length})
            </span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-ash text-xs">Loading categories...</div>
          ) : (
            <div className="divide-y divide-steel/20 text-xs">
              {categories.map((c) => (
                <div key={c.id} className="p-4 flex items-center justify-between hover:bg-steel/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-steel/40 flex items-center justify-center text-porcelain font-bold text-xs">
                      {c.order}
                    </div>
                    <div>
                      <p className="font-semibold text-porcelain text-sm">{c.name}</p>
                      <p className="text-ash font-mono text-[11px]">{c.slug}</p>
                    </div>
                  </div>

                  <span className="bg-graphite text-ash px-2.5 py-1 rounded-pill text-[11px] border border-steel/30">
                    Order: {c.order}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
