export const sproutEvents = [
  "LESSON_COMPLETED", "BADGE_UNLOCKED", "GOAL_CREATED", "MISSION_COMPLETED",
  "SCAM_WARNING_FOUND", "SIMULATION_GAIN", "SIMULATION_LOSS", "SIMULATION_VOLATILITY",
  "STREAK_MILESTONE", "AGE_MODE_CHANGED", "EMPTY_STATE", "SPROUT_APPEARED",
  "DAILY_POST_COMPLETED", "LAB_STEP_COMPLETED", "LAB_COMPLETED", "SPARK_COINS_EARNED",
  "PORTFOLIO_DROP", "PORTFOLIO_GAIN", "HOLD_DECISION", "SELL_DECISION", "CONCEPT_UNLOCKED",
  "CORRECT_REASONING", "LESSON_MISTAKE", "LEVEL_COMPLETED",
];

const reactions = {
  LESSON_COMPLETED:{expression:"encouraging",animation:"wave",sound:null,youth:"Nice work. You turned that idea into a skill.",adult:"Lesson complete.",adultShow:false},
  BADGE_UNLOCKED:{expression:"celebrating",animation:"celebration",sound:"achievement",youth:"You earned that by learning — not by taking more risk.",adult:"Earned through learning, not risk.",adultShow:true},
  GOAL_CREATED:{expression:"encouraging",animation:"bounce",sound:"success",youth:"Your goal has a first step. That makes it easier to start.",adult:"Goal saved. Your next step is clear.",adultShow:true},
  MISSION_COMPLETED:{expression:"celebrating",animation:"celebration",sound:"success",youth:"Mission complete. Your confidence grew through practice.",adult:"Practice complete. Keep the takeaway.",adultShow:true},
  SCAM_WARNING_FOUND:{expression:"warning",animation:"caution",sound:"warning",youth:"Big promises deserve a closer look.",adult:"Big promises deserve scrutiny.",adultShow:true},
  SIMULATION_GAIN:{expression:"explaining",animation:"thoughtful-tilt",sound:null,youth:"Your portfolio rose here, but another scenario could look very different.",adult:"It rose in this example. Another scenario could differ.",adultShow:true},
  SIMULATION_LOSS:{expression:"explaining",animation:"caution",sound:null,youth:"That drop looks uncomfortable. Markets can move both ways.",adult:"This fall shows that outcomes can move both ways.",adultShow:true},
  SIMULATION_VOLATILITY:{expression:"surprised",animation:"thoughtful-tilt",sound:null,youth:"The path moved around. The ending never tells the whole story.",adult:"Volatility changed the journey, not just the ending.",adultShow:true},
  STREAK_MILESTONE:{expression:"celebrating",animation:"bounce",sound:"success",youth:"Your learning streak is growing. Consistency built it.",adult:"A steady learning streak. Nicely built.",adultShow:true},
  AGE_MODE_CHANGED:{expression:"greeting",animation:"wave",sound:"appearance",youth:"Your GROW path now fits the under-18 experience.",adult:"Your path now focuses on young-adult decisions.",adultShow:true},
  EMPTY_STATE:{expression:"encouraging",animation:"wave",sound:null,youth:"Start small. One useful decision is enough for today.",adult:"Start with one useful next step.",adultShow:true},
  SPROUT_APPEARED:{expression:"greeting",animation:"blink",sound:"appearance",youth:"I’m here when a decision needs unpacking.",adult:"Here when a decision needs context.",adultShow:false},
  DAILY_POST_COMPLETED:{expression:"encouraging",animation:"wave",sound:"success",youth:"One decision done. You strengthened this week’s idea.",adult:"Daily practice complete.",adultShow:true},
  LAB_STEP_COMPLETED:{expression:"thinking",animation:"thoughtful-tilt",sound:null,youth:"Keep watching what changes before we name the idea.",adult:"Notice the consequence before the terminology.",adultShow:false},
  LAB_COMPLETED:{expression:"celebrating",animation:"celebration",sound:"success",youth:"You experienced it before learning the name. That’s compounding.",adult:"Experience first, then the term: compounding.",adultShow:true},
  SPARK_COINS_EARNED:{expression:"celebrating",animation:"bounce",sound:"success",youth:"Those Spark Coins came from learning — not taking more risk.",adult:"Spark Coins earned through learning.",adultShow:true},
  PORTFOLIO_DROP:{expression:"surprised",animation:"caution",sound:null,youth:"Uh-oh — this path moved down. Bigger swings can happen.",adult:"This historical path moved down. Outcomes can move both ways.",adultShow:true},
  PORTFOLIO_GAIN:{expression:"explaining",animation:"thoughtful-tilt",sound:null,youth:"It rose in this period. Another period could look very different.",adult:"It rose in this historical period; that is not a forecast.",adultShow:true},
  HOLD_DECISION:{expression:"reflecting",animation:"thoughtful-tilt",sound:null,youth:"Holding kept your coins exposed to every later move — up or down.",adult:"Holding retained exposure to the later historical movement.",adultShow:true},
  SELL_DECISION:{expression:"reflecting",animation:"thoughtful-tilt",sound:null,youth:"Moving out fixed the value there, so later moves no longer changed it.",adult:"Selling fixed the value at that historical point.",adultShow:true},
  CONCEPT_UNLOCKED:{expression:"explaining",animation:"wave",sound:null,youth:"Now the name has something real to connect to.",adult:"The term now connects to an experienced consequence.",adultShow:true},
  CORRECT_REASONING:{expression:"encouraging",animation:"wave",sound:null,youth:"Good reasoning. You checked what changes next.",adult:"That reasoning follows the trade-off.",adultShow:true},
  LESSON_MISTAKE:{expression:"reflecting",animation:"thoughtful-tilt",sound:null,youth:"That choice teaches us something too. Look at what changed.",adult:"Use the consequence to test that choice.",adultShow:true},
  LEVEL_COMPLETED:{expression:"celebrating",animation:"celebration",sound:"achievement",youth:"Level complete. Your next set of decisions is open.",adult:"Level complete. The next set is open.",adultShow:true},
};

