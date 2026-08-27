import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Brand } from "@/components/brand";
import { PayslipDecoder } from "@/components/payslip-decoder";
import { requireUser } from "@/lib/auth";
import { redirect } from "next/navigation";
export default async function PayslipPage(){const user=await requireUser();if(!user.profile?.ageGroup)redirect("/onboarding");if(user.profile.ageGroup!=="YOUNG_ADULT")redirect("/dashboard");return <main className="product-page adult-surface"><div className="mobile-shell dashboard-shell lesson-shell"><header className="inner-header"><Link href="/dashboard" className="icon-button" aria-label="Back to home"><ArrowLeft/></Link><Brand/><span className="xp-pill">{user.profile.xp} XP</span></header><PayslipDecoder/></div></main>}
