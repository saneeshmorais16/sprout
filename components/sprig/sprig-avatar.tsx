import {GrowMascot} from "@/components/grow-mascot";
import type {SproutExpression} from "@/lib/sprout-reactions";

export function SproutAvatar({expression="idle",compact=false,className}:{expression?:SproutExpression;compact?:boolean;className?:string}){return <GrowMascot state={expression} character="SPROUT" compact={compact} className={className}/>}


