import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_USER_SERVICE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

/**
 * Attach a Bearer token to every request.
 * Pass `token` via config.headers.Authorization at call-site when needed,
 * OR set it globally by calling `setAuthToken(token)`.
 */
export function setAuthToken(token) {
  if (token) {
    axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete axiosInstance.defaults.headers.common["Authorization"];
  }
}

export default axiosInstance;
