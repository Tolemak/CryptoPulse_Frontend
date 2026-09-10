import { useState } from 'react';
import { useT } from '../i18n';
import type { AggregatedPrice } from '../types';

const COLLAPSED_COUNT = 10;

// Below $1 a flat 2 decimals rounds sub-cent coins (e.g. SHIB) to $0.00 - show
// enough decimals for 2 significant digits instead, same as above $1.
const formatPrice = (value: number) => {
  const abs = Math.abs(value);
  const maximumFractionDigits = abs > 0 && abs < 1 ? Math.max(2, 1 - Math.floor(Math.log10(abs))) : 2;

  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: Math.min(2, maximumFractionDigits),
    maximumFractionDigits,
  });
};

const formatTime = (iso: string) => new Date(iso).toLocaleTimeString();
const formatDate = (iso: string) => new Date(iso).toLocaleDateString();

const formatPct = (value: number) => `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;

interface Props {
  prices: AggregatedPrice[];
  loading: boolean;
  error: string | null;
}

export function PriceTicker({ prices, loading, error }: Props) {
  const t = useT();
  const [expanded, setExpanded] = useState(false);

  if (error) {
    return <p className="status status-error">{t.prices.error.replace('{error}', error)}</p>;
  }

  if (loading) {
    return <p className="status">{t.prices.loading}</p>;
  }

  if (prices.length === 0) {
    return <p className="status">{t.prices.empty}</p>;
  }

  const hiddenCount = prices.length - COLLAPSED_COUNT;
  const visiblePrices = expanded || hiddenCount <= 0 ? prices : prices.slice(0, COLLAPSED_COUNT);

  return (
    <>
      <div className="price-grid">
        {visiblePrices.map((price) => (
          <article key={price.pair} className="price-card">
            <header>
              <h3>{price.pair.replace('_', ' / ')}</h3>
              <span className="price-median">{formatPrice(price.median)}</span>
            </header>
            <ul className="price-breakdown">
              {price.breakdown.map((quote) => (
                <li key={quote.exchange}>
                  <span className="exchange-name">{quote.exchange}</span>
                  <span>{formatPrice(quote.price)}</span>
                </li>
              ))}
            </ul>
            <p className="price-ath">
              {price.athPrice !== null ? (
                <>
                  {t.prices.ath
                    .replace('{price}', formatPrice(price.athPrice))
                    .replace('{date}', price.athDate ? formatDate(price.athDate) : '?')}
                  {price.pctFromAth !== null && (
                    <span className={price.pctFromAth < 0 ? 'pct-down' : 'pct-up'}>
                      {' '}
                      ({t.prices.pctFromAth.replace('{pct}', formatPct(price.pctFromAth))})
                    </span>
                  )}
                </>
              ) : (
                t.prices.athUnavailable
              )}
            </p>
            <footer>{t.prices.updated.replace('{time}', formatTime(price.updatedAt))}</footer>
          </article>
        ))}
      </div>
      {hiddenCount > 0 && (
        <button type="button" className="show-more-btn" onClick={() => setExpanded((prev) => !prev)}>
          {expanded ? t.prices.showLess : t.prices.showMore.replace('{count}', String(hiddenCount))}
        </button>
      )}
    </>
  );
}
