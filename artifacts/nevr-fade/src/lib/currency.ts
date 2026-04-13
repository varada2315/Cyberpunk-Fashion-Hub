const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatINR(value: number): string {
  const numeric = Number(value);
  return inrFormatter.format(Number.isFinite(numeric) ? numeric : 0);
}
