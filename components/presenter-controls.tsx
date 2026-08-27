"use client";

import { useState } from "react";
import { Check, ChevronDown, LoaderCircle, RotateCcw, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const advancedControls = [
  ["RESET_ACTIVITY","Reset learning activity","Restore XP, learning progress and achievements."],
  ["RESET_GOALS","Reset goals","Restore the goal recommended for Maya’s current age."],
  ["RESET_STREAK","Reset streak","Set Maya’s learning streak to zero."],
  ["RESET_SIMULATIONS","Reset practice history","Clear Maya’s fictional practice runs and reflections."],
  ["COMPLETE_MISSION","Complete sample mission","Demonstrate mission XP and completion."],
  ["UNLOCK_ACHIEVEMENT","Unlock sample badge","Add a learning achievement."],
  ["CHANGE_AVATAR","Change Maya’s avatar","Switch to a sample character and accessory."],
  ["RESET_XP_STREAK","Reset XP and streak","Return both learning counters to zero."],
] as const;

export function PresenterControls(){
  const router=useRouter();
  const[active,setActive]=useState("");
  const[done,setDone]=useState("");
  const[message,setMessage]=useState("");

  async function run(action:string){
    setActive(action);setDone("");setMessage("");
    const response=await fetch("/api/admin/presenter",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action})});
    setActive("");
    if(response.ok){
      setDone(action);
      setMessage(action==="PREPARE_DEMO"?"Demo ready ✓":action==="AGE_16"?"Maya is now 16 and ready for the GROW weekly loop.":action.startsWith("DEMO_")?`${action.replace("DEMO_","").toLowerCase()} demo state ready ✓`:"Demo state updated ✓");
      router.refresh();
    }else setMessage("That demo action could not be completed.");
  }

  function actionButton(action:string,label="Run",primary=false){return <Button variant={primary?"primary":"secondary"} onClick={()=>run(action)} disabled={Boolean(active)}>{active===action?<LoaderCircle className="spin"/>:done===action?<Check/>:null}{done===action?"Ready":label}</Button>}

  return <div className="presenter-controls">
    <article className="prepare-demo-card"><div><span><Sparkles aria-hidden="true"/> ONE-CLICK RESET</span><h3>Prepare the 90-second weekly loop</h3><p>Restores Maya at 16 with 300 Spark Coins and clean Lab, Daily Post and Portfolio progress.</p></div>{actionButton("PREPARE_DEMO","Prepare Demo",true)}</article>
    <section className="compare-ages"><div className="compare-heading"><span>COMPRESSED WEEK</span><h3>Jump between demo days.</h3><p>These labels are presenter-controlled and do not depend on the real date.</p></div><div className="age-compare-grid"><article><b>M</b><div><strong>Monday</strong><p>Weekly Lab: experience the idea.</p></div>{actionButton("DEMO_MONDAY","Show Monday")}</article><article><b>W</b><div><strong>Wednesday</strong><p>Daily Post: reinforce one decision.</p></div>{actionButton("DEMO_WEDNESDAY","Show Wednesday")}</article><article><b>F</b><div><strong>Friday</strong><p>Portfolio: apply Spark Coins.</p></div>{actionButton("DEMO_FRIDAY","Show Friday")}</article></div></section>
    <section className="compare-ages"><div className="compare-heading"><span>DEMO PERSONA</span><h3>Keep Maya in the supported age range.</h3><p>The strict MVP serves ages 15–18 only.</p></div><div className="age-compare-grid"><article><b>16</b><div><strong>Maya’s learning path</strong><p>Compounding, daily reinforcement and safe portfolio practice.</p></div>{actionButton("AGE_16","Restore age 16")}</article></div></section>
    {message&&<div className={message.startsWith("That")?"inline-error":"adapted-message"} role="status"><Sparkles/>{message}</div>}
    <details className="advanced-demo-controls"><summary><span><RotateCcw/> Advanced demo controls</span><ChevronDown/></summary><div className="presenter-grid">{advancedControls.map(([action,title,description])=><div className="presenter-action" key={action}><div><strong>{title}</strong><p>{description}</p></div>{actionButton(action)}</div>)}</div></details>
  </div>;
}
