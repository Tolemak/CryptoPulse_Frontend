import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import * as client from './api/client';
import type { AggregatedPrice } from './types';

const sample: AggregatedPrice[] = [
  {
    pair: 'BTC_USD',
    median: 77362.5,
    breakdown: [{ exchange: 'binance', pair: 'BTC_USD', price: 77362.5, fetchedAt: '2026-01-01T00:00:00+00:00' }],
    updatedAt: '2026-01-01T00:00:00+00:00',
    athPrice: 126080,
    athDate: '2025-10-06T00:00:00+00:00',
    pctFromAth: -38.64,
    marketCap: 1_500_000_000_000,
  },
];

beforeEach(() => {
  localStorage.clear();
  vi.spyOn(client, 'getPrices').mockResolvedValue(sample);
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('App', () => {
  it('renders the fetched prices', async () => {
    render(<App />);

    await waitFor(() => expect(document.querySelectorAll('.price-card')).toHaveLength(1));
    expect(screen.getByText('BTC / USD')).toBeDefined();
  });

  it('links back to the portfolio and both repositories', () => {
    render(<App />);

    const hrefs = Array.from(document.querySelectorAll('.app-footer a')).map((a) => a.getAttribute('href'));
    expect(hrefs).toEqual([
      'https://kamil-galkowski.pl',
      'https://github.com/Tolemak/CryptoPulse_Frontend',
      'https://github.com/Tolemak/CryptoPulse_BackendDemo',
    ]);
  });

  it('switches language and remembers the choice', async () => {
    render(<App />);
    await waitFor(() => expect(document.querySelectorAll('.price-card')).toHaveLength(1));

    const langButton = screen.getByRole('button', { name: /^(PL|EN)$/ });
    const before = langButton.textContent;

    fireEvent.click(langButton);

    expect(screen.getByRole('button', { name: /^(PL|EN)$/ }).textContent).not.toBe(before);
    expect(localStorage.getItem('lang')).toBeTruthy();
  });

  it('toggles the theme from the header', async () => {
    render(<App />);
    await waitFor(() => expect(document.querySelectorAll('.price-card')).toHaveLength(1));

    const themeButton = screen.getByRole('button', { name: /mode/i });
    const before = document.documentElement.getAttribute('data-theme');

    fireEvent.click(themeButton);

    expect(document.documentElement.getAttribute('data-theme')).not.toBe(before);
  });

  it('labels the theme toggle in the selected language', async () => {
    localStorage.setItem('lang', 'pl');
    render(<App />);
    await waitFor(() => expect(document.querySelectorAll('.price-card')).toHaveLength(1));

    expect(screen.getByRole('button', { name: /motyw/i })).toBeDefined();
  });

  it('keeps showing prices when a later poll fails', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.spyOn(client, 'getPrices').mockResolvedValueOnce(sample).mockRejectedValue(new Error('offline'));
    render(<App />);
    await waitFor(() => expect(document.querySelectorAll('.price-card')).toHaveLength(1));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(15_000);
    });

    expect(document.querySelectorAll('.price-card')).toHaveLength(1);
    expect(screen.getByRole('status').textContent).toMatch(/Cannot reach the API/);
  });

  it('triggers a manual refresh', async () => {
    const refreshPrices = vi.spyOn(client, 'refreshPrices').mockResolvedValue(sample);
    render(<App />);
    await waitFor(() => expect(document.querySelectorAll('.price-card')).toHaveLength(1));

    fireEvent.click(screen.getByRole('button', { name: /refresh|odśwież/i }));

    await waitFor(() => expect(refreshPrices).toHaveBeenCalled());
  });
});
