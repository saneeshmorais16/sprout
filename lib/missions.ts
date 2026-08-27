import { db } from "@/lib/db";
import {awardXp,grantAchievement} from "@/lib/rewards";

const missionAchievements: Record<string, string> = {
  "first-simulation": "growth-explorer",
  "diversified-practice": "diversification-detective",
  "market-drop": "steady-thinker",
  "spot-scam-signs": "scam-spotter",
  "build-first-budget": "budget-builder",
};

export async function completeMission(userId: string, slug: string) {
  return db.$transaction(async tx => {
    const mission = await tx.mission.findUnique({ where: { slug } });
    if (!mission) return { completed: false, xpAwarded: 0 };
    const existing = await tx.missionProgress.findUnique({ where: { userId_missionId: { userId, missionId: mission.id } } });
    if (existing?.status === "COMPLETED") return { completed: true, xpAwarded: 0 };
    await tx.missionProgress.upsert({ where: { userId_missionId: { userId, missionId: mission.id } }, update: { status: "COMPLETED", progress: 100, completedAt: new Date(), xpAwarded: true }, create: { userId, missionId: mission.id, status: "COMPLETED", progress: 100, completedAt: new Date(), xpAwarded: true } });
    const xpAwarded=await awardXp(tx,{userId,sourceType:"MISSION",sourceId:mission.id,amount:mission.xpReward,currentTopic:mission.title,metadata:{slug}});
    await tx.activity.create({ data: { userId, type: "MISSION_COMPLETED", metadata: JSON.stringify({ slug, xp: mission.xpReward }) } });
    const achievementKey = missionAchievements[slug];
    if (achievementKey) await grantAchievement(tx,userId,achievementKey);
    return { completed: true, xpAwarded };
  });
}
