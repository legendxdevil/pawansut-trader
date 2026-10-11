"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { CartItem } from "@/types";
import { STORE_CONFIG } from "@/lib/store-config";
import type { HydratedCartItem } from "@/app/api/cart/resolve/route";

interface CartState {
  rawItems: CartItem[];
  hydratedItems: HydratedCartItem[];
  isLoading: boolean;
  itemCount: number;
  subtotal: number;
  deliveryCharge: number;
  isFreeDelivery: boolean;
  amountNeededForFree: number;
  total: number;
  hasStockIssue: boolean;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  addToCart: (productId: string, variantId: string, qty: number) => void;
  updateQty: (productId: string, variantId: string, qty: number) => void;
  removeItem: (productId: string, variantId: string) => void;
  clearCart: () => void;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartState | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [rawItems, setRawItems] = useState<CartItem[]>([]);
  const [hydratedItems, setHydratedItems] = useState<HydratedCartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [subtotal, setSubtotal] = useState(0);
  const [deliveryCharge, setDeliveryCharge] = useState(STORE_CONFIG.defaultDeliveryCharge);
  const [isFreeDelivery, setIsFreeDelivery] = useState(false);
  const [amountNeededForFree, setAmountNeededForFree] = useState(STORE_CONFIG.freeDeliveryAbove);
  const [total, setTotal] = useState(0);
  const [hasStockIssue, setHasStockIssue] = useState(false);

  // Sync server data for raw items
  const resolveServerCart = useCallback(async (itemsToResolve: CartItem[]) => {
    if (itemsToResolve.length === 0) {
      setHydratedItems([]);
      setSubtotal(0);
      setDeliveryCharge(STORE_CONFIG.defaultDeliveryCharge);
      setIsFreeDelivery(false);
      setAmountNeededForFree(STORE_CONFIG.freeDeliveryAbove);
      setTotal(0);
      setHasStockIssue(false);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch("/api/cart/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: itemsToResolve }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setHydratedItems(json.data.items);
          setSubtotal(json.data.subtotal);
          setDeliveryCharge(json.data.deliveryCharge);
          setIsFreeDelivery(json.data.isFreeDelivery);
          setAmountNeededForFree(json.data.amountNeededForFree);
          setTotal(json.data.total);
          setHasStockIssue(json.data.hasStockIssue);
        }
      }
    } catch (err) {
      console.error("Cart resolution failed:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initialize from localStorage
  const loadCartFromStorage = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORE_CONFIG.cartStorageKey);
      if (stored) {
        const parsed: CartItem[] = JSON.parse(stored);
        setRawItems(parsed);
        resolveServerCart(parsed);
      } else {
        setRawItems([]);
        resolveServerCart([]);
      }
    } catch {
      setRawItems([]);
      resolveServerCart([]);
    }
  }, [resolveServerCart]);

  useEffect(() => {
    loadCartFromStorage();

    const handleStorageChange = () => {
      loadCartFromStorage();
    };

    window.addEventListener("pt_cart_updated", handleStorageChange);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("pt_cart_updated", handleStorageChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [loadCartFromStorage]);

  const saveRawItems = (newItems: CartItem[]) => {
    setRawItems(newItems);
    try {
      localStorage.setItem(STORE_CONFIG.cartStorageKey, JSON.stringify(newItems));
      window.dispatchEvent(new Event("pt_cart_updated"));
    } catch (e) {
      console.error("Failed to save cart to localStorage:", e);
    }
    resolveServerCart(newItems);
  };

  const addToCart = (productId: string, variantId: string, qty: number) => {
    const existing = [...rawItems];
    const index = existing.findIndex(
      (item) => item.productId === productId && item.variantId === variantId
    );

    if (index > -1) {
      existing[index].qty = Math.min(10, existing[index].qty + qty);
    } else {
      existing.push({ productId, variantId, qty });
    }

    saveRawItems(existing);
    setIsDrawerOpen(true);
  };

  const updateQty = (productId: string, variantId: string, qty: number) => {
    if (qty <= 0) {
      removeItem(productId, variantId);
      return;
    }
    const updated = rawItems.map((item) => {
      if (item.productId === productId && item.variantId === variantId) {
        return { ...item, qty: Math.min(10, qty) };
      }
      return item;
    });
    saveRawItems(updated);
  };

  const removeItem = (productId: string, variantId: string) => {
    const updated = rawItems.filter(
      (item) => !(item.productId === productId && item.variantId === variantId)
    );
    saveRawItems(updated);
  };

  const clearCart = () => {
    saveRawItems([]);
  };

  const refreshCart = async () => {
    await resolveServerCart(rawItems);
  };

  const itemCount = rawItems.reduce((acc, item) => acc + item.qty, 0);

  return (
    <CartContext.Provider
      value={{
        rawItems,
        hydratedItems,
        isLoading,
        itemCount,
        subtotal,
        deliveryCharge,
        isFreeDelivery,
        amountNeededForFree,
        total,
        hasStockIssue,
        isDrawerOpen,
        openDrawer: () => setIsDrawerOpen(true),
        closeDrawer: () => setIsDrawerOpen(false),
        addToCart,
        updateQty,
        removeItem,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
