"use client";
import {useState} from "react";
import Link from "next/link";
import {ArrowRight,Check,Coins,LoaderCircle} from "lucide-react";
import {SproutCompanion} from "@/components/sprout";
import type {DailyPostDefinition} from "@/lib/weekly-loop";

type Saved={choice:string;feedback:string}|null;
export function DailyPostPlayer({definition,initial,ageGroup,soundsEnabled,isFinal}:{definition:DailyPostDefinition;initial:Saved;ageGroup:"YOUTH"|"YOUNG_ADULT";soundsEnabled:boolean;isFinal:boolean}){
  const[choice,setChoice]=useState(initial?.choice??"");const[saved,setSaved]=useState(initial);const[busy,setBusy]=useState(false);const[coins,setCoins]=useState(0);const[error,setError]=useState("");
  async function submit(nextChoice:string){
    if(busy||saved)return;
    setChoice(nextChoice);setBusy(true);setError("");
    const response=await fetch(`/api/daily-posts/${definition.slug}/complete`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({choice:nextChoice})});
    const data=await response.json();setBusy(false);
    if(!response.ok){setError(data.error||"Your answer could not be saved.");return}
    setSaved(data.progress);setCoins(data.coinsAwarded||0);
  }
  const chosenLabel=definition.options.find(item=>item.id===saved?.choice)?.label??saved?.choice;
  if(saved)return <section className="daily-done" role="status" aria-live="polite" aria-atomic="true"><span><Check aria-hidden="true"/> {definition.dayLabel} COMPLETE</span><h2>You’re done for today.</h2><p>{saved.feedback}</p><div className="daily-answer"><small>Your answer</small><strong>{chosenLabel}</strong></div>{coins>0&&<b className="coin-reward"><Coins aria-hidden="true"/> +{coins} Spark Coins for learning</b>}<SproutCompanion event="DAILY_POST_COMPLETED" ageGroup={ageGroup} reactionKey={`daily-post-${definition.slug}`} soundsEnabled={soundsEnabled}/><Link href={isFinal?"/portfolio":"/daily"}>{isFinal?"Enter Practice Portfolio":"Continue the week"} <ArrowRight aria-hidden="true"/></Link></section>;
  return <section className="daily-decision-card"><span>{definition.dayLabel} · ONE DECISION</span><h1>{definition.title}</h1><p>{definition.prompt}</p><div role="radiogroup" aria-label="Choose one answer">{definition.options.map((option,index)=><button type="button" key={option.id} role="radio" aria-checked={choice===option.id} className={choice===option.id?"selected":""} disabled={busy} onClick={()=>void submit(option.id)}><i aria-hidden="true">{busy&&choice===option.id?<LoaderCircle className="spin"/>:String.fromCharCode(65+index)}</i><span>{option.label}</span></button>)}</div><p className="instant-feedback-note">Choose once. Feedback appears immediately.</p><span className="sr-only" role="status" aria-live="polite">{busy?"Saving your decision":null}</span>{error&&<p className="inline-error" role="alert">{error}</p>}</section>;
}


