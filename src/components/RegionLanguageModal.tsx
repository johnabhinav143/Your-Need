import React, { useMemo, useState } from 'react';
import { Globe, Search, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { ALL_CURRENCIES, CountryRegion, WORLD_REGIONS } from '../i18n/regions';
import { WORLD_LANGUAGES } from '../i18n/translations';

interface RegionLanguageModalProps {
  open: boolean;
  selectedCountry: CountryRegion;
  selectedCurrency: string;
  selectedLanguage: string;
  onClose: () => void;
  onApply: (country: CountryRegion, currency: string, language: string) => void;
}

export const RegionLanguageModal: React.FC<RegionLanguageModalProps> = ({
  open,
  selectedCountry,
  selectedCurrency,
  selectedLanguage,
  onClose,
  onApply,
}) => {
  const [countrySearch, setCountrySearch] = useState('');
  const [draftCountry, setDraftCountry] = useState<CountryRegion>(selectedCountry);
  const [draftCurrency, setDraftCurrency] = useState<string>(selectedCurrency);
  const [draftLanguage, setDraftLanguage] = useState<string>(selectedLanguage);

  const filteredCountries = useMemo(() => {
    const q = countrySearch.trim().toLowerCase();
    if (!q) return WORLD_REGIONS;
    return WORLD_REGIONS.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.currency.toLowerCase().includes(q) ||
        c.dialCode.includes(q)
    );
  }, [countrySearch]);

  const handleSelectCountry = (region: CountryRegion) => {
    setDraftCountry(region);
    setDraftCurrency(region.currency);
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#171717]/55 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="region-modal-title"
        >
          <motion.div
            initial={{ y: 32, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 32, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="w-full sm:max-w-xl bg-white dark:bg-[#171717] rounded-t-3xl sm:rounded-2xl border border-[#E8DFC8] dark:border-[#2E2E2E] shadow-xl max-h-[90vh] flex flex-col"
          >
            <div className="px-6 pt-3 pb-4 border-b border-[#EFE8D5] dark:border-[#2E2E2E] shrink-0">
              <div className="w-10 h-1.5 bg-slate-300 dark:bg-[#262626] rounded-full mx-auto mb-3 sm:hidden" />
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <Globe className="w-5 h-5 text-[#8F6412] dark:text-[#D6A84F]" />
                  <div>
                    <h2 id="region-modal-title" className="text-lg font-semibold text-[#171717] dark:text-white">
                      Country, Currency &amp; Language
                    </h2>
                    <p className="text-xs text-[#595959] dark:text-[#B5ADA0]">
                      Works in any country with local currency and phone codes
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close region settings"
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-[#595959] dark:text-[#B5ADA0] hover:text-[#171717] dark:hover:text-white hover:bg-[#FFFDF7] dark:hover:bg-[#121212] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto px-6 py-5 space-y-6">
              {/* Language Selector */}
              <div>
                <label className="block text-sm font-semibold text-[#171717] dark:text-[#FFFDF7] mb-2">
                  Language
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {WORLD_LANGUAGES.map((lang) => {
                    const active = draftLanguage === lang.code;
                    return (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => setDraftLanguage(lang.code)}
                        className={`min-h-[44px] px-3 py-2 rounded-xl border text-left transition-colors ${
                          active
                            ? 'bg-[#FFFDF7] dark:bg-[#D6A84F]/20 border-[#D6A84F] text-[#171717] dark:text-[#D6A84F] font-semibold'
                            : 'bg-white dark:bg-[#121212]/90 border-[#E8DFC8] dark:border-[#2E2E2E] text-[#292929] dark:text-[#E8E2D5] hover:border-slate-300 dark:hover:border-slate-600'
                        }`}
                      >
                        <span className="block text-xs truncate">{lang.nativeName}</span>
                        <span className="block text-[11px] text-[#595959] dark:text-[#B5ADA0] truncate">{lang.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Currency Override */}
              <div>
                <label htmlFor="currency-select" className="block text-sm font-semibold text-[#171717] dark:text-[#FFFDF7] mb-1.5">
                  Currency
                </label>
                <select
                  id="currency-select"
                  value={draftCurrency}
                  onChange={(e) => setDraftCurrency(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#D8CEB4] dark:border-[#292929] bg-white dark:bg-[#121212] text-sm text-[#171717] dark:text-[#FFFDF7] tabular-nums"
                >
                  {ALL_CURRENCIES.map((cur) => (
                    <option key={cur} value={cur}>
                      {cur}
                    </option>
                  ))}
                </select>
              </div>

              {/* Country Search & List */}
              <div>
                <label htmlFor="country-search" className="block text-sm font-semibold text-[#171717] dark:text-[#FFFDF7] mb-2">
                  Country &amp; Calling Code
                </label>
                <div className="relative mb-3">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="country-search"
                    type="search"
                    value={countrySearch}
                    onChange={(e) => setCountrySearch(e.target.value)}
                    placeholder="Search country, currency (INR, USD, EUR, AED), or +code..."
                    className="w-full min-h-[44px] pl-10 pr-4 py-2 rounded-xl border border-[#D8CEB4] dark:border-[#292929] bg-white dark:bg-[#121212] text-sm text-[#171717] dark:text-[#FFFDF7] placeholder:text-slate-400"
                  />
                </div>
                <div className="max-h-52 overflow-y-auto divide-y divide-[#EFE8D5] dark:divide-[#2E2E2E] border border-[#E8DFC8] dark:border-[#2E2E2E] rounded-xl">
                  {filteredCountries.map((region) => {
                    const active = draftCountry.code === region.code;
                    return (
                      <button
                        key={region.code}
                        type="button"
                        onClick={() => handleSelectCountry(region)}
                        className={`w-full min-h-[44px] px-4 py-2.5 text-left flex items-center justify-between gap-3 transition-colors ${
                          active
                            ? 'bg-[#FFFDF7] dark:bg-[#D6A84F]/20 text-[#171717] dark:text-[#D6A84F] font-semibold'
                            : 'hover:bg-[#FFFDF7] dark:hover:bg-[#121212] text-[#292929] dark:text-[#ECE7DC]'
                        }`}
                      >
                        <span className="text-sm truncate">
                          {region.name} ({region.code})
                        </span>
                        <span className="text-xs text-[#595959] dark:text-[#B5ADA0] tabular-nums shrink-0">
                          {region.dialCode} · {region.currency}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-[#EFE8D5] dark:border-[#2E2E2E] flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="min-h-[44px] px-4 py-2 rounded-xl border border-[#D8CEB4] dark:border-[#292929] text-sm font-medium text-[#292929] dark:text-[#E8E2D5] hover:bg-[#FFFDF7] dark:hover:bg-[#121212] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onApply(draftCountry, draftCurrency, draftLanguage);
                  onClose();
                }}
                className="flex-1 min-h-[44px] px-5 py-2 rounded-xl bg-[#171717] dark:bg-[#D6A84F] text-white dark:text-[#171717] text-sm font-semibold hover:bg-[#262626] dark:hover:brightness-110 transition-colors"
              >
                Apply {draftCountry.name} · {draftCurrency}
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};
