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
          className="fixed inset-0 z-50 bg-[#040B08]/75 backdrop-blur-md flex items-end sm:items-center justify-center sm:p-4"
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
            className="w-full sm:max-w-lg yn-glass-card yn-tricolor-border rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[88vh] overflow-hidden"
          >
            {/* Header */}
            <div className="px-6 py-4.5 border-b border-[#075E36]/12 dark:border-white/[0.08] flex items-center justify-between gap-3 bg-gradient-to-r from-[#FF9933]/10 via-white/10 to-[#138808]/10">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl yn-btn-saffron flex items-center justify-center shrink-0">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-sm sm:text-base font-bold text-[#18231E] dark:text-[#FFFDF8] font-display truncate">
                    AI Service Assistant
                  </h2>
                  <p className="text-xs text-[#43564D] dark:text-[#9CB0A6] truncate mt-0.5">
                    {regionName} · {currencyCode} · {languageName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close AI helper"
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-[#43564D] dark:text-[#9CB0A6] hover:bg-[#FF9933]/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick symptom pills */}
            <div className="px-5 py-3 border-b border-[#075E36]/12 dark:border-white/[0.08] flex items-center gap-2.5 overflow-x-auto bg-[#E8EDF2]/60 dark:bg-[#07130F]/65">
              {quickPrompts.map((q) => (
                <button
                  key={q}
                  type="button"
                  disabled={loading}
                  onClick={() => sendPrompt(q)}
                  className="min-h-[40px] px-3.5 py-2 rounded-xl bg-[#FFFDF8] dark:bg-[#071B16] border border-[#075E36]/15 dark:border-white/[0.10] text-xs font-medium text-[#18231E] dark:text-[#E8EDF2] hover:border-[#FF9933]/60 transition-colors whitespace-nowrap shrink-0"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Chat history */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} gap-2.5`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${
                      msg.role === 'user'
                        ? 'yn-btn-saffron rounded-br-md'
                        : 'bg-[#FFFDF8] dark:bg-[#07130F] text-[#18231E] dark:text-[#FFFDF8] rounded-bl-md border border-[#075E36]/15 dark:border-white/[0.10]'
                    }`}
                  >
                    {msg.text}
                  </div>

                  {msg.safetyWarning ? (
                    <div className="max-w-[88%] rounded-xl bg-[#FF9933]/12 border border-[#FF9933]/35 px-3 py-2 text-xs text-[#18231E] dark:text-[#FFD28A] flex items-start gap-2">
                      <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-[#E87516] dark:text-[#FFB866]" />
                      <span>{msg.safetyWarning}</span>
                    </div>
                  ) : null}

                  {msg.bookingDraft ? (
                    <div className="max-w-[88%] w-full rounded-xl bg-[#138808]/10 dark:bg-[#35C46A]/10 border border-[#35C46A]/35 p-3 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-[#138808] dark:text-[#7DFF9B]">
                          Category: {CATEGORY_MAP[msg.bookingDraft.category] || msg.bookingDraft.category}
                        </span>
                        <span className="text-[#E87516] dark:text-[#FFD28A] font-medium">
                          Ready to book
                        </span>
                      </div>
                      <p className="text-xs text-[#18231E] dark:text-[#FFFDF8] font-medium">
                        {msg.bookingDraft.issueTitle}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onBookRepair(msg.bookingDraft);
                        }}
                        className="w-full min-h-[40px] px-3 py-2 rounded-xl yn-btn-emerald text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
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
                  <div className="rounded-2xl rounded-bl-md px-4 py-2.5 bg-[#FFFDF8] dark:bg-[#07130F] border border-[#075E36]/15 dark:border-white/[0.10] text-xs text-[#43564D] dark:text-[#9CB0A6] flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-[#E87516] dark:text-[#FFB866] animate-pulse" />
                    <span>Diagnosing category safely...</span>
                  </div>
                </div>
              ) : null}

              {errorMsg ? (
                <div className="rounded-xl bg-rose-500/15 border border-rose-500/30 px-3.5 py-2.5 text-xs text-rose-700 dark:text-rose-200 space-y-2">
                  <p>{errorMsg}</p>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onBookRepair(null);
                    }}
                    className="inline-flex items-center gap-1.5 font-semibold text-[#E87516] dark:text-[#FFD28A] hover:underline"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Continue with Direct Booking Form</span>
                  </button>
                </div>
              ) : null}

              <div ref={bottomRef} />
            </div>

            {/* Book shortcut + Message input */}
            <div className="p-4 sm:p-5 border-t border-[#075E36]/12 dark:border-white/[0.08] bg-[#FFFDF8]/90 dark:bg-[#071B16]/90 space-y-3 pb-safe">
              <div className="flex items-center justify-between gap-2 text-xs text-[#43564D] dark:text-[#9CB0A6]">
                <span>Need a verified technician in person?</span>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onBookRepair(null);
                  }}
                  className="font-semibold text-[#E87516] dark:text-[#FFB866] hover:underline flex items-center gap-1.5"
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
                className="flex items-center gap-2.5"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Describe your fan, washer, AC, or fridge issue..."
                  maxLength={350}
                  className="flex-1 min-h-[46px] px-4 py-2.5 rounded-xl border border-[#075E36]/20 dark:border-white/[0.12] bg-[#FFFDF8] dark:bg-[#07130F] text-sm text-[#18231E] dark:text-[#FFFDF8] placeholder:text-[#5B6F65] dark:placeholder:text-[#7E948A] focus:outline-none focus:ring-2 focus:ring-[#FF9933]"
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  aria-label="Send message"
                  className="min-h-[46px] min-w-[46px] px-4 rounded-xl yn-btn-saffron font-semibold disabled:opacity-50 transition-all flex items-center justify-center"
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
          className="fixed inset-0 z-50 bg-[#040B08]/75 backdrop-blur-md flex items-end sm:items-center justify-center sm:p-4"
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
            className="w-full sm:max-w-lg yn-glass-card yn-tricolor-border rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[88vh] flex flex-col overflow-hidden"
          >
            <div className="px-6 py-4.5 border-b border-[#075E36]/12 dark:border-white/[0.08] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FF9933]/15 border border-[#FF9933]/35 text-[#E87516] dark:text-[#FFB866] flex items-center justify-center">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#18231E] dark:text-[#FFFDF8] font-display">
                    Help &amp; Trust Policies
                  </h2>
                  <p className="text-xs text-[#43564D] dark:text-[#9CB0A6] mt-0.5">
                    Transparent booking for {regionName} ({currencyCode})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close help guide"
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-[#43564D] dark:text-[#9CB0A6] hover:bg-[#FF9933]/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 pt-4">
              <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-[#E8EDF2] dark:bg-[#07130F] border border-[#075E36]/12 dark:border-white/[0.08] rounded-2xl">
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
                    className={`min-h-[42px] px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      activeTab === tab.id
                        ? 'yn-btn-saffron shadow-sm'
                        : 'text-[#43564D] dark:text-[#9CB0A6] hover:text-[#18231E] dark:hover:text-[#FFFDF8]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-sm text-[#43564D] dark:text-[#9CB0A6]">
              {activeTab === 'customer' ? (
                <>
                  <div className="rounded-xl bg-[#FFFDF8] dark:bg-[#07130F]/80 border border-[#075E36]/15 dark:border-white/[0.10] p-4 space-y-1.5">
                    <p className="font-semibold text-[#18231E] dark:text-[#FFFDF8] flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#E87516] dark:text-[#FFB866]" />
                      1. Describe issue + upload photo/video
                    </p>
                    <p className="text-xs leading-relaxed">
                      Use the AI Service Assistant or post directly with a fault photo, preferred slot, and transparent inspection + repair estimate in {currencyCode}.
                    </p>
                  </div>
                  <div className="rounded-xl bg-[#FFFDF8] dark:bg-[#07130F]/80 border border-[#075E36]/15 dark:border-white/[0.10] p-4 space-y-1.5">
                    <p className="font-semibold text-[#18231E] dark:text-[#FFFDF8] flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#E87516] dark:text-[#FFB866]" />
                      2. Track live &amp; approve final price
                    </p>
                    <p className="text-xs leading-relaxed">
                      Follow 5 live steps: Accepted → Travelling → Arrived → Started → Completed. Always approve the final repair quote before work begins.
                    </p>
                  </div>
                  <div className="rounded-xl bg-[#FFFDF8] dark:bg-[#07130F]/80 border border-[#075E36]/15 dark:border-white/[0.10] p-4 space-y-1.5">
                    <p className="font-semibold text-[#18231E] dark:text-[#FFFDF8] flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#138808] dark:text-[#7DFF9B]" />
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
                  <div className="rounded-xl bg-[#FFFDF8] dark:bg-[#07130F]/80 border border-[#075E36]/15 dark:border-white/[0.10] p-4 space-y-1.5">
                    <p className="font-semibold text-[#18231E] dark:text-[#FFFDF8] flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-[#138808] dark:text-[#7DFF9B]" />
                      1. Verify phone &amp; identity badge
                    </p>
                    <p className="text-xs leading-relaxed">
                      Verify your phone number and submit your trade/ID details to earn a Verified Pro badge and build homeowner trust.
                    </p>
                  </div>
                  <div className="rounded-xl bg-[#FFFDF8] dark:bg-[#07130F]/80 border border-[#075E36]/15 dark:border-white/[0.10] p-4 space-y-1.5">
                    <p className="font-semibold text-[#18231E] dark:text-[#FFFDF8] flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-[#138808] dark:text-[#7DFF9B]" />
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
                  <div className="rounded-xl bg-[#FFFDF8] dark:bg-[#07130F]/80 border border-[#075E36]/15 dark:border-white/[0.10] p-4 space-y-1.5">
                    <p className="font-semibold text-[#18231E] dark:text-[#FFFDF8] flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-[#138808] dark:text-[#7DFF9B]" />
                      Cancellation &amp; Dispute Protection
                    </p>
                    <p className="text-xs leading-relaxed">
                      Cancel free anytime before a technician starts travelling. Report suspicious accounts or payment disputes directly for admin review.
                    </p>
                  </div>
                  <div className="rounded-xl bg-[#FFFDF8] dark:bg-[#07130F]/80 border border-[#075E36]/15 dark:border-white/[0.10] p-4 space-y-1.5">
                    <p className="font-semibold text-[#18231E] dark:text-[#FFFDF8] flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-[#E87516] dark:text-[#FFB866]" />
                      Multiple Languages &amp; Currencies
                    </p>
                    <p className="text-xs leading-relaxed">
                      Supports English, Telugu, Hindi, Tamil, Bengali, Urdu, and 14 more languages with automatic local currency conversion.
                    </p>
                  </div>
                  <div className="rounded-xl bg-[#FFFDF8] dark:bg-[#07130F]/80 border border-[#075E36]/15 dark:border-white/[0.10] p-4 space-y-1.5">
                    <p className="font-semibold text-[#18231E] dark:text-[#FFFDF8] flex items-center gap-2">
                      <Globe className="w-4 h-4 text-[#E87516] dark:text-[#FFB866]" />
                      Electrical Safety Policy
                    </p>
                    <p className="text-xs leading-relaxed">
                      Never open live electrical panels or touch sparking wires. Switch off the main breaker and book a verified specialist.
                    </p>
                  </div>
                </>
              ) : null}
            </div>

            <div className="p-5 border-t border-[#075E36]/12 dark:border-white/[0.08] bg-[#E8EDF2]/60 dark:bg-[#07130F]/70 flex flex-col sm:flex-row gap-3 pb-safe">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAiBot();
                }}
                className="flex-1 min-h-[46px] px-4 py-2.5 rounded-xl border border-[#075E36]/20 dark:border-white/[0.12] bg-[#FFFDF8] dark:bg-[#071B16] text-xs sm:text-sm font-semibold text-[#18231E] dark:text-[#FFFDF8] hover:border-[#FF9933]/40 transition-colors flex items-center justify-center gap-2"
              >
                <Bot className="w-4 h-4 text-[#E87516] dark:text-[#FFB866]" />
                <span>AI Service Assistant</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onPostRepair();
                }}
                className="flex-1 min-h-[46px] px-4 py-2.5 rounded-xl yn-btn-saffron text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2"
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
