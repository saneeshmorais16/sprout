import type {ReactNode} from "react";
import type {SproutAnimationName} from "@/lib/sprout-reactions";

export function SproutAnimation({animation,children,className=""}:{animation:SproutAnimationName;children:ReactNode;className?:string}){return <div className={`sprig-animation sprig-animation-${animation} ${className}`.trim()} data-animation={animation}>{children}</div>}


