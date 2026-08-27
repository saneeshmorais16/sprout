import {NextResponse} from "next/server";
import {currentUser,isSupportedLearner} from "@/lib/auth";
import {db} from "@/lib/db";
import {marketSnapshotForPath,parseMarketPoints,portfolioOutcome} from "@/lib/market-data";
import {InsufficientSparkCoinsError,sparkCoinBalance,spendSparkCoins} from "@/lib/spark-coins";
import {sameOrigin} from "@/lib/security";
import {portfolioRunSchema} from "@/lib/validation";
import {COMPOUNDING_DAILY_POSTS} from "@/lib/weekly-loop";

export async function GET(){
  const user=await currentUser();if(!user)return NextResponse.json({error:"Sign in required."},{status:401});if(!isSupportedLearner(user.profile))return NextResponse.json({error:"Complete onboarding with an age from 15 to 18."},{status:403});
  const[balance,completedLevel1,completedLevel2,runs]=await Promise.all([
    sparkCoinBalance(user.id),
    db.portfolioRun.count({where:{userId:user.id,level:1,status:"COMPLETED"}}),
    db.portfolioRun.count({where:{userId:user.id,level:2,status:"COMPLETED"}}),
    db.portfolioRun.findMany({where:{userId:user.id},orderBy:{createdAt:"desc"},take:5,select:{id:true,level:true,path:true,allocatedCoins:true,status:true,decision:true,selectedOutcome:true,alternativeOutcome:true,createdAt:true}}),
  ]);
  return NextResponse.json({balance,unlockedLevel:completedLevel2?3:completedLevel1?2:1,runs});
}

export async function POST(request:Request){
  if(!sameOrigin(request))return NextResponse.json({error:"Request rejected."},{status:403});
  const user=await currentUser();if(!user)return NextResponse.json({error:"Sign in required."},{status:401});if(!isSupportedLearner(user.profile))return NextResponse.json({error:"Complete onboarding with an age from 15 to 18."},{status:403});
  const input=portfolioRunSchema.safeParse(await request.json().catch(()=>null));
  if(!input.success)return NextResponse.json({error:"Choose an available industry for the 150 Spark Coin replay."},{status:400});
  const completedPractice=await db.dailyPostProgress.count({where:{userId:user.id,post:{slug:{in:COMPOUNDING_DAILY_POSTS.map(post=>post.slug)}}}});
  if(completedPractice!==COMPOUNDING_DAILY_POSTS.length)return NextResponse.json({error:"Complete Tuesday, Wednesday and Thursday before Friday’s replay."},{status:409});
  const industryPath={GAMING:"ADVENTURE",TECH:"GROWTH",FASHION:"GROWTH",FOOD:"STEADY"} as const;
  const path=industryPath[input.data.industry];
  const snapshot=await marketSnapshotForPath(path);
  const points=parseMarketPoints(snapshot.pricePoints);
  const outcome=portfolioOutcome(input.data.allocation,points,"HOLD");
  try{
    const saved=await db.$transaction(async tx=>{
      const run=await tx.portfolioRun.create({data:{userId:user.id,level:1,path,allocatedCoins:input.data.allocation,snapshotId:snapshot.id,startPoint:outcome.startPoint,decisionPoint:outcome.decisionPoint,endPoint:outcome.endPoint,allocations:{create:{assetKey:`${input.data.industry}:${snapshot.key}`,amount:input.data.allocation}}}});
      const balance=await spendSparkCoins(tx,{userId:user.id,sourceType:"PORTFOLIO_ALLOCATION",sourceId:run.id,amount:input.data.allocation});
      return{run,balance};
    });
    const visible=points.slice(0,outcome.decisionPoint+1);
    return NextResponse.json({run:saved.run,industry:input.data.industry,balance:saved.balance,series:visible.map((point,index)=>({index,date:point.date,value:Math.round(input.data.allocation*(point.value/points[0].value))})),source:{title:snapshot.source,asOf:snapshot.asOfDate,dataVersion:snapshot.dataVersion},notice:"Stored historical example — not a forecast. No real money is involved."},{status:201});
  }catch(error){
    if(error instanceof InsufficientSparkCoinsError)return NextResponse.json({error:"You do not have enough Spark Coins for that allocation."},{status:409});
    throw error;
  }
}
