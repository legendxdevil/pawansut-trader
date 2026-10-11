"use client";

import React, { useState, useEffect } from "react";
import { Settings, Truck, Save, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import type { StoreSettings } from "@/types";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        setLoading(true);
        const res = await fetch("/api/admin/settings");
        const json = await res.json();
        if (json.data) {
          setSettings(json.data);
        }
      } catch {
        // Ignore
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      const json = await res.json();
      if (!res.ok || json.error) {
        setError(json.error?.message || "Failed to update settings");
      } else {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch {
      setError("Network error while updating store settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="py-20 text-center text-ash text-xs">
        Loading store settings...
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-porcelain">Store Settings</h1>
        <p className="text-xs text-ash mt-0.5">
          Configure delivery boundaries, charges, support channels, and store identity.
        </p>
      </div>

      {error && (
        <div className="bg-error/15 border border-error/30 text-error text-xs p-4 rounded-tile flex items-center gap-2">
          <AlertCircle size={16} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-success/15 border border-success/30 text-success text-xs p-4 rounded-tile flex items-center gap-2">
          <CheckCircle2 size={16} className="flex-shrink-0" />
          <span>Settings updated successfully!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Delivery Rules Card (§1, §3.1, §7.10) */}
        <div className="bg-carbon rounded-tile border border-steel/30 p-6 space-y-5">
          <div className="flex items-center gap-2 border-b border-steel/20 pb-3">
            <Truck size={18} className="text-apple-blue" />
            <h2 className="text-sm font-semibold text-porcelain">Delivery Configuration</h2>
          </div>

          {/* Hospital Delivery Restriction Toggle (§3.1) */}
          <div className="bg-graphite/60 rounded-tile p-4 border border-steel/20 space-y-2">
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={settings.restrictDeliveryToHospital}
                onChange={(e) =>
                  setSettings({ ...settings, restrictDeliveryToHospital: e.target.checked })
                }
                className="w-4 h-4 mt-0.5 rounded text-apple-blue bg-carbon border-steel"
              />
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-porcelain block">
                  Restrict Delivery to Hospital Campus (Default)
                </span>
                <p className="text-[11px] text-ash">
                  When enabled, checkout notifies customers that delivery is limited to Satyawadi Raja Harish Chandra Hospital and requires confirmation. Disabling allows deliveries anywhere.
                </p>
              </div>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-porcelain">
                Free Delivery Above (₹) *
              </label>
              <input
                type="number"
                min={0}
                value={settings.freeDeliveryAbove}
                onChange={(e) =>
                  setSettings({ ...settings, freeDeliveryAbove: Number(e.target.value) })
                }
                required
                className="w-full bg-[rgba(255,255,255,0.04)] text-porcelain px-4 py-2 rounded-pill border border-slate focus:border-apple-blue text-xs"
              />
              <span className="text-[10px] text-ash block">Default is ₹499</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-porcelain">
                Standard Delivery Charge (₹) *
              </label>
              <input
                type="number"
                min={0}
                value={settings.deliveryCharge}
                onChange={(e) =>
                  setSettings({ ...settings, deliveryCharge: Number(e.target.value) })
                }
                required
                className="w-full bg-[rgba(255,255,255,0.04)] text-porcelain px-4 py-2 rounded-pill border border-slate focus:border-apple-blue text-xs"
              />
              <span className="text-[10px] text-ash block">Default is ₹80</span>
            </div>
          </div>
        </div>

        {/* Store Identity & Contact Card */}
        <div className="bg-carbon rounded-tile border border-steel/30 p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-steel/20 pb-3">
            <Settings size={18} className="text-apple-blue" />
            <h2 className="text-sm font-semibold text-porcelain">Store Information</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-porcelain">Store Brand Name *</label>
              <input
                type="text"
                value={settings.storeName}
                onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                required
                className="w-full bg-[rgba(255,255,255,0.04)] text-porcelain px-4 py-2 rounded-pill border border-slate focus:border-apple-blue text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-porcelain">WhatsApp Support Number (10 digits) *</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={10}
                value={settings.whatsappNumber}
                onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value.replace(/\D/g, "") })}
                required
                className="w-full bg-[rgba(255,255,255,0.04)] text-porcelain px-4 py-2.5 rounded-pill border border-slate focus:border-apple-blue text-base sm:text-xs"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-medium text-ash">Support Email</label>
              <input
                type="email"
                value={settings.supportEmail || ""}
                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                className="w-full bg-[rgba(255,255,255,0.04)] text-porcelain px-4 py-2.5 rounded-pill border border-slate focus:border-apple-blue text-base sm:text-xs"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-medium text-ash">Store / Shop Physical Address</label>
              <textarea
                rows={2}
                value={settings.address || ""}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full bg-[rgba(255,255,255,0.04)] text-porcelain p-3 rounded-tile border border-slate focus:border-apple-blue text-base sm:text-xs resize-none"
              />
            </div>
          </div>
        </div>

        {/* Sticky Save Bar (§STEP 4) */}
        <div className="sticky bottom-0 bg-carbon/95 backdrop-blur-md -mx-3.5 sm:-mx-6 p-4 border-t border-steel/30 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] z-30 shadow-2xl">
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-apple-blue hover:bg-apple-blue/90 disabled:bg-steel/60 text-white font-semibold text-xs py-3 rounded-pill transition-transform active:scale-[0.98] flex items-center justify-center gap-2 min-h-[44px]"
          >
            {saving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Saving Store Settings...</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>Save Configuration</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
