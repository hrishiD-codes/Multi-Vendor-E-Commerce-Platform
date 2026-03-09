import axiosInstance from "@/lib/axios";

/**
 * Register a new user
 * POST /api/auth/register (local proxy)
 */
export async function register(data) {
  // Use local server-side proxy to avoid CORS and handle Gateway Secret
  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const result = await response.json();
  if (!response.ok) throw result;
  return result;
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
 * POST /api/auth/logout (local proxy)
 */
export async function logout(token) {
  const response = await fetch("/api/auth/logout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  const result = await response.json();
  if (!response.ok) throw result;
  return result;
}

/**
 * Get current authenticated user
 * GET /api/auth/me (local proxy)
 */
export async function me(token) {
  const response = await fetch("/api/auth/me", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  const result = await response.json();
  if (!response.ok) throw result;
  return result;
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
