"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Plus, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import type { Coupon } from "@/types";

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [code, setCode] = useState("");
  const [type, setType] = useState<"percent" | "flat">("percent");
  const [value, setValue] = useState("");
  const [minOrder, setMinOrder] = useState("299");
  const [maxDiscount, setMaxDiscount] = useState("100");
  const [usageLimit, setUsageLimit] = useState("500");
  const [isActive, setIsActive] = useState(true);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const fetchCoupons = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/coupons");
      const json = await res.json();
      if (json.data) {
        setCoupons(json.data);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          type,
          value: Number(value),
          minOrder: Number(minOrder) || 0,
          maxDiscount: type === "percent" && maxDiscount ? Number(maxDiscount) : undefined,
          usageLimit: usageLimit ? Number(usageLimit) : undefined,
          isActive,
        }),
      });

      const json = await res.json();
      if (!res.ok || json.error) {
        setError(json.error?.message || "Failed to create coupon");
      } else {
        setSuccess(true);
        setCode("");
        setValue("");
        fetchCoupons();
      }
    } catch {
      setError("Network error creating coupon");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-porcelain">Promotional Coupons</h1>
        <p className="text-xs text-ash mt-0.5">
          Create percentage or flat discount promo codes for campaigns.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Create Form */}
        <form onSubmit={handleCreate} className="bg-carbon rounded-tile border border-steel/30 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-porcelain border-b border-steel/20 pb-2 flex items-center gap-2">
            <Plus size={16} className="text-apple-blue" />
            <span>Create Promo Coupon</span>
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
              <span>Coupon created successfully!</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-porcelain">Coupon Code (3–20 chars) *</label>
            <input
              type="text"
              placeholder="e.g. WELCOME10"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              required
              className="w-full bg-[rgba(255,255,255,0.04)] text-porcelain px-4 py-2 rounded-pill border border-slate focus:border-apple-blue text-xs uppercase font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-porcelain">Discount Type *</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as "percent" | "flat")}
                aria-label="Coupon Discount Type"
                className="w-full bg-[rgba(255,255,255,0.04)] text-porcelain px-3 py-2 rounded-pill border border-slate focus:border-apple-blue text-xs"
              >
                <option value="percent" className="bg-carbon text-porcelain">
                  Percentage (%)
                </option>
                <option value="flat" className="bg-carbon text-porcelain">
                  Flat (₹)
                </option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-porcelain">
                Value ({type === "percent" ? "%" : "₹"}) *
              </label>
              <input
                type="number"
                min={1}
                placeholder={type === "percent" ? "10" : "50"}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                required
                className="w-full bg-[rgba(255,255,255,0.04)] text-porcelain px-4 py-2 rounded-pill border border-slate focus:border-apple-blue text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-porcelain">Min Order (₹)</label>
              <input
                type="number"
                min={0}
                value={minOrder}
                onChange={(e) => setMinOrder(e.target.value)}
                className="w-full bg-[rgba(255,255,255,0.04)] text-porcelain px-4 py-2 rounded-pill border border-slate focus:border-apple-blue text-xs"
              />
            </div>

            {type === "percent" && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-porcelain">Max Discount (₹)</label>
                <input
                  type="number"
                  min={1}
                  placeholder="Cap (₹)"
                  value={maxDiscount}
                  onChange={(e) => setMaxDiscount(e.target.value)}
                  className="w-full bg-[rgba(255,255,255,0.04)] text-porcelain px-4 py-2 rounded-pill border border-slate focus:border-apple-blue text-xs"
                />
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-ash">Usage Limit (Total redemptions)</label>
            <input
              type="number"
              min={1}
              value={usageLimit}
              onChange={(e) => setUsageLimit(e.target.value)}
              className="w-full bg-[rgba(255,255,255,0.04)] text-porcelain px-4 py-2 rounded-pill border border-slate focus:border-apple-blue text-xs"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-xs text-porcelain select-none pt-1">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 rounded text-apple-blue bg-graphite border-steel"
            />
            <span className="font-semibold">Active for guest checkout</span>
          </label>

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
              <span>Create Coupon</span>
            )}
          </button>
        </form>

        {/* Existing Coupons List */}
        <div className="lg:col-span-2 bg-carbon rounded-tile border border-steel/30 overflow-hidden">
          <div className="p-4 border-b border-steel/20 flex items-center justify-between">
            <span className="text-xs font-semibold text-ash uppercase">
              Current Coupons ({coupons.length})
            </span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-ash text-xs">Loading coupons...</div>
          ) : (
            <div className="divide-y divide-steel/20 text-xs">
              {coupons.map((c) => (
                <div key={c.code} className="p-4 flex items-center justify-between hover:bg-steel/10 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-porcelain text-sm bg-steel/40 px-2.5 py-0.5 rounded-pill">
                        {c.code}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-pill ${
                          c.isActive
                            ? "bg-success/20 text-success"
                            : "bg-error/20 text-error"
                        }`}
                      >
                        {c.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <p className="text-ash">
                      {c.type === "percent" ? `${c.value}% off` : `₹${c.value} flat off`}
                      {c.maxDiscount ? ` (capped at ₹${c.maxDiscount})` : ""} | Min order: ₹{c.minOrder}
                    </p>
                  </div>

                  <div className="text-right text-ash">
                    <p className="font-medium text-porcelain">
                      Used: {c.usedCount} {c.usageLimit ? `/ ${c.usageLimit}` : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
