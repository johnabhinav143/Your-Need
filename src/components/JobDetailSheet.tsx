import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  CreditCard,
  FileText,
  Lock,
  MapPin,
  MessageSquare,
  Phone,
  Send,
  ShieldCheck,
  Star,
  ThumbsDown,
  ThumbsUp,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import {
  CANCELLATION_POLICY_TEXT,
  CATEGORY_MAP,
  formatTimestamp,
  PAYMENT_METHOD_MAP,
  PAYMENT_METHOD_OPTIONS,
  STATUS_LABELS,
  URGENCY_LABELS,
} from '../constants';
import { formatMoney } from '../i18n/regions';
import {
  fetchJobPrivateContact,
  fetchJobTechPrivateContact,
  sendJobMessage,
  subscribeJobMessages,
} from '../services/firestoreService';
import {
  JobMessage,
  JobPrivateContact,
  JobStatus,
  JobTechPrivateContact,
  PaymentMethod,
  PaymentStatus,
  RepairJob,
  Review,
  TechnicianProfile,
} from '../types';
import { CategoryIcon } from './CategoryIcon';

interface JobDetailSheetProps {
  job: RepairJob | null;
  currentUid: string | null;
  currentName: string;
  myTechnicianProfile: TechnicianProfile | null;
  myPhone: string;
  existingReview: Review | null;
  submitting: boolean;
  onClose: () => void;
  onRequireAuth: (reason: string) => void;
  onOpenTechSetup: () => void;
  onAcceptJob: (
    job: RepairJob,
    eta: string,
    quotedFee: number,
    inspectionFee: number,
    techPhone: string
  ) => Promise<void>;
  onRejectJob: (job: RepairJob, reason: string) => Promise<void>;
  onReopenJob: (job: RepairJob) => Promise<void>;
  onApproveQuote: (job: RepairJob) => Promise<void>;
  onAdvanceStatus: (
    job: RepairJob,
    nextStatus: Extract<JobStatus, 'accepted' | 'en_route' | 'arrived' | 'in_progress' | 'completed'>,
    eta: string,
    quotedFee: number,
    inspectionFee: number,
    paymentStatus: PaymentStatus,
    workSummary?: string,
    partsReplaced?: string,
    warrantyDays?: number
  ) => Promise<void>;
  onSettlePayment: (job: RepairJob, paymentMethod: PaymentMethod) => Promise<void>;
  onCancelJob: (job: RepairJob, reason: string) => Promise<void>;
  onSubmitReview: (job: RepairJob, rating: number, comment: string) => Promise<void>;
  onOpenInvoice: (job: RepairJob) => void;
  onOpenReport: (params: {
    targetType: 'technician' | 'job' | 'user';
    targetId: string;
    targetName: string;
  }) => void;
}

const PROGRESS_STEPS: { status: JobStatus; label: string }[] = [
  { status: 'accepted', label: 'Accepted' },
  { status: 'en_route', label: 'Travelling' },
  { status: 'arrived', label: 'Arrived' },
  { status: 'in_progress', label: 'Started' },
  { status: 'completed', label: 'Completed' },
];

