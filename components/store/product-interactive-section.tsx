"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Minus, ShoppingBag, Zap, Heart, ShieldCheck, Check, AlertCircle } from "lucide-react";
import type { Product, ProductVariant } from "@/types";
import { STORE_CONFIG } from "@/lib/store-config";

interface ProductInteractiveSectionProps {
  product: Product;
}

export function ProductInteractiveSection({ product }: ProductInteractiveSectionProps) {
  const router = useRouter();

  // If product has no explicit variants, create a default fallback variant
  const variants: ProductVariant[] =
    product.variants && product.variants.length > 0
      ? product.variants
      : [{ id: "default", label: "Standard", stock: 10 }];

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(variants[0]);
  const [qty, setQty] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addedNotice, setAddedNotice] = useState(false);

  // Check wishlist state
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORE_CONFIG.wishlistStorageKey);
      if (stored) {
        const ids: string[] = JSON.parse(stored);
        setIsWishlisted(ids.includes(product.id));
      }
    } catch {
      // Ignore
    }
  }, [product.id]);

  const toggleWishlist = () => {
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

  // Compute active price and stock based on selected variant (§7.4)
  const currentPrice = selectedVariant.priceOverride ?? product.price;
  const currentStock = selectedVariant.stock ?? 0;
  const isOutOfStock = currentStock <= 0;
  const isLowStock = !isOutOfStock && currentStock <= 3;
  const hasDiscount = product.mrp > currentPrice;
  const discountPercent = hasDiscount
    ? Math.round(((product.mrp - currentPrice) / product.mrp) * 100)
    : 0;

  // Ensure qty is always within stock bounds (1..min(10, currentStock))
  const maxAllowedQty = Math.max(1, Math.min(10, currentStock));

  const handleQtyChange = (delta: number) => {
    setQty((prev) => {
      const next = prev + delta;
      if (next < 1) return 1;
      if (next > maxAllowedQty) return maxAllowedQty;
      return next;
    });
  };

  const handleVariantSelect = (v: ProductVariant) => {
    setSelectedVariant(v);
    if (qty > (v.stock || 0)) {
      setQty(Math.max(1, Math.min(10, v.stock || 0)));
    }
  };

  const addToCartStorage = (quantity: number) => {
    try {
      const stored = localStorage.getItem(STORE_CONFIG.cartStorageKey);
      const cart: Array<{ productId: string; variantId: string; qty: number }> = stored
        ? JSON.parse(stored)
        : [];

      const existingIndex = cart.findIndex(
        (item) => item.productId === product.id && item.variantId === selectedVariant.id
      );

      if (existingIndex > -1) {
        cart[existingIndex].qty = Math.min(
          maxAllowedQty,
          cart[existingIndex].qty + quantity
        );
      } else {
        cart.push({
          productId: product.id,
          variantId: selectedVariant.id,
          qty: quantity,
        });
      }

      localStorage.setItem(STORE_CONFIG.cartStorageKey, JSON.stringify(cart));
      window.dispatchEvent(new Event("pt_cart_updated"));
      setAddedNotice(true);
      setTimeout(() => setAddedNotice(false), 2500);
    } catch (e) {
      console.error("Failed to update cart in storage:", e);
    }
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCartStorage(qty);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    addToCartStorage(qty);
    router.push("/checkout");
  };

  return (
    <div className="space-y-6">
      {/* Price & MRP Row */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="bg-[rgba(66,66,69,0.72)] px-5 py-2 rounded-[36px] text-2xl font-bold tracking-tight text-porcelain">
            ₹{currentPrice}
          </div>
          {hasDiscount && (
            <div className="flex items-center gap-2">
              <span className="text-ash text-base line-through">₹{product.mrp}</span>
              <span className="bg-success/20 text-success text-xs font-semibold px-2.5 py-1 rounded-pill">
                {discountPercent}% OFF
              </span>
            </div>
          )}
        </div>

        {/* Stock status indicator */}
        <div className="flex items-center gap-2 text-xs">
          {isOutOfStock ? (
            <span className="text-error font-medium flex items-center gap-1.5">
              <AlertCircle size={14} /> Currently Out of Stock
            </span>
          ) : isLowStock ? (
            <span className="text-warning font-medium flex items-center gap-1.5">
              <AlertCircle size={14} /> Only {currentStock} left in stock
            </span>
          ) : (
            <span className="text-success font-medium flex items-center gap-1.5">
              <Check size={14} /> In Stock ({currentStock} units ready for dispatch)
            </span>
          )}
        </div>
      </div>

      {/* Variant Selector (§7.4) */}
      {variants.length > 1 && (
        <div className="space-y-2.5 border-t border-steel/30 pt-4">
          <label className="text-xs font-semibold text-ash uppercase tracking-wider block">
            Select Variant: <span className="text-porcelain font-normal">{selectedVariant.label}</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {variants.map((v) => {
              const isSelected = v.id === selectedVariant.id;
              const isVarOutOfStock = v.stock <= 0;
              return (
                <button
                  key={v.id}
                  onClick={() => handleVariantSelect(v)}
                  className={`min-h-[44px] px-4 py-2.5 rounded-pill text-xs font-medium border transition-all flex items-center gap-2 active:scale-95 ${
                    isSelected
                      ? "border-apple-blue bg-apple-blue/15 text-white"
                      : "border-slate bg-carbon hover:border-porcelain text-porcelain/90"
                  } ${isVarOutOfStock ? "opacity-50 line-through" : ""}`}
                >
                  <span>{v.label}</span>
                  {v.priceOverride && v.priceOverride !== product.price && (
                    <span className="text-[10px] opacity-75">₹{v.priceOverride}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Quantity Stepper & Action Buttons */}
      <div className="space-y-4 border-t border-steel/30 pt-4">
        <div className="flex items-center gap-4">
          <span className="text-xs text-ash font-medium">Quantity</span>
          <div className="flex items-center bg-carbon border border-steel/50 rounded-pill p-0.5">
            <button
              onClick={() => handleQtyChange(-1)}
              disabled={qty <= 1 || isOutOfStock}
              aria-label="Decrease quantity"
              className="min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center text-porcelain hover:bg-steel/60 disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <Minus size={16} />
            </button>
            <span className="w-10 text-center font-semibold text-sm text-porcelain select-none">{qty}</span>
            <button
              onClick={() => handleQtyChange(1)}
              disabled={qty >= maxAllowedQty || isOutOfStock}
              aria-label="Increase quantity"
              className="min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center text-porcelain hover:bg-steel/60 disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* Buttons: Add to cart (blue pill) & Buy now (outlined pill) */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="w-full sm:flex-1 min-h-[48px] bg-apple-blue hover:bg-apple-blue/90 disabled:bg-steel/50 disabled:text-ash text-white text-sm font-semibold py-3 px-6 rounded-pill transition-transform active:scale-[0.98] flex items-center justify-center gap-2 shadow-none"
          >
            <ShoppingBag size={18} />
            {isOutOfStock ? "Out of Stock" : "Add to Cart"}
          </button>

          <button
            onClick={handleBuyNow}
            disabled={isOutOfStock}
            className="w-full sm:flex-1 min-h-[48px] bg-transparent hover:bg-steel/30 disabled:opacity-40 text-porcelain border border-slate hover:border-porcelain text-sm font-semibold py-3 px-6 rounded-pill transition-transform active:scale-[0.98] flex items-center justify-center gap-2 shadow-none"
          >
            <Zap size={18} />
            Buy Now
          </button>

          <button
            onClick={toggleWishlist}
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            className="min-w-[48px] min-h-[48px] rounded-full border border-steel/60 hover:border-porcelain transition-colors text-ash hover:text-porcelain flex items-center justify-center shrink-0"
          >
            <Heart size={20} className={isWishlisted ? "fill-error text-error" : ""} />
          </button>
        </div>

        {addedNotice && (
          <div className="bg-success/20 border border-success/40 text-success text-xs py-2 px-4 rounded-pill text-center font-medium animate-fadeIn">
            ✓ Added {qty} {qty === 1 ? "unit" : "units"} to your cart!
          </div>
        )}
      </div>

      {/* Mandatory Warranty Block (§7.4, §16) */}
      {product.warranty.enabled && (
        <div className="bg-carbon rounded-tile border border-optical-yellow/30 p-4 space-y-2">
          <div className="flex items-center gap-2 text-optical-yellow font-semibold text-sm">
            <ShieldCheck size={18} />
            <span>{product.warranty.months} Months Official Warranty</span>
          </div>
          <p className="text-ash text-xs leading-relaxed">
            A physical warranty card will be delivered with the product. The card is required for any warranty claim or refund.
          </p>
          {product.warranty.note && (
            <p className="text-porcelain/80 text-[11px] italic">Note: {product.warranty.note}</p>
          )}
        </div>
      )}

      {/* Delivery Rule Notice (§7.4, §7.10) */}
      <div className="bg-carbon/50 rounded-tile border border-steel/30 p-4 text-xs space-y-1.5 text-ash">
        <p className="text-porcelain font-medium">Delivery Information</p>
        <p>• Free delivery for orders of ₹{STORE_CONFIG.freeDeliveryAbove} or more.</p>
        <p>• ₹{STORE_CONFIG.defaultDeliveryCharge} delivery charge applies on orders below ₹{STORE_CONFIG.freeDeliveryAbove}.</p>
        <p className="text-porcelain/80">• {STORE_CONFIG.hospitalNotice}</p>
      </div>

      {/* Sticky Bottom Bar on Mobile per STEP 3 */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-35 bg-carbon/95 backdrop-blur-md border-t border-steel/40 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom,0.75rem))] flex items-center justify-between gap-3 shadow-2xl">
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] text-ash uppercase font-semibold">Total Price</span>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold text-porcelain">₹{currentPrice * qty}</span>
            {qty > 1 && <span className="text-[10px] text-ash font-mono">({qty}x)</span>}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-1 justify-end">
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="flex-1 min-h-[44px] bg-apple-blue hover:bg-apple-blue/90 disabled:bg-steel/50 disabled:text-ash text-white text-xs font-semibold px-4 py-2.5 rounded-pill transition-transform active:scale-[0.98] flex items-center justify-center gap-1.5 shadow-md"
          >
            <ShoppingBag size={16} />
            <span className="truncate">{isOutOfStock ? "Out of Stock" : "Add to Cart"}</span>
          </button>

          <button
            onClick={handleBuyNow}
            disabled={isOutOfStock}
            className="min-h-[44px] bg-transparent hover:bg-steel/30 disabled:opacity-40 text-porcelain border border-slate text-xs font-semibold px-4 py-2.5 rounded-pill transition-transform active:scale-[0.98] flex items-center justify-center gap-1 shrink-0"
          >
            <Zap size={16} />
            <span>Buy</span>
          </button>
        </div>
      </div>
    </div>
  );
}
