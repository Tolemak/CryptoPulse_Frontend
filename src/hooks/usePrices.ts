import { useCallback, useEffect, useState } from 'react';
import { ApiError, getPrices, refreshPrices } from '../api/client';
import type { AggregatedPrice } from '../types';

const POLL_INTERVAL_MS = 15_000;
const MANUAL_REFRESH_COOLDOWN_MS = 60_000;

export function usePrices() {
  const [prices, setPrices] = useState<AggregatedPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshBlocked, setRefreshBlocked] = useState(false);
  const [nextManualRefreshAt, setNextManualRefreshAt] = useState(0);
  const [now, setNow] = useState(() => Date.now());

  const load = useCallback(async () => {
    try {
      const data = await getPrices();
      setPrices(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load prices.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // load() is async, so nothing is set before the first await - the lint rule
    // does not follow the call across that boundary.
    // oxlint-disable-next-line react/set-state-in-effect
    load();
    const interval = setInterval(load, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [load]);

  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(tick);
  }, []);

  const canManuallyRefresh = now >= nextManualRefreshAt && !refreshing;
  const manualRefreshCooldownSeconds = now >= nextManualRefreshAt ? 0 : Math.ceil((nextManualRefreshAt - now) / 1000);

  const refresh = useCallback(async () => {
    if (Date.now() < nextManualRefreshAt || refreshing) return;

    setRefreshing(true);
    setRefreshBlocked(false);
    try {
      const data = await refreshPrices();
      setPrices(data);
      setError(null);
      setNextManualRefreshAt(Date.now() + MANUAL_REFRESH_COOLDOWN_MS);
    } catch (e) {
      if (e instanceof ApiError && e.status === 429) {
        const retryAfterMs = (e.retryAfterSeconds ?? MANUAL_REFRESH_COOLDOWN_MS / 1000) * 1000;
        setNextManualRefreshAt(Date.now() + retryAfterMs);
        setRefreshBlocked(true);
      } else {
        setError(e instanceof Error ? e.message : 'Refresh failed.');
      }
    } finally {
      setRefreshing(false);
    }
  }, [nextManualRefreshAt, refreshing]);

  return {
    prices,
    loading,
    error,
    refresh,
    refreshing,
    refreshBlocked,
    canManuallyRefresh,
    manualRefreshCooldownSeconds,
  };
}
