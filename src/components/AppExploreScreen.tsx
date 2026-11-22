import React, { useState } from 'react';
import {
  BadgeCheck,
  ChevronDown,
  Flag,
  PhoneCall,
  Search,
  SlidersHorizontal,
  Star,
} from 'lucide-react';
import { motion } from 'motion/react';
import {
  CATEGORY_EXAMPLE_IMAGES,
  CATEGORY_MAP,
  CATEGORY_OPTIONS,
  CATEGORY_SHORT_MAP,
  formatTimestamp,
  PAYMENT_METHOD_MAP,
  URGENCY_LABELS,
} from '../constants';
import { CountryRegion, formatMoney } from '../i18n/regions';
import {
  ApplianceCategory,
  JobUrgency,
  RepairJob,
  Review,
  TechnicianProfile,
} from '../types';
import { CategoryIcon } from './CategoryIcon';

interface AppExploreScreenProps {
  region: CountryRegion;
  currencyCode: string;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: 'all' | ApplianceCategory;
  onSelectCategory: (c: 'all' | ApplianceCategory) => void;
  availableOnly: boolean;
  onToggleAvailableOnly: () => void;
  urgencyFilter: 'all' | JobUrgency;
  onSelectUrgency: (u: 'all' | JobUrgency) => void;
  filteredTechnicians: TechnicianProfile[];
  filteredOpenJobs: RepairJob[];
  topFiveStarReviewByTechId: Map<string, Review>;
  currentUid: string | null;
  onOpenTechDetail: (tech: TechnicianProfile) => void;
  onBookTechnician: (tech: TechnicianProfile) => void;
  onReportTech: (tech: TechnicianProfile) => void;
  onOpenJobDetail: (job: RepairJob) => void;
  onOpenBooking: () => void;
}

