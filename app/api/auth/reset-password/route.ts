import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rateLimit, requestIp, sameOrigin, tokenHash } from "@/lib/security";
import { resetSchema } from "@/lib/validation";
export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Request rejected." }, { status: 403 });
  if (!rateLimit(`reset:${requestIp(request)}`, 6, 15 * 60_000)) return NextResponse.json({ error: "Please wait before trying again." }, { status: 429 });
  const parsed = resetSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid request." }, { status: 400 });
  const record = await db.passwordResetToken.findUnique({ where: { tokenHash: tokenHash(parsed.data.token) } });
  if (!record || record.usedAt || record.expiresAt <= new Date()) return NextResponse.json({ error: "This reset link is invalid or has expired." }, { status: 400 });
  const passwordHash=await hash(parsed.data.password,12);
  const consumed=await db.$transaction(async tx=>{const used=await tx.passwordResetToken.updateMany({where:{id:record.id,usedAt:null,expiresAt:{gt:new Date()}},data:{usedAt:new Date()}});if(used.count!==1)return false;await tx.user.update({where:{id:record.userId},data:{passwordHash}});await tx.session.deleteMany({where:{userId:record.userId}});return true});
  if(!consumed)return NextResponse.json({error:"This reset link is invalid or has expired."},{status:400});
  return NextResponse.json({ ok: true });
}
