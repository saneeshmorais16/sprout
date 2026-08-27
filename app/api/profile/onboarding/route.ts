import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { sameOrigin } from "@/lib/security";
import { onboardingSchema } from "@/lib/validation";
export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Request rejected." }, { status: 403 });
  const user = await currentUser(); if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const parsed = onboardingSchema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return NextResponse.json({ error: "Choose an age, one to three interests and a confidence baseline." }, { status: 400 });
  await db.$transaction(async transaction=>{await transaction.profile.update({ where: { userId: user.id }, data: { age: parsed.data.age, ageGroup: "YOUTH", contentLevel: "FOUNDATIONAL", guardianStatus: "NOT_REQUIRED", interests: JSON.stringify(parsed.data.interests), confidenceBaseline: parsed.data.confidenceBaseline, currentTopic: parsed.data.interests[0].replaceAll("_", " ") } });if(user.profile?.ageGroup&&user.profile.ageGroup!=="YOUTH")await transaction.activity.create({data:{userId:user.id,type:"AGE_MODE_CHANGED",metadata:JSON.stringify({from:user.profile.ageGroup,to:"YOUTH"})}})});
  return NextResponse.json({ ok: true, next: "/dashboard" });
}
