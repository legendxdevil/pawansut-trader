"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Heart, ShieldCheck } from "lucide-react";
import type { Product } from "@/types";
import { STORE_CONFIG } from "@/lib/store-config";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORE_CONFIG.wishlistStorageKey);
      if (stored) {
        const ids: string[] = JSON.parse(stored);
        setIsWishlisted(ids.includes(product.id));
      }
    } catch {
      // localStorage may fail in private mode
    }
  }, [product.id]);

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const stored = localStorage.getItem(STORE_CONFIG.wishlistStorageKey);
      let ids: string[] = stored ? JSON.parse(stored) : [];
      if (ids.includes(product.id)) {
        ids = ids.filter((id) => id !== product.id);
        setIsWishlisted(false);
      } else {
        ids.push(product.id);
        setIsWishlisted(true);
      }
      localStorage.setItem(STORE_CONFIG.wishlistStorageKey, JSON.stringify(ids));
      window.dispatchEvent(new Event("pt_wishlist_updated"));
    } catch {
      // Ignore
    }
  };

  const totalStock = product.variants.reduce((acc, v) => acc + (v.stock || 0), 0);
  const isOutOfStock = totalStock <= 0;
  const isLowStock = !isOutOfStock && totalStock <= 3;
  const hasDiscount = product.mrp > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : 0;

  return (
    <div className="group relative bg-carbon rounded-tile border border-steel/40 hover:border-steel transition-all flex flex-col justify-between overflow-hidden p-2.5 sm:p-4">
      {/* Top Badges & Wishlist (44px tap target) */}
      <div className="flex items-center justify-between mb-2 z-10">
        <div className="flex items-center gap-1 flex-wrap max-w-[calc(100%-48px)]">
          {product.isNew && (
            <span className="text-copper-new text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider">
              New
            </span>
          )}
          {product.warranty.enabled && (
            <span className="bg-steel/80 text-optical-yellow text-[9px] sm:text-[11px] font-medium px-2 py-0.5 rounded-pill flex items-center gap-1">
              <ShieldCheck size={11} className="shrink-0" />
              <span className="truncate">{product.warranty.months}m War.</span>
            </span>
          )}
        </div>

        <button
          onClick={toggleWishlist}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className="min-w-[44px] min-h-[44px] -mr-2 -mt-1 flex items-center justify-center text-ash hover:text-porcelain transition-colors shrink-0"
        >
          <Heart
            size={18}
            className={isWishlisted ? "fill-error text-error" : "text-ash hover:text-porcelain"}
          />
        </button>
      </div>

      {/* Pale Comparison Card: White 28px Image Canvas with aspect-square */}
      <Link href={`/products/${product.slug}`} className="block">
        <div className="bg-white rounded-tile aspect-square w-full flex items-center justify-center p-3 sm:p-4 relative overflow-hidden group-hover:scale-[1.02] transition-transform duration-300">
          {product.images && product.images[0] ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={product.images[0]}
              alt={product.name}
              className="max-h-full max-w-full object-contain mix-blend-multiply"
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLElement).style.display = "none";
              }}
            />
          ) : null}

          {/* Fallback accessory emblem on white */}
          <div className="text-obsidian/40 flex flex-col items-center justify-center text-center p-2">
            <span className="text-2xl font-bold tracking-tight text-obsidian/70">PT</span>
            <span className="text-[9px] uppercase font-semibold text-obsidian/50 tracking-wider">
              {product.category.replace("-", " ")}
            </span>
          </div>

          {/* Out of Stock overlay if applicable */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-obsidian/60 flex items-center justify-center rounded-tile">
              <span className="bg-error text-white text-[10px] sm:text-xs font-semibold px-2.5 py-1 rounded-pill">
                Out of Stock
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* Product Details Area */}
      <div className="mt-3 flex flex-col flex-1 justify-between space-y-2.5">
        <div>
          <Link href={`/products/${product.slug}`}>
            <h3 className="font-semibold text-xs sm:text-sm text-porcelain hover:text-electric-link transition-colors line-clamp-2 leading-snug">
              {product.name}
            </h3>
          </Link>
          {product.shortDescription && (
            <p className="text-ash text-[11px] sm:text-xs mt-0.5 line-clamp-1">{product.shortDescription}</p>
          )}
        </div>

        {/* Price & Action Row (responsive wrap for tight 2-col grids) */}
        <div className="pt-2 border-t border-steel/30 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="bg-[rgba(66,66,69,0.72)] px-2.5 py-0.5 rounded-[36px] text-xs sm:text-sm font-semibold text-porcelain">
                ₹{product.price}
              </span>
              {hasDiscount && (
                <span className="text-ash text-[10px] sm:text-xs line-through">₹{product.mrp}</span>
              )}
            </div>
            {hasDiscount && (
              <span className="text-success text-[9px] sm:text-[10px] font-semibold block mt-0.5">
                {discountPercent}% OFF
              </span>
            )}
            {isLowStock && (
              <span className="text-warning text-[9px] sm:text-[10px] font-medium block">
                Only {totalStock} left
              </span>
            )}
          </div>

          <Link
            href={`/products/${product.slug}`}
            className="bg-apple-blue hover:bg-apple-blue/90 text-white text-xs font-medium px-3.5 py-2 sm:py-2.5 min-h-[36px] sm:min-h-[44px] rounded-pill transition-transform active:scale-95 text-center flex items-center justify-center shrink-0"
          >
            View
          </Link>
        </div>
      </div>
    </div>
  );
}
