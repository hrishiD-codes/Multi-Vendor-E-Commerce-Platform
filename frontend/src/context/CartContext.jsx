"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getCart, addToCart, updateCartItem, removeCartItem, clearCart, mergeCart } from "@/lib/api/cartApi";
import { toast } from "sonner";

const CartContext = createContext(null);

/**
 * Generates or retrieves a persistent guest session ID from localStorage.
 */
function getSessionId() {
  if (typeof window === "undefined") return null;
  let id = localStorage.getItem("cart_session_id");
  if (!id) {
    id = "guest_" + Math.random().toString(36).slice(2, 18);
    localStorage.setItem("cart_session_id", id);
  }
  return id;
}

export function CartProvider({ children, userId = null }) {
  const [cart, setCart] = useState({ items: [], subtotal: 0, total_items: 0 });
  const [loading, setLoading] = useState(true);
  const sessionId = typeof window !== "undefined" ? getSessionId() : null;

  const fetchCart = useCallback(async () => {
    try {
      const data = await getCart(userId, userId ? null : sessionId);
      setCart(data.data || { items: [], subtotal: 0, total_items: 0 });
    } catch {
      // silently fail — cart just shows as empty
    } finally {
      setLoading(false);
    }
  }, [userId, sessionId]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const add = useCallback(async (item) => {
    try {
      const data = await addToCart(item, userId, userId ? null : sessionId);
      setCart(data.data);
      toast.success(`${item.product_name} added to cart!`);
    } catch {
      toast.error("Failed to add item to cart.");
    }
  }, [userId, sessionId]);

  const update = useCallback(async (itemId, quantity) => {
    try {
      const data = await updateCartItem(itemId, quantity, userId, userId ? null : sessionId);
      setCart(data.data);
    } catch {
      toast.error("Failed to update item.");
    }
  }, [userId, sessionId]);

  const remove = useCallback(async (itemId) => {
    try {
      const data = await removeCartItem(itemId, userId, userId ? null : sessionId);
      setCart(data.data);
      toast.success("Item removed from cart.");
    } catch {
      toast.error("Failed to remove item.");
    }
  }, [userId, sessionId]);

  const clear = useCallback(async () => {
    try {
      await clearCart(userId, userId ? null : sessionId);
      setCart({ items: [], subtotal: 0, total_items: 0 });
      toast.success("Cart cleared.");
    } catch {
      toast.error("Failed to clear cart.");
    }
  }, [userId, sessionId]);

  const merge = useCallback(async (guestSessionId, authedUserId) => {
    try {
      const data = await mergeCart(guestSessionId, authedUserId);
      setCart(data.data);
      localStorage.removeItem("cart_session_id");
    } catch {
      // silently fail — cart merge is best-effort
    }
  }, []);

  return (
    <CartContext.Provider value={{ cart, loading, add, update, remove, clear, merge, refetch: fetchCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
