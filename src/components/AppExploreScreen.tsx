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
    <div className="space-y-6">
      {/* Segment Switcher */}
      <div className="flex items-center gap-1 p-1.5 rounded-2xl bg-white dark:bg-[#141414] border border-black/[0.08] dark:border-white/[0.08]">
        <button
          type="button"
          onClick={() => setSegment('providers')}
          className={`flex-1 min-h-[42px] px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
            segment === 'providers'
              ? 'bg-[#D6AE53] text-[#080808] font-bold'
              : 'text-[#595959] dark:text-[#A0A0A0] hover:text-[#171717] dark:hover:text-white'
          }`}
        >
          Service Providers ({filteredTechnicians.length})
        </button>
        <button
          type="button"
          onClick={() => setSegment('requests')}
          className={`flex-1 min-h-[42px] px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
            segment === 'requests'
              ? 'bg-[#D6AE53] text-[#080808] font-bold'
              : 'text-[#595959] dark:text-[#A0A0A0] hover:text-[#171717] dark:hover:text-white'
          }`}
        >
          Open Requests ({filteredOpenJobs.length})
        </button>
      </div>

      {/* Search + Collapsible Filters Bar */}
      <div className="space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#A0A0A0] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search pros, neighborhoods, or issues..."
              aria-label="Search providers or requests"
              className="w-full min-h-[46px] pl-11 pr-4 py-2 rounded-2xl bg-white dark:bg-[#141414] border border-black/[0.08] dark:border-white/[0.08] text-sm text-[#171717] dark:text-white placeholder:text-[#A0A0A0] focus:outline-none focus:ring-2 focus:ring-[#D6AE53]"
            />
          </div>

          <button
            type="button"
            onClick={() => setFiltersOpen((v) => !v)}
            aria-expanded={filtersOpen}
            className={`min-h-[46px] px-4 rounded-2xl border text-xs font-semibold inline-flex items-center gap-2 shrink-0 transition-colors ${
              filtersOpen || activeFilterCount > 0
                ? 'bg-[#D6AE53]/15 border-[#D6AE53]/50 text-[#9E7628] dark:text-[#D6AE53]'
                : 'bg-white dark:bg-[#141414] border-black/[0.08] dark:border-white/[0.08] text-[#171717] dark:text-white'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}</span>
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform ${
                filtersOpen ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>

        {/* Expandable Filter Panel */}
        {filtersOpen ? (
          <div className="rounded-2xl bg-white dark:bg-[#141414] border border-black/[0.08] dark:border-white/[0.08] p-4 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs font-semibold text-[#595959] dark:text-[#A0A0A0]">
                {segment === 'providers' ? 'Availability' : 'Urgency'}
              </span>

              {segment === 'providers' ? (
                <button
                  type="button"
                  onClick={onToggleAvailableOnly}
                  className={`min-h-[38px] px-3.5 rounded-xl text-xs font-semibold transition-colors ${
                    availableOnly
                      ? 'bg-[#D6AE53] text-[#080808]'
                      : 'bg-[#F3EEE2] dark:bg-[#1C1C1C] text-[#171717] dark:text-white'
                  }`}
                >
                  {availableOnly ? 'Available Now ✓' : 'Available Only'}
                </button>
              ) : (
                <div className="flex flex-wrap items-center gap-1.5">
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
                      className={`min-h-[36px] px-3 rounded-xl text-xs font-semibold transition-colors ${
                        urgencyFilter === opt.id
                          ? 'bg-[#D6AE53] text-[#080808]'
                          : 'bg-[#F3EEE2] dark:bg-[#1C1C1C] text-[#595959] dark:text-[#A0A0A0] hover:text-white'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-black/[0.06] dark:border-white/[0.06] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#595959] dark:text-[#A0A0A0]">
                  Service Category
                </span>
                {selectedCategory !== 'all' ? (
                  <button
                    type="button"
                    onClick={() => onSelectCategory('all')}
                    className="text-xs font-medium text-[#D6AE53] hover:underline"
                  >
                    Reset
                  </button>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onSelectCategory('all')}
                  className={`min-h-[38px] px-3.5 rounded-xl text-xs font-semibold transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-[#D6AE53] text-[#080808]'
                      : 'bg-[#F3EEE2] dark:bg-[#1C1C1C] text-[#171717] dark:text-white'
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
                      className={`min-h-[38px] px-3 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors ${
                        active
                          ? 'bg-[#D6AE53] text-[#080808] font-semibold'
                          : 'bg-[#F3EEE2] dark:bg-[#1C1C1C] text-[#171717] dark:text-white'
                      }`}
                    >
                      <CategoryIcon category={cat.id} className="w-3.5 h-3.5 shrink-0" />
                      <span>{cat.shortLabel}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* Single compact category strip when filter drawer is closed */
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            <button
              type="button"
              onClick={() => onSelectCategory('all')}
              className={`min-h-[38px] px-3.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-[#D6AE53] text-[#080808]'
                  : 'bg-white dark:bg-[#141414] border border-black/[0.08] dark:border-white/[0.08] text-[#171717] dark:text-white'
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
                  className={`min-h-[38px] px-3 rounded-xl text-xs font-medium whitespace-nowrap shrink-0 flex items-center gap-1.5 transition-colors ${
                    active
                      ? 'bg-[#D6AE53] text-[#080808] font-semibold'
                      : 'bg-white dark:bg-[#141414] border border-black/[0.08] dark:border-white/[0.08] text-[#171717] dark:text-white'
                  }`}
                >
                  <CategoryIcon category={cat.id} className="w-3.5 h-3.5 shrink-0" />
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
          <div className="rounded-2xl bg-white dark:bg-[#141414] border border-black/[0.08] dark:border-white/[0.08] p-8 text-center space-y-4">
            <p className="text-base font-semibold text-[#171717] dark:text-white">
              No providers match this filter
            </p>
            <p className="text-xs text-[#595959] dark:text-[#A0A0A0] max-w-sm mx-auto">
              Post an open repair request in {region.name} and available specialists will respond directly.
            </p>
            <button
              type="button"
              onClick={onOpenBooking}
              className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#D6AE53] text-[#080808] text-xs font-bold"
            >
              Post Service Request
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTechnicians.map((tech) => {
              const isVerified = tech.verificationStatus === 'verified';
              const topReview = topFiveStarReviewByTechId.get(tech.uid);
              const paymentsText = (tech.acceptedPayments || ['cash'])
                .map((pm) => PAYMENT_METHOD_MAP[pm] || pm)
                .join(' · ');

              return (
                <motion.article
                  key={tech.uid}
                  whileTap={{ scale: 0.99 }}
                  className="rounded-2xl bg-white dark:bg-[#141414] border border-black/[0.08] dark:border-white/[0.08] hover:border-[#D6AE53]/45 transition-colors p-5 flex flex-col justify-between gap-4"
                >
                  <button
                    type="button"
                    onClick={() => onOpenTechDetail(tech)}
                    className="text-left space-y-3.5 w-full"
                  >
                    <div className="flex items-start gap-3.5">
                      {tech.avatarUrl && !brokenUrls.has(tech.avatarUrl) ? (
                        <img
                          src={tech.avatarUrl}
                          alt={tech.displayName}
                          referrerPolicy="no-referrer"
                          onError={() => markBroken(tech.avatarUrl!)}
                          className="w-14 h-14 rounded-xl object-cover border border-white/[0.1] shrink-0"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-[#1C1C1C] border border-white/[0.1] flex items-center justify-center text-base font-bold text-[#D6AE53] shrink-0">
                          {tech.displayName.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-base font-semibold text-[#171717] dark:text-white truncate">
                            {tech.displayName}
                          </h3>
                          {isVerified ? (
                            <BadgeCheck className="w-4 h-4 text-[#D6AE53] shrink-0" />
                          ) : null}
                        </div>
                        <p className="text-xs text-[#595959] dark:text-[#A0A0A0] truncate">
                          {tech.neighborhood}
                          {tech.yearsExperience ? ` · ${tech.yearsExperience} yrs exp` : ''}
                        </p>
                        <p className="text-xs font-medium tabular-nums">
                          <span className={tech.isAvailable ? 'text-emerald-600 dark:text-emerald-400' : 'text-[#A0A0A0]'}>
                            {tech.isAvailable ? 'Available today' : 'Busy'}
                          </span>
                          <span className="text-[#A0A0A0] mx-1.5">·</span>
                          <span className="text-[#D6AE53]">
                            {tech.ratingAvg > 0 ? `${tech.ratingAvg} ★` : 'New pro'}
                          </span>
                          <span className="text-[#A0A0A0] mx-1.5">·</span>
                          <span className="text-[#A0A0A0]">{tech.completedJobsCount} jobs</span>
                        </p>
                      </div>
                    </div>

                    <div className="text-xs flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="text-[#D6AE53] font-medium">
                        {tech.specialties.slice(0, 3).join(' · ')}
                      </span>
                      {tech.phoneVerified ? (
                        <span className="inline-flex items-center gap-1 text-[#A0A0A0]">
                          <PhoneCall className="w-3 h-3 text-[#D6AE53]" />
                          Verified phone
                        </span>
                      ) : null}
                    </div>

                    <p className="text-xs text-[#292929] dark:text-[#A0A0A0] line-clamp-2 leading-relaxed">
                      {tech.bio}
                    </p>

                    <p className="text-[11px] text-[#A0A0A0] truncate">
                      Accepts: {paymentsText}
                    </p>

                    {topReview ? (
                      <div className="pt-3 border-t border-black/[0.06] dark:border-white/[0.06] space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-[#D6AE53] inline-flex items-center gap-1">
                            <Star className="w-3 h-3 fill-[#D6AE53] text-[#D6AE53]" />
                            <span>Top Review</span>
                          </span>
                          <span className="font-semibold text-[#D6AE53] tabular-nums">
                            5.0 ★
                          </span>
                        </div>
                        <p className="text-xs italic text-[#292929] dark:text-white/90 line-clamp-2">
                          &ldquo;{topReview.comment}&rdquo;
                        </p>
                        <p className="text-[11px] text-[#A0A0A0] truncate">
                          {topReview.customerName} · {formatTimestamp(topReview.createdAt)}
                        </p>
                      </div>
                    ) : null}
                  </button>

                  <div className="pt-3 border-t border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between gap-3">
                    <div className="text-xs">
                      <span className="block font-bold text-[#171717] dark:text-white tabular-nums">
                        {formatMoney(tech.visitFee, tech.currencyCode || currencyCode)} visit
                      </span>
                      <span className="text-[#A0A0A0] tabular-nums">
                        ~{tech.responseTimeMins}m arrival
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        aria-label={`Report ${tech.displayName}`}
                        onClick={() => onReportTech(tech)}
                        className="min-h-[42px] min-w-[42px] flex items-center justify-center rounded-xl bg-[#F3EEE2] dark:bg-[#1C1C1C] text-[#A0A0A0] hover:text-rose-400 transition-colors"
                      >
                        <Flag className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onOpenTechDetail(tech)}
                        className="min-h-[42px] px-3.5 rounded-xl bg-[#F3EEE2] dark:bg-[#1C1C1C] text-xs font-semibold text-[#171717] dark:text-white hover:text-[#D6AE53] transition-colors"
                      >
                        Details
                      </button>
                      <button
                        type="button"
                        onClick={() => onBookTechnician(tech)}
                        className="min-h-[42px] px-4 rounded-xl bg-[#D6AE53] text-[#080808] text-xs font-bold hover:brightness-105 transition-all"
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
        <div className="rounded-2xl bg-white dark:bg-[#141414] border border-black/[0.08] dark:border-white/[0.08] p-8 text-center space-y-2">
          <p className="text-base font-semibold text-[#171717] dark:text-white">
            No open repair requests match
          </p>
          <p className="text-xs text-[#595959] dark:text-[#A0A0A0]">
            Try clearing your category or urgency filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredOpenJobs.map((job) => {
            const isMine = Boolean(currentUid && job.customerId === currentUid);
            const previewImg =
              job.mediaUrl && job.mediaType === 'image'
                ? job.mediaUrl
                : CATEGORY_EXAMPLE_IMAGES[job.applianceCategory];
            return (
              <motion.article
                key={job.id}
                whileTap={{ scale: 0.99 }}
                className="rounded-2xl bg-white dark:bg-[#141414] border border-black/[0.08] dark:border-white/[0.08] hover:border-[#D6AE53]/45 overflow-hidden flex flex-col justify-between transition-colors"
              >
                <div>
                  <div className="aspect-[16/9] w-full bg-[#1C1C1C] overflow-hidden flex items-center justify-center">
                    {!brokenUrls.has(previewImg) ? (
                      <img
                        src={previewImg}
                        alt={CATEGORY_MAP[job.applianceCategory]}
                        referrerPolicy="no-referrer"
                        onError={() => markBroken(previewImg)}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <CategoryIcon category={job.applianceCategory} className="w-10 h-10 text-[#D6AE53]" />
                    )}
                  </div>
                  <div className="p-5 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-[#D6AE53] truncate">
                        {CATEGORY_SHORT_MAP[job.applianceCategory]} · {job.neighborhood}
                      </span>
                      <span className="font-semibold text-[#171717] dark:text-white shrink-0">
                        {URGENCY_LABELS[job.urgency]}
                      </span>
                    </div>
                    <h3 className="text-base font-semibold text-[#171717] dark:text-white leading-snug">
                      {job.issueTitle}
                    </h3>
                    <p className="text-xs text-[#595959] dark:text-[#A0A0A0] line-clamp-2 leading-relaxed">
                      {job.issueDescription}
                    </p>
                  </div>
                </div>
                <div className="px-5 py-4 border-t border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between gap-3">
                  <div className="text-xs">
                    <span className="block font-bold text-[#171717] dark:text-white tabular-nums">
                      {formatMoney(job.estimatedBudget, job.currencyCode || currencyCode)} budget
                    </span>
                    <span className="text-[#A0A0A0] truncate block max-w-[170px]">
                      {job.preferredSlot}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onOpenJobDetail(job)}
                    className="min-h-[42px] px-4 rounded-xl bg-[#1C1C1C] border border-[#D6AE53]/45 text-[#D6AE53] text-xs font-bold hover:bg-[#D6AE53] hover:text-[#080808] transition-colors shrink-0"
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
