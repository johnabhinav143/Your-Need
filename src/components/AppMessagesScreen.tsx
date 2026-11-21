import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  Bell,
  Bot,
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

interface AppMessagesScreenProps {
  currentUid: string | null;
  currentName: string;
  myCustomerJobs: RepairJob[];
  myTechnicianJobs: RepairJob[];
  notifications: AppNotification[];
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
  onOpenJobDetail,
  onOpenAiAssistant,
  onOpenAuth,
}) => {
  const [activeTab, setActiveTab] = useState<'chats' | 'updates'>('chats');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
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
      <div className="rounded-2xl bg-white dark:bg-[#141414] border border-black/[0.08] dark:border-white/[0.08] p-8 text-center space-y-5">
        <div className="w-12 h-12 rounded-xl bg-[#F3EEE2] dark:bg-[#1C1C1C] flex items-center justify-center text-[#D6AE53] mx-auto">
          <MessageSquare className="w-6 h-6" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-lg font-bold text-[#171717] dark:text-white font-display">
            Messages &amp; Live Dispatch Chat
          </h2>
          <p className="text-xs text-[#595959] dark:text-[#A0A0A0] max-w-sm mx-auto leading-relaxed">
            Sign in with Google to chat securely with your matched service providers and receive real-time booking updates.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => onOpenAuth('Sign in with Google to view your booking chats and notifications.')}
            className="min-h-[44px] px-5 rounded-xl bg-[#D6AE53] text-[#080808] text-xs font-bold"
          >
            Sign In to Message
          </button>
          <button
            type="button"
            onClick={onOpenAiAssistant}
            className="min-h-[44px] px-4 rounded-xl bg-[#F3EEE2] dark:bg-[#1C1C1C] text-[#D6AE53] text-xs font-semibold inline-flex items-center gap-2"
          >
            <Bot className="w-4 h-4" />
            <span>Ask AI Concierge</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Segment Switch + AI Concierge shortcut */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1.5 rounded-2xl bg-white dark:bg-[#141414] border border-black/[0.08] dark:border-white/[0.08] flex-1 sm:flex-initial">
          <button
            type="button"
            onClick={() => setActiveTab('chats')}
            className={`flex-1 sm:flex-initial min-h-[40px] px-4 rounded-xl text-xs font-semibold transition-colors ${
              activeTab === 'chats'
                ? 'bg-[#D6AE53] text-[#080808] font-bold'
                : 'text-[#595959] dark:text-[#A0A0A0]'
            }`}
          >
            Chats ({chatThreads.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('updates')}
            className={`flex-1 sm:flex-initial min-h-[40px] px-4 rounded-xl text-xs font-semibold transition-colors ${
              activeTab === 'updates'
                ? 'bg-[#D6AE53] text-[#080808] font-bold'
                : 'text-[#595959] dark:text-[#A0A0A0]'
            }`}
          >
            Updates ({notifications.filter((n) => !n.read).length})
          </button>
        </div>

        <button
          type="button"
          onClick={onOpenAiAssistant}
          className="min-h-[42px] px-4 rounded-xl bg-white dark:bg-[#141414] border border-black/[0.08] dark:border-white/[0.08] text-[#171717] dark:text-white text-xs font-semibold inline-flex items-center gap-2 hover:border-[#D6AE53]/50 transition-colors"
        >
          <Bot className="w-4 h-4 text-[#D6AE53]" />
          <span>AI Concierge</span>
        </button>
      </div>

      {activeTab === 'updates' ? (
        <div className="rounded-2xl bg-white dark:bg-[#141414] border border-black/[0.08] dark:border-white/[0.08] divide-y divide-black/[0.06] dark:divide-white/[0.06]">
          {notifications.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <Bell className="w-7 h-7 text-[#D6AE53] mx-auto" />
              <p className="text-sm font-semibold text-[#171717] dark:text-white">
                No updates yet
              </p>
              <p className="text-xs text-[#595959] dark:text-[#A0A0A0]">
                Quote approvals, ETA alerts, and payment confirmations appear here.
              </p>
            </div>
          ) : (
            notifications.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={async () => {
                  if (!n.read) await markNotificationRead(n.id);
                  const found = [...myCustomerJobs, ...myTechnicianJobs].find(
                    (j) => j.id === n.jobId
                  );
                  if (found) onOpenJobDetail(found);
                }}
                className={`w-full p-4 text-left hover:bg-[#F6F3EC] dark:hover:bg-[#1C1C1C] transition-colors first:rounded-t-2xl last:rounded-b-2xl ${
                  !n.read ? 'bg-[#D6AE53]/10' : ''
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-bold text-[#171717] dark:text-white">
                    {n.title}
                  </span>
                  <span className="text-[11px] text-[#A0A0A0] shrink-0">
                    {formatTimestamp(n.createdAt)}
                  </span>
                </div>
                <p className="text-xs text-[#595959] dark:text-[#A0A0A0] mt-1 leading-relaxed">
                  {n.body}
                </p>
              </button>
            ))
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Thread List */}
          <div
            className={`lg:col-span-5 rounded-2xl bg-white dark:bg-[#141414] border border-black/[0.08] dark:border-white/[0.08] overflow-hidden ${
              activeThread ? 'hidden lg:block' : 'block'
            }`}
          >
            {chatThreads.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <Wrench className="w-7 h-7 text-[#D6AE53] mx-auto" />
                <p className="text-sm font-semibold text-[#171717] dark:text-white">
                  No active booking chats yet
                </p>
                <p className="text-xs text-[#595959] dark:text-[#A0A0A0]">
                  Once a technician accepts a booking, real-time private messaging unlocks here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-black/[0.06] dark:divide-white/[0.06]">
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
                      className={`w-full p-4 text-left flex items-center gap-3.5 transition-colors ${
                        selected
                          ? 'bg-[#D6AE53]/12'
                          : 'hover:bg-[#F6F3EC] dark:hover:bg-[#1C1C1C]'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-[#F3EEE2] dark:bg-[#1C1C1C] text-[#D6AE53] flex items-center justify-center shrink-0">
                        <CategoryIcon category={job.applianceCategory} className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-[#171717] dark:text-white truncate">
                            {counterpartName}
                          </p>
                          <span className="text-[11px] font-semibold text-[#D6AE53] shrink-0">
                            {STATUS_LABELS[job.status]}
                          </span>
                        </div>
                        <p className="text-xs text-[#595959] dark:text-[#A0A0A0] truncate">
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
            className={`lg:col-span-7 rounded-2xl bg-white dark:bg-[#141414] border border-black/[0.08] dark:border-white/[0.08] flex flex-col min-h-[420px] max-h-[68vh] ${
              activeThread ? 'block' : 'hidden lg:flex'
            }`}
          >
            {!activeThread ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-2">
                <MessageSquare className="w-8 h-8 text-[#D6AE53]" />
                <p className="text-sm font-semibold text-[#171717] dark:text-white">
                  Select a booking conversation
                </p>
                <p className="text-xs text-[#595959] dark:text-[#A0A0A0]">
                  Coordinate arrival gate notes, spare parts, or timing live.
                </p>
              </div>
            ) : (
              <>
                <div className="px-5 py-3.5 border-b border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between gap-3 shrink-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      type="button"
                      onClick={() => setSelectedJobId(null)}
                      className="lg:hidden min-h-[38px] min-w-[38px] rounded-xl bg-[#F3EEE2] dark:bg-[#1C1C1C] flex items-center justify-center text-[#D6AE53]"
                      aria-label="Back to chat list"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[#171717] dark:text-white truncate">
                        {activeThread.customerId === currentUid
                          ? activeThread.technicianName || 'Specialist'
                          : activeThread.customerName}
                      </p>
                      <p className="text-xs text-[#A0A0A0] truncate">
                        {activeThread.issueTitle} · {STATUS_LABELS[activeThread.status]}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onOpenJobDetail(activeThread)}
                    className="min-h-[38px] px-3.5 rounded-xl bg-[#F3EEE2] dark:bg-[#1C1C1C] text-xs font-semibold text-[#D6AE53] shrink-0"
                  >
                    Track Job
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto overscroll-y-contain p-5 space-y-3">
                  {messages.length === 0 ? (
                    <p className="text-xs text-[#A0A0A0] text-center py-8">
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
                            className={`max-w-[80%] rounded-2xl px-4 py-3 text-xs ${
                              mine
                                ? 'bg-[#D6AE53] text-[#080808] font-medium'
                                : 'bg-[#F3EEE2] dark:bg-[#1C1C1C] text-[#171717] dark:text-white'
                            }`}
                          >
                            <p className="leading-relaxed">{msg.text}</p>
                            <p
                              className={`text-[11px] mt-1 ${
                                mine ? 'text-[#080808]/70' : 'text-[#A0A0A0]'
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
                  className="p-4 border-t border-black/[0.06] dark:border-white/[0.06] flex items-center gap-2.5 shrink-0"
                >
                  <input
                    type="text"
                    maxLength={500}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Write a message..."
                    className="flex-1 min-h-[44px] px-4 rounded-xl bg-[#F3EEE2] dark:bg-[#1C1C1C] text-xs text-[#171717] dark:text-white placeholder:text-[#A0A0A0] focus:outline-none focus:ring-2 focus:ring-[#D6AE53]"
                  />
                  <button
                    type="submit"
                    disabled={sending || !draft.trim()}
                    aria-label="Send message"
                    className="min-h-[44px] min-w-[44px] rounded-xl bg-[#D6AE53] text-[#080808] flex items-center justify-center disabled:opacity-50"
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
