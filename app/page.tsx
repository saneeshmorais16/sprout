import Link from "next/link";
import { ArrowRight, BookOpen, ShieldCheck, Sparkles, Sprout } from "lucide-react";
import { Brand } from "@/components/brand";

export default function WelcomePage() {
  return <main className="welcome-page"><div className="ambient ambient-one"/><div className="ambient ambient-two"/><header><Brand/><Link href="/login" className="quiet-link">Sign in</Link></header><section className="welcome-content"><div className="growth-visual"><div className="growth-ring one"/><div className="growth-ring two"/><div className="growth-seed"><Sprout/></div><span className="spark a">✦</span><span className="spark b">•</span></div><span className="welcome-kicker"><Sparkles/> Learn by deciding</span><h1>Financial confidence that <em>grows with you.</em></h1><p>Learn about money by making decisions, practising safely and seeing what happens.</p><Link className="hero-cta" href="/register">Get started <ArrowRight/></Link><div className="welcome-trust"><span><BookOpen/> Age-appropriate learning</span><span><ShieldCheck/> Fictional, safe practice</span></div></section><footer>Build confidence before decisions involve real money.</footer></main>;
}
