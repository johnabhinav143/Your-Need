import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowUpDown,
  BadgeCheck,
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
    <div className="space-y-8">
      {/* Profile Identity Card */}
      <div className="rounded-2xl bg-white dark:bg-[#141414] border border-black/[0.08] dark:border-white/[0.08] p-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          {avatarUrl && !avatarFailed ? (
            <img
              src={avatarUrl}
              alt={displayTitle}
              referrerPolicy="no-referrer"
              onError={() => setAvatarFailed(true)}
              className="w-14 h-14 rounded-2xl object-cover border border-white/[0.1] shrink-0"
            />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-[#1C1C1C] border border-white/[0.1] flex items-center justify-center text-lg font-bold text-[#D6AE53] shrink-0">
              {isSignedIn ? (
                displayTitle.slice(0, 2).toUpperCase()
              ) : (
                <UserIcon className="w-6 h-6 text-[#D6AE53]" />
              )}
            </div>
          )}
          <div className="min-w-0 space-y-0.5">
            <div className="flex items-center gap-1.5">
              <h2 className="font-display text-xl font-bold text-[#171717] dark:text-white truncate">
                {displayTitle}
              </h2>
              {myTechProfile?.verificationStatus === 'verified' ? (
                <BadgeCheck className="w-4 h-4 text-[#D6AE53] shrink-0" />
              ) : null}
            </div>
            <p className="text-xs text-[#595959] dark:text-[#A0A0A0] truncate">
              {isSignedIn ? email : 'Sign in to sync bookings, phone & private address'}
            </p>
            <p className="text-xs font-medium text-[#D6AE53] truncate">
              {userProfile?.neighborhood || region.name} · {currencyCode}
            </p>
          </div>
        </div>

        {!isSignedIn ? (
          <button
            type="button"
            onClick={onOpenAuthScreen}
            className="min-h-[42px] px-4 rounded-xl bg-[#D6AE53] text-[#080808] text-xs font-bold shrink-0"
          >
            Sign In
          </button>
        ) : null}
      </div>

      {/* Quick Overview Stats */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="rounded-2xl bg-white dark:bg-[#141414] border border-black/[0.08] dark:border-white/[0.08] p-4 space-y-1">
          <span className="block text-xs text-[#A0A0A0]">Bookings</span>
          <span className="text-lg font-bold text-[#171717] dark:text-white tabular-nums">
            {bookingsCount}
          </span>
        </div>
        <div className="rounded-2xl bg-white dark:bg-[#141414] border border-black/[0.08] dark:border-white/[0.08] p-4 space-y-1">
          <span className="block text-xs text-[#A0A0A0]">Pro Jobs</span>
          <span className="text-lg font-bold text-[#D6AE53] tabular-nums">
            {techJobsCount}
          </span>
        </div>
        <div className="rounded-2xl bg-white dark:bg-[#141414] border border-black/[0.08] dark:border-white/[0.08] p-4 space-y-1">
          <span className="block text-xs text-[#A0A0A0]">Region</span>
          <span className="text-sm font-bold text-[#171717] dark:text-white truncate block pt-0.5">
            {region.code} · {currencyCode}
          </span>
        </div>
      </div>

      {/* Group 1: Account & Provider */}
      <section aria-label="Account and provider" className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#A0A0A0] px-1">
          Account &amp; Provider
        </h3>
        <div className="rounded-2xl bg-white dark:bg-[#141414] border border-black/[0.08] dark:border-white/[0.08] divide-y divide-black/[0.06] dark:divide-white/[0.06]">
          {isSignedIn ? (
            <button
              type="button"
              onClick={() => setEditOpen((v) => !v)}
              className="w-full px-5 py-4 text-left flex items-center justify-between gap-3 hover:bg-[#F6F3EC] dark:hover:bg-[#1C1C1C] transition-colors first:rounded-t-2xl"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#F3EEE2] dark:bg-[#1C1C1C] text-[#D6AE53] flex items-center justify-center shrink-0">
                  <UserIcon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#171717] dark:text-white">
                    Account &amp; Visit Address
                  </p>
                  <p className="text-xs text-[#A0A0A0] mt-0.5">
                    Name, neighborhood, private phone &amp; street address
                  </p>
                </div>
              </div>
              <ChevronRight
                className={`w-4 h-4 text-[#A0A0A0] transition-transform ${
                  editOpen ? 'rotate-90' : ''
                }`}
              />
            </button>
          ) : null}

          {isSignedIn && editOpen ? (
            <form
              onSubmit={onSaveAccount}
              className="p-5 bg-[#F3EEE2]/50 dark:bg-[#1C1C1C]/60 space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label
                    htmlFor="prof-name"
                    className="block text-xs font-medium text-[#595959] dark:text-[#A0A0A0] mb-1.5"
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
                    className="w-full min-h-[44px] px-3.5 rounded-xl border border-black/[0.1] dark:border-white/[0.1] bg-white dark:bg-[#141414] text-sm text-[#171717] dark:text-white"
                  />
                </div>
                <div>
                  <label
                    htmlFor="prof-area"
                    className="block text-xs font-medium text-[#595959] dark:text-[#A0A0A0] mb-1.5"
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
                    className="w-full min-h-[44px] px-3.5 rounded-xl border border-black/[0.1] dark:border-white/[0.1] bg-white dark:bg-[#141414] text-sm text-[#171717] dark:text-white"
                  />
                </div>
                <div>
                  <label
                    htmlFor="prof-role"
                    className="block text-xs font-medium text-[#595959] dark:text-[#A0A0A0] mb-1.5"
                  >
                    Primary role
                  </label>
                  <select
                    id="prof-role"
                    value={accountRole}
                    onChange={(e) => onAccountRoleChange(e.target.value as MarketplaceRole)}
                    className="w-full min-h-[44px] px-3.5 rounded-xl border border-black/[0.1] dark:border-white/[0.1] bg-white dark:bg-[#141414] text-sm text-[#171717] dark:text-white"
                  >
                    <option value="both">Customer &amp; Technician</option>
                    <option value="customer">Customer</option>
                    <option value="technician">Service Provider</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="prof-phone"
                    className="block text-xs font-medium text-[#595959] dark:text-[#A0A0A0] mb-1.5"
                  >
                    Private phone ({region.dialCode})
                  </label>
                  <input
                    id="prof-phone"
                    type="tel"
                    maxLength={30}
                    value={accountPhone}
                    onChange={(e) => onAccountPhoneChange(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 rounded-xl border border-black/[0.1] dark:border-white/[0.1] bg-white dark:bg-[#141414] text-sm tabular-nums text-[#171717] dark:text-white"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label
                    htmlFor="prof-address"
                    className="block text-xs font-medium text-[#595959] dark:text-[#A0A0A0] mb-1.5"
                  >
                    Private street address
                  </label>
                  <input
                    id="prof-address"
                    type="text"
                    maxLength={180}
                    value={accountAddress}
                    onChange={(e) => onAccountAddressChange(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 rounded-xl border border-black/[0.1] dark:border-white/[0.1] bg-white dark:bg-[#141414] text-sm text-[#171717] dark:text-white"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={savingAccount}
                className="min-h-[44px] px-5 rounded-xl bg-[#D6AE53] text-[#080808] text-xs font-bold disabled:opacity-60"
              >
                {savingAccount ? 'Saving...' : 'Save Account Details'}
              </button>
            </form>
          ) : null}

          <button
            type="button"
            onClick={onOpenTechnicianDashboard}
            className="w-full px-5 py-4 text-left flex items-center justify-between gap-3 hover:bg-[#F6F3EC] dark:hover:bg-[#1C1C1C] transition-colors"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#D6AE53]/15 text-[#D6AE53] flex items-center justify-center shrink-0">
                <Wrench className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#171717] dark:text-white">
                  Technician Dashboard
                </p>
                <p className="text-xs text-[#A0A0A0] mt-0.5">
                  Open separate provider workspace, leads &amp; earnings
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#D6AE53]" />
          </button>

          <button
            type="button"
            onClick={onOpenTechSetup}
            className="w-full px-5 py-4 text-left flex items-center justify-between gap-3 hover:bg-[#F6F3EC] dark:hover:bg-[#1C1C1C] transition-colors last:rounded-b-2xl"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#F3EEE2] dark:bg-[#1C1C1C] text-[#D6AE53] flex items-center justify-center shrink-0">
                <BadgeCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#171717] dark:text-white">
                  {myTechProfile ? 'Manage Service Provider Listing' : 'Become a Service Provider'}
                </p>
                <p className="text-xs text-[#A0A0A0] mt-0.5">
                  Specialties, ID verification, fees &amp; languages
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#A0A0A0]" />
          </button>

          {isAdmin ? (
            <button
              type="button"
              onClick={onOpenAdminConsole}
              className="w-full px-5 py-4 text-left flex items-center justify-between gap-3 hover:bg-[#F6F3EC] dark:hover:bg-[#1C1C1C] transition-colors last:rounded-b-2xl"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#1C1C1C] text-[#D6AE53] flex items-center justify-center shrink-0">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#D6AE53]">
                    Admin Directory &amp; Verification Console
                  </p>
                  <p className="text-xs text-[#A0A0A0] mt-0.5">
                    Saved login records, phones, and technician ID approvals
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#D6AE53]" />
            </button>
          ) : null}
        </div>
      </section>

      {/* Group 2: Tools & Preferences */}
      <section aria-label="Workspace and support" className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#A0A0A0] px-1">
          Workspace &amp; Support
        </h3>
        <div className="rounded-2xl bg-white dark:bg-[#141414] border border-black/[0.08] dark:border-white/[0.08] divide-y divide-black/[0.06] dark:divide-white/[0.06]">
          <button
            type="button"
            onClick={onOpenSettings}
            className="w-full px-5 py-4 text-left flex items-center justify-between gap-3 hover:bg-[#F6F3EC] dark:hover:bg-[#1C1C1C] transition-colors first:rounded-t-2xl"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#F3EEE2] dark:bg-[#1C1C1C] text-[#D6AE53] flex items-center justify-center shrink-0">
                <Settings className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#171717] dark:text-white">
                  Settings &amp; Preferences
                </p>
                <p className="text-xs text-[#A0A0A0] mt-0.5">
                  Country, currency, language, theme &amp; app install
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#A0A0A0]" />
          </button>

          <button
            type="button"
            onClick={onOpenAiAssistant}
            className="w-full px-5 py-4 text-left flex items-center justify-between gap-3 hover:bg-[#F6F3EC] dark:hover:bg-[#1C1C1C] transition-colors"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#F3EEE2] dark:bg-[#1C1C1C] text-[#D6AE53] flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#171717] dark:text-white">
                  AI Service Concierge
                </p>
                <p className="text-xs text-[#A0A0A0] mt-0.5">
                  Diagnose faults &amp; estimate repair pricing
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#A0A0A0]" />
          </button>

          <button
            type="button"
            onClick={onOpenHelp}
            className="w-full px-5 py-4 text-left flex items-center justify-between gap-3 hover:bg-[#F6F3EC] dark:hover:bg-[#1C1C1C] transition-colors last:rounded-b-2xl"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#F3EEE2] dark:bg-[#1C1C1C] text-[#D6AE53] flex items-center justify-center shrink-0">
                <HelpCircle className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#171717] dark:text-white">
                  Help &amp; Safety Policies
                </p>
                <p className="text-xs text-[#A0A0A0] mt-0.5">
                  Pricing transparency &amp; cancellation protection
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#A0A0A0]" />
          </button>
        </div>
      </section>

      {/* Group 3: Session */}
      <div className="rounded-2xl bg-white dark:bg-[#141414] border border-black/[0.08] dark:border-white/[0.08] overflow-hidden">
        {isSignedIn ? (
          <button
            type="button"
            onClick={onSignOut}
            className="w-full px-5 py-4 text-left flex items-center justify-between gap-3 hover:bg-rose-500/10 transition-colors"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
                <LogOut className="w-4 h-4" />
              </div>
              <p className="text-sm font-semibold text-rose-500">Sign Out</p>
            </div>
            <ChevronRight className="w-4 h-4 text-rose-400" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onOpenAuthScreen}
            className="w-full px-5 py-4 text-left flex items-center justify-between gap-3 hover:bg-[#D6AE53]/10 transition-colors"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#F3EEE2] dark:bg-[#1C1C1C] text-[#D6AE53] flex items-center justify-center shrink-0">
                <LogIn className="w-4 h-4" />
              </div>
              <p className="text-sm font-semibold text-[#D6AE53]">
                Log In or Register Account
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-[#D6AE53]" />
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
  installLabel: string;
  onBack: () => void;
  onOpenRegionModal: () => void;
  onToggleTheme: () => void;
  onToggleScrollbars: () => void;
  onOpenHelp: () => void;
}

export const AppSettingsScreen: React.FC<AppSettingsScreenProps> = ({
  region,
  currencyCode,
  languageNativeName,
  theme,
  showScrollbars,
  installLabel,
  onBack,
  onOpenRegionModal,
  onToggleTheme,
  onToggleScrollbars,
  onOpenHelp,
}) => {
  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={onBack}
        className="min-h-[42px] px-3.5 py-2 rounded-xl bg-white dark:bg-[#141414] border border-black/[0.08] dark:border-white/[0.08] text-xs font-semibold text-[#171717] dark:text-white inline-flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4 text-[#D6AE53]" />
        <span>Back to Profile</span>
      </button>

      <div className="rounded-2xl bg-white dark:bg-[#141414] border border-black/[0.08] dark:border-white/[0.08] divide-y divide-black/[0.06] dark:divide-white/[0.06]">
        <button
          type="button"
          onClick={onOpenRegionModal}
          className="w-full p-5 text-left flex items-center justify-between gap-3 hover:bg-[#F6F3EC] dark:hover:bg-[#1C1C1C] transition-colors first:rounded-t-2xl"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#F3EEE2] dark:bg-[#1C1C1C] text-[#D6AE53] flex items-center justify-center shrink-0">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#171717] dark:text-white">
                Country, Currency &amp; Language
              </p>
              <p className="text-xs text-[#A0A0A0] mt-0.5">
                {region.name} ({region.dialCode}) · {currencyCode} · {languageNativeName}
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#A0A0A0]" />
        </button>

        <button
          type="button"
          onClick={onToggleTheme}
          className="w-full p-5 text-left flex items-center justify-between gap-3 hover:bg-[#F6F3EC] dark:hover:bg-[#1C1C1C] transition-colors"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#F3EEE2] dark:bg-[#1C1C1C] text-[#D6AE53] flex items-center justify-center shrink-0">
              {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </div>
            <div>
              <p className="text-sm font-semibold text-[#171717] dark:text-white">
                App Appearance
              </p>
              <p className="text-xs text-[#A0A0A0] mt-0.5">
                {theme === 'dark' ? 'Obsidian & Gold Dark Theme' : 'Warm Ivory Light Theme'}
              </p>
            </div>
          </div>
          <span className="px-3.5 py-1.5 rounded-xl bg-[#F3EEE2] dark:bg-[#1C1C1C] text-xs font-semibold text-[#D6AE53]">
            Switch
          </span>
        </button>

        <button
          type="button"
          onClick={onToggleScrollbars}
          className="w-full p-5 text-left flex items-center justify-between gap-3 hover:bg-[#F6F3EC] dark:hover:bg-[#1C1C1C] transition-colors"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#F3EEE2] dark:bg-[#1C1C1C] text-[#D6AE53] flex items-center justify-center shrink-0">
              <ArrowUpDown className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#171717] dark:text-white">
                Scroll &amp; Scrollbar Display
              </p>
              <p className="text-xs text-[#A0A0A0] mt-0.5">
                {showScrollbars
                  ? 'Visible Gold Scrollbars Enabled (Comfortable Drag)'
                  : 'Minimal Hidden Scrollbars (Touch / Wheel Scroll)'}
              </p>
            </div>
          </div>
          <span className="px-3.5 py-1.5 rounded-xl bg-[#F3EEE2] dark:bg-[#1C1C1C] text-xs font-semibold text-[#D6AE53] shrink-0">
            {showScrollbars ? 'Visible' : 'Hidden'}
          </span>
        </button>

        <div className="p-5 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-[#171717] dark:text-white">
              Install YourNeed App
            </p>
            <p className="text-xs text-[#A0A0A0] mt-0.5">
              Add to Android / iOS home screen for full-screen launch
            </p>
          </div>
          <PWAInstallButton label={installLabel} variant="primary" />
        </div>

        <button
          type="button"
          onClick={onOpenHelp}
          className="w-full p-5 text-left flex items-center justify-between gap-3 hover:bg-[#F6F3EC] dark:hover:bg-[#1C1C1C] transition-colors last:rounded-b-2xl"
        >
          <div>
            <p className="text-sm font-semibold text-[#171717] dark:text-white">
              Privacy, Terms &amp; Support
            </p>
            <p className="text-xs text-[#A0A0A0] mt-0.5">
              YourNeed Service Marketplace · Built by Abhinav
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-[#A0A0A0]" />
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
    <div className="max-w-md mx-auto space-y-5">
      <button
        type="button"
        onClick={onBack}
        className="min-h-[42px] px-3.5 py-2 rounded-xl bg-white dark:bg-[#141414] border border-black/[0.08] dark:border-white/[0.08] text-xs font-semibold text-[#171717] dark:text-white inline-flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4 text-[#D6AE53]" />
        <span>Back</span>
      </button>

      <div className="rounded-2xl bg-white dark:bg-[#141414] border border-black/[0.08] dark:border-white/[0.08] p-6 space-y-5">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#1C1C1C] border border-[#D6AE53]/40 flex items-center justify-center text-[#D6AE53] shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="font-brand text-xs font-bold uppercase tracking-wider text-[#D6AE53]">
              YourNeed
            </p>
            <h2 className="font-display text-xl font-bold text-[#171717] dark:text-white">
              {mode === 'login' ? 'Sign In to Your Account' : 'Register New Account'}
            </h2>
          </div>
        </div>

        <div className="flex items-center p-1 rounded-xl bg-[#F3EEE2] dark:bg-[#1C1C1C]">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex-1 min-h-[40px] rounded-lg text-xs font-bold transition-colors ${
              mode === 'login'
                ? 'bg-[#D6AE53] text-[#080808]'
                : 'text-[#595959] dark:text-[#A0A0A0]'
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`flex-1 min-h-[40px] rounded-lg text-xs font-bold transition-colors ${
              mode === 'signup'
                ? 'bg-[#D6AE53] text-[#080808]'
                : 'text-[#595959] dark:text-[#A0A0A0]'
            }`}
          >
            Register
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          <button
            type="button"
            onClick={() => setAccountType('customer')}
            className={`p-3 rounded-xl border text-left transition-colors ${
              accountType === 'customer'
                ? 'border-[#D6AE53] bg-[#D6AE53]/10'
                : 'border-black/[0.08] dark:border-white/[0.08] bg-[#F3EEE2] dark:bg-[#1C1C1C]'
            }`}
          >
            <p className="text-xs font-bold text-[#171717] dark:text-white flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#D6AE53]" />
              <span>Customer</span>
            </p>
            <p className="text-[11px] text-[#A0A0A0] mt-0.5">Book &amp; track</p>
          </button>
          <button
            type="button"
            onClick={() => setAccountType('technician')}
            className={`p-3 rounded-xl border text-left transition-colors ${
              accountType === 'technician'
                ? 'border-[#D6AE53] bg-[#D6AE53]/10'
                : 'border-black/[0.08] dark:border-white/[0.08] bg-[#F3EEE2] dark:bg-[#1C1C1C]'
            }`}
          >
            <p className="text-xs font-bold text-[#171717] dark:text-white flex items-center gap-1">
              <Wrench className="w-3.5 h-3.5 text-[#D6AE53]" />
              <span>Provider</span>
            </p>
            <p className="text-[11px] text-[#A0A0A0] mt-0.5">Verify &amp; earn</p>
          </button>
          <button
            type="button"
            onClick={() => setAccountType('organization')}
            className={`p-3 rounded-xl border text-left transition-colors ${
              accountType === 'organization'
                ? 'border-[#D6AE53] bg-[#D6AE53]/10'
                : 'border-black/[0.08] dark:border-white/[0.08] bg-[#F3EEE2] dark:bg-[#1C1C1C]'
            }`}
          >
            <p className="text-xs font-bold text-[#171717] dark:text-white flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-[#D6AE53]" />
              <span>Team</span>
            </p>
            <p className="text-[11px] text-[#A0A0A0] mt-0.5">Business</p>
          </button>
        </div>

        <div className="space-y-3">
          {accountType === 'organization' ? (
            <input
              type="text"
              maxLength={80}
              value={orgInput}
              onChange={(e) => setOrgInput(e.target.value)}
              placeholder="Organization or company name"
              className="w-full min-h-[44px] px-4 rounded-xl border border-black/[0.08] dark:border-white/[0.08] bg-[#F3EEE2] dark:bg-[#1C1C1C] text-xs text-[#171717] dark:text-white placeholder:text-[#A0A0A0]"
            />
          ) : null}
          <div className="relative flex items-center">
            <Phone className="w-4 h-4 text-[#D6AE53] absolute left-4 pointer-events-none" />
            <input
              type="tel"
              maxLength={30}
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              placeholder="Phone number (saved privately with account)"
              className="w-full min-h-[44px] pl-11 pr-4 rounded-xl border border-black/[0.08] dark:border-white/[0.08] bg-[#F3EEE2] dark:bg-[#1C1C1C] text-xs tabular-nums text-[#171717] dark:text-white placeholder:text-[#A0A0A0]"
            />
          </div>
        </div>

        {errorMessage ? (
          <div className="rounded-xl bg-rose-500/15 border border-rose-500/30 px-4 py-3 text-xs text-rose-400">
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
          className="w-full min-h-[48px] px-5 rounded-xl bg-[#D6AE53] text-[#080808] text-sm font-bold hover:brightness-105 disabled:opacity-60 transition-all flex items-center justify-center gap-2"
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
