/*
  Warnings:

  - Added the required column `ageGroup` to the `WireStory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `keyTerm` to the `WireStory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `WireStory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `whatCouldAffect` to the `WireStory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `whatHappened` to the `WireStory` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
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
    "notifications" BOOLEAN NOT NULL DEFAULT true,
    "privacyMode" TEXT NOT NULL DEFAULT 'STANDARD',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Profile" ("advancedSkips", "age", "ageGroup", "beginnerDone", "contentLevel", "createdAt", "currentTopic", "firstName", "guardianStatus", "id", "streak", "updatedAt", "userId", "xp") SELECT "advancedSkips", "age", "ageGroup", "beginnerDone", "contentLevel", "createdAt", "currentTopic", "firstName", "guardianStatus", "id", "streak", "updatedAt", "userId", "xp" FROM "Profile";
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
    "createdById" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Video_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Video" ("ageGroup", "category", "createdAt", "description", "difficulty", "durationSeconds", "fileSize", "id", "keyTakeaway", "mimeType", "published", "sourceUrl", "storageKey", "thumbnailUrl", "title", "transcript", "updatedAt") SELECT "ageGroup", "category", "createdAt", "description", "difficulty", "durationSeconds", "fileSize", "id", "keyTakeaway", "mimeType", "published", "sourceUrl", "storageKey", "thumbnailUrl", "title", "transcript", "updatedAt" FROM "Video";
DROP TABLE "Video";
ALTER TABLE "new_Video" RENAME TO "Video";
CREATE INDEX "Video_createdById_idx" ON "Video"("createdById");
CREATE INDEX "Video_ageGroup_published_idx" ON "Video"("ageGroup", "published");
CREATE TABLE "new_WireStory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "ageGroup" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'Money explained',
    "whatHappened" TEXT NOT NULL,
    "whyItMatters" TEXT NOT NULL,
    "whatCouldAffect" TEXT NOT NULL,
    "keyTerm" TEXT NOT NULL,
    "learnMorePath" TEXT,
    "minutes" INTEGER NOT NULL DEFAULT 3,
    "publishedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_WireStory" ("createdAt", "id", "publishedAt", "summary", "title", "updatedAt", "whyItMatters") SELECT "createdAt", "id", "publishedAt", "summary", "title", "updatedAt", "whyItMatters" FROM "WireStory";
DROP TABLE "WireStory";
ALTER TABLE "new_WireStory" RENAME TO "WireStory";
CREATE UNIQUE INDEX "WireStory_slug_key" ON "WireStory"("slug");
CREATE INDEX "WireStory_ageGroup_publishedAt_idx" ON "WireStory"("ageGroup", "publishedAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "FeedItem_ageGroup_publishedAt_idx" ON "FeedItem"("ageGroup", "publishedAt");
