import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  Bot,
  Box,
  Building2,
  CheckCircle2,
  Film,
  HelpCircle,
  LogIn,
  Moon,
  Phone,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Sun,
  UserPlus,
  Volume2,
  VolumeX,
  Wrench,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import goldDesertLoginBg from '../assets/images/gold_desert_login_bg_1795253092151.jpg';
import { CountryRegion } from '../i18n/regions';
import { AccountCategory, LoginIntentMeta } from '../types';
import { Intro3DStage } from './Intro3DStage';

const GOLD_INTRO_VIDEO_SRC = '/assets/your_need_intro_login_gold.mp4';

interface IntroLaunchScreenProps {
  open: boolean;
  isAuthenticated: boolean;
  userDisplayName?: string;
  authLoading: boolean;
  authError?: string;
  region: CountryRegion;
  currencyCode: string;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onSignIn: (preferredRole?: 'customer' | 'technician', meta?: LoginIntentMeta) => void;
  onContinueToApp: (preferredRole?: 'customer' | 'technician') => void;
  onOpenAiAssistant: () => void;
  onOpenHelp: () => void;
}

const CONCIERGE_HIGHLIGHTS = [
  {
    id: 'trades',
    tabLabel: 'Services',
    headline: 'Master Home Engineering',
    detail: 'AC & Climate · Electrical & Solar · Washer & Fridge · Precision Plumbing',
  },
  {
    id: 'trust',
    tabLabel: 'Guarantee',
    headline: 'Verified Identity & Upfront Pricing',
    detail: 'ID-vetted technicians · Written quote approval before work · Digital warranty receipt',
  },
  {
    id: 'steps',
    tabLabel: 'How It Works',
    headline: '3-Step Private Dispatch',
    detail: '1. Upload fault photo/video · 2. Pick verified pro · 3. Track arrival live',
  },
] as const;

