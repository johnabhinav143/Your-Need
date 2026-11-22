import React, { useEffect, useState } from 'react';
import { AlertTriangle, ShieldAlert, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { REPORT_REASON_OPTIONS } from '../constants';
import { ReportReason } from '../types';

interface ReportComplaintModalProps {
  open: boolean;
  targetType: 'technician' | 'job' | 'user';
  targetId: string;
  targetName: string;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    targetType: 'technician' | 'job' | 'user';
    targetId: string;
    targetName: string;
    reason: ReportReason;
    details: string;
  }) => Promise<void>;
}

export const ReportComplaintModal: React.FC<ReportComplaintModalProps> = ({
  open,
  targetType,
  targetId,
  targetName,
  submitting,
  onClose,
  onSubmit,
}) => {
  const [reason, setReason] = useState<ReportReason>('suspicious_account');
  const [details, setDetails] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (open) {
      setReason(targetType === 'job' ? 'pricing_dispute' : 'suspicious_account');
      setDetails('');
      setErrorMsg('');
    }
  }, [open, targetType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (details.trim().length < 5) {
      setErrorMsg('Please describe the issue briefly (at least 5 characters).');
      return;
    }
    setErrorMsg('');
    await onSubmit({
      targetType,
      targetId,
      targetName,
      reason,
      details: details.trim(),
    });
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#040B08]/75 backdrop-blur-md sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="report-modal-title"
        >
          <motion.div
            initial={{ y: 28, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 28, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="w-full sm:max-w-lg yn-glass-card yn-tricolor-border rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="px-6 py-4.5 border-b border-[#075E36]/12 dark:border-white/[0.08] flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-300 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h2 id="report-modal-title" className="text-base font-bold text-[#18231E] dark:text-[#FFFDF8] truncate">
                    Report or File Complaint
                  </h2>
                  <p className="text-xs text-[#43564D] dark:text-[#9CB0A6] truncate mt-0.5">
                    Target: {targetName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close report dialog"
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-[#43564D] dark:text-[#9CB0A6] hover:bg-[#FF9933]/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label htmlFor="report-reason" className="block text-xs font-semibold text-[#43564D] dark:text-[#9CB0A6] mb-2">
                  Reason for report
                </label>
                <select
                  id="report-reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value as ReportReason)}
                  className="w-full min-h-[46px] px-4 py-2.5 rounded-xl border border-[#075E36]/20 dark:border-white/[0.12] bg-[#FFFDF8] dark:bg-[#07130F] text-sm text-[#18231E] dark:text-[#FFFDF8] focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  {REPORT_REASON_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="report-details" className="block text-xs font-semibold text-[#43564D] dark:text-[#9CB0A6] mb-2">
                  Describe what happened
                </label>
                <textarea
                  id="report-details"
                  rows={4}
                  required
                  maxLength={500}
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Include billing discrepancies, suspicious behavior, poor repair quality, or refund request details..."
                  className="w-full px-4 py-3 rounded-xl border border-[#075E36]/20 dark:border-white/[0.12] bg-[#FFFDF8] dark:bg-[#07130F] text-sm text-[#18231E] dark:text-[#FFFDF8] placeholder:text-[#5B6F65] dark:placeholder:text-[#7E948A] focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="rounded-2xl bg-[#FF9933]/12 border border-[#FF9933]/35 p-4 flex items-start gap-3 text-xs text-[#18231E] dark:text-[#FFD28A] leading-relaxed">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-[#E87516] dark:text-[#FFB866]" />
                <span>
                  Reports are reviewed by the Your Need safety &amp; dispute team to verify accounts and resolve payment disputes.
                </span>
              </div>

              {errorMsg ? (
                <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">{errorMsg}</p>
              ) : null}

              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="min-h-[46px] px-4 py-2.5 rounded-xl border border-[#075E36]/20 dark:border-white/[0.12] text-sm font-medium text-[#18231E] dark:text-[#FFFDF8] hover:bg-[#E8EDF2] dark:hover:bg-white/[0.06] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 min-h-[46px] px-5 py-2.5 rounded-xl bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700 disabled:opacity-60 transition-colors"
                >
                  {submitting ? 'Submitting report...' : 'Submit Report'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};
