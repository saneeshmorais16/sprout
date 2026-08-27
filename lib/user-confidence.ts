import {db} from "@/lib/db";
import {confidenceAreas} from "@/lib/confidence";

export async function getUserConfidence(userId:string,ageGroup:"YOUTH"|"YOUNG_ADULT"){
  const[modules,activeGoals,goalContributions,noiseActivities,decisions,investmentRuns]=await Promise.all([
    db.learningModule.findMany({where:{ageGroup,published:true},select:{path:true,progress:{where:{userId},select:{status:true}}}}),
    db.goal.count({where:{userId,status:"ACTIVE"}}),
    db.goalContribution.count({where:{goal:{userId}}}),
    db.activity.count({where:{userId,type:"NOISE_CHECKER"}}),
    db.decisionSession.findMany({where:{userId},select:{topic:true}}),
    db.simulationRun.count({where:{userId}}),
  ]);
  const paths=new Map<string,{done:number;total:number}>();for(const learningModule of modules){const current=paths.get(learningModule.path)||{done:0,total:0};current.total+=1;if(learningModule.progress[0]?.status==="COMPLETED")current.done+=1;paths.set(learningModule.path,current)}
  const pathProgress=Object.fromEntries([...paths.entries()].map(([path,value])=>[path,value.total?value.done/value.total*100:0]));const decisionTopics=decisions.reduce<Record<string,number>>((totals,item)=>{totals[item.topic]=(totals[item.topic]||0)+1;return totals},{});
  return confidenceAreas({ageGroup,pathProgress,activeGoals,goalContributions,noiseActivities,decisionTopics,investmentRuns});
}
