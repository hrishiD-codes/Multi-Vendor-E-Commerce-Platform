import axios from "axios";

/**
 * Axios instance for Product Catalog Service (port 8002)
 */
const productAxios = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_GATEWAY_URL || "http://localhost",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export default productAxios;
