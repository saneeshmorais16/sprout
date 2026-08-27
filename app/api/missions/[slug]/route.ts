import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { completeMission } from "@/lib/missions";
import { sameOrigin } from "@/lib/security";
import { missionCompleteSchema } from "@/lib/validation";

export async function POST(request: Request, context: { params: Promise<{ slug: string }> }) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Request rejected." }, { status: 403 });
  const user = await currentUser(); if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const parsed = missionCompleteSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Mission evidence is not valid." }, { status: 400 });
  const { slug } = await context.params;if(slug!=="market-drop")return NextResponse.json({error:"This mission is completed through its verified learning activity."},{status:400});const result = await completeMission(user.id, slug);
  if (!result.completed) return NextResponse.json({ error: "Mission not found." }, { status: 404 });
  return NextResponse.json(result);
}
