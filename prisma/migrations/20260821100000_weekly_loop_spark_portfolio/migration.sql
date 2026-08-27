ALTER TABLE "Profile" ADD COLUMN "demoDay" TEXT NOT NULL DEFAULT 'MONDAY';

CREATE TABLE "SparkCoinEvent" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "sourceType" TEXT NOT NULL,
  "sourceId" TEXT NOT NULL,
  "amount" INTEGER NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SparkCoinEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "SparkCoinEvent_userId_sourceType_sourceId_key" ON "SparkCoinEvent"("userId", "sourceType", "sourceId");
CREATE INDEX "SparkCoinEvent_userId_createdAt_idx" ON "SparkCoinEvent"("userId", "createdAt");

CREATE TABLE "ConceptUnlock" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "concept" TEXT NOT NULL,
  "sourceType" TEXT NOT NULL,
  "sourceId" TEXT NOT NULL,
  "unlockedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ConceptUnlock_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "ConceptUnlock_userId_concept_key" ON "ConceptUnlock"("userId", "concept");
CREATE INDEX "ConceptUnlock_userId_unlockedAt_idx" ON "ConceptUnlock"("userId", "unlockedAt");

CREATE TABLE "WeeklyLab" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "slug" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "concept" TEXT NOT NULL,
  "summary" TEXT NOT NULL,
  "ageGroup" TEXT NOT NULL DEFAULT 'ALL',
  "rewardCoins" INTEGER NOT NULL DEFAULT 100,
  "published" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);
CREATE UNIQUE INDEX "WeeklyLab_slug_key" ON "WeeklyLab"("slug");

CREATE TABLE "WeeklyLabProgress" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "labId" TEXT NOT NULL,
  "step" INTEGER NOT NULL DEFAULT 0,
  "completedAt" DATETIME,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "WeeklyLabProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "WeeklyLabProgress_labId_fkey" FOREIGN KEY ("labId") REFERENCES "WeeklyLab" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "WeeklyLabProgress_userId_labId_key" ON "WeeklyLabProgress"("userId", "labId");
CREATE INDEX "WeeklyLabProgress_userId_completedAt_idx" ON "WeeklyLabProgress"("userId", "completedAt");

CREATE TABLE "DailyPost" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "slug" TEXT NOT NULL,
  "labId" TEXT NOT NULL,
  "dayLabel" TEXT NOT NULL DEFAULT 'WEDNESDAY',
  "title" TEXT NOT NULL,
  "prompt" TEXT NOT NULL,
  "options" TEXT NOT NULL,
  "feedback" TEXT NOT NULL,
  "rewardCoins" INTEGER NOT NULL DEFAULT 25,
  "published" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "DailyPost_labId_fkey" FOREIGN KEY ("labId") REFERENCES "WeeklyLab" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "DailyPost_slug_key" ON "DailyPost"("slug");
CREATE INDEX "DailyPost_labId_dayLabel_published_idx" ON "DailyPost"("labId", "dayLabel", "published");

CREATE TABLE "DailyPostProgress" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "postId" TEXT NOT NULL,
  "choice" TEXT NOT NULL,
  "feedback" TEXT NOT NULL,
  "completedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "DailyPostProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "DailyPostProgress_postId_fkey" FOREIGN KEY ("postId") REFERENCES "DailyPost" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "DailyPostProgress_userId_postId_key" ON "DailyPostProgress"("userId", "postId");
CREATE INDEX "DailyPostProgress_userId_completedAt_idx" ON "DailyPostProgress"("userId", "completedAt");

CREATE TABLE "MarketSnapshot" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "key" TEXT NOT NULL,
  "symbol" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "sector" TEXT,
  "source" TEXT NOT NULL,
  "sourceUrl" TEXT NOT NULL,
  "startDate" DATETIME NOT NULL,
  "endDate" DATETIME NOT NULL,
  "asOfDate" DATETIME NOT NULL,
  "retrievedAt" DATETIME NOT NULL,
  "dataVersion" TEXT NOT NULL,
  "pricePoints" TEXT NOT NULL,
  "annualisedVolatility" REAL NOT NULL,
  "marketCapMillions" INTEGER,
  "revenueTrend" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX "MarketSnapshot_key_key" ON "MarketSnapshot"("key");
CREATE INDEX "MarketSnapshot_sector_asOfDate_idx" ON "MarketSnapshot"("sector", "asOfDate");
CREATE INDEX "MarketSnapshot_annualisedVolatility_idx" ON "MarketSnapshot"("annualisedVolatility");

CREATE TABLE "PortfolioRun" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "level" INTEGER NOT NULL,
  "path" TEXT NOT NULL,
  "allocatedCoins" INTEGER NOT NULL,
  "snapshotId" TEXT NOT NULL,
  "startPoint" INTEGER NOT NULL,
  "decisionPoint" INTEGER NOT NULL,
  "endPoint" INTEGER NOT NULL,
  "decision" TEXT,
  "selectedOutcome" INTEGER,
  "alternativeOutcome" INTEGER,
  "status" TEXT NOT NULL DEFAULT 'AWAITING_DECISION',
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt" DATETIME,
  CONSTRAINT "PortfolioRun_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "PortfolioRun_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "MarketSnapshot" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX "PortfolioRun_userId_createdAt_idx" ON "PortfolioRun"("userId", "createdAt");
CREATE INDEX "PortfolioRun_userId_level_status_idx" ON "PortfolioRun"("userId", "level", "status");

CREATE TABLE "PortfolioAllocation" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "runId" TEXT NOT NULL,
  "assetKey" TEXT NOT NULL,
  "amount" INTEGER NOT NULL,
  CONSTRAINT "PortfolioAllocation_runId_fkey" FOREIGN KEY ("runId") REFERENCES "PortfolioRun" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "PortfolioAllocation_runId_assetKey_key" ON "PortfolioAllocation"("runId", "assetKey");

CREATE TABLE "PortfolioDecision" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "runId" TEXT NOT NULL,
  "decision" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PortfolioDecision_runId_fkey" FOREIGN KEY ("runId") REFERENCES "PortfolioRun" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "PortfolioDecision_runId_key" ON "PortfolioDecision"("runId");

PRAGMA optimize;
