import React, { useEffect, useState } from 'react';
import { Camera, Film, Info, Lock, Trash2, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import {
  CANCELLATION_POLICY_TEXT,
  CATEGORY_INSPECTION_USD,
  CATEGORY_OPTIONS,
  PAYMENT_METHOD_OPTIONS,
} from '../constants';
import { convertUsdToRegionAmount, CountryRegion, formatMoney } from '../i18n/regions';
import {
  AiBookingDraft,
  ApplianceCategory,
  JobUrgency,
  PaymentMethod,
  TechnicianProfile,
} from '../types';
import { CategoryIcon } from './CategoryIcon';

interface RequestRepairSheetProps {
  open: boolean;
  embedded?: boolean;
  isSignedIn: boolean;
  region: CountryRegion;
  currencyCode: string;
  defaultName: string;
  defaultNeighborhood: string;
  defaultPhone: string;
  defaultAddress: string;
  targetTechnician: TechnicianProfile | null;
  initialDraft?: AiBookingDraft | null;
  availableTechCount: number;
  submitting: boolean;
  onClose: () => void;
  onRequireAuth: () => void;
  onSubmit: (payload: {
    customerName: string;
    neighborhood: string;
    countryCode: string;
    currencyCode: string;
    applianceCategory: ApplianceCategory;
    issueTitle: string;
    issueDescription: string;
    urgency: JobUrgency;
    preferredSlot: string;
    estimatedBudget: number;
    inspectionFee: number;
    paymentMethod: PaymentMethod;
    targetTechnicianId: string;
    mediaUrl: string;
    mediaType: 'none' | 'image' | 'video';
    mediaLabel: string;
    phone: string;
    streetAddress: string;
    accessNote: string;
  }) => Promise<void>;
}

const SLOT_SUGGESTIONS = [
  'Today, 11:00 AM – 1:00 PM',
  'Today, 2:00 PM – 5:00 PM',
  'Today, 5:30 PM – 8:00 PM',
  'Tomorrow, 9:00 AM – 12:00 PM',
];

async function compressImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 720;
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas unsupported'));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', 0.65);
        resolve(compressed);
      };
      img.onerror = () => reject(new Error('Unable to load image file.'));
      img.src = String(reader.result);
    };
    reader.onerror = () => reject(new Error('Unable to read image file.'));
    reader.readAsDataURL(file);
  });
}

async function processVideoFile(
  file: File
): Promise<{ url: string; type: 'video' | 'image'; label: string }> {
  // If short video is already small (< 160KB binary -> < 220KB base64), embed playable video directly
  if (file.size <= 155000) {
    const rawUrl = await new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result));
      r.onerror = () => reject(new Error('Failed to read video clip.'));
      r.readAsDataURL(file);
    });
    if (rawUrl.length <= 235000) {
      return { url: rawUrl, type: 'video', label: `${file.name} (Short clip)` };
    }
  }

  // Otherwise capture a crisp poster frame from the video so technicians see the appliance fault clearly under 1MB limit
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;
    video.src = objectUrl;
    video.onloadeddata = () => {
      video.currentTime = Math.min(0.8, video.duration ? video.duration / 2 : 0);
    };
    video.onseeked = () => {
      try {
        const maxDim = 640;
        let w = video.videoWidth || 640;
        let h = video.videoHeight || 360;
        if (w > maxDim) {
          h = Math.round((h * maxDim) / w);
          w = maxDim;
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, w, h);
          const poster = canvas.toDataURL('image/jpeg', 0.65);
          URL.revokeObjectURL(objectUrl);
          resolve({
            url: poster,
            type: 'image',
            label: `${file.name} (Video keyframe preview)`,
          });
          return;
        }
      } catch {
        // fallback below
      }
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Could not extract frame from video.'));
    };
    video.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Unsupported video format. Please upload a photo or MP4/WebM clip.'));
    };
  });
}

