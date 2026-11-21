import React, { useState } from 'react';
import {
  ArrowRight,
  BadgeCheck,
  Bot,
  CalendarClock,
  ChevronDown,
  ChevronRight,
  Clock,
  MapPin,
  Plus,
  Search,
  Star,
  Wrench,
  Zap,
} from 'lucide-react';
import { motion } from 'motion/react';
import {
  CATEGORY_MAP,
  CATEGORY_OPTIONS,
  CATEGORY_SHORT_MAP,
  RegionalRepairExample,
  STATUS_LABELS,
} from '../constants';
import { convertUsdToRegionAmount, CountryRegion, formatMoney } from '../i18n/regions';
import {
  ApplianceCategory,
  RepairJob,
  Review,
  TechnicianProfile,
} from '../types';
import { CategoryIcon } from './CategoryIcon';
import { ZenGoldShaderHero } from './ZenGoldShaderHero';

interface AppHomeScreenProps {
  displayName: string;
  isSignedIn: boolean;
  region: CountryRegion;
  currencyCode: string;
  readyTechCount: number;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSubmitSearch: () => void;
  onSelectCategory: (cat: 'all' | ApplianceCategory) => void;
  onOpenExplore: () => void;
  onOpenBooking: (tech?: TechnicianProfile | null) => void;
  onOpenTechSetup: () => void;
  onOpenAiAssistant: () => void;
  onOpenUrgentExplore: () => void;
  onOpenRegionModal: () => void;
  onOpenTechDetail: (tech: TechnicianProfile) => void;
  onOpenExampleDetail: (example: RegionalRepairExample) => void;
  onOpenBookingsTab: () => void;
  onOpenJobDetail: (job: RepairJob) => void;
  technicians: TechnicianProfile[];
  topFiveStarReviewByTechId: Map<string, Review>;
  examples: RegionalRepairExample[];
  recentJobs: RepairJob[];
}