export function JobDetailSheet({
  job,
  currentUid,
  currentName,
  myTechnicianProfile,
  myPhone,
  existingReview,
  submitting,
  onClose,
  onRequireAuth,
  onOpenTechSetup,
  onAcceptJob,
  onRejectJob,
  onReopenJob,
  onApproveQuote,
  onAdvanceStatus,
  onSettlePayment,
  onCancelJob,
  onSubmitReview,
  onOpenInvoice,
  onOpenReport,
}: JobDetailSheetProps) {
  const [etaInput, setEtaInput] = useState('35 mins');
  const [quoteInput, setQuoteInput] = useState('35');
  const [inspectionInput, setInspectionInput] = useState('15');
  const [techPhoneInput, setTechPhoneInput] = useState('');
  const [workSummaryInput, setWorkSummaryInput] = useState('');
  const [partsInput, setPartsInput] = useState('');
  const [warrantyInput, setWarrantyInput] = useState('30');
  const [cancelReason, setCancelReason] = useState('');

  const [selectedPayMethod, setSelectedPayMethod] = useState<PaymentMethod>('cash');
  const [privateContact, setPrivateContact] = useState<JobPrivateContact | null>(null);
  const [techContact, setTechContact] = useState<JobTechPrivateContact | null>(null);
  const [messages, setMessages] = useState<JobMessage[]>([]);
  const [messageText, setMessageText] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  const isCustomer = Boolean(job && currentUid && job.customerId === currentUid);
  const isAssignedTech = Boolean(job && currentUid && job.technicianId === currentUid);
  const isTargetedTech = Boolean(
    job && currentUid && job.status === 'open' && job.targetTechnicianId === currentUid
  );

  useEffect(() => {
    if (!job) return;
    setEtaInput(
      job.technicianEta ||
        (myTechnicianProfile ? `${myTechnicianProfile.responseTimeMins} mins` : '40 mins')
    );
    setQuoteInput(String(job.quotedFee || job.estimatedBudget || 35));
    setInspectionInput(String(job.inspectionFee ?? myTechnicianProfile?.visitFee ?? 15));
    setTechPhoneInput(myPhone || '');
    setWorkSummaryInput(job.workSummary || '');
    setPartsInput(job.partsReplaced || '');
    setWarrantyInput(String(job.warrantyDays ?? 30));
    setCancelReason('');
    setSelectedPayMethod(job.paymentMethod || 'cash');
    setPrivateContact(null);
    setTechContact(null);
    setMessages([]);
    setRating(5);
    setReviewComment('');

    if (job.isSample || !currentUid) return;

    if (isCustomer || isAssignedTech) {
      fetchJobPrivateContact(job.id)
        .then((contact) => setPrivateContact(contact))
        .catch(() => setPrivateContact(null));

      if (job.technicianId) {
        fetchJobTechPrivateContact(job.id)
          .then((tc) => setTechContact(tc))
          .catch(() => setTechContact(null));
      }
    }

    if ((isCustomer || isAssignedTech) && job.technicianId) {
      const roleFilter = isCustomer ? 'customer' : 'technician';
      const unsub = subscribeJobMessages(job.id, roleFilter, currentUid, (msgs) => {
        setMessages(msgs);
      });
      return () => unsub();
    }
  }, [job, currentUid, isCustomer, isAssignedTech, myTechnicianProfile, myPhone]);

  const activeStepIndex = job
    ? PROGRESS_STEPS.findIndex((s) => s.status === job.status)
    : -1;

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job || !currentUid || !job.technicianId || !messageText.trim()) return;
    setSendingMsg(true);
    try {
      await sendJobMessage({
        jobId: job.id,
        senderId: currentUid,
        senderName: currentName,
        senderRole: isCustomer ? 'customer' : 'technician',
        customerId: job.customerId,
        technicianId: job.technicianId,
        text: messageText,
      });
      setMessageText('');
    } finally {
      setSendingMsg(false);
    }
  };

  return (
    <AnimatePresence>
      {job ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#171717]/55 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="job-detail-title"
        >
          <motion.div
            initial={{ y: 36, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 36, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="w-full sm:max-w-xl bg-white dark:bg-[#171717] rounded-t-3xl sm:rounded-2xl border border-[#E8DFC8] dark:border-[#2E2E2E] shadow-xl max-h-[92vh] flex flex-col"
          >
            <div className="px-6 pt-3 pb-4 border-b border-[#EFE8D5] dark:border-[#2E2E2E] shrink-0">
              <div className="w-10 h-1.5 bg-slate-300 dark:bg-[#262626] rounded-full mx-auto mb-3 sm:hidden" />
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[#FFFDF7] dark:bg-[#0D0D0D] text-[#292929] dark:text-[#D6A84F] flex items-center justify-center shrink-0 mt-0.5">
                    <CategoryIcon category={job.applianceCategory} className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-[#595959] dark:text-[#B5ADA0] truncate">
                      {CATEGORY_MAP[job.applianceCategory]} · {job.neighborhood}
                    </p>
                    <h2 id="job-detail-title" className="text-lg font-semibold text-[#171717] dark:text-white leading-snug mt-0.5">
                      {job.issueTitle}
                    </h2>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close job details"
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-[#595959] dark:text-[#B5ADA0] hover:text-[#171717] dark:hover:text-white hover:bg-[#FFFDF7] dark:hover:bg-[#121212] transition-colors shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto px-6 py-5 space-y-5">
              {/* 5-Step Live Tracking Timeline */}
              {job.status !== 'cancelled' && job.status !== 'rejected' ? (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#171717] dark:text-white">
                      Live Status: {STATUS_LABELS[job.status]}
                    </span>
                    <span className="text-[#595959] dark:text-[#B5ADA0]">{URGENCY_LABELS[job.urgency]}</span>
                  </div>
                  <div className="grid grid-cols-5 gap-1.5">
                    {PROGRESS_STEPS.map((step, idx) => {
                      const done = activeStepIndex >= idx;
                      return (
                        <div key={step.status} className="space-y-1">
                          <div
                            className={`h-1.5 rounded-full transition-colors ${
                              done ? 'bg-[#171717] dark:bg-[#D6A84F]' : 'bg-slate-200 dark:bg-[#262626]'
                            }`}
                          />
                          <span
                            className={`block text-[11px] truncate ${
                              done ? 'text-[#171717] dark:text-[#FFFDF7] font-semibold' : 'text-slate-400 dark:text-[#595959]'
                            }`}
                          >
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : job.status === 'rejected' ? (
                <div className="rounded-xl bg-amber-50 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/30 p-4 space-y-2.5">
                  <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                    Technician declined this direct request
                  </p>
                  <p className="text-xs text-amber-800 dark:text-amber-300">
                    {job.cancellationReason || 'The selected technician was unavailable for this time slot.'}
                  </p>
                  {isCustomer ? (
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => onReopenJob(job)}
                      className="min-h-[40px] px-4 py-2 rounded-xl bg-[#171717] text-white text-xs font-semibold hover:bg-[#262626]"
                    >
                      Broadcast Request to All Nearby Pros
                    </button>
                  ) : null}
                </div>
              ) : (
                <div className="rounded-xl bg-[#FFFDF7] dark:bg-[#0D0D0D] px-4 py-3 text-sm text-[#292929] dark:text-[#DDD6C7]">
                  This repair request was cancelled. {job.cancellationReason ? `(${job.cancellationReason})` : ''}
                </div>
              )}

              {/* Uploaded Problem Photo / Video Preview */}
              {job.mediaUrl ? (
                <div className="rounded-xl border border-[#E8DFC8] dark:border-[#2E2E2E] overflow-hidden bg-[#FFFDF7] dark:bg-[#0D0D0D]/65">
                  {job.mediaType === 'video' ? (
                    <video src={job.mediaUrl} controls className="w-full max-h-56 bg-black object-contain" />
                  ) : (
                    <img
                      src={job.mediaUrl}
                      alt={job.mediaLabel || 'Customer uploaded appliance fault'}
                      className="w-full max-h-56 object-cover"
                    />
                  )}
                  <div className="px-3.5 py-2 text-[11px] text-[#595959] dark:text-[#B5ADA0]">
                    Customer problem media: {job.mediaLabel || 'Fault attachment'}
                  </div>
                </div>
              ) : null}

              {/* Description & Pricing Transparency Grid */}
              <div className="space-y-3">
                <p className="text-sm text-[#292929] dark:text-[#DDD6C7] leading-relaxed">{job.issueDescription}</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-[#EFE8D5] dark:border-[#2E2E2E] text-xs">
                  <div>
                    <span className="block text-[#595959] dark:text-[#B5ADA0]">Homeowner</span>
                    <span className="font-semibold text-[#171717] dark:text-white">{job.customerName}</span>
                  </div>
                  <div>
                    <span className="block text-[#595959] dark:text-[#B5ADA0]">Visit slot</span>
                    <span className="font-semibold text-[#171717] dark:text-white">{job.preferredSlot}</span>
                  </div>
                  <div>
                    <span className="block text-[#595959] dark:text-[#B5ADA0]">Inspection fee</span>
                    <span className="tabular-nums font-bold text-[#171717] dark:text-white">
                      {formatMoney(job.inspectionFee ?? 0, job.currencyCode || 'USD')}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[#595959] dark:text-[#B5ADA0]">
                      {job.quotedFee > 0 ? 'Final quote' : 'Est. repair'}
                    </span>
                    <span className="tabular-nums font-bold text-[#171717] dark:text-white">
                      {formatMoney(
                        job.quotedFee > 0 ? job.quotedFee : job.estimatedBudget,
                        job.currencyCode || 'USD'
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Customer Final Price Approval Gate */}
              {job.quotedFee > 0 && job.status !== 'open' && job.status !== 'cancelled' && job.status !== 'rejected' ? (
                <div
                  className={`rounded-xl border p-4 space-y-2 ${
                    job.priceApproved
                      ? 'bg-emerald-50/70 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30'
                      : 'bg-amber-50/80 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold text-[#171717] dark:text-white">
                        {job.priceApproved
                          ? 'Final Repair Price Approved'
                          : 'Final Price Approval Required'}
                      </p>
                      <p className="text-xs text-[#292929] dark:text-[#DDD6C7] mt-0.5">
                        Total quote:{' '}
                        <strong className="tabular-nums">
                          {formatMoney(job.quotedFee, job.currencyCode || 'USD')}
                        </strong>{' '}
                        (includes {formatMoney(job.inspectionFee ?? 0, job.currencyCode || 'USD')} inspection)
                      </p>
                    </div>
                    {job.priceApproved ? (
                      <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1 shrink-0">
                        <ShieldCheck className="w-4 h-4" />
                        Approved
                      </span>
                    ) : isCustomer && job.status !== 'completed' ? (
                      <button
                        type="button"
                        disabled={submitting}
                        onClick={() => onApproveQuote(job)}
                        className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 shrink-0 flex items-center gap-1.5"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>Approve Price</span>
                      </button>
                    ) : (
                      <span className="text-xs font-semibold text-amber-800 dark:text-amber-300 shrink-0">
                        Awaiting customer
                      </span>
                    )}
                  </div>
                </div>
              ) : null}

              {/* Completed Digital Invoice Banner */}
              {job.status === 'completed' ? (
                <div className="rounded-xl bg-[#FFFDF7] dark:bg-[#D6A84F]/15 border border-[#D6A84F]/40 dark:border-[#D6A84F]/35 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-[#171717] dark:text-white flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-[#8F6412] dark:text-[#D6A84F]" />
                      <span>Digital Invoice &amp; Service Record Ready</span>
                    </p>
                    <p className="text-xs text-[#292929] dark:text-[#DDD6C7] mt-0.5">
                      {job.workSummary || 'Repair completed'} ·{' '}
                      {job.warrantyDays && job.warrantyDays > 0
                        ? `${job.warrantyDays}-day warranty`
                        : '30-day warranty'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onOpenInvoice(job)}
                    className="min-h-[42px] px-4 py-2 rounded-xl bg-[#171717] text-white text-xs font-semibold hover:bg-[#262626] shrink-0"
                  >
                    View Digital Invoice
                  </button>
                </div>
              ) : null}

              {/* Assigned technician banner + Direct Call */}
              {job.technicianId ? (
                <div className="rounded-xl bg-[#FFFDF7] dark:bg-[#0D0D0D]/75 border border-[#E8DFC8] dark:border-[#2E2E2E] p-4 space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-[#171717] dark:text-white">
                      Assigned Technician: {job.technicianName}
                    </span>
                    {job.technicianEta ? (
                      <span className="text-xs tabular-nums text-[#8F6412] dark:text-[#D6A84F] font-semibold">
                        ETA {job.technicianEta}
                      </span>
                    ) : null}
                  </div>
                  {techContact?.phone ? (
                    <div className="flex items-center justify-between gap-3 pt-1">
                      <span className="text-sm tabular-nums text-[#171717] dark:text-[#FFFDF7] font-medium flex items-center gap-2">
                        <Phone className="w-4 h-4 text-[#8F6412] dark:text-[#D6A84F]" />
                        {techContact.phone}
                      </span>
                      <a
                        href={`tel:${techContact.phone.replace(/\s+/g, '')}`}
                        className="min-h-[38px] px-3.5 py-1.5 rounded-lg bg-[#171717] dark:bg-[#D6A84F] text-white dark:text-[#171717] text-xs font-semibold hover:bg-[#262626] dark:hover:brightness-110 transition-colors flex items-center gap-1.5"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call Technician</span>
                      </a>
                    </div>
                  ) : (
                    <p className="text-xs text-[#595959] dark:text-[#B5ADA0]">
                      Use coordination messages below to confirm arrival or spare parts.
                    </p>
                  )}
                </div>
              ) : null}

              {/* Protected homeowner contact details */}
              {(isCustomer || isAssignedTech) && !job.isSample ? (
                <div className="rounded-xl bg-[#D6A84F]/10 dark:bg-[#D6A84F]/15 border border-[#D6A84F]/40 dark:border-[#D6A84F]/35 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#171717] dark:text-[#D6A84F]">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Homeowner Visit Address &amp; Phone</span>
                  </div>
                  {privateContact ? (
                    <div className="space-y-2 text-sm text-[#171717] dark:text-[#FFFDF7]">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[#595959] dark:text-[#B5ADA0] shrink-0" />
                        <span>{privateContact.streetAddress}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="tabular-nums font-medium flex items-center gap-2">
                          <Phone className="w-4 h-4 text-[#595959] dark:text-[#B5ADA0] shrink-0" />
                          {privateContact.phone}
                        </span>
                        {isAssignedTech ? (
                          <a
                            href={`tel:${privateContact.phone.replace(/\s+/g, '')}`}
                            className="min-h-[38px] px-3.5 py-1.5 rounded-lg bg-[#171717] dark:bg-[#D6A84F] text-white dark:text-[#171717] text-xs font-semibold hover:bg-[#262626] dark:hover:brightness-110 transition-colors flex items-center gap-1.5"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>Call Homeowner</span>
                          </a>
                        ) : null}
                      </div>
                      {privateContact.accessNote ? (
                        <p className="text-xs text-[#292929] dark:text-[#DDD6C7] pl-6">Note: {privateContact.accessNote}</p>
                      ) : null}
                    </div>
                  ) : (
                    <p className="text-xs text-[#292929] dark:text-[#DDD6C7]">Loading protected visit details...</p>
                  )}
                </div>
              ) : null}

              {/* Customer Payment Settlement Box */}
              {isCustomer &&
              !job.isSample &&
              job.paymentStatus !== 'paid' &&
              (job.status === 'accepted' ||
                job.status === 'en_route' ||
                job.status === 'arrived' ||
                job.status === 'in_progress') ? (
                <div className="rounded-xl border border-[#E8DFC8] dark:border-[#2E2E2E] bg-[#FFFDF7] dark:bg-[#0D0D0D]/75 p-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#171717] dark:text-white">
                    <CreditCard className="w-4 h-4 text-[#8F6412] dark:text-[#D6A84F]" />
                    <span>Settle payment ({formatMoney(job.quotedFee || job.estimatedBudget, job.currencyCode || 'USD')})</span>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                    {PAYMENT_METHOD_OPTIONS.map((pm) => (
                      <button
                        key={pm.id}
                        type="button"
                        onClick={() => setSelectedPayMethod(pm.id)}
                        className={`min-h-[40px] px-2 rounded-lg border text-xs font-medium transition-colors ${
                          selectedPayMethod === pm.id
                            ? 'bg-white dark:bg-[#171717] border-[#D6A84F] text-[#171717] dark:text-[#D6A84F] font-semibold'
                            : 'bg-[#FFFDF7] dark:bg-[#0D0D0D] border-transparent text-[#292929] dark:text-[#DDD6C7]'
                        }`}
                      >
                        {pm.shortLabel}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => onSettlePayment(job, selectedPayMethod)}
                    className="w-full min-h-[44px] px-4 py-2 rounded-xl bg-[#171717] dark:bg-[#D6A84F] text-white dark:text-[#171717] text-xs sm:text-sm font-semibold hover:bg-[#262626] dark:hover:brightness-110 disabled:opacity-60 transition-colors"
                  >
                    Confirm Payment via {PAYMENT_METHOD_MAP[selectedPayMethod]}
                  </button>
                </div>
              ) : null}

              {/* Open Job Action: Technician Claim or Reject */}
              {job.status === 'open' && !isCustomer ? (
                <div className="rounded-xl border border-[#E8DFC8] dark:border-[#2E2E2E] bg-[#FFFDF7] dark:bg-[#0D0D0D]/75 p-4 space-y-4">
                  {job.isSample ? (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-[#171717] dark:text-white">Example neighborhood listing</p>
                      <p className="text-xs text-[#292929] dark:text-[#DDD6C7]">
                        Sign in with Google and register your technician profile to claim live homeowner requests in your area.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          if (!currentUid) {
                            onRequireAuth('Sign in with Google to register as a technician and accept live jobs.');
                          } else {
                            onOpenTechSetup();
                          }
                        }}
                        className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-[#171717] dark:bg-[#D6A84F] text-white dark:text-[#171717] text-sm font-semibold hover:bg-[#262626] dark:hover:brightness-110 transition-colors"
                      >
                        {currentUid ? 'Set Up My Technician Profile' : 'Sign In to Claim Live Jobs'}
                      </button>
                    </div>
                  ) : !currentUid ? (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-[#171717] dark:text-white">Ready to take this job?</p>
                      <p className="text-xs text-[#292929] dark:text-[#DDD6C7]">
                        Sign in with Google to accept this request and unlock the homeowner&apos;s address and phone number.
                      </p>
                      <button
                        type="button"
                        onClick={() =>
                          onRequireAuth('Sign in with Google to accept this repair job.')
                        }
                        className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-[#171717] dark:bg-[#D6A84F] text-white dark:text-[#171717] text-sm font-semibold hover:bg-[#262626] dark:hover:brightness-110 transition-colors"
                      >
                        Sign In &amp; Accept Job
                      </button>
                    </div>
                  ) : !myTechnicianProfile ? (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-[#171717] dark:text-white">
                        Create your technician profile first
                      </p>
                      <p className="text-xs text-[#292929] dark:text-[#DDD6C7]">
                        A quick technician profile lets homeowners see your specialties, verification badge, and contact phone.
                      </p>
                      <button
                        type="button"
                        onClick={onOpenTechSetup}
                        className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-[#171717] dark:bg-[#D6A84F] text-white dark:text-[#171717] text-sm font-semibold hover:bg-[#262626] dark:hover:brightness-110 transition-colors"
                      >
                        Create Technician Profile
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-[#171717] dark:text-white">
                        Accept &amp; Quote this repair job
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label htmlFor="accept-eta" className="block text-xs font-medium text-[#292929] dark:text-[#DDD6C7] mb-1">
                            Arrival ETA
                          </label>
                          <input
                            id="accept-eta"
                            type="text"
                            maxLength={60}
                            value={etaInput}
                            onChange={(e) => setEtaInput(e.target.value)}
                            placeholder="e.g., 30 mins"
                            className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-[#D8CEB4] dark:border-[#292929] bg-white dark:bg-[#121212] text-sm text-[#171717] dark:text-[#FFFDF7]"
                          />
                        </div>
                        <div>
                          <label htmlFor="accept-phone" className="block text-xs font-medium text-[#292929] dark:text-[#DDD6C7] mb-1">
                            Your phone
                          </label>
                          <input
                            id="accept-phone"
                            type="tel"
                            maxLength={30}
                            value={techPhoneInput}
                            onChange={(e) => setTechPhoneInput(e.target.value)}
                            placeholder="+91 98765..."
                            className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-[#D8CEB4] dark:border-[#292929] bg-white dark:bg-[#121212] text-sm tabular-nums text-[#171717] dark:text-[#FFFDF7]"
                          />
                        </div>
                        <div>
                          <label htmlFor="accept-inspect" className="block text-xs font-medium text-[#292929] dark:text-[#DDD6C7] mb-1">
                            Inspection fee ({job.currencyCode || 'USD'})
                          </label>
                          <input
                            id="accept-inspect"
                            type="number"
                            min={0}
                            max={10000000}
                            value={inspectionInput}
                            onChange={(e) => setInspectionInput(e.target.value)}
                            className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-[#D8CEB4] dark:border-[#292929] bg-white dark:bg-[#121212] text-sm tabular-nums text-[#171717] dark:text-[#FFFDF7]"
                          />
                        </div>
                        <div>
                          <label htmlFor="accept-quote" className="block text-xs font-medium text-[#292929] dark:text-[#DDD6C7] mb-1">
                            Estimated Total Quote ({job.currencyCode || 'USD'})
                          </label>
                          <input
                            id="accept-quote"
                            type="number"
                            min={0}
                            max={10000000}
                            value={quoteInput}
                            onChange={(e) => setQuoteInput(e.target.value)}
                            className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-[#D8CEB4] dark:border-[#292929] bg-white dark:bg-[#121212] text-sm tabular-nums text-[#171717] dark:text-[#FFFDF7]"
                          />
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={submitting}
                          onClick={() =>
                            onAcceptJob(
                              job,
                              etaInput,
                              Number(quoteInput) || 0,
                              Number(inspectionInput) || 0,
                              techPhoneInput.trim()
                            )
                          }
                          className="flex-1 min-h-[48px] px-4 py-2.5 rounded-xl bg-[#171717] text-white text-sm font-semibold hover:bg-[#262626] disabled:opacity-60 transition-colors"
                        >
                          {submitting ? 'Claiming job...' : 'Accept Job & Share Contact'}
                        </button>
                        {isTargetedTech ? (
                          <button
                            type="button"
                            disabled={submitting}
                            onClick={() =>
                              onRejectJob(job, 'Technician busy for this requested time slot')
                            }
                            className="min-h-[48px] px-4 py-2.5 rounded-xl border border-rose-300 dark:border-rose-700 text-rose-700 dark:text-rose-300 text-sm font-semibold hover:bg-rose-50 dark:hover:bg-rose-500/15 flex items-center gap-1.5"
                          >
                            <ThumbsDown className="w-4 h-4" />
                            <span>Reject</span>
                          </button>
                        ) : null}
                      </div>
                    </div>
                  )}
                </div>
              ) : null}

              {/* Assigned Technician Status Controls + Completion Invoice Inputs */}
              {isAssignedTech &&
              job.status !== 'completed' &&
              job.status !== 'cancelled' &&
              job.status !== 'rejected' ? (
                <div className="rounded-xl border border-[#E8DFC8] dark:border-[#2E2E2E] bg-[#FFFDF7] dark:bg-[#0D0D0D]/75 p-4 space-y-3">
                  <h3 className="text-sm font-semibold text-[#171717] dark:text-white">
                    Live Service &amp; Invoice Controls
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label htmlFor="update-eta" className="block text-xs font-medium text-[#292929] dark:text-[#DDD6C7] mb-1">
                        Updated ETA
                      </label>
                      <input
                        id="update-eta"
                        type="text"
                        maxLength={60}
                        value={etaInput}
                        onChange={(e) => setEtaInput(e.target.value)}
                        className="w-full min-h-[42px] px-3 py-2 rounded-xl border border-[#D8CEB4] dark:border-[#292929] bg-white dark:bg-[#121212] text-sm text-[#171717] dark:text-[#FFFDF7]"
                      />
                    </div>
                    <div>
                      <label htmlFor="update-inspect" className="block text-xs font-medium text-[#292929] dark:text-[#DDD6C7] mb-1">
                        Inspection ({job.currencyCode || 'USD'})
                      </label>
                      <input
                        id="update-inspect"
                        type="number"
                        min={0}
                        max={10000000}
                        value={inspectionInput}
                        onChange={(e) => setInspectionInput(e.target.value)}
                        className="w-full min-h-[42px] px-3 py-2 rounded-xl border border-[#D8CEB4] dark:border-[#292929] bg-white dark:bg-[#121212] text-sm tabular-nums text-[#171717] dark:text-[#FFFDF7]"
                      />
                    </div>
                    <div>
                      <label htmlFor="update-fee" className="block text-xs font-medium text-[#292929] dark:text-[#DDD6C7] mb-1">
                        Final total ({job.currencyCode || 'USD'})
                      </label>
                      <input
                        id="update-fee"
                        type="number"
                        min={0}
                        max={10000000}
                        value={quoteInput}
                        onChange={(e) => setQuoteInput(e.target.value)}
                        className="w-full min-h-[42px] px-3 py-2 rounded-xl border border-[#D8CEB4] dark:border-[#292929] bg-white dark:bg-[#121212] text-sm tabular-nums text-[#171717] dark:text-[#FFFDF7]"
                      />
                    </div>
                  </div>

                  {/* Invoice summary fields for completion */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    <div className="sm:col-span-2">
                      <label htmlFor="work-summary" className="block text-xs font-medium text-[#292929] dark:text-[#DDD6C7] mb-1">
                        Work performed (for Digital Invoice)
                      </label>
                      <input
                        id="work-summary"
                        type="text"
                        maxLength={400}
                        value={workSummaryInput}
                        onChange={(e) => setWorkSummaryInput(e.target.value)}
                        placeholder="e.g., Replaced faulty capacitor and tested full cooling cycle"
                        className="w-full min-h-[42px] px-3 py-2 rounded-xl border border-[#D8CEB4] dark:border-[#292929] bg-white dark:bg-[#121212] text-xs text-[#171717] dark:text-[#FFFDF7]"
                      />
                    </div>
                    <div>
                      <label htmlFor="warranty-days" className="block text-xs font-medium text-[#292929] dark:text-[#DDD6C7] mb-1">
                        Warranty (days)
                      </label>
                      <input
                        id="warranty-days"
                        type="number"
                        min={0}
                        max={1825}
                        value={warrantyInput}
                        onChange={(e) => setWarrantyInput(e.target.value)}
                        className="w-full min-h-[42px] px-3 py-2 rounded-xl border border-[#D8CEB4] dark:border-[#292929] bg-white dark:bg-[#121212] text-xs tabular-nums text-[#171717] dark:text-[#FFFDF7]"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="parts-replaced" className="block text-xs font-medium text-[#292929] dark:text-[#DDD6C7] mb-1">
                      Parts replaced (optional)
                    </label>
                    <input
                      id="parts-replaced"
                      type="text"
                      maxLength={250}
                      value={partsInput}
                      onChange={(e) => setPartsInput(e.target.value)}
                      placeholder="e.g., 2.5uF Capacitor, Copper Flare Nut"
                      className="w-full min-h-[40px] px-3 py-1.5 rounded-xl border border-[#D8CEB4] dark:border-[#292929] bg-white dark:bg-[#121212] text-xs text-[#171717] dark:text-[#FFFDF7]"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {job.status === 'accepted' ? (
                      <button
                        type="button"
                        disabled={submitting}
                        onClick={() =>
                          onAdvanceStatus(
                            job,
                            'en_route',
                            etaInput,
                            Number(quoteInput) || 0,
                            Number(inspectionInput) || 0,
                            job.paymentStatus || 'pending'
                          )
                        }
                        className="flex-1 min-h-[44px] px-3 py-2 rounded-xl bg-[#171717] dark:bg-[#D6A84F] text-white dark:text-[#171717] text-xs sm:text-sm font-semibold hover:bg-[#262626]"
                      >
                        Mark Travelling
                      </button>
                    ) : null}
                    {job.status === 'accepted' || job.status === 'en_route' ? (
                      <button
                        type="button"
                        disabled={submitting}
                        onClick={() =>
                          onAdvanceStatus(
                            job,
                            'arrived',
                            'Arrived on site',
                            Number(quoteInput) || 0,
                            Number(inspectionInput) || 0,
                            job.paymentStatus || 'pending'
                          )
                        }
                        className="flex-1 min-h-[44px] px-3 py-2 rounded-xl bg-[#171717] text-white text-xs sm:text-sm font-semibold hover:bg-[#262626]"
                      >
                        Mark Arrived
                      </button>
                    ) : null}
                    {job.status === 'accepted' || job.status === 'en_route' || job.status === 'arrived' ? (
                      <button
                        type="button"
                        disabled={submitting}
                        onClick={() =>
                          onAdvanceStatus(
                            job,
                            'in_progress',
                            etaInput,
                            Number(quoteInput) || 0,
                            Number(inspectionInput) || 0,
                            job.paymentStatus || 'pending'
                          )
                        }
                        className="flex-1 min-h-[44px] px-3 py-2 rounded-xl bg-[#171717] dark:bg-[#262626] text-white text-xs sm:text-sm font-semibold hover:bg-slate-800"
                      >
                        Start Service
                      </button>
                    ) : null}
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() =>
                        onAdvanceStatus(
                          job,
                          'completed',
                          etaInput,
                          Number(quoteInput) || 0,
                          Number(inspectionInput) || 0,
                          'paid',
                          workSummaryInput.trim() || `Completed repair for ${job.issueTitle}`,
                          partsInput.trim() || 'Standard service consumables',
                          Number(warrantyInput) || 30
                        )
                      }
                      className="flex-1 min-h-[44px] px-4 py-2 rounded-xl bg-emerald-700 dark:bg-emerald-600 text-white text-xs sm:text-sm font-semibold hover:bg-emerald-800 flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Complete &amp; Invoice</span>
                    </button>
                  </div>
                </div>
              ) : null}

              {/* Coordination Chat */}
              {(isCustomer || isAssignedTech) && job.technicianId && !job.isSample ? (
                <div className="border-t border-[#E8DFC8] dark:border-[#2E2E2E] pt-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#171717] dark:text-white">
                    <MessageSquare className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                    <span>Direct coordination messages</span>
                  </div>
                  <div className="max-h-48 overflow-y-auto space-y-2 rounded-xl bg-[#FFFDF7] dark:bg-[#0D0D0D]/75 border border-[#E8DFC8] dark:border-[#2E2E2E] p-3">
                    {messages.length === 0 ? (
                      <p className="text-xs text-[#595959] dark:text-[#B5ADA0] text-center py-4">
                        No messages yet. Share arrival updates or final quote details here.
                      </p>
                    ) : (
                      messages.map((msg) => {
                        const mine = msg.senderId === currentUid;
                        return (
                          <div
                            key={msg.id}
                            className={`flex flex-col ${mine ? 'items-end' : 'items-start'}`}
                          >
                            <div
                              className={`max-w-[85%] rounded-xl px-3.5 py-2 text-sm ${
                                mine
                                  ? 'bg-[#171717] dark:bg-[#D6A84F] text-white dark:text-[#171717]'
                                  : 'bg-white dark:bg-[#171717] border border-[#E8DFC8] dark:border-[#2E2E2E] text-[#171717] dark:text-[#FFFDF7]'
                              }`}
                            >
                              <p>{msg.text}</p>
                            </div>
                            <span className="text-[11px] text-slate-400 dark:text-[#595959] mt-0.5">
                              {msg.senderName} · {formatTimestamp(msg.createdAt)}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                  {job.status !== 'cancelled' ? (
                    <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                      <input
                        type="text"
                        maxLength={500}
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        placeholder="Write a message..."
                        className="flex-1 min-h-[44px] px-3.5 py-2 rounded-xl border border-[#D8CEB4] dark:border-[#292929] bg-white dark:bg-[#121212] text-sm text-[#171717] dark:text-[#FFFDF7] focus:outline-none focus:ring-2 focus:ring-[#D6A84F]"
                      />
                      <button
                        type="submit"
                        disabled={sendingMsg || !messageText.trim()}
                        aria-label="Send message"
                        className="min-h-[44px] min-w-[44px] px-3.5 rounded-xl bg-[#171717] dark:bg-[#D6A84F] text-white dark:text-[#171717] hover:bg-[#262626] dark:hover:brightness-110 disabled:opacity-50 transition-colors flex items-center justify-center"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </form>
                  ) : null}
                </div>
              ) : null}

              {/* Completed Review Section */}
              {isCustomer && job.status === 'completed' ? (
                <div className="border-t border-[#E8DFC8] dark:border-[#2E2E2E] pt-4 space-y-3">
                  {existingReview ? (
                    <div className="rounded-xl bg-[#FFFDF7] dark:bg-[#0D0D0D]/75 border border-[#E8DFC8] dark:border-[#2E2E2E] p-4 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-[#171717] dark:text-white">Your verified review</span>
                        <span className="text-sm tabular-nums text-amber-600 dark:text-amber-400 font-semibold">
                          {existingReview.rating}/5 ★
                        </span>
                      </div>
                      <p className="text-sm text-[#292929] dark:text-[#DDD6C7]">{existingReview.comment}</p>
                    </div>
                  ) : (
                    <div className="rounded-xl bg-[#FFFDF7] dark:bg-[#0D0D0D]/75 border border-[#E8DFC8] dark:border-[#2E2E2E] p-4 space-y-3">
                      <h3 className="text-sm font-semibold text-[#171717] dark:text-white">
                        Rate {job.technicianName}&apos;s repair
                      </h3>
                      <div className="flex items-center gap-1.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            aria-label={`Rate ${star} stars`}
                            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-colors"
                          >
                            <Star
                              className={`w-6 h-6 ${
                                star <= rating
                                  ? 'fill-amber-400 text-amber-500'
                                  : 'text-slate-300 dark:text-slate-600'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                      <textarea
                        rows={2}
                        maxLength={400}
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="Was the technician punctual and clear on pricing?"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8CEB4] dark:border-[#292929] bg-white dark:bg-[#121212] text-sm text-[#171717] dark:text-[#FFFDF7] focus:outline-none focus:ring-2 focus:ring-[#D6A84F]"
                      />
                      <button
                        type="button"
                        disabled={submitting || reviewComment.trim().length < 2}
                        onClick={() => onSubmitReview(job, rating, reviewComment.trim())}
                        className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-[#171717] dark:bg-[#D6A84F] text-white dark:text-[#171717] text-sm font-semibold hover:bg-[#262626] dark:hover:brightness-110 disabled:opacity-50 transition-colors"
                      >
                        {submitting ? 'Submitting review...' : 'Submit Verified Review'}
                      </button>
                    </div>
                  )}
                </div>
              ) : null}

              {/* Customer cancel & Report actions */}
              {!job.isSample && currentUid ? (
                <div className="pt-3 border-t border-[#EFE8D5] dark:border-[#2E2E2E] space-y-2.5">
                  {isCustomer &&
                  (job.status === 'open' ||
                    job.status === 'accepted' ||
                    job.status === 'en_route' ||
                    job.status === 'arrived') ? (
                    <div className="space-y-2">
                      <p className="text-[11px] text-[#595959] dark:text-[#B5ADA0]">
                        {CANCELLATION_POLICY_TEXT}
                      </p>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          maxLength={200}
                          value={cancelReason}
                          onChange={(e) => setCancelReason(e.target.value)}
                          placeholder="Reason for cancellation (optional)"
                          className="flex-1 min-h-[40px] px-3 py-1.5 rounded-xl border border-[#E8DFC8] dark:border-[#2E2E2E] bg-slate-50 dark:bg-[#121212] text-xs"
                        />
                        <button
                          type="button"
                          disabled={submitting}
                          onClick={() =>
                            onCancelJob(job, cancelReason.trim() || 'Cancelled by homeowner')
                          }
                          className="min-h-[40px] px-4 py-1.5 rounded-xl text-xs font-semibold text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 hover:bg-rose-50 dark:hover:bg-rose-500/15"
                        >
                          Cancel Request
                        </button>
                      </div>
                    </div>
                  ) : null}

                  <div className="flex items-center justify-between text-xs text-[#595959] dark:text-[#B5ADA0]">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      Posted {formatTimestamp(job.createdAt)}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        onOpenReport({
                          targetType: job.technicianId && isCustomer ? 'technician' : 'job',
                          targetId:
                            job.technicianId && isCustomer ? job.technicianId : job.id,
                          targetName:
                            job.technicianId && isCustomer
                              ? job.technicianName
                              : job.issueTitle,
                        })
                      }
                      className="text-xs font-semibold text-rose-700 dark:text-rose-400 hover:underline flex items-center gap-1"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Report / Dispute</span>
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
