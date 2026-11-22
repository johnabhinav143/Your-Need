import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  Bell,
  Bot,
  CheckCheck,
  MessageSquare,
  Send,
  Wrench,
} from 'lucide-react';
import { formatTimestamp, STATUS_LABELS } from '../constants';
import {
  markNotificationRead,
  sendJobMessage,
  subscribeJobMessages,
} from '../services/firestoreService';
import {
  AppNotification,
  JobMessage,
  RepairJob,
} from '../types';
import { CategoryIcon } from './CategoryIcon';
import { getNotificationIcon } from './NotificationCenter';

interface AppMessagesScreenProps {
  currentUid: string | null;
  currentName: string;
  myCustomerJobs: RepairJob[];
  myTechnicianJobs: RepairJob[];
  notifications: AppNotification[];
  initialTab?: 'chats' | 'updates';
  onMarkAllRead?: () => void;
  onOpenJobDetail: (job: RepairJob) => void;
  onOpenAiAssistant: () => void;
  onOpenAuth: (reason: string) => void;
}

export const AppMessagesScreen: React.FC<AppMessagesScreenProps> = ({
  currentUid,
  currentName,
  myCustomerJobs,
  myTechnicianJobs,
  notifications,
  initialTab = 'chats',
  onMarkAllRead,
  onOpenJobDetail,
  onOpenAiAssistant,
  onOpenAuth,
}) => {
  const [activeTab, setActiveTab] = useState<'chats' | 'updates'>(initialTab);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);
  const [messages, setMessages] = useState<JobMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const chatThreads = useMemo(() => {
    const merged = [...myCustomerJobs, ...myTechnicianJobs].filter(
      (job) => Boolean(job.technicianId) && !job.isSample
    );
    const seen = new Set<string>();
    return merged.filter((j) => {
      if (seen.has(j.id)) return false;
      seen.add(j.id);
      return true;
    });
  }, [myCustomerJobs, myTechnicianJobs]);

  const activeThread = useMemo(
    () => chatThreads.find((j) => j.id === selectedJobId) || null,
    [chatThreads, selectedJobId]
  );

  useEffect(() => {
    if (!activeThread || !currentUid || !activeThread.technicianId) {
      setMessages([]);
      return;
    }
    const roleFilter =
      activeThread.customerId === currentUid ? 'customer' : 'technician';
    const unsub = subscribeJobMessages(
      activeThread.id,
      roleFilter,
      currentUid,
      (msgs) => {
        setMessages(msgs);
      }
    );
    return () => unsub();
  }, [activeThread, currentUid]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, activeThread?.id]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeThread || !currentUid || !activeThread.technicianId || !draft.trim()) {
      return;
    }
    setSending(true);
    try {
      const isCustomer = activeThread.customerId === currentUid;
      await sendJobMessage({
        jobId: activeThread.id,
        senderId: currentUid,
        senderName: currentName,
        senderRole: isCustomer ? 'customer' : 'technician',
        customerId: activeThread.customerId,
        technicianId: activeThread.technicianId,
        text: draft,
      });
      setDraft('');
    } finally {
      setSending(false);
    }
  };

  if (!currentUid) {
    return (
      <div className="rounded-2xl yn-glass-card yn-tricolor-border p-10 text-center space-y-6">
        <div className="w-14 h-14 rounded-2xl bg-[#FF9933]/15 border border-[#FF9933]/35 flex items-center justify-center text-[#E87516] dark:text-[#FFB866] mx-auto">
          <MessageSquare className="w-7 h-7" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold font-display yn-tricolor-text">
            Messages &amp; Live Dispatch Chat
          </h2>
          <p className="text-xs sm:text-sm text-[#43564D] dark:text-[#9CB0A6] max-w-md mx-auto leading-relaxed">
            Sign in with Google to chat securely with your matched service providers and receive real-time booking updates.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3.5">
          <button
            type="button"
            onClick={() => onOpenAuth('Sign in with Google to view your booking chats and notifications.')}
            className="min-h-[46px] px-6 rounded-xl yn-btn-saffron text-xs sm:text-sm font-bold"
          >
            Sign In to Message
          </button>
          <button
            type="button"
            onClick={onOpenAiAssistant}
            className="min-h-[46px] px-5 rounded-xl bg-[#E8EDF2] dark:bg-[#07130F] border border-[#138808]/25 dark:border-[#35C46A]/35 text-[#138808] dark:text-[#35C46A] text-xs sm:text-sm font-semibold inline-flex items-center gap-2 hover:border-[#35C46A]"
          >
            <Bot className="w-4 h-4" />
            <span>Ask AI Concierge</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-7 sm:space-y-8">
      {/* Segment Switch + AI Concierge shortcut */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 p-2 rounded-2xl yn-glass-card flex-1 sm:flex-initial">
          <button
            type="button"
            onClick={() => setActiveTab('chats')}
            className={`flex-1 sm:flex-initial min-h-[44px] px-5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'chats'
                ? 'yn-btn-saffron font-bold'
                : 'text-[#43564D] dark:text-[#9CB0A6]'
            }`}
          >
            Chats ({chatThreads.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('updates')}
            className={`flex-1 sm:flex-initial min-h-[44px] px-5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'updates'
                ? 'yn-btn-emerald font-bold'
                : 'text-[#43564D] dark:text-[#9CB0A6]'
            }`}
          >
            Updates ({notifications.filter((n) => !n.read).length})
          </button>
        </div>

        <button
          type="button"
          onClick={onOpenAiAssistant}
          className="min-h-[46px] px-5 rounded-xl yn-glass-card text-[#18231E] dark:text-[#FFFDF8] text-xs sm:text-sm font-semibold inline-flex items-center gap-2.5 hover:border-[#FF9933]/50 transition-colors"
        >
          <Bot className="w-4 h-4 text-[#E87516] dark:text-[#FF9933]" />
          <span>AI Concierge</span>
        </button>
      </div>

      {activeTab === 'updates' ? (
        <div className="rounded-2xl yn-glass-card yn-tricolor-border overflow-hidden">
          {notifications.some((n) => !n.read) && onMarkAllRead ? (
            <div className="px-6 py-3.5 border-b border-[#075E36]/12 dark:border-white/[0.08] flex items-center justify-between bg-[#E8EDF2]/75 dark:bg-[#07130F]/80">
              <span className="text-xs sm:text-sm font-semibold text-[#43564D] dark:text-[#9CB0A6]">
                {notifications.filter((n) => !n.read).length} unread notifications
              </span>
              <button
                type="button"
                onClick={onMarkAllRead}
                className="min-h-[38px] px-3.5 rounded-xl bg-[#FF9933]/15 text-[#E87516] dark:text-[#FFB866] text-xs font-bold inline-flex items-center gap-1.5 hover:bg-[#FF9933]/25 transition-colors"
              >
                <CheckCheck className="w-4 h-4" />
                <span>Mark all read</span>
              </button>
            </div>
          ) : null}
          <div className="divide-y divide-[#075E36]/10 dark:divide-white/[0.08]">
            {notifications.length === 0 ? (
              <div className="p-10 text-center space-y-3">
                <Bell className="w-8 h-8 text-[#E87516] dark:text-[#FF9933] mx-auto" />
                <p className="text-base font-semibold text-[#18231E] dark:text-[#FFFDF8]">
                  No updates yet
                </p>
                <p className="text-xs sm:text-sm text-[#43564D] dark:text-[#9CB0A6] max-w-md mx-auto">
                  Quote approvals, ETA alerts, chat replies, and payment confirmations appear here.
                </p>
              </div>
            ) : (
              notifications.map((n) => {
                const Icon = getNotificationIcon(n.type);
                return (
                  <button
                    key={n.id}
                    type="button"
                    onClick={async () => {
                      if (!n.read && !n.id.startsWith('local_')) await markNotificationRead(n.id);
                      const found = [...myCustomerJobs, ...myTechnicianJobs].find(
                        (j) => j.id === n.jobId
                      );
                      if (found) onOpenJobDetail(found);
                    }}
                    className={`w-full p-5 sm:p-6 text-left flex items-start gap-4 hover:bg-[#E8EDF2]/60 dark:hover:bg-white/[0.04] transition-colors ${
                      !n.read ? 'bg-[#FF9933]/10' : ''
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        !n.read
                          ? 'yn-btn-saffron'
                          : 'bg-[#E8EDF2] dark:bg-[#07130F] border border-[#075E36]/15 dark:border-white/[0.08] text-[#138808] dark:text-[#35C46A]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs sm:text-sm font-bold text-[#18231E] dark:text-[#FFFDF8]">
                          {n.title}
                        </span>
                        <span className="text-[11px] text-[#43564D] dark:text-[#9CB0A6] shrink-0">
                          {formatTimestamp(n.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs text-[#43564D] dark:text-[#9CB0A6] leading-relaxed">
                        {n.body}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6">
          {/* Thread List */}
          <div
            className={`lg:col-span-5 rounded-2xl yn-glass-card overflow-hidden ${
              activeThread ? 'hidden lg:block' : 'block'
            }`}
          >
            {chatThreads.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <Wrench className="w-7 h-7 text-[#138808] dark:text-[#35C46A] mx-auto" />
                <p className="text-sm font-semibold text-[#18231E] dark:text-[#FFFDF8]">
                  No active booking chats yet
                </p>
                <p className="text-xs text-[#43564D] dark:text-[#9CB0A6]">
                  Once a technician accepts a booking, real-time private messaging unlocks here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#075E36]/10 dark:divide-white/[0.08]">
                {chatThreads.map((job) => {
                  const selected = activeThread?.id === job.id;
                  const counterpartName =
                    job.customerId === currentUid
                      ? job.technicianName || 'Assigned Specialist'
                      : job.customerName;
                  return (
                    <button
                      key={job.id}
                      type="button"
                      onClick={() => setSelectedJobId(job.id)}
                      className={`w-full p-5 text-left flex items-center gap-4 transition-colors ${
                        selected
                          ? 'bg-[#FF9933]/14 border-l-2 border-[#FF9933]'
                          : 'hover:bg-[#E8EDF2]/60 dark:hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className="w-11 h-11 rounded-xl bg-[#E8EDF2] dark:bg-[#07130F] border border-[#075E36]/15 dark:border-[#FF9933]/25 text-[#E87516] dark:text-[#FFB866] flex items-center justify-center shrink-0">
                        <CategoryIcon category={job.applianceCategory} className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-[#18231E] dark:text-[#FFFDF8] truncate">
                            {counterpartName}
                          </p>
                          <span className="text-[11px] font-semibold text-[#138808] dark:text-[#35C46A] shrink-0">
                            {STATUS_LABELS[job.status]}
                          </span>
                        </div>
                        <p className="text-xs text-[#43564D] dark:text-[#9CB0A6] truncate">
                          {job.issueTitle}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Active Chat Room */}
          <div
            className={`lg:col-span-7 rounded-2xl yn-glass-card yn-tricolor-border flex flex-col min-h-[440px] max-h-[70vh] ${
              activeThread ? 'block' : 'hidden lg:flex'
            }`}
          >
            {!activeThread ? (
              <div className="flex-1 flex flex-col items-center justify-center p-10 text-center space-y-3">
                <MessageSquare className="w-9 h-9 text-[#E87516] dark:text-[#FF9933]" />
                <p className="text-base font-semibold text-[#18231E] dark:text-[#FFFDF8]">
                  Select a booking conversation
                </p>
                <p className="text-xs sm:text-sm text-[#43564D] dark:text-[#9CB0A6]">
                  Coordinate arrival gate notes, spare parts, or timing live.
                </p>
              </div>
            ) : (
              <>
                <div className="px-6 py-4 border-b border-[#075E36]/12 dark:border-white/[0.08] flex items-center justify-between gap-4 shrink-0">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <button
                      type="button"
                      onClick={() => setSelectedJobId(null)}
                      className="lg:hidden min-h-[42px] min-w-[42px] rounded-xl bg-[#E8EDF2] dark:bg-[#07130F] flex items-center justify-center text-[#E87516] dark:text-[#FF9933]"
                      aria-label="Back to chat list"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div className="min-w-0 space-y-0.5">
                      <p className="text-sm font-bold text-[#18231E] dark:text-[#FFFDF8] truncate">
                        {activeThread.customerId === currentUid
                          ? activeThread.technicianName || 'Specialist'
                          : activeThread.customerName}
                      </p>
                      <p className="text-xs text-[#43564D] dark:text-[#9CB0A6] truncate">
                        {activeThread.issueTitle} · {STATUS_LABELS[activeThread.status]}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onOpenJobDetail(activeThread)}
                    className="min-h-[42px] px-4 rounded-xl bg-[#E8EDF2] dark:bg-[#07130F] border border-[#075E36]/15 dark:border-[#35C46A]/35 text-xs font-semibold text-[#138808] dark:text-[#35C46A] shrink-0"
                  >
                    Track Job
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto overscroll-y-contain p-5 sm:p-6 space-y-4">
                  {messages.length === 0 ? (
                    <p className="text-xs sm:text-sm text-[#43564D] dark:text-[#9CB0A6] text-center py-10">
                      No messages yet. Say hello or confirm arrival instructions below.
                    </p>
                  ) : (
                    messages.map((msg) => {
                      const mine = msg.senderId === currentUid;
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${mine ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-2xl px-4.5 py-3 text-xs sm:text-sm ${
                              mine
                                ? 'yn-btn-saffron font-medium'
                                : 'bg-[#E8EDF2] dark:bg-[#07130F] border border-[#075E36]/15 dark:border-white/[0.08] text-[#18231E] dark:text-[#FFFDF8]'
                            }`}
                          >
                            <p className="leading-relaxed">{msg.text}</p>
                            <p
                              className={`text-[11px] mt-1.5 ${
                                mine ? 'text-[#07130F]/75' : 'text-[#43564D] dark:text-[#9CB0A6]'
                              }`}
                            >
                              {msg.senderName} · {formatTimestamp(msg.createdAt)}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={bottomRef} />
                </div>

                <form
                  onSubmit={handleSend}
                  className="p-4 sm:p-5 border-t border-[#075E36]/12 dark:border-white/[0.08] flex items-center gap-3 shrink-0"
                >
                  <input
                    type="text"
                    maxLength={500}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Write a message..."
                    className="flex-1 min-h-[48px] px-4 rounded-xl bg-[#FFFDF8] dark:bg-[#07130F] border border-[#075E36]/20 dark:border-white/[0.12] text-sm text-[#18231E] dark:text-[#FFFDF8] placeholder:text-[#5B6F65] dark:placeholder:text-[#7E948A] focus:outline-none focus:ring-2 focus:ring-[#FF9933]"
                  />
                  <button
                    type="submit"
                    disabled={sending || !draft.trim()}
                    aria-label="Send message"
                    className="min-h-[48px] min-w-[48px] rounded-xl yn-btn-saffron flex items-center justify-center disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
