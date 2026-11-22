import React, { useState } from 'react';
import {
  BadgeCheck,
  CheckCircle2,
  ChevronDown,
  FileText,
  Plus,
  Shield,
  TrendingUp,
} from 'lucide-react';
import { STATUS_LABELS } from '../constants';
import { CountryRegion, formatMoney } from '../i18n/regions';
import {
  ActiveRoleView,
  LoginRecord,
  RepairJob,
  ReportComplaint,
  ReportStatus,
  Review,
  TechnicianProfile,
  UserProfile,
  VerificationStatus,
} from '../types';
import { AdminDashboardPanel } from './AdminDashboardPanel';
import { CategoryIcon } from './CategoryIcon';

interface AppBookingsScreenProps {
  activeRoleView: ActiveRoleView;
  onChangeRoleView: (role: ActiveRoleView) => void;
  isAdmin: boolean;
  authReady: boolean;
  isSignedIn: boolean;
  region: CountryRegion;
  currencyCode: string;
  myCustomerJobs: RepairJob[];
  myTechnicianJobs: RepairJob[];
  myTechProfile: TechnicianProfile | null;
  pendingRequestsForTech: RepairJob[];
  todayCompletedCount: number;
  monthlyEarnings: number;
  myTechFeedback: Review[];
  adminUsers: UserProfile[];
  adminLoginRecords: LoginRecord[];
  adminTechnicians: TechnicianProfile[];
  adminJobs: RepairJob[];
  adminReports: ReportComplaint[];
  databaseId: string;
  firebaseConsoleUrl: string;
  adminPortalUrl: string;
  onVerifyTechnician: (
    techId: string,
    verificationStatus: VerificationStatus,
    isPublic: boolean
  ) => Promise<void>;
  onUpdateReport: (
    reportId: string,
    status: ReportStatus,
    adminNote: string
  ) => Promise<void>;
  onOpenBooking: () => void;
  onOpenAuth: (reason: string) => void;
  onOpenJobDetail: (job: RepairJob) => void;
  onOpenInvoice: (job: RepairJob) => void;
  onOpenTechSetup: () => void;
  onOpenTechnicianDashboard?: () => void;
  onToggleDuty: () => void;
}

