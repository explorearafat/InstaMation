"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { localSignIn, localSignUp, type LocalAuthState } from "@/app/login/actions";

/**
 * Self-hosted email + password auth (LOCAL_SIGNUP=true). Creates a real
 * database account on sign-up — unlike the demo login, everything the user
 * builds afterwards is real data.
 */
export default function LocalAuthForm() {
  const [mode, setMode] = useState<"signup" | "signin">("signup");
  const [state, formAction, pending] = useActionState<
    LocalAuthState,
    FormData
  >(mode === "signup" ? localSignUp : localSignIn, null);

  return (
    <div className="w-full">
      <div className="mb-4 flex rounded-lg border p-1 text-sm font-medium">
        {(["signup", "signin"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`flex-1 rounded-md px-3 py-1.5 transition-colors ${
              mode === m
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {m === "signup" ? "Create account" : "Sign in"}
          </button>
        ))}
      </div>

      <form action={formAction} className="space-y-3">
        {mode === "signup" && (
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium">
              Your name
            </label>
            <Input
              id="name"
              name="name"
              required
              autoComplete="name"
              placeholder="Arafat"
            />
          </div>
        )}
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium">
            Email
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-medium">
            Password
          </label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            minLength={mode === "signup" ? 8 : undefined}
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            placeholder={mode === "signup" ? "At least 8 characters" : "••••••••"}
          />
        </div>

        {state?.error && (
          <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs leading-5 text-destructive">
            {state.error}
          </p>
        )}

        <Button type="submit" className="w-full" size="lg" disabled={pending}>
          {pending
            ? "Please wait…"
            : mode === "signup"
              ? "Create account & open dashboard"
              : "Sign in"}
        </Button>
      </form>

      <p className="mt-3 text-center text-xs text-muted-foreground">
        {mode === "signup"
          ? "Your account and workspace are created locally in your own database."
          : "Signs you into the account you created on this machine."}
      </p>
    </div>
  );
}
