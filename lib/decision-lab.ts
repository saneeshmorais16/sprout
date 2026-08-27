import type { GrowTopic } from "@/lib/grow-loop";

export const decisionTopicKeys = ["saving", "subscriptions", "first-pay", "emergency-fund", "credit", "pension"] as const;
export type DecisionTopicKey = typeof decisionTopicKeys[number];
export type DecisionOption = { id: string; label: string; note: string; amount: number };
export type DecisionScenario = {
  key: string;
  topicKey: DecisionTopicKey;
  topic: GrowTopic;
  ageGroup: "YOUTH" | "YOUNG_ADULT";
  eyebrow: string;
  title: string;
  learn: string;
  context: string;
  prompt: string;
  options: DecisionOption[];
  xp: number;
};

const scenarios: Record<DecisionTopicKey, DecisionScenario> = {
  saving: { key:"YOUTH_SAVING_SURPRISE",topicKey:"saving",topic:"SAVING",ageGroup:"YOUTH",eyebrow:"SAVING DECISION",title:"Save now or keep more available?",learn:"Saving gives future money a job, while keeping money available can help with today. Neither need disappears just because you choose the other.",context:"You have £120 from weekend work. A £35 birthday plan appears later in the month.",prompt:"How much would you set aside before the birthday plan?",options:[{id:"SAVE_10",label:"Set aside £10",note:"More available now",amount:1000},{id:"SAVE_30",label:"Set aside £30",note:"Split the priorities",amount:3000},{id:"SAVE_50",label:"Set aside £50",note:"More towards the goal",amount:5000}],xp:40 },
  subscriptions: { key:"YOUTH_SUBSCRIPTION_RENEWAL",topicKey:"subscriptions",topic:"SUBSCRIPTIONS",ageGroup:"YOUTH",eyebrow:"SUBSCRIPTION DECISION",title:"Three renewals arrive together",learn:"A subscription is a future commitment as well as today’s access. Free trials and small prices can be harder to notice when they renew separately.",context:"You have £80 of flexible money. Music (£5.99), gaming (£8.99) and storage (£2.99) renew this week, then a £30 school trip is announced.",prompt:"What would you do before the renewals?",options:[{id:"PAUSE_TWO",label:"Pause two you use least",note:"Keep one service",amount:599},{id:"REVIEW_ONE",label:"Cancel one after checking usage",note:"Keep two services",amount:1198},{id:"KEEP_ALL",label:"Keep all three this month",note:"Keep every service",amount:1797}],xp:40 },
  "first-pay": { key:"YOUTH_FIRST_PAY_SPLIT",topicKey:"first-pay",topic:"INCOME",ageGroup:"YOUTH",eyebrow:"FIRST PAY DECISION",title:"Your first take-home pay arrives",learn:"Gross pay and take-home pay can differ. Exact deductions depend on pay and circumstances; this example starts after a fictional £320 reaches the account.",context:"You receive £320 take-home pay. You want trainers, travel money and a small future buffer.",prompt:"How would you split the amount first?",options:[{id:"FLEXIBLE",label:"Keep £300 available, save £20",note:"Most flexibility now",amount:2000},{id:"SPLIT",label:"Keep £240 available, save £80",note:"Share today and later",amount:8000},{id:"BUFFER",label:"Keep £170 available, save £150",note:"Larger future buffer",amount:15000}],xp:45 },
  "emergency-fund": { key:"ADULT_BUFFER_SURPRISE",topicKey:"emergency-fund",topic:"SAVING",ageGroup:"YOUNG_ADULT",eyebrow:"EMERGENCY-FUND DECISION",title:"How much breathing room this month?",learn:"An emergency fund is money kept for uncertain essential costs. Building one can reduce spending room now; pausing can protect other priorities.",context:"After rent, bills and planned spending, £500 is unallocated. A fictional £250 urgent dental cost appears.",prompt:"What would you move to an emergency fund before the surprise?",options:[{id:"PAUSE",label:"Pause the contribution",note:"£0 set aside",amount:0},{id:"BUILD_150",label:"Set aside £150",note:"Some protection",amount:15000},{id:"BUILD_300",label:"Set aside £300",note:"More protection, less flexibility",amount:30000}],xp:50 },
  credit: { key:"ADULT_CREDIT_PURCHASE",topicKey:"credit",topic:"CREDIT",ageGroup:"YOUNG_ADULT",eyebrow:"CREDIT DECISION",title:"A £600 laptop stops working",learn:"Credit can spread a cost but may add interest, fees or future commitments. Waiting can avoid borrowing but may not fit an urgent need.",context:"You have £350 available and need a laptop for work. These are fictional options, not product recommendations.",prompt:"Which trade-off would you explore?",options:[{id:"WAIT",label:"Wait and save for three months",note:"No borrowing; delayed replacement",amount:0},{id:"REFURB",label:"Buy a £300 refurbished model",note:"Uses most available money",amount:30000},{id:"CREDIT",label:"Explore a fictional credit plan",note:"£55 × 12 = £660 total",amount:66000}],xp:50 },
  pension: { key:"ADULT_PENSION_CONTRIBUTION",topicKey:"pension",topic:"PENSIONS",ageGroup:"YOUNG_ADULT",eyebrow:"PENSION CONCEPT",title:"More take-home now or more long-term saving?",learn:"Workplace pension contributions can reduce current take-home pay and add to long-term saving. Tax treatment, employer contributions, access and outcomes depend on current rules and circumstances.",context:"Use fictional gross monthly pay of £2,500. This simplified example ignores tax interactions and is not a forecast.",prompt:"Which contribution level would you compare?",options:[{id:"ZERO",label:"0% employee contribution",note:"£0 employee + £0 fictional employer",amount:0},{id:"FIVE",label:"5% employee contribution",note:"£125 employee + £75 fictional employer",amount:5},{id:"EIGHT",label:"8% employee contribution",note:"£200 employee + £75 fictional employer",amount:8}],xp:50 },
};

