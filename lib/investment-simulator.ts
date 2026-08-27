export const PRACTICE_STARTING_PENCE = 1_000_000;

export type AssetKey = "CASH" | "BONDS" | "SHARES" | "GLOBAL";
export type DurationKey = "ONE_MONTH" | "ONE_YEAR" | "FIVE_YEARS";
export type Allocation = Record<AssetKey, number>;

export const assetOptions: Record<AssetKey, { label: string; short: string; risk: string; description: string; colour: string }> = {
  CASH: { label: "Cash-like", short: "Cash", risk: "Lower volatility", description: "Usually steadier, with lower potential growth in this fictional model.", colour: "#43a88b" },
  BONDS: { label: "Bonds", short: "Bonds", risk: "Lower-to-medium risk", description: "Can rise or fall and may behave differently from shares.", colour: "#5f80e8" },
  SHARES: { label: "Diversified shares", short: "Shares", risk: "Higher volatility", description: "Spread across fictional companies, with greater uncertainty.", colour: "#ef795f" },
  GLOBAL: { label: "Global diversified portfolio", short: "Global", risk: "Broadly spread", description: "A fictional mix across regions and companies, not a real fund.", colour: "#a66ce2" },
};

export const portfolioPresets: Record<"CAUTIOUS" | "BALANCED" | "GROWTH", { label: string; description: string; allocation: Allocation }> = {
  CAUTIOUS: { label: "Cautious", description: "More stability in this example, but outcomes remain uncertain.", allocation: { CASH: 40, BONDS: 40, SHARES: 10, GLOBAL: 10 } },
  BALANCED: { label: "Balanced", description: "A fictional mix of stability and growth assets.", allocation: { CASH: 15, BONDS: 30, SHARES: 25, GLOBAL: 30 } },
  GROWTH: { label: "Growth", description: "More exposure to market movement and greater uncertainty.", allocation: { CASH: 5, BONDS: 10, SHARES: 35, GLOBAL: 50 } },
};

const scenarios = {
  STEADY_GROWTH: { label: "Steady growth", summary: "Most categories rose gradually, although the path was not perfectly smooth.", inflation: .025, annual: { CASH: .025, BONDS: .035, SHARES: .07, GLOBAL: .065 } },
  MARKET_DECLINE: { label: "Market decline", summary: "Shares fell in this example while cash-like assets were steadier.", inflation: .03, annual: { CASH: .02, BONDS: -.02, SHARES: -.16, GLOBAL: -.12 } },
  VOLATILE_RECOVERY: { label: "Volatile recovery", summary: "Markets fell first, then partly recovered. The journey mattered as much as the ending.", inflation: .028, annual: { CASH: .02, BONDS: .025, SHARES: .055, GLOBAL: .06 } },
  INFLATION_PRESSURE: { label: "Inflation pressure", summary: "Values changed while higher fictional inflation reduced purchasing power.", inflation: .06, annual: { CASH: .035, BONDS: -.035, SHARES: .025, GLOBAL: .035 } },
  MIXED_MARKET: { label: "Mixed market", summary: "Different categories moved in different directions, showing the purpose of spreading exposure.", inflation: .032, annual: { CASH: .025, BONDS: .045, SHARES: -.025, GLOBAL: .055 } },
  STRONG_MARKET: { label: "Strong market", summary: "Riskier categories rose strongly in this example. That outcome is not a prediction or promise.", inflation: .027, annual: { CASH: .025, BONDS: .055, SHARES: .14, GLOBAL: .12 } },
} as const;

export type ScenarioKey = keyof typeof scenarios;
export const scenarioOptions = Object.entries(scenarios).map(([id, item]) => ({ id: id as ScenarioKey, label: item.label, summary: item.summary }));
export const durationOptions: { id: DurationKey; label: string; years: number }[] = [
  { id: "ONE_MONTH", label: "1 month", years: 1 / 12 },
  { id: "ONE_YEAR", label: "1 year", years: 1 },
  { id: "FIVE_YEARS", label: "5 years", years: 5 },
];

export function allocationTotal(allocation: Allocation) {
  return Object.values(allocation).reduce((total, value) => total + value, 0);
}

