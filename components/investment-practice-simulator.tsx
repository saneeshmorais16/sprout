"use client";

import { useEffect, useState } from "react";
import { Cell, CartesianGrid, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AlertTriangle, ArrowLeft, ArrowRight, Check, Info, Layers3, Leaf, LoaderCircle, Play, RefreshCw, Rocket, Scale, ShieldCheck, SlidersHorizontal, Sparkles, WalletCards } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SproutAvatar, SproutCompanion } from "@/components/sprout";
import { DecisionReflection } from "@/components/decision-reflection";
import { Allocation, AssetKey, assetOptions, DurationKey, durationOptions, isReasonablyDiversified, portfolioPresets, runPracticeSimulation, ScenarioKey, scenarioOptions } from "@/lib/investment-simulator";

type Result = ReturnType<typeof runPracticeSimulation>;
type History = { id: string; createdAt: string; scenarioId: string; endingValue: number; duration: string };
const money = (pence: number) => new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(pence / 100);
const assets = Object.entries(assetOptions) as [AssetKey, (typeof assetOptions)[AssetKey]][];

function resultPath(result: Result) {
  return result.timeline.map(point=>({label:point.label,value:Math.round(point.valuePence/100)}));
}

function SimulationResult({ result, allocation, xp, decisionSessionId, onBack, mode, soundsEnabled }: { result: Result; allocation: Allocation; xp: number; decisionSessionId: string; onBack: () => void; mode:"YOUTH"|"YOUNG_ADULT"; soundsEnabled:boolean }) {
  const chartData = resultPath(result);
  const allocationData = [
    { name: "Diversified shares", value: allocation.SHARES + allocation.GLOBAL, colour: "#7b68e8" },
    { name: "Bonds", value: allocation.BONDS, colour: "#9ea65c" },
    { name: "Cash-like", value: allocation.CASH, colour: "#4aa7d8" },
  ].filter(item => item.value > 0);
  const durationLabel = durationOptions.find(item => item.id === result.duration)?.label ?? "Example period";
  const diversification = result.insights.find(item => item.title === "Diversification")?.body;
  const change = `${result.changePercent > 0 ? "+" : ""}${result.changePercent}%`;
  const reactionEvent=result.changePercent>2?"SIMULATION_GAIN":result.changePercent<0?"SIMULATION_LOSS":"SIMULATION_VOLATILITY";

  return <div className="simulation-result-page" aria-live="polite">
    <header className="simulation-result-header"><button type="button" onClick={onBack} aria-label="Back to simulator"><ArrowLeft/></button><h1>Simulation result</h1><span title="Educational simulation only"><Info/></span></header>
    <section className="scenario-result-card"><div><small>Market scenario</small><strong>{result.scenarioLabel}</strong></div><span>{durationLabel}</span></section>
    <section className="portfolio-result-card">
      <h2>Your portfolio</h2>
      <div className="result-metrics"><div><span>Start value</span><strong>{money(result.startingValue)}</strong></div><div><span>End value</span><strong>{money(result.endingValue)}</strong></div><div className={result.changePercent < 0 ? "down" : "up"}><span>Change</span><strong>{change}</strong></div></div>
      <div className="portfolio-line-chart" role="img" aria-label={`The fictional portfolio started at ${money(result.startingValue)} and ended at ${money(result.endingValue)}, a change of ${change}, under the ${result.scenarioLabel} example scenario.`}><ResponsiveContainer width="100%" height={190}><LineChart data={chartData} margin={{ top: 12, right: 10, left: -17, bottom: 0 }}><CartesianGrid stroke="#edf0ed" vertical={false}/><XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#7b8581" }}/><YAxis domain={["dataMin - 150", "dataMax + 150"]} axisLine={false} tickLine={false} width={46} tickFormatter={value => `£${Math.round(Number(value) / 1000)}k`} tick={{ fontSize: 9, fill: "#7b8581" }}/><Tooltip formatter={value => new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(Number(value))}/><Line type="monotone" dataKey="value" stroke="#15945f" strokeWidth={3} dot={false} activeDot={{ r: 4, fill: "#15945f" }}/></LineChart></ResponsiveContainer></div>
      <p className="chart-summary">Example scenario — not a forecast. Values can rise or fall and the ending is not guaranteed.</p>
    </section>
    <SproutCompanion event={reactionEvent} ageGroup={mode} context={{diversified:isReasonablyDiversified(allocation)}} reactionKey={`simulation-result-${decisionSessionId}`} soundsEnabled={soundsEnabled}/>
    <section className="result-learning-card"><h2>What happened?</h2><p>{result.scenarioSummary}</p><div><span>Key takeaway</span><p>{diversification} This example cannot predict a future recovery or return.</p></div></section>
    <section className="allocation-result-card"><h2>Your allocation</h2><div><div className="allocation-donut" role="img" aria-label={allocationData.map(item => `${item.name} ${item.value}%`).join(", ")}><ResponsiveContainer width="100%" height={132}><PieChart><Pie data={allocationData} dataKey="value" nameKey="name" innerRadius={38} outerRadius={58} paddingAngle={2} stroke="none">{allocationData.map(item => <Cell key={item.name} fill={item.colour}/>)}</Pie></PieChart></ResponsiveContainer></div><ul>{allocationData.map(item => <li key={item.name}><i style={{ background: item.colour }}/><span>{item.name}</span><strong>{item.value}%</strong></li>)}</ul></div></section>
    {xp > 0 && <div className="xp-celebration result-xp"><Sparkles/><p><strong>Learning complete · +{xp} XP</strong>XP rewards the activity, not the simulated return.</p></div>}
    <DecisionReflection activityKey="INVESTMENT_PRACTICE" decisionSessionId={decisionSessionId}/>
    <div className="simulation-safety reference-safety"><ShieldCheck/><span><strong>This is a learning simulation.</strong>No real money is involved.</span></div>
    <Button variant="secondary" className="run-again" onClick={onBack}><RefreshCw/> Try another scenario</Button>
  </div>;
}

