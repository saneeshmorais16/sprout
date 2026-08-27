export const financialSkills = [
  { key: "SAVING", label: "Saving", description: "Build habits, understand interest and see how time can matter." },
  { key: "BUDGETING", label: "Budgeting", description: "Plan spending and make trade-offs with limited money." },
  { key: "STAYING_SAFE", label: "Staying Safe", description: "Pause, check and recognise common scam tactics." },
  { key: "EARNING", label: "Earning", description: "Understand first pay, deductions and workplace basics." },
  { key: "BORROWING", label: "Borrowing", description: "Explore repayments, credit and the true cost of later." },
  { key: "PLANNING", label: "Planning", description: "Prepare for goals, recurring costs and unexpected changes." },
  { key: "INVESTING_BASICS", label: "Investing Basics", description: "Practise uncertainty, risk and diversification safely." },
] as const;

export type FinancialSkillKey = typeof financialSkills[number]["key"];

export function currentFinancialSkill(topic: string | null | undefined) {
  const normalised = (topic ?? "").toUpperCase();
  return financialSkills.find(skill => normalised.includes(skill.key) || normalised.includes(skill.label.toUpperCase())) ?? financialSkills[0];
}

export function skillForLesson(path: string, title: string): FinancialSkillKey {
  const value = `${path} ${title}`.toUpperCase();
  if (/SCAM|PHISH|PROTECT|SAFE|GIVEAWAY|URGENCY/.test(value)) return "STAYING_SAFE";
  if (/PAY|JOB|INCOME|PENSION|EARNING/.test(value)) return "EARNING";
  if (/BORROW|CREDIT|BNPL|OVERDRAFT|REPAY/.test(value)) return "BORROWING";
  if (/BUDGET|NEEDS|WANTS|SPEND|WHERE DOES/.test(value)) return "BUDGETING";
  if (/SUBSCRIPTION|GOAL|BUFFER|TRANSITION|BILL/.test(value)) return "PLANNING";
  if (/INVEST|RISK|DIVERS|VOLATIL|TIME HORIZON/.test(value)) return "INVESTING_BASICS";
  return "SAVING";
}
