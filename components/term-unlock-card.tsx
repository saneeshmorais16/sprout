import {Lightbulb} from "lucide-react";

export function TermUnlockCard({experience,term,children}:{experience:string;term:string;children:React.ReactNode}){
  return <section className="term-unlock-card" role="status" aria-live="polite"><span><Lightbulb aria-hidden="true"/> CONCEPT UNLOCKED</span><p>{experience}</p><h2>This idea is called <strong>{term}</strong>.</h2><div>{children}</div></section>;
}
