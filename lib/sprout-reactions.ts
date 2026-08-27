import {getSproutReaction as getCoreReaction,sproutEvents as coreEvents} from "./sprout-reactions-core.mjs";

export const sproutEvents=coreEvents as readonly SproutEvent[];
export type SproutEvent="LESSON_COMPLETED"|"BADGE_UNLOCKED"|"GOAL_CREATED"|"MISSION_COMPLETED"|"SCAM_WARNING_FOUND"|"SIMULATION_GAIN"|"SIMULATION_LOSS"|"SIMULATION_VOLATILITY"|"STREAK_MILESTONE"|"AGE_MODE_CHANGED"|"EMPTY_STATE"|"SPROUT_APPEARED"|"DAILY_POST_COMPLETED"|"LAB_STEP_COMPLETED"|"LAB_COMPLETED"|"SPARK_COINS_EARNED"|"PORTFOLIO_DROP"|"PORTFOLIO_GAIN"|"HOLD_DECISION"|"SELL_DECISION"|"CONCEPT_UNLOCKED"|"CORRECT_REASONING"|"LESSON_MISTAKE"|"LEVEL_COMPLETED";
export type SproutExpression="idle"|"greeting"|"thinking"|"explaining"|"celebrating"|"warning"|"encouraging"|"surprised"|"reflecting";
export type SproutAnimationName="blink"|"bounce"|"wave"|"thoughtful-tilt"|"celebration"|"caution";
export type SproutSoundName="achievement"|"success"|"warning"|"appearance"|null;
export type SproutContext={diversified?:boolean;warningLabel?:string;streak?:number;nextAgeGroup?:"YOUTH"|"YOUNG_ADULT";emptyLabel?:string;changePercent?:number;customMessage?:string};
export type SproutReactionModel={event:SproutEvent;expression:SproutExpression;animation:SproutAnimationName;message:string;sound:SproutSoundName;duration:number;show:boolean;ariaLive:"polite"|"assertive"};
export const getSproutReaction=getCoreReaction as (event:SproutEvent,ageGroup:"YOUTH"|"YOUNG_ADULT",context?:SproutContext)=>SproutReactionModel;


