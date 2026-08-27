import {db} from "@/lib/db";
import {deriveLearningJourney,learningLevels} from "@/lib/learning-levels";
import {knowledgeTopicForLesson} from "@/lib/knowledge-topics";
import {configuredFinancialTutorProvider,sanitizeTutorQuestion} from "@/lib/financial-tutor-provider";
import type {TutorAction} from "@/lib/financial-tutor-provider";
import {resolveTutorOutput} from "@/lib/financial-tutor-core.mjs";

type TutorRequest={action:TutorAction;contextType:"LESSON"|"WEEKLY_LAB"|"PORTFOLIO_RESULT"|"PORTFOLIO_CHOICE";contextId:string;question?:string};
type TutorContext={topic:string;currentConcept:string;situation:string};
type JourneyContext={currentLevel:number;completed:Set<string>};

const topicLevels:Record<string,number>={BUDGETING:1,SAVING:2,COMPOUNDING:2,BANKING:3,CREDIT:4,SCAMS:5,INFLATION:6,DIVERSIFICATION:7,VOLATILITY:7};
const actionQuestions:Record<Exclude<TutorAction,"ASK_SPROUT">,string>={EXPLAIN_THIS:"Explain this worked example.",WHY_DID_THIS_HAPPEN:"Why did this result happen?",QUIZ_ME:"Ask one short question about this example.",HELP_ME_THINK:"Guide the decision with neutral questions about its trade-offs."};

export class TutorContextError extends Error{constructor(){super("Tutor context not found.");this.name="TutorContextError"}}

async function journeyContext(userId:string):Promise<JourneyContext>{
  const slugs=learningLevels.flatMap(level=>level.lessons.map(lesson=>lesson.slug));
  const modules=await db.learningModule.findMany({where:{slug:{in:slugs}},select:{slug:true,progress:{where:{userId,status:"COMPLETED"},select:{id:true},take:1}}});
  const completed=new Set(modules.filter(module=>module.progress.length>0).map(module=>module.slug));
  const currentLevel=deriveLearningJourney(completed).find(level=>level.state==="current")?.number??learningLevels.length;
  return{currentLevel,completed};
}

function topicFromQuestion(question:string){
  const text=question.toLowerCase();
  if(/compound|start(?:ed|ing)? earlier|head start|growth on|weekly pot|more time/.test(text))return"COMPOUNDING";
  if(/budget|spend|needs? vs|money left|expense|payday/.test(text))return"BUDGETING";
  if(/sav(?:e|ing)|emergency (?:fund|buffer)|goal/.test(text))return"SAVING";
  if(/inflation|prices? ris|buy less|purchasing power/.test(text))return"INFLATION";
  if(/credit|borrow|loan|bnpl|pay later|repayment/.test(text))return"CREDIT";
  if(/scam|phish|fake|giveaway|suspicious|fraud/.test(text))return"SCAMS";
  if(/diversif|spread|concentrat|all my coins|allocation/.test(text))return"DIVERSIFICATION";
  if(/volatil|market|invest|portfolio|adventure|steady|stock|fund|crypto|price|return|hold|sell/.test(text))return"VOLATILITY";
  if(/bank|debit|account|contactless|direct debit|overdraft/.test(text))return"BANKING";
  return"UNKNOWN";
}

