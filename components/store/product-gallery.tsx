"use client";

import React, { useState } from "react";

interface ProductGalleryProps {
  images: string[];
  productName: string;
  category: string;
  isOutOfStock: boolean;
}

export function ProductGallery({
  images,
  productName,
  category,
  isOutOfStock,
}: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const validImages = images && images.length > 0 ? images : [];
  const activeImage = validImages[selectedIndex] || validImages[0];

  const handlePrev = () => {
    if (validImages.length <= 1) return;
    setSelectedIndex((prev) => (prev - 1 + validImages.length) % validImages.length);
  };

  const handleNext = () => {
    if (validImages.length <= 1) return;
    setSelectedIndex((prev) => (prev + 1) % validImages.length);
  };

  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (diff > 40) {
      handleNext();
    } else if (diff < -40) {
      handlePrev();
    }
    setTouchStartX(null);
  };

  return (
    <div className="space-y-4">
      {/* Main Image Tile (Pale White 28px Canvas with Touch Swipe per §5.4 & §7.4) */}
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="bg-white rounded-tile p-6 sm:p-12 flex items-center justify-center min-h-[300px] sm:min-h-[440px] relative overflow-hidden border border-steel/20 shadow-none touch-pan-y select-none"
      >
        {activeImage ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={activeImage}
            alt={productName}
            className="max-h-[320px] sm:max-h-[400px] max-w-full object-contain mix-blend-multiply transition-all duration-300"
            onError={(e) => {
              (e.target as HTMLElement).style.display = "none";
            }}
          />
        ) : (
          <div className="text-obsidian/40 flex flex-col items-center justify-center text-center p-4">
            <span className="text-4xl font-extrabold tracking-tight text-obsidian/80">PT</span>
            <span className="text-xs uppercase font-semibold text-obsidian/60 tracking-widest mt-1">
              {category.replace("-", " ")}
            </span>
          </div>
        )}

        {isOutOfStock && (
          <div className="absolute inset-0 bg-obsidian/60 flex items-center justify-center rounded-tile">
            <span className="bg-error text-white text-sm font-semibold px-4 py-2 rounded-pill">
              Out of Stock
            </span>
          </div>
        )}

        {validImages.length > 1 && (
          <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-[11px] font-mono px-2 py-0.5 rounded-full">
            {selectedIndex + 1}/{validImages.length}
          </div>
        )}
      </div>

      {/* Thumbnails list if multiple images per §7.4 */}
      {validImages.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1">
          {validImages.map((img, idx) => {
            const isSelected = idx === selectedIndex;
            return (
              <button
                key={`${img}-${idx}`}
                type="button"
                onClick={() => setSelectedIndex(idx)}
                aria-label={`View image ${idx + 1}`}
                className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white border-2 flex items-center justify-center overflow-hidden shrink-0 transition-all ${
                  isSelected
                    ? "border-apple-blue ring-2 ring-apple-blue/30 scale-105"
                    : "border-steel/20 opacity-70 hover:opacity-100"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img}
                  alt={`${productName} thumbnail ${idx + 1}`}
                  className="max-h-full max-w-full object-contain mix-blend-multiply p-1"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
