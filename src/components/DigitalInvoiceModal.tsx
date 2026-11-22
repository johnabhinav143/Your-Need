import React, { useState } from 'react';
import { Check, Copy, FileText, Printer, ShieldCheck, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import {
  CATEGORY_MAP,
  formatTimestamp,
  PAYMENT_METHOD_MAP,
  REFUND_DISPUTE_POLICY_TEXT,
} from '../constants';
import { formatMoney } from '../i18n/regions';
import { RepairJob } from '../types';

interface DigitalInvoiceModalProps {
  job: RepairJob | null;
  onClose: () => void;
  onReportDispute: (job: RepairJob) => void;
}

export const DigitalInvoiceModal: React.FC<DigitalInvoiceModalProps> = ({
  job,
  onClose,
  onReportDispute,
}) => {
  const [copied, setCopied] = useState(false);

  if (!job) return null;

  const totalAmount = job.quotedFee || job.estimatedBudget || 0;
  const inspectionCharge = Math.min(job.inspectionFee || 0, totalAmount);
  const serviceLaborAndParts = Math.max(0, totalAmount - inspectionCharge);
  const currency = job.currencyCode || 'USD';
  const invoiceNo = `YN-${job.id.slice(-8).toUpperCase()}`;
  const warrantyText =
    job.warrantyDays && job.warrantyDays > 0
      ? `${job.warrantyDays}-day service & parts warranty`
      : 'Standard 30-day workmanship guarantee';

  const invoiceSummaryText = [
    `YOUR NEED DIGITAL INVOICE (${invoiceNo})`,
    `Service: ${job.issueTitle} (${CATEGORY_MAP[job.applianceCategory]})`,
    `Customer: ${job.customerName} · ${job.neighborhood}`,
    `Technician: ${job.technicianName || 'Assigned Technician'}`,
    `Work Performed: ${job.workSummary || 'Diagnostic inspection and appliance repair completed.'}`,
    `Parts Replaced: ${job.partsReplaced || 'None / standard consumables'}`,
    `Inspection Charge: ${formatMoney(inspectionCharge, currency)}`,
    `Repair & Parts Charge: ${formatMoney(serviceLaborAndParts, currency)}`,
    `Total Amount: ${formatMoney(totalAmount, currency)} (${PAYMENT_METHOD_MAP[job.paymentMethod || 'cash']} · ${job.paymentStatus === 'paid' ? 'PAID' : 'PENDING'})`,
    `Warranty: ${warrantyText}`,
  ].join('\n');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(invoiceSummaryText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      // Clipboard fallback ignored cleanly
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-[#040B08]/75 backdrop-blur-md sm:p-4"
        role="dialog"
        aria-modal="true"
        aria-label="Digital Service Invoice"
      >
        <motion.div
          initial={{ y: 28, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 28, opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="w-full sm:max-w-lg yn-glass-card yn-tricolor-border rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden"
        >
          <div className="px-6 py-4.5 border-b border-[#075E36]/12 dark:border-white/[0.08] flex items-center justify-between gap-3 bg-gradient-to-r from-[#FF9933]/10 via-white/10 to-[#138808]/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl yn-btn-emerald flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#18231E] dark:text-[#FFFDF8] font-display">
                  Digital Service Invoice
                </h2>
                <p className="text-xs text-[#43564D] dark:text-[#9CB0A6] mt-0.5">
                  Invoice #{invoiceNo} · {formatTimestamp(job.updatedAt || job.createdAt)}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close invoice"
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-[#43564D] dark:text-[#9CB0A6] hover:bg-[#FF9933]/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto space-y-5 text-sm">
            <div className="grid grid-cols-2 gap-4 rounded-2xl bg-[#FFFDF8] dark:bg-[#07130F]/80 border border-[#075E36]/15 dark:border-white/[0.10] p-4.5 text-xs">
              <div className="space-y-1">
                <span className="block text-[#5B6F65] dark:text-[#7E948A]">Homeowner</span>
                <span className="block font-semibold text-[#18231E] dark:text-[#FFFDF8]">{job.customerName}</span>
                <span className="block text-[#43564D] dark:text-[#9CB0A6]">{job.neighborhood}</span>
              </div>
              <div className="space-y-1">
                <span className="block text-[#5B6F65] dark:text-[#7E948A]">Technician</span>
                <span className="block font-semibold text-[#18231E] dark:text-[#FFFDF8]">
                  {job.technicianName || 'Assigned Pro'}
                </span>
                <span className="block text-[#138808] dark:text-[#7DFF9B] font-medium">
                  {CATEGORY_MAP[job.applianceCategory]}
                </span>
              </div>
            </div>

            <div className="space-y-3.5 rounded-2xl bg-[#FFFDF8] dark:bg-[#07130F]/80 border border-[#075E36]/15 dark:border-white/[0.10] p-5">
              <div>
                <span className="text-xs font-semibold text-[#5B6F65] dark:text-[#7E948A]">Work Performed</span>
                <p className="text-sm font-medium text-[#18231E] dark:text-[#FFFDF8] mt-1 leading-relaxed">
                  {job.workSummary || job.issueTitle}
                </p>
              </div>
              <div className="pt-3 border-t border-[#075E36]/12 dark:border-white/[0.08]">
                <span className="text-xs font-semibold text-[#5B6F65] dark:text-[#7E948A]">Parts Replaced</span>
                <p className="text-xs text-[#43564D] dark:text-[#9CB0A6] mt-1 leading-relaxed">
                  {job.partsReplaced || 'No major replacement parts billed'}
                </p>
              </div>
              <div className="pt-3 border-t border-[#075E36]/12 dark:border-white/[0.08] flex items-center gap-2 text-xs text-[#138808] dark:text-[#7DFF9B] font-semibold">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>{warrantyText}</span>
              </div>
            </div>

            <div className="rounded-2xl bg-[#FFFDF8] dark:bg-[#07130F]/80 border border-[#075E36]/15 dark:border-white/[0.10] p-5 space-y-3 text-xs">
              <div className="flex justify-between gap-3 text-[#43564D] dark:text-[#9CB0A6]">
                <span>Inspection / Visiting Charge</span>
                <span className="tabular-nums font-semibold text-[#18231E] dark:text-[#FFFDF8]">
                  {formatMoney(inspectionCharge, currency)}
                </span>
              </div>
              <div className="flex justify-between gap-3 text-[#43564D] dark:text-[#9CB0A6]">
                <span>Repair Labor &amp; Parts</span>
                <span className="tabular-nums font-semibold text-[#18231E] dark:text-[#FFFDF8]">
                  {formatMoney(serviceLaborAndParts, currency)}
                </span>
              </div>
              <div className="flex justify-between gap-3 text-[#43564D] dark:text-[#9CB0A6]">
                <span>Final Price Approved</span>
                <span className="font-semibold text-[#138808] dark:text-[#7DFF9B]">
                  {job.priceApproved ? 'Yes · Customer Approved' : 'Confirmed on completion'}
                </span>
              </div>
              <div className="pt-3 border-t border-[#075E36]/12 dark:border-white/[0.08] flex justify-between items-center gap-3 text-sm font-bold text-[#18231E] dark:text-[#FFFDF8]">
                <span>Total ({PAYMENT_METHOD_MAP[job.paymentMethod || 'cash']})</span>
                <span className="tabular-nums text-base">
                  {formatMoney(totalAmount, currency)} ·{' '}
                  <span className={job.paymentStatus === 'paid' ? 'text-[#138808] dark:text-[#35C46A]' : 'text-[#E87516] dark:text-[#FFB866]'}>
                    {job.paymentStatus === 'paid' ? 'PAID' : 'PENDING'}
                  </span>
                </span>
              </div>
            </div>

            <p className="text-xs text-[#5B6F65] dark:text-[#7E948A] leading-relaxed">
              {REFUND_DISPUTE_POLICY_TEXT}
            </p>
          </div>

          <div className="p-5 border-t border-[#075E36]/12 dark:border-white/[0.08] bg-[#E8EDF2]/60 dark:bg-[#07130F]/70 flex flex-wrap items-center gap-3 pb-safe">
            <button
              type="button"
              onClick={handleCopy}
              className="flex-1 min-h-[46px] px-4 py-2.5 rounded-xl border border-[#075E36]/20 dark:border-white/[0.12] bg-[#FFFDF8] dark:bg-[#071B16] text-xs font-semibold text-[#18231E] dark:text-[#FFFDF8] flex items-center justify-center gap-2 hover:border-[#FF9933]/40 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-[#138808] dark:text-[#35C46A]" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied' : 'Copy Receipt'}</span>
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="flex-1 min-h-[46px] px-4 py-2.5 rounded-xl yn-btn-saffron text-xs font-bold flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>Print / PDF</span>
            </button>
            <button
              type="button"
              onClick={() => onReportDispute(job)}
              className="min-h-[46px] px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-700 dark:text-rose-300 hover:bg-rose-500/10"
            >
              Payment Dispute
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
