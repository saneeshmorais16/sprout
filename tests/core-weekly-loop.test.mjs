import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {PrismaClient} from "@prisma/client";

const base="http://localhost:3000";
const env=Object.fromEntries(readFileSync(".env","utf8").split(/\r?\n/).filter(line=>line&&!line.startsWith("#")).map(line=>{const index=line.indexOf("=");const raw=line.slice(index+1).trim();return[line.slice(0,index),raw.replace(/^(["'])(.*)\1$/,"$2")]}));
const prisma=new PrismaClient();let ip=210;
async function login(email,password){ip+=1;const response=await fetch(`${base}/api/auth/login`,{method:"POST",headers:{"content-type":"application/json",origin:base,"x-forwarded-for":`10.10.0.${ip}`},body:JSON.stringify({email,password})});assert.equal(response.status,200);return response.headers.get("set-cookie").split(";")[0]}
async function authed(path,cookie,options={}){return fetch(`${base}${path}`,{...options,headers:{origin:base,cookie,...options.headers}})}

test("Weekly Lab → Daily Post → Portfolio is server-authoritative",async t=>{
  const editor=await prisma.user.findUniqueOrThrow({where:{email:env.EDITOR_EMAIL.toLowerCase()}});
  const editorCookie=await login(env.EDITOR_EMAIL,env.EDITOR_PASSWORD);
  const mayaCookie=await login(env.MAYA_EMAIL,env.MAYA_PASSWORD);
  const lab=await prisma.weeklyLab.findUniqueOrThrow({where:{slug:"the-20-head-start"}});
  const posts=await prisma.dailyPost.findMany({where:{slug:{in:["head-start-reinforcement","start-now-or-wait","small-amounts-count"]}}});
  const postBySlug=Object.fromEntries(posts.map(post=>[post.slug,post]));
  async function reset(){await prisma.portfolioRun.deleteMany({where:{userId:editor.id}});await prisma.dailyPostProgress.deleteMany({where:{userId:editor.id}});await prisma.weeklyLabProgress.deleteMany({where:{userId:editor.id}});await prisma.conceptUnlock.deleteMany({where:{userId:editor.id}});await prisma.sparkCoinEvent.deleteMany({where:{userId:editor.id}});await prisma.sparkCoinEvent.create({data:{userId:editor.id,sourceType:"TEST",sourceId:"CORE_BASELINE",amount:300}})}
  await reset();t.after(reset);

  await t.test("lab progress is ordered, persists, unlocks the term once and rewards once",async()=>{
    const skipped=await authed(`/api/labs/${lab.slug}/progress`,editorCookie,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({step:2})});assert.equal(skipped.status,409);
    for(const step of [1,2,3]){const response=await authed(`/api/labs/${lab.slug}/progress`,editorCookie,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({step})});assert.equal(response.status,200)}
    const replay=await authed(`/api/labs/${lab.slug}/progress`,editorCookie,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({step:3,sparkCoins:10000})});assert.equal(replay.status,400);
    const safeReplay=await authed(`/api/labs/${lab.slug}/progress`,editorCookie,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({step:3})});assert.equal((await safeReplay.json()).coinsAwarded,0);
    assert.equal(await prisma.sparkCoinEvent.count({where:{userId:editor.id,sourceType:"WEEKLY_LAB",sourceId:lab.id}}),1);
    assert.equal(await prisma.conceptUnlock.count({where:{userId:editor.id,concept:"COMPOUNDING"}}),1);
  });

  await t.test("daily completion persists and cannot repeatedly reward",async()=>{
    const sequence=[["head-start-reinforcement","BIGGER"],["start-now-or-wait","START_NOW"],["small-amounts-count","TRUE"]];
    for(const[slug,choice]of sequence){const first=await authed(`/api/daily-posts/${slug}/complete`,editorCookie,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({choice})});assert.equal(first.status,201);assert.equal((await first.json()).coinsAwarded,10)}
    const post=postBySlug["head-start-reinforcement"];
    const replay=await authed(`/api/daily-posts/${post.slug}/complete`,editorCookie,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({choice:"SMALLER"})});assert.equal(replay.status,200);assert.equal((await replay.json()).coinsAwarded,0);
    assert.equal(await prisma.dailyPostProgress.count({where:{userId:editor.id,postId:{in:posts.map(item=>item.id)}}}),3);
    assert.equal(await prisma.sparkCoinEvent.count({where:{userId:editor.id,sourceType:"DAILY_POST",sourceId:{in:posts.map(item=>item.id)}}}),3);
  });

  await t.test("portfolio rejects balance, level and result tampering",async()=>{
    const postRun=body=>authed("/api/portfolio/runs",editorCookie,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(body)});
    assert.equal((await postRun({level:1,industry:"TECH",allocation:-10})).status,400);
    assert.equal((await postRun({level:1,industry:"TECH",allocation:10_000})).status,400);
    assert.equal((await postRun({level:2,industry:"TECH",allocation:150})).status,400);
    assert.equal((await postRun({level:1,industry:"TECH",allocation:150,endingValue:999999,sparkCoins:999999})).status,400);
    const started=await postRun({level:1,industry:"TECH",allocation:150});assert.equal(started.status,201);const startedBody=await started.json();
    const cross=await authed(`/api/portfolio/runs/${startedBody.run.id}/decision`,mayaCookie,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({decision:"HOLD"})});assert.equal(cross.status,404);
    const decided=await authed(`/api/portfolio/runs/${startedBody.run.id}/decision`,editorCookie,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({decision:"HOLD",selectedOutcome:999999})});assert.equal(decided.status,400);
    const valid=await authed(`/api/portfolio/runs/${startedBody.run.id}/decision`,editorCookie,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({decision:"HOLD"})});assert.equal(valid.status,200);const body=await valid.json();assert.notEqual(body.chosen.value,999999);
    assert.equal(await prisma.conceptUnlock.count({where:{userId:editor.id,concept:"VOLATILITY"}}),0);
    const crossUnlock=await authed(`/api/portfolio/runs/${startedBody.run.id}/unlock`,mayaCookie,{method:"POST"});assert.equal(crossUnlock.status,404);
    const unlocked=await authed(`/api/portfolio/runs/${startedBody.run.id}/unlock`,editorCookie,{method:"POST"});assert.equal(unlocked.status,200);assert.equal((await unlocked.json()).coinsAwarded,50);
    assert.equal(await prisma.conceptUnlock.count({where:{userId:editor.id,concept:"VOLATILITY"}}),1);
    const replayUnlock=await authed(`/api/portfolio/runs/${startedBody.run.id}/unlock`,editorCookie,{method:"POST"});assert.equal((await replayUnlock.json()).coinsAwarded,0);
    const saved=await prisma.portfolioRun.findUniqueOrThrow({where:{id:startedBody.run.id},include:{snapshot:true}});const points=JSON.parse(saved.snapshot.pricePoints);const expected=Math.round(saved.allocatedCoins*(points[saved.endPoint].value/points[saved.startPoint].value));assert.equal(saved.selectedOutcome,expected);
    assert.equal((await authed(`/api/portfolio/runs/${startedBody.run.id}/decision`,editorCookie,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({decision:"SELL"})})).status,409);
  });
});

test.after(async()=>{await prisma.$disconnect()});
