import axios from "axios";

/**
 * Axios instance for Order Service (port 8004)
 */
const orderAxios = axios.create({
  baseURL: process.env.NEXT_PUBLIC_ORDER_SERVICE_URL || "http://localhost:8004",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export default orderAxios;
