"use client";

import { useEffect, useState } from "react";
import { CalendarDays, ChevronDown, History, Pencil, Plus, Sparkles, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { goalCategories } from "@/lib/validation";
import { SproutCompanion } from "@/components/sprout";

type Contribution = { id: string; amountPence: number; createdAt: string };
type Goal = { id: string; title: string; category: string; targetPence: number; savedPence: number; targetDate: string | null; contributions: Contribution[] };
const money = (pence: number) => new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: pence % 100 ? 2 : 0 }).format(pence / 100);

export function GoalsExperience({ initialGoals, now }: { initialGoals: Goal[]; now: number }) {
  const router = useRouter();
  const [goals, setGoals] = useState(initialGoals);
  const [editing, setEditing] = useState<Goal | "new" | null>(initialGoals.length ? null : "new");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sprigCreated,setSproutCreated]=useState("");const[ageGroup,setAgeGroup]=useState<"YOUTH"|"YOUNG_ADULT">("YOUTH");const[sprigSounds,setSproutSounds]=useState(false);
  useEffect(()=>{fetch("/api/profile/preferences",{cache:"no-store"}).then(response=>response.ok?response.json():null).then(data=>{if(data?.ageGroup)setAgeGroup(data.ageGroup);setSproutSounds(Boolean(data?.sprigSounds))}).catch(()=>undefined)},[]);

  async function saveGoal(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    const form = new FormData(event.currentTarget);
    const payload = { title: String(form.get("title")), category: String(form.get("category")), targetAmount: Number(form.get("targetAmount")), currentAmount: Number(form.get("currentAmount") || 0), targetDate: String(form.get("targetDate") || "") || null };
    const existing = editing !== "new" && editing ? editing : null;
    const response = await fetch(existing ? `/api/goals/${existing.id}` : "/api/goals", { method: existing ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const data = await response.json();
    if (!response.ok) setError(data.error || "We couldn't save that goal.");
    else { setEditing(null); if(!existing)setSproutCreated(data.goal.id); await refreshGoals(); router.refresh(); }
    setBusy(false);
  }

  async function refreshGoals() { const response = await fetch("/api/goals", { cache: "no-store" }); if (response.ok) setGoals((await response.json()).goals); }
  async function addProgress(goal: Goal, amount: number | "custom") {
    const chosen = amount === "custom" ? Number(window.prompt("How many pounds would you like to add?", "25")) : amount;
    if (!chosen || chosen <= 0) return;
    setBusy(true); setError("");
    const response = await fetch(`/api/goals/${goal.id}/contributions`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ amount: chosen }) });
    if (!response.ok) setError((await response.json()).error || "Progress could not be added."); else { await refreshGoals(); router.refresh(); }
    setBusy(false);
  }
  async function removeGoal(goal: Goal) {
    if (!window.confirm(`Delete “${goal.title}”? Its progress history will also be removed.`)) return;
    setBusy(true); const response = await fetch(`/api/goals/${goal.id}`, { method: "DELETE" });
    if (response.ok) { await refreshGoals(); setEditing(null); router.refresh(); } else setError("This goal could not be deleted."); setBusy(false);
  }

  return <div className="goals-experience">
    <div className="page-title-row"><div><span className="page-kicker"><Sparkles/> Educational tracking only</span><h1>Your goals</h1><p>Turn something that matters into a calm, achievable plan.</p></div><button className="round-add" onClick={() => setEditing("new")} aria-label="Create a goal"><Plus/></button></div>
    {error && <p className="inline-error" role="alert">{error}</p>}
    {sprigCreated&&<SproutCompanion event="GOAL_CREATED" ageGroup={ageGroup} reactionKey={`goal-created-${sprigCreated}`} soundsEnabled={sprigSounds}/>} 
    {editing && <GoalForm goal={editing === "new" ? null : editing} busy={busy} onCancel={() => setEditing(null)} onSubmit={saveGoal}/>} 
    <div className="goal-list">{goals.map(goal => <GoalCard key={goal.id} goal={goal} now={now} busy={busy} onAdd={addProgress} onEdit={setEditing} onDelete={removeGoal}/>)}</div>
    {!goals.length && !editing && <div className="empty-goals"><SproutCompanion event="EMPTY_STATE" ageGroup={ageGroup} context={{emptyLabel:"goals"}} reactionKey="goals-empty" soundsEnabled={false}/><h2>What are you growing towards?</h2><p>Create a goal and practise building towards it over time. GROW never moves real money.</p><Button onClick={() => setEditing("new")}><Plus/> Create your first goal</Button></div>}
  </div>;
}