export const AppBookingsScreen: React.FC<AppBookingsScreenProps> = ({
  activeRoleView,
  onChangeRoleView,
  isAdmin,
  authReady,
  isSignedIn,
  currencyCode,
  myCustomerJobs,
  myTechnicianJobs,
  myTechProfile,
  pendingRequestsForTech,
  todayCompletedCount,
  monthlyEarnings,
  myTechFeedback,
  adminUsers,
  adminLoginRecords,
  adminTechnicians,
  adminJobs,
  adminReports,
  databaseId,
  firebaseConsoleUrl,
  adminPortalUrl,
  onVerifyTechnician,
  onUpdateReport,
  onOpenBooking,
  onOpenAuth,
  onOpenJobDetail,
  onOpenInvoice,
  onOpenTechSetup,
  onOpenTechnicianDashboard,
  onToggleDuty,
}) => {
  const [historyOpen, setHistoryOpen] = useState(true);

  const activeTechJobs = myTechnicianJobs.filter(
    (j) =>
      j.status === 'accepted' ||
      j.status === 'en_route' ||
      j.status === 'arrived' ||
      j.status === 'in_progress'
  );
  const completedTechJobs = myTechnicianJobs.filter((j) => j.status === 'completed');

  return (
    <div className="space-y-8">
      {/* Segment Switcher */}
      <div className="flex items-center gap-2 p-2 rounded-2xl yn-glass-card">
        <button
          type="button"
          onClick={() => onChangeRoleView('customer')}
          className={`flex-1 min-h-[46px] px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
            activeRoleView === 'customer'
              ? 'yn-btn-saffron font-bold'
              : 'text-[#43564D] dark:text-[#9CB0A6] hover:text-[#18231E] dark:hover:text-[#FFFDF8]'
          }`}
        >
          My Bookings ({myCustomerJobs.length})
        </button>
        <button
          type="button"
          onClick={() => onChangeRoleView('technician')}
          className={`flex-1 min-h-[46px] px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
            activeRoleView === 'technician'
              ? 'yn-btn-emerald font-bold'
              : 'text-[#43564D] dark:text-[#9CB0A6] hover:text-[#18231E] dark:hover:text-[#FFFDF8]'
          }`}
        >
          Provider Jobs ({myTechnicianJobs.length})
        </button>
        {isAdmin ? (
          <button
            type="button"
            onClick={() => onChangeRoleView('admin')}
            className={`min-h-[46px] px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap inline-flex items-center gap-2 ${
              activeRoleView === 'admin'
                ? 'yn-btn-saffron font-bold'
                : 'text-[#E87516] dark:text-[#FF9933] hover:text-[#18231E] dark:hover:text-[#FFFDF8]'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Admin</span>
          </button>
        ) : null}
      </div>

      {/* Customer Bookings View */}
      {activeRoleView === 'customer' ? (
        <div className="rounded-2xl yn-glass-card yn-tricolor-border p-6 sm:p-7 space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1.5">
              <h2 className="text-xl font-bold font-display yn-tricolor-text">
                Customer Bookings
              </h2>
              <p className="text-xs sm:text-sm text-[#43564D] dark:text-[#9CB0A6]">
                Track live arrival steps, approve quotes, and download invoices
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenBooking}
              className="min-h-[44px] px-5 rounded-xl yn-btn-saffron text-xs sm:text-sm font-bold inline-flex items-center gap-2 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Book</span>
            </button>
          </div>

          {!authReady ? (
            <p className="text-sm text-[#43564D] dark:text-[#9CB0A6] py-10 text-center">Loading your bookings...</p>
          ) : !isSignedIn ? (
            <div className="rounded-2xl bg-[#E8EDF2]/80 dark:bg-[#07130F]/75 border border-[#075E36]/12 dark:border-white/[0.08] p-8 space-y-4 text-center">
              <p className="text-base font-semibold text-[#18231E] dark:text-[#FFFDF8]">
                Sign in to view your repair bookings
              </p>
              <p className="text-xs sm:text-sm text-[#43564D] dark:text-[#9CB0A6] max-w-md mx-auto leading-relaxed">
                Track arrival steps, chat privately with assigned technicians, and access digital invoices.
              </p>
              <button
                type="button"
                onClick={() => onOpenAuth('Sign in with Google to view your repair bookings.')}
                className="min-h-[46px] px-6 rounded-xl yn-btn-saffron text-xs sm:text-sm font-bold"
              >
                Sign In / Register
              </button>
            </div>
          ) : myCustomerJobs.length === 0 ? (
            <div className="rounded-2xl bg-[#E8EDF2]/80 dark:bg-[#07130F]/75 border border-[#075E36]/12 dark:border-white/[0.08] p-8 text-center space-y-4">
              <p className="text-base font-semibold text-[#18231E] dark:text-[#FFFDF8]">
                No repair bookings yet
              </p>
              <p className="text-xs sm:text-sm text-[#43564D] dark:text-[#9CB0A6] max-w-md mx-auto leading-relaxed">
                Need an AC, fan, washer, fridge, or electrical repair? Book in under 60 seconds.
              </p>
              <button
                type="button"
                onClick={onOpenBooking}
                className="min-h-[46px] px-6 rounded-xl yn-btn-saffron text-xs sm:text-sm font-bold"
              >
                Book Your First Service
              </button>
            </div>
          ) : (
            <div className="divide-y divide-[#075E36]/10 dark:divide-white/[0.08]">
              {myCustomerJobs.map((job) => {
                const needsQuoteApproval =
                  job.quotedFee > 0 &&
                  !job.priceApproved &&
                  job.status !== 'completed' &&
                  job.status !== 'cancelled' &&
                  job.status !== 'rejected';
                return (
                  <div
                    key={job.id}
                    className="py-5 first:pt-2 last:pb-2 flex items-center justify-between gap-4"
                  >
                    <button
                      type="button"
                      onClick={() => onOpenJobDetail(job)}
                      className="flex-1 min-w-0 text-left flex items-center gap-4 hover:opacity-90 transition-opacity"
                    >
                      <div className="w-12 h-12 rounded-xl bg-[#E8EDF2] dark:bg-[#07130F] border border-[#075E36]/15 dark:border-[#FF9933]/25 text-[#E87516] dark:text-[#FFB866] flex items-center justify-center shrink-0">
                        <CategoryIcon category={job.applianceCategory} className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 space-y-1">
                        <p className="text-sm font-bold text-[#18231E] dark:text-[#FFFDF8] truncate">
                          {job.issueTitle}
                        </p>
                        <p className="text-xs text-[#43564D] dark:text-[#9CB0A6] truncate">
                          <span className="font-semibold text-[#138808] dark:text-[#35C46A]">
                            {STATUS_LABELS[job.status]}
                          </span>
                          {job.technicianName ? ` · ${job.technicianName}` : ''}
                          {job.technicianEta ? ` · ETA ${job.technicianEta}` : ''}
                        </p>
                        {needsQuoteApproval ? (
                          <span className="inline-block pt-0.5 text-xs font-semibold text-[#E87516] dark:text-[#FFB866]">
                            Approve Quote ({formatMoney(job.quotedFee, job.currencyCode || currencyCode)})
                          </span>
                        ) : null}
                      </div>
                    </button>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className="text-sm font-bold text-[#18231E] dark:text-[#FFFDF8] tabular-nums">
                        {formatMoney(job.quotedFee || job.estimatedBudget, job.currencyCode || currencyCode)}
                      </span>
                      {job.status === 'completed' ? (
                        <button
                          type="button"
                          onClick={() => onOpenInvoice(job)}
                          className="min-h-[34px] px-2.5 rounded-lg text-xs font-semibold text-[#E87516] dark:text-[#FF9933] hover:bg-[#FF9933]/10 inline-flex items-center gap-1.5 transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Invoice</span>
                        </button>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : activeRoleView === 'technician' ? (
        /* Technician Workbench View */
        <div className="rounded-2xl yn-glass-card yn-tricolor-border p-6 sm:p-7 space-y-7">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1.5">
              <h2 className="text-xl font-bold font-display yn-tricolor-text">
                Service Provider Workbench
              </h2>
              <p className="text-xs sm:text-sm text-[#43564D] dark:text-[#9CB0A6]">
                Manage incoming jobs, duty availability, and earnings
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              {onOpenTechnicianDashboard ? (
                <button
                  type="button"
                  onClick={onOpenTechnicianDashboard}
                  className="min-h-[44px] px-4 rounded-xl yn-btn-saffron text-xs font-bold"
                >
                  Open Tech Dashboard
                </button>
              ) : null}
              {myTechProfile ? (
                <button
                  type="button"
                  onClick={onToggleDuty}
                  className={`min-h-[44px] px-4.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    myTechProfile.isAvailable
                      ? 'yn-btn-emerald'
                      : 'bg-[#E8EDF2] dark:bg-[#07130F] border border-[#075E36]/15 dark:border-white/[0.12] text-[#43564D] dark:text-[#9CB0A6] hover:text-[#18231E] dark:hover:text-[#FFFDF8]'
                  }`}
                >
                  {myTechProfile.isAvailable ? 'On Duty' : 'Off Duty'}
                </button>
              ) : null}
            </div>
          </div>

          {!isSignedIn ? (
            <div className="rounded-2xl bg-[#E8EDF2]/80 dark:bg-[#07130F]/75 border border-[#075E36]/12 dark:border-white/[0.08] p-8 space-y-4 text-center">
              <p className="text-base font-semibold text-[#18231E] dark:text-[#FFFDF8]">
                Become a Verified Service Provider
              </p>
              <p className="text-xs sm:text-sm text-[#43564D] dark:text-[#9CB0A6] max-w-md mx-auto leading-relaxed">
                Sign in to register your trade skills, accept local repair jobs, and track earnings.
              </p>
              <button
                type="button"
                onClick={() => onOpenAuth('Sign in with Google to open your Service Provider Workbench.')}
                className="min-h-[46px] px-6 rounded-xl yn-btn-emerald text-xs sm:text-sm font-bold"
              >
                Sign In as Provider
              </button>
            </div>
          ) : !myTechProfile ? (
            <div className="rounded-2xl bg-[#E8EDF2]/80 dark:bg-[#07130F]/75 border border-[#075E36]/12 dark:border-white/[0.08] p-8 space-y-4 text-center">
              <p className="text-base font-semibold text-[#18231E] dark:text-[#FFFDF8]">
                Activate Your Service Provider Profile
              </p>
              <p className="text-xs sm:text-sm text-[#43564D] dark:text-[#9CB0A6] max-w-md mx-auto leading-relaxed">
                Add your specialties, inspection fee, and phone verification to receive bookings.
              </p>
              <button
                type="button"
                onClick={onOpenTechSetup}
                className="min-h-[46px] px-6 rounded-xl yn-btn-emerald text-xs sm:text-sm font-bold"
              >
                Setup Provider Profile
              </button>
            </div>
          ) : (
            <div className="space-y-7">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#E8EDF2]/80 dark:bg-[#07130F]/75 border border-[#075E36]/12 dark:border-white/[0.08] px-5 py-3.5 text-xs sm:text-sm">
                <span className="font-semibold flex items-center gap-2.5 text-[#18231E] dark:text-[#FFFDF8]">
                  <BadgeCheck className="w-4 h-4 text-[#138808] dark:text-[#35C46A]" />
                  <span>
                    {myTechProfile.verificationStatus === 'verified'
                      ? 'Identity Verified Pro'
                      : myTechProfile.verificationStatus === 'pending'
                        ? 'ID Verification Pending'
                        : 'Standard Profile'}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={onOpenTechSetup}
                  className="min-h-[36px] px-2.5 text-xs font-semibold text-[#E87516] dark:text-[#FF9933] hover:underline"
                >
                  Edit Profile
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div className="rounded-2xl bg-[#E8EDF2]/80 dark:bg-[#07130F]/75 border border-[#075E36]/12 dark:border-white/[0.08] p-5 space-y-1.5">
                  <span className="block text-xs text-[#43564D] dark:text-[#9CB0A6]">Today Done</span>
                  <span className="text-xl font-bold text-[#138808] dark:text-[#35C46A] tabular-nums">
                    {todayCompletedCount}
                  </span>
                </div>
                <div className="rounded-2xl bg-[#E8EDF2]/80 dark:bg-[#07130F]/75 border border-[#075E36]/12 dark:border-white/[0.08] p-5 space-y-1.5">
                  <span className="block text-xs text-[#43564D] dark:text-[#9CB0A6]">Month Earnings</span>
                  <span className="text-xl font-bold text-[#E87516] dark:text-[#FFB866] tabular-nums inline-flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4" />
                    {formatMoney(monthlyEarnings, myTechProfile.currencyCode || currencyCode)}
                  </span>
                </div>
                <div className="rounded-2xl bg-[#E8EDF2]/80 dark:bg-[#07130F]/75 border border-[#075E36]/12 dark:border-white/[0.08] p-5 space-y-1.5">
                  <span className="block text-xs text-[#43564D] dark:text-[#9CB0A6]">Incoming</span>
                  <span className="text-xl font-bold text-[#18231E] dark:text-[#FFFDF8] tabular-nums">
                    {pendingRequestsForTech.length}
                  </span>
                </div>
                <div className="rounded-2xl bg-[#E8EDF2]/80 dark:bg-[#07130F]/75 border border-[#075E36]/12 dark:border-white/[0.08] p-5 space-y-1.5">
                  <span className="block text-xs text-[#43564D] dark:text-[#9CB0A6]">Rating</span>
                  <span className="text-xl font-bold text-[#E87516] dark:text-[#FFD28A] tabular-nums">
                    {myTechProfile.ratingAvg > 0 ? `${myTechProfile.ratingAvg} ★` : `${myTechFeedback.length} rev`}
                  </span>
                </div>
              </div>

              {pendingRequestsForTech.length > 0 ? (
                <div className="space-y-3.5">
                  <p className="text-xs sm:text-sm font-semibold text-[#E87516] dark:text-[#FFB866]">
                    Incoming Requests ({pendingRequestsForTech.length})
                  </p>
                  <div className="space-y-3">
                    {pendingRequestsForTech.slice(0, 5).map((job) => (
                      <div
                        key={job.id}
                        className="rounded-2xl border border-[#FF9933]/35 bg-[#E8EDF2]/80 dark:bg-[#07130F]/80 p-5 flex items-center justify-between gap-4"
                      >
                        <div className="min-w-0 space-y-1">
                          <p className="text-sm font-bold text-[#18231E] dark:text-[#FFFDF8] truncate">
                            {job.issueTitle}
                          </p>
                          <p className="text-xs text-[#43564D] dark:text-[#9CB0A6] truncate">
                            {job.customerName} · {job.neighborhood} ·{' '}
                            {formatMoney(job.estimatedBudget, job.currencyCode || currencyCode)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => onOpenJobDetail(job)}
                          className="min-h-[42px] px-4.5 rounded-xl yn-btn-saffron text-xs font-bold shrink-0"
                        >
                          Respond
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="space-y-4 pt-4 border-t border-[#075E36]/12 dark:border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setHistoryOpen((v) => !v)}
                  className="w-full min-h-[40px] flex items-center justify-between text-xs sm:text-sm font-semibold text-[#43564D] dark:text-[#9CB0A6] py-1.5"
                >
                  <span>
                    Job History ({activeTechJobs.length} active · {completedTechJobs.length} completed)
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      historyOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {historyOpen ? (
                  myTechnicianJobs.length === 0 ? (
                    <div className="rounded-2xl bg-[#E8EDF2]/80 dark:bg-[#07130F]/75 border border-[#075E36]/10 dark:border-white/[0.06] p-6 text-center text-xs sm:text-sm text-[#43564D] dark:text-[#9CB0A6]">
                      Claim an open request from Explore to start tracking jobs.
                    </div>
                  ) : (
                    <div className="divide-y divide-[#075E36]/10 dark:divide-white/[0.08]">
                      {myTechnicianJobs.map((job) => (
                        <button
                          key={job.id}
                          type="button"
                          onClick={() => onOpenJobDetail(job)}
                          className="w-full py-4.5 text-left flex items-center justify-between gap-4 hover:opacity-90 transition-opacity"
                        >
                          <div className="min-w-0 space-y-1">
                            <p className="text-sm font-semibold text-[#18231E] dark:text-[#FFFDF8] truncate">
                              {job.issueTitle}
                            </p>
                            <p className="text-xs text-[#43564D] dark:text-[#9CB0A6] truncate">
                              {job.customerName} · {job.neighborhood} · {STATUS_LABELS[job.status]}
                            </p>
                          </div>
                          <div className="text-right shrink-0 space-y-0.5">
                            <span className="block text-sm font-bold text-[#E87516] dark:text-[#FFB866] tabular-nums">
                              {formatMoney(job.quotedFee || job.estimatedBudget, job.currencyCode || currencyCode)}
                            </span>
                            {job.status === 'completed' ? (
                              <span className="text-[11px] text-[#138808] dark:text-[#35C46A] font-semibold inline-flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Paid
                              </span>
                            ) : null}
                          </div>
                        </button>
                      ))}
                    </div>
                  )
                ) : null}
              </div>
            </div>
          )}
        </div>
      ) : isAdmin ? (
        <AdminDashboardPanel
          users={adminUsers}
          loginRecords={adminLoginRecords}
          technicians={adminTechnicians}
          jobs={adminJobs}
          reports={adminReports}
          databaseId={databaseId}
          firebaseConsoleUrl={firebaseConsoleUrl}
          adminPortalUrl={adminPortalUrl}
          initialTab="records"
          onVerifyTechnician={onVerifyTechnician}
          onUpdateReport={onUpdateReport}
        />
      ) : null}
    </div>
  );
};