export function getDecisionScenario(topicKey: string, ageGroup: "YOUTH" | "YOUNG_ADULT") {
  const scenario = scenarios[topicKey as DecisionTopicKey];
  return scenario?.ageGroup === ageGroup ? scenario : null;
}

const pounds = (pence: number) => new Intl.NumberFormat("en-GB", { style:"currency",currency:"GBP",maximumFractionDigits:0 }).format(pence / 100);

export function runDecisionScenario(scenario: DecisionScenario, optionId: string) {
  const option = scenario.options.find(item => item.id === optionId);
  if (!option) throw new Error("Choose one of the available decisions.");
  let metrics: { label: string; value: string }[] = [];
  let whatHappened = "Your choice changed what remained available.";
  let whyItHappened = "Money used for one priority is not available for another at the same time.";
  let keyTakeaway = "There is no universal winning choice. Context and priorities shape the trade-off.";
  if (scenario.topicKey === "saving") { const available = 12_000 - 3_500 - option.amount; metrics=[{label:"Saved",value:pounds(option.amount)},{label:"After the plan",value:pounds(available)}]; whatHappened=`You kept ${pounds(available)} available after saving and the birthday plan.`; whyItHappened="Saving first protected part of the goal, while the later plan used some of the money left for today."; }
  if (scenario.topicKey === "subscriptions") { const available=8_000-3_000-option.amount;metrics=[{label:"Renewals",value:pounds(option.amount)},{label:"After school trip",value:pounds(available)}];whatHappened=`The renewals and trip left ${pounds(available)} of flexible money.`;whyItHappened="Recurring payments were committed before the new school-trip cost appeared.";keyTakeaway="Checking use before renewal can make an invisible commitment easier to compare with a new priority."; }
  if (scenario.topicKey === "first-pay") { metrics=[{label:"Set aside",value:pounds(option.amount)},{label:"Available now",value:pounds(32_000-option.amount)}];whatHappened=`You gave ${pounds(option.amount)} of the fictional take-home pay a future job.`;whyItHappened="Splitting income changes both current flexibility and the size of the future buffer."; }
  if (scenario.topicKey === "emergency-fund") { const unallocated=50_000-option.amount;const covered=Math.min(option.amount,25_000);const after=unallocated-(25_000-covered);metrics=[{label:"Moved to buffer",value:pounds(option.amount)},{label:"Flexible after cost",value:pounds(after)}];whatHappened=covered===25_000?"The buffer could cover the full fictional urgent cost.":covered>0?"The buffer covered part of the fictional urgent cost.":"The urgent cost came from money that was still flexible.";whyItHappened="Moving money into a buffer changed where the surprise was paid from; it did not make the cost disappear."; }
  if (scenario.topicKey === "credit") { metrics=option.id==="WAIT"?[{label:"Extra cost",value:"£0"},{label:"Delay",value:"3 months"}]:option.id==="REFURB"?[{label:"Paid now",value:"£300"},{label:"Available after",value:"£50"}]:[{label:"Total repaid",value:"£660"},{label:"Future commitment",value:"12 months"}];whatHappened=option.id==="WAIT"?"You avoided a borrowing cost but delayed replacing the laptop.":option.id==="REFURB"?"You replaced the laptop without borrowing but used most available money.":"You replaced the laptop sooner and created a fictional £660 future commitment.";whyItHappened="Speed, product condition, available cash and total borrowing cost pull in different directions.";keyTakeaway="Compare total cost and future commitments as well as the monthly amount. Real credit decisions depend on terms and circumstances."; }
  if (scenario.topicKey === "pension") { const employee=Math.round(250_000*option.amount/100);const employer=option.amount>0?7_500:0;metrics=[{label:"Employee",value:pounds(employee)},{label:"Fictional employer",value:pounds(employer)},{label:"Long-term amount",value:pounds(employee+employer)}];whatHappened=`The simplified long-term contribution was ${pounds(employee+employer)} for this month.`;whyItHappened="A higher employee contribution reduced current pay in this simplified view and increased the amount set aside; the fictional employer amount did not rise above £75.";keyTakeaway="Pension rules, tax effects, employer terms, fees and investment outcomes vary. More contribution is not presented as a score or guarantee."; }
  return { option, metrics, whatHappened, whyItHappened, keyTakeaway };
}
