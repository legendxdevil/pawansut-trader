"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Cookie, X } from "lucide-react";

export function CookieNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const consented = localStorage.getItem("pt_cookie_ok");
      if (!consented) {
        setVisible(true);
      }
    } catch {
      // Ignore if localStorage unavailable
    }
  }, []);

  const handleAcknowledge = () => {
    try {
      localStorage.setItem("pt_cookie_ok", "true");
    } catch {
      // Ignore
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <aside
      aria-label="Essential storage notice"
      className="fixed bottom-0 left-0 right-0 z-45 p-3 sm:p-4 pb-[max(0.75rem,env(safe-area-inset-bottom,0.75rem))] bg-neutral-900/95 backdrop-blur-md border-t border-neutral-800 text-white shadow-2xl transition-all"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-2.5 text-xs sm:text-sm text-neutral-300">
          <Cookie className="w-5 h-5 text-amber-400 shrink-0" />
          <p>
            We use only essential storage (cart, wishlist, preferences).{" "}
            <Link
              href="/cookies-policy"
              className="text-white underline underline-offset-2 hover:text-neutral-300 font-medium ml-1"
            >
              Learn more
            </Link>
            .
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
          <button
            onClick={handleAcknowledge}
            className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 rounded-pill bg-white text-black text-xs sm:text-sm font-semibold hover:bg-neutral-200 transition-colors flex items-center justify-center active:scale-95"
          >
            Got it
          </button>
          <button
            onClick={handleAcknowledge}
            aria-label="Close cookie banner"
            className="min-w-[44px] min-h-[44px] rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors hidden sm:inline-flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
