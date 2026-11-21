export interface CountryRegion {
  code: string;
  name: string;
  currency: string;
  dialCode: string;
  defaultLang: string;
  usdRate: number;
}

export const WORLD_REGIONS: CountryRegion[] = [
  { code: 'IN', name: 'India', currency: 'INR', dialCode: '+91', defaultLang: 'hi', usdRate: 84 },
  { code: 'US', name: 'United States', currency: 'USD', dialCode: '+1', defaultLang: 'en', usdRate: 1 },
  { code: 'GB', name: 'United Kingdom', currency: 'GBP', dialCode: '+44', defaultLang: 'en', usdRate: 0.79 },
  { code: 'AE', name: 'United Arab Emirates', currency: 'AED', dialCode: '+971', defaultLang: 'ar', usdRate: 3.67 },
  { code: 'SA', name: 'Saudi Arabia', currency: 'SAR', dialCode: '+966', defaultLang: 'ar', usdRate: 3.75 },
  { code: 'DE', name: 'Germany', currency: 'EUR', dialCode: '+49', defaultLang: 'de', usdRate: 0.92 },
  { code: 'FR', name: 'France', currency: 'EUR', dialCode: '+33', defaultLang: 'fr', usdRate: 0.92 },
  { code: 'ES', name: 'Spain', currency: 'EUR', dialCode: '+34', defaultLang: 'es', usdRate: 0.92 },
  { code: 'IT', name: 'Italy', currency: 'EUR', dialCode: '+39', defaultLang: 'it', usdRate: 0.92 },
  { code: 'NL', name: 'Netherlands', currency: 'EUR', dialCode: '+31', defaultLang: 'en', usdRate: 0.92 },
  { code: 'CA', name: 'Canada', currency: 'CAD', dialCode: '+1', defaultLang: 'en', usdRate: 1.38 },
  { code: 'AU', name: 'Australia', currency: 'AUD', dialCode: '+61', defaultLang: 'en', usdRate: 1.52 },
  { code: 'SG', name: 'Singapore', currency: 'SGD', dialCode: '+65', defaultLang: 'en', usdRate: 1.34 },
  { code: 'MY', name: 'Malaysia', currency: 'MYR', dialCode: '+60', defaultLang: 'en', usdRate: 4.42 },
  { code: 'ID', name: 'Indonesia', currency: 'IDR', dialCode: '+62', defaultLang: 'id', usdRate: 15700 },
  { code: 'PH', name: 'Philippines', currency: 'PHP', dialCode: '+63', defaultLang: 'en', usdRate: 58 },
  { code: 'TH', name: 'Thailand', currency: 'THB', dialCode: '+66', defaultLang: 'en', usdRate: 34.5 },
  { code: 'VN', name: 'Vietnam', currency: 'VND', dialCode: '+84', defaultLang: 'vi', usdRate: 25300 },
  { code: 'JP', name: 'Japan', currency: 'JPY', dialCode: '+81', defaultLang: 'ja', usdRate: 152 },
  { code: 'KR', name: 'South Korea', currency: 'KRW', dialCode: '+82', defaultLang: 'ko', usdRate: 1380 },
  { code: 'CN', name: 'China', currency: 'CNY', dialCode: '+86', defaultLang: 'zh', usdRate: 7.2 },
  { code: 'HK', name: 'Hong Kong', currency: 'HKD', dialCode: '+852', defaultLang: 'zh', usdRate: 7.78 },
  { code: 'TW', name: 'Taiwan', currency: 'TWD', dialCode: '+886', defaultLang: 'zh', usdRate: 32 },
  { code: 'BD', name: 'Bangladesh', currency: 'BDT', dialCode: '+880', defaultLang: 'bn', usdRate: 119 },
  { code: 'PK', name: 'Pakistan', currency: 'PKR', dialCode: '+92', defaultLang: 'ur', usdRate: 278 },
  { code: 'LK', name: 'Sri Lanka', currency: 'LKR', dialCode: '+94', defaultLang: 'en', usdRate: 295 },
  { code: 'NP', name: 'Nepal', currency: 'NPR', dialCode: '+977', defaultLang: 'hi', usdRate: 134 },
  { code: 'QA', name: 'Qatar', currency: 'QAR', dialCode: '+974', defaultLang: 'ar', usdRate: 3.64 },
  { code: 'KW', name: 'Kuwait', currency: 'KWD', dialCode: '+965', defaultLang: 'ar', usdRate: 0.31 },
  { code: 'OM', name: 'Oman', currency: 'OMR', dialCode: '+968', defaultLang: 'ar', usdRate: 0.38 },
  { code: 'BH', name: 'Bahrain', currency: 'BHD', dialCode: '+973', defaultLang: 'ar', usdRate: 0.38 },
  { code: 'EG', name: 'Egypt', currency: 'EGP', dialCode: '+20', defaultLang: 'ar', usdRate: 49 },
  { code: 'TR', name: 'Turkey', currency: 'TRY', dialCode: '+90', defaultLang: 'tr', usdRate: 34.4 },
  { code: 'BR', name: 'Brazil', currency: 'BRL', dialCode: '+55', defaultLang: 'pt', usdRate: 5.75 },
  { code: 'PT', name: 'Portugal', currency: 'EUR', dialCode: '+351', defaultLang: 'pt', usdRate: 0.92 },
  { code: 'MX', name: 'Mexico', currency: 'MXN', dialCode: '+52', defaultLang: 'es', usdRate: 20.1 },
  { code: 'AR', name: 'Argentina', currency: 'ARS', dialCode: '+54', defaultLang: 'es', usdRate: 995 },
  { code: 'CO', name: 'Colombia', currency: 'COP', dialCode: '+57', defaultLang: 'es', usdRate: 4350 },
  { code: 'CL', name: 'Chile', currency: 'CLP', dialCode: '+56', defaultLang: 'es', usdRate: 970 },
  { code: 'PE', name: 'Peru', currency: 'PEN', dialCode: '+51', defaultLang: 'es', usdRate: 3.76 },
  { code: 'NG', name: 'Nigeria', currency: 'NGN', dialCode: '+234', defaultLang: 'en', usdRate: 1650 },
  { code: 'KE', name: 'Kenya', currency: 'KES', dialCode: '+254', defaultLang: 'sw', usdRate: 129 },
  { code: 'TZ', name: 'Tanzania', currency: 'TZS', dialCode: '+255', defaultLang: 'sw', usdRate: 2680 },
  { code: 'ZA', name: 'South Africa', currency: 'ZAR', dialCode: '+27', defaultLang: 'en', usdRate: 18.1 },
  { code: 'GH', name: 'Ghana', currency: 'GHS', dialCode: '+233', defaultLang: 'en', usdRate: 16.2 },
  { code: 'MA', name: 'Morocco', currency: 'MAD', dialCode: '+212', defaultLang: 'ar', usdRate: 9.9 },
  { code: 'CH', name: 'Switzerland', currency: 'CHF', dialCode: '+41', defaultLang: 'de', usdRate: 0.88 },
  { code: 'SE', name: 'Sweden', currency: 'SEK', dialCode: '+46', defaultLang: 'en', usdRate: 10.8 },
  { code: 'NO', name: 'Norway', currency: 'NOK', dialCode: '+47', defaultLang: 'en', usdRate: 11 },
  { code: 'DK', name: 'Denmark', currency: 'DKK', dialCode: '+45', defaultLang: 'en', usdRate: 6.85 },
  { code: 'PL', name: 'Poland', currency: 'PLN', dialCode: '+48', defaultLang: 'en', usdRate: 4.05 },
  { code: 'IE', name: 'Ireland', currency: 'EUR', dialCode: '+353', defaultLang: 'en', usdRate: 0.92 },
  { code: 'BE', name: 'Belgium', currency: 'EUR', dialCode: '+32', defaultLang: 'fr', usdRate: 0.92 },
  { code: 'AT', name: 'Austria', currency: 'EUR', dialCode: '+43', defaultLang: 'de', usdRate: 0.92 },
  { code: 'GR', name: 'Greece', currency: 'EUR', dialCode: '+30', defaultLang: 'en', usdRate: 0.92 },
  { code: 'NZ', name: 'New Zealand', currency: 'NZD', dialCode: '+64', defaultLang: 'en', usdRate: 1.67 },
  { code: 'IL', name: 'Israel', currency: 'ILS', dialCode: '+972', defaultLang: 'en', usdRate: 3.74 },
  { code: 'RU', name: 'Russia', currency: 'RUB', dialCode: '+7', defaultLang: 'ru', usdRate: 98 },
  { code: 'UA', name: 'Ukraine', currency: 'UAH', dialCode: '+380', defaultLang: 'ru', usdRate: 41.3 },
  { code: 'RO', name: 'Romania', currency: 'RON', dialCode: '+40', defaultLang: 'en', usdRate: 4.58 },
  { code: 'CZ', name: 'Czechia', currency: 'CZK', dialCode: '+420', defaultLang: 'en', usdRate: 23.8 },
  { code: 'HU', name: 'Hungary', currency: 'HUF', dialCode: '+36', defaultLang: 'en', usdRate: 382 },
  { code: 'JO', name: 'Jordan', currency: 'JOD', dialCode: '+962', defaultLang: 'ar', usdRate: 0.71 },
  { code: 'LB', name: 'Lebanon', currency: 'USD', dialCode: '+961', defaultLang: 'ar', usdRate: 1 },
  { code: 'UG', name: 'Uganda', currency: 'UGX', dialCode: '+256', defaultLang: 'sw', usdRate: 3680 },
  { code: 'ET', name: 'Ethiopia', currency: 'ETB', dialCode: '+251', defaultLang: 'en', usdRate: 120 },
];

