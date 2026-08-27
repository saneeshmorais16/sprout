import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read=path=>readFileSync(path,"utf8");

test("the active product is ages 15–18 with the final four-item navigation",()=>{
  const onboarding=read("components/age-onboarding.tsx");
  const nav=read("components/product-nav.tsx");
  assert.match(onboarding,/const ages=\[15,16,17,18\]/);
  assert.doesNotMatch(onboarding,/19|20|21|22|23|24|25/);
  for(const label of ["Home","Learn","Practice","Progress"])assert.match(nav,new RegExp(`\\["${label}"`));
  assert.doesNotMatch(nav,/\["Portfolio"/);
});

test("the flagship Practice flow unlocks volatility and requires reflection",()=>{
  const decision=read("app/api/portfolio/runs/[id]/decision/route.ts");
  const unlock=read("app/api/portfolio/runs/[id]/unlock/route.ts");
  const player=read("components/practice-portfolio.tsx");
  assert.doesNotMatch(decision,/conceptUnlock\.upsert/);
  assert.match(decision,/CONSEQUENCE_READY/);
  assert.match(unlock,/concept:\s*"VOLATILITY"/);
  assert.match(unlock,/conceptUnlock\.upsert/);
  assert.match(player,/That’s called/);
  assert.match(player,/VOLATILITY/);
  assert.match(player,/PORTFOLIO_VOLATILITY/);
  assert.match(player,/Another period could look different/);
  assert.match(player,/ref=\{stageHeading\}/);
});

test("the visible curriculum covers the final financial-literacy breadth",()=>{
  const learn=read("lib/learning-levels.ts");
  const seed=read("prisma/seed.ts");
  for(const topic of ["Budgeting","Saving","Spending","First pay","Inflation","Compounding","Borrowing","BNPL","scams","Subscriptions","Emergency buffer","Investing Basics"])assert.match(learn,new RegExp(topic,"i"));
  assert.match(seed,/bnpl-basics/);
  assert.match(seed,/emergency-buffer/);
});

test("the Home hierarchy introduces status before one primary learning decision",()=>{
  const home=read("app/dashboard/page.tsx");
  assert.ok(home.indexOf('className="core-stats"')<home.indexOf('className="today-post-section"'));
  assert.ok(home.indexOf('className="today-post-section"')<home.indexOf('className="weekly-lab-section"'));
});
