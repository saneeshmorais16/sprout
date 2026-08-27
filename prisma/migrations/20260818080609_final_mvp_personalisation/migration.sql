-- CreateTable
CREATE TABLE "PracticeReflection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "activityKey" TEXT NOT NULL,
    "choice" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PracticeReflection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

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
    "interests" TEXT NOT NULL DEFAULT '[]',
    "confidenceBaseline" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Profile" ("advancedSkips", "age", "ageGroup", "beginnerDone", "contentLevel", "createdAt", "currentTopic", "firstName", "guardianStatus", "id", "notifications", "privacyMode", "streak", "updatedAt", "userId", "xp") SELECT "advancedSkips", "age", "ageGroup", "beginnerDone", "contentLevel", "createdAt", "currentTopic", "firstName", "guardianStatus", "id", "notifications", "privacyMode", "streak", "updatedAt", "userId", "xp" FROM "Profile";
DROP TABLE "Profile";
ALTER TABLE "new_Profile" RENAME TO "Profile";
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "PracticeReflection_userId_createdAt_idx" ON "PracticeReflection"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PracticeReflection_userId_activityKey_key" ON "PracticeReflection"("userId", "activityKey");
