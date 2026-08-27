import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendResetEmail } from "@/lib/email";
import { noStoreHeaders, rateLimit, requestIp, sameOrigin, secureToken, tokenHash } from "@/lib/security";
import { forgotSchema } from "@/lib/validation";
export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Request rejected." }, { status: 403 });
  if (!rateLimit(`forgot:${requestIp(request)}`, 4, 60 * 60_000)) return NextResponse.json({ error: "Please wait before trying again." }, { status: 429 });
  const parsed = forgotSchema.safeParse(await request.json().catch(() => null));
  if (parsed.success) {
    const user = await db.user.findUnique({ where: { email: parsed.data.email } });
    if (user) { const token = secureToken(); await db.passwordResetToken.create({ data: { userId: user.id, tokenHash: tokenHash(token), expiresAt: new Date(Date.now() + 60 * 60_000) } }); await sendResetEmail({ to: user.email, token }).catch(() => null); }
  }
  return NextResponse.json({ ok: true, message: "If an account matches, a reset link has been sent." }, { headers: noStoreHeaders() });
}
