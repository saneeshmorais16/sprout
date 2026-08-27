import Link from "next/link";
import {ArrowLeft} from "lucide-react";
import {Brand} from "@/components/brand";
import {NoiseChecker} from "@/components/noise-checker";
import {requireUser} from "@/lib/auth";
import {db} from "@/lib/db";
import {redirect} from "next/navigation";
export default async function NoiseCheckerPage(){const user=await requireUser();const profile=user.profile;if(!profile?.ageGroup)redirect("/onboarding");const done=await db.activity.findFirst({where:{userId:user.id,type:"NOISE_CHECKER"}});const ageGroup=profile.ageGroup as "YOUTH"|"YOUNG_ADULT";return <main className={`product-page ${ageGroup==="YOUTH"?"youth-surface":"adult-surface"}`}><div className="mobile-shell dashboard-shell lesson-shell"><header className="inner-header"><Link href="/explore" className="icon-button" aria-label="Back to Explore"><ArrowLeft/></Link><Brand/><span className="xp-pill">{profile.xp} XP</span></header><NoiseChecker alreadyComplete={Boolean(done)} ageGroup={ageGroup} soundsEnabled={profile.sprigSounds}/></div></main>}
