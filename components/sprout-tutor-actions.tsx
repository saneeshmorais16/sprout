"use client";

import {FormEvent,useEffect,useId,useRef,useState} from "react";
import {BookOpenCheck,Brain,CircleHelp,LoaderCircle,MessageCircleQuestion,Send,Sparkles,Sprout} from "lucide-react";

export type SproutTutorAction="EXPLAIN_THIS"|"WHY_DID_THIS_HAPPEN"|"QUIZ_ME"|"HELP_ME_THINK"|"ASK_SPROUT";
type Action=SproutTutorAction;
type ContextType="LESSON"|"WEEKLY_LAB"|"PORTFOLIO_RESULT"|"PORTFOLIO_CHOICE";
type TutorResult={response:{answer:string;concept:string;citations:string[];introduceTerm:string|null;guidingQuestions:string[]};delivery:"live"|"fallback"|"decline";futureLevel:number|null;retrievedChunks:Array<{id:string;title:string;sourceLabel:string;isDraft:boolean}>};
const actions:[Action,string,typeof BookOpenCheck][]=[
  ["EXPLAIN_THIS","Explain this",BookOpenCheck],
  ["WHY_DID_THIS_HAPPEN","Why did this happen?",CircleHelp],
  ["QUIZ_ME","Quiz me",Sparkles],
  ["HELP_ME_THINK","Help me think",Brain],
];

export function SproutTutorActions({contextType,contextId,allowedActions}:{contextType:ContextType;contextId:string;allowedActions?:readonly SproutTutorAction[]}){
  const[result,setResult]=useState<TutorResult|null>(null);const[busy,setBusy]=useState<Action|null>(null);const[error,setError]=useState("");const[askOpen,setAskOpen]=useState(false);const[question,setQuestion]=useState("");
  const heading=useRef<HTMLHeadingElement>(null);const textarea=useRef<HTMLTextAreaElement>(null);const uid=useId();
  useEffect(()=>{if(result)heading.current?.focus({preventScroll:true})},[result]);
  useEffect(()=>{if(askOpen)textarea.current?.focus()},[askOpen]);
  async function run(action:Action,freeQuestion?:string){
    setBusy(action);setError("");setResult(null);
    try{
      const response=await fetch("/api/sprout/tutor",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action,contextType,contextId,...(freeQuestion?{question:freeQuestion}:{})})});
      const data=await response.json();
      if(!response.ok&&!data.response)throw new Error(data.error||"Sprout couldn’t answer that just now.");
      setResult(data);
      if(data.notice)setError(data.notice);
    }catch(reason){setError(reason instanceof Error?reason.message:"Sprout couldn’t answer that just now.")}finally{setBusy(null)}
  }
  function submit(event:FormEvent){event.preventDefault();const value=question.trim();if(value.length<2){setError("Enter a short question for Sprout.");return}void run("ASK_SPROUT",value)}
  const sources=result?.retrievedChunks.filter(chunk=>result.response.citations.includes(chunk.id))??[];
  const visibleActions=allowedActions??actions.map(([action])=>action);
  return <section className="sprout-tutor" aria-labelledby={`${uid}-heading`}>
    <div className="sprout-tutor-heading"><span aria-hidden="true"><Sprout/></span><div><small>SPROUT · GROUNDED HELP</small><h3 id={`${uid}-heading`}>Want to look closer?</h3></div></div>
    <div className="sprout-tutor-actions">{actions.filter(([action])=>visibleActions.includes(action)).map(([action,label,Icon])=><button type="button" key={action} onClick={()=>run(action)} disabled={busy!==null} aria-busy={busy===action} aria-controls={`${uid}-response`}>{busy===action?<LoaderCircle className="spin" aria-hidden="true"/>:<Icon aria-hidden="true"/>}{label}</button>)}{visibleActions.includes("ASK_SPROUT")&&<button type="button" onClick={()=>setAskOpen(open=>!open)} disabled={busy!==null} aria-expanded={askOpen} aria-controls={`${uid}-ask`}><MessageCircleQuestion aria-hidden="true"/>Ask Sprout</button>}</div>
    {askOpen&&visibleActions.includes("ASK_SPROUT")&&<form id={`${uid}-ask`} className="sprout-ask-form" onSubmit={submit}><label htmlFor={`${uid}-question`}>Ask about this learning idea</label><textarea ref={textarea} id={`${uid}-question`} value={question} onChange={event=>setQuestion(event.target.value)} minLength={2} maxLength={200} rows={3} aria-describedby={`${uid}-privacy ${uid}-count`} placeholder="Type one short question"/><div className="sprout-ask-meta"><p id={`${uid}-privacy`}>Don&apos;t share passwords or bank details with Sprout.</p><span id={`${uid}-count`}>{question.length}/200</span></div><button type="submit" className="sprout-ask-submit" disabled={busy!==null||question.trim().length<2}>{busy==="ASK_SPROUT"?<LoaderCircle className="spin" aria-hidden="true"/>:<Send aria-hidden="true"/>}Send question</button></form>}
    {error&&<p className="inline-error" role="alert">{error}</p>}
    <div id={`${uid}-response`} aria-live="polite" aria-atomic="true">{result&&<article className={`sprout-tutor-response ${result.delivery}`}><small>{result.delivery==="decline"?"VERIFIED MATERIAL NOT FOUND":result.delivery==="fallback"?"GROW CURRICULUM RESPONSE":"GROUNDED RESPONSE"}</small><h3 ref={heading} tabIndex={-1}>{result.response.concept}</h3><p>{result.response.answer}</p>{result.response.guidingQuestions.length>0&&<ol aria-label="Questions to help compare the trade-offs">{result.response.guidingQuestions.map(questionItem=><li key={questionItem}>{questionItem}</li>)}</ol>}{result.response.introduceTerm&&<strong>New term: {result.response.introduceTerm}</strong>}{sources.length>0&&<footer><b>Sources used</b>{sources.map(source=><span key={source.id}>{source.title} · {source.sourceLabel}{source.isDraft?" · DRAFT — NEEDS REVIEW":""}</span>)}</footer>}</article>}</div>
  </section>;
}
