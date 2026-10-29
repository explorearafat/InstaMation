import type {
  Workspace,
  WorkspacePermission,
  WorkspaceRole,
} from "@/app/generated/prisma/client";
import type {
  DashboardInsightsData,
  DashboardSummaryData,
} from "@/lib/server/stats";
import type { UserWorkspace } from "@/lib/workspace";
import type { CampaignListItem } from "@/lib/server/automations";
import type { DmLogListItem, LogsPageResult } from "@/lib/server/logs";
import type { WorkspaceMembersPayload } from "@/lib/server/members";
import type {
  SettingsData,
  WorkspaceAccountOption,
} from "@/lib/server/settings";
import type { OverviewLoaderResult } from "@/lib/server/overview";

/**
 * Demo mode — the "Demo Login" button on /login signs in a synthetic user and
 * every data loader short-circuits to these fixtures, so the full dashboard
 * experience renders without touching the database or any provider.
 */

export const DEMO_USER_ID = "demo-admin";
export const DEMO_WORKSPACE_ID = "demo-workspace";
export const DEMO_USERNAME = process.env.DEMO_USERNAME ?? "admin";
export const DEMO_PASSWORD = process.env.DEMO_PASSWORD ?? "123456";

export function isDemoUser(userId: string | null | undefined): boolean {
  return userId === DEMO_USER_ID;
}

export function isDemoWorkspace(workspaceId: string): boolean {
  return workspaceId === DEMO_WORKSPACE_ID;
}

const DEMO_INSTAGRAM_ACCOUNT = {
  id: "demo-ig-account",
  username: "arafat",
  instagramId: "17841400000000001",
  name: "Arafat",
  tokenExpiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
  webhookSubscribed: true,
  profilePictureUrl: null,
};

export const DEMO_WORKSPACES: UserWorkspace[] = [
  {
    id: DEMO_WORKSPACE_ID,
    name: "Arafat's Workspace",
    role: "OWNER" as WorkspaceRole,
    permissions: [
      "MANAGE_CAMPAIGNS",
      "MANAGE_INBOX_AUTOMATIONS",
      "MANAGE_INSTAGRAM_ACCOUNTS",
      "MANAGE_MEMBERS",
    ] as WorkspacePermission[],
  },
];

const DEMO_WORKSPACE: Workspace = {
  id: DEMO_WORKSPACE_ID,
  name: "Arafat's Workspace",
  ownerId: DEMO_USER_ID,
  createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
  updatedAt: new Date(),
  usagePeriodStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  dmsSentThisPeriod: 96,
} as Workspace;

const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
};

const minutesAgo = (n: number) =>
  new Date(Date.now() - n * 60 * 1000).toISOString();

/** Full workspace context for the demo user — mirrors the DB-backed shape. */
export function getDemoWorkspaceContext(userId: string) {
  return {
    userId,
    workspaceId: DEMO_WORKSPACE_ID,
    workspace: DEMO_WORKSPACE,
    role: "OWNER" as WorkspaceRole,
    permissions: [
      "MANAGE_CAMPAIGNS",
      "MANAGE_INBOX_AUTOMATIONS",
      "MANAGE_INSTAGRAM_ACCOUNTS",
      "MANAGE_MEMBERS",
    ] as WorkspacePermission[],
  };
}

// ---------------------------------------------------------------------------
// Per-page fixtures
// ---------------------------------------------------------------------------

const DEMO_DEMO_PERMISSIONS = [
  "MANAGE_CAMPAIGNS",
  "MANAGE_INBOX_AUTOMATIONS",
  "MANAGE_INSTAGRAM_ACCOUNTS",
  "MANAGE_MEMBERS",
] as WorkspacePermission[];

export const DEMO_ACCOUNT_OPTIONS: WorkspaceAccountOption[] = [
  {
    id: DEMO_INSTAGRAM_ACCOUNT.id,
    username: DEMO_INSTAGRAM_ACCOUNT.username,
    instagramId: DEMO_INSTAGRAM_ACCOUNT.instagramId,
    name: DEMO_INSTAGRAM_ACCOUNT.name,
  },
];

/** Full instagram account row for lookups that read the whole model. */
export const DEMO_ACCOUNT_ROW = {
  ...DEMO_INSTAGRAM_ACCOUNT,
  workspaceId: DEMO_WORKSPACE_ID,
  accessToken: "demo-access-token",
  connectedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
};

export const DEMO_SETTINGS: SettingsData = {
  workspace: { name: "Arafat's Workspace", dmsSentThisPeriod: 96 },
  instagramAccounts: [DEMO_INSTAGRAM_ACCOUNT],
};

const logItem = (
  id: string,
  commenterName: string,
  commentText: string,
  status: string,
  automationName: string,
  minutes: number
): DmLogListItem => ({
  id,
  commenterId: `demo-commenter-${id}`,
  commenterName,
  commentText,
  status,
  errorMessage: status === "FAILED" ? "Instagram API error (rate limit)" : null,
  createdAt: minutesAgo(minutes),
  automation: { name: automationName, keywords: ["link", "send"] },
  instagramAccount: { username: "arafat" },
});

export const DEMO_LOGS_PAGE: LogsPageResult = {
  logs: [
    logItem("1", "Ratul Ahmed", "Send Link 🚀!", "SENT", "Free guide delivery", 3),
    logItem("2", "Sadia Islam", "link pls", "SENT", "Portfolio link", 26),
    logItem("3", "Imran Kabir", "How much for a landing page?", "SKIPPED_NO_MATCH", "Free guide delivery", 74),
    logItem("4", "Nadia Rahman", "ebook", "SENT", "Ebook giveaway", 190),
    logItem("5", "Tanvir Hasan", "price?", "FAILED", "Pricing info", 320),
  ],
  pagination: { page: 1, limit: 25, total: 5, totalPages: 1 },
};

export const DEMO_MEMBERS: WorkspaceMembersPayload = {
  currentUserRole: "OWNER" as WorkspaceRole,
  currentUserPermissions: DEMO_DEMO_PERMISSIONS,
  members: [
    {
      id: "demo-member-1",
      role: "OWNER" as WorkspaceRole,
      permissions: [],
      createdAt: minutesAgo(90 * 24 * 60),
      user: {
        id: DEMO_USER_ID,
        email: "admin@demo.instamation.app",
        name: "Arafat",
      },
    },
  ],
  invitations: [],
};

const demoCampaign = (
  id: string,
  name: string,
  keywords: string[],
  dmMessage: string,
  sent: number,
  isActive: boolean,
  daysOld: number
): CampaignListItem => ({
  id,
  name,
  goal: null,
  postId: "17895600000000001",
  postUrl: "https://www.instagram.com/arafat/reel/demo/",
  pendingNextReel: false,
  matchAnyPost: false,
  keywords,
  matchAnyWord: true,
  dmTriggerEnabled: true,
  dmMessage,
  openingDmEnabled: false,
  openingDmMessage: null,
  openingDmButtonLabel: null,
  linkButtonLabel: null,
  requireFollow: false,
  followPromptMessage: null,
  followPromptButtonLabel: null,
  followUpEnabled: false,
  followUpMessage: null,
  followUpDelayMinutes: null,
  publicReplyEnabled: false,
  publicReplyMessage: null,
  publicReplyMessages: [],
  isActive,
  wholeWordMatch: false,
  instagramAccountId: DEMO_INSTAGRAM_ACCOUNT.id,
  instagramAccount: {
    username: DEMO_INSTAGRAM_ACCOUNT.username,
    instagramId: DEMO_INSTAGRAM_ACCOUNT.instagramId,
  },
  reportShareSlug: null,
  reportShareEnabled: false,
  reportUrl: null,
  createdAt: minutesAgo(daysOld * 24 * 60),
  updatedAt: minutesAgo(daysOld * 12),
  _count: { dmLogs: Math.round(sent * 1.4) },
  trackedLinks: [
    {
      id: `${id}-link`,
      slug: `${name.toLowerCase().replace(/\s+/g, "-")}`,
      label: "Guide link",
      destinationUrl: "https://instamation.vercel.app",
      trackedUrl: "https://instamation.vercel.app/r/demo",
      _count: { clicks: Math.round(sent * 0.35) },
    },
  ],
  analytics: {
    sent,
    skipped: Math.round(sent * 0.08),
    failed: Math.round(sent * 0.02),
    clicks: Math.round(sent * 0.35),
    ctr: 34.5,
    topKeywords: keywords.map((keyword, i) => ({
      keyword,
      count: Math.round(sent / (i + 2)),
    })),
  },
});

export const DEMO_CAMPAIGNS: CampaignListItem[] = [
  demoCampaign(
    "demo-campaign-1",
    "Free guide delivery",
    ["link", "send", "guide"],
    "Hey 👋 Here's that ebook you requested!",
    214,
    true,
    45
  ),
  demoCampaign(
    "demo-campaign-2",
    "Portfolio link",
    ["portfolio", "work"],
    "Thanks for reaching out! Here's my latest work 🎨",
    96,
    true,
    21
  ),
  demoCampaign(
    "demo-campaign-3",
    "Pricing info",
    ["price", "cost"],
    "Here's the full pricing breakdown 💰",
    32,
    false,
    8
  ),
];

