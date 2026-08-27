"use client";
import {SproutReaction} from "@/components/sprig/sprig-reaction";
import {getSproutReaction,type SproutContext,type SproutEvent} from "@/lib/sprout-reactions";

export function SproutCompanion({event,ageGroup,context={},reactionKey,soundsEnabled=false,compact=true,className}:{event:SproutEvent;ageGroup:"YOUTH"|"YOUNG_ADULT";context?:SproutContext;reactionKey:string;soundsEnabled?:boolean;compact?:boolean;className?:string}){const reaction=getSproutReaction(event,ageGroup,context);return <SproutReaction reaction={reaction} reactionKey={reactionKey} soundsEnabled={soundsEnabled} compact={compact} className={className}/>}


