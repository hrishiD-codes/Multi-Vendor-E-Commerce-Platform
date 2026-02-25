"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Package, MapPin, CreditCard, AlertCircle } from "lucide-react";
import { getOrder, updateOrderStatus } from "@/lib/api/orderApi";
import { toast } from "sonner";

const STATUS_CONFIG = {
  pending:    { label: "Pending",    color: "bg-yellow-100 text-yellow-800" },
  confirmed:  { label: "Confirmed",  color: "bg-blue-100 text-blue-800" },
  processing: { label: "Processing", color: "bg-purple-100 text-purple-800" },
  shipped:    { label: "Shipped",    color: "bg-indigo-100 text-indigo-800" },
  delivered:  { label: "Delivered",  color: "bg-green-100 text-green-800" },
  cancelled:  { label: "Cancelled",  color: "bg-red-100 text-red-800" },
  refunded:   { label: "Refunded",   color: "bg-gray-100 text-gray-800" },
};

const ALL_STATUSES = Object.keys(STATUS_CONFIG);

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, color: "bg-gray-100 text-gray-800" };
  return (
    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}

export default function AdminOrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder]       = useState(null);
  const [loading, setLoading]   = useState(true);
  const [newStatus, setNewStatus] = useState("");
  const [statusNote, setStatusNote] = useState("");
  const [updating, setUpdating]   = useState(false);

  useEffect(() => {
    getOrder(id)
      .then((res) => {
        setOrder(res.data);
        setNewStatus(res.data.status);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleStatusUpdate = async () => {
    if (newStatus === order.status) {
      toast.info("Status is already set to this value.");
      return;
    }
    setUpdating(true);
    try {
      const res = await updateOrderStatus(id, newStatus, statusNote || null);
      setOrder(res.data);
      setStatusNote("");
      toast.success(`Order status updated to "${STATUS_CONFIG[newStatus]?.label}".`);
    } catch {
      toast.error("Failed to update status.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 rounded-2xl bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="w-16 h-16 mx-auto text-muted-foreground opacity-40 mb-4" />
        <p className="text-muted-foreground">Order not found.</p>
        <Link href="/admin/orders" className="mt-4 inline-block text-primary hover:underline">← Back</Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link href="/admin/orders" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3">
            <ArrowLeft className="w-4 h-4" /> All Orders
          </Link>
          <h1 className="text-2xl font-bold text-foreground">{order.order_number}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Customer: User #{order.user_id} · Placed {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Items + Status Management */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Package className="w-4 h-4" /> Order Items
            </h2>
            <div className="space-y-3">
              {order.items?.map((item) => (
                <div key={item.id} className="flex gap-4 py-3 border-b border-border last:border-0">
                  <div className="w-12 h-12 rounded-xl bg-muted shrink-0 overflow-hidden">
                    {item.product_image
                      ? <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center">📦</div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground line-clamp-1">{item.product_name}</p>
                    <p className="text-sm text-muted-foreground">${parseFloat(item.price).toFixed(2)} × {item.quantity}</p>
                  </div>
                  <p className="font-semibold text-foreground">${parseFloat(item.subtotal).toFixed(2)}</p>
                </div>
              ))}
            </div>
            <div className="flex justify-between font-bold text-lg pt-4 border-t border-border mt-2">
              <span>Total</span>
              <span>${parseFloat(order.total_amount).toFixed(2)}</span>
            </div>
          </div>

          {/* Status Update Panel */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-semibold text-foreground mb-4">Update Order Status</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">New Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  {ALL_STATUSES.map((s) => (
                    <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Note (optional)</label>
                <textarea
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="e.g. Package dispatched via DHL, tracking #123..."
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <button
                onClick={handleStatusUpdate}
                disabled={updating}
                className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {updating ? "Updating..." : "Update Status"}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Shipping + Payment + History */}
        <div className="space-y-5">
          {/* Shipping */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4" /> Shipping Address
            </h2>
            {order.shipping_address && (
              <div className="text-sm text-muted-foreground space-y-1">
                <p className="font-medium text-foreground">{order.shipping_address.name}</p>
                <p>{order.shipping_address.address_line}</p>
                <p>{order.shipping_address.city}{order.shipping_address.state ? `, ${order.shipping_address.state}` : ""}</p>
                <p>{order.shipping_address.postal_code}, {order.shipping_address.country}</p>
                {order.shipping_address.phone && <p>📞 {order.shipping_address.phone}</p>}
              </div>
            )}
          </div>

          {/* Payment */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2 text-sm">
              <CreditCard className="w-4 h-4" /> Payment
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Method</span>
                <span className="font-medium capitalize">{order.payment_method ?? "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className={`font-semibold capitalize ${
                  order.payment_status === "paid" ? "text-green-600" :
                  order.payment_status === "refunded" ? "text-gray-500" : "text-yellow-600"
                }`}>{order.payment_status}</span>
              </div>
              <div className="flex justify-between font-bold pt-2 border-t border-border">
                <span>Total</span>
                <span>${parseFloat(order.total_amount).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Status History */}
          {order.status_history?.length > 0 && (
            <div className="rounded-2xl border border-border bg-card p-5">
              <h2 className="font-semibold text-foreground mb-3 text-sm">Status History</h2>
              <div className="space-y-3">
                {order.status_history.map((h, i) => (
                  <div key={i} className="flex gap-2.5 text-xs">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                    <div>
                      <p className="font-medium capitalize text-foreground">{h.status}</p>
                      {h.note && <p className="text-muted-foreground">{h.note}</p>}
                      <p className="text-muted-foreground/70 mt-0.5">{new Date(h.at).toLocaleString("en-IN")}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
