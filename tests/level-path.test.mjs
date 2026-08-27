import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {PrismaClient} from "@prisma/client";

const base="http://localhost:3000";const read=path=>readFileSync(path,"utf8");
const env=Object.fromEntries(read(".env").split(/\r?\n/).filter(line=>line&&!line.startsWith("#")).map(line=>{const index=line.indexOf("=");const raw=line.slice(index+1).trim();return[line.slice(0,index),raw.replace(/^(["'])(.*)\1$/,"$2")]}));
const prisma=new PrismaClient();
async function login(){const response=await fetch(`${base}/api/auth/login`,{method:"POST",headers:{"content-type":"application/json",origin:base,"x-forwarded-for":"10.60.0.12"},body:JSON.stringify({email:env.EDITOR_EMAIL,password:env.EDITOR_PASSWORD})});assert.equal(response.status,200);return response.headers.get("set-cookie").split(";")[0]}
async function authed(path,cookie,options={}){return fetch(`${base}${path}`,{...options,redirect:"manual",headers:{origin:base,cookie,...options.headers}})}

test("the visible journey contains seven completion-driven levels",()=>{const levels=read("lib/learning-levels.ts");const component=read("components/level-journey.tsx");for(const title of ["Money Basics","Saving","Money in Real Life","Borrowing","Protect Your Money","Money Over Time","Investing Basics"])assert.match(levels,new RegExp(title));for(const state of ["locked","current","completed","checkpoint","rewardState"])assert.match(`${levels}\n${component}`,new RegExp(state));assert.match(component,/portfolio results never unlock levels/i)});

test("lesson gates and Spark rewards are server-authoritative and idempotent",async t=>{
  const editor=await prisma.user.findUniqueOrThrow({where:{email:env.EDITOR_EMAIL.toLowerCase()},include:{profile:true}});const lesson=await prisma.learningModule.findUniqueOrThrow({where:{slug:"needs-vs-wants"}});const cookie=await login();
  await prisma.learningProgress.deleteMany({where:{userId:editor.id}});await prisma.sparkCoinEvent.deleteMany({where:{userId:editor.id,sourceType:"LESSON"}});await prisma.rewardLedger.deleteMany({where:{userId:editor.id,sourceType:"LESSON"}});
  t.after(async()=>{await prisma.learningProgress.deleteMany({where:{userId:editor.id}});await prisma.sparkCoinEvent.deleteMany({where:{userId:editor.id,sourceType:"LESSON"}});await prisma.rewardLedger.deleteMany({where:{userId:editor.id,sourceType:"LESSON"}});if(editor.profile)await prisma.profile.update({where:{userId:editor.id},data:{xp:editor.profile.xp,streak:editor.profile.streak,beginnerDone:editor.profile.beginnerDone,contentLevel:editor.profile.contentLevel,currentTopic:editor.profile.currentTopic}})});
  const locked=await authed("/api/learn/saving/complete",cookie,{method:"POST"});assert.equal(locked.status,403);
  const forged=await authed(`/api/learn/${lesson.slug}/complete`,cookie,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({userId:"forged-maya-id",sparkCoins:999999,completion:true})});assert.equal(forged.status,400);
  const first=await authed(`/api/learn/${lesson.slug}/complete`,cookie,{method:"POST"});assert.equal(first.status,200);const firstBody=await first.json();assert.equal(firstBody.coinsAwarded,20);
  const replay=await authed(`/api/learn/${lesson.slug}/complete`,cookie,{method:"POST"});assert.equal(replay.status,200);assert.equal((await replay.json()).coinsAwarded,0);
  assert.equal(await prisma.sparkCoinEvent.count({where:{userId:editor.id,sourceType:"LESSON",sourceId:lesson.id}}),1);assert.equal(await prisma.sparkCoinEvent.count({where:{userId:"forged-maya-id"}}),0);
  const stillLocked=await authed("/api/learn/building-a-budget/complete",cookie,{method:"POST"});assert.equal(stillLocked.status,403);
});

test.after(async()=>{await prisma.$disconnect()});
