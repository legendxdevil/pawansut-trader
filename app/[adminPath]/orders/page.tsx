"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Download,
  Search,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import type { Order } from "@/types";
import { ORDER_STATUS_LABELS } from "@/lib/order-status";

export default function AdminOrdersPage() {
  const params = useParams();
  const adminPath = params?.adminPath as string;

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Warranty claim lookup state (§16)
  const [claimQuery, setClaimQuery] = useState("");
  const [claimOrder, setClaimOrder] = useState<Order | null>(null);
  const [claimSearchError, setClaimSearchError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const url = statusFilter === "all"
        ? "/api/admin/orders"
        : `/api/admin/orders?status=${statusFilter}`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.data) {
        setOrders(json.data);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleClaimLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimQuery.trim()) return;

    const q = claimQuery.trim().toUpperCase();
    const match = orders.find(
      (o) =>
        o.orderId.toUpperCase() === q ||
        o.warrantyCards?.some((c) => c.number.toUpperCase() === q)
    );

    if (match) {
      setClaimOrder(match);
      setClaimSearchError(null);
    } else {
      setClaimOrder(null);
      setClaimSearchError(`No order found matching warranty card or Order ID: "${q}"`);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase().trim();
    return (
      o.orderId.toLowerCase().includes(term) ||
      o.customer.phone.includes(term) ||
      o.customer.name.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-steel/20 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-porcelain">Customer Orders</h1>
          <p className="text-xs text-ash mt-0.5">
            Process incoming orders, manage statuses, issue warranty cards, and print bills.
          </p>
        </div>

        <a
          href="/api/admin/export/orders"
          download
          className="bg-carbon hover:bg-steel/30 text-porcelain border border-slate text-xs font-semibold px-4 py-2.5 rounded-pill flex items-center gap-2 transition-colors"
        >
          <Download size={14} />
          <span>Export Orders CSV</span>
        </a>
      </div>

      {/* Warranty Claim Lookup Tool (§16) */}
      <div className="bg-carbon rounded-tile border border-optical-yellow/30 p-5 space-y-3">
        <div className="flex items-center gap-2 text-optical-yellow text-xs font-semibold">
          <ShieldCheck size={16} />
          <span>Warranty & Return Claim Verification Tool (§16)</span>
        </div>
        <p className="text-ash text-xs">
          Verify physical warranty cards presented by customers. Enter either the warranty card number (e.g. PT-W-0001) or Order ID (e.g. PT-000001).
        </p>

        <form onSubmit={handleClaimLookup} className="flex gap-2 max-w-md">
          <input
            type="text"
            placeholder="Enter PT-W-0001 or PT-000001"
            value={claimQuery}
            onChange={(e) => setClaimQuery(e.target.value.toUpperCase())}
            className="flex-1 bg-[rgba(255,255,255,0.04)] text-porcelain px-4 py-2 rounded-pill border border-slate focus:border-optical-yellow text-xs uppercase"
          />
          <button
            type="submit"
            className="bg-steel/70 hover:bg-steel text-optical-yellow font-semibold text-xs px-4 py-2 rounded-pill transition-colors"
          >
            Verify Claim
          </button>
        </form>

        {claimSearchError && (
          <p className="text-xs text-error">{claimSearchError}</p>
        )}

        {claimOrder && (
          <div className="bg-graphite rounded-tile p-4 border border-steel/30 space-y-3 text-xs mt-3 animate-fadeIn">
            {/* Mandatory Banner per §16 */}
            <div className="bg-optical-yellow/15 text-optical-yellow p-2.5 rounded-tile font-semibold border border-optical-yellow/30 flex items-center gap-2">
              <ShieldCheck size={16} className="flex-shrink-0" />
              <span>Physical card + bill/Order ID required for refund or warranty claim.</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-ash">
              <div>
                <span className="text-[10px] uppercase font-semibold">Order ID</span>
                <p className="text-porcelain font-semibold">{claimOrder.orderId}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold">Customer</span>
                <p className="text-porcelain">{claimOrder.customer.name}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold">Order Status</span>
                <p className="text-porcelain capitalize">{claimOrder.status}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold">Cards Issued?</span>
                <p className={claimOrder.warrantyCardIssued ? "text-success font-semibold" : "text-error"}>
                  {claimOrder.warrantyCardIssued ? "Yes (Issued)" : "No (Pending)"}
                </p>
              </div>
            </div>

            {claimOrder.warrantyCards && claimOrder.warrantyCards.length > 0 && (
              <div className="border-t border-steel/20 pt-2">
                <span className="text-[10px] uppercase font-semibold text-ash block mb-1">
                  Issued Card Numbers:
                </span>
                <div className="flex flex-wrap gap-2">
                  {claimOrder.warrantyCards.map((c) => (
                    <span
                      key={c.number}
                      className="bg-steel/60 text-optical-yellow font-mono text-xs px-2.5 py-1 rounded-pill"
                    >
                      {c.number} (Issued {new Date(c.issuedAt).toLocaleDateString("en-IN")})
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-1">
              <Link
                href={`/${adminPath}/orders/${claimOrder.id}`}
                className="text-electric-link hover:underline font-semibold text-xs inline-flex items-center gap-1"
              >
                <span>Open Full Order File</span>
                <ExternalLink size={12} />
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-carbon rounded-tile border border-steel/30 p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ash" />
            <input
              type="text"
              placeholder="Search by Order ID, phone, or customer name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[rgba(255,255,255,0.04)] text-porcelain pl-10 pr-4 py-2 rounded-pill border border-slate focus:border-apple-blue text-xs placeholder:text-ash"
            />
          </div>

          {/* Status Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto text-xs scrollbar-none pb-1">
            {["all", "placed", "confirmed", "dispatched", "delivered", "cancelled"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-pill capitalize whitespace-nowrap transition-colors ${
                  statusFilter === st
                    ? "bg-apple-blue text-white font-semibold"
                    : "bg-steel/30 text-porcelain/80 hover:bg-steel"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-carbon rounded-tile border border-steel/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-graphite text-ash uppercase font-semibold border-b border-steel/30">
              <tr>
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-steel/20">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-ash">
                    Loading orders...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-ash">
                    No matching orders found.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-steel/10 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-porcelain">
                      <Link
                        href={`/${adminPath}/orders/${o.id}`}
                        className="hover:text-electric-link transition-colors"
                      >
                        {o.orderId}
                      </Link>
                    </td>

                    <td className="py-3 px-4">
                      <p className="font-semibold text-porcelain">{o.customer.name}</p>
                      <p className="text-[11px] text-ash font-mono">{o.customer.phone}</p>
                    </td>

                    <td className="py-3 px-4">
                      <span className="text-porcelain font-medium">{o.items.length} items</span>
                      <span className="text-[10px] text-ash block truncate max-w-xs">
                        {o.items.map((it) => it.name).join(", ")}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-semibold text-porcelain">
                      ₹{o.total}
                    </td>

                    <td className="py-3 px-4">
                      <span className="uppercase text-[11px] font-semibold text-porcelain/90">
                        {o.payment.method}
                      </span>
                      <span
                        className={`block text-[10px] font-semibold ${
                          o.payment.status === "paid" ? "text-success" : "text-ash"
                        }`}
                      >
                        {o.payment.status}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-pill ${
                          o.status === "delivered"
                            ? "bg-success/20 text-success"
                            : o.status === "cancelled"
                            ? "bg-error/20 text-error"
                            : o.status === "dispatched"
                            ? "bg-warning/20 text-warning"
                            : "bg-apple-blue/20 text-electric-link"
                        }`}
                      >
                        {ORDER_STATUS_LABELS[o.status] || o.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-ash">
                      {new Date(o.createdAt).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/${adminPath}/orders/${o.id}`}
                        className="bg-steel/40 hover:bg-steel text-porcelain font-medium px-3 py-1 rounded-pill transition-colors text-[11px]"
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
