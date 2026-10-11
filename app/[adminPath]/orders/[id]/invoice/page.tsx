import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Printer, ShieldCheck } from "lucide-react";
import { adminDb } from "@/lib/firebase-admin";
import { STORE_CONFIG } from "@/lib/store-config";
import type { Order } from "@/types";

interface InvoicePageProps {
  params: { adminPath: string; id: string };
}

export const metadata: Metadata = {
  title: "Tax Invoice / Bill — Pawansut Trader",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function InvoicePage({ params }: InvoicePageProps) {
  let order: Order | null = null;

  try {
    const doc = await adminDb.collection("orders").doc(params.id).get();
    if (doc.exists) {
      order = { id: doc.id, ...doc.data() } as Order;
    }
  } catch {
    // Ignore
  }

  if (!order) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white text-black p-6 sm:p-12 font-sans">
      {/* Print Action Bar (hidden when printing) */}
      <div className="no-print max-w-4xl mx-auto mb-8 bg-graphite text-porcelain p-4 rounded-tile border border-steel flex items-center justify-between">
        <span className="text-xs">Invoice Preview for Order {order.orderId}</span>
        {/* Client print trigger */}
        <button
          // eslint-disable-next-line react/no-unknown-property
          onClick={undefined}
          className="bg-apple-blue hover:bg-apple-blue/90 text-white text-xs font-semibold px-4 py-2 rounded-pill flex items-center gap-1.5 cursor-pointer"
        >
          <Printer size={14} />
          <span>Print / Save PDF (Ctrl+P)</span>
        </button>
      </div>

      {/* Invoice Document */}
      <div className="max-w-4xl mx-auto border border-gray-300 p-8 sm:p-12 space-y-8 bg-white">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-gray-200 pb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">{STORE_CONFIG.storeName}</h1>
            <p className="text-xs text-gray-600 mt-1 max-w-xs">{STORE_CONFIG.shopAddress}</p>
            <p className="text-xs text-gray-600 mt-0.5">WhatsApp / Phone: +91 {STORE_CONFIG.whatsappNumber}</p>
            <p className="text-xs text-gray-600">Email: {STORE_CONFIG.supportEmail}</p>
          </div>

          <div className="text-left sm:text-right space-y-1 text-xs">
            <span className="text-sm font-bold uppercase text-gray-800 tracking-wider block">
              RETAIL INVOICE
            </span>
            <p>
              <strong className="text-gray-900">Invoice / Order ID:</strong> {order.orderId}
            </p>
            <p>
              <strong className="text-gray-900">Date:</strong>{" "}
              {new Date(order.createdAt).toLocaleDateString("en-IN", { dateStyle: "long" })}
            </p>
            <p>
              <strong className="text-gray-900">Payment:</strong>{" "}
              <span className="uppercase">{order.payment.method}</span> ({order.payment.status})
            </p>
          </div>
        </div>

        {/* Bill To Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs border-b border-gray-200 pb-6">
          <div>
            <h3 className="font-bold text-gray-900 uppercase text-[11px] mb-1">Billed To (Customer):</h3>
            <p className="font-semibold text-gray-800 text-sm">{order.customer.name}</p>
            <p className="text-gray-600">Phone: {order.customer.phone}</p>
            {order.customer.email && <p className="text-gray-600">Email: {order.customer.email}</p>}
          </div>

          <div>
            <h3 className="font-bold text-gray-900 uppercase text-[11px] mb-1">Delivery Destination:</h3>
            <p className="text-gray-700 leading-relaxed">{order.customer.address}</p>
            {order.customer.landmark && <p className="text-gray-600">Landmark: {order.customer.landmark}</p>}
            <p className="text-gray-600">{order.customer.city} - {order.customer.pincode}</p>
          </div>
        </div>

        {/* Line Items Table */}
        <div>
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-300 text-gray-700 uppercase font-semibold">
                <th className="py-2 px-2">#</th>
                <th className="py-2 px-2">Item & Variant</th>
                <th className="py-2 px-2">Warranty</th>
                <th className="py-2 px-2 text-right">Price</th>
                <th className="py-2 px-2 text-center">Qty</th>
                <th className="py-2 px-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {order.items.map((item, idx) => (
                <tr key={idx} className="text-gray-800">
                  <td className="py-2 px-2 text-gray-500">{idx + 1}</td>
                  <td className="py-2 px-2">
                    <p className="font-semibold text-gray-900">{item.name}</p>
                    <p className="text-[11px] text-gray-500">Variant: {item.variantLabel}</p>
                  </td>
                  <td className="py-2 px-2 text-gray-600">
                    {item.warranty?.enabled ? `${item.warranty.months} Months` : "None"}
                  </td>
                  <td className="py-2 px-2 text-right">₹{item.price}</td>
                  <td className="py-2 px-2 text-center">{item.qty}</td>
                  <td className="py-2 px-2 text-right font-medium">₹{item.price * item.qty}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals & Notes Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-t border-gray-200 pt-6">
          <div className="text-xs text-gray-600 space-y-2 max-w-sm">
            <div className="flex items-center gap-1.5 font-semibold text-gray-800">
              <ShieldCheck size={16} />
              <span>Warranty & Claim Policy Notice:</span>
            </div>
            <p className="leading-relaxed">
              For covered items, an official physical warranty card is handed over upon delivery.
              The original physical card + this bill are mandatory for all warranty service or refund claims.
            </p>
            {/* Open Item 7 note (§3.7) */}
            {/* // TODO(verify): GST breakdown when confirmed by owner */}
            <p className="text-[10px] text-gray-500 italic">
              All prices shown in Indian Rupees (₹).
            </p>
          </div>

          <div className="w-full sm:w-64 space-y-1.5 text-xs text-gray-700">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-medium">₹{order.subtotal}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-green-700">
                <span>Discount ({order.couponCode || "Promo"}):</span>
                <span>-₹{order.discount}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Delivery Charge:</span>
              <span className="font-medium">
                {order.deliveryCharge === 0 ? "FREE" : `₹${order.deliveryCharge}`}
              </span>
            </div>
            <div className="flex justify-between text-base font-bold text-gray-900 border-t border-gray-300 pt-2">
              <span>Total Payable:</span>
              <span>₹{order.total}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 pt-6 text-center text-[11px] text-gray-500">
          <p>Thank you for choosing {STORE_CONFIG.storeName}!</p>
          <p>This is a computer-generated invoice for your retail order.</p>
        </div>
      </div>
    </div>
  );
}
