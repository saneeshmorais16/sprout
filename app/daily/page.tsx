import Link from "next/link";
import {ArrowLeft,CalendarDays} from "lucide-react";
import {AppShell} from "@/components/app-shell";
import {Brand} from "@/components/brand";
import {DailyPostPlayer} from "@/components/daily-post-player";
import {requireUser} from "@/lib/auth";
import {db} from "@/lib/db";
import {redirect} from "next/navigation";
import {COMPOUNDING_DAILY_POSTS} from "@/lib/weekly-loop";

export default async function DailyPage(){
  const user=await requireUser();const profile=user.profile;
  if(!profile?.age||profile.age<15||profile.age>18||profile.ageGroup!=="YOUTH")redirect("/onboarding");
  const [rows,lab]=await Promise.all([
    db.dailyPost.findMany({where:{slug:{in:COMPOUNDING_DAILY_POSTS.map(post=>post.slug)},published:true},include:{progress:{where:{userId:user.id}}}}),
    db.weeklyLab.findUnique({where:{slug:"the-20-head-start"},include:{progress:{where:{userId:user.id}}}}),
  ]);
  if(lab?.progress[0]?.step!==3)redirect("/lab");
  const ordered=COMPOUNDING_DAILY_POSTS.map(definition=>({definition,row:rows.find(row=>row.slug===definition.slug)}));
  if(ordered.some(item=>!item.row))throw new Error("Daily Practice seed is missing.");
  const activeIndex=ordered.findIndex(item=>!item.row!.progress[0]);
  const index=activeIndex===-1?ordered.length-1:activeIndex;
  const active=ordered[index];const progress=active.row!.progress[0];const mode="YOUTH" as const;
  return <main className="product-page youth-surface"><AppShell className="core-inner daily-shell" mode={mode} active="Home"><header className="core-inner-header"><Link href="/dashboard" aria-label="Back to Home"><ArrowLeft aria-hidden="true"/></Link><Brand/><span><CalendarDays aria-hidden="true"/> DAILY PRACTICE</span></header><DailyPostPlayer definition={active.definition} initial={progress?{choice:progress.choice,feedback:progress.feedback}:null} isFinal={index===ordered.length-1} ageGroup={mode} soundsEnabled={profile.sprigSounds}/></AppShell></main>
}