export function getSproutReaction(event, ageGroup, context={}) {
  if (!sproutEvents.includes(event)) throw new Error(`Unknown Sprout event: ${event}`);
  if (ageGroup !== "YOUTH" && ageGroup !== "YOUNG_ADULT") throw new Error("Sprout reactions require an age group.");
  const base=reactions[event];const adult=ageGroup==="YOUNG_ADULT";let message=adult?base.adult:base.youth;let expression=base.expression;let animation=base.animation;let sound=base.sound;
  if(event==="MISSION_COMPLETED"&&context.diversified){message=adult?"A broader spread relies less on one outcome.":"Nice spread. You’re relying less on one outcome.";expression="explaining";animation="thoughtful-tilt"}
  if(event==="SIMULATION_GAIN"&&context.diversified){message=adult?"It rose here. The spread reduced reliance on one category, but another scenario could differ.":"It rose in this example. Your spread relied less on one category, but another scenario could look different."}
  if(event==="SIMULATION_LOSS"&&context.diversified){message=adult?"The spread reduced reliance on one category, but it could not remove the fall.":"The spread helped avoid one single outcome, but it could not stop the fall."}
  if(event==="SCAM_WARNING_FOUND"&&context.warningLabel){message=adult?`${context.warningLabel}: pause and check the claim.`:`${context.warningLabel}. That’s a reason to pause.`}
  if(event==="STREAK_MILESTONE"&&context.streak){message=adult?`${context.streak} learning days. Consistency built that.`:`${context.streak} learning days! You built that through consistency.`}
  if(event==="AGE_MODE_CHANGED"&&context.nextAgeGroup){message=context.nextAgeGroup==="YOUTH"?"Your path now uses youth safeguards and simpler practice.":"Your path now uses calmer, more detailed adult scenarios."}
  if(event==="EMPTY_STATE"&&context.emptyLabel){message=adult?`No ${context.emptyLabel} yet. Start with one useful step.`:`No ${context.emptyLabel} yet. Let’s grow the first one.`}
  if(context.customMessage)message=context.customMessage;
  return {event,expression,animation,message,sound,duration:adult?5200:7000,show:adult?base.adultShow:true,ariaLive:event==="SCAM_WARNING_FOUND"?"assertive":"polite"};
}

