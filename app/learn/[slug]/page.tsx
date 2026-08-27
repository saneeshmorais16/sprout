import Link from "next/link";
import {ArrowLeft,Clock3} from "lucide-react";
import {Brand} from "@/components/brand";
import {LessonPlayer} from "@/components/lesson-player";
import {isSupportedLearner,requireUser} from "@/lib/auth";
import {db} from "@/lib/db";
import {notFound,redirect} from "next/navigation";
import {lessonIsUnlocked,nextJourneyLesson} from "@/lib/learning-levels";
type PageProps={params:Promise<{slug:string}>};
type Content={objective:string;explanation:string;example:string;question:{prompt:string;options:string[];answer:number;explanation:string};takeaway:string};
export default async function LessonPage({params}:PageProps){
  const user=await requireUser();const profile=user.profile;if(!isSupportedLearner(profile))redirect("/onboarding");const learner=profile!;
  const{slug}=await params;const [lesson,completedRows]=await Promise.all([db.learningModule.findFirst({where:{slug,ageGroup:"YOUTH",published:true},include:{progress:{where:{userId:user.id}}}}),db.learningProgress.findMany({where:{userId:user.id,status:"COMPLETED"},select:{module:{select:{slug:true}}}})]);if(!lesson)notFound();
  const completedSlugs=new Set(completedRows.map(row=>row.module.slug));if(!lessonIsUnlocked(slug,completedSlugs))redirect("/learn");
  let content:Content;try{content=JSON.parse(lesson.content) as Content}catch{notFound()}
  const nextDefinition=nextJourneyLesson(slug,new Set([...completedSlugs,slug]));const next=nextDefinition?await db.learningModule.findFirst({where:{slug:nextDefinition.slug,ageGroup:"YOUTH",published:true},select:{slug:true,title:true}}):null;
  return <main className="product-page youth-surface"><div className="mobile-shell dashboard-shell lesson-shell"><header className="inner-header"><Link href="/learn" className="icon-button" aria-label="Back to level path"><ArrowLeft/></Link><Brand/><span className="xp-pill">{learner.xp} XP</span></header><section className="lesson-heading"><span>{lesson.path.toUpperCase()}</span><h1>{lesson.title}</h1><div><small><Clock3/> {lesson.minutes} min</small><small>Decision practice</small><small>+{lesson.xpReward} XP · +20 Sparks</small></div></section><LessonPlayer slug={lesson.slug} content={content} xpReward={lesson.xpReward} sparkReward={20} complete={lesson.progress[0]?.status==="COMPLETED"} next={next} ageGroup="YOUTH" soundsEnabled={learner.sprigSounds}/></div></main>;
}
