import axios from "axios";

/**
 * Default Axios instance.
 * baseURL is empty so all requests go to the Next.js server (same origin),
 * which proxies them server-side to the API Gateway — no CORS.
 */
const axiosInstance = axios.create({
  baseURL: "",
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
