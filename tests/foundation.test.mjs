import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

test("database foundation contains every Phase 1 model", async () => {
  const schema = await read("prisma/schema.prisma");
  for (const model of ["User", "Profile", "Session", "GuardianApproval", "Goal", "GoalContribution", "LearningModule", "LearningProgress", "Video", "FeedItem", "WireStory", "Achievement", "UserAchievement", "Activity", "SimulatorSession"]) assert.match(schema, new RegExp(`model ${model} \\{`));
  assert.match(schema, /tokenHash\s+String\s+@unique/);
  assert.match(schema, /expiresAt\s+DateTime/);
});

test("sessions use server cookies with production security flags", async () => {
  const auth = await read("lib/auth.ts");
  assert.match(auth, /httpOnly:\s*true/);
  assert.match(auth, /sameSite:\s*"lax"/);
  assert.match(auth, /secure:\s*process\.env\.NODE_ENV === "production"/);
  assert.doesNotMatch(auth, /localStorage|sessionStorage/);
});

test("guardian approval is retained only for migration compatibility and retired at the API", async () => {
  const [schema, decision, request] = await Promise.all([read("prisma/schema.prisma"), read("app/api/guardian/decision/route.ts"), read("app/api/guardian/request/route.ts")]);
  assert.match(schema, /model GuardianApproval/);
  assert.match(decision, /status: 410/);
  assert.match(request, /status: 410/);
  assert.doesNotMatch(decision, /tokenHash|APPROVED/);
});

test("role protection and security headers are server-side", async () => {
  const [admin, proxy] = await Promise.all([read("app/api/admin/presenter/route.ts"), read("proxy.ts")]);
  assert.match(admin, /admin\?\.role!=="ADMIN"|requireRole\(\["ADMIN"\]/);
  assert.match(proxy, /Content-Security-Policy/);
  assert.match(proxy, /X-Content-Type-Options/);
  assert.match(proxy, /X-Frame-Options/);
});
