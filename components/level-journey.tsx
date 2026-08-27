import Link from "next/link";
import {Check,ChevronRight,Flag,Gift,LockKeyhole,Sparkles} from "lucide-react";
import {deriveLearningJourney} from "@/lib/learning-levels";

export function LevelJourney({completedSlugs,availableSlugs}:{completedSlugs:string[];availableSlugs:string[]}){
  const completed=new Set(completedSlugs);const available=new Set(availableSlugs);const levels=deriveLearningJourney(completed);
  return <section className="level-journey" aria-labelledby="level-path-heading"><header><span><Sparkles/> YOUR LEVEL PATH</span><h2 id="level-path-heading">Grow one decision at a time</h2><p>Finish learning activities to unlock the next level. Spark Coins and portfolio results never unlock levels.</p></header><ol>{levels.map(level=><li key={level.number} className={`level-stage ${level.state} ${level.checkpoint?"checkpoint":""}`}>
    <div className="level-node" aria-hidden="true">{level.state==="completed"?<Check/>:level.state==="locked"?<LockKeyhole/>:level.number}</div>
    <article aria-label={`Level ${level.number}: ${level.title}. ${level.state}.`}><div className="level-card-heading"><div><small>LEVEL {level.number}{level.checkpoint?" · CHECKPOINT":""}</small><h3>{level.title}</h3></div><span className={`level-state ${level.state}`}>{level.state==="completed"?<><Check/> Complete</>:level.state==="current"?<><Flag/> Current</>:<><LockKeyhole/> Locked</>}</span></div><p>{level.summary}</p>
      <ol className="level-lessons">{level.lessons.map((lesson,index)=>{const unavailable=!available.has(lesson.slug);const state=unavailable?"locked":lesson.state;const body=<><i aria-hidden="true">{state==="completed"?<Check/>:state==="locked"?<LockKeyhole/>:index+1}</i><span><strong>{lesson.title}</strong><small>{state==="completed"?"Completed · open to review":state==="current"?"Next activity · about 3 min":"Complete earlier activities first"}</small></span>{state!=="locked"&&<ChevronRight aria-hidden="true"/>}</>;return <li key={lesson.slug}>{state!=="locked"?<Link href={`/learn/${lesson.slug}`} aria-label={`${state==="completed"?"Review":"Start"} ${lesson.title}.`}>{body}</Link>:<div aria-label={`${lesson.title}. Locked.`}>{body}</div>}</li>})}</ol>
      <div className={`level-reward ${level.rewardState}`}><Gift aria-hidden="true"/><span><strong>{level.rewardState==="earned"?"Learning reward earned":level.rewardState==="available"?"Learning rewards available":"Learning rewards locked"}</strong><small>Spark Coins come from completing activities and reflections.</small></span></div>
    </article></li>)}</ol></section>;
}
