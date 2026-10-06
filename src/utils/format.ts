/**
 * Below $1 a flat 2 decimals rounds sub-cent coins (e.g. SHIB) to $0.00, so
 * enough decimals are used for 2 significant digits; from $1 up it stays at 2.
 */
const priceDigits = (value: number) => {
  const abs = Math.abs(value);
  const maximumFractionDigits = abs > 0 && abs < 1 ? Math.max(2, 1 - Math.floor(Math.log10(abs))) : 2;
  return { minimumFractionDigits: Math.min(2, maximumFractionDigits), maximumFractionDigits };
};

export const formatPrice = (value: number) =>
  value.toLocaleString('en-US', { style: 'currency', currency: 'USD', ...priceDigits(value) });

/** Bare number for the board cells: the currency is stated once in the legend. */
export const formatAmount = (value: number) => value.toLocaleString('en-US', priceDigits(value));

export const formatTime = (iso: string) => new Date(iso).toLocaleTimeString();

export const formatDate = (iso: string) => new Date(iso).toLocaleDateString();

export const formatPct = (value: number) => `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
