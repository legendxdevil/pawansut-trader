"use client";

import React, { useState, useMemo } from "react";
import { Search, Filter, SlidersHorizontal } from "lucide-react";
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

  return (
    <div className="space-y-8">
      {/* Search & Filter Toolbar */}
      <div className="bg-carbon rounded-tile border border-steel/30 p-4 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          {/* Search Input */}
          <div className="relative w-full sm:max-w-md">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ash" />
            <input
              type="text"
              placeholder="Search chargers, cables, earbuds..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[rgba(255,255,255,0.04)] text-porcelain pl-11 pr-4 py-2.5 rounded-pill border border-slate focus:border-apple-blue transition-colors text-sm placeholder:text-ash"
            />
          </div>

          {/* Sort Selector & In-Stock Switch */}
          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-porcelain/90 select-none">
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
                className="bg-[rgba(255,255,255,0.04)] text-porcelain text-xs py-2 px-3 rounded-pill border border-slate focus:border-apple-blue"
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

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-2 scrollbar-none text-xs">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-4 py-1.5 rounded-pill whitespace-nowrap transition-colors ${
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
              className={`px-4 py-1.5 rounded-pill whitespace-nowrap transition-colors ${
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

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-ash px-1">
        <span>
          Showing <strong className="text-porcelain">{filteredProducts.length}</strong> items
        </span>
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="text-electric-link hover:underline"
          >
            Clear search
          </button>
        )}
      </div>

      {/* Grid or Empty State */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {filteredProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <div className="bg-carbon/50 rounded-tile border border-steel/20 p-12 text-center space-y-3">
          <Filter size={32} className="mx-auto text-ash/60" />
          <h3 className="text-lg font-semibold text-porcelain">No products found</h3>
          <p className="text-ash text-xs max-w-sm mx-auto">
            Try adjusting your search query, selecting another category, or unchecking &quot;In stock only&quot;.
          </p>
          <button
            onClick={() => {
              setSearchTerm("");
              setSelectedCategory("all");
              setOnlyInStock(false);
            }}
            className="bg-steel/50 hover:bg-steel text-porcelain text-xs px-4 py-2 rounded-pill font-medium"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}
