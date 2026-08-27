import Link from "next/link";
import {ArrowLeft,BookOpen,Coins} from "lucide-react";
import {Brand} from "@/components/brand";
import {AppShell} from "@/components/app-shell";
import {LevelJourney} from "@/components/level-journey";
import {isSupportedLearner,requireUser} from "@/lib/auth";
import {db} from "@/lib/db";
import {learningLevels} from "@/lib/learning-levels";
import {sparkCoinBalance} from "@/lib/spark-coins";
import {redirect} from "next/navigation";

export default async function LearnPage(){
  const user=await requireUser();
  const profile=user.profile;
  if(!isSupportedLearner(profile))redirect("/onboarding");
  const configuredSlugs=learningLevels.flatMap(level=>level.lessons.map(lesson=>lesson.slug));
  const [modules,coins]=await Promise.all([
    db.learningModule.findMany({where:{ageGroup:"YOUTH",published:true,slug:{in:configuredSlugs}},include:{progress:{where:{userId:user.id}}}}),
    sparkCoinBalance(user.id),
  ]);
  const completedSlugs=modules.filter(module=>module.progress[0]?.status==="COMPLETED").map(module=>module.slug);
  const total=configuredSlugs.length;
  const percent=Math.round(completedSlugs.length/total*100);
  return <main className="product-page youth-surface"><AppShell className="inner-shell level-path-shell" mode="YOUTH" active="Learn">
    <header className="inner-header"><Link href="/dashboard" className="icon-button" aria-label="Back to home"><ArrowLeft/></Link><Brand/><span className="xp-pill"><Coins/> {coins} Sparks</span></header>
    <section className="learn-heading"><span className="page-kicker"><BookOpen/> Level path</span><h1>Learn money by doing</h1><p>Experience a choice first. Then unlock the words that explain what happened.</p><div className="hub-progress" aria-label={`${completedSlugs.length} of ${total} activities complete`}><div><strong>{completedSlugs.length} of {total}</strong><span>activities complete</span></div><strong>{percent}%</strong><div className="progress-track"><i style={{width:`${percent}%`}}/></div></div></section>
    <LevelJourney completedSlugs={completedSlugs} availableSlugs={modules.map(module=>module.slug)}/>
  </AppShell></main>;
}
