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
    <div className="space-y-6">
      {/* Segment Switcher */}
      <div className="flex items-center gap-1 p-1.5 rounded-2xl bg-white dark:bg-[#141414] border border-black/[0.08] dark:border-white/[0.08]">
        <button
          type="button"
          onClick={() => onChangeRoleView('customer')}
          className={`flex-1 min-h-[42px] px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap ${
            activeRoleView === 'customer'
              ? 'bg-[#D6AE53] text-[#080808] font-bold'
              : 'text-[#595959] dark:text-[#A0A0A0] hover:text-white'
          }`}
        >
          My Bookings ({myCustomerJobs.length})
        </button>
        <button
          type="button"
          onClick={() => onChangeRoleView('technician')}
          className={`flex-1 min-h-[42px] px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap ${
            activeRoleView === 'technician'
              ? 'bg-[#D6AE53] text-[#080808] font-bold'
              : 'text-[#595959] dark:text-[#A0A0A0] hover:text-white'
          }`}
        >
          Provider Jobs ({myTechnicianJobs.length})
        </button>
        {isAdmin ? (
          <button
            type="button"
            onClick={() => onChangeRoleView('admin')}
            className={`min-h-[42px] px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap inline-flex items-center gap-1.5 ${
              activeRoleView === 'admin'
                ? 'bg-[#D6AE53] text-[#080808] font-bold'
                : 'text-[#D6AE53] hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Admin</span>
          </button>
        ) : null}
      </div>

      {/* Customer Bookings View */}
      {activeRoleView === 'customer' ? (
        <div className="rounded-2xl bg-white dark:bg-[#141414] border border-black/[0.08] dark:border-white/[0.08] p-6 space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-[#171717] dark:text-white font-display">
                Customer Bookings
              </h2>
              <p className="text-xs text-[#595959] dark:text-[#A0A0A0]">
                Track live arrival steps, approve quotes, and download invoices
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenBooking}
              className="min-h-[42px] px-4 rounded-xl bg-[#D6AE53] text-[#080808] text-xs font-bold inline-flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Book</span>
            </button>
          </div>

          {!authReady ? (
            <p className="text-sm text-[#A0A0A0] py-8 text-center">Loading your bookings...</p>
          ) : !isSignedIn ? (
            <div className="rounded-xl bg-[#F3EEE2] dark:bg-[#1C1C1C] p-6 space-y-3 text-center">
              <p className="text-sm font-semibold text-[#171717] dark:text-white">
                Sign in to view your repair bookings
              </p>
              <p className="text-xs text-[#595959] dark:text-[#A0A0A0] max-w-sm mx-auto">
                Track arrival steps, chat privately with assigned technicians, and access digital invoices.
              </p>
              <button
                type="button"
                onClick={() => onOpenAuth('Sign in with Google to view your repair bookings.')}
                className="min-h-[44px] px-5 rounded-xl bg-[#D6AE53] text-[#080808] text-xs font-bold"
              >
                Sign In / Register
              </button>
            </div>
          ) : myCustomerJobs.length === 0 ? (
            <div className="rounded-xl bg-[#F3EEE2] dark:bg-[#1C1C1C] p-6 text-center space-y-3">
              <p className="text-sm font-semibold text-[#171717] dark:text-white">
                No repair bookings yet
              </p>
              <p className="text-xs text-[#595959] dark:text-[#A0A0A0] max-w-sm mx-auto">
                Need an AC, fan, washer, fridge, or electrical repair? Book in under 60 seconds.
              </p>
              <button
                type="button"
                onClick={onOpenBooking}
                className="min-h-[44px] px-5 rounded-xl bg-[#D6AE53] text-[#080808] text-xs font-bold"
              >
                Book Your First Service
              </button>
            </div>
          ) : (
            <div className="divide-y divide-black/[0.06] dark:divide-white/[0.06]">
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
                    className="py-4 first:pt-2 last:pb-2 flex items-center justify-between gap-4"
                  >
                    <button
                      type="button"
                      onClick={() => onOpenJobDetail(job)}
                      className="flex-1 min-w-0 text-left flex items-center gap-3.5 hover:opacity-90 transition-opacity"
                    >
                      <div className="w-11 h-11 rounded-xl bg-[#F3EEE2] dark:bg-[#1C1C1C] text-[#D6AE53] flex items-center justify-center shrink-0">
                        <CategoryIcon category={job.applianceCategory} className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <p className="text-sm font-semibold text-[#171717] dark:text-white truncate">
                          {job.issueTitle}
                        </p>
                        <p className="text-xs text-[#595959] dark:text-[#A0A0A0] truncate">
                          <span className="font-semibold text-[#D6AE53]">
                            {STATUS_LABELS[job.status]}
                          </span>
                          {job.technicianName ? ` · ${job.technicianName}` : ''}
                          {job.technicianEta ? ` · ETA ${job.technicianEta}` : ''}
                        </p>
                        {needsQuoteApproval ? (
                          <span className="inline-block pt-0.5 text-xs font-semibold text-[#D6AE53]">
                            Approve Quote ({formatMoney(job.quotedFee, job.currencyCode || currencyCode)})
                          </span>
                        ) : null}
                      </div>
                    </button>

                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span className="text-xs font-bold text-[#171717] dark:text-white tabular-nums">
                        {formatMoney(job.quotedFee || job.estimatedBudget, job.currencyCode || currencyCode)}
                      </span>
                      {job.status === 'completed' ? (
                        <button
                          type="button"
                          onClick={() => onOpenInvoice(job)}
                          className="text-xs font-semibold text-[#D6AE53] hover:underline inline-flex items-center gap-1"
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
        <div className="rounded-2xl bg-white dark:bg-[#141414] border border-black/[0.08] dark:border-white/[0.08] p-6 space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-[#171717] dark:text-white font-display">
                Service Provider Workbench
              </h2>
              <p className="text-xs text-[#595959] dark:text-[#A0A0A0]">
                Manage incoming jobs, duty availability, and earnings
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {onOpenTechnicianDashboard ? (
                <button
                  type="button"
                  onClick={onOpenTechnicianDashboard}
                  className="min-h-[40px] px-3.5 rounded-xl bg-[#D6AE53] text-[#080808] text-xs font-bold hover:brightness-105 transition-all"
                >
                  Open Tech Dashboard
                </button>
              ) : null}
              {myTechProfile ? (
                <button
                  type="button"
                  onClick={onToggleDuty}
                  className={`min-h-[40px] px-4 rounded-xl text-xs font-bold transition-colors shrink-0 ${
                    myTechProfile.isAvailable
                      ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                      : 'bg-[#1C1C1C] text-[#A0A0A0] hover:text-white'
                  }`}
                >
                  {myTechProfile.isAvailable ? 'On Duty' : 'Off Duty'}
                </button>
              ) : null}
            </div>
          </div>

          {!isSignedIn ? (
            <div className="rounded-xl bg-[#F3EEE2] dark:bg-[#1C1C1C] p-6 space-y-3 text-center">
              <p className="text-sm font-semibold text-[#171717] dark:text-white">
                Become a Verified Service Provider
              </p>
              <p className="text-xs text-[#595959] dark:text-[#A0A0A0] max-w-sm mx-auto">
                Sign in to register your trade skills, accept local repair jobs, and track earnings.
              </p>
              <button
                type="button"
                onClick={() => onOpenAuth('Sign in with Google to open your Service Provider Workbench.')}
                className="min-h-[44px] px-5 rounded-xl bg-[#D6AE53] text-[#080808] text-xs font-bold"
              >
                Sign In as Provider
              </button>
            </div>
          ) : !myTechProfile ? (
            <div className="rounded-xl bg-[#F3EEE2] dark:bg-[#1C1C1C] p-6 space-y-3 text-center">
              <p className="text-sm font-semibold text-[#171717] dark:text-white">
                Activate Your Service Provider Profile
              </p>
              <p className="text-xs text-[#595959] dark:text-[#A0A0A0] max-w-sm mx-auto">
                Add your specialties, inspection fee, and phone verification to receive bookings.
              </p>
              <button
                type="button"
                onClick={onOpenTechSetup}
                className="min-h-[44px] px-5 rounded-xl bg-[#D6AE53] text-[#080808] text-xs font-bold"
              >
                Setup Provider Profile
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#F3EEE2] dark:bg-[#1C1C1C] px-4 py-3 text-xs">
                <span className="font-semibold flex items-center gap-2 text-[#171717] dark:text-white">
                  <BadgeCheck className="w-4 h-4 text-[#D6AE53]" />
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
                  className="text-xs font-semibold text-[#D6AE53] hover:underline"
                >
                  Edit Profile
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="rounded-xl bg-[#F3EEE2] dark:bg-[#1C1C1C] p-4 space-y-1">
                  <span className="block text-xs text-[#A0A0A0]">Today Done</span>
                  <span className="text-lg font-bold text-[#171717] dark:text-white tabular-nums">
                    {todayCompletedCount}
                  </span>
                </div>
                <div className="rounded-xl bg-[#F3EEE2] dark:bg-[#1C1C1C] p-4 space-y-1">
                  <span className="block text-xs text-[#A0A0A0]">Month Earnings</span>
                  <span className="text-lg font-bold text-[#D6AE53] tabular-nums inline-flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    {formatMoney(monthlyEarnings, myTechProfile.currencyCode || currencyCode)}
                  </span>
                </div>
                <div className="rounded-xl bg-[#F3EEE2] dark:bg-[#1C1C1C] p-4 space-y-1">
                  <span className="block text-xs text-[#A0A0A0]">Incoming</span>
                  <span className="text-lg font-bold text-[#171717] dark:text-white tabular-nums">
                    {pendingRequestsForTech.length}
                  </span>
                </div>
                <div className="rounded-xl bg-[#F3EEE2] dark:bg-[#1C1C1C] p-4 space-y-1">
                  <span className="block text-xs text-[#A0A0A0]">Rating</span>
                  <span className="text-lg font-bold text-[#D6AE53] tabular-nums">
                    {myTechProfile.ratingAvg > 0 ? `${myTechProfile.ratingAvg} ★` : `${myTechFeedback.length} rev`}
                  </span>
                </div>
              </div>

              {pendingRequestsForTech.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-[#D6AE53]">
                    Incoming Requests ({pendingRequestsForTech.length})
                  </p>
                  <div className="space-y-2.5">
                    {pendingRequestsForTech.slice(0, 5).map((job) => (
                      <div
                        key={job.id}
                        className="rounded-xl border border-[#D6AE53]/35 bg-[#F3EEE2] dark:bg-[#1C1C1C] p-4 flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0 space-y-0.5">
                          <p className="text-xs font-bold text-[#171717] dark:text-white truncate">
                            {job.issueTitle}
                          </p>
                          <p className="text-xs text-[#595959] dark:text-[#A0A0A0] truncate">
                            {job.customerName} · {job.neighborhood} ·{' '}
                            {formatMoney(job.estimatedBudget, job.currencyCode || currencyCode)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => onOpenJobDetail(job)}
                          className="min-h-[38px] px-4 rounded-xl bg-[#D6AE53] text-[#080808] text-xs font-bold shrink-0"
                        >
                          Respond
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="space-y-3 pt-2 border-t border-black/[0.06] dark:border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setHistoryOpen((v) => !v)}
                  className="w-full flex items-center justify-between text-xs font-semibold text-[#595959] dark:text-[#A0A0A0] py-1"
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
                    <div className="rounded-xl bg-[#F3EEE2] dark:bg-[#1C1C1C] p-4 text-center text-xs text-[#A0A0A0]">
                      Claim an open request from Explore to start tracking jobs.
                    </div>
                  ) : (
                    <div className="divide-y divide-black/[0.06] dark:divide-white/[0.06]">
                      {myTechnicianJobs.map((job) => (
                        <button
                          key={job.id}
                          type="button"
                          onClick={() => onOpenJobDetail(job)}
                          className="w-full py-3.5 text-left flex items-center justify-between gap-4 hover:opacity-90"
                        >
                          <div className="min-w-0 space-y-0.5">
                            <p className="text-sm font-semibold text-[#171717] dark:text-white truncate">
                              {job.issueTitle}
                            </p>
                            <p className="text-xs text-[#A0A0A0] truncate">
                              {job.customerName} · {job.neighborhood} · {STATUS_LABELS[job.status]}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="block text-xs font-bold text-[#D6AE53] tabular-nums">
                              {formatMoney(job.quotedFee || job.estimatedBudget, job.currencyCode || currencyCode)}
                            </span>
                            {job.status === 'completed' ? (
                              <span className="text-[11px] text-emerald-500 font-semibold inline-flex items-center gap-0.5">
                                <CheckCircle2 className="w-3 h-3" /> Paid
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
