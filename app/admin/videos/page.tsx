import Link from "next/link";
import { ArrowLeft, Video } from "lucide-react";
import { Brand } from "@/components/brand";
import { VideoUploadForm } from "@/components/video-upload-form";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
export default async function AdminVideosPage(){await requireRole(["ADMIN","CONTENT_EDITOR"]);const videos=await db.video.findMany({orderBy:{createdAt:"desc"}});return <main className="admin-page"><header><Brand/><span><Video/> VIDEO STUDIO</span><Link href="/content"><ArrowLeft/> Content</Link></header><section className="admin-heading"><span className="step-kicker">Protected editor workspace</span><h1>Educational videos</h1><p>Uploads are validated by MIME type, extension and file signature, then stored behind a swappable storage layer.</p></section><VideoUploadForm/><section className="uploaded-list"><h2>Video library</h2>{videos.map(video=><div key={video.id}><div><strong>{video.title}</strong><small>{video.category} · {video.ageGroup} · {Math.ceil(video.durationSeconds/60)} min</small></div><span className="status-chip">{video.published?"Published":"Draft"}</span></div>)}</section></main>}
