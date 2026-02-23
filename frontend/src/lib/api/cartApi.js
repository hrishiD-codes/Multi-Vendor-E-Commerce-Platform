import cartAxios from "@/lib/cartAxios";

/**
 * Resolve cart identity headers/params.
 *  - Authenticated: pass userId → sets X-User-Id header
 *  - Guest:         pass sessionId → adds ?session_id param
 */
function cartConfig(userId = null, sessionId = null) {
  const config = { headers: {}, params: {} };
  if (userId) config.headers["X-User-Id"] = String(userId);
  if (sessionId) config.params.session_id = sessionId;
  return config;
}

// ─── Cart ────────────────────────────────────────────────────────────────────

/**
 * GET /api/cart  — get current cart
 */
export async function getCart(userId = null, sessionId = null) {
  const res = await cartAxios.get("/api/cart", cartConfig(userId, sessionId));
  return res.data;
}

/**
 * POST /api/cart/items  — add item
 * @param {Object} item  { product_id, product_name, price, image_url, quantity }
 */
export async function addToCart(item, userId = null, sessionId = null) {
  const res = await cartAxios.post("/api/cart/items", item, cartConfig(userId, sessionId));
  return res.data;
}

/**
 * PUT /api/cart/items/{id}  — update quantity
 */
export async function updateCartItem(itemId, quantity, userId = null, sessionId = null) {
  const res = await cartAxios.put(
    `/api/cart/items/${itemId}`,
    { quantity },
    cartConfig(userId, sessionId)
  );
  return res.data;
}

/**
 * DELETE /api/cart/items/{id}  — remove item
 */
export async function removeCartItem(itemId, userId = null, sessionId = null) {
  const res = await cartAxios.delete(
    `/api/cart/items/${itemId}`,
    cartConfig(userId, sessionId)
  );
  return res.data;
}

/**
 * DELETE /api/cart  — clear cart
 */
export async function clearCart(userId = null, sessionId = null) {
  const res = await cartAxios.delete("/api/cart", cartConfig(userId, sessionId));
  return res.data;
}

/**
 * POST /api/cart/merge  — merge guest cart into user cart on login
 */
export async function mergeCart(sessionId, userId) {
  const res = await cartAxios.post("/api/cart/merge", { session_id: sessionId, user_id: userId });
  return res.data;
}
