import productAxios from "@/lib/productAxios";

// ─── Products ────────────────────────────────────────────────────────────────

/**
 * GET /api/products  — paginated + filterable
 * @param {Object} params  { search, category_id, min_price, max_price, sort, order, per_page, page }
 */
export async function getProducts(params = {}) {
  const response = await productAxios.get("/api/products", { params });
  return response.data;
}

/**
 * GET /api/products/search?q=term
 */
export async function searchProducts(q, params = {}) {
  const response = await productAxios.get("/api/products/search", { params: { q, ...params } });
  return response.data;
}

/**
 * GET /api/products/featured
 */
export async function getFeaturedProducts(limit = 8) {
  const response = await productAxios.get("/api/products/featured", { params: { limit } });
  return response.data;
}

/**
 * GET /api/products/{id}
 */
export async function getProduct(id) {
  const response = await productAxios.get(`/api/products/${id}`);
  return response.data;
}

/**
 * POST /api/admin/products  — admin
 */
export async function createProduct(data, token) {
  const response = await productAxios.post("/api/admin/products", data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

/**
 * PUT /api/admin/products/{id}  — admin
 */
export async function updateProduct(id, data, token) {
  const response = await productAxios.put(`/api/admin/products/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

/**
 * DELETE /api/admin/products/{id}  — admin
 */
export async function deleteProduct(id, token) {
  const response = await productAxios.delete(`/api/admin/products/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

/**
 * GET /api/admin/products  — admin (includes inactive)
 */
export async function getAdminProducts(params = {}, token) {
  const response = await productAxios.get("/api/admin/products", {
    params,
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

// ─── Categories ──────────────────────────────────────────────────────────────

/**
 * GET /api/categories
 */
export async function getCategories() {
  const response = await productAxios.get("/api/categories");
  return response.data;
}

/**
 * GET /api/categories/{id}
 */
export async function getCategory(id) {
  const response = await productAxios.get(`/api/categories/${id}`);
  return response.data;
}

/**
 * POST /api/admin/categories  — admin
 */
export async function createCategory(data, token) {
  const response = await productAxios.post("/api/admin/categories", data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

/**
 * PUT /api/admin/categories/{id}  — admin
 */
export async function updateCategory(id, data, token) {
  const response = await productAxios.put(`/api/admin/categories/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

/**
 * DELETE /api/admin/categories/{id}  — admin
 */
export async function deleteCategory(id, token) {
  const response = await productAxios.delete(`/api/admin/categories/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

// ─── Inventory ────────────────────────────────────────────────────────────────

/**
 * PUT /api/products/{id}/inventory  — admin
 */
export async function updateInventory(productId, data, token) {
  const response = await productAxios.put(`/api/products/${productId}/inventory`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

/**
 * GET /api/admin/inventory/low-stock  — admin
 */
export async function getLowStockProducts(token) {
  const response = await productAxios.get("/api/admin/inventory/low-stock", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}
