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
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#040B08]/75 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-labelledby="auth-modal-title"
        >
          <motion.div
            initial={{ y: 36, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 36, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
            className="w-full sm:max-w-lg max-h-[90dvh] overflow-y-auto overscroll-y-contain yn-glass-card yn-tricolor-border rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 pb-8"
          >
            <div className="w-10 h-1.5 bg-[#075E36]/20 dark:bg-white/[0.15] rounded-full mx-auto mb-5 sm:hidden" />
            <div className="flex items-start justify-between gap-4 mb-5">
              <motion.div
                initial={{ scale: 0.82, rotate: -8 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.08, type: 'spring', stiffness: 320, damping: 20 }}
                className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FF9933]/20 via-white/10 to-[#138808]/20 border border-[#FF9933]/40 flex items-center justify-center text-[#E87516] dark:text-[#FFD28A] shrink-0"
              >
                <ShieldCheck className="w-5 h-5" />
              </motion.div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close sign in dialog"
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-[#43564D] dark:text-[#9CB0A6] hover:text-[#18231E] dark:hover:text-[#FFFDF8] hover:bg-[#FF9933]/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center p-1.5 rounded-2xl bg-[#E8EDF2] dark:bg-[#07130F] border border-[#075E36]/12 dark:border-white/[0.08] mb-6 gap-1.5">
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
                    className={`relative flex-1 min-h-[42px] px-4 py-2 rounded-xl text-xs sm:text-sm font-bold z-10 transition-colors ${
                      active
                        ? 'text-white'
                        : 'text-[#43564D] dark:text-[#9CB0A6]'
                    }`}
                  >
                    {active ? (
                      <motion.span
                        layoutId="auth-modal-mode-pill"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        className={`absolute inset-0 rounded-xl -z-10 ${
                          tab.id === 'login' ? 'yn-btn-saffron' : 'yn-btn-emerald'
                        }`}
                      />
                    ) : null}
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <p className="font-brand text-xs font-extrabold uppercase tracking-wider yn-tricolor-text mb-1.5">
              Your Need
            </p>
            <h2 id="auth-modal-title" className="font-brand text-xl sm:text-2xl font-bold text-[#18231E] dark:text-[#FFFDF8] mb-2.5">
              {mode === 'login' ? 'Log in to continue' : 'Create your account'}
            </h2>
            <p className="text-sm text-[#43564D] dark:text-[#9CB0A6] leading-relaxed mb-6">
              {reason ||
                'Sign in with Google so homeowners and technicians can coordinate repair requests in real time while keeping phone numbers and street addresses private.'}
            </p>

            {/* Role / Organization Intent Picker */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              <button
                type="button"
                onClick={() => setAccountType('customer')}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  accountType === 'customer'
                    ? 'bg-[#FF9933]/14 border-[#FF9933] ring-1 ring-[#FF9933]'
                    : 'bg-[#FFFDF8] dark:bg-[#07130F]/80 border-[#075E36]/15 dark:border-white/[0.10] hover:border-[#FF9933]/40'
                }`}
              >
                <p className="text-xs font-bold text-[#18231E] dark:text-[#FFFDF8] flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#E87516] dark:text-[#FFB866] shrink-0" />
                  <span>Customer</span>
                </p>
                <p className="text-[11px] text-[#43564D] dark:text-[#9CB0A6] mt-1">
                  Book &amp; track
                </p>
              </button>
              <button
                type="button"
                onClick={() => setAccountType('technician')}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  accountType === 'technician'
                    ? 'bg-[#138808]/14 dark:bg-[#35C46A]/15 border-[#35C46A] ring-1 ring-[#35C46A]'
                    : 'bg-[#FFFDF8] dark:bg-[#07130F]/80 border-[#075E36]/15 dark:border-white/[0.10] hover:border-[#35C46A]/40'
                }`}
              >
                <p className="text-xs font-bold text-[#18231E] dark:text-[#FFFDF8] flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-[#138808] dark:text-[#7DFF9B] shrink-0" />
                  <span>Technician</span>
                </p>
                <p className="text-[11px] text-[#43564D] dark:text-[#9CB0A6] mt-1">
                  Verify &amp; earn
                </p>
              </button>
              <button
                type="button"
                onClick={() => setAccountType('organization')}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  accountType === 'organization'
                    ? 'bg-[#0A1D4D]/12 dark:bg-[#1E40AF]/20 border-[#1E40AF] dark:border-[#60A5FA] ring-1 ring-[#1E40AF] dark:ring-[#60A5FA]'
                    : 'bg-[#FFFDF8] dark:bg-[#07130F]/80 border-[#075E36]/15 dark:border-white/[0.10] hover:border-[#1E40AF]/40'
                }`}
              >
                <p className="text-xs font-bold text-[#18231E] dark:text-[#FFFDF8] flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-[#1E40AF] dark:text-[#93C5FD] shrink-0" />
                  <span>Organization</span>
                </p>
                <p className="text-[11px] text-[#43564D] dark:text-[#9CB0A6] mt-1">
                  Company / team
                </p>
              </button>
            </div>

            <div className="space-y-3 mb-5">
              {accountType === 'organization' ? (
                <input
                  type="text"
                  maxLength={80}
                  value={orgInput}
                  onChange={(e) => setOrgInput(e.target.value)}
                  placeholder="Organization or company name"
                  aria-label="Organization name"
                  className="w-full min-h-[46px] px-4 py-2.5 rounded-xl border border-[#075E36]/20 dark:border-white/[0.12] bg-[#FFFDF8] dark:bg-[#07130F] text-sm text-[#18231E] dark:text-[#FFFDF8] placeholder:text-[#5B6F65] dark:placeholder:text-[#7E948A] focus:outline-none focus:ring-2 focus:ring-[#FF9933]"
                />
              ) : null}
              <div className="relative flex items-center">
                <Phone className="w-4 h-4 text-[#E87516] dark:text-[#FFB866] absolute left-3.5 pointer-events-none" />
                <input
                  type="tel"
                  maxLength={30}
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="Phone number (saved privately with account)"
                  aria-label="Phone number"
                  className="w-full min-h-[46px] pl-10 pr-4 py-2.5 rounded-xl border border-[#075E36]/20 dark:border-white/[0.12] bg-[#FFFDF8] dark:bg-[#07130F] text-sm tabular-nums text-[#18231E] dark:text-[#FFFDF8] placeholder:text-[#5B6F65] dark:placeholder:text-[#7E948A] focus:outline-none focus:ring-2 focus:ring-[#FF9933]"
                />
              </div>
            </div>

            {errorMessage ? (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-5 rounded-xl bg-rose-500/15 border border-rose-500/30 px-4 py-3 text-sm text-rose-700 dark:text-rose-200"
              >
                {errorMessage}
              </motion.div>
            ) : null}

            <div className="flex flex-col gap-3">
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
                className={`relative overflow-hidden w-full min-h-[50px] px-5 py-3 rounded-xl text-sm font-bold disabled:opacity-60 transition-all flex items-center justify-center gap-2 ${
                  mode === 'login' ? 'yn-btn-saffron' : 'yn-btn-emerald'
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
                className="w-full min-h-[44px] px-4 py-2.5 rounded-xl text-[#43564D] dark:text-[#9CB0A6] text-sm font-medium hover:bg-[#E8EDF2] dark:hover:bg-white/[0.06] transition-colors"
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
