import { NextResponse } from "next/server";

/**
 * Universal server-side proxy for all /api/* routes.
 *
 * All Axios instances in the frontend use a relative baseURL so every
 * browser request lands here (same-origin, no CORS). This handler
 * forwards the request server-side to the Nginx API Gateway, which
 * routes it to the correct microservice.
 *
 * Priority note: Next.js resolves specific routes first, so:
 *   /api/auth/register  → src/app/api/auth/register/route.js  (existing)
 *   /api/auth/me        → src/app/api/auth/me/route.js         (existing)
 *   /api/auth/logout    → src/app/api/auth/logout/route.js     (existing)
 *   /api/auth/[...]     → src/app/api/auth/[...nextauth]/...   (existing)
 *   everything else     → THIS file
 */

const API_GATEWAY_URL =
  process.env.API_GATEWAY_URL ||
  process.env.NEXT_PUBLIC_API_GATEWAY_URL ||
  "http://localhost:80";

const GATEWAY_SECRET = "ecommerce-internal-secret-2024";

// Headers we NEVER forward upstream (they're hop-by-hop or Next.js internal)
const HOP_BY_HOP = new Set([
  "connection",
  "keep-alive",
  "transfer-encoding",
  "te",
  "trailer",
  "upgrade",
  "proxy-authorization",
  "host",
]);

/**
 * Build upstream headers: forward safe client headers + inject gateway secret.
 */
function buildUpstreamHeaders(incoming) {
  const headers = new Headers();

  for (const [key, value] of incoming.entries()) {
    if (!HOP_BY_HOP.has(key.toLowerCase())) {
      headers.set(key, value);
    }
  }

  // Always inject the gateway secret so microservices trust this request
  headers.set("X-Gateway-Secret", GATEWAY_SECRET);
  // Ensure JSON content-type when not already set
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return headers;
}

/**
 * Core proxy handler — works for GET, POST, PUT, PATCH, DELETE, OPTIONS.
 */
async function proxyRequest(request, { params }) {
  // params.path is an array of path segments, e.g. ["cart"] or ["products", "123"]
  const { path } = await params;
  const segments = path ?? [];
  const upstreamPath = `/api/${segments.join("/")}`;

  // Preserve query string
  const { searchParams } = new URL(request.url);
  const qs = searchParams.toString();
  const upstreamUrl = `${API_GATEWAY_URL}${upstreamPath}${qs ? `?${qs}` : ""}`;

  const method = request.method.toUpperCase();

  // Build request options
  const fetchOptions = {
    method,
    headers: buildUpstreamHeaders(request.headers),
  };

  // Attach body for methods that support it
  if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
    const contentType = request.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      try {
        const bodyText = await request.text();
        if (bodyText) fetchOptions.body = bodyText;
      } catch {
        // ignore — no body
      }
    } else if (contentType.includes("multipart/form-data") || contentType.includes("application/x-www-form-urlencoded")) {
      fetchOptions.body = await request.arrayBuffer();
    }
  }

  console.log(`[API Proxy] ${method} ${upstreamUrl}`);

  try {
    const upstreamRes = await fetch(upstreamUrl, fetchOptions);

    // Build response headers — forward safe upstream headers back to client
    const resHeaders = new Headers();
    for (const [key, value] of upstreamRes.headers.entries()) {
      if (!HOP_BY_HOP.has(key.toLowerCase()) && key.toLowerCase() !== "content-encoding") {
        resHeaders.set(key, value);
      }
    }

    const responseText = await upstreamRes.text();

    // Try to parse as JSON; fall back to plain text
    let body;
    try {
      body = JSON.parse(responseText);
      resHeaders.set("Content-Type", "application/json");
      return NextResponse.json(body, { status: upstreamRes.status, headers: resHeaders });
    } catch {
      return new NextResponse(responseText, {
        status: upstreamRes.status,
        headers: resHeaders,
      });
    }
  } catch (error) {
    console.error(`[API Proxy] Error proxying ${method} ${upstreamUrl}:`, error.message);
    return NextResponse.json(
      { message: "Service temporarily unavailable. Please try again in a moment.", detail: error.message },
      { status: 503 }
    );
  }
}

export const GET     = proxyRequest;
export const POST    = proxyRequest;
export const PUT     = proxyRequest;
export const PATCH   = proxyRequest;
export const DELETE  = proxyRequest;
export const OPTIONS = proxyRequest;
