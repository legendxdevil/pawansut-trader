"use client";

import React from "react";
import { Printer } from "lucide-react";

export function InvoicePrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="bg-apple-blue hover:bg-apple-blue/90 text-white text-xs font-semibold px-4 py-2.5 rounded-pill flex items-center gap-1.5 cursor-pointer min-h-[44px] transition-transform active:scale-95"
    >
      <Printer size={16} />
      <span>Print / Save PDF (Ctrl+P)</span>
    </button>
  );
}
