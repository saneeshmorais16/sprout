import Link from "next/link";
import {ArrowRight,Bell,BookOpen,CalendarDays,Coins,Flame,Menu} from "lucide-react";
import {AppShell} from "@/components/app-shell";
import {Brand} from "@/components/brand";
import {SproutCompanion} from "@/components/sprout";
import {requireUser} from "@/lib/auth";
import {db} from "@/lib/db";
import {deriveLearningJourney,learningLevels} from "@/lib/learning-levels";
import {sparkCoinBalance} from "@/lib/spark-coins";
import {getPracticeRecommendations} from "@/lib/practice-recommendations";
import {redirect} from "next/navigation";

export default async function DashboardPage(){
  const user=await requireUser();
  const profile=user.profile;
  if(!profile?.age||profile.age<15||profile.age>18||profile.ageGroup!=="YOUTH")redirect("/onboarding");
  const ageGroup="YOUTH" as const;
  const configuredSlugs=learningLevels.flatMap(level=>level.lessons.map(lesson=>lesson.slug));
  const [lab,post,balance,recommendations,modules]=await Promise.all([
    db.weeklyLab.findFirst({where:{slug:"the-20-head-start",published:true},include:{progress:{where:{userId:user.id}}}}),
    db.dailyPost.findFirst({where:{slug:"head-start-reinforcement",published:true},include:{progress:{where:{userId:user.id}}}}),
    sparkCoinBalance(user.id),
    getPracticeRecommendations(user.id,ageGroup,profile.interests),
    db.learningModule.findMany({where:{ageGroup,published:true,slug:{in:configuredSlugs}},include:{progress:{where:{userId:user.id}}}}),
  ]);
  if(!lab||!post)throw new Error("Core weekly learning content is missing. Run the seed.");
  const completedSlugs=new Set(modules.filter(module=>module.progress[0]?.status==="COMPLETED").map(module=>module.slug));
  const journey=deriveLearningJourney(completedSlugs);
  const currentLevel=journey.find(level=>level.state==="current")??journey.at(-1)!;
  const completedInLevel=currentLevel.lessons.filter(lesson=>lesson.state==="completed").length;
  const levelPercent=Math.round(completedInLevel/currentLevel.lessons.length*100);
  const labProgress=lab.progress[0]?.step??0;
  const postDone=Boolean(post.progress[0]);
  const labComplete=labProgress===3;
  const day=profile.demoDay;
  const sproutLine=day==="FRIDAY"
    ?"This is where you apply the week’s idea. Watch what the path does next."
    :postDone
      ?"That choice reinforced this week’s idea. Progress comes from the reflection."
      :"This week is about time. Make one choice, then see what changes.";

  return <main className="product-page youth-surface"><AppShell className="core-home" mode={ageGroup} active="Home">
    <header className="core-topbar"><Link href="/profile" className="topbar-action" aria-label="Open account and settings"><Menu/></Link><Brand/><button className="topbar-action" aria-label="Notifications"><Bell/></button></header>
    <section className="core-welcome"><div><span>{day} · THIS WEEK</span><h1>Hey {profile.firstName}! <span>👋</span></h1><p>Learn → Decide → See what happens</p></div><SproutCompanion event="SPROUT_APPEARED" ageGroup={ageGroup} context={{customMessage:sproutLine}} reactionKey={`core-home-${day}-${postDone}`} soundsEnabled={profile.sprigSounds}/></section>
    <section className="core-stats" aria-label="Learning status"><div aria-label={`${balance} Spark Coins`}><Coins aria-hidden="true"/><span><b>{balance}</b><small>Spark Coins</small></span></div><div aria-label={`${profile.streak} day learning streak`}><Flame aria-hidden="true"/><span><b>{profile.streak} days</b><small>Learning streak</small></span></div></section>
    <section className="today-post-section"><div className="core-section-title"><span>{labComplete?"Today’s Decision":"Start This Week"}</span><small>{labComplete?"1–3 min":"Monday Lab"}</small></div><Link href={labComplete?"/daily":"/lab"} className={`today-post-primary ${postDone?"done":""}`}><div><span>{labComplete?(postDone?"COMPLETED TODAY":"ONE DECISION"):"EXPERIENCE FIRST"}</span><h2>{labComplete?post.title:lab.title}</h2><p>{labComplete?(postDone?"You’re done for today. Continue when the next reinforcement is ready.":post.prompt):"Start two £20 monthly timelines. The financial term stays hidden until after the consequence."}</p><small className="core-recommendation-reason"><b>Why am I seeing this?</b> Connected to this week’s concept and your current level. {recommendations[0]?.reason}</small><strong>{labComplete?(postDone?"Review your answer":"Make today’s decision"):"Start the Weekly Lab"}<ArrowRight/></strong></div><CalendarDays aria-hidden="true"/></Link></section>
    <section className="weekly-lab-section"><div className="core-section-title"><span>This Week’s Lab</span><small>{labProgress===3?"Complete":`${labProgress} of 3 steps`}</small></div><Link href="/lab" className="weekly-lab-card"><div className="lab-orbit" aria-hidden="true"><i/><i/><span>£20</span></div><div><small>EXPERIENCE FIRST</small><h2>{lab.title}</h2><p>{lab.summary}</p><div className="core-progress" aria-label={`${Math.round(labProgress/3*100)}% complete`}><i style={{width:`${Math.round(labProgress/3*100)}%`}}/></div></div><ArrowRight aria-hidden="true"/></Link></section>
    <section className="current-skill-card" aria-labelledby="current-level-heading"><BookOpen aria-hidden="true"/><div><small>CURRENT LEVEL · {currentLevel.number} OF {journey.length}</small><h2 id="current-level-heading">{currentLevel.title}</h2><p>{completedInLevel} of {currentLevel.lessons.length} activities complete</p><div className="core-progress" aria-label={`${levelPercent}% of this level complete`}><i style={{width:`${levelPercent}%`}}/></div></div><Link href="/learn" aria-label={`Open Level ${currentLevel.number}, ${currentLevel.title}`}>Open path <ArrowRight aria-hidden="true"/></Link></section>
    <p className="spark-boundary"><Coins aria-hidden="true"/> Spark Coins are virtual, not redeemable and usable only in GROW’s educational portfolio.</p>
  </AppShell></main>;
}
