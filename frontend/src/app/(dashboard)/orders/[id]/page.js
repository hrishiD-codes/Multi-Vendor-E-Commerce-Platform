"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft, Package, MapPin, CreditCard,
  Clock, CheckCircle, Truck, XCircle, RefreshCw, AlertCircle
} from "lucide-react";
import { getOrder, cancelOrder } from "@/lib/api/orderApi";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

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
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${cfg.color}`}>
      <Icon className="w-4 h-4" />
      {cfg.label}
    </span>
  );
}

// Status timeline steps
const TIMELINE_STEPS = ["pending", "confirmed", "processing", "shipped", "delivered"];

export default function OrderDetailPage() {
  const { id } = useParams();
  const { data: session } = useSession();
  const userId = session?.user?.id ?? null;

  const [order, setOrder]         = useState(null);
  const [loading, setLoading]     = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    getOrder(id, userId)
      .then((res) => setOrder(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id, userId]);

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this order?")) return;
    setCancelling(true);
    try {
      const res = await cancelOrder(id, userId);
      setOrder(res.data);
      toast.success("Order cancelled successfully.");
    } catch {
      toast.error("Failed to cancel order.");
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
        <div className="h-8 w-48 rounded-xl bg-muted animate-pulse" />
        <div className="h-48 rounded-2xl bg-muted animate-pulse" />
        <div className="h-64 rounded-2xl bg-muted animate-pulse" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <AlertCircle className="w-16 h-16 mx-auto text-muted-foreground opacity-40 mb-4" />
        <p className="text-muted-foreground">Order not found.</p>
        <Link href="/orders" className="mt-4 inline-block text-primary hover:underline">← Back to Orders</Link>
      </div>
    );
  }

  const currentStep = TIMELINE_STEPS.indexOf(order.status);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link href="/orders" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3">
            <ArrowLeft className="w-4 h-4" /> Back to Orders
          </Link>
          <h1 className="text-2xl font-bold text-foreground">{order.order_number}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Placed on {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={order.status} />
          {order.is_cancellable && (
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="px-4 py-2 rounded-xl border border-red-300 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              {cancelling ? "Cancelling..." : "Cancel Order"}
            </button>
          )}
        </div>
      </div>

      {/* Status Timeline (only for non-cancelled orders) */}
      {!["cancelled", "refunded"].includes(order.status) && (
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-semibold text-foreground mb-5">Order Progress</h2>
          <div className="flex items-center">
            {TIMELINE_STEPS.map((step, i) => {
              const done    = i <= currentStep;
              const current = i === currentStep;
              return (
                <div key={step} className="flex-1 flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                      done ? "bg-primary border-primary text-primary-foreground" : "border-border bg-background text-muted-foreground"
                    } ${current ? "ring-4 ring-primary/20" : ""}`}>
                      <CheckCircle className="w-4 h-4" />
                    </div>
                    <p className={`text-xs mt-2 font-medium capitalize ${done ? "text-foreground" : "text-muted-foreground"}`}>
                      {STATUS_CONFIG[step]?.label ?? step}
                    </p>
                  </div>
                  {i < TIMELINE_STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-1 ${i < currentStep ? "bg-primary" : "bg-border"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Order Items */}
        <div className="md:col-span-2 rounded-2xl border border-border bg-card p-6">
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Package className="w-4 h-4" /> Items ({order.items?.length ?? 0})
          </h2>
          <div className="space-y-4">
            {order.items?.map((item) => (
              <div key={item.id} className="flex gap-4 py-3 border-b border-border last:border-0">
                <div className="w-14 h-14 rounded-xl bg-muted shrink-0 overflow-hidden">
                  {item.product_image ? (
                    <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xl">📦</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground line-clamp-1">{item.product_name}</p>
                  <p className="text-sm text-muted-foreground">${parseFloat(item.price).toFixed(2)} × {item.quantity}</p>
                </div>
                <p className="font-semibold text-foreground shrink-0">${parseFloat(item.subtotal).toFixed(2)}</p>
              </div>
            ))}
          </div>
          {/* Total */}
          <div className="flex justify-between font-bold text-lg pt-4 border-t border-border mt-2">
            <span>Total</span>
            <span>${parseFloat(order.total_amount).toFixed(2)}</span>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2">
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

        {/* Payment Info */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <CreditCard className="w-4 h-4" /> Payment
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Method</span>
              <span className="font-medium capitalize text-foreground">{order.payment_method ?? "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <span className={`font-semibold capitalize ${
                order.payment_status === "paid" ? "text-green-600" :
                order.payment_status === "refunded" ? "text-gray-500" : "text-yellow-600"
              }`}>
                {order.payment_status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Status History */}
      {order.status_history?.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-semibold text-foreground mb-4">Status History</h2>
          <div className="space-y-3">
            {order.status_history.map((h, i) => (
              <div key={i} className="flex items-start gap-3 text-sm">
                <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                <div>
                  <span className="font-medium capitalize text-foreground">{h.status}</span>
                  {h.note && <span className="text-muted-foreground ml-2">— {h.note}</span>}
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(h.at).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
