import { createContext, useContext } from 'react';

export type Lang = 'pl' | 'en';

export const translations = {
  pl: {
    app: {
      title: 'CryptoPulse',
      subtitle: 'Ceny na żywo z kilku giełd, z alertami webhookowymi.',
      sourceLink: 'Kod backendu na GitHubie',
    },
    prices: {
      title: 'Ceny',
      loading: 'Ładowanie cen…',
      error: 'Nie udało się połączyć z API: {error}',
      empty: 'Brak jeszcze danych — backend odpytuje giełdy cyklicznie (app:poll-prices). Uruchom raz, dalej odświeży się samo.',
      updated: 'Zaktualizowano {time}',
      ath: 'Szczyt: {price} ({date})',
      pctFromAth: '{pct} od szczytu',
      athUnavailable: 'Brak danych o szczycie',
      refresh: 'Odśwież',
      refreshing: 'Odświeżanie…',
      refreshCooldown: 'Odśwież ({seconds}s)',
      refreshNotice: 'Ktoś już niedawno odświeżył — spróbuj ponownie za chwilę.',
    },
  },
  en: {
    app: {
      title: 'CryptoPulse',
      subtitle: 'Live multi-exchange price aggregation, with webhook alerts.',
      sourceLink: 'Backend source on GitHub',
    },
    prices: {
      title: 'Prices',
      loading: 'Loading prices…',
      error: 'Could not reach the API: {error}',
      empty: 'No price data yet — the backend polls exchanges on a schedule (app:poll-prices). Run it once, then this refreshes automatically.',
      updated: 'Updated {time}',
      ath: 'ATH: {price} ({date})',
      pctFromAth: '{pct} from ATH',
      athUnavailable: 'No ATH data yet',
      refresh: 'Refresh',
      refreshing: 'Refreshing…',
      refreshCooldown: 'Refresh ({seconds}s)',
      refreshNotice: 'A refresh was already requested recently — try again shortly.',
    },
  },
};

export type LangContextType = {
  lang: Lang;
  setLang: (lang: Lang) => void;
};

export const LangContext = createContext<LangContextType>({
  lang: 'en',
  setLang: () => {},
});

export const useLang = () => useContext(LangContext);

export const useT = () => {
  const { lang } = useLang();
  return translations[lang];
};
