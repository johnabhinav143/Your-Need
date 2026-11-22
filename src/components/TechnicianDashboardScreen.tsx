import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  BadgeCheck,
  Bot,
  Briefcase,
  ChevronDown,
  Clock,
  FileText,
  MapPin,
  MessageSquare,
  Power,
  ShieldCheck,
  Star,
  TrendingUp,
  UserCheck,
  Wrench,
} from 'lucide-react';
import { CATEGORY_SHORT_MAP, STATUS_LABELS, URGENCY_LABELS } from '../constants';
import { CountryRegion, formatMoney } from '../i18n/regions';
import { RepairJob, Review, TechnicianProfile } from '../types';
import { CategoryIcon } from './CategoryIcon';

interface TechnicianDashboardScreenProps {
  displayName: string;
  isSignedIn: boolean;
  region: CountryRegion;
  currencyCode: string;
  currentUid: string | null;
  myTechProfile: TechnicianProfile | null;
  myTechnicianJobs: RepairJob[];
  pendingRequestsForTech: RepairJob[];
  openCommunityJobs: RepairJob[];
  todayCompletedCount: number;
  monthlyEarnings: number;
  myTechFeedback: Review[];
  onToggleDuty: () => void;
  onOpenTechSetup: () => void;
  onOpenAuth: (reason: string) => void;
  onOpenJobDetail: (job: RepairJob) => void;
  onOpenInvoice: (job: RepairJob) => void;
  onOpenMessages: () => void;
  onOpenExplore: () => void;
  onOpenAiAssistant: () => void;
  onSwitchToCustomerDashboard: () => void;
}

