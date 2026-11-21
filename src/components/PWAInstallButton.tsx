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
        className={`min-h-[44px] px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap shrink-0 flex items-center justify-center gap-2 ${
          variant === 'primary'
            ? 'bg-[#171717] text-white hover:bg-[#262626] dark:bg-[#8F6412] dark:hover:brightness-110'
            : 'bg-white/95 dark:bg-[#171717]/90 border border-[#D8CEB4] dark:border-[#292929] text-[#171717] dark:text-[#FFFDF7] hover:bg-[#FFFDF7] dark:hover:bg-[#121212]'
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
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#171717]/65 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pwa-guide-title"
          >
            <motion.div
              initial={{ y: 28, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 28, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="w-full sm:max-w-md bg-white dark:bg-[#171717] rounded-t-3xl sm:rounded-2xl border border-[#E8DFC8] dark:border-[#2E2E2E] shadow-xl p-6 pb-8 sm:pb-6"
            >
              <div className="w-10 h-1.5 bg-slate-300 dark:bg-[#262626] rounded-full mx-auto mb-4 sm:hidden" />
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="w-11 h-11 rounded-xl bg-[#FFFDF7] dark:bg-[#D6A84F]/15 border border-[#D6A84F]/35 dark:border-[#D6A84F]/35 flex items-center justify-center text-[#8F6412] dark:text-[#D6A84F] shrink-0">
                  <Smartphone className="w-5 h-5" />
                </div>
                <button
                  type="button"
                  onClick={() => setShowGuide(false)}
                  aria-label="Close install instructions"
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-[#595959] dark:text-[#B5ADA0] hover:text-[#171717] dark:hover:text-white hover:bg-[#FFFDF7] dark:hover:bg-[#121212] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <h3 id="pwa-guide-title" className="text-lg font-semibold text-[#171717] dark:text-white mb-2">
                Download Your Need to your phone
              </h3>

              {isIOS ? (
                <div className="space-y-3 text-sm text-[#292929] dark:text-[#DDD6C7] leading-relaxed">
                  <p>Install Your Need directly onto your iPhone or iPad home screen:</p>
                  <ol className="space-y-2 list-decimal pl-5 text-[#292929] dark:text-[#ECE7DC]">
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
                <div className="space-y-3 text-sm text-[#292929] dark:text-[#DDD6C7] leading-relaxed">
                  <p>
                    Install Your Need as a standalone mobile app with offline support and instant home-screen launch:
                  </p>
                  <ol className="space-y-2 list-decimal pl-5 text-[#292929] dark:text-[#ECE7DC]">
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
                className="mt-5 w-full min-h-[48px] px-4 py-2.5 rounded-xl bg-[#171717] dark:bg-[#D6A84F] text-white dark:text-[#171717] text-sm font-semibold hover:bg-[#262626] dark:hover:brightness-110 transition-colors"
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
      className="fixed bottom-18 lg:bottom-5 left-4 z-40 flex items-center gap-2 rounded-xl bg-amber-600 px-3.5 py-2 text-xs font-semibold text-white shadow-lg"
    >
      <WifiOff className="w-4 h-4 shrink-0" />
      <span>Offline Mode — Showing cached directory</span>
    </div>
  );
};
