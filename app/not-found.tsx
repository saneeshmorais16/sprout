import Link from "next/link";
import { ArrowLeft, Sprout } from "lucide-react";
import { Brand } from "@/components/brand";
export default function NotFound(){return <main className="product-page youth-surface"><div className="mobile-shell section-shell"><header><span/><Brand/><span/></header><div className="empty-illustration"><Sprout/></div><span className="page-kicker">Nothing growing here yet</span><h1>We couldn’t find that page</h1><p>The lesson or story may have moved, been unpublished, or never existed.</p><Link className="hero-cta" href="/dashboard"><ArrowLeft/> Return to GROW</Link></div></main>}
