import { useState } from 'react';
import { Building2, CheckCircle2, LogIn, Phone, ShieldCheck, UserPlus, Wrench, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { AccountCategory, LoginIntentMeta } from '../types';

interface AuthGateModalProps {
  open: boolean;
  reason: string;
  loading: boolean;
  errorMessage?: string;
  onClose: () => void;
  onSignIn: (preferredRole?: 'customer' | 'technician', meta?: LoginIntentMeta) => void;
}

export function AuthGateModal({
  open,
  reason,
  loading,
  errorMessage,
  onClose,
  onSignIn,
}: AuthGateModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [accountType, setAccountType] = useState<AccountCategory>('customer');
  const [phoneInput, setPhoneInput] = useState('');
  const [orgInput, setOrgInput] = useState('');
  const role: 'customer' | 'technician' = accountType === 'technician' ? 'technician' : 'customer';

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#171717]/65 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="auth-modal-title"
        >
          <motion.div
            initial={{ y: 36, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 36, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
            className="w-full sm:max-w-md max-h-[90dvh] overflow-y-auto overscroll-y-contain bg-white dark:bg-[#171717] rounded-t-3xl sm:rounded-2xl border border-[#E8DFC8] dark:border-[#2E2E2E] shadow-2xl p-6 pb-8 sm:pb-6"
          >
            <div className="w-10 h-1.5 bg-[#E8DFC8] dark:bg-[#2E2E2E] rounded-full mx-auto mb-4 sm:hidden" />
            <div className="flex items-start justify-between gap-4 mb-4">
              <motion.div
                initial={{ scale: 0.82, rotate: -8 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.08, type: 'spring', stiffness: 320, damping: 20 }}
                className="w-11 h-11 rounded-xl bg-[#F6F0E2] dark:bg-[#0B0B0D] border border-[#D6A84F]/55 flex items-center justify-center text-[#9E7628] dark:text-[#D6A84F] shrink-0"
              >
                <ShieldCheck className="w-5 h-5" />
              </motion.div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close sign in dialog"
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-[#595959] dark:text-[#DDD6C7] hover:text-[#171717] dark:hover:text-white hover:bg-[#FFFDF7] dark:hover:bg-[#0D0D0D] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center p-1 rounded-xl bg-[#FFFDF7] dark:bg-[#0D0D0D] border border-[#E8DFC8] dark:border-[#2E2E2E] mb-4">
              {(
                [
                  { id: 'login', label: 'Log In' },
                  { id: 'signup', label: 'Create Account' },
                ] as const
              ).map((tab) => {
                const active = mode === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setMode(tab.id)}
                    className={`relative flex-1 min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-bold z-10 transition-colors ${
                      active
                        ? 'text-white dark:text-[#171717]'
                        : 'text-[#292929] dark:text-[#DDD6C7]'
                    }`}
                  >
                    {active ? (
                      <motion.span
                        layoutId="auth-modal-mode-pill"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        className="absolute inset-0 rounded-lg bg-[#171717] dark:bg-[#D6A84F] -z-10"
                      />
                    ) : null}
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <p className="font-brand text-xs font-extrabold uppercase tracking-wider text-[#8F6412] dark:text-[#D6A84F] mb-1">
              Your Need
            </p>
            <h2 id="auth-modal-title" className="font-brand text-xl font-bold text-[#171717] dark:text-white mb-2">
              {mode === 'login' ? 'Log in to continue' : 'Create your account'}
            </h2>
            <p className="text-sm text-[#292929] dark:text-[#DDD6C7] leading-relaxed mb-4">
              {reason ||
                'Sign in with Google so homeowners and technicians can coordinate repair requests in real time while keeping phone numbers and street addresses private.'}
            </p>

            {/* Role / Organization Intent Picker */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              <button
                type="button"
                onClick={() => setAccountType('customer')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  accountType === 'customer'
                    ? 'bg-[#FFFDF7] dark:bg-[#0D0D0D] border-[#D6A84F] ring-1 ring-[#D6A84F]'
                    : 'border-[#E8DFC8] dark:border-[#2E2E2E]'
                }`}
              >
                <p className="text-xs font-bold text-[#171717] dark:text-white flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#D6A84F]" />
                  <span>Customer</span>
                </p>
                <p className="text-[11px] text-[#595959] dark:text-[#B5ADA0] mt-0.5">
                  Book &amp; track
                </p>
              </button>
              <button
                type="button"
                onClick={() => setAccountType('technician')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  accountType === 'technician'
                    ? 'bg-[#FFFDF7] dark:bg-[#0D0D0D] border-[#D6A84F] ring-1 ring-[#D6A84F]'
                    : 'border-[#E8DFC8] dark:border-[#2E2E2E]'
                }`}
              >
                <p className="text-xs font-bold text-[#171717] dark:text-white flex items-center gap-1">
                  <Wrench className="w-3.5 h-3.5 text-[#D6A84F]" />
                  <span>Technician</span>
                </p>
                <p className="text-[11px] text-[#595959] dark:text-[#B5ADA0] mt-0.5">
                  Verify &amp; earn
                </p>
              </button>
              <button
                type="button"
                onClick={() => setAccountType('organization')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  accountType === 'organization'
                    ? 'bg-[#FFFDF7] dark:bg-[#0D0D0D] border-[#D6A84F] ring-1 ring-[#D6A84F]'
                    : 'border-[#E8DFC8] dark:border-[#2E2E2E]'
                }`}
              >
                <p className="text-xs font-bold text-[#171717] dark:text-white flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-[#D6A84F]" />
                  <span>Organization</span>
                </p>
                <p className="text-[11px] text-[#595959] dark:text-[#B5ADA0] mt-0.5">
                  Company / team
                </p>
              </button>
            </div>

            <div className="space-y-2 mb-4">
              {accountType === 'organization' ? (
                <input
                  type="text"
                  maxLength={80}
                  value={orgInput}
                  onChange={(e) => setOrgInput(e.target.value)}
                  placeholder="Organization or company name"
                  aria-label="Organization name"
                  className="w-full min-h-[42px] px-3 py-2 rounded-xl border border-[#D8CEB4] dark:border-[#2E2E2E] bg-[#FFFDF7] dark:bg-[#0D0D0D] text-xs text-[#171717] dark:text-[#FFFDF7]"
                />
              ) : null}
              <div className="relative flex items-center">
                <Phone className="w-4 h-4 text-[#8F6412] dark:text-[#D6A84F] absolute left-3 pointer-events-none" />
                <input
                  type="tel"
                  maxLength={30}
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="Phone number (saved privately with account)"
                  aria-label="Phone number"
                  className="w-full min-h-[42px] pl-9 pr-3 py-2 rounded-xl border border-[#D8CEB4] dark:border-[#2E2E2E] bg-[#FFFDF7] dark:bg-[#0D0D0D] text-xs tabular-nums text-[#171717] dark:text-[#FFFDF7]"
                />
              </div>
            </div>

            {errorMessage ? (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 rounded-xl bg-rose-50 dark:bg-rose-500/15 border border-rose-200 dark:border-rose-500/30 px-4 py-3 text-sm text-rose-800 dark:text-rose-200"
              >
                {errorMessage}
              </motion.div>
            ) : null}

            <div className="flex flex-col gap-2.5">
              <motion.button
                type="button"
                whileTap={{ scale: 0.98 }}
                disabled={loading}
                onClick={() =>
                  onSignIn(role, {
                    preferredRole: role,
                    accountType,
                    phone: phoneInput.trim(),
                    organizationName: orgInput.trim(),
                  })
                }
                className={`relative overflow-hidden w-full min-h-[48px] px-4 py-3 rounded-xl text-sm font-bold hover:brightness-105 disabled:opacity-60 transition-all flex items-center justify-center gap-2 ${
                  mode === 'login'
                    ? 'bg-gradient-to-r from-[#C8963E] via-[#F3D999] to-[#D6A84F] text-[#08080A] shadow-lg shadow-[#D6A84F]/20'
                    : 'bg-[#0D0D10] border border-[#D6A84F] text-[#F3D999] shadow-lg shadow-[#D6A84F]/15'
                }`}
              >
                {mode === 'login' ? (
                  <LogIn className="w-4 h-4 shrink-0" />
                ) : (
                  <UserPlus className="w-4 h-4 shrink-0" />
                )}
                <span>
                  {loading
                    ? 'Opening Google Sign-In...'
                    : `${mode === 'login' ? 'Log In' : 'Sign Up'} with Google (${role === 'technician' ? 'Technician' : 'Customer'})`}
                </span>
              </motion.button>
              <motion.button
                type="button"
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="w-full min-h-[44px] px-4 py-2.5 rounded-xl text-[#292929] dark:text-[#DDD6C7] text-sm font-medium hover:bg-[#FFFDF7] dark:hover:bg-[#0D0D0D] transition-colors"
              >
                Keep browsing first
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
