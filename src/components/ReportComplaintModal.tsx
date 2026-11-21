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
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#171717]/65 backdrop-blur-sm sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="report-modal-title"
        >
          <motion.div
            initial={{ y: 28, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 28, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="w-full sm:max-w-md bg-white dark:bg-[#171717] rounded-t-3xl sm:rounded-2xl border border-[#E8DFC8] dark:border-[#2E2E2E] shadow-2xl overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-[#EFE8D5] dark:border-[#2E2E2E] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h2 id="report-modal-title" className="text-base font-bold text-[#171717] dark:text-white truncate">
                    Report or File Complaint
                  </h2>
                  <p className="text-xs text-[#595959] dark:text-[#B5ADA0] truncate">
                    Target: {targetName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close report dialog"
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-[#595959] hover:bg-[#FFFDF7] dark:hover:bg-[#121212]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label htmlFor="report-reason" className="block text-xs font-semibold text-[#292929] dark:text-[#DDD6C7] mb-1.5">
                  Reason for report
                </label>
                <select
                  id="report-reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value as ReportReason)}
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#D8CEB4] dark:border-[#292929] bg-white dark:bg-[#121212] text-sm text-[#171717] dark:text-[#FFFDF7]"
                >
                  {REPORT_REASON_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="report-details" className="block text-xs font-semibold text-[#292929] dark:text-[#DDD6C7] mb-1.5">
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
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8CEB4] dark:border-[#292929] bg-white dark:bg-[#121212] text-sm text-[#171717] dark:text-[#FFFDF7] focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 p-3 flex items-start gap-2 text-xs text-amber-900 dark:text-amber-200">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Reports are reviewed by the Your Need safety &amp; dispute team to verify accounts and resolve payment disputes.
                </span>
              </div>

              {errorMsg ? (
                <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">{errorMsg}</p>
              ) : null}

              <div className="flex items-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="min-h-[44px] px-4 py-2 rounded-xl border border-[#D8CEB4] dark:border-[#292929] text-sm font-medium text-[#292929] dark:text-[#E8E2D5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 min-h-[44px] px-4 py-2 rounded-xl bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700 disabled:opacity-60 transition-colors"
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
