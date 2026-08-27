import { NextResponse } from "next/server";
import { AuthenticationError, AuthorizationError, requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { completeMission } from "@/lib/missions";
import { logServerEvent, requestId } from "@/lib/server-logger";
import { rateLimit, requestIp, sameOrigin } from "@/lib/security";
import { presenterSchema } from "@/lib/validation";

const demoDate = new Date("2026-08-20T12:00:00.000Z");

async function restoreGoal(userId: string) {
  await db.goal.deleteMany({ where: { userId } });
  const goal = await db.goal.create({ data: { userId, title: "Save £1,000 in one year", targetPence: 100000, savedPence: 42000, targetDate: new Date("2027-08-20T12:00:00.000Z"), category: "Personal" } });
  await db.goalContribution.createMany({ data: [
    { goalId: goal.id, amountPence: 15000, createdAt: new Date("2026-07-23T12:00:00.000Z") },
    { goalId: goal.id, amountPence: 12000, createdAt: new Date("2026-08-06T12:00:00.000Z") },
    { goalId: goal.id, amountPence: 15000, createdAt: new Date("2026-08-17T12:00:00.000Z") },
  ] });
}

async function resetCoreLoop(userId: string) {
  await db.$transaction(async (tx) => {
    await tx.portfolioRun.deleteMany({ where: { userId } });
    await tx.dailyPostProgress.deleteMany({ where: { userId } });
    await tx.weeklyLabProgress.deleteMany({ where: { userId } });
    await tx.conceptUnlock.deleteMany({ where: { userId } });
    await tx.sparkCoinEvent.deleteMany({ where: { userId } });
    await tx.sparkCoinEvent.create({ data: { userId, sourceType: "DEMO", sourceId: "MAYA_SPARK_BASELINE_V2", amount: 150 } });
    await tx.profile.update({ where: { userId }, data: { demoDay: "MONDAY" } });
  });
}

async function restoreLearning(userId: string) {
  await db.$transaction(async (tx) => {
    await tx.videoProgress.deleteMany({ where: { userId } });
    await tx.practiceReflection.deleteMany({ where: { userId } });
    await tx.decisionSession.deleteMany({ where: { userId } });
    await tx.learningProgress.deleteMany({ where: { userId } });
    await tx.simulatorSession.deleteMany({ where: { userId } });
    await tx.simulationRun.deleteMany({ where: { userId } });
    await tx.missionProgress.deleteMany({ where: { userId } });
    await tx.activity.deleteMany({ where: { userId } });
    await tx.userAchievement.deleteMany({ where: { userId } });
    await tx.rewardLedger.deleteMany({ where: { userId } });
    for (const slug of ["what-is-money", "needs-vs-wants"]) {
      const lesson = await tx.learningModule.findUnique({ where: { slug } });
      if (lesson) await tx.learningProgress.create({ data: { userId, moduleId: lesson.id, status: "COMPLETED", progress: 100, completedAt: demoDate } });
    }
    for (const key of ["first-goal", "budget-builder", "scam-spotter"]) {
      const achievement = await tx.achievement.findUnique({ where: { key } });
      if (achievement) await tx.userAchievement.create({ data: { userId, achievementId: achievement.id, earnedAt: demoDate } });
    }
    await tx.rewardLedger.create({ data: { userId, sourceType: "DEMO", sourceId: "MAYA_BASELINE_V1", amount: 620, metadata: JSON.stringify({ educationalBaseline: true }) } });
    await tx.profile.update({ where: { userId }, data: { xp: 620, streak: 4, currentTopic: "Saving", beginnerDone: 2, advancedSkips: 0, notifications: true, sprigSounds: false, privacyMode: "STANDARD" } });
    await tx.userAvatar.upsert({ where: { userId }, update: { character: "SPROUT", colourVariant: "MINT", accessory: "BACKPACK" }, create: { userId, character: "SPROUT", colourVariant: "MINT", accessory: "BACKPACK" } });
  });
  await resetCoreLoop(userId);
}

async function prepareDemo(userId: string) {
  await db.$transaction(async (tx) => {
    await tx.portfolioRun.deleteMany({ where: { userId } });
    await tx.dailyPostProgress.deleteMany({ where: { userId } });
    await tx.weeklyLabProgress.deleteMany({ where: { userId } });
    await tx.conceptUnlock.deleteMany({ where: { userId } });
    await tx.sparkCoinEvent.deleteMany({ where: { userId } });
    await tx.videoProgress.deleteMany({ where: { userId } });
    await tx.practiceReflection.deleteMany({ where: { userId } });
    await tx.decisionSession.deleteMany({ where: { userId } });
    await tx.learningProgress.deleteMany({ where: { userId } });
    await tx.simulatorSession.deleteMany({ where: { userId } });
    await tx.simulationRun.deleteMany({ where: { userId } });
    await tx.missionProgress.deleteMany({ where: { userId } });
    await tx.activity.deleteMany({ where: { userId } });
    await tx.userAchievement.deleteMany({ where: { userId } });
    await tx.rewardLedger.deleteMany({ where: { userId } });
    await tx.goal.deleteMany({ where: { userId } });
    await tx.guardianApproval.deleteMany({ where: { userId } });
    const goal = await tx.goal.create({ data: { userId, title: "Save £1,000 in one year", targetPence: 100000, savedPence: 42000, targetDate: new Date("2027-08-20T12:00:00.000Z"), category: "Personal" } });
    await tx.goalContribution.createMany({ data: [
      { goalId: goal.id, amountPence: 15000, createdAt: new Date("2026-07-23T12:00:00.000Z") },
      { goalId: goal.id, amountPence: 12000, createdAt: new Date("2026-08-06T12:00:00.000Z") },
      { goalId: goal.id, amountPence: 15000, createdAt: new Date("2026-08-17T12:00:00.000Z") },
    ] });
    for (const slug of ["what-is-money", "needs-vs-wants"]) {
      const lesson = await tx.learningModule.findUniqueOrThrow({ where: { slug } });
      await tx.learningProgress.create({ data: { userId, moduleId: lesson.id, status: "COMPLETED", progress: 100, completedAt: demoDate } });
    }
    for (const key of ["first-goal", "budget-builder", "scam-spotter"]) {
      const achievement = await tx.achievement.findUniqueOrThrow({ where: { key } });
      await tx.userAchievement.create({ data: { userId, achievementId: achievement.id, earnedAt: demoDate } });
    }
    await tx.rewardLedger.create({ data: { userId, sourceType: "DEMO", sourceId: "MAYA_BASELINE_V1", amount: 620, metadata: JSON.stringify({ educationalBaseline: true }) } });
    await tx.sparkCoinEvent.create({ data: { userId, sourceType: "DEMO", sourceId: "MAYA_SPARK_BASELINE_V2", amount: 150 } });
    await tx.profile.update({ where: { userId }, data: { age: 16, ageGroup: "YOUTH", contentLevel: "FOUNDATIONAL", guardianStatus: "NOT_REQUIRED", xp: 620, streak: 4, currentTopic: "Compounding", beginnerDone: 2, advancedSkips: 0, notifications: true, sprigSounds: false, privacyMode: "STANDARD", interests: JSON.stringify(["SAVING", "COMPOUNDING", "DIVERSIFICATION"]), confidenceBaseline: 3, demoDay: "MONDAY" } });
    await tx.userAvatar.upsert({ where: { userId }, update: { character: "SPROUT", colourVariant: "MINT", accessory: "BACKPACK" }, create: { userId, character: "SPROUT", colourVariant: "MINT", accessory: "BACKPACK" } });
  });
}

export async function POST(request: Request) {
  const id = requestId(request);
  const started = Date.now();
  if (!sameOrigin(request)) return NextResponse.json({ error: "Request rejected." }, { status: 403 });
  let admin;
  try {
    admin = await requireRole(["ADMIN"], { api: true });
  } catch (error) {
    if (error instanceof AuthenticationError || error instanceof AuthorizationError) return NextResponse.json({ error: "Not authorised." }, { status: 403 });
    throw error;
  }
  if (!rateLimit(`presenter:${admin.id}:${requestIp(request)}`, 30, 60_000)) return NextResponse.json({ error: "Presenter actions are temporarily rate limited." }, { status: 429 });
  const parsed = presenterSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  const maya = await db.user.findUnique({ where: { email: (process.env.MAYA_EMAIL || "maya@grow.local").toLowerCase() }, include: { profile: true } });
  if (!maya) return NextResponse.json({ error: "Maya demo account is missing. Run the seed." }, { status: 404 });
  const action = parsed.data.action;
  if (action === "AGE_16") {
    await db.profile.update({ where: { userId: maya.id }, data: { age: 16, ageGroup: "YOUTH", contentLevel: "FOUNDATIONAL", guardianStatus: "NOT_REQUIRED", currentTopic: "Compounding", interests: JSON.stringify(["SAVING", "SCAMS", "INVESTING"]), confidenceBaseline: 3 } });
    await restoreGoal(maya.id);
    await db.activity.create({ data: { userId: maya.id, type: "AGE_MODE_CHANGED", metadata: JSON.stringify({ toAge: 16 }) } });
  }
  if (action === "RESET_ACTIVITY") await restoreLearning(maya.id);
  if (action === "RESET_GOALS") await restoreGoal(maya.id);
  if (action === "RESET_STREAK") await db.profile.update({ where: { userId: maya.id }, data: { streak: 0 } });
  if (action === "RESET_SIMULATIONS") await db.$transaction([db.practiceReflection.deleteMany({ where: { userId: maya.id } }), db.decisionSession.deleteMany({ where: { userId: maya.id } }), db.simulationRun.deleteMany({ where: { userId: maya.id } }), db.simulatorSession.deleteMany({ where: { userId: maya.id } })]);
  if (action === "COMPLETE_MISSION") await completeMission(maya.id, "diversified-practice");
  if (action === "UNLOCK_ACHIEVEMENT") {
    const achievement = await db.achievement.findUnique({ where: { key: "diversification-detective" } });
    if (achievement) await db.userAchievement.upsert({ where: { userId_achievementId: { userId: maya.id, achievementId: achievement.id } }, update: {}, create: { userId: maya.id, achievementId: achievement.id } });
  }
  if (action === "CHANGE_AVATAR") await db.userAvatar.upsert({ where: { userId: maya.id }, update: { character: "EMBER", colourVariant: "BERRY", accessory: "HEADPHONES" }, create: { userId: maya.id, character: "EMBER", colourVariant: "BERRY", accessory: "HEADPHONES" } });
  if (action === "RESET_XP_STREAK") await db.$transaction([db.rewardLedger.deleteMany({ where: { userId: maya.id } }), db.profile.update({ where: { userId: maya.id }, data: { xp: 0, streak: 0 } })]);
  if (action === "DEMO_MONDAY") await db.profile.update({ where: { userId: maya.id }, data: { demoDay: "MONDAY" } });
  if (action === "DEMO_WEDNESDAY") await db.profile.update({ where: { userId: maya.id }, data: { demoDay: "WEDNESDAY" } });
  if (action === "DEMO_FRIDAY") await db.profile.update({ where: { userId: maya.id }, data: { demoDay: "FRIDAY" } });
  if (action === "RESET_MAYA" || action === "RESTORE_SEED" || action === "PREPARE_DEMO") await prepareDemo(maya.id);
  logServerEvent("presenter.action", { requestId: id, adminUserId: admin.id, action, durationMs: Date.now() - started, outcome: "success" });
  return NextResponse.json({ ok: true, action }, { headers: { "X-Request-Id": id } });
}

