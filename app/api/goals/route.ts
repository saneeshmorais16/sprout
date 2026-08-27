import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { noStoreHeaders, sameOrigin } from "@/lib/security";
import { goalCreateSchema } from "@/lib/validation";

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401, headers: noStoreHeaders() });
  const goals = await db.goal.findMany({ where: { userId: user.id }, include: { contributions: { orderBy: { createdAt: "desc" }, take: 12 } }, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ goals }, { headers: noStoreHeaders() });
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Request rejected." }, { status: 403 });
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const parsed = goalCreateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Check your goal details." }, { status: 400 });
  const goal = await db.goal.create({ data: { userId: user.id, title: parsed.data.title, category: parsed.data.category, targetPence: Math.round(parsed.data.targetAmount * 100), savedPence: Math.round(parsed.data.currentAmount * 100), targetDate: parsed.data.targetDate ? new Date(`${parsed.data.targetDate}T12:00:00Z`) : null } });
  const achievement = await db.achievement.findUnique({ where: { key: "first-goal" } });
  if (achievement) await db.userAchievement.upsert({ where: { userId_achievementId: { userId: user.id, achievementId: achievement.id } }, update: {}, create: { userId: user.id, achievementId: achievement.id } });
  return NextResponse.json({ goal }, { status: 201 });
}
