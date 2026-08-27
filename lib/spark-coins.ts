import {Prisma} from "@prisma/client";
import {db} from "@/lib/db";

type Tx=Prisma.TransactionClient;

export async function sparkCoinBalance(userId:string,client:Tx|typeof db=db){
  const result=await client.sparkCoinEvent.aggregate({where:{userId},_sum:{amount:true}});
  return result._sum.amount??0;
}

export async function awardSparkCoins(tx:Tx,input:{userId:string;sourceType:string;sourceId:string;amount:number}){
  if(!Number.isInteger(input.amount)||input.amount<=0)throw new Error("Spark Coin rewards must be positive integers.");
  try{
    await tx.sparkCoinEvent.create({data:input});
    return input.amount;
  }catch(error){
    if(error instanceof Prisma.PrismaClientKnownRequestError&&error.code==="P2002")return 0;
    throw error;
  }
}

export async function spendSparkCoins(tx:Tx,input:{userId:string;sourceType:string;sourceId:string;amount:number}){
  if(!Number.isInteger(input.amount)||input.amount<=0)throw new Error("Spark Coin spend must be a positive integer.");
  const balance=await sparkCoinBalance(input.userId,tx);
  if(input.amount>balance)throw new InsufficientSparkCoinsError();
  try{
    await tx.sparkCoinEvent.create({data:{...input,amount:-input.amount}});
    return balance-input.amount;
  }catch(error){
    if(error instanceof Prisma.PrismaClientKnownRequestError&&error.code==="P2002")throw new SparkCoinReplayError();
    throw error;
  }
}

export class InsufficientSparkCoinsError extends Error{constructor(){super("Not enough Spark Coins.");this.name="InsufficientSparkCoinsError"}}
export class SparkCoinReplayError extends Error{constructor(){super("This Spark Coin event was already recorded.");this.name="SparkCoinReplayError"}}