export const TechnicianDashboardScreen: React.FC<TechnicianDashboardScreenProps> = ({
  displayName,
  isSignedIn,
  region,
  currencyCode,
  currentUid,
  myTechProfile,
  myTechnicianJobs,
  pendingRequestsForTech,
  openCommunityJobs,
  todayCompletedCount,
  monthlyEarnings,
  myTechFeedback,
  onToggleDuty,
  onOpenTechSetup,
  onOpenAuth,
  onOpenJobDetail,
  onOpenInvoice,
  onOpenMessages,
  onOpenExplore,
  onOpenAiAssistant,
  onSwitchToCustomerDashboard,
}) => {
  const [feedFilter, setFeedFilter] = useState<'all' | 'matching'>('all');
  const [historyOpen, setHistoryOpen] = useState(false);

  const activeJobs = useMemo(
    () =>
      myTechnicianJobs.filter(
        (j) =>
          j.status === 'accepted' ||
          j.status === 'en_route' ||
          j.status === 'arrived' ||
          j.status === 'in_progress'
      ),
    [myTechnicianJobs]
  );

  const completedJobs = useMemo(
    () => myTechnicianJobs.filter((j) => j.status === 'completed'),
    [myTechnicianJobs]
  );

  const availableOpenJobs = useMemo(() => {
    const filtered = openCommunityJobs.filter((j) => j.customerId !== currentUid);
    if (feedFilter === 'matching' && myTechProfile?.specialties?.length) {
      const specs = new Set(myTechProfile.specialties);
      return filtered.filter((j) => specs.has(j.applianceCategory));
    }
    return filtered;
  }, [openCommunityJobs, currentUid, feedFilter, myTechProfile]);

  const effectiveCurrency = myTechProfile?.currencyCode || currencyCode;

  return (
    <div className="space-y-9 sm:space-y-10">
      {/* Technician Hero Header */}
      <section className="rounded-2xl yn-glass-card yn-tricolor-border p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="space-y-2 min-w-0">
            <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#138808] dark:text-[#35C46A]">
              <Wrench className="w-4 h-4" />
              <span>Technician Dashboard · {region.name}</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight truncate yn-tricolor-text">
              {myTechProfile?.displayName || displayName || 'Service Provider'}
            </h2>
            <p className="text-xs sm:text-sm text-[#43564D] dark:text-[#9CB0A6]">
              {myTechProfile
                ? `${myTechProfile.neighborhood} · ${myTechProfile.specialties
                    .slice(0, 3)
                    .map((s) => CATEGORY_SHORT_MAP[s as keyof typeof CATEGORY_SHORT_MAP] || s)
                    .join(' · ')}`
                : 'Dedicated provider workspace for repair leads, scheduling & payouts'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {myTechProfile ? (
              <button
                type="button"
                onClick={onToggleDuty}
                className={`min-h-[44px] px-4.5 rounded-xl text-xs font-bold inline-flex items-center gap-2 transition-all ${
                  myTechProfile.isAvailable
                    ? 'yn-btn-emerald'
                    : 'bg-[#E8EDF2] dark:bg-[#07130F] border border-[#075E36]/15 dark:border-white/[0.12] text-[#43564D] dark:text-[#9CB0A6] hover:text-[#18231E] dark:hover:text-[#FFFDF8]'
                }`}
              >
                <Power className="w-4 h-4" />
                <span>{myTechProfile.isAvailable ? 'On Duty' : 'Off Duty'}</span>
              </button>
            ) : null}

            <button
              type="button"
              onClick={onSwitchToCustomerDashboard}
              className="min-h-[44px] px-4 rounded-xl bg-[#E8EDF2]/85 dark:bg-[#07130F] border border-[#075E36]/15 dark:border-white/[0.12] text-xs font-semibold text-[#18231E] dark:text-[#FFFDF8] hover:border-[#FF9933]/50 transition-colors"
            >
              Customer Dashboard
            </button>
          </div>
        </div>

        {/* Status / Onboarding Strip */}
        {!isSignedIn ? (
          <div className="rounded-2xl bg-[#E8EDF2]/80 dark:bg-[#07130F]/75 border border-[#075E36]/12 dark:border-white/[0.08] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-[#18231E] dark:text-[#FFFDF8]">
                Sign in to access your live Technician Workbench
              </p>
              <p className="text-xs text-[#43564D] dark:text-[#9CB0A6]">
                Claim nearby repair jobs, quote inspection fees, and track earnings in real time.
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                onOpenAuth('Sign in with Google to activate your Technician Dashboard.')
              }
              className="min-h-[44px] px-5 rounded-xl yn-btn-emerald text-xs font-bold shrink-0"
            >
              Sign In as Technician
            </button>
          </div>
        ) : !myTechProfile ? (
          <div className="rounded-2xl bg-[#E8EDF2]/80 dark:bg-[#07130F]/75 border border-[#075E36]/12 dark:border-white/[0.08] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-[#18231E] dark:text-[#FFFDF8]">
                Complete Your Technician Profile to Accept Bookings
              </p>
              <p className="text-xs text-[#43564D] dark:text-[#9CB0A6]">
                Set your trade categories, visit fee, service radius, and ID verification.
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenTechSetup}
              className="min-h-[44px] px-5 rounded-xl yn-btn-emerald text-xs font-bold shrink-0"
            >
              Setup Technician Profile
            </button>
          </div>
        ) : (
          <div className="rounded-xl bg-[#E8EDF2]/80 dark:bg-[#07130F]/75 border border-[#075E36]/12 dark:border-white/[0.08] px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 font-semibold text-[#18231E] dark:text-[#FFFDF8]">
                <BadgeCheck className="w-4 h-4 text-[#138808] dark:text-[#35C46A]" />
                <span>
                  {myTechProfile.verificationStatus === 'verified'
                    ? 'Identity Verified Pro'
                    : myTechProfile.verificationStatus === 'pending'
                      ? 'ID Verification Pending Review'
                      : 'Standard Technician Account'}
                </span>
              </span>
              <span className="text-[#5B6F65] dark:text-[#7E948A]">·</span>
              <span className="text-[#43564D] dark:text-[#9CB0A6]">
                Visit Fee {formatMoney(myTechProfile.visitFee, effectiveCurrency)}
              </span>
              <span className="text-[#5B6F65] dark:text-[#7E948A]">·</span>
              <span className="text-[#43564D] dark:text-[#9CB0A6]">
                ETA ~{myTechProfile.responseTimeMins}m
              </span>
            </div>
            <button
              type="button"
              onClick={onOpenTechSetup}
              className="min-h-[36px] px-2.5 text-xs font-semibold text-[#E87516] dark:text-[#FF9933] hover:underline"
            >
              Edit Rates &amp; Profile
            </button>
          </div>
        )}
      </section>

      {/* Technician Key Performance Metrics */}
      <section aria-label="Technician summary metrics" className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl yn-glass-card p-5 space-y-2">
          <p className="text-xs text-[#43564D] dark:text-[#9CB0A6]">Today Completed</p>
          <p className="text-2xl font-bold text-[#138808] dark:text-[#35C46A] tabular-nums">
            {todayCompletedCount}
          </p>
        </div>
        <div className="rounded-2xl yn-glass-card p-5 space-y-2">
          <p className="text-xs text-[#43564D] dark:text-[#9CB0A6]">Month Earnings</p>
          <p className="text-2xl font-bold text-[#E87516] dark:text-[#FFB866] tabular-nums inline-flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 shrink-0" />
            <span>{formatMoney(monthlyEarnings, effectiveCurrency)}</span>
          </p>
        </div>
        <div className="rounded-2xl yn-glass-card p-5 space-y-2">
          <p className="text-xs text-[#43564D] dark:text-[#9CB0A6]">Direct Requests</p>
          <p className="text-2xl font-bold text-[#18231E] dark:text-[#FFFDF8] tabular-nums">
            {pendingRequestsForTech.length}
          </p>
        </div>
        <div className="rounded-2xl yn-glass-card p-5 space-y-2">
          <p className="text-xs text-[#43564D] dark:text-[#9CB0A6]">Pro Rating</p>
          <p className="text-2xl font-bold text-[#E87516] dark:text-[#FFD28A] tabular-nums">
            {myTechProfile?.ratingAvg && myTechProfile.ratingAvg > 0
              ? `${myTechProfile.ratingAvg} ★`
              : myTechFeedback.length > 0
                ? `${myTechFeedback.length} rev`
                : 'New'}
          </p>
        </div>
      </section>

      {/* Quick Technician Actions */}
      <section aria-label="Technician shortcuts" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          type="button"
          onClick={onOpenTechSetup}
          className="rounded-2xl yn-glass-card hover:border-[#35C46A]/50 p-5 text-left flex items-center gap-4 transition-all"
        >
          <div className="w-11 h-11 rounded-xl bg-[#138808]/14 dark:bg-[#35C46A]/18 border border-[#138808]/25 dark:border-[#35C46A]/25 text-[#138808] dark:text-[#35C46A] flex items-center justify-center shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
          <div className="min-w-0 space-y-0.5">
            <p className="text-sm font-semibold text-[#18231E] dark:text-[#FFFDF8]">
              Specialties &amp; ID
            </p>
            <p className="text-xs text-[#43564D] dark:text-[#9CB0A6] truncate">Update profile &amp; fees</p>
          </div>
        </button>

        <button
          type="button"
          onClick={onOpenMessages}
          className="rounded-2xl yn-glass-card hover:border-[#FF9933]/50 p-5 text-left flex items-center gap-4 transition-all"
        >
          <div className="w-11 h-11 rounded-xl bg-[#FF9933]/14 dark:bg-[#FF9933]/18 border border-[#FF9933]/25 text-[#E87516] dark:text-[#FFB866] flex items-center justify-center shrink-0">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div className="min-w-0 space-y-0.5">
            <p className="text-sm font-semibold text-[#18231E] dark:text-[#FFFDF8]">
              Customer Chats
            </p>
            <p className="text-xs text-[#43564D] dark:text-[#9CB0A6] truncate">Arrival notes &amp; quotes</p>
          </div>
        </button>

        <button
          type="button"
          onClick={onOpenAiAssistant}
          className="rounded-2xl yn-glass-card hover:border-[#FF9933]/50 p-5 text-left flex items-center gap-4 transition-all"
        >
          <div className="w-11 h-11 rounded-xl bg-[#FF9933]/14 dark:bg-[#FF9933]/18 border border-[#FF9933]/25 text-[#E87516] dark:text-[#FFB866] flex items-center justify-center shrink-0">
            <Bot className="w-5 h-5" />
          </div>
          <div className="min-w-0 space-y-0.5">
            <p className="text-sm font-semibold text-[#18231E] dark:text-[#FFFDF8]">
              AI Parts Helper
            </p>
            <p className="text-xs text-[#43564D] dark:text-[#9CB0A6] truncate">Diagnostics &amp; spare parts</p>
          </div>
        </button>
      </section>

      {/* Incoming Direct Requests Assigned To You */}
      {pendingRequestsForTech.length > 0 ? (
        <section className="rounded-2xl yn-glass-card yn-tricolor-border p-6 sm:p-7 space-y-5">
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-[#18231E] dark:text-[#FFFDF8] font-display">
                Direct Client Requests ({pendingRequestsForTech.length})
              </h3>
              <p className="text-xs sm:text-sm text-[#43564D] dark:text-[#9CB0A6]">
                Customers requesting your visit directly — respond quickly to lock in the booking
              </p>
            </div>
          </div>
          <div className="space-y-3.5">
            {pendingRequestsForTech.map((job) => (
              <div
                key={job.id}
                className="rounded-2xl bg-[#E8EDF2]/80 dark:bg-[#07130F]/75 border border-[#FF9933]/30 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-[#FFFDF8] dark:bg-[#071B16] border border-[#FF9933]/25 text-[#E87516] dark:text-[#FFB866] flex items-center justify-center shrink-0">
                    <CategoryIcon category={job.applianceCategory} className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 space-y-1">
                    <p className="text-sm font-bold text-[#18231E] dark:text-[#FFFDF8] truncate">
                      {job.issueTitle}
                    </p>
                    <p className="text-xs text-[#43564D] dark:text-[#9CB0A6] truncate">
                      {job.customerName} · {job.neighborhood} · {URGENCY_LABELS[job.urgency]}
                    </p>
                    <p className="text-xs font-semibold text-[#E87516] dark:text-[#FFB866] tabular-nums">
                      Est. Budget {formatMoney(job.estimatedBudget, job.currencyCode || effectiveCurrency)}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenJobDetail(job)}
                  className="min-h-[44px] px-5 rounded-xl yn-btn-saffron text-xs font-bold shrink-0"
                >
                  Review &amp; Accept
                </button>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* Active Assigned Jobs */}
      <section className="rounded-2xl yn-glass-card p-6 sm:p-7 space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-[#18231E] dark:text-[#FFFDF8] font-display">
              Active Jobs In Progress ({activeJobs.length})
            </h3>
            <p className="text-xs sm:text-sm text-[#43564D] dark:text-[#9CB0A6]">
              Update travel status, send quotes, and record completed repairs
            </p>
          </div>
          <Briefcase className="w-5 h-5 text-[#138808] dark:text-[#35C46A] shrink-0" />
        </div>

        {activeJobs.length === 0 ? (
          <div className="rounded-2xl bg-[#E8EDF2]/80 dark:bg-[#07130F]/75 border border-[#075E36]/12 dark:border-white/[0.08] p-6 text-center space-y-2">
            <p className="text-sm font-semibold text-[#18231E] dark:text-[#FFFDF8]">
              No active jobs assigned right now
            </p>
            <p className="text-xs text-[#43564D] dark:text-[#9CB0A6]">
              Claim an open service request below to begin a repair visit.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#075E36]/10 dark:divide-white/[0.08]">
            {activeJobs.map((job) => (
              <div
                key={job.id}
                className="py-5 first:pt-2 last:pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-[#E8EDF2] dark:bg-[#07130F] border border-[#075E36]/15 dark:border-[#35C46A]/25 text-[#138808] dark:text-[#35C46A] flex items-center justify-center shrink-0">
                    <CategoryIcon category={job.applianceCategory} className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 space-y-1">
                    <p className="text-sm font-bold text-[#18231E] dark:text-[#FFFDF8] truncate">
                      {job.issueTitle}
                    </p>
                    <p className="text-xs text-[#43564D] dark:text-[#9CB0A6] truncate">
                      <span className="font-semibold text-[#138808] dark:text-[#35C46A]">
                        {STATUS_LABELS[job.status]}
                      </span>{' '}
                      · {job.customerName} · {job.neighborhood}
                    </p>
                    <p className="text-xs text-[#43564D] dark:text-[#9CB0A6]">
                      Preferred slot: {job.preferredSlot}
                      {job.technicianEta ? ` · ETA ${job.technicianEta}` : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3.5 shrink-0">
                  <span className="text-sm font-bold text-[#18231E] dark:text-[#FFFDF8] tabular-nums">
                    {formatMoney(job.quotedFee || job.estimatedBudget, job.currencyCode || effectiveCurrency)}
                  </span>
                  <button
                    type="button"
                    onClick={() => onOpenJobDetail(job)}
                    className="min-h-[42px] px-4.5 rounded-xl yn-btn-saffron text-xs font-bold"
                  >
                    Manage
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Open Repair Requests Feed */}
      <section className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-[#18231E] dark:text-[#FFFDF8] font-display">
              Open Service Leads ({availableOpenJobs.length})
            </h3>
            <p className="text-xs sm:text-sm text-[#43564D] dark:text-[#9CB0A6]">
              Live homeowner repair requests available to claim
            </p>
          </div>
          <div className="flex items-center gap-3">
            {myTechProfile?.specialties?.length ? (
              <div className="flex items-center gap-1 p-1.5 rounded-xl yn-glass-card">
                <button
                  type="button"
                  onClick={() => setFeedFilter('all')}
                  className={`min-h-[38px] px-3.5 rounded-lg text-xs font-semibold transition-all ${
                    feedFilter === 'all'
                      ? 'yn-btn-saffron'
                      : 'text-[#43564D] dark:text-[#9CB0A6]'
                  }`}
                >
                  All Open
                </button>
                <button
                  type="button"
                  onClick={() => setFeedFilter('matching')}
                  className={`min-h-[38px] px-3.5 rounded-lg text-xs font-semibold transition-all ${
                    feedFilter === 'matching'
                      ? 'yn-btn-emerald'
                      : 'text-[#43564D] dark:text-[#9CB0A6]'
                  }`}
                >
                  My Trades
                </button>
              </div>
            ) : null}
            <button
              type="button"
              onClick={onOpenExplore}
              className="min-h-[38px] px-2.5 text-xs font-semibold text-[#E87516] dark:text-[#FF9933] hover:underline inline-flex items-center gap-1.5"
            >
              <span>Browse All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {availableOpenJobs.length === 0 ? (
          <div className="rounded-2xl yn-glass-card p-8 text-center text-xs sm:text-sm text-[#43564D] dark:text-[#9CB0A6]">
            No matching open requests right now. Switch to All Open or stay On Duty to get alerted.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            {availableOpenJobs.slice(0, 6).map((job) => (
              <div
                key={job.id}
                className="rounded-2xl yn-glass-card yn-tricolor-border hover:border-[#35C46A]/50 p-6 flex flex-col justify-between gap-5 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-[#E8EDF2] dark:bg-[#07130F] border border-[#075E36]/15 dark:border-[#FF9933]/25 text-[#E87516] dark:text-[#FFB866] flex items-center justify-center shrink-0">
                        <CategoryIcon category={job.applianceCategory} className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <h4 className="text-sm font-bold text-[#18231E] dark:text-[#FFFDF8] truncate">
                          {job.issueTitle}
                        </h4>
                        <p className="text-xs text-[#43564D] dark:text-[#9CB0A6] truncate">
                          {CATEGORY_SHORT_MAP[job.applianceCategory]} · {job.customerName}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-[#E87516] dark:text-[#FFB866] shrink-0 tabular-nums">
                      {formatMoney(job.estimatedBudget, job.currencyCode || effectiveCurrency)}
                    </span>
                  </div>

                  <p className="text-xs text-[#43564D] dark:text-[#9CB0A6] line-clamp-2 leading-relaxed">
                    {job.issueDescription}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-[#43564D] dark:text-[#9CB0A6]">
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#E87516] dark:text-[#FF9933]" />
                      {job.neighborhood}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#138808] dark:text-[#35C46A]" />
                      {URGENCY_LABELS[job.urgency]}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onOpenJobDetail(job)}
                  className="w-full min-h-[44px] px-4 rounded-xl yn-btn-emerald text-xs font-bold"
                >
                  Inspect &amp; Claim Job
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Customer Reviews + Completed Job History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        <section className="rounded-2xl yn-glass-card p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#18231E] dark:text-[#FFFDF8] font-display">
              Client Reviews ({myTechFeedback.length})
            </h3>
            <ShieldCheck className="w-5 h-5 text-[#138808] dark:text-[#35C46A]" />
          </div>
          {myTechFeedback.length === 0 ? (
            <p className="text-xs sm:text-sm text-[#43564D] dark:text-[#9CB0A6] py-5">
              Completed jobs with homeowner ratings will appear here.
            </p>
          ) : (
            <div className="divide-y divide-[#075E36]/10 dark:divide-white/[0.08]">
              {myTechFeedback.slice(0, 4).map((rev) => (
                <div key={rev.id} className="py-4 first:pt-0 last:pb-0 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs sm:text-sm font-semibold text-[#18231E] dark:text-[#FFFDF8]">
                      {rev.customerName}
                    </span>
                    <span className="text-xs font-bold text-[#E87516] dark:text-[#FFD28A] inline-flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-[#FF9933] text-[#FF9933]" />
                      {rev.rating.toFixed(1)}
                    </span>
                  </div>
                  <p className="text-xs text-[#43564D] dark:text-[#9CB0A6] leading-relaxed">
                    &ldquo;{rev.comment}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl yn-glass-card p-6 space-y-4">
          <button
            type="button"
            onClick={() => setHistoryOpen((v) => !v)}
            className="w-full flex items-center justify-between text-left"
          >
            <div className="space-y-0.5">
              <h3 className="text-base font-bold text-[#18231E] dark:text-[#FFFDF8] font-display">
                Completed Repairs ({completedJobs.length})
              </h3>
              <p className="text-xs text-[#43564D] dark:text-[#9CB0A6]">
                Past payouts &amp; downloadable invoices
              </p>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-[#E87516] dark:text-[#FF9933] transition-transform ${
                historyOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {historyOpen ? (
            completedJobs.length === 0 ? (
              <p className="text-xs sm:text-sm text-[#43564D] dark:text-[#9CB0A6] pt-2">No completed technician jobs yet.</p>
            ) : (
              <div className="divide-y divide-[#075E36]/10 dark:divide-white/[0.08] pt-2">
                {completedJobs.map((job) => (
                  <div
                    key={job.id}
                    className="py-4 flex items-center justify-between gap-4"
                  >
                    <button
                      type="button"
                      onClick={() => onOpenJobDetail(job)}
                      className="min-w-0 text-left flex-1 space-y-0.5"
                    >
                      <p className="text-xs sm:text-sm font-semibold text-[#18231E] dark:text-[#FFFDF8] truncate">
                        {job.issueTitle}
                      </p>
                      <p className="text-[11px] text-[#43564D] dark:text-[#9CB0A6] truncate">
                        {job.customerName} · {job.neighborhood}
                      </p>
                    </button>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs sm:text-sm font-bold text-[#138808] dark:text-[#35C46A] tabular-nums">
                        {formatMoney(
                          job.quotedFee || job.estimatedBudget,
                          job.currencyCode || effectiveCurrency
                        )}
                      </span>
                      <button
                        type="button"
                        onClick={() => onOpenInvoice(job)}
                        className="min-h-[36px] px-2.5 rounded-lg text-xs font-semibold text-[#18231E] dark:text-[#FFFDF8] hover:text-[#FF9933] inline-flex items-center gap-1"
                      >
                        <FileText className="w-3.5 h-3.5 text-[#E87516] dark:text-[#FF9933]" />
                        <span>Invoice</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : null}
        </section>
      </div>
    </div>
  );
};
