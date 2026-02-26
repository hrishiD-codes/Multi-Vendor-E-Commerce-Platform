import axios from "axios";

/**
 * Axios instance for Payment Service (port 8005)
 */
const paymentAxios = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_PAYMENT_SERVICE_URL || "http://localhost:8005",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export default paymentAxios;
