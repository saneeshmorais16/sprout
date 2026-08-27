"use client";
import {X} from "lucide-react";

export function SproutBubble({message,onDismiss,ariaLive="polite"}:{message:string;onDismiss?:()=>void;ariaLive?:"polite"|"assertive"}){return <div className="sprig-bubble" role="status" aria-live={ariaLive} aria-atomic="true"><span className="sprig-bubble-label">Sprout says</span><p>{message}</p>{onDismiss&&<button type="button" onClick={onDismiss} aria-label="Dismiss Sprout message"><X/></button>}</div>}

