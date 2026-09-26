import { useT } from '../i18n';
import type { AggregatedPrice } from '../types';
import { formatTime } from '../utils/format';

const EXCHANGE_COUNT = 3;

interface Props {
  prices: AggregatedPrice[];
  loadedAt: string | null;
  offline: boolean;
}

export function StatusBar({ prices, loadedAt, offline }: Props) {
  const t = useT();
  const exchanges = new Set(prices.flatMap((price) => price.breakdown.map((quote) => quote.exchange))).size;

  return (
    <tolemak-bar app="cryptopulse" home="https://kamil-galkowski.pl" langs="pl,en">
      {offline && (
        <tolemak-field label={t.bar.api} tone="error">
          {t.bar.offline}
        </tolemak-field>
      )}
      {prices.length > 0 && (
        <tolemak-field label={t.bar.exchanges} tone={exchanges === EXCHANGE_COUNT ? 'accent' : 'warn'}>
          {exchanges}/{EXCHANGE_COUNT}
        </tolemak-field>
      )}
      {loadedAt && <tolemak-field label={t.bar.refreshed}>{formatTime(loadedAt)}</tolemak-field>}
      {prices.length > 0 && <tolemak-field label={t.bar.pairs}>{prices.length}</tolemak-field>}
    </tolemak-bar>
  );
}
