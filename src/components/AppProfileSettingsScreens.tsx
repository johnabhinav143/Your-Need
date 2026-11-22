import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowUpDown,
  BadgeCheck,
  Bell,
  Bot,
  Building2,
  CheckCircle2,
  ChevronRight,
  Globe,
  HelpCircle,
  LogIn,
  LogOut,
  Moon,
  Phone,
  Settings,
  Shield,
  ShieldCheck,
  Sun,
  User as UserIcon,
  UserPlus,
  Wrench,
} from 'lucide-react';
import { CountryRegion } from '../i18n/regions';
import {
  AccountCategory,
  LoginIntentMeta,
  MarketplaceRole,
  TechnicianProfile,
  UserProfile,
} from '../types';
import { PWAInstallButton } from './PWAInstallButton';

interface AppProfileScreenProps {
  isSignedIn: boolean;
  email: string;
  avatarUrl?: string;
  userProfile: UserProfile | null;
  myTechProfile: TechnicianProfile | null;
  isAdmin: boolean;
  region: CountryRegion;
  currencyCode: string;
  bookingsCount: number;
  techJobsCount: number;
  accountName: string;
  accountNeighborhood: string;
  accountRole: MarketplaceRole;
  accountPhone: string;
  accountAddress: string;
  savingAccount: boolean;
  onAccountNameChange: (v: string) => void;
  onAccountNeighborhoodChange: (v: string) => void;
  onAccountRoleChange: (v: MarketplaceRole) => void;
  onAccountPhoneChange: (v: string) => void;
  onAccountAddressChange: (v: string) => void;
  onSaveAccount: (e: React.FormEvent) => Promise<void>;
  onOpenTechnicianDashboard: () => void;
  onOpenTechSetup: () => void;
  onOpenSettings: () => void;
  onOpenAdminConsole: () => void;
  onOpenHelp: () => void;
  onOpenAiAssistant: () => void;
  onOpenAuthScreen: () => void;
  onSignOut: () => Promise<void>;
}

