import {NextResponse} from "next/server";
import {currentUser,isSupportedLearner} from "@/lib/auth";
import {db} from "@/lib/db";
import {awardSparkCoins} from "@/lib/spark-coins";
import {sameOrigin} from "@/lib/security";
import {labProgressSchema,routeSlugSchema} from "@/lib/validation";

type RouteContext={params:Promise<{slug:string}>};

export async function POST(request:Request,{params}:RouteContext){
  if(!sameOrigin(request))return NextResponse.json({error:"Request rejected."},{status:403});
  const user=await currentUser();if(!user)return NextResponse.json({error:"Sign in required."},{status:401});if(!isSupportedLearner(user.profile))return NextResponse.json({error:"Complete onboarding with an age from 15 to 18."},{status:403});
  const slug=routeSlugSchema.safeParse((await params).slug);
  const input=labProgressSchema.safeParse(await request.json().catch(()=>null));
  if(!slug.success||!input.success)return NextResponse.json({error:"Lab step not recognised."},{status:400});
  const lab=await db.weeklyLab.findFirst({where:{slug:slug.data,published:true,OR:[{ageGroup:"ALL"},{ageGroup:user.profile?.ageGroup??"NONE"}]}});
  if(!lab)return NextResponse.json({error:"Lab not found for your learning path."},{status:404});
  const current=await db.weeklyLabProgress.findUnique({where:{userId_labId:{userId:user.id,labId:lab.id}}});
  if(input.data.step>(current?.step??0)+1)return NextResponse.json({error:"Complete the previous step first."},{status:409});
  if((current?.step??0)>=input.data.step)return NextResponse.json({progress:current,coinsAwarded:0,replayed:true});
  const result=await db.$transaction(async tx=>{
    const progress=await tx.weeklyLabProgress.upsert({where:{userId_labId:{userId:user.id,labId:lab.id}},update:{step:input.data.step,completedAt:input.data.step===3?new Date():null},create:{userId:user.id,labId:lab.id,step:input.data.step,completedAt:input.data.step===3?new Date():null}});
    let coinsAwarded=0,conceptUnlocked=false;
    if(input.data.step===3){
      coinsAwarded=await awardSparkCoins(tx,{userId:user.id,sourceType:"WEEKLY_LAB",sourceId:lab.id,amount:lab.rewardCoins});
      const unlock=await tx.conceptUnlock.upsert({where:{userId_concept:{userId:user.id,concept:lab.concept}},update:{},create:{userId:user.id,concept:lab.concept,sourceType:"WEEKLY_LAB",sourceId:lab.id}});
      conceptUnlocked=unlock.sourceId===lab.id;
      if(coinsAwarded)await tx.activity.create({data:{userId:user.id,type:"WEEKLY_LAB_COMPLETED",metadata:JSON.stringify({labId:lab.id,concept:lab.concept})}});
    }
    return{progress,coinsAwarded,conceptUnlocked};
  });
  return NextResponse.json(result);
}
