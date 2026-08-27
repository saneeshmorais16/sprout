import {NextResponse} from "next/server";
import {currentUser,isSupportedLearner,OwnershipError,requireOwnership} from "@/lib/auth";
import {db} from "@/lib/db";
import {awardSparkCoins,sparkCoinBalance} from "@/lib/spark-coins";
import {sameOrigin} from "@/lib/security";
import {recordIdSchema} from "@/lib/validation";

type RouteContext={params:Promise<{id:string}>};

export async function POST(request:Request,{params}:RouteContext){
  if(!sameOrigin(request))return NextResponse.json({error:"Request rejected."},{status:403});
  const user=await currentUser();
  if(!user)return NextResponse.json({error:"Sign in required."},{status:401});
  if(!isSupportedLearner(user.profile))return NextResponse.json({error:"Complete onboarding with an age from 15 to 18."},{status:403});
  const id=recordIdSchema.safeParse((await params).id);
  if(!id.success)return NextResponse.json({error:"Portfolio run not recognised."},{status:400});
  let run;
  try{run=await requireOwnership(user.id,userId=>db.portfolioRun.findFirst({where:{id:id.data,userId},include:{decisions:true}}))}
  catch(error){if(error instanceof OwnershipError)return NextResponse.json({error:"Portfolio run not found."},{status:404});throw error}
  if(run.status==="COMPLETED")return NextResponse.json({concept:"VOLATILITY",coinsAwarded:0,balance:await sparkCoinBalance(user.id),replayed:true});
  if(run.status!=="CONSEQUENCE_READY"||run.decisions.length!==1)return NextResponse.json({error:"See the decision consequence before unlocking the term."},{status:409});
  const result=await db.$transaction(async tx=>{
    await tx.portfolioRun.update({where:{id:run.id},data:{status:"COMPLETED",completedAt:new Date()}});
    await tx.conceptUnlock.upsert({where:{userId_concept:{userId:user.id,concept:"VOLATILITY"}},update:{},create:{userId:user.id,concept:"VOLATILITY",sourceType:"PORTFOLIO",sourceId:run.id}});
    const coinsAwarded=await awardSparkCoins(tx,{userId:user.id,sourceType:"CONCEPT_UNLOCK",sourceId:"VOLATILITY",amount:50});
    if(coinsAwarded)await tx.activity.create({data:{userId:user.id,type:"CONCEPT_UNLOCKED",metadata:JSON.stringify({concept:"VOLATILITY",sourceId:run.id})}});
    return{concept:"VOLATILITY",coinsAwarded,balance:await sparkCoinBalance(user.id,tx)};
  });
  return NextResponse.json(result);
}