export function isAllocationValid(allocation: Allocation) {
  return allocationTotal(allocation) === 100 && Object.values(allocation).every(value => Number.isInteger(value) && value >= 0 && value <= 100);
}

export function isReasonablyDiversified(allocation: Allocation) {
  const meaningful = Object.values(allocation).filter(value => value >= 10).length;
  return isAllocationValid(allocation) && meaningful >= 3 && Math.max(...Object.values(allocation)) <= 70;
}

function growthFactor(rate: number, years: number) {
  return years < 1 ? 1 + rate * years : Math.pow(1 + rate, years);
}

const timelineShapes:Record<ScenarioKey,number[]>={STEADY_GROWTH:[0,.006,.002,.01,.004,.008,0],MARKET_DECLINE:[0,-.018,-.01,-.025,-.008,-.012,0],VOLATILE_RECOVERY:[0,-.025,-.008,-.032,-.012,.008,0],INFLATION_PRESSURE:[0,.008,-.012,.004,-.008,.003,0],MIXED_MARKET:[0,-.012,.014,-.006,.011,-.004,0],STRONG_MARKET:[0,.012,-.004,.018,.007,.015,0]};
function simulationTimeline(scenarioId:ScenarioKey,duration:DurationKey,startingValue:number,endingValue:number){const labels=duration==="ONE_MONTH"?["Start","W1","W2","W3","W4","End"]:duration==="FIVE_YEARS"?["Start","Y1","Y2","Y3","Y4","Y5"]:["Jan","Mar","May","Jul","Sep","Nov","Dec"];const shape=timelineShapes[scenarioId];return labels.map((label,index)=>{const ratio=index/(labels.length-1);const linear=startingValue+(endingValue-startingValue)*ratio;return{label,valuePence:Math.round(linear+startingValue*(shape[index]??0))}})}

export function runPracticeSimulation(allocation: Allocation, scenarioId: ScenarioKey, duration: DurationKey, startingValue = PRACTICE_STARTING_PENCE) {
  if (!isAllocationValid(allocation)) throw new Error("Allocation must total 100%.");
  const scenario = scenarios[scenarioId];
  const years = durationOptions.find(item => item.id === duration)?.years ?? 1;
  const assetResults = (Object.keys(allocation) as AssetKey[]).map(key => {
    const start = Math.round(startingValue * allocation[key] / 100);
    const end = Math.round(start * growthFactor(scenario.annual[key], years));
    return { key, start, end, change: end - start, rate: scenario.annual[key] };
  });
  const endingValue = assetResults.reduce((total, item) => total + item.end, 0);
  const changePercent = Number((((endingValue - startingValue) / startingValue) * 100).toFixed(1));
  const inflationAdjusted = Math.round(endingValue / growthFactor(scenario.inflation, years));
  const insights = [
    { title: "Volatility", body: changePercent < 0 ? "Investments can move down as well as up, especially over shorter periods." : "A positive example does not remove the chance of future falls." },
    { title: "Diversification", body: isReasonablyDiversified(allocation) ? "Spreading the virtual money reduced reliance on a single category." : "This allocation relies heavily on fewer categories, so one outcome has more influence." },
    { title: "Time horizon", body: duration === "ONE_MONTH" ? "One month is a very short window. Short-term movement says little about a longer outcome." : "A longer horizon gives more time for change, but it cannot guarantee a return." },
    { title: "Inflation", body: `In this example, purchasing power ends near £${Math.round(inflationAdjusted / 100).toLocaleString("en-GB")} after fictional inflation.` },
  ];
  const timeline=simulationTimeline(scenarioId,duration,startingValue,endingValue);
  return { scenarioId, scenarioLabel: scenario.label, scenarioSummary: scenario.summary, duration, startingValue, endingValue, changePercent, inflationAdjusted, assetResults, timeline, insights };
}

export function comparePresets(scenarioId: ScenarioKey, duration: DurationKey) {
  return (Object.entries(portfolioPresets) as [keyof typeof portfolioPresets, (typeof portfolioPresets)[keyof typeof portfolioPresets]][]).map(([key, preset]) => ({ key, label: preset.label, ...runPracticeSimulation(preset.allocation, scenarioId, duration) }));
}
