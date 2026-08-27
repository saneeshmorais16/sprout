import Link from "next/link";
import {ArrowLeft,Check,Coins,Flame,Lightbulb,Settings,WalletCards} from "lucide-react";
import {AppShell} from "@/components/app-shell";
import {Brand} from "@/components/brand";
import {requireUser} from "@/lib/auth";
import {db} from "@/lib/db";
import {financialSkills,skillForLesson,type FinancialSkillKey} from "@/lib/financial-literacy";
import {sparkCoinBalance} from "@/lib/spark-coins";
import {redirect} from "next/navigation";

export default async function ProgressPage(){
  const user=await requireUser();
  const profile=user.profile;
  if(!profile?.age||profile.age<15||profile.age>18||profile.ageGroup!=="YOUTH")redirect("/onboarding");
  const[balance,labs,posts,runs,concepts,lessons,goals,safetyActivities]=await Promise.all([
    sparkCoinBalance(user.id),
    db.weeklyLabProgress.count({where:{userId:user.id,completedAt:{not:null}}}),
    db.dailyPostProgress.count({where:{userId:user.id}}),
    db.portfolioRun.count({where:{userId:user.id,status:"COMPLETED"}}),
    db.conceptUnlock.findMany({where:{userId:user.id},orderBy:{unlockedAt:"desc"}}),
    db.learningProgress.findMany({where:{userId:user.id,status:"COMPLETED"},select:{module:{select:{path:true,title:true}}}}),
    db.goal.count({where:{userId:user.id,status:"ACTIVE"}}),
    db.activity.count({where:{userId:user.id,type:{in:["NOISE_CHECKER","SCAM_WARNING_FOUND"]}}}),
  ]);
  const counts=Object.fromEntries(financialSkills.map(skill=>[skill.key,0])) as Record<FinancialSkillKey,number>;
  for(const lesson of lessons)counts[skillForLesson(lesson.module.path,lesson.module.title)]++;
  counts.STAYING_SAFE+=safetyActivities;
  counts.PLANNING+=goals;
  counts.INVESTING_BASICS+=runs;
  counts.SAVING+=labs+posts;
  const completed=labs+posts+runs;
  return <main className="product-page youth-surface"><AppShell className="core-inner progress-shell" mode="YOUTH" active="Progress">
    <header className="core-inner-header"><Link href="/dashboard" aria-label="Back to Home"><ArrowLeft aria-hidden="true"/></Link><Brand/><Link href="/profile" aria-label="Account and settings"><Settings aria-hidden="true"/></Link></header>
    <section className="progress-heading"><span>YOUR LEARNING</span><h1>Progress means practice.</h1><p>See the financial skills you have experienced. This is learning progress—not a financial score.</p></section>
    <section className="confidence-core-card literacy-summary" aria-label={`${completed} core weekly activities completed`}><div><small>LEARN → PRACTISE → APPLY → REFLECT</small><strong>{completed<2?"Getting started":completed<5?"Building confidence":"Growing your skills"}</strong><p>{completed} core weekly activities completed</p></div><Check aria-hidden="true"/></section>
    <section className="loop-progress-grid" aria-label="Completed learning activities"><article><Check aria-hidden="true"/><strong>{labs}</strong><span>Weekly Labs</span></article><article><Flame aria-hidden="true"/><strong>{posts}</strong><span>Daily Posts</span></article><article><WalletCards aria-hidden="true"/><strong>{runs}</strong><span>Apply activities</span></article><article><Coins aria-hidden="true"/><strong>{balance}</strong><span>Spark Coins</span></article></section>
    <section className="skill-progress-list" aria-labelledby="skill-progress-title"><h2 id="skill-progress-title">Financial skills</h2><p>Activity counts show where you have practised—not how “good” you are with money.</p>{financialSkills.map(skill=><article key={skill.key}><div><strong>{skill.label}</strong><span>{skill.description}</span></div><b aria-label={`${counts[skill.key]} completed activities`}>{counts[skill.key]} <small>done</small></b></article>)}</section>
    <section className="concept-list"><h2>Concepts you’ve experienced</h2>{concepts.length?concepts.map(item=><article key={item.id}><Lightbulb aria-hidden="true"/><div><strong>{item.concept.toLowerCase()}</strong><span>Unlocked after experiencing the consequence</span></div><Check aria-hidden="true"/></article>):<article><Lightbulb aria-hidden="true"/><div><strong>No terms unlocked yet</strong><span>Complete the Weekly Lab to reveal the first one.</span></div></article>}</section>
    <Link className="profile-settings-link" href="/profile">Account and settings</Link>
  </AppShell></main>;
}
