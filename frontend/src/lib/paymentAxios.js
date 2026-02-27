import axios from "axios";

/**
 * Axios instance for Payment Service (port 8005)
 */
const paymentAxios = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_GATEWAY_URL || "http://localhost",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export default paymentAxios;
