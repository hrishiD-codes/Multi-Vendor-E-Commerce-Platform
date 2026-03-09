import { NextResponse } from "next/server";

// Prefer private server-side env var. Fall back to NEXT_PUBLIC_ (already in Vercel) then localhost for local dev.
const API_GATEWAY_URL =
  process.env.API_GATEWAY_URL ||
  process.env.NEXT_PUBLIC_API_GATEWAY_URL ||
  "http://localhost:80";

/**
 * Proxy for /api/auth/logout
 */
export async function POST(request) {
  const token = request.headers.get("Authorization");

  if (!token) {
    return NextResponse.json({ message: "No authorization token provided." }, { status: 401 });
  }

  const logoutUrl = `${API_GATEWAY_URL}/api/auth/logout`;

  try {
    console.log("[Logout proxy] → POST", logoutUrl);

    const res = await fetch(logoutUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": token,
        // Identification card for microservices to verify Gateway origin
        "X-Gateway-Secret": "ecommerce-internal-secret-2024",
      },
    });

    const data = await res.json();
    console.log("[Logout proxy] ← status:", res.status);

    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("[Logout proxy] error:", error.message);
    return NextResponse.json(
      { message: "Logout failed. Please try again." },
      { status: 500 }
    );
  }
}
