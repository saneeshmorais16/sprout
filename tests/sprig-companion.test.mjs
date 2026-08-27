import test from "node:test";
import assert from "node:assert/strict";
import {getSproutReaction,sproutEvents} from "../lib/sprout-reactions-core.mjs";

const required=["LESSON_COMPLETED","BADGE_UNLOCKED","GOAL_CREATED","MISSION_COMPLETED","SCAM_WARNING_FOUND","SIMULATION_GAIN","SIMULATION_LOSS","SIMULATION_VOLATILITY","STREAK_MILESTONE","AGE_MODE_CHANGED"];
const coreLoop=["DAILY_POST_COMPLETED","LAB_STEP_COMPLETED","LAB_COMPLETED","SPARK_COINS_EARNED","PORTFOLIO_DROP","PORTFOLIO_GAIN","HOLD_DECISION","SELL_DECISION","CONCEPT_UNLOCKED","CORRECT_REASONING","LESSON_MISTAKE","LEVEL_COMPLETED"];

test("every required event maps to a complete youth and adult reaction",()=>{
  for(const event of required){
    assert.ok(sproutEvents.includes(event));
    for(const ageGroup of ["YOUTH","YOUNG_ADULT"]){const reaction=getSproutReaction(event,ageGroup);assert.equal(reaction.event,event);assert.ok(reaction.expression);assert.ok(reaction.animation);assert.ok(reaction.message.length>0);assert.ok(reaction.duration>=5000);assert.match(reaction.ariaLive,/^(polite|assertive)$/)}
  }
});

test("core weekly-loop events map across age modes",()=>{for(const event of coreLoop)for(const ageGroup of ["YOUTH","YOUNG_ADULT"]){const reaction=getSproutReaction(event,ageGroup);assert.equal(reaction.event,event);assert.ok(reaction.message.length>0)}});

test("age modes adapt frequency and language",()=>{
  const youth=getSproutReaction("LESSON_COMPLETED","YOUTH");const adult=getSproutReaction("LESSON_COMPLETED","YOUNG_ADULT");
  assert.equal(youth.show,true);assert.equal(adult.show,false);assert.ok(adult.message.length<youth.message.length);
  assert.equal(getSproutReaction("BADGE_UNLOCKED","YOUNG_ADULT").show,true);
});

test("context creates concise educational explanations",()=>{
  assert.equal(getSproutReaction("MISSION_COMPLETED","YOUTH",{diversified:true}).message,"Nice spread. You’re relying less on one outcome.");
  assert.match(getSproutReaction("SCAM_WARNING_FOUND","YOUTH",{warningLabel:"Urgency"}).message,/pause/i);
  assert.match(getSproutReaction("SIMULATION_GAIN","YOUTH",{diversified:true}).message,/another scenario/i);
  assert.match(getSproutReaction("SIMULATION_LOSS","YOUTH",{diversified:true}).message,/could not stop/i);
});

test("Sprout copy avoids advice and guaranteed-outcome claims",()=>{
  for(const event of sproutEvents)for(const ageGroup of ["YOUTH","YOUNG_ADULT"]){const message=getSproutReaction(event,ageGroup).message;assert.doesNotMatch(message,/guaranteed return|you should invest|buy|sell now|financial advice/i)}
});

test("unknown events and age groups fail safely",()=>{
  assert.throws(()=>getSproutReaction("UNKNOWN","YOUTH"),/Unknown Sprout event/);
  assert.throws(()=>getSproutReaction("GOAL_CREATED","CHILD"),/age group/);
});


