import {NextResponse} from "next/server";
import {currentUser} from "@/lib/auth";
import {db} from "@/lib/db";
import {awardXp} from "@/lib/rewards";
import {sameOrigin} from "@/lib/security";
import {recordIdSchema} from "@/lib/validation";
type RouteContext={params:Promise<{id:string}>};
export async function POST(request:Request,{params}:RouteContext){
  if(!sameOrigin(request))return NextResponse.json({error:"Request rejected."},{status:403});const user=await currentUser();if(!user?.profile?.ageGroup)return NextResponse.json({error:"Sign in required."},{status:401});
  const parsedId=recordIdSchema.safeParse((await params).id);if(!parsedId.success)return NextResponse.json({error:"Video not found."},{status:404});const id=parsedId.data;
  const video=await db.video.findFirst({where:{id,ageGroup:user.profile.ageGroup,published:true}});if(!video)return NextResponse.json({error:"Video not found."},{status:404});
  const result=await db.$transaction(async tx=>{await tx.videoProgress.upsert({where:{userId_videoId:{userId:user.id,videoId:id}},update:{},create:{userId:user.id,videoId:id}});const xpAwarded=await awardXp(tx,{userId:user.id,sourceType:"VIDEO",sourceId:id,amount:50,currentTopic:video.category});if(xpAwarded)await tx.activity.create({data:{userId:user.id,type:"VIDEO_COMPLETED",metadata:JSON.stringify({videoId:id,xp:xpAwarded})}});const profile=await tx.profile.findUniqueOrThrow({where:{userId:user.id}});return{xpAwarded,totalXp:profile.xp}});
  return NextResponse.json({ok:true,...result});
}
