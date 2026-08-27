import test from "node:test";
import assert from "node:assert/strict";
import {PrismaClient} from "@prisma/client";

const base="http://localhost:3000";
const prisma=new PrismaClient();
const email=`journey-${Date.now()}@example.test`;
const password="SafeJourneyPass123!";
let userId="";
const authed=(path,cookie,options={})=>fetch(`${base}${path}`,{...options,headers:{origin:base,cookie,...options.headers}});

test("Register → age 16 → Lab → Daily Post → Practice → volatility → reflection → Progress",async()=>{
  const registered=await fetch(`${base}/api/auth/register`,{method:"POST",headers:{"content-type":"application/json",origin:base,"x-forwarded-for":"10.30.0.16"},body:JSON.stringify({firstName:"Journey",email,password,confirmPassword:password})});
  assert.equal(registered.status,200);
  const cookie=registered.headers.get("set-cookie").split(";")[0];
  const user=await prisma.user.findUniqueOrThrow({where:{email}});userId=user.id;

  const onboarded=await authed("/api/profile/onboarding",cookie,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({age:16,interests:["SAVING","BUDGETING"],confidenceBaseline:2})});
  assert.equal(onboarded.status,200);
  assert.equal((await authed("/dashboard",cookie)).status,200);

  for(const step of [1,2,3])assert.equal((await authed("/api/labs/the-20-head-start/progress",cookie,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({step})})).status,200);
  for(const[slug,choice]of [["head-start-reinforcement","BIGGER"],["start-now-or-wait","START_NOW"],["small-amounts-count","TRUE"]]){const daily=await authed(`/api/daily-posts/${slug}/complete`,cookie,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({choice})});assert.equal(daily.status,201)}

  const started=await authed("/api/portfolio/runs",cookie,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({level:1,industry:"FOOD",allocation:150})});assert.equal(started.status,201);const run=await started.json();
  const decided=await authed(`/api/portfolio/runs/${run.run.id}/decision`,cookie,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({decision:"HOLD"})});assert.equal(decided.status,200);
  assert.equal(await prisma.conceptUnlock.count({where:{userId,concept:"VOLATILITY"}}),0);
  assert.equal((await authed(`/api/portfolio/runs/${run.run.id}/unlock`,cookie,{method:"POST"})).status,200);
  assert.equal(await prisma.conceptUnlock.count({where:{userId,concept:"VOLATILITY"}}),1);

  const reflected=await authed("/api/practice/reflection",cookie,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({activityKey:"PORTFOLIO_VOLATILITY",choice:"COMPARE_TRADE_OFFS"})});assert.equal(reflected.status,201);
  assert.equal(await prisma.practiceReflection.count({where:{userId,activityKey:"PORTFOLIO_VOLATILITY"}}),1);
  assert.equal((await authed("/progress",cookie)).status,200);

  const balance=(await prisma.sparkCoinEvent.aggregate({where:{userId},_sum:{amount:true}}))._sum.amount||0;
  assert.equal(balance,50);
});

test.after(async()=>{await prisma.user.deleteMany({where:{OR:[{id:userId||"missing"},{email}]}});await prisma.$disconnect()});
