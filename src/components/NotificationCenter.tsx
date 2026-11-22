import React, { useEffect, useRef, useState } from 'react';
import {
  Bell,
  BellOff,
  BellRing,
  CalendarCheck2,
  CheckCheck,
  CreditCard,
  FileCheck2,
  MessageSquare,
  Sparkles,
  Truck,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { formatTimestamp } from '../constants';
import { AppNotification, NotificationType } from '../types';

export function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case 'booking':
      return CalendarCheck2;
    case 'status':
      return Truck;
    case 'quote':
      return FileCheck2;
    case 'payment':
      return CreditCard;
    case 'system':
    default:
      return MessageSquare;
  }
}

interface NotificationCenterDrawerProps {
  open: boolean;
  isSignedIn: boolean;
  notifications: AppNotification[];
  browserPermission: NotificationPermission | 'unsupported';
  pushEnabled: boolean;
  onClose: () => void;
  onNotificationClick: (notif: AppNotification) => void;
  onMarkAllRead: () => void;
  onRequestPushPermission: () => void;
  onSendTestNotification: () => void;
  onOpenMessagesScreen: () => void;
  onOpenAuth: () => void;
}

export const NotificationCenterDrawer: React.FC<NotificationCenterDrawerProps> = ({
  open,
  isSignedIn,
  notifications,
  browserPermission,
  pushEnabled,
  onClose,
  onNotificationClick,
  onMarkAllRead,
  onRequestPushPermission,
  onSendTestNotification,
  onOpenMessagesScreen,
  onOpenAuth,
}) => {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const visibleItems =
    filter === 'unread' ? notifications.filter((n) => !n.read) : notifications;

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="notif-drawer-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
          onClick={onClose}
          className="fixed inset-0 z-50 bg-[#040B08]/60 backdrop-blur-sm flex items-start justify-end p-3 sm:p-5 pt-16 sm:pt-16"
          role="dialog"
          aria-modal="true"
          aria-label="Notifications Center"
        >
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: -12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.97 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:w-[420px] max-h-[84dvh] rounded-3xl yn-glass-card yn-tricolor-border shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-[#075E36]/12 dark:border-white/[0.08] flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FF9933]/15 border border-[#FF9933]/35 text-[#E87516] dark:text-[#FFB866] flex items-center justify-center">
                  <BellRing className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-[#18231E] dark:text-[#FFFDF8]">
                      Notifications
                    </h2>
                    {unreadCount > 0 ? (
                      <span className="px-2 py-0.5 rounded-md yn-btn-saffron text-[10px] font-bold tabular-nums">
                        {unreadCount} new
                      </span>
                    ) : null}
                  </div>
                  <p className="text-[11px] text-[#43564D] dark:text-[#9CB0A6] mt-0.5">
                    Bookings, technician ETAs, quotes &amp; messages
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {unreadCount > 0 ? (
                  <button
                    type="button"
                    onClick={onMarkAllRead}
                    title="Mark all as read"
                    className="min-h-[38px] px-3 rounded-xl text-[11px] font-semibold text-[#138808] dark:text-[#7DFF9B] hover:bg-[#138808]/10 inline-flex items-center gap-1.5 transition-colors"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Mark read</span>
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close notifications"
                  className="min-h-[40px] min-w-[40px] rounded-xl text-[#43564D] dark:text-[#9CB0A6] hover:bg-[#FF9933]/10 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Device / Browser Push Alert Bar */}
            <div className="px-5 py-3 bg-[#E8EDF2]/70 dark:bg-[#07130F]/80 border-b border-[#075E36]/12 dark:border-white/[0.08] flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                {browserPermission === 'granted' && pushEnabled ? (
                  <Bell className="w-4 h-4 text-[#138808] dark:text-[#35C46A] shrink-0" />
                ) : (
                  <BellOff className="w-4 h-4 text-[#E87516] dark:text-[#FFB866] shrink-0" />
                )}
                <span className="text-xs font-medium text-[#43564D] dark:text-[#9CB0A6] truncate">
                  {browserPermission === 'unsupported'
                    ? 'In-app live alerts active'
                    : browserPermission === 'denied'
                      ? 'Browser alerts blocked in site settings'
                      : browserPermission === 'granted' && pushEnabled
                        ? 'Desktop & live alerts enabled'
                        : 'Enable instant desktop & mobile alerts'}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {browserPermission !== 'unsupported' && browserPermission !== 'denied' ? (
                  <button
                    type="button"
                    onClick={onRequestPushPermission}
                    className={`min-h-[34px] px-3 rounded-lg text-[11px] font-bold transition-all ${
                      browserPermission === 'granted' && pushEnabled
                        ? 'bg-[#138808]/15 text-[#138808] dark:text-[#7DFF9B]'
                        : 'yn-btn-saffron'
                    }`}
                  >
                    {browserPermission === 'granted' && pushEnabled ? 'On' : 'Enable'}
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={onSendTestNotification}
                  className="min-h-[34px] px-3 rounded-lg border border-[#075E36]/20 dark:border-white/[0.12] text-[11px] font-semibold text-[#18231E] dark:text-[#FFD28A] hover:border-[#FF9933] transition-colors"
                >
                  Test
                </button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="px-5 py-2.5 border-b border-[#075E36]/12 dark:border-white/[0.08] flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setFilter('all')}
                className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  filter === 'all'
                    ? 'yn-btn-saffron'
                    : 'text-[#43564D] dark:text-[#9CB0A6] hover:bg-[#FF9933]/10'
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                type="button"
                onClick={() => setFilter('unread')}
                className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  filter === 'unread'
                    ? 'yn-btn-emerald'
                    : 'text-[#43564D] dark:text-[#9CB0A6] hover:bg-[#138808]/10'
                }`}
              >
                Unread ({unreadCount})
              </button>
            </div>

            {/* Notification Feed */}
            <div className="flex-1 overflow-y-auto overscroll-y-contain divide-y divide-[#075E36]/12 dark:divide-white/[0.08]">
              {visibleItems.length === 0 ? (
                <div className="p-8 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#FF9933]/14 border border-[#FF9933]/30 text-[#E87516] dark:text-[#FFB866] flex items-center justify-center mx-auto">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-semibold text-[#18231E] dark:text-[#FFFDF8]">
                    {filter === 'unread' ? 'All caught up!' : 'No notifications yet'}
                  </p>
                  <p className="text-xs text-[#43564D] dark:text-[#9CB0A6] leading-relaxed max-w-[280px] mx-auto">
                    {isSignedIn
                      ? 'Live alerts for booking acceptances, technician arrival, quote approvals, chat messages, and invoices appear here.'
                      : 'Sign in with Google to receive persistent real-time repair updates, or tap Test above to preview an alert.'}
                  </p>
                  {!isSignedIn ? (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenAuth();
                      }}
                      className="mt-2 min-h-[42px] px-5 rounded-xl yn-btn-saffron text-xs font-bold"
                    >
                      Sign In for Live Alerts
                    </button>
                  ) : null}
                </div>
              ) : (
                visibleItems.map((n) => {
                  const Icon = getNotificationIcon(n.type);
                  return (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => onNotificationClick(n)}
                      className={`w-full p-4.5 text-left flex items-start gap-3.5 transition-colors hover:bg-[#FF9933]/[0.06] dark:hover:bg-white/[0.04] ${
                        !n.read ? 'bg-[#FF9933]/[0.08]' : ''
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                          !n.read
                            ? 'yn-btn-saffron'
                            : 'bg-[#E8EDF2] dark:bg-[#07130F] border border-[#075E36]/15 dark:border-white/[0.10] text-[#E87516] dark:text-[#FFB866]'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-start justify-between gap-2.5">
                          <p className="text-xs font-bold text-[#18231E] dark:text-[#FFFDF8] leading-snug">
                            {n.title}
                          </p>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {!n.read ? (
                              <span
                                aria-label="Unread"
                                className="w-2 h-2 rounded-full bg-[#FF9933]"
                              />
                            ) : null}
                            <span className="text-[10px] text-[#5B6F65] dark:text-[#7E948A]">
                              {formatTimestamp(n.createdAt)}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-[#43564D] dark:text-[#9CB0A6] leading-relaxed line-clamp-2">
                          {n.body}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-[#075E36]/12 dark:border-white/[0.08] bg-[#E8EDF2]/60 dark:bg-[#07130F]/70 flex items-center justify-between gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenMessagesScreen();
                }}
                className="w-full min-h-[42px] px-4 rounded-xl text-xs font-semibold text-[#E87516] dark:text-[#FFD28A] hover:bg-[#FF9933]/10 transition-colors"
              >
                Open Full Updates &amp; Messages
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

interface LiveNotificationBannerProps {
  notification: AppNotification | null;
  onDismiss: () => void;
  onOpen: (notif: AppNotification) => void;
}

export const LiveNotificationBanner: React.FC<LiveNotificationBannerProps> = ({
  notification,
  onDismiss,
  onOpen,
}) => {
  const Icon = notification ? getNotificationIcon(notification.type) : Bell;

  return (
    <AnimatePresence>
      {notification ? (
        <motion.div
          key={`live-notif-${notification.id}`}
          initial={{ opacity: 0, y: -18, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -16, scale: 0.96 }}
          transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
          role="status"
          aria-live="polite"
          className="fixed top-18 right-3 left-3 sm:left-auto sm:right-5 sm:w-[400px] z-[55] rounded-2xl yn-glass-card yn-tricolor-border p-4 shadow-2xl flex items-start gap-3.5"
        >
          <div className="w-10 h-10 rounded-xl yn-btn-saffron flex items-center justify-center shrink-0 mt-0.5">
            <Icon className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <p className="text-xs font-bold text-[#18231E] dark:text-[#FFD28A] truncate">
              {notification.title}
            </p>
            <p className="text-xs text-[#43564D] dark:text-[#E8EDF2] leading-snug line-clamp-2">
              {notification.body}
            </p>
            <div className="pt-1.5 flex items-center gap-4">
              <button
                type="button"
                onClick={() => onOpen(notification)}
                className="text-xs font-bold text-[#138808] dark:text-[#7DFF9B] hover:underline"
              >
                View Update
              </button>
              <button
                type="button"
                onClick={onDismiss}
                className="text-xs font-medium text-[#5B6F65] dark:text-[#9CB0A6] hover:text-[#18231E] dark:hover:text-[#FFFDF8]"
              >
                Dismiss
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss notification"
            className="text-[#5B6F65] dark:text-[#9CB0A6] hover:text-[#18231E] dark:hover:text-[#FFFDF8] p-1.5 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};
