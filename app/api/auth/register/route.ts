import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { createSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { noStoreHeaders, rateLimit, requestIp, sameOrigin } from "@/lib/security";
import { registerSchema } from "@/lib/validation";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Request rejected." }, { status: 403, headers: noStoreHeaders() });
  if (!rateLimit(`register:${requestIp(request)}`, 5, 15 * 60_000)) return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429, headers: noStoreHeaders() });
  const parsed = registerSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Check your details." }, { status: 400, headers: noStoreHeaders() });
  const exists = await db.user.findUnique({ where: { email: parsed.data.email }, select: { id: true } });
  if (exists) return NextResponse.json({ error: "We couldn’t create that account. Check your details or sign in." }, { status: 400, headers: noStoreHeaders() });
  const passwordHash = await hash(parsed.data.password, 12);
  const user = await db.user.create({ data: { email: parsed.data.email, passwordHash, profile: { create: { firstName: parsed.data.firstName } } } });
  await createSession(user.id);
  return NextResponse.json({ ok: true, next: "/onboarding" }, { headers: noStoreHeaders() });
}
