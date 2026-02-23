import axiosInstance from "@/lib/axios";

/**
 * Register a new user
 * POST /api/auth/register
 */
export async function register(data) {
  const response = await axiosInstance.post("/api/auth/register", data);
  return response.data;
}

/**
 * Login user
 * POST /api/auth/login
 */
export async function login(data) {
  const response = await axiosInstance.post("/api/auth/login", data);
  return response.data;
}

/**
 * Logout (requires token)
 * POST /api/auth/logout
 */
export async function logout(token) {
  const response = await axiosInstance.post(
    "/api/auth/logout",
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
}

/**
 * Get current authenticated user
 * GET /api/auth/me
 */
export async function me(token) {
  const response = await axiosInstance.get("/api/auth/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

/**
 * Forgot Password — send reset link
 * POST /api/auth/forgot-password
 */
export async function forgotPassword(email) {
  const response = await axiosInstance.post("/api/auth/forgot-password", {
    email,
  });
  return response.data;
}

/**
 * Reset password
 * POST /api/auth/reset-password
 */
export async function resetPassword(data) {
  const response = await axiosInstance.post("/api/auth/reset-password", data);
  return response.data;
}
