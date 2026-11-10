/**
 * Formats a number to Indonesian Rupiah currency format.
 * Example: 435000000 -> "Rp 435.000.000"
 */
export function formatRupiah(amount: number, withPrefix = true): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return withPrefix ? "Rp 0" : "0";
  }
  const rounded = Math.round(amount);
  const formatted = new Intl.NumberFormat("id-ID").format(rounded);
  return withPrefix ? `Rp ${formatted}` : formatted;
}

/**
 * Parses user input string (with dots, commas, "Rp", etc) back to pure integer number.
 * Example: "Rp 435.000.000" -> 435000000
 */
export function parseRupiah(str: string | number): number {
  if (typeof str === "number") return isNaN(str) ? 0 : str;
  if (!str) return 0;
  // Strip non-digit characters except negative sign
  const cleaned = str.toString().replace(/[^\d]/g, "");
  const parsed = parseInt(cleaned, 10);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Formats a percentage number.
 * Example: 3.75 -> "3.75%"
 */
export function formatPercent(rate: number, decimalPlaces = 2): string {
  if (isNaN(rate) || rate === null || rate === undefined) return "0%";
  return `${rate.toFixed(decimalPlaces).replace(/\.00$/, "")}%`;
}

/**
 * Standard integer formatter with dot separators.
 */
export function formatNumber(num: number): string {
  if (isNaN(num) || num === null || num === undefined) return "0";
  return new Intl.NumberFormat("id-ID").format(Math.round(num));
}

/**
 * Psychological Micro-Installment Reframing:
 * Converts monthly payment to daily cost & compares to ordinary lifestyle spending (e.g. coffee / lunch).
 */
export function formatMicroDaily(monthlyAmount: number) {
  const daily = Math.round(monthlyAmount / 30);
  const cupsOfCoffee = Math.max(1, Math.round(daily / 25000));
  return {
    dailyAmount: daily,
    formattedDaily: formatRupiah(daily),
    cupsOfCoffee,
    phrase: `Setara Rp ${formatNumber(daily)} / hari (${cupsOfCoffee} cangkir kopi kekinian)`,
  };
}
