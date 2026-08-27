import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { sameOrigin } from "@/lib/security";
import { preferenceSchema } from "@/lib/validation";
export async function GET(){const user=await currentUser();if(!user?.profile)return NextResponse.json({error:"Sign in required."},{status:401});return NextResponse.json({notifications:user.profile.notifications,sprigSounds:user.profile.sprigSounds,privacyMode:user.profile.privacyMode,ageGroup:user.profile.ageGroup});}
export async function POST(request:Request){if(!sameOrigin(request))return NextResponse.json({error:"Request rejected."},{status:403});const user=await currentUser();if(!user)return NextResponse.json({error:"Sign in required."},{status:401});const parsed=preferenceSchema.safeParse(await request.json().catch(()=>null));if(!parsed.success)return NextResponse.json({error:"Preference not recognised."},{status:400});const profile=await db.profile.update({where:{userId:user.id},data:parsed.data});return NextResponse.json({preferences:{notifications:profile.notifications,sprigSounds:profile.sprigSounds,privacyMode:profile.privacyMode}});}
