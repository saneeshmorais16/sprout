import {db} from "@/lib/db";
import {getUserConfidence} from "@/lib/user-confidence";

export type PracticeRecommendation={href:string;title:string;copy:string;time:string;tone:string;topic:string;reason:string;signals:string[];score:number};
const candidates:Record<"YOUTH"|"YOUNG_ADULT",Omit<PracticeRecommendation,"reason"|"signals"|"score">[]>={
  YOUTH:[
    {href:"/practice/budget",title:"Can you make it to payday?",copy:"Make six choices, meet a surprise and see the trade-offs.",time:"4 min",tone:"budget",topic:"EVERYDAY_MONEY"},
    {href:"/practice/decisions/saving",title:"Save now or keep more available?",copy:"Balance a saving goal with a new plan this month.",time:"2 min",tone:"saving",topic:"SAVING"},
    {href:"/noise-checker",title:"Scam Challenge",copy:"Tap the pressure, promises and missing risk information.",time:"3 min",tone:"scam",topic:"STAYING_SAFE"},
    {href:"/practice/decisions/subscriptions",title:"Three renewals arrive",copy:"Decide what to keep before a surprise school cost.",time:"2 min",tone:"subscription",topic:"SUBSCRIPTIONS"},
    {href:"/practice/decisions/first-pay",title:"First Pay Decision",copy:"Split fictional take-home pay between now and later.",time:"3 min",tone:"pay",topic:"INCOME"},
    {href:"/simulate",title:"Investment Risk Practice",copy:"Explore uncertainty and diversification with virtual money.",time:"5 min",tone:"invest",topic:"INVESTING_BASICS"},
  ],
  YOUNG_ADULT:[
    {href:"/practice/budget",title:"Can you make it to payday?",copy:"Balance rent, recurring commitments and an unexpected cost.",time:"5 min",tone:"budget",topic:"EVERYDAY_MONEY"},
    {href:"/practice/decisions/emergency-fund",title:"How much breathing room?",copy:"Compare flexibility now with protection from a surprise.",time:"3 min",tone:"saving",topic:"SAVING"},
    {href:"/payslip-decoder",title:"Payslip Practice",copy:"Explore gross pay and fictional UK deductions.",time:"4 min",tone:"pay",topic:"INCOME"},
    {href:"/practice/decisions/credit",title:"The £600 laptop decision",copy:"Compare delay, cash pressure and total borrowing cost.",time:"3 min",tone:"credit",topic:"CREDIT"},
    {href:"/practice/decisions/pension",title:"Pension Contribution Concept",copy:"Compare take-home flexibility and long-term saving.",time:"3 min",tone:"pension",topic:"PENSIONS"},
    {href:"/simulate",title:"Investment Risk Practice",copy:"Connect allocation, time and uncertainty to a fictional outcome.",time:"6 min",tone:"invest",topic:"INVESTING_BASICS"},
    {href:"/noise-checker",title:"Scam Challenge",copy:"Review pressure tactics and financial warning signs.",time:"3 min",tone:"scam",topic:"STAYING_SAFE"},
  ],
};
const interestTopics:Record<string,string[]>={SAVING:["SAVING"],BUDGETING:["EVERYDAY_MONEY"],RISK:["INVESTING_BASICS"],COMPOUNDING:["SAVING","INVESTING_BASICS"],DIVERSIFICATION:["INVESTING_BASICS"],MARKET_BASICS:["INVESTING_BASICS"]};
const confidenceTopics:Record<string,string>={"Everyday Money":"EVERYDAY_MONEY",Saving:"SAVING","Staying Safe":"STAYING_SAFE",Income:"INCOME",Goals:"SAVING",Credit:"CREDIT","Investing Basics":"INVESTING_BASICS"};

export async function getPracticeRecommendations(userId:string,ageGroup:"YOUTH"|"YOUNG_ADULT",interestJson:string){
  const[completed,goals,recent,confidence,decisionHistory]=await Promise.all([
    db.learningProgress.findMany({where:{userId,status:"COMPLETED"},select:{module:{select:{path:true}}}}),
    db.goal.findMany({where:{userId,status:"ACTIVE"},select:{category:true}}),
    db.activity.findMany({where:{userId},orderBy:{createdAt:"desc"},take:8,select:{type:true,metadata:true}}),
    getUserConfidence(userId,ageGroup),
    db.decisionSession.findMany({where:{userId},orderBy:{createdAt:"desc"},take:10,select:{topic:true}}),
  ]);
  let interests:string[]=[];try{const value=JSON.parse(interestJson);if(Array.isArray(value))interests=value.filter(item=>typeof item==="string")}catch{interests=[]}
  const practised=new Set(decisionHistory.map(item=>item.topic));const lowConfidence=new Set(confidence.filter(item=>item.progress<55).map(item=>confidenceTopics[item.label]));const paths=new Set(completed.map(item=>item.module.path));const hasGoal=goals.length>0;
  return candidates[ageGroup].map((item,index)=>{let score=100-index*3;const signals:string[]=[];
    if(interests.some(interest=>interestTopics[interest]?.includes(item.topic))){score+=35;signals.push("one of your selected interests")}
    if(lowConfidence.has(item.topic)){score+=20;signals.push("an area with room to practise")}
    if(item.topic==="SAVING"&&hasGoal){score+=25;signals.push("you have an active goal")}
    if(item.topic==="EVERYDAY_MONEY"&&paths.size>0){score+=12;signals.push("you have completed a money lesson")}
    if(item.topic==="INCOME"&&[...paths].some(path=>/Pay|Income|Work/.test(path))){score+=18;signals.push("you have started income learning")}
    if(practised.has(item.topic)){score-=28;signals.push("you have practised this before, so this is a useful replay")}
    const recentTypes=recent.map(activity=>activity.type);if(item.topic==="STAYING_SAFE"&&recentTypes.includes("NOISE_CHECKER")){score-=22;signals.push("you recently completed a safety activity")}
    if(!signals.length)signals.push(ageGroup==="YOUTH"?"it is a youth money foundation":"it matches the young-adult confidence pathway");
    return{...item,score,signals,reason:`Selected because ${signals.slice(0,2).join(" and ")}.`};
  }).sort((a,b)=>b.score-a.score);
}
