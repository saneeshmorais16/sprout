-- CreateTable
CREATE TABLE "KnowledgeChunk" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "sourceLabel" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "ageMin" INTEGER NOT NULL,
    "ageMax" INTEGER NOT NULL,
    "level" INTEGER NOT NULL,
    "reviewedAt" DATETIME NOT NULL,
    "body" TEXT NOT NULL,
    "isDraft" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "KnowledgeChunk_topic_ageMin_ageMax_level_idx" ON "KnowledgeChunk"("topic", "ageMin", "ageMax", "level");

-- CreateIndex
CREATE INDEX "KnowledgeChunk_reviewedAt_idx" ON "KnowledgeChunk"("reviewedAt");
