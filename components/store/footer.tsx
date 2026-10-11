import React from "react";
import Link from "next/link";
import { STORE_CONFIG } from "@/lib/store-config";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-graphite border-t border-steel/30 text-ash text-sm py-12 px-4 mt-20 pb-[calc(5rem+env(safe-area-inset-bottom,0px))] md:pb-12">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-3">
            <h4 className="text-porcelain font-semibold text-base tracking-tight">{STORE_CONFIG.storeName}</h4>
            <p className="leading-relaxed text-sm">
              Premium mobile accessories designed for durability and performance. Serving Satyawadi Raja Harish Chandra Hospital, Delhi.
            </p>
            <p className="text-porcelain/90 font-medium text-sm pt-1">
              WhatsApp Support:{" "}
              <a
                href={`https://wa.me/${STORE_CONFIG.whatsappFullNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-electric-link hover:underline inline-block py-1 min-h-[36px]"
              >
                +91 {STORE_CONFIG.whatsappNumber}
              </a>
            </p>
          </div>

          {/* Quick Shop */}
          <div className="space-y-3">
            <h4 className="text-porcelain font-semibold text-base tracking-tight">Categories</h4>
            <ul className="space-y-1">
              <li>
                <Link href="/category/chargers-adapters" className="text-sm hover:text-porcelain transition-colors py-2 block min-h-[40px] flex items-center">
                  Chargers & Adapters
                </Link>
              </li>
              <li>
                <Link href="/category/cables" className="text-sm hover:text-porcelain transition-colors py-2 block min-h-[40px] flex items-center">
                  Cables & Cords
                </Link>
              </li>
              <li>
                <Link href="/category/earphones-headphones" className="text-sm hover:text-porcelain transition-colors py-2 block min-h-[40px] flex items-center">
                  Earphones & Audio
                </Link>
              </li>
              <li>
                <Link href="/category/power-banks" className="text-sm hover:text-porcelain transition-colors py-2 block min-h-[40px] flex items-center">
                  Power Banks
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service & Help */}
          <div className="space-y-3">
            <h4 className="text-porcelain font-semibold text-base tracking-tight">Customer Care</h4>
            <ul className="space-y-1">
              <li>
                <Link href="/track" className="text-sm hover:text-porcelain transition-colors py-2 block min-h-[40px] flex items-center">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link href="/cart" className="text-sm hover:text-porcelain transition-colors py-2 block min-h-[40px] flex items-center">
                  View Cart
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm hover:text-porcelain transition-colors py-2 block min-h-[40px] flex items-center">
                  Store & Contact Info
                </Link>
              </li>
              <li>
                <span className="text-porcelain/80 text-sm py-2 block min-h-[40px] flex items-center">Free delivery on orders ₹499+</span>
              </li>
            </ul>
          </div>

          {/* Policies */}
          <div className="space-y-3">
            <h4 className="text-porcelain font-semibold text-base tracking-tight">Legal & Policies</h4>
            <ul className="space-y-1">
              <li>
                <Link href="/refund-and-warranty-policy" className="text-sm hover:text-porcelain transition-colors py-2 block min-h-[40px] flex items-center">
                  Refund & Warranty Policy
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="text-sm hover:text-porcelain transition-colors py-2 block min-h-[40px] flex items-center">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-and-conditions" className="text-sm hover:text-porcelain transition-colors py-2 block min-h-[40px] flex items-center">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/cookies-policy" className="text-sm hover:text-porcelain transition-colors py-2 block min-h-[40px] flex items-center">
                  Cookies Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-steel/20 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© {currentYear} {STORE_CONFIG.storeName}. All rights reserved.</p>
          <p className="text-ash/80 text-center sm:text-right">
            Physical warranty card mandatory for claims. Delivery at Satyawadi Raja Harish Chandra Hospital, Delhi.
          </p>
        </div>
      </div>
    </footer>
  );
}
