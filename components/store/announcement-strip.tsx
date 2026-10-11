"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Announcement } from "@/types";

interface AnnouncementStripProps {
  initialAnnouncements?: Announcement[];
}

export function AnnouncementStrip({ initialAnnouncements = [] }: AnnouncementStripProps) {
  const [announcements] = useState<Announcement[]>(initialAnnouncements);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (announcements.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [announcements.length, isPaused]);

  if (announcements.length === 0) {
    return null; // Render nothing when no active announcements (§7.1)
  }

  const current = announcements[currentIndex];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + announcements.length) % announcements.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % announcements.length);
  };

  return (
    <div
      className="w-full bg-carbon text-porcelain text-xs sm:text-sm font-medium py-1.5 relative z-20 select-none border-b border-steel/30"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      <div className="max-w-[1440px] mx-auto flex items-center justify-between min-h-[32px] px-2 sm:px-4 md:px-6 lg:px-8">
        {announcements.length > 1 && (
          <button
            onClick={handlePrev}
            aria-label="Previous announcement"
            className="text-ash hover:text-porcelain transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center -ml-2 shrink-0"
          >
            <ChevronLeft size={18} />
          </button>
        )}

        <div className="flex-1 overflow-hidden text-center mx-1 relative min-h-[24px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id || currentIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={(_, info) => {
                if (info.offset.x > 40) handlePrev();
                else if (info.offset.x < -40) handleNext();
              }}
              className="inline-flex items-center gap-1.5 max-w-full justify-center px-1 cursor-grab active:cursor-grabbing"
            >
              <span className="truncate max-w-[240px] sm:max-w-md md:max-w-xl text-xs sm:text-sm">
                {current.text}
              </span>
              {current.link && (
                <Link
                  href={current.link}
                  className="text-electric-link hover:underline shrink-0 font-semibold text-[11px] sm:text-xs ml-0.5"
                >
                  Learn more &rarr;
                </Link>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {announcements.length > 1 && (
          <button
            onClick={handleNext}
            aria-label="Next announcement"
            className="text-ash hover:text-porcelain transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center -mr-2 shrink-0"
          >
            <ChevronRight size={18} />
          </button>
        )}
      </div>

      {announcements.length > 1 && (
        <div className="flex justify-center items-center gap-1 -mt-1">
          {announcements.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              aria-label={`Go to announcement ${i + 1}`}
              className="min-w-[44px] min-h-[30px] flex items-center justify-center"
            >
              <span
                className={`h-1 rounded-pill transition-all block ${
                  i === currentIndex ? "w-5 bg-electric-link" : "w-1.5 bg-steel"
                }`}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
