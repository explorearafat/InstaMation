import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { ModeToggle } from "../theme-toggle";
import { GithubLogoIcon } from "@phosphor-icons/react/dist/ssr";
import { buttonVariants } from "../ui/button";
import { cn, formatStars } from "@/lib/utils";
import { REPO } from "@/lib/site";

const GITHUB_URL = REPO.url;

/**
 * Star count is purely decorative. Keeping it in its own async component —
 * rendered inside a Suspense boundary — means the navbar and the rest of the
 * page paint immediately, and only this little number streams in afterwards.
 *
 * Previously the whole `Navbar` was async, so awaiting this fetch suspended the
 * entire route and the user stared at the full-page spinner in app/loading.tsx
 * until the GitHub API answered (or timed out).
 */
async function getGitHubStars(): Promise<number | null> {
  try {
    const res = await fetch("https://api.github.com/repos/explorearafat/InstaMation", {
      headers: { Accept: "application/vnd.github+json" },
      next: { revalidate: 36000 },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { stargazers_count?: number };
    return typeof data.stargazers_count === "number"
      ? data.stargazers_count
      : null;
  } catch {
    return null;
  }
}

async function StarCount() {
  const stars = await getGitHubStars();
  if (stars === null) return null;
  return <span>{formatStars(stars)}</span>;
}

const Navbar = () => {
  return (
    <header className="fixed w-full md:w-11/12 top-0 md:top-2 z-40 border-b border-border/50 bg-background/60 backdrop-blur-xl md:rounded-full -translate-x-1/2 left-1/2">
      <div className="mx-auto flex h-15 w-full max-w-8xl items-center justify-between px-2 sm:px-6 lg:px-8 rounded-full">
        <Link
          href="/"
          className="group flex shrink-0 items-center gap-2 rounded-full outline-none transition-opacity duration-300 hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          aria-label="InstaMation home"
        >
          <Image
            src="/logo1.svg"
            alt="InstaMation logo"
            width={32}
            height={32}
            unoptimized
            className="size-5 shrink-0 transition-transform duration-500 ease-out group-hover:scale-110 group-hover:rotate-[4deg] sm:size-7 md:size-8 dark:invert-0 invert shimmer"
          />
          <span className="hidden text-sm font-bold tracking-tight text-foreground transition-colors duration-300 group-hover:text-primary sm:inline md:text-lg">
            InstaMation
          </span>
        </Link>

        <div className="flex items-center gap-1 md:gap-3">
          <ModeToggle />
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-medium text-foreground transition-colors hover:bg-muted"
            aria-label="View InstaMation on GitHub"
          >
            <GithubLogoIcon weight="fill" className="size-3 sm:size-4" aria-hidden="true" />
            <Suspense fallback={null}>
              <StarCount />
            </Suspense>
          </a>
          <Link
            href="/login"
            className={cn(buttonVariants({ variant: "glow" }), "rounded-full h-10")}
          >
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;