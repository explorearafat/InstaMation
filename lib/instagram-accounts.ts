import { prisma } from "@/lib/db/client";
import { DEMO_ACCOUNT_ROW, isDemoWorkspace } from "@/lib/demo";

export async function canConnectInstagramAccount({
  workspaceId,
  instagramId,
}: {
  workspaceId: string;
  instagramId: string;
}) {
  const existingAccount = await prisma.instagramAccount.findUnique({
    where: { instagramId },
    select: { workspaceId: true },
  });

  if (existingAccount && existingAccount.workspaceId !== workspaceId) {
    return {
      allowed: false,
      reason: "already_connected" as const,
    };
  }

  return {
    allowed: true,
    reason: null,
  };
}

export async function getWorkspaceInstagramAccount(
  workspaceId: string,
  instagramAccountId?: string | null
) {
  if (isDemoWorkspace(workspaceId)) {
    if (instagramAccountId && instagramAccountId !== "all") {
      return instagramAccountId === DEMO_ACCOUNT_ROW.id
        ? DEMO_ACCOUNT_ROW
        : null;
    }
    return DEMO_ACCOUNT_ROW;
  }

  if (instagramAccountId && instagramAccountId !== "all") {
    return prisma.instagramAccount.findFirst({
      where: { id: instagramAccountId, workspaceId },
    });
  }

  return prisma.instagramAccount.findFirst({
    where: { workspaceId },
    orderBy: { connectedAt: "desc" },
  });
}

