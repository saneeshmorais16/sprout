import Link from "next/link";
import {ArrowLeft} from "lucide-react";
import {Brand} from "@/components/brand";
import {BudgetDecisionSimulator} from "@/components/budget-decision-simulator";
import { AppShell } from "@/components/app-shell";
import {requireUser} from "@/lib/auth";
import {redirect} from "next/navigation";
export default async function BudgetPracticePage(){const user=await requireUser();const profile=user.profile;if(!profile?.ageGroup)redirect("/onboarding");return <main className={`product-page ${profile.ageGroup==="YOUTH"?"youth-surface":"adult-surface"}`}><AppShell className="inner-shell budget-shell" mode={profile.ageGroup as "YOUTH"|"YOUNG_ADULT"} active="Practice"><header className="inner-header"><Link href="/practice" className="icon-button" aria-label="Back to Practice"><ArrowLeft/></Link><Brand/><span className="xp-pill">Decision practice</span></header><section className="budget-page-heading"><span>LEARN → DECIDE → REFLECT</span><h1>Can you make it to payday?</h1><p>There is no perfect month. Explore the trade-offs, see the server-calculated consequence, then reflect.</p></section><BudgetDecisionSimulator mode={profile.ageGroup as "YOUTH"|"YOUNG_ADULT"}/></AppShell></main>}
