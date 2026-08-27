import {NextResponse} from "next/server";
import {db} from "@/lib/db";
import {logServerEvent,requestId} from "@/lib/server-logger";
import {noStoreHeaders} from "@/lib/security";

export async function GET(request:Request){const id=requestId(request);const started=performance.now();try{await db.$queryRaw`SELECT 1`;const databaseLatencyMs=Math.round(performance.now()-started);logServerEvent("health.ok",{requestId:id,databaseLatencyMs});return NextResponse.json({status:"ok",database:"reachable",databaseLatencyMs,timestamp:new Date().toISOString()},{headers:{...noStoreHeaders(),"X-Request-Id":id}})}catch{logServerEvent("health.failed",{requestId:id});return NextResponse.json({status:"degraded",database:"unreachable",timestamp:new Date().toISOString()},{status:503,headers:{...noStoreHeaders(),"X-Request-Id":id}})}}
