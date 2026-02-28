import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// ✅ Use private (server-side only) env var — no NEXT_PUBLIC_ prefix
// This is available on the server during authorize() but NOT exposed to the browser
const API_GATEWAY_URL = process.env.API_GATEWAY_URL || "http://localhost:80";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const loginUrl = `${API_GATEWAY_URL}/api/auth/login`;
          console.log("[NextAuth] authorize() → POST", loginUrl);

          const res = await fetch(loginUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              email: credentials?.email,
              password: credentials?.password,
            }),
          });

          const data = await res.json();
          console.log(
            "[NextAuth] authorize() ← status:",
            res.status,
            "body:",
            JSON.stringify(data),
          );

          if (!res.ok) {
            // Throw with the backend message so NextAuth surface it in the UI
            throw new Error(
              data?.message ||
                data?.errors?.email?.[0] ||
                "Invalid credentials.",
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

          console.error(
            "[NextAuth] authorize() — unexpected response shape:",
            data,
          );
          return null;
        } catch (error) {
          console.error("[NextAuth] authorize() error:", error.message);
          throw new Error(error.message || "Login failed. Please try again.");
        }
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
