import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read=path=>readFileSync(path,"utf8");

test("the final Sprout shell exposes exactly four stable primary destinations",()=>{
  const nav=read("components/product-nav.tsx");
  for(const entry of ['["Home","/dashboard"','["Learn","/learn"','["Practice","/portfolio"','["Progress","/progress"'])assert.ok(nav.includes(entry));
  assert.doesNotMatch(nav,/\["Lab"|\["Profile"|\["Goals"/);
});

test("the requested seven-level financial literacy journey is explicit",()=>{
  const levels=read("lib/learning-levels.ts");
  const journey=read("components/level-journey.tsx");
  for(const title of ["Money Basics","Saving & Compounding","Money in Real Life","Borrowing & Credit","Protect Your Money","Money Over Time","Investing Basics"])assert.ok(levels.includes(`title:"${title}"`));
  assert.match(journey,/portfolio results never unlock levels/i);
});

test("available level activities remain keyboard-operable links",()=>{
  const journey=read("components/level-journey.tsx");
  assert.ok(journey.includes('state!=="locked"?<Link'));
  assert.match(journey,/aria-label=.*Review.*Start/);
});

test("the visual system includes touch, focus and reduced-motion safeguards",()=>{
  const css=read("app/phase6.css");
  assert.match(css,/\.sprig-bubble button\{width:44px;height:44px/);
  assert.match(css,/\.level-lessons a:focus-visible/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
});
