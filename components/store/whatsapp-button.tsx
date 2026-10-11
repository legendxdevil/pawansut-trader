"use client";

import React from "react";
import { MessageCircle } from "lucide-react";
import { STORE_CONFIG } from "@/lib/store-config";

export function WhatsAppButton() {
  const greeting = encodeURIComponent("Hello Pawansut Trader! I would like to inquire about your products.");
  const whatsappUrl = `https://wa.me/${STORE_CONFIG.whatsappFullNumber}?text=${greeting}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Pawansut Trader on WhatsApp"
      className="fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom,0px))] right-4 sm:right-6 z-40 bg-[#25D366] hover:bg-[#20bd5a] text-white p-3 sm:p-3.5 min-w-[48px] min-h-[48px] rounded-full shadow-lg transition-transform active:scale-95 flex items-center justify-center group"
    >
      <MessageCircle size={24} className="fill-current text-white shrink-0" />
      <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 ease-in-out text-xs font-semibold px-0 group-hover:px-2">
        Chat with us
      </span>
    </a>
  );
}
