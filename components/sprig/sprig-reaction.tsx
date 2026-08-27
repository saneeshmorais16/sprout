"use client";
import {useEffect,useState} from "react";
import {SproutAnimation} from "@/components/sprig/sprig-animation";
import {SproutAvatar} from "@/components/sprig/sprig-avatar";
import {SproutBubble} from "@/components/sprig/sprig-bubble";
import {SproutSound} from "@/components/sprig/sprig-sound";
import type {SproutReactionModel} from "@/lib/sprout-reactions";

export function SproutReaction({reaction,reactionKey,soundsEnabled=false,compact=true,className=""}:{reaction:SproutReactionModel;reactionKey:string;soundsEnabled?:boolean;compact?:boolean;className?:string}){const[active,setActive]=useState(false);const[bubble,setBubble]=useState(true);useEffect(()=>{const timer=window.setTimeout(()=>{setActive(false);if(!reaction.show)return;const key=`grow:sprig-reaction:${reactionKey}`;try{if(sessionStorage.getItem(key))return;sessionStorage.setItem(key,"seen")}catch{void 0}setActive(true);setBubble(true)},0);return()=>window.clearTimeout(timer)},[reaction.show,reactionKey]);useEffect(()=>{if(!active||!bubble)return;const timer=window.setTimeout(()=>setBubble(false),reaction.duration);return()=>window.clearTimeout(timer)},[active,bubble,reaction.duration]);if(!active)return null;return <aside className={`sprig-reaction ${className}`.trim()} data-expression={reaction.expression}><SproutAnimation animation={reaction.animation}><SproutAvatar expression={reaction.expression} compact={compact}/></SproutAnimation>{bubble&&<SproutBubble message={reaction.message} ariaLive={reaction.ariaLive} onDismiss={()=>setBubble(false)}/>}<SproutSound key={reactionKey} sound={reaction.sound} enabled={soundsEnabled}/></aside>}


