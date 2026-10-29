# InstaMation

> Open-source Instagram comment-to-DM automation — a free, self-hosted ManyChat alternative built entirely on Meta's official API.

Someone comments a keyword (like `LINK`) on your post or reel, and InstaMation sends them a DM with your link a second later — before you have even seen the notification. Optionally it also posts a public comment reply at the same time. No scraping, no browser automation, no monthly fee.

[![GitHub stars](https://img.shields.io/github/stars/explorearafat/InstaMation?style=social)](https://github.com/explorearafat/InstaMation/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/explorearafat/InstaMation?style=social)](https://github.com/explorearafat/InstaMation/network/members)
[![GitHub issues](https://img.shields.io/github/issues/explorearafat/InstaMation)](https://github.com/explorearafat/InstaMation/issues)
[![GitHub pull requests](https://img.shields.io/github/issues-pr/explorearafat/InstaMation)](https://github.com/explorearafat/InstaMation/pulls)
[![Last commit](https://img.shields.io/github/last-commit/explorearafat/InstaMation)](https://github.com/explorearafat/InstaMation/commits/main)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

[Documentation](SETUP.md) · [Tech Stack](docs/stack.md) · [Contributing](CONTRIBUTING.md) · [Report a Bug](https://github.com/explorearafat/InstaMation/issues)

---

## Table of contents

- [What it does](#what-it-does)
- [Features](#features)
- [How it works](#how-it-works)
- [Tech stack](#tech-stack)
- [Quick start](#quick-start)
- [Environment variables](#environment-variables)
- [Connecting Instagram (Meta app setup)](#connecting-instagram-meta-app-setup)
- [Running the app](#running-the-app)
- [Running the background worker](#running-the-background-worker)
- [Using the dashboard](#using-the-dashboard)
- [Deploying to production](#deploying-to-production)
- [Project structure](#project-structure)
- [Scripts reference](#scripts-reference)
- [Troubleshooting](#troubleshooting)
- [FAQ](#faq)
- [Contributing](#contributing)
- [License](#license)
- [Credits](#credits)

---

## What it does

1. You connect an Instagram **Business or Creator** account through Meta's official Instagram Login.
2. You create a campaign: pick a post or reel, choose the **keyword** to watch, and write the **DM** to send (plus an optional public comment reply).
3. When someone comments that keyword, InstaMation sends them a private reply (a DM) through Meta's sanctioned `private_replies` API, queues the send so it survives rate limits, and logs the outcome.

Everything runs on your own infrastructure. There is no billing layer, no seat limit, and no plan tier.

## Features

- **Comment-to-DM automation** — keyword triggers, sent via Meta's official private replies API.
- **Optional public reply** — post a visible comment back at the same time as the DM.
- **Follow gate** — optionally require the user to follow you before delivering the link; re-prompts until they do.
- **Tracked links with click stats** — swap any link for a tracked redirect and see clicks and CTR per campaign.
- **Multiple Instagram accounts** — connect several professional accounts under one workspace.
- **Agency workspaces** — invite teammates and isolate client accounts per workspace.
- **Encrypted tokens at rest** — Instagram access tokens are sealed with AES-256-GCM.
- **Webhook + polling reconciliation** — live webhooks plus a polling safety net, so nothing slips through.
- **Queue-backed delivery** — BullMQ handles retries, rate limits, and overflow automatically.
- **DM logs with full status** — every send, skip, and failure is logged with a reason.
- **AI inbox automations** — optional AI replies, configured per workspace with your own provider keys.
- **Email magic-link sign-in** — no passwords required (optional; OAuth works without it).

## How it works

The stack is deliberately split into two processes:

| Process | Responsibility |
| --- | --- |
| **Web app** (`npm run dev` / `npm start`) | Serves the dashboard and landing pages, receives Meta webhooks, handles auth |
| **Worker** (`npm run worker`) | Pulls jobs from Redis, performs the actual DM sends, applies rate limits and retries |

They share the same Postgres database and Redis instance, and **must use the same `ENCRYPTION_KEY`** — otherwise the worker cannot decrypt the tokens the web app stored.

```
Instagram comment
      │
      ▼
 Meta webhook ──► Web app (verify signature, match keyword)
                      │
                      ▼
                   Redis / BullMQ  ──►  Worker (send DM, log result)
                      ▲
 Polling sweep ───────┘  (catches events Instagram never pushed)
```

## Tech stack

- **Framework:** Next.js 16 (App Router, React 19, React Compiler, Turbopack)
- **Language:** TypeScript
- **Database:** PostgreSQL via Prisma ORM
- **Queue:** Redis + BullMQ
- **Auth:** NextAuth v5 (OAuth + optional Resend magic-link email)
- **Styling:** Tailwind CSS v4, shadcn/ui, Phosphor icons
- **AI:** Vercel AI SDK (Anthropic, OpenAI, Google, Groq, DeepSeek, OpenRouter)
- **Charts:** Recharts
- **Tests:** Vitest

See [docs/stack.md](docs/stack.md) for the full rationale.

## Quick start

### Push this repo to your own GitHub (first time)

```bash
echo "# InstaMation" >> README.md
git init
git add README.md
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/explorearafat/InstaMation.git
git push -u origin main
```

### …or push an existing repository

```bash
git remote add origin https://github.com/explorearafat/InstaMation.git
git branch -M main
git push -u origin main
```

### Run it locally

Prerequisites: **Node.js 22.x**, a **PostgreSQL** database, and a **Redis** instance.

```bash
# 1. Clone
git clone https://github.com/explorearafat/InstaMation.git
cd InstaMation

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# then open .env and fill in the values described below

# 4. Create the database schema
npm run db:generate
npm run db:migrate

# 5. Start the web app
npm run dev          # http://localhost:3000

# 6. In a second terminal, start the worker
npm run worker
```

Open <http://localhost:3000>, sign in, connect an Instagram account, and build your first campaign.


---

## Environment variables

Copy `.env.example` to `.env`. Every value is explained below.

### App

| Variable | Required | Description |
| --- | --- | --- |
| `NEXTAUTH_URL` | Yes | Base URL of the web app. `http://localhost:3000` locally, your real domain in production. |
| `NEXTAUTH_SECRET` | Yes | Random string used to sign session tokens. Generate with `openssl rand -base64 32`. |
| `CRON_SECRET` | Yes | Bearer secret that protects the cron/polling endpoint. Any strong random string. |
| `ENCRYPTION_KEY` | Yes | 64-character hex key (32 bytes) used to encrypt Instagram tokens at rest. **The web app and worker must share the same value.** |

### Database and queue

| Variable | Required | Description |
| --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection string. On Neon, use the **pooled** (`...-pooler.neon.tech`) endpoint so PgBouncer can suspend between polls. |
| `REDIS_URL` | Yes | Redis connection string used by BullMQ. |

### Auth (set at least one)

| Variable | Required | Description |
| --- | --- | --- |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | No | Google OAuth sign-in. |
| `GITHUB_ID` / `GITHUB_SECRET` | No | GitHub OAuth sign-in. |
| `RESEND_API_KEY` | No | Enables email magic-link sign-in. Omit to hide the email form. |
| `EMAIL_FROM` | No | Sender identity, e.g. `InstaMation <login@yourdomain.com>`. Needs a verified Resend domain. |
| `LOCAL_SIGNUP` | No | Set `true` on a private/self-hosted instance to enable email + password sign-up on `/login` (accounts live in your own database). Leave unset on a public deployment. |

> OAuth works without any domain and is the fastest way to get in. The magic-link email option only matters if you specifically want passwordless email login. For the zero-setup path, set `LOCAL_SIGNUP=true` and create your account on `/login`.

> The dashboard's **Setup guide** page walks through every step — prerequisites, where each credential comes from, the Meta app configuration, and a go-live checklist.

### Meta / Instagram

| Variable | Required | Description |
| --- | --- | --- |
| `META_GRAPH_API_VERSION` | Yes | Graph API version, e.g. `v26.0`. |
| `INSTAGRAM_APP_ID` | Yes | Your Meta app's Instagram app ID. |
| `INSTAGRAM_APP_SECRET` | Yes | Your Meta app's Instagram app secret. |
| `FACEBOOK_APP_SECRET` | Yes | Used to verify webhook signatures. |
| `WEBHOOK_VERIFY_TOKEN` | Yes | Any random string; paste the same value into the Meta webhook config. |

### AI (optional)

| Variable | Required | Description |
| --- | --- | --- |
| `AI_BUDGET_PER_HOUR` | No | Cap on AI calls per hour per workspace. Default `100`. |

AI provider keys are **not** set here — each workspace owner saves their own encrypted provider key from the dashboard under **Inbox Automations**.

---

## Connecting Instagram (Meta app setup)

This is the part that takes real time. Plan for 20–30 minutes the first go.

1. **Create a Meta app** at <https://developers.facebook.com/apps> → *Create app* → choose the **Business** type.
2. **Add the Instagram product** to the app. Copy the **Instagram App ID** and **Instagram App Secret** into `INSTAGRAM_APP_ID` and `INSTAGRAM_APP_SECRET`.
3. **Copy the app secret** into `FACEBOOK_APP_SECRET` (this is what verifies webhook signatures).
4. **Add a webhook callback URL:** `https://your-domain/api/webhooks/instagram` with your `WEBHOOK_VERIFY_TOKEN`. Subscribe to the `comments` field.
5. **Add yourself as an Instagram Tester:** App Roles → Roles → *Instagram Testers*. Then, **on your phone**, open Instagram → *Settings → Apps and websites → Tester Invites* and accept. Skipping the phone step is the single most common reason connections fail.
6. The Instagram account you connect **must be a Business or Creator account** — personal accounts do not support the API.
7. In the dashboard, click **Connect Instagram** and authorize.

> **Local development:** Meta cannot call `localhost`. Expose your dev server with a tunnel (`ngrok http 3000`, Cloudflare Tunnel, etc.) and register that public URL as the webhook callback.

For railway/VM-specific walkthroughs see [SETUP.md](SETUP.md) and [GCP-WORKER-SETUP.md](GCP-WORKER-SETUP.md).

---

## Running the app

```bash
npm run dev        # development, with hot reload (Turbopack)
npm run build      # production build (runs prisma generate first)
npm start          # serve the production build
```

The app is on <http://localhost:3000> by default.

## Running the background worker

The worker is a **separate long-running process** — DM sends do not happen without it.

```bash
npm run worker
```

In production, run it as a service (systemd, PM2, a Docker container, or an Oracle Cloud always-free VM). See `ecosystem.config.cjs` for a PM2 config and `worker.config.cjs` for worker tuning.

## Using the dashboard

After signing in you land on the dashboard. The flow is:

1. **Connect Instagram** — authorize a Business/Creator account. Connect as many as you like; switch between them from the sidebar.
2. **Create a campaign** — Campaigns → *New campaign*. Choose the post or reel, enter the **keyword** to watch (e.g. `LINK`), and write the **DM** you want sent. Personalize it with `{username}`. Optionally add a **public comment reply**.
3. **Set the delivery options** — toggle the follow gate, attach a tracked link, and pick any AI reply behavior.
4. **Activate it** — flip the campaign on. From that moment the webhook catches matching comments and the worker sends the DMs.
5. **Watch it work** — the dashboard shows a real-time activity feed; **Logs** shows every event with its status (queued, matched, sent, skipped, failed, rate-limited); **Reports** shows click and CTR stats per campaign.
6. **Diagnostics** — if something is not delivering, open Diagnostics for a per-component health check (webhook reachability, Redis, worker heartbeat, token validity).

---

## Deploying to production

The stack splits naturally across free tiers:

| Piece | Suggested host |
| --- | --- |
| Web app | [Vercel](https://vercel.com/new/clone?repository-url=https://github.com/explorearafat/InstaMation) |
| PostgreSQL | [Neon](https://neon.tech) (use the pooled endpoint) |
| Redis | [Redis Cloud](https://redis.com/cloud/) free tier |
| Worker | Any always-on VM — Oracle Cloud always-free, Railway, Fly.io, or a Docker container |
| Email | [Resend](https://resend.com) |

### Deploy the web app to Vercel

1. Import the repository on Vercel (the button above does it).
2. Add every environment variable from `.env.example` in the project settings.
3. Set `NEXTAUTH_URL` to your production domain.
4. Deploy. The `vercel-build` script runs `prisma generate && prisma migrate deploy && next build` automatically.

### Run the worker on a VM (Docker)

A prebuilt image is available as `explorearafat/instamation-worker`:

```yaml
services:
  worker:
    image: explorearafat/instamation-worker:latest
    restart: unless-stopped
    environment:
      DATABASE_URL: ${DATABASE_URL}
      REDIS_URL: ${REDIS_URL}
      ENCRYPTION_KEY: ${ENCRYPTION_KEY}
      INSTAGRAM_APP_SECRET: ${INSTAGRAM_APP_SECRET}
      FACEBOOK_APP_SECRET: ${FACEBOOK_APP_SECRET}
```

Set the **same** `ENCRYPTION_KEY` you used on the web app, or the worker will not be able to decrypt stored tokens. Full instructions live in [SETUP.md](SETUP.md).

---

## Project structure

```
app/                  Next.js App Router routes
  (dashboard)/        Authenticated dashboard (inbox, campaigns, logs, settings…)
  api/                Route handlers — auth, webhooks, cron, reports
  docs/               In-app documentation page
  [marketing pages]   SEO landing pages (manychat-alternative, instagram-auto-dm…)
components/           React components (sections/ = landing page, rest = dashboard UI)
lib/                  Core logic — auth, db, queue, meta, polling, AI, tracking
worker/               The background DM worker process
prisma/               Prisma schema and migrations
hooks/                React hooks
types/                Shared TypeScript types
__tests__/            Vitest test suite
scripts/              Ops scripts (cron, webhook repair)
docs/                 Extended documentation
```

---

## Scripts reference

| Script | What it does |
| --- | --- |
| `npm run dev` | Start the dev server with Turbopack |
| `npm run build` | `prisma generate` then `next build` |
| `npm start` | Serve the production build |
| `npm run worker` | Start the background DM worker |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest run (single pass) |
| `npm run db:generate` | Regenerate the Prisma client |
| `npm run db:migrate` | Apply migrations (`prisma migrate deploy`) |

---

## Troubleshooting

| Symptom | Likely cause and fix |
| --- | --- |
| **Instagram connection fails with "account not added as Tester"** | The tester invite was never accepted. Re-send it in App Roles → Roles → Instagram Testers, then accept **on your phone**: Instagram → Settings → Apps and websites → Tester Invites. Applies to every account, including your own second one. |
| **Webhook never fires** | The callback URL must be public HTTPS. Verify the verify-token matches, and that you subscribed to the `comments` field. Re-register with `scripts/repair-instagram-webhooks.ts` if needed. |
| **Comments match but no DM is sent** | The worker is not running, or it cannot decrypt tokens because `ENCRYPTION_KEY` differs between web and worker. Start the worker and confirm both processes share the key. |
| **DMs are rate-limited** | Expected under bursty traffic — BullMQ retries automatically. Check Logs for `rate-limited` entries; they should resolve on their own. |
| **Pages 500 in production but work locally** | Usually a missing environment variable or unapplied migration. Run `npm run db:migrate` and re-check the env list. |
| **Magic-link email never arrives** | `RESEND_API_KEY` is unset or the sending domain is not verified in Resend. OAuth sign-in works meanwhile. |
| **`metadataBase` / canonical URL warnings** | Set `NEXT_PUBLIC_SITE_URL` to your real domain. |

---

## FAQ

**Is it really free?** Yes. MIT-licensed, no billing layer, no seat caps. The whole stack fits on free tiers.

**Is it safe for my Instagram account?** Yes — it uses Meta's official Instagram API with Instagram Login, including the sanctioned private-replies endpoint. It does not scrape, does not automate a browser, and never asks for your Instagram password.

**Do I need a Business or Creator account?** Yes. The API is unavailable to personal accounts.

**Why two processes?** Sends must survive rate limits and restarts. Keeping the worker separate lets the web app stay responsive and lets the worker run on a cheap always-on machine.

**Can I run several Instagram accounts?** Yes — connect as many professional accounts as you like under one workspace, or split clients across agency workspaces.

**What happens if Instagram never sends the webhook?** A polling sweep catches anything the webhook misses, so comments are reconciled either way.

---

## Contributing

Contributions are welcome. Start with [CONTRIBUTING.md](CONTRIBUTING.md), follow the [Code of Conduct](CODE_OF_CONDUCT.md), and run `npm test` plus `npm run typecheck` before opening a pull request. Security issues go through [SECURITY.md](SECURITY.md) — please do not open a public issue for them.

---

## License

Released under the [MIT License](LICENSE).

---

## Credits

Built and maintained by **Eyasin Arafat**.

| | |
| --- | --- |
| **Name** | Eyasin Arafat |
| **Email** | [explorearafat@gmail.com](mailto:explorearafat@gmail.com) |
| **WhatsApp** | [+8801610709657](https://wa.me/8801610709657) |
| **GitHub** | [@explorearafat](https://github.com/explorearafat) |
| **Instagram** | [@explorearafat](https://instagram.com/explorearafat) |
| **Repository** | [github.com/explorearafat/InstaMation](https://github.com/explorearafat/InstaMation) |

If InstaMation is useful to you, star the repo — it is the simplest way to help the project reach the next person looking for a free way to do this.
