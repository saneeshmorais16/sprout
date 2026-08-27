import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import {calculateAnnualisedVolatility,type StoredMarketPoint} from "../lib/market-data";
import {COMPOUNDING_DAILY_POSTS} from "../lib/weekly-loop";

const prisma = new PrismaClient();

function credential(name: string) { const value = process.env[name]; if (!value) throw new Error(`Missing required seed environment variable: ${name}`); return value; }
async function upsertAccount(email: string, password: string, role: string, firstName: string) { const passwordHash = await hash(password, 12); return prisma.user.upsert({ where: { email: email.toLowerCase() }, update: { passwordHash, role, profile: { upsert: { update: { firstName }, create: { firstName } } } }, create: { email: email.toLowerCase(), passwordHash, role, profile: { create: { firstName } } }, include: { profile: true } }); }

type Lesson = [slug:string,title:string,path:string,description:string,ageGroup:string,order:number,objective?:string];
const youthLessons: Lesson[] = [
  ["what-is-money","What is money?","Money Basics","Why money helps us exchange, measure and plan.","YOUTH",1],
  ["needs-vs-wants","Needs vs wants","Money Basics","Make choices without giving up everything you enjoy.","YOUTH",2],
  ["where-money-goes","Where does your money go?","Money Basics","Notice the small spends that add up.","YOUTH",3],
  ["building-a-budget","Building a budget","Money Basics","Give every pound a simple job.","YOUTH",4],
  ["saving","Saving without missing out","Money Basics","Build a saving habit that fits real life.","YOUTH",5],
  ["interest","How interest works","Money Basics","See how money can grow or borrowing can cost.","YOUTH",6],
  ["inflation","Why does £20 buy less over time?","Money Basics","Understand inflation without needing an economics degree.","YOUTH",7],
  ["spending-trade-offs","Spending trade-offs","Money Basics","Experience how one choice can reduce what remains for another.","YOUTH",8],
  ["what-banks-do","What does a bank do?","Banking","Understand how banks hold and move money.","YOUTH",11],
  ["current-accounts","Current accounts","Banking","Learn what an everyday bank account does.","YOUTH",12],
  ["debit-cards","Debit cards","Banking","Know what happens when you tap or pay online.","YOUTH",13],
  ["contactless","Contactless payments","Banking","Use quick payments with confidence.","YOUTH",14],
  ["direct-debits","Direct debits","Banking","Understand regular automatic payments.","YOUTH",15],
  ["subscriptions","Subscriptions","Banking","Spot repeat costs and avoid forgotten trials.","YOUTH",16],
  ["overdraft-basics","Overdraft basics","Banking","Learn why an overdraft is borrowed money.","YOUTH",17],
  ["staying-safe-online","Staying safe online","Banking","Protect account details and payment information.","YOUTH",18],
  ["bnpl-basics","Buy now, pay later basics","Borrowing & Credit","Compare today’s purchase with the full fictional repayment commitment.","YOUTH",19],
  ["credit-basics","Credit choices","Borrowing & Credit","Experience how borrowed money changes a future budget.","YOUTH",19],
  ["borrowing-interest-cost","The cost of borrowing","Borrowing & Credit","Compare the amount borrowed with the total amount repaid.","YOUTH",19],
  ["missed-payments","When a payment is missed","Borrowing & Credit","See how a missed fictional payment can reduce later choices.","YOUTH",19],
  ["emergency-buffer","Building an emergency buffer","Planning","See how setting money aside changes your options after an unexpected cost.","YOUTH",20],
  ["scam-basics","Scam basics","Protect Your Money","Recognise the common shape of a money scam.","YOUTH",21],
  ["phishing","Phishing","Protect Your Money","Spot messages designed to steal details.","YOUTH",22],
  ["fake-giveaways","Fake giveaways","Protect Your Money","Question prizes that demand payment or urgency.","YOUTH",23],
  ["fake-investment-opportunities","Fake investment opportunities","Protect Your Money","Recognise unrealistic return claims.","YOUTH",24],
  ["impersonation-scams","Impersonation scams","Protect Your Money","Pause when a message pretends to be someone you trust.","YOUTH",24],
  ["finfluencer-warning-signs","Finfluencer warning signs","Protect Your Money","Separate education from online hype.","YOUTH",25],
  ["urgency-tactics","Urgency tactics","Protect Your Money","Pause when someone pressures you to act now.","YOUTH",26],
  ["too-good-to-be-true","Too-good-to-be-true claims","Protect Your Money","Use healthy scepticism with money promises.","YOUTH",27],
  ["gross-pay","What is gross pay?","Your First Pay","Understand earnings before deductions.","YOUTH",31],
  ["take-home-pay","What is take-home pay?","Your First Pay","Understand what may reach your bank account.","YOUTH",32],
  ["why-deductions","Why might money be deducted?","Your First Pay","See why deductions vary by circumstances.","YOUTH",33],
  ["income-tax-basics","Income Tax basics","Your First Pay","A plain-English introduction to Income Tax.","YOUTH",34],
  ["ni-basics","National Insurance basics","Your First Pay","An introduction to National Insurance.","YOUTH",35],
  ["pension-basics","Pension basics","Your First Pay","Learn why workplace pension saving exists.","YOUTH",36],
  ["opportunity-cost","The choice you leave behind","Money Over Time","Experience what one choice makes unavailable for another.","YOUTH",37],
  ["time-value-of-money","Money now and later","Money Over Time","Compare the same fictional amount at different points in time.","YOUTH",38],
  ["saving-vs-investing","Saving vs investing","Investing Basics","Understand the different jobs saving and investing can do.","YOUTH",41],
  ["rise-and-fall","Why investments can rise and fall","Investing Basics","Learn why values move and returns are uncertain.","YOUTH",42],
  ["risk-and-reward","Risk and reward","Investing Basics","Explore why higher potential reward usually means more uncertainty.","YOUTH",43],
  ["volatility","A bumpy journey","Investing Basics","Watch a fictional value move up and down before naming volatility.","YOUTH",43],
  ["diversification","Diversification","Investing Basics","See why spreading risk matters.","YOUTH",44],
  ["compound-growth","Compound growth","Investing Basics","Explore growth on earlier growth over time.","YOUTH",45],
  ["time-horizon","Time horizon","Investing Basics","Match a goal to how long money can stay invested.","YOUTH",46],
  ["uncertain-returns","Why returns are uncertain","Investing Basics","Understand that outcomes are never guaranteed.","YOUTH",47],
  ["inflation-and-investing","Inflation","Investing Basics","Connect rising prices to long-term planning.","YOUTH",48],
];