export const DEMO_DIAGNOSTICS_SECTIONS = {
  webhookFailures: [],
  dmFailures: [],
  tokenRefreshFailures: [],
  operationalEvents: [],
};

/** Posts grid payload — an empty library renders the grid's empty state. */
export const DEMO_POSTS = {
  data: [] as unknown[],
  snapshot: {
    status: "HIT" as const,
    fetchedAt: minutesAgo(12),
    expiresAt: minutesAgo(-48),
  },
};

export const DEMO_OVERVIEW: OverviewLoaderResult = {
  data: {
    account: { id: DEMO_INSTAGRAM_ACCOUNT.id, username: "arafat" },
    accounts: [
      {
        id: DEMO_INSTAGRAM_ACCOUNT.id,
        username: "arafat",
        instagramId: DEMO_INSTAGRAM_ACCOUNT.instagramId,
      },
    ],
    requestedCount: 50,
    truncated: false,
    insightsAvailable: true,
    followers: 4820,
    followerHistory: [6, 5, 4, 3, 2, 1, 0].map((n) => ({
      date: daysAgo(n),
      followers: 4820 - n * 24,
      delta: 24,
    })),
    totals: {
      posts: 128,
      views: 384000,
      reach: 121000,
      likes: 24800,
      comments: 3120,
      saved: 5400,
      shares: 2100,
      interactions: 35420,
    },
    posts: [],
  },
  snapshot: {
    status: "HIT",
    fetchedAt: minutesAgo(12),
    expiresAt: minutesAgo(-48),
  },
};

export const DEMO_SUMMARY: DashboardSummaryData = {
  userName: "Arafat",
  contactsCount: 1284,
  workspace: { name: "Arafat's Workspace", dmsSentThisPeriod: 96 },
  instagramAccount: DEMO_INSTAGRAM_ACCOUNT,
  instagramAccounts: [DEMO_INSTAGRAM_ACCOUNT],
  selectedInstagramAccountId: null,
  totalAutomations: 4,
  activeAutomations: 3,
  dmsSentToday: 12,
  dmsSentWeek: 96,
  dmsSentMonth: 342,
  dmsSkippedMonth: 21,
  dmsFailedMonth: 5,
  totalDMs: 1247,
  clicksThisMonth: 118,
  totalClicks: 489,
  ctrThisMonth: 34.5,
};

export const DEMO_INSIGHTS: DashboardInsightsData = {
  topKeywords: [
    { keyword: "link", count: 214 },
    { keyword: "guide", count: 156 },
    { keyword: "price", count: 98 },
    { keyword: "ebook", count: 77 },
    { keyword: "demo", count: 41 },
  ],
  dailyDMs: [
    { date: daysAgo(6), count: 18 },
    { date: daysAgo(5), count: 27 },
    { date: daysAgo(4), count: 41 },
    { date: daysAgo(3), count: 22 },
    { date: daysAgo(2), count: 63 },
    { date: daysAgo(1), count: 87 },
    { date: daysAgo(0), count: 12 },
  ],
  recentLogs: [
    {
      id: "demo-log-1",
      commenterName: "Ratul Ahmed",
      commentText: "Send Link 🚀!",
      status: "SENT",
      createdAt: minutesAgo(3),
      automation: { name: "Free guide delivery" },
      instagramAccount: { username: "arafat" },
    },
    {
      id: "demo-log-2",
      commenterName: "Sadia Islam",
      commentText: "link pls",
      status: "SENT",
      createdAt: minutesAgo(26),
      automation: { name: "Portfolio link" },
      instagramAccount: { username: "arafat" },
    },
    {
      id: "demo-log-3",
      commenterName: "Imran Kabir",
      commentText: "How much for a landing page?",
      status: "SKIPPED",
      createdAt: minutesAgo(74),
      automation: { name: "Free guide delivery" },
      instagramAccount: { username: "arafat" },
    },
    {
      id: "demo-log-4",
      commenterName: "Nadia Rahman",
      commentText: "ebook",
      status: "SENT",
      createdAt: minutesAgo(190),
      automation: { name: "Ebook giveaway" },
      instagramAccount: { username: "arafat" },
    },
    {
      id: "demo-log-5",
      commenterName: "Tanvir Hasan",
      commentText: "price?",
      status: "FAILED",
      createdAt: minutesAgo(320),
      automation: { name: "Pricing info" },
      instagramAccount: { username: "arafat" },
    },
  ],
};
