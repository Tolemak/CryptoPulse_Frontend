const priceDigits = (value: number) => {
  const abs = Math.abs(value);
  const maximumFractionDigits = abs > 0 && abs < 1 ? Math.max(2, 1 - Math.floor(Math.log10(abs))) : 2;
  return { minimumFractionDigits: Math.min(2, maximumFractionDigits), maximumFractionDigits };
};

export const formatPrice = (value: number) =>
  value.toLocaleString('en-US', { style: 'currency', currency: 'USD', ...priceDigits(value) });

export const formatAmount = (value: number) => value.toLocaleString('en-US', priceDigits(value));

export const formatTime = (iso: string) => new Date(iso).toLocaleTimeString();

export const formatDate = (iso: string) => new Date(iso).toLocaleDateString();

export const formatPct = (value: number) => `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
