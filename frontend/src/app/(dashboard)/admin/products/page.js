"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, RefreshCw, Search, Package } from "lucide-react";
import { getAdminProducts, deleteProduct } from "@/lib/api/productApi";
import { toast } from "sonner";

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [deletingId, setDeletingId] = useState(null);

  const fetchProducts = async (page = 1) => {
    setLoading(true);
    try {
      const data = await getAdminProducts({ search, per_page: 15, page });
      setProducts(data.data || []);
      setPagination({ current_page: data.current_page, last_page: data.last_page, total: data.total });
    } catch {
      toast.error("Failed to load products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => fetchProducts(1), 300);
    return () => clearTimeout(timeout);
  }, [search]);

  const handleDelete = async (product) => {
    if (!confirm(`Deactivate "${product.name}"? This will hide it from customers.`)) return;
    setDeletingId(product.id);
    try {
      // In production, pass real admin token
      await deleteProduct(product.id, "");
      toast.success("Product deactivated.");
      fetchProducts(pagination.current_page);
    } catch {
      toast.error("Failed to deactivate product.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Products</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your product catalog ({pagination.total} total)</p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search products by name, SKU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border overflow-hidden bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Product</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">SKU</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Category</th>
                <th className="text-right px-5 py-3 font-medium text-muted-foreground">Price</th>
                <th className="text-right px-5 py-3 font-medium text-muted-foreground">Stock</th>
                <th className="text-center px-5 py-3 font-medium text-muted-foreground">Status</th>
                <th className="text-right px-5 py-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-4 bg-muted rounded-lg" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-muted-foreground">
                    <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p>No products found</p>
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted shrink-0">
                          {product.image_url ? (
                            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-lg">📦</div>
                          )}
                        </div>
                        <span className="font-medium text-foreground line-clamp-1 max-w-[200px]">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground font-mono text-xs">{product.sku}</td>
                    <td className="px-5 py-4 text-muted-foreground">{product.category?.name ?? "—"}</td>
                    <td className="px-5 py-4 text-right font-semibold text-foreground">${parseFloat(product.price).toFixed(2)}</td>
                    <td className="px-5 py-4 text-right">
                      <span className={`font-medium ${(product.inventory?.available_quantity ?? 0) === 0 ? "text-red-500" : (product.inventory?.available_quantity ?? 0) <= 10 ? "text-amber-500" : "text-green-500"}`}>
                        {product.inventory?.available_quantity ?? "—"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${product.is_active ? "bg-green-500/15 text-green-600" : "bg-red-500/15 text-red-600"}`}>
                        {product.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(product)}
                          disabled={deletingId === product.id}
                          className="p-2 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
                        >
                          {deletingId === product.id ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.last_page > 1 && (
          <div className="px-5 py-4 border-t border-border flex items-center justify-between text-sm text-muted-foreground">
            <span>Showing {products.length} of {pagination.total}</span>
            <div className="flex gap-1">
              {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => fetchProducts(page)}
                  className={`w-8 h-8 rounded-lg text-sm transition-colors ${page === pagination.current_page ? "bg-primary text-primary-foreground font-medium" : "hover:bg-muted"}`}
                >
                  {page}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