export const IntroLaunchScreen: React.FC<IntroLaunchScreenProps> = ({
  open,
  isAuthenticated,
  userDisplayName,
  authLoading,
  authError,
  region,
  currencyCode,
  theme,
  onToggleTheme,
  onSignIn,
  onContinueToApp,
  onOpenAiAssistant,
  onOpenHelp,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stageMode, setStageMode] = useState<'video' | '3d'>('video');
  const [isMuted, setIsMuted] = useState(true);
  const [videoFailed, setVideoFailed] = useState(false);
  const [progressPct, setProgressPct] = useState(0);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [spinHintActive, setSpinHintActive] = useState(false);

  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'quick'>('login');
  const [accountType, setAccountType] = useState<AccountCategory>('customer');
  const [phoneInput, setPhoneInput] = useState('');
  const [orgInput, setOrgInput] = useState('');
  const [infoIdx, setInfoIdx] = useState(0);

  const selectedRole: 'customer' | 'technician' =
    accountType === 'technician' ? 'technician' : 'customer';

  useEffect(() => {
    if (!open) return;
    setVideoFailed(false);
    setProgressPct(0);

    const interval = window.setInterval(() => {
      setInfoIdx((i) => (i + 1) % CONCIERGE_HIGHLIGHTS.length);
    }, 4500);

    return () => {
      window.clearInterval(interval);
    };
  }, [open]);

  useEffect(() => {
    if (!open || stageMode !== 'video') return;
    const video = videoRef.current;
    if (video) {
      video.currentTime = 0;
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {});
      }
    }
  }, [open, stageMode]);

  const handleToggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    const nextMuted = !isMuted;
    video.muted = nextMuted;
    setIsMuted(nextMuted);
    if (!nextMuted && video.paused) {
      video.play().catch(() => {});
    }
  };

  const handleReplayVideo = () => {
    const video = videoRef.current;
    if (!video) return;
    setVideoFailed(false);
    video.currentTime = 0;
    setProgressPct(0);
    video.play().catch(() => {});
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    setProgressPct(Math.min(100, (video.currentTime / video.duration) * 100));
  };

  const handleEmblemTap = () => {
    setSpinHintActive(true);
    window.setTimeout(() => setSpinHintActive(false), 900);
  };

  const isDark = theme === 'dark';
  const activeInfo = CONCIERGE_HIGHLIGHTS[infoIdx];

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="intro-launch-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className={`fixed inset-0 z-50 h-[100dvh] w-screen overflow-y-auto overflow-x-hidden overscroll-y-contain flex items-start sm:items-center justify-center sm:p-4 ${
            isDark ? 'bg-[#050506]' : 'bg-[#EAE0CA]'
          }`}
          role="dialog"
          aria-modal="true"
          aria-label="Welcome to Your Need"
        >
          {/* Centered Mobile-Suitable Portrait Gold Desert Stage (Comfortably Scrollable) */}
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.36, ease: [0.16, 1, 0.3, 1] }}
            className="relative my-auto w-full min-h-[100dvh] sm:min-h-[min(92dvh,800px)] sm:w-[430px] sm:max-w-[94vw] sm:rounded-[2rem] overflow-hidden sm:border sm:border-[#D6A84F]/55 sm:shadow-[0_24px_80px_rgba(0,0,0,0.75)] bg-[#08080A] text-[#F4ECE0] flex flex-col justify-between"
          >
            {/* Base Gold Desert Image Layer (always crisp behind video & 3D) */}
            <img
              src={goldDesertLoginBg}
              alt="Golden Desert Luxury Backdrop"
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover object-center opacity-85"
            />

            {/* Video Reel OR Interactive 3D Gold Desert Sanctuary */}
            <div className="absolute inset-0">
              {stageMode === 'video' && !videoFailed ? (
                <video
                  ref={videoRef}
                  src={GOLD_INTRO_VIDEO_SRC}
                  poster={goldDesertLoginBg}
                  autoPlay
                  loop
                  muted={isMuted}
                  playsInline
                  preload="auto"
                  onTimeUpdate={handleTimeUpdate}
                  onError={() => setVideoFailed(true)}
                  className="w-full h-full object-cover"
                />
              ) : stageMode === '3d' ? (
                <Intro3DStage
                  theme={theme}
                  selectedRole={selectedRole}
                  authMode={authMode}
                  resetTrigger={resetTrigger}
                  fallbackPoster={goldDesertLoginBg}
                  onEmblemTap={handleEmblemTap}
                />
              ) : null}

              {/* Measured Obsidian & Gold Contrast Scrim */}
              <div className="absolute inset-0 bg-gradient-to-b from-[#08080A]/85 via-[#08080A]/25 to-[#08080A]/96 pointer-events-none" />
            </div>

            {/* Minimal Top Bar Controls */}
            <div className="relative z-10 shrink-0 px-3.5 pt-3 flex items-center justify-between gap-2 pointer-events-none">
              <div className="flex items-center gap-1.5 pointer-events-auto">
                <button
                  type="button"
                  onClick={() => setStageMode((m) => (m === 'video' ? '3d' : 'video'))}
                  aria-label={stageMode === 'video' ? 'Switch to 3D interactive view' : 'Watch gold desert intro video'}
                  className="min-h-[40px] px-3 rounded-xl bg-[#0D0D10]/90 border border-[#D6A84F]/45 text-[#F3D999] hover:border-[#F3D999] transition-colors flex items-center gap-1.5 text-xs font-semibold"
                >
                  {stageMode === 'video' ? (
                    <>
                      <Box className="w-3.5 h-3.5 text-[#D6A84F]" />
                      <span>3D View</span>
                    </>
                  ) : (
                    <>
                      <Film className="w-3.5 h-3.5 text-[#D6A84F]" />
                      <span>Video</span>
                    </>
                  )}
                </button>

                {stageMode === '3d' ? (
                  <button
                    type="button"
                    onClick={() => setResetTrigger((n) => n + 1)}
                    aria-label="Reset 3D camera view"
                    className="min-h-[40px] min-w-[40px] rounded-xl bg-[#0D0D10]/90 border border-[#D6A84F]/30 text-[#F3D999] hover:border-[#D6A84F] transition-colors flex items-center justify-center"
                  >
                    <RotateCcw className="w-4 h-4 text-[#D6A84F]" />
                  </button>
                ) : !videoFailed ? (
                  <>
                    <button
                      type="button"
                      onClick={handleToggleMute}
                      aria-label={isMuted ? 'Unmute intro audio' : 'Mute intro audio'}
                      className="min-h-[40px] min-w-[40px] rounded-xl bg-[#0D0D10]/90 border border-[#D6A84F]/30 text-[#F3D999] hover:border-[#D6A84F] transition-colors flex items-center justify-center"
                    >
                      {isMuted ? (
                        <VolumeX className="w-4 h-4 text-[#D6A84F]" />
                      ) : (
                        <Volume2 className="w-4 h-4 text-[#D6A84F]" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleReplayVideo}
                      aria-label="Replay intro video"
                      className="min-h-[40px] min-w-[40px] rounded-xl bg-[#0D0D10]/90 border border-[#D6A84F]/30 text-[#F3D999] hover:border-[#D6A84F] transition-colors flex items-center justify-center"
                    >
                      <RotateCcw className="w-4 h-4 text-[#D6A84F]" />
                    </button>
                  </>
                ) : null}

                <button
                  type="button"
                  onClick={onToggleTheme}
                  aria-label={isDark ? 'Switch to warm gold day mode' : 'Switch to obsidian gold night mode'}
                  className="min-h-[40px] min-w-[40px] rounded-xl bg-[#0D0D10]/90 border border-[#D6A84F]/30 text-[#F3D999] hover:border-[#D6A84F] transition-colors flex items-center justify-center"
                >
                  {isDark ? (
                    <Sun className="w-4 h-4 text-[#D6A84F]" />
                  ) : (
                    <Moon className="w-4 h-4 text-[#D6A84F]" />
                  )}
                </button>
              </div>

              <button
                type="button"
                onClick={() => onContinueToApp(selectedRole)}
                className="pointer-events-auto min-h-[40px] px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#D6A84F] to-[#F3D999] text-[#08080A] text-xs font-bold hover:brightness-105 transition-all flex items-center gap-1 whitespace-nowrap shrink-0 shadow-md shadow-[#D6A84F]/25"
              >
                <span>Enter</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Upper Luxury Brand Title Lockup */}
            <div className="relative z-10 shrink-0 px-5 pt-1.5 text-center pointer-events-none select-none">
              <motion.p
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="text-[11px] font-semibold tracking-wider text-[#F3D999]"
              >
                {region.name} · {currencyCode} · Private Concierge
              </motion.p>

              <div
                className="flex items-center justify-center gap-2.5 mt-1 leading-none"
                style={{ perspective: 800 }}
              >
                <div className="flex items-center">
                  {'YOUR'.split('').map((ch, i) => (
                    <motion.span
                      key={`your-${i}`}
                      initial={{ opacity: 0, y: 16, rotateX: -42 }}
                      animate={{ opacity: 1, y: 0, rotateX: 0 }}
                      transition={{
                        type: 'spring',
                        stiffness: 280,
                        damping: 20,
                        delay: 0.05 + i * 0.05,
                      }}
                      className="inline-block font-brand text-3xl sm:text-4xl font-extrabold tracking-wide text-[#FFF8EA] drop-shadow"
                    >
                      {ch}
                    </motion.span>
                  ))}
                </div>
                <div className="flex items-center">
                  {'NEED'.split('').map((ch, i) => (
                    <motion.span
                      key={`need-${i}`}
                      initial={{ opacity: 0, y: 16, rotateX: -42 }}
                      animate={{ opacity: 1, y: 0, rotateX: 0 }}
                      transition={{
                        type: 'spring',
                        stiffness: 280,
                        damping: 20,
                        delay: 0.24 + i * 0.05,
                      }}
                      className="inline-block font-brand text-3xl sm:text-4xl font-extrabold tracking-wide bg-gradient-to-r from-[#F3D999] via-[#D6A84F] to-[#F3D999] bg-clip-text text-transparent animate-brand-gradient"
                    >
                      {ch}
                    </motion.span>
                  ))}
                </div>
              </div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45 }}
                className="mt-1 text-xs font-medium text-[#E5D7BE]"
              >
                {stageMode === '3d'
                  ? spinHintActive
                    ? 'Golden Sanctuary Spin Boosted'
                    : 'Drag to orbit 3D Gold Desert · Tap emblem'
                  : 'Luxury Home Appliance & Engineering Care'}
              </motion.p>
            </div>

            {/* Open Center Stage for Video / 3D Orbiting */}
            <div className="flex-1 min-h-0 pointer-events-none" />

            {/* Lower Concierge Info + Multi-Option Black & Gold Auth Console */}
            <div className="relative z-10 shrink-0 px-4 pb-5 pb-safe space-y-3 pointer-events-none">
              {stageMode === 'video' && !videoFailed ? (
                <div className="h-1 w-full rounded-full bg-[#D6A84F]/20 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#9E7628] via-[#D6A84F] to-[#F3D999] transition-[width] duration-150"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              ) : null}

              {/* Interactive In-Depth Info Switcher */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.35 }}
                className="pointer-events-auto rounded-2xl bg-[#0C0C0F]/92 border border-[#D6A84F]/35 px-3.5 py-2.5 space-y-1.5 shadow-lg"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    {CONCIERGE_HIGHLIGHTS.map((item, idx) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setInfoIdx(idx)}
                        className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-colors ${
                          infoIdx === idx
                            ? 'bg-[#D6A84F] text-[#08080A]'
                            : 'text-[#CBBBA0] hover:text-[#F3D999]'
                        }`}
                      >
                        {item.tabLabel}
                      </button>
                    ))}
                  </div>
                  <span className="text-[11px] text-[#D6A84F] font-medium flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Vetted</span>
                  </span>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeInfo.id}
                    initial={{ opacity: 0, y: 6, filter: 'blur(6px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: -6, filter: 'blur(6px)' }}
                    transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <p className="font-display text-sm font-semibold text-[#F3D999] leading-tight">
                      {activeInfo.headline}
                    </p>
                    <p className="text-[11px] text-[#DDD2BE] leading-snug mt-0.5 line-clamp-2">
                      {activeInfo.detail}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </motion.div>

              {/* Black + Gold Multi-Option Sign In / Sign Up Console */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.28, duration: 0.35 }}
                className="pointer-events-auto rounded-2xl bg-[#0D0D10] text-[#F4ECE0] border border-[#D6A84F]/45 p-3.5 shadow-2xl space-y-2.5"
              >
                {authError ? (
                  <div className="rounded-xl bg-[#2A1414] border border-[#D6A84F]/45 px-3 py-1.5 text-xs text-[#F3D999]">
                    {authError}
                  </div>
                ) : null}

                {isAuthenticated ? (
                  <>
                    <div className="text-center space-y-0.5">
                      <p className="text-[11px] font-semibold text-[#D6A84F]">
                        Signed in{userDisplayName ? ` as ${userDisplayName}` : ''}
                      </p>
                      <h2 className="font-display text-lg font-semibold text-[#FFF8EA]">
                        Welcome Back to Your Need
                      </h2>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-[#16161A] border border-[#D6A84F]/30">
                      {(['customer', 'technician'] as const).map((roleOpt) => {
                        const active = selectedRole === roleOpt;
                        return (
                          <button
                            key={roleOpt}
                            type="button"
                            onClick={() => setAccountType(roleOpt)}
                            className={`min-h-[34px] px-2 rounded-lg text-xs font-semibold transition-colors ${
                              active
                                ? 'bg-[#D6A84F] text-[#08080A]'
                                : 'text-[#CBBBA0] hover:text-[#FFF8EA]'
                            }`}
                          >
                            {roleOpt === 'customer' ? 'Customer' : 'Technician'}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      onClick={() => onContinueToApp(selectedRole)}
                      className="relative overflow-hidden w-full min-h-[42px] px-4 py-2 rounded-xl bg-gradient-to-r from-[#D6A84F] via-[#F3D999] to-[#D6A84F] text-[#08080A] text-sm font-bold hover:brightness-105 transition-all flex items-center justify-center gap-2"
                    >
                      <span>
                        {selectedRole === 'technician'
                          ? 'Enter Technician Dashboard'
                          : 'Enter Customer Dashboard'}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <>
                    {/* 3-Way Auth Mode Switcher: Log In | Sign Up | Quick Access */}
                    <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-[#16161A] border border-[#D6A84F]/30">
                      {(
                        [
                          { id: 'login', label: 'Log In' },
                          { id: 'signup', label: 'Sign Up' },
                          { id: 'quick', label: 'Quick Start' },
                        ] as const
                      ).map((mode) => {
                        const active = authMode === mode.id;
                        return (
                          <button
                            key={mode.id}
                            type="button"
                            onClick={() => setAuthMode(mode.id)}
                            className={`relative z-10 min-h-[32px] px-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                              active ? 'text-[#08080A] font-bold' : 'text-[#CBBBA0] hover:text-[#FFF8EA]'
                            }`}
                          >
                            {active ? (
                              <motion.span
                                layoutId="portrait-3d-auth-mode"
                                transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                                className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#D6A84F] to-[#F3D999] -z-10"
                              />
                            ) : null}
                            {mode.label}
                          </button>
                        );
                      })}
                    </div>

                    {authMode === 'quick' ? (
                      <motion.div
                        key="quick-mode-pane"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-2"
                      >
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => onContinueToApp('customer')}
                            className="min-h-[42px] px-3 py-2 rounded-xl border border-[#D6A84F]/45 bg-[#16161A] hover:border-[#F3D999] text-xs font-semibold text-[#FFF8EA] flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#D6A84F]" />
                            <span>Guest Browse</span>
                          </button>
                          <button
                            type="button"
                            onClick={onOpenAiAssistant}
                            className="min-h-[42px] px-3 py-2 rounded-xl border border-[#D6A84F]/45 bg-[#16161A] hover:border-[#F3D999] text-xs font-semibold text-[#F3D999] flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <Bot className="w-3.5 h-3.5 text-[#D6A84F]" />
                            <span>AI Diagnosis</span>
                          </button>
                        </div>

                        <button
                          type="button"
                          disabled={authLoading}
                          onClick={() =>
                            onSignIn('customer', {
                              preferredRole: 'customer',
                              accountType,
                              phone: phoneInput.trim(),
                              organizationName: orgInput.trim(),
                            })
                          }
                          className="relative overflow-hidden w-full min-h-[42px] px-4 py-2 rounded-xl bg-gradient-to-r from-[#D6A84F] via-[#F3D999] to-[#D6A84F] text-[#08080A] text-sm font-bold flex items-center justify-center gap-2"
                        >
                          <Sparkles className="w-4 h-4 shrink-0" />
                          <span>{authLoading ? 'Opening...' : '1-Tap Google Express Sign In'}</span>
                        </button>
                      </motion.div>
                    ) : (
                      <>
                        {/* Account Type Selector: Customer / Technician / Organization */}
                        <div className="grid grid-cols-3 gap-1.5">
                          <button
                            type="button"
                            onClick={() => setAccountType('customer')}
                            className={`min-h-[34px] px-2 py-1 rounded-xl border text-[11px] font-semibold transition-all ${
                              accountType === 'customer'
                                ? 'bg-[#17171B] border-[#D6A84F] text-[#F3D999] shadow-sm shadow-[#D6A84F]/15'
                                : 'border-[#2E2A22] text-[#A89B84] hover:text-[#FFF8EA]'
                            }`}
                          >
                            Customer
                          </button>
                          <button
                            type="button"
                            onClick={() => setAccountType('technician')}
                            className={`min-h-[34px] px-2 py-1 rounded-xl border text-[11px] font-semibold transition-all flex items-center justify-center gap-1 ${
                              accountType === 'technician'
                                ? 'bg-[#17171B] border-[#D6A84F] text-[#F3D999] shadow-sm shadow-[#D6A84F]/15'
                                : 'border-[#2E2A22] text-[#A89B84] hover:text-[#FFF8EA]'
                            }`}
                          >
                            <Wrench className="w-3 h-3" />
                            <span>Technician</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setAccountType('organization')}
                            className={`min-h-[34px] px-2 py-1 rounded-xl border text-[11px] font-semibold transition-all flex items-center justify-center gap-1 ${
                              accountType === 'organization'
                                ? 'bg-[#17171B] border-[#D6A84F] text-[#F3D999] shadow-sm shadow-[#D6A84F]/15'
                                : 'border-[#2E2A22] text-[#A89B84] hover:text-[#FFF8EA]'
                            }`}
                          >
                            <Building2 className="w-3 h-3" />
                            <span>Organization</span>
                          </button>
                        </div>

                        {/* Phone + Optional Organization Input */}
                        <div className={accountType === 'organization' ? 'grid grid-cols-2 gap-1.5' : ''}>
                          {accountType === 'organization' ? (
                            <input
                              type="text"
                              maxLength={80}
                              value={orgInput}
                              onChange={(e) => setOrgInput(e.target.value)}
                              placeholder="Organization name"
                              aria-label="Organization name"
                              className="w-full min-h-[36px] px-2.5 py-1 rounded-xl border border-[#3B3324] bg-[#16161A] text-xs text-[#FFF8EA] placeholder:text-[#8E816B] focus:outline-none focus:border-[#D6A84F]"
                            />
                          ) : null}
                          <div className="relative flex items-center">
                            <Phone className="w-3.5 h-3.5 text-[#D6A84F] absolute left-2.5 pointer-events-none" />
                            <input
                              type="tel"
                              maxLength={30}
                              value={phoneInput}
                              onChange={(e) => setPhoneInput(e.target.value)}
                              placeholder={`Phone (${region.dialCode})`}
                              aria-label="Phone number"
                              className="w-full min-h-[36px] pl-8 pr-2.5 py-1 rounded-xl border border-[#3B3324] bg-[#16161A] text-xs tabular-nums text-[#FFF8EA] placeholder:text-[#8E816B] focus:outline-none focus:border-[#D6A84F]"
                            />
                          </div>
                        </div>

                        {/* Primary Gold Luxury CTA with Sheen Sweep */}
                        <motion.button
                          type="button"
                          whileTap={{ scale: 0.98 }}
                          disabled={authLoading}
                          onClick={() =>
                            onSignIn(selectedRole, {
                              preferredRole: selectedRole,
                              accountType,
                              phone: phoneInput.trim(),
                              organizationName: orgInput.trim(),
                            })
                          }
                          className="relative overflow-hidden w-full min-h-[42px] px-4 py-2 rounded-xl bg-gradient-to-r from-[#C8963E] via-[#F3D999] to-[#D6A84F] text-[#08080A] text-sm font-bold hover:brightness-105 disabled:opacity-60 transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#D6A84F]/20"
                        >
                          <span
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-white/35 blur-sm animate-gold-sheen"
                          />
                          {authMode === 'login' ? (
                            <LogIn className="w-4 h-4 shrink-0 relative z-10" />
                          ) : (
                            <UserPlus className="w-4 h-4 shrink-0 relative z-10" />
                          )}
                          <span className="relative z-10">
                            {authLoading
                              ? 'Connecting...'
                              : authMode === 'login'
                                ? `Log In as ${accountType === 'organization' ? 'Organization' : selectedRole === 'technician' ? 'Technician' : 'Customer'}`
                                : `Create ${accountType === 'organization' ? 'Organization' : selectedRole === 'technician' ? 'Pro' : 'Customer'} Account`}
                          </span>
                        </motion.button>
                      </>
                    )}

                    {/* Secondary Footer Actions */}
                    <div className="flex items-center justify-between gap-2 pt-0.5 text-xs">
                      <button
                        type="button"
                        onClick={onOpenAiAssistant}
                        className="min-h-[34px] px-2 py-1 rounded-lg font-semibold text-[#F3D999] hover:underline flex items-center gap-1"
                      >
                        <Bot className="w-3.5 h-3.5 text-[#D6A84F]" />
                        <span>AI Assistant</span>
                      </button>
                      <button
                        type="button"
                        onClick={onOpenHelp}
                        className="min-h-[34px] px-2 py-1 rounded-lg font-medium text-[#CBBBA0] hover:text-[#F3D999] flex items-center gap-1"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>Trust &amp; Policies</span>
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};
