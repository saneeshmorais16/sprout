export function pounds(pence: number) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: pence % 100 === 0 ? 0 : 2 }).format(pence / 100);
}

export function goalMetrics(targetPence: number, savedPence: number, targetDate: Date | string | null) {
  const remainingPence = Math.max(0, targetPence - savedPence);
  const percent = targetPence > 0 ? Math.min(100, Math.round((savedPence / targetPence) * 100)) : 0;
  const end = targetDate ? new Date(targetDate) : null;
  const months = end ? Math.max(1, Math.ceil((end.getTime() - Date.now()) / (30.44 * 86_400_000))) : null;
  return { remainingPence, percent, monthlyPence: months ? Math.ceil(remainingPence / months) : null };
}
