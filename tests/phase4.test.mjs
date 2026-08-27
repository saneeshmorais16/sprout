import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

test("Sprout and portfolio language remain educational and non-advisory", () => {
  const reactions = readFileSync("lib/sprout-reactions-core.mjs", "utf8");
  const portfolio = readFileSync("components/practice-portfolio.tsx", "utf8");
  assert.match(reactions, /PORTFOLIO_DROP/);
  assert.match(reactions, /another scenario|Markets can move both ways|different outcome/i);
  assert.match(portfolio, /Neither action is labelled correct/);
  assert.match(portfolio, /not a forecast/);
  assert.match(portfolio, /Virtual · not redeemable/);
});

