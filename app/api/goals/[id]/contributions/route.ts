import { NextResponse } from "next/server";
import { currentUser,OwnershipError,requireOwnership } from "@/lib/auth";
import { db } from "@/lib/db";
import { sameOrigin } from "@/lib/security";
import { contributionSchema,recordIdSchema } from "@/lib/validation";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: RouteContext) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Request rejected." }, { status: 403 });
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const parsedId=recordIdSchema.safeParse((await params).id);if(!parsedId.success)return NextResponse.json({error:"Goal not found."},{status:404});const id=parsedId.data;
  const parsed = contributionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Enter an amount above zero." }, { status: 400 });
  try{await requireOwnership(user.id,userId=>db.goal.findFirst({where:{id,userId}}))}catch(error){if(error instanceof OwnershipError)return NextResponse.json({error:"Goal not found."},{status:404});throw error}
  const amountPence = Math.round(parsed.data.amount * 100);
  const result = await db.$transaction(async (tx) => {
    const contribution = await tx.goalContribution.create({ data: { goalId: id, amountPence } });
    const goal = await tx.goal.update({ where: { id }, data: { savedPence: { increment: amountPence } } });
    await tx.activity.create({ data: { userId: user.id, type: "GOAL_UPDATED", metadata: JSON.stringify({ goalId: id }) } });
    return { goal, contribution };
  });
  return NextResponse.json(result, { status: 201 });
}
