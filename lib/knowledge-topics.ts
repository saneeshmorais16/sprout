export function knowledgeTopicForLesson(slug:string){
  if(/compound|interest/.test(slug))return"COMPOUNDING";
  if(/budget|spending|needs|money-goes|opportunity/.test(slug))return"BUDGETING";
  if(/inflation|time-value/.test(slug))return"INFLATION";
  if(/credit|bnpl|borrow|missed-payment/.test(slug))return"CREDIT";
  if(/scam|phishing|giveaway|impersonation|finfluencer|urgency|too-good/.test(slug))return"SCAMS";
  if(/diversif/.test(slug))return"DIVERSIFICATION";
  if(/volatility|risk|rise-and-fall|uncertain|invest/.test(slug))return"VOLATILITY";
  if(/bank|account|debit|contactless|direct-debit|overdraft/.test(slug))return"BANKING";
  return"SAVING";
}
