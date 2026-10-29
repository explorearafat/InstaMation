-- Optional local password auth for self-hosted sign-up (LOCAL_SIGNUP=true).
-- Nullable: OAuth-only users never fill it.
ALTER TABLE "User" ADD COLUMN "passwordHash" TEXT;
