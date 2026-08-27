import {db} from "@/lib/db";

export type StoredMarketPoint={date:string;value:number};
export type LevelOnePath="STEADY"|"GROWTH"|"ADVENTURE";

export function parseMarketPoints(value:string):StoredMarketPoint[]{
  const parsed=JSON.parse(value) as unknown;
  if(!Array.isArray(parsed))throw new Error("Stored market series is invalid.");
  return parsed.map(point=>{
    if(!point||typeof point!=="object")throw new Error("Stored market point is invalid.");
    const date=Reflect.get(point,"date"),number=Reflect.get(point,"value");
    if(typeof date!=="string"||typeof number!=="number"||!Number.isFinite(number)||number<=0)throw new Error("Stored market point is invalid.");
    return{date,value:number};
  });
}

export function calculateAnnualisedVolatility(points:StoredMarketPoint[]){
  if(points.length<3)return 0;
  const returns=points.slice(1).map((point,index)=>Math.log(point.value/points[index].value));
  const mean=returns.reduce((sum,value)=>sum+value,0)/returns.length;
  const variance=returns.reduce((sum,value)=>sum+(value-mean)**2,0)/(returns.length-1);
  return Math.sqrt(variance)*100;
}

export async function levelOneMarketPaths(){
  const snapshots=await db.marketSnapshot.findMany({where:{dataVersion:"FTSE-FACTSHEET-2024-V1"},orderBy:{annualisedVolatility:"asc"}});
  if(snapshots.length<3)throw new Error("Level 1 market snapshots are missing.");
  const selected=[snapshots[0],snapshots[Math.floor((snapshots.length-1)/2)],snapshots[snapshots.length-1]];
  const names:LevelOnePath[]=["STEADY","GROWTH","ADVENTURE"];
  return names.map((path,index)=>({path,snapshot:selected[index],description:path==="STEADY"?"Smaller historical movements.":path==="GROWTH"?"More movement.":"Larger historical movements and uncertainty."}));
}

export async function marketSnapshotForPath(path:LevelOnePath){
  const match=(await levelOneMarketPaths()).find(item=>item.path===path);
  if(!match)throw new Error("Market path is unavailable.");
  return match.snapshot;
}

export function portfolioOutcome(allocation:number,points:StoredMarketPoint[],decision:"HOLD"|"SELL"){
  const startPoint=0;
  const decisionPoint=Math.max(1,Math.min(points.length-2,Math.floor(points.length*.55)));
  const endPoint=points.length-1;
  const startValue=points[startPoint].value;
  const atDecision=Math.round(allocation*(points[decisionPoint].value/startValue));
  const heldToEnd=Math.round(allocation*(points[endPoint].value/startValue));
  return{startPoint,decisionPoint,endPoint,atDecision,heldToEnd,selected:decision==="SELL"?atDecision:heldToEnd,alternative:decision==="SELL"?heldToEnd:atDecision};
}

export interface MarketDataProvider{getLevelOnePaths:typeof levelOneMarketPaths;getSnapshotForPath:typeof marketSnapshotForPath}
export const storedMarketDataProvider:MarketDataProvider={getLevelOnePaths:levelOneMarketPaths,getSnapshotForPath:marketSnapshotForPath};
