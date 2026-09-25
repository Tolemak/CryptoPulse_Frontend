import { cleanup, render, screen, fireEvent } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { PriceTicker } from './PriceTicker';
import type { AggregatedPrice, Pair } from '../types';

const PAIRS: Pair[] = [
  'BTC_USD', 'ETH_USD', 'XRP_USD', 'SOL_USD', 'ADA_USD', 'NEAR_USD',
  'SUI_USD', 'BNB_USD', 'DOGE_USD', 'TRX_USD', 'DOT_USD', 'LINK_USD',
];

const LOADED_AT = '2026-01-01T12:34:56+00:00';

function priceFor(pair: Pair, overrides: Partial<AggregatedPrice> = {}): AggregatedPrice {
  return {
    pair,
    median: 100,
    breakdown: [{ exchange: 'binance', pair, price: 100, fetchedAt: '2026-01-01T00:00:00+00:00' }],
    updatedAt: '2026-01-01T00:00:00+00:00',
    athPrice: 200,
    athDate: '2025-01-01T00:00:00+00:00',
    pctFromAth: -50,
    marketCap: 1000,
    ...overrides,
  };
}

afterEach(cleanup);

describe('PriceTicker', () => {
  it('shows the error message when there is nothing to fall back on', () => {
    render(<PriceTicker prices={[]} loadedAt={null} loading={false} error="boom" />);

    expect(screen.getByText(/boom/)).toBeDefined();
    expect(document.querySelectorAll('.price-card')).toHaveLength(0);
  });

  it('keeps the last good prices on screen when a later fetch fails', () => {
    render(<PriceTicker prices={[priceFor('BTC_USD')]} loadedAt={LOADED_AT} loading={false} error="boom" />);

    expect(document.querySelectorAll('.price-card')).toHaveLength(1);
    expect(document.querySelector('.price-grid-stale')).not.toBeNull();
    expect(screen.getByRole('status').textContent).toContain(new Date(LOADED_AT).toLocaleTimeString());
    expect(screen.queryByText(/boom/)).toBeNull();
  });

  it('still marks the data stale when the load time is unknown', () => {
    render(<PriceTicker prices={[priceFor('BTC_USD')]} loadedAt={null} loading={false} error="boom" />);

    expect(screen.getByRole('status').textContent).toMatch(/out of date/);
  });

  it('shows no stale notice while fetches succeed', () => {
    render(<PriceTicker prices={[priceFor('BTC_USD')]} loadedAt={LOADED_AT} loading={false} error={null} />);

    expect(screen.queryByRole('status')).toBeNull();
    expect(document.querySelector('.price-grid-stale')).toBeNull();
  });

  it('shows a loading state', () => {
    render(<PriceTicker prices={[]} loadedAt={null} loading={true} error={null} />);

    expect(document.querySelectorAll('.price-card')).toHaveLength(0);
  });

  it('shows an empty state when there is no data', () => {
    render(<PriceTicker prices={[]} loadedAt={null} loading={false} error={null} />);

    expect(document.querySelectorAll('.price-card')).toHaveLength(0);
  });

  it('renders every pair when there are ten or fewer', () => {
    render(<PriceTicker prices={PAIRS.slice(0, 10).map((p) => priceFor(p))} loadedAt={LOADED_AT} loading={false} error={null} />);

    expect(document.querySelectorAll('.price-card')).toHaveLength(10);
    expect(document.querySelector('.show-more-btn')).toBeNull();
  });

  it('collapses to ten and expands the rest on demand', () => {
    render(<PriceTicker prices={PAIRS.map((p) => priceFor(p))} loadedAt={LOADED_AT} loading={false} error={null} />);

    expect(document.querySelectorAll('.price-card')).toHaveLength(10);

    const toggle = document.querySelector('.show-more-btn');
    expect(toggle).not.toBeNull();
    expect(toggle?.textContent).toContain('2');

    fireEvent.click(toggle as Element);
    expect(document.querySelectorAll('.price-card')).toHaveLength(12);

    fireEvent.click(document.querySelector('.show-more-btn') as Element);
    expect(document.querySelectorAll('.price-card')).toHaveLength(10);
  });

  it('marks a drop from the all-time high as a loss', () => {
    render(<PriceTicker prices={[priceFor('BTC_USD')]} loadedAt={LOADED_AT} loading={false} error={null} />);

    expect(document.querySelector('.pct-down')).not.toBeNull();
    expect(document.querySelector('.pct-up')).toBeNull();
  });

  it('says so when there is no all-time-high data', () => {
    render(
      <PriceTicker
        prices={[priceFor('BTC_USD', { athPrice: null, athDate: null, pctFromAth: null })]}
        loadedAt={LOADED_AT}
        loading={false}
        error={null}
      />,
    );

    expect(document.querySelector('.pct-down')).toBeNull();
    expect(document.querySelector('.price-ath')?.textContent).toBeTruthy();
  });
});
