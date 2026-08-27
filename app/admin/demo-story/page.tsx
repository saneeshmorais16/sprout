import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, Clock3, ShieldCheck } from "lucide-react";
import { Brand } from "@/components/brand";
import { requireRole } from "@/lib/auth";

const beats=[
  ["01","Home","Show Sprout, 300 Spark Coins, the streak, Today’s Post and This Week’s Lab.","/dashboard","Open Maya’s Home"],
  ["02","Monday — Weekly Lab","Experience two £20-a-week timelines before the term is revealed.","/lab","Start The £20 Head Start"],
  ["03","Three grounded actions","Use Explain this, Why did this happen? and Quiz me. Each cites retrieved GROW curriculum.","/lab","Show grounded help"],
  ["04","Wednesday — Daily Post","Make one short decision that reinforces the same concept.","/daily","Make today’s decision"],
  ["05","Help Me Think","On Steady versus Adventure, show neutral questions about purpose, timing and uncertainty—not a recommendation.","/portfolio","Compare the paths"],
  ["06","Ask Sprout","Ask a short question covered by the seeded curriculum and show its citation.","/portfolio","Ask one question"],
  ["07","Provider outage fallback","Maya’s Presenter Mode always uses deterministic curriculum fallbacks, so this beat makes zero live provider calls and the UI remains complete.","/portfolio","Show the fallback"],
  ["08","Hold or Move Out","Choose once, then reveal the historical chosen outcome and the road not taken.","/portfolio","Show both outcomes"],
  ["09","Progress","Finish on evidence-based learning progress. Spark Coins and progress were never writable by Sprout.","/progress","Finish on progress"],
] as const;

export default async function DemoStoryPage(){
  await requireRole(["ADMIN"]);
  return <main className="demo-story-page"><header><Link href="/admin" className="icon-button" aria-label="Back to Presenter Mode"><ArrowLeft/></Link><Brand/><span><ShieldCheck/> ADMIN ONLY</span></header><section className="demo-story-hero"><div><span>JUDGE-READY WALKTHROUGH</span><h1>The GROW loop in 90 seconds</h1><p>Weekly Lab → Daily Post → Practice Portfolio. Experience the idea, reinforce it, then apply it safely.</p></div><div><Clock3/><strong>9 beats</strong><span>≈ 90 seconds</span></div></section><ol className="demo-story-list">{beats.map(([number,title,copy,path,cta])=><li key={number}><i>{number}</i><div><h2>{title}</h2><p>{copy}</p></div><Link href={path}>{cta}<ArrowRight/></Link></li>)}</ol><footer><CheckCircle2/><p><strong>Finish with the message:</strong> Young people practise financial decisions before those decisions become real.</p></footer></main>;
}

