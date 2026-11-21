import React, { useEffect, useRef, useState } from 'react';
import {
  Bot,
  CheckCircle2,
  CreditCard,
  Globe,
  HelpCircle,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Wrench,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { CATEGORY_MAP } from '../constants';
import { AiBookingDraft } from '../types';

interface ChatEntry {
  id: string;
  role: 'user' | 'model';
  text: string;
  safetyWarning?: string;
  bookingDraft?: AiBookingDraft | null;
}

interface AiRepairBotDrawerProps {
  open: boolean;
  regionName: string;
  currencyCode: string;
  languageName: string;
  roleView: 'customer' | 'technician';
  onClose: () => void;
  onBookRepair: (draft?: AiBookingDraft | null) => void;
}

export const AiRepairBotDrawer: React.FC<AiRepairBotDrawerProps> = ({
  open,
  regionName,
  currencyCode,
  languageName,
  roleView,
  onClose,
  onBookRepair,
}) => {
  const [messages, setMessages] = useState<ChatEntry[]>([
    {
      id: 'welcome-bot',
      role: 'model',
      text: `Hi! I'm your Your Need AI Service Assistant. Describe any issue (e.g., "My washing machine is not starting"), and I will identify the right category, share safe checks, and prepare your booking request.`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [open, messages, loading]);

  const sendPrompt = async (promptText: string) => {
    const trimmed = promptText.trim();
    if (!trimmed || loading) return;

    const userMsg: ChatEntry = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: trimmed,
    };

    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setInput('');
    setErrorMsg('');
    setLoading(true);

    try {
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          history: messages
            .filter((m) => m.id !== 'welcome-bot')
            .map((m) => ({ role: m.role, text: m.text })),
          regionName,
          currencyCode,
          languageName,
          roleView,
        }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        reply?: string;
        safetyWarning?: string;
        bookingDraft?: AiBookingDraft | null;
        error?: string;
      };

      if (!response.ok || !data.reply) {
        throw new Error(
          data.error || `Unable to get an answer right now (HTTP ${response.status}).`
        );
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `m-${Date.now()}`,
          role: 'model',
          text: data.reply!,
          safetyWarning: data.safetyWarning,
          bookingDraft: data.bookingDraft || null,
        },
      ]);
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : 'Failed to reach AI Service Assistant. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    'My washing machine is not starting',
    'Ceiling fan spinning slow & humming',
    'Split AC dripping water indoors',
    `Typical AC / fridge checkup cost in ${currencyCode}?`,
  ];

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="ai-bot-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 bg-[#171717]/60 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Your Need AI Service Assistant"
        >
          <motion.div
            key="ai-bot-panel"
            initial={{ opacity: 0, y: 32, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="w-full sm:max-w-lg bg-white dark:bg-[#171717] rounded-t-3xl sm:rounded-2xl shadow-2xl border border-[#E8DFC8] dark:border-[#2E2E2E] flex flex-col max-h-[88vh] overflow-hidden"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-[#E8DFC8] dark:border-[#2E2E2E] flex items-center justify-between gap-3 bg-[#FFFDF7] dark:bg-[#0D0D0D]">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-[#171717] dark:bg-[#D6A84F] text-white dark:text-[#171717] flex items-center justify-center shrink-0">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-sm sm:text-base font-bold text-[#171717] dark:text-white font-display truncate">
                    AI Service Assistant
                  </h2>
                  <p className="text-xs text-[#595959] dark:text-[#B5ADA0] truncate">
                    {regionName} · {currencyCode} · {languageName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close AI helper"
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-[#595959] dark:text-[#B5ADA0] hover:bg-[#FFFDF7] dark:hover:bg-[#121212] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick symptom pills */}
            <div className="px-4 py-2.5 border-b border-[#EFE8D5] dark:border-[#2E2E2E] flex items-center gap-2 overflow-x-auto bg-slate-50/70 dark:bg-[#0D0D0D]/60">
              {quickPrompts.map((q) => (
                <button
                  key={q}
                  type="button"
                  disabled={loading}
                  onClick={() => sendPrompt(q)}
                  className="min-h-[36px] px-3 py-1.5 rounded-xl bg-white dark:bg-[#121212] border border-[#E8DFC8] dark:border-[#2E2E2E] text-xs font-medium text-[#292929] dark:text-[#E8E2D5] hover:border-[#D6A84F] transition-colors whitespace-nowrap shrink-0"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Chat history */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} gap-2`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-line ${
                      msg.role === 'user'
                        ? 'bg-[#171717] dark:bg-[#D6A84F] text-white dark:text-[#171717] rounded-br-md'
                        : 'bg-[#FFFDF7] dark:bg-[#0D0D0D] text-[#171717] dark:text-[#FFFDF7] rounded-bl-md border border-slate-200/70 dark:border-slate-700'
                    }`}
                  >
                    {msg.text}
                  </div>

                  {msg.safetyWarning ? (
                    <div className="max-w-[88%] rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 px-3 py-2 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
                      <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{msg.safetyWarning}</span>
                    </div>
                  ) : null}

                  {msg.bookingDraft ? (
                    <div className="max-w-[88%] w-full rounded-xl bg-[#FFFDF7] dark:bg-[#D6A84F]/15 border border-[#D6A84F]/40 dark:border-[#D6A84F]/35 p-3 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-[#171717] dark:text-[#D6A84F]">
                          Category: {CATEGORY_MAP[msg.bookingDraft.category] || msg.bookingDraft.category}
                        </span>
                        <span className="text-[#8F6412] dark:text-[#D6A84F] font-medium">
                          Ready to book
                        </span>
                      </div>
                      <p className="text-xs text-[#292929] dark:text-[#E8E2D5] font-medium">
                        {msg.bookingDraft.issueTitle}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onBookRepair(msg.bookingDraft);
                        }}
                        className="w-full min-h-[40px] px-3 py-2 rounded-xl bg-[#171717] dark:bg-[#D6A84F] text-white dark:text-[#171717] text-xs font-semibold hover:bg-[#262626] dark:hover:brightness-110 transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Wrench className="w-3.5 h-3.5" />
                        <span>Prepare Booking Request</span>
                      </button>
                    </div>
                  ) : null}
                </div>
              ))}

              {loading ? (
                <div className="flex justify-start">
                  <div className="rounded-2xl rounded-bl-md px-4 py-2.5 bg-[#FFFDF7] dark:bg-[#0D0D0D] border border-slate-200/70 dark:border-slate-700 text-xs text-[#595959] dark:text-slate-300 flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-[#8F6412] dark:text-[#D6A84F] animate-pulse" />
                    <span>Diagnosing category safely...</span>
                  </div>
                </div>
              ) : null}

              {errorMsg ? (
                <div className="rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 px-3.5 py-2.5 text-xs text-rose-800 dark:text-rose-200">
                  {errorMsg}
                </div>
              ) : null}

              <div ref={bottomRef} />
            </div>

            {/* Book shortcut + Message input */}
            <div className="p-3.5 sm:p-4 border-t border-[#E8DFC8] dark:border-[#2E2E2E] bg-white dark:bg-[#171717] space-y-2.5 pb-safe">
              <div className="flex items-center justify-between gap-2 text-xs text-[#595959] dark:text-[#B5ADA0]">
                <span>Need a verified technician in person?</span>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onBookRepair(null);
                  }}
                  className="font-semibold text-[#8F6412] dark:text-[#D6A84F] hover:underline flex items-center gap-1"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Open Booking Form</span>
                </button>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendPrompt(input);
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Describe your fan, washer, AC, or fridge issue..."
                  maxLength={350}
                  className="flex-1 min-h-[44px] px-3.5 py-2 rounded-xl border border-[#D8CEB4] dark:border-[#292929] bg-slate-50 dark:bg-[#121212] text-sm text-[#171717] dark:text-[#FFFDF7] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D6A84F]"
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  aria-label="Send message"
                  className="min-h-[44px] min-w-[44px] px-4 rounded-xl bg-[#171717] dark:bg-[#D6A84F] text-white dark:text-[#171717] font-semibold hover:bg-[#262626] dark:hover:brightness-110 disabled:opacity-50 transition-colors flex items-center justify-center"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

