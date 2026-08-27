import {NextResponse} from "next/server";
import {currentUser} from "@/lib/auth";
import {db} from "@/lib/db";
import {completeMission} from "@/lib/missions";
import {awardXp,grantAchievement} from "@/lib/rewards";
import {sameOrigin} from "@/lib/security";
import {activityCompleteSchema} from "@/lib/validation";
export async function POST(request:Request){if(!sameOrigin(request))return NextResponse.json({error:"Request rejected."},{status:403});const user=await currentUser();if(!user)return NextResponse.json({error:"Sign in required."},{status:401});const parsed=activityCompleteSchema.safeParse(await request.json().catch(()=>null));if(!parsed.success)return NextResponse.json({error:"Activity not recognised."},{status:400});const activityXp=await db.$transaction(async tx=>{const awarded=await awardXp(tx,{userId:user.id,sourceType:"ACTIVITY",sourceId:parsed.data.type,amount:75,currentTopic:"Protect Your Money"});if(awarded){await tx.activity.create({data:{userId:user.id,type:parsed.data.type,metadata:JSON.stringify({completed:true})}});await grantAchievement(tx,user.id,"scam-spotter")}return awarded});const mission=await completeMission(user.id,"spot-scam-signs");return NextResponse.json({ok:true,xpAwarded:activityXp+mission.xpAwarded});}
