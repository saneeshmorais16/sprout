import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {performance} from "node:perf_hooks";
import {PrismaClient} from "@prisma/client";

const base="http://localhost:3000";
const env=Object.fromEntries(readFileSync(".env","utf8").split(/\r?\n/).filter(line=>line&&!line.startsWith("#")).map(line=>{const index=line.indexOf("=");const raw=line.slice(index+1).trim();return[line.slice(0,index),raw.replace(/^(["'])(.*)\1$/,"$2")]}));
const prisma=new PrismaClient();let ip=230;
async function login(email,password){ip+=1;const response=await fetch(`${base}/api/auth/login`,{method:"POST",headers:{"content-type":"application/json",origin:base,"x-forwarded-for":`10.60.0.${ip}`},body:JSON.stringify({email,password})});assert.equal(response.status,200);return response.headers.get("set-cookie").split(";")[0]}
async function authed(path,cookie,options={}){return fetch(`${base}${path}`,{...options,headers:{origin:base,cookie,...options.headers}})}
async function post(path,cookie,body){return authed(path,cookie,{method:"POST",headers:{"content-type":"application/json"},...(body===undefined?{}:{body:JSON.stringify(body)})})}
async function balance(userId){return(await prisma.sparkCoinEvent.aggregate({where:{userId},_sum:{amount:true}}))._sum.amount??0}

test("Slides 11–17 deterministic demo lock runs three times without drift",async()=>{
  const adminCookie=await login(env.ADMIN_EMAIL,env.ADMIN_PASSWORD);
  const mayaCookie=await login(env.MAYA_EMAIL,env.MAYA_PASSWORD);
  const maya=await prisma.user.findUniqueOrThrow({where:{email:env.MAYA_EMAIL.toLowerCase()},include:{profile:true}});
  const timings=[];
  for(let runNumber=1;runNumber<=3;runNumber+=1){
    const startedAt=performance.now();
    const prepared=await post("/api/admin/presenter",adminCookie,{action:"PREPARE_DEMO"});assert.equal(prepared.status,200);
    const profile=await prisma.profile.findUniqueOrThrow({where:{userId:maya.id}});assert.equal(profile.age,16);assert.equal(profile.demoDay,"MONDAY");assert.equal(await balance(maya.id),150);
    assert.equal(await prisma.conceptUnlock.count({where:{userId:maya.id,concept:"VOLATILITY"}}),0);
    for(const step of[1,2,3])assert.equal((await post("/api/labs/the-20-head-start/progress",mayaCookie,{step})).status,200);
    for(const[slug,choice]of[["head-start-reinforcement","BIGGER"],["start-now-or-wait","START_NOW"],["small-amounts-count","TRUE"]])assert.equal((await post(`/api/daily-posts/${slug}/complete`,mayaCookie,{choice})).status,201);
    assert.equal(await balance(maya.id),300);
    const replay=await post("/api/portfolio/runs",mayaCookie,{level:1,industry:"TECH",allocation:150});assert.equal(replay.status,201);const replayBody=await replay.json();assert.equal(replayBody.balance,150);
    const decision=await post(`/api/portfolio/runs/${replayBody.run.id}/decision`,mayaCookie,{decision:"HOLD"});assert.equal(decision.status,200);
    const consequence=await prisma.portfolioRun.findUniqueOrThrow({where:{id:replayBody.run.id}});assert.equal(consequence.status,"CONSEQUENCE_READY");assert.equal(await prisma.conceptUnlock.count({where:{userId:maya.id,concept:"VOLATILITY"}}),0);
    const unlocked=await post(`/api/portfolio/runs/${replayBody.run.id}/unlock`,mayaCookie);assert.equal(unlocked.status,200);const unlockedBody=await unlocked.json();assert.equal(unlockedBody.coinsAwarded,50);assert.equal(unlockedBody.balance,200);
    assert.equal(await prisma.conceptUnlock.count({where:{userId:maya.id,concept:"VOLATILITY"}}),1);
    const replayUnlock=await post(`/api/portfolio/runs/${replayBody.run.id}/unlock`,mayaCookie);assert.equal(replayUnlock.status,200);assert.equal((await replayUnlock.json()).coinsAwarded,0);assert.equal(await balance(maya.id),200);
    const reflection=await post("/api/practice/reflection",mayaCookie,{activityKey:"PORTFOLIO_VOLATILITY",choice:"COMPARE_TRADE_OFFS"});assert.ok([200,201].includes(reflection.status));
    assert.equal((await authed("/progress",mayaCookie)).status,200);
    const elapsed=Math.round(performance.now()-startedAt);timings.push(elapsed);console.log(`DEMO_RUN_${runNumber}_MS=${elapsed}`);
  }
  assert.equal(new Set(timings.map(value=>Number.isFinite(value))).size,1);
  assert.equal((await post("/api/admin/presenter",adminCookie,{action:"PREPARE_DEMO"})).status,200);
  assert.equal(await balance(maya.id),150);
  assert.equal(await prisma.sparkCoinEvent.count({where:{userId:maya.id}}),1);
  assert.equal(await prisma.conceptUnlock.count({where:{userId:maya.id,concept:"VOLATILITY"}}),0);
});

test.after(async()=>{await prisma.$disconnect()});
