"use client";

import { useState } from "react";
import { CheckCircle2, LoaderCircle, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function VideoUploadForm() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(""); setMessage("");
    const response = await fetch("/api/admin/videos", { method: "POST", body: new FormData(event.currentTarget) });
    const data = await response.json();
    if (response.ok) { setMessage(`“${data.video.title}” uploaded successfully.`); event.currentTarget.reset(); } else setError(data.error || "Upload failed.");
    setBusy(false);
  }
  return <form className="upload-form" onSubmit={submit}><div className="upload-intro"><UploadCloud aria-hidden="true"/><div><h2>Upload educational video</h2><p>Local prototype storage, behind server-side editor permissions.</p></div></div><div className="admin-form-grid">
    <label htmlFor="video-title">Title<Input id="video-title" name="title" required minLength={3}/></label>
    <label>Category<select name="category" defaultValue="Saving">{["Saving", "Budgeting", "Banking", "Scams", "First Pay", "Investing Basics", "Credit", "Pensions", "Financial News"].map((value) => <option key={value}>{value}</option>)}</select></label>
    <label className="wide">Description<textarea name="description" required minLength={10}/></label>
    <label>Audience<select name="ageGroup" defaultValue="YOUTH"><option value="YOUTH">Ages 15–18</option></select></label>
    <label>Difficulty<select name="difficulty"><option>Beginner</option><option>Foundational</option><option>Intermediate</option></select></label>
    <label htmlFor="video-duration">Duration (seconds)<Input id="video-duration" name="duration" type="number" min="10" max="3600" defaultValue="120" required/></label>
    <label>Publication<select name="published"><option value="false">Draft</option><option value="true">Published</option></select></label>
    <label className="wide">Key takeaway<textarea name="keyTakeaway" required minLength={5}/></label>
    <label className="wide">Transcript / written alternative<textarea name="transcript" required minLength={20} rows={6}/></label>
    <label className="file-field" htmlFor="video-file">Video file <small>MP4 or WebM · max 100 MB</small><Input id="video-file" name="video" type="file" accept="video/mp4,video/webm" required/></label>
    <label className="file-field" htmlFor="video-thumbnail">Thumbnail <small>PNG, JPEG or WebP · max 5 MB</small><Input id="video-thumbnail" name="thumbnail" type="file" accept="image/png,image/jpeg,image/webp"/></label>
  </div>{error && <p className="inline-error" role="alert">{error}</p>}{message && <p className="inline-success" role="status"><CheckCircle2 aria-hidden="true"/>{message}</p>}<Button disabled={busy} aria-busy={busy}>{busy ? <><LoaderCircle className="spin" aria-hidden="true"/>Validating and uploading…</> : <><UploadCloud aria-hidden="true"/>Upload video</>}</Button></form>;
}