export const AppProfileScreen: React.FC<AppProfileScreenProps> = ({
  isSignedIn,
  email,
  avatarUrl,
  userProfile,
  myTechProfile,
  isAdmin,
  region,
  currencyCode,
  bookingsCount,
  techJobsCount,
  accountName,
  accountNeighborhood,
  accountRole,
  accountPhone,
  accountAddress,
  savingAccount,
  onAccountNameChange,
  onAccountNeighborhoodChange,
  onAccountRoleChange,
  onAccountPhoneChange,
  onAccountAddressChange,
  onSaveAccount,
  onOpenTechnicianDashboard,
  onOpenTechSetup,
  onOpenSettings,
  onOpenAdminConsole,
  onOpenHelp,
  onOpenAiAssistant,
  onOpenAuthScreen,
  onSignOut,
}) => {
  const [editOpen, setEditOpen] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);

  const displayTitle = isSignedIn
    ? userProfile?.displayName || email.split('@')[0] || 'Member'
    : 'Guest Explorer';

  return (
    <div className="space-y-9 sm:space-y-10">
      {/* Profile Identity Card */}
      <div className="rounded-2xl yn-glass-card yn-tricolor-border p-6 sm:p-7 flex items-center justify-between gap-5">
        <div className="flex items-center gap-4 sm:gap-5 min-w-0">
          {avatarUrl && !avatarFailed ? (
            <img
              src={avatarUrl}
              alt={displayTitle}
              referrerPolicy="no-referrer"
              onError={() => setAvatarFailed(true)}
              className="w-16 h-16 rounded-2xl object-cover border border-[#FF9933]/40 shrink-0"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-[#071B16] border border-[#FF9933]/35 flex items-center justify-center text-lg font-bold text-[#FFB866] shrink-0">
              {isSignedIn ? (
                displayTitle.slice(0, 2).toUpperCase()
              ) : (
                <UserIcon className="w-7 h-7 text-[#FF9933]" />
              )}
            </div>
          )}
          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="font-display text-xl sm:text-2xl font-bold text-[#18231E] dark:text-[#FFFDF8] truncate">
                {displayTitle}
              </h2>
              {myTechProfile?.verificationStatus === 'verified' ? (
                <BadgeCheck className="w-5 h-5 text-[#138808] dark:text-[#35C46A] shrink-0" />
              ) : null}
            </div>
            <p className="text-xs sm:text-sm text-[#43564D] dark:text-[#9CB0A6] truncate">
              {isSignedIn ? email : 'Sign in to sync bookings, phone & private address'}
            </p>
            <p className="text-xs font-semibold text-[#E87516] dark:text-[#FFB866] truncate">
              {userProfile?.neighborhood || region.name} · {currencyCode}
            </p>
          </div>
        </div>

        {!isSignedIn ? (
          <button
            type="button"
            onClick={onOpenAuthScreen}
            className="min-h-[44px] px-5 rounded-xl yn-btn-saffron text-xs sm:text-sm font-bold shrink-0"
          >
            Sign In
          </button>
        ) : null}
      </div>

      {/* Quick Overview Stats */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="rounded-2xl yn-glass-card p-5 space-y-1.5">
          <span className="block text-xs text-[#43564D] dark:text-[#9CB0A6]">Bookings</span>
          <span className="text-xl font-bold text-[#E87516] dark:text-[#FFB866] tabular-nums">
            {bookingsCount}
          </span>
        </div>
        <div className="rounded-2xl yn-glass-card p-5 space-y-1.5">
          <span className="block text-xs text-[#43564D] dark:text-[#9CB0A6]">Pro Jobs</span>
          <span className="text-xl font-bold text-[#138808] dark:text-[#35C46A] tabular-nums">
            {techJobsCount}
          </span>
        </div>
        <div className="rounded-2xl yn-glass-card p-5 space-y-1.5">
          <span className="block text-xs text-[#43564D] dark:text-[#9CB0A6]">Region</span>
          <span className="text-sm sm:text-base font-bold text-[#18231E] dark:text-[#FFFDF8] truncate block pt-0.5">
            {region.code} · {currencyCode}
          </span>
        </div>
      </div>

      {/* Group 1: Account & Provider */}
      <section aria-label="Account and provider" className="space-y-3.5">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#43564D] dark:text-[#9CB0A6] px-1">
          Account &amp; Provider
        </h3>
        <div className="rounded-2xl yn-glass-card divide-y divide-[#075E36]/10 dark:divide-white/[0.08]">
          {isSignedIn ? (
            <button
              type="button"
              onClick={() => setEditOpen((v) => !v)}
              className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 hover:bg-[#E8EDF2]/60 dark:hover:bg-white/[0.04] transition-colors first:rounded-t-2xl"
            >
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-[#FF9933]/14 dark:bg-[#FF9933]/18 border border-[#FF9933]/25 text-[#E87516] dark:text-[#FFB866] flex items-center justify-center shrink-0">
                  <UserIcon className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-sm font-semibold text-[#18231E] dark:text-[#FFFDF8]">
                    Account &amp; Visit Address
                  </p>
                  <p className="text-xs text-[#43564D] dark:text-[#9CB0A6]">
                    Name, neighborhood, private phone &amp; street address
                  </p>
                </div>
              </div>
              <ChevronRight
                className={`w-4 h-4 text-[#43564D] dark:text-[#9CB0A6] transition-transform ${
                  editOpen ? 'rotate-90' : ''
                }`}
              />
            </button>
          ) : null}

          {isSignedIn && editOpen ? (
            <form
              onSubmit={onSaveAccount}
              className="p-6 bg-[#E8EDF2]/60 dark:bg-[#07130F]/75 space-y-5"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="prof-name"
                    className="block text-xs font-medium text-[#43564D] dark:text-[#9CB0A6] mb-2"
                  >
                    Display name
                  </label>
                  <input
                    id="prof-name"
                    type="text"
                    required
                    maxLength={60}
                    value={accountName}
                    onChange={(e) => onAccountNameChange(e.target.value)}
                    className="w-full min-h-[46px] px-4 rounded-xl border border-[#075E36]/20 dark:border-white/[0.12] bg-[#FFFDF8] dark:bg-[#071B16] text-sm text-[#18231E] dark:text-[#FFFDF8] focus:outline-none focus:ring-2 focus:ring-[#FF9933]"
                  />
                </div>
                <div>
                  <label
                    htmlFor="prof-area"
                    className="block text-xs font-medium text-[#43564D] dark:text-[#9CB0A6] mb-2"
                  >
                    Default neighborhood
                  </label>
                  <input
                    id="prof-area"
                    type="text"
                    required
                    maxLength={80}
                    value={accountNeighborhood}
                    onChange={(e) => onAccountNeighborhoodChange(e.target.value)}
                    className="w-full min-h-[46px] px-4 rounded-xl border border-[#075E36]/20 dark:border-white/[0.12] bg-[#FFFDF8] dark:bg-[#071B16] text-sm text-[#18231E] dark:text-[#FFFDF8] focus:outline-none focus:ring-2 focus:ring-[#FF9933]"
                  />
                </div>
                <div>
                  <label
                    htmlFor="prof-role"
                    className="block text-xs font-medium text-[#43564D] dark:text-[#9CB0A6] mb-2"
                  >
                    Primary role
                  </label>
                  <select
                    id="prof-role"
                    value={accountRole}
                    onChange={(e) => onAccountRoleChange(e.target.value as MarketplaceRole)}
                    className="w-full min-h-[46px] px-4 rounded-xl border border-[#075E36]/20 dark:border-white/[0.12] bg-[#FFFDF8] dark:bg-[#071B16] text-sm text-[#18231E] dark:text-[#FFFDF8] focus:outline-none focus:ring-2 focus:ring-[#FF9933]"
                  >
                    <option value="both">Customer &amp; Technician</option>
                    <option value="customer">Customer</option>
                    <option value="technician">Service Provider</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="prof-phone"
                    className="block text-xs font-medium text-[#43564D] dark:text-[#9CB0A6] mb-2"
                  >
                    Private phone ({region.dialCode})
                  </label>
                  <input
                    id="prof-phone"
                    type="tel"
                    maxLength={30}
                    value={accountPhone}
                    onChange={(e) => onAccountPhoneChange(e.target.value)}
                    className="w-full min-h-[46px] px-4 rounded-xl border border-[#075E36]/20 dark:border-white/[0.12] bg-[#FFFDF8] dark:bg-[#071B16] text-sm tabular-nums text-[#18231E] dark:text-[#FFFDF8] focus:outline-none focus:ring-2 focus:ring-[#FF9933]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label
                    htmlFor="prof-address"
                    className="block text-xs font-medium text-[#43564D] dark:text-[#9CB0A6] mb-2"
                  >
                    Private street address
                  </label>
                  <input
                    id="prof-address"
                    type="text"
                    maxLength={180}
                    value={accountAddress}
                    onChange={(e) => onAccountAddressChange(e.target.value)}
                    className="w-full min-h-[46px] px-4 rounded-xl border border-[#075E36]/20 dark:border-white/[0.12] bg-[#FFFDF8] dark:bg-[#071B16] text-sm text-[#18231E] dark:text-[#FFFDF8] focus:outline-none focus:ring-2 focus:ring-[#FF9933]"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={savingAccount}
                className="min-h-[46px] px-6 rounded-xl yn-btn-emerald text-xs sm:text-sm font-bold disabled:opacity-60"
              >
                {savingAccount ? 'Saving...' : 'Save Account Details'}
              </button>
            </form>
          ) : null}

          <button
            type="button"
            onClick={onOpenTechnicianDashboard}
            className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 hover:bg-[#E8EDF2]/60 dark:hover:bg-white/[0.04] transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-[#138808]/14 dark:bg-[#35C46A]/18 border border-[#138808]/25 dark:border-[#35C46A]/25 text-[#138808] dark:text-[#35C46A] flex items-center justify-center shrink-0">
                <Wrench className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-semibold text-[#18231E] dark:text-[#FFFDF8]">
                  Technician Dashboard
                </p>
                <p className="text-xs text-[#43564D] dark:text-[#9CB0A6]">
                  Open separate provider workspace, leads &amp; earnings
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#138808] dark:text-[#35C46A]" />
          </button>

          <button
            type="button"
            onClick={onOpenTechSetup}
            className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 hover:bg-[#E8EDF2]/60 dark:hover:bg-white/[0.04] transition-colors last:rounded-b-2xl"
          >
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-[#138808]/14 dark:bg-[#35C46A]/18 border border-[#138808]/25 dark:border-[#35C46A]/25 text-[#138808] dark:text-[#35C46A] flex items-center justify-center shrink-0">
                <BadgeCheck className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-semibold text-[#18231E] dark:text-[#FFFDF8]">
                  {myTechProfile ? 'Manage Service Provider Listing' : 'Become a Service Provider'}
                </p>
                <p className="text-xs text-[#43564D] dark:text-[#9CB0A6]">
                  Specialties, ID verification, fees &amp; languages
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#43564D] dark:text-[#9CB0A6]" />
          </button>

          {isAdmin ? (
            <button
              type="button"
              onClick={onOpenAdminConsole}
              className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 hover:bg-[#E8EDF2]/60 dark:hover:bg-white/[0.04] transition-colors last:rounded-b-2xl"
            >
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-[#071B16] border border-[#FF9933]/35 text-[#FF9933] flex items-center justify-center shrink-0">
                  <Shield className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-sm font-semibold text-[#E87516] dark:text-[#FFB866]">
                    Admin Directory &amp; Verification Console
                  </p>
                  <p className="text-xs text-[#43564D] dark:text-[#9CB0A6]">
                    Saved login records, phones, and technician ID approvals
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#E87516] dark:text-[#FF9933]" />
            </button>
          ) : null}
        </div>
      </section>

      {/* Group 2: Tools & Preferences */}
      <section aria-label="Workspace and support" className="space-y-3.5">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#43564D] dark:text-[#9CB0A6] px-1">
          Workspace &amp; Support
        </h3>
        <div className="rounded-2xl yn-glass-card divide-y divide-[#075E36]/10 dark:divide-white/[0.08]">
          <button
            type="button"
            onClick={onOpenSettings}
            className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 hover:bg-[#E8EDF2]/60 dark:hover:bg-white/[0.04] transition-colors first:rounded-t-2xl"
          >
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-[#E8EDF2] dark:bg-[#07130F] border border-[#075E36]/15 dark:border-white/[0.08] text-[#E87516] dark:text-[#FFB866] flex items-center justify-center shrink-0">
                <Settings className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-semibold text-[#18231E] dark:text-[#FFFDF8]">
                  Settings &amp; Preferences
                </p>
                <p className="text-xs text-[#43564D] dark:text-[#9CB0A6]">
                  Country, currency, language, theme &amp; app install
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#43564D] dark:text-[#9CB0A6]" />
          </button>

          <button
            type="button"
            onClick={onOpenAiAssistant}
            className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 hover:bg-[#E8EDF2]/60 dark:hover:bg-white/[0.04] transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-[#FF9933]/14 dark:bg-[#FF9933]/18 border border-[#FF9933]/25 text-[#E87516] dark:text-[#FFB866] flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-semibold text-[#18231E] dark:text-[#FFFDF8]">
                  AI Service Concierge
                </p>
                <p className="text-xs text-[#43564D] dark:text-[#9CB0A6]">
                  Diagnose faults &amp; estimate repair pricing
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#43564D] dark:text-[#9CB0A6]" />
          </button>

          <button
            type="button"
            onClick={onOpenHelp}
            className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 hover:bg-[#E8EDF2]/60 dark:hover:bg-white/[0.04] transition-colors last:rounded-b-2xl"
          >
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-[#138808]/14 dark:bg-[#35C46A]/18 border border-[#138808]/25 dark:border-[#35C46A]/25 text-[#138808] dark:text-[#35C46A] flex items-center justify-center shrink-0">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-semibold text-[#18231E] dark:text-[#FFFDF8]">
                  Help &amp; Safety Policies
                </p>
                <p className="text-xs text-[#43564D] dark:text-[#9CB0A6]">
                  Pricing transparency &amp; cancellation protection
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#43564D] dark:text-[#9CB0A6]" />
          </button>
        </div>
      </section>

      {/* Group 3: Session */}
      <div className="rounded-2xl yn-glass-card overflow-hidden">
        {isSignedIn ? (
          <button
            type="button"
            onClick={onSignOut}
            className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 hover:bg-rose-500/10 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
                <LogOut className="w-5 h-5" />
              </div>
              <p className="text-sm font-semibold text-rose-500">Sign Out</p>
            </div>
            <ChevronRight className="w-4 h-4 text-rose-400" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onOpenAuthScreen}
            className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 hover:bg-[#FF9933]/10 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-[#FF9933]/14 dark:bg-[#FF9933]/18 border border-[#FF9933]/25 text-[#E87516] dark:text-[#FFB866] flex items-center justify-center shrink-0">
                <LogIn className="w-5 h-5" />
              </div>
              <p className="text-sm font-semibold text-[#E87516] dark:text-[#FFB866]">
                Log In or Register Account
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-[#E87516] dark:text-[#FF9933]" />
          </button>
        )}
      </div>
    </div>
  );
};

interface AppSettingsScreenProps {
  region: CountryRegion;
  currencyCode: string;
  languageNativeName: string;
  theme: 'light' | 'dark';
  showScrollbars: boolean;
  pushNotifsEnabled: boolean;
  browserNotifPermission: NotificationPermission | 'unsupported';
  installLabel: string;
  onBack: () => void;
  onOpenRegionModal: () => void;
  onToggleTheme: () => void;
  onToggleScrollbars: () => void;
  onTogglePushNotifs: () => void;
  onOpenHelp: () => void;
}

export const AppSettingsScreen: React.FC<AppSettingsScreenProps> = ({
  region,
  currencyCode,
  languageNativeName,
  theme,
  showScrollbars,
  pushNotifsEnabled,
  browserNotifPermission,
  installLabel,
  onBack,
  onOpenRegionModal,
  onToggleTheme,
  onToggleScrollbars,
  onTogglePushNotifs,
  onOpenHelp,
}) => {
  return (
    <div className="space-y-7 sm:space-y-8">
      <button
        type="button"
        onClick={onBack}
        className="min-h-[44px] px-4 py-2 rounded-xl yn-glass-card border border-[#075E36]/20 dark:border-white/[0.10] text-xs sm:text-sm font-semibold text-[#18231E] dark:text-[#FFFDF8] inline-flex items-center gap-2 hover:border-[#FF9933]/50 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 text-[#E87516] dark:text-[#FFB866]" />
        <span>Back to Profile</span>
      </button>

      <div className="yn-glass-card yn-tricolor-border rounded-2xl divide-y divide-[#075E36]/12 dark:divide-white/[0.08] overflow-hidden">
        <button
          type="button"
          onClick={onOpenRegionModal}
          className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 hover:bg-[#FF9933]/[0.06] dark:hover:bg-white/[0.04] transition-colors first:rounded-t-2xl"
        >
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-[#FF9933]/14 border border-[#FF9933]/30 text-[#E87516] dark:text-[#FFB866] flex items-center justify-center shrink-0">
              <Globe className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <p className="text-sm font-semibold text-[#18231E] dark:text-[#FFFDF8]">
                Country, Currency &amp; Language
              </p>
              <p className="text-xs text-[#43564D] dark:text-[#9CB0A6]">
                {region.name} ({region.dialCode}) · {currencyCode} · {languageNativeName}
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#5B6F65] dark:text-[#7E948A]" />
        </button>

        <button
          type="button"
          onClick={onToggleTheme}
          className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 hover:bg-[#FF9933]/[0.06] dark:hover:bg-white/[0.04] transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-[#FF9933]/14 border border-[#FF9933]/30 text-[#E87516] dark:text-[#FFB866] flex items-center justify-center shrink-0">
              {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </div>
            <div className="space-y-0.5">
              <p className="text-sm font-semibold text-[#18231E] dark:text-[#FFFDF8]">
                App Appearance
              </p>
              <p className="text-xs text-[#43564D] dark:text-[#9CB0A6]">
                {theme === 'dark' ? 'Darkened Indian Tricolour Emerald Theme' : 'Crisp Ivory Tricolour Light Theme'}
              </p>
            </div>
          </div>
          <span className="px-4 py-2 rounded-xl bg-[#FF9933]/12 border border-[#FF9933]/30 text-xs font-semibold text-[#E87516] dark:text-[#FFD28A] shrink-0">
            Switch
          </span>
        </button>

        <button
          type="button"
          onClick={onToggleScrollbars}
          className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 hover:bg-[#FF9933]/[0.06] dark:hover:bg-white/[0.04] transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-[#138808]/14 dark:bg-[#35C46A]/15 border border-[#35C46A]/30 text-[#138808] dark:text-[#7DFF9B] flex items-center justify-center shrink-0">
              <ArrowUpDown className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <p className="text-sm font-semibold text-[#18231E] dark:text-[#FFFDF8]">
                Scroll &amp; Scrollbar Display
              </p>
              <p className="text-xs text-[#43564D] dark:text-[#9CB0A6]">
                {showScrollbars
                  ? 'Visible Tricolour Scrollbars Enabled (Comfortable Drag)'
                  : 'Minimal Hidden Scrollbars (Touch / Wheel Scroll)'}
              </p>
            </div>
          </div>
          <span className="px-4 py-2 rounded-xl bg-[#138808]/12 dark:bg-[#35C46A]/15 border border-[#35C46A]/30 text-xs font-semibold text-[#138808] dark:text-[#7DFF9B] shrink-0">
            {showScrollbars ? 'Visible' : 'Hidden'}
          </span>
        </button>

        <button
          type="button"
          onClick={onTogglePushNotifs}
          className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 hover:bg-[#FF9933]/[0.06] dark:hover:bg-white/[0.04] transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-[#FF9933]/14 border border-[#FF9933]/30 text-[#E87516] dark:text-[#FFB866] flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <p className="text-sm font-semibold text-[#18231E] dark:text-[#FFFDF8]">
                Live &amp; Push Notifications
              </p>
              <p className="text-xs text-[#43564D] dark:text-[#9CB0A6]">
                {browserNotifPermission === 'denied'
                  ? 'Blocked in browser site settings (In-app alerts active)'
                  : browserNotifPermission === 'granted' && pushNotifsEnabled
                    ? 'Instant browser & in-app alerts enabled'
                    : 'Enable real-time alerts for bookings, quotes & ETAs'}
              </p>
            </div>
          </div>
          <span
            className={`px-4 py-2 rounded-xl border text-xs font-semibold shrink-0 ${
              browserNotifPermission === 'granted' && pushNotifsEnabled
                ? 'bg-[#138808]/14 dark:bg-[#35C46A]/15 border-[#35C46A]/35 text-[#138808] dark:text-[#7DFF9B]'
                : 'bg-[#FF9933]/12 border-[#FF9933]/30 text-[#E87516] dark:text-[#FFD28A]'
            }`}
          >
            {browserNotifPermission === 'granted' && pushNotifsEnabled ? 'Enabled' : 'Turn On'}
          </span>
        </button>

        <div className="p-5 sm:p-6 flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <p className="text-sm font-semibold text-[#18231E] dark:text-[#FFFDF8]">
              Install YourNeed App
            </p>
            <p className="text-xs text-[#43564D] dark:text-[#9CB0A6]">
              Add to Android / iOS home screen for full-screen launch
            </p>
          </div>
          <PWAInstallButton label={installLabel} variant="primary" />
        </div>

        <button
          type="button"
          onClick={onOpenHelp}
          className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 hover:bg-[#FF9933]/[0.06] dark:hover:bg-white/[0.04] transition-colors last:rounded-b-2xl"
        >
          <div className="space-y-0.5">
            <p className="text-sm font-semibold text-[#18231E] dark:text-[#FFFDF8]">
              Privacy, Terms &amp; Support
            </p>
            <p className="text-xs text-[#43564D] dark:text-[#9CB0A6]">
              YourNeed Service Marketplace · Built by Abhinav
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-[#5B6F65] dark:text-[#7E948A]" />
        </button>
      </div>
    </div>
  );
};

interface AppAuthScreenProps {
  loading: boolean;
  errorMessage?: string;
  onBack: () => void;
  onSignIn: (preferredRole?: 'customer' | 'technician', meta?: LoginIntentMeta) => void;
}

export const AppAuthScreen: React.FC<AppAuthScreenProps> = ({
  loading,
  errorMessage,
  onBack,
  onSignIn,
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [accountType, setAccountType] = useState<AccountCategory>('customer');
  const [phoneInput, setPhoneInput] = useState('');
  const [orgInput, setOrgInput] = useState('');
  const role: 'customer' | 'technician' = accountType === 'technician' ? 'technician' : 'customer';

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <button
        type="button"
        onClick={onBack}
        className="min-h-[44px] px-4 py-2 rounded-xl yn-glass-card border border-[#075E36]/20 dark:border-white/[0.10] text-xs sm:text-sm font-semibold text-[#18231E] dark:text-[#FFFDF8] inline-flex items-center gap-2 hover:border-[#FF9933]/50 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 text-[#E87516] dark:text-[#FFB866]" />
        <span>Back</span>
      </button>

      <div className="yn-glass-card yn-tricolor-border rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF9933]/20 via-white/10 to-[#138808]/20 border border-[#FF9933]/40 flex items-center justify-center text-[#E87516] dark:text-[#FFD28A] shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="space-y-0.5">
            <p className="font-brand text-xs font-bold uppercase tracking-wider yn-tricolor-text">
              YourNeed
            </p>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-[#18231E] dark:text-[#FFFDF8]">
              {mode === 'login' ? 'Sign In to Your Account' : 'Register New Account'}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-[#E8EDF2] dark:bg-[#07130F] border border-[#075E36]/12 dark:border-white/[0.08]">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex-1 min-h-[44px] rounded-xl text-xs sm:text-sm font-bold transition-all ${
              mode === 'login'
                ? 'yn-btn-saffron text-white shadow-sm'
                : 'text-[#43564D] dark:text-[#9CB0A6] hover:text-[#18231E] dark:hover:text-[#FFFDF8]'
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`flex-1 min-h-[44px] rounded-xl text-xs sm:text-sm font-bold transition-all ${
              mode === 'signup'
                ? 'yn-btn-emerald text-white shadow-sm'
                : 'text-[#43564D] dark:text-[#9CB0A6] hover:text-[#18231E] dark:hover:text-[#FFFDF8]'
            }`}
          >
            Register
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setAccountType('customer')}
            className={`p-3.5 sm:p-4 rounded-xl border text-left transition-colors ${
              accountType === 'customer'
                ? 'border-[#FF9933] bg-[#FF9933]/14'
                : 'border-[#075E36]/15 dark:border-white/[0.10] bg-[#FFFDF8] dark:bg-[#07130F]/80 hover:border-[#FF9933]/40'
            }`}
          >
            <p className="text-xs font-bold text-[#18231E] dark:text-[#FFFDF8] flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#E87516] dark:text-[#FFB866] shrink-0" />
              <span>Customer</span>
            </p>
            <p className="text-[11px] text-[#43564D] dark:text-[#9CB0A6] mt-1">Book &amp; track</p>
          </button>
          <button
            type="button"
            onClick={() => setAccountType('technician')}
            className={`p-3.5 sm:p-4 rounded-xl border text-left transition-colors ${
              accountType === 'technician'
                ? 'border-[#35C46A] bg-[#138808]/14 dark:bg-[#35C46A]/15'
                : 'border-[#075E36]/15 dark:border-white/[0.10] bg-[#FFFDF8] dark:bg-[#07130F]/80 hover:border-[#35C46A]/40'
            }`}
          >
            <p className="text-xs font-bold text-[#18231E] dark:text-[#FFFDF8] flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5 text-[#138808] dark:text-[#7DFF9B] shrink-0" />
              <span>Provider</span>
            </p>
            <p className="text-[11px] text-[#43564D] dark:text-[#9CB0A6] mt-1">Verify &amp; earn</p>
          </button>
          <button
            type="button"
            onClick={() => setAccountType('organization')}
            className={`p-3.5 sm:p-4 rounded-xl border text-left transition-colors ${
              accountType === 'organization'
                ? 'border-[#1E40AF] dark:border-[#60A5FA] bg-[#0A1D4D]/12 dark:bg-[#1E40AF]/20'
                : 'border-[#075E36]/15 dark:border-white/[0.10] bg-[#FFFDF8] dark:bg-[#07130F]/80 hover:border-[#1E40AF]/40'
            }`}
          >
            <p className="text-xs font-bold text-[#18231E] dark:text-[#FFFDF8] flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#1E40AF] dark:text-[#93C5FD] shrink-0" />
              <span>Team</span>
            </p>
            <p className="text-[11px] text-[#43564D] dark:text-[#9CB0A6] mt-1">Business</p>
          </button>
        </div>

        <div className="space-y-3.5">
          {accountType === 'organization' ? (
            <input
              type="text"
              maxLength={80}
              value={orgInput}
              onChange={(e) => setOrgInput(e.target.value)}
              placeholder="Organization or company name"
              className="w-full min-h-[48px] px-4 rounded-xl border border-[#075E36]/20 dark:border-white/[0.12] bg-[#FFFDF8] dark:bg-[#07130F] text-sm text-[#18231E] dark:text-[#FFFDF8] placeholder:text-[#5B6F65] dark:placeholder:text-[#7E948A] focus:outline-none focus:ring-2 focus:ring-[#FF9933]"
            />
          ) : null}
          <div className="relative flex items-center">
            <Phone className="w-4 h-4 text-[#E87516] dark:text-[#FFB866] absolute left-4 pointer-events-none" />
            <input
              type="tel"
              maxLength={30}
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              placeholder="Phone number (saved privately with account)"
              className="w-full min-h-[48px] pl-11 pr-4 rounded-xl border border-[#075E36]/20 dark:border-white/[0.12] bg-[#FFFDF8] dark:bg-[#07130F] text-sm tabular-nums text-[#18231E] dark:text-[#FFFDF8] placeholder:text-[#5B6F65] dark:placeholder:text-[#7E948A] focus:outline-none focus:ring-2 focus:ring-[#FF9933]"
            />
          </div>
        </div>

        {errorMessage ? (
          <div className="rounded-xl bg-rose-500/15 border border-rose-500/30 px-4 py-3 text-xs text-rose-700 dark:text-rose-300">
            {errorMessage}
          </div>
        ) : null}

        <button
          type="button"
          disabled={loading}
          onClick={() =>
            onSignIn(role, {
              preferredRole: role,
              accountType,
              phone: phoneInput.trim(),
              organizationName: orgInput.trim(),
            })
          }
          className="w-full min-h-[50px] px-6 rounded-xl yn-btn-saffron text-sm font-bold disabled:opacity-60 transition-all flex items-center justify-center gap-2.5"
        >
          {mode === 'login' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
          <span>
            {loading
              ? 'Opening Google Sign-In...'
              : `${mode === 'login' ? 'Log In' : 'Register'} with Google`}
          </span>
        </button>
      </div>
    </div>
  );
};
