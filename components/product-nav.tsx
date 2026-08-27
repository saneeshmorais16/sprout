import Link from "next/link";
import { BookOpen, ChartNoAxesColumnIncreasing, Home, PiggyBank, WalletCards } from "lucide-react";
export function ProductNav({ active = "Home" }: { mode: "YOUTH" | "YOUNG_ADULT"; active?: string }) { const items=[["Home","/dashboard",Home],["Learn","/learn",BookOpen],["Practice","/portfolio",WalletCards],["Progress","/progress",ChartNoAxesColumnIncreasing]] as const; return <nav className="product-nav" aria-label="Primary navigation">{items.map(([label,href,Icon])=><Link key={label} href={href} aria-current={active===label?"page":undefined} className={active===label?"active":""}><Icon aria-hidden="true"/><span>{label}</span></Link>)}</nav>; }
export function GoalIcon(){return <PiggyBank aria-hidden="true"/>}
