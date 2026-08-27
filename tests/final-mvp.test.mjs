import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { hash } from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const base = "http://localhost:3000";
const env = Object.fromEntries(readFileSync(".env", "utf8").split(/\r?\n/).filter((line) => line && !line.startsWith("#")).map((line) => { const index = line.indexOf("="); const raw = line.slice(index + 1).trim(); return [line.slice(0, index), raw.replace(/^(["'])(.*)\1$/, "$2")]; }));
const prisma = new PrismaClient();
let ip = 80;
async function login(email, password) { ip += 1; const response = await fetch(`${base}/api/auth/login`, { method: "POST", headers: { "content-type": "application/json", origin: base, "x-forwarded-for": `10.1.0.${ip}` }, body: JSON.stringify({ email, password }), redirect: "manual" }); assert.equal(response.status, 200); return response.headers.get("set-cookie").split(";")[0]; }
async function authed(path, cookie, options = {}) { return fetch(`${base}${path}`, { ...options, headers: { origin: base, cookie, ...options.headers } }); }

test("strict ages 15–18 product scope and deterministic demo", async (t) => {
  const email = `strict-mvp-${Date.now()}@example.test`;
  const password = "SafeTestPass123!";
  const user = await prisma.user.create({ data: { email, passwordHash: await hash(password, 4), role: "USER", profile: { create: { firstName: "Ari" } } } });
  t.after(async () => prisma.user.delete({ where: { id: user.id } }));
  const cookie = await login(email, password);
  const onboarding = (age) => authed("/api/profile/onboarding", cookie, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ age, interests: ["SAVING", "COMPOUNDING", "DIVERSIFICATION"], confidenceBaseline: 3 }) });

  await t.test("all supported ages enter directly in one learning mode", async () => {
    for (const age of [15, 16, 17, 18]) {
      const response = await onboarding(age);
      assert.equal(response.status, 200);
      assert.equal((await response.json()).next, "/dashboard");
      const profile = await prisma.profile.findUniqueOrThrow({ where: { userId: user.id } });
      assert.deepEqual({ age: profile.age, ageGroup: profile.ageGroup, guardianStatus: profile.guardianStatus }, { age, ageGroup: "YOUTH", guardianStatus: "NOT_REQUIRED" });
    }
    assert.equal((await onboarding(14)).status, 400);
    assert.equal((await onboarding(19)).status, 400);
    assert.equal((await authed("/dashboard", cookie)).status, 200);
  });

  await t.test("guardian gating is retired and cannot be reactivated", async () => {
    const legacyPage = await authed("/guardian", cookie, { redirect: "follow" }); assert.equal(legacyPage.status, 200); assert.doesNotMatch(await legacyPage.text(), /Send approval request|guardian email/i);
    assert.equal((await authed("/api/guardian/request", cookie, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ guardianName: "Test", guardianEmail: "guardian@example.com" }) })).status, 410);
    assert.equal(await prisma.guardianApproval.count({ where: { userId: user.id } }), 0);
  });

  await t.test("core decisions remain server-owned", async () => {
    const fake = await authed("/api/portfolio/runs", cookie, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ level: 1, path: "STEADY", allocation: 50, sparkCoins: 10000, selectedOutcome: 999999 }) });
    assert.equal(fake.status, 400);
    const saving = await authed("/api/practice/decisions/saving", cookie, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ optionId: "SAVE_30", userId: "someone-else" }) });
    assert.equal(saving.status, 201);
    const stored = await prisma.decisionSession.findFirstOrThrow({ where: { userId: user.id, scenarioKey: "YOUTH_SAVING_SURPRISE" }, orderBy: { createdAt: "desc" } });
    assert.equal(stored.userId, user.id);
  });

  await t.test("Presenter Mode stays protected and cannot restore age 24", async () => {
    assert.equal((await authed("/api/admin/presenter", cookie, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "PREPARE_DEMO" }) })).status, 403);
    const adminCookie = await login(env.ADMIN_EMAIL, env.ADMIN_PASSWORD);
    assert.equal((await authed("/api/admin/presenter", adminCookie, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "AGE_24" }) })).status, 400);
    assert.equal((await authed("/api/admin/presenter", adminCookie, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "PREPARE_DEMO" }) })).status, 200);
    const maya = await prisma.user.findUniqueOrThrow({ where: { email: env.MAYA_EMAIL.toLowerCase() }, include: { profile: true } });
    assert.deepEqual({ age: maya.profile.age, ageGroup: maya.profile.ageGroup, guardianStatus: maya.profile.guardianStatus }, { age: 16, ageGroup: "YOUTH", guardianStatus: "NOT_REQUIRED" });
  });
});

test("accessibility foundation is present in the core loop", () => {
  const globalCss = readFileSync("app/globals.css", "utf8");
  const phaseCss = readFileSync("app/phase6.css", "utf8");
  const shell = readFileSync("components/app-shell.tsx", "utf8");
  const nav = readFileSync("components/product-nav.tsx", "utf8");
  const portfolio = readFileSync("components/practice-portfolio.tsx", "utf8");
  assert.match(shell, /Skip to main content/);
  assert.match(shell, /id="main-content"/);
  assert.match(nav, /aria-current/);
  assert.match(globalCss, /prefers-reduced-motion:reduce/);
  assert.match(globalCss, /env\(safe-area-inset-bottom\)/);
  assert.match(globalCss, /outline:3px solid/);
  assert.match(phaseCss, /min-height:44px/);
  assert.match(portfolio, /role="img"/);
  assert.match(portfolio, /Historical path from/);
});

test.after(async () => prisma.$disconnect());
