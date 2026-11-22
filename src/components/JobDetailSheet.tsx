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
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#040B08]/75 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-labelledby="job-detail-title"
        >
          <motion.div
            initial={{ y: 36, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 36, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="w-full sm:max-w-xl yn-glass-card yn-tricolor-border rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] flex flex-col"
          >
            <div className="px-6 sm:px-7 pt-4 pb-5 border-b border-[#075E36]/12 dark:border-white/[0.08] shrink-0">
              <div className="w-10 h-1.5 bg-[#075E36]/20 dark:bg-white/[0.15] rounded-full mx-auto mb-3.5 sm:hidden" />
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="w-11 h-11 rounded-2xl bg-[#FF9933]/14 border border-[#FF9933]/30 text-[#E87516] dark:text-[#FFB866] flex items-center justify-center shrink-0 mt-0.5">
                    <CategoryIcon category={job.applianceCategory} className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <p className="text-xs font-medium text-[#43564D] dark:text-[#9CB0A6] truncate">
                      {CATEGORY_MAP[job.applianceCategory]} · {job.neighborhood}
                    </p>
                    <h2 id="job-detail-title" className="text-lg sm:text-xl font-bold text-[#18231E] dark:text-[#FFFDF8] leading-snug">
                      {job.issueTitle}
                    </h2>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close job details"
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-[#43564D] dark:text-[#9CB0A6] hover:text-[#18231E] dark:hover:text-[#FFFDF8] hover:bg-[#FF9933]/10 transition-colors shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto px-6 sm:px-7 py-6 space-y-6">
              {/* 5-Step Live Tracking Timeline */}
              {job.status !== 'cancelled' && job.status !== 'rejected' ? (
                <div className="rounded-2xl bg-[#FFFDF8]/70 dark:bg-[#07130F]/60 border border-[#075E36]/12 dark:border-white/[0.08] p-4 sm:p-5 space-y-3.5">
                  <div className="flex items-center justify-between gap-3 text-xs">
                    <span className="font-semibold text-[#18231E] dark:text-[#FFFDF8]">
                      Live Status: {STATUS_LABELS[job.status]}
                    </span>
                    <span className="text-[#E87516] dark:text-[#FFB866] font-semibold">{URGENCY_LABELS[job.urgency]}</span>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {PROGRESS_STEPS.map((step, idx) => {
                      const done = activeStepIndex >= idx;
                      return (
                        <div key={step.status} className="space-y-1.5">
                          <div
                            className={`h-2 rounded-full transition-colors ${
                              done
                                ? idx >= 4
                                  ? 'bg-[#138808] dark:bg-[#35C46A]'
                                  : 'bg-gradient-to-r from-[#FF9933] to-[#35C46A]'
                                : 'bg-[#075E36]/15 dark:bg-white/[0.12]'
                            }`}
                          />
                          <span
                            className={`block text-[11px] truncate ${
                              done ? 'text-[#18231E] dark:text-[#FFFDF8] font-semibold' : 'text-[#5B6F65] dark:text-[#7E948A]'
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
                <div className="rounded-xl bg-[#FF9933]/12 border border-[#FF9933]/35 p-4 space-y-2.5">
                  <p className="text-sm font-semibold text-[#18231E] dark:text-[#FFD28A]">
                    Technician declined this direct request
                  </p>
                  <p className="text-xs text-[#43564D] dark:text-[#9CB0A6]">
                    {job.cancellationReason || 'The selected technician was unavailable for this time slot.'}
                  </p>
                  {isCustomer ? (
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => onReopenJob(job)}
                      className="min-h-[40px] px-4 py-2 rounded-xl yn-btn-saffron text-xs font-semibold"
                    >
                      Broadcast Request to All Nearby Pros
                    </button>
                  ) : null}
                </div>
              ) : (
                <div className="rounded-xl bg-[#E8EDF2]/70 dark:bg-[#07130F] border border-[#075E36]/15 dark:border-white/[0.10] px-4 py-3 text-sm text-[#43564D] dark:text-[#9CB0A6]">
                  This repair request was cancelled. {job.cancellationReason ? `(${job.cancellationReason})` : ''}
                </div>
              )}

              {/* Uploaded Problem Photo / Video Preview */}
              {job.mediaUrl ? (
                <div className="rounded-xl border border-[#075E36]/15 dark:border-white/[0.10] overflow-hidden bg-[#FFFDF8] dark:bg-[#07130F]/80">
                  {job.mediaType === 'video' ? (
                    <video src={job.mediaUrl} controls className="w-full max-h-56 bg-black object-contain" />
                  ) : (
                    <img
                      src={job.mediaUrl}
                      alt={job.mediaLabel || 'Customer uploaded appliance fault'}
                      className="w-full max-h-56 object-cover"
                    />
                  )}
                  <div className="px-3.5 py-2 text-[11px] text-[#43564D] dark:text-[#9CB0A6]">
                    Customer problem media: {job.mediaLabel || 'Fault attachment'}
                  </div>
                </div>
              ) : null}

              {/* Description & Pricing Transparency Grid */}
              <div className="rounded-2xl bg-[#FFFDF8]/70 dark:bg-[#07130F]/60 border border-[#075E36]/12 dark:border-white/[0.08] p-4 sm:p-5 space-y-4">
                <p className="text-sm text-[#43564D] dark:text-[#E8EDF2] leading-relaxed">{job.issueDescription}</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3.5 border-t border-[#075E36]/12 dark:border-white/[0.08] text-xs">
                  <div className="space-y-0.5">
                    <span className="block text-[#5B6F65] dark:text-[#7E948A]">Homeowner</span>
                    <span className="font-semibold text-[#18231E] dark:text-[#FFFDF8]">{job.customerName}</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="block text-[#5B6F65] dark:text-[#7E948A]">Visit slot</span>
                    <span className="font-semibold text-[#18231E] dark:text-[#FFFDF8]">{job.preferredSlot}</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="block text-[#5B6F65] dark:text-[#7E948A]">Inspection fee</span>
                    <span className="tabular-nums font-bold text-[#18231E] dark:text-[#FFFDF8]">
                      {formatMoney(job.inspectionFee ?? 0, job.currencyCode || 'USD')}
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="block text-[#5B6F65] dark:text-[#7E948A]">
                      {job.quotedFee > 0 ? 'Final quote' : 'Est. repair'}
                    </span>
                    <span className="tabular-nums font-bold text-[#18231E] dark:text-[#FFD28A]">
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
                      ? 'bg-[#138808]/10 dark:bg-[#35C46A]/10 border-[#35C46A]/35'
                      : 'bg-[#FF9933]/12 border-[#FF9933]/35'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold text-[#18231E] dark:text-[#FFFDF8]">
                        {job.priceApproved
                          ? 'Final Repair Price Approved'
                          : 'Final Price Approval Required'}
                      </p>
                      <p className="text-xs text-[#43564D] dark:text-[#9CB0A6] mt-0.5">
                        Total quote:{' '}
                        <strong className="tabular-nums text-[#18231E] dark:text-[#FFFDF8]">
                          {formatMoney(job.quotedFee, job.currencyCode || 'USD')}
                        </strong>{' '}
                        (includes {formatMoney(job.inspectionFee ?? 0, job.currencyCode || 'USD')} inspection)
                      </p>
                    </div>
                    {job.priceApproved ? (
                      <span className="text-xs font-bold text-[#138808] dark:text-[#7DFF9B] flex items-center gap-1 shrink-0">
                        <ShieldCheck className="w-4 h-4" />
                        Approved
                      </span>
                    ) : isCustomer && job.status !== 'completed' ? (
                      <button
                        type="button"
                        disabled={submitting}
                        onClick={() => onApproveQuote(job)}
                        className="min-h-[40px] px-3.5 py-1.5 rounded-xl yn-btn-emerald text-xs font-semibold shrink-0 flex items-center gap-1.5"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>Approve Price</span>
                      </button>
                    ) : (
                      <span className="text-xs font-semibold text-[#E87516] dark:text-[#FFD28A] shrink-0">
                        Awaiting customer
                      </span>
                    )}
                  </div>
                </div>
              ) : null}

              {/* Completed Digital Invoice Banner */}
              {job.status === 'completed' ? (
                <div className="rounded-xl bg-[#138808]/10 dark:bg-[#35C46A]/10 border border-[#35C46A]/35 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-[#18231E] dark:text-[#FFFDF8] flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-[#138808] dark:text-[#7DFF9B]" />
                      <span>Digital Invoice &amp; Service Record Ready</span>
                    </p>
                    <p className="text-xs text-[#43564D] dark:text-[#9CB0A6] mt-0.5">
                      {job.workSummary || 'Repair completed'} ·{' '}
                      {job.warrantyDays && job.warrantyDays > 0
                        ? `${job.warrantyDays}-day warranty`
                        : '30-day warranty'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onOpenInvoice(job)}
                    className="min-h-[42px] px-4 py-2 rounded-xl yn-btn-emerald text-xs font-semibold shrink-0"
                  >
                    View Digital Invoice
                  </button>
                </div>
              ) : null}

              {/* Assigned technician banner + Direct Call */}
              {job.technicianId ? (
                <div className="rounded-2xl bg-[#FFFDF8] dark:bg-[#07130F]/80 border border-[#075E36]/15 dark:border-white/[0.10] p-5 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-[#18231E] dark:text-[#FFFDF8]">
                      Assigned Technician: {job.technicianName}
                    </span>
                    {job.technicianEta ? (
                      <span className="text-xs tabular-nums text-[#E87516] dark:text-[#FFD28A] font-semibold">
                        ETA {job.technicianEta}
                      </span>
                    ) : null}
                  </div>
                  {techContact?.phone ? (
                    <div className="flex items-center justify-between gap-3 pt-1">
                      <span className="text-sm tabular-nums text-[#18231E] dark:text-[#FFFDF8] font-medium flex items-center gap-2">
                        <Phone className="w-4 h-4 text-[#138808] dark:text-[#35C46A]" />
                        {techContact.phone}
                      </span>
                      <a
                        href={`tel:${techContact.phone.replace(/\s+/g, '')}`}
                        className="min-h-[42px] px-4 py-2 rounded-xl yn-btn-saffron text-xs font-semibold transition-all flex items-center gap-1.5"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call Technician</span>
                      </a>
                    </div>
                  ) : (
                    <p className="text-xs text-[#43564D] dark:text-[#9CB0A6]">
                      Use coordination messages below to confirm arrival or spare parts.
                    </p>
                  )}
                </div>
              ) : null}

              {/* Protected homeowner contact details */}
              {(isCustomer || isAssignedTech) && !job.isSample ? (
                <div className="rounded-2xl bg-[#FF9933]/10 border border-[#FF9933]/35 p-5 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#E87516] dark:text-[#FFD28A]">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Homeowner Visit Address &amp; Phone</span>
                  </div>
                  {privateContact ? (
                    <div className="space-y-2.5 text-sm text-[#18231E] dark:text-[#FFFDF8]">
                      <div className="flex items-center gap-2.5">
                        <MapPin className="w-4 h-4 text-[#5B6F65] dark:text-[#9CB0A6] shrink-0" />
                        <span>{privateContact.streetAddress}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="tabular-nums font-medium flex items-center gap-2.5">
                          <Phone className="w-4 h-4 text-[#5B6F65] dark:text-[#9CB0A6] shrink-0" />
                          {privateContact.phone}
                        </span>
                        {isAssignedTech ? (
                          <a
                            href={`tel:${privateContact.phone.replace(/\s+/g, '')}`}
                            className="min-h-[42px] px-4 py-2 rounded-xl yn-btn-saffron text-xs font-semibold transition-all flex items-center gap-1.5"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>Call Homeowner</span>
                          </a>
                        ) : null}
                      </div>
                      {privateContact.accessNote ? (
                        <p className="text-xs text-[#43564D] dark:text-[#9CB0A6] pl-6">Note: {privateContact.accessNote}</p>
                      ) : null}
                    </div>
                  ) : (
                    <p className="text-xs text-[#43564D] dark:text-[#9CB0A6]">Loading protected visit details...</p>
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
                <div className="rounded-2xl border border-[#075E36]/18 dark:border-white/[0.10] bg-[#FFFDF8] dark:bg-[#07130F]/80 p-5 space-y-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#18231E] dark:text-[#FFFDF8]">
                    <CreditCard className="w-4 h-4 text-[#138808] dark:text-[#35C46A]" />
                    <span>Settle payment ({formatMoney(job.quotedFee || job.estimatedBudget, job.currencyCode || 'USD')})</span>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
                    {PAYMENT_METHOD_OPTIONS.map((pm) => (
                      <button
                        key={pm.id}
                        type="button"
                        onClick={() => setSelectedPayMethod(pm.id)}
                        className={`min-h-[44px] px-2.5 rounded-xl border text-xs font-medium transition-colors ${
                          selectedPayMethod === pm.id
                            ? 'bg-[#138808]/14 dark:bg-[#35C46A]/15 border-[#35C46A] text-[#138808] dark:text-[#7DFF9B] font-semibold'
                            : 'bg-[#FFFDF8] dark:bg-[#071B16] border-[#075E36]/12 dark:border-white/[0.08] text-[#43564D] dark:text-[#9CB0A6]'
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
                    className="w-full min-h-[46px] px-4 py-2.5 rounded-xl yn-btn-emerald text-xs sm:text-sm font-semibold disabled:opacity-60 transition-all"
                  >
                    Confirm Payment via {PAYMENT_METHOD_MAP[selectedPayMethod]}
                  </button>
                </div>
              ) : null}

              {/* Open Job Action: Technician Claim or Reject */}
              {job.status === 'open' && !isCustomer ? (
                <div className="rounded-2xl border border-[#075E36]/18 dark:border-white/[0.10] bg-[#FFFDF8] dark:bg-[#07130F]/80 p-5 space-y-5">
                  {job.isSample ? (
                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-[#18231E] dark:text-[#FFFDF8]">Example neighborhood listing</p>
                      <p className="text-xs text-[#43564D] dark:text-[#9CB0A6] leading-relaxed">
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
                        className="w-full min-h-[46px] px-4 py-2.5 rounded-xl yn-btn-saffron text-sm font-semibold transition-all"
                      >
                        {currentUid ? 'Set Up My Technician Profile' : 'Sign In to Claim Live Jobs'}
                      </button>
                    </div>
                  ) : !currentUid ? (
                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-[#18231E] dark:text-[#FFFDF8]">Ready to take this job?</p>
                      <p className="text-xs text-[#43564D] dark:text-[#9CB0A6] leading-relaxed">
                        Sign in with Google to accept this request and unlock the homeowner&apos;s address and phone number.
                      </p>
                      <button
                        type="button"
                        onClick={() =>
                          onRequireAuth('Sign in with Google to accept this repair job.')
                        }
                        className="w-full min-h-[46px] px-4 py-2.5 rounded-xl yn-btn-saffron text-sm font-semibold transition-all"
                      >
                        Sign In &amp; Accept Job
                      </button>
                    </div>
                  ) : !myTechnicianProfile ? (
                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-[#18231E] dark:text-[#FFFDF8]">
                        Create your technician profile first
                      </p>
                      <p className="text-xs text-[#43564D] dark:text-[#9CB0A6] leading-relaxed">
                        A quick technician profile lets homeowners see your specialties, verification badge, and contact phone.
                      </p>
                      <button
                        type="button"
                        onClick={onOpenTechSetup}
                        className="w-full min-h-[46px] px-4 py-2.5 rounded-xl yn-btn-emerald text-sm font-semibold transition-all"
                      >
                        Create Technician Profile
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-[#18231E] dark:text-[#FFFDF8]">
                        Accept &amp; Quote this repair job
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="accept-eta" className="block text-xs font-medium text-[#43564D] dark:text-[#9CB0A6] mb-1.5">
                            Arrival ETA
                          </label>
                          <input
                            id="accept-eta"
                            type="text"
                            maxLength={60}
                            value={etaInput}
                            onChange={(e) => setEtaInput(e.target.value)}
                            placeholder="e.g., 30 mins"
                            className="w-full min-h-[46px] px-3.5 py-2.5 rounded-xl border border-[#075E36]/20 dark:border-white/[0.12] bg-[#FFFDF8] dark:bg-[#07130F] text-sm text-[#18231E] dark:text-[#FFFDF8] focus:outline-none focus:ring-2 focus:ring-[#FF9933]"
                          />
                        </div>
                        <div>
                          <label htmlFor="accept-phone" className="block text-xs font-medium text-[#43564D] dark:text-[#9CB0A6] mb-1.5">
                            Your phone
                          </label>
                          <input
                            id="accept-phone"
                            type="tel"
                            maxLength={30}
                            value={techPhoneInput}
                            onChange={(e) => setTechPhoneInput(e.target.value)}
                            placeholder="+91 98765..."
                            className="w-full min-h-[46px] px-3.5 py-2.5 rounded-xl border border-[#075E36]/20 dark:border-white/[0.12] bg-[#FFFDF8] dark:bg-[#07130F] text-sm tabular-nums text-[#18231E] dark:text-[#FFFDF8] focus:outline-none focus:ring-2 focus:ring-[#FF9933]"
                          />
                        </div>
                        <div>
                          <label htmlFor="accept-inspect" className="block text-xs font-medium text-[#43564D] dark:text-[#9CB0A6] mb-1.5">
                            Inspection fee ({job.currencyCode || 'USD'})
                          </label>
                          <input
                            id="accept-inspect"
                            type="number"
                            min={0}
                            max={10000000}
                            value={inspectionInput}
                            onChange={(e) => setInspectionInput(e.target.value)}
                            className="w-full min-h-[46px] px-3.5 py-2.5 rounded-xl border border-[#075E36]/20 dark:border-white/[0.12] bg-[#FFFDF8] dark:bg-[#07130F] text-sm tabular-nums text-[#18231E] dark:text-[#FFFDF8] focus:outline-none focus:ring-2 focus:ring-[#FF9933]"
                          />
                        </div>
                        <div>
                          <label htmlFor="accept-quote" className="block text-xs font-medium text-[#43564D] dark:text-[#9CB0A6] mb-1.5">
                            Estimated Total Quote ({job.currencyCode || 'USD'})
                          </label>
                          <input
                            id="accept-quote"
                            type="number"
                            min={0}
                            max={10000000}
                            value={quoteInput}
                            onChange={(e) => setQuoteInput(e.target.value)}
                            className="w-full min-h-[46px] px-3.5 py-2.5 rounded-xl border border-[#075E36]/20 dark:border-white/[0.12] bg-[#FFFDF8] dark:bg-[#07130F] text-sm tabular-nums text-[#18231E] dark:text-[#FFFDF8] focus:outline-none focus:ring-2 focus:ring-[#FF9933]"
                          />
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-3 pt-1">
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
                          className="flex-1 min-h-[48px] px-5 py-2.5 rounded-xl yn-btn-emerald text-sm font-semibold disabled:opacity-60 transition-all"
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
                            className="min-h-[48px] px-4 py-2.5 rounded-xl border border-rose-500/35 text-rose-700 dark:text-rose-300 text-sm font-semibold hover:bg-rose-500/10 flex items-center gap-1.5"
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
                <div className="rounded-2xl border border-[#075E36]/18 dark:border-white/[0.10] bg-[#FFFDF8] dark:bg-[#07130F]/80 p-5 space-y-4">
                  <h3 className="text-sm font-semibold text-[#18231E] dark:text-[#FFFDF8]">
                    Live Service &amp; Invoice Controls
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="update-eta" className="block text-xs font-medium text-[#43564D] dark:text-[#9CB0A6] mb-1.5">
                        Updated ETA
                      </label>
                      <input
                        id="update-eta"
                        type="text"
                        maxLength={60}
                        value={etaInput}
                        onChange={(e) => setEtaInput(e.target.value)}
                        className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#075E36]/20 dark:border-white/[0.12] bg-[#FFFDF8] dark:bg-[#07130F] text-sm text-[#18231E] dark:text-[#FFFDF8]"
                      />
                    </div>
                    <div>
                      <label htmlFor="update-inspect" className="block text-xs font-medium text-[#43564D] dark:text-[#9CB0A6] mb-1.5">
                        Inspection ({job.currencyCode || 'USD'})
                      </label>
                      <input
                        id="update-inspect"
                        type="number"
                        min={0}
                        max={10000000}
                        value={inspectionInput}
                        onChange={(e) => setInspectionInput(e.target.value)}
                        className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#075E36]/20 dark:border-white/[0.12] bg-[#FFFDF8] dark:bg-[#07130F] text-sm tabular-nums text-[#18231E] dark:text-[#FFFDF8]"
                      />
                    </div>
                    <div>
                      <label htmlFor="update-fee" className="block text-xs font-medium text-[#43564D] dark:text-[#9CB0A6] mb-1.5">
                        Final total ({job.currencyCode || 'USD'})
                      </label>
                      <input
                        id="update-fee"
                        type="number"
                        min={0}
                        max={10000000}
                        value={quoteInput}
                        onChange={(e) => setQuoteInput(e.target.value)}
                        className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#075E36]/20 dark:border-white/[0.12] bg-[#FFFDF8] dark:bg-[#07130F] text-sm tabular-nums text-[#18231E] dark:text-[#FFFDF8]"
                      />
                    </div>
                  </div>

                  {/* Invoice summary fields for completion */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                    <div className="sm:col-span-2">
                      <label htmlFor="work-summary" className="block text-xs font-medium text-[#43564D] dark:text-[#9CB0A6] mb-1.5">
                        Work performed (for Digital Invoice)
                      </label>
                      <input
                        id="work-summary"
                        type="text"
                        maxLength={400}
                        value={workSummaryInput}
                        onChange={(e) => setWorkSummaryInput(e.target.value)}
                        placeholder="e.g., Replaced faulty capacitor and tested full cooling cycle"
                        className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#075E36]/20 dark:border-white/[0.12] bg-[#FFFDF8] dark:bg-[#07130F] text-xs sm:text-sm text-[#18231E] dark:text-[#FFFDF8]"
                      />
                    </div>
                    <div>
                      <label htmlFor="warranty-days" className="block text-xs font-medium text-[#43564D] dark:text-[#9CB0A6] mb-1.5">
                        Warranty (days)
                      </label>
                      <input
                        id="warranty-days"
                        type="number"
                        min={0}
                        max={1825}
                        value={warrantyInput}
                        onChange={(e) => setWarrantyInput(e.target.value)}
                        className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#075E36]/20 dark:border-white/[0.12] bg-[#FFFDF8] dark:bg-[#07130F] text-xs sm:text-sm tabular-nums text-[#18231E] dark:text-[#FFFDF8]"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="parts-replaced" className="block text-xs font-medium text-[#43564D] dark:text-[#9CB0A6] mb-1.5">
                      Parts replaced (optional)
                    </label>
                    <input
                      id="parts-replaced"
                      type="text"
                      maxLength={250}
                      value={partsInput}
                      onChange={(e) => setPartsInput(e.target.value)}
                      placeholder="e.g., 2.5uF Capacitor, Copper Flare Nut"
                      className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#075E36]/20 dark:border-white/[0.12] bg-[#FFFDF8] dark:bg-[#07130F] text-xs sm:text-sm text-[#18231E] dark:text-[#FFFDF8]"
                    />
                  </div>

                  <div className="flex flex-wrap gap-3 pt-2">
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
                        className="flex-1 min-h-[46px] px-4 py-2.5 rounded-xl yn-btn-saffron text-xs sm:text-sm font-semibold"
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
                        className="flex-1 min-h-[46px] px-4 py-2.5 rounded-xl bg-[#0A1D4D] hover:bg-[#1E40AF] text-white text-xs sm:text-sm font-semibold transition-colors"
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
                        className="flex-1 min-h-[46px] px-4 py-2.5 rounded-xl yn-btn-saffron text-xs sm:text-sm font-semibold"
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
                      className="flex-1 min-h-[46px] px-4 py-2.5 rounded-xl yn-btn-emerald text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Complete &amp; Invoice</span>
                    </button>
                  </div>
                </div>
              ) : null}

              {/* Coordination Chat */}
              {(isCustomer || isAssignedTech) && job.technicianId && !job.isSample ? (
                <div className="border-t border-[#075E36]/12 dark:border-white/[0.08] pt-5 space-y-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#18231E] dark:text-[#FFFDF8]">
                    <MessageSquare className="w-4 h-4 text-[#E87516] dark:text-[#FFB866]" />
                    <span>Direct coordination messages</span>
                  </div>
                  <div className="max-h-52 overflow-y-auto space-y-3 rounded-2xl bg-[#E8EDF2]/65 dark:bg-[#07130F]/80 border border-[#075E36]/15 dark:border-white/[0.10] p-4">
                    {messages.length === 0 ? (
                      <p className="text-xs text-[#43564D] dark:text-[#9CB0A6] text-center py-5">
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
                              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                                mine
                                  ? 'yn-btn-saffron'
                                  : 'bg-[#FFFDF8] dark:bg-[#071B16] border border-[#075E36]/15 dark:border-white/[0.10] text-[#18231E] dark:text-[#FFFDF8]'
                              }`}
                            >
                              <p>{msg.text}</p>
                            </div>
                            <span className="text-[11px] text-[#5B6F65] dark:text-[#7E948A] mt-1">
                              {msg.senderName} · {formatTimestamp(msg.createdAt)}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                  {job.status !== 'cancelled' ? (
                    <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                      <input
                        type="text"
                        maxLength={500}
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        placeholder="Write a message..."
                        className="flex-1 min-h-[46px] px-4 py-2.5 rounded-xl border border-[#075E36]/20 dark:border-white/[0.12] bg-[#FFFDF8] dark:bg-[#07130F] text-sm text-[#18231E] dark:text-[#FFFDF8] placeholder:text-[#5B6F65] dark:placeholder:text-[#7E948A] focus:outline-none focus:ring-2 focus:ring-[#FF9933]"
                      />
                      <button
                        type="submit"
                        disabled={sendingMsg || !messageText.trim()}
                        aria-label="Send message"
                        className="min-h-[46px] min-w-[46px] px-4 rounded-xl yn-btn-saffron disabled:opacity-50 transition-all flex items-center justify-center"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </form>
                  ) : null}
                </div>
              ) : null}

              {/* Completed Review Section */}
              {isCustomer && job.status === 'completed' ? (
                <div className="border-t border-[#075E36]/12 dark:border-white/[0.08] pt-5 space-y-4">
                  {existingReview ? (
                    <div className="rounded-2xl bg-[#FFFDF8] dark:bg-[#07130F]/80 border border-[#075E36]/15 dark:border-white/[0.10] p-5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-[#18231E] dark:text-[#FFFDF8]">Your verified review</span>
                        <span className="text-sm tabular-nums text-[#E87516] dark:text-[#FFD28A] font-semibold">
                          {existingReview.rating}/5 ★
                        </span>
                      </div>
                      <p className="text-sm text-[#43564D] dark:text-[#9CB0A6] leading-relaxed">{existingReview.comment}</p>
                    </div>
                  ) : (
                    <div className="rounded-2xl bg-[#FFFDF8] dark:bg-[#07130F]/80 border border-[#075E36]/15 dark:border-white/[0.10] p-5 space-y-4">
                      <h3 className="text-sm font-semibold text-[#18231E] dark:text-[#FFFDF8]">
                        Rate {job.technicianName}&apos;s repair
                      </h3>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            aria-label={`Rate ${star} stars`}
                            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl hover:bg-[#FF9933]/10 transition-colors"
                          >
                            <Star
                              className={`w-6 h-6 ${
                                star <= rating
                                  ? 'fill-[#FF9933] text-[#E87516] dark:text-[#FFB866]'
                                  : 'text-[#5B6F65]/40 dark:text-[#7E948A]/40'
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
                        className="w-full px-4 py-3 rounded-xl border border-[#075E36]/20 dark:border-white/[0.12] bg-[#FFFDF8] dark:bg-[#07130F] text-sm text-[#18231E] dark:text-[#FFFDF8] placeholder:text-[#5B6F65] dark:placeholder:text-[#7E948A] focus:outline-none focus:ring-2 focus:ring-[#FF9933]"
                      />
                      <button
                        type="button"
                        disabled={submitting || reviewComment.trim().length < 2}
                        onClick={() => onSubmitReview(job, rating, reviewComment.trim())}
                        className="w-full min-h-[46px] px-4 py-2.5 rounded-xl yn-btn-emerald text-sm font-semibold disabled:opacity-50 transition-all"
                      >
                        {submitting ? 'Submitting review...' : 'Submit Verified Review'}
                      </button>
                    </div>
                  )}
                </div>
              ) : null}

              {/* Customer cancel & Report actions */}
              {!job.isSample && currentUid ? (
                <div className="pt-5 border-t border-[#075E36]/12 dark:border-white/[0.08] space-y-3.5">
                  {isCustomer &&
                  (job.status === 'open' ||
                    job.status === 'accepted' ||
                    job.status === 'en_route' ||
                    job.status === 'arrived') ? (
                    <div className="space-y-3">
                      <p className="text-xs text-[#43564D] dark:text-[#9CB0A6] leading-relaxed">
                        {CANCELLATION_POLICY_TEXT}
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <input
                          type="text"
                          maxLength={200}
                          value={cancelReason}
                          onChange={(e) => setCancelReason(e.target.value)}
                          placeholder="Reason for cancellation (optional)"
                          className="flex-1 min-h-[44px] px-3.5 py-2 rounded-xl border border-[#075E36]/20 dark:border-white/[0.12] bg-[#FFFDF8] dark:bg-[#07130F] text-xs sm:text-sm text-[#18231E] dark:text-[#FFFDF8]"
                        />
                        <button
                          type="button"
                          disabled={submitting}
                          onClick={() =>
                            onCancelJob(job, cancelReason.trim() || 'Cancelled by homeowner')
                          }
                          className="min-h-[44px] px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-rose-700 dark:text-rose-300 border border-rose-500/35 hover:bg-rose-500/10"
                        >
                          Cancel Request
                        </button>
                      </div>
                    </div>
                  ) : null}

                  <div className="flex items-center justify-between gap-3 pt-1 text-xs text-[#43564D] dark:text-[#9CB0A6]">
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
                      className="min-h-[36px] px-2.5 rounded-lg text-xs font-semibold text-rose-700 dark:text-rose-400 hover:bg-rose-500/10 flex items-center gap-1.5 transition-colors"
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
