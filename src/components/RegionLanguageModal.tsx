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
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#040B08]/75 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-labelledby="region-modal-title"
        >
          <motion.div
            initial={{ y: 32, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 32, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="w-full sm:max-w-xl yn-glass-card yn-tricolor-border rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[90vh] flex flex-col"
          >
            <div className="px-6 sm:px-7 pt-4 pb-4.5 border-b border-[#075E36]/12 dark:border-white/[0.08] shrink-0">
              <div className="w-10 h-1.5 bg-[#075E36]/20 dark:bg-white/[0.15] rounded-full mx-auto mb-3.5 sm:hidden" />
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FF9933]/15 border border-[#FF9933]/35 text-[#E87516] dark:text-[#FFB866] flex items-center justify-center shrink-0">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 id="region-modal-title" className="text-lg font-semibold text-[#18231E] dark:text-[#FFFDF8]">
                      Country, Currency &amp; Language
                    </h2>
                    <p className="text-xs text-[#43564D] dark:text-[#9CB0A6] mt-0.5">
                      Works in any country with local currency and phone codes
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close region settings"
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-[#43564D] dark:text-[#9CB0A6] hover:text-[#18231E] dark:hover:text-[#FFFDF8] hover:bg-[#FF9933]/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto px-6 sm:px-7 py-6 space-y-7">
              {/* Language Selector */}
              <div>
                <label className="block text-sm font-semibold text-[#18231E] dark:text-[#FFFDF8] mb-2.5">
                  Language
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {WORLD_LANGUAGES.map((lang) => {
                    const active = draftLanguage === lang.code;
                    return (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => setDraftLanguage(lang.code)}
                        className={`min-h-[48px] px-3.5 py-2.5 rounded-xl border text-left transition-colors ${
                          active
                            ? 'bg-[#FF9933]/14 border-[#FF9933] text-[#18231E] dark:text-[#FFD28A] font-semibold'
                            : 'bg-[#FFFDF8] dark:bg-[#07130F]/90 border-[#075E36]/15 dark:border-white/[0.10] text-[#43564D] dark:text-[#E8EDF2] hover:border-[#FF9933]/40'
                        }`}
                      >
                        <span className="block text-xs truncate">{lang.nativeName}</span>
                        <span className="block text-[11px] text-[#5B6F65] dark:text-[#7E948A] truncate mt-0.5">{lang.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Currency Override */}
              <div>
                <label htmlFor="currency-select" className="block text-sm font-semibold text-[#18231E] dark:text-[#FFFDF8] mb-2">
                  Currency
                </label>
                <select
                  id="currency-select"
                  value={draftCurrency}
                  onChange={(e) => setDraftCurrency(e.target.value)}
                  className="w-full min-h-[46px] px-4 py-2.5 rounded-xl border border-[#075E36]/20 dark:border-white/[0.12] bg-[#FFFDF8] dark:bg-[#07130F] text-sm text-[#18231E] dark:text-[#FFFDF8] tabular-nums focus:outline-none focus:ring-2 focus:ring-[#FF9933]"
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
                <label htmlFor="country-search" className="block text-sm font-semibold text-[#18231E] dark:text-[#FFFDF8] mb-2.5">
                  Country &amp; Calling Code
                </label>
                <div className="relative mb-3.5">
                  <Search className="w-4 h-4 text-[#5B6F65] dark:text-[#7E948A] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="country-search"
                    type="search"
                    value={countrySearch}
                    onChange={(e) => setCountrySearch(e.target.value)}
                    placeholder="Search country, currency (INR, USD, EUR, AED), or +code..."
                    className="w-full min-h-[46px] pl-11 pr-4 py-2.5 rounded-xl border border-[#075E36]/20 dark:border-white/[0.12] bg-[#FFFDF8] dark:bg-[#07130F] text-sm text-[#18231E] dark:text-[#FFFDF8] placeholder:text-[#5B6F65] dark:placeholder:text-[#7E948A] focus:outline-none focus:ring-2 focus:ring-[#FF9933]"
                  />
                </div>
                <div className="max-h-56 overflow-y-auto divide-y divide-[#075E36]/12 dark:divide-white/[0.08] border border-[#075E36]/15 dark:border-white/[0.10] rounded-2xl bg-[#FFFDF8] dark:bg-[#07130F]/70">
                  {filteredCountries.map((region) => {
                    const active = draftCountry.code === region.code;
                    return (
                      <button
                        key={region.code}
                        type="button"
                        onClick={() => handleSelectCountry(region)}
                        className={`w-full min-h-[48px] px-4 py-3 text-left flex items-center justify-between gap-3 transition-colors ${
                          active
                            ? 'bg-[#138808]/14 dark:bg-[#35C46A]/15 text-[#138808] dark:text-[#7DFF9B] font-semibold'
                            : 'hover:bg-[#FF9933]/[0.06] dark:hover:bg-white/[0.04] text-[#18231E] dark:text-[#E8EDF2]'
                        }`}
                      >
                        <span className="text-sm truncate">
                          {region.name} ({region.code})
                        </span>
                        <span className="text-xs text-[#43564D] dark:text-[#9CB0A6] tabular-nums shrink-0">
                          {region.dialCode} · {region.currency}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="px-6 py-4.5 border-t border-[#075E36]/12 dark:border-white/[0.08] flex items-center gap-3.5 shrink-0 pb-safe">
              <button
                type="button"
                onClick={onClose}
                className="min-h-[46px] px-5 py-2.5 rounded-xl border border-[#075E36]/20 dark:border-white/[0.12] text-sm font-medium text-[#18231E] dark:text-[#FFFDF8] hover:bg-[#E8EDF2] dark:hover:bg-white/[0.06] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onApply(draftCountry, draftCurrency, draftLanguage);
                  onClose();
                }}
                className="flex-1 min-h-[46px] px-5 py-2.5 rounded-xl yn-btn-saffron text-sm font-semibold transition-all"
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
