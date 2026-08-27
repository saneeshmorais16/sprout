import { NextResponse } from "next/server";
import { z } from "zod";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { rateLimit, requestIp, sameOrigin } from "@/lib/security";
import { detectMedia, mediaStorage } from "@/lib/storage";

const metadata = z.object({ title: z.string().trim().min(3).max(100), description: z.string().trim().min(10).max(600), category: z.enum(["Saving", "Budgeting", "Banking", "Scams", "First Pay", "Investing Basics", "Credit", "Pensions", "Financial News"]), ageGroup: z.literal("YOUTH"), difficulty: z.enum(["Beginner", "Foundational", "Intermediate"]), duration: z.coerce.number().int().min(10).max(3600), transcript: z.string().trim().min(20).max(20000), keyTakeaway: z.string().trim().min(5).max(500), published: z.enum(["true", "false"]) }).strict();

export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Request rejected." }, { status: 403 });
  const user = await currentUser();
  if (!user || !["ADMIN", "CONTENT_EDITOR"].includes(user.role)) return NextResponse.json({ error: "Not authorised." }, { status: 403 });
  if (!rateLimit(`video-upload:${user.id}:${requestIp(request)}`, 8, 60 * 60_000)) return NextResponse.json({ error: "Upload limit reached. Try again later." }, { status: 429 });
  const form = await request.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "Upload data is invalid." }, { status: 400 });
  const parsed = metadata.safeParse(Object.fromEntries(["title", "description", "category", "ageGroup", "difficulty", "duration", "transcript", "keyTakeaway", "published"].map((key) => [key, String(form.get(key) || "")])));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Check the video details." }, { status: 400 });
  const video = form.get("video");
  const thumbnail = form.get("thumbnail");
  if (!(video instanceof File) || !video.size) return NextResponse.json({ error: "Choose a video file." }, { status: 400 });
  if (video.size > 100 * 1024 * 1024) return NextResponse.json({ error: "Video files must be 100 MB or smaller." }, { status: 400 });
  const videoBytes = new Uint8Array(await video.arrayBuffer());
  const videoType = detectMedia(videoBytes, video.type, video.name, "video");
  if (!videoType) return NextResponse.json({ error: "Use a genuine MP4 or WebM video file." }, { status: 400 });
  let thumbnailStored: null | Awaited<ReturnType<typeof mediaStorage.save>> = null;
  if (thumbnail instanceof File && thumbnail.size) {
    if (thumbnail.size > 5 * 1024 * 1024) return NextResponse.json({ error: "Thumbnail files must be 5 MB or smaller." }, { status: 400 });
    const bytes = new Uint8Array(await thumbnail.arrayBuffer());
    const imageType = detectMedia(bytes, thumbnail.type, thumbnail.name, "image");
    if (!imageType) return NextResponse.json({ error: "Use a genuine PNG, JPEG or WebP thumbnail." }, { status: 400 });
    thumbnailStored = await mediaStorage.save(bytes, imageType.extension, imageType.mimeType);
  }
  const stored = await mediaStorage.save(videoBytes, videoType.extension, videoType.mimeType);
  const item = await db.video.create({ data: { title: parsed.data.title, description: parsed.data.description, category: parsed.data.category, ageGroup: "YOUTH", difficulty: parsed.data.difficulty, durationSeconds: parsed.data.duration, transcript: parsed.data.transcript, keyTakeaway: parsed.data.keyTakeaway, published: parsed.data.published === "true", sourceUrl: stored.url, storageKey: stored.key, thumbnailUrl: thumbnailStored?.url, fileSize: stored.bytes, mimeType: stored.mimeType, createdById: user.id } });
  return NextResponse.json({ video: item }, { status: 201 });
}
