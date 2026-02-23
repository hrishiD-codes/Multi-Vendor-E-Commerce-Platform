"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ShoppingCart, X, Plus, Minus, Trash2, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";

/**
 * Mini cart icon with badge + dropdown drawer.
 * Drop this anywhere in your Navbar.
 */
export default function CartIcon() {
  const { cart } = useCart();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 rounded-xl hover:bg-muted transition-colors"
        aria-label="Open cart"
      >
        <ShoppingCart className="w-5 h-5 text-foreground" />
        {cart.total_items > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
            {cart.total_items > 99 ? "99+" : cart.total_items}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl border border-border bg-card shadow-2xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h3 className="font-semibold text-foreground">Cart ({cart.total_items})</h3>
            <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-muted transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Items */}
          <div className="max-h-72 overflow-y-auto divide-y divide-border">
            {cart.items.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm py-10">Your cart is empty</p>
            ) : (
              cart.items.map((item) => (
                <div key={item.id} className="flex gap-3 p-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted shrink-0">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.product_name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">📦</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground line-clamp-1">{item.product_name}</p>
                    <p className="text-xs text-muted-foreground">×{item.quantity} · ${item.subtotal.toFixed(2)}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {cart.items.length > 0 && (
            <div className="p-4 border-t border-border space-y-3">
              <div className="flex justify-between text-sm font-semibold text-foreground">
                <span>Subtotal</span>
                <span>${parseFloat(cart.subtotal).toFixed(2)}</span>
              </div>
              <Link
                href="/cart"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                View Cart & Checkout <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
