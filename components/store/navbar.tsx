"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, ShoppingBag, Heart, Smartphone, Menu, X } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { STORE_CONFIG } from "@/lib/store-config";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const { itemCount, openDrawer } = useCart();

  useEffect(() => {
    const updateCount = () => {
      try {
        const stored = localStorage.getItem(STORE_CONFIG.wishlistStorageKey);
        if (stored) {
          const ids: string[] = JSON.parse(stored);
          setWishlistCount(ids.length);
        } else {
          setWishlistCount(0);
        }
      } catch {
        setWishlistCount(0);
      }
    };

    updateCount();
    window.addEventListener("pt_wishlist_updated", updateCount);
    window.addEventListener("storage", updateCount);
    return () => {
      window.removeEventListener("pt_wishlist_updated", updateCount);
      window.removeEventListener("storage", updateCount);
    };
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  return (
    <>
      <nav className="bg-obsidian/95 backdrop-blur-md border-b border-steel/30 sticky top-0 z-30 h-[44px] flex items-center px-3 sm:px-4 transition-colors">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          {/* Brand */}
          <Link
            href="/"
            className="flex items-center gap-2 text-porcelain font-semibold text-sm tracking-tight hover:opacity-90 min-h-[44px] py-1"
          >
            <Smartphone size={16} className="text-apple-blue shrink-0" />
            <span className="truncate">{STORE_CONFIG.storeName}</span>
          </Link>

          {/* Desktop Links (12px labels at 80% white per §5.4) */}
          <div className="hidden md:flex items-center space-x-6 text-[12px] text-porcelain/80">
            <Link href="/" className="hover:text-porcelain transition-colors py-2">
              Home
            </Link>
            <Link href="/products" className="hover:text-porcelain transition-colors py-2">
              All Products
            </Link>
            <Link href="/category/chargers-adapters" className="hover:text-porcelain transition-colors py-2">
              Chargers
            </Link>
            <Link href="/category/cables" className="hover:text-porcelain transition-colors py-2">
              Cables
            </Link>
            <Link href="/category/earphones-headphones" className="hover:text-porcelain transition-colors py-2">
              Audio
            </Link>
            <Link href="/category/power-banks" className="hover:text-porcelain transition-colors py-2">
              Power Banks
            </Link>
            <Link href="/track" className="hover:text-porcelain transition-colors py-2">
              Track Order
            </Link>
            <Link href="/contact" className="hover:text-porcelain transition-colors py-2">
              Contact
            </Link>
          </div>

          {/* Action icons with min 44x44px touch targets */}
          <div className="flex items-center -mr-1.5 sm:mr-0 text-[#cccccc]">
            <Link
              href="/products"
              aria-label="Search Catalog"
              className="min-w-[44px] min-h-[44px] flex items-center justify-center hover:text-porcelain transition-colors"
            >
              <Search size={18} />
            </Link>

            <Link
              href="/wishlist"
              aria-label="Wishlist"
              className="min-w-[44px] min-h-[44px] flex items-center justify-center hover:text-porcelain transition-colors relative"
            >
              <Heart size={18} />
              {wishlistCount > 0 && (
                <span className="absolute top-2 right-1.5 bg-error text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <button
              onClick={openDrawer}
              aria-label="Open Shopping Bag"
              className="min-w-[44px] min-h-[44px] flex items-center justify-center hover:text-porcelain transition-colors relative"
            >
              <ShoppingBag size={18} />
              {itemCount > 0 && (
                <span className="absolute top-2 right-1.5 bg-apple-blue text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                  {itemCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden min-w-[44px] min-h-[44px] flex items-center justify-center text-[#cccccc] hover:text-porcelain"
              aria-label={mobileMenuOpen ? "Close Navigation Menu" : "Open Navigation Menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Full-Height Mobile Navigation Sheet / Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* Sheet Content */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="relative w-4/5 max-w-sm h-full h-[100dvh] bg-carbon border-r border-steel/40 p-6 flex flex-col justify-between overflow-y-auto pb-safe pt-safe"
            >
              {/* Header */}
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-steel/30 pb-4">
                  <div className="flex items-center gap-2">
                    <Smartphone size={18} className="text-apple-blue" />
                    <span className="font-bold text-sm text-porcelain tracking-tight">
                      {STORE_CONFIG.storeName}
                    </span>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    aria-label="Close Menu"
                    className="min-w-[44px] min-h-[44px] -mr-3 flex items-center justify-center text-ash hover:text-porcelain"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Primary Large Navigation Links per STEP 3 */}
                <nav className="space-y-1">
                  <Link
                    href="/"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center min-h-[48px] px-3 rounded-2xl text-base font-semibold text-porcelain hover:bg-white/5 transition-colors"
                  >
                    Home
                  </Link>
                  <Link
                    href="/products"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center min-h-[48px] px-3 rounded-2xl text-base font-semibold text-porcelain hover:bg-white/5 transition-colors"
                  >
                    All Products
                  </Link>
                  <div className="py-2 pl-3 space-y-1 border-l-2 border-steel/40 ml-4 my-1 text-sm">
                    <Link
                      href="/category/chargers-adapters"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center min-h-[40px] text-ash hover:text-white"
                    >
                      Chargers &amp; Adapters
                    </Link>
                    <Link
                      href="/category/cables"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center min-h-[40px] text-ash hover:text-white"
                    >
                      Kevlar &amp; Braided Cables
                    </Link>
                    <Link
                      href="/category/earphones-headphones"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center min-h-[40px] text-ash hover:text-white"
                    >
                      Earphones &amp; Audio
                    </Link>
                    <Link
                      href="/category/power-banks"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center min-h-[40px] text-ash hover:text-white"
                    >
                      Power Banks
                    </Link>
                  </div>
                  <Link
                    href="/track"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center min-h-[48px] px-3 rounded-2xl text-base font-semibold text-porcelain hover:bg-white/5 transition-colors"
                  >
                    Track Order
                  </Link>
                  <Link
                    href="/wishlist"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center min-h-[48px] px-3 rounded-2xl text-base font-semibold text-porcelain hover:bg-white/5 transition-colors"
                  >
                    Wishlist ({wishlistCount})
                  </Link>
                  <Link
                    href="/contact"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center min-h-[48px] px-3 rounded-2xl text-base font-semibold text-porcelain hover:bg-white/5 transition-colors"
                  >
                    Contact Store
                  </Link>
                </nav>
              </div>

              {/* Footer info in Sheet */}
              <div className="border-t border-steel/20 pt-4 space-y-2 text-xs text-ash">
                <p className="text-porcelain font-medium">Free Hospital Delivery &ge; ₹499</p>
                <p className="text-[11px] leading-relaxed">
                  Delivered at Satyawadi Raja Harish Chandra Hospital, Delhi.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