export const AppHomeScreen: React.FC<AppHomeScreenProps> = ({
  displayName,
  isSignedIn,
  region,
  currencyCode,
  readyTechCount,
  searchQuery,
  onSearchChange,
  onSubmitSearch,
  onSelectCategory,
  onOpenExplore,
  onOpenBooking,
  onOpenTechSetup,
  onOpenAiAssistant,
  onOpenUrgentExplore,
  onOpenRegionModal,
  onOpenTechDetail,
  onOpenExampleDetail,
  onOpenBookingsTab,
  onOpenJobDetail,
  technicians,
  topFiveStarReviewByTechId,
  examples,
  recentJobs,
}) => {
  const [brokenUrls, setBrokenUrls] = useState<Set<string>>(() => new Set());
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [showMoreServices, setShowMoreServices] = useState(false);

  const firstName = displayName ? displayName.split(' ')[0] : '';
  const markBroken = (url: string) => {
    setBrokenUrls((prev) => {
      if (prev.has(url)) return prev;
      const next = new Set(prev);
      next.add(url);
      return next;
    });
  };

  const visibleCategories = showAllCategories
    ? CATEGORY_OPTIONS
    : CATEGORY_OPTIONS.slice(0, 6);
  const visibleExamples = showMoreServices ? examples : examples.slice(0, 2);

  return (
    <div className="space-y-8">
      {/* Compact Welcome + Search + Shader Hero Zone */}
      <section aria-label="Welcome and search" className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs text-[#595959] dark:text-[#A0A0A0] truncate">
              {isSignedIn && firstName ? `Welcome back, ${firstName}` : 'YourNeed Concierge'}
            </p>
            <h2 className="text-xl sm:text-2xl font-bold text-[#171717] dark:text-white font-display tracking-tight truncate">
              Home Services, Elevated
            </h2>
          </div>

          <button
            type="button"
            onClick={onOpenRegionModal}
            className="min-h-[40px] px-3 py-2 rounded-xl bg-white dark:bg-[#141414] border border-black/[0.08] dark:border-white/[0.08] text-xs font-medium text-[#171717] dark:text-white hover:border-[#D6AE53]/50 transition-colors flex items-center gap-2 shrink-0"
          >
            <MapPin className="w-3.5 h-3.5 text-[#D6AE53] shrink-0" />
            <span className="truncate max-w-[110px]">{region.name}</span>
            <span className="text-[#A0A0A0] tabular-nums">{currencyCode}</span>
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmitSearch();
          }}
          className="relative flex items-center"
        >
          <Search className="w-4 h-4 text-[#A0A0A0] absolute left-4 pointer-events-none" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search AC, plumbing, electrical, or verified pros..."
            aria-label="Search services"
            className="w-full min-h-[48px] pl-11 pr-24 py-2.5 rounded-2xl bg-white dark:bg-[#141414] border border-black/[0.08] dark:border-white/[0.08] text-sm text-[#171717] dark:text-white placeholder:text-[#A0A0A0] focus:outline-none focus:ring-2 focus:ring-[#D6AE53]"
          />
          <button
            type="submit"
            className="absolute right-2 min-h-[36px] px-4 rounded-xl bg-[#D6AE53] text-[#080808] text-xs font-bold hover:brightness-105 transition-all"
          >
            Search
          </button>
        </form>

        <ZenGoldShaderHero
          variant="compact"
          regionName={region.name}
          currencyCode={currencyCode}
          readyTechCount={readyTechCount}
          onExploreServices={onOpenExplore}
          onBecomeProvider={onOpenTechSetup}
        />
      </section>

      {/* Quick Actions (Clean uniform 2x2 / 4-up surface grid) */}
      <section aria-label="Quick actions" className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-base font-semibold text-[#171717] dark:text-white">
            Quick Actions
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <motion.button
            type="button"
            whileTap={{ scale: 0.98 }}
            onClick={() => onOpenBooking(null)}
            className="min-h-[84px] p-4 rounded-2xl bg-[#D6AE53] text-[#080808] text-left flex flex-col justify-between transition-opacity hover:opacity-95"
          >
            <div className="w-9 h-9 rounded-xl bg-[#080808]/12 flex items-center justify-center">
              <Plus className="w-4 h-4 text-[#080808]" />
            </div>
            <span className="text-xs font-bold mt-3">Book Service</span>
          </motion.button>

          <motion.button
            type="button"
            whileTap={{ scale: 0.98 }}
            onClick={onOpenAiAssistant}
            className="min-h-[84px] p-4 rounded-2xl bg-white dark:bg-[#141414] border border-black/[0.08] dark:border-white/[0.08] text-left flex flex-col justify-between hover:border-[#D6AE53]/50 transition-colors"
          >
            <div className="w-9 h-9 rounded-xl bg-[#F3EEE2] dark:bg-[#1C1C1C] flex items-center justify-center">
              <Bot className="w-4 h-4 text-[#D6AE53]" />
            </div>
            <span className="text-xs font-semibold text-[#171717] dark:text-white mt-3">
              AI Diagnose
            </span>
          </motion.button>

          <motion.button
            type="button"
            whileTap={{ scale: 0.98 }}
            onClick={onOpenUrgentExplore}
            className="min-h-[84px] p-4 rounded-2xl bg-white dark:bg-[#141414] border border-black/[0.08] dark:border-white/[0.08] text-left flex flex-col justify-between hover:border-[#D6AE53]/50 transition-colors"
          >
            <div className="w-9 h-9 rounded-xl bg-[#F3EEE2] dark:bg-[#1C1C1C] flex items-center justify-center">
              <Zap className="w-4 h-4 text-[#D6AE53]" />
            </div>
            <span className="text-xs font-semibold text-[#171717] dark:text-white mt-3">
              Same-Day Dispatch
            </span>
          </motion.button>

          <motion.button
            type="button"
            whileTap={{ scale: 0.98 }}
            onClick={onOpenTechSetup}
            className="min-h-[84px] p-4 rounded-2xl bg-white dark:bg-[#141414] border border-black/[0.08] dark:border-white/[0.08] text-left flex flex-col justify-between hover:border-[#D6AE53]/50 transition-colors"
          >
            <div className="w-9 h-9 rounded-xl bg-[#F3EEE2] dark:bg-[#1C1C1C] flex items-center justify-center">
              <Wrench className="w-4 h-4 text-[#D6AE53]" />
            </div>
            <span className="text-xs font-semibold text-[#171717] dark:text-white mt-3">
              Provider Mode
            </span>
          </motion.button>
        </div>
      </section>

      {/* Popular Categories (Organized with Show All toggle) */}
      <section aria-label="Popular categories" className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-base font-semibold text-[#171717] dark:text-white">
            Categories
          </h3>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowAllCategories((v) => !v)}
              className="text-xs font-medium text-[#A0A0A0] hover:text-[#D6AE53] inline-flex items-center gap-1 transition-colors"
            >
              <span>{showAllCategories ? 'Show fewer' : 'All categories'}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${
                  showAllCategories ? 'rotate-180' : ''
                }`}
              />
            </button>
            <button
              type="button"
              onClick={() => {
                onSelectCategory('all');
                onOpenExplore();
              }}
              className="text-xs font-semibold text-[#D6AE53] inline-flex items-center gap-0.5 hover:underline"
            >
              <span>Explore</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {visibleCategories.map((cat) => (
            <motion.button
              key={cat.id}
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                onSelectCategory(cat.id);
                onOpenExplore();
              }}
              className="min-h-[84px] p-3.5 rounded-2xl bg-white dark:bg-[#141414] border border-black/[0.08] dark:border-white/[0.08] hover:border-[#D6AE53]/50 transition-colors flex flex-col items-center justify-center gap-2.5"
            >
              <div className="w-9 h-9 rounded-xl bg-[#F3EEE2] dark:bg-[#1C1C1C] flex items-center justify-center text-[#D6AE53]">
                <CategoryIcon category={cat.id} className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium text-[#171717] dark:text-white truncate max-w-full">
                {cat.shortLabel}
              </span>
            </motion.button>
          ))}
        </div>
      </section>

      {/* Nearby Service Providers (Spacious 2-col desktop / single-col mobile cards) */}
      <section aria-label="Nearby service providers" className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-semibold text-[#171717] dark:text-white">
              Nearby Service Providers
            </h3>
            <p className="text-xs text-[#595959] dark:text-[#A0A0A0] mt-0.5">
              Verified specialists available in {region.name}
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenExplore}
            className="text-xs font-semibold text-[#D6AE53] inline-flex items-center gap-0.5 hover:underline shrink-0"
          >
            <span>See all</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {technicians.slice(0, 2).map((tech) => {
            const topReview = topFiveStarReviewByTechId.get(tech.uid);
            const isVerified = tech.verificationStatus === 'verified';
            return (
              <div
                key={tech.uid}
                className="rounded-2xl bg-white dark:bg-[#141414] border border-black/[0.08] dark:border-white/[0.08] hover:border-[#D6AE53]/45 transition-colors p-5 flex flex-col justify-between gap-4"
              >
                <button
                  type="button"
                  onClick={() => onOpenTechDetail(tech)}
                  className="text-left space-y-3 w-full"
                >
                  <div className="flex items-center gap-3.5">
                    {tech.avatarUrl && !brokenUrls.has(tech.avatarUrl) ? (
                      <img
                        src={tech.avatarUrl}
                        alt={tech.displayName}
                        referrerPolicy="no-referrer"
                        onError={() => markBroken(tech.avatarUrl!)}
                        className="w-12 h-12 rounded-xl object-cover border border-white/[0.1] shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-[#1C1C1C] border border-white/[0.1] flex items-center justify-center text-sm font-bold text-[#D6AE53] shrink-0">
                        {tech.displayName.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-semibold text-[#171717] dark:text-white truncate">
                          {tech.displayName}
                        </p>
                        {isVerified ? (
                          <BadgeCheck className="w-4 h-4 text-[#D6AE53] shrink-0" />
                        ) : null}
                      </div>
                      <p className="text-xs text-[#595959] dark:text-[#A0A0A0] truncate tabular-nums">
                        {tech.neighborhood} · {tech.ratingAvg > 0 ? `${tech.ratingAvg} ★` : 'New'} · {tech.completedJobsCount} jobs
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-[#D6AE53] font-medium truncate">
                    {tech.specialties.slice(0, 3).join(' · ')}
                  </p>

                  {topReview ? (
                    <div className="pt-2.5 border-t border-black/[0.06] dark:border-white/[0.06] space-y-1">
                      <p className="text-[11px] font-semibold text-[#D6AE53] inline-flex items-center gap-1">
                        <Star className="w-3 h-3 fill-[#D6AE53] text-[#D6AE53]" />
                        <span>Top Review · 5.0</span>
                      </p>
                      <p className="text-xs text-[#292929] dark:text-[#A0A0A0] italic line-clamp-1">
                        &ldquo;{topReview.comment}&rdquo;
                      </p>
                    </div>
                  ) : null}
                </button>

                <div className="pt-3 border-t border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between gap-3">
                  <div className="text-xs">
                    <span className="font-bold text-[#171717] dark:text-white tabular-nums">
                      {formatMoney(tech.visitFee, tech.currencyCode || currencyCode)}
                    </span>{' '}
                    <span className="text-[#A0A0A0]">visit · ~{tech.responseTimeMins}m</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onOpenTechDetail(tech)}
                      className="min-h-[40px] px-3.5 rounded-xl bg-[#F3EEE2] dark:bg-[#1C1C1C] text-xs font-semibold text-[#171717] dark:text-white hover:text-[#D6AE53] transition-colors"
                    >
                      Details
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenBooking(tech)}
                      className="min-h-[40px] px-4 rounded-xl bg-[#D6AE53] text-[#080808] text-xs font-bold hover:brightness-105 transition-all"
                    >
                      Book
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Recommended Services (2-up spacious grid + expandable remainder) */}
      <section aria-label="Recommended services" className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-semibold text-[#171717] dark:text-white">
              Recommended Services
            </h3>
            <p className="text-xs text-[#595959] dark:text-[#A0A0A0] mt-0.5">
              Popular fixes in {region.name} ({currencyCode})
            </p>
          </div>
          {examples.length > 2 ? (
            <button
              type="button"
              onClick={() => setShowMoreServices((v) => !v)}
              className="text-xs font-semibold text-[#D6AE53] inline-flex items-center gap-1 hover:underline shrink-0"
            >
              <span>{showMoreServices ? 'Show fewer' : `View all (${examples.length})`}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : null}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {visibleExamples.map((ex) => {
            const localEstimate = convertUsdToRegionAmount(ex.baseUsdCost, region);
            return (
              <motion.button
                key={ex.id}
                type="button"
                whileTap={{ scale: 0.985 }}
                onClick={() => onOpenExampleDetail(ex)}
                className="text-left rounded-2xl bg-white dark:bg-[#141414] border border-black/[0.08] dark:border-white/[0.08] hover:border-[#D6AE53]/45 overflow-hidden transition-colors flex flex-col"
              >
                <div className="aspect-[16/9] w-full bg-[#1C1C1C] overflow-hidden flex items-center justify-center">
                  {!brokenUrls.has(ex.imageUrl) ? (
                    <img
                      src={ex.imageUrl}
                      alt={ex.title}
                      referrerPolicy="no-referrer"
                      onError={() => markBroken(ex.imageUrl)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <CategoryIcon category={ex.category} className="w-8 h-8 text-[#D6AE53]" />
                  )}
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between gap-3 w-full">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-[#D6AE53] truncate">
                      {CATEGORY_SHORT_MAP[ex.category]} · {ex.area}
                    </p>
                    <p className="text-sm font-semibold text-[#171717] dark:text-white leading-snug">
                      {ex.title}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-3 border-t border-black/[0.06] dark:border-white/[0.06] w-full">
                    <span className="font-bold text-[#171717] dark:text-white tabular-nums">
                      ~{formatMoney(localEstimate, currencyCode)}
                    </span>
                    <span className="text-[#A0A0A0]">{ex.etaLabel}</span>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* Recent Bookings */}
      <section aria-label="Recent bookings" className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-base font-semibold text-[#171717] dark:text-white">
            Recent Bookings
          </h3>
          <button
            type="button"
            onClick={onOpenBookingsTab}
            className="text-xs font-semibold text-[#D6AE53] inline-flex items-center gap-0.5 hover:underline"
          >
            <span>My Bookings</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentJobs.length === 0 ? (
          <div className="rounded-2xl bg-white dark:bg-[#141414] border border-black/[0.08] dark:border-white/[0.08] p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-[#F3EEE2] dark:bg-[#1C1C1C] flex items-center justify-center text-[#D6AE53] shrink-0">
                <CalendarClock className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#171717] dark:text-white truncate">
                  No active bookings yet
                </p>
                <p className="text-xs text-[#595959] dark:text-[#A0A0A0] truncate mt-0.5">
                  Book a service to track live technician arrival
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onOpenBooking(null)}
              className="min-h-[40px] px-4 rounded-xl bg-[#D6AE53] text-[#080808] text-xs font-bold shrink-0"
            >
              Book
            </button>
          </div>
        ) : (
          <div className="rounded-2xl bg-white dark:bg-[#141414] border border-black/[0.08] dark:border-white/[0.08] divide-y divide-black/[0.06] dark:divide-white/[0.06]">
            {recentJobs.slice(0, 3).map((job) => (
              <button
                key={job.id}
                type="button"
                onClick={() => onOpenJobDetail(job)}
                className="w-full p-4 text-left flex items-center justify-between gap-4 hover:bg-[#F6F3EC] dark:hover:bg-[#1C1C1C] transition-colors first:rounded-t-2xl last:rounded-b-2xl"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[#F3EEE2] dark:bg-[#1C1C1C] flex items-center justify-center text-[#D6AE53] shrink-0">
                    <CategoryIcon category={job.applianceCategory} className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#171717] dark:text-white truncate">
                      {job.issueTitle}
                    </p>
                    <p className="text-xs text-[#595959] dark:text-[#A0A0A0] truncate mt-0.5">
                      <span className="text-[#D6AE53] font-semibold">
                        {STATUS_LABELS[job.status]}
                      </span>
                      {' · '}
                      {CATEGORY_MAP[job.applianceCategory]}
                      {job.technicianEta ? ` · ETA ${job.technicianEta}` : ''}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0 flex items-center gap-2">
                  <span className="text-xs font-bold text-[#171717] dark:text-white tabular-nums">
                    {formatMoney(job.quotedFee || job.estimatedBudget, job.currencyCode || currencyCode)}
                  </span>
                  <Clock className="w-3.5 h-3.5 text-[#A0A0A0]" />
                </div>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
