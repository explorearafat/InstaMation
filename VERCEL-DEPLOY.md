# Deploying InstaMation to Vercel

This is the exact checklist for getting a production deployment live. It exists
because the first deploy failed with a bare **404 `DEPLOYMENT_NOT_FOUND`**, which
is Vercel's way of saying *"the alias has no working deployment behind it"* — it
tells you nothing about the actual cause.

## Why the 404 happened

Two separate problems, both fixed:

1. **The production build was failing.** `vercel-build` ran
   `prisma generate && prisma migrate deploy && next build`. `prisma migrate deploy`
   requires `DATABASE_URL`, and the project had **no environment variables set at all**
   — so the build errored out after ~40s. The `instamation.vercel.app` alias pointed at
   a deployment that never succeeded, hence `DEPLOYMENT_NOT_FOUND`.

   Fixed by `scripts/vercel-build.mjs`, which always generates the Prisma client and
   runs migrations **only when `DATABASE_URL` is present**, warning and skipping
   otherwise. The app builds with zero env vars, so the landing page can never be
   blocked by a missing database again.

2. **`vercel.json` declared 4 cron jobs.** The Hobby plan allows only 2, and only at
   daily granularity. That alone would fail any deploy.

   Fixed by consolidating them into one daily job: `/api/cron/daily` fans out to the
   original handlers.

> **The general lesson:** when a Vercel alias 404s, do not debug the domain. Run
> `vercel ls <project>` and look at the **Status** column. `● Error` means the build
> failed; read the build log, not the 404 page.

## Current status

| Surface | Status |
| --- | --- |
| Landing page and all marketing/SEO routes | ✅ Live |
| `/docs`, `/login`, `/terms`, `/privacy`, `/data-deletion`, `/meta-review` | ✅ Live |
| `/dashboard`, `/settings` | ✅ Redirect to login (correct) |
| `/api/cron/daily` | ✅ Returns 401 without the bearer token (correct) |
| `/api/auth/providers` | ⚠️ 500 — needs a database and at least one auth provider |
| Instagram connect, campaigns, DM sending | ⚠️ Needs the full env set below |

## Environment variables

### Already set automatically by the deploy fix

These were generated and stored on the project (values are hidden):

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical/OG URLs — set to `https://instamation.vercel.app` |
| `NEXTAUTH_URL` | Auth callback base URL |
| `NEXTAUTH_SECRET` | Signs session tokens (32 random bytes) |
| `CRON_SECRET` | Bearer token protecting the cron endpoint |
| `ENCRYPTION_KEY` | Seals Instagram tokens at rest (32 random bytes) |

> ⚠️ `ENCRYPTION_KEY` must be **identical** on the web app and the background
> worker, or the worker cannot decrypt stored Instagram tokens.

### You must provide these

Set them in Vercel → Project → Settings → Environment Variables, then redeploy.

```bash
# Database — required for auth, dashboard, campaigns.
# Use the POOLED Neon endpoint (...-pooler.neon.tech).
vercel env add DATABASE_URL production

# Queue — required for the worker / DM delivery.
vercel env add REDIS_URL production

# Auth — set at least one provider, or /api/auth/providers returns 500.
vercel env add GOOGLE_CLIENT_ID production
vercel env add GOOGLE_CLIENT_SECRET production
# or GitHub:
vercel env add GITHUB_ID production
vercel env add GITHUB_SECRET production

# Meta / Instagram — required for comment-to-DM to work.
vercel env add INSTAGRAM_APP_ID production
vercel env add INSTAGRAM_APP_SECRET production
vercel env add FACEBOOK_APP_SECRET production
vercel env add WEBHOOK_VERIFY_TOKEN production

# Optional — email magic-link sign-in.
vercel env add RESEND_API_KEY production
vercel env add EMAIL_FROM production
```

### After adding the database

```bash
# Apply migrations against the production database
DATABASE_URL="<your-neon-pooled-url>" npx prisma migrate deploy
```

The Vercel build applies migrations automatically once `DATABASE_URL` exists, but
running it once by hand confirms the connection before you rely on it.

## Deploying

```bash
vercel link --project instamation   # once
vercel deploy --prod                # deploy
vercel ls instamation               # confirm Status = ● Ready
```

Pushing to `main` also triggers a production build via the Git integration.

## Verify a deploy actually worked

Do not trust the dashboard alone — check the alias serves real HTML:

```bash
# 1. Is the build Ready (not Error)?
vercel ls instamation

# 2. Does the live domain return 200 with real content?
curl -s -o /dev/null -w "%{http_code}\n" https://instamation.vercel.app/
curl -s https://instamation.vercel.app/ | grep -c "Turn Instagram"
```

## The background worker is not on Vercel

Vercel runs the web app only. DM sending happens in the separate worker process
(`npm run worker`), which must run somewhere always-on — an Oracle Cloud free VM,
Railway, Fly.io, or Docker:

```yaml
services:
  worker:
    image: explorearafat/instamation-worker:latest
    restart: unless-stopped
    environment:
      DATABASE_URL: ${DATABASE_URL}
      REDIS_URL: ${REDIS_URL}
      ENCRYPTION_KEY: ${ENCRYPTION_KEY}   # same value as Vercel
      INSTAGRAM_APP_SECRET: ${INSTAGRAM_APP_SECRET}
      FACEBOOK_APP_SECRET: ${FACEBOOK_APP_SECRET}
```

Without it, comments are matched and queued but never delivered.

## Troubleshooting

| Symptom | Cause | Fix |
| --- | --- | --- |
| `404 DEPLOYMENT_NOT_FOUND` | No successful deployment behind the alias | `vercel ls` → check Status → read the build log |
| Build fails: `datasource.url property is required` | `prisma migrate deploy` with no `DATABASE_URL` | Already handled by `scripts/vercel-build.mjs` |
| Build fails mentioning crons | More crons than the plan allows (Hobby: 2, daily only) | Consolidate into one daily fan-out job |
| `/api/auth/providers` 500 | No OAuth provider configured | Set Google or GitHub credentials |
| Login redirects but never completes | `NEXTAUTH_URL` wrong, or no DB | Match `NEXTAUTH_URL` to the real domain |
| DMs never send | Worker not running, or `ENCRYPTION_KEY` differs | Start the worker; verify both share the key |
