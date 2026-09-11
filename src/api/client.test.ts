import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError, getPrices, refreshPrices } from './client';

function mockFetch(response: Partial<Response> & { json: () => Promise<unknown> }) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    headers: new Headers(),
    ...response,
  });
  vi.stubGlobal('fetch', fetchMock);

  return fetchMock;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('getPrices', () => {
  it('returns the decoded payload', async () => {
    mockFetch({ json: () => Promise.resolve([{ pair: 'BTC_USD' }]) });

    await expect(getPrices()).resolves.toEqual([{ pair: 'BTC_USD' }]);
  });

  it('requests the prices endpoint with GET', async () => {
    const fetchMock = mockFetch({ json: () => Promise.resolve([]) });

    await getPrices();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toContain('/api/prices');
    expect(init.method).toBe('GET');
  });

  it('raises an ApiError carrying the server message', async () => {
    mockFetch({
      ok: false,
      status: 503,
      headers: new Headers(),
      json: () => Promise.resolve({ error: 'Upstream is down' }),
    });

    await expect(getPrices()).rejects.toMatchObject({
      name: 'ApiError',
      status: 503,
      message: 'Upstream is down',
    });
  });

  it('falls back to a generic message when the body is not JSON', async () => {
    mockFetch({
      ok: false,
      status: 500,
      headers: new Headers(),
      json: () => Promise.reject(new Error('not json')),
    });

    await expect(getPrices()).rejects.toThrow('Request failed with status 500');
  });
});

describe('refreshPrices', () => {
  it('uses POST', async () => {
    const fetchMock = mockFetch({ json: () => Promise.resolve([]) });

    await refreshPrices();

    expect(fetchMock.mock.calls[0][1].method).toBe('POST');
  });

  it('exposes Retry-After from a 429 so the caller can back off', async () => {
    mockFetch({
      ok: false,
      status: 429,
      headers: new Headers({ 'Retry-After': '42' }),
      json: () => Promise.resolve({ error: 'Too many requests' }),
    });

    const error = await refreshPrices().catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).retryAfterSeconds).toBe(42);
  });
});
