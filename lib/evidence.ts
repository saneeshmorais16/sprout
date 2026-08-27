import {db} from "@/lib/db";

/** Evidence metadata is optional and separate from the educational runtime. */
export async function evidenceForTopic(topic:string){return db.evidenceSource.findMany({where:{topic},orderBy:[{isDemo:"asc"},{reviewedAt:"desc"}],select:{sourceTitle:true,publisher:true,publicationYear:true,sourceUrl:true,reviewedAt:true,topic:true,isDemo:true,notes:true}})}
