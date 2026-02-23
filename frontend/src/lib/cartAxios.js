import axios from "axios";

/**
 * Axios instance for Shopping Cart Service (port 8003)
 */
const cartAxios = axios.create({
  baseURL: process.env.NEXT_PUBLIC_CART_SERVICE_URL || "http://localhost:8003",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export default cartAxios;
