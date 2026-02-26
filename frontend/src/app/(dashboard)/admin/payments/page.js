"use client";

import { useState, useEffect } from "react";
import { Search, RefreshCw } from "lucide-react";
import { getAdminPayments, refundPayment } from "@/lib/api/paymentApi";
import { toast } from "sonner";

const STATUS_CONFIG = {
  pending:             { label: "Pending",             color: "bg-yellow-100 text-yellow-800" },
  processing:          { label: "Processing",          color: "bg-blue-100 text-blue-800" },
  succeeded:           { label: "Succeeded",           color: "bg-green-100 text-green-800" },
  failed:              { label: "Failed",               color: "bg-red-100 text-red-800" },
  refunded:            { label: "Refunded",             color: "bg-gray-100 text-gray-800" },
  partially_refunded:  { label: "Partial Refund",      color: "bg-orange-100 text-orange-800" },
  cancelled:           { label: "Cancelled",           color: "bg-red-100 text-red-800" },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, color: "bg-gray-100 text-gray-800" };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}

export default function AdminPaymentsPage() {
  const [payments, setPayments]       = useState([]);
  const [meta, setMeta]               = useState(null);
  const [page, setPage]               = useState(1);
  const [loading, setLoading]         = useState(true);
  const [statusFilter, setStatus]     = useState("");
  const [gatewayFilter, setGateway]   = useState("");
  const [refundModal, setRefundModal] = useState(null); // { payment }
  const [refundAmount, setRefundAmt]  = useState("");
  const [refunding, setRefunding]     = useState(false);

  const fetchPayments = (p = 1) => {
    setLoading(true);
    const filters = {};
    if (statusFilter)  filters.status  = statusFilter;
    if (gatewayFilter) filters.gateway = gatewayFilter;

    getAdminPayments(filters, p, 15)
      .then((res) => {
        setPayments(res.data?.data ?? []);
        setMeta(res.data?.meta ?? null);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPayments(page); }, [page, statusFilter, gatewayFilter]);

  const handleRefund = async () => {
    if (!refundModal || !refundAmount) return;
    const amt = parseFloat(refundAmount);
    if (isNaN(amt) || amt <= 0) { toast.error("Enter a valid refund amount."); return; }

    setRefunding(true);
    try {
      await refundPayment(refundModal.id, amt);
      toast.success(`Refund of $${amt.toFixed(2)} processed.`);
      setRefundModal(null);
      setRefundAmt("");
      fetchPayments(page);
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Refund failed.");
    } finally {
      setRefunding(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Payments</h1>
        <p className="text-sm text-muted-foreground">Track all payment transactions and issue refunds</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <select
          value={statusFilter}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="">All Statuses</option>
          {Object.keys(STATUS_CONFIG).map((s) => (
            <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
          ))}
        </select>

        <select
          value={gatewayFilter}
          onChange={(e) => { setGateway(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="">All Gateways</option>
          <option value="stripe">Stripe</option>
          <option value="paypal">PayPal</option>
          <option value="cod">Cash on Delivery</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-5 py-3 font-semibold text-muted-foreground">ID</th>
                <th className="text-left px-5 py-3 font-semibold text-muted-foreground">Order</th>
                <th className="text-left px-5 py-3 font-semibold text-muted-foreground">Amount</th>
                <th className="text-left px-5 py-3 font-semibold text-muted-foreground">Gateway</th>
                <th className="text-left px-5 py-3 font-semibold text-muted-foreground">Status</th>
                <th className="text-left px-5 py-3 font-semibold text-muted-foreground">Refunded</th>
                <th className="text-left px-5 py-3 font-semibold text-muted-foreground">Date</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(8)].map((_, j) => (
                      <td key={j} className="px-5 py-4"><div className="h-4 rounded bg-muted animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-muted-foreground">No payments found.</td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-4 text-muted-foreground">#{p.id}</td>
                    <td className="px-5 py-4 text-muted-foreground">#{p.order_id}</td>
                    <td className="px-5 py-4 font-semibold text-foreground">
                      ${parseFloat(p.amount).toFixed(2)} <span className="text-xs text-muted-foreground">{p.currency}</span>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground capitalize">{p.gateway ?? p.payment_method}</td>
                    <td className="px-5 py-4"><StatusBadge status={p.status} /></td>
                    <td className="px-5 py-4 text-muted-foreground">${parseFloat(p.refunded_amount).toFixed(2)}</td>
                    <td className="px-5 py-4 text-muted-foreground text-xs">
                      {new Date(p.created_at).toLocaleDateString("en-IN")}
                    </td>
                    <td className="px-5 py-4">
                      {p.is_refundable && (
                        <button
                          onClick={() => { setRefundModal(p); setRefundAmt(""); }}
                          className="flex items-center gap-1 text-orange-600 hover:text-orange-700 text-xs font-medium"
                        >
                          <RefreshCw className="w-3.5 h-3.5" /> Refund
                        </button>
                      )}
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
            <p className="text-sm text-muted-foreground">{meta.from}–{meta.to} of {meta.total}</p>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="px-3 py-1.5 rounded-lg border border-border text-sm disabled:opacity-40 hover:bg-muted">Previous</button>
              <button disabled={page === meta.last_page} onClick={() => setPage((p) => p + 1)} className="px-3 py-1.5 rounded-lg border border-border text-sm disabled:opacity-40 hover:bg-muted">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Refund Modal */}
      {refundModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl border border-border p-6 w-full max-w-md shadow-2xl">
            <h3 className="font-bold text-foreground text-lg mb-1">Issue Refund</h3>
            <p className="text-sm text-muted-foreground mb-5">
              Payment #{refundModal.id} · Order #{refundModal.order_id} ·{" "}
              Max refundable: <span className="text-foreground font-medium">
                ${(refundModal.amount - refundModal.refunded_amount).toFixed(2)}
              </span>
            </p>
            <div className="mb-5">
              <label className="block text-sm font-medium text-foreground mb-1.5">Refund Amount (USD)</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                max={refundModal.amount - refundModal.refunded_amount}
                value={refundAmount}
                onChange={(e) => setRefundAmt(e.target.value)}
                placeholder="e.g. 29.99"
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setRefundModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRefund}
                disabled={refunding}
                className="flex-1 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50"
              >
                {refunding ? "Processing..." : "Confirm Refund"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
