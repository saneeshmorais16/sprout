import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Brand } from "@/components/brand";
export default function AuthLayout({ children }: { children: React.ReactNode }) { return <main className="auth-page"><div className="auth-shell"><header><Link className="icon-button" href="/"><ArrowLeft/></Link><Brand/><span/></header>{children}</div><aside className="auth-aside"><Brand/><h2>Money confidence should feel possible.</h2><p>Clear lessons, safe practice and guidance that changes with your age.</p></aside></main>; }
