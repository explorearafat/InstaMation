/**
 * Vercel build entrypoint.
 *
 * The stock script was `prisma generate && prisma migrate deploy && next build`.
 * `prisma migrate deploy` hard-requires DATABASE_URL, so on a project whose
 * environment variables have not been configured yet the whole build exited 1 —
 * which is what produced the "404 DEPLOYMENT_NOT_FOUND" on the production alias:
 * a failed build never produces a deployment for the domain to point at.
 *
 * Migrations still run automatically once DATABASE_URL exists, so this is not a
 * behaviour change for a correctly configured deployment. It just stops an
 * unconfigured one from being unrecoverably red, and tells you exactly what is
 * missing instead of failing deep inside Prisma.
 *
 * Skipping is safe: the app itself does not open a database connection at build
 * time (nothing imports a Prisma client into a statically prerendered route), so
 * the marketing pages build and serve fine without a database. Only the
 * authenticated dashboard needs one at runtime.
 */

import { execSync } from "node:child_process";

function run(label, command) {
  console.log(`\n\u25b6 ${label}\n`);
  execSync(command, { stdio: "inherit", env: process.env });
}

const hasDatabase = Boolean(process.env.DATABASE_URL?.trim());

// 1. Prisma client must always be generated — the app imports it.
run("Generating Prisma client", "npx prisma generate");

// 2. Apply migrations only when a database is actually configured.
if (hasDatabase) {
  run("Applying database migrations", "npx prisma migrate deploy");
} else {
  console.warn(
    "\n\u26a0  DATABASE_URL is not set — skipping `prisma migrate deploy`.\n" +
      "   The site will build and the public pages will serve, but anything\n" +
      "   that touches the database (sign-in, dashboard, campaigns, webhooks)\n" +
      "   will fail until Postgres is configured and this is redeployed.\n" +
      "   See README.md \u2192 Environment variables.\n",
  );
}

// 3. Build.
run("Building Next.js", "npx next build");