function GoalForm({ goal, busy, onCancel, onSubmit }: { goal: Goal | null; busy: boolean; onCancel: () => void; onSubmit: (event: React.FormEvent<HTMLFormElement>) => void }) {
  return <form className="goal-form" onSubmit={onSubmit}><div className="card-heading"><div><small>{goal ? "UPDATE YOUR PLAN" : "A NEW PLAN"}</small><h2>{goal ? "Edit goal" : "Create a goal"}</h2></div><button type="button" onClick={onCancel} aria-label="Close goal form">×</button></div>
    <label htmlFor="goal-title">Goal title<Input id="goal-title" name="title" required minLength={3} defaultValue={goal?.title} placeholder="e.g. Save for a laptop"/></label>
    <div className="form-pair"><label htmlFor="goal-target">Target amount<Input id="goal-target" name="targetAmount" required min="1" step="0.01" type="number" defaultValue={goal ? goal.targetPence / 100 : ""} placeholder="1000"/></label><label htmlFor="goal-current">Saved so far<Input id="goal-current" name="currentAmount" min="0" step="0.01" type="number" defaultValue={goal ? goal.savedPence / 100 : 0}/></label></div>
    <div className="form-pair"><label htmlFor="goal-date">Target date<Input id="goal-date" name="targetDate" type="date" defaultValue={goal?.targetDate?.slice(0,10)}/></label><label htmlFor="goal-category">Category<select id="goal-category" name="category" defaultValue={goal?.category || "Personal"}>{goalCategories.map(category => <option key={category}>{category}</option>)}</select></label></div>
    <p className="form-note">This is a learning tracker. GROW does not hold or move money.</p><div className="form-actions"><Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button><Button disabled={busy}>{busy ? "Saving…" : goal ? "Save changes" : "Create goal"}</Button></div>
  </form>;
}

function GoalCard({ goal, now, busy, onAdd, onEdit, onDelete }: { goal: Goal; now: number; busy: boolean; onAdd: (goal: Goal, amount: number | "custom") => void; onEdit: (goal: Goal) => void; onDelete: (goal: Goal) => void }) {
  const remaining = Math.max(0, goal.targetPence - goal.savedPence); const percent = Math.min(100, Math.round(goal.savedPence / goal.targetPence * 100));
  const months = goal.targetDate ? Math.max(1, Math.ceil((new Date(goal.targetDate).getTime() - now) / (30.44 * 86400000))) : null; const monthly = months ? Math.ceil(remaining / months) : null;
  return <article className="goal-detail-card"><div className="goal-card-top"><span className="goal-category">{goal.category}</span><div><button onClick={() => onEdit(goal)} aria-label={`Edit ${goal.title}`}><Pencil/></button><button onClick={() => onDelete(goal)} aria-label={`Delete ${goal.title}`}><Trash2/></button></div></div><h2>{goal.title}</h2>
    <div className="goal-numbers"><div><strong>{money(goal.savedPence)}</strong><span>saved</span></div><div><strong>{money(goal.targetPence)}</strong><span>goal</span></div></div>
    <div className="progress-track large" aria-label={`${percent}% complete`}><i style={{ width: `${percent}%` }}/></div><div className="progress-meta"><strong>{percent}% complete</strong><span>{money(remaining)} remaining</span></div>
    {monthly !== null && <div className="track-tip"><CalendarDays/><p>To stay on track, aim for approximately <strong>{money(monthly)} per month.</strong></p></div>}
    <div className="quick-progress"><small>ADD PROGRESS</small><div>{[10,20,50].map(value => <button key={value} disabled={busy} onClick={() => onAdd(goal,value)}>+£{value}</button>)}<button disabled={busy} onClick={() => onAdd(goal,"custom")}>Custom</button></div></div>
    <details className="history"><summary><span><History/> Contribution history</span><ChevronDown/></summary>{goal.contributions.length ? <ul>{goal.contributions.map(item => <li key={item.id}><span>{new Date(item.createdAt).toLocaleDateString("en-GB", { day:"numeric", month:"short", year:"numeric" })}</span><strong>+{money(item.amountPence)}</strong></li>)}</ul> : <p>No contributions recorded yet.</p>}</details>
  </article>;
}