function lessonContent(title:string,description:string) { return JSON.stringify({ objective:description, explanation:`${title} is easier when you connect it to a real choice. Start with what you know, check the numbers, and give yourself time to decide.`, example:"Imagine you have £20 this week. Try splitting it between something you need, something you enjoy and something you want later.", question:{ prompt:`What is the strongest first step when thinking about ${title.toLowerCase()}?`, options:["Pause and check the facts","Copy what everyone else is doing","Assume the first answer is guaranteed"], answer:0, explanation:"Pausing and checking facts builds confidence without pressure." }, takeaway:"Good money decisions start with clear information, not urgency." }); }

const draftKnowledgeChunks = [
  ["kb-saving-01","Giving future money a job","SAVING",1,"Saving means keeping some money for a later purpose. A clear goal can make the trade-off between now and later easier to see."],
  ["kb-saving-02","Saving and unexpected costs","SAVING",2,"Money set aside can create more options when an unexpected cost appears. The useful amount depends on the situation; this lesson does not set a personal target."],
  ["kb-compounding-01","Growth building on earlier growth","COMPOUNDING",1,"When growth is added to an amount, later growth can build on both the original amount and earlier growth. More time creates more opportunities for this effect, but real returns are uncertain."],
  ["kb-compounding-02","Starting times and repeated contributions","COMPOUNDING",2,"Two equal weekly contributions can finish differently when one journey starts earlier. The difference comes from time and growth building on earlier growth, not from a guaranteed rate."],
  ["kb-budgeting-01","A plan for limited money","BUDGETING",1,"A budget gives limited money several jobs. Choosing one job can reduce what remains for another, so the purpose is to make trade-offs visible rather than remove them."],
  ["kb-budgeting-02","Budgets change when life changes","BUDGETING",2,"A useful budget can be adjusted when income, costs or priorities change. An unexpected expense may require a different choice without making the original plan a failure."],
  ["kb-inflation-01","When the same amount buys less","INFLATION",1,"If prices rise while the amount of money stays the same, that money buys fewer goods or services. Different prices can change at different rates."],
  ["kb-inflation-02","Comparing purchasing power over time","INFLATION",5,"Purchasing power describes what an amount of money can buy. A price comparison across two dates can show a change, but it does not predict future prices."],
  ["kb-credit-01","Borrowing moves cost into the future","CREDIT",1,"Borrowing lets a cost be paid over time, but it creates a future repayment commitment. The total amount and timing matter, not only the first payment."],
  ["kb-credit-02","BNPL and missed repayments","CREDIT",4,"Buy now, pay later is a form of borrowing. Missing a repayment can have consequences under the provider's terms, so the full commitment needs to be understood before a fictional decision is compared."],
  ["kb-scams-01","Pressure is a reason to pause","SCAMS",1,"Urgency, secrecy and unusually large promises are warning signs. A safer check uses an official route rather than a link or contact detail supplied by the message."],
  ["kb-scams-02","Claims without balanced risk information","SCAMS",4,"A money claim that presents reward without uncertainty leaves out important information. Popularity, follower counts and testimonials do not prove a claim is reliable."],
  ["kb-diversification-01","Relying less on one outcome","DIVERSIFICATION",1,"Spreading a fictional portfolio across different parts means one outcome has less influence on the whole. Spreading does not remove uncertainty or guarantee a gain."],
  ["kb-diversification-02","Concentration and spreading","DIVERSIFICATION",7,"Concentration means a larger share depends on one path. Spreading can reduce that reliance, while shared market events may still affect several parts at once."],
  ["kb-volatility-01","A path that moves around","VOLATILITY",1,"Some historical paths move up and down more than others. Larger movement means more uncertainty during that period, not a promise of a higher future return."],
  ["kb-volatility-02","Historical movement is not a forecast","VOLATILITY",7,"Volatility summarises how much values moved in a measured period. It describes past variation and cannot tell a learner what the next movement will be."],
] as const;

