"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  TrendingUp,
  ShoppingBag,
  IndianRupee,
  CheckCircle2,
  Package,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface AnalyticsSummary {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  deliveredCount: number;
}

interface RevenueDayPoint {
  date: string;
  revenue: number;
  orders: number;
}

interface StatusCountPoint {
  status: string;
  label: string;
  count: number;
}

interface TopProductPoint {
  productId: string;
  name: string;
  unitsSold: number;
  revenue: number;
}

interface AnalyticsData {
  summary: AnalyticsSummary;
  revenueByDay: RevenueDayPoint[];
  ordersByStatus: StatusCountPoint[];
  topProducts: TopProductPoint[];
}

const STATUS_COLORS: Record<string, string> = {
  placed: "#3b82f6", // Blue
  payment_verified: "#6366f1", // Indigo
  confirmed: "#06b6d4", // Cyan
  dispatched: "#f59e0b", // Amber
  delivered: "#10b981", // Emerald
  cancelled: "#ef4444", // Rose
};

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/analytics");
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || "Failed to load analytics");
      }
      setData(json.data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading || !isMounted) {
    return (
      <div className="p-16 flex items-center justify-center gap-3 text-neutral-400">
        <Loader2 className="w-5 h-5 animate-spin" />
        Loading analytics aggregates...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 rounded-2xl bg-red-950/20 border border-red-900/40 text-red-300 flex items-center gap-3">
        <AlertCircle className="w-5 h-5 shrink-0" />
        <p>{error || "Failed to load analytics data"}</p>
      </div>
    );
  }

  const { summary, revenueByDay, ordersByStatus, topProducts } = data;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
          <TrendingUp className="w-7 h-7 text-blue-400" />
          Store Analytics &amp; Insights
        </h1>
        <p className="text-neutral-400 text-sm mt-1">
          Performance metrics, daily sales volume, fulfillment distribution, and top-selling accessories.
        </p>
      </div>

      {/* Summary KPI Cards Grid (Apple 28px tiles per §5.4) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="p-6 rounded-[28px] bg-neutral-900/80 border border-neutral-800 space-y-2">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Total Sales Revenue</span>
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-white">
            ₹{summary.totalRevenue.toLocaleString("en-IN")}
          </p>
          <p className="text-xs text-neutral-500">Non-cancelled order totals</p>
        </div>

        {/* Total Orders */}
        <div className="p-6 rounded-[28px] bg-neutral-900/80 border border-neutral-800 space-y-2">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Total Orders Placed</span>
            <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-white">
            {summary.totalOrders}
          </p>
          <p className="text-xs text-neutral-500">All recorded transactions</p>
        </div>

        {/* Average Order Value */}
        <div className="p-6 rounded-[28px] bg-neutral-900/80 border border-neutral-800 space-y-2">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Average Order Value</span>
            <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-white">
            ₹{summary.avgOrderValue.toLocaleString("en-IN")}
          </p>
          <p className="text-xs text-neutral-500">Average basket size</p>
        </div>

        {/* Delivered Orders */}
        <div className="p-6 rounded-[28px] bg-neutral-900/80 border border-neutral-800 space-y-2">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Delivered &amp; Completed</span>
            <div className="w-8 h-8 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-white">
            {summary.deliveredCount}
          </p>
          <p className="text-xs text-neutral-500">
            {summary.totalOrders > 0
              ? `${Math.round((summary.deliveredCount / summary.totalOrders) * 100)}% fulfillment rate`
              : "0% rate"}
          </p>
        </div>
      </div>

      {/* Charts Section: Revenue by Day & Orders by Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue By Day Bar Chart (2 cols) */}
        <div className="lg:col-span-2 p-4 sm:p-8 rounded-tile sm:rounded-[28px] bg-neutral-900/80 border border-neutral-800 space-y-4 sm:space-y-6">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">Revenue by Day</h2>
            <p className="text-xs text-neutral-400">Sales volume (₹) over recent days</p>
          </div>

          <div className="h-60 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueByDay} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="#737373"
                  fontSize={10}
                  tickLine={false}
                  interval="preserveStartEnd"
                  tickFormatter={(val) => val.slice(5)}
                />
                <YAxis
                  stroke="#737373"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `₹${val}`}
                />
                <Tooltip
                  cursor={{ fill: "rgba(255, 255, 255, 0.05)" }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as RevenueDayPoint;
                      return (
                        <div className="p-3 bg-black/90 border border-neutral-800 rounded-xl shadow-xl text-xs space-y-1">
                          <p className="text-neutral-400 font-mono">{data.date}</p>
                          <p className="text-white font-bold text-sm">₹{data.revenue.toLocaleString("en-IN")}</p>
                          <p className="text-neutral-500">{data.orders} {data.orders === 1 ? "order" : "orders"}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Orders by Status Pie Chart (1 col) */}
        <div className="p-4 sm:p-8 rounded-tile sm:rounded-[28px] bg-neutral-900/80 border border-neutral-800 space-y-4 sm:space-y-6 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Orders by Status</h2>
            <p className="text-xs text-neutral-400">Distribution across fulfillment stages</p>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ordersByStatus}
                  dataKey="count"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                >
                  {ordersByStatus.map((entry) => (
                    <Cell
                      key={`cell-${entry.status}`}
                      fill={STATUS_COLORS[entry.status] || "#737373"}
                    />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as StatusCountPoint;
                      return (
                        <div className="p-2.5 bg-black/90 border border-neutral-800 rounded-xl shadow-xl text-xs space-y-0.5">
                          <p className="text-white font-semibold">{data.label}</p>
                          <p className="text-neutral-400">{data.count} orders</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-800 text-xs">
            {ordersByStatus.map((status) => (
              <div key={status.status} className="flex items-center gap-2 text-neutral-300">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: STATUS_COLORS[status.status] || "#737373" }}
                />
                <span className="truncate text-[11px]">{status.label}:</span>
                <span className="font-mono text-[11px] text-white font-medium ml-auto">
                  {status.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Products Table */}
      <div className="p-6 sm:p-8 rounded-[28px] bg-neutral-900/80 border border-neutral-800 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Package className="w-5 h-5 text-amber-400" />
            Top Selling Accessories
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Ranked by total revenue generated across completed and active orders.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-400 text-xs uppercase tracking-wider">
                <th className="pb-3 pl-2">Product Name</th>
                <th className="pb-3 text-center">Units Sold</th>
                <th className="pb-3 text-right pr-2">Total Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {topProducts.map((prod, index) => (
                <tr key={prod.productId} className="hover:bg-neutral-800/20 transition-colors">
                  <td className="py-3.5 pl-2">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-neutral-800 text-neutral-400 text-xs flex items-center justify-center font-mono">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-medium text-white text-sm">{prod.name}</p>
                        <p className="text-[11px] font-mono text-neutral-500">{prod.productId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 text-center font-mono text-neutral-300">
                    {prod.unitsSold}
                  </td>
                  <td className="py-3.5 text-right pr-2 font-mono font-semibold text-white">
                    ₹{prod.revenue.toLocaleString("en-IN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