export function RequestRepairSheet({
  open,
  embedded = false,
  isSignedIn,
  region,
  currencyCode,
  defaultName,
  defaultNeighborhood,
  defaultPhone,
  defaultAddress,
  targetTechnician,
  initialDraft,
  availableTechCount,
  submitting,
  onClose,
  onRequireAuth,
  onSubmit,
}: RequestRepairSheetProps) {
  const [category, setCategory] = useState<ApplianceCategory>('fan');
  const [issueTitle, setIssueTitle] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [urgency, setUrgency] = useState<JobUrgency>('urgent_today');
  const [preferredSlot, setPreferredSlot] = useState(SLOT_SUGGESTIONS[1]);
  const [estimatedBudget, setEstimatedBudget] = useState('45');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [customerName, setCustomerName] = useState(defaultName);
  const [neighborhood, setNeighborhood] = useState(defaultNeighborhood);
  const [phone, setPhone] = useState(defaultPhone);
  const [streetAddress, setStreetAddress] = useState(defaultAddress);
  const [accessNote, setAccessNote] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState<'none' | 'image' | 'video'>('none');
  const [mediaLabel, setMediaLabel] = useState('');
  const [mediaProcessing, setMediaProcessing] = useState(false);
  const [formError, setFormError] = useState('');

  const inspectionFeeAmount = targetTechnician
    ? targetTechnician.visitFee
    : convertUsdToRegionAmount(CATEGORY_INSPECTION_USD[category] || 14, region);

  useEffect(() => {
    if (open) {
      setCustomerName((prev) => prev || defaultName);
      setNeighborhood((prev) => prev || defaultNeighborhood);
      setPhone((prev) => prev || defaultPhone || `${region.dialCode} `);
      setStreetAddress((prev) => prev || defaultAddress);
      const baseRepairUsd = 40;
      setEstimatedBudget(String(convertUsdToRegionAmount(baseRepairUsd, region)));
      if (initialDraft) {
        setCategory(initialDraft.category);
        setIssueTitle(initialDraft.issueTitle);
        setIssueDescription(initialDraft.issueDescription);
        setUrgency(initialDraft.urgency);
      } else {
        setIssueTitle('');
        setIssueDescription('');
        setMediaUrl('');
        setMediaType('none');
        setMediaLabel('');
      }
      setFormError('');
    }
  }, [
    open,
    defaultName,
    defaultNeighborhood,
    defaultPhone,
    defaultAddress,
    region,
    initialDraft,
  ]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFormError('');
    setMediaProcessing(true);
    try {
      if (file.type.startsWith('image/')) {
        const compressed = await compressImageFile(file);
        if (compressed.length > 235000) {
          setFormError('Photo is still too large after compression. Please pick a smaller image.');
          return;
        }
        setMediaUrl(compressed);
        setMediaType('image');
        setMediaLabel(file.name.slice(0, 80));
      } else if (file.type.startsWith('video/')) {
        const processed = await processVideoFile(file);
        setMediaUrl(processed.url);
        setMediaType(processed.type);
        setMediaLabel(processed.label.slice(0, 100));
      } else {
        setFormError('Please select a photo (JPG/PNG) or short video (MP4/WebM).');
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Unable to attach file.');
    } finally {
      setMediaProcessing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!isSignedIn) {
      onRequireAuth();
      return;
    }

    if (issueTitle.trim().length < 4) {
      setFormError('Please enter a short summary of the repair problem.');
      return;
    }
    if (issueDescription.trim().length < 5) {
      setFormError('Please describe the issue so technicians bring the right parts.');
      return;
    }
    if (neighborhood.trim().length < 2) {
      setFormError('Please enter your city, neighborhood, or area.');
      return;
    }
    if (phone.trim().length < 5 || streetAddress.trim().length < 5) {
      setFormError('Please enter your phone number and street address for the visit.');
      return;
    }

    await onSubmit({
      customerName: customerName.trim() || defaultName || 'Homeowner',
      neighborhood: neighborhood.trim(),
      countryCode: region.code,
      currencyCode,
      applianceCategory: category,
      issueTitle: issueTitle.trim(),
      issueDescription: issueDescription.trim(),
      urgency,
      preferredSlot: preferredSlot.trim() || 'Today',
      estimatedBudget: Number(estimatedBudget) || inspectionFeeAmount,
      inspectionFee: inspectionFeeAmount,
      paymentMethod,
      targetTechnicianId:
        targetTechnician && !targetTechnician.isSample ? targetTechnician.uid : '',
      mediaUrl,
      mediaType,
      mediaLabel,
      phone: phone.trim(),
      streetAddress: streetAddress.trim(),
      accessNote: accessNote.trim(),
    });
  };

  const formBody = (
    <form onSubmit={handleSubmit} className={embedded ? 'p-4 sm:p-6 space-y-5' : 'overflow-y-auto px-6 py-5 space-y-5'}>
      {initialDraft ? (
        <div className="rounded-xl bg-[#FFFDF7] dark:bg-[#D6AE53]/15 border border-[#D6AE53]/40 dark:border-[#D6AE53]/35 px-3.5 py-2.5 text-xs text-[#171717] dark:text-[#F3D58B] font-medium">
          Pre-filled by AI Service Assistant. Review your slot, upload a photo/video if helpful, and submit.
        </div>
      ) : null}

              <div>
                <label className="block text-sm font-medium text-[#171717] dark:text-[#FFFDF7] mb-2">
                  What needs to be repaired?
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CATEGORY_OPTIONS.map((item) => {
                    const active = category === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setCategory(item.id)}
                        className={`min-h-[44px] px-3 py-2 rounded-xl border text-left transition-colors flex items-center gap-2 ${
                          active
                            ? 'bg-[#FFFDF7] dark:bg-[#D6A84F]/20 border-[#D6A84F] text-[#171717] dark:text-[#D6A84F] font-semibold'
                            : 'bg-white dark:bg-[#121212]/90 border-[#E8DFC8] dark:border-[#2E2E2E] text-[#292929] dark:text-[#E8E2D5] hover:border-slate-300 dark:hover:border-slate-600'
                        }`}
                      >
                        <CategoryIcon category={item.id} className="w-4 h-4 shrink-0" />
                        <span className="text-xs truncate">{item.shortLabel}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label htmlFor="issue-title" className="block text-sm font-medium text-[#171717] dark:text-[#FFFDF7] mb-1.5">
                  Short problem headline
                </label>
                <input
                  id="issue-title"
                  type="text"
                  required
                  maxLength={100}
                  value={issueTitle}
                  onChange={(e) => setIssueTitle(e.target.value)}
                  placeholder="e.g., Washing machine not starting or draining"
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-[#D8CEB4] dark:border-[#292929] bg-white dark:bg-[#121212] text-sm text-[#171717] dark:text-[#FFFDF7] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D6A84F] focus:border-[#D6A84F]"
                />
              </div>

              <div>
                <label htmlFor="issue-desc" className="block text-sm font-medium text-[#171717] dark:text-[#FFFDF7] mb-1.5">
                  Symptoms &amp; details
                </label>
                <textarea
                  id="issue-desc"
                  required
                  rows={3}
                  maxLength={500}
                  value={issueDescription}
                  onChange={(e) => setIssueDescription(e.target.value)}
                  placeholder="Share appliance model/type and symptoms so the technician brings the right tools and parts."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8CEB4] dark:border-[#292929] bg-white dark:bg-[#121212] text-sm text-[#171717] dark:text-[#FFFDF7] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D6A84F] focus:border-[#D6A84F]"
                />
              </div>

              {/* Photo / Short Video Problem Upload */}
              <div className="rounded-xl border border-dashed border-[#D8CEB4] dark:border-[#292929] bg-slate-50/70 dark:bg-[#121212]/50 p-4 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold text-[#171717] dark:text-white flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-[#8F6412] dark:text-[#D6A84F]" />
                      <span>Upload fault photo or short video (optional)</span>
                    </p>
                    <p className="text-[11px] text-[#595959] dark:text-[#B5ADA0] mt-0.5">
                      Helps technicians inspect the problem before visiting and bring exact spare parts.
                    </p>
                  </div>
                  {mediaUrl ? (
                    <button
                      type="button"
                      onClick={() => {
                        setMediaUrl('');
                        setMediaType('none');
                        setMediaLabel('');
                      }}
                      className="min-h-[36px] px-2.5 rounded-lg text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/15 flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  ) : null}
                </div>

                {!mediaUrl ? (
                  <label className="min-h-[44px] px-4 py-2 rounded-xl border border-[#D8CEB4] dark:border-[#292929] bg-white dark:bg-[#171717] text-xs font-semibold text-[#292929] dark:text-[#E8E2D5] hover:border-[#D6A84F] cursor-pointer inline-flex items-center gap-2">
                    <Film className="w-4 h-4 text-[#8F6412]" />
                    <span>{mediaProcessing ? 'Processing media...' : 'Choose Photo or Short Video'}</span>
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleFileChange}
                      className="sr-only"
                    />
                  </label>
                ) : (
                  <div className="space-y-1.5">
                    {mediaType === 'video' ? (
                      <video
                        src={mediaUrl}
                        controls
                        className="w-full max-h-44 rounded-xl bg-black object-contain"
                      />
                    ) : (
                      <img
                        src={mediaUrl}
                        alt="Uploaded fault preview"
                        className="w-full max-h-44 rounded-xl object-cover border border-[#E8DFC8] dark:border-[#2E2E2E]"
                      />
                    )}
                    <p className="text-[11px] text-[#595959] dark:text-[#B5ADA0] truncate">
                      Attached: {mediaLabel}
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#171717] dark:text-[#FFFDF7] mb-1.5">
                    Service priority
                  </label>
                  <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#FFFDF7] dark:bg-[#0D0D0D] rounded-xl">
                    {(
                      [
                        { id: 'urgent_today', label: 'Urgent' },
                        { id: 'within_24h', label: '24 hrs' },
                        { id: 'flexible', label: 'Flexible' },
                      ] as const
                    ).map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setUrgency(opt.id)}
                        className={`min-h-[40px] px-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                          urgency === opt.id
                            ? opt.id === 'urgent_today'
                              ? 'bg-[#D6A84F] text-[#08080A] shadow-sm font-bold'
                              : 'bg-white dark:bg-[#262626] text-[#171717] dark:text-white shadow-sm'
                            : 'text-[#292929] dark:text-[#DDD6C7] hover:text-[#171717] dark:hover:text-white'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  {urgency === 'urgent_today' ? (
                    <p className="text-[11px] font-medium text-[#8F6412] dark:text-[#F3D999] mt-1">
                      Priority urgent queue · Subject to live availability ({availableTechCount} pros ready).
                    </p>
                  ) : null}
                </div>

                <div>
                  <label htmlFor="est-budget" className="block text-sm font-medium text-[#171717] dark:text-[#FFFDF7] mb-1.5">
                    Estimated service charge ({currencyCode})
                  </label>
                  <input
                    id="est-budget"
                    type="number"
                    min={0}
                    max={10000000}
                    value={estimatedBudget}
                    onChange={(e) => setEstimatedBudget(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-[#D8CEB4] dark:border-[#292929] bg-white dark:bg-[#121212] text-sm tabular-nums text-[#171717] dark:text-[#FFFDF7] focus:outline-none focus:ring-2 focus:ring-[#D6A84F]"
                  />
                </div>
              </div>

              {/* Pricing Transparency Card */}
              <div className="rounded-xl bg-[#FFFDF7] dark:bg-[#0D0D0D]/75 border border-[#E8DFC8] dark:border-[#2E2E2E] p-4 space-y-2 text-xs">
                <p className="font-bold text-[#171717] dark:text-white flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-[#8F6412] dark:text-[#D6A84F]" />
                  <span>Transparent Price Breakdown</span>
                </p>
                <div className="flex justify-between text-[#292929] dark:text-[#DDD6C7]">
                  <span>Inspection / Visiting Charge</span>
                  <span className="tabular-nums font-semibold text-[#171717] dark:text-white">
                    {formatMoney(inspectionFeeAmount, currencyCode)}
                  </span>
                </div>
                <div className="flex justify-between text-[#292929] dark:text-[#DDD6C7]">
                  <span>Estimated Repair Budget</span>
                  <span className="tabular-nums font-semibold text-[#171717] dark:text-white">
                    {formatMoney(Number(estimatedBudget) || 0, currencyCode)}
                  </span>
                </div>
                <p className="text-[11px] text-[#595959] dark:text-[#B5ADA0] pt-1 border-t border-[#E8DFC8] dark:border-[#2E2E2E]">
                  Final price requires your explicit approval before repair begins. {CANCELLATION_POLICY_TEXT}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#171717] dark:text-[#FFFDF7] mb-2">
                  Available appointment slots
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {SLOT_SUGGESTIONS.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setPreferredSlot(slot)}
                      className={`min-h-[34px] px-2.5 py-1 rounded-lg border text-xs transition-colors ${
                        preferredSlot === slot
                          ? 'bg-[#FFFDF7] dark:bg-[#D6A84F]/20 border-[#D6A84F] text-[#171717] dark:text-[#D6A84F] font-semibold'
                          : 'bg-white dark:bg-[#121212] border-[#E8DFC8] dark:border-[#2E2E2E] text-[#292929] dark:text-[#DDD6C7]'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="preferred-slot" className="block text-xs font-medium text-[#292929] dark:text-[#DDD6C7] mb-1">
                      Custom visit slot
                    </label>
                    <input
                      id="preferred-slot"
                      type="text"
                      maxLength={60}
                      value={preferredSlot}
                      onChange={(e) => setPreferredSlot(e.target.value)}
                      className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-[#D8CEB4] dark:border-[#292929] bg-white dark:bg-[#121212] text-sm text-[#171717] dark:text-[#FFFDF7] focus:outline-none focus:ring-2 focus:ring-[#D6A84F]"
                    />
                  </div>
                  <div>
                    <label htmlFor="neighborhood" className="block text-xs font-medium text-[#292929] dark:text-[#DDD6C7] mb-1">
                      City &amp; area ({region.name})
                    </label>
                    <input
                      id="neighborhood"
                      type="text"
                      required
                      maxLength={80}
                      value={neighborhood}
                      onChange={(e) => setNeighborhood(e.target.value)}
                      placeholder="e.g., Madhapur, Hyderabad"
                      className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-[#D8CEB4] dark:border-[#292929] bg-white dark:bg-[#121212] text-sm text-[#171717] dark:text-[#FFFDF7] focus:outline-none focus:ring-2 focus:ring-[#D6A84F]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#171717] dark:text-[#FFFDF7] mb-2">
                  Preferred payment method
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {PAYMENT_METHOD_OPTIONS.map((pm) => {
                    const active = paymentMethod === pm.id;
                    return (
                      <button
                        key={pm.id}
                        type="button"
                        onClick={() => setPaymentMethod(pm.id)}
                        className={`min-h-[44px] px-3 py-2 rounded-xl border text-left transition-colors ${
                          active
                            ? 'bg-[#FFFDF7] dark:bg-[#D6A84F]/20 border-[#D6A84F] text-[#171717] dark:text-[#D6A84F] font-semibold'
                            : 'bg-white dark:bg-[#121212]/90 border-[#E8DFC8] dark:border-[#2E2E2E] text-[#292929] dark:text-[#E8E2D5] hover:border-slate-300 dark:hover:border-slate-600'
                        }`}
                      >
                        <span className="block text-xs truncate">{pm.shortLabel}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-[#E8DFC8] dark:border-[#2E2E2E] space-y-4">
                <div className="flex items-center gap-2 text-xs text-[#292929] dark:text-[#DDD6C7]">
                  <Lock className="w-3.5 h-3.5 text-[#8F6412] dark:text-[#D6A84F] shrink-0" />
                  <span>
                    Private phone &amp; address — revealed only to the technician assigned to your booking.
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="customer-name" className="block text-sm font-medium text-[#171717] dark:text-[#FFFDF7] mb-1.5">
                      Your name
                    </label>
                    <input
                      id="customer-name"
                      type="text"
                      required
                      maxLength={60}
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-[#D8CEB4] dark:border-[#292929] bg-white dark:bg-[#121212] text-sm text-[#171717] dark:text-[#FFFDF7] focus:outline-none focus:ring-2 focus:ring-[#D6A84F]"
                    />
                  </div>
                  <div>
                    <label htmlFor="customer-phone" className="block text-sm font-medium text-[#171717] dark:text-[#FFFDF7] mb-1.5">
                      Phone number ({region.dialCode})
                    </label>
                    <input
                      id="customer-phone"
                      type="tel"
                      required
                      maxLength={30}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder={`${region.dialCode} 98765 43210`}
                      className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-[#D8CEB4] dark:border-[#292929] bg-white dark:bg-[#121212] text-sm tabular-nums text-[#171717] dark:text-[#FFFDF7] focus:outline-none focus:ring-2 focus:ring-[#D6A84F]"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="street-address" className="block text-sm font-medium text-[#171717] dark:text-[#FFFDF7] mb-1.5">
                    House / Flat &amp; Street Address
                  </label>
                  <input
                    id="street-address"
                    type="text"
                    required
                    maxLength={180}
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    placeholder="Flat 4B, 218 Maple Street"
                    className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-[#D8CEB4] dark:border-[#292929] bg-white dark:bg-[#121212] text-sm text-[#171717] dark:text-[#FFFDF7] focus:outline-none focus:ring-2 focus:ring-[#D6A84F]"
                  />
                </div>

                <div>
                  <label htmlFor="access-note" className="block text-sm font-medium text-[#171717] dark:text-[#FFFDF7] mb-1.5">
                    Landmark / Gate note (optional)
                  </label>
                  <input
                    id="access-note"
                    type="text"
                    maxLength={200}
                    value={accessNote}
                    onChange={(e) => setAccessNote(e.target.value)}
                    placeholder="Near main gate or call on arrival"
                    className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-[#D8CEB4] dark:border-[#292929] bg-white dark:bg-[#121212] text-sm text-[#171717] dark:text-[#FFFDF7] focus:outline-none focus:ring-2 focus:ring-[#D6A84F]"
                  />
                </div>
              </div>

              {formError ? (
                <div className="rounded-xl bg-rose-50 dark:bg-rose-500/15 border border-rose-200 dark:border-rose-500/30 px-4 py-3 text-sm text-rose-800 dark:text-rose-200">
                  {formError}
                </div>
              ) : null}

              <div className="pt-2 pb-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="min-h-[48px] px-4 py-2.5 rounded-xl border border-[#D8CEB4] dark:border-[#292929] text-sm font-medium text-[#292929] dark:text-[#E8E2D5] hover:bg-[#FFFDF7] dark:hover:bg-[#121212] transition-colors"
                >
                  {embedded ? 'Back' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={submitting || mediaProcessing}
                  className="flex-1 min-h-[48px] px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D6AE53] to-[#F3D58B] text-[#080808] text-sm font-bold hover:brightness-105 disabled:opacity-60 transition-all shadow-lg shadow-[#D6AE53]/20"
                >
                  {!isSignedIn
                    ? 'Sign in with Google & Post Request'
                    : submitting
                      ? 'Posting request...'
                      : 'Confirm Booking Request'}
                </button>
              </div>
            </form>
  );

  if (embedded) {
    return open ? (
      <div className="bg-white dark:bg-[#121212] rounded-3xl border border-[#E8DFC8] dark:border-[#222222] shadow-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-[#EFE8D5] dark:border-[#222222] flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-[#171717] dark:text-white font-display">
              {targetTechnician
                ? `Book ${targetTechnician.displayName}`
                : 'Book a Home Repair Service'}
            </h2>
            <p className="text-xs text-[#595959] dark:text-[#A0A0A0] mt-0.5">
              {targetTechnician
                ? `${targetTechnician.neighborhood} · Avg. ${targetTechnician.responseTimeMins}m arrival`
                : `${region.name} (${currencyCode}) · ${availableTechCount} pros available nearby`}
            </p>
          </div>
        </div>
        {formBody}
      </div>
    ) : null;
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#080808]/70 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="request-repair-title"
        >
          <motion.div
            initial={{ y: 36, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 36, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="w-full sm:max-w-xl bg-white dark:bg-[#121212] rounded-t-3xl sm:rounded-3xl border border-[#E8DFC8] dark:border-[#222222] shadow-2xl max-h-[92vh] flex flex-col"
          >
            <div className="px-6 pt-3 pb-4 border-b border-[#EFE8D5] dark:border-[#222222] shrink-0">
              <div className="w-10 h-1.5 bg-slate-300 dark:bg-[#262626] rounded-full mx-auto mb-3 sm:hidden" />
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 id="request-repair-title" className="text-lg font-semibold text-[#171717] dark:text-white">
                    {targetTechnician
                      ? `Request repair with ${targetTechnician.displayName}`
                      : 'Book a home repair service'}
                  </h2>
                  <p className="text-xs text-[#595959] dark:text-[#A0A0A0] mt-0.5">
                    {targetTechnician
                      ? `${targetTechnician.neighborhood} · Avg. ${targetTechnician.responseTimeMins}m response`
                      : `${region.name} (${currencyCode}) · ${availableTechCount} pros available nearby`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close repair request form"
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-[#595959] dark:text-[#A0A0A0] hover:text-[#171717] dark:hover:text-white hover:bg-[#FFFDF7] dark:hover:bg-[#1A1A1A] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            {formBody}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
