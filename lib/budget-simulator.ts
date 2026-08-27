export type PracticeAgeGroup = "YOUTH" | "YOUNG_ADULT";

export type BudgetOption = { title: string; costPence: number; note: string };
export type BudgetDecision = { key: string; title: string; why: string; options: BudgetOption[] };
export type BudgetScenario = {
  key: "PAYDAY_YOUTH" | "PAYDAY_ADULT";
  ageGroup: PracticeAgeGroup;
  monthlyMoneyPence: number;
  fixedEssentialsPence: number;
  unexpectedPence: number;
  unexpectedTitle: string;
  context: string;
  depthNote: string;
  decisions: BudgetDecision[];
};

const youthScenario: BudgetScenario = {
  key: "PAYDAY_YOUTH", ageGroup: "YOUTH", monthlyMoneyPence: 65_000, fixedEssentialsPence: 25_000,
  unexpectedPence: 8_000, unexpectedTitle: "Your bike needs an £80 repair.",
  context: "A fictional month with £650 from part-time work, support and regular spending money.",
  depthNote: "Focus on recurring costs, room for fun and a simple buffer.",
  decisions: [
    {key:"phone",title:"Your phone",why:"Contracts repeat every month, so the difference affects every future plan.",options:[{title:"Keep your SIM-only plan",costPence:1_200,note:"£12 this month"},{title:"Choose a new phone contract",costPence:4_500,note:"£45 every month"}]},
    {key:"food",title:"Food for the month",why:"Planning meals can reduce cost, but convenience and circumstances matter too.",options:[{title:"Plan most meals",costPence:12_000,note:"£120 budget"},{title:"Use more convenience food",costPence:17_500,note:"£175 budget"}]},
    {key:"transport",title:"Getting around",why:"Transport is often a need. The useful choice depends on where you live and travel.",options:[{title:"Bike and occasional bus",costPence:3_500,note:"£35 this month"},{title:"Monthly bus pass",costPence:7_200,note:"£72 this month"}]},
    {key:"fun",title:"Entertainment",why:"A budget can include enjoyment. The trade-off is what remains for other priorities.",options:[{title:"Set a £30 limit",costPence:3_000,note:"A smaller plan"},{title:"Set an £80 limit",costPence:8_000,note:"More flexibility"}]},
    {key:"subscriptions",title:"Subscriptions",why:"Small recurring costs can become significant because they repeat every month.",options:[{title:"Pause unused subscriptions",costPence:0,note:"£0 this month"},{title:"Keep all three",costPence:2_400,note:"£24 every month"}]},
    {key:"buffer",title:"Your emergency buffer",why:"A buffer can absorb surprises without pretending every emergency is predictable.",options:[{title:"Do not set money aside yet",costPence:0,note:"£0 buffer"},{title:"Set aside £50",costPence:5_000,note:"Kept for surprises"}]},
  ],
};

