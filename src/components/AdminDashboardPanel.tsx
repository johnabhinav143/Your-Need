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
      className="yn-glass-card yn-tricolor-border rounded-2xl p-6 sm:p-8 space-y-7 shadow-xl"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#075E36]/15 dark:border-white/[0.1]">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#FF9933] via-[#FFFDF8] to-[#138808] p-[1.5px] shrink-0">
            <div className="w-full h-full rounded-[10px] bg-[#071B16] text-[#FF9933] flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-0.5">
            <h2 className="text-lg sm:text-xl font-bold font-display yn-tricolor-text">
              Admin Operations &amp; Saved Directory
            </h2>
            <p className="text-xs sm:text-sm text-[#43564D] dark:text-[#9CB0A6]">
              View every saved email, phone number, customer, technician, and organization login record
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5 text-xs">
          <span className="px-3.5 py-2 rounded-xl bg-[#138808]/12 dark:bg-[#35C46A]/15 border border-[#138808]/25 text-[#138808] dark:text-[#7DFF9B] font-semibold">
            {loginRecords.length} Logins · {users.length} Profiles
          </span>
          <span className="px-3.5 py-2 rounded-xl bg-[#FF9933]/14 dark:bg-[#FF9933]/18 border border-[#FF9933]/30 text-[#E87516] dark:text-[#FFD28A] font-semibold">
            {pendingVerifyCount} Pending Verify
          </span>
          <span className="px-3.5 py-2 rounded-xl bg-rose-500/12 border border-rose-500/25 text-rose-700 dark:text-rose-300 font-semibold">
            {openReportsCount} Open Reports
          </span>
        </div>
      </div>

      {/* Sub-navigation */}
      <div className="flex flex-wrap gap-2.5">
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
              className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all whitespace-nowrap shrink-0 ${
                active
                  ? 'yn-btn-saffron border-[#FF9933]'
                  : 'bg-[#E8EDF2]/80 dark:bg-[#07130F]/80 border-[#075E36]/15 dark:border-white/[0.1] text-[#18231E] dark:text-[#E8EDF2] hover:border-[#FF9933]/45'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {adminTab === 'records' ? (
        <div className="space-y-5">
          {/* Direct Admin Records & Firestore Console Links */}
          <div className="rounded-2xl border border-[#FF9933]/35 bg-[#E8EDF2]/85 dark:bg-[#07130F]/85 p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1.5 min-w-0">
              <p className="text-xs sm:text-sm font-bold text-[#E87516] dark:text-[#FFB866] flex items-center gap-2">
                <Database className="w-4 h-4 shrink-0" />
                <span>Live Cloud Firestore Database: {databaseId}</span>
              </p>
              <p className="text-xs text-[#18231E]/85 dark:text-[#E8EDF2]/85 break-all">
                Saved Directory URL:{' '}
                <span className="font-semibold text-[#138808] dark:text-[#7DFF9B]">
                  {adminPortalUrl}
                </span>
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={handleCopyPortalUrl}
                className="min-h-[42px] px-4 py-2 rounded-xl border border-[#075E36]/20 dark:border-white/[0.14] bg-[#FFFDF8] dark:bg-[#071B16] text-xs font-semibold text-[#18231E] dark:text-[#FFFDF8] hover:border-[#FF9933] flex items-center gap-2"
              >
                {copiedUrl ? (
                  <>
                    <Check className="w-4 h-4 text-[#138808] dark:text-[#35C46A]" />
                    <span>Copied URL</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-[#E87516] dark:text-[#FF9933]" />
                    <span>Copy Portal URL</span>
                  </>
                )}
              </button>
              <a
                href={firebaseConsoleUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[42px] px-4 py-2 rounded-xl yn-btn-saffron text-xs font-bold flex items-center gap-2"
              >
                <span>Open Firebase Database</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Summary KPI Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-[#075E36]/15 dark:border-white/[0.08] bg-[#E8EDF2]/75 dark:bg-[#07130F]/75 p-4 space-y-1">
              <p className="text-xs font-medium text-[#43564D] dark:text-[#9CB0A6]">
                Total Saved Logins
              </p>
              <p className="text-2xl font-bold text-[#18231E] dark:text-[#FFFDF8] tabular-nums">
                {loginRecords.length}
              </p>
            </div>
            <div className="rounded-2xl border border-[#075E36]/15 dark:border-white/[0.08] bg-[#E8EDF2]/75 dark:bg-[#07130F]/75 p-4 space-y-1">
              <p className="text-xs font-medium text-[#43564D] dark:text-[#9CB0A6]">
                Verified Emails
              </p>
              <p className="text-2xl font-bold text-[#138808] dark:text-[#35C46A] tabular-nums">
                {loginRecords.filter((r) => Boolean(r.email)).length}
              </p>
            </div>
            <div className="rounded-2xl border border-[#075E36]/15 dark:border-white/[0.08] bg-[#E8EDF2]/75 dark:bg-[#07130F]/75 p-4 space-y-1">
              <p className="text-xs font-medium text-[#43564D] dark:text-[#9CB0A6]">
                Phone Numbers Saved
              </p>
              <p className="text-2xl font-bold text-[#E87516] dark:text-[#FFB866] tabular-nums">
                {phonesSavedCount}
              </p>
            </div>
            <div className="rounded-2xl border border-[#075E36]/15 dark:border-white/[0.08] bg-[#E8EDF2]/75 dark:bg-[#07130F]/75 p-4 space-y-1">
              <p className="text-xs font-medium text-[#43564D] dark:text-[#9CB0A6]">
                Organizations
              </p>
              <p className="text-2xl font-bold text-[#E87516] dark:text-[#FFD28A] tabular-nums">
                {orgCount}
              </p>
            </div>
          </div>

          {/* Search, Type Filter & CSV Download */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#E87516] dark:text-[#FF9933] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, email, phone number, organization, or city..."
                className="w-full min-h-[46px] pl-11 pr-4 py-2 rounded-xl border border-[#075E36]/20 dark:border-white/[0.12] bg-[#FFFDF8] dark:bg-[#07130F] text-xs sm:text-sm text-[#18231E] dark:text-[#FFFDF8] focus:outline-none focus:ring-2 focus:ring-[#FF9933]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {(['all', 'customer', 'technician', 'organization'] as const).map((tOpt) => (
                <button
                  key={tOpt}
                  type="button"
                  onClick={() => setTypeFilter(tOpt)}
                  className={`min-h-[42px] px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize border transition-all ${
                    typeFilter === tOpt
                      ? 'yn-btn-emerald border-[#35C46A]'
                      : 'border-[#075E36]/15 dark:border-white/[0.1] text-[#43564D] dark:text-[#9CB0A6] hover:text-[#18231E] dark:hover:text-[#FFFDF8]'
                  }`}
                >
                  {tOpt}
                </button>
              ))}
              <button
                type="button"
                onClick={handleExportCsv}
                disabled={filteredRecords.length === 0}
                className="min-h-[42px] px-4 py-1.5 rounded-xl yn-btn-saffron text-xs font-bold disabled:opacity-50 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Saved Logins List */}
          {filteredRecords.length === 0 ? (
            <div className="rounded-2xl border border-[#075E36]/15 dark:border-white/[0.08] p-8 text-center space-y-2">
              <p className="text-sm font-semibold text-[#18231E] dark:text-[#FFFDF8]">
                No matching saved login records yet
              </p>
              <p className="text-xs text-[#43564D] dark:text-[#9CB0A6] max-w-md mx-auto">
                Every person, customer, technician, or organization who signs in automatically appears here with their email, phone number, and timestamps.
              </p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {filteredRecords.map((rec) => (
                <div
                  key={rec.uid}
                  className="rounded-2xl border border-[#075E36]/15 dark:border-white/[0.08] bg-[#E8EDF2]/65 dark:bg-[#07130F]/75 p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  <div className="space-y-2 min-w-0">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="text-sm font-bold text-[#18231E] dark:text-[#FFFDF8]">
                        {rec.displayName}
                      </span>
                      <span
                        className={`text-[11px] px-2.5 py-0.5 rounded-lg font-semibold capitalize ${
                          rec.accountType === 'organization'
                            ? 'bg-[#FF9933]/20 text-[#E87516] dark:text-[#FFD28A]'
                            : rec.accountType === 'technician'
                              ? 'bg-[#138808]/18 text-[#138808] dark:text-[#7DFF9B]'
                              : 'bg-[#075E36]/12 dark:bg-white/10 text-[#18231E] dark:text-[#E8EDF2]'
                        }`}
                      >
                        {rec.accountType}
                      </span>
                      {rec.organizationName ? (
                        <span className="text-[11px] px-2.5 py-0.5 rounded-lg bg-[#FFFDF8] dark:bg-[#071B16] border border-[#075E36]/15 dark:border-white/[0.1] text-[#18231E] dark:text-[#FFFDF8] font-medium flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-[#FF9933]" />
                          <span>{rec.organizationName}</span>
                        </span>
                      ) : null}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs">
                      <a
                        href={`mailto:${rec.email}`}
                        className="text-[#E87516] dark:text-[#FFB866] font-medium hover:underline flex items-center gap-1.5 break-all"
                      >
                        <Mail className="w-3.5 h-3.5 shrink-0" />
                        <span>{rec.email}</span>
                      </a>
                      {rec.phone ? (
                        <a
                          href={`tel:${rec.phone}`}
                          className="text-[#18231E] dark:text-[#FFFDF8] font-semibold tabular-nums hover:underline flex items-center gap-1.5"
                        >
                          <Phone className="w-3.5 h-3.5 text-[#138808] dark:text-[#35C46A] shrink-0" />
                          <span>{rec.phone}</span>
                        </a>
                      ) : (
                        <span className="text-[#5B6F65] dark:text-[#7E948A] flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 shrink-0" />
                          <span>Phone not entered yet</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-left lg:text-right text-xs text-[#43564D] dark:text-[#9CB0A6] shrink-0 space-y-1">
                    <p className="font-medium text-[#18231E] dark:text-[#E8EDF2]">
                      {rec.neighborhood} ({rec.countryCode}) · Role: {rec.role}
                    </p>
                    <p className="tabular-nums text-[11px]">
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
        <div className="space-y-4">
          {technicians.length === 0 ? (
            <p className="text-sm text-[#43564D] dark:text-[#9CB0A6] py-6 text-center">No technician profiles registered yet.</p>
          ) : (
            technicians.map((tech) => {
              const vStatus = tech.verificationStatus || 'unverified';
              return (
                <div
                  key={tech.uid}
                  className="rounded-2xl border border-[#075E36]/15 dark:border-white/[0.08] bg-[#E8EDF2]/65 dark:bg-[#07130F]/75 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="text-sm font-bold text-[#18231E] dark:text-[#FFFDF8]">
                        {tech.displayName}
                      </span>
                      <span
                        className={`text-[11px] px-2.5 py-0.5 rounded-lg font-semibold ${
                          vStatus === 'verified'
                            ? 'bg-[#138808]/18 text-[#138808] dark:text-[#7DFF9B]'
                            : vStatus === 'pending'
                              ? 'bg-[#FF9933]/18 text-[#E87516] dark:text-[#FFD28A]'
                              : 'bg-[#075E36]/12 dark:bg-white/10 text-[#18231E] dark:text-[#E8EDF2]'
                        }`}
                      >
                        {VERIFICATION_LABELS[vStatus]}
                      </span>
                      <span className="text-[11px] px-2.5 py-0.5 rounded-lg bg-[#FFFDF8] dark:bg-[#071B16] border border-[#FF9933]/25 text-[#E87516] dark:text-[#FFB866] font-medium">
                        {tech.phoneVerified ? 'Phone Verified' : 'Phone Unverified'}
                      </span>
                      {!tech.isPublic ? (
                        <span className="text-[11px] px-2.5 py-0.5 rounded-lg bg-rose-500/15 text-rose-700 dark:text-rose-300 font-semibold">
                          Suspended / Hidden
                        </span>
                      ) : null}
                    </div>
                    <p className="text-xs text-[#18231E]/85 dark:text-[#E8EDF2]/85">
                      {tech.neighborhood} ({tech.countryCode}) · {tech.yearsExperience || 0} yrs exp ·{' '}
                      {tech.idType ? `${tech.idType} ****${tech.idLast4 || ''}` : 'No ID submitted'}
                    </p>
                    <p className="text-xs text-[#43564D] dark:text-[#9CB0A6] truncate">
                      Skills: {tech.specialties.join(', ')}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 shrink-0">
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
                      className="min-h-[42px] px-4 py-1.5 rounded-xl yn-btn-emerald text-xs font-semibold flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
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
                      className="min-h-[42px] px-4 py-1.5 rounded-xl border border-rose-400/50 text-rose-700 dark:text-rose-300 text-xs font-semibold hover:bg-rose-500/15 flex items-center gap-1.5 transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
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
        <div className="space-y-4">
          {reports.length === 0 ? (
            <p className="text-sm text-[#43564D] dark:text-[#9CB0A6] py-6 text-center">No user complaints or suspicious account reports yet.</p>
          ) : (
            reports.map((rep) => (
              <div
                key={rep.id}
                className="rounded-2xl border border-[#075E36]/15 dark:border-white/[0.08] bg-[#E8EDF2]/65 dark:bg-[#07130F]/75 p-5 space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold uppercase tracking-wide text-rose-600 dark:text-rose-400">
                      {rep.reason.replace('_', ' ')} · {rep.targetType}
                    </span>
                    <h3 className="text-sm font-bold text-[#18231E] dark:text-[#FFFDF8]">
                      Target: {rep.targetName} (by {rep.reporterName})
                    </h3>
                  </div>
                  <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-[#FFFDF8] dark:bg-[#071B16] border border-[#075E36]/15 dark:border-white/[0.1] text-[#18231E] dark:text-[#E8EDF2]">
                    {rep.status.toUpperCase()} · {formatTimestamp(rep.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-[#18231E]/85 dark:text-[#E8EDF2]/85 leading-relaxed">{rep.details}</p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    maxLength={300}
                    value={noteDrafts[rep.id] ?? rep.adminNote ?? ''}
                    onChange={(e) =>
                      setNoteDrafts((prev) => ({ ...prev, [rep.id]: e.target.value }))
                    }
                    placeholder="Admin resolution / refund note..."
                    className="flex-1 min-h-[44px] px-4 py-2 rounded-xl border border-[#075E36]/20 dark:border-white/[0.12] bg-[#FFFDF8] dark:bg-[#071B16] text-xs sm:text-sm text-[#18231E] dark:text-[#FFFDF8] focus:outline-none focus:ring-2 focus:ring-[#FF9933]"
                  />
                  <div className="flex gap-2.5">
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
                      className="min-h-[44px] px-4 py-2 rounded-xl yn-btn-emerald text-xs font-semibold"
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
                      className="min-h-[44px] px-4 py-2 rounded-xl border border-[#075E36]/20 dark:border-white/[0.14] text-xs font-semibold text-[#18231E] dark:text-[#E8EDF2] hover:border-[#FF9933]/50"
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((u) => {
            const matchedLogin = loginRecords.find((lr) => lr.uid === u.uid);
            return (
              <div
                key={u.uid}
                className="rounded-2xl border border-[#075E36]/15 dark:border-white/[0.08] bg-[#E8EDF2]/65 dark:bg-[#07130F]/75 p-5 text-xs space-y-1.5"
              >
                <p className="text-sm font-bold text-[#18231E] dark:text-[#FFFDF8] truncate">{u.displayName}</p>
                <p className="text-[#43564D] dark:text-[#9CB0A6] truncate">
                  Role: {u.role} · {u.neighborhood} ({u.countryCode || 'Global'})
                </p>
                {matchedLogin?.email ? (
                  <p className="text-[#E87516] dark:text-[#FFB866] truncate">{matchedLogin.email}</p>
                ) : null}
                {matchedLogin?.phone ? (
                  <p className="text-[#138808] dark:text-[#35C46A] font-semibold tabular-nums truncate">
                    {matchedLogin.phone}
                  </p>
                ) : null}
                <p className="text-[#5B6F65] dark:text-[#7E948A] truncate">UID: {u.uid.slice(0, 14)}...</p>
              </div>
            );
          })}
        </div>
      ) : null}

      {adminTab === 'jobs' ? (
        <div className="space-y-3">
          {jobs.slice(0, 20).map((j) => (
            <div
              key={j.id}
              className="rounded-2xl border border-[#075E36]/15 dark:border-white/[0.08] bg-[#E8EDF2]/65 dark:bg-[#07130F]/75 p-4.5 flex items-center justify-between gap-4 text-xs"
            >
              <div className="min-w-0 space-y-1">
                <p className="text-sm font-semibold text-[#18231E] dark:text-[#FFFDF8] truncate">{j.issueTitle}</p>
                <p className="text-[#43564D] dark:text-[#9CB0A6] truncate">
                  {CATEGORY_SHORT_MAP[j.applianceCategory]} · {j.customerName} → {j.technicianName || 'Unassigned'} · {STATUS_LABELS[j.status]}
                </p>
              </div>
              <span className="text-sm tabular-nums font-bold text-[#E87516] dark:text-[#FFB866] shrink-0">
                {formatMoney(j.quotedFee || j.estimatedBudget, j.currencyCode || 'USD')}
              </span>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
};
