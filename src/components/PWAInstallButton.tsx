import React, { useState } from 'react';
import { Download, Share, Smartphone, WifiOff, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  label: string;
  variant?: 'primary' | 'outline';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  label,
  variant = 'outline',
  className = '',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  const handleClick = async () => {
    if (isInstallable) {
      const accepted = await install();
      if (accepted) return;
    }
    setShowGuide(true);
  };

  return (
    <>
      <motion.button
        type="button"
        whileTap={{ scale: 0.97 }}
        onClick={handleClick}
        className={`min-h-[44px] px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap shrink-0 flex items-center justify-center gap-2 ${
          variant === 'primary'
            ? 'yn-btn-saffron'
            : 'yn-glass-card text-[#18231E] dark:text-[#FFFDF8] hover:border-[#FF9933]/50'
        } ${className}`}
      >
        <Download className="w-4 h-4 shrink-0" />
        <span>{label}</span>
      </motion.button>

      <AnimatePresence>
        {showGuide ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#07130F]/75 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pwa-guide-title"
          >
            <motion.div
              initial={{ y: 28, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 28, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="w-full sm:max-w-md yn-glass-card yn-tricolor-border rounded-t-3xl sm:rounded-2xl shadow-2xl p-6 pb-8 sm:pb-6"
            >
              <div className="w-10 h-1.5 bg-[#075E36]/25 dark:bg-white/20 rounded-full mx-auto mb-4 sm:hidden" />
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="w-11 h-11 rounded-xl bg-[#FF9933]/15 border border-[#FF9933]/35 flex items-center justify-center text-[#E87516] dark:text-[#FFB866] shrink-0">
                  <Smartphone className="w-5 h-5" />
                </div>
                <button
                  type="button"
                  onClick={() => setShowGuide(false)}
                  aria-label="Close install instructions"
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-[#43564D] dark:text-[#9CB0A6] hover:text-[#18231E] dark:hover:text-[#FFFDF8] hover:bg-[#E8EDF2]/60 dark:hover:bg-white/[0.06] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <h3 id="pwa-guide-title" className="text-lg font-semibold text-[#18231E] dark:text-[#FFFDF8] mb-2">
                Download Your Need to your phone
              </h3>

              {isIOS ? (
                <div className="space-y-3 text-sm text-[#18231E]/85 dark:text-[#E8EDF2]/90 leading-relaxed">
                  <p>Install Your Need directly onto your iPhone or iPad home screen:</p>
                  <ol className="space-y-2 list-decimal pl-5 text-[#18231E] dark:text-[#FFFDF8]">
                    <li>
                      Open this link in <strong>Safari</strong> and tap the{' '}
                      <span className="inline-flex items-center gap-1 font-semibold">
                        Share <Share className="w-3.5 h-3.5" />
                      </span>{' '}
                      button.
                    </li>
                    <li>
                      Scroll down and tap <strong>Add to Home Screen</strong>.
                    </li>
                    <li>
                      Tap <strong>Add</strong> to launch Your Need like a native mobile app.
                    </li>
                  </ol>
                </div>
              ) : (
                <div className="space-y-3 text-sm text-[#18231E]/85 dark:text-[#E8EDF2]/90 leading-relaxed">
                  <p>
                    Install Your Need as a standalone mobile app with offline support and instant home-screen launch:
                  </p>
                  <ol className="space-y-2 list-decimal pl-5 text-[#18231E] dark:text-[#FFFDF8]">
                    <li>
                      Open this page in <strong>Chrome</strong> or <strong>Edge</strong> on your phone.
                    </li>
                    <li>
                      Tap the browser menu (<strong>⋮</strong>) and choose{' '}
                      <strong>Install app</strong> or <strong>Add to Home screen</strong>.
                    </li>
                    <li>
                      Confirm <strong>Install</strong> to add Your Need to your app drawer.
                    </li>
                  </ol>
                </div>
              )}

              <button
                type="button"
                onClick={() => setShowGuide(false)}
                className="mt-5 w-full min-h-[48px] px-4 py-2.5 rounded-xl yn-btn-saffron text-sm font-semibold"
              >
                Got it
              </button>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
};

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  if (isOnline) return null;

  return (
    <div
      role="status"
      className="fixed bottom-18 lg:bottom-5 left-4 z-40 flex items-center gap-2 rounded-xl bg-[#E87516] border border-[#FFD28A]/40 px-3.5 py-2 text-xs font-semibold text-[#FFFDF8] shadow-lg"
    >
      <WifiOff className="w-4 h-4 shrink-0" />
      <span>Offline Mode — Showing cached directory</span>
    </div>
  );
};
