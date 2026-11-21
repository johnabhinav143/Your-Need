import React, { useEffect, useState } from 'react';
import { BadgeCheck, CheckCircle2, PhoneCall, ShieldCheck, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { CATEGORY_OPTIONS, PAYMENT_METHOD_OPTIONS } from '../constants';
import { CountryRegion } from '../i18n/regions';
import { PaymentMethod, TechnicianProfile, VerificationStatus } from '../types';

interface TechnicianSetupSheetProps {
  open: boolean;
  existingProfile: TechnicianProfile | null;
  region: CountryRegion;
  currencyCode: string;
  defaultName: string;
  defaultNeighborhood: string;
  defaultPhone: string;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    displayName: string;
    neighborhood: string;
    countryCode: string;
    currencyCode: string;
    phone: string;
    specialties: string[];
    acceptedPayments: PaymentMethod[];
    spokenLanguages: string[];
    bio: string;
    visitFee: number;
    responseTimeMins: number;
    isAvailable: boolean;
    phoneVerified: boolean;
    verificationStatus: VerificationStatus;
    idType: string;
    idLast4: string;
    yearsExperience: number;
    serviceRadiusKm: number;
  }) => Promise<void>;
}

export function TechnicianSetupSheet({
  open,
  existingProfile,
  region,
  currencyCode,
  defaultName,
  defaultNeighborhood,
  defaultPhone,
  submitting,
  onClose,
  onSubmit,
}: TechnicianSetupSheetProps) {
  const [displayName, setDisplayName] = useState(defaultName);
  const [neighborhood, setNeighborhood] = useState(defaultNeighborhood);
  const [phone, setPhone] = useState(defaultPhone);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [otpRequested, setOtpRequested] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [otpDemoCode, setOtpDemoCode] = useState('4829');

  const [idType, setIdType] = useState('National ID / Aadhaar');
  const [idLast4, setIdLast4] = useState('');
  const [yearsExperience, setYearsExperience] = useState('4');
  const [serviceRadiusKm, setServiceRadiusKm] = useState('8');
  const [requestVerification, setRequestVerification] = useState(true);

  const [specialties, setSpecialties] = useState<string[]>([
    'Ceiling & Exhaust Fans',
    'Air Conditioner (AC)',
  ]);
  const [acceptedPayments, setAcceptedPayments] = useState<PaymentMethod[]>([
    'cash',
    'upi_qr',
    'card',
  ]);
  const [languagesText, setLanguagesText] = useState('English, Hindi, Telugu');
  const [bio, setBio] = useState('');
  const [visitFee, setVisitFee] = useState('25');
  const [responseTimeMins, setResponseTimeMins] = useState('30');
  const [isAvailable, setIsAvailable] = useState(true);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (open) {
      if (existingProfile) {
        setDisplayName(existingProfile.displayName);
        setNeighborhood(existingProfile.neighborhood);
        setSpecialties(existingProfile.specialties);
        setAcceptedPayments(existingProfile.acceptedPayments || ['cash']);
        setLanguagesText((existingProfile.spokenLanguages || ['English']).join(', '));
        setBio(existingProfile.bio);
        setVisitFee(String(existingProfile.visitFee));
        setResponseTimeMins(String(existingProfile.responseTimeMins));
        setIsAvailable(existingProfile.isAvailable);
        setPhoneVerified(Boolean(existingProfile.phoneVerified));
        setIdType(existingProfile.idType || 'National ID / Aadhaar');
        setIdLast4(existingProfile.idLast4 || '');
        setYearsExperience(String(existingProfile.yearsExperience ?? 3));
        setServiceRadiusKm(String(existingProfile.serviceRadiusKm ?? 8));
        setRequestVerification(
          existingProfile.verificationStatus === 'pending' ||
            existingProfile.verificationStatus === 'verified'
        );
      } else {
        setDisplayName(defaultName);
        setNeighborhood(defaultNeighborhood);
        setPhoneVerified(false);
      }
      setPhone((prev) => prev || defaultPhone || `${region.dialCode} `);
      setOtpRequested(false);
      setOtpInput('');
      setFormError('');
    }
  }, [open, existingProfile, defaultName, defaultNeighborhood, defaultPhone, region.dialCode]);

  const handleRequestOtp = () => {
    if (phone.trim().length < 7) {
      setFormError('Enter a valid phone number before verifying.');
      return;
    }
    setFormError('');
    const code = String(Math.floor(1000 + Math.random() * 9000));
    setOtpDemoCode(code);
    setOtpRequested(true);
  };

  const handleConfirmOtp = () => {
    if (otpInput.trim() === otpDemoCode) {
      setPhoneVerified(true);
      setOtpRequested(false);
      setFormError('');
    } else {
      setFormError('Verification code did not match. Please enter the 4-digit code shown.');
    }
  };

  const toggleSpecialty = (label: string) => {
    setSpecialties((prev) => {
      if (prev.includes(label)) {
        return prev.length > 1 ? prev.filter((item) => item !== label) : prev;
      }
      if (prev.length >= 12) return prev;
      return [...prev, label];
    });
  };

  const togglePayment = (pm: PaymentMethod) => {
    setAcceptedPayments((prev) => {
      if (prev.includes(pm)) {
        return prev.length > 1 ? prev.filter((item) => item !== pm) : prev;
      }
      return [...prev, pm];
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (displayName.trim().length < 2) {
      setFormError('Please enter your technician or shop name.');
      return;
    }
    if (neighborhood.trim().length < 2) {
      setFormError('Please enter the city and starter service zone you cover.');
      return;
    }
    if (phone.trim().length < 5) {
      setFormError('Please enter your phone number so matched customers can call you.');
      return;
    }

    const spokenLanguages = languagesText
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length >= 2)
      .slice(0, 6);

    const nextVerificationStatus: VerificationStatus =
      existingProfile?.verificationStatus === 'verified'
        ? 'verified'
        : requestVerification && idLast4.trim().length >= 3
          ? 'pending'
          : 'unverified';

    await onSubmit({
      displayName: displayName.trim(),
      neighborhood: neighborhood.trim(),
      countryCode: region.code,
      currencyCode,
      phone: phone.trim(),
      specialties,
      acceptedPayments,
      spokenLanguages: spokenLanguages.length > 0 ? spokenLanguages : ['English'],
      bio:
        bio.trim() ||
        'Local repair specialist available for same-day diagnostics and home appliance servicing.',
      visitFee: Number(visitFee) || 25,
      responseTimeMins: Number(responseTimeMins) || 30,
      isAvailable,
      phoneVerified,
      verificationStatus: nextVerificationStatus,
      idType: idType.trim(),
      idLast4: idLast4.trim().slice(0, 10),
      yearsExperience: Number(yearsExperience) || 2,
      serviceRadiusKm: Math.min(100, Math.max(1, Number(serviceRadiusKm) || 8)),
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
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#171717]/55 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="tech-setup-title"
        >
          <motion.div
            initial={{ y: 36, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 36, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="w-full sm:max-w-xl bg-white dark:bg-[#171717] rounded-t-3xl sm:rounded-2xl border border-[#E8DFC8] dark:border-[#2E2E2E] shadow-xl max-h-[92vh] flex flex-col"
          >
            <div className="px-6 pt-3 pb-4 border-b border-[#EFE8D5] dark:border-[#2E2E2E] shrink-0">
              <div className="w-10 h-1.5 bg-slate-300 dark:bg-[#262626] rounded-full mx-auto mb-3 sm:hidden" />
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 id="tech-setup-title" className="text-lg font-semibold text-[#171717] dark:text-white">
                    {existingProfile ? 'Technician Profile & Verification' : 'Register as a Verified Technician'}
                  </h2>
                  <p className="text-xs text-[#595959] dark:text-[#B5ADA0] mt-0.5">
                    {region.name} ({currencyCode}) · Focus on a tight service zone for fast arrival
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close technician setup"
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-[#595959] dark:text-[#B5ADA0] hover:text-[#171717] dark:hover:text-white hover:bg-[#FFFDF7] dark:hover:bg-[#121212] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="overflow-y-auto px-6 py-5 space-y-5">
              {/* Identity & Phone Verification Section */}
              <div className="rounded-xl bg-[#FFFDF7] dark:bg-[#D6A84F]/15 border border-[#D6A84F]/40 dark:border-[#D6A84F]/35 p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-[#171717] dark:text-[#D6A84F] flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Phone &amp; Identity Verification</span>
                  </span>
                  {existingProfile?.verificationStatus === 'verified' ? (
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                      <BadgeCheck className="w-3.5 h-3.5" />
                      Verified Pro
                    </span>
                  ) : null}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="tech-phone" className="block text-xs font-medium text-[#292929] dark:text-[#DDD6C7] mb-1">
                      Contact phone ({region.dialCode})
                    </label>
                    <div className="flex gap-2">
                      <input
                        id="tech-phone"
                        type="tel"
                        required
                        maxLength={30}
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value);
                          setPhoneVerified(false);
                        }}
                        placeholder={`${region.dialCode} 98765 43210`}
                        className="flex-1 min-w-0 min-h-[42px] px-3 py-2 rounded-xl border border-[#D8CEB4] dark:border-[#292929] bg-white dark:bg-[#121212] text-sm tabular-nums text-[#171717] dark:text-[#FFFDF7]"
                      />
                      <button
                        type="button"
                        onClick={handleRequestOtp}
                        className={`min-h-[42px] px-3 rounded-xl text-xs font-semibold shrink-0 flex items-center gap-1 ${
                          phoneVerified
                            ? 'bg-emerald-700 text-white'
                            : 'bg-[#171717] dark:bg-[#D6A84F] text-white dark:text-[#171717]'
                        }`}
                      >
                        {phoneVerified ? <CheckCircle2 className="w-3.5 h-3.5" /> : <PhoneCall className="w-3.5 h-3.5" />}
                        <span>{phoneVerified ? 'Verified' : 'Verify'}</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="tech-exp" className="block text-xs font-medium text-[#292929] dark:text-[#DDD6C7] mb-1">
                      Years of experience
                    </label>
                    <input
                      id="tech-exp"
                      type="number"
                      min={0}
                      max={60}
                      value={yearsExperience}
                      onChange={(e) => setYearsExperience(e.target.value)}
                      className="w-full min-h-[42px] px-3 py-2 rounded-xl border border-[#D8CEB4] dark:border-[#292929] bg-white dark:bg-[#121212] text-sm tabular-nums text-[#171717] dark:text-[#FFFDF7]"
                    />
                  </div>
                </div>

                {otpRequested ? (
                  <div className="rounded-xl bg-white dark:bg-[#171717] border border-[#D6A84F]/40 dark:border-[#D6A84F]/35 p-3 flex flex-col sm:flex-row sm:items-center gap-2.5">
                    <span className="text-xs text-[#292929] dark:text-[#DDD6C7]">
                      Verification code: <strong className="text-[#8F6412] dark:text-[#D6A84F]">{otpDemoCode}</strong>
                    </span>
                    <input
                      type="text"
                      maxLength={6}
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value)}
                      placeholder="Enter 4-digit code"
                      className="min-h-[38px] px-3 py-1 rounded-lg border border-[#D8CEB4] dark:border-[#292929] bg-slate-50 dark:bg-[#121212] text-xs tabular-nums"
                    />
                    <button
                      type="button"
                      onClick={handleConfirmOtp}
                      className="min-h-[38px] px-3 py-1 rounded-lg bg-emerald-700 text-white text-xs font-semibold"
                    >
                      Confirm Phone
                    </button>
                  </div>
                ) : null}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="tech-id-type" className="block text-xs font-medium text-[#292929] dark:text-[#DDD6C7] mb-1">
                      Government / Trade ID type
                    </label>
                    <select
                      id="tech-id-type"
                      value={idType}
                      onChange={(e) => setIdType(e.target.value)}
                      className="w-full min-h-[42px] px-3 py-2 rounded-xl border border-[#D8CEB4] dark:border-[#292929] bg-white dark:bg-[#121212] text-xs text-[#171717] dark:text-[#FFFDF7]"
                    >
                      <option value="National ID / Aadhaar">National ID / Aadhaar</option>
                      <option value="Driver License">Driver License</option>
                      <option value="Trade License / Certificate">Trade License / Certificate</option>
                      <option value="Passport">Passport</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="tech-id-last4" className="block text-xs font-medium text-[#292929] dark:text-[#DDD6C7] mb-1">
                      Last 4 digits (for admin review)
                    </label>
                    <input
                      id="tech-id-last4"
                      type="text"
                      maxLength={10}
                      value={idLast4}
                      onChange={(e) => setIdLast4(e.target.value)}
                      placeholder="e.g., 4821"
                      className="w-full min-h-[42px] px-3 py-2 rounded-xl border border-[#D8CEB4] dark:border-[#292929] bg-white dark:bg-[#121212] text-sm tabular-nums text-[#171717] dark:text-[#FFFDF7]"
                    />
                  </div>
                </div>

                {existingProfile?.verificationStatus !== 'verified' ? (
                  <label className="flex items-center gap-2 text-xs text-[#292929] dark:text-[#DDD6C7] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={requestVerification}
                      onChange={(e) => setRequestVerification(e.target.checked)}
                      className="w-4 h-4 accent-[#D6A84F]"
                    />
                    <span>Submit ID &amp; phone for admin Verified Pro review</span>
                  </label>
                ) : null}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="tech-name" className="block text-sm font-medium text-[#171717] dark:text-[#FFFDF7] mb-1.5">
                    Your name / shop name
                  </label>
                  <input
                    id="tech-name"
                    type="text"
                    required
                    maxLength={60}
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g., Sam Electrical & AC"
                    className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-[#D8CEB4] dark:border-[#292929] bg-white dark:bg-[#121212] text-sm text-[#171717] dark:text-[#FFFDF7] focus:outline-none focus:ring-2 focus:ring-[#D6A84F]"
                  />
                </div>

                <div>
                  <label htmlFor="tech-radius" className="block text-sm font-medium text-[#171717] dark:text-[#FFFDF7] mb-1.5">
                    Service radius (km)
                  </label>
                  <input
                    id="tech-radius"
                    type="number"
                    min={1}
                    max={100}
                    value={serviceRadiusKm}
                    onChange={(e) => setServiceRadiusKm(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-[#D8CEB4] dark:border-[#292929] bg-white dark:bg-[#121212] text-sm tabular-nums text-[#171717] dark:text-[#FFFDF7] focus:outline-none focus:ring-2 focus:ring-[#D6A84F]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="tech-area" className="block text-sm font-medium text-[#171717] dark:text-[#FFFDF7] mb-1.5">
                    Primary service area (start focused)
                  </label>
                  <input
                    id="tech-area"
                    type="text"
                    required
                    maxLength={80}
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    placeholder="e.g., Madhapur & Jubilee Hills"
                    className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-[#D8CEB4] dark:border-[#292929] bg-white dark:bg-[#121212] text-sm text-[#171717] dark:text-[#FFFDF7] focus:outline-none focus:ring-2 focus:ring-[#D6A84F]"
                  />
                </div>
                <div>
                  <label htmlFor="tech-langs" className="block text-sm font-medium text-[#171717] dark:text-[#FFFDF7] mb-1.5">
                    Languages spoken
                  </label>
                  <input
                    id="tech-langs"
                    type="text"
                    maxLength={120}
                    value={languagesText}
                    onChange={(e) => setLanguagesText(e.target.value)}
                    placeholder="English, Telugu, Hindi"
                    className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-[#D8CEB4] dark:border-[#292929] bg-white dark:bg-[#121212] text-sm text-[#171717] dark:text-[#FFFDF7] focus:outline-none focus:ring-2 focus:ring-[#D6A84F]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#171717] dark:text-[#FFFDF7] mb-2">
                  All repairs you handle
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CATEGORY_OPTIONS.map((item) => {
                    const selected = specialties.includes(item.label);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleSpecialty(item.label)}
                        className={`min-h-[44px] px-3 py-2 rounded-xl border text-left text-xs transition-colors ${
                          selected
                            ? 'bg-[#FFFDF7] dark:bg-[#D6A84F]/20 border-[#D6A84F] text-[#171717] dark:text-[#D6A84F] font-semibold'
                            : 'bg-white dark:bg-[#121212]/90 border-[#E8DFC8] dark:border-[#2E2E2E] text-[#292929] dark:text-[#E8E2D5] hover:border-slate-300 dark:hover:border-slate-600'
                        }`}
                      >
                        {item.shortLabel}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#171717] dark:text-[#FFFDF7] mb-2">
                  Payment methods you accept
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {PAYMENT_METHOD_OPTIONS.map((pm) => {
                    const selected = acceptedPayments.includes(pm.id);
                    return (
                      <button
                        key={pm.id}
                        type="button"
                        onClick={() => togglePayment(pm.id)}
                        className={`min-h-[44px] px-3 py-2 rounded-xl border text-left text-xs transition-colors ${
                          selected
                            ? 'bg-[#FFFDF7] dark:bg-[#D6A84F]/20 border-[#D6A84F] text-[#171717] dark:text-[#D6A84F] font-semibold'
                            : 'bg-white dark:bg-[#121212]/90 border-[#E8DFC8] dark:border-[#2E2E2E] text-[#292929] dark:text-[#E8E2D5] hover:border-slate-300 dark:hover:border-slate-600'
                        }`}
                      >
                        {pm.shortLabel}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="tech-fee" className="block text-sm font-medium text-[#171717] dark:text-[#FFFDF7] mb-1.5">
                    Inspection fee ({currencyCode})
                  </label>
                  <input
                    id="tech-fee"
                    type="number"
                    min={0}
                    max={10000000}
                    value={visitFee}
                    onChange={(e) => setVisitFee(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-[#D8CEB4] dark:border-[#292929] bg-white dark:bg-[#121212] text-sm tabular-nums text-[#171717] dark:text-[#FFFDF7] focus:outline-none focus:ring-2 focus:ring-[#D6A84F]"
                  />
                </div>

                <div>
                  <label htmlFor="tech-eta" className="block text-sm font-medium text-[#171717] dark:text-[#FFFDF7] mb-1.5">
                    Typical arrival (mins)
                  </label>
                  <input
                    id="tech-eta"
                    type="number"
                    min={5}
                    max={240}
                    value={responseTimeMins}
                    onChange={(e) => setResponseTimeMins(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-[#D8CEB4] dark:border-[#292929] bg-white dark:bg-[#121212] text-sm tabular-nums text-[#171717] dark:text-[#FFFDF7] focus:outline-none focus:ring-2 focus:ring-[#D6A84F]"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="tech-bio" className="block text-sm font-medium text-[#171717] dark:text-[#FFFDF7] mb-1.5">
                  Experience &amp; tools carried
                </label>
                <textarea
                  id="tech-bio"
                  rows={3}
                  maxLength={400}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Mention years of experience, brands you service, and spare parts you keep on hand."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8CEB4] dark:border-[#292929] bg-white dark:bg-[#121212] text-sm text-[#171717] dark:text-[#FFFDF7] focus:outline-none focus:ring-2 focus:ring-[#D6A84F]"
                />
              </div>

              <label className="flex items-center justify-between gap-4 p-3.5 rounded-xl bg-[#FFFDF7] dark:bg-[#0D0D0D]/75 border border-[#E8DFC8] dark:border-[#2E2E2E] cursor-pointer min-h-[52px]">
                <div>
                  <span className="block text-sm font-medium text-[#171717] dark:text-[#FFFDF7]">
                    Available for immediate jobs
                  </span>
                  <span className="block text-xs text-[#595959] dark:text-[#B5ADA0]">
                    Show your profile as Available Now to nearby homeowners
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={isAvailable}
                  onChange={(e) => setIsAvailable(e.target.checked)}
                  className="w-5 h-5 accent-[#D6A84F] rounded"
                />
              </label>

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
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 min-h-[48px] px-5 py-2.5 rounded-xl bg-[#171717] dark:bg-[#D6A84F] text-white dark:text-[#171717] text-sm font-semibold hover:bg-[#262626] dark:hover:brightness-110 disabled:opacity-60 transition-colors"
                >
                  {submitting ? 'Saving profile...' : 'Save Technician Profile'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
