import { NextResponse } from "next/server";
import { z } from "zod";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { sameOrigin } from "@/lib/security";
import { contentStatusSchema } from "@/lib/validation";

const contentSchema = z.object({
  id: z.string().optional(),
  kind: z.enum(["module", "feed", "wire"]),
  title: z.string().trim().min(3).max(120),
  summary: z.string().trim().min(10).max(700),
  ageGroup: z.literal("YOUTH"),
  category: z.string().trim().min(2).max(80),
  route: z.string().trim().min(1).max(160),
  detail: z.string().trim().min(10).max(1200),
  secondary: z.string().trim().max(1200).default(""),
  tertiary: z.string().trim().max(1200).default(""),
  keyTerm: z.string().trim().max(500).default(""),
  published: z.boolean().default(false),
}).strict();

async function requireEditor() {
  const user = await currentUser();
  return user && ["ADMIN", "CONTENT_EDITOR"].includes(user.role) ? user : null;
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Request rejected." }, { status: 403 });
  if (!await requireEditor()) return NextResponse.json({ error: "Not authorised." }, { status: 403 });
  const parsed = contentStatusSchema.extend({ kind: z.enum(["module", "video", "feed", "wire"]) }).strict().safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid content update." }, { status: 400 });
  const { kind, id, published } = parsed.data;
  if (kind === "module") await db.learningModule.update({ where: { id }, data: { published } });
  if (kind === "video") await db.video.update({ where: { id }, data: { published } });
  if (kind === "feed") await db.feedItem.update({ where: { id }, data: { publishedAt: published ? new Date() : null } });
  if (kind === "wire") await db.wireStory.update({ where: { id }, data: { publishedAt: published ? new Date() : null } });
  return NextResponse.json({ ok: true });
}

export async function PUT(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Request rejected." }, { status: 403 });
  if (!await requireEditor()) return NextResponse.json({ error: "Not authorised." }, { status: 403 });
  const parsed = contentSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Check the content fields." }, { status: 400 });
  const value = parsed.data;
  try {
    if (value.kind === "module") {
      const content = JSON.stringify({ objective: value.detail, explanation: value.summary, example: "Use the idea in a realistic everyday money choice.", question: { prompt: `What is a confident first step for ${value.title.toLowerCase()}?`, options: ["Pause and check the facts", "Rush because someone else did", "Assume an outcome is guaranteed"], answer: 0, explanation: "Checking the facts creates space for a calmer decision." }, takeaway: value.detail });
      const data = { title: value.title, description: value.summary, ageGroup: "YOUTH", path: value.category, slug: value.route.replace(/^\//, ""), objective: value.detail, content, published: value.published, difficulty: "Beginner", minutes: 3, xpReward: 50 };
      const item = value.id ? await db.learningModule.update({ where: { id: value.id }, data }) : await db.learningModule.create({ data: { ...data, sortOrder: 99 } });
      return NextResponse.json({ item });
    }
    if (value.kind === "feed") {
      const data = { title: value.title, summary: value.summary, ageGroup: "YOUTH", category: value.category, actionPath: value.route.startsWith("/") ? value.route : `/${value.route}`, reason: value.detail, publishedAt: value.published ? new Date() : null };
      const item = value.id ? await db.feedItem.update({ where: { id: value.id }, data }) : await db.feedItem.create({ data });
      return NextResponse.json({ item });
    }
    const data = { title: value.title, summary: value.summary, ageGroup: "YOUTH", category: value.category, slug: value.route.replace(/^\//, ""), whatHappened: value.detail, whyItMatters: value.secondary || value.detail, whatCouldAffect: value.tertiary || value.summary, keyTerm: value.keyTerm || "Key term — an important money idea explained in context.", learnMorePath: null, publishedAt: value.published ? new Date() : null, minutes: 3 };
    const item = value.id ? await db.wireStory.update({ where: { id: value.id }, data }) : await db.wireStory.create({ data });
    return NextResponse.json({ item });
  } catch {
    return NextResponse.json({ error: "That slug or content record could not be saved." }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Request rejected." }, { status: 403 });
  if (!await requireEditor()) return NextResponse.json({ error: "Not authorised." }, { status: 403 });
  const parsed = z.object({ kind: z.enum(["module", "feed", "wire"]), id: z.string().min(1) }).strict().safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid delete request." }, { status: 400 });
  const { kind, id } = parsed.data;
  if (kind === "module") await db.learningModule.delete({ where: { id } });
  if (kind === "feed") await db.feedItem.delete({ where: { id } });
  if (kind === "wire") await db.wireStory.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
