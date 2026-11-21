import React, { useState } from 'react';
import {
  ArrowLeft,
  BadgeCheck,
  Clock,
  CreditCard,
  Flag,
  Globe,
  MapPin,
  PhoneCall,
  ShieldCheck,
  Star,
} from 'lucide-react';
import {
  CATEGORY_MAP,
  CATEGORY_SHORT_MAP,
  formatTimestamp,
  PAYMENT_METHOD_MAP,
  RegionalRepairExample,
} from '../constants';
import { convertUsdToRegionAmount, CountryRegion, formatMoney } from '../i18n/regions';
import { Review, TechnicianProfile } from '../types';
import { CategoryIcon } from './CategoryIcon';

export type ServiceDetailTarget =
  | { type: 'technician'; technician: TechnicianProfile }
  | { type: 'example'; example: RegionalRepairExample };

interface AppServiceDetailScreenProps {
  target: ServiceDetailTarget | null;
  region: CountryRegion;
  currencyCode: string;
  reviews: Review[];
  onBack: () => void;
  onBookTechnician: (tech: TechnicianProfile) => void;
  onBookExample: (ex: RegionalRepairExample) => void;
  onReportTech: (tech: TechnicianProfile) => void;
}

export const AppServiceDetailScreen: React.FC<AppServiceDetailScreenProps> = ({
  target,
  region,
  currencyCode,
  reviews,
  onBack,
  onBookTechnician,
  onBookExample,
  onReportTech,
}) => {
  const [brokenUrls, setBrokenUrls] = useState<Set<string>>(() => new Set());
  const markBroken = (url: string) => {
    setBrokenUrls((prev) => {
      if (prev.has(url)) return prev;
      const next = new Set(prev);
      next.add(url);
      return next;
    });
  };

  if (!target) {
    return (
      <div className="rounded-2xl bg-white dark:bg-[#141414] border border-black/[0.08] dark:border-white/[0.08] p-8 text-center space-y-4">
        <p className="text-base font-semibold text-[#171717] dark:text-white">
          Select a service or provider to view details
        </p>
        <button
          type="button"
          onClick={onBack}
          className="min-h-[44px] px-5 rounded-xl bg-[#D6AE53] text-[#080808] text-xs font-bold"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (target.type === 'example') {
    const { example } = target;
    const localEstimate = convertUsdToRegionAmount(example.baseUsdCost, region);

    return (
      <div className="space-y-6">
        <button
          type="button"
          onClick={onBack}
          className="min-h-[42px] px-3.5 py-2 rounded-xl bg-white dark:bg-[#141414] border border-black/[0.08] dark:border-white/[0.08] text-xs font-semibold text-[#171717] dark:text-white inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4 text-[#D6AE53]" />
          <span>Back</span>
        </button>

        <div className="rounded-2xl overflow-hidden bg-white dark:bg-[#141414] border border-black/[0.08] dark:border-white/[0.08]">
          <div className="aspect-[16/9] max-h-72 w-full bg-[#1C1C1C] relative flex items-center justify-center">
            {!brokenUrls.has(example.imageUrl) ? (
              <img
                src={example.imageUrl}
                alt={example.title}
                referrerPolicy="no-referrer"
                onError={() => markBroken(example.imageUrl)}
                className="w-full h-full object-cover"
              />
            ) : (
              <CategoryIcon category={example.category} className="w-12 h-12 text-[#D6AE53]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#080808]/90 via-black/30 to-transparent" />
            <div className="absolute bottom-5 left-5 right-5 text-white space-y-1">
              <p className="text-xs font-medium text-[#D6AE53]">
                {CATEGORY_MAP[example.category]} · {example.area}
              </p>
              <h2 className="font-display text-2xl font-bold leading-tight">
                {example.title}
              </h2>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="rounded-xl bg-[#F3EEE2] dark:bg-[#1C1C1C] p-4 space-y-1">
                <p className="text-xs text-[#595959] dark:text-[#A0A0A0]">Estimated Total</p>
                <p className="text-lg font-bold text-[#171717] dark:text-[#D6AE53] tabular-nums">
                  ~{formatMoney(localEstimate, currencyCode)}
                </p>
              </div>
              <div className="rounded-xl bg-[#F3EEE2] dark:bg-[#1C1C1C] p-4 space-y-1">
                <p className="text-xs text-[#595959] dark:text-[#A0A0A0]">Arrival Window</p>
                <p className="text-lg font-bold text-[#171717] dark:text-white">
                  {example.etaLabel}
                </p>
              </div>
              <div className="col-span-2 sm:col-span-1 rounded-xl bg-[#F3EEE2] dark:bg-[#1C1C1C] p-4 space-y-1">
                <p className="text-xs text-[#595959] dark:text-[#A0A0A0]">Coverage</p>
                <p className="text-sm font-semibold text-[#171717] dark:text-white flex items-center gap-1.5 pt-0.5">
                  <ShieldCheck className="w-4 h-4 text-[#D6AE53] shrink-0" />
                  <span>Digital Invoice</span>
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t border-black/[0.06] dark:border-white/[0.06]">
              <h3 className="text-sm font-semibold text-[#171717] dark:text-white flex items-center gap-2">
                <CategoryIcon category={example.category} className="w-4 h-4 text-[#D6AE53]" />
                <span>What&apos;s Included</span>
              </h3>
              <ul className="space-y-2 text-xs sm:text-sm text-[#595959] dark:text-[#A0A0A0] leading-relaxed">
                <li>· On-site diagnostic inspection by an ID-verified specialist</li>
                <li>· Written final price approval before any repair begins</li>
                <li>· Live 5-step arrival and completion tracking</li>
                <li>· 30-day workmanship warranty and instant invoice receipt</li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => onBookExample(example)}
              className="w-full min-h-[48px] px-6 py-3 rounded-xl bg-[#D6AE53] text-[#080808] text-sm font-bold hover:brightness-105 transition-all"
            >
              Book This Service Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { technician } = target;
  const isVerified = technician.verificationStatus === 'verified';
  const techReviews = reviews.filter((r) => r.technicianId === technician.uid);
  const paymentsText = (technician.acceptedPayments || ['cash'])
    .map((pm) => PAYMENT_METHOD_MAP[pm] || pm)
    .join(' · ');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="min-h-[42px] px-3.5 py-2 rounded-xl bg-white dark:bg-[#141414] border border-black/[0.08] dark:border-white/[0.08] text-xs font-semibold text-[#171717] dark:text-white inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4 text-[#D6AE53]" />
          <span>Back</span>
        </button>

        <button
          type="button"
          onClick={() => onReportTech(technician)}
          className="min-h-[42px] px-3.5 py-2 rounded-xl bg-white dark:bg-[#141414] border border-black/[0.08] dark:border-white/[0.08] text-xs font-medium text-[#595959] dark:text-[#A0A0A0] hover:text-rose-400 inline-flex items-center gap-2"
        >
          <Flag className="w-3.5 h-3.5" />
          <span>Report</span>
        </button>
      </div>

      <div className="rounded-2xl bg-white dark:bg-[#141414] border border-black/[0.08] dark:border-white/[0.08] p-6 space-y-6">
        <div className="flex items-start gap-4">
          {technician.avatarUrl && !brokenUrls.has(technician.avatarUrl) ? (
            <img
              src={technician.avatarUrl}
              alt={technician.displayName}
              referrerPolicy="no-referrer"
              onError={() => markBroken(technician.avatarUrl!)}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-white/[0.1] shrink-0"
            />
          ) : (
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#1C1C1C] border border-white/[0.1] flex items-center justify-center text-xl font-bold text-[#D6AE53] shrink-0">
              {technician.displayName.slice(0, 2).toUpperCase()}
            </div>
          )}

          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex items-center gap-2">
              <h2 className="font-display text-2xl font-bold text-[#171717] dark:text-white truncate">
                {technician.displayName}
              </h2>
              {isVerified ? (
                <BadgeCheck className="w-5 h-5 text-[#D6AE53] shrink-0" />
              ) : null}
            </div>
            <p className="text-xs text-[#595959] dark:text-[#A0A0A0] flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="inline-flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#D6AE53]" />
                {technician.neighborhood}
              </span>
              {technician.yearsExperience ? (
                <span>· {technician.yearsExperience} yrs experience</span>
              ) : null}
              {technician.serviceRadiusKm ? (
                <span>· {technician.serviceRadiusKm} km radius</span>
              ) : null}
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-0.5 text-xs font-semibold tabular-nums">
              <span className={technician.isAvailable ? 'text-emerald-600 dark:text-emerald-400' : 'text-[#A0A0A0]'}>
                {technician.isAvailable ? 'Available Today' : 'Currently Busy'}
              </span>
              <span className="text-[#D6AE53]">
                {technician.ratingAvg > 0 ? `${technician.ratingAvg} ★` : 'New Pro'}
              </span>
              <span className="text-[#A0A0A0]">
                {technician.completedJobsCount} completed jobs
              </span>
            </div>
          </div>
        </div>

        {/* Highlights Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="rounded-xl bg-[#F3EEE2] dark:bg-[#1C1C1C] p-4 space-y-1">
            <p className="text-xs text-[#595959] dark:text-[#A0A0A0]">Visit Inspection</p>
            <p className="text-lg font-bold text-[#171717] dark:text-[#D6AE53] tabular-nums">
              {formatMoney(technician.visitFee, technician.currencyCode || currencyCode)}
            </p>
          </div>
          <div className="rounded-xl bg-[#F3EEE2] dark:bg-[#1C1C1C] p-4 space-y-1">
            <p className="text-xs text-[#595959] dark:text-[#A0A0A0]">Arrival ETA</p>
            <p className="text-lg font-bold text-[#171717] dark:text-white tabular-nums flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#D6AE53]" />
              <span>~{technician.responseTimeMins} mins</span>
            </p>
          </div>
          <div className="col-span-2 sm:col-span-1 rounded-xl bg-[#F3EEE2] dark:bg-[#1C1C1C] p-4 space-y-1">
            <p className="text-xs text-[#595959] dark:text-[#A0A0A0]">Trust Checks</p>
            <p className="text-xs font-semibold text-[#171717] dark:text-white flex items-center gap-1.5 pt-1">
              {technician.phoneVerified ? (
                <>
                  <PhoneCall className="w-3.5 h-3.5 text-[#D6AE53]" />
                  <span>Phone &amp; ID Vetted</span>
                </>
              ) : (
                <span>Standard Account</span>
              )}
            </p>
          </div>
        </div>

        {/* Bio & Specialties */}
        <div className="space-y-4 pt-4 border-t border-black/[0.06] dark:border-white/[0.06]">
          <div className="space-y-1.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#D6AE53]">
              About Specialist
            </h3>
            <p className="text-sm text-[#292929] dark:text-[#A0A0A0] leading-relaxed">
              {technician.bio}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl bg-[#F3EEE2] dark:bg-[#1C1C1C] p-4 space-y-1">
              <p className="font-semibold text-[#171717] dark:text-white">Specialties</p>
              <p className="text-[#D6AE53] font-medium">
                {technician.specialties.join(' · ')}
              </p>
            </div>
            <div className="rounded-xl bg-[#F3EEE2] dark:bg-[#1C1C1C] p-4 space-y-1">
              <p className="font-semibold text-[#171717] dark:text-white flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-[#D6AE53]" />
                <span>Accepted Payments</span>
              </p>
              <p className="text-[#595959] dark:text-[#A0A0A0]">{paymentsText}</p>
              {technician.spokenLanguages && technician.spokenLanguages.length > 0 ? (
                <p className="text-[#595959] dark:text-[#A0A0A0] flex items-center gap-1 pt-0.5">
                  <Globe className="w-3 h-3 text-[#D6AE53]" />
                  <span>{technician.spokenLanguages.join(', ')}</span>
                </p>
              ) : null}
            </div>
          </div>
        </div>

        {/* Verified Reviews */}
        {techReviews.length > 0 ? (
          <div className="space-y-3 pt-4 border-t border-black/[0.06] dark:border-white/[0.06]">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#D6AE53]">
              Recent Customer Reviews ({techReviews.length})
            </h3>
            <div className="divide-y divide-black/[0.06] dark:divide-white/[0.06]">
              {techReviews.slice(0, 4).map((rev) => (
                <div key={rev.id} className="py-3.5 first:pt-1 last:pb-1 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#171717] dark:text-white">
                      {rev.customerName}
                    </span>
                    <span className="text-[#D6AE53] font-bold flex items-center gap-1 tabular-nums">
                      <Star className="w-3.5 h-3.5 fill-[#D6AE53]" />
                      {rev.rating}.0
                    </span>
                  </div>
                  <p className="text-xs italic text-[#292929] dark:text-white/90 leading-relaxed">
                    &ldquo;{rev.comment}&rdquo;
                  </p>
                  <p className="text-[11px] text-[#A0A0A0]">
                    {CATEGORY_SHORT_MAP[rev.applianceCategory] || 'Repair'} ·{' '}
                    {formatTimestamp(rev.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => onBookTechnician(technician)}
          className="w-full min-h-[48px] px-6 py-3 rounded-xl bg-[#D6AE53] text-[#080808] text-sm font-bold hover:brightness-105 transition-all"
        >
          Book {technician.displayName} Now
        </button>
      </div>
    </div>
  );
};
