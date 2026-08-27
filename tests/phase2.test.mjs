import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

test("legacy educational records remain available without entering the active 15–18 loop", async () => {
  const [youthModules, videos, achievements, weeklyLabs, dailyPosts, snapshots] = await Promise.all([
    prisma.learningModule.count({ where: { ageGroup: "YOUTH" } }),
    prisma.video.count({ where: { ageGroup: "YOUTH" } }),
    prisma.achievement.count(),
    prisma.weeklyLab.count({ where: { published: true } }),
    prisma.dailyPost.count({ where: { published: true } }),
    prisma.marketSnapshot.count(),
  ]);
  assert.ok(youthModules >= 6);
  assert.ok(videos >= 2);
  assert.ok(achievements >= 5);
  assert.ok(weeklyLabs >= 1);
  assert.ok(dailyPosts >= 1);
  assert.ok(snapshots >= 3);
  const onboarding = readFileSync("components/age-onboarding.tsx", "utf8");
  assert.doesNotMatch(onboarding, /19|20|21|22|23|24|25/);
});

test.after(async () => prisma.$disconnect());
