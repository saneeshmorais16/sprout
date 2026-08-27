"use client";
import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
export default function ErrorPage({reset}:{error:Error&{digest?:string};reset:()=>void}){return <main className="product-page adult-surface"><div className="mobile-shell section-shell error-shell"><header><span/><Brand/><span/></header><div className="empty-illustration error"><AlertTriangle/></div><span className="page-kicker">A small pause</span><h1>GROW hit a snag</h1><p>Your information is still safe. Try this screen again or return to Home.</p><div className="error-actions"><Button onClick={reset}><RotateCcw/> Try again</Button><Link href="/dashboard">Return home</Link></div></div></main>}
