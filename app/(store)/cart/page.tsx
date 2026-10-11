"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, AlertTriangle, Truck, Tag } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { STORE_CONFIG } from "@/lib/store-config";

export default function CartPage() {
  const {
    hydratedItems,
    isLoading,
    subtotal,
    deliveryCharge,
    isFreeDelivery,
    amountNeededForFree,
    total,
    hasStockIssue,
    updateQty,
    removeItem,
    clearCart,
  } = useCart();

  const [couponCode, setCouponCode] = useState("");
  const [couponNotice, setCouponNotice] = useState<string | null>(null);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    // Coupon validation will be verified against /api/coupons/validate in Phase 4
    setCouponNotice("Coupon will be applied and validated during checkout.");
  };

  if (isLoading && hydratedItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-ash text-sm">
        Loading your shopping bag...
      </div>
    );
  }

  if (hydratedItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 bg-carbon rounded-full flex items-center justify-center mx-auto text-ash/60 border border-steel/30">
          <ShoppingBag size={28} />
        </div>
        <h1 className="text-2xl font-semibold text-porcelain tracking-tight">Your Cart is Empty</h1>
        <p className="text-ash text-sm max-w-sm mx-auto">
          Explore GaN fast chargers, Kevlar braided cables, and audio accessories.
        </p>
        <Link
          href="/products"
          className="inline-block bg-apple-blue hover:bg-apple-blue/90 text-white text-sm font-medium px-6 py-2.5 rounded-pill transition-transform active:scale-95"
        >
          Explore Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between border-b border-steel/30 pb-4">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
          Shopping Cart ({hydratedItems.length})
        </h1>
        <button
          onClick={clearCart}
          className="text-xs text-ash hover:text-error transition-colors flex items-center gap-1"
        >
          <Trash2 size={12} /> Clear all
        </button>
      </div>

      {/* Free Delivery Nudge (§7.5, §7.10) */}
      <div className="bg-carbon rounded-tile border border-steel/30 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-full bg-steel/50 text-apple-blue">
            <Truck size={20} />
          </div>
          <div>
            {isFreeDelivery ? (
              <p className="text-sm font-semibold text-success">
                Eligible for FREE Delivery at Satyawadi Raja Harish Chandra Hospital!
              </p>
            ) : (
              <p className="text-sm font-medium text-porcelain">
                Add <span className="font-bold text-apple-blue">₹{amountNeededForFree}</span> more to unlock Free Delivery!
              </p>
            )}
            <p className="text-xs text-ash">
              Orders of ₹{STORE_CONFIG.freeDeliveryAbove} or more qualify for zero delivery fee.
            </p>
          </div>
        </div>

        {!isFreeDelivery && (
          <Link
            href="/products"
            className="text-xs text-electric-link hover:underline font-semibold whitespace-nowrap"
          >
            Add More Items &rarr;
          </Link>
        )}
      </div>

      {hasStockIssue && (
        <div className="bg-error/15 border border-error/40 text-error text-xs p-4 rounded-tile flex items-center gap-3">
          <AlertTriangle size={18} className="flex-shrink-0" />
          <span>
            One or more items in your cart exceed available inventory. Please adjust quantities or remove unavailable items to continue to checkout.
          </span>
        </div>
      )}

      {/* Main Cart Layout: Items (Left) + Summary (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Items List */}
        <div className="lg:col-span-2 space-y-4">
          {hydratedItems.map((item) => (
            <div
              key={`${item.productId}-${item.variantId}`}
              className={`bg-carbon rounded-tile border p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                item.isOutOfStock ? "border-error/50" : "border-steel/30"
              }`}
            >
              <div className="flex items-center gap-4 w-full sm:w-auto">
                {/* 28px Pale Comparison Thumbnail */}
                <div className="w-20 h-20 bg-white rounded-tile p-2 flex items-center justify-center flex-shrink-0">
                  {item.image ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={item.image}
                      alt={item.name}
                      className="max-h-full max-w-full object-contain mix-blend-multiply"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <span className="text-xs font-bold text-obsidian/60">PT</span>
                  )}
                </div>

                <div className="space-y-1">
                  <Link
                    href={`/products/${item.slug}`}
                    className="font-semibold text-sm text-porcelain hover:text-electric-link transition-colors block"
                  >
                    {item.name}
                  </Link>
                  <p className="text-xs text-ash">
                    Variant: <span className="text-porcelain/90">{item.variantLabel}</span>
                  </p>
                  {item.warranty && (
                    <span className="inline-block text-[10px] text-optical-yellow font-medium">
                      ★ {item.warranty.months}m Warranty Card Included
                    </span>
                  )}

                  {item.isOutOfStock && (
                    <p className="text-xs text-error font-medium flex items-center gap-1 pt-1">
                      <AlertTriangle size={12} /> Stock exceeded ({item.availableStock} in stock)
                    </p>
                  )}
                </div>
              </div>

              {/* Price & Stepper Row */}
              <div className="flex items-center justify-between w-full sm:w-auto gap-6 sm:self-center border-t sm:border-t-0 border-steel/20 pt-3 sm:pt-0">
                <div className="text-right">
                  <p className="text-base font-semibold text-porcelain">
                    ₹{item.price * item.qty}
                  </p>
                  <p className="text-[11px] text-ash">₹{item.price} each</p>
                </div>

                {/* Stepper */}
                <div className="flex items-center bg-graphite border border-steel/50 rounded-pill p-1">
                  <button
                    onClick={() => updateQty(item.productId, item.variantId, item.qty - 1)}
                    aria-label="Decrease quantity"
                    className="w-7 h-7 rounded-full flex items-center justify-center text-ash hover:text-porcelain"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="w-8 text-center text-xs font-semibold text-porcelain">
                    {item.qty}
                  </span>
                  <button
                    onClick={() => updateQty(item.productId, item.variantId, item.qty + 1)}
                    disabled={item.qty >= Math.min(10, item.availableStock)}
                    aria-label="Increase quantity"
                    className="w-7 h-7 rounded-full flex items-center justify-center text-ash hover:text-porcelain disabled:opacity-30"
                  >
                    <Plus size={12} />
                  </button>
                </div>

                {/* Remove button */}
                <button
                  onClick={() => removeItem(item.productId, item.variantId)}
                  aria-label="Remove item"
                  className="text-ash hover:text-error transition-colors p-1"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary Card */}
        <div className="bg-carbon rounded-tile border border-steel/30 p-6 space-y-6">
          <h2 className="text-lg font-semibold tracking-tight text-porcelain border-b border-steel/20 pb-3">
            Order Summary
          </h2>

          {/* Coupon Code Input */}
          <form onSubmit={handleApplyCoupon} className="space-y-2">
            <label className="text-xs text-ash font-medium flex items-center gap-1.5">
              <Tag size={12} /> Have a Promo Code?
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. WELCOME10"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                className="flex-1 bg-[rgba(255,255,255,0.04)] text-porcelain text-xs px-3.5 py-2.5 rounded-pill border border-slate focus:border-apple-blue uppercase"
              />
              <button
                type="submit"
                className="bg-steel/60 hover:bg-steel text-porcelain text-xs font-medium px-4 py-2.5 rounded-pill transition-colors"
              >
                Apply
              </button>
            </div>
            {couponNotice && (
              <p className="text-[11px] text-electric-link">{couponNotice}</p>
            )}
          </form>

          {/* Price Breakdown */}
          <div className="space-y-2 text-xs border-t border-steel/20 pt-4">
            <div className="flex justify-between text-ash">
              <span>Items Subtotal</span>
              <span className="text-porcelain font-medium">₹{subtotal}</span>
            </div>
            <div className="flex justify-between text-ash">
              <span>Estimated Delivery</span>
              <span className={isFreeDelivery ? "text-success font-semibold" : "text-porcelain font-medium"}>
                {isFreeDelivery ? "FREE" : `₹${deliveryCharge}`}
              </span>
            </div>
            <div className="flex justify-between text-base font-semibold text-porcelain pt-3 border-t border-steel/20">
              <span>Grand Total</span>
              <span>₹{total}</span>
            </div>
          </div>

          {/* Checkout CTA */}
          <Link
            href={hasStockIssue ? "#" : "/checkout"}
            onClick={(e) => {
              if (hasStockIssue) e.preventDefault();
            }}
            className={`w-full text-center text-sm font-medium py-3 rounded-pill transition-transform active:scale-[0.98] flex items-center justify-center gap-2 ${
              hasStockIssue
                ? "bg-steel/60 text-ash cursor-not-allowed"
                : "bg-apple-blue hover:bg-apple-blue/90 text-white"
            }`}
          >
            <span>Proceed to Checkout</span>
            <ArrowRight size={16} />
          </Link>

          <p className="text-[11px] text-center text-ash">
            Cash on Delivery (COD) available at Satyawadi Raja Harish Chandra Hospital.
          </p>
        </div>
      </div>
    </div>
  );
}
