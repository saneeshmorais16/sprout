"use client";
import {useEffect,useRef,useState} from "react";
import {ArrowRight,Coins,Cpu,Gamepad2,LoaderCircle,ShieldCheck,Shirt,Utensils} from "lucide-react";
import {Line,LineChart,ResponsiveContainer,Tooltip,XAxis,YAxis} from "recharts";
import {Button} from "@/components/ui/button";
import {DualOutcomeReveal} from "@/components/dual-outcome-reveal";
import {DecisionReflection} from "@/components/decision-reflection";
import {SproutCompanion} from "@/components/sprout";
import {SproutTutorActions} from "@/components/sprout-tutor-actions";

type Industry="GAMING"|"TECH"|"FASHION"|"FOOD";
type SeriesPoint={index:number;date:string;value:number};
type Started={run:{id:string};industry:Industry;series:SeriesPoint[];source:{title:string;asOf:string;dataVersion:string};notice:string;balance:number};
type Revealed={chosen:{label:string;value:number};alternative:{label:string;value:number};explanation:string;notice:string;series:SeriesPoint[]};
const industries={GAMING:{icon:Gamepad2,label:"Gaming"},TECH:{icon:Cpu,label:"Tech"},FASHION:{icon:Shirt,label:"Fashion"},FOOD:{icon:Utensils,label:"Food"}};

export function PracticePortfolio({initialBalance,ageGroup,soundsEnabled}:{initialBalance:number;unlockedLevel:number;ageGroup:"YOUTH"|"YOUNG_ADULT";soundsEnabled:boolean}){
  const[stage,setStage]=useState<"entry"|"decision"|"consequence"|"concept">("entry");const[industry,setIndustry]=useState<Industry|null>(null);const[balance,setBalance]=useState(initialBalance);const[started,setStarted]=useState<Started|null>(null);const[result,setResult]=useState<Revealed|null>(null);const[coinsAwarded,setCoinsAwarded]=useState(0);const[busy,setBusy]=useState(false);const[error,setError]=useState("");
  const stageHeading=useRef<HTMLHeadingElement>(null);
  useEffect(()=>{stageHeading.current?.focus({preventScroll:true})},[stage]);
  async function start(){
    if(!industry)return;setBusy(true);setError("");
    const response=await fetch("/api/portfolio/runs",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({level:1,industry,allocation:150})});
    const data=await response.json();setBusy(false);
    if(!response.ok){setError(data.error||"The historical replay could not start.");return}
    setStarted(data);setBalance(data.balance);setStage("decision");
  }
  async function decide(decision:"HOLD"|"SELL"){
    if(!started)return;setBusy(true);setError("");
    const response=await fetch(`/api/portfolio/runs/${started.run.id}/decision`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({decision})});
    const data=await response.json();setBusy(false);
    if(!response.ok){setError(data.error||"The decision could not be recorded.");return}
    setResult(data);setStage("consequence");
  }
  async function unlock(){
    if(!started)return;setBusy(true);setError("");
    const response=await fetch(`/api/portfolio/runs/${started.run.id}/unlock`,{method:"POST",headers:{"Content-Type":"application/json"}});
    const data=await response.json();setBusy(false);
    if(!response.ok){setError(data.error||"The learning term could not be unlocked.");return}
    setCoinsAwarded(data.coinsAwarded||0);setBalance(data.balance);setStage("concept");
  }
  return <div className="portfolio-player">
    <section className="portfolio-learning-intro"><small>FRIDAY · PRACTICE</small><h1>Put learning into practice</h1><p>Spark Coins are earned through learning. They are virtual, cannot be bought, withdrawn or transferred, and are not real money.</p></section>
    <section className="portfolio-balance" aria-label={`${balance} Spark Coins available. Virtual learning currency only.`}><div><span>Learning balance</span><strong>{balance} Spark Coins</strong><small>Virtual · not redeemable · practice-only</small></div><Coins aria-hidden="true"/></section>
    <PortfolioLevels/>
    {stage==="entry"&&<section className="portfolio-decision"><span>START SIMPLE · LEVEL 1</span><h2 ref={stageHeading} tabIndex={-1}>Pick an industry for this replay</h2><p>This only changes the story context. It is not a recommendation or a risk rating.</p><div className="industry-options" role="radiogroup" aria-label="Choose an industry context">{(Object.keys(industries) as Industry[]).map(key=>{const item=industries[key],Icon=item.icon;return <button type="button" role="radio" aria-checked={industry===key} key={key} className={industry===key?"selected":""} onClick={()=>setIndustry(key)}><Icon aria-hidden="true"/><span>{item.label}</span></button>})}</div><Button onClick={start} disabled={!industry||busy||balance<150} aria-busy={busy}>{busy?<LoaderCircle className="spin" aria-hidden="true"/>:null}START REPLAY — 150 SPARK COINS <ArrowRight aria-hidden="true"/></Button>{balance<150&&<p className="inline-error" role="alert">Complete learning activities to reach 150 Spark Coins.</p>}</section>}
    {stage==="decision"&&started&&<section className="portfolio-decision" aria-live="polite"><span>THE HISTORICAL PATH MOVED</span><h2 ref={stageHeading} tabIndex={-1}>Hold or move your Spark Coins out?</h2><p>Neither action is labelled correct. Choose, then compare both outcomes from this stored period.</p><MarketChart data={started.series}/><div className="market-source"><ShieldCheck aria-hidden="true"/><span><b>Stored for the offline demo</b>{started.source.title} · Example scenario, not a forecast.</span></div><div className="hold-sell"><button type="button" onClick={()=>void decide("HOLD")} disabled={busy}><strong>Hold</strong><small>Stay exposed to later movements</small></button><button type="button" onClick={()=>void decide("SELL")} disabled={busy}><strong>Move out</strong><small>Fix the value at this point</small></button></div>{busy&&<span role="status"><LoaderCircle className="spin decision-loader" aria-hidden="true"/><span className="sr-only">Saving your decision</span></span>}</section>}
    {stage==="consequence"&&result&&<section className="portfolio-result" aria-live="polite"><span>CONSEQUENCE</span><h2 ref={stageHeading} tabIndex={-1}>See both roads from the same historical period.</h2><MarketChart data={result.series}/><DualOutcomeReveal chosen={result.chosen} alternative={result.alternative} notice={result.notice}/><section className="why-card"><h3>Why did it happen?</h3><p>{result.explanation}</p></section><Button onClick={unlock} disabled={busy} aria-busy={busy}>{busy?<LoaderCircle className="spin" aria-hidden="true"/>:null}I’ve seen what happened · reveal the term <ArrowRight aria-hidden="true"/></Button></section>}
    {stage==="concept"&&started&&<section className="portfolio-result concept-reveal" aria-live="polite" aria-atomic="true"><span>WELL DONE</span><p>That’s called</p><h2 ref={stageHeading} tabIndex={-1}>VOLATILITY</h2><p>Volatility means how much something&apos;s value moves up and down over time.</p><b className="coin-reward"><Coins aria-hidden="true"/> +{coinsAwarded||50} Spark Coins for the learning milestone</b><SproutCompanion event="CONCEPT_UNLOCKED" ageGroup={ageGroup} context={{customMessage:"Those ups and downs are called volatility. Another period could look different."}} reactionKey={`portfolio-volatility-${started.run.id}`} soundsEnabled={soundsEnabled}/><SproutTutorActions contextType="PORTFOLIO_RESULT" contextId={started.run.id} allowedActions={["WHY_DID_THIS_HAPPEN"]}/><DecisionReflection activityKey="PORTFOLIO_VOLATILITY" progressHref="/progress"/></section>}
    {error&&<p className="inline-error" role="alert">{error}</p>}
  </div>;
}

