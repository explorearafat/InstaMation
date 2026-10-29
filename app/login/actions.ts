"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";
import { prisma } from "@/lib/db/client";
import { ensureWorkspaceForUser } from "@/lib/workspace";
import { hashPassword } from "@/lib/local-auth";

export type LocalAuthState = { error?: string } | null;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Self-hosted sign-up (LOCAL_SIGNUP=true): creates a real User + workspace in
 * the database, then signs the user in. This is what makes "clone → run →
 * create your own account → connect Instagram" work without any OAuth setup.
 */
export async function localSignUp(
  _prev: LocalAuthState,
  formData: FormData
): Promise<LocalAuthState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!name || !email || !password) {
    return { error: "All fields are required." };
  }
  if (!EMAIL_RE.test(email)) {
    return { error: "Enter a valid email address." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const existing = await prisma.user
    .findUnique({ where: { email } })
    .catch(() => null);
  if (existing) {
    return { error: "An account with this email already exists — sign in instead." };
  }

  const passwordHash = await hashPassword(password);
  let user;
  try {
    user = await prisma.user.create({
      data: { name, email, passwordHash },
    });
    await ensureWorkspaceForUser(user.id, user.email);
  } catch {
    return {
      error:
        "Could not reach the database — check DATABASE_URL and that Postgres is running.",
    };
  }

  try {
    await signIn("local", { email, password, redirectTo: "/dashboard" });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Sign-in failed right after sign-up. Try signing in." };
    }
    throw error;
  }
  return null;
}

export async function localSignIn(
  _prev: LocalAuthState,
  formData: FormData
): Promise<LocalAuthState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  try {
    await signIn("local", { email, password, redirectTo: "/dashboard" });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Invalid email or password." };
    }
    throw error;
  }
  return null;
}
