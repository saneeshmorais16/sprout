import {Prisma} from "@prisma/client";
import {NextResponse} from "next/server";
import {currentUser,isSupportedLearner} from "@/lib/auth";
import {db} from "@/lib/db";
import {awardSparkCoins} from "@/lib/spark-coins";
import {sameOrigin} from "@/lib/security";
import {COMPOUNDING_DAILY_POSTS,dailyPostDefinition,dailyPostFeedback} from "@/lib/weekly-loop";
import {dailyPostCompleteSchema,routeSlugSchema} from "@/lib/validation";

type RouteContext={params:Promise<{slug:string}>};

export async function POST(request:Request,{params}:RouteContext){
  if(!sameOrigin(request))return NextResponse.json({error:"Request rejected."},{status:403});
  const user=await currentUser();if(!user)return NextResponse.json({error:"Sign in required."},{status:401});if(!isSupportedLearner(user.profile))return NextResponse.json({error:"Complete onboarding with an age from 15 to 18."},{status:403});
  const slug=routeSlugSchema.safeParse((await params).slug);
  const input=dailyPostCompleteSchema.safeParse(await request.json().catch(()=>null));
  if(!slug.success||!input.success)return NextResponse.json({error:"Choose one available response."},{status:400});
  const post=await db.dailyPost.findFirst({where:{slug:slug.data,published:true,lab:{OR:[{ageGroup:"ALL"},{ageGroup:user.profile?.ageGroup??"NONE"}]}}});
  if(!post)return NextResponse.json({error:"Daily post not found."},{status:404});
  const definition=dailyPostDefinition(post.slug);
  const feedback=definition&&dailyPostFeedback(post.slug,input.data.choice);
  if(!definition||!feedback)return NextResponse.json({error:"Choose one available response."},{status:400});
  const labProgress=await db.weeklyLabProgress.findUnique({where:{userId_labId:{userId:user.id,labId:post.labId}}});
  if(labProgress?.step!==3)return NextResponse.json({error:"Complete Monday’s Lab before the Daily Practice."},{status:409});
  const postIndex=COMPOUNDING_DAILY_POSTS.findIndex(item=>item.slug===post.slug);
  const previousSlugs=COMPOUNDING_DAILY_POSTS.slice(0,postIndex).map(item=>item.slug);
  if(previousSlugs.length){
    const completedPrevious=await db.dailyPostProgress.count({where:{userId:user.id,post:{slug:{in:previousSlugs}}}});
    if(completedPrevious!==previousSlugs.length)return NextResponse.json({error:"Complete the earlier Daily Practice first."},{status:409});
  }
  const existing=await db.dailyPostProgress.findUnique({where:{userId_postId:{userId:user.id,postId:post.id}}});
  if(existing)return NextResponse.json({progress:existing,coinsAwarded:0,replayed:true});
  try{
    const result=await db.$transaction(async tx=>{
      const progress=await tx.dailyPostProgress.create({data:{userId:user.id,postId:post.id,choice:input.data.choice,feedback:feedback.feedback}});
      const coinsAwarded=await awardSparkCoins(tx,{userId:user.id,sourceType:"DAILY_POST",sourceId:post.id,amount:post.rewardCoins});
      await tx.activity.create({data:{userId:user.id,type:"DAILY_POST_COMPLETED",metadata:JSON.stringify({postId:post.id,choice:input.data.choice})}});
      return{progress,coinsAwarded,feedback:{correct:definition.options[0]?.id===input.data.choice,message:feedback.feedback}};
    });
    return NextResponse.json(result,{status:201});
  }catch(error){
    if(error instanceof Prisma.PrismaClientKnownRequestError&&error.code==="P2002"){
      const progress=await db.dailyPostProgress.findUnique({where:{userId_postId:{userId:user.id,postId:post.id}}});
      return NextResponse.json({progress,coinsAwarded:0,replayed:true});
    }
    throw error;
  }
}
