import { NextRequest, NextResponse } from "next/server";
import { GET as refreshTokens } from "@/app/api/cron/refresh-tokens/route";
import { GET as attachNextReel } from "@/app/api/cron/attach-next-reel/route";
import { GET as snapshotFollowers } from "@/app/api/cron/snapshot-followers/route";
import { GET as snapshotCleanup } from "@/app/api/cron/snapshot-cleanup/route";

/**
 * Single daily maintenance pass.
 *
 * The Vercel Hobby plan allows only 2 cron jobs per project, and rejects a
 * deployment that declares more — so four separate entries in vercel.json made
 * every production build fail. All four jobs were already scheduled once a day
 * at hourly offsets, so folding them into one daily run loses no scheduling
 * granularity: they are independent, order-tolerant, and each already recovers
 * from a missed day (the polling sweep and the snapshot backfill both
 * self-heal).
 *
 * Each job runs inside its own try/catch so one failure cannot starve the
 * others — a Meta API outage during token refresh must not stop that day's
 * follower snapshot, which is unrecoverable if skipped (Instagram only retains
 * ~30 days of insights).
 *
 * The individual routes remain in place and stay callable with the same bearer
 * secret, which is useful for manual re-runs and for anyone self-hosting on a
 * platform whose scheduler has no cron-count limit.
 */

/** Order matters only for tidiness; every job is independent. */
const JOBS = [
  { name: "refresh-tokens", handler: refreshTokens },
  { name: "attach-next-reel", handler: attachNextReel },
  { name: "snapshot-followers", handler: snapshotFollowers },
  { name: "snapshot-cleanup", handler: snapshotCleanup },
] as const;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET || process.env.NEXTAUTH_SECRET;

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      {
        status: 401,
        headers: { "Cache-Control": "no-store, must-revalidate" },
      }
    );
  }

  const results: Record<string, unknown> = {};
  let failures = 0;

  for (const job of JOBS) {
    try {
      // Re-enter the child handler through a real Request carrying the same
      // bearer secret, so its own auth check and response shape are reused
      // rather than duplicated here.
      const inner = new NextRequest(
        new URL(`/api/cron/${job.name}`, request.url),
        { headers: { authorization: `Bearer ${cronSecret}` } }
      );
      const res = await job.handler(inner);
      const body = await res.json();
      results[job.name] = res.ok
        ? body?.data ?? body
        : { error: body?.error ?? "failed", status: res.status };
      if (!res.ok) failures += 1;
    } catch (err) {
      failures += 1;
      const message = err instanceof Error ? err.message : "Unknown error";
      results[job.name] = { error: message };
      console.error(`[cron/daily] ${job.name} threw`, err);
    }
  }

  return NextResponse.json(
    {
      success: failures === 0,
      data: { jobs: JOBS.length, failures, results },
    },
    { headers: { "Cache-Control": "no-store, must-revalidate" } }
  );
}
