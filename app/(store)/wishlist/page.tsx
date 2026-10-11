"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Heart, Trash2, ShoppingBag } from "lucide-react";
import { STORE_CONFIG } from "@/lib/store-config";
import type { Product } from "@/types";
import { useCart } from "@/lib/cart-context";

import type { HydratedCartItem } from "@/app/api/cart/resolve/route";

export default function WishlistPage() {
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORE_CONFIG.wishlistStorageKey);
      if (stored) {
        const ids: string[] = JSON.parse(stored);
        setWishlistIds(ids);
      }
    } catch {
      // Ignore
    }
  }, []);

  useEffect(() => {
    async function loadWishlistProducts() {
      if (wishlistIds.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Fetch all products or matching products
        const res = await fetch("/api/cart/resolve", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: wishlistIds.map((id) => ({ productId: id, variantId: "default", qty: 1 })),
          }),
        });

        if (res.ok) {
          const json = await res.json();
          if (json.data?.items) {
            // Map hydrated items to simple product representations
            const list: Product[] = json.data.items.map((item: HydratedCartItem) => ({
              id: item.productId,
              name: item.name,
              slug: item.slug,
              price: item.price,
              mrp: item.mrp,
              images: item.image ? [item.image] : [],
              variants: [{ id: item.variantId, label: item.variantLabel, stock: item.availableStock }],
              warranty: item.warranty || { enabled: false, months: 0 },
              isActive: item.isActive,
              isFeatured: false,
              isNew: false,
              category: "accessories",
              tags: [],
              specs: [],
              description: "",
              ratingAvg: 4.8,
              ratingCount: 10,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            }));
            setProducts(list);
          }
        }
      } catch (e) {
        console.error("Failed to load wishlist items:", e);
      } finally {
        setLoading(false);
      }
    }

    loadWishlistProducts();
  }, [wishlistIds]);

  const removeFromWishlist = (id: string) => {
    const updated = wishlistIds.filter((item) => item !== id);
    setWishlistIds(updated);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    try {
      localStorage.setItem(STORE_CONFIG.wishlistStorageKey, JSON.stringify(updated));
      window.dispatchEvent(new Event("pt_wishlist_updated"));
    } catch {
      // Ignore
    }
  };

  const handleMoveToCart = (product: Product) => {
    const variantId = product.variants?.[0]?.id || "default";
    addToCart(product.id, variantId, 1);
    removeFromWishlist(product.id);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-ash text-sm">
        Loading saved products...
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 bg-carbon rounded-full flex items-center justify-center mx-auto text-ash/60 border border-steel/30">
          <Heart size={28} />
        </div>
        <h1 className="text-2xl font-semibold text-porcelain tracking-tight">Your Wishlist is Empty</h1>
        <p className="text-ash text-sm max-w-sm mx-auto">
          Tap the heart icon on any product to save it for later.
        </p>
        <Link
          href="/products"
          className="inline-block bg-apple-blue hover:bg-apple-blue/90 text-white text-sm font-medium px-6 py-2.5 rounded-pill transition-transform active:scale-95"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div className="space-y-1 border-b border-steel/30 pb-4">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
          Saved Wishlist ({products.length})
        </h1>
        <p className="text-ash text-xs">Products you have saved in your browser.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
        {products.map((p) => {
          const isOutOfStock = p.variants?.[0]?.stock <= 0;
          return (
            <div
              key={p.id}
              className="bg-carbon rounded-tile border border-steel/30 p-3 sm:p-4 flex flex-col justify-between space-y-3 sm:space-y-4 group"
            >
              <div className="space-y-2 sm:space-y-3">
                {/* 28px White canvas */}
                <Link href={`/products/${p.slug}`} className="block">
                  <div className="bg-white rounded-tile h-32 sm:h-44 flex items-center justify-center p-2 sm:p-4 relative group-hover:scale-[1.02] transition-transform">
                    {p.images && p.images[0] ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={p.images[0]}
                        alt={p.name}
                        className="max-h-full max-w-full object-contain mix-blend-multiply"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <span className="text-xs font-bold text-obsidian/60">PT</span>
                    )}

                    {isOutOfStock && (
                      <div className="absolute inset-0 bg-obsidian/60 flex items-center justify-center rounded-tile">
                        <span className="bg-error text-white text-[10px] sm:text-xs font-semibold px-2 py-0.5 sm:px-3 sm:py-1 rounded-pill">
                          Out of Stock
                        </span>
                      </div>
                    )}
                  </div>
                </Link>

                <div>
                  <Link href={`/products/${p.slug}`}>
                    <h3 className="font-semibold text-xs sm:text-sm text-porcelain hover:text-electric-link transition-colors line-clamp-2 leading-snug">
                      {p.name}
                    </h3>
                  </Link>
                  <p className="text-xs sm:text-sm font-bold text-porcelain mt-1">₹{p.price}</p>
                </div>
              </div>

              {/* Actions: Move to cart & Remove */}
              <div className="flex items-center gap-1.5 sm:gap-2 pt-2 border-t border-steel/20">
                <button
                  onClick={() => handleMoveToCart(p)}
                  disabled={isOutOfStock}
                  className="flex-1 bg-apple-blue hover:bg-apple-blue/90 disabled:bg-steel/50 disabled:text-ash text-white text-xs font-medium py-2.5 px-2 sm:px-3 rounded-pill transition-transform active:scale-95 flex items-center justify-center gap-1 min-h-[44px]"
                >
                  <ShoppingBag size={14} className="shrink-0" />
                  <span className="truncate">Add to Cart</span>
                </button>

                <button
                  onClick={() => removeFromWishlist(p.id)}
                  aria-label="Remove from wishlist"
                  className="p-2 sm:p-2.5 text-ash hover:text-error transition-colors rounded-full hover:bg-steel/30 min-w-[44px] min-h-[44px] flex items-center justify-center shrink-0"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
