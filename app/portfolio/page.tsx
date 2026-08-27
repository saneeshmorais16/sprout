import Link from "next/link";
import {ArrowLeft,WalletCards} from "lucide-react";
import {AppShell} from "@/components/app-shell";
import {Brand} from "@/components/brand";
import {PracticePortfolio} from "@/components/practice-portfolio";
import {requireUser} from "@/lib/auth";
import {db} from "@/lib/db";
import {sparkCoinBalance} from "@/lib/spark-coins";
import {redirect} from "next/navigation";

export default async function PortfolioPage(){const user=await requireUser();const profile=user.profile;if(!profile?.age||profile.age<15||profile.age>18||profile.ageGroup!=="YOUTH")redirect("/onboarding");const[balance,level1,level2]=await Promise.all([sparkCoinBalance(user.id),db.portfolioRun.count({where:{userId:user.id,level:1,status:"COMPLETED"}}),db.portfolioRun.count({where:{userId:user.id,level:2,status:"COMPLETED"}})]);const mode="YOUTH" as const;return <main className="product-page youth-surface"><AppShell className="core-inner portfolio-shell" mode={mode} active="Practice"><header className="core-inner-header"><Link href="/dashboard" aria-label="Back to Home"><ArrowLeft aria-hidden="true"/></Link><Brand/><span><WalletCards aria-hidden="true"/> PRACTICE</span></header><PracticePortfolio initialBalance={balance} unlockedLevel={level2?3:level1?2:1} ageGroup={mode} soundsEnabled={profile.sprigSounds}/></AppShell></main>}
