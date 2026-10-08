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
    expect(screen.getByRole('rowheader', { name: 'BTC' })).toBeDefined();
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

  it('switches language from the status bar and remembers the choice', async () => {
    render(<App />);
    await waitFor(() => expect(document.querySelectorAll('.price-card')).toHaveLength(1));
    expect(screen.getByRole('heading', { name: 'Prices' })).toBeDefined();

    act(() => {
      document.querySelector('tolemak-bar')?.dispatchEvent(
        new CustomEvent('tolemak-lang', { detail: { lang: 'pl' }, bubbles: true }),
      );
    });

    expect(screen.getByRole('heading', { name: 'Ceny' })).toBeDefined();
    expect(localStorage.getItem('lang')).toBe('pl');
    expect(document.documentElement.lang).toBe('pl');
  });

  it('renders and switches language when storage access throws', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('blocked', 'SecurityError');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('blocked', 'SecurityError');
    });
    render(<App />);
    await waitFor(() => expect(document.querySelectorAll('.price-card')).toHaveLength(1));

    act(() => {
      document.querySelector('tolemak-bar')?.dispatchEvent(
        new CustomEvent('tolemak-lang', { detail: { lang: 'pl' }, bubbles: true }),
      );
    });

    expect(screen.getByRole('heading', { name: 'Ceny' })).toBeDefined();
  });

  it('takes over the theme toggle from the status bar', async () => {
    render(<App />);
    await waitFor(() => expect(document.querySelectorAll('.price-card')).toHaveLength(1));
    const before = document.documentElement.getAttribute('data-theme');
    const event = new CustomEvent('tolemak-theme', {
      detail: { theme: before === 'dark' ? 'light' : 'dark' },
      bubbles: true,
      cancelable: true,
    });

    act(() => {
      document.querySelector('tolemak-bar')?.dispatchEvent(event);
    });

    expect(event.defaultPrevented).toBe(true);
    expect(document.documentElement.getAttribute('data-theme')).not.toBe(before);
  });

  it('shows the live state in the status bar', async () => {
    render(<App />);
    await waitFor(() => expect(document.querySelectorAll('.price-card')).toHaveLength(1));

    const fields = Array.from(document.querySelectorAll('tolemak-field')).map((f) => `${f.getAttribute('label')} ${f.textContent}`);
    expect(fields).toContain('exchanges 1/3');
    expect(fields).toContain('pairs 1');
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