const adultScenario: BudgetScenario = {
  key: "PAYDAY_ADULT", ageGroup: "YOUNG_ADULT", monthlyMoneyPence: 215_000, fixedEssentialsPence: 128_000,
  unexpectedPence: 32_000, unexpectedTitle: "Your boiler repair share is £320.",
  context: "A fictional month with £2,150 take-home pay and £1,280 of rent, bills and essential commitments already due.",
  depthNote: "Compare commitments, flexibility, debt pressure and emergency-fund trade-offs.",
  decisions: [
    {key:"phone",title:"Phone and connectivity",why:"Long contracts can lower flexibility even when the monthly difference seems manageable.",options:[{title:"Keep a SIM-only plan",costPence:1_500,note:"£15 this month"},{title:"Mid-range phone contract",costPence:4_500,note:"£45 every month"},{title:"Premium phone contract",costPence:7_000,note:"£70 every month"}]},
    {key:"food",title:"Food and household shopping",why:"Lower cost can require more planning; higher convenience can save time. Both have real trade-offs.",options:[{title:"Plan meals and shop around",costPence:18_000,note:"£180 plan"},{title:"Mix planning and convenience",costPence:28_000,note:"£280 plan"},{title:"Prioritise convenience",costPence:38_000,note:"£380 plan"}]},
    {key:"transport",title:"Travel to work and social plans",why:"Transport options depend on location, accessibility, reliability and time—not price alone.",options:[{title:"Walk, cycle and occasional transit",costPence:8_500,note:"£85 this month"},{title:"Monthly public transport pass",costPence:16_000,note:"£160 this month"},{title:"Car costs and fuel",costPence:24_000,note:"£240 this month"}]},
    {key:"flexible",title:"Social and flexible spending",why:"Enjoyment belongs in a realistic plan; choosing more here leaves less flexibility elsewhere.",options:[{title:"Plan £80",costPence:8_000,note:"Lower flexibility"},{title:"Plan £160",costPence:16_000,note:"Balanced flexibility"},{title:"Plan £250",costPence:25_000,note:"More room this month"}]},
    {key:"subscriptions",title:"Subscriptions and memberships",why:"Recurring payments reduce future monthly room until they are changed or cancelled.",options:[{title:"Keep essentials only",costPence:1_500,note:"£15 recurring"},{title:"Keep the ones used weekly",costPence:3_500,note:"£35 recurring"},{title:"Keep every current service",costPence:7_000,note:"£70 recurring"}]},
    {key:"buffer",title:"Emergency-fund contribution",why:"A larger contribution reduces available spending now but creates more capacity for uncertain costs later.",options:[{title:"Pause this month",costPence:0,note:"£0 set aside"},{title:"Set aside £150",costPence:15_000,note:"Moderate buffer"},{title:"Set aside £300",costPence:30_000,note:"Larger buffer"}]},
  ],
};

export function getBudgetScenario(ageGroup: PracticeAgeGroup) { return ageGroup === "YOUTH" ? youthScenario : adultScenario; }

export function calculateBudget(ageGroup: PracticeAgeGroup, decisions: number[]) {
  const scenario = getBudgetScenario(ageGroup);
  if (decisions.length !== scenario.decisions.length || decisions.some((value, index) => !Number.isInteger(value) || value < 0 || value >= scenario.decisions[index].options.length)) throw new Error("Choose one option for every decision.");
  const selected = scenario.decisions.map((decision, index) => ({ ...decision, selected: decision.options[decisions[index]] }));
  const plannedPence = selected.reduce((sum, item) => sum + item.selected.costPence, 0);
  const bufferPence = selected.find(item => item.key === "buffer")?.selected.costPence ?? 0;
  const remainingPence = scenario.monthlyMoneyPence - scenario.fixedEssentialsPence - plannedPence - scenario.unexpectedPence;
  const pressure = remainingPence < 0 ? "SHORTFALL" : remainingPence < scenario.monthlyMoneyPence * .05 ? "TIGHT" : "ROOM";
  return {
    selected, plannedPence, bufferPence, remainingPence, pressure,
    startingPence: scenario.monthlyMoneyPence, fixedEssentialsPence: scenario.fixedEssentialsPence,
    unexpectedPence: scenario.unexpectedPence, unexpectedTitle: scenario.unexpectedTitle,
    whatHappened: remainingPence < 0 ? "The fictional month ended with a shortfall." : remainingPence < scenario.monthlyMoneyPence * .05 ? "The month balanced, with little room left." : "The month ended with some room still available.",
    whyItHappened: bufferPence > 0 ? "Your recurring choices and the amount set aside both reduced spendable money, while the buffer created some protection against the surprise cost." : "Your recurring choices shaped what remained, and the surprise cost had to come from money that was still available.",
    keyTakeaway: "The remaining amount is not a score. A useful plan reflects needs, access, time and priorities as well as the numbers.",
  };
}
