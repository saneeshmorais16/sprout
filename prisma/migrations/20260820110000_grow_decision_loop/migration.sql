-- CreateTable
CREATE TABLE "DecisionSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "scenarioKey" TEXT NOT NULL,
    "ageGroup" TEXT NOT NULL,
    "decisions" TEXT NOT NULL,
    "outcome" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DecisionSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- AlterTable
ALTER TABLE "PracticeReflection" ADD COLUMN "decisionSessionId" TEXT REFERENCES "DecisionSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "DecisionSession_userId_createdAt_idx" ON "DecisionSession"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "DecisionSession_userId_topic_createdAt_idx" ON "DecisionSession"("userId", "topic", "createdAt");

-- CreateIndex
CREATE INDEX "PracticeReflection_decisionSessionId_idx" ON "PracticeReflection"("decisionSessionId");
