import { NextResponse } from "next/server";

// ✅ Server-side proxy for user registration
// Browser calls /api/auth/register (local Next.js route) → this handler → API Gateway → User Service
// This avoids browser → API Gateway CORS issues entirely.
const API_GATEWAY_URL =
  process.env.API_GATEWAY_URL || "http://localhost:80";

export async function POST(request) {
  try {
    const body = await request.json();
    const registerUrl = `${API_GATEWAY_URL}/api/auth/register`;

    console.log("[Register proxy] → POST", registerUrl);

    const res = await fetch(registerUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    console.log("[Register proxy] ← status:", res.status);

    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("[Register proxy] error:", error.message);
    return NextResponse.json(
      { message: "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}
