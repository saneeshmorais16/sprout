export type JourneyState="locked"|"current"|"completed";
export type RewardState="locked"|"available"|"earned";

export type LearningLevel={number:number;title:string;summary:string;checkpoint:boolean;lessons:readonly {slug:string;title:string}[]};

export const learningLevels:readonly LearningLevel[]=[
  {number:1,title:"Money Basics",summary:"Make everyday choices with limited money.",checkpoint:false,lessons:[{slug:"needs-vs-wants",title:"Needs vs wants"},{slug:"spending-trade-offs",title:"Spending choices"},{slug:"building-a-budget",title:"Budgeting"}]},
  {number:2,title:"Saving & Compounding",summary:"Give future money a purpose and see how time matters.",checkpoint:false,lessons:[{slug:"saving",title:"Saving goals"},{slug:"emergency-buffer",title:"Emergency buffer"},{slug:"interest",title:"Interest"},{slug:"compound-growth",title:"Compounding"}]},
  {number:3,title:"Money in Real Life",summary:"Understand pay and repeat costs.",checkpoint:true,lessons:[{slug:"gross-pay",title:"First pay"},{slug:"take-home-pay",title:"Gross vs net"},{slug:"income-tax-basics",title:"Tax basics"},{slug:"ni-basics",title:"NI basics"},{slug:"subscriptions",title:"Subscriptions"}]},
  {number:4,title:"Borrowing & Credit",summary:"See how borrowing changes future choices.",checkpoint:false,lessons:[{slug:"credit-basics",title:"Credit"},{slug:"borrowing-interest-cost",title:"Interest cost"},{slug:"bnpl-basics",title:"BNPL"},{slug:"missed-payments",title:"Missed payments"}]},
  {number:5,title:"Protect Your Money",summary:"Pause, check and spot pressure.",checkpoint:false,lessons:[{slug:"phishing",title:"Phishing"},{slug:"fake-giveaways",title:"Fake giveaways"},{slug:"impersonation-scams",title:"Impersonation scams"},{slug:"fake-investment-opportunities",title:"Investment scams"}]},
  {number:6,title:"Money Over Time",summary:"Experience how time changes money choices.",checkpoint:true,lessons:[{slug:"inflation",title:"Inflation"},{slug:"opportunity-cost",title:"Opportunity cost"},{slug:"time-value-of-money",title:"Time value of money"}]},
  {number:7,title:"Investing Basics",summary:"Explore uncertainty without real money.",checkpoint:false,lessons:[{slug:"saving-vs-investing",title:"Saving vs investing"},{slug:"risk-and-reward",title:"Risk"},{slug:"volatility",title:"Volatility"},{slug:"diversification",title:"Diversification"},{slug:"time-horizon",title:"Time horizon"}]},
] as const;

export function deriveLearningJourney(completed:ReadonlySet<string>){
  let previousComplete=true;
  return learningLevels.map(level=>{
    const levelComplete=level.lessons.every(lesson=>completed.has(lesson.slug));
    const state:JourneyState=levelComplete?"completed":previousComplete?"current":"locked";
    let currentAssigned=false;
    const lessons=level.lessons.map(lesson=>{let lessonState:JourneyState;if(completed.has(lesson.slug))lessonState="completed";else if(state==="current"&&!currentAssigned){lessonState="current";currentAssigned=true}else lessonState="locked";return{...lesson,state:lessonState}});
    const rewardState:RewardState=levelComplete?"earned":state==="current"?"available":"locked";
    previousComplete=previousComplete&&levelComplete;
    return{...level,state,rewardState,lessons};
  });
}

export function lessonIsUnlocked(slug:string,completed:ReadonlySet<string>){return deriveLearningJourney(completed).some(level=>level.lessons.some(lesson=>lesson.slug===slug&&lesson.state!=="locked"))}
export function nextJourneyLesson(slug:string,completed:ReadonlySet<string>){const lessons=deriveLearningJourney(completed).flatMap(level=>level.lessons);const index=lessons.findIndex(lesson=>lesson.slug===slug);return index>=0?lessons[index+1]??null:null}
