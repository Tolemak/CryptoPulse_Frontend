export type Pair = 'BTC_USD' | 'ETH_USD' | 'SOL_USD';
export type Exchange = 'binance' | 'kraken' | 'coinbase';

export interface PriceQuote {
  exchange: Exchange;
  pair: Pair;
  price: number;
  fetchedAt: string;
}

export interface AggregatedPrice {
  pair: Pair;
  median: number;
  breakdown: PriceQuote[];
  updatedAt: string;
}

export interface ApiErrorBody {
  error: string;
}
