import { NextResponse } from "next/server";
import { destroySession } from "@/lib/auth";
import { sameOrigin } from "@/lib/security";
export async function POST(request: Request) { if (!sameOrigin(request)) return NextResponse.json({ error: "Request rejected." }, { status: 403 }); await destroySession(); return NextResponse.json({ ok: true }); }
