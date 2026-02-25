import orderAxios from "@/lib/orderAxios";

/**
 * Returns config with X-User-Id header if userId is provided.
 */
function orderConfig(userId = null) {
  const config = { headers: {} };
  if (userId) config.headers["X-User-Id"] = String(userId);
  return config;
}

// ─── Customer ────────────────────────────────────────────────────────────────

/**
 * POST /api/orders — place a new order
 */
export async function createOrder(orderData, userId = null) {
  const res = await orderAxios.post("/api/orders", orderData, orderConfig(userId));
  return res.data;
}

/**
 * GET /api/orders — list authenticated user's orders
 */
export async function getMyOrders(userId = null, page = 1, perPage = 10) {
  const res = await orderAxios.get("/api/orders", {
    ...orderConfig(userId),
    params: { page, per_page: perPage },
  });
  return res.data;
}

/**
 * GET /api/orders/{id} — get a specific order
 */
export async function getOrder(orderId, userId = null) {
  const res = await orderAxios.get(`/api/orders/${orderId}`, orderConfig(userId));
  return res.data;
}

/**
 * POST /api/orders/{id}/cancel — cancel an order
 */
export async function cancelOrder(orderId, userId = null) {
  const res = await orderAxios.post(`/api/orders/${orderId}/cancel`, {}, orderConfig(userId));
  return res.data;
}

// ─── Admin ───────────────────────────────────────────────────────────────────

/**
 * GET /api/admin/orders — list all orders (admin)
 */
export async function getAdminOrders(filters = {}, page = 1, perPage = 15, adminId = null) {
  const res = await orderAxios.get("/api/admin/orders", {
    ...orderConfig(adminId),
    params: { ...filters, page, per_page: perPage },
  });
  return res.data;
}

/**
 * PUT /api/admin/orders/{id}/status — update order status (admin)
 */
export async function updateOrderStatus(orderId, status, note = null, adminId = null) {
  const res = await orderAxios.put(
    `/api/admin/orders/${orderId}/status`,
    { status, note },
    orderConfig(adminId)
  );
  return res.data;
}
