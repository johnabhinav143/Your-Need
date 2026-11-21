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
    <div className="space-y-8">
      {/* Technician Hero Header */}
      <section className="rounded-2xl bg-white dark:bg-[#141414] border border-[#D6AE53]/30 p-5 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5 min-w-0">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#D6AE53]">
              <Wrench className="w-3.5 h-3.5" />
              <span>Technician Dashboard · {region.name}</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#171717] dark:text-white tracking-tight truncate">
              {myTechProfile?.displayName || displayName || 'Service Provider'}
            </h2>
            <p className="text-xs sm:text-sm text-[#595959] dark:text-[#A0A0A0]">
              {myTechProfile
                ? `${myTechProfile.neighborhood} · ${myTechProfile.specialties
                    .slice(0, 3)
                    .map((s) => CATEGORY_SHORT_MAP[s as keyof typeof CATEGORY_SHORT_MAP] || s)
                    .join(' · ')}`
                : 'Dedicated provider workspace for repair leads, scheduling & payouts'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {myTechProfile ? (
              <button
                type="button"
                onClick={onToggleDuty}
                className={`min-h-[42px] px-4 rounded-xl text-xs font-bold inline-flex items-center gap-2 transition-colors ${
                  myTechProfile.isAvailable
                    ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                    : 'bg-[#F3EEE2] dark:bg-[#1C1C1C] text-[#595959] dark:text-[#A0A0A0] hover:text-white'
                }`}
              >
                <Power className="w-3.5 h-3.5" />
                <span>{myTechProfile.isAvailable ? 'On Duty' : 'Off Duty'}</span>
              </button>
            ) : null}

            <button
              type="button"
              onClick={onSwitchToCustomerDashboard}
              className="min-h-[42px] px-3.5 rounded-xl bg-[#F3EEE2] dark:bg-[#1C1C1C] border border-black/[0.08] dark:border-white/[0.08] text-xs font-semibold text-[#171717] dark:text-white hover:border-[#D6AE53]/50 transition-colors"
            >
              Customer Dashboard
            </button>
          </div>
        </div>

        {/* Status / Onboarding Strip */}
        {!isSignedIn ? (
          <div className="rounded-xl bg-[#F3EEE2] dark:bg-[#1C1C1C] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <p className="text-sm font-semibold text-[#171717] dark:text-white">
                Sign in to access your live Technician Workbench
              </p>
              <p className="text-xs text-[#595959] dark:text-[#A0A0A0]">
                Claim nearby repair jobs, quote inspection fees, and track earnings in real time.
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                onOpenAuth('Sign in with Google to activate your Technician Dashboard.')
              }
              className="min-h-[42px] px-5 rounded-xl bg-[#D6AE53] text-[#080808] text-xs font-bold shrink-0"
            >
              Sign In as Technician
            </button>
          </div>
        ) : !myTechProfile ? (
          <div className="rounded-xl bg-[#F3EEE2] dark:bg-[#1C1C1C] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <p className="text-sm font-semibold text-[#171717] dark:text-white">
                Complete Your Technician Profile to Accept Bookings
              </p>
              <p className="text-xs text-[#595959] dark:text-[#A0A0A0]">
                Set your trade categories, visit fee, service radius, and ID verification.
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenTechSetup}
              className="min-h-[42px] px-5 rounded-xl bg-[#D6AE53] text-[#080808] text-xs font-bold shrink-0"
            >
              Setup Technician Profile
            </button>
          </div>
        ) : (
          <div className="rounded-xl bg-[#F3EEE2] dark:bg-[#1C1C1C] px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 font-semibold text-[#171717] dark:text-white">
                <BadgeCheck className="w-4 h-4 text-[#D6AE53]" />
                <span>
                  {myTechProfile.verificationStatus === 'verified'
                    ? 'Identity Verified Pro'
                    : myTechProfile.verificationStatus === 'pending'
                      ? 'ID Verification Pending Review'
                      : 'Standard Technician Account'}
                </span>
              </span>
              <span className="text-[#A0A0A0]">·</span>
              <span className="text-[#595959] dark:text-[#A0A0A0]">
                Visit Fee {formatMoney(myTechProfile.visitFee, effectiveCurrency)}
              </span>
              <span className="text-[#A0A0A0]">·</span>
              <span className="text-[#595959] dark:text-[#A0A0A0]">
                ETA ~{myTechProfile.responseTimeMins}m
              </span>
            </div>
            <button
              type="button"
              onClick={onOpenTechSetup}
              className="text-xs font-semibold text-[#D6AE53] hover:underline"
            >
              Edit Rates &amp; Profile
            </button>
          </div>
        )}
      </section>

      {/* Technician Key Performance Metrics */}
      <section aria-label="Technician summary metrics" className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl bg-white dark:bg-[#141414] border border-black/[0.08] dark:border-white/[0.08] p-4 space-y-1">
          <p className="text-xs text-[#A0A0A0]">Today Completed</p>
          <p className="text-2xl font-bold text-[#171717] dark:text-white tabular-nums">
            {todayCompletedCount}
          </p>
        </div>
        <div className="rounded-2xl bg-white dark:bg-[#141414] border border-black/[0.08] dark:border-white/[0.08] p-4 space-y-1">
          <p className="text-xs text-[#A0A0A0]">Month Earnings</p>
          <p className="text-2xl font-bold text-[#D6AE53] tabular-nums inline-flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 shrink-0" />
            <span>{formatMoney(monthlyEarnings, effectiveCurrency)}</span>
          </p>
        </div>
        <div className="rounded-2xl bg-white dark:bg-[#141414] border border-black/[0.08] dark:border-white/[0.08] p-4 space-y-1">
          <p className="text-xs text-[#A0A0A0]">Direct Requests</p>
          <p className="text-2xl font-bold text-[#171717] dark:text-white tabular-nums">
            {pendingRequestsForTech.length}
          </p>
        </div>
        <div className="rounded-2xl bg-white dark:bg-[#141414] border border-black/[0.08] dark:border-white/[0.08] p-4 space-y-1">
          <p className="text-xs text-[#A0A0A0]">Pro Rating</p>
          <p className="text-2xl font-bold text-[#D6AE53] tabular-nums">
            {myTechProfile?.ratingAvg && myTechProfile.ratingAvg > 0
              ? `${myTechProfile.ratingAvg} ★`
              : myTechFeedback.length > 0
                ? `${myTechFeedback.length} rev`
                : 'New'}
          </p>
        </div>
      </section>

      {/* Quick Technician Actions */}
      <section aria-label="Technician shortcuts" className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          type="button"
          onClick={onOpenTechSetup}
          className="rounded-2xl bg-white dark:bg-[#141414] border border-black/[0.08] dark:border-white/[0.08] hover:border-[#D6AE53]/50 p-4 text-left flex items-center gap-3.5 transition-colors"
        >
          <div className="w-10 h-10 rounded-xl bg-[#F3EEE2] dark:bg-[#1C1C1C] text-[#D6AE53] flex items-center justify-center shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#171717] dark:text-white">
              Specialties &amp; ID
            </p>
            <p className="text-xs text-[#A0A0A0] truncate">Update profile &amp; fees</p>
          </div>
        </button>

        <button
          type="button"
          onClick={onOpenMessages}
          className="rounded-2xl bg-white dark:bg-[#141414] border border-black/[0.08] dark:border-white/[0.08] hover:border-[#D6AE53]/50 p-4 text-left flex items-center gap-3.5 transition-colors"
        >
          <div className="w-10 h-10 rounded-xl bg-[#F3EEE2] dark:bg-[#1C1C1C] text-[#D6AE53] flex items-center justify-center shrink-0">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#171717] dark:text-white">
              Customer Chats
            </p>
            <p className="text-xs text-[#A0A0A0] truncate">Arrival notes &amp; quotes</p>
          </div>
        </button>

        <button
          type="button"
          onClick={onOpenAiAssistant}
          className="rounded-2xl bg-white dark:bg-[#141414] border border-black/[0.08] dark:border-white/[0.08] hover:border-[#D6AE53]/50 p-4 text-left flex items-center gap-3.5 transition-colors"
        >
          <div className="w-10 h-10 rounded-xl bg-[#F3EEE2] dark:bg-[#1C1C1C] text-[#D6AE53] flex items-center justify-center shrink-0">
            <Bot className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#171717] dark:text-white">
              AI Parts Helper
            </p>
            <p className="text-xs text-[#A0A0A0] truncate">Diagnostics &amp; spare parts</p>
          </div>
        </button>
      </section>

      {/* Incoming Direct Requests Assigned To You */}
      {pendingRequestsForTech.length > 0 ? (
        <section className="rounded-2xl bg-white dark:bg-[#141414] border border-[#D6AE53]/40 p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-[#171717] dark:text-white font-display">
                Direct Client Requests ({pendingRequestsForTech.length})
              </h3>
              <p className="text-xs text-[#A0A0A0]">
                Customers requesting your visit directly — respond quickly to lock in the booking
              </p>
            </div>
          </div>
          <div className="space-y-3">
            {pendingRequestsForTech.map((job) => (
              <div
                key={job.id}
                className="rounded-xl bg-[#F3EEE2] dark:bg-[#1C1C1C] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#141414] text-[#D6AE53] flex items-center justify-center shrink-0">
                    <CategoryIcon category={job.applianceCategory} className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <p className="text-sm font-semibold text-[#171717] dark:text-white truncate">
                      {job.issueTitle}
                    </p>
                    <p className="text-xs text-[#595959] dark:text-[#A0A0A0] truncate">
                      {job.customerName} · {job.neighborhood} · {URGENCY_LABELS[job.urgency]}
                    </p>
                    <p className="text-xs font-semibold text-[#D6AE53] tabular-nums">
                      Est. Budget {formatMoney(job.estimatedBudget, job.currencyCode || effectiveCurrency)}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenJobDetail(job)}
                  className="min-h-[42px] px-4 rounded-xl bg-[#D6AE53] text-[#080808] text-xs font-bold shrink-0"
                >
                  Review &amp; Accept
                </button>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* Active Assigned Jobs */}
      <section className="rounded-2xl bg-white dark:bg-[#141414] border border-black/[0.08] dark:border-white/[0.08] p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-[#171717] dark:text-white font-display">
              Active Jobs In Progress ({activeJobs.length})
            </h3>
            <p className="text-xs text-[#A0A0A0]">
              Update travel status, send quotes, and record completed repairs
            </p>
          </div>
          <Briefcase className="w-4 h-4 text-[#D6AE53] shrink-0" />
        </div>

        {activeJobs.length === 0 ? (
          <div className="rounded-xl bg-[#F3EEE2] dark:bg-[#1C1C1C] p-5 text-center space-y-1.5">
            <p className="text-sm font-semibold text-[#171717] dark:text-white">
              No active jobs assigned right now
            </p>
            <p className="text-xs text-[#A0A0A0]">
              Claim an open service request below to begin a repair visit.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-black/[0.06] dark:divide-white/[0.06]">
            {activeJobs.map((job) => (
              <div
                key={job.id}
                className="py-4 first:pt-1 last:pb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[#F3EEE2] dark:bg-[#1C1C1C] text-[#D6AE53] flex items-center justify-center shrink-0">
                    <CategoryIcon category={job.applianceCategory} className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <p className="text-sm font-semibold text-[#171717] dark:text-white truncate">
                      {job.issueTitle}
                    </p>
                    <p className="text-xs text-[#595959] dark:text-[#A0A0A0] truncate">
                      <span className="font-semibold text-[#D6AE53]">
                        {STATUS_LABELS[job.status]}
                      </span>{' '}
                      · {job.customerName} · {job.neighborhood}
                    </p>
                    <p className="text-xs text-[#A0A0A0]">
                      Preferred slot: {job.preferredSlot}
                      {job.technicianEta ? ` · ETA ${job.technicianEta}` : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-bold text-[#171717] dark:text-white tabular-nums">
                    {formatMoney(job.quotedFee || job.estimatedBudget, job.currencyCode || effectiveCurrency)}
                  </span>
                  <button
                    type="button"
                    onClick={() => onOpenJobDetail(job)}
                    className="min-h-[40px] px-4 rounded-xl bg-[#D6AE53] text-[#080808] text-xs font-bold"
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
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-[#171717] dark:text-white font-display">
              Open Service Leads ({availableOpenJobs.length})
            </h3>
            <p className="text-xs text-[#A0A0A0]">
              Live homeowner repair requests available to claim
            </p>
          </div>
          <div className="flex items-center gap-2">
            {myTechProfile?.specialties?.length ? (
              <div className="flex items-center p-1 rounded-xl bg-white dark:bg-[#141414] border border-black/[0.08] dark:border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setFeedFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    feedFilter === 'all'
                      ? 'bg-[#D6AE53] text-[#080808]'
                      : 'text-[#595959] dark:text-[#A0A0A0]'
                  }`}
                >
                  All Open
                </button>
                <button
                  type="button"
                  onClick={() => setFeedFilter('matching')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    feedFilter === 'matching'
                      ? 'bg-[#D6AE53] text-[#080808]'
                      : 'text-[#595959] dark:text-[#A0A0A0]'
                  }`}
                >
                  My Trades
                </button>
              </div>
            ) : null}
            <button
              type="button"
              onClick={onOpenExplore}
              className="text-xs font-semibold text-[#D6AE53] hover:underline inline-flex items-center gap-1"
            >
              <span>Browse All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {availableOpenJobs.length === 0 ? (
          <div className="rounded-2xl bg-white dark:bg-[#141414] border border-black/[0.08] dark:border-white/[0.08] p-6 text-center text-xs text-[#A0A0A0]">
            No matching open requests right now. Switch to All Open or stay On Duty to get alerted.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableOpenJobs.slice(0, 6).map((job) => (
              <div
                key={job.id}
                className="rounded-2xl bg-white dark:bg-[#141414] border border-black/[0.08] dark:border-white/[0.08] hover:border-[#D6AE53]/45 p-5 flex flex-col justify-between gap-4 transition-colors"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-[#F3EEE2] dark:bg-[#1C1C1C] text-[#D6AE53] flex items-center justify-center shrink-0">
                        <CategoryIcon category={job.applianceCategory} className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-[#171717] dark:text-white truncate">
                          {job.issueTitle}
                        </h4>
                        <p className="text-xs text-[#A0A0A0] truncate">
                          {CATEGORY_SHORT_MAP[job.applianceCategory]} · {job.customerName}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[#D6AE53] shrink-0 tabular-nums">
                      {formatMoney(job.estimatedBudget, job.currencyCode || effectiveCurrency)}
                    </span>
                  </div>

                  <p className="text-xs text-[#595959] dark:text-[#A0A0A0] line-clamp-2 leading-relaxed">
                    {job.issueDescription}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#A0A0A0]">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#D6AE53]" />
                      {job.neighborhood}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#D6AE53]" />
                      {URGENCY_LABELS[job.urgency]}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onOpenJobDetail(job)}
                  className="w-full min-h-[42px] px-4 rounded-xl bg-[#D6AE53] text-[#080808] text-xs font-bold hover:brightness-105 transition-all"
                >
                  Inspect &amp; Claim Job
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Customer Reviews + Completed Job History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section className="rounded-2xl bg-white dark:bg-[#141414] border border-black/[0.08] dark:border-white/[0.08] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#171717] dark:text-white font-display">
              Client Reviews ({myTechFeedback.length})
            </h3>
            <ShieldCheck className="w-4 h-4 text-[#D6AE53]" />
          </div>
          {myTechFeedback.length === 0 ? (
            <p className="text-xs text-[#A0A0A0] py-4">
              Completed jobs with homeowner ratings will appear here.
            </p>
          ) : (
            <div className="divide-y divide-black/[0.06] dark:divide-white/[0.06]">
              {myTechFeedback.slice(0, 4).map((rev) => (
                <div key={rev.id} className="py-3 first:pt-0 last:pb-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-[#171717] dark:text-white">
                      {rev.customerName}
                    </span>
                    <span className="text-xs font-bold text-[#D6AE53] inline-flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      {rev.rating.toFixed(1)}
                    </span>
                  </div>
                  <p className="text-xs text-[#595959] dark:text-[#A0A0A0] leading-relaxed">
                    &ldquo;{rev.comment}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl bg-white dark:bg-[#141414] border border-black/[0.08] dark:border-white/[0.08] p-5 space-y-3">
          <button
            type="button"
            onClick={() => setHistoryOpen((v) => !v)}
            className="w-full flex items-center justify-between text-left"
          >
            <div>
              <h3 className="text-base font-bold text-[#171717] dark:text-white font-display">
                Completed Repairs ({completedJobs.length})
              </h3>
              <p className="text-xs text-[#A0A0A0]">
                Past payouts &amp; downloadable invoices
              </p>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-[#D6AE53] transition-transform ${
                historyOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {historyOpen ? (
            completedJobs.length === 0 ? (
              <p className="text-xs text-[#A0A0A0] pt-2">No completed technician jobs yet.</p>
            ) : (
              <div className="divide-y divide-black/[0.06] dark:divide-white/[0.06] pt-2">
                {completedJobs.map((job) => (
                  <div
                    key={job.id}
                    className="py-3 flex items-center justify-between gap-3"
                  >
                    <button
                      type="button"
                      onClick={() => onOpenJobDetail(job)}
                      className="min-w-0 text-left flex-1"
                    >
                      <p className="text-xs font-semibold text-[#171717] dark:text-white truncate">
                        {job.issueTitle}
                      </p>
                      <p className="text-[11px] text-[#A0A0A0] truncate">
                        {job.customerName} · {job.neighborhood}
                      </p>
                    </button>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs font-bold text-[#D6AE53] tabular-nums">
                        {formatMoney(
                          job.quotedFee || job.estimatedBudget,
                          job.currencyCode || effectiveCurrency
                        )}
                      </span>
                      <button
                        type="button"
                        onClick={() => onOpenInvoice(job)}
                        className="text-xs font-semibold text-[#171717] dark:text-white hover:text-[#D6AE53] inline-flex items-center gap-1"
                      >
                        <FileText className="w-3.5 h-3.5 text-[#D6AE53]" />
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
