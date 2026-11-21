import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertOctagon,
  BadgeCheck,
  Briefcase,
  Building2,
  Check,
  CheckCircle2,
  Copy,
  Database,
  Download,
  ExternalLink,
  Mail,
  Phone,
  Search,
  Shield,
  Users,
  XCircle,
} from 'lucide-react';
import {
  CATEGORY_SHORT_MAP,
  formatTimestamp,
  STATUS_LABELS,
  VERIFICATION_LABELS,
} from '../constants';
import { formatMoney } from '../i18n/regions';
import {
  AccountCategory,
  LoginRecord,
  RepairJob,
  ReportComplaint,
  ReportStatus,
  TechnicianProfile,
  UserProfile,
  VerificationStatus,
} from '../types';

type AdminTab = 'records' | 'technicians' | 'reports' | 'users' | 'jobs';

interface AdminDashboardPanelProps {
  users: UserProfile[];
  loginRecords: LoginRecord[];
  technicians: TechnicianProfile[];
  jobs: RepairJob[];
  reports: ReportComplaint[];
  databaseId: string;
  firebaseConsoleUrl: string;
  adminPortalUrl: string;
  initialTab?: AdminTab;
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
}

function escapeCsvCell(val: unknown): string {
  const s = String(val ?? '').replace(/\r?\n/g, ' ');
  if (/[",]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export const AdminDashboardPanel: React.FC<AdminDashboardPanelProps> = ({
  users,
  loginRecords,
  technicians,
  jobs,
  reports,
  databaseId,
  firebaseConsoleUrl,
  adminPortalUrl,
  initialTab = 'records',
  onVerifyTechnician,
  onUpdateReport,
}) => {
  const [adminTab, setAdminTab] = useState<AdminTab>(initialTab);
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | AccountCategory>('all');
  const [copiedUrl, setCopiedUrl] = useState(false);

  useEffect(() => {
    setAdminTab(initialTab);
  }, [initialTab]);

  const openReportsCount = reports.filter(
    (r) => r.status === 'open' || r.status === 'investigating'
  ).length;
  const pendingVerifyCount = technicians.filter(
    (t) => t.verificationStatus !== 'verified'
  ).length;

  const filteredRecords = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return loginRecords.filter((rec) => {
      if (typeFilter !== 'all' && rec.accountType !== typeFilter) return false;
      if (!q) return true;
      const hay = `${rec.displayName} ${rec.email} ${rec.phone} ${rec.organizationName} ${rec.neighborhood} ${rec.countryCode}`.toLowerCase();
      return hay.includes(q);
    });
  }, [loginRecords, searchTerm, typeFilter]);

  const phonesSavedCount = useMemo(
    () => loginRecords.filter((r) => Boolean(r.phone && r.phone.trim())).length,
    [loginRecords]
  );
  const orgCount = useMemo(
    () =>
      loginRecords.filter(
        (r) => r.accountType === 'organization' || Boolean(r.organizationName?.trim())
      ).length,
    [loginRecords]
  );

  const handleCopyPortalUrl = async () => {
    try {
      await navigator.clipboard.writeText(adminPortalUrl);
      setCopiedUrl(true);
      window.setTimeout(() => setCopiedUrl(false), 2000);
    } catch {
      // Clipboard blocked in restricted context
    }
  };

  const handleExportCsv = () => {
    const header = [
      'Display Name',
      'Email',
      'Phone Number',
      'Account Type',
      'Organization',
      'Marketplace Role',
      'City / Area',
      'Country',
      'Total Logins',
      'Last Login',
    ];
    const rows = filteredRecords.map((r) => [
      escapeCsvCell(r.displayName),
      escapeCsvCell(r.email),
      escapeCsvCell(r.phone || ''),
      escapeCsvCell(r.accountType),
      escapeCsvCell(r.organizationName || ''),
      escapeCsvCell(r.role),
      escapeCsvCell(r.neighborhood),
      escapeCsvCell(r.countryCode),
      escapeCsvCell(r.loginCount),
      escapeCsvCell(formatTimestamp(r.lastLoginAt || r.updatedAt)),
    ]);
    const csv = [header.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `your-need-saved-logins-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <section
      id="admin-dashboard"
      className="bg-white/95 dark:bg-[#171717]/90 backdrop-blur-md border border-[#D6A84F]/40 dark:border-[#D6A84F]/35 rounded-2xl p-5 sm:p-6 space-y-5 shadow-sm"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E8DFC8] dark:border-[#2E2E2E]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#171717] text-[#D6A84F] flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[#171717] dark:text-white font-display">
              Admin Operations &amp; Saved Directory
            </h2>
            <p className="text-xs text-[#595959] dark:text-[#B5ADA0]">
              View every saved email, phone number, customer, technician, and organization login record
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          <span className="px-3 py-1.5 rounded-xl bg-[#FFFDF7] dark:bg-[#D6A84F]/15 text-[#8F6412] dark:text-[#D6A84F] font-semibold">
            {loginRecords.length} Logins · {users.length} Profiles
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-500/15 text-amber-800 dark:text-amber-200 font-semibold">
            {pendingVerifyCount} Pending Verify
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-500/15 text-rose-800 dark:text-rose-200 font-semibold">
            {openReportsCount} Open Reports
          </span>
        </div>
      </div>

      {/* Sub-navigation */}
      <div className="flex flex-wrap gap-2">
        {(
          [
            {
              id: 'records',
              label: `Saved Emails & Numbers (${loginRecords.length})`,
              icon: Database,
            },
            {
              id: 'technicians',
              label: `Tech Verification (${technicians.length})`,
              icon: BadgeCheck,
            },
            {
              id: 'reports',
              label: `Complaints & Reports (${reports.length})`,
              icon: AlertOctagon,
            },
            { id: 'users', label: `Users (${users.length})`, icon: Users },
            { id: 'jobs', label: `All Bookings (${jobs.length})`, icon: Briefcase },
          ] as const
        ).map((tab) => {
          const Icon = tab.icon;
          const active = adminTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setAdminTab(tab.id)}
              className={`min-h-[42px] px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-colors ${
                active
                  ? 'bg-[#171717] border-[#171717] text-white dark:bg-[#D6A84F] dark:border-[#D6A84F] dark:text-[#171717]'
                  : 'bg-slate-50 dark:bg-[#121212] border-[#E8DFC8] dark:border-[#2E2E2E] text-[#292929] dark:text-[#E8E2D5]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {adminTab === 'records' ? (
        <div className="space-y-4">
          {/* Direct Admin Records & Firestore Console Links */}
          <div className="rounded-xl border border-[#D6A84F]/45 bg-[#FFFDF7] dark:bg-[#0D0D0D] p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="space-y-1 min-w-0">
              <p className="text-xs font-bold text-[#8F6412] dark:text-[#D6A84F] flex items-center gap-1.5">
                <Database className="w-4 h-4 shrink-0" />
                <span>Live Cloud Firestore Database: {databaseId}</span>
              </p>
              <p className="text-xs text-[#292929] dark:text-[#DDD6C7] break-all">
                Saved Directory URL:{' '}
                <span className="font-semibold text-[#8F6412] dark:text-[#F3D999]">
                  {adminPortalUrl}
                </span>
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleCopyPortalUrl}
                className="min-h-[38px] px-3 py-1.5 rounded-xl border border-[#D8CEB4] dark:border-[#2E2E2E] bg-white dark:bg-[#171717] text-xs font-semibold text-[#171717] dark:text-[#FFFDF7] hover:border-[#D6A84F] flex items-center gap-1.5"
              >
                {copiedUrl ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#D6A84F]" />
                    <span>Copied URL</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#D6A84F]" />
                    <span>Copy Portal URL</span>
                  </>
                )}
              </button>
              <a
                href={firebaseConsoleUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[38px] px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#D6A84F] to-[#F3D999] text-[#08080A] text-xs font-bold hover:brightness-105 flex items-center gap-1.5"
              >
                <span>Open Firebase Database</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Summary KPI Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl border border-[#E8DFC8] dark:border-[#2E2E2E] bg-white dark:bg-[#121212] p-3">
              <p className="text-[11px] font-medium text-[#595959] dark:text-[#B5ADA0]">
                Total Saved Logins
              </p>
              <p className="text-xl font-bold text-[#171717] dark:text-white tabular-nums mt-0.5">
                {loginRecords.length}
              </p>
            </div>
            <div className="rounded-xl border border-[#E8DFC8] dark:border-[#2E2E2E] bg-white dark:bg-[#121212] p-3">
              <p className="text-[11px] font-medium text-[#595959] dark:text-[#B5ADA0]">
                Verified Emails
              </p>
              <p className="text-xl font-bold text-[#8F6412] dark:text-[#F3D999] tabular-nums mt-0.5">
                {loginRecords.filter((r) => Boolean(r.email)).length}
              </p>
            </div>
            <div className="rounded-xl border border-[#E8DFC8] dark:border-[#2E2E2E] bg-white dark:bg-[#121212] p-3">
              <p className="text-[11px] font-medium text-[#595959] dark:text-[#B5ADA0]">
                Phone Numbers Saved
              </p>
              <p className="text-xl font-bold text-[#8F6412] dark:text-[#D6A84F] tabular-nums mt-0.5">
                {phonesSavedCount}
              </p>
            </div>
            <div className="rounded-xl border border-[#E8DFC8] dark:border-[#2E2E2E] bg-white dark:bg-[#121212] p-3">
              <p className="text-[11px] font-medium text-[#595959] dark:text-[#B5ADA0]">
                Organizations
              </p>
              <p className="text-xl font-bold text-[#8F6412] dark:text-[#D6A84F] tabular-nums mt-0.5">
                {orgCount}
              </p>
            </div>
          </div>

          {/* Search, Type Filter & CSV Download */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#8F6412] dark:text-[#D6A84F] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, email, phone number, organization, or city..."
                className="w-full min-h-[40px] pl-9 pr-3 py-1.5 rounded-xl border border-[#D8CEB4] dark:border-[#2E2E2E] bg-white dark:bg-[#121212] text-xs text-[#171717] dark:text-[#FFFDF7]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {(['all', 'customer', 'technician', 'organization'] as const).map((tOpt) => (
                <button
                  key={tOpt}
                  type="button"
                  onClick={() => setTypeFilter(tOpt)}
                  className={`min-h-[36px] px-2.5 py-1 rounded-xl text-xs font-semibold capitalize border transition-colors ${
                    typeFilter === tOpt
                      ? 'bg-[#171717] border-[#171717] text-white dark:bg-[#D6A84F] dark:border-[#D6A84F] dark:text-[#171717]'
                      : 'border-[#E8DFC8] dark:border-[#2E2E2E] text-[#595959] dark:text-[#B5ADA0]'
                  }`}
                >
                  {tOpt}
                </button>
              ))}
              <button
                type="button"
                onClick={handleExportCsv}
                disabled={filteredRecords.length === 0}
                className="min-h-[36px] px-3 py-1 rounded-xl bg-gradient-to-r from-[#D6A84F] to-[#F3D999] text-[#08080A] text-xs font-bold hover:brightness-105 disabled:opacity-50 flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Saved Logins List */}
          {filteredRecords.length === 0 ? (
            <div className="rounded-xl border border-[#E8DFC8] dark:border-[#2E2E2E] p-6 text-center space-y-1">
              <p className="text-sm font-semibold text-[#171717] dark:text-white">
                No matching saved login records yet
              </p>
              <p className="text-xs text-[#595959] dark:text-[#B5ADA0]">
                Every person, customer, technician, or organization who signs in automatically appears here with their email, phone number, and timestamps.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredRecords.map((rec) => (
                <div
                  key={rec.uid}
                  className="rounded-xl border border-[#E8DFC8] dark:border-[#2E2E2E] bg-slate-50/70 dark:bg-[#121212]/60 p-3.5 flex flex-col lg:flex-row lg:items-center justify-between gap-3"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-[#171717] dark:text-white">
                        {rec.displayName}
                      </span>
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded-lg font-semibold capitalize ${
                          rec.accountType === 'organization'
                            ? 'bg-[#D6A84F]/25 text-[#8F6412] dark:text-[#F3D999]'
                            : rec.accountType === 'technician'
                              ? 'bg-[#D6A84F]/15 text-[#8F6412] dark:text-[#D6A84F]'
                              : 'bg-[#171717]/10 dark:bg-white/10 text-[#171717] dark:text-[#F4ECE0]'
                        }`}
                      >
                        {rec.accountType}
                      </span>
                      {rec.organizationName ? (
                        <span className="text-[11px] px-2 py-0.5 rounded-lg bg-white dark:bg-[#171717] border border-[#E8DFC8] dark:border-[#2E2E2E] text-[#171717] dark:text-[#FFFDF7] font-medium flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-[#D6A84F]" />
                          <span>{rec.organizationName}</span>
                        </span>
                      ) : null}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                      <a
                        href={`mailto:${rec.email}`}
                        className="text-[#8F6412] dark:text-[#F3D999] font-medium hover:underline flex items-center gap-1 break-all"
                      >
                        <Mail className="w-3.5 h-3.5 shrink-0" />
                        <span>{rec.email}</span>
                      </a>
                      {rec.phone ? (
                        <a
                          href={`tel:${rec.phone}`}
                          className="text-[#171717] dark:text-[#FFFDF7] font-semibold tabular-nums hover:underline flex items-center gap-1"
                        >
                          <Phone className="w-3.5 h-3.5 text-[#D6A84F] shrink-0" />
                          <span>{rec.phone}</span>
                        </a>
                      ) : (
                        <span className="text-[#7A7367] dark:text-[#8E877C] flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 shrink-0" />
                          <span>Phone not entered yet</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-left lg:text-right text-[11px] text-[#595959] dark:text-[#B5ADA0] shrink-0 space-y-0.5">
                    <p className="font-medium text-[#292929] dark:text-[#DDD6C7]">
                      {rec.neighborhood} ({rec.countryCode}) · Role: {rec.role}
                    </p>
                    <p className="tabular-nums">
                      Login #{rec.loginCount} · Last seen {formatTimestamp(rec.lastLoginAt || rec.updatedAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}

      {adminTab === 'technicians' ? (
        <div className="space-y-3">
          {technicians.length === 0 ? (
            <p className="text-sm text-[#595959] py-4 text-center">No technician profiles registered yet.</p>
          ) : (
            technicians.map((tech) => {
              const vStatus = tech.verificationStatus || 'unverified';
              return (
                <div
                  key={tech.uid}
                  className="rounded-xl border border-[#E8DFC8] dark:border-[#2E2E2E] bg-slate-50/70 dark:bg-[#121212]/50 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-[#171717] dark:text-white">
                        {tech.displayName}
                      </span>
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded-lg font-semibold ${
                          vStatus === 'verified'
                            ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300'
                            : vStatus === 'pending'
                              ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300'
                              : 'bg-slate-200 dark:bg-[#262626] text-[#292929] dark:text-[#DDD6C7]'
                        }`}
                      >
                        {VERIFICATION_LABELS[vStatus]}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded-lg bg-[#FFFDF7] dark:bg-[#D6A84F]/20 text-[#8F6412] dark:text-[#D6A84F] font-medium">
                        {tech.phoneVerified ? 'Phone Verified' : 'Phone Unverified'}
                      </span>
                      {!tech.isPublic ? (
                        <span className="text-[11px] px-2 py-0.5 rounded-lg bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 font-semibold">
                          Suspended / Hidden
                        </span>
                      ) : null}
                    </div>
                    <p className="text-xs text-[#292929] dark:text-[#DDD6C7]">
                      {tech.neighborhood} ({tech.countryCode}) · {tech.yearsExperience || 0} yrs exp ·{' '}
                      {tech.idType ? `${tech.idType} ****${tech.idLast4 || ''}` : 'No ID submitted'}
                    </p>
                    <p className="text-xs text-[#595959] dark:text-[#B5ADA0] truncate">
                      Skills: {tech.specialties.join(', ')}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      type="button"
                      disabled={busyId === tech.uid}
                      onClick={async () => {
                        setBusyId(tech.uid);
                        try {
                          await onVerifyTechnician(tech.uid, 'verified', true);
                        } finally {
                          setBusyId(null);
                        }
                      }}
                      className="min-h-[40px] px-3 py-1.5 rounded-xl bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve Verify</span>
                    </button>
                    <button
                      type="button"
                      disabled={busyId === tech.uid}
                      onClick={async () => {
                        setBusyId(tech.uid);
                        try {
                          await onVerifyTechnician(tech.uid, 'unverified', !tech.isPublic);
                        } finally {
                          setBusyId(null);
                        }
                      }}
                      className="min-h-[40px] px-3 py-1.5 rounded-xl border border-rose-300 dark:border-rose-700 text-rose-700 dark:text-rose-300 text-xs font-semibold hover:bg-rose-50 dark:hover:bg-rose-500/15 flex items-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>{tech.isPublic ? 'Suspend' : 'Restore'}</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : null}

      {adminTab === 'reports' ? (
        <div className="space-y-3">
          {reports.length === 0 ? (
            <p className="text-sm text-[#595959] py-4 text-center">No user complaints or suspicious account reports yet.</p>
          ) : (
            reports.map((rep) => (
              <div
                key={rep.id}
                className="rounded-xl border border-[#E8DFC8] dark:border-[#2E2E2E] bg-slate-50/70 dark:bg-[#121212]/50 p-4 space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wide text-rose-700 dark:text-rose-400">
                      {rep.reason.replace('_', ' ')} · {rep.targetType}
                    </span>
                    <h3 className="text-sm font-bold text-[#171717] dark:text-white">
                      Target: {rep.targetName} (by {rep.reporterName})
                    </h3>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-white dark:bg-[#171717] border border-[#E8DFC8] dark:border-[#2E2E2E]">
                    {rep.status.toUpperCase()} · {formatTimestamp(rep.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-[#292929] dark:text-[#DDD6C7]">{rep.details}</p>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    maxLength={300}
                    value={noteDrafts[rep.id] ?? rep.adminNote ?? ''}
                    onChange={(e) =>
                      setNoteDrafts((prev) => ({ ...prev, [rep.id]: e.target.value }))
                    }
                    placeholder="Admin resolution / refund note..."
                    className="flex-1 min-h-[40px] px-3 py-1.5 rounded-xl border border-[#D8CEB4] dark:border-[#292929] bg-white dark:bg-[#171717] text-xs text-[#171717] dark:text-[#FFFDF7]"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={busyId === rep.id}
                      onClick={async () => {
                        setBusyId(rep.id);
                        try {
                          await onUpdateReport(
                            rep.id,
                            'resolved',
                            noteDrafts[rep.id] ?? rep.adminNote ?? 'Resolved by admin.'
                          );
                        } finally {
                          setBusyId(null);
                        }
                      }}
                      className="min-h-[40px] px-3 py-1.5 rounded-xl bg-emerald-700 text-white text-xs font-semibold"
                    >
                      Mark Resolved
                    </button>
                    <button
                      type="button"
                      disabled={busyId === rep.id}
                      onClick={async () => {
                        setBusyId(rep.id);
                        try {
                          await onUpdateReport(
                            rep.id,
                            'dismissed',
                            noteDrafts[rep.id] ?? rep.adminNote ?? 'Dismissed after review.'
                          );
                        } finally {
                          setBusyId(null);
                        }
                      }}
                      className="min-h-[40px] px-3 py-1.5 rounded-xl border border-[#D8CEB4] dark:border-[#292929] text-xs font-semibold text-[#292929] dark:text-[#E8E2D5]"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : null}

      {adminTab === 'users' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {users.map((u) => {
            const matchedLogin = loginRecords.find((lr) => lr.uid === u.uid);
            return (
              <div
                key={u.uid}
                className="rounded-xl border border-[#E8DFC8] dark:border-[#2E2E2E] bg-slate-50/70 dark:bg-[#121212]/50 p-3.5 text-xs space-y-1"
              >
                <p className="text-sm font-bold text-[#171717] dark:text-white truncate">{u.displayName}</p>
                <p className="text-[#292929] dark:text-[#DDD6C7] truncate">
                  Role: {u.role} · {u.neighborhood} ({u.countryCode || 'Global'})
                </p>
                {matchedLogin?.email ? (
                  <p className="text-[#8F6412] dark:text-[#F3D999] truncate">{matchedLogin.email}</p>
                ) : null}
                {matchedLogin?.phone ? (
                  <p className="text-[#171717] dark:text-[#FFFDF7] font-semibold tabular-nums truncate">
                    {matchedLogin.phone}
                  </p>
                ) : null}
                <p className="text-slate-400 truncate">UID: {u.uid.slice(0, 14)}...</p>
              </div>
            );
          })}
        </div>
      ) : null}

      {adminTab === 'jobs' ? (
        <div className="space-y-2.5">
          {jobs.slice(0, 20).map((j) => (
            <div
              key={j.id}
              className="rounded-xl border border-[#E8DFC8] dark:border-[#2E2E2E] bg-slate-50/70 dark:bg-[#121212]/50 p-3.5 flex items-center justify-between gap-3 text-xs"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#171717] dark:text-white truncate">{j.issueTitle}</p>
                <p className="text-[#595959] dark:text-[#B5ADA0] truncate">
                  {CATEGORY_SHORT_MAP[j.applianceCategory]} · {j.customerName} → {j.technicianName || 'Unassigned'} · {STATUS_LABELS[j.status]}
                </p>
              </div>
              <span className="tabular-nums font-bold text-[#171717] dark:text-white shrink-0">
                {formatMoney(j.quotedFee || j.estimatedBudget, j.currencyCode || 'USD')}
              </span>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
};
