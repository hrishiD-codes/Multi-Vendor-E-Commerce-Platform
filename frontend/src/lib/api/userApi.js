import axiosInstance from "@/lib/axios";

/**
 * Get user by ID
 * GET /api/users/{id}
 */
export async function getUser(id, token) {
  const response = await axiosInstance.get(`/api/users/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

/**
 * Update user profile
 * PUT /api/users/{id}
 */
export async function updateUser(id, data, token) {
  const response = await axiosInstance.put(`/api/users/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

/**
 * Admin: list all users (paginated)
 * GET /api/admin/users
 */
export async function getAllUsers(token, page = 1) {
  const response = await axiosInstance.get(`/api/admin/users?page=${page}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}
