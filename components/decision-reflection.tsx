"use client";
import {useState} from "react";
import {Check,LoaderCircle,Sparkles,TrendingUp} from "lucide-react";
import Link from "next/link";

export type ReflectionKey="BUDGET_PAYDAY"|"INVESTMENT_PRACTICE"|"PORTFOLIO_VOLATILITY"|"NOISE_CHECKER"|"SAVING_DECISION"|"SUBSCRIPTION_DECISION"|"FIRST_PAY_DECISION"|"EMERGENCY_FUND_DECISION"|"CREDIT_DECISION"|"PENSION_DECISION";
type ReflectionChoice="BUILD_BUFFER"|"REVIEW_SUBSCRIPTIONS"|"DIVERSIFY_MORE"|"CHECK_INFORMATION"|"TAKE_MORE_TIME"|"COMPARE_TRADE_OFFS"|"ASK_A_QUESTION"|"CHANGE_MY_SPLIT";
const defaults:{id:ReflectionChoice;label:string}[]=[{id:"COMPARE_TRADE_OFFS",label:"Compare the trade-offs more carefully"},{id:"TAKE_MORE_TIME",label:"Give myself more time to decide"},{id:"ASK_A_QUESTION",label:"Ask one more question first"}];

export function DecisionReflection({activityKey,decisionSessionId,options=defaults,progressHref="/profile"}:{activityKey:ReflectionKey;decisionSessionId?:string;options?:{id:ReflectionChoice;label:string}[];progressHref?:string}){
  const[selected,setSelected]=useState("");const[busy,setBusy]=useState(false);const[saved,setSaved]=useState(false);const[xp,setXp]=useState(0);const[error,setError]=useState("");
  async function submit(){if(!selected)return;setBusy(true);setError("");const response=await fetch("/api/practice/reflection",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({activityKey,choice:selected,decisionSessionId})});const body=await response.json();if(response.ok){setSaved(true);setXp(body.xpAwarded||0)}else setError(body.error||"Your reflection could not be saved.");setBusy(false)}
  return <section className="decision-reflection"><span><Sparkles aria-hidden="true"/> REFLECT</span><h3>What would you do differently next time?</h3><p>Reflection builds educational confidence. There is no financial “winning” answer.</p><div>{options.map(option=><button type="button" key={option.id} className={selected===option.id?"selected":""} onClick={()=>{setSelected(option.id);setSaved(false)}} aria-pressed={selected===option.id}>{option.label}{selected===option.id&&<Check aria-hidden="true"/>}</button>)}</div>{error&&<p className="inline-error" role="alert">{error}</p>}<button type="button" className="reflection-submit" disabled={!selected||busy} onClick={submit} aria-busy={busy}>{busy?<LoaderCircle className="spin" aria-hidden="true"/>:saved?<Check aria-hidden="true"/>:null}{busy?"Saving…":saved?`Reflection saved${xp?` · +${xp} XP`:""}`:"Save reflection · +25 XP"}</button>{saved&&<Link className="reflection-progress-link" href={progressHref}><TrendingUp aria-hidden="true"/> See learning progress</Link>}</section>
}
