import { compare } from "bcryptjs";
import { NextResponse } from "next/server";
import { createSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { noStoreHeaders, rateLimit, requestIp, sameOrigin } from "@/lib/security";
import { loginSchema } from "@/lib/validation";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Request rejected." }, { status: 403 });
  if (!rateLimit(`login:${requestIp(request)}`, 8, 15 * 60_000)) return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
  const parsed = loginSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Email or password is incorrect." }, { status: 401, headers: noStoreHeaders() });
  const user = await db.user.findUnique({ where: { email: parsed.data.email } });
  if (!user || !(await compare(parsed.data.password, user.passwordHash))) return NextResponse.json({ error: "Email or password is incorrect." }, { status: 401, headers: noStoreHeaders() });
  await createSession(user.id);
  return NextResponse.json({ ok: true, next: user.role === "ADMIN" ? "/admin" : user.role === "CONTENT_EDITOR" ? "/content" : "/dashboard" }, { headers: noStoreHeaders() });
}
