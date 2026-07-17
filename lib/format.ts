/** Format whole-rupee amounts the way the store displays them: "Rs. 1,299" */
export function formatPKR(amount: number): string {
  return `Rs. ${amount.toLocaleString("en-PK")}`;
}

/** Percentage off for sale badges, e.g. (600, 480) -> 20 */
export function discountPercent(compareAt: number, price: number): number {
  if (compareAt <= 0 || price >= compareAt) return 0;
  return Math.round(((compareAt - price) / compareAt) * 100);
}

/** "34 / B" style variant label from an option-values map */
export function variantTitle(optionValues: Record<string, string>): string {
  const values = Object.values(optionValues);
  return values.length ? values.join(" / ") : "Default";
}
