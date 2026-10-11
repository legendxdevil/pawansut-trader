import React from "react";
import { STORE_CONFIG } from "@/lib/store-config";

export const metadata = {
  title: "Design System Tokens Scratchpad",
  description: "Verification scratchpad for Pawansut Trader Apple-style design tokens",
};

export default function ScratchPage() {
  const colorTokens = [
    { name: "obsidian", bg: "bg-obsidian", hex: "#000000", border: "border-steel" },
    { name: "graphite", bg: "bg-graphite", hex: "#0e0e0e", border: "border-steel" },
    { name: "carbon", bg: "bg-carbon", hex: "#1d1d1f", border: "border-steel" },
    { name: "steel", bg: "bg-steel", hex: "#333336", border: "border-slate" },
    { name: "slate", bg: "bg-slate", hex: "#6e6e73", border: "border-steel" },
    { name: "ash", bg: "bg-ash", hex: "#86868b", border: "border-steel" },
    { name: "porcelain", bg: "bg-porcelain", hex: "#f5f5f7", textDark: true },
    { name: "white", bg: "bg-white", hex: "#ffffff", textDark: true },
    { name: "apple-blue", bg: "bg-apple-blue", hex: "#0071e3" },
    { name: "electric-link", bg: "bg-electric-link", hex: "#2997ff" },
    { name: "cobalt-link", bg: "bg-cobalt-link", hex: "#0066cc" },
    { name: "copper-new", bg: "bg-copper-new", hex: "#b64400" },
    { name: "optical-yellow", bg: "bg-optical-yellow", hex: "#ffd500", textDark: true },
    { name: "error", bg: "bg-error", hex: "#ff453a" },
    { name: "success", bg: "bg-success", hex: "#30d158" },
    { name: "warning", bg: "bg-warning", hex: "#ffd60a", textDark: true },
  ];

  return (
    <div className="min-h-screen bg-obsidian text-porcelain p-8 space-y-12">
      <header className="space-y-2">
        <p className="text-copper-new text-xs font-semibold uppercase tracking-wider">Design System Verification</p>
        <h1 className="text-4xl font-semibold tracking-tight">{STORE_CONFIG.storeName} Design Tokens</h1>
        <p className="text-ash text-sm">Apple-style dark reference tokens (§5.1, §5.2, §5.3)</p>
      </header>

      {/* Color Palette Grid */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Color Palette</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-4">
          {colorTokens.map((t) => (
            <div
              key={t.name}
              className={`p-4 rounded-tile border border-steel/40 flex flex-col justify-between h-28 ${t.bg} ${
                t.textDark ? "text-obsidian" : "text-porcelain"
              }`}
            >
              <span className="font-semibold text-xs">{t.name}</span>
              <span className="text-[10px] opacity-80">{t.hex}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Shape, Buttons & Pills */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Components & Pills</h2>
        <div className="flex flex-wrap items-center gap-4">
          {/* Primary Blue Pill */}
          <button className="bg-apple-blue hover:bg-apple-blue/90 text-white text-sm font-medium px-6 py-2.5 rounded-pill transition-transform active:scale-[0.98]">
            Add to cart (Primary Pill)
          </button>

          {/* Secondary Outlined Pill */}
          <button className="bg-transparent text-porcelain border border-slate hover:border-porcelain text-sm font-medium px-6 py-2.5 rounded-pill transition-transform active:scale-[0.98]">
            Buy now (Outlined Pill)
          </button>

          {/* Price capsule */}
          <div className="bg-[rgba(66,66,69,0.72)] px-4 py-1.5 rounded-[36px] text-sm font-semibold">
            ₹499
          </div>

          {/* Warranty badge */}
          <span className="bg-steel text-optical-yellow text-xs font-medium px-3 py-1 rounded-pill">
            ★ 6 Months Warranty
          </span>

          {/* New badge */}
          <span className="text-copper-new text-xs font-semibold uppercase tracking-wider">
            New
          </span>
        </div>
      </section>

      {/* 28px Pale Comparison Card */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">28px Pale Comparison Card Tile (§5.4)</h2>
        <div className="max-w-xs bg-carbon rounded-tile border border-steel/40 p-4 space-y-4">
          {/* White product tile area */}
          <div className="bg-white rounded-tile h-48 flex items-center justify-center text-obsidian font-semibold text-sm">
            [White 28px Image Canvas]
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-base">Fast Charger 30W</h3>
            <p className="text-ash text-xs">USB-C Power Delivery with intelligent heat control.</p>
            <div className="flex items-center justify-between pt-2">
              <span className="font-semibold text-lg">₹699</span>
              <button className="bg-apple-blue text-white text-xs font-medium px-4 py-2 rounded-pill">
                Add
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Section fade gradient test */}
      <section className="bg-section-fade rounded-tile border border-steel/30 p-8 space-y-2">
        <h3 className="text-lg font-semibold">Section Fade Gradient</h3>
        <p className="text-ash text-sm">Linear gradient from #1d1d1f to #000000 over 288px.</p>
      </section>
    </div>
  );
}
