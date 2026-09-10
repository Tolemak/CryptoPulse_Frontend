export type Pair =
  | 'BTC_USD'
  | 'ETH_USD'
  | 'XRP_USD'
  | 'SOL_USD'
  | 'ADA_USD'
  | 'NEAR_USD'
  | 'SUI_USD'
  | 'BNB_USD'
  | 'DOGE_USD'
  | 'TRX_USD'
  | 'DOT_USD'
  | 'LINK_USD'
  | 'LTC_USD'
  | 'AVAX_USD'
  | 'ATOM_USD'
  | 'XLM_USD'
  | 'UNI_USD'
  | 'ETC_USD'
  | 'FIL_USD'
  | 'APT_USD'
  | 'ARB_USD'
  | 'OP_USD'
  | 'ICP_USD'
  | 'HBAR_USD'
  | 'VET_USD'
  | 'ALGO_USD'
  | 'SHIB_USD'
  | 'BCH_USD'
  | 'AAVE_USD'
  | 'INJ_USD';

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
  athPrice: number | null;
  athDate: string | null;
  pctFromAth: number | null;
}

export interface ApiErrorBody {
  error: string;
}
