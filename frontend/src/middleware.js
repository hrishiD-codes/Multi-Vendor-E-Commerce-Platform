import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const secret = process.env.NEXTAUTH_SECRET;

export async function middleware(request) {
  const token = await getToken({ req: request, secret });
  const { pathname } = request.nextUrl;

  // Redirect logged-in users away from auth pages
  const authRoutes = ["/login", "/register", "/forgot-password", "/reset-password"];
  if (token && authRoutes.some((r) => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL("/products", request.url));
  }

  // Protect dashboard routes — must be logged in
  const protectedRoutes = ["/profile", "/admin"];
  if (!token && protectedRoutes.some((r) => pathname.startsWith(r))) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Protect admin routes — must be admin role
  if (pathname.startsWith("/admin") && token?.role !== "admin") {
    return NextResponse.redirect(new URL("/products", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/profile/:path*", "/admin/:path*", "/login", "/register", "/forgot-password", "/reset-password"],
};
