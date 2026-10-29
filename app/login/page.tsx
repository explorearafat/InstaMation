import Link from "next/link";
import {
  PlayCircleIcon,
  StarIcon,
  WhatsappLogoIcon,
} from "@phosphor-icons/react/dist/ssr";
import arafatImage from "@/assets/arafat.webp";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { signIn } from "@/lib/auth";
import { DEMO_PASSWORD, DEMO_USERNAME } from "@/lib/demo";
import { FlickeringGrid } from "@/components/ui/flickering-grid";
import ProviderLogin from "@/components/provider-login";
import LocalAuthForm from "@/components/local-auth-form";

export const metadata = {
  title: "Sign in - InstaMation",
  description:
    "Sign in to InstaMation. Self-host: create your local account or configure OAuth. Hosted: coming soon.",
};

type LoginSearchParams = Promise<{
  callbackUrl?: string;
  template?: string;
  error?: string;
}>;

async function demoLogin() {
  "use server";
  await signIn("demo", {
    username: DEMO_USERNAME,
    password: DEMO_PASSWORD,
    redirectTo: "/dashboard",
  });
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: LoginSearchParams;
}) {
  // The full hosted sign-in UI only appears when the operator has configured
  // at least one provider (Google / GitHub / Resend).
  const hasAnyProvider =
    !!process.env.RESEND_API_KEY ||
    (!!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET) ||
    !!(
      (process.env.GITHUB_ID ?? process.env.GITHUB_CLIENT_ID) &&
      (process.env.GITHUB_SECRET ?? process.env.GITHUB_CLIENT_SECRET)
    );
  // Self-hosted local accounts (email + password, stored in your own DB).
  const allowLocalAuth = process.env.LOCAL_SIGNUP === "true";

  return (
    <div className="min-h-screen flex">
      {hasAnyProvider ? (
        <ProviderLogin searchParams={searchParams} />
      ) : (
        <div className="flex-1 flex items-center justify-center px-6 lg:px-12">
          <div className="w-full max-w-sm">
            {/* Logo */}
            <div className="mb-10">
              <Link
                href="/"
                aria-label="InstaMation home"
                className="mx-auto inline-flex w-fit rounded-lg outline-none transition-transform duration-300 ease-out hover:scale-[1.04] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <Image
                  src="/logo3.svg"
                  width={36}
                  height={40}
                  alt="InstaMation"
                  unoptimized
                  className="h-8 w-auto sm:h-9"
                />
              </Link>
            </div>

            {allowLocalAuth ? (
              <>
                {/* Heading */}
                <h1 className="text-3xl font-semibold tracking-tight">
                  Create your account
                </h1>
                <p className="mt-3 mb-8 text-sm leading-relaxed text-muted-foreground">
                  This is your own InstaMation instance — the account and
                  workspace are stored in your own database.
                </p>
                <LocalAuthForm />
              </>
            ) : (
              <>
                {/* Heading */}
                <h1 className="text-3xl font-semibold tracking-tight">
                  Login is not available right now
                </h1>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  We&apos;re working on it — coming soon. In the meantime,
                  reach out to the creator directly for early access or any
                  questions.
                </p>

                <a
                  href="https://wa.me/8801610709657"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-8 flex w-full items-center justify-center gap-2 rounded-lg bg-[#25D366] px-4 py-3 text-sm font-semibold text-white shadow-md transition-colors hover:bg-[#1eb856] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <WhatsappLogoIcon size={18} weight="fill" />
                  Contact the Creator on WhatsApp
                </a>

                <p className="mt-4 text-xs text-center text-muted-foreground">
                  Usually replies within a few hours.
                </p>

                <div className="mt-8 border-t pt-6">
                  <form action={demoLogin}>
                    <Button
                      type="submit"
                      variant="outline"
                      className="w-full"
                      size="lg"
                    >
                      <PlayCircleIcon size={18} weight="fill" />
                      Demo Login
                    </Button>
                  </form>
                  <p className="mt-2 text-center text-[11px] text-muted-foreground">
                    Explore the full dashboard with demo data ·{" "}
                    <code className="rounded bg-muted px-1 py-0.5">
                      {DEMO_USERNAME}
                    </code>{" "}
                    /{" "}
                    <code className="rounded bg-muted px-1 py-0.5">
                      {DEMO_PASSWORD}
                    </code>
                  </p>
                  <p className="mt-4 text-center text-[11px] leading-5 text-muted-foreground">
                    Self-hosting? Set{" "}
                    <code className="rounded bg-muted px-1 py-0.5">
                      LOCAL_SIGNUP=true
                    </code>{" "}
                    to create your own account, or configure a sign-in provider
                    — see the Setup Guide in the dashboard.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Right panel — Testimonial / Brand */}
      <div className="hidden lg:flex flex-1 items-center justify-center p-10 bg-lime-50 dark:bg-black/40 border-l-2 relative overflow-hidden">
        <FlickeringGrid
          className="absolute inset-0 z-0 mask-[radial-gradient(650px_circle_at_center,transparent,white)] pointer-events-none"
          squareSize={2}
          gridGap={6}
          color="#83BE3C"
          maxOpacity={0.6}
          flickerChance={0.1}
        />
        <div className="w-full max-w-md">
          {/* Stars */}
          <div className="flex items-center gap-1 mb-6">
            {[...Array(5)].map((_, i) => (
              <StarIcon
                key={i}
                size={26}
                weight="fill"
                className="text-yellow-400 hover:scale-130 transition-all duration-300"
              />
            ))}
          </div>

          {/* Quote */}
          <blockquote className="text-xl md:text-2xl font-medium leading-snug tracking-tight">
            &ldquo;InstaMation works so well that we were able to automate our
            Comment-to-DM workflow in just a few hours! Bye bye expensive
            manychat!&rdquo;
          </blockquote>

          {/* Author */}
          <div className="mt-8 flex items-center gap-3">
            <div className="size-10 shrink-0 overflow-hidden rounded-full">
              <Image
                src={arafatImage}
                alt="Eyasin Arafat"
                width={40}
                height={40}
                className="size-full object-cover"
              />
            </div>

            <div>
              <p className="text-sm">Eyasin Arafat</p>
              <p className="text-xs font-light">Founder @explorearafat</p>
            </div>
          </div>

          {/* Partner logos */}
          <div className="mt-14 px-2 italic text-xl font-bold tracking-tighter shimmer">
            Loved by 150+ creators and brands worldwide!
          </div>
        </div>
      </div>
    </div>
  );
}
