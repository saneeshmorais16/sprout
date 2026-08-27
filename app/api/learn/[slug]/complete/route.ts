import { NextResponse } from "next/server";
import { currentUser,isSupportedLearner } from "@/lib/auth";
import { db } from "@/lib/db";
import { sameOrigin } from "@/lib/security";
import {awardXp,grantAchievement} from "@/lib/rewards";
import {routeSlugSchema} from "@/lib/validation";
import {awardSparkCoins} from "@/lib/spark-coins";
import {lessonIsUnlocked} from "@/lib/learning-levels";
import {z} from "zod";

type RouteContext = { params: Promise<{ slug: string }> };

export async function POST(request: Request, { params }: RouteContext) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Request rejected." }, { status: 403 });
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  if(!isSupportedLearner(user.profile))return NextResponse.json({error:"Complete onboarding with an age from 15 to 18."},{status:403});
  const profile=user.profile!;
  const raw=await request.text();if(raw){let body:unknown;try{body=JSON.parse(raw)}catch{return NextResponse.json({error:"Invalid request."},{status:400})}if(!z.object({}).strict().safeParse(body).success)return NextResponse.json({error:"Unexpected completion fields."},{status:400})}
  const parsedSlug=routeSlugSchema.safeParse((await params).slug);if(!parsedSlug.success)return NextResponse.json({error:"Lesson not found for your learning path."},{status:404});const slug=parsedSlug.data;
  const lesson = await db.learningModule.findFirst({ where: { slug, ageGroup: profile.ageGroup!, published: true } });
  if (!lesson) return NextResponse.json({ error: "Lesson not found for your learning path." }, { status: 404 });
  const completedRows=await db.learningProgress.findMany({where:{userId:user.id,status:"COMPLETED"},select:{module:{select:{slug:true}}}});
  if(!lessonIsUnlocked(slug,new Set(completedRows.map(row=>row.module.slug))))return NextResponse.json({error:"Complete the earlier activities to unlock this lesson."},{status:403});
  const existing = await db.learningProgress.findUnique({ where: { userId_moduleId: { userId: user.id, moduleId: lesson.id } } });
  if (existing?.status === "COMPLETED") return NextResponse.json({ ok: true, alreadyComplete: true, xpAwarded: 0, coinsAwarded:0, totalXp: profile.xp });

  const result = await db.$transaction(async (tx) => {
    const latest = await tx.activity.findFirst({ where: { userId: user.id, type: "LESSON_COMPLETED" }, orderBy: { createdAt: "desc" } });
    const today = new Date(); const last = latest?.createdAt;
    const engagedToday = last && last.getFullYear() === today.getFullYear() && last.getMonth() === today.getMonth() && last.getDate() === today.getDate();
    await tx.learningProgress.upsert({ where: { userId_moduleId: { userId: user.id, moduleId: lesson.id } }, update: { status: "COMPLETED", progress: 100, completedAt: new Date() }, create: { userId: user.id, moduleId: lesson.id, status: "COMPLETED", progress: 100, completedAt: new Date() } });
    const nextBeginner = profile.beginnerDone + (lesson.difficulty === "Beginner" ? 1 : 0);
    await tx.profile.update({ where: { userId: user.id }, data: { beginnerDone: nextBeginner, ...(!engagedToday && { streak: { increment: 1 } }), ...(profile.contentLevel === "FOUNDATIONAL" && nextBeginner >= 2 && { contentLevel: "TRANSITIONAL" }) } });
    const xpAwarded=await awardXp(tx,{userId:user.id,sourceType:"LESSON",sourceId:lesson.id,amount:lesson.xpReward,currentTopic:lesson.path,metadata:{slug:lesson.slug}});
    const coinsAwarded=await awardSparkCoins(tx,{userId:user.id,sourceType:"LESSON",sourceId:lesson.id,amount:20});
    await tx.activity.create({ data: { userId: user.id, type: "LESSON_COMPLETED", metadata: JSON.stringify({ slug: lesson.slug, path: lesson.path, xp: lesson.xpReward }) } });
    const updatedProfile=await tx.profile.findUniqueOrThrow({where:{userId:user.id}});return {profile:updatedProfile,xpAwarded,coinsAwarded};
  });

  const achievementKeys: string[] = [];
  if (lesson.slug === "building-a-budget") achievementKeys.push("budget-builder");
  if (lesson.slug === "compound-growth" || lesson.slug === "adult-investing-foundations") achievementKeys.push("growth-explorer");
  if (lesson.path === "Money Basics") {
    const [total, completed] = await Promise.all([
      db.learningModule.count({ where: { ageGroup: profile.ageGroup!, path: "Money Basics", published: true } }),
      db.learningProgress.count({ where: { userId: user.id, status: "COMPLETED", module: { path: "Money Basics" } } }),
    ]);
    if (total > 0 && completed >= total) achievementKeys.push("money-basics");
  }
  if(achievementKeys.length)await db.$transaction(async tx=>{for(const key of achievementKeys)await grantAchievement(tx,user.id,key)});
  return NextResponse.json({ ok: true, alreadyComplete: false, xpAwarded: result.xpAwarded, coinsAwarded:result.coinsAwarded, totalXp: result.profile.xp, achievements: achievementKeys });
}
