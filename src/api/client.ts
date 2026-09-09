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

export const getPrices = (): Promise<AggregatedPrice[]> => request<AggregatedPrice[]>('/api/prices');

export const refreshPrices = (): Promise<AggregatedPrice[]> => request<AggregatedPrice[]>('/api/prices/refresh', 'POST');
