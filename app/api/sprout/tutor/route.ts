import {NextResponse} from "next/server";
import {AuthenticationError,requireUser} from "@/lib/auth";
import {runFinancialTutor,TutorContextError} from "@/lib/financial-tutor";
import {logServerEvent,requestId} from "@/lib/server-logger";
import {noStoreHeaders,rateLimit,sameOrigin} from "@/lib/security";
import {sproutTutorSchema} from "@/lib/validation";

const MAX_BODY_BYTES=1024;

export async function POST(request:Request){
  const id=requestId(request);const started=Date.now();
  if(!sameOrigin(request))return NextResponse.json({error:"Request rejected."},{status:403,headers:noStoreHeaders()});
  let user;
  try{user=await requireUser({api:true})}catch(error){if(error instanceof AuthenticationError)return NextResponse.json({error:"Sign in required."},{status:401,headers:noStoreHeaders()});throw error}
  const declared=Number(request.headers.get("content-length")||0);
  if(declared>MAX_BODY_BYTES)return NextResponse.json({error:"That request is too long."},{status:413,headers:noStoreHeaders()});
  const raw=await request.text();
  if(Buffer.byteLength(raw,"utf8")>MAX_BODY_BYTES)return NextResponse.json({error:"That request is too long."},{status:413,headers:noStoreHeaders()});
  const parsed=sproutTutorSchema.safeParse((()=>{try{return JSON.parse(raw)}catch{return null}})());
  if(!parsed.success)return NextResponse.json({error:"Choose a Sprout action for this activity."},{status:400,headers:noStoreHeaders()});
  const withinLimit=rateLimit(`sprout-tutor:${user.id}`,20,60*60_000);
  try{
    const result=await runFinancialTutor(user,parsed.data,{forceFallback:!withinLimit});
    logServerEvent("sprout.tutor",{requestId:id,userId:user.id,action:parsed.data.action,topic:result.topic,questionLength:parsed.data.question?.length??0,chunkIds:result.retrievedChunks.map(chunk=>chunk.id),delivery:result.delivery,providerAttempts:result.attempts,rateLimited:!withinLimit,durationMs:Date.now()-started,outcome:withinLimit?"success":"rate_limited"});
    return NextResponse.json(withinLimit?result:{...result,notice:"Sprout’s hourly live-response limit has been reached. A grounded GROW curriculum response is shown instead."},{status:withinLimit?200:429,headers:{...noStoreHeaders(),"X-Request-Id":id}});
  }catch(error){
    if(error instanceof Error&&error.message==="SUPPORTED_AGE_REQUIRED")return NextResponse.json({error:"Sprout is available for learners aged 15 to 18."},{status:403,headers:noStoreHeaders()});
    if(error instanceof TutorContextError)return NextResponse.json({error:"That learning context is not available at the current level."},{status:404,headers:noStoreHeaders()});
    logServerEvent("sprout.tutor",{requestId:id,userId:user.id,action:parsed.data.action,questionLength:parsed.data.question?.length??0,durationMs:Date.now()-started,outcome:"error",errorType:error instanceof Error?error.name:"UnknownError"});
    return NextResponse.json({error:"Sprout couldn’t explain that just now. Try again."},{status:500,headers:noStoreHeaders()});
  }
}
