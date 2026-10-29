import Link from "next/link";
import Image from "next/image";
import {
  HouseIcon,
  WhatsappLogoIcon,
} from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Page not found - InstaMation",
  description: "The page you're looking for doesn't exist.",
};

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex">
      {/* Right panel - 404 */}
      <div className="flex-1 flex items-center justify-center px-6 lg:px-12">
        <div className="w-full max-w-sm text-center">
          <div className="mb-10 lg:hidden">
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

          <div className="mb-8">
            <div className="inline-flex items-center justify-center mb-6">
              <span className="text-4xl md:text-8xl font-bold tracking-tighter">
                404
              </span>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight">
              Page not found
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Sorry, we couldn&apos;t find the page you&apos;re looking for. It
              might have been moved or doesn&apos;t exist.
            </p>
          </div>

          <div className="flex justify-center  items-center gap-3">
            <Link href="/">
              <Button>
                <HouseIcon className="h-4 w-4" aria-hidden="true" />
                Back to Home
              </Button>
            </Link>
            <a
              href="https://wa.me/8801610709657"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <WhatsappLogoIcon size={16} weight="fill" className="text-[#25D366]" />
              Contact the Creator
            </a>
          </div>
          <p className="mt-10 text-xs text-center text-muted-foreground">
            <Link
              href="/terms"
              className="underline underline-offset-2 hover:text-foreground"
            >
              Terms
            </Link>{" "}
            ·{" "}
            <Link
              href="/privacy"
              className="underline underline-offset-2 hover:text-foreground"
            >
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