interface HelpCenterModalProps {
  open: boolean;
  regionName: string;
  currencyCode: string;
  onClose: () => void;
  onOpenAiBot: () => void;
  onPostRepair: () => void;
}

export const HelpCenterModal: React.FC<HelpCenterModalProps> = ({
  open,
  regionName,
  currencyCode,
  onClose,
  onOpenAiBot,
  onPostRepair,
}) => {
  const [activeTab, setActiveTab] = useState<'customer' | 'technician' | 'safety'>('customer');

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="help-center-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 bg-[#171717]/60 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Your Need Help Guide"
        >
          <motion.div
            key="help-center-panel"
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="w-full sm:max-w-lg bg-white dark:bg-[#171717] rounded-t-3xl sm:rounded-2xl shadow-2xl border border-[#E8DFC8] dark:border-[#2E2E2E] max-h-[88vh] flex flex-col overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-[#E8DFC8] dark:border-[#2E2E2E] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-center">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#171717] dark:text-white font-display">
                    Help &amp; Trust Policies
                  </h2>
                  <p className="text-xs text-[#595959] dark:text-[#B5ADA0]">
                    Transparent booking for {regionName} ({currencyCode})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close help guide"
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-[#595959] dark:text-[#B5ADA0] hover:bg-[#FFFDF7] dark:hover:bg-[#121212] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-5 pt-3.5">
              <div className="grid grid-cols-3 gap-1 p-1 bg-[#FFFDF7] dark:bg-[#0D0D0D] rounded-xl">
                {(
                  [
                    { id: 'customer', label: 'Homeowners' },
                    { id: 'technician', label: 'Technicians' },
                    { id: 'safety', label: 'Policies & Pay' },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`min-h-[38px] px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      activeTab === tab.id
                        ? 'bg-white dark:bg-[#262626] text-[#171717] dark:text-white shadow-sm'
                        : 'text-[#292929] dark:text-[#DDD6C7] hover:text-[#171717] dark:hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-5 overflow-y-auto space-y-3.5 text-sm text-[#292929] dark:text-[#DDD6C7]">
              {activeTab === 'customer' ? (
                <>
                  <div className="rounded-xl bg-[#FFFDF7] dark:bg-[#0D0D0D]/75 border border-[#E8DFC8] dark:border-[#2E2E2E] p-4 space-y-1.5">
                    <p className="font-semibold text-[#171717] dark:text-white flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#8F6412] dark:text-[#D6A84F]" />
                      1. Describe issue + upload photo/video
                    </p>
                    <p className="text-xs leading-relaxed">
                      Use the AI Service Assistant or post directly with a fault photo, preferred slot, and transparent inspection + repair estimate in {currencyCode}.
                    </p>
                  </div>
                  <div className="rounded-xl bg-[#FFFDF7] dark:bg-[#0D0D0D]/75 border border-[#E8DFC8] dark:border-[#2E2E2E] p-4 space-y-1.5">
                    <p className="font-semibold text-[#171717] dark:text-white flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#8F6412] dark:text-[#D6A84F]" />
                      2. Track live &amp; approve final price
                    </p>
                    <p className="text-xs leading-relaxed">
                      Follow 5 live steps: Accepted → Travelling → Arrived → Started → Completed. Always approve the final repair quote before work begins.
                    </p>
                  </div>
                  <div className="rounded-xl bg-[#FFFDF7] dark:bg-[#0D0D0D]/75 border border-[#E8DFC8] dark:border-[#2E2E2E] p-4 space-y-1.5">
                    <p className="font-semibold text-[#171717] dark:text-white flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#8F6412] dark:text-[#D6A84F]" />
                      3. Digital Invoice &amp; Warranty
                    </p>
                    <p className="text-xs leading-relaxed">
                      Every completed job provides a Digital Invoice listing work performed, parts replaced, itemized charges, and warranty coverage.
                    </p>
                  </div>
                </>
              ) : null}

              {activeTab === 'technician' ? (
                <>
                  <div className="rounded-xl bg-[#FFFDF7] dark:bg-[#0D0D0D]/75 border border-[#E8DFC8] dark:border-[#2E2E2E] p-4 space-y-1.5">
                    <p className="font-semibold text-[#171717] dark:text-white flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      1. Verify phone &amp; identity badge
                    </p>
                    <p className="text-xs leading-relaxed">
                      Verify your phone number and submit your trade/ID details to earn a Verified Pro badge and build homeowner trust.
                    </p>
                  </div>
                  <div className="rounded-xl bg-[#FFFDF7] dark:bg-[#0D0D0D]/75 border border-[#E8DFC8] dark:border-[#2E2E2E] p-4 space-y-1.5">
                    <p className="font-semibold text-[#171717] dark:text-white flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      2. Accept/reject &amp; track monthly earnings
                    </p>
                    <p className="text-xs leading-relaxed">
                      Focus on your local service radius, accept or decline direct requests, update arrival milestones, and monitor daily and monthly earnings.
                    </p>
                  </div>
                </>
              ) : null}

              {activeTab === 'safety' ? (
                <>
                  <div className="rounded-xl bg-[#FFFDF7] dark:bg-[#0D0D0D]/75 border border-[#E8DFC8] dark:border-[#2E2E2E] p-4 space-y-1.5">
                    <p className="font-semibold text-[#171717] dark:text-white flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      Cancellation &amp; Dispute Protection
                    </p>
                    <p className="text-xs leading-relaxed">
                      Cancel free anytime before a technician starts travelling. Report suspicious accounts or payment disputes directly for admin review.
                    </p>
                  </div>
                  <div className="rounded-xl bg-[#FFFDF7] dark:bg-[#0D0D0D]/75 border border-[#E8DFC8] dark:border-[#2E2E2E] p-4 space-y-1.5">
                    <p className="font-semibold text-[#171717] dark:text-white flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-[#8F6412] dark:text-[#D6A84F]" />
                      Multiple Languages &amp; Currencies
                    </p>
                    <p className="text-xs leading-relaxed">
                      Supports English, Telugu, Hindi, Tamil, Bengali, Urdu, and 14 more languages with automatic local currency conversion.
                    </p>
                  </div>
                  <div className="rounded-xl bg-[#FFFDF7] dark:bg-[#0D0D0D]/75 border border-[#E8DFC8] dark:border-[#2E2E2E] p-4 space-y-1.5">
                    <p className="font-semibold text-[#171717] dark:text-white flex items-center gap-2">
                      <Globe className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      Electrical Safety Policy
                    </p>
                    <p className="text-xs leading-relaxed">
                      Never open live electrical panels or touch sparking wires. Switch off the main breaker and book a verified specialist.
                    </p>
                  </div>
                </>
              ) : null}
            </div>

            <div className="p-4 border-t border-[#E8DFC8] dark:border-[#2E2E2E] bg-slate-50/70 dark:bg-[#0D0D0D]/60 flex flex-col sm:flex-row gap-2.5 pb-safe">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAiBot();
                }}
                className="flex-1 min-h-[44px] px-4 py-2.5 rounded-xl border border-[#D8CEB4] dark:border-[#292929] bg-white dark:bg-[#121212] text-xs sm:text-sm font-semibold text-[#171717] dark:text-[#FFFDF7] hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
              >
                <Bot className="w-4 h-4 text-[#8F6412] dark:text-[#D6A84F]" />
                <span>AI Service Assistant</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onPostRepair();
                }}
                className="flex-1 min-h-[44px] px-4 py-2.5 rounded-xl bg-[#171717] dark:bg-[#D6A84F] text-white dark:text-[#171717] text-xs sm:text-sm font-semibold hover:bg-[#262626] dark:hover:brightness-110 transition-colors flex items-center justify-center gap-2"
              >
                <Wrench className="w-4 h-4" />
                <span>Book a Repair</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};