async function serverTutorContext(userId:string,input:TutorRequest,journey:JourneyContext):Promise<TutorContext>{
  if(input.contextType==="LESSON"){
    const level=deriveLearningJourney(journey.completed).find(item=>item.lessons.some(lesson=>lesson.slug===input.contextId));
    const lessonState=level?.lessons.find(lesson=>lesson.slug===input.contextId)?.state;
    if(!level||lessonState==="locked")throw new TutorContextError();
    const lesson=await db.learningModule.findFirst({where:{slug:input.contextId,published:true,ageGroup:"YOUTH"},select:{slug:true,title:true,objective:true,description:true,content:true}});
    if(!lesson)throw new TutorContextError();
    let content:{example?:unknown;explanation?:unknown}={};
    try{content=JSON.parse(lesson.content) as typeof content}catch{content={}}
    const example=typeof content.example==="string"?content.example:lesson.description;
    const explanation=typeof content.explanation==="string"?content.explanation:lesson.objective;
    return{topic:knowledgeTopicForLesson(lesson.slug),currentConcept:lesson.objective||lesson.title,situation:`Activity: ${example} Authoritative lesson explanation: ${explanation}`.slice(0,800)};
  }
  if(input.contextType==="WEEKLY_LAB"){
    const lab=await db.weeklyLab.findFirst({where:{slug:input.contextId,published:true,progress:{some:{userId,step:{gte:3}}}},select:{title:true,concept:true,summary:true}});
    if(!lab)throw new TutorContextError();
    return{topic:lab.concept,currentConcept:lab.title,situation:`Completed GROW Weekly Lab: ${lab.summary} The stored worked example showed two equal £20 weekly journeys, with one beginning six months earlier. The earlier journey had more time for growth to build on previous growth. This was illustrative, not a forecast.`};
  }
  if(input.contextType==="PORTFOLIO_CHOICE"){
    if(input.contextId!=="level-1")throw new TutorContextError();
    return{topic:"DIVERSIFICATION",currentConcept:"Comparing Steady, Growth and Adventure paths",situation:"The learner is comparing three stored historical paths before allocating virtual Spark Coins: Steady has smaller historical movements, Growth has more movement, and Adventure has larger historical movements and uncertainty. No path is automatically right and no recommendation may be made."};
  }
  const run=await db.portfolioRun.findFirst({where:{id:input.contextId,userId,status:"COMPLETED"},select:{path:true,decision:true,selectedOutcome:true,alternativeOutcome:true,snapshot:{select:{label:true,dataVersion:true}}}});
  if(!run||!run.decision||run.selectedOutcome===null||run.alternativeOutcome===null)throw new TutorContextError();
  return{topic:"VOLATILITY",currentConcept:"Historical market movement",situation:`Stored historical example ${run.snapshot.label} (${run.snapshot.dataVersion}). The learner chose ${run.decision}. The server-calculated chosen outcome was ${run.selectedOutcome} Spark Coins and the road-not-taken outcome was ${run.alternativeOutcome} Spark Coins. Explain the difference without calculating a new result or treating it as a forecast.`};
}

export async function runFinancialTutor(user:{id:string;email:string;profile:{age:number|null}|null},input:TutorRequest,options:{forceFallback?:boolean}={}){
  if(!user.profile?.age||user.profile.age<15||user.profile.age>18)throw new Error("SUPPORTED_AGE_REQUIRED");
  const journey=await journeyContext(user.id);
  const context=await serverTutorContext(user.id,input,journey);
  const topic=input.action==="ASK_SPROUT"?topicFromQuestion(input.question||""):context.topic;
  const requiredLevel=topicLevels[topic]??null;
  const futureLevel=requiredLevel&&requiredLevel>journey.currentLevel?requiredLevel:null;
  const retrievalLevel=futureLevel??journey.currentLevel;
  const [chunks,unlocks]=await Promise.all([
    topic==="UNKNOWN"?Promise.resolve([]):db.knowledgeChunk.findMany({where:{topic,ageMin:{lte:user.profile.age},ageMax:{gte:user.profile.age},level:{lte:retrievalLevel}},orderBy:[{level:"desc"},{reviewedAt:"desc"},{id:"asc"}],take:3,select:{id:true,title:true,sourceLabel:true,topic:true,body:true,isDraft:true}}),
    db.conceptUnlock.findMany({where:{userId:user.id},select:{concept:true}}),
  ]);
  const unlockedTerms=unlocks.map(item=>item.concept);
  const presenterFallback=options.forceFallback||user.email.toLowerCase()===(process.env.MAYA_EMAIL||"maya@grow.local").toLowerCase();
  const provider=presenterFallback?null:configuredFinancialTutorProvider();
  const rawQuestion=input.action==="ASK_SPROUT"?input.question!:actionQuestions[input.action];
  const userQuestion=sanitizeTutorQuestion(rawQuestion);
  const safetySituation=input.action==="ASK_SPROUT"?rawQuestion:context.situation;
  const providerInput={action:input.action,age:user.profile.age,currentLevel:journey.currentLevel,currentConcept:context.currentConcept,unlockedTerms,situation:context.situation,userQuestion,futureLevel,chunks:chunks.map(({id,title,sourceLabel,topic:chunkTopic,body})=>({id,title,sourceLabel,topic:chunkTopic,body}))};
  const resolved=await resolveTutorOutput({provider,providerInput,action:input.action,situation:safetySituation,chunks,unlockedTerms,futureLevel});
  return{response:resolved.output,delivery:resolved.delivery,attempts:resolved.attempts,topic,currentLevel:journey.currentLevel,futureLevel,retrievedChunks:chunks.map(({id,title,sourceLabel,isDraft})=>({id,title,sourceLabel,isDraft}))};
}
