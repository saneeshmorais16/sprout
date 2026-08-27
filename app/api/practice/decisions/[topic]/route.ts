import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getDecisionScenario, runDecisionScenario } from "@/lib/decision-lab";
import { decisionSessionData } from "@/lib/grow-loop";
import { sameOrigin } from "@/lib/security";
import { decisionPracticeSchema,routeSlugSchema } from "@/lib/validation";
import {awardXp} from "@/lib/rewards";

type RouteContext={params:Promise<{topic:string}>};
export async function POST(request:Request,{params}:RouteContext){
  if(!sameOrigin(request))return NextResponse.json({error:"Request rejected."},{status:403});
  const user=await currentUser();if(!user?.profile?.ageGroup)return NextResponse.json({error:"Sign in required."},{status:401});
  const parsedTopic=routeSlugSchema.safeParse((await params).topic);if(!parsedTopic.success)return NextResponse.json({error:"This scenario is not part of your current age experience."},{status:404});const topic=parsedTopic.data;const ageGroup=user.profile.ageGroup as "YOUTH"|"YOUNG_ADULT";const scenario=getDecisionScenario(topic,ageGroup);if(!scenario)return NextResponse.json({error:"This scenario is not part of your current age experience."},{status:404});
  const parsed=decisionPracticeSchema.safeParse(await request.json().catch(()=>null));if(!parsed.success)return NextResponse.json({error:"Choose a decision to continue."},{status:400});
  let result;try{result=runDecisionScenario(scenario,parsed.data.optionId)}catch{return NextResponse.json({error:"Choose an available decision."},{status:400})}
  const outcome=await db.$transaction(async tx=>{const saved=await tx.decisionSession.create({data:decisionSessionData(user.id,{topic:scenario.topic,scenarioKey:scenario.key,ageGroup,decisions:{optionId:parsed.data.optionId},outcome:{metrics:result.metrics},explanation:{whatHappened:result.whatHappened,whyItHappened:result.whyItHappened,keyTakeaway:result.keyTakeaway}})});await tx.activity.create({data:{userId:user.id,type:"DECISION_PRACTICE_COMPLETED",metadata:JSON.stringify({decisionSessionId:saved.id,topic:scenario.topic,scenarioKey:scenario.key})}});const xpAwarded=await awardXp(tx,{userId:user.id,sourceType:"DECISION",sourceId:scenario.key,amount:scenario.xp,currentTopic:scenario.eyebrow.replace(" DECISION","").replace(" CONCEPT","")});return{saved,xpAwarded}});
  return NextResponse.json({sessionId:outcome.saved.id,result,xpAwarded:outcome.xpAwarded},{status:201});
}
