import { NextResponse } from "next/server";

// Prefer private server-side env var. Fall back to NEXT_PUBLIC_ (already in Vercel) then localhost for local dev.
const API_GATEWAY_URL =
  process.env.API_GATEWAY_URL ||
  process.env.NEXT_PUBLIC_API_GATEWAY_URL ||
  "http://localhost:80";

/**
 * Attempt a fetch with a timeout. Render free-plan services can take up to 50s to cold-start.
 */
async function fetchWithTimeout(url, options, timeoutMs = 90000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

export async function POST(request) {
  const registerUrl = `${API_GATEWAY_URL}/api/auth/register`;
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  const fetchOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      // Identification card for microservices to verify Gateway origin
      "X-Gateway-Secret": "ecommerce-internal-secret-2024",
    },
    body: JSON.stringify(body),
  };

  // Retry up to 2 times to handle Render free-plan cold-starts
  const MAX_RETRIES = 2;
  let lastError = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`[Register proxy] attempt ${attempt} → POST ${registerUrl}`);
      const res = await fetchWithTimeout(registerUrl, fetchOptions, 90000);
      const data = await res.json();
      console.log(`[Register proxy] ← status: ${res.status}`);

      if (!res.ok) {
        // Validation error or auth error — don't retry, return immediately
        return NextResponse.json(data, { status: res.status });
      }

      return NextResponse.json(data, { status: 201 });
    } catch (error) {
      lastError = error;
      console.error(`[Register proxy] attempt ${attempt} failed:`, error.message);
      if (attempt < MAX_RETRIES) {
        // Wait 3s before retrying (gives cold-starting service time to wake up)
        await new Promise((r) => setTimeout(r, 3000));
      }
    }
  }

  console.error("[Register proxy] all attempts failed:", lastError?.message);
  return NextResponse.json(
    { message: "Service temporarily unavailable. Please try again in a moment." },
    { status: 503 }
  );
}
