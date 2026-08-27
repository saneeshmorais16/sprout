export const growLoopStages = [
  { key: "LEARN", label: "Learn" },
  { key: "DECIDE", label: "Decide" },
  { key: "CONSEQUENCE", label: "See what happens" },
  { key: "EXPLAIN", label: "Explain" },
  { key: "REFLECT", label: "Reflect" },
  { key: "PROGRESS", label: "Grow" },
] as const;

export type GrowLoopStage = typeof growLoopStages[number]["key"];
export type GrowTopic = "EVERYDAY_MONEY" | "SAVING" | "STAYING_SAFE" | "INCOME" | "GOALS" | "CREDIT" | "INVESTING_BASICS" | "SUBSCRIPTIONS" | "PENSIONS";

export type DecisionSnapshot = {
  topic: GrowTopic;
  scenarioKey: string;
  ageGroup: "YOUTH" | "YOUNG_ADULT";
  decisions: unknown;
  outcome: unknown;
  explanation: { whatHappened: string; whyItHappened: string; keyTakeaway: string };
};

export function decisionSessionData(userId: string, snapshot: DecisionSnapshot) {
  return {
    userId,
    topic: snapshot.topic,
    scenarioKey: snapshot.scenarioKey,
    ageGroup: snapshot.ageGroup,
    decisions: JSON.stringify(snapshot.decisions),
    outcome: JSON.stringify(snapshot.outcome),
    explanation: JSON.stringify(snapshot.explanation),
  };
}
