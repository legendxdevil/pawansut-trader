import React from "react";
import { Truck, ShieldCheck } from "lucide-react";
import type { StoreSettings } from "@/types";

interface HeroInfoStripProps {
  settings: StoreSettings;
}

export function HeroInfoStrip({ settings }: HeroInfoStripProps) {
  return (
    <div className="border-b border-steel/20 bg-graphite/40 py-2.5 px-4">
      <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-center gap-x-6 gap-y-1.5 text-xs text-ash text-center">
        <div className="flex items-center gap-2">
          <Truck size={14} className="text-apple-blue shrink-0" />
          <span>
            Free delivery above ₹{settings.freeDeliveryAbove} (else ₹{settings.deliveryCharge})
          </span>
        </div>
        <span className="hidden sm:inline text-steel">•</span>
        <div className="flex items-center gap-2">
          <ShieldCheck size={14} className="text-optical-yellow shrink-0" />
          <span>Physical warranty card with warranty products</span>
        </div>
      </div>
    </div>
  );
}
