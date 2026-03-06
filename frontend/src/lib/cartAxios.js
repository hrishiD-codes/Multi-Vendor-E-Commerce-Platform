import axios from "axios";

/**
 * Axios instance for Shopping Cart Service.
 * baseURL is empty so all requests go to the Next.js server (same origin),
 * which proxies them server-side to the API Gateway — no CORS.
 */
const cartAxios = axios.create({
  baseURL: "",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export default cartAxios;
