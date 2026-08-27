import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { isAllocationValid, isReasonablyDiversified, runPracticeSimulation } from "@/lib/investment-simulator";
import { completeMission } from "@/lib/missions";
import { decisionSessionData } from "@/lib/grow-loop";
import { sameOrigin } from "@/lib/security";
import { investmentSimulationSchema } from "@/lib/validation";

export async function GET() {
  const user = await currentUser(); if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const runs = await db.simulationRun.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 8 });
  return NextResponse.json({ runs });
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Request rejected." }, { status: 403 });
  const user = await currentUser(); if (!user?.profile?.ageGroup) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const parsed = investmentSimulationSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success || !isAllocationValid(parsed.data.allocation)) return NextResponse.json({ error: "Your allocation must add up to exactly 100%." }, { status: 400 });
  const result = runPracticeSimulation(parsed.data.allocation, parsed.data.scenarioId, parsed.data.duration);
  const [run, decisionSession] = await db.$transaction([
    db.simulationRun.create({ data: { userId: user.id, scenarioId: parsed.data.scenarioId, startingValue: result.startingValue, endingValue: result.endingValue, allocation: JSON.stringify(parsed.data.allocation), duration: parsed.data.duration } }),
    db.decisionSession.create({ data: decisionSessionData(user.id, { topic:"INVESTING_BASICS",scenarioKey:parsed.data.scenarioId,ageGroup:user.profile.ageGroup as "YOUTH"|"YOUNG_ADULT",decisions:{allocation:parsed.data.allocation,duration:parsed.data.duration},outcome:{endingValue:result.endingValue,changePercent:result.changePercent,inflationAdjusted:result.inflationAdjusted},explanation:{whatHappened:result.scenarioSummary,whyItHappened:result.insights.map(item=>item.body).join(" "),keyTakeaway:"Diversification can reduce reliance on one category, but it cannot remove uncertainty or guarantee a return."} }) }),
  ]);
  const firstMission = await completeMission(user.id, "first-simulation");
  const diversificationMission = isReasonablyDiversified(parsed.data.allocation) ? await completeMission(user.id, "diversified-practice") : { completed: false, xpAwarded: 0 };
  return NextResponse.json({ run, decisionSessionId:decisionSession.id, result, xpAwarded: firstMission.xpAwarded + diversificationMission.xpAwarded, diversificationComplete: diversificationMission.completed }, { status: 201 });
}
