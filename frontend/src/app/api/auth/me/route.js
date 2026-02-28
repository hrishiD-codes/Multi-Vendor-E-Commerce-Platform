import { NextResponse } from "next/server";

// Prefer private server-side env var. Fall back to NEXT_PUBLIC_ (already in Vercel) then localhost for local dev.
const API_GATEWAY_URL =
  process.env.API_GATEWAY_URL ||
  process.env.NEXT_PUBLIC_API_GATEWAY_URL ||
  "http://localhost:80";

/**
 * Proxy for /api/auth/me
 * This runs on the Next.js server, allowing us to include the Gateway Secret
 * and handle the Bearer token securely.
 */
export async function GET(request) {
  const token = request.headers.get("Authorization");

  if (!token) {
    return NextResponse.json({ message: "No authorization token provided." }, { status: 401 });
  }

  const meUrl = `${API_GATEWAY_URL}/api/auth/me`;

  try {
    console.log("[Profile proxy] → GET", meUrl);

    const res = await fetch(meUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": token,
        // Identification card for microservices to verify Gateway origin
        "X-Gateway-Secret": "ecommerce-internal-secret-2024",
      },
    });

    const data = await res.json();
    console.log("[Profile proxy] ← status:", res.status);

    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("[Profile proxy] error:", error.message);
    return NextResponse.json(
      { message: "Failed to load profile. Please try again." },
      { status: 500 }
    );
  }
}
