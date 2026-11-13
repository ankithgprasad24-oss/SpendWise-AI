import type { CurrencyCode, CurrencyInfo, ExchangeRatesResponse } from '../types';

export const SUPPORTED_CURRENCIES: CurrencyInfo[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$', locale: 'en-US', flag: '🇺🇸', decimals: 2 },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', locale: 'en-IN', flag: '🇮🇳', decimals: 2 },
  { code: 'EUR', name: 'Euro', symbol: '€', locale: 'de-DE', flag: '🇪🇺', decimals: 2 },
  { code: 'GBP', name: 'British Pound', symbol: '£', locale: 'en-GB', flag: '🇬🇧', decimals: 2 },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', locale: 'ja-JP', flag: '🇯🇵', decimals: 0 },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', locale: 'en-AU', flag: '🇦🇺', decimals: 2 },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', locale: 'en-CA', flag: '🇨🇦', decimals: 2 },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', locale: 'en-SG', flag: '🇸🇬', decimals: 2 },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', locale: 'en-AE', flag: '🇦🇪', decimals: 2 },
];

export const DEFAULT_RATES: Record<CurrencyCode, number> = {
  USD: 1.0,
  INR: 84.50,
  EUR: 0.93,
  GBP: 0.79,
  JPY: 154.20,
  AUD: 1.53,
  CAD: 1.39,
  SGD: 1.34,
  AED: 3.6725,
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1';

export async function fetchExchangeRates(): Promise<ExchangeRatesResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/currencies/rates`);
    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (e) {
    console.warn('Using offline cached exchange rates:', e);
  }

  return {
    base: 'USD',
    rates: DEFAULT_RATES,
    source: 'cached',
    last_updated: Date.now(),
  };
}

export function getCurrencyInfo(code: CurrencyCode): CurrencyInfo {
  return (
    SUPPORTED_CURRENCIES.find((c) => c.code === code) || {
      code: 'USD',
      name: 'US Dollar',
      symbol: '$',
      locale: 'en-US',
      flag: '🇺🇸',
      decimals: 2,
    }
  );
}

/**
 * Converts a base USD amount to target currency.
 */
export function convertCurrency(
  amountInUSD: number,
  targetCurrency: CurrencyCode,
  rates: Record<CurrencyCode, number>
): number {
  if (isNaN(amountInUSD)) return 0;
  const rate = rates[targetCurrency] || DEFAULT_RATES[targetCurrency] || 1.0;
  return amountInUSD * rate;
}

/**
 * Converts an amount entered in target currency back to base USD.
 */
export function convertToUSD(
  amountInTarget: number,
  targetCurrency: CurrencyCode,
  rates: Record<CurrencyCode, number>
): number {
  if (isNaN(amountInTarget)) return 0;
  const rate = rates[targetCurrency] || DEFAULT_RATES[targetCurrency] || 1.0;
  if (rate <= 0) return amountInTarget;
  return amountInTarget / rate;
}

/**
 * Formats a base USD amount into the target currency's localized string.
 */
export function formatCurrency(
  amountInUSD: number,
  targetCurrency: CurrencyCode,
  rates: Record<CurrencyCode, number>
): string {
  const converted = convertCurrency(amountInUSD, targetCurrency, rates);
  const info = getCurrencyInfo(targetCurrency);
  const isZeroDecimal = targetCurrency === 'JPY';

  try {
    return new Intl.NumberFormat(info.locale, {
      style: 'currency',
      currency: targetCurrency,
      minimumFractionDigits: isZeroDecimal ? 0 : 2,
      maximumFractionDigits: isZeroDecimal ? 0 : 2,
    }).format(converted);
  } catch {
    // Fallback if specific locale is not supported in the runtime
    return `${info.symbol}${converted.toLocaleString(undefined, {
      minimumFractionDigits: isZeroDecimal ? 0 : 2,
      maximumFractionDigits: isZeroDecimal ? 0 : 2,
    })}`;
  }
}

/**
 * Scans a text string (e.g. from AI insights, recommendations, or summaries)
 * for dollar patterns such as "$13.75", "$20", "$20–$25", "~$15–$25" and converts
 * each detected USD amount into the active target currency using exchange rates.
 */
export function localizeCurrencyText(
  text: string,
  targetCurrency: CurrencyCode,
  rates: Record<CurrencyCode, number>
): string {
  if (!text) return text;
  if (targetCurrency === 'USD') return text;

  // Match expressions like $20, $13.75, $150.00, $580
  return text.replace(/\$(\d+(?:\.\d+)?)/g, (_match, numStr) => {
    const usdVal = parseFloat(numStr);
    if (isNaN(usdVal)) return _match;
    return formatCurrency(usdVal, targetCurrency, rates);
  });
}
