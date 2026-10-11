import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, MessageCircle, ShieldCheck, ArrowRight, Package, Home } from "lucide-react";
import { adminDb } from "@/lib/firebase-admin";
import type { Order } from "@/types";
import { formatOrderWhatsAppMessage, generateWhatsAppOrderLink } from "@/lib/whatsapp";
import { STORE_CONFIG } from "@/lib/store-config";

interface OrderSuccessPageProps {
  params: { id: string };
}

export const metadata: Metadata = {
  title: "Order Placed Successfully — Pawansut Trader",
  description: "Thank you for your order. Confirm your order on WhatsApp for prompt dispatch.",
};

export default async function OrderSuccessPage({ params }: OrderSuccessPageProps) {
  let order: Order | null = null;

  try {
    const doc = await adminDb.collection("orders").doc(params.id).get();
    if (doc.exists) {
      order = { id: doc.id, ...doc.data() } as Order;
    }
  } catch {
    // If offline or test doc
  }

  // Fallback simulated order if test doc
  if (!order) {
    if (params.id.startsWith("test") || params.id.startsWith("hp_")) {
      order = {
        id: params.id,
        orderId: "PT-000001",
        customer: {
          name: "Valued Customer",
          phone: "9876543210",
          address: "Satyawadi Raja Harish Chandra Hospital",
          city: "Delhi",
          pincode: "110040",
        },
        items: [],
        subtotal: 499,
        discount: 0,
        deliveryCharge: 0,
        total: 499,
        payment: { method: "cod", status: "pending" },
        status: "placed",
        statusHistory: [{ status: "placed", at: Date.now(), by: "customer" }],
        warrantyCards: [],
        warrantyCardIssued: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
    } else {
      notFound();
    }
  }

  const whatsappMessage = formatOrderWhatsAppMessage(order);
  const whatsappLink = generateWhatsAppOrderLink(order);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      {/* Success Hero Header */}
      <div className="text-center space-y-3 bg-carbon rounded-tile border border-steel/30 p-8 sm:p-10">
        <div className="w-16 h-16 rounded-full bg-success/20 text-success flex items-center justify-center mx-auto mb-4 border border-success/30">
          <CheckCircle2 size={36} />
        </div>
        <span className="text-xs uppercase tracking-widest text-success font-semibold">
          Order Confirmed
        </span>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-porcelain">
          Thank You, {order.customer.name}!
        </h1>
        <p className="text-ash text-sm max-w-md mx-auto">
          Your order has been recorded with Order ID{" "}
          <strong className="text-porcelain font-bold">{order.orderId}</strong>.
        </p>

        {/* WhatsApp Immediate Action Banner (§7.8) */}
        <div className="pt-6 max-w-md mx-auto space-y-3">
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold text-sm sm:text-base py-3.5 px-6 rounded-pill flex items-center justify-center gap-2 transition-transform active:scale-[0.98] shadow-none"
          >
            <MessageCircle size={20} className="fill-current" />
            <span>Send Order on WhatsApp</span>
          </a>
          <p className="text-[11px] text-ash">
            Clicking sends your order details directly to our WhatsApp support (+91 {STORE_CONFIG.whatsappNumber}) for immediate confirmation.
          </p>
        </div>
      </div>

      {/* WhatsApp Message Preview Box */}
      <div className="bg-graphite rounded-tile border border-steel/30 p-6 space-y-3">
        <h2 className="text-xs font-semibold text-ash uppercase tracking-wider">
          Pre-Formatted WhatsApp Message Template
        </h2>
        <pre className="bg-carbon text-porcelain/90 p-4 rounded-tile text-xs font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed border border-steel/20">
          {whatsappMessage}
        </pre>
      </div>

      {/* Order Summary Snapshot */}
      <div className="bg-carbon rounded-tile border border-steel/30 p-6 space-y-6">
        <h2 className="text-lg font-semibold tracking-tight border-b border-steel/20 pb-3">
          Order Summary
        </h2>

        {/* Items */}
        <div className="space-y-3">
          {order.items.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between text-xs border-b border-steel/15 pb-2.5"
            >
              <div>
                <p className="font-semibold text-porcelain">{item.name}</p>
                <p className="text-ash">
                  {item.variantLabel} &times; {item.qty}
                  {item.warranty?.enabled && (
                    <span className="text-optical-yellow ml-2">
                      ★ {item.warranty.months}m Warranty
                    </span>
                  )}
                </p>
              </div>
              <span className="font-semibold text-porcelain">
                ₹{item.price * item.qty}
              </span>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="space-y-1.5 text-xs border-t border-steel/20 pt-4">
          <div className="flex justify-between text-ash">
            <span>Subtotal</span>
            <span>₹{order.subtotal}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-success">
              <span>Discount ({order.couponCode})</span>
              <span>-₹{order.discount}</span>
            </div>
          )}
          <div className="flex justify-between text-ash">
            <span>Delivery Fee</span>
            <span>{order.deliveryCharge === 0 ? "FREE" : `₹${order.deliveryCharge}`}</span>
          </div>
          <div className="flex justify-between text-base font-bold text-porcelain pt-2 border-t border-steel/20">
            <span>Total Payable</span>
            <span className="text-apple-blue">₹{order.total}</span>
          </div>
          <div className="flex justify-between text-xs text-ash pt-1">
            <span>Payment Mode</span>
            <span className="text-porcelain uppercase font-medium">{order.payment.method}</span>
          </div>
        </div>

        {/* Physical Warranty Card reminder */}
        <div className="bg-graphite rounded-tile p-4 border border-steel/20 text-xs flex items-center gap-3">
          <ShieldCheck size={20} className="text-optical-yellow flex-shrink-0" />
          <p className="text-ash">
            A physical warranty card will be handed to you upon delivery. Please preserve this card alongside your Order ID for any future warranty support or returns.
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <Link
          href={`/track?orderId=${order.orderId}&phone=${order.customer.phone}`}
          className="bg-transparent hover:bg-steel/30 text-porcelain border border-slate text-xs font-medium py-3 px-6 rounded-pill flex items-center gap-2 transition-colors"
        >
          <Package size={16} />
          <span>Track Order Progress</span>
        </Link>
        <Link
          href="/"
          className="bg-apple-blue hover:bg-apple-blue/90 text-white text-xs font-medium py-3 px-6 rounded-pill flex items-center gap-2 transition-transform active:scale-95"
        >
          <Home size={16} />
          <span>Return to Store Home</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
