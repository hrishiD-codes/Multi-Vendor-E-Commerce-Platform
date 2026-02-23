"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, PackageOpen } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const { cart, loading, update, remove, clear } = useCart();
  const [clearing, setClearing] = useState(false);

  const handleClear = async () => {
    if (!confirm("Clear your entire cart?")) return;
    setClearing(true);
    await clear();
    setClearing(false);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold text-foreground mb-8">Your Cart</h1>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-4 p-4 rounded-2xl bg-muted animate-pulse h-28" />
          ))}
        </div>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <PackageOpen className="w-20 h-20 mx-auto text-muted-foreground mb-6 opacity-40" />
        <h1 className="text-2xl font-bold text-foreground mb-2">Your cart is empty</h1>
        <p className="text-muted-foreground mb-8">Browse our catalog and add something awesome!</p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
        >
          Shop Now <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Your Cart</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {cart.total_items} item{cart.total_items !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={handleClear}
          disabled={clearing}
          className="text-sm text-red-500 hover:text-red-600 flex items-center gap-1.5 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <div
              key={item.id}
              className="flex gap-4 p-4 rounded-2xl border border-border bg-card hover:shadow-sm transition-shadow"
            >
              {/* Image */}
              <div className="w-20 h-20 shrink-0 rounded-xl overflow-hidden bg-muted">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.product_name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <Link
                  href={`/products/${item.product_id}`}
                  className="font-semibold text-foreground hover:text-primary transition-colors line-clamp-2"
                >
                  {item.product_name}
                </Link>
                <p className="text-sm text-muted-foreground mt-0.5">
                  ${parseFloat(item.price).toFixed(2)} each
                </p>
              </div>

              {/* Quantity + Remove */}
              <div className="flex flex-col items-end justify-between shrink-0">
                <p className="font-bold text-foreground">${item.subtotal.toFixed(2)}</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center border border-border rounded-xl overflow-hidden">
                    <button
                      onClick={() => item.quantity > 1 ? update(item.id, item.quantity - 1) : remove(item.id)}
                      className="p-1.5 hover:bg-muted transition-colors"
                    >
                      {item.quantity === 1 ? <Trash2 className="w-3.5 h-3.5 text-red-500" /> : <Minus className="w-3.5 h-3.5" />}
                    </button>
                    <span className="px-3 text-sm font-semibold border-x border-border">{item.quantity}</span>
                    <button
                      onClick={() => update(item.id, item.quantity + 1)}
                      className="p-1.5 hover:bg-muted transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <aside className="lg:col-span-1">
          <div className="sticky top-6 rounded-2xl border border-border bg-card p-6 space-y-5">
            <h2 className="font-bold text-foreground text-lg">Order Summary</h2>

            <div className="space-y-3">
              {cart.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-muted-foreground line-clamp-1 max-w-[160px]">
                    {item.product_name} × {item.quantity}
                  </span>
                  <span className="text-foreground font-medium shrink-0">${item.subtotal.toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-4 space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Subtotal</span>
                <span>${parseFloat(cart.subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Shipping</span>
                <span className="text-green-500">Free</span>
              </div>
              <div className="flex justify-between font-bold text-foreground text-lg pt-2 border-t border-border">
                <span>Total</span>
                <span>${parseFloat(cart.subtotal).toFixed(2)}</span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-bold hover:opacity-90 transition-opacity"
            >
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </Link>

            <Link href="/products" className="block text-center text-sm text-muted-foreground hover:text-foreground transition-colors">
              ← Continue Shopping
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