async function main() {
  const admin = await upsertAccount(credential("ADMIN_EMAIL"), credential("ADMIN_PASSWORD"), "ADMIN", "GROW Admin");
  const editor = await upsertAccount(credential("EDITOR_EMAIL"), credential("EDITOR_PASSWORD"), "CONTENT_EDITOR", "Content Editor");
  const maya = await upsertAccount(credential("MAYA_EMAIL"), credential("MAYA_PASSWORD"), "USER", "Maya");
  for(const [id,title,topic,level,text] of draftKnowledgeChunks){
    const body=`DRAFT — NEEDS REVIEW\n\n${text}`;
    await prisma.knowledgeChunk.upsert({where:{id},update:{title,sourceLabel:"GROW curriculum",topic,ageMin:15,ageMax:18,level,reviewedAt:new Date("2026-08-27T00:00:00.000Z"),body,isDraft:true},create:{id,title,sourceLabel:"GROW curriculum",topic,ageMin:15,ageMax:18,level,reviewedAt:new Date("2026-08-27T00:00:00.000Z"),body,isDraft:true}});
  }
  await prisma.profile.update({ where:{userId:maya.id}, data:{ age:16, ageGroup:"YOUTH", contentLevel:"FOUNDATIONAL", guardianStatus:"NOT_REQUIRED", xp:620, streak:4, currentTopic:"Compounding", beginnerDone:2, notifications:true, sprigSounds:false, privacyMode:"STANDARD", interests:JSON.stringify(["SAVING","COMPOUNDING","DIVERSIFICATION"]), confidenceBaseline:3 } });
  await prisma.profile.update({ where:{userId:admin.id}, data:{ age:18, ageGroup:"YOUTH", contentLevel:"FOUNDATIONAL", guardianStatus:"NOT_REQUIRED", interests:JSON.stringify(["BUDGETING","RISK","MARKET_BASICS"]), confidenceBaseline:4 } });
  await prisma.profile.update({ where:{userId:editor.id}, data:{ age:18, ageGroup:"YOUTH", contentLevel:"FOUNDATIONAL", guardianStatus:"NOT_REQUIRED", interests:JSON.stringify(["SAVING","BUDGETING","COMPOUNDING"]), confidenceBaseline:3 } });
  await prisma.userAvatar.upsert({where:{userId:maya.id},update:{character:"SPROUT",colourVariant:"MINT",accessory:"BACKPACK"},create:{userId:maya.id,character:"SPROUT",colourVariant:"MINT",accessory:"BACKPACK"}});
  await prisma.userAvatar.upsert({where:{userId:admin.id},update:{character:"NOVA",colourVariant:"OCEAN",accessory:"GLASSES"},create:{userId:admin.id,character:"NOVA",colourVariant:"OCEAN",accessory:"GLASSES"}});

  const weeklyLab=await prisma.weeklyLab.upsert({where:{slug:"the-20-head-start"},update:{title:"The £20 Head Start",concept:"COMPOUNDING",summary:"See what changes when the same £20 monthly habit starts six months earlier.",ageGroup:"ALL",rewardCoins:120,published:true},create:{slug:"the-20-head-start",title:"The £20 Head Start",concept:"COMPOUNDING",summary:"See what changes when the same £20 monthly habit starts six months earlier.",ageGroup:"ALL",rewardCoins:120,published:true}});
  for(const post of COMPOUNDING_DAILY_POSTS){
    const options=JSON.stringify(post.options.map(option=>option.id));
    await prisma.dailyPost.upsert({where:{slug:post.slug},update:{labId:weeklyLab.id,dayLabel:post.dayLabel,title:post.title,prompt:post.prompt,options,feedback:post.options[0]?.feedback??"",rewardCoins:post.rewardCoins,published:true},create:{slug:post.slug,labId:weeklyLab.id,dayLabel:post.dayLabel,title:post.title,prompt:post.prompt,options,feedback:post.options[0]?.feedback??"",rewardCoins:post.rewardCoins,published:true}});
  }
  const futureLabs=[
    {slug:"where-did-my-money-go",title:"Where Did My Money Go?",concept:"OPPORTUNITY_COST",summary:"Give a limited amount of money several jobs and see which trade-offs appear.",post:{slug:"budget-until-friday",title:"£25 until Friday",prompt:"You have £25 until Friday and three things you want to buy. What do you check first?",options:["PRIORITIES","BUY_ALL","IGNORE_BALANCE"],feedback:"Checking priorities first makes the trade-offs visible."}},
    {slug:"true-cost-of-later",title:"The True Cost of Later",concept:"BORROWING_COST",summary:"Compare paying now with a fictional payment plan and reveal the total cost.",post:{slug:"fourth-repayment",title:"The fourth repayment",prompt:"You can afford three repayments but not the fourth. What matters most before agreeing?",options:["TOTAL_COST","FIRST_PAYMENT","ADVERT_COLOUR"],feedback:"The full repayment commitment matters, not only the first payment."}},
    {slug:"can-you-spot-the-scam",title:"Can You Spot the Scam?",concept:"URGENCY_TACTICS",summary:"Respond to a pressured message before revealing the warning signs.",post:{slug:"account-frozen-message",title:"Your account will be frozen",prompt:"A message says your account will be frozen unless you click now. What is the safest first step?",options:["OFFICIAL_ROUTE","CLICK_NOW","REPLY_DETAILS"],feedback:"Pausing and checking through an official route avoids trusting the message itself."}},
    {slug:"why-does-20-buy-less",title:"Why Does £20 Buy Less?",concept:"INFLATION",summary:"Compare the same shopping list at two points in time before naming the change.",post:{slug:"snack-price-change",title:"The snack costs more",prompt:"A snack was £1.20 last year and £1.40 now. What changed for the same £20?",options:["BUYS_LESS","MONEY_GREW","NOTHING"],feedback:"When prices rise, the same £20 buys fewer of those snacks."}},
    {slug:"save-or-invest",title:"Save or Invest?",concept:"TIME_HORIZON",summary:"Match fictional goals to different timeframes and experience uncertainty.",post:{slug:"goal-next-summer",title:"A goal for next summer",prompt:"You need the money next summer. What should you think about before accepting market uncertainty?",options:["TIMEFRAME","HIGHEST_RETURN","POPULARITY"],feedback:"The timeframe and need for certainty matter before considering risk."}},
  ];
  for(const item of futureLabs){const lab=await prisma.weeklyLab.upsert({where:{slug:item.slug},update:{title:item.title,concept:item.concept,summary:item.summary,ageGroup:"YOUTH",rewardCoins:100,published:true},create:{slug:item.slug,title:item.title,concept:item.concept,summary:item.summary,ageGroup:"YOUTH",rewardCoins:100,published:true}});await prisma.dailyPost.upsert({where:{slug:item.post.slug},update:{labId:lab.id,dayLabel:"WEDNESDAY",title:item.post.title,prompt:item.post.prompt,options:JSON.stringify(item.post.options),feedback:item.post.feedback,rewardCoins:25,published:true},create:{slug:item.post.slug,labId:lab.id,dayLabel:"WEDNESDAY",title:item.post.title,prompt:item.post.prompt,options:JSON.stringify(item.post.options),feedback:item.post.feedback,rewardCoins:25,published:true}})}

  const years=Array.from({length:11},(_,index)=>`${2013+index}-09-30`);
  function indexedSeries(returns:number[]):StoredMarketPoint[]{let value=100;return years.map((date,index)=>{if(index>0)value*=1+returns[index-1]/100;return{date,value:Number(value.toFixed(4))}})}
  const marketSeeds=[
    {key:"FTSE100_TR_2014_2023",symbol:"UKX",label:"FTSE 100 total return",sector:"UK large companies",returns:[0.7,-1.3,19.1,11.9,-8.7,17.3,-11.5,18.4,4.7,7.9]},
    {key:"FTSE250_TR_2014_2023",symbol:"MCX",label:"FTSE 250 total return",sector:"UK mid-sized companies",returns:[3.7,11.2,6.7,17.8,-13.3,28.9,-4.6,16.9,-17.4,8.0]},
    {key:"FTSEFLEDGLING_TR_2014_2023",symbol:"NSX",label:"FTSE Fledgling total return",sector:"UK smaller companies",returns:[8.8,15.4,18.2,26.4,-7.3,2.3,11.0,27.3,-9.9,-2.5]},
  ];
  for(const item of marketSeeds){const pricePoints=indexedSeries(item.returns);await prisma.marketSnapshot.upsert({where:{key:item.key},update:{symbol:item.symbol,label:item.label,sector:item.sector,source:"FTSE Russell — FTSE 100 Index Factsheet",sourceUrl:"https://docs.londonstockexchange.com/sites/default/files/documents/ukx_20240930.pdf",startDate:new Date(years[0]),endDate:new Date(years.at(-1)!),asOfDate:new Date("2024-09-30T00:00:00.000Z"),retrievedAt:new Date("2026-08-21T00:00:00.000Z"),dataVersion:"FTSE-FACTSHEET-2024-V1",pricePoints:JSON.stringify(pricePoints),annualisedVolatility:calculateAnnualisedVolatility(pricePoints)},create:{key:item.key,symbol:item.symbol,label:item.label,sector:item.sector,source:"FTSE Russell — FTSE 100 Index Factsheet",sourceUrl:"https://docs.londonstockexchange.com/sites/default/files/documents/ukx_20240930.pdf",startDate:new Date(years[0]),endDate:new Date(years.at(-1)!),asOfDate:new Date("2024-09-30T00:00:00.000Z"),retrievedAt:new Date("2026-08-21T00:00:00.000Z"),dataVersion:"FTSE-FACTSHEET-2024-V1",pricePoints:JSON.stringify(pricePoints),annualisedVolatility:calculateAnnualisedVolatility(pricePoints)}})}
  await prisma.guardianApproval.deleteMany({ where:{userId:maya.id} });

  const missions = [
    ["build-first-budget","Build your first budget","Complete a short budgeting lesson and give every virtual pound a job.","A simple plan helps you make intentional choices.","YOUTH",50,"/learn/building-a-budget",1],
    ["spot-scam-signs","Spot three scam warning signs","Use the Noise Checker to find pressure, promises and missing risk information.","Pausing and checking claims can help protect your money.","YOUTH",75,"/noise-checker",2],
    ["complete-money-basics","Complete Money Basics","Work through the seven foundational lessons.","Strong foundations make later money topics easier to understand.","YOUTH",100,"/learn",3],
    ["create-first-goal","Create your first savings goal","Choose a target and practise tracking progress.","Goals connect everyday actions to something that matters to you.","ALL",50,"/goals",4],
    ["diversified-practice","Build a diversified practice portfolio","Spread £10,000 of virtual money across at least three fictional categories.","Diversification reduces reliance on one outcome without removing risk.","ALL",75,"/simulate",5],
    ["first-simulation","Complete your first simulation","Run one deterministic fictional market scenario.","Seeing both rises and falls builds a more realistic understanding of uncertainty.","ALL",50,"/simulate",6],
    ["market-drop","The market just dropped","Choose a thoughtful response to a fictional 12% fall.","Goals and time horizon can help reduce emotional decision-making.","ALL",60,"/simulate",7],
    ["understand-inflation","Understand inflation","Complete the inflation lesson and connect pounds to purchasing power.","Prices can change what the same amount of money buys.","ALL",50,"/learn/inflation",8],
    ["decode-payslip","Decode a payslip","Explore gross pay, deductions and take-home pay.","Understanding income supports budgeting and financial resilience.","YOUNG_ADULT",75,"/payslip-decoder",9],
    ["pension-purpose","Learn what a pension does","Complete the workplace pension lesson.","Pensions are one part of long-term planning, and personal circumstances vary.","YOUNG_ADULT",75,"/learn/workplace-pension",10],
  ] as const;
  for(const [slug,title,description,purpose,ageGroup,xpReward,actionPath,sortOrder] of missions) await prisma.mission.upsert({where:{slug},update:{title,description,purpose,ageGroup,xpReward,actionPath,sortOrder},create:{slug,title,description,purpose,ageGroup,xpReward,actionPath,sortOrder}});

  for (const [slug,title,path,description,ageGroup,sortOrder,objective] of youthLessons) await prisma.learningModule.upsert({ where:{slug}, update:{title,path,description,ageGroup,sortOrder,objective:objective||description,content:lessonContent(title,description),published:true,minutes:3,difficulty:"Beginner"}, create:{slug,title,path,description,ageGroup,sortOrder,objective:objective||description,content:lessonContent(title,description),published:true,minutes:3,difficulty:"Beginner"} });
  await prisma.learningModule.updateMany({where:{ageGroup:"YOUNG_ADULT"},data:{published:false}});

  await prisma.learningProgress.deleteMany({ where:{userId:maya.id} });
  await prisma.rewardLedger.deleteMany({where:{userId:{in:[maya.id,admin.id,editor.id]}}});
  await prisma.rewardLedger.create({data:{userId:maya.id,sourceType:"DEMO",sourceId:"MAYA_BASELINE_V1",amount:620,metadata:JSON.stringify({educationalBaseline:true})}});
  await prisma.portfolioDecision.deleteMany({where:{run:{userId:{in:[maya.id,admin.id,editor.id]}}}});
  await prisma.portfolioAllocation.deleteMany({where:{run:{userId:{in:[maya.id,admin.id,editor.id]}}}});
  await prisma.portfolioRun.deleteMany({where:{userId:{in:[maya.id,admin.id,editor.id]}}});
  await prisma.dailyPostProgress.deleteMany({where:{userId:{in:[maya.id,admin.id,editor.id]}}});
  await prisma.weeklyLabProgress.deleteMany({where:{userId:{in:[maya.id,admin.id,editor.id]}}});
  await prisma.conceptUnlock.deleteMany({where:{userId:{in:[maya.id,admin.id,editor.id]}}});
  await prisma.sparkCoinEvent.deleteMany({where:{userId:{in:[maya.id,admin.id,editor.id]}}});
  await prisma.sparkCoinEvent.createMany({data:[{userId:maya.id,sourceType:"DEMO",sourceId:"MAYA_SPARK_BASELINE_V2",amount:150},{userId:admin.id,sourceType:"DEMO",sourceId:"ADMIN_SPARK_BASELINE_V2",amount:150},{userId:editor.id,sourceType:"DEMO",sourceId:"EDITOR_SPARK_BASELINE_V2",amount:150}]});
  await prisma.simulatorSession.deleteMany({ where:{userId:{in:[maya.id,admin.id,editor.id]}} });
  await prisma.simulationRun.deleteMany({ where:{userId:{in:[maya.id,admin.id,editor.id]}} });
  await prisma.practiceReflection.deleteMany({ where:{userId:{in:[maya.id,admin.id,editor.id]}} });
  await prisma.decisionSession.deleteMany({ where:{userId:{in:[maya.id,admin.id,editor.id]}} });
  await prisma.missionProgress.deleteMany({ where:{userId:{in:[maya.id,admin.id,editor.id]}} });
  for (const slug of ["what-is-money","needs-vs-wants"]) { const lesson=await prisma.learningModule.findUniqueOrThrow({where:{slug}}); await prisma.learningProgress.create({data:{userId:maya.id,moduleId:lesson.id,status:"COMPLETED",progress:100,completedAt:new Date()}}); }

  await prisma.goal.deleteMany({ where:{userId:{in:[maya.id,admin.id,editor.id]}} });
  await prisma.goal.createMany({data:[
    {userId:maya.id,title:"Save £1,000 in one year",targetPence:100000,savedPence:42000,targetDate:new Date(Date.now()+31536000000),category:"Personal"},
    {userId:editor.id,title:"Build a £500 emergency fund",targetPence:50000,savedPence:12000,targetDate:new Date(Date.now()+180*86400000),category:"Emergency fund"},
    {userId:admin.id,title:"Build a £3,000 emergency fund",targetPence:300000,savedPence:85000,targetDate:new Date(Date.now()+365*86400000),category:"Emergency fund"},
  ]});
  const mayaGoal=await prisma.goal.findFirstOrThrow({where:{userId:maya.id}}); await prisma.goalContribution.createMany({data:[{goalId:mayaGoal.id,amountPence:15000,createdAt:new Date(Date.now()-28*86400000)},{goalId:mayaGoal.id,amountPence:12000,createdAt:new Date(Date.now()-14*86400000)},{goalId:mayaGoal.id,amountPence:15000,createdAt:new Date(Date.now()-3*86400000)}]});

  const youthFeed = [
    ["You spent £4.50 five times this week. How much did that actually cost?","Small spends can be easier to see when you add them together.","Budgeting","/learn/where-money-goes","Selected because you’re currently learning about saving."],
    ["Would you spot this fake giveaway?","Tap the warning signs before they catch you.","Scams","/noise-checker","Selected for the Youth Protect Your Money path."],
    ["What happens if you save £20 every month for a year?","Turn a small habit into a clear total.","Saving","/goals","Selected because you have an active saving goal."],
    ["Your free trial ended. Now you’re paying £8.99 every month.","Learn how subscription costs repeat.","Banking","/learn/subscriptions","Selected for your Banking learning path."],
    ["Need or want? You decide.","Try three everyday choices.","Money Basics","/learn/needs-vs-wants","Selected because you recently completed Money Basics."],
    ["Why can £10 feel like less money next year?","A quick introduction to inflation.","Inflation","/learn/inflation","Selected for foundational money knowledge."],
    ["A message says your account will close in ten minutes.","Pause before you tap that link.","Scams","/learn/phishing","Selected to strengthen online safety skills."],
    ["Your first weekend job pays £80. What might your payslip show?","Explore Your First Pay without assuming deductions.","First Pay","/learn/gross-pay","Optional preparation for a first job."],
  ];
  await prisma.feedItem.deleteMany(); await prisma.feedItem.createMany({data:youthFeed.map(([title,summary,category,actionPath,reason])=>({title,summary,category,actionPath,reason,ageGroup:"YOUTH",publishedAt:new Date()}))});

  await prisma.wireStory.deleteMany(); await prisma.wireStory.createMany({data:[
    {slug:"youth-interest-rates",title:"Why are people talking about interest rates?",summary:"Think of interest as the price attached to borrowing or saving money.",ageGroup:"YOUTH",category:"Money in the news",whatHappened:"Interest rates are adjusted over time as prices and the wider economy change.",whyItMatters:"Rates can change what savers may receive and what borrowers may pay. You do not need to react to every headline.",whatCouldAffect:"Savings interest, borrowing costs and how confident people feel about spending.",keyTerm:"Interest rate — a percentage connected to saving or borrowing money.",learnMorePath:"/learn/interest",minutes:3,publishedAt:new Date()},
    {slug:"youth-inflation",title:"Why can the same £10 buy less next year?",summary:"A simple look at inflation and everyday prices.",ageGroup:"YOUTH",category:"Everyday money",whatHappened:"The prices of many goods and services can rise over time.",whyItMatters:"If prices rise while the amount you have stays the same, your money buys less.",whatCouldAffect:"Snacks, travel, subscriptions and longer-term saving goals.",keyTerm:"Inflation — a broad rise in prices over time.",learnMorePath:"/learn/inflation",minutes:3,publishedAt:new Date()},
    {slug:"youth-contactless",title:"What actually happens when you tap your card?",summary:"Follow a contactless payment from tap to confirmation.",ageGroup:"YOUTH",category:"Banking",whatHappened:"Your card and the payment terminal exchange protected payment information, then a payment network asks your bank for a decision.",whyItMatters:"A fast tap still creates a real transaction, so checking your balance and receipts matters.",whatCouldAffect:"Your available balance, merchant refunds and card-security checks.",keyTerm:"Authorisation — the bank's decision to approve or decline a payment.",learnMorePath:"/learn/contactless",minutes:3,publishedAt:new Date()},
    {slug:"youth-subscriptions",title:"Why does a free trial keep costing money?",summary:"Understand recurring payments before the next renewal.",ageGroup:"YOUTH",category:"Subscriptions",whatHappened:"Some trials become paid subscriptions automatically unless they are cancelled.",whyItMatters:"Small repeat costs can quietly use money you planned for something else.",whatCouldAffect:"Your monthly budget and progress towards a saving goal.",keyTerm:"Recurring payment — a payment scheduled to repeat.",learnMorePath:"/learn/subscriptions",minutes:2,publishedAt:new Date()},
    {slug:"adult-rate-change",title:"Interest rates changed. What could that mean?",summary:"Connect rate decisions to savings, mortgages, borrowing and markets.",ageGroup:"YOUNG_ADULT",category:"Economy",whatHappened:"The policy rate can be changed in response to inflation and economic conditions.",whyItMatters:"Changes can flow through to savings rates, mortgages, loans and financial-market expectations at different speeds.",whatCouldAffect:"Variable borrowing, refinancing decisions, cash savings and business confidence.",keyTerm:"Policy rate — the central interest rate used to influence wider borrowing and saving conditions.",learnMorePath:"/learn/emergency-fund",minutes:4,publishedAt:new Date()},
    {slug:"adult-pension",title:"What a pension contribution is actually doing",summary:"A calm look at long-term workplace saving.",ageGroup:"YOUNG_ADULT",category:"Workplace money",whatHappened:"Workplace pension contributions combine money from the employee and, where applicable, the employer, subject to scheme rules.",whyItMatters:"Starting earlier can give contributions more time, but investment outcomes and future rules remain uncertain.",whatCouldAffect:"Contribution levels, employment changes, fees, investment performance and future access rules.",keyTerm:"Contribution — money added to a pension or saving arrangement.",learnMorePath:"/learn/workplace-pension",minutes:4,publishedAt:new Date()},
    {slug:"adult-credit",title:"Why does credit history matter?",summary:"See how past borrowing behaviour may shape future applications.",ageGroup:"YOUNG_ADULT",category:"Credit",whatHappened:"Lenders may review information about borrowing and repayment history when assessing an application.",whyItMatters:"Late payments and high balances can affect how a lender views risk, but no single score guarantees an outcome.",whatCouldAffect:"Credit applications, available rates, renting checks and identity verification.",keyTerm:"Credit history — a record of some borrowing and repayment activity.",learnMorePath:"/learn/credit-confidence",minutes:4,publishedAt:new Date()},
    {slug:"adult-mortgage",title:"What changes when mortgage rates move?",summary:"Understand the connection between rates and home-loan costs.",ageGroup:"YOUNG_ADULT",category:"Housing",whatHappened:"Mortgage pricing can change as wider borrowing costs and market expectations move.",whyItMatters:"The effect depends on the mortgage type, timing and personal circumstances.",whatCouldAffect:"Monthly repayments, affordability calculations and remortgaging options.",keyTerm:"Fixed rate — an interest rate set for an agreed period.",learnMorePath:"/wire/adult-rate-change",minutes:5,publishedAt:new Date()},
  ]});

  await prisma.videoProgress.deleteMany(); await prisma.video.deleteMany(); await prisma.video.createMany({data:[
    {title:"Why does money lose value?",description:"Inflation explained with an everyday snack-shop example.",sourceUrl:"",category:"Money Basics",ageGroup:"YOUTH",difficulty:"Beginner",durationSeconds:120,transcript:"Prices can rise over time. If your money stays the same while prices rise, it buys less. That change is called inflation.",keyTakeaway:"Inflation changes what the same amount of money can buy.",published:true},
    {title:"Spot the pressure",description:"See how urgency is used in scam messages.",sourceUrl:"",category:"Scams",ageGroup:"YOUTH",difficulty:"Beginner",durationSeconds:95,transcript:"Scammers often try to stop you thinking. Pause, check the sender and use an official route to verify a claim.",keyTakeaway:"Urgency is a reason to pause, not rush.",published:true},
    {title:"Your workplace pension in 3 minutes",description:"A calm introduction to workplace pension saving.",sourceUrl:"",category:"Pensions",ageGroup:"YOUNG_ADULT",difficulty:"Foundational",durationSeconds:180,transcript:"A workplace pension is designed for long-term retirement saving. Contributions and tax treatment depend on your circumstances and current rules.",keyTakeaway:"A pension is long-term saving, and exact arrangements vary.",published:true},
  ]});

  const achievements=[
    ["first-steps","First Steps","Completed a first learning activity.","🌱"],["first-goal","Goal Getter","Created a personal saving goal.","🎯"],["seven-day","7-Day Learner","Learnt on seven separate days.","🔥"],["scam-spotter","Scam Spotter","Completed the Noise Checker.","🛡️"],["budget-builder","Budget Builder","Completed a budgeting lesson.","🧩"],["growth-explorer","Growth Explorer","Completed a first investment practice simulation.","🔭"],["diversification-detective","Diversification Detective","Completed the diversification mission.","🔎"],["steady-thinker","Steady Thinker","Completed the market-drop mission.","🧭"],["money-basics","Money Basics Master","Completed the Money Basics path.","🧠"],["inflation-explorer","Inflation Explorer","Understood how prices affect purchasing power.","🎈"],
  ];
  for(const [key,title,description,icon] of achievements) await prisma.achievement.upsert({where:{key},update:{title,description,icon},create:{key,title,description,icon}});
  await prisma.userAchievement.deleteMany({where:{userId:maya.id}}); for(const key of ["first-goal","budget-builder","scam-spotter"]){const achievement=await prisma.achievement.findUniqueOrThrow({where:{key}});await prisma.userAchievement.create({data:{userId:maya.id,achievementId:achievement.id}});}
  for(const [slug,status,progress] of [["build-first-budget","IN_PROGRESS",60],["spot-scam-signs","COMPLETED",100],["complete-money-basics","IN_PROGRESS",40],["create-first-goal","COMPLETED",100],["diversified-practice","IN_PROGRESS",60]] as const){const mission=await prisma.mission.findUniqueOrThrow({where:{slug}});await prisma.missionProgress.create({data:{userId:maya.id,missionId:mission.id,status,progress,completedAt:status==="COMPLETED"?new Date():null,xpAwarded:status==="COMPLETED"}});}
  await prisma.activity.deleteMany({where:{userId:maya.id}}); await prisma.activity.createMany({data:[{userId:maya.id,type:"LESSON_COMPLETED",metadata:JSON.stringify({slug:"needs-vs-wants"})},{userId:maya.id,type:"GOAL_UPDATED",metadata:JSON.stringify({goalId:mayaGoal.id})}]});
  await prisma.evidenceSource.deleteMany();
  await prisma.evidenceSource.create({data:{sourceTitle:"GROW demonstration content note",publisher:"GROW prototype",publicationYear:2026,sourceUrl:null,reviewedAt:new Date("2026-08-20T12:00:00.000Z"),topic:"DEMONSTRATION",isDemo:true,notes:"Clearly labelled prototype metadata. This is not an external research citation."}});
  await prisma.evidenceSource.create({data:{sourceTitle:"FTSE 100 Index Factsheet — data as at 30 September 2024",publisher:"FTSE Russell / London Stock Exchange Group",publicationYear:2024,sourceUrl:"https://docs.londonstockexchange.com/sites/default/files/documents/ukx_20240930.pdf",reviewedAt:new Date("2026-08-21T00:00:00.000Z"),topic:"MARKET_DATA",isDemo:false,notes:"Annual total-return observations are cached for the offline educational portfolio. Past performance is not a forecast."}});
  console.log("GROW complete platform seed ready.");
}

main().finally(()=>prisma.$disconnect());

