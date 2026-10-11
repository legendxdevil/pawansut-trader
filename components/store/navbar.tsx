"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShoppingBag, Heart, Search, Menu, X, Smartphone } from "lucide-react";
import { STORE_CONFIG } from "@/lib/store-config";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-obsidian border-b border-steel/30 sticky top-0 z-40 h-[44px] flex items-center px-4 transition-colors">
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
        {/* Brand */}
        <Link
          href="/"
          className="flex items-center gap-2 text-porcelain font-semibold text-sm tracking-tight hover:opacity-90"
        >
          <Smartphone size={16} className="text-apple-blue" />
          <span>{STORE_CONFIG.storeName}</span>
        </Link>

        {/* Desktop Links (12px labels at 80% white per §5.4) */}
        <div className="hidden md:flex items-center space-x-6 text-[12px] text-porcelain/80">
          <Link href="/products" className="hover:text-porcelain transition-colors">
            All Products
          </Link>
          <Link href="/category/chargers-adapters" className="hover:text-porcelain transition-colors">
            Chargers
          </Link>
          <Link href="/category/cables" className="hover:text-porcelain transition-colors">
            Cables
          </Link>
          <Link href="/category/earphones-headphones" className="hover:text-porcelain transition-colors">
            Audio
          </Link>
          <Link href="/category/power-banks" className="hover:text-porcelain transition-colors">
            Power Banks
          </Link>
          <Link href="/track" className="hover:text-porcelain transition-colors">
            Track Order
          </Link>
          <Link href="/contact" className="hover:text-porcelain transition-colors">
            Contact
          </Link>
        </div>

        {/* Action icons */}
        <div className="flex items-center space-x-4 text-[#cccccc]">
          <Link href="/products" aria-label="Search Catalog" className="hover:text-porcelain transition-colors">
            <Search size={16} />
          </Link>
          <Link href="/wishlist" aria-label="Wishlist" className="hover:text-porcelain transition-colors relative">
            <Heart size={16} />
          </Link>
          <Link href="/cart" aria-label="Shopping Cart" className="hover:text-porcelain transition-colors relative">
            <ShoppingBag size={16} />
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-[#cccccc] hover:text-porcelain"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-[44px] left-0 w-full bg-graphite border-b border-steel/40 p-4 space-y-3 z-50 text-sm">
          <Link
            href="/products"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-porcelain/90 hover:text-white py-1"
          >
            All Products
          </Link>
          <Link
            href="/category/chargers-adapters"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-porcelain/90 hover:text-white py-1"
          >
            Chargers & Adapters
          </Link>
          <Link
            href="/category/cables"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-porcelain/90 hover:text-white py-1"
          >
            Cables
          </Link>
          <Link
            href="/category/earphones-headphones"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-porcelain/90 hover:text-white py-1"
          >
            Earphones & Audio
          </Link>
          <Link
            href="/category/power-banks"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-porcelain/90 hover:text-white py-1"
          >
            Power Banks
          </Link>
          <Link
            href="/track"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-porcelain/90 hover:text-white py-1"
          >
            Track Order
          </Link>
          <Link
            href="/contact"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-porcelain/90 hover:text-white py-1"
          >
            Contact Store
          </Link>
        </div>
      )}
    </nav>
  );
}
