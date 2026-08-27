export const HEAD_START_MONTHLY_AMOUNT=20;
export const HEAD_START_ANNUAL_RATE=.05;
export const HEAD_START_MONTHLY_RATE=HEAD_START_ANNUAL_RATE/12;
export const HEAD_START_DELAY_MONTHS=6;
export const HEAD_START_DURATION_MONTHS=60;

export function buildHeadStartTimeline(months=HEAD_START_DURATION_MONTHS){
  let maya=0,friend=0;
  return Array.from({length:months+1},(_,month)=>{
    if(month>0){
      maya=(maya+HEAD_START_MONTHLY_AMOUNT)*(1+HEAD_START_MONTHLY_RATE);
      if(month>HEAD_START_DELAY_MONTHS)friend=(friend+HEAD_START_MONTHLY_AMOUNT)*(1+HEAD_START_MONTHLY_RATE);
    }
    return{month,maya:Math.round(maya*100)/100,friend:Math.round(friend*100)/100};
  });
}

export const headStartTimeline=buildHeadStartTimeline();
export const headStartOutcome={
  maya:headStartTimeline.at(-1)?.maya??0,
  friend:headStartTimeline.at(-1)?.friend??0,
  gap:Math.round(((headStartTimeline.at(-1)?.maya??0)-(headStartTimeline.at(-1)?.friend??0))*100)/100,
};

export type DailyPostDefinition={
  slug:string;
  dayLabel:"TUESDAY"|"WEDNESDAY"|"THURSDAY";
  title:string;
  prompt:string;
  options:readonly {id:string;label:string;feedback:string}[];
  rewardCoins:number;
};

export const COMPOUNDING_DAILY_POSTS:readonly DailyPostDefinition[]=[
  {
    slug:"head-start-reinforcement",dayLabel:"TUESDAY",title:"Quick question",
    prompt:"Your friend starts six months later. If neither of you adds anything else from here, what happens to your head start?",
    rewardCoins:10,
    options:[
      {id:"SMALLER",label:"Gets smaller",feedback:"Not in this worked example. Both balances follow the same rate, so the earlier pot keeps its time advantage."},
      {id:"SAME",label:"Stays the same",feedback:"Close, but the earlier pot already has more value experiencing the same illustrative growth."},
      {id:"BIGGER",label:"Gets bigger",feedback:"Yes. In this worked example, the earlier pot has more value experiencing the same illustrative growth, so the gap grows too."},
    ],
  },
  {
    slug:"start-now-or-wait",dayLabel:"WEDNESDAY",title:"Start now or wait?",
    prompt:"Two people put away the same amount each month. One starts today; the other waits three years. Who gives their money more time in this worked example?",
    rewardCoins:10,
    options:[
      {id:"START_NOW",label:"The person who starts today",feedback:"Yes. Starting today creates three extra years for contributions and any growth to build over time."},
      {id:"WAIT_THREE_YEARS",label:"The person who waits",feedback:"Waiting removes three years from the same worked example, so that money has less time to build."},
      {id:"NO_DIFFERENCE",label:"There is no difference",feedback:"The amount is the same, but the time available is different. Time changes this worked example."},
    ],
  },
  {
    slug:"small-amounts-count",dayLabel:"THURSDAY",title:"Small amounts, more time",
    prompt:"True or false: a small regular amount can still build over time, even though real returns are uncertain.",
    rewardCoins:10,
    options:[
      {id:"TRUE",label:"True",feedback:"True. Regular contributions can add up, and earlier growth may build on previous growth. Real values can also fall."},
      {id:"FALSE",label:"False",feedback:"Small amounts can add up over time. Growth is uncertain, but the amount does not need to be large for time to matter."},
    ],
  },
] as const;

export function dailyPostDefinition(slug:string){return COMPOUNDING_DAILY_POSTS.find(post=>post.slug===slug)}
export function dailyPostFeedback(slug:string,choice:string){return dailyPostDefinition(slug)?.options.find(option=>option.id===choice)}