export const AppExploreScreen: React.FC<AppExploreScreenProps> = ({
  region,
  currencyCode,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  availableOnly,
  onToggleAvailableOnly,
  urgencyFilter,
  onSelectUrgency,
  filteredTechnicians,
  filteredOpenJobs,
  topFiveStarReviewByTechId,
  currentUid,
  onOpenTechDetail,
  onBookTechnician,
  onReportTech,
  onOpenJobDetail,
  onOpenBooking,
}) => {
  const [segment, setSegment] = useState<'providers' | 'requests'>('providers');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [brokenUrls, setBrokenUrls] = useState<Set<string>>(() => new Set());

  const markBroken = (url: string) => {
    setBrokenUrls((prev) => {
      if (prev.has(url)) return prev;
      const next = new Set(prev);
      next.add(url);
      return next;
    });
  };

  const activeFilterCount =
    (selectedCategory !== 'all' ? 1 : 0) +
    (segment === 'providers' && availableOnly ? 1 : 0) +
    (segment === 'requests' && urgencyFilter !== 'all' ? 1 : 0);

  return (
    <div className="space-y-8 sm:space-y-9">
      {/* Segment Switcher */}
      <div className="flex items-center gap-2 p-2 rounded-2xl yn-glass-card">
        <button
          type="button"
          onClick={() => setSegment('providers')}
          className={`flex-1 min-h-[46px] px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
            segment === 'providers'
              ? 'yn-btn-saffron font-bold'
              : 'text-[#43564D] dark:text-[#9CB0A6] hover:text-[#18231E] dark:hover:text-[#FFFDF8]'
          }`}
        >
          Service Providers ({filteredTechnicians.length})
        </button>
        <button
          type="button"
          onClick={() => setSegment('requests')}
          className={`flex-1 min-h-[46px] px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
            segment === 'requests'
              ? 'yn-btn-emerald font-bold'
              : 'text-[#43564D] dark:text-[#9CB0A6] hover:text-[#18231E] dark:hover:text-[#FFFDF8]'
          }`}
        >
          Open Requests ({filteredOpenJobs.length})
        </button>
      </div>

      {/* Search + Collapsible Filters Bar */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#43564D] dark:text-[#9CB0A6] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search pros, neighborhoods, or issues..."
              aria-label="Search providers or requests"
              className="w-full min-h-[50px] pl-11 pr-4 py-2.5 rounded-2xl bg-[#FFFDF8] dark:bg-[#071B16]/90 border border-[#075E36]/20 dark:border-white/[0.12] text-sm text-[#18231E] dark:text-[#FFFDF8] placeholder:text-[#5B6F65] dark:placeholder:text-[#7E948A] focus:outline-none focus:ring-2 focus:ring-[#FF9933] focus:border-[#FF9933]"
            />
          </div>

          <button
            type="button"
            onClick={() => setFiltersOpen((v) => !v)}
            aria-expanded={filtersOpen}
            className={`min-h-[50px] px-4 sm:px-5 rounded-2xl border text-xs sm:text-sm font-semibold inline-flex items-center gap-2.5 shrink-0 transition-colors ${
              filtersOpen || activeFilterCount > 0
                ? 'bg-[#FF9933]/15 border-[#FF9933]/55 text-[#E87516] dark:text-[#FFB866]'
                : 'yn-glass-card text-[#18231E] dark:text-[#FFFDF8]'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${
                filtersOpen ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>

        {/* Expandable Filter Panel */}
        {filtersOpen ? (
          <div className="rounded-2xl yn-glass-card p-5 sm:p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs sm:text-sm font-semibold text-[#43564D] dark:text-[#9CB0A6]">
                {segment === 'providers' ? 'Availability' : 'Urgency'}
              </span>

              {segment === 'providers' ? (
                <button
                  type="button"
                  onClick={onToggleAvailableOnly}
                  className={`min-h-[42px] px-4 rounded-xl text-xs font-semibold transition-all ${
                    availableOnly
                      ? 'yn-btn-emerald'
                      : 'bg-[#E8EDF2] dark:bg-[#07130F] border border-[#075E36]/15 dark:border-white/[0.1] text-[#18231E] dark:text-[#FFFDF8]'
                  }`}
                >
                  {availableOnly ? 'Available Now ✓' : 'Available Only'}
                </button>
              ) : (
                <div className="flex flex-wrap items-center gap-2">
                  {(
                    [
                      { id: 'all', label: 'All' },
                      { id: 'urgent_today', label: 'Urgent' },
                      { id: 'within_24h', label: 'Within 24h' },
                      { id: 'flexible', label: 'Flexible' },
                    ] as const
                  ).map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => onSelectUrgency(opt.id)}
                      className={`min-h-[40px] px-3.5 rounded-xl text-xs font-semibold transition-all ${
                        urgencyFilter === opt.id
                          ? 'yn-btn-saffron'
                          : 'bg-[#E8EDF2] dark:bg-[#07130F] border border-[#075E36]/15 dark:border-white/[0.08] text-[#43564D] dark:text-[#9CB0A6] hover:text-[#18231E] dark:hover:text-[#FFFDF8]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-[#075E36]/12 dark:border-white/[0.08] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-semibold text-[#43564D] dark:text-[#9CB0A6]">
                  Service Category
                </span>
                {selectedCategory !== 'all' ? (
                  <button
                    type="button"
                    onClick={() => onSelectCategory('all')}
                    className="min-h-[36px] px-2.5 text-xs font-semibold text-[#E87516] dark:text-[#FF9933] hover:underline"
                  >
                    Reset
                  </button>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={() => onSelectCategory('all')}
                  className={`min-h-[42px] px-4 rounded-xl text-xs font-semibold transition-all ${
                    selectedCategory === 'all'
                      ? 'yn-btn-saffron'
                      : 'bg-[#E8EDF2] dark:bg-[#07130F] border border-[#075E36]/15 dark:border-white/[0.08] text-[#18231E] dark:text-[#FFFDF8]'
                  }`}
                >
                  All Services
                </button>
                {CATEGORY_OPTIONS.map((cat) => {
                  const active = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => onSelectCategory(cat.id)}
                      className={`min-h-[42px] px-3.5 rounded-xl text-xs font-medium flex items-center gap-2 transition-all ${
                        active
                          ? 'yn-btn-saffron font-semibold'
                          : 'bg-[#E8EDF2] dark:bg-[#07130F] border border-[#075E36]/15 dark:border-white/[0.08] text-[#18231E] dark:text-[#FFFDF8]'
                      }`}
                    >
                      <CategoryIcon category={cat.id} className="w-4 h-4 shrink-0" />
                      <span>{cat.shortLabel}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* Single spacious category strip when filter drawer is closed */
          <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar pb-1.5">
            <button
              type="button"
              onClick={() => onSelectCategory('all')}
              className={`min-h-[42px] px-4 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-all ${
                selectedCategory === 'all'
                  ? 'yn-btn-saffron'
                  : 'yn-glass-card text-[#18231E] dark:text-[#FFFDF8] hover:border-[#FF9933]/45'
              }`}
            >
              All
            </button>
            {CATEGORY_OPTIONS.map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => onSelectCategory(cat.id)}
                  className={`min-h-[42px] px-3.5 rounded-xl text-xs font-medium whitespace-nowrap shrink-0 flex items-center gap-2 transition-all ${
                    active
                      ? 'yn-btn-saffron font-semibold'
                      : 'yn-glass-card text-[#18231E] dark:text-[#FFFDF8] hover:border-[#FF9933]/45'
                  }`}
                >
                  <CategoryIcon category={cat.id} className="w-4 h-4 shrink-0" />
                  <span>{cat.shortLabel}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Results Grid (Spacious 2-column desktop, 1-column mobile) */}
      {segment === 'providers' ? (
        filteredTechnicians.length === 0 ? (
          <div className="rounded-2xl yn-glass-card p-10 text-center space-y-4">
            <p className="text-base sm:text-lg font-semibold text-[#18231E] dark:text-[#FFFDF8]">
              No providers match this filter
            </p>
            <p className="text-sm text-[#43564D] dark:text-[#9CB0A6] max-w-md mx-auto leading-relaxed">
              Post an open repair request in {region.name} and available specialists will respond directly.
            </p>
            <button
              type="button"
              onClick={onOpenBooking}
              className="min-h-[46px] px-6 py-2.5 rounded-xl yn-btn-saffron text-xs sm:text-sm font-bold"
            >
              Post Service Request
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            {filteredTechnicians.map((tech) => {
              const isVerified = tech.verificationStatus === 'verified';
              const topReview = topFiveStarReviewByTechId.get(tech.uid);
              const paymentsText = (tech.acceptedPayments || ['cash'])
                .map((pm) => PAYMENT_METHOD_MAP[pm] || pm)
                .join(' · ');

              return (
                <motion.article
                  key={tech.uid}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.99 }}
                  className="rounded-2xl yn-glass-card yn-tricolor-border hover:border-[#FF9933]/50 transition-all p-6 flex flex-col justify-between gap-5"
                >
                  <button
                    type="button"
                    onClick={() => onOpenTechDetail(tech)}
                    className="text-left space-y-4 w-full"
                  >
                    <div className="flex items-start gap-4">
                      {tech.avatarUrl && !brokenUrls.has(tech.avatarUrl) ? (
                        <img
                          src={tech.avatarUrl}
                          alt={tech.displayName}
                          referrerPolicy="no-referrer"
                          onError={() => markBroken(tech.avatarUrl!)}
                          className="w-15 h-15 rounded-2xl object-cover border border-[#FF9933]/35 shrink-0"
                        />
                      ) : (
                        <div className="w-15 h-15 rounded-2xl bg-[#071B16] border border-[#FF9933]/30 flex items-center justify-center text-base font-bold text-[#FFB866] shrink-0">
                          {tech.displayName.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0 flex-1 space-y-1.5">
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-[#18231E] dark:text-[#FFFDF8] truncate">
                            {tech.displayName}
                          </h3>
                          {isVerified ? (
                            <BadgeCheck className="w-4 h-4 text-[#138808] dark:text-[#35C46A] shrink-0" />
                          ) : null}
                        </div>
                        <p className="text-xs text-[#43564D] dark:text-[#9CB0A6] truncate">
                          {tech.neighborhood}
                          {tech.yearsExperience ? ` · ${tech.yearsExperience} yrs exp` : ''}
                        </p>
                        <p className="text-xs font-medium tabular-nums">
                          <span className={tech.isAvailable ? 'text-[#138808] dark:text-[#35C46A]' : 'text-[#5B6F65] dark:text-[#7E948A]'}>
                            {tech.isAvailable ? 'Available today' : 'Busy'}
                          </span>
                          <span className="text-[#5B6F65] dark:text-[#7E948A] mx-1.5">·</span>
                          <span className="text-[#E87516] dark:text-[#FFB866]">
                            {tech.ratingAvg > 0 ? `${tech.ratingAvg} ★` : 'New pro'}
                          </span>
                          <span className="text-[#5B6F65] dark:text-[#7E948A] mx-1.5">·</span>
                          <span className="text-[#43564D] dark:text-[#9CB0A6]">{tech.completedJobsCount} jobs</span>
                        </p>
                      </div>
                    </div>

                    <div className="text-xs flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="text-[#E87516] dark:text-[#FFB866] font-medium">
                        {tech.specialties.slice(0, 3).join(' · ')}
                      </span>
                      {tech.phoneVerified ? (
                        <span className="inline-flex items-center gap-1 text-[#43564D] dark:text-[#9CB0A6]">
                          <PhoneCall className="w-3 h-3 text-[#138808] dark:text-[#35C46A]" />
                          Verified phone
                        </span>
                      ) : null}
                    </div>

                    <p className="text-xs text-[#18231E]/80 dark:text-[#E8EDF2]/80 line-clamp-2 leading-relaxed">
                      {tech.bio}
                    </p>

                    <p className="text-[11px] text-[#43564D] dark:text-[#9CB0A6] truncate">
                      Accepts: {paymentsText}
                    </p>

                    {topReview ? (
                      <div className="pt-3 border-t border-[#075E36]/12 dark:border-white/[0.08] space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-[#E87516] dark:text-[#FFD28A] inline-flex items-center gap-1">
                            <Star className="w-3 h-3 fill-[#FF9933] text-[#FF9933]" />
                            <span>Top Review</span>
                          </span>
                          <span className="font-semibold text-[#E87516] dark:text-[#FFD28A] tabular-nums">
                            5.0 ★
                          </span>
                        </div>
                        <p className="text-xs italic text-[#18231E]/90 dark:text-[#FFFDF8]/90 line-clamp-2">
                          &ldquo;{topReview.comment}&rdquo;
                        </p>
                        <p className="text-[11px] text-[#43564D] dark:text-[#9CB0A6] truncate">
                          {topReview.customerName} · {formatTimestamp(topReview.createdAt)}
                        </p>
                      </div>
                    ) : null}
                  </button>

                  <div className="pt-4 border-t border-[#075E36]/12 dark:border-white/[0.08] flex items-center justify-between gap-4">
                    <div className="text-xs space-y-0.5">
                      <span className="block text-sm font-bold text-[#18231E] dark:text-[#FFFDF8] tabular-nums">
                        {formatMoney(tech.visitFee, tech.currencyCode || currencyCode)} visit
                      </span>
                      <span className="text-[#43564D] dark:text-[#9CB0A6] tabular-nums">
                        ~{tech.responseTimeMins}m arrival
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        aria-label={`Report ${tech.displayName}`}
                        onClick={() => onReportTech(tech)}
                        className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-[#E8EDF2] dark:bg-[#07130F] border border-[#075E36]/15 dark:border-white/[0.08] text-[#43564D] dark:text-[#9CB0A6] hover:text-rose-400 transition-colors"
                      >
                        <Flag className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onOpenTechDetail(tech)}
                        className="min-h-[44px] px-4 rounded-xl bg-[#E8EDF2] dark:bg-[#07130F] border border-[#075E36]/15 dark:border-white/[0.08] text-xs font-semibold text-[#18231E] dark:text-[#FFFDF8] hover:border-[#35C46A]/45 transition-colors"
                      >
                        Details
                      </button>
                      <button
                        type="button"
                        onClick={() => onBookTechnician(tech)}
                        className="min-h-[44px] px-4.5 rounded-xl yn-btn-saffron text-xs font-bold"
                      >
                        Book
                      </button>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )
      ) : filteredOpenJobs.length === 0 ? (
        <div className="rounded-2xl yn-glass-card p-10 text-center space-y-3">
          <p className="text-base sm:text-lg font-semibold text-[#18231E] dark:text-[#FFFDF8]">
            No open repair requests match
          </p>
          <p className="text-sm text-[#43564D] dark:text-[#9CB0A6]">
            Try clearing your category or urgency filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {filteredOpenJobs.map((job) => {
            const isMine = Boolean(currentUid && job.customerId === currentUid);
            const previewImg =
              job.mediaUrl && job.mediaType === 'image'
                ? job.mediaUrl
                : CATEGORY_EXAMPLE_IMAGES[job.applianceCategory];
            return (
              <motion.article
                key={job.id}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.99 }}
                className="rounded-2xl yn-glass-card yn-tricolor-border hover:border-[#35C46A]/50 overflow-hidden flex flex-col justify-between transition-all"
              >
                <div>
                  <div className="aspect-[16/9] w-full bg-[#071B16] overflow-hidden flex items-center justify-center relative">
                    {!brokenUrls.has(previewImg) ? (
                      <img
                        src={previewImg}
                        alt={CATEGORY_MAP[job.applianceCategory]}
                        referrerPolicy="no-referrer"
                        onError={() => markBroken(previewImg)}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <CategoryIcon category={job.applianceCategory} className="w-10 h-10 text-[#FF9933]" />
                    )}
                    <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[#07130F]/75 to-transparent pointer-events-none" />
                  </div>
                  <div className="p-6 space-y-3">
                    <div className="flex items-center justify-between text-xs gap-3">
                      <span className="font-semibold text-[#E87516] dark:text-[#FFB866] truncate">
                        {CATEGORY_SHORT_MAP[job.applianceCategory]} · {job.neighborhood}
                      </span>
                      <span className="font-semibold text-[#138808] dark:text-[#35C46A] shrink-0">
                        {URGENCY_LABELS[job.urgency]}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-[#18231E] dark:text-[#FFFDF8] leading-snug">
                      {job.issueTitle}
                    </h3>
                    <p className="text-xs text-[#43564D] dark:text-[#9CB0A6] line-clamp-2 leading-relaxed">
                      {job.issueDescription}
                    </p>
                  </div>
                </div>
                <div className="px-6 py-4 border-t border-[#075E36]/12 dark:border-white/[0.08] flex items-center justify-between gap-4">
                  <div className="text-xs space-y-0.5">
                    <span className="block text-sm font-bold text-[#18231E] dark:text-[#FFFDF8] tabular-nums">
                      {formatMoney(job.estimatedBudget, job.currencyCode || currencyCode)} budget
                    </span>
                    <span className="text-[#43564D] dark:text-[#9CB0A6] truncate block max-w-[170px]">
                      {job.preferredSlot}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onOpenJobDetail(job)}
                    className="min-h-[44px] px-4.5 rounded-xl yn-btn-emerald text-xs font-bold shrink-0"
                  >
                    {isMine ? 'Manage' : 'View & Claim'}
                  </button>
                </div>
              </motion.article>
            );
          })}
        </div>
      )}
    </div>
  );
};
