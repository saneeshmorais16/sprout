import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { sameOrigin } from "@/lib/security";
import { avatarSchema } from "@/lib/validation";

const accessoryXp: Record<string, number> = { NONE: 0, GLASSES: 0, HEADPHONES: 250, BACKPACK: 500, SCARF: 750, GRADUATION_CAP: 1000 };

export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Request rejected." }, { status: 403 });
  const user = await currentUser();
  if (!user?.profile) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const parsed = avatarSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Choose a valid GROW character." }, { status: 400 });
  if ((accessoryXp[parsed.data.accessory] ?? Infinity) > user.profile.xp) return NextResponse.json({ error: "Keep learning to unlock that accessory." }, { status: 403 });
  const avatar = await db.userAvatar.upsert({ where: { userId: user.id }, update: parsed.data, create: { userId: user.id, ...parsed.data } });
  return NextResponse.json({ avatar });
}
