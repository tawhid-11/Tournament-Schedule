import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "./db";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "demo@tournament.app" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        try {
          const user = await db.user.findUnique({
            where: { email: credentials.email.toLowerCase() },
          });

          if (!user || !user.passwordHash) {
            // For frictionless local demo if DB is fresh or unseeded:
            if (
              credentials.email.toLowerCase() === "demo@tournament.app" &&
              credentials.password === "demo123"
            ) {
              return {
                id: "demo-user-id",
                name: "Tournament Admin",
                email: "demo@tournament.app",
                image: null,
              };
            }
            throw new Error("User not found or password incorrect");
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.passwordHash
          );

          if (!isPasswordValid) {
            throw new Error("Invalid email or password");
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
          };
        } catch (err: any) {
          // Fallback demo user if DB connection is unavailable locally
          if (
            credentials.email.toLowerCase() === "demo@tournament.app" &&
            credentials.password === "demo123"
          ) {
            return {
              id: "demo-user-id",
              name: "Tournament Admin",
              email: "demo@tournament.app",
              image: null,
            };
          }
          throw new Error(err.message || "Authentication failed");
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id as string;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "default-dev-secret-tournament-platform",
};
