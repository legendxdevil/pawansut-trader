import React from "react";
import { Navbar } from "@/components/store/navbar";
import { Footer } from "@/components/store/footer";
import { WhatsAppButton } from "@/components/store/whatsapp-button";
import { CartProvider } from "@/lib/cart-context";
import { MiniCartDrawer } from "@/components/store/mini-cart-drawer";
import { CookieNotice } from "@/components/store/cookie-notice";

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col bg-obsidian text-porcelain">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <WhatsAppButton />
        <MiniCartDrawer />
        <CookieNotice />
      </div>
    </CartProvider>
  );
}
