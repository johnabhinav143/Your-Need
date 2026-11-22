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
      <div className="rounded-2xl yn-glass-card p-8 text-center space-y-4">
        <p className="text-base font-semibold text-[#18231E] dark:text-[#FFFDF8]">
          Select a service or provider to view details
        </p>
        <button
          type="button"
          onClick={onBack}
          className="min-h-[44px] px-5 rounded-xl yn-btn-saffron text-xs font-bold"
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
      <div className="space-y-8">
        <button
          type="button"
          onClick={onBack}
          className="min-h-[44px] px-4 py-2 rounded-xl yn-glass-card text-xs sm:text-sm font-semibold text-[#18231E] dark:text-[#FFFDF8] hover:border-[#FF9933]/45 inline-flex items-center gap-2 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-[#E87516] dark:text-[#FF9933]" />
          <span>Back</span>
        </button>

        <div className="rounded-2xl overflow-hidden yn-glass-card yn-tricolor-border">
          <div className="aspect-[16/9] max-h-80 w-full bg-[#071B16] relative flex items-center justify-center">
            {!brokenUrls.has(example.imageUrl) ? (
              <img
                src={example.imageUrl}
                alt={example.title}
                referrerPolicy="no-referrer"
                onError={() => markBroken(example.imageUrl)}
                className="w-full h-full object-cover"
              />
            ) : (
              <CategoryIcon category={example.category} className="w-12 h-12 text-[#FF9933]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#07130F]/92 via-[#071B16]/35 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 text-[#FFFDF8] space-y-1.5">
              <p className="text-xs sm:text-sm font-medium text-[#FFB866]">
                {CATEGORY_MAP[example.category]} · {example.area}
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold leading-tight">
                {example.title}
              </h2>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-7">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="rounded-2xl bg-[#E8EDF2]/80 dark:bg-[#07130F]/75 border border-[#075E36]/12 dark:border-white/[0.08] p-5 space-y-1.5">
                <p className="text-xs text-[#43564D] dark:text-[#9CB0A6]">Estimated Total</p>
                <p className="text-xl font-bold text-[#E87516] dark:text-[#FFB866] tabular-nums">
                  ~{formatMoney(localEstimate, currencyCode)}
                </p>
              </div>
              <div className="rounded-2xl bg-[#E8EDF2]/80 dark:bg-[#07130F]/75 border border-[#075E36]/12 dark:border-white/[0.08] p-5 space-y-1.5">
                <p className="text-xs text-[#43564D] dark:text-[#9CB0A6]">Arrival Window</p>
                <p className="text-xl font-bold text-[#18231E] dark:text-[#FFFDF8]">
                  {example.etaLabel}
                </p>
              </div>
              <div className="col-span-2 sm:col-span-1 rounded-2xl bg-[#E8EDF2]/80 dark:bg-[#07130F]/75 border border-[#075E36]/12 dark:border-white/[0.08] p-5 space-y-1.5">
                <p className="text-xs text-[#43564D] dark:text-[#9CB0A6]">Coverage</p>
                <p className="text-sm font-semibold text-[#138808] dark:text-[#35C46A] flex items-center gap-2 pt-0.5">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>Digital Invoice</span>
                </p>
              </div>
            </div>

            <div className="space-y-3.5 pt-4 border-t border-[#075E36]/12 dark:border-white/[0.08]">
              <h3 className="text-sm font-semibold text-[#18231E] dark:text-[#FFFDF8] flex items-center gap-2">
                <CategoryIcon category={example.category} className="w-4 h-4 text-[#E87516] dark:text-[#FF9933]" />
                <span>What&apos;s Included</span>
              </h3>
              <ul className="space-y-2.5 text-xs sm:text-sm text-[#43564D] dark:text-[#9CB0A6] leading-relaxed">
                <li>· On-site diagnostic inspection by an ID-verified specialist</li>
                <li>· Written final price approval before any repair begins</li>
                <li>· Live 5-step arrival and completion tracking</li>
                <li>· 30-day workmanship warranty and instant invoice receipt</li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => onBookExample(example)}
              className="w-full min-h-[50px] px-6 py-3.5 rounded-xl yn-btn-saffron text-sm font-bold"
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
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="min-h-[44px] px-4 py-2 rounded-xl yn-glass-card text-xs sm:text-sm font-semibold text-[#18231E] dark:text-[#FFFDF8] hover:border-[#FF9933]/45 inline-flex items-center gap-2 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-[#E87516] dark:text-[#FF9933]" />
          <span>Back</span>
        </button>

        <button
          type="button"
          onClick={() => onReportTech(technician)}
          className="min-h-[44px] px-4 py-2 rounded-xl yn-glass-card text-xs font-medium text-[#43564D] dark:text-[#9CB0A6] hover:text-rose-400 inline-flex items-center gap-2 transition-colors"
        >
          <Flag className="w-4 h-4" />
          <span>Report</span>
        </button>
      </div>

      <div className="rounded-2xl yn-glass-card yn-tricolor-border p-6 sm:p-8 space-y-7">
        <div className="flex items-start gap-5">
          {technician.avatarUrl && !brokenUrls.has(technician.avatarUrl) ? (
            <img
              src={technician.avatarUrl}
              alt={technician.displayName}
              referrerPolicy="no-referrer"
              onError={() => markBroken(technician.avatarUrl!)}
              className="w-18 h-18 sm:w-22 sm:h-22 rounded-2xl object-cover border border-[#FF9933]/35 shrink-0"
            />
          ) : (
            <div className="w-18 h-18 sm:w-22 sm:h-22 rounded-2xl bg-[#071B16] border border-[#FF9933]/30 flex items-center justify-center text-xl font-bold text-[#FFB866] shrink-0">
              {technician.displayName.slice(0, 2).toUpperCase()}
            </div>
          )}

          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#18231E] dark:text-[#FFFDF8] truncate">
                {technician.displayName}
              </h2>
              {isVerified ? (
                <BadgeCheck className="w-5 h-5 text-[#138808] dark:text-[#35C46A] shrink-0" />
              ) : null}
            </div>
            <p className="text-xs sm:text-sm text-[#43564D] dark:text-[#9CB0A6] flex flex-wrap items-center gap-x-2.5 gap-y-1">
              <span className="inline-flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#E87516] dark:text-[#FF9933]" />
                {technician.neighborhood}
              </span>
              {technician.yearsExperience ? (
                <span>· {technician.yearsExperience} yrs experience</span>
              ) : null}
              {technician.serviceRadiusKm ? (
                <span>· {technician.serviceRadiusKm} km radius</span>
              ) : null}
            </p>
            <div className="flex flex-wrap items-center gap-3.5 pt-0.5 text-xs sm:text-sm font-semibold tabular-nums">
              <span className={technician.isAvailable ? 'text-[#138808] dark:text-[#35C46A]' : 'text-[#5B6F65] dark:text-[#7E948A]'}>
                {technician.isAvailable ? 'Available Today' : 'Currently Busy'}
              </span>
              <span className="text-[#E87516] dark:text-[#FFB866]">
                {technician.ratingAvg > 0 ? `${technician.ratingAvg} ★` : 'New Pro'}
              </span>
              <span className="text-[#43564D] dark:text-[#9CB0A6]">
                {technician.completedJobsCount} completed jobs
              </span>
            </div>
          </div>
        </div>

        {/* Highlights Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl bg-[#E8EDF2]/80 dark:bg-[#07130F]/75 border border-[#075E36]/12 dark:border-white/[0.08] p-5 space-y-1.5">
            <p className="text-xs text-[#43564D] dark:text-[#9CB0A6]">Visit Inspection</p>
            <p className="text-xl font-bold text-[#E87516] dark:text-[#FFB866] tabular-nums">
              {formatMoney(technician.visitFee, technician.currencyCode || currencyCode)}
            </p>
          </div>
          <div className="rounded-2xl bg-[#E8EDF2]/80 dark:bg-[#07130F]/75 border border-[#075E36]/12 dark:border-white/[0.08] p-5 space-y-1.5">
            <p className="text-xs text-[#43564D] dark:text-[#9CB0A6]">Arrival ETA</p>
            <p className="text-xl font-bold text-[#18231E] dark:text-[#FFFDF8] tabular-nums flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#E87516] dark:text-[#FF9933]" />
              <span>~{technician.responseTimeMins} mins</span>
            </p>
          </div>
          <div className="col-span-2 sm:col-span-1 rounded-2xl bg-[#E8EDF2]/80 dark:bg-[#07130F]/75 border border-[#075E36]/12 dark:border-white/[0.08] p-5 space-y-1.5">
            <p className="text-xs text-[#43564D] dark:text-[#9CB0A6]">Trust Checks</p>
            <p className="text-xs sm:text-sm font-semibold text-[#18231E] dark:text-[#FFFDF8] flex items-center gap-2 pt-0.5">
              {technician.phoneVerified ? (
                <>
                  <PhoneCall className="w-4 h-4 text-[#138808] dark:text-[#35C46A]" />
                  <span>Phone &amp; ID Vetted</span>
                </>
              ) : (
                <span>Standard Account</span>
              )}
            </p>
          </div>
        </div>

        {/* Bio & Specialties */}
        <div className="space-y-5 pt-5 border-t border-[#075E36]/12 dark:border-white/[0.08]">
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#E87516] dark:text-[#FFB866]">
              About Specialist
            </h3>
            <p className="text-sm text-[#18231E]/85 dark:text-[#E8EDF2]/85 leading-relaxed">
              {technician.bio}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div className="rounded-2xl bg-[#E8EDF2]/80 dark:bg-[#07130F]/75 border border-[#075E36]/12 dark:border-white/[0.08] p-5 space-y-1.5">
              <p className="font-semibold text-[#18231E] dark:text-[#FFFDF8]">Specialties</p>
              <p className="text-[#E87516] dark:text-[#FFB866] font-medium">
                {technician.specialties.join(' · ')}
              </p>
            </div>
            <div className="rounded-2xl bg-[#E8EDF2]/80 dark:bg-[#07130F]/75 border border-[#075E36]/12 dark:border-white/[0.08] p-5 space-y-1.5">
              <p className="font-semibold text-[#18231E] dark:text-[#FFFDF8] flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#138808] dark:text-[#35C46A]" />
                <span>Accepted Payments</span>
              </p>
              <p className="text-[#43564D] dark:text-[#9CB0A6]">{paymentsText}</p>
              {technician.spokenLanguages && technician.spokenLanguages.length > 0 ? (
                <p className="text-[#43564D] dark:text-[#9CB0A6] flex items-center gap-1.5 pt-1">
                  <Globe className="w-3.5 h-3.5 text-[#E87516] dark:text-[#FF9933]" />
                  <span>{technician.spokenLanguages.join(', ')}</span>
                </p>
              ) : null}
            </div>
          </div>
        </div>

        {/* Verified Reviews */}
        {techReviews.length > 0 ? (
          <div className="space-y-4 pt-5 border-t border-[#075E36]/12 dark:border-white/[0.08]">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#E87516] dark:text-[#FFB866]">
              Recent Customer Reviews ({techReviews.length})
            </h3>
            <div className="divide-y divide-[#075E36]/10 dark:divide-white/[0.08]">
              {techReviews.slice(0, 4).map((rev) => (
                <div key={rev.id} className="py-4 first:pt-1 last:pb-1 space-y-2">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="font-semibold text-[#18231E] dark:text-[#FFFDF8]">
                      {rev.customerName}
                    </span>
                    <span className="text-[#E87516] dark:text-[#FFD28A] font-bold flex items-center gap-1 tabular-nums">
                      <Star className="w-3.5 h-3.5 fill-[#FF9933] text-[#FF9933]" />
                      {rev.rating}.0
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm italic text-[#18231E]/90 dark:text-[#FFFDF8]/90 leading-relaxed">
                    &ldquo;{rev.comment}&rdquo;
                  </p>
                  <p className="text-[11px] text-[#43564D] dark:text-[#9CB0A6]">
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
          className="w-full min-h-[50px] px-6 py-3.5 rounded-xl yn-btn-saffron text-sm font-bold"
        >
          Book {technician.displayName} Now
        </button>
      </div>
    </div>
  );
};
