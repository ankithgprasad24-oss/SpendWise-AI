import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { CurrencyCode, CurrencyInfo } from '../types';
import {
  SUPPORTED_CURRENCIES,
  DEFAULT_RATES,
  fetchExchangeRates,
  getCurrencyInfo,
  convertCurrency,
  convertToUSD,
  formatCurrency,
  localizeCurrencyText,
} from '../utils/currency';

interface CurrencyContextType {
  currency: CurrencyCode;
  currencyInfo: CurrencyInfo;
  rates: Record<CurrencyCode, number>;
  ratesSource: 'live' | 'cached';
  lastUpdated: number;
  format: (amountInUSD: number) => string;
  convert: (amountInUSD: number) => number;
  fromUSD: (amountInUSD: number) => number;
  toUSD: (amountInSelectedCurrency: number) => number;
  localizeText: (text: string) => string;
  setCurrency: (code: CurrencyCode) => void;
  availableCurrencies: CurrencyInfo[];
  refreshRates: () => Promise<void>;
}

const STORAGE_KEY = 'spendwise_currency_preference';

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && SUPPORTED_CURRENCIES.some((c) => c.code === saved)) {
      return saved as CurrencyCode;
    }
    return 'USD';
  });

  const [rates, setRates] = useState<Record<CurrencyCode, number>>(DEFAULT_RATES);
  const [ratesSource, setRatesSource] = useState<'live' | 'cached'>('cached');
  const [lastUpdated, setLastUpdated] = useState<number>(() => Date.now());

  const loadRates = useCallback(async () => {
    const data = await fetchExchangeRates();
    setRates(data.rates);
    setRatesSource(data.source);
    setLastUpdated(data.last_updated);
  }, []);

  useEffect(() => {
    loadRates();
  }, [loadRates]);

  const setCurrency = (code: CurrencyCode) => {
    setCurrencyState(code);
    localStorage.setItem(STORAGE_KEY, code);
  };

  const currencyInfo = getCurrencyInfo(currency);

  const format = useCallback(
    (amountInUSD: number) => {
      return formatCurrency(amountInUSD, currency, rates);
    },
    [currency, rates]
  );

  const convert = useCallback(
    (amountInUSD: number) => {
      return convertCurrency(amountInUSD, currency, rates);
    },
    [currency, rates]
  );

  const toUSD = useCallback(
    (amountInSelected: number) => {
      return convertToUSD(amountInSelected, currency, rates);
    },
    [currency, rates]
  );

  const localizeText = useCallback(
    (text: string) => {
      return localizeCurrencyText(text, currency, rates);
    },
    [currency, rates]
  );

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        currencyInfo,
        rates,
        ratesSource,
        lastUpdated,
        format,
        convert,
        fromUSD: convert,
        toUSD,
        localizeText,
        setCurrency,
        availableCurrencies: SUPPORTED_CURRENCIES,
        refreshRates: loadRates,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export function useCurrency(): CurrencyContextType {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
