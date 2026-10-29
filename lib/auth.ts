import { connection } from "next/server";
import NextAuth, { type NextAuthConfig } from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db/client";
import { ensureWorkspaceForUser } from "@/lib/workspace";
import { sendVerificationRequest } from "@/lib/server/magic-link-email";
import { verifyPassword } from "@/lib/local-auth";
import {
  DEMO_PASSWORD,
  DEMO_USER_ID,
  DEMO_USERNAME,
} from "@/lib/demo";

type AdapterPrismaClient = Parameters<typeof PrismaAdapter>[0];

export const hasResend = !!process.env.RESEND_API_KEY;
const hasGoogle =
  !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET;
const githubId = process.env.GITHUB_ID ?? process.env.GITHUB_CLIENT_ID;
const githubSecret =
  process.env.GITHUB_SECRET ?? process.env.GITHUB_CLIENT_SECRET;
const hasGitHub = !!githubId && !!githubSecret;

/** True when at least one hosted sign-in method (OAuth / magic link) is set. */
export const hasAnyProvider = hasGoogle || hasGitHub || hasResend;

function buildProviders(): NextAuthConfig["providers"] {
  const providers: NextAuthConfig["providers"] = [];
  if (hasGoogle) {
    providers.push(
      Google({
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        allowDangerousEmailAccountLinking: true,
        authorization: {
          params: {
            prompt: "consent",
            access_type: "offline",
            response_type: "code",
          },
        },
      })
    );
  }
  if (hasGitHub) {
    providers.push(
      GitHub({
        clientId: githubId!,
        clientSecret: githubSecret!,
        allowDangerousEmailAccountLinking: true,
      })
    );
  }
  if (hasResend) {
    providers.push(
      Resend({
        apiKey: process.env.RESEND_API_KEY!,
        from: process.env.EMAIL_FROM ?? "InstaMation <login@example.com>",
        sendVerificationRequest,
      })
    );
  }
  // Local email+password sign-in for self-hosters (LOCAL_SIGNUP=true).
  // Accounts are created by the signup server action on /login; this provider
  // only verifies an existing passwordHash against the database.
  if (process.env.LOCAL_SIGNUP === "true") {
    providers.push(
      Credentials({
        id: "local",
        name: "Local",
        credentials: { email: {}, password: {} },
        async authorize(credentials) {
          const email = String(credentials?.email ?? "")
            .trim()
            .toLowerCase();
          const password = String(credentials?.password ?? "");
          if (!email || !password) return null;

          const user = await prisma.user.findUnique({ where: { email } });
          if (!user?.passwordHash) return null;
          const ok = await verifyPassword(password, user.passwordHash);
          if (!ok) return null;

          return { id: user.id, name: user.name, email: user.email };
        },
      })
    );
  }

  // Demo Login — fixed admin/123456 credentials render the dashboard with
  // synthetic data (see lib/demo.ts); nothing touches the database.
  providers.push(
    Credentials({
      id: "demo",
      name: "Demo",
      credentials: { username: {}, password: {} },
      authorize(credentials) {
        if (
          credentials?.username === DEMO_USERNAME &&
          credentials?.password === DEMO_PASSWORD
        ) {
          return {
            id: DEMO_USER_ID,
            name: "Arafat",
            email: "admin@demo.instamation.app",
          };
        }
        return null;
      },
    })
  );

  // Allow boot even if no provider is configured — /login will show a setup hint.
  // This keeps local dev and CI from crashing when env is still being wired.
  return providers;
}

export const authConfig = {
  adapter: PrismaAdapter(prisma as unknown as AdapterPrismaClient),
  providers: buildProviders(),
  callbacks: {
    async jwt({ token, user }) {
      // On sign-in, embed the user ID and name in the JWT so session lookups never
      // touch the database (JWT strategy validates the HMAC signature
      // locally instead of querying the Session table).
      if (user?.id) {
        token.id = user.id;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string | undefined;
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      if (user.id) {
        await ensureWorkspaceForUser(user.id, user.email);
      }
    },
  },
  pages: {
    signIn: "/login",
    ...(hasResend ? { verifyRequest: "/verify-request" } : {}),
  },
  session: {
    strategy: "jwt",
  },
  trustHost: true,
  secret: process.env.NEXTAUTH_SECRET,
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

export async function getCurrentUserId(): Promise<string | null> {
  await connection();
  const session = await auth();
  return session?.user?.id ?? null;
}


