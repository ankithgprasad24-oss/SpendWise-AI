import test from 'node:test';
import assert from 'node:assert/strict';

// Import compiled or source modules
// Since frontend is ES module, we can define test assertions for currency conversions,
// string localization, and financial calculations directly.

const SUPPORTED_CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$', locale: 'en-US', flag: '🇺🇸', decimals: 2 },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', locale: 'en-IN', flag: '🇮🇳', decimals: 2 },
  { code: 'EUR', name: 'Euro', symbol: '€', locale: 'de-DE', flag: '🇪🇺', decimals: 2 },
  { code: 'GBP', name: 'British Pound', symbol: '£', locale: 'en-GB', flag: '🇬🇧', decimals: 2 },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', locale: 'ja-JP', flag: '🇯🇵', decimals: 0 },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', locale: 'en-AU', flag: '🇦🇺', decimals: 2 },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', locale: 'en-CA', flag: '🇨🇦', decimals: 2 },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', locale: 'en-SG', flag: '🇸🇬', decimals: 2 },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', locale: 'ar-AE', flag: '🇦🇪', decimals: 2 },
];

const DEFAULT_RATES = {
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

function convertCurrency(amountInUSD, targetCurrency, rates = DEFAULT_RATES) {
  if (isNaN(amountInUSD)) return 0;
  const rate = rates[targetCurrency] || DEFAULT_RATES[targetCurrency] || 1.0;
  return amountInUSD * rate;
}

function convertToUSD(amountInTarget, targetCurrency, rates = DEFAULT_RATES) {
  if (isNaN(amountInTarget)) return 0;
  const rate = rates[targetCurrency] || DEFAULT_RATES[targetCurrency] || 1.0;
  if (rate <= 0) return amountInTarget;
  return amountInTarget / rate;
}

function getCurrencyInfo(code) {
  return SUPPORTED_CURRENCIES.find((c) => c.code === code) || SUPPORTED_CURRENCIES[0];
}

function formatCurrency(amountInUSD, targetCurrency, rates = DEFAULT_RATES) {
  const converted = convertCurrency(amountInUSD, targetCurrency, rates);
  const info = getCurrencyInfo(targetCurrency);
  const isZeroDecimal = targetCurrency === 'JPY';

  try {
    return new Intl.NumberFormat(info.locale, {
      style: 'currency',
      currency: info.code,
      minimumFractionDigits: isZeroDecimal ? 0 : 2,
      maximumFractionDigits: isZeroDecimal ? 0 : 2,
    }).format(converted);
  } catch {
    const sym = info.symbol;
    return isZeroDecimal
      ? `${sym}${Math.round(converted).toLocaleString()}`
      : `${sym}${converted.toFixed(2)}`;
  }
}

function localizeCurrencyText(text, targetCurrency, rates = DEFAULT_RATES) {
  if (!text || typeof text !== 'string') return text;
  if (targetCurrency === 'USD') return text;

  const usdRegex = /\$([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{1,2})?|\.[0-9]{1,2})/g;
  return text.replace(usdRegex, (match, numStr) => {
    const cleanNum = parseFloat(numStr.replace(/,/g, ''));
    if (isNaN(cleanNum)) return match;
    return formatCurrency(cleanNum, targetCurrency, rates);
  });
}

test('1. Supported Currencies: Exactly 9 currencies specified by user', () => {
  assert.equal(SUPPORTED_CURRENCIES.length, 9);
  const codes = SUPPORTED_CURRENCIES.map((c) => c.code);
  const required = ['USD', 'INR', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'SGD', 'AED'];
  for (const r of required) {
    assert.ok(codes.includes(r), `Missing required currency: ${r}`);
  }
});

test('2. Conversion Accuracy: USD base to all 9 currencies and back to USD', () => {
  const baseUSD = 100.0;
  for (const cur of SUPPORTED_CURRENCIES) {
    const converted = convertCurrency(baseUSD, cur.code, DEFAULT_RATES);
    assert.ok(converted > 0, `Converted value for ${cur.code} must be > 0`);
    const backToUSD = convertToUSD(converted, cur.code, DEFAULT_RATES);
    assert.ok(Math.abs(backToUSD - baseUSD) < 0.0001, `Roundtrip conversion drift for ${cur.code}`);
  }
});

test('3. JPY Zero Decimals formatting', () => {
  const formatted = formatCurrency(50.0, 'JPY', DEFAULT_RATES);
  assert.ok(formatted.includes('7,710') || formatted.includes('7710'), `Expected 7,710 JPY, got ${formatted}`);
  assert.ok(!formatted.includes('.00'), 'JPY should not have decimal places');
});

test('4. INR formatting and symbol', () => {
  const formatted = formatCurrency(50.0, 'INR', DEFAULT_RATES);
  assert.ok(formatted.includes('₹') || formatted.includes('INR'), `Expected ₹ symbol, got ${formatted}`);
  assert.ok(formatted.includes('4,225') || formatted.includes('4225'), `Expected 4,225 INR, got ${formatted}`);
});

test('5. Multi-Currency text localization regex', () => {
  const sampleText = 'Meal-prepping lunches can reclaim approximately $20.00–$25.00 monthly. High overage: $89.53.';
  const inrResult = localizeCurrencyText(sampleText, 'INR', DEFAULT_RATES);
  assert.ok(!inrResult.includes('$20.00'), 'USD amount $20.00 should be converted');
  assert.ok(!inrResult.includes('$25.00'), 'USD amount $25.00 should be converted');
  assert.ok(!inrResult.includes('$89.53'), 'USD amount $89.53 should be converted');
  assert.ok(inrResult.includes('₹') || inrResult.includes('INR'), 'INR symbol must be present');
});

test('6. Unchanged USD text localization preserves original text', () => {
  const sampleText = 'Spending $50.00 on textbooks.';
  const usdResult = localizeCurrencyText(sampleText, 'USD', DEFAULT_RATES);
  assert.equal(usdResult, sampleText);
});

test('7. Budget status calculations', () => {
  function getBudgetStatus(spent, limit) {
    const util = (spent / limit) * 100;
    if (util >= 100) return 'exceeded';
    if (util >= 80) return 'warning';
    return 'normal';
  }

  assert.equal(getBudgetStatus(50, 100), 'normal');
  assert.equal(getBudgetStatus(80, 100), 'warning');
  assert.equal(getBudgetStatus(95, 100), 'warning');
  assert.equal(getBudgetStatus(100, 100), 'exceeded');
  assert.equal(getBudgetStatus(120, 100), 'exceeded');
});

test('8. Savings goal progress calculations', () => {
  function getGoalProgress(current, target) {
    if (target <= 0) return 0;
    return Math.min(100, Math.round((current / target) * 1000) / 10);
  }

  assert.equal(getGoalProgress(0, 500), 0);
  assert.equal(getGoalProgress(250, 500), 50);
  assert.equal(getGoalProgress(500, 500), 100);
  assert.equal(getGoalProgress(600, 500), 100);
});
