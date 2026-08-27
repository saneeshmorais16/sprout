import {NextResponse} from "next/server";
import {currentUser} from "@/lib/auth";
import {db} from "@/lib/db";
import {sameOrigin} from "@/lib/security";
import {contentSignalSchema} from "@/lib/validation";
export async function POST(request:Request){if(!sameOrigin(request))return NextResponse.json({error:"Request rejected."},{status:403});const user=await currentUser();if(!user?.profile)return NextResponse.json({error:"Sign in required."},{status:401});const parsed=contentSignalSchema.safeParse(await request.json().catch(()=>null));if(!parsed.success)return NextResponse.json({error:"Signal not recognised."},{status:400});const count=user.profile.advancedSkips+1;const contentLevel=count>=2?(user.profile.contentLevel==="ADVANCED"?"TRANSITIONAL":"FOUNDATIONAL"):user.profile.contentLevel;await db.profile.update({where:{userId:user.id},data:{advancedSkips:count,contentLevel}});return NextResponse.json({ok:true,contentLevel})}
