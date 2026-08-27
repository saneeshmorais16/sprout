import Link from "next/link";
import {ArrowLeft,ShieldCheck} from "lucide-react";
import {notFound,redirect} from "next/navigation";
import {AppShell} from "@/components/app-shell";
import {Brand} from "@/components/brand";
import {GrowDecisionLab} from "@/components/grow-decision-lab";
import {requireUser} from "@/lib/auth";
import {getDecisionScenario} from "@/lib/decision-lab";

type PageProps={params:Promise<{topic:string}>};
export default async function DecisionPracticePage({params}:PageProps){const user=await requireUser();const profile=user.profile;if(!profile?.ageGroup)redirect("/onboarding");const{topic}=await params;const scenario=getDecisionScenario(topic,profile.ageGroup as "YOUTH"|"YOUNG_ADULT");if(!scenario)notFound();return <main className={`product-page ${profile.ageGroup==="YOUTH"?"youth-surface":"adult-surface"}`}><AppShell className="inner-shell decision-shell" mode={profile.ageGroup as "YOUTH"|"YOUNG_ADULT"} active="Practice"><header className="inner-header"><Link href="/practice" className="icon-button" aria-label="Back to Practice"><ArrowLeft/></Link><Brand/><span className="xp-pill">+{scenario.xp} XP</span></header><section className="decision-page-heading"><span>{scenario.eyebrow}</span><h1>Learn it. Practise it. Grow.</h1><p>{profile.ageGroup==="YOUTH"?"A short, clear choice with a simple consequence.":"A practical scenario with deeper commitments and longer-term trade-offs."}</p></section><GrowDecisionLab scenario={scenario}/><section className="practice-boundary"><ShieldCheck/><p><strong>Safe fictional practice</strong>No real account, money or product is involved. This is education, not personal financial advice.</p></section></AppShell></main>}