function PortfolioLevels(){return <section className="portfolio-levels" aria-label="Portfolio learning levels"><span className="active"><b>1</b> START SIMPLE<small>Playable</small></span><span aria-disabled="true"><b>2</b> DIVERSIFY<small>Locked preview</small></span><span aria-disabled="true"><b>3</b> REAL MARKETS<small>Locked preview</small></span><span aria-disabled="true"><b>4</b> YOUR STRATEGY<small>Locked preview</small></span></section>}

function MarketChart({data}:{data:SeriesPoint[]}){
  const start=data[0]?.value??0,end=data.at(-1)?.value??0;
  return <div className="practice-market-chart" role="img" aria-label={`Historical path from ${start} to ${end} Spark Coins. This stored period includes both upward and downward movement.`}><ResponsiveContainer width="100%" height="100%"><LineChart data={data} margin={{top:8,right:8,bottom:0,left:-18}}><XAxis dataKey="date" tickFormatter={value=>String(value).slice(0,4)} tick={{fontSize:10}}/><YAxis tick={{fontSize:10}} domain={["dataMin - 10","dataMax + 10"]}/><Tooltip formatter={value=>[`${value} Spark Coins`,"Historical value"]}/><Line type="monotone" dataKey="value" stroke="#0f6b46" strokeWidth={3} dot={false}/></LineChart></ResponsiveContainer></div>
}
