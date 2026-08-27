export type ConfidenceArea = { label: string; progress: number; next: string; href: string; evidence: string };
export type ConfidenceInput = {
  ageGroup:"YOUTH"|"YOUNG_ADULT";
  pathProgress:Record<string,number>;
  activeGoals:number;
  goalContributions:number;
  noiseActivities:number;
  decisionTopics:Record<string,number>;
  investmentRuns:number;
};
const bounded=(value:number)=>Math.max(0,Math.min(100,Math.round(value)));
const highest=(paths:Record<string,number>,names:string[])=>Math.max(0,...names.map(name=>paths[name]||0));
const practice=(topics:Record<string,number>,topic:string,max=30)=>Math.min(max,(topics[topic]||0)*15);

export function confidenceAreas({ageGroup,pathProgress,activeGoals,goalContributions,noiseActivities,decisionTopics,investmentRuns}:ConfidenceInput):ConfidenceArea[]{
  const everyday=highest(pathProgress,ageGroup==="YOUTH"?["Money Basics","Banking"]:["Financial Foundations","Independent Money"]);
  const saving=highest(pathProgress,ageGroup==="YOUTH"?["Money Basics"]:["Financial Foundations","Independent Money"]);
  const safety=highest(pathProgress,["Protect Your Money"]);
  const income=highest(pathProgress,ageGroup==="YOUTH"?["Your First Pay"]:["Income & Work"]);
  const credit=highest(pathProgress,["Borrowing","Independent Money"]);
  const investing=highest(pathProgress,ageGroup==="YOUTH"?["Investing Basics"]:["Long-term Planning"]);
  return [
    {label:"Everyday Money",progress:bounded(everyday*.7+practice(decisionTopics,"EVERYDAY_MONEY")),next:"Try a payday decision",href:"/practice/budget",evidence:"Lessons and completed everyday-money decisions"},
    {label:"Saving",progress:bounded(saving*.45+(activeGoals?20:0)+Math.min(15,goalContributions*5)+practice(decisionTopics,"SAVING",20)),next:ageGroup==="YOUTH"?"Try the saving decision":"Explore an emergency-fund decision",href:ageGroup==="YOUTH"?"/practice/decisions/saving":"/practice/decisions/emergency-fund",evidence:"Learning, active goals, goal updates and saving decisions"},
    {label:"Staying Safe",progress:bounded(safety*.7+Math.min(30,noiseActivities*30)),next:"Try Noise Checker",href:"/noise-checker",evidence:"Protect Your Money learning and completed safety practice"},
    {label:"Income",progress:bounded(income*.75+practice(decisionTopics,"INCOME",25)),next:ageGroup==="YOUTH"?"Explore a first-pay decision":"Decode a fictional payslip",href:ageGroup==="YOUTH"?"/practice/decisions/first-pay":"/payslip-decoder",evidence:"Income learning and completed pay decisions"},
    {label:"Goals",progress:bounded((activeGoals?35:0)+Math.min(45,goalContributions*15)+practice(decisionTopics,"GOALS",20)),next:activeGoals?"Update your goal":"Create a learning goal",href:"/goals",evidence:"Active goals and contribution tracking—not the amount saved"},
    {label:"Credit",progress:bounded(credit*.75+practice(decisionTopics,"CREDIT",25)),next:ageGroup==="YOUTH"?"Build bank basics":"Compare a credit trade-off",href:ageGroup==="YOUTH"?"/learn":"/practice/decisions/credit",evidence:"Credit learning and completed credit decisions"},
    {label:"Investing Basics",progress:bounded(investing*.7+Math.min(30,investmentRuns*15)+practice(decisionTopics,"INVESTING_BASICS",20)),next:"Explore risk with virtual money",href:"/simulate",evidence:"Investing lessons and completed virtual simulations—not returns"},
  ];
}

export function confidenceSummary(areas:ConfidenceArea[]){const percent=areas.length?Math.round(areas.reduce((sum,item)=>sum+item.progress,0)/areas.length):0;const label=percent<20?"Starting":percent<50?"Growing":percent<75?"Developing":"Strengthening";return{percent,label};}
