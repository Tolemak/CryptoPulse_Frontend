// Below $1 a flat 2 decimals rounds sub-cent coins (e.g. SHIB) to $0.00 - show
// enough decimals for 2 significant digits instead, same as above $1.
export const formatPrice = (value: number) => {
  const abs = Math.abs(value);
  const maximumFractionDigits = abs > 0 && abs < 1 ? Math.max(2, 1 - Math.floor(Math.log10(abs))) : 2;

  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: Math.min(2, maximumFractionDigits),
    maximumFractionDigits,
  });
};

export const formatTime = (iso: string) => new Date(iso).toLocaleTimeString();

export const formatDate = (iso: string) => new Date(iso).toLocaleDateString();

export const formatPct = (value: number) => `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
