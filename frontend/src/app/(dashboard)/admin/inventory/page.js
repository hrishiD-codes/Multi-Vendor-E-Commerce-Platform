"use client";

import { useState, useEffect } from "react";
import { getAdminProducts, updateInventory } from "@/lib/api/productApi";
import { getLowStockProducts } from "@/lib/api/productApi";
import { AlertTriangle, CheckCircle, RefreshCw, Package } from "lucide-react";
import { toast } from "sonner";

function StockInput({ product, onSave }) {
  const current = product.inventory?.quantity ?? 0;
  const [qty, setQty] = useState(current);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (qty === current) return;
    setSaving(true);
    try {
      await updateInventory(product.id, { quantity: qty }, "");
      toast.success(`Stock updated for "${product.name}"`);
      onSave();
    } catch {
      toast.error("Failed to update stock.");
      setQty(current);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="number" min="0" value={qty}
        onChange={(e) => setQty(parseInt(e.target.value) || 0)}
        onBlur={save}
        className="w-24 px-3 py-1.5 rounded-lg border border-border bg-background text-foreground text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary"
      />
      {saving && <RefreshCw className="w-3.5 h-3.5 animate-spin text-muted-foreground" />}
    </div>
  );
}

export default function AdminInventoryPage() {
  const [products, setProducts] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [allRes, lowRes] = await Promise.all([
        getAdminProducts({ per_page: 50 }, ""),
        getLowStockProducts(""),
      ]);
      setProducts(allRes.data || []);
      setLowStock(lowRes.data || []);
    } catch {
      toast.error("Failed to load inventory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const displayed = tab === "low" ? lowStock : products;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Inventory</h1>
          <p className="text-muted-foreground text-sm mt-1">Monitor and adjust product stock levels</p>
        </div>
        <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border hover:bg-muted transition-colors text-sm">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-5 rounded-2xl bg-card border border-border">
          <p className="text-sm text-muted-foreground mb-1">Total Products</p>
          <p className="text-2xl font-bold text-foreground">{products.length}</p>
        </div>
        <div className="p-5 rounded-2xl bg-card border border-amber-500/30">
          <p className="text-sm text-muted-foreground mb-1">Low Stock Items</p>
          <p className="text-2xl font-bold text-amber-500">{lowStock.length}</p>
        </div>
        <div className="p-5 rounded-2xl bg-card border border-red-500/30">
          <p className="text-sm text-muted-foreground mb-1">Out of Stock</p>
          <p className="text-2xl font-bold text-red-500">
            {products.filter((p) => (p.inventory?.available_quantity ?? 0) === 0).length}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 border-b border-border">
        {[
          { key: "all", label: "All Products" },
          { key: "low", label: `Low Stock (${lowStock.length})` },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`pb-3 px-4 text-sm font-medium transition-colors border-b-2 ${tab === key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            {label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-border overflow-hidden bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left px-5 py-3 font-medium text-muted-foreground">Product</th>
              <th className="text-left px-5 py-3 font-medium text-muted-foreground">SKU</th>
              <th className="text-right px-5 py-3 font-medium text-muted-foreground">Reserved</th>
              <th className="text-right px-5 py-3 font-medium text-muted-foreground">Available</th>
              <th className="text-right px-5 py-3 font-medium text-muted-foreground">Total Qty</th>
              <th className="text-center px-5 py-3 font-medium text-muted-foreground">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {Array.from({ length: 6 }).map((_, j) => <td key={j} className="px-5 py-4"><div className="h-4 bg-muted rounded-lg" /></td>)}
                </tr>
              ))
            ) : displayed.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-16 text-muted-foreground">
                  <CheckCircle className="w-10 h-10 mx-auto mb-3 text-green-500 opacity-50" />
                  <p>{tab === "low" ? "No low-stock items — great!" : "No products found."}</p>
                </td>
              </tr>
            ) : (
              displayed.map((product) => {
                const inv = product.inventory;
                const available = inv?.available_quantity ?? 0;
                const isOut = available === 0;
                const isLow = !isOut && available <= (inv?.low_stock_threshold ?? 10);

                return (
                  <tr key={product.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg overflow-hidden bg-muted shrink-0">
                          {product.image_url ? <img src={product.image_url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-sm">📦</div>}
                        </div>
                        <span className="font-medium text-foreground line-clamp-1 max-w-[200px]">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground font-mono text-xs">{product.sku}</td>
                    <td className="px-5 py-4 text-right text-muted-foreground">{inv?.reserved_quantity ?? 0}</td>
                    <td className="px-5 py-4 text-right">
                      <span className={`font-semibold ${isOut ? "text-red-500" : isLow ? "text-amber-500" : "text-green-500"}`}>{available}</span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <StockInput product={product} onSave={fetchData} />
                    </td>
                    <td className="px-5 py-4 text-center">
                      {isOut ? (
                        <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-red-500/15 text-red-600 flex items-center gap-1 w-fit mx-auto">
                          <AlertTriangle className="w-3 h-3" /> Out of Stock
                        </span>
                      ) : isLow ? (
                        <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-amber-500/15 text-amber-600 flex items-center gap-1 w-fit mx-auto">
                          <AlertTriangle className="w-3 h-3" /> Low Stock
                        </span>
                      ) : (
                        <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-green-500/15 text-green-600 flex items-center gap-1 w-fit mx-auto">
                          <CheckCircle className="w-3 h-3" /> In Stock
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
