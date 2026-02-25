"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Package, ChevronRight, Clock, CheckCircle, Truck, XCircle, RefreshCw } from "lucide-react";
import { getMyOrders } from "@/lib/api/orderApi";
import { useSession } from "next-auth/react";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  pending:    { label: "Pending",    color: "bg-yellow-100 text-yellow-800",  icon: Clock },
  confirmed:  { label: "Confirmed",  color: "bg-blue-100 text-blue-800",      icon: CheckCircle },
  processing: { label: "Processing", color: "bg-purple-100 text-purple-800",  icon: RefreshCw },
  shipped:    { label: "Shipped",    color: "bg-indigo-100 text-indigo-800",  icon: Truck },
  delivered:  { label: "Delivered",  color: "bg-green-100 text-green-800",    icon: CheckCircle },
  cancelled:  { label: "Cancelled",  color: "bg-red-100 text-red-800",        icon: XCircle },
  refunded:   { label: "Refunded",   color: "bg-gray-100 text-gray-800",      icon: RefreshCw },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, color: "bg-gray-100 text-gray-800", icon: Clock };
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.color}`}>
      <Icon className="w-3.5 h-3.5" />
      {cfg.label}
    </span>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OrdersPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id ?? null;

  const [orders, setOrders]     = useState([]);
  const [meta, setMeta]         = useState(null);
  const [page, setPage]         = useState(1);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    setLoading(true);
    getMyOrders(userId, page, 10)
      .then((res) => {
        setOrders(res.data?.data ?? []);
        setMeta(res.data?.meta ?? null);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [userId, page]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-4">
        <h1 className="text-2xl font-bold text-foreground mb-6">My Orders</h1>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 rounded-2xl bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-foreground mb-6">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <Package className="w-16 h-16 mx-auto text-muted-foreground opacity-40 mb-4" />
          <p className="text-muted-foreground">You haven't placed any orders yet.</p>
          <Link href="/products" className="mt-4 inline-block text-primary hover:underline">
            Start Shopping →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="flex items-center justify-between p-5 rounded-2xl border border-border bg-card hover:shadow-md transition-all group"
            >
              <div className="space-y-1">
                <p className="font-semibold text-foreground">{order.order_number}</p>
                <p className="text-sm text-muted-foreground">
                  {order.items?.length ?? 0} item{(order.items?.length ?? 0) !== 1 ? "s" : ""} ·{" "}
                  <span className="font-medium text-foreground">${parseFloat(order.total_amount).toFixed(2)}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(order.created_at).toLocaleDateString("en-IN", {
                    day: "numeric", month: "short", year: "numeric",
                  })}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={order.status} />
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.last_page > 1 && (
        <div className="flex justify-center gap-3 mt-8">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 rounded-xl border border-border text-sm font-medium disabled:opacity-40 hover:bg-muted transition-colors"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-sm text-muted-foreground">
            Page {meta.current_page} of {meta.last_page}
          </span>
          <button
            disabled={page === meta.last_page}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 rounded-xl border border-border text-sm font-medium disabled:opacity-40 hover:bg-muted transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
