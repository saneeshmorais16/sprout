"use client";
import {useState} from "react";
import Link from "next/link";
import {ArrowRight,Check,LoaderCircle} from "lucide-react";
import {Line,LineChart,ResponsiveContainer,XAxis,YAxis} from "recharts";
import {SproutCompanion} from "@/components/sprout";
import {TermUnlockCard} from "@/components/term-unlock-card";
import {headStartOutcome,headStartTimeline} from "@/lib/weekly-loop";
import {Button} from "@/components/ui/button";
import {SproutTutorActions} from "@/components/sprout-tutor-actions";

export function WeeklyLabPlayer({initialStep,ageGroup,soundsEnabled}:{initialStep:number;ageGroup:"YOUTH"|"YOUNG_ADULT";soundsEnabled:boolean}){
  const[step,setStep]=useState(Math.min(3,initialStep));const[busy,setBusy]=useState(false);const[coins,setCoins]=useState(0);const[error,setError]=useState("");
  const chartData=headStartTimeline.filter(point=>point.month%6===0);
  async function advance(next:number){setBusy(true);setError("");const response=await fetch("/api/labs/the-20-head-start/progress",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({step:next})});const data=await response.json();setBusy(false);if(!response.ok){setError(data.error||"That step could not be saved.");return}setStep(next);setCoins(data.coinsAwarded||0)}
  return <div className="weekly-lab-player">
    <ol className="lab-stepper" aria-label="Lab progress"><li aria-current={step===0?"step":undefined} className={step>=1?"active":""}>Experience</li><li aria-current={step===1||step===2?"step":undefined} className={step>=2?"active":""}>Consequence</li><li aria-current={step===3?"step":undefined} className={step>=3?"active":""}>Term</li></ol>
    {step===0&&<section className="lab-decision-card"><span>STEP 1 · EXPERIENCE</span><h2>Two people. The same £20 each month.</h2><p>Maya starts today. Her friend starts six months later. Both follow the same five-year worked example.</p><div className="head-start-people"><div><b>Maya</b><span>Starts today</span></div><div><b>Friend</b><span>Starts in month 7</span></div></div><Button onClick={()=>advance(1)} disabled={busy}>{busy?<LoaderCircle className="spin"/>:null}Start both timelines <ArrowRight/></Button></section>}
    {step===1&&<section className="lab-decision-card"><span>STEP 2 · WATCH THE JOURNEY</span><h2>Follow five years</h2><p>Both lines use the same illustrative 5% annual rate. This worked example is not a forecast.</p><HeadStartChart data={chartData}/><Button onClick={()=>advance(2)} disabled={busy}>{busy?<LoaderCircle className="spin"/>:null}Show the consequence <ArrowRight/></Button></section>}
    {step===2&&<section className="lab-decision-card consequence"><span>STEP 3 · CONSEQUENCE</span><h2>Starting six months earlier created a £{headStartOutcome.gap.toFixed(0)} head start.</h2><div className="outcome-pair"><div><small>Maya · started today</small><strong>£{headStartOutcome.maya.toFixed(0)}</strong></div><div><small>Friend · started later</small><strong>£{headStartOutcome.friend.toFixed(0)}</strong></div></div><p>Maya contributed £120 more, and that earlier money had longer in the same illustrative journey. The calculated gap is £{headStartOutcome.gap.toFixed(2)}.</p><Button onClick={()=>advance(3)} disabled={busy}>{busy?<LoaderCircle className="spin"/>:null}Reveal what this is called <ArrowRight/></Button></section>}
    {step===3&&<><TermUnlockCard experience="You started earlier, so money had more time to build on previous growth." term="compounding"><p>Compounding means growth building on earlier growth. Time can matter, but real returns are uncertain and values can fall.</p></TermUnlockCard><SproutTutorActions contextType="WEEKLY_LAB" contextId="the-20-head-start" allowedActions={["WHY_DID_THIS_HAPPEN"]}/><SproutCompanion event="LAB_COMPLETED" ageGroup={ageGroup} reactionKey="head-start-complete" soundsEnabled={soundsEnabled}/><div className="lab-complete" role="status" aria-live="polite"><Check aria-hidden="true"/><div><strong>Weekly Lab complete</strong><span>{coins?`+${coins} Spark Coins earned`:"Your reward is already safely recorded."}</span></div><Link href="/daily">Tuesday · Quick question <ArrowRight aria-hidden="true"/></Link></div></>}
    {error&&<p className="inline-error" role="alert">{error}</p>}
  </div>;
}

function HeadStartChart({data}:{data:typeof headStartTimeline}){
  return <div className="head-start-chart" role="img" aria-label={`Five-year worked example. Maya starts today and finishes with £${headStartOutcome.maya.toFixed(0)}. Her friend starts six months later and finishes with £${headStartOutcome.friend.toFixed(0)}. The calculated gap is £${headStartOutcome.gap.toFixed(2)}.`}><ResponsiveContainer width="100%" height="100%"><LineChart data={data} margin={{top:10,right:8,bottom:0,left:-15}}><XAxis dataKey="month" tickFormatter={value=>`${Number(value)/12}y`} tick={{fontSize:10}}/><YAxis tickFormatter={value=>`£${value}`} tick={{fontSize:10}}/><Line type="monotone" dataKey="maya" name="Maya" stroke="#0f6b46" strokeWidth={3} dot={false}/><Line type="monotone" dataKey="friend" name="Friend" stroke="#d5a633" strokeWidth={3} strokeDasharray="5 4" dot={false}/></LineChart></ResponsiveContainer><div className="chart-key" aria-hidden="true"><span><i/>Maya</span><span><i/>Friend</span></div></div>
}


