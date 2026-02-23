"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, SlidersHorizontal, Star, ShoppingCart, ChevronLeft, ChevronRight } from "lucide-react";
import { getProducts, getCategories } from "@/lib/api/productApi";
import { toast } from "sonner";

function ProductCard({ product }) {
  return (
    <Link href={`/products/${product.id}`} className="group">
      <div className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        <div className="relative aspect-square bg-muted overflow-hidden">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-5xl">📦</div>
          )}
          {product.inventory?.available_quantity === 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-semibold text-sm px-3 py-1 bg-red-600 rounded-full">Out of Stock</span>
            </div>
          )}
          {product.inventory?.is_low_stock && product.inventory?.available_quantity > 0 && (
            <div className="absolute top-2 right-2">
              <span className="text-xs font-semibold px-2 py-1 bg-amber-500 text-white rounded-full">Low Stock</span>
            </div>
          )}
        </div>
        <div className="p-4">
          {product.category && (
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{product.category.name}</p>
          )}
          <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors mb-2">
            {product.name}
          </h3>
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-primary">${parseFloat(product.price).toFixed(2)}</span>
            <button
              className="p-2 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
              onClick={(e) => {
                e.preventDefault();
                toast.success(`${product.name} added to cart!`);
              }}
            >
              <ShoppingCart className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [filters, setFilters] = useState({
    search: "",
    category_id: "",
    min_price: "",
    max_price: "",
    sort: "created_at",
    order: "desc",
    per_page: 12,
    page: 1,
  });
  const [showFilters, setShowFilters] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== "" && v !== null)
      );
      const data = await getProducts(cleanFilters);
      setProducts(data.data || []);
      setPagination({
        current_page: data.current_page,
        last_page: data.last_page,
        total: data.total,
      });
    } catch (err) {
      toast.error("Failed to load products.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    getCategories()
      .then((res) => setCategories(res.data || []))
      .catch(() => {});
  }, []);

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-2">Shop Everything</h1>
          <p className="text-muted-foreground text-lg">Discover {pagination.total} amazing products</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search + Filter bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search products..."
              value={filters.search}
              onChange={(e) => updateFilter("search", e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card hover:bg-muted transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
          </button>
          <select
            value={`${filters.sort}-${filters.order}`}
            onChange={(e) => {
              const [sort, order] = e.target.value.split("-");
              setFilters((prev) => ({ ...prev, sort, order, page: 1 }));
            }}
            className="px-4 py-2.5 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="created_at-desc">Newest First</option>
            <option value="created_at-asc">Oldest First</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name-asc">Name A–Z</option>
          </select>
        </div>

        {/* Collapsible Filters */}
        {showFilters && (
          <div className="mb-8 p-6 rounded-2xl border border-border bg-card grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">Category</label>
              <select
                value={filters.category_id}
                onChange={(e) => updateFilter("category_id", e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">Min Price</label>
              <input
                type="number"
                min="0"
                value={filters.min_price}
                onChange={(e) => updateFilter("min_price", e.target.value)}
                placeholder="$0"
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">Max Price</label>
              <input
                type="number"
                min="0"
                value={filters.max_price}
                onChange={(e) => updateFilter("max_price", e.target.value)}
                placeholder="$9999"
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        )}

        <div className="flex gap-8">
          {/* Category Sidebar */}
          <aside className="hidden lg:block w-56 shrink-0">
            <h2 className="font-semibold text-foreground mb-4">Categories</h2>
            <ul className="space-y-1">
              <li>
                <button
                  onClick={() => updateFilter("category_id", "")}
                  className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors ${
                    !filters.category_id ? "bg-primary text-primary-foreground font-medium" : "hover:bg-muted text-foreground"
                  }`}
                >
                  All Products
                </button>
              </li>
              {categories.map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => updateFilter("category_id", cat.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors ${
                      filters.category_id == cat.id ? "bg-primary text-primary-foreground font-medium" : "hover:bg-muted text-foreground"
                    }`}
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          {/* Product Grid */}
          <main className="flex-1">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="animate-pulse rounded-2xl bg-muted aspect-[3/4]" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                <p className="text-5xl mb-4">🔍</p>
                <p className="text-lg font-medium">No products found</p>
                <p className="text-sm mt-1">Try adjusting your filters</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {pagination.last_page > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-10">
                    <button
                      disabled={pagination.current_page === 1}
                      onClick={() => setFilters((prev) => ({ ...prev, page: prev.page - 1 }))}
                      className="p-2 rounded-xl border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-sm text-muted-foreground">
                      Page {pagination.current_page} of {pagination.last_page}
                    </span>
                    <button
                      disabled={pagination.current_page === pagination.last_page}
                      onClick={() => setFilters((prev) => ({ ...prev, page: prev.page + 1 }))}
                      className="p-2 rounded-xl border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
