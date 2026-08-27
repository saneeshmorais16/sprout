/*
  Warnings:

  - Added the required column `actionPath` to the `FeedItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reason` to the `FeedItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `category` to the `Video` table without a default value. This is not possible if the table is not empty.
  - Added the required column `keyTakeaway` to the `Video` table without a default value. This is not possible if the table is not empty.
  - Added the required column `transcript` to the `Video` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "VideoProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "completedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VideoProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "VideoProgress_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_FeedItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "ageGroup" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "actionPath" TEXT NOT NULL,
    "publishedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_FeedItem" ("ageGroup", "category", "createdAt", "id", "publishedAt", "summary", "title", "updatedAt") SELECT "ageGroup", "category", "createdAt", "id", "publishedAt", "summary", "title", "updatedAt" FROM "FeedItem";
DROP TABLE "FeedItem";
ALTER TABLE "new_FeedItem" RENAME TO "FeedItem";
CREATE TABLE "new_Goal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "targetPence" INTEGER NOT NULL,
    "savedPence" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "targetDate" DATETIME,
    "category" TEXT NOT NULL DEFAULT 'Other',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Goal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Goal" ("createdAt", "id", "savedPence", "status", "targetPence", "title", "updatedAt", "userId") SELECT "createdAt", "id", "savedPence", "status", "targetPence", "title", "updatedAt", "userId" FROM "Goal";
DROP TABLE "Goal";
ALTER TABLE "new_Goal" RENAME TO "Goal";
CREATE INDEX "Goal_userId_status_idx" ON "Goal"("userId", "status");
CREATE TABLE "new_LearningModule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "path" TEXT NOT NULL DEFAULT 'Money Basics',
    "objective" TEXT NOT NULL DEFAULT '',
    "difficulty" TEXT NOT NULL DEFAULT 'Beginner',
    "minutes" INTEGER NOT NULL DEFAULT 3,
    "ageGroup" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "xpReward" INTEGER NOT NULL DEFAULT 50,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_LearningModule" ("ageGroup", "content", "createdAt", "description", "id", "published", "slug", "sortOrder", "title", "updatedAt", "xpReward") SELECT "ageGroup", "content", "createdAt", "description", "id", "published", "slug", "sortOrder", "title", "updatedAt", "xpReward" FROM "LearningModule";
DROP TABLE "LearningModule";
ALTER TABLE "new_LearningModule" RENAME TO "LearningModule";
CREATE UNIQUE INDEX "LearningModule_slug_key" ON "LearningModule"("slug");
CREATE TABLE "new_Profile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "age" INTEGER,
    "ageGroup" TEXT,
    "contentLevel" TEXT,
    "guardianStatus" TEXT NOT NULL DEFAULT 'NOT_REQUIRED',
    "streak" INTEGER NOT NULL DEFAULT 0,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "currentTopic" TEXT NOT NULL DEFAULT 'Getting started',
    "beginnerDone" INTEGER NOT NULL DEFAULT 0,
    "advancedSkips" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Profile" ("age", "ageGroup", "contentLevel", "createdAt", "firstName", "guardianStatus", "id", "streak", "updatedAt", "userId", "xp") SELECT "age", "ageGroup", "contentLevel", "createdAt", "firstName", "guardianStatus", "id", "streak", "updatedAt", "userId", "xp" FROM "Profile";
DROP TABLE "Profile";
ALTER TABLE "new_Profile" RENAME TO "Profile";
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");
CREATE TABLE "new_Video" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "storageKey" TEXT,
    "thumbnailUrl" TEXT,
    "category" TEXT NOT NULL,
    "ageGroup" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL DEFAULT 'Beginner',
    "durationSeconds" INTEGER NOT NULL DEFAULT 120,
    "transcript" TEXT NOT NULL,
    "keyTakeaway" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "fileSize" INTEGER,
    "mimeType" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Video" ("ageGroup", "createdAt", "description", "id", "published", "sourceUrl", "thumbnailUrl", "title", "updatedAt") SELECT "ageGroup", "createdAt", "description", "id", "published", "sourceUrl", "thumbnailUrl", "title", "updatedAt" FROM "Video";
DROP TABLE "Video";
ALTER TABLE "new_Video" RENAME TO "Video";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "VideoProgress_userId_completedAt_idx" ON "VideoProgress"("userId", "completedAt");

-- CreateIndex
CREATE UNIQUE INDEX "VideoProgress_userId_videoId_key" ON "VideoProgress"("userId", "videoId");
