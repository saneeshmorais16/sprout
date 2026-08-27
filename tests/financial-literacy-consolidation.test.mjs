import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read=path=>readFileSync(path,"utf8");

test("the visible product is organised around broad financial literacy",()=>{
  const skills=read("lib/financial-literacy.ts");
  const home=read("app/dashboard/page.tsx");
  const progress=read("app/progress/page.tsx");
  for(const label of ["Saving","Budgeting","Staying Safe","Earning","Borrowing","Planning","Investing Basics"])assert.match(skills,new RegExp(label));
  assert.match(home,/Today’s Decision/);
  assert.match(home,/This Week’s Lab/);
  assert.match(home,/CURRENT LEVEL/);
  assert.match(home,/Learn → Decide → See what happens/);
  assert.match(progress,/not a financial score/i);
  assert.match(progress,/Financial skills/);
});

test("the six priority Labs and their reinforcement posts are seeded",()=>{
  const seed=read("prisma/seed.ts");
  for(const title of ["The £20 Head Start","Where Did My Money Go?","The True Cost of Later","Can You Spot the Scam?","Why Does £20 Buy Less?","Save or Invest?"])assert.match(seed,new RegExp(title.replace(/[?]/g,"\\?")));
  for(const concept of ["COMPOUNDING","OPPORTUNITY_COST","BORROWING_COST","URGENCY_TACTICS","INFLATION","TIME_HORIZON"])assert.match(seed,new RegExp(concept));
});

test("Sprout is the public companion name while legacy storage remains compatible",()=>{
  const bubble=read("components/sprig/sprig-bubble.tsx");
  const mascot=read("components/grow-mascot.tsx");
  const reactions=read("lib/sprout-reactions-core.mjs");
  const preferences=read("components/profile-preferences.tsx");
  assert.match(bubble,/Sprout says/);
  assert.match(mascot,/financial-learning companion/);
  assert.match(reactions,/SPROUT_APPEARED/);
  assert.match(preferences,/Sprout sounds/);
  assert.doesNotMatch(`${bubble}\n${preferences}`,/Sprig/);
  assert.match(mascot,/SPRIG: "Sprout"/);
});
