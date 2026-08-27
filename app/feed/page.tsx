import Link from "next/link";
import { ArrowLeft, Layers3 } from "lucide-react";
import { Brand } from "@/components/brand";
import { FeedCards } from "@/components/feed-cards";
import { AppShell } from "@/components/app-shell";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
export default async function FeedPage(){const user=await requireUser();const profile=user.profile;if(!profile?.ageGroup)redirect("/onboarding");let items=await db.feedItem.findMany({where:{ageGroup:profile.ageGroup,publishedAt:{not:null}},orderBy:{createdAt:"asc"}});if(profile.contentLevel==="FOUNDATIONAL")items=items.sort((a,b)=>Number(a.category==="Investing Basics")-Number(b.category==="Investing Basics"));return <main className={`product-page ${profile.ageGroup==="YOUTH"?"youth-surface":"adult-surface"}`}><AppShell className="inner-shell" mode={profile.ageGroup as "YOUTH"|"YOUNG_ADULT"} active="Learn"><header className="inner-header"><Link href="/dashboard" className="icon-button" aria-label="Back to home"><ArrowLeft/></Link><Brand/><span className="xp-pill">{profile.contentLevel?.replace("_"," ")}</span></header><section className="page-title-row feed-heading"><div><span className="page-kicker"><Layers3/> Your feed</span><h1>{profile.ageGroup==="YOUTH"?"Money moments to try":"Ideas for real-life money"}</h1><p>Recommendations use clear rules based on your age and recent learning.</p></div></section><FeedCards items={items} adult={profile.ageGroup==="YOUNG_ADULT"}/></AppShell></main>}
