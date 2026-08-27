"use client";

import { useState } from "react";
import { Check, LoaderCircle, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Kind = "module" | "video" | "feed" | "wire";
type EditableKind = Exclude<Kind, "video">;
type Item = { id: string; title: string; published: boolean; kind: Kind; meta: string; summary: string; ageGroup: string; category: string; route: string; detail: string; secondary?: string; tertiary?: string; keyTerm?: string };
const empty = { kind: "module" as EditableKind, title: "", published: false, summary: "", ageGroup: "YOUTH", category: "Money Basics", route: "", detail: "", secondary: "", tertiary: "", keyTerm: "" };

export function ContentControls({ items }: { items: Item[] }) {
  const [content, setContent] = useState(items);
  const [tab, setTab] = useState<Kind>("module");
  const [editing, setEditing] = useState<(typeof empty & { id?: string }) | null>(null);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  async function toggle(item: Item) {
    setBusy(item.id);
    const response = await fetch("/api/admin/content", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind: item.kind, id: item.id, published: !item.published }) });
    setBusy("");
    if (response.ok) setContent((current) => current.map((entry) => entry.id === item.id ? { ...entry, published: !entry.published } : entry));
  }
  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;
    setBusy("save"); setError("");
    const form = new FormData(event.currentTarget);
    const payload = { id: editing.id, kind: editing.kind, title: String(form.get("title")), summary: String(form.get("summary")), ageGroup: "YOUTH", category: String(form.get("category")), route: String(form.get("route")), detail: String(form.get("detail")), secondary: String(form.get("secondary") || ""), tertiary: String(form.get("tertiary") || ""), keyTerm: String(form.get("keyTerm") || ""), published: form.get("published") === "on" };
    const response = await fetch("/api/admin/content", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (response.ok) window.location.reload(); else setError((await response.json()).error || "Content could not be saved.");
    setBusy("");
  }
  async function remove(item: Item) {
    if (!window.confirm(`Remove “${item.title}”?`)) return;
    setBusy(item.id);
    const response = await fetch("/api/admin/content", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind: item.kind, id: item.id }) });
    if (response.ok) { setContent((current) => current.filter((entry) => entry.id !== item.id)); setEditing(null); } else setError("Content could not be removed.");
    setBusy("");
  }
  const shown = content.filter((item) => item.kind === tab);
  return <div className="content-studio">
    <div className="content-tabs" role="tablist" aria-label="Content type">{(["module", "feed", "wire", "video"] as Kind[]).map((kind) => <button type="button" role="tab" aria-selected={tab === kind} key={kind} className={tab === kind ? "active" : ""} onClick={() => { setTab(kind); setEditing(null); }}>{kind === "module" ? "Lessons" : kind === "feed" ? "Feed" : kind[0].toUpperCase() + kind.slice(1)} <span>{content.filter((item) => item.kind === kind).length}</span></button>)}</div>
    {tab !== "video" && <Button className="new-content" onClick={() => setEditing({ ...empty, kind: tab as EditableKind })}><Plus aria-hidden="true"/> Add {tab}</Button>}
    {editing && <ContentForm value={editing} busy={busy === "save"} error={error} onCancel={() => setEditing(null)} onSubmit={save}/>} 
    <div className="content-list">{shown.map((item) => <div className="presenter-action content-row" key={`${item.kind}-${item.id}`}><div><span className="status-chip">{item.published ? "Published" : "Draft"}</span><strong>{item.title}</strong><p>{item.meta}</p></div><div className="row-actions">{item.kind !== "video" && <button type="button" onClick={() => { setEditing({ ...empty, ...item, kind: item.kind as EditableKind }); setError(""); }} aria-label={`Edit ${item.title}`}><Pencil aria-hidden="true"/></button>}<Button variant="secondary" disabled={busy === item.id} onClick={() => toggle(item)}>{busy === item.id ? <LoaderCircle className="spin" aria-hidden="true"/> : item.published ? "Unpublish" : "Publish"}</Button>{item.kind !== "video" && <button type="button" className="delete-content" onClick={() => remove(item)} aria-label={`Remove ${item.title}`}><Trash2 aria-hidden="true"/></button>}</div></div>)}{shown.length === 0 && <div className="empty-content"><strong>No {tab} content yet</strong><p>Create the first record for this content area.</p></div>}</div>
  </div>;
}

function ContentForm({ value, busy, error, onCancel, onSubmit }: { value: typeof empty & { id?: string }; busy: boolean; error: string; onCancel: () => void; onSubmit: (event: React.FormEvent<HTMLFormElement>) => void }) {
  const wire = value.kind === "wire";
  return <form className="catalog-form" onSubmit={onSubmit}><div className="card-heading"><div><small>{value.id ? "EDIT CONTENT" : "NEW CONTENT"}</small><h2>{value.id ? `Edit ${value.kind}` : `Add ${value.kind}`}</h2></div><button type="button" onClick={onCancel} aria-label="Close form">×</button></div><div className="admin-form-grid">
    <label htmlFor="catalog-title">Title<Input id="catalog-title" name="title" required minLength={3} defaultValue={value.title}/></label>
    <label>Audience<select name="ageGroup" defaultValue="YOUTH"><option value="YOUTH">Ages 15–18</option></select></label>
    <label className="wide">Summary<textarea name="summary" required minLength={10} defaultValue={value.summary}/></label>
    <label htmlFor="catalog-category">{value.kind === "module" ? "Learning path" : "Category"}<Input id="catalog-category" name="category" required defaultValue={value.category}/></label>
    <label htmlFor="catalog-route">{value.kind === "feed" ? "Action path" : "Slug"}<Input id="catalog-route" name="route" required defaultValue={value.route} placeholder={value.kind === "feed" ? "/learn/saving" : "new-content-slug"}/></label>
    <label className="wide">{value.kind === "module" ? "Learning objective" : value.kind === "feed" ? "Why am I seeing this?" : "What happened?"}<textarea name="detail" required minLength={10} defaultValue={value.detail}/></label>
    {wire && <><label className="wide">Why does it matter?<textarea name="secondary" required minLength={10} defaultValue={value.secondary}/></label><label className="wide">What could it affect?<textarea name="tertiary" required minLength={10} defaultValue={value.tertiary}/></label><label className="wide">Key term<textarea name="keyTerm" required minLength={10} defaultValue={value.keyTerm}/></label></>}
    <label className="publish-check"><input type="checkbox" name="published" defaultChecked={value.published}/><span><strong>Publish now</strong><small>Make this visible to ages 15–18.</small></span><Check aria-hidden="true"/></label>
  </div>{error && <p className="inline-error" role="alert">{error}</p>}<div className="form-actions"><Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button><Button disabled={busy} aria-busy={busy}>{busy ? <><LoaderCircle className="spin" aria-hidden="true"/>Saving…</> : "Save content"}</Button></div></form>;
}
