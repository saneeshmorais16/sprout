"use client";
import {useState} from "react";
import {Check,CircleCheck,LoaderCircle,ShieldAlert,Sparkles} from "lucide-react";
import {Button} from "@/components/ui/button";
import {SproutAvatar,SproutCompanion} from "@/components/sprout";

const signals=[
  {title:"Guaranteed return",copy:"No investment can honestly promise that it cannot lose value."},{title:"Unrealistic return",copy:"A large, regular return deserves evidence and careful checking."},{title:"Urgency",copy:"Pressure to act quickly can stop you checking the facts."},{title:"Social proof",copy:"Follower counts and likes do not make a financial claim reliable."},{title:"Unclear sponsorship",copy:"Paid relationships should be clear, not hidden in vague hashtags."},{title:"No risk information",copy:"A balanced explanation should make uncertainty and downside visible."},{title:"Pressure to click",copy:"A link can lead away from trusted sources. Pause and verify independently."},
];

export function NoiseChecker({alreadyComplete,ageGroup,soundsEnabled=false}:{alreadyComplete:boolean;ageGroup:"YOUTH"|"YOUNG_ADULT";soundsEnabled?:boolean}){
  const[found,setFound]=useState<number[]>([]);const[done,setDone]=useState(alreadyComplete);const[busy,setBusy]=useState(false);const[earned,setEarned]=useState(0);const active=found.length?signals[found[found.length-1]]:null;
  function pick(index:number){if(!found.includes(index))setFound([...found,index]);else setFound([...found.filter(item=>item!==index),index])}
  async function finish(){setBusy(true);const response=await fetch("/api/activities/complete",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({type:"NOISE_CHECKER"})});const data=await response.json();if(response.ok){setDone(true);setEarned(data.xpAwarded)}setBusy(false)}
  return <div className="noise-flow">
    <section className="noise-instructions"><ShieldAlert/><div><small>NOISE CHECKER</small><h1>What looks suspicious?</h1><p>Tap the highlighted claims. There are seven warning signs to uncover.</p></div><SproutAvatar compact expression="warning"/></section>
    <article className="social-post"><header><div className="fake-avatar">£</div><div><strong>@wealthwizard</strong><small>Sponsored? · 2m</small></div><span>•••</span></header><p>This investment <button onClick={()=>pick(0)} className={found.includes(0)?"found":""}>literally can&apos;t lose 🚀</button><br/>My followers are making <button onClick={()=>pick(1)} className={found.includes(1)?"found":""}>£500 every week.</button><br/><button onClick={()=>pick(2)} className={found.includes(2)?"found":""}>Don&apos;t miss out.</button> <button onClick={()=>pick(6)} className={found.includes(6)?"found":""}>Link in bio.</button></p><div className="post-meta"><button onClick={()=>pick(3)} className={found.includes(3)?"found":""}>♥ 14.8k followers agree</button><button onClick={()=>pick(4)} className={found.includes(4)?"found":""}>#partner?</button><button onClick={()=>pick(5)} className={found.includes(5)?"found":""}>Risk info: —</button></div></article>
    <div className="signal-progress"><div><strong>{found.length} of {signals.length}</strong><span>warning signs found</span></div><div className="progress-track"><i style={{width:`${found.length/signals.length*100}%`}}/></div></div>
    {active&&<><section className="signal-explainer"><CircleCheck/><div><small>{active.title.toUpperCase()}</small><p>{active.copy}</p></div></section><SproutCompanion event="SCAM_WARNING_FOUND" ageGroup={ageGroup} context={{warningLabel:active.title}} reactionKey={`noise-${found[found.length-1]}`} soundsEnabled={soundsEnabled}/></>}
    {done?<section className="noise-success"><SproutCompanion event="MISSION_COMPLETED" ageGroup={ageGroup} reactionKey="noise-completed" soundsEnabled={soundsEnabled}/><Sparkles/><h2>Great spot.</h2><p>Financial confidence includes knowing when something doesn&apos;t sound right.</p><strong>{earned?`+${earned} XP`:"Activity complete"}</strong></section>:<Button className="lesson-complete" onClick={finish} disabled={found.length<signals.length||busy}>{busy?<><LoaderCircle className="spin"/>Saving…</>:<>Finish Noise Checker · +75 XP <Check/></>}</Button>}
    <p className="education-small">Fictional educational example. GROW does not recommend financial products or investments.</p>
  </div>;
}


