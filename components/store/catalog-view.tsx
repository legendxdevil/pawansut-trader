"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Search, Filter, SlidersHorizontal, X, Check, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Product, Category } from "@/types";
import { ProductCard } from "@/components/store/product-card";

interface CatalogViewProps {
  initialProducts: Product[];
  categories: Category[];
  initialCategory?: string;
  initialSearch?: string;
}

export function CatalogView({
  initialProducts,
  categories,
  initialCategory = "all",
  initialSearch = "",
}: CatalogViewProps) {
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [sortBy, setSortBy] = useState<"newest" | "price-asc" | "price-desc" | "name">("newest");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Temporary state for the mobile bottom sheet filter
  const [tempCategory, setTempCategory] = useState(selectedCategory);
  const [tempOnlyInStock, setTempOnlyInStock] = useState(onlyInStock);
  const [tempSortBy, setTempSortBy] = useState(sortBy);

  // Sync temp state when opening mobile sheet
  const handleOpenMobileFilter = () => {
    setTempCategory(selectedCategory);
    setTempOnlyInStock(onlyInStock);
    setTempSortBy(sortBy);
    setMobileFilterOpen(true);
  };

  const handleApplyMobileFilter = () => {
    setSelectedCategory(tempCategory);
    setOnlyInStock(tempOnlyInStock);
    setSortBy(tempSortBy);
    setMobileFilterOpen(false);
  };

  const handleResetMobileFilter = () => {
    setTempCategory("all");
    setTempOnlyInStock(false);
    setTempSortBy("newest");
    setSelectedCategory("all");
    setOnlyInStock(false);
    setSortBy("newest");
    setMobileFilterOpen(false);
  };

  // Prevent body scroll when filter bottom sheet is open
  useEffect(() => {
    if (mobileFilterOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileFilterOpen]);

  // Client-side search and filtering over initial loaded products (§7.3)
  const filteredProducts = useMemo(() => {
    let result = [...initialProducts];

    // Category filter
    if (selectedCategory && selectedCategory !== "all") {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // In-stock filter
    if (onlyInStock) {
      result = result.filter((p) => p.variants.some((v) => v.stock > 0));
    }

    // Search term filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Sorting
    switch (sortBy) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "name":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "newest":
      default:
        result.sort((a, b) => b.createdAt - a.createdAt);
        break;
    }

    return result;
  }, [initialProducts, selectedCategory, onlyInStock, searchTerm, sortBy]);

  const activeFiltersCount =
    (selectedCategory !== "all" ? 1 : 0) +
    (onlyInStock ? 1 : 0) +
    (sortBy !== "newest" ? 1 : 0);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Search & Filter Toolbar */}
      <div className="bg-carbon rounded-tile border border-steel/30 p-3.5 sm:p-6 space-y-4">
        {/* Top Bar: Search Input + Mobile Filter Button */}
        <div className="flex items-center gap-2.5 sm:gap-4 justify-between">
          {/* Search Input (16px font to prevent Safari zoom) */}
          <div className="relative flex-1 max-w-full sm:max-w-md">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ash" />
            <input
              type="text"
              placeholder="Search chargers, cables, audio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[rgba(255,255,255,0.04)] text-porcelain pl-11 pr-4 py-2.5 rounded-pill border border-slate focus:border-apple-blue transition-colors text-base sm:text-sm placeholder:text-ash"
            />
          </div>

          {/* Mobile Filter Sheet Trigger Button (Visible only on < sm) */}
          <button
            type="button"
            onClick={handleOpenMobileFilter}
            className="sm:hidden min-h-[44px] px-4 rounded-pill bg-steel/40 border border-steel/60 text-porcelain text-xs font-semibold flex items-center gap-2 shrink-0 active:scale-95"
            aria-label="Open filter options"
          >
            <SlidersHorizontal size={14} className="text-apple-blue" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-apple-blue text-white text-[10px] font-bold flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Desktop Controls (hidden on mobile, shown on sm+) */}
          <div className="hidden sm:flex items-center gap-4 shrink-0">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-porcelain/90 select-none min-h-[44px]">
              <input
                type="checkbox"
                checked={onlyInStock}
                onChange={(e) => setOnlyInStock(e.target.checked)}
                className="w-4 h-4 rounded border-steel bg-carbon text-apple-blue focus:ring-0"
              />
              <span>In stock only</span>
            </label>

            <div className="flex items-center gap-2">
              <SlidersHorizontal size={14} className="text-ash" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "newest" | "price-asc" | "price-desc" | "name")}
                aria-label="Sort products"
                className="bg-[rgba(255,255,255,0.04)] text-porcelain text-xs py-2 px-3 rounded-pill border border-slate focus:border-apple-blue min-h-[44px]"
              >
                <option value="newest" className="bg-carbon text-porcelain">
                  Newest First
                </option>
                <option value="price-asc" className="bg-carbon text-porcelain">
                  Price: Low to High
                </option>
                <option value="price-desc" className="bg-carbon text-porcelain">
                  Price: High to Low
                </option>
                <option value="name" className="bg-carbon text-porcelain">
                  Alphabetical
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* Desktop Category Pills (scrollable on sm+) */}
        <div className="hidden sm:flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none text-xs">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`min-h-[36px] px-4 py-1.5 rounded-pill whitespace-nowrap transition-colors flex items-center ${
              selectedCategory === "all"
                ? "bg-apple-blue text-white font-medium"
                : "bg-steel/40 text-porcelain/80 hover:bg-steel"
            }`}
          >
            All Categories
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.slug)}
              className={`min-h-[36px] px-4 py-1.5 rounded-pill whitespace-nowrap transition-colors flex items-center ${
                selectedCategory === c.slug
                  ? "bg-apple-blue text-white font-medium"
                  : "bg-steel/40 text-porcelain/80 hover:bg-steel"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count & Active Filter Pills */}
      <div className="flex items-center justify-between text-xs text-ash px-1">
        <span>
          Showing <strong className="text-porcelain">{filteredProducts.length}</strong> items
        </span>
        {(searchTerm || selectedCategory !== "all" || onlyInStock || sortBy !== "newest") && (
          <button
            onClick={() => {
              setSearchTerm("");
              setSelectedCategory("all");
              setOnlyInStock(false);
              setSortBy("newest");
            }}
            className="text-electric-link hover:underline min-h-[36px] flex items-center gap-1 font-medium"
          >
            <RotateCcw size={12} />
            Reset all
          </button>
        )}
      </div>

      {/* 2-Column Mobile Product Grid (2 cols at 360-639px, 3 at md, 4 at lg) per STEP 3 */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {filteredProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <div className="bg-carbon/50 rounded-tile border border-steel/20 p-8 sm:p-14 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-steel/30 flex items-center justify-center mx-auto text-ash">
            <Filter size={24} />
          </div>
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-semibold text-porcelain">
              {initialProducts.length === 0 ? "Products Coming Soon" : "No products found"}
            </h3>
            <p className="text-ash text-xs max-w-sm mx-auto leading-relaxed">
              {initialProducts.length === 0
                ? "Our catalog is being stocked with authentic, premium accessories. Products added from the Admin Panel will appear here live."
                : "Try adjusting your search query, selecting another category, or unchecking 'In stock only'."}
            </p>
          </div>
          {initialProducts.length > 0 && (
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("all");
                setOnlyInStock(false);
                setSortBy("newest");
              }}
              className="bg-steel/50 hover:bg-steel text-porcelain text-xs px-5 py-2.5 rounded-pill font-medium min-h-[44px]"
            >
              Reset Filters
            </button>
          )}
        </div>
      )}

      {/* Mobile Filters Bottom Sheet Modal (Framer Motion) per STEP 3 */}
      <AnimatePresence>
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 sm:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileFilterOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            {/* Bottom Sheet Modal */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="absolute bottom-0 inset-x-0 bg-carbon rounded-t-[28px] border-t border-steel/50 max-h-[85vh] max-h-[85dvh] flex flex-col justify-between overflow-hidden shadow-2xl pb-safe"
            >
              {/* Sheet Drag Handle & Header */}
              <div className="p-4 border-b border-steel/30 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal size={16} className="text-apple-blue" />
                  <h3 className="text-base font-bold text-porcelain">Filter &amp; Sort</h3>
                </div>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  aria-label="Close filters"
                  className="min-w-[44px] min-h-[44px] -mr-2 flex items-center justify-center text-ash hover:text-porcelain"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Scrollable Sheet Content */}
              <div className="p-4 overflow-y-auto space-y-6 flex-1 text-xs">
                {/* Category Selection */}
                <div className="space-y-2.5">
                  <label className="font-semibold text-porcelain uppercase tracking-wider text-[11px] block">
                    Category
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setTempCategory("all")}
                      className={`min-h-[44px] px-3.5 py-2 rounded-pill font-medium border transition-colors flex items-center gap-1.5 ${
                        tempCategory === "all"
                          ? "bg-apple-blue border-apple-blue text-white"
                          : "bg-graphite border-steel/50 text-porcelain/80"
                      }`}
                    >
                      {tempCategory === "all" && <Check size={12} />}
                      All Categories
                    </button>
                    {categories.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setTempCategory(c.slug)}
                        className={`min-h-[44px] px-3.5 py-2 rounded-pill font-medium border transition-colors flex items-center gap-1.5 ${
                          tempCategory === c.slug
                            ? "bg-apple-blue border-apple-blue text-white"
                            : "bg-graphite border-steel/50 text-porcelain/80"
                        }`}
                      >
                        {tempCategory === c.slug && <Check size={12} />}
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sort Option */}
                <div className="space-y-2.5">
                  <label className="font-semibold text-porcelain uppercase tracking-wider text-[11px] block">
                    Sort Order
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "newest", label: "Newest First" },
                      { id: "price-asc", label: "Price: Low to High" },
                      { id: "price-desc", label: "Price: High to Low" },
                      { id: "name", label: "Alphabetical" },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setTempSortBy(opt.id as "newest" | "price-asc" | "price-desc" | "name")}
                        className={`min-h-[44px] px-3 py-2 rounded-2xl font-medium border transition-colors text-center flex items-center justify-center ${
                          tempSortBy === opt.id
                            ? "bg-apple-blue/20 border-apple-blue text-white"
                            : "bg-graphite border-steel/40 text-porcelain/80"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Availability Toggle */}
                <div className="space-y-2.5 pt-2 border-t border-steel/30">
                  <label className="flex items-center justify-between p-3 rounded-2xl bg-graphite border border-steel/40 cursor-pointer min-h-[48px]">
                    <span className="font-medium text-porcelain text-xs">In Stock Only</span>
                    <input
                      type="checkbox"
                      checked={tempOnlyInStock}
                      onChange={(e) => setTempOnlyInStock(e.target.checked)}
                      className="w-5 h-5 rounded border-steel bg-carbon text-apple-blue focus:ring-0"
                    />
                  </label>
                </div>
              </div>

              {/* Sheet Actions (Apply / Clear) with 44px min touch height */}
              <div className="p-4 border-t border-steel/30 bg-graphite/90 grid grid-cols-2 gap-3 shrink-0">
                <button
                  type="button"
                  onClick={handleResetMobileFilter}
                  className="min-h-[44px] py-3 rounded-pill bg-steel/40 hover:bg-steel text-porcelain text-xs font-semibold flex items-center justify-center transition-colors active:scale-95"
                >
                  Clear All
                </button>
                <button
                  type="button"
                  onClick={handleApplyMobileFilter}
                  className="min-h-[44px] py-3 rounded-pill bg-apple-blue hover:bg-apple-blue/90 text-white text-xs font-semibold flex items-center justify-center transition-colors active:scale-95 shadow-md"
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
