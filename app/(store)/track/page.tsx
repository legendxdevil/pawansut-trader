"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Clock, ShieldCheck, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { ORDER_PHASES_TIMELINE, ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/order-status";

interface TrackingResult {
  orderId: string;
  status: OrderStatus;
  statusHistory: Array<{ status: OrderStatus; at: number; note?: string }>;
  items: Array<{
    name: string;
    variantLabel: string;
    qty: number;
    price: number;
    warranty?: { enabled: boolean; months: number } | null;
  }>;
  subtotal: number;
  discount: number;
  deliveryCharge: number;
  total: number;
  payment: { method: string; status: string };
  warrantyCardIssued: boolean;
  warrantyCards: Array<{ number: string; productId: string }>;
  createdAt: number;
}

function TrackContent() {
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState(searchParams?.get("orderId") || "");
  const [phone, setPhone] = useState(searchParams?.get("phone") || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TrackingResult | null>(null);

  const fetchTracking = async (searchOrderId: string, searchPhone: string) => {
    if (!searchOrderId.trim() || !searchPhone.trim()) {
      setError("Please provide both your Order ID and 10-digit mobile number.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: searchOrderId.trim().toUpperCase(),
          phone: searchPhone.trim(),
        }),
      });

      const json = await res.json();

      if (!res.ok || json.error) {
        setError(json.error?.message || "Order not found. Please verify details.");
      } else {
        setResult(json.data);
      }
    } catch {
      setError("Network error while tracking order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const qOrderId = searchParams?.get("orderId");
    const qPhone = searchParams?.get("phone");
    if (qOrderId && qPhone) {
      setOrderId(qOrderId);
      setPhone(qPhone);
      fetchTracking(qOrderId, qPhone);
    }
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTracking(orderId, phone);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
    setPhone(digits);
  };

  // Determine active step index in five phases timeline
  const currentPhaseIndex = result
    ? ORDER_PHASES_TIMELINE.indexOf(result.status)
    : -1;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-porcelain">Track Your Order</h1>
        <p className="text-ash text-sm">
          Enter your Order ID (e.g. PT-000001) and registered 10-digit phone number.
        </p>
      </div>

      {/* Lookup Form */}
      <form onSubmit={handleSubmit} className="bg-carbon rounded-tile border border-steel/30 p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-porcelain">
              Order ID <span className="text-error">*</span>
            </label>
            <input
              type="text"
              placeholder="PT-000001"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value.toUpperCase())}
              required
              className="w-full bg-[rgba(255,255,255,0.04)] text-porcelain px-4 py-2.5 rounded-pill border border-slate focus:border-apple-blue text-base sm:text-sm uppercase placeholder:text-ash"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-porcelain">
              Mobile Number (10 digits) <span className="text-error">*</span>
            </label>
            <input
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              maxLength={10}
              placeholder="9876543210"
              value={phone}
              onChange={handlePhoneChange}
              required
              className="w-full bg-[rgba(255,255,255,0.04)] text-porcelain px-4 py-2.5 rounded-pill border border-slate focus:border-apple-blue text-base sm:text-sm placeholder:text-ash"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-apple-blue hover:bg-apple-blue/90 disabled:bg-steel/60 text-white font-semibold text-sm py-3 rounded-pill transition-transform active:scale-[0.98] flex items-center justify-center gap-2 shadow-none min-h-[44px]"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Looking up Order...</span>
            </>
          ) : (
            <>
              <Search size={16} />
              <span>Track Order</span>
            </>
          )}
        </button>

        {error && (
          <div className="bg-error/15 border border-error/30 text-error text-xs p-3 rounded-tile flex items-center gap-2 mt-2">
            <AlertCircle size={14} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </form>

      {/* Tracking Result View (§7.9) */}
      {result && (
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-carbon rounded-tile border border-steel/30 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs uppercase tracking-wider text-ash font-medium">Order Status</span>
              <h2 className="text-xl sm:text-2xl font-bold text-porcelain flex items-center gap-2 mt-0.5">
                <span>{ORDER_STATUS_LABELS[result.status] || result.status}</span>
                {result.status === "delivered" && (
                  <CheckCircle2 size={20} className="text-success" />
                )}
              </h2>
              <p className="text-xs text-ash mt-1">
                Placed on {new Date(result.createdAt).toLocaleDateString("en-IN", { dateStyle: "long" })}
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs text-ash">Total Amount</span>
              <p className="text-xl font-bold text-apple-blue">₹{result.total}</p>
              <p className="text-[11px] text-ash uppercase">{result.payment.method}</p>
            </div>
          </div>

          {/* 5-Phases Timeline (§7.9, §8.1) */}
          <div className="bg-carbon rounded-tile border border-steel/30 p-6 space-y-4">
            <h3 className="text-xs font-semibold text-ash uppercase tracking-wider">
              Fulfillment Timeline
            </h3>

            <div className="space-y-4 pt-2">
              {ORDER_PHASES_TIMELINE.map((phase, idx) => {
                const isPassed = currentPhaseIndex >= idx;
                const isCurrent = currentPhaseIndex === idx;
                const historyEntry = result.statusHistory.find((h) => h.status === phase);

                return (
                  <div key={phase} className="flex items-start gap-4 relative">
                    {/* Step line */}
                    {idx < ORDER_PHASES_TIMELINE.length - 1 && (
                      <div
                        className={`absolute left-3 top-6 bottom-0 w-0.5 -mb-4 ${
                          currentPhaseIndex > idx ? "bg-apple-blue" : "bg-steel/40"
                        }`}
                      />
                    )}

                    {/* Step icon */}
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold z-10 ${
                        isCurrent
                          ? "bg-apple-blue text-white ring-4 ring-apple-blue/20"
                          : isPassed
                          ? "bg-apple-blue text-white"
                          : "bg-steel text-ash"
                      }`}
                    >
                      {idx + 1}
                    </div>

                    {/* Step description */}
                    <div className="flex-1 pb-4">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm font-semibold ${isPassed ? "text-porcelain" : "text-ash"}`}>
                          {ORDER_STATUS_LABELS[phase]}
                        </p>
                        {historyEntry && (
                          <span className="text-[11px] text-ash flex items-center gap-1">
                            <Clock size={10} />
                            {new Date(historyEntry.at).toLocaleTimeString("en-IN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        )}
                      </div>
                      {historyEntry?.note && (
                        <p className="text-xs text-ash/90 mt-0.5">{historyEntry.note}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Items & Warranty Snapshot */}
          <div className="bg-carbon rounded-tile border border-steel/30 p-6 space-y-4">
            <h3 className="text-xs font-semibold text-ash uppercase tracking-wider">
              Ordered Items & Warranty Protection
            </h3>

            <div className="space-y-3">
              {result.items.map((it, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs border-b border-steel/15 pb-2.5"
                >
                  <div>
                    <p className="font-semibold text-porcelain">{it.name}</p>
                    <p className="text-ash">
                      {it.variantLabel} &times; {it.qty}
                    </p>
                    {it.warranty?.enabled && (
                      <p className="text-[11px] text-optical-yellow font-medium flex items-center gap-1 mt-0.5">
                        <ShieldCheck size={12} />
                        {it.warranty.months} Months Warranty Card Included
                      </p>
                    )}
                  </div>
                  <span className="font-semibold text-porcelain">
                    ₹{it.price * it.qty}
                  </span>
                </div>
              ))}
            </div>

            {/* Physical Warranty Card Status Notice */}
            <div className="bg-graphite rounded-tile p-4 border border-steel/20 text-xs flex items-center gap-3">
              <ShieldCheck size={20} className="text-optical-yellow flex-shrink-0" />
              <div>
                <p className="text-porcelain font-medium">Warranty Claim Requirement</p>
                <p className="text-ash mt-0.5">
                  Physical warranty card + Order ID ({result.orderId}) are mandatory for warranty claims or returns.
                </p>
                {result.warrantyCardIssued && (
                  <p className="text-success text-[11px] font-semibold mt-1">
                    ✓ Official warranty card has been issued with this order.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-3xl mx-auto px-4 py-20 text-center text-ash text-sm">
          Loading tracking interface...
        </div>
      }
    >
      <TrackContent />
    </Suspense>
  );
}
