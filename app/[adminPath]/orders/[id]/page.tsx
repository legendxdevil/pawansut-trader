"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ShieldCheck,
  Printer,
  MessageCircle,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import type { Order, OrderStatus } from "@/types";
import { ORDER_STATUS_LABELS, VALID_STATUS_TRANSITIONS } from "@/lib/order-status";
import { generateAdminStatusWhatsAppLink } from "@/lib/whatsapp";
import { STORE_CONFIG } from "@/lib/store-config";

export default function AdminOrderDetailPage() {
  const params = useParams();
  const adminPath = params?.adminPath as string;
  const orderId = params?.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Status transition note state
  const [transitionNote, setTransitionNote] = useState("");
  const [showPrintWarrantySheet, setShowPrintWarrantySheet] = useState(false);

  const fetchOrder = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/orders`);
      const json = await res.json();
      if (json.data) {
        const found = json.data.find((o: Order) => o.id === orderId || o.orderId === orderId);
        setOrder(found || null);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const handleStatusTransition = async (nextStatus: OrderStatus) => {
    if (!order) return;
    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const res = await fetch(`/api/admin/orders/${order.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nextStatus,
          note: transitionNote.trim() || undefined,
        }),
      });

      const json = await res.json();

      if (!res.ok || json.error) {
        setActionError(json.error?.message || "Failed to update status");
      } else {
        setActionSuccess(`Order successfully moved to ${ORDER_STATUS_LABELS[nextStatus]}`);
        setTransitionNote("");
        setOrder(json.data);
      }
    } catch {
      setActionError("Network error during status update");
    } finally {
      setActionLoading(false);
    }
  };

  const handleIssueWarrantyCards = async () => {
    if (!order) return;
    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const res = await fetch(`/api/admin/orders/${order.id}/warranty-card`, {
        method: "PATCH",
      });

      const json = await res.json();

      if (!res.ok || json.error) {
        setActionError(json.error?.message || "Failed to issue warranty cards");
      } else {
        setActionSuccess("Official sequential warranty cards successfully generated!");
        fetchOrder();
      }
    } catch {
      setActionError("Network error issuing warranty cards");
    } finally {
      setActionLoading(false);
    }
  };

  const handlePaymentStatus = async (status: "paid" | "refunded") => {
    if (!order) return;
    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const res = await fetch(`/api/admin/orders/${order.id}/payment`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const json = await res.json();

      if (!res.ok || json.error) {
        setActionError(json.error?.message || "Failed to update payment");
      } else {
        setActionSuccess(`Payment status marked as ${status.toUpperCase()}`);
        setOrder(json.data);
      }
    } catch {
      setActionError("Network error updating payment");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading || !order) {
    return (
      <div className="py-20 text-center text-ash text-xs">
        Loading order details...
      </div>
    );
  }

  const allowedTransitions = VALID_STATUS_TRANSITIONS[order.status] || [];
  const whatsappNotificationLink = generateAdminStatusWhatsAppLink(order);

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-steel/20 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href={`/${adminPath}/orders`}
            className="p-1.5 text-ash hover:text-porcelain rounded-full hover:bg-steel/30"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-porcelain flex items-center gap-2">
              <span>Order {order.orderId}</span>
              <span className="text-xs bg-steel/50 text-porcelain/90 px-2.5 py-0.5 rounded-pill font-mono">
                {order.id}
              </span>
            </h1>
            <p className="text-xs text-ash mt-0.5">
              Placed {new Date(order.createdAt).toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* WhatsApp Notify Link */}
          <a
            href={whatsappNotificationLink}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-semibold px-4 py-2 rounded-pill flex items-center gap-1.5 transition-transform active:scale-95"
          >
            <MessageCircle size={14} className="fill-current" />
            <span>Notify Customer</span>
          </a>

          {/* Invoice Print Link */}
          <Link
            href={`/${adminPath}/orders/${order.id}/invoice`}
            target="_blank"
            className="bg-carbon hover:bg-steel/40 text-porcelain border border-slate text-xs font-semibold px-4 py-2 rounded-pill flex items-center gap-1.5 transition-colors"
          >
            <Printer size={14} />
            <span>Invoice Bill</span>
          </Link>
        </div>
      </div>

      {actionError && (
        <div className="bg-error/15 border border-error/40 text-error text-xs p-4 rounded-tile flex items-center gap-2">
          <AlertTriangle size={16} className="flex-shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {actionSuccess && (
        <div className="bg-success/15 border border-success/40 text-success text-xs p-4 rounded-tile flex items-center gap-2">
          <CheckCircle2 size={16} className="flex-shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Status & Operations Card */}
      <div className="bg-carbon rounded-tile border border-steel/30 p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-steel/20 pb-4">
          <div>
            <span className="text-xs text-ash uppercase font-semibold">Current Lifecycle Status</span>
            <p className="text-xl font-bold text-porcelain mt-0.5">
              {ORDER_STATUS_LABELS[order.status] || order.status}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {allowedTransitions.map((st) => (
              <button
                key={st}
                onClick={() => handleStatusTransition(st)}
                disabled={actionLoading}
                className={`text-xs font-semibold px-4 py-2 rounded-pill transition-transform active:scale-95 disabled:opacity-50 ${
                  st === "cancelled"
                    ? "bg-error/20 text-error hover:bg-error/30"
                    : st === "delivered"
                    ? "bg-success text-white hover:bg-success/90"
                    : "bg-apple-blue text-white hover:bg-apple-blue/90"
                }`}
              >
                Mark as {ORDER_STATUS_LABELS[st]}
              </button>
            ))}
          </div>
        </div>

        {/* Transition Note Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-ash">
            Status Transition Note (Optional, mandatory when cancelling dispatched order):
          </label>
          <input
            type="text"
            placeholder="e.g. Handed over to courier / Customer requested room delivery"
            value={transitionNote}
            onChange={(e) => setTransitionNote(e.target.value)}
            className="w-full bg-[rgba(255,255,255,0.04)] text-porcelain px-4 py-2 rounded-pill border border-slate focus:border-apple-blue text-xs"
          />
        </div>

        {/* Payment Management & Warranty Card Action Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-steel/20 pt-4">
          {/* Payment */}
          <div className="bg-graphite/60 rounded-tile p-4 border border-steel/20 space-y-2 text-xs">
            <span className="text-ash uppercase font-semibold block">Payment Status</span>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-porcelain uppercase">{order.payment.method}</p>
                <p className={`font-semibold ${order.payment.status === "paid" ? "text-success" : "text-warning"}`}>
                  Status: {order.payment.status.toUpperCase()}
                </p>
              </div>
              <div className="flex gap-2">
                {order.payment.status !== "paid" && (
                  <button
                    onClick={() => handlePaymentStatus("paid")}
                    disabled={actionLoading}
                    className="bg-success text-white text-[11px] font-semibold px-3 py-1 rounded-pill"
                  >
                    Mark Paid
                  </button>
                )}
                {order.payment.status === "paid" && (
                  <button
                    onClick={() => handlePaymentStatus("refunded")}
                    disabled={actionLoading}
                    className="bg-steel/60 text-ash text-[11px] font-semibold px-3 py-1 rounded-pill"
                  >
                    Mark Refunded
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Warranty Card Issue (§16) */}
          <div className="bg-graphite/60 rounded-tile p-4 border border-steel/20 space-y-2 text-xs">
            <span className="text-ash uppercase font-semibold block">Physical Warranty Cards</span>
            <div className="flex items-center justify-between">
              <div>
                <p className={`font-semibold ${order.warrantyCardIssued ? "text-success" : "text-optical-yellow"}`}>
                  {order.warrantyCardIssued ? "✓ Cards Issued" : "Pending Generation"}
                </p>
                <p className="text-[11px] text-ash">
                  {order.warrantyCards?.length || 0} cards associated
                </p>
              </div>

              <div className="flex gap-2">
                {!order.warrantyCardIssued ? (
                  <button
                    onClick={handleIssueWarrantyCards}
                    disabled={actionLoading}
                    className="bg-optical-yellow text-obsidian text-[11px] font-bold px-3 py-1.5 rounded-pill"
                  >
                    Generate Cards
                  </button>
                ) : (
                  <button
                    onClick={() => setShowPrintWarrantySheet(true)}
                    className="bg-steel text-porcelain text-[11px] font-semibold px-3 py-1.5 rounded-pill flex items-center gap-1"
                  >
                    <Printer size={12} />
                    <span>Print Card Sheet</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Customer & Delivery Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-carbon rounded-tile border border-steel/30 p-6 space-y-3 text-xs">
          <h2 className="text-sm font-semibold text-porcelain border-b border-steel/20 pb-2">
            Customer Information
          </h2>
          <div className="space-y-1.5 text-ash">
            <p>
              <strong className="text-porcelain">Name:</strong> {order.customer.name}
            </p>
            <p>
              <strong className="text-porcelain">Mobile:</strong> {order.customer.phone}
            </p>
            {order.customer.email && (
              <p>
                <strong className="text-porcelain">Email:</strong> {order.customer.email}
              </p>
            )}
          </div>
        </div>

        <div className="bg-carbon rounded-tile border border-steel/30 p-6 space-y-3 text-xs">
          <h2 className="text-sm font-semibold text-porcelain border-b border-steel/20 pb-2">
            Delivery Address
          </h2>
          <div className="space-y-1.5 text-ash">
            <p className="text-porcelain leading-relaxed">{order.customer.address}</p>
            {order.customer.landmark && (
              <p>
                <strong className="text-porcelain">Landmark:</strong> {order.customer.landmark}
              </p>
            )}
            <p>
              {order.customer.city} - {order.customer.pincode}
            </p>
          </div>
        </div>
      </div>

      {/* Ordered Items Table */}
      <div className="bg-carbon rounded-tile border border-steel/30 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-porcelain border-b border-steel/20 pb-2">
          Ordered Accessories Snapshot
        </h2>

        <div className="divide-y divide-steel/20 text-xs">
          {order.items.map((item, idx) => (
            <div key={idx} className="py-3 flex items-center justify-between">
              <div>
                <p className="font-semibold text-porcelain text-sm">{item.name}</p>
                <p className="text-ash">
                  Variant: {item.variantLabel} | Unit Price: ₹{item.price}
                </p>
                {item.warranty?.enabled && (
                  <span className="text-optical-yellow text-[11px] font-medium flex items-center gap-1 mt-0.5">
                    <ShieldCheck size={12} />
                    {item.warranty.months} Months Official Warranty
                  </span>
                )}
              </div>
              <div className="text-right">
                <p className="font-semibold text-porcelain text-sm">₹{item.price * item.qty}</p>
                <p className="text-[11px] text-ash">&times; {item.qty} units</p>
              </div>
            </div>
          ))}
        </div>

        {/* Totals Summary */}
        <div className="border-t border-steel/30 pt-4 space-y-1.5 text-xs text-ash max-w-xs ml-auto">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="text-porcelain font-medium">₹{order.subtotal}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-success">
              <span>Discount ({order.couponCode || "Coupon"})</span>
              <span>-₹{order.discount}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Delivery Fee</span>
            <span className="text-porcelain font-medium">
              {order.deliveryCharge === 0 ? "FREE" : `₹${order.deliveryCharge}`}
            </span>
          </div>
          <div className="flex justify-between text-sm font-bold text-porcelain pt-2 border-t border-steel/20">
            <span>Grand Total</span>
            <span className="text-apple-blue">₹{order.total}</span>
          </div>
        </div>
      </div>

      {/* Status History Timeline (§8.1) */}
      <div className="bg-carbon rounded-tile border border-steel/30 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-porcelain border-b border-steel/20 pb-2">
          Status Audit Log
        </h2>

        <div className="space-y-3">
          {order.statusHistory.map((h, i) => (
            <div key={i} className="flex items-start gap-3 text-xs">
              <div className="w-2 h-2 rounded-full bg-apple-blue mt-1.5" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-porcelain uppercase">
                    {ORDER_STATUS_LABELS[h.status] || h.status}
                  </span>
                  <span className="text-ash text-[11px]">
                    {new Date(h.at).toLocaleString("en-IN")}
                  </span>
                </div>
                {h.note && <p className="text-ash mt-0.5">{h.note}</p>}
                <span className="text-[10px] text-ash/60">Updated by: {h.by}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Printable Warranty Card Sheet Modal (§16) */}
      {showPrintWarrantySheet && (
        <div className="fixed inset-0 z-50 bg-obsidian/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-carbon border border-steel/40 rounded-tile max-w-2xl w-full p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-steel/20 pb-3">
              <div className="flex items-center gap-2 text-optical-yellow font-semibold text-sm">
                <ShieldCheck size={18} />
                <span>Printable Physical Warranty Card Sheet</span>
              </div>
              <button
                onClick={() => setShowPrintWarrantySheet(false)}
                className="text-ash hover:text-porcelain text-xs font-semibold px-2 py-1"
              >
                Close
              </button>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
              {order.warrantyCards.map((card) => {
                const item = order.items.find(
                  (it) => it.productId === card.productId && it.variantId === card.variantId
                ) || order.items[0];

                return (
                  <div
                    key={card.number}
                    className="border-2 border-dashed border-steel/60 p-4 rounded-tile bg-graphite space-y-2 text-xs"
                  >
                    <div className="flex justify-between items-start border-b border-steel/30 pb-2">
                      <div>
                        <h4 className="font-bold text-porcelain text-sm">{STORE_CONFIG.storeName}</h4>
                        <p className="text-[10px] text-ash">Official Warranty Certificate</p>
                      </div>
                      <span className="font-mono font-bold text-optical-yellow text-sm">
                        {card.number}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-ash pt-1">
                      <p>
                        <strong className="text-porcelain">Product:</strong> {item?.name}
                      </p>
                      <p>
                        <strong className="text-porcelain">Order ID:</strong> {order.orderId}
                      </p>
                      <p>
                        <strong className="text-porcelain">Duration:</strong>{" "}
                        {item?.warranty?.months || 6} Months
                      </p>
                      <p>
                        <strong className="text-porcelain">Issued Date:</strong>{" "}
                        {new Date(card.issuedAt).toLocaleDateString("en-IN")}
                      </p>
                    </div>

                    <p className="text-[10px] text-ash/80 italic border-t border-steel/20 pt-1">
                      * Physical card mandatory for claims. WhatsApp: +91 {STORE_CONFIG.whatsappNumber}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="bg-apple-blue text-white text-xs font-semibold px-5 py-2.5 rounded-pill flex items-center gap-1.5"
              >
                <Printer size={14} />
                <span>Print Sheet</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
