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
import { CinematicParticles } from './CinematicParticles';
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
    <div className="relative space-y-10 sm:space-y-12">
      {/* Full-Screen Cinematic Golden Particle Background Layer */}
      <CinematicParticles
        fullScreen
        density="balanced"
        tone="auto"
        showStreaks
        showGlows
        interactive
      />

      {/* Compact Welcome + Search + Shader Hero Zone */}
      <section aria-label="Welcome and search" className="relative z-10 space-y-5">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0 space-y-1">
            <p className="text-xs sm:text-sm text-[#43564D] dark:text-[#9CB0A6] truncate">
              {isSignedIn && firstName ? `Welcome back, ${firstName}` : 'YourNeed Concierge'}
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold font-display tracking-tight truncate yn-tricolor-text">
              Home Services, Elevated
            </h2>
          </div>

          <button
            type="button"
            onClick={onOpenRegionModal}
            className="min-h-[44px] px-4 py-2.5 rounded-xl yn-glass-card text-xs font-medium text-[#18231E] dark:text-[#FFFDF8] hover:border-[#FF9933]/55 transition-colors flex items-center gap-2.5 shrink-0"
          >
            <MapPin className="w-4 h-4 text-[#E87516] dark:text-[#FF9933] shrink-0" />
            <span className="truncate max-w-[120px]">{region.name}</span>
            <span className="text-[#43564D] dark:text-[#9CB0A6] tabular-nums">{currencyCode}</span>
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmitSearch();
          }}
          className="relative flex items-center"
        >
          <Search className="w-4 h-4 text-[#43564D] dark:text-[#9CB0A6] absolute left-4 pointer-events-none" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search AC, plumbing, electrical, or verified pros..."
            aria-label="Search services"
            className="w-full min-h-[54px] pl-12 pr-28 py-3 rounded-2xl bg-[#FFFDF8] dark:bg-[#071B16]/90 border border-[#075E36]/20 dark:border-white/[0.12] text-sm text-[#18231E] dark:text-[#FFFDF8] placeholder:text-[#5B6F65] dark:placeholder:text-[#7E948A] focus:outline-none focus:ring-2 focus:ring-[#FF9933] focus:border-[#FF9933] shadow-sm"
          />
          <button
            type="submit"
            className="absolute right-2.5 min-h-[40px] px-5 rounded-xl yn-btn-saffron text-xs font-bold"
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
          particleLayer={
            <CinematicParticles
              fullScreen={false}
              density="subtle"
              tone="dark"
              showStreaks
              showGlows
              interactive
              className="z-[5]"
            />
          }
        />
      </section>

      {/* Quick Actions (Clean uniform 2x2 / 4-up surface grid) */}
      <section aria-label="Quick actions" className="relative z-10 space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold font-display text-[#18231E] dark:text-[#FFFDF8]">
              Quick Actions
            </h3>
            <p className="text-xs text-[#43564D] dark:text-[#9CB0A6] mt-0.5">
              Start a booking, triage a fault, or switch to provider tools
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <motion.button
            type="button"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onOpenBooking(null)}
            className="min-h-[108px] p-5 rounded-2xl yn-btn-saffron text-left flex flex-col justify-between gap-4"
          >
            <div className="w-11 h-11 rounded-xl bg-[#07130F]/15 flex items-center justify-center">
              <Plus className="w-5 h-5 text-[#07130F]" />
            </div>
            <span className="text-sm font-bold">Book Service</span>
          </motion.button>

          <motion.button
            type="button"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={onOpenAiAssistant}
            className="min-h-[108px] p-5 rounded-2xl yn-glass-card text-left flex flex-col justify-between gap-4 hover:border-[#FF9933]/50 transition-all"
          >
            <div className="w-11 h-11 rounded-xl bg-[#FF9933]/14 dark:bg-[#FF9933]/18 border border-[#FF9933]/25 flex items-center justify-center">
              <Bot className="w-5 h-5 text-[#E87516] dark:text-[#FFB866]" />
            </div>
            <span className="text-sm font-semibold text-[#18231E] dark:text-[#FFFDF8]">
              AI Diagnose
            </span>
          </motion.button>

          <motion.button
            type="button"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={onOpenUrgentExplore}
            className="min-h-[108px] p-5 rounded-2xl yn-glass-card text-left flex flex-col justify-between gap-4 hover:border-[#FF9933]/50 transition-all"
          >
            <div className="w-11 h-11 rounded-xl bg-[#FF9933]/14 dark:bg-[#FF9933]/18 border border-[#FF9933]/25 flex items-center justify-center">
              <Zap className="w-5 h-5 text-[#E87516] dark:text-[#FFB866]" />
            </div>
            <span className="text-sm font-semibold text-[#18231E] dark:text-[#FFFDF8]">
              Same-Day Dispatch
            </span>
          </motion.button>

          <motion.button
            type="button"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={onOpenTechSetup}
            className="min-h-[108px] p-5 rounded-2xl yn-glass-card text-left flex flex-col justify-between gap-4 hover:border-[#35C46A]/50 transition-all"
          >
            <div className="w-11 h-11 rounded-xl bg-[#138808]/14 dark:bg-[#35C46A]/18 border border-[#138808]/25 dark:border-[#35C46A]/25 flex items-center justify-center">
              <Wrench className="w-5 h-5 text-[#138808] dark:text-[#35C46A]" />
            </div>
            <span className="text-sm font-semibold text-[#18231E] dark:text-[#FFFDF8]">
              Provider Mode
            </span>
          </motion.button>
        </div>
      </section>

      {/* Popular Categories (Organized with Show All toggle) */}
      <section aria-label="Popular categories" className="relative z-10 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold font-display text-[#18231E] dark:text-[#FFFDF8]">
              Categories
            </h3>
            <p className="text-xs text-[#43564D] dark:text-[#9CB0A6] mt-0.5">
              Select a trade to browse matching technicians
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setShowAllCategories((v) => !v)}
              className="min-h-[38px] px-2.5 text-xs font-medium text-[#43564D] dark:text-[#9CB0A6] hover:text-[#FF9933] inline-flex items-center gap-1.5 transition-colors"
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
              className="min-h-[38px] px-2.5 text-xs font-semibold text-[#E87516] dark:text-[#FF9933] inline-flex items-center gap-1 hover:underline"
            >
              <span>Explore</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {visibleCategories.map((cat) => (
            <motion.button
              key={cat.id}
              type="button"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                onSelectCategory(cat.id);
                onOpenExplore();
              }}
              className="min-h-[104px] p-4 rounded-2xl yn-glass-card hover:border-[#FF9933]/50 transition-all flex flex-col items-center justify-center gap-3"
            >
              <div className="w-11 h-11 rounded-xl bg-[#E8EDF2] dark:bg-[#07130F] border border-[#075E36]/15 dark:border-[#FF9933]/25 flex items-center justify-center text-[#E87516] dark:text-[#FFB866]">
                <CategoryIcon category={cat.id} className="w-5 h-5" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-[#18231E] dark:text-[#FFFDF8] truncate max-w-full">
                {cat.shortLabel}
              </span>
            </motion.button>
          ))}
        </div>
      </section>

      {/* Nearby Service Providers (Spacious 2-col desktop / single-col mobile cards) */}
      <section aria-label="Nearby service providers" className="relative z-10 space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold font-display text-[#18231E] dark:text-[#FFFDF8]">
              Nearby Service Providers
            </h3>
            <p className="text-xs text-[#43564D] dark:text-[#9CB0A6] mt-0.5">
              Verified specialists available in {region.name}
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenExplore}
            className="min-h-[38px] px-2.5 text-xs font-semibold text-[#138808] dark:text-[#35C46A] inline-flex items-center gap-1 hover:underline shrink-0"
          >
            <span>See all</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {technicians.slice(0, 2).map((tech) => {
            const topReview = topFiveStarReviewByTechId.get(tech.uid);
            const isVerified = tech.verificationStatus === 'verified';
            return (
              <div
                key={tech.uid}
                className="rounded-2xl yn-glass-card yn-tricolor-border hover:border-[#FF9933]/50 transition-all p-6 flex flex-col justify-between gap-5"
              >
                <button
                  type="button"
                  onClick={() => onOpenTechDetail(tech)}
                  className="text-left space-y-4 w-full"
                >
                  <div className="flex items-center gap-4">
                    {tech.avatarUrl && !brokenUrls.has(tech.avatarUrl) ? (
                      <img
                        src={tech.avatarUrl}
                        alt={tech.displayName}
                        referrerPolicy="no-referrer"
                        onError={() => markBroken(tech.avatarUrl!)}
                        className="w-14 h-14 rounded-xl object-cover border border-[#FF9933]/35 shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-[#071B16] border border-[#FF9933]/30 flex items-center justify-center text-base font-bold text-[#FFB866] shrink-0">
                        {tech.displayName.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <p className="text-base font-semibold text-[#18231E] dark:text-[#FFFDF8] truncate">
                          {tech.displayName}
                        </p>
                        {isVerified ? (
                          <BadgeCheck className="w-4 h-4 text-[#138808] dark:text-[#35C46A] shrink-0" />
                        ) : null}
                      </div>
                      <p className="text-xs text-[#43564D] dark:text-[#9CB0A6] truncate tabular-nums">
                        {tech.neighborhood} · {tech.ratingAvg > 0 ? `${tech.ratingAvg} ★` : 'New'} · {tech.completedJobsCount} jobs
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-[#E87516] dark:text-[#FFB866] font-medium truncate">
                    {tech.specialties.slice(0, 3).join(' · ')}
                  </p>

                  {topReview ? (
                    <div className="pt-3.5 border-t border-[#075E36]/12 dark:border-white/[0.08] space-y-1.5">
                      <p className="text-[11px] font-semibold text-[#E87516] dark:text-[#FFD28A] inline-flex items-center gap-1.5">
                        <Star className="w-3 h-3 fill-[#FF9933] text-[#FF9933]" />
                        <span>Top Review · 5.0</span>
                      </p>
                      <p className="text-xs text-[#18231E]/85 dark:text-[#E8EDF2]/85 italic line-clamp-1 leading-relaxed">
                        &ldquo;{topReview.comment}&rdquo;
                      </p>
                    </div>
                  ) : null}
                </button>

                <div className="pt-4 border-t border-[#075E36]/12 dark:border-white/[0.08] flex items-center justify-between gap-4">
                  <div className="text-xs space-y-0.5">
                    <span className="block font-bold text-[#18231E] dark:text-[#FFFDF8] tabular-nums">
                      {formatMoney(tech.visitFee, tech.currencyCode || currencyCode)}
                    </span>
                    <span className="text-[#43564D] dark:text-[#9CB0A6]">visit · ~{tech.responseTimeMins}m</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => onOpenTechDetail(tech)}
                      className="min-h-[44px] px-4 rounded-xl bg-[#E8EDF2] dark:bg-[#07130F] border border-[#075E36]/15 dark:border-white/[0.1] text-xs font-semibold text-[#18231E] dark:text-[#FFFDF8] hover:border-[#35C46A]/45 transition-colors"
                    >
                      Details
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenBooking(tech)}
                      className="min-h-[44px] px-5 rounded-xl yn-btn-saffron text-xs font-bold"
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
      <section aria-label="Recommended services" className="relative z-10 space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold font-display text-[#18231E] dark:text-[#FFFDF8]">
              Recommended Services
            </h3>
            <p className="text-xs text-[#43564D] dark:text-[#9CB0A6] mt-0.5">
              Popular fixes in {region.name} ({currencyCode})
            </p>
          </div>
          {examples.length > 2 ? (
            <button
              type="button"
              onClick={() => setShowMoreServices((v) => !v)}
              className="min-h-[38px] px-2.5 text-xs font-semibold text-[#E87516] dark:text-[#FF9933] inline-flex items-center gap-1.5 hover:underline shrink-0"
            >
              <span>{showMoreServices ? 'Show fewer' : `View all (${examples.length})`}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : null}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
          {visibleExamples.map((ex) => {
            const localEstimate = convertUsdToRegionAmount(ex.baseUsdCost, region);
            return (
              <motion.button
                key={ex.id}
                type="button"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.985 }}
                onClick={() => onOpenExampleDetail(ex)}
                className="text-left rounded-2xl yn-glass-card hover:border-[#FF9933]/50 overflow-hidden transition-all flex flex-col group"
              >
                <div className="aspect-[16/9] w-full bg-[#071B16] overflow-hidden flex items-center justify-center relative">
                  {!brokenUrls.has(ex.imageUrl) ? (
                    <img
                      src={ex.imageUrl}
                      alt={ex.title}
                      referrerPolicy="no-referrer"
                      onError={() => markBroken(ex.imageUrl)}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                    />
                  ) : (
                    <CategoryIcon category={ex.category} className="w-8 h-8 text-[#FF9933]" />
                  )}
                  <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[#07130F]/75 to-transparent pointer-events-none" />
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between gap-4 w-full">
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-[#E87516] dark:text-[#FFB866] truncate">
                      {CATEGORY_SHORT_MAP[ex.category]} · {ex.area}
                    </p>
                    <p className="text-base font-semibold text-[#18231E] dark:text-[#FFFDF8] leading-snug">
                      {ex.title}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-4 border-t border-[#075E36]/12 dark:border-white/[0.08] w-full">
                    <span className="font-bold text-[#138808] dark:text-[#35C46A] tabular-nums">
                      ~{formatMoney(localEstimate, currencyCode)}
                    </span>
                    <span className="text-[#43564D] dark:text-[#9CB0A6]">{ex.etaLabel}</span>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* Recent Bookings */}
      <section aria-label="Recent bookings" className="relative z-10 space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold font-display text-[#18231E] dark:text-[#FFFDF8]">
              Recent Bookings
            </h3>
            <p className="text-xs text-[#43564D] dark:text-[#9CB0A6] mt-0.5">
              Quick access to your latest service requests
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenBookingsTab}
            className="min-h-[38px] px-2.5 text-xs font-semibold text-[#E87516] dark:text-[#FF9933] inline-flex items-center gap-1 hover:underline shrink-0"
          >
            <span>My Bookings</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentJobs.length === 0 ? (
          <div className="rounded-2xl yn-glass-card p-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-11 h-11 rounded-xl bg-[#E8EDF2] dark:bg-[#07130F] border border-[#075E36]/15 dark:border-[#FF9933]/25 flex items-center justify-center text-[#E87516] dark:text-[#FFB866] shrink-0">
                <CalendarClock className="w-5 h-5" />
              </div>
              <div className="min-w-0 space-y-1">
                <p className="text-sm font-semibold text-[#18231E] dark:text-[#FFFDF8] truncate">
                  No active bookings yet
                </p>
                <p className="text-xs text-[#43564D] dark:text-[#9CB0A6] truncate">
                  Book a service to track live technician arrival
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onOpenBooking(null)}
              className="min-h-[44px] px-5 rounded-xl yn-btn-saffron text-xs font-bold shrink-0"
            >
              Book
            </button>
          </div>
        ) : (
          <div className="rounded-2xl yn-glass-card divide-y divide-[#075E36]/10 dark:divide-white/[0.08]">
            {recentJobs.slice(0, 3).map((job) => (
              <button
                key={job.id}
                type="button"
                onClick={() => onOpenJobDetail(job)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-[#E8EDF2]/65 dark:hover:bg-white/[0.04] transition-colors first:rounded-t-2xl last:rounded-b-2xl"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-[#E8EDF2] dark:bg-[#07130F] border border-[#075E36]/15 dark:border-[#35C46A]/25 flex items-center justify-center text-[#E87516] dark:text-[#FFB866] shrink-0">
                    <CategoryIcon category={job.applianceCategory} className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 space-y-1">
                    <p className="text-sm font-semibold text-[#18231E] dark:text-[#FFFDF8] truncate">
                      {job.issueTitle}
                    </p>
                    <p className="text-xs text-[#43564D] dark:text-[#9CB0A6] truncate">
                      <span className="text-[#138808] dark:text-[#35C46A] font-semibold">
                        {STATUS_LABELS[job.status]}
                      </span>
                      {' · '}
                      {CATEGORY_MAP[job.applianceCategory]}
                      {job.technicianEta ? ` · ETA ${job.technicianEta}` : ''}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0 flex items-center gap-2.5">
                  <span className="text-xs font-bold text-[#18231E] dark:text-[#FFFDF8] tabular-nums">
                    {formatMoney(job.quotedFee || job.estimatedBudget, job.currencyCode || currencyCode)}
                  </span>
                  <Clock className="w-4 h-4 text-[#43564D] dark:text-[#9CB0A6]" />
                </div>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
