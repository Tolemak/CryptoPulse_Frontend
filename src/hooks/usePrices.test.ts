import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { usePrices } from './usePrices';
import { ApiError } from '../api/client';
import * as client from '../api/client';
import type { AggregatedPrice } from '../types';

const sample: AggregatedPrice[] = [
  {
    pair: 'BTC_USD',
    median: 100,
    breakdown: [],
    updatedAt: '2026-01-01T00:00:00+00:00',
    athPrice: null,
    athDate: null,
    pctFromAth: null,
    marketCap: null,
  },
];

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('usePrices', () => {
  it('loads prices on mount and stops loading', async () => {
    vi.spyOn(client, 'getPrices').mockResolvedValue(sample);

    const { result } = renderHook(() => usePrices());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.prices).toEqual(sample);
    expect(result.current.error).toBeNull();
  });

  it('surfaces a load failure as an error message', async () => {
    vi.spyOn(client, 'getPrices').mockRejectedValue(new Error('network down'));

    const { result } = renderHook(() => usePrices());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('network down');
  });

  it('remembers when the prices were last loaded', async () => {
    vi.spyOn(client, 'getPrices').mockResolvedValue(sample);

    const { result } = renderHook(() => usePrices());

    await waitFor(() => expect(result.current.loadedAt).not.toBeNull());
    expect(Date.now() - Date.parse(result.current.loadedAt as string)).toBeLessThan(5_000);
  });

  it('keeps the last good prices when a later poll fails', async () => {
    const getPrices = vi.spyOn(client, 'getPrices').mockResolvedValueOnce(sample).mockRejectedValue(new Error('network down'));

    const { result } = renderHook(() => usePrices());
    await waitFor(() => expect(result.current.prices).toEqual(sample));
    const loadedAt = result.current.loadedAt;

    await act(async () => {
      await vi.advanceTimersByTimeAsync(15_000);
    });

    expect(getPrices.mock.calls.length).toBeGreaterThan(1);
    expect(result.current.error).toBe('network down');
    expect(result.current.prices).toEqual(sample);
    expect(result.current.loadedAt).toBe(loadedAt);
  });

  it('clears the error once a poll succeeds again', async () => {
    vi.spyOn(client, 'getPrices').mockRejectedValueOnce(new Error('network down')).mockResolvedValue(sample);

    const { result } = renderHook(() => usePrices());
    await waitFor(() => expect(result.current.error).toBe('network down'));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(15_000);
    });

    expect(result.current.error).toBeNull();
    expect(result.current.prices).toEqual(sample);
  });

  it('polls again on the interval', async () => {
    const getPrices = vi.spyOn(client, 'getPrices').mockResolvedValue(sample);

    renderHook(() => usePrices());

    await waitFor(() => expect(getPrices).toHaveBeenCalledTimes(1));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(15_000);
    });

    expect(getPrices.mock.calls.length).toBeGreaterThan(1);
  });

  it('stops polling once unmounted', async () => {
    const getPrices = vi.spyOn(client, 'getPrices').mockResolvedValue(sample);

    const { unmount } = renderHook(() => usePrices());
    await waitFor(() => expect(getPrices).toHaveBeenCalledTimes(1));

    unmount();
    const callsAtUnmount = getPrices.mock.calls.length;

    await act(async () => {
      await vi.advanceTimersByTimeAsync(60_000);
    });

    expect(getPrices.mock.calls.length).toBe(callsAtUnmount);
  });

  it('replaces the prices after a manual refresh and starts a cooldown', async () => {
    vi.spyOn(client, 'getPrices').mockResolvedValue([]);
    const refreshed = [{ ...sample[0], median: 250 }];
    vi.spyOn(client, 'refreshPrices').mockResolvedValue(refreshed);

    const { result } = renderHook(() => usePrices());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.refresh();
    });

    expect(result.current.prices).toEqual(refreshed);
    expect(result.current.canManuallyRefresh).toBe(false);
    expect(result.current.manualRefreshCooldownSeconds).toBeGreaterThan(0);
  });

  it('honours Retry-After when the server rejects a refresh', async () => {
    vi.spyOn(client, 'getPrices').mockResolvedValue([]);
    vi.spyOn(client, 'refreshPrices').mockRejectedValue(new ApiError('slow down', 429, 30));

    const { result } = renderHook(() => usePrices());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.refresh();
    });

    // The countdown is rounded up, so a started second still shows as a full one.
    expect(result.current.refreshBlocked).toBe(true);
    expect(result.current.manualRefreshCooldownSeconds).toBeGreaterThanOrEqual(29);
    expect(result.current.manualRefreshCooldownSeconds).toBeLessThanOrEqual(31);
  });

  it('reports a non-429 refresh failure as an error', async () => {
    vi.spyOn(client, 'getPrices').mockResolvedValue([]);
    vi.spyOn(client, 'refreshPrices').mockRejectedValue(new Error('refresh exploded'));

    const { result } = renderHook(() => usePrices());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.refresh();
    });

    expect(result.current.error).toBe('refresh exploded');
    expect(result.current.refreshBlocked).toBe(false);
  });
});
