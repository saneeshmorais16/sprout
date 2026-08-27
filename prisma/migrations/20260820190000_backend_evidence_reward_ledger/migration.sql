CREATE TABLE "RewardLedger" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "sourceType" TEXT NOT NULL,
  "sourceId" TEXT NOT NULL,
  "amount" INTEGER NOT NULL,
  "metadata" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "RewardLedger_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "RewardLedger_userId_sourceType_sourceId_key" ON "RewardLedger"("userId", "sourceType", "sourceId");
CREATE INDEX "RewardLedger_userId_createdAt_idx" ON "RewardLedger"("userId", "createdAt");
CREATE INDEX "RewardLedger_sourceType_sourceId_idx" ON "RewardLedger"("sourceType", "sourceId");

CREATE TABLE "EvidenceSource" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "sourceTitle" TEXT NOT NULL,
  "publisher" TEXT NOT NULL,
  "publicationYear" INTEGER,
  "sourceUrl" TEXT,
  "reviewedAt" DATETIME,
  "topic" TEXT NOT NULL,
  "isDemo" BOOLEAN NOT NULL DEFAULT false,
  "notes" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);

CREATE INDEX "EvidenceSource_topic_reviewedAt_idx" ON "EvidenceSource"("topic", "reviewedAt");
CREATE INDEX "EvidenceSource_publisher_idx" ON "EvidenceSource"("publisher");
CREATE INDEX "UserAchievement_userId_earnedAt_idx" ON "UserAchievement"("userId", "earnedAt");

PRAGMA optimize;
