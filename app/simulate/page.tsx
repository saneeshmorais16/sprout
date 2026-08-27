import Link from "next/link";
import { ArrowLeft, Info } from "lucide-react";
import { InvestmentPracticeSimulator } from "@/components/investment-practice-simulator";
import { AppShell } from "@/components/app-shell";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function SimulatePage(){
  const user=await requireUser();const profile=user.profile;if(!profile?.ageGroup||!profile.age)redirect("/onboarding");
  const runs=await db.simulationRun.findMany({where:{userId:user.id},orderBy:{createdAt:"desc"},take:3});const history=runs.map(item=>({id:item.id,createdAt:item.createdAt.toISOString(),scenarioId:item.scenarioId,endingValue:item.endingValue,duration:item.duration}));
  return <main className={`product-page ${profile.ageGroup==="YOUTH"?"youth-surface":"adult-surface"}`}><AppShell className="inner-shell simulator-shell reference-simulator" mode={profile.ageGroup as "YOUTH"|"YOUNG_ADULT"} active="Practice"><header className="reference-header simulator-header"><Link href="/practice" className="icon-button" aria-label="Back to Practice"><ArrowLeft/></Link><div><h1>Investment Simulator</h1></div><span className="sim-info" title="Educational simulation only"><Info/></span></header><InvestmentPracticeSimulator mode={profile.ageGroup as "YOUTH"|"YOUNG_ADULT"} history={history}/></AppShell></main>;
}
