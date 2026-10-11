"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, AlertTriangle, Truck } from "lucide-react";
import { useCart } from "@/lib/cart-context";

export function MiniCartDrawer() {
  const {
    isDrawerOpen,
    closeDrawer,
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
  } = useCart();

  // Prevent background scrolling when cart drawer is active
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isDrawerOpen]);

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDrawer}
            className="absolute inset-0 bg-obsidian/80 backdrop-blur-sm transition-opacity"
          />

          {/* Drawer Wrapper: Bottom Sheet on mobile (< sm), Slide-in from right on desktop (sm+) per STEP 3 */}
          <div className="fixed inset-x-0 bottom-0 sm:inset-y-0 sm:left-auto sm:right-0 max-w-full flex">
            <motion.div
              initial={{ y: "100%", x: 0 }}
              animate={{ y: 0, x: 0 }}
              exit={{ y: "100%", x: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="w-full sm:w-[420px] max-h-[90vh] max-h-[90dvh] sm:max-h-full sm:h-full bg-carbon rounded-t-[28px] sm:rounded-none border-t sm:border-t-0 sm:border-l border-steel/40 shadow-2xl flex flex-col justify-between overflow-hidden"
            >
              {/* Header */}
              <div className="p-4 sm:p-6 border-b border-steel/30 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <ShoppingBag size={20} className="text-apple-blue" />
                  <h2 className="text-base sm:text-lg font-semibold text-porcelain">
                    Your Bag ({hydratedItems.length})
                  </h2>
                </div>
                <button
                  onClick={closeDrawer}
                  aria-label="Close cart"
                  className="min-w-[44px] min-h-[44px] -mr-2 rounded-full text-ash hover:text-porcelain hover:bg-steel/30 transition-colors flex items-center justify-center"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Free Delivery Nudge (§7.5, §7.10) */}
              <div className="bg-graphite px-4 sm:px-6 py-3 border-b border-steel/20 text-xs shrink-0">
                {isFreeDelivery ? (
                  <div className="flex items-center gap-2 text-success font-medium">
                    <Truck size={16} className="shrink-0" />
                    <span>Unlocked Free Delivery at Hospital campus!</span>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-porcelain/90 font-medium">
                      <span>Add ₹{amountNeededForFree} more for Free Delivery</span>
                      <span className="text-ash font-normal">₹80 fee applies</span>
                    </div>
                    <div className="w-full bg-steel/40 h-1.5 rounded-pill overflow-hidden">
                      <div
                        className="bg-apple-blue h-full rounded-pill transition-all duration-300"
                        style={{
                          width: `${Math.min(100, Math.max(5, (subtotal / 499) * 100))}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Items List (Internal smooth scroll) */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5">
                {isLoading && hydratedItems.length === 0 ? (
                  <div className="flex items-center justify-center py-12 text-ash text-sm">
                    Updating cart prices...
                  </div>
                ) : hydratedItems.length === 0 ? (
                  <div className="text-center py-16 space-y-3">
                    <ShoppingBag size={40} className="mx-auto text-ash/40" />
                    <p className="text-sm text-porcelain font-medium">Your bag is empty</p>
                    <p className="text-xs text-ash">Explore fast chargers, ballistic cables, and audio.</p>
                    <Link
                      href="/products"
                      onClick={closeDrawer}
                      className="inline-flex min-h-[44px] items-center bg-apple-blue text-white text-xs px-6 py-2.5 rounded-pill font-semibold mt-2"
                    >
                      Browse Products
                    </Link>
                  </div>
                ) : (
                  hydratedItems.map((item) => (
                    <div
                      key={`${item.productId}-${item.variantId}`}
                      className={`bg-graphite/60 border rounded-tile p-3 sm:p-3.5 flex gap-3 items-center ${
                        item.isOutOfStock ? "border-error/40" : "border-steel/30"
                      }`}
                    >
                      {/* Thumbnail (white canvas) */}
                      <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center p-1 shrink-0">
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
                          <span className="text-[10px] font-bold text-obsidian/60">PT</span>
                        )}
                      </div>

                      {/* Info & Quantity */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <Link
                          href={`/products/${item.slug}`}
                          onClick={closeDrawer}
                          className="font-medium text-xs sm:text-sm text-porcelain hover:text-electric-link transition-colors truncate block"
                        >
                          {item.name}
                        </Link>
                        <p className="text-[11px] text-ash truncate">Variant: {item.variantLabel}</p>

                        <div className="flex items-center justify-between pt-1">
                          <span className="text-xs sm:text-sm font-semibold text-porcelain">
                            ₹{item.price}
                          </span>

                          {/* Stepper with 44px touch targets */}
                          <div className="flex items-center bg-carbon border border-steel/50 rounded-pill p-0.5">
                            <button
                              onClick={() => updateQty(item.productId, item.variantId, item.qty - 1)}
                              aria-label="Decrease quantity"
                              className="w-8 h-8 rounded-full flex items-center justify-center text-ash hover:text-porcelain active:scale-95"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="w-7 text-center text-xs font-semibold text-porcelain select-none">
                              {item.qty}
                            </span>
                            <button
                              onClick={() => updateQty(item.productId, item.variantId, item.qty + 1)}
                              disabled={item.qty >= Math.min(10, item.availableStock)}
                              aria-label="Increase quantity"
                              className="w-8 h-8 rounded-full flex items-center justify-center text-ash hover:text-porcelain disabled:opacity-30 active:scale-95"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        </div>

                        {item.isOutOfStock && (
                          <p className="text-[10px] text-error font-medium flex items-center gap-1 pt-0.5">
                            <AlertTriangle size={10} /> Insufficient stock ({item.availableStock} available)
                          </p>
                        )}
                      </div>

                      {/* Remove Button with 44px tap target */}
                      <button
                        onClick={() => removeItem(item.productId, item.variantId)}
                        aria-label="Remove item"
                        className="min-w-[44px] min-h-[44px] flex items-center justify-center text-ash hover:text-error transition-colors shrink-0"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Sticky Footer Checkout Summary per STEP 3 */}
              {hydratedItems.length > 0 && (
                <div className="p-4 sm:p-6 border-t border-steel/30 bg-graphite/95 backdrop-blur-md space-y-3.5 pb-safe shrink-0">
                  {hasStockIssue && (
                    <div className="bg-error/15 border border-error/30 text-error text-xs p-2.5 rounded-tile flex items-center gap-2">
                      <AlertTriangle size={14} className="shrink-0" />
                      <span>Adjust quantities to match available inventory.</span>
                    </div>
                  )}

                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-ash">
                      <span>Subtotal</span>
                      <span className="text-porcelain font-medium">₹{subtotal}</span>
                    </div>
                    <div className="flex justify-between text-ash">
                      <span>Delivery (Hospital Campus)</span>
                      <span className={isFreeDelivery ? "text-success font-semibold" : "text-porcelain font-medium"}>
                        {isFreeDelivery ? "FREE" : `₹${deliveryCharge}`}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm sm:text-base font-bold text-porcelain pt-2 border-t border-steel/20">
                      <span>Total</span>
                      <span className="text-apple-blue">₹{total}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <Link
                      href="/cart"
                      onClick={closeDrawer}
                      className="min-h-[44px] bg-transparent hover:bg-steel/30 text-porcelain border border-slate text-center text-xs font-semibold py-2.5 px-4 rounded-pill transition-colors flex items-center justify-center"
                    >
                      View Cart
                    </Link>

                    <Link
                      href={hasStockIssue ? "#" : "/checkout"}
                      onClick={(e) => {
                        if (hasStockIssue) e.preventDefault();
                        else closeDrawer();
                      }}
                      className={`min-h-[44px] text-white text-center text-xs font-semibold py-2.5 px-4 rounded-pill transition-transform active:scale-95 flex items-center justify-center gap-1.5 shadow-md ${
                        hasStockIssue
                          ? "bg-steel/60 text-ash cursor-not-allowed"
                          : "bg-apple-blue hover:bg-apple-blue/90"
                      }`}
                    >
                      <span>Checkout</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
