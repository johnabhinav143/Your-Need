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
        className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-[#171717]/70 backdrop-blur-sm sm:p-4"
        role="dialog"
        aria-modal="true"
        aria-label="Digital Service Invoice"
      >
        <motion.div
          initial={{ y: 28, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 28, opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="w-full sm:max-w-lg bg-white dark:bg-[#171717] rounded-t-3xl sm:rounded-2xl border border-[#E8DFC8] dark:border-[#2E2E2E] shadow-2xl max-h-[92vh] flex flex-col overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-[#EFE8D5] dark:border-[#2E2E2E] flex items-center justify-between gap-3 bg-gradient-to-r from-[#FFFDF7] to-[#F7F0DC] dark:from-[#171717] dark:to-[#0D0D0D]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#171717] text-white flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#171717] dark:text-white font-display">
                  Digital Service Invoice
                </h2>
                <p className="text-xs text-[#595959] dark:text-[#B5ADA0]">
                  Invoice #{invoiceNo} · {formatTimestamp(job.updatedAt || job.createdAt)}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close invoice"
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-[#595959] hover:bg-[#FFFDF7] dark:hover:bg-[#121212]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5 overflow-y-auto space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3 rounded-xl bg-[#FFFDF7] dark:bg-[#0D0D0D]/75 border border-[#E8DFC8] dark:border-[#2E2E2E] p-3.5 text-xs">
              <div>
                <span className="block text-[#595959] dark:text-[#B5ADA0]">Homeowner</span>
                <span className="font-semibold text-[#171717] dark:text-white">{job.customerName}</span>
                <span className="block text-[#595959] dark:text-[#B5ADA0] mt-0.5">{job.neighborhood}</span>
              </div>
              <div>
                <span className="block text-[#595959] dark:text-[#B5ADA0]">Technician</span>
                <span className="font-semibold text-[#171717] dark:text-white">
                  {job.technicianName || 'Assigned Pro'}
                </span>
                <span className="block text-emerald-700 dark:text-emerald-400 font-medium mt-0.5">
                  {CATEGORY_MAP[job.applianceCategory]}
                </span>
              </div>
            </div>

            <div className="space-y-2.5 rounded-xl border border-[#E8DFC8] dark:border-[#2E2E2E] p-4">
              <div>
                <span className="text-xs font-semibold text-[#595959] dark:text-[#B5ADA0]">Work Performed</span>
                <p className="text-sm font-medium text-[#171717] dark:text-white mt-0.5">
                  {job.workSummary || job.issueTitle}
                </p>
              </div>
              <div className="pt-2 border-t border-[#EFE8D5] dark:border-[#2E2E2E]">
                <span className="text-xs font-semibold text-[#595959] dark:text-[#B5ADA0]">Parts Replaced</span>
                <p className="text-xs text-[#292929] dark:text-[#DDD6C7] mt-0.5">
                  {job.partsReplaced || 'No major replacement parts billed'}
                </p>
              </div>
              <div className="pt-2 border-t border-[#EFE8D5] dark:border-[#2E2E2E] flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300 font-semibold">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>{warrantyText}</span>
              </div>
            </div>

            <div className="rounded-xl border border-[#E8DFC8] dark:border-[#2E2E2E] p-4 space-y-2 text-xs">
              <div className="flex justify-between text-[#292929] dark:text-[#DDD6C7]">
                <span>Inspection / Visiting Charge</span>
                <span className="tabular-nums font-semibold">
                  {formatMoney(inspectionCharge, currency)}
                </span>
              </div>
              <div className="flex justify-between text-[#292929] dark:text-[#DDD6C7]">
                <span>Repair Labor &amp; Parts</span>
                <span className="tabular-nums font-semibold">
                  {formatMoney(serviceLaborAndParts, currency)}
                </span>
              </div>
              <div className="flex justify-between text-[#292929] dark:text-[#DDD6C7]">
                <span>Final Price Approved</span>
                <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                  {job.priceApproved ? 'Yes · Customer Approved' : 'Confirmed on completion'}
                </span>
              </div>
              <div className="pt-2.5 border-t border-[#E8DFC8] dark:border-[#2E2E2E] flex justify-between items-center text-sm font-bold text-[#171717] dark:text-white">
                <span>Total ({PAYMENT_METHOD_MAP[job.paymentMethod || 'cash']})</span>
                <span className="tabular-nums text-base">
                  {formatMoney(totalAmount, currency)} ·{' '}
                  <span className={job.paymentStatus === 'paid' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600'}>
                    {job.paymentStatus === 'paid' ? 'PAID' : 'PENDING'}
                  </span>
                </span>
              </div>
            </div>

            <p className="text-[11px] text-[#595959] dark:text-[#B5ADA0] leading-relaxed">
              {REFUND_DISPUTE_POLICY_TEXT}
            </p>
          </div>

          <div className="p-4 border-t border-[#EFE8D5] dark:border-[#2E2E2E] bg-slate-50/70 dark:bg-[#0D0D0D]/60 flex flex-wrap items-center gap-2.5 pb-safe">
            <button
              type="button"
              onClick={handleCopy}
              className="flex-1 min-h-[44px] px-3.5 py-2 rounded-xl border border-[#D8CEB4] dark:border-[#292929] bg-white dark:bg-[#121212] text-xs font-semibold text-[#171717] dark:text-[#FFFDF7] flex items-center justify-center gap-1.5"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied' : 'Copy Receipt'}</span>
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="flex-1 min-h-[44px] px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#C8963E] via-[#F3D999] to-[#D6A84F] text-[#08080A] text-xs font-bold hover:brightness-105 flex items-center justify-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Print / PDF</span>
            </button>
            <button
              type="button"
              onClick={() => onReportDispute(job)}
              className="min-h-[44px] px-3 py-2 rounded-xl text-xs font-semibold text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-500/15"
            >
              Payment Dispute
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
