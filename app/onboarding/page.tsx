import { redirect } from "next/navigation";
import { AgeOnboarding } from "@/components/age-onboarding";
import { Brand } from "@/components/brand";
import { isSupportedLearner, requireUser } from "@/lib/auth";
export default async function OnboardingPage() { const user = await requireUser(); if (isSupportedLearner(user.profile)) redirect("/dashboard"); return <main className="product-page"><div className="mobile-shell onboarding-shell"><header><Brand/><span className="status-chip">Personalised learning</span></header><AgeOnboarding/></div></main>; }
