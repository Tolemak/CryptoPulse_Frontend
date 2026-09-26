import { useCallback, useEffect, useMemo, useState } from 'react';
import './App.css';
import { PriceTicker } from './components/PriceTicker';
import { StatusBar } from './components/StatusBar';
import { usePrices } from './hooks/usePrices';
import { LangContext, useT, type Lang, type LangContextType } from './i18n';
import { ThemeProvider } from './contexts/ThemeContext';

function Dashboard() {
  const t = useT();
  const {
    prices,
    loadedAt,
    loading,
    error,
    refresh,
    refreshing,
    refreshBlocked,
    canManuallyRefresh,
    manualRefreshCooldownSeconds,
  } = usePrices();

  let refreshLabel = t.prices.refresh;
  if (refreshing) {
    refreshLabel = t.prices.refreshing;
  } else if (!canManuallyRefresh) {
    refreshLabel = t.prices.refreshCooldown.replace('{seconds}', String(manualRefreshCooldownSeconds));
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>
          <span className="pulse" key={loadedAt ?? 'waiting'} aria-hidden="true" />
          {t.app.title}
        </h1>
        <p>{t.app.subtitle}</p>
      </header>

      <section className="board-panel" aria-labelledby="prices-title">
        <div className="section-header">
          <div>
            <h2 id="prices-title">{t.prices.title}</h2>
            <p className="legend">{t.board.legend}</p>
          </div>
          <button type="button" onClick={refresh} disabled={!canManuallyRefresh} className="refresh-btn">
            {refreshLabel}
          </button>
        </div>
        {refreshBlocked && <p className="status refresh-notice">{t.prices.refreshNotice}</p>}
        <PriceTicker prices={prices} loadedAt={loadedAt} loading={loading} error={error} />
      </section>

      <footer className="app-footer">
        <a href="https://kamil-galkowski.pl" target="_blank" rel="noopener noreferrer">
          {t.footer.portfolio}
        </a>
        <span>
          {t.footer.source}{' '}
          <a href="https://github.com/Tolemak/CryptoPulse_Frontend" target="_blank" rel="noopener noreferrer">
            frontend
          </a>
          {' · '}
          <a href="https://github.com/Tolemak/CryptoPulse_BackendDemo" target="_blank" rel="noopener noreferrer">
            backend
          </a>
        </span>
      </footer>

      <StatusBar prices={prices} loadedAt={loadedAt} offline={error !== null} />
    </div>
  );
}

function App() {
  const [lang, setLangState] = useState<Lang>(() => {
    const stored = localStorage.getItem('lang');
    return stored === 'pl' ? 'pl' : 'en';
  });

  const setLang = useCallback<LangContextType['setLang']>((next) => {
    localStorage.setItem('lang', next);
    setLangState(next);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  // The language button lives in the shared status bar, which only announces the choice.
  useEffect(() => {
    const onLang = (event: Event) => {
      const next = (event as CustomEvent<{ lang: string }>).detail.lang;
      if (next === 'pl' || next === 'en') setLang(next);
    };
    document.addEventListener('tolemak-lang', onLang);
    return () => document.removeEventListener('tolemak-lang', onLang);
  }, [setLang]);

  const contextValue = useMemo(() => ({ lang, setLang }), [lang, setLang]);

  return (
    <ThemeProvider>
      <LangContext.Provider value={contextValue}>
        <Dashboard />
      </LangContext.Provider>
    </ThemeProvider>
  );
}

export default App;
