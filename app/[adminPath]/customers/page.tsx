"use client";

import React, { useState, useEffect } from "react";
import { Users } from "lucide-react";
import type { CustomerRecord } from "@/types";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCustomers() {
      try {
        setLoading(true);
        const res = await fetch("/api/admin/customers");
        const json = await res.json();
        if (json.data) {
          setCustomers(json.data);
        }
      } catch {
        // Ignore
      } finally {
        setLoading(false);
      }
    }
    loadCustomers();
  }, []);

  return (
    <div className="space-y-6">
      <div className="border-b border-steel/20 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-porcelain">Customer Directory</h1>
        <p className="text-xs text-ash mt-0.5">
          Audited phone-based guest customer records and order histories.
        </p>
      </div>

      <div className="bg-carbon rounded-tile border border-steel/30 overflow-hidden">
        <div className="p-4 border-b border-steel/20 flex items-center justify-between">
          <span className="text-xs font-semibold text-ash uppercase">
            Registered Phone Profiles ({customers.length})
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-ash text-xs">Loading customer directory...</div>
        ) : customers.length === 0 ? (
          <div className="py-16 text-center text-ash text-xs space-y-2">
            <Users size={32} className="mx-auto text-ash/40" />
            <p>No customer profiles recorded yet.</p>
            <p className="text-[11px]">Customers will automatically appear after placing guest orders.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-graphite text-ash uppercase font-semibold border-b border-steel/30">
                <tr>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Mobile</th>
                  <th className="py-3 px-4">Last Address</th>
                  <th className="py-3 px-4">Orders</th>
                  <th className="py-3 px-4">Total Spent</th>
                  <th className="py-3 px-4">Last Order</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-steel/20">
                {customers.map((c) => (
                  <tr key={c.phone} className="hover:bg-steel/10 transition-colors">
                    <td className="py-3 px-4 font-semibold text-porcelain">
                      {c.name}
                    </td>

                    <td className="py-3 px-4 font-mono text-porcelain/90">
                      +91 {c.phone}
                    </td>

                    <td className="py-3 px-4 text-ash truncate max-w-xs">
                      {c.lastAddress}
                    </td>

                    <td className="py-3 px-4">
                      <span className="bg-steel/50 text-porcelain px-2.5 py-0.5 rounded-pill font-medium">
                        {c.ordersCount} orders
                      </span>
                    </td>

                    <td className="py-3 px-4 font-semibold text-success">
                      ₹{c.totalSpent}
                    </td>

                    <td className="py-3 px-4 text-ash">
                      {new Date(c.lastOrderAt).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
