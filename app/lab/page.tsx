import Link from "next/link";
import {ArrowLeft,FlaskConical} from "lucide-react";
import {AppShell} from "@/components/app-shell";
import {Brand} from "@/components/brand";
import {WeeklyLabPlayer} from "@/components/weekly-lab-player";
import {requireUser} from "@/lib/auth";
import {db} from "@/lib/db";
import {redirect} from "next/navigation";

export default async function LabPage(){
  const user=await requireUser();
  const profile=user.profile;
  if(!profile?.age||profile.age<15||profile.age>18||profile.ageGroup!=="YOUTH")redirect("/onboarding");
  const [lab,upcoming]=await Promise.all([
    db.weeklyLab.findUnique({where:{slug:"the-20-head-start"},include:{progress:{where:{userId:user.id}}}}),
    db.weeklyLab.findMany({where:{published:true,slug:{not:"the-20-head-start"}},orderBy:{createdAt:"asc"},take:5}),
  ]);
  if(!lab)throw new Error("Weekly Lab seed is missing.");
  const mode="YOUTH" as const;
  return <main className="product-page youth-surface"><AppShell className="core-inner" mode={mode} active="Learn">
    <header className="core-inner-header"><Link href="/dashboard" aria-label="Back to Home"><ArrowLeft aria-hidden="true"/></Link><Brand/><span><FlaskConical aria-hidden="true"/> LAB</span></header>
    <section className="lab-heading"><span>MONDAY · WEEKLY LAB</span><h1>{lab.title}</h1><p>Experience the idea first. The name comes later.</p></section>
    <WeeklyLabPlayer initialStep={lab.progress[0]?.step??0} ageGroup={mode} soundsEnabled={profile.sprigSounds}/>
    <section className="lab-roadmap" aria-labelledby="lab-roadmap-title"><div><small>FINANCIAL LITERACY ROADMAP</small><h2 id="lab-roadmap-title">More decisions you’ll experience</h2><p>Each Lab starts with a situation and reveals the term only after the consequence.</p></div>{upcoming.map((item,index)=><article key={item.id}><span>{index+2}</span><div><h3>{item.title}</h3><p>{item.summary}</p></div><b>Coming up</b></article>)}</section>
  </AppShell></main>;
}
