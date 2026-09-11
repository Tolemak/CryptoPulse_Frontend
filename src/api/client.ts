import type { AggregatedPrice, ApiErrorBody } from '../types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';

export class ApiError extends Error {
  readonly status: number;
  readonly retryAfterSeconds?: number;

  constructor(message: string, status: number, retryAfterSeconds?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

async function request<T>(path: string, method: 'GET' | 'POST' = 'GET'): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    let body: ApiErrorBody | undefined;
    try {
      body = await response.json();
    } catch {
      // ignore
    }
    const retryAfterHeader = response.headers.get('Retry-After');
    const retryAfterSeconds = retryAfterHeader ? Number(retryAfterHeader) : undefined;
    throw new ApiError(body?.error ?? `Request failed with status ${response.status}`, response.status, retryAfterSeconds);
  }

  return response.json();
}

function isAggregatedPrice(value: unknown): value is AggregatedPrice {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const p = value as Record<string, unknown>;

  return (
    typeof p.pair === 'string' &&
    typeof p.median === 'number' &&
    Array.isArray(p.breakdown) &&
    typeof p.updatedAt === 'string' &&
    (p.athPrice === null || typeof p.athPrice === 'number') &&
    (p.athDate === null || typeof p.athDate === 'string') &&
    (p.pctFromAth === null || typeof p.pctFromAth === 'number') &&
    (p.marketCap === null || typeof p.marketCap === 'number')
  );
}

function validatePrices(data: unknown): AggregatedPrice[] {
  if (!Array.isArray(data) || !data.every(isAggregatedPrice)) {
    throw new ApiError('Received malformed price data from the API.', 502);
  }

  return data;
}

async function requestPrices(path: string, method: 'GET' | 'POST'): Promise<AggregatedPrice[]> {
  return validatePrices(await request<unknown>(path, method));
}

export const getPrices = (): Promise<AggregatedPrice[]> => requestPrices('/api/prices', 'GET');

export const refreshPrices = (): Promise<AggregatedPrice[]> => requestPrices('/api/prices/refresh', 'POST');
