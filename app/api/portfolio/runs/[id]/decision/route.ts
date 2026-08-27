import {NextResponse} from "next/server";
import {currentUser,isSupportedLearner,OwnershipError,requireOwnership} from "@/lib/auth";
import {db} from "@/lib/db";
import {parseMarketPoints,portfolioOutcome} from "@/lib/market-data";
import {sameOrigin} from "@/lib/security";
import {portfolioDecisionSchema,recordIdSchema} from "@/lib/validation";

type RouteContext={params:Promise<{id:string}>};

export async function POST(request:Request,{params}:RouteContext){
  if(!sameOrigin(request))return NextResponse.json({error:"Request rejected."},{status:403});
  const user=await currentUser();if(!user)return NextResponse.json({error:"Sign in required."},{status:401});if(!isSupportedLearner(user.profile))return NextResponse.json({error:"Complete onboarding with an age from 15 to 18."},{status:403});
  const id=recordIdSchema.safeParse((await params).id);
  const input=portfolioDecisionSchema.safeParse(await request.json().catch(()=>null));
  if(!id.success||!input.success)return NextResponse.json({error:"Portfolio decision not recognised."},{status:400});
  let run;
  try{run=await requireOwnership(user.id,userId=>db.portfolioRun.findFirst({where:{id:id.data,userId},include:{snapshot:true}}))}
  catch(error){if(error instanceof OwnershipError)return NextResponse.json({error:"Portfolio run not found."},{status:404});throw error}
  if(run.status!=="AWAITING_DECISION")return NextResponse.json({error:"This decision has already been recorded."},{status:409});
  const points=parseMarketPoints(run.snapshot.pricePoints);
  const outcome=portfolioOutcome(run.allocatedCoins,points,input.data.decision);
  const updated=await db.$transaction(async tx=>{
    await tx.portfolioDecision.create({data:{runId:run.id,decision:input.data.decision}});
    const saved=await tx.portfolioRun.update({where:{id:run.id},data:{decision:input.data.decision,selectedOutcome:outcome.selected,alternativeOutcome:outcome.alternative,status:"CONSEQUENCE_READY"}});
    await tx.activity.create({data:{userId:user.id,type:"PORTFOLIO_DECISION_COMPLETED",metadata:JSON.stringify({runId:run.id,decision:input.data.decision,educational:true})}});
    return saved;
  });
  return NextResponse.json({run:updated,series:points.map((point,index)=>({index,date:point.date,value:Math.round(run.allocatedCoins*(point.value/points[0].value))})),chosen:{label:input.data.decision==="SELL"?"You chose Move out":"You chose Hold",value:outcome.selected},alternative:{label:input.data.decision==="SELL"?"If you had held":"If you had moved out",value:outcome.alternative},explanation:input.data.decision==="SELL"?"Moving out fixed the value at that point in this historical period.":"Holding kept the Spark Coins exposed to later movements in this historical period.",notice:"In this historical period, this is what happened next. Another period could have behaved differently."});
}
