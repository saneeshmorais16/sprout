import { z } from "zod";

const strongPassword = z.string().min(10, "Use at least 10 characters.").regex(/[a-z]/, "Add a lowercase letter.").regex(/[A-Z]/, "Add an uppercase letter.").regex(/[0-9]/, "Add a number.");
export const registerSchema = z.object({ firstName: z.string().trim().min(2).max(50), email: z.email().transform((value) => value.toLowerCase()), password: strongPassword, confirmPassword: z.string() }).refine((data) => data.password === data.confirmPassword, { message: "Passwords do not match.", path: ["confirmPassword"] });
export const loginSchema = z.object({ email: z.email().transform((value) => value.toLowerCase()), password: z.string().min(1) });
export const forgotSchema = z.object({ email: z.email().transform((value) => value.toLowerCase()) });
export const resetSchema = z.object({ token: z.string().min(32), password: strongPassword, confirmPassword: z.string() }).refine((data) => data.password === data.confirmPassword, { message: "Passwords do not match.", path: ["confirmPassword"] });
export const growInterests = ["SAVING", "BUDGETING", "RISK", "COMPOUNDING", "DIVERSIFICATION", "MARKET_BASICS"] as const;
export const onboardingSchema = z.object({ age: z.number().int().min(15).max(18), interests: z.array(z.enum(growInterests)).min(1).max(3), confidenceBaseline: z.number().int().min(1).max(5) }).strict();
export const presenterSchema = z.object({ action: z.enum(["RESET_MAYA", "AGE_16", "RESET_ACTIVITY", "RESET_GOALS", "RESET_STREAK", "RESTORE_SEED", "RESET_SIMULATIONS", "COMPLETE_MISSION", "UNLOCK_ACHIEVEMENT", "CHANGE_AVATAR", "RESET_XP_STREAK", "PREPARE_DEMO", "DEMO_MONDAY", "DEMO_WEDNESDAY", "DEMO_FRIDAY"]) }).strict();
export const contentStatusSchema = z.object({ kind: z.enum(["module", "video"]), id: z.string().min(1), published: z.boolean() });

export const goalCategories = ["Emergency fund", "Education", "Travel", "First car", "Home", "Technology", "Personal", "Other"] as const;
export const goalCreateSchema = z.object({
  title: z.string().trim().min(3, "Give your goal a short title.").max(80),
  targetAmount: z.number().positive().max(1_000_000),
  currentAmount: z.number().min(0).max(1_000_000).default(0),
  targetDate: z.iso.date().nullable().optional(),
  category: z.enum(goalCategories),
});
export const goalUpdateSchema = goalCreateSchema.partial().refine((value) => Object.keys(value).length > 0, "No changes supplied.");
export const contributionSchema = z.object({ amount: z.number().positive().max(1_000_000) });
export const activityCompleteSchema = z.object({ type: z.enum(["NOISE_CHECKER"]) });
export const simulatorSchema = z.object({
  monthlyContribution: z.number().int().min(5).max(2000),
  years: z.number().int().min(1).max(50),
  startingAge: z.number().int().min(15).max(60),
  portfolio: z.enum(["STEADY", "BALANCED", "GROWTH"]),
});
const percentage = z.number().int().min(0).max(100);
export const investmentSimulationSchema = z.object({
  allocation: z.object({ CASH: percentage, BONDS: percentage, SHARES: percentage, GLOBAL: percentage }),
  scenarioId: z.enum(["STEADY_GROWTH", "MARKET_DECLINE", "VOLATILE_RECOVERY", "INFLATION_PRESSURE", "MIXED_MARKET", "STRONG_MARKET"]),
  duration: z.enum(["ONE_MONTH", "ONE_YEAR", "FIVE_YEARS"]),
});
export const avatarSchema = z.object({
  character: z.enum(["SPROUT", "SPRIG", "EMBER", "PIP", "NOVA"]),
  colourVariant: z.enum(["MINT", "OCEAN", "BERRY", "SUNSET"]),
  accessory: z.enum(["NONE", "GLASSES", "HEADPHONES", "BACKPACK", "SCARF", "GRADUATION_CAP"]),
});
export const missionCompleteSchema = z.object({ answer: z.literal("REVIEW_HORIZON") }).strict();
export const budgetPracticeSchema = z.object({ decisions: z.array(z.number().int().min(0).max(2)).length(6) });
export const decisionPracticeSchema = z.object({ optionId: z.string().trim().min(1).max(40) });
export const reflectionSchema = z.object({
  activityKey: z.enum(["BUDGET_PAYDAY", "INVESTMENT_PRACTICE", "PORTFOLIO_VOLATILITY", "NOISE_CHECKER", "SAVING_DECISION", "SUBSCRIPTION_DECISION", "FIRST_PAY_DECISION", "EMERGENCY_FUND_DECISION", "CREDIT_DECISION", "PENSION_DECISION"]),
  choice: z.enum(["BUILD_BUFFER", "REVIEW_SUBSCRIPTIONS", "DIVERSIFY_MORE", "CHECK_INFORMATION", "TAKE_MORE_TIME", "COMPARE_TRADE_OFFS", "ASK_A_QUESTION", "CHANGE_MY_SPLIT"]),
  decisionSessionId: z.string().cuid().optional(),
});
export const preferenceSchema = z.object({ notifications: z.boolean().optional(), sprigSounds: z.boolean().optional(), privacyMode: z.enum(["STANDARD", "MINIMAL"]).optional() }).refine(value => Object.keys(value).length > 0, "No preference supplied.");
export const recordIdSchema=z.string().cuid();
export const routeSlugSchema=z.string().trim().min(1).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
export const contentSignalSchema=z.object({signal:z.literal("SKIP_ADVANCED")}).strict();
export const labProgressSchema=z.object({step:z.number().int().min(1).max(3)}).strict();
export const dailyPostCompleteSchema=z.object({choice:z.string().trim().min(1).max(40).regex(/^[A-Z0-9_]+$/)}).strict();
export const portfolioRunSchema=z.object({level:z.literal(1),industry:z.enum(["GAMING","TECH","FASHION","FOOD"]),allocation:z.literal(150)}).strict();
export const portfolioDecisionSchema=z.object({decision:z.enum(["HOLD","SELL"])}).strict();
export const sproutTutorSchema=z.object({
  action:z.enum(["EXPLAIN_THIS","WHY_DID_THIS_HAPPEN","QUIZ_ME","HELP_ME_THINK","ASK_SPROUT"]),
  contextType:z.enum(["LESSON","WEEKLY_LAB","PORTFOLIO_RESULT","PORTFOLIO_CHOICE"]),
  contextId:z.string().trim().min(1).max(100).regex(/^[a-zA-Z0-9_-]+$/),
  question:z.string().trim().min(2).max(200).optional(),
}).strict().superRefine((value,context)=>{
  if(value.action==="ASK_SPROUT"&&!value.question)context.addIssue({code:"custom",path:["question"],message:"Ask Sprout needs a short question."});
  if(value.action!=="ASK_SPROUT"&&value.question!==undefined)context.addIssue({code:"custom",path:["question"],message:"Free text is only accepted by Ask Sprout."});
});