export const ALL_CURRENCIES = Array.from(
  new Set([
    ...WORLD_REGIONS.map((r) => r.currency),
    'USD',
    'EUR',
    'INR',
    'GBP',
    'AED',
    'SAR',
    'CAD',
    'AUD',
    'SGD',
    'JPY',
    'KRW',
    'CNY',
    'BRL',
    'MXN',
    'ZAR',
    'NGN',
    'KES',
    'IDR',
    'PHP',
    'MYR',
    'THB',
    'VND',
    'BDT',
    'PKR',
    'LKR',
    'TRY',
    'EGP',
    'CHF',
    'SEK',
    'NOK',
    'DKK',
    'PLN',
    'NZD',
  ])
).sort();

export function getRegionByCode(code: string): CountryRegion {
  return (
    WORLD_REGIONS.find((r) => r.code.toUpperCase() === code.toUpperCase()) ||
    WORLD_REGIONS[1] // US fallback
  );
}

export function detectInitialRegion(): CountryRegion {
  if (typeof navigator === 'undefined') return WORLD_REGIONS[1];
  const locale = navigator.language || 'en-US';
  const parts = locale.split('-');
  if (parts.length > 1) {
    const match = WORLD_REGIONS.find((r) => r.code === parts[1].toUpperCase());
    if (match) return match;
  }
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
  if (tz.includes('Kolkata') || tz.includes('Calcutta')) return getRegionByCode('IN');
  if (tz.includes('Dubai')) return getRegionByCode('AE');
  if (tz.includes('London')) return getRegionByCode('GB');
  if (tz.includes('Tokyo')) return getRegionByCode('JP');
  if (tz.includes('Singapore')) return getRegionByCode('SG');
  if (tz.includes('Sydney')) return getRegionByCode('AU');
  return WORLD_REGIONS[1];
}

export function formatMoney(
  amount: number,
  currencyCode: string,
  locale = 'en'
): string {
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode || 'USD',
      maximumFractionDigits: safeAmount % 1 === 0 ? 0 : 2,
    }).format(safeAmount);
  } catch {
    return `${currencyCode} ${Math.round(safeAmount)}`;
  }
}

export function convertUsdToRegionAmount(usdAmount: number, region: CountryRegion): number {
  const raw = usdAmount * region.usdRate;
  if (region.usdRate >= 1000) return Math.round(raw / 1000) * 1000;
  if (region.usdRate >= 50) return Math.round(raw / 50) * 50;
  return Math.max(1, Math.round(raw));
}
