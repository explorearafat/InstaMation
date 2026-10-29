import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowSquareOutIcon,
  CheckCircleIcon,
  TerminalWindowIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react/dist/ssr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "Setup guide - InstaMation",
  description:
    "Step-by-step guide to self-host InstaMation for free: environment, Meta app, Instagram connect, worker, and go-live checklist.",
};

function External({ href, children }: { href: string; children: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 font-medium text-primary underline-offset-2 hover:underline"
    >
      {children}
      <ArrowSquareOutIcon size={12} weight="bold" />
    </a>
  );
}

function Code({ children }: { children: string }) {
  return (
    <pre className="mt-3 overflow-x-auto rounded-lg border bg-muted/50 p-3 text-xs leading-6">
      <code>{children}</code>
    </pre>
  );
}

function Step({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-base">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
            {n}
          </span>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground [&_b]:font-semibold [&_b]:text-foreground">
        {children}
      </CardContent>
    </Card>
  );
}

export default function SetupGuidePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Self-host setup guide
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
          Everything you need to run InstaMation on your own infrastructure for
          free — from a fresh clone to your first automated DM. No code changes
          are required anywhere in this guide: every step is configuration.
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 font-medium text-primary">
            <CheckCircleIcon weight="fill" /> ~30–45 minutes
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 font-medium text-primary">
            <CheckCircleIcon weight="fill" /> Everything on free tiers
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 font-medium text-primary">
            <CheckCircleIcon weight="fill" /> Official Meta API — no bans
          </span>
        </div>
      </div>

      <div className="grid gap-4">
        <Step n={1} title="Prerequisites">
          <p>
            Install these before anything else:
          </p>
          <ul className="ml-4 list-disc space-y-1.5">
            <li>
              <b>Node.js 22.x</b> — <External href="https://nodejs.org">nodejs.org</External>
            </li>
            <li>
              <b>Git</b> — <External href="https://git-scm.com">git-scm.com</External>
            </li>
            <li>
              <b>A PostgreSQL database</b> — easiest free option:{" "}
              <External href="https://neon.com">neon.com</External> (serverless
              Postgres, free tier). Local Postgres also works.
            </li>
            <li>
              <b>A Redis instance</b> — free option:{" "}
              <External href="https://upstash.com">upstash.com</External> (needed
              by the background worker&apos;s job queue).
            </li>
            <li>
              <b>An Instagram Business or Creator account</b> — a personal
              account cannot send private replies via the API. You can switch
              for free in the Instagram app: Settings → Account type.
            </li>
          </ul>
        </Step>

        <Step n={2} title="Clone and run">
          <Code>{`git clone https://github.com/explorearafat/InstaMation.git
cd InstaMation
npm install

cp .env.example .env      # then fill it in — next step
npm run db:generate
npm run db:migrate        # creates all tables in your database
npm run dev               # web app → http://localhost:3000

# in a second terminal:
npm run worker            # background DM sender`}</Code>
        </Step>

        <Step n={3} title="Fill in .env">
          <p>
            Open <b>.env</b> (copied from <b>.env.example</b>) and set these.
            Generate the secrets with <b>openssl rand -base64 32</b> (or any
            long random string):
          </p>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-left text-xs [&_td]:border-t [&_td]:px-3 [&_td]:py-2 [&_th]:border-b [&_th]:bg-muted/50 [&_th]:px-3 [&_th]:py-2">
              <thead>
                <tr>
                  <th>Variable</th>
                  <th>Where to get it</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>NEXTAUTH_URL</code></td>
                  <td>Your app URL — <code>http://localhost:3000</code> locally, your real domain in production.</td>
                </tr>
                <tr>
                  <td><code>NEXTAUTH_SECRET</code></td>
                  <td>Any long random string (signs login sessions).</td>
                </tr>
                <tr>
                  <td><code>DATABASE_URL</code></td>
                  <td>Connection string from Neon (or your local Postgres).</td>
                </tr>
                <tr>
                  <td><code>REDIS_URL</code></td>
                  <td>Connection string from Upstash.</td>
                </tr>
                <tr>
                  <td><code>ENCRYPTION_KEY</code></td>
                  <td>64-character hex (32 bytes): <code>node -e &quot;console.log(require(&apos;crypto&apos;).randomBytes(32).toString(&apos;hex&apos;))&quot;</code>. Encrypts Instagram tokens at rest.</td>
                </tr>
                <tr>
                  <td><code>CRON_SECRET</code></td>
                  <td>Any random string; protects scheduled endpoints.</td>
                </tr>
                <tr>
                  <td><code>LOCAL_SIGNUP</code></td>
                  <td>Set to <code>true</code> to enable the email + password sign-up on <code>/login</code> — your account is created in your own database.</td>
                </tr>
                <tr>
                  <td><code>META_GRAPH_API_VERSION</code></td>
                  <td>e.g. <code>v26.0</code> (set up in step 4).</td>
                </tr>
                <tr>
                  <td><code>INSTAGRAM_APP_ID</code> / <code>INSTAGRAM_APP_SECRET</code></td>
                  <td>From your Meta app (step 4).</td>
                </tr>
                <tr>
                  <td><code>FACEBOOK_APP_SECRET</code></td>
                  <td>Same Meta app → App settings → App secret (step 4).</td>
                </tr>
                <tr>
                  <td><code>WEBHOOK_VERIFY_TOKEN</code></td>
                  <td>Any random string; you will paste the same value into the Meta webhook config (step 4).</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            Optional: <b>GOOGLE_CLIENT_ID</b>/<b>GOOGLE_CLIENT_SECRET</b> or{" "}
            <b>GITHUB_ID</b>/<b>GITHUB_SECRET</b> enable one-click OAuth login
            instead of the email + password form (
            <External href="https://console.cloud.google.com/apis/credentials">Google console</External>{" "}
            /{" "}
            <External href="https://github.com/settings/developers">GitHub OAuth apps</External>
            ). Optional: <b>RESEND_API_KEY</b> enables magic-link emails.
          </p>
          <p>
            After saving <b>.env</b>, restart <b>npm run dev</b>, open{" "}
            <code>/login</code>, create your account, and you land here in the
            dashboard.
          </p>
        </Step>

        <Step n={4} title="Create the Meta app (Instagram API)">
          <p>
            InstaMation uses Meta&apos;s official Instagram API — this is why
            it doesn&apos;t get accounts banned. You need one free Meta app:
          </p>
          <ol className="ml-4 list-decimal space-y-1.5">
            <li>
              Go to <External href="https://developers.facebook.com/apps">developers.facebook.com/apps</External>{" "}
              → <b>Create App</b> → pick a use case around managing Instagram
              (e.g. <b>Manage everything on your Instagram account</b>).
            </li>
            <li>
              In the app dashboard add the <b>Instagram</b> product and note
              the <b>Instagram App ID</b> and <b>App secret</b> → put them in{" "}
              <code>.env</code> as <code>INSTAGRAM_APP_ID</code> /{" "}
              <code>INSTAGRAM_APP_SECRET</code>.
            </li>
            <li>
              In <b>App settings → Basic</b> copy the <b>App secret</b> →{" "}
              <code>FACEBOOK_APP_SECRET</code>.
            </li>
            <li>
              Under <b>Instagram → Business login / OAuth settings</b>, add the
              redirect URI: <code>YOUR_URL/api/instagram/callback</code>{" "}
              (e.g. <code>http://localhost:3000/api/instagram/callback</code> —
              must exactly match, including http/https).
            </li>
            <li>
              Under <b>Webhooks</b>, configure the{" "}
              <b>Instagram</b> object with callback URL{" "}
              <code>YOUR_URL/api/webhook</code> and verify token = your{" "}
              <code>WEBHOOK_VERIFY_TOKEN</code>. Subscribe to the{" "}
              <b>comments</b> field.
            </li>
            <li>
              Keep the app in <b>Development mode</b> while testing — your own
              Instagram account works without App Review. For public launch,
              submit the app for review (this site&apos;s{" "}
              <Link href="/meta-review" className="text-primary hover:underline">
                Meta Review page
              </Link>{" "}
              documents the compliance answers you can reuse).
            </li>
          </ol>
          <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs leading-5">
            <WarningCircleIcon size={14} className="mr-1 inline" weight="fill" />
            Meta&apos;s webhooks need a <b>public https URL</b>. On localhost,
            expose your dev server with a tunnel (e.g.{" "}
            <code>npx cloudflared tunnel --url http://localhost:3000</code> or
            ngrok) and use that URL everywhere you see <code>YOUR_URL</code>.
            Deploying to Vercel (free) is the cleanest long-term option.
          </p>
        </Step>

        <Step n={5} title="Connect Instagram and launch a campaign">
          <ol className="ml-4 list-decimal space-y-1.5">
            <li>
              Make sure <b>npm run worker</b> is running in a second terminal —
              it sends the queued DMs and refreshes tokens.
            </li>
            <li>
              Go to <b>Settings</b> → <b>Connect Instagram</b> → approve the
              Meta permission screen. Your account appears in the sidebar.
            </li>
            <li>
              Go to <b>Campaigns</b> → <b>New campaign</b>: pick a post or
              reel, choose a keyword (e.g. <code>link</code>), write the DM.
            </li>
            <li>
              Comment the keyword on your own post from another account — the
              DM should arrive within seconds. Check <b>DM Logs</b> to see the
              full trail (queued → matched → sent).
            </li>
          </ol>
        </Step>

        <Step n={6} title="Go-live checklist">
          <ul className="ml-4 list-disc space-y-1.5">
            <li>
              <b>Webhook reachable</b> — visiting{" "}
              <code>YOUR_URL/api/health</code> returns ok, and Meta&apos;s
              webhook config shows the subscription as verified.
            </li>
            <li>
              <b>Worker running</b> — <b>Diagnostics</b> (in the sidebar) shows
              the worker heartbeat and queue counts.
            </li>
            <li>
              <b>Scheduled jobs</b> — point a free cron (e.g. Vercel Cron,{" "}
              <External href="https://cron-job.org">cron-job.org</External>) at{" "}
              <code>YOUR_URL/api/cron/refresh-tokens</code> and{" "}
              <code>YOUR_URL/api/cron/daily</code> daily, with header{" "}
              <code>Authorization: Bearer YOUR_CRON_SECRET</code>, so tokens
              stay fresh and snapshots stay updated.
            </li>
            <li>
              <b>Backup your .env</b> — if you lose{" "}
              <code>ENCRYPTION_KEY</code>, connected Instagram tokens cannot be
              decrypted and accounts must be reconnected.
            </li>
          </ul>
        </Step>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TerminalWindowIcon weight="fill" /> Troubleshooting
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm leading-6 text-muted-foreground">
          <p>
            <b className="text-foreground">&quot;Can&apos;t reach database server&quot;</b>{" "}
            — Postgres is down or <code>DATABASE_URL</code> is wrong. Test with{" "}
            <code>npx prisma migrate status</code>.
          </p>
          <p>
            <b className="text-foreground">DMs stuck in queue</b> — the worker
            isn&apos;t running or <code>REDIS_URL</code> is unreachable. The
            worker must run somewhere 24/7 for automation to work.
          </p>
          <p>
            <b className="text-foreground">Comments detected but no DM</b> —
            check <b>DM Logs</b>: every event carries a reason (no keyword
            match, rate limit, follow gate, or an Instagram API error).
          </p>
          <p>
            <b className="text-foreground">More detail</b> — the full README on{" "}
            <External href="https://github.com/explorearafat/InstaMation#readme">
              GitHub
            </External>{" "}
            covers deployment, every environment variable, and scripts.
          </p>
        </CardContent>
      </Card>

      <Separator className="my-2" />
      <p className="text-xs text-muted-foreground">
        Once your credentials are all set, automation runs end-to-end on its
        own: comment webhook → keyword match → queued DM → worker sends it via
        Meta&apos;s private replies API → outcome logged.
      </p>
    </div>
  );
}