export function InvestmentPracticeSimulator({ mode, history, soundsEnabled=false }: { mode: "YOUTH" | "YOUNG_ADULT"; history: History[]; soundsEnabled?:boolean }) {
  const youth = mode === "YOUTH";
  const [sprigSounds,setSproutSounds]=useState(soundsEnabled);
  const [started, setStarted] = useState(false);
  const [view, setView] = useState<"SIMULATOR" | "DROP">("SIMULATOR");
  const [preset, setPreset] = useState<"CAUTIOUS" | "BALANCED" | "GROWTH" | "CUSTOM">("BALANCED");
  const [allocation, setAllocation] = useState<Allocation>({ ...portfolioPresets.BALANCED.allocation });
  const [scenario, setScenario] = useState<ScenarioKey>("VOLATILE_RECOVERY");
  const [duration, setDuration] = useState<DurationKey>("ONE_YEAR");
  const [result, setResult] = useState<Result | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [xp, setXp] = useState(0);
  const [decisionSessionId, setDecisionSessionId] = useState("");
  const [dropAnswer, setDropAnswer] = useState<number | null>(null);
  const [dropXp, setDropXp] = useState(0);
  const total = Object.values(allocation).reduce((sum, value) => sum + value, 0);
  const diversified = isReasonablyDiversified(allocation);

  useEffect(() => {
    if (result) document.querySelector<HTMLElement>(".app-shell-scroll")?.scrollTo({ top: 0, behavior: "auto" });
  }, [result]);
  useEffect(()=>{if(soundsEnabled)return;fetch("/api/profile/preferences",{cache:"no-store"}).then(response=>response.ok?response.json():null).then(data=>setSproutSounds(Boolean(data?.sprigSounds))).catch(()=>undefined)},[soundsEnabled]);

  function choosePreset(key: "CAUTIOUS" | "BALANCED" | "GROWTH") { setPreset(key); setAllocation({ ...portfolioPresets[key].allocation }); setResult(null); }
  function updateAsset(key: AssetKey, value: number) { setPreset("CUSTOM"); setAllocation(current => ({ ...current, [key]: value })); setResult(null); }
  async function run() {
    if (total !== 100) { setError("Adjust the sliders until your allocation equals 100%."); return; }
    setBusy(true); setError(""); setXp(0);
    const response = await fetch("/api/investment-simulator", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ allocation, scenarioId: scenario, duration }) });
    const body = await response.json();
    if (response.ok) { setResult(body.result); setDecisionSessionId(body.decisionSessionId); setXp(body.xpAwarded || 0); } else setError(body.error || "The example scenario could not run.");
    setBusy(false);
  }
  async function answerDrop(index: number) { setDropAnswer(index); if (index === 1) { const response = await fetch("/api/missions/market-drop", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ answer:"REVIEW_HORIZON" }) }); if (response.ok) setDropXp((await response.json()).xpAwarded || 0); } }

  if (!started) return <div className={`simulator-onboarding ${youth ? "youth" : "adult"}`}>
    <section className="simulator-reference-hero"><div><span>INVESTMENT PRACTICE</span><h2>Practise investing without risking real money</h2><p>Explore how different choices can affect a portfolio over time.</p></div><SproutAvatar expression="thinking" compact={!youth}/></section>
    <section className="simulator-virtual-card"><div><span>Virtual balance</span><strong>£10,000</strong><small>Practice money</small></div><i><WalletCards/></i></section>
    <section className="risk-selection"><span>Choose a portfolio approach</span><p>What level of risk are you comfortable exploring?</p><div>{[{ key: "CAUTIOUS" as const, label: "Cautious", note: "Lower risk", icon: Leaf }, { key: "BALANCED" as const, label: "Balanced", note: "Balanced risk", icon: Scale }, { key: "GROWTH" as const, label: "Growth", note: "Higher risk", icon: Rocket }, { key: "CUSTOM" as const, label: "Build your own", note: "Custom", icon: SlidersHorizontal }].map(({ key, label, note, icon: Icon }) => <button type="button" key={key} aria-pressed={preset === key} className={preset === key ? "selected" : ""} onClick={() => key === "CUSTOM" ? setPreset("CUSTOM") : choosePreset(key)}><Icon/><strong>{label}</strong><small>{note}</small></button>)}</div></section>
    <Button className="simulator-start" onClick={() => setStarted(true)}>Start simulation <ArrowRight/></Button>
    <div className="simulation-safety reference-safety"><ShieldCheck/><span><strong>This is a learning simulation.</strong>No real money is involved and results are not forecasts.</span></div>
  </div>;

  if (result && view === "SIMULATOR") return <SimulationResult result={result} allocation={allocation} xp={xp} decisionSessionId={decisionSessionId} onBack={() => setResult(null)} mode={mode} soundsEnabled={sprigSounds}/>;

  return <div className="investment-lab">
    <div className="sim-tabs" role="tablist" aria-label="Practice activities"><button role="tab" aria-selected={view === "SIMULATOR"} className={view === "SIMULATOR" ? "active" : ""} onClick={() => setView("SIMULATOR")}>Portfolio lab</button><button role="tab" aria-selected={view === "DROP"} className={view === "DROP" ? "active" : ""} onClick={() => setView("DROP")}>Market drop mission</button></div>
    {view === "DROP" ? <section className="market-drop-card"><div className="drop-heading"><AlertTriangle/><div><small>EXAMPLE SCENARIO · NOT A FORECAST</small><h2>The market just dropped</h2></div></div><div className="drop-number">−12%</div><p>Your fictional portfolio has fallen over a short period. What would you do?</p><div className="drop-answers">{["Sell everything immediately", "Review why you invested and your time horizon", "Move everything to whatever rose most recently", "Assume the market will recover tomorrow"].map((answer, index) => <button key={answer} className={dropAnswer === index ? (index === 1 ? "correct" : "incorrect") : ""} onClick={() => answerDrop(index)}>{answer}{dropAnswer === index && (index === 1 ? <Check/> : <AlertTriangle/>)}</button>)}</div>{dropAnswer !== null && <div className={`drop-feedback ${dropAnswer === 1 ? "correct" : ""}`} role="status"><SproutCompanion event="SIMULATION_LOSS" ageGroup={mode} reactionKey={`market-drop-${dropAnswer}`} soundsEnabled={false}/><p><strong>{dropAnswer === 1 ? "Thoughtful choice." : "Pause and look again."}</strong>{dropAnswer === 1 ? "Goals, time horizon and diversification matter. The future is still uncertain, so avoid treating any recovery as guaranteed." : "This answer relies on panic, recent performance or certainty. None of those removes market risk."}{dropXp > 0 && <span> +{dropXp} XP</span>}</p></div>}</section> : <>
      <section className="practice-balance"><div><span>VIRTUAL BALANCE</span><strong>£10,000</strong></div><em>Practice money</em></section>
      <section className="allocation-builder"><header><div><small>STEP 1</small><h2>Choose a practice allocation</h2></div><span className={total === 100 ? "valid" : "invalid"}>{total}% / 100%</span></header><div className="preset-grid">{(Object.entries(portfolioPresets) as ["CAUTIOUS" | "BALANCED" | "GROWTH", (typeof portfolioPresets)["BALANCED"]][]).map(([key, item]) => <button key={key} onClick={() => choosePreset(key)} className={preset === key ? "selected" : ""}><strong>{item.label}</strong><span>{item.description}</span></button>)}<button onClick={() => setPreset("CUSTOM")} className={preset === "CUSTOM" ? "selected" : ""}><strong>Build your own</strong><span>Adjust every category. The total must equal 100%.</span></button></div><div className="allocation-bar" aria-label={`Allocation total ${total}%`}>{assets.map(([key, item]) => <i key={key} style={{ width: `${allocation[key]}%`, background: item.colour }} title={`${item.label} ${allocation[key]}%`}/>)}</div><div className="asset-sliders">{assets.map(([key, item]) => <label key={key}><span><i style={{ background: item.colour }}/><strong>{item.label}</strong><em>{allocation[key]}%</em></span><small>{item.risk} · {item.description}</small><input type="range" min="0" max="100" step="5" value={allocation[key]} onChange={event => updateAsset(key, Number(event.target.value))} aria-label={`${item.label} percentage`}/></label>)}</div><div className={`diversification-check ${diversified ? "ready" : ""}`}><Layers3/><p><strong>{diversified ? "Diversification mission ready" : "Try spreading across at least three categories"}</strong>{diversified ? "There is no single correct portfolio—this example simply avoids relying too heavily on one category." : "No category needs to be included in real life. This mission only demonstrates spreading fictional exposure."}</p></div></section>
      <section className="scenario-controls"><div><small>STEP 2</small><h2>Choose an example market</h2></div><label>Scenario<select value={scenario} onChange={event => { setScenario(event.target.value as ScenarioKey); setResult(null); }}>{scenarioOptions.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label><label>Time period<select value={duration} onChange={event => { setDuration(event.target.value as DurationKey); setResult(null); }}>{durationOptions.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label><p><Info/> Example scenario — not a forecast.</p><Button onClick={run} disabled={busy || total !== 100}>{busy ? <LoaderCircle className="spin"/> : <Play/>}{busy ? "Running scenario…" : "Run market scenario"}</Button>{error && <p className="inline-error" role="alert">{error}</p>}</section>
      <section className="wellbeing-first"><ShieldCheck/><p><strong>Financial wellbeing comes first.</strong>Investing is only one part of money planning. Emergency savings, high-cost debt, budgeting, goals and time horizon all matter. GROW does not assume investing is right for everyone.</p></section>
      {history.length > 0 && <section className="practice-history"><h2>Your recent practice</h2>{history.slice(0, 3).map(item => <div key={item.id}><span><strong>{scenarioOptions.find(option => option.id === item.scenarioId)?.label || "Example scenario"}</strong><small>{new Date(item.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })} · {durationOptions.find(option => option.id === item.duration)?.label}</small></span><strong>{money(item.endingValue)}</strong></div>)}</section>}
    </>}
  </div>;
}


