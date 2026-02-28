import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// Prefer private server-side env var. Fall back to NEXT_PUBLIC_ (already in Vercel) then localhost for local dev.
const API_GATEWAY_URL =
  process.env.API_GATEWAY_URL ||
  process.env.NEXT_PUBLIC_API_GATEWAY_URL ||
  "http://localhost:80";

/**
 * fetch() with an explicit AbortController timeout.
 * Render free-plan services can take 50s+ to wake from cold start.
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

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const loginUrl = `${API_GATEWAY_URL}/api/auth/login`;
        const fetchOptions = {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            // Identification card for microservices to verify Gateway origin
            "X-Gateway-Secret": "ecommerce-internal-secret-2024",
          },
          body: JSON.stringify({
            email: credentials?.email,
            password: credentials?.password,
          }),
        };

        const MAX_RETRIES = 2;
        let lastError = null;

        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
          try {
            console.log(`[NextAuth] authorize() attempt ${attempt} → POST ${loginUrl}`);
            const res = await fetchWithTimeout(loginUrl, fetchOptions, 90000);
            const data = await res.json();
            console.log(`[NextAuth] authorize() ← status: ${res.status}`, JSON.stringify(data));

            if (!res.ok) {
              // Auth failure (wrong password/email) — throw immediately, don't retry
              throw new Error(
                data?.message ||
                  data?.errors?.email?.[0] ||
                  "Invalid credentials."
              );
            }

            // Backend returns: { message, user: {...}, token: "..." }
            const { user, token } = data;

            if (user && token) {
              return {
                id: String(user.id),
                name: user.name,
                email: user.email,
                role: user.role,
                accessToken: token,
              };
            }

            console.error("[NextAuth] authorize() — unexpected response shape:", data);
            return null;
          } catch (error) {
            lastError = error;
            // If it's an auth/validation error, surface it immediately — no retry
            const isNetworkError =
              error.message === "fetch failed" ||
              error.message.includes("abort") ||
              error.name === "AbortError";

            if (!isNetworkError) {
              console.error("[NextAuth] authorize() auth error:", error.message);
              throw new Error(error.message);
            }

            console.error(`[NextAuth] authorize() network error attempt ${attempt}:`, error.message);
            if (attempt < MAX_RETRIES) {
              // Wait 3s before retry — gives cold-starting Render service time to wake
              await new Promise((r) => setTimeout(r, 3000));
            }
          }
        }

        console.error("[NextAuth] authorize() all attempts failed:", lastError?.message);
        throw new Error("Service temporarily unavailable. Please try again in a moment.");
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      // On first sign-in, `user` object is populated by authorize()
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.accessToken = user.accessToken;
      }
      return token;
    },

    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.accessToken = token.accessToken;
      return session;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24, // 1 day
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
