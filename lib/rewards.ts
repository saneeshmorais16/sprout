import {Prisma} from "@prisma/client";

type RewardInput={userId:string;sourceType:string;sourceId:string;amount:number;metadata?:Record<string,unknown>;currentTopic?:string};

/** Awards educational XP exactly once per user and authoritative source. */
export async function awardXp(tx:Prisma.TransactionClient,input:RewardInput){
  if(!Number.isInteger(input.amount)||input.amount<0)throw new Error("Reward amount must be a non-negative integer.");
  const sourceId=input.sourceType==="PRACTICE"?"PAYDAY_PRACTICE":input.sourceId;
  const existing=await tx.rewardLedger.findUnique({where:{userId_sourceType_sourceId:{userId:input.userId,sourceType:input.sourceType,sourceId}}});
  if(existing)return 0;
  try{
    await tx.rewardLedger.create({data:{userId:input.userId,sourceType:input.sourceType,sourceId,amount:input.amount,metadata:input.metadata?JSON.stringify(input.metadata):null}});
  }catch(error){if(error instanceof Prisma.PrismaClientKnownRequestError&&error.code==="P2002")return 0;throw error}
  if(input.amount>0)await tx.profile.update({where:{userId:input.userId},data:{xp:{increment:input.amount},...(input.currentTopic&&{currentTopic:input.currentTopic})}});
  return input.amount;
}

export async function grantAchievement(tx:Prisma.TransactionClient,userId:string,key:string){
  const achievement=await tx.achievement.findUnique({where:{key}});if(!achievement)return false;
  const existing=await tx.userAchievement.findUnique({where:{userId_achievementId:{userId,achievementId:achievement.id}}});if(existing)return false;
  await tx.userAchievement.create({data:{userId,achievementId:achievement.id}});return true;
}
