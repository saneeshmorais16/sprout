import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Brand } from "@/components/brand";
import { GoalsExperience } from "@/components/goals-experience";
import { AppShell } from "@/components/app-shell";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

const renderReferenceTime = Date.now();

export default async function GoalsPage() {
  const user = await requireUser(); const profile = user.profile;
  if (!profile?.ageGroup) redirect("/onboarding");
  
  const goals = await db.goal.findMany({ where: { userId: user.id }, include: { contributions: { orderBy: { createdAt: "desc" }, take: 12 } }, orderBy: { createdAt: "desc" } });
  const initialGoals = goals.map(goal => ({ ...goal, targetDate: goal.targetDate?.toISOString() || null, createdAt: goal.createdAt.toISOString(), updatedAt: goal.updatedAt.toISOString(), contributions: goal.contributions.map(item => ({ ...item, createdAt: item.createdAt.toISOString() })) }));
  return <main className={`product-page ${profile.ageGroup === "YOUTH" ? "youth-surface" : "adult-surface"}`}><AppShell className="inner-shell" mode={profile.ageGroup as "YOUTH"|"YOUNG_ADULT"} active="Goals"><header className="inner-header"><Link href="/dashboard" className="icon-button" aria-label="Back to home"><ArrowLeft/></Link><Brand/><span/></header><GoalsExperience initialGoals={initialGoals} now={renderReferenceTime}/></AppShell></main>;
}
