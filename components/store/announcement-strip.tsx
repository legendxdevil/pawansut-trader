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
      className="bg-carbon text-porcelain text-xs sm:text-sm font-medium py-2 px-4 relative z-30 select-none border-b border-steel/30"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between min-h-[24px]">
        {announcements.length > 1 && (
          <button
            onClick={handlePrev}
            aria-label="Previous announcement"
            className="text-ash hover:text-porcelain transition-colors p-1"
          >
            <ChevronLeft size={16} />
          </button>
        )}

        <div className="flex-1 overflow-hidden text-center mx-2 relative min-h-[20px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id || currentIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="inline-flex items-center gap-2"
            >
              <span>{current.text}</span>
              {current.link && (
                <Link
                  href={current.link}
                  className="text-electric-link hover:underline ml-1 font-semibold text-xs"
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
            className="text-ash hover:text-porcelain transition-colors p-1"
          >
            <ChevronRight size={16} />
          </button>
        )}
      </div>

      {announcements.length > 1 && (
        <div className="flex justify-center items-center gap-1.5 mt-1">
          {announcements.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              aria-label={`Go to announcement ${i + 1}`}
              className={`h-1 rounded-pill transition-all ${
                i === currentIndex ? "w-4 bg-electric-link" : "w-1.5 bg-steel"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
