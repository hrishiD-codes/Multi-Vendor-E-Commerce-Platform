"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, ChevronRight, Clock, CheckCircle, Truck, XCircle, RefreshCw } from "lucide-react";
import { getAdminOrders } from "@/lib/api/orderApi";

const STATUS_CONFIG = {
  pending:    { label: "Pending",    color: "bg-yellow-100 text-yellow-800" },
  confirmed:  { label: "Confirmed",  color: "bg-blue-100 text-blue-800" },
  processing: { label: "Processing", color: "bg-purple-100 text-purple-800" },
  shipped:    { label: "Shipped",    color: "bg-indigo-100 text-indigo-800" },
  delivered:  { label: "Delivered",  color: "bg-green-100 text-green-800" },
  cancelled:  { label: "Cancelled",  color: "bg-red-100 text-red-800" },
  refunded:   { label: "Refunded",   color: "bg-gray-100 text-gray-800" },
};

const PAYMENT_STATUS_COLORS = {
  unpaid:   "text-yellow-600",
  paid:     "text-green-600",
  refunded: "text-gray-500",
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, color: "bg-gray-100 text-gray-800" };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}

export default function AdminOrdersPage() {
  const [orders, setOrders]     = useState([]);
  const [meta, setMeta]         = useState(null);
  const [page, setPage]         = useState(1);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchOrders = (p = 1) => {
    setLoading(true);
    const filters = {};
    if (search) filters.search = search;
    if (statusFilter) filters.status = statusFilter;

    getAdminOrders(filters, p, 15)
      .then((res) => {
        setOrders(res.data?.data ?? []);
        setMeta(res.data?.meta ?? null);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(page); }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchOrders(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Orders</h1>
          <p className="text-sm text-muted-foreground">Manage and track all customer orders</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order number..."
            className="pl-9 pr-4 py-2 rounded-xl border border-border bg-background text-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </form>

        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); fetchOrders(1); }}
          className="px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="">All Statuses</option>
          {Object.keys(STATUS_CONFIG).map((s) => (
            <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-5 py-3 font-semibold text-muted-foreground">Order #</th>
                <th className="text-left px-5 py-3 font-semibold text-muted-foreground">Customer</th>
                <th className="text-left px-5 py-3 font-semibold text-muted-foreground">Items</th>
                <th className="text-left px-5 py-3 font-semibold text-muted-foreground">Total</th>
                <th className="text-left px-5 py-3 font-semibold text-muted-foreground">Status</th>
                <th className="text-left px-5 py-3 font-semibold text-muted-foreground">Payment</th>
                <th className="text-left px-5 py-3 font-semibold text-muted-foreground">Date</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(8)].map((_, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-4 rounded bg-muted animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-muted-foreground">
                    No orders found.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-4 font-medium text-foreground">{order.order_number}</td>
                    <td className="px-5 py-4 text-muted-foreground">User #{order.user_id}</td>
                    <td className="px-5 py-4 text-muted-foreground">{order.items?.length ?? 0}</td>
                    <td className="px-5 py-4 font-semibold text-foreground">
                      ${parseFloat(order.total_amount).toFixed(2)}
                    </td>
                    <td className="px-5 py-4"><StatusBadge status={order.status} /></td>
                    <td className="px-5 py-4">
                      <span className={`font-medium capitalize ${PAYMENT_STATUS_COLORS[order.payment_status] ?? "text-muted-foreground"}`}>
                        {order.payment_status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground text-xs">
                      {new Date(order.created_at).toLocaleDateString("en-IN")}
                    </td>
                    <td className="px-5 py-4">
                      <Link href={`/admin/orders/${order.id}`} className="flex items-center gap-1 text-primary hover:underline text-xs font-medium">
                        Manage <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta && meta.last_page > 1 && (
          <div className="flex justify-between items-center px-5 py-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              {meta.from}–{meta.to} of {meta.total} orders
            </p>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1.5 rounded-lg border border-border text-sm disabled:opacity-40 hover:bg-muted transition-colors"
              >
                Previous
              </button>
              <button
                disabled={page === meta.last_page}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 rounded-lg border border-border text-sm disabled:opacity-40 hover:bg-muted transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
