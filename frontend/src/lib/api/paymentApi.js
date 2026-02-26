import paymentAxios from "@/lib/paymentAxios";

function paymentConfig(userId = null) {
  const config = { headers: {} };
  if (userId) config.headers["X-User-Id"] = String(userId);
  return config;
}

// ─── Customer ────────────────────────────────────────────────────────────────

/**
 * POST /api/payments/intent — create Stripe PaymentIntent
 */
export async function createPaymentIntent(orderId, amount, currency = "usd", userId = null) {
  const res = await paymentAxios.post(
    "/api/payments/intent",
    { order_id: orderId, amount, currency },
    paymentConfig(userId)
  );
  return res.data;
}

/**
 * POST /api/payments/cod — record Cash on Delivery
 */
export async function processCodPayment(orderId, amount, userId = null) {
  const res = await paymentAxios.post(
    "/api/payments/cod",
    { order_id: orderId, amount },
    paymentConfig(userId)
  );
  return res.data;
}

/**
 * GET /api/payments/{id} — get payment by ID
 */
export async function getPayment(paymentId, userId = null) {
  const res = await paymentAxios.get(`/api/payments/${paymentId}`, paymentConfig(userId));
  return res.data;
}

/**
 * GET /api/payments/order/{orderId} — get payment for an order
 */
export async function getPaymentByOrder(orderId, userId = null) {
  const res = await paymentAxios.get(`/api/payments/order/${orderId}`, paymentConfig(userId));
  return res.data;
}

// ─── Admin ───────────────────────────────────────────────────────────────────

/**
 * GET /api/admin/payments — list all payments (admin)
 */
export async function getAdminPayments(filters = {}, page = 1, perPage = 15, adminId = null) {
  const res = await paymentAxios.get("/api/admin/payments", {
    ...paymentConfig(adminId),
    params: { ...filters, page, per_page: perPage },
  });
  return res.data;
}

/**
 * POST /api/admin/payments/{id}/refund — issue a refund (admin)
 */
export async function refundPayment(paymentId, amount, adminId = null) {
  const res = await paymentAxios.post(
    `/api/admin/payments/${paymentId}/refund`,
    { amount },
    paymentConfig(adminId)
  );
  return res.data;
}
