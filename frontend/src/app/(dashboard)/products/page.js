"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Search, SlidersHorizontal, Star, ShoppingCart, ChevronLeft, ChevronRight, X } from "lucide-react";
import { getProducts, getCategories } from "@/lib/api/productApi";
import { addToCart } from "@/lib/api/cartApi";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";

function ProductCard({ product }) {
  const { data: session } = useSession();
  const rating = Math.floor(Math.random() * 2) + 4; // Mock rating 4-5
  const reviews = Math.floor(Math.random() * 500) + 50;

  const available = product.inventory ? (product.inventory.available_quantity ?? product.inventory.quantity ?? 0) : 0;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!session) {
      toast.error("Please login to add items to cart.");
      return;
    }

    try {
      await addToCart(
        {
          product_id: product.id,
          product_name: product.name,
          price: product.price,
          image_url: product.image_url,
          quantity: 1,
        },
        session.user.id
      );
      toast.success(`${product.name} added to cart!`);
    } catch (error) {
      toast.error("Failed to add product to cart.");
    }
  };

  return (
    <Link href={`/products/${product.id}`} className="group flex flex-col h-full">
      <div className="bg-white rounded-lg overflow-hidden border border-transparent group-hover:border-slate-200 group-hover:shadow-md transition-all duration-200 flex flex-col h-full p-2">
        {/* Image Container */}
        <div className="relative aspect-square w-full mb-3 bg-slate-50 rounded-md overflow-hidden">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-contain mix-blend-multiply p-2 group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300 text-4xl italic">
              📦
            </div>
          )}
          
          {available === 0 && (
            <div className="absolute inset-x-0 bottom-0 bg-white/90 py-1 text-center">
              <span className="text-[10px] font-bold text-red-600 uppercase tracking-tight">Out of Stock</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1">
          <h3 className="text-sm font-normal text-slate-800 line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors leading-tight">
            {product.name}
          </h3>
          
          {/* Rating */}
          <div className="flex items-center gap-1 mb-1.5">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-3 h-3 ${i < rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} 
                />
              ))}
            </div>
            <span className="text-[11px] text-blue-600 hover:underline">{reviews}</span>
          </div>

          <div className="mt-auto pt-2 flex items-end justify-between">
            <div className="flex flex-col">
              <span className="text-lg font-bold text-slate-900">${parseFloat(product.price).toFixed(2)}</span>
              <span className="text-[10px] text-slate-400 line-through">${(parseFloat(product.price) * 1.2).toFixed(2)}</span>
            </div>
            
            <button
              className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors"
              onClick={handleAddToCart}
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

  const FilterSidebar = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider">Department</h3>
        <div className="space-y-2">
          <button
            onClick={() => updateFilter("category_id", "")}
            className={`block text-sm transition-colors text-left w-full ${!filters.category_id ? "font-bold text-blue-600" : "text-slate-600 hover:text-blue-600"}`}
          >
            All Departments
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => updateFilter("category_id", cat.id)}
              className={`block text-sm transition-colors text-left w-full ${filters.category_id == cat.id ? "font-bold text-blue-600" : "text-slate-600 hover:text-blue-600"}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div className="pt-6 border-t border-slate-200">
        <h3 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider">Price</h3>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
            <input
              type="number"
              placeholder="Min"
              className="w-full pl-5 pr-2 py-1.5 text-xs border border-slate-200 rounded focus:ring-1 focus:ring-blue-500 outline-none"
              value={filters.min_price}
              onChange={(e) => updateFilter("min_price", e.target.value)}
            />
          </div>
          <span className="text-slate-400">-</span>
          <div className="relative flex-1">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
            <input
              type="number"
              placeholder="Max"
              className="w-full pl-5 pr-2 py-1.5 text-xs border border-slate-200 rounded focus:ring-1 focus:ring-blue-500 outline-none"
              value={filters.max_price}
              onChange={(e) => updateFilter("max_price", e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-slate-200">
        <h3 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider">Avg. Customer Review</h3>
        <div className="space-y-1.5">
          {[4, 3, 2, 1].map((rating) => (
            <button key={rating} className="flex items-center gap-1 group w-full">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-3.5 h-3.5 ${i < rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} />
                ))}
              </div>
              <span className="text-xs text-slate-600 group-hover:text-blue-600">& Up</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header Bar */}
      <div className="bg-white border-b border-slate-200 py-3 sticky top-0 z-30 px-4">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center gap-4">
          <div className="text-sm font-medium text-slate-500 whitespace-nowrap hidden sm:block">
            {pagination.total} results for <span className="text-slate-900">"All Products"</span>
          </div>

          <div className="flex-1 w-full relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={filters.search}
              onChange={(e) => updateFilter("search", e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={`${filters.sort}-${filters.order}`}
              onChange={(e) => {
                const [sort, order] = e.target.value.split("-");
                setFilters((prev) => ({ ...prev, sort, order, page: 1 }));
              }}
              className="flex-1 md:flex-none text-sm border border-slate-200 rounded px-3 py-2 outline-none"
            >
              <option value="created_at-desc">Sort by: Newest</option>
              <option value="price-asc">Sort by: Price: Low to High</option>
              <option value="price-desc">Sort by: Price: High to Low</option>
              <option value="name-asc">Sort by: Name A-Z</option>
            </select>

            <Sheet>
              <SheetTrigger asChild>
                <button className="md:hidden flex items-center gap-2 px-3 py-2 border border-slate-200 rounded text-sm hover:bg-slate-50">
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>Filters</span>
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] pt-10">
                <SheetHeader className="mb-6">
                  <SheetTitle className="text-left">Apply Filters</SheetTitle>
                </SheetHeader>
                <FilterSidebar />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 py-6">
        <div className="flex gap-8">
          {/* Static Sidebar */}
          <aside className="hidden md:block w-56 shrink-0">
            <FilterSidebar />
          </aside>

          {/* Product Grid */}
          <main className="flex-1">
            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-lg p-3 animate-pulse">
                    <div className="aspect-square bg-slate-100 rounded-md mb-3" />
                    <div className="h-4 bg-slate-100 rounded w-3/4 mb-2" />
                    <div className="h-4 bg-slate-100 rounded w-1/2 mb-4" />
                    <div className="h-6 bg-slate-100 rounded w-1/3" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-lg border border-slate-200 py-20 text-center shadow-sm">
                <p className="text-5xl mb-4">🔍</p>
                <p className="text-lg font-medium text-slate-800">No results found</p>
                <p className="text-sm text-slate-500 mt-1">Try clearing filters or searching for something else</p>
                <Button 
                  variant="outline" 
                  className="mt-6"
                  onClick={() => setFilters({
                    search: "",
                    category_id: "",
                    min_price: "",
                    max_price: "",
                    sort: "created_at",
                    order: "desc",
                    per_page: 12,
                    page: 1,
                  })}
                >
                  Clear All Filters
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {pagination.last_page > 1 && (
                  <div className="flex items-center justify-center gap-3 mt-12 bg-white border border-slate-200 rounded-lg p-2 w-fit mx-auto shadow-sm">
                    <button
                      disabled={pagination.current_page === 1}
                      onClick={() => setFilters((prev) => ({ ...prev, page: prev.page - 1 }))}
                      className="p-2 hover:bg-slate-50 disabled:opacity-30 rounded-md transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5 text-slate-700" />
                    </button>
                    
                    <div className="flex items-center gap-1">
                      {[...Array(pagination.last_page)].map((_, i) => (
                        <button
                          key={i}
                          onClick={() => updateFilter("page", i + 1)}
                          className={`w-8 h-8 text-xs rounded-md transition-colors ${
                            pagination.current_page === i + 1 
                              ? "bg-blue-600 text-white font-bold" 
                              : "hover:bg-slate-50 text-slate-600"
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>

                    <button
                      disabled={pagination.current_page === pagination.last_page}
                      onClick={() => setFilters((prev) => ({ ...prev, page: prev.page + 1 }))}
                      className="p-2 hover:bg-slate-50 disabled:opacity-30 rounded-md transition-colors"
                    >
                      <ChevronRight className="w-5 h-5 text-slate-700" />
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
