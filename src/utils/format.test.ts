import { describe, expect, it } from 'vitest';
import { formatPct, formatPrice } from './format';

describe('formatPrice', () => {
  it('keeps two decimals at and above one dollar', () => {
    expect(formatPrice(77362.5)).toBe('$77,362.50');
    expect(formatPrice(1)).toBe('$1.00');
    expect(formatPrice(1.364)).toBe('$1.36');
  });

  it('keeps two significant digits below one dollar', () => {
    expect(formatPrice(0.21)).toBe('$0.21');
    expect(formatPrice(0.084)).toBe('$0.084');
    expect(formatPrice(0.0000051)).toBe('$0.0000051');
  });

  it('does not collapse sub-cent prices to zero', () => {
    expect(formatPrice(0.00000747)).not.toBe('$0.00');
  });

  it('formats zero as plain currency', () => {
    expect(formatPrice(0)).toBe('$0.00');
  });
});

describe('formatPct', () => {
  it('marks gains with an explicit plus', () => {
    expect(formatPct(12.3)).toBe('+12.30%');
  });

  it('leaves the minus sign on losses', () => {
    expect(formatPct(-38.64)).toBe('-38.64%');
  });

  it('treats zero as neither gain nor loss', () => {
    expect(formatPct(0)).toBe('0.00%');
  });
});
