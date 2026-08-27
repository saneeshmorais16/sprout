import { NextResponse } from "next/server";
import { currentUser,OwnershipError,requireOwnership } from "@/lib/auth";
import { db } from "@/lib/db";
import { sameOrigin } from "@/lib/security";
import { goalUpdateSchema,recordIdSchema } from "@/lib/validation";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: RouteContext) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Request rejected." }, { status: 403 });
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const parsedId=recordIdSchema.safeParse((await params).id);if(!parsedId.success)return NextResponse.json({error:"Goal not found."},{status:404});const id=parsedId.data;
  try{await requireOwnership(user.id,userId=>db.goal.findFirst({where:{id,userId}}))}catch(error){if(error instanceof OwnershipError)return NextResponse.json({error:"Goal not found."},{status:404});throw error}
  const parsed = goalUpdateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Check your changes." }, { status: 400 });
  const input = parsed.data;
  const goal = await db.goal.update({ where: { id }, data: {
    ...(input.title !== undefined && { title: input.title }),
    ...(input.category !== undefined && { category: input.category }),
    ...(input.targetAmount !== undefined && { targetPence: Math.round(input.targetAmount * 100) }),
    ...(input.currentAmount !== undefined && { savedPence: Math.round(input.currentAmount * 100) }),
    ...(input.targetDate !== undefined && { targetDate: input.targetDate ? new Date(`${input.targetDate}T12:00:00Z`) : null }),
  } });
  return NextResponse.json({ goal });
}

export async function DELETE(request: Request, { params }: RouteContext) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Request rejected." }, { status: 403 });
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const parsedId=recordIdSchema.safeParse((await params).id);if(!parsedId.success)return NextResponse.json({error:"Goal not found."},{status:404});const id=parsedId.data;
  const result = await db.goal.deleteMany({ where: { id, userId: user.id } });
  if (!result.count) return NextResponse.json({ error: "Goal not found." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
