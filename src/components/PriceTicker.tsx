import { useState } from 'react';
import { useT } from '../i18n';
import type { AggregatedPrice, Exchange } from '../types';
import { formatAmount, formatDate, formatPct, formatPrice, formatTime } from '../utils/format';

const COLLAPSED_COUNT = 10;

const EXCHANGES: { id: Exchange; name: string }[] = [
  { id: 'binance', name: 'Binance' },
  { id: 'coinbase', name: 'Coinbase' },
  { id: 'kraken', name: 'Kraken' },
];

interface Props {
  prices: AggregatedPrice[];
  loadedAt: string | null;
  loading: boolean;
  error: string | null;
}

function PriceRow({ price }: { price: AggregatedPrice }) {
  const t = useT();
  const quotes = new Map(price.breakdown.map((quote) => [quote.exchange, quote.price]));
  const values = [...quotes.values()];
  const compared = values.length > 1;
  const cheapest = compared ? Math.min(...values) : null;
  const spread = compared && price.median > 0 ? ((Math.max(...values) - Math.min(...values)) / price.median) * 100 : null;
  const athTitle =
    price.athPrice !== null
      ? t.prices.ath
          .replace('{price}', formatPrice(price.athPrice))
          .replace('{date}', price.athDate ? formatDate(price.athDate) : '?')
      : t.prices.athUnavailable;

  return (
    <tr className="price-card" title={t.prices.updated.replace('{time}', formatTime(price.updatedAt))}>
      <th scope="row" className="coin">{price.pair.split('_')[0]}</th>
      <td className="led median">{formatAmount(price.median)}</td>
      {EXCHANGES.map(({ id }) => {
        const quote = quotes.get(id);
        if (quote === undefined) return <td key={id} className="led missing">—</td>;
        const best = quote === cheapest;
        return (
          <td key={id} className={best ? 'led best' : 'led'}>
            {formatAmount(quote)}
            {best && <span className="visually-hidden"> ({t.board.cheapest})</span>}
          </td>
        );
      })}
      <td className="spread">{spread === null ? '—' : `${spread.toFixed(2)}%`}</td>
      <td className="price-ath" title={athTitle}>
        {price.pctFromAth !== null ? (
          <span className={price.pctFromAth < 0 ? 'pct-down' : 'pct-up'}>{formatPct(price.pctFromAth)}</span>
        ) : (
          <span aria-label={t.prices.athUnavailable}>—</span>
        )}
      </td>
    </tr>
  );
}

export function PriceTicker({ prices, loadedAt, loading, error }: Props) {
  const t = useT();
  const [expanded, setExpanded] = useState(false);
  const stale = error !== null && prices.length > 0;

  if (error && !stale) {
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
      {stale && (
        <p className="status status-stale" role="status">
          {loadedAt ? t.prices.stale.replace('{time}', formatTime(loadedAt)) : t.prices.staleUnknown}
        </p>
      )}
      <div className={stale ? 'price-grid price-grid-stale' : 'price-grid'}>
        <table className="board">
          <thead>
            <tr>
              <th scope="col">{t.board.coin}</th>
              <th scope="col">{t.board.median}</th>
              {EXCHANGES.map(({ id, name }) => (
                <th key={id} scope="col">{name}</th>
              ))}
              <th scope="col">{t.board.spread}</th>
              <th scope="col">{t.board.fromAth}</th>
            </tr>
          </thead>
          <tbody>
            {visiblePrices.map((price) => (
              <PriceRow key={price.pair} price={price} />
            ))}
          </tbody>
        </table>
      </div>
      {hiddenCount > 0 && (
        <button type="button" className="show-more-btn" onClick={() => setExpanded((prev) => !prev)}>
          {expanded ? t.prices.showLess : t.prices.showMore.replace('{count}', String(hiddenCount))}
        </button>
      )}
    </>
  );
}
