"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import type { Banner } from "@/types";

interface HeroSliderProps {
  banners: Banner[];
}

/**
 * Slide Image renderer supporting responsive art direction:
 * On mobile (< 768px), downloads only mobileImageUrl if present.
 * On desktop (>= 768px), downloads only imageUrl.
 * Uses high-performance native HTML5 picture and img elements to support
 * both local /uploads/ and remote CDN URLs seamlessly without optimizer 400 errors.
 */
function SlideImage({ banner, isFirst }: { banner: Banner; isFirst: boolean }) {
  if (banner.mobileImageUrl) {
    return (
      <picture className="w-full h-full block">
        <source
          media="(max-width: 767px)"
          srcSet={banner.mobileImageUrl}
        />
        <source
          media="(min-width: 768px)"
          srcSet={banner.imageUrl}
        />
        <img
          src={banner.imageUrl}
          alt={banner.alt}
          loading={isFirst ? "eager" : "lazy"}
          decoding="async"
          className="w-full h-full object-cover select-none pointer-events-none"
        />
      </picture>
    );
  }

  return (
    <img
      src={banner.imageUrl}
      alt={banner.alt}
      loading={isFirst ? "eager" : "lazy"}
      decoding="async"
      className="w-full h-full object-cover select-none pointer-events-none"
    />
  );
}

export function HeroSlider({ banners }: HeroSliderProps) {
  const activeBanners = banners.filter((b) => b.isActive);
  const bannerCount = activeBanners.length;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const nextSlide = useCallback(() => {
    if (bannerCount <= 1) return;
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % bannerCount);
  }, [bannerCount]);

  const prevSlide = useCallback(() => {
    if (bannerCount <= 1) return;
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + bannerCount) % bannerCount);
  }, [bannerCount]);

  const goToSlide = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  // Autoplay effect (~5s, pauses on hover/focus/touch, stops if prefers-reduced-motion or only 1 banner)
  useEffect(() => {
    if (bannerCount <= 1 || isPaused || prefersReducedMotion) {
      return;
    }

    const timer = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(timer);
  }, [bannerCount, isPaused, prefersReducedMotion, nextSlide]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (bannerCount <= 1) return;
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      prevSlide();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      nextSlide();
    }
  };

  // If 0 active banners: render nothing (no empty gap per spec)
  if (bannerCount === 0) {
    return null;
  }

  const currentBanner = activeBanners[currentIndex];
  if (!currentBanner) {
    return null;
  }

  const slideContent = (
    <div className="w-full h-full relative">
      <SlideImage banner={currentBanner} isFirst={currentIndex === 0} />
      {/* Subtle bottom vignette keyline to blend into dark obsidian background */}
      <div className="absolute inset-0 bg-gradient-to-t from-obsidian/70 via-transparent to-transparent pointer-events-none" />
    </div>
  );

  return (
    <section
      ref={containerRef}
      role="region"
      aria-roledescription="carousel"
      aria-label="Hero Highlights"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
      className="relative w-full overflow-hidden bg-obsidian focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-apple-blue aspect-[4/3] sm:aspect-[16/9] md:aspect-[8/3] max-h-[600px] border-b border-steel/20"
    >
      {/* Animated Slide container */}
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={currentBanner.id}
          custom={direction}
          variants={{
            enter: (dir: number) => ({
              x: prefersReducedMotion ? 0 : dir > 0 ? "100%" : "-100%",
              opacity: prefersReducedMotion ? 1 : 0.4,
            }),
            center: {
              x: 0,
              opacity: 1,
            },
            exit: (dir: number) => ({
              x: prefersReducedMotion ? 0 : dir > 0 ? "-100%" : "100%",
              opacity: prefersReducedMotion ? 1 : 0.4,
            }),
          }}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "tween", ease: "easeInOut", duration: prefersReducedMotion ? 0 : 0.4 },
            opacity: { duration: prefersReducedMotion ? 0 : 0.25 },
          }}
          drag={bannerCount > 1 && !prefersReducedMotion ? "x" : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={(e, { offset, velocity }) => {
            const swipeThreshold = 50;
            if (offset.x < -swipeThreshold || velocity.x < -500) {
              nextSlide();
            } else if (offset.x > swipeThreshold || velocity.x > 500) {
              prevSlide();
            }
          }}
          className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
          role="group"
          aria-roledescription="slide"
          aria-label={`Slide ${currentIndex + 1} of ${bannerCount}: ${currentBanner.alt}`}
        >
          {currentBanner.link ? (
            <Link
              href={currentBanner.link}
              className="w-full h-full block focus-visible:outline-none"
              tabIndex={-1}
            >
              {slideContent}
            </Link>
          ) : (
            slideContent
          )}
        </motion.div>
      </AnimatePresence>

      {/* Desktop Prev / Next Navigation Arrows (Hidden on mobile per spec) */}
      {bannerCount > 1 && (
        <div className="hidden md:flex absolute inset-y-0 inset-x-4 items-center justify-between pointer-events-none z-10">
          <button
            type="button"
            onClick={prevSlide}
            aria-label="Previous slide"
            className="w-11 h-11 rounded-full bg-obsidian/60 hover:bg-obsidian/90 text-porcelain border border-steel/40 backdrop-blur-md flex items-center justify-center pointer-events-auto transition-transform active:scale-95 shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-apple-blue"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            type="button"
            onClick={nextSlide}
            aria-label="Next slide"
            className="w-11 h-11 rounded-full bg-obsidian/60 hover:bg-obsidian/90 text-porcelain border border-steel/40 backdrop-blur-md flex items-center justify-center pointer-events-auto transition-transform active:scale-95 shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-apple-blue"
          >
            <ChevronRight size={22} />
          </button>
        </div>
      )}

      {/* Pagination Dots (At least 44x44px touch targets) */}
      {bannerCount > 1 && (
        <div className="absolute bottom-3 sm:bottom-4 inset-x-0 flex items-center justify-center gap-1 z-10 pointer-events-auto">
          {activeBanners.map((banner, idx) => (
            <button
              key={banner.id}
              type="button"
              onClick={() => goToSlide(idx)}
              aria-label={`Go to slide ${idx + 1} of ${bannerCount}`}
              aria-current={currentIndex === idx ? "true" : "false"}
              className="w-11 h-11 flex items-center justify-center focus-visible:outline-none"
            >
              <span
                className={`block rounded-full transition-all duration-300 ${
                  currentIndex === idx
                    ? "w-6 sm:w-8 h-1.5 bg-porcelain"
                    : "w-2 h-1.5 bg-white/40 hover:bg-white/70"
                }`}
              />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
