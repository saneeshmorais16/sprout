export type LifeStage = "15–17" | "18–22" | "23–25";
export type AgeMode = 16 | 20 | 24;

export const demoAges: AgeMode[] = [16, 20, 24];

export const ageProfiles = {
  16: {
    depth: "Foundational",
    stage: "15–17" as const,
    journey: "Learning the foundations",
    journeyDescription: "Understand payslips, saving and financial risks.",
    context: "Small steps, strong foundations",
    recommended: "Decode your first payslip",
    recommendedDescription: "Learn where your earnings go in under three minutes.",
  },
  20: {
    depth: "Transitional",
    stage: "18–22" as const,
    journey: "Making my first decisions",
    journeyDescription: "Navigate university, work and independent money.",
    context: "Building your money independence",
    recommended: "Make sense of student loans",
    recommendedDescription: "Understand repayments and what they mean for your payslip.",
  },
  24: {
    depth: "Advanced",
    stage: "23–25" as const,
    journey: "Building for my future",
    journeyDescription: "Develop long-term financial habits and confidence.",
    context: "Making your future feel possible",
    recommended: "Build a long-term money plan",
    recommendedDescription: "Connect your pension, savings and goals with confidence.",
  },
} satisfies Record<AgeMode, {
  depth: string;
  stage: LifeStage;
  journey: string;
  journeyDescription: string;
  context: string;
  recommended: string;
  recommendedDescription: string;
}>;

export const features = [
  { title: "Payslip Decoder", descriptions: { 16: "Understand tax, National Insurance and pension deductions.", 20: "See how tax, student loan and pension shape your take-home pay.", 24: "Explore pension contributions and salary changes with clarity." } },
  { title: "Noise Checker", descriptions: { 16: "Learn to recognise finfluencer warning signs.", 20: "Question hype, urgency and too-good-to-be-true money claims.", 24: "Evaluate online financial claims with a sharper critical lens." } },
  { title: "Investment Simulator", descriptions: { 16: "Practise long-term investing without using real money.", 20: "Explore diversification and time using simulated portfolios.", 24: "Stress-test long-term scenarios with no real money invested." } },
  { title: "The Wire", descriptions: { 16: "Understand important financial news in plain English.", 20: "Connect financial headlines to your everyday money.", 24: "Build context around the economic news shaping your plans." } },
] as const;
