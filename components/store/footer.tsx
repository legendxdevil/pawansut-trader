import React from "react";
import Link from "next/link";
import { STORE_CONFIG } from "@/lib/store-config";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-graphite border-t border-steel/30 text-ash text-xs py-12 px-4 mt-20">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-3">
            <h4 className="text-porcelain font-semibold text-sm tracking-tight">{STORE_CONFIG.storeName}</h4>
            <p className="leading-relaxed">
              Premium mobile accessories designed for durability and performance. Serving Satyawadi Raja Harish Chandra Hospital, Delhi.
            </p>
            <p className="text-porcelain/90 font-medium">
              WhatsApp Support:{" "}
              <a
                href={`https://wa.me/${STORE_CONFIG.whatsappFullNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-electric-link hover:underline"
              >
                +91 {STORE_CONFIG.whatsappNumber}
              </a>
            </p>
          </div>

          {/* Quick Shop */}
          <div className="space-y-3">
            <h4 className="text-porcelain font-semibold text-sm tracking-tight">Categories</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/category/chargers-adapters" className="hover:text-porcelain transition-colors">
                  Chargers & Adapters
                </Link>
              </li>
              <li>
                <Link href="/category/cables" className="hover:text-porcelain transition-colors">
                  Cables & Cords
                </Link>
              </li>
              <li>
                <Link href="/category/earphones-headphones" className="hover:text-porcelain transition-colors">
                  Earphones & Audio
                </Link>
              </li>
              <li>
                <Link href="/category/power-banks" className="hover:text-porcelain transition-colors">
                  Power Banks
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service & Help */}
          <div className="space-y-3">
            <h4 className="text-porcelain font-semibold text-sm tracking-tight">Customer Care</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/track" className="hover:text-porcelain transition-colors">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-porcelain transition-colors">
                  View Cart
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-porcelain transition-colors">
                  Store & Contact Info
                </Link>
              </li>
              <li>
                <span className="text-porcelain/80">Free delivery on orders ₹499+</span>
              </li>
            </ul>
          </div>

          {/* Policies */}
          <div className="space-y-3">
            <h4 className="text-porcelain font-semibold text-sm tracking-tight">Legal & Policies</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/refund-and-warranty-policy" className="hover:text-porcelain transition-colors">
                  Refund & Warranty Policy
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-porcelain transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-and-conditions" className="hover:text-porcelain transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/cookies-policy" className="hover:text-porcelain transition-colors">
                  Cookies Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-steel/20 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <p>© {currentYear} {STORE_CONFIG.storeName}. All rights reserved.</p>
          <p className="text-ash/80">
            Physical warranty card mandatory for claims. Delivery at Satyawadi Raja Harish Chandra Hospital, Delhi.
          </p>
        </div>
      </div>
    </footer>
  );
}
