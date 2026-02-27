import axios from "axios";

/**
 * Axios instance for Order Service (port 8004)
 */
const orderAxios = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_GATEWAY_URL || "http://localhost",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export default orderAxios;
