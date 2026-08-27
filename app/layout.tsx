import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import "./phase3.css";
import "./phase4.css";
import "./phase5.css";
import "./phase6.css";

export async function generateMetadata():Promise<Metadata>{const requestHeaders=await headers();const host=requestHeaders.get("x-forwarded-host")||requestHeaders.get("host")||"localhost:3000";const protocol=requestHeaders.get("x-forwarded-proto")||(host.startsWith("localhost")?"http":"https");const origin=new URL(`${protocol}://${host}`);return{metadataBase:origin,title:{default:"GROW — Financial confidence",template:"%s · GROW"},description:"Financial confidence that grows with you. UK-focused financial education for ages 15–18.",openGraph:{type:"website",title:"GROW",description:"Financial confidence that grows with you.",url:origin,images:[{url:"/og-mascot.png",width:1736,height:909,alt:"GROW — Financial confidence that grows with you, with the original Sprout learning mascot."}]},twitter:{card:"summary_large_image",title:"GROW",description:"Financial confidence that grows with you.",images:["/og-mascot.png"]}}}
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="en"><body>{children}</body></html>}

