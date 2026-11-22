import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  User,
} from 'firebase/auth';
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  ArrowUpDown,
  Bell,
  Bot,
  CalendarCheck2,
  Compass,
  Globe,
  HelpCircle,
  Home,
  MessageSquare,
  MoreVertical,
  Plus,
  Settings,
  Shield,
  User as UserIcon,
  Wrench,
} from 'lucide-react';
import { AnimatePresence, motion, MotionConfig } from 'motion/react';
import { AmbientBackground } from './components/AmbientBackground';
import { LetterSweepBrand } from './components/AnimatedTypography';
import { AppBookingsScreen } from './components/AppBookingsScreen';
import { AppExploreScreen } from './components/AppExploreScreen';
import { AppHomeScreen } from './components/AppHomeScreen';
import { AppMessagesScreen } from './components/AppMessagesScreen';
import {
  AppAuthScreen,
  AppProfileScreen,
  AppSettingsScreen,
} from './components/AppProfileSettingsScreens';
import {
  AppServiceDetailScreen,
  ServiceDetailTarget,
} from './components/AppServiceDetailScreen';
import { TechnicianDashboardScreen } from './components/TechnicianDashboardScreen';
import { BrandLogoMark, StartupLogoSplash } from './components/BrandLogo';
import {
  LiveNotificationBanner,
  NotificationCenterDrawer,
} from './components/NotificationCenter';
import { PageTransitionLoader } from './components/PageTransitionLoader';
import { AiRepairBotDrawer, HelpCenterModal } from './components/AssistantHelpWidgets';
import { AuthGateModal } from './components/AuthGateModal';
import { DigitalInvoiceModal } from './components/DigitalInvoiceModal';
import { IntroLaunchScreen } from './components/IntroLaunchScreen';
import { JobDetailSheet } from './components/JobDetailSheet';
import { OfflineIndicator } from './components/PWAInstallButton';
import { RegionLanguageModal } from './components/RegionLanguageModal';
import { ReportComplaintModal } from './components/ReportComplaintModal';
import { RequestRepairSheet } from './components/RequestRepairSheet';
import { TechnicianSetupSheet } from './components/TechnicianSetupSheet';
import {
  ADMIN_EMAIL,
  CATEGORY_EXAMPLE_IMAGES,
  CATEGORY_MAP,
  CATEGORY_OPTIONS,
  CATEGORY_SHORT_MAP,
  formatTimestamp,
  getRegionShowcase,
  getTimestampMillis,
  PAYMENT_METHOD_MAP,
  SAMPLE_OPEN_JOBS,
  SAMPLE_REVIEWS,
  SAMPLE_TECHNICIANS,
  STATUS_LABELS,
  URGENCY_LABELS,
} from './constants';
import firebaseConfig from '../firebase-applet-config.json';
import { auth, googleProvider, testConnection } from './firebase';
import {
  convertUsdToRegionAmount,
  CountryRegion,
  detectInitialRegion,
  formatMoney,
  getRegionByCode,
} from './i18n/regions';
import {
  detectInitialLanguage,
  getLanguageOption,
  translate,
} from './i18n/translations';
import {
  acceptRepairJob,
  adminUpdateReportStatus,
  adminUpdateTechnicianVerification,
  advanceRepairJobStatus,
  approveJobQuote,
  cancelRepairJob,
  createNotification,
  createRepairJobWithContact,
  fetchMyTechnicianProfile,
  fetchUserPrivateContact,
  fetchUserProfile,
  markAllNotificationsRead,
  markNotificationRead,
  rejectRepairJob,
  reopenRejectedJob,
  settleJobPayment,
  submitJobReview,
  submitReportComplaint,
  subscribeAllJobsAdmin,
  subscribeAllLoginRecordsAdmin,
  subscribeAllReportsAdmin,
  subscribeAllTechniciansAdmin,
  subscribeAllUsersAdmin,
  subscribeCustomerJobs,
  subscribeOpenJobs,
  subscribePublicTechnicians,
  subscribeReviews,
  subscribeTechnicianJobs,
  subscribeUserNotifications,
  toggleTechnicianDuty,
  upsertLoginRecord,
  upsertTechnicianProfile,
  upsertUserPrivateContact,
  upsertUserProfile,
} from './services/firestoreService';
import {
  ActiveRoleView,
  AiBookingDraft,
  ApplianceCategory,
  AppNotification,
  AppScreen,
  JobStatus,
  JobUrgency,
  LoginIntentMeta,
  LoginRecord,
  MarketplaceRole,
  MobileTab,
  PaymentMethod,
  PaymentStatus,
  RepairJob,
  ReportComplaint,
  ReportReason,
  ReportStatus,
  Review,
  TechnicianProfile,
  UserPrivateContact,
  UserProfile,
  VerificationStatus,
} from './types';

function detectAdminPortalRequest(): boolean {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  const viewParam = params.get('view');
  const hash = window.location.hash;
  return (
    viewParam === 'admin-records' ||
    viewParam === 'admin' ||
    hash === '#admin-records' ||
    hash === '#admin-dashboard'
  );
}

const STORAGE_REGION_KEY = 'yourneed_country';
const STORAGE_CURRENCY_KEY = 'yourneed_currency';
const STORAGE_LANG_KEY = 'yourneed_lang';
const STORAGE_THEME_KEY = 'yourneed_theme';
const STORAGE_SCROLLBAR_KEY = 'yourneed_scrollbars';
const STORAGE_PUSH_NOTIFS_KEY = 'yourneed_push_notifs';

export default function App() {
  // Region, Currency & Language State
  const [region, setRegion] = useState<CountryRegion>(() => {
    const saved = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_REGION_KEY) : null;
    return saved ? getRegionByCode(saved) : detectInitialRegion();
  });
  const [currencyCode, setCurrencyCode] = useState<string>(() => {
    const saved = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_CURRENCY_KEY) : null;
    return saved || detectInitialRegion().currency;
  });
  const [language, setLanguage] = useState<string>(() => {
    const saved = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_LANG_KEY) : null;
    return saved || detectInitialLanguage();
  });
  const [regionModalOpen, setRegionModalOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_THEME_KEY);
      if (saved === 'dark' || saved === 'light') return saved;
    }
    return 'dark';
  });
  const [showScrollbars, setShowScrollbars] = useState<boolean>(() => {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_SCROLLBAR_KEY);
      if (saved === 'hidden') return false;
    }
    return true;
  });
  const [scrollState, setScrollState] = useState({
    scrollable: false,
    scrolledDown: false,
    nearBottom: false,
  });

  // Auth & User State
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userContact, setUserContact] = useState<UserPrivateContact | null>(null);
  const [myTechProfile, setMyTechProfile] = useState<TechnicianProfile | null>(null);

  const isAdmin = Boolean(
    authUser && authUser.email === ADMIN_EMAIL && authUser.emailVerified
  );

  // Live Collections
  const [liveTechnicians, setLiveTechnicians] = useState<TechnicianProfile[]>([]);
  const [liveOpenJobs, setLiveOpenJobs] = useState<RepairJob[]>([]);
  const [myCustomerJobs, setMyCustomerJobs] = useState<RepairJob[]>([]);
  const [myTechnicianJobs, setMyTechnicianJobs] = useState<RepairJob[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [localNotifications, setLocalNotifications] = useState<AppNotification[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [liveBannerNotif, setLiveBannerNotif] = useState<AppNotification | null>(null);
  const [messagesInitialTab, setMessagesInitialTab] = useState<'chats' | 'updates'>('chats');
  const [pushNotifsEnabled, setPushNotifsEnabled] = useState<boolean>(() => {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(STORAGE_PUSH_NOTIFS_KEY) !== 'disabled';
    }
    return true;
  });
  const [browserNotifPermission, setBrowserNotifPermission] = useState<
    NotificationPermission | 'unsupported'
  >(() =>
    typeof window !== 'undefined' && 'Notification' in window
      ? Notification.permission
      : 'unsupported'
  );
  const seenNotifIdsRef = useRef<Set<string>>(new Set());
  const notifHydratedRef = useRef<boolean>(false);
  const pushNotifsEnabledRef = useRef<boolean>(pushNotifsEnabled);
  useEffect(() => {
    pushNotifsEnabledRef.current = pushNotifsEnabled;
  }, [pushNotifsEnabled]);

  // Admin Collections
  const [adminUsers, setAdminUsers] = useState<UserProfile[]>([]);
  const [adminLoginRecords, setAdminLoginRecords] = useState<LoginRecord[]>([]);
  const [adminTechnicians, setAdminTechnicians] = useState<TechnicianProfile[]>([]);
  const [adminJobs, setAdminJobs] = useState<RepairJob[]>([]);
  const [adminReports, setAdminReports] = useState<ReportComplaint[]>([]);
  const [adminPortalRequested, setAdminPortalRequested] = useState<boolean>(() =>
    detectAdminPortalRequest()
  );

  // Navigation & Filters
  const [activeRoleView, setActiveRoleView] = useState<ActiveRoleView>(() =>
    detectAdminPortalRequest() ? 'admin' : 'customer'
  );
  const [mobileTab, setMobileTab] = useState<MobileTab>('discover');
  const [activeScreen, setActiveScreen] = useState<AppScreen>(() =>
    detectAdminPortalRequest() ? 'bookings' : 'home'
  );
  const [previousScreen, setPreviousScreen] = useState<AppScreen>('home');
  const [serviceDetailTarget, setServiceDetailTarget] =
    useState<ServiceDetailTarget | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'all' | ApplianceCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [urgencyFilter, setUrgencyFilter] = useState<'all' | JobUrgency>('all');
  const [dismissedOpenJobIds, setDismissedOpenJobIds] = useState<Record<string, boolean>>({});

  const navigateTo = (next: AppScreen) => {
    setActiveScreen((prev) => {
      if (
        prev !== next &&
        (prev === 'home' ||
          prev === 'technician_dashboard' ||
          prev === 'explore' ||
          prev === 'bookings' ||
          prev === 'messages' ||
          prev === 'profile')
      ) {
        setPreviousScreen(prev);
      }
      return next;
    });
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Modals & Sheets
  const [showStartupSplash, setShowStartupSplash] = useState<boolean>(
    () => !detectAdminPortalRequest()
  );
  const [splashMinDone, setSplashMinDone] = useState<boolean>(
    () => detectAdminPortalRequest()
  );
  const [showIntro, setShowIntro] = useState<boolean>(() => !detectAdminPortalRequest());
  const [pageTransitioning, setPageTransitioning] = useState(false);
  const [heroFlipped, setHeroFlipped] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authReason, setAuthReason] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const pendingLoginMetaRef = useRef<LoginIntentMeta | null>(null);
  const loginRecordedSessionRef = useRef<Set<string>>(new Set());

  const [requestSheetOpen, setRequestSheetOpen] = useState(false);
  const [targetTechnician, setTargetTechnician] = useState<TechnicianProfile | null>(null);
  const [aiBookingDraft, setAiBookingDraft] = useState<AiBookingDraft | null>(null);
  const [techSetupOpen, setTechSetupOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<RepairJob | null>(null);
  const [invoiceJob, setInvoiceJob] = useState<RepairJob | null>(null);
  const [reportTarget, setReportTarget] = useState<{
    targetType: 'technician' | 'job' | 'user';
    targetId: string;
    targetName: string;
  } | null>(null);
  const [aiBotOpen, setAiBotOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!moreMenuOpen) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setMoreMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMoreMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [moreMenuOpen]);

  // Account Settings Form State
  const [accountName, setAccountName] = useState('');
  const [accountNeighborhood, setAccountNeighborhood] = useState('');
  const [accountRole, setAccountRole] = useState<MarketplaceRole>('both');
  const [accountPhone, setAccountPhone] = useState('');
  const [accountAddress, setAccountAddress] = useState('');
  const [savingAccount, setSavingAccount] = useState(false);

  // Image error fallbacks
  const [brokenAvatars, setBrokenAvatars] = useState<Record<string, boolean>>({});
  const [brokenExampleImgs, setBrokenExampleImgs] = useState<Record<string, boolean>>({});

  const langOption = useMemo(() => getLanguageOption(language), [language]);
  const t = (key: string) => translate(language, key);

  const regionRef = useRef(region);
  const currencyRef = useRef(currencyCode);
  useEffect(() => {
    regionRef.current = region;
  }, [region]);
  useEffect(() => {
    currencyRef.current = currencyCode;
  }, [currencyCode]);

  const regionShowcase = useMemo(
    () => getRegionShowcase(region.code, region.name),
    [region.code, region.name]
  );

  useEffect(() => {
    setHeroFlipped(false);
  }, [region.code]);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = langOption.dir;
  }, [language, langOption.dir]);

  useEffect(() => {
    const isDark = theme === 'dark';
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem(STORAGE_THEME_KEY, theme);
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute('content', isDark ? '#07130F' : '#075E36');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  useEffect(() => {
    document.documentElement.classList.toggle('hide-scrollbars', !showScrollbars);
    try {
      localStorage.setItem(STORAGE_SCROLLBAR_KEY, showScrollbars ? 'visible' : 'hidden');
    } catch {
      // Ignore storage failures
    }
  }, [showScrollbars]);

  const toggleScrollbars = () => {
    setShowScrollbars((prev) => !prev);
  };

  useEffect(() => {
    const updateScrollState = () => {
      const doc = document.documentElement;
      const maxScroll = Math.max(0, doc.scrollHeight - window.innerHeight);
      const y = window.scrollY || window.pageYOffset || 0;
      setScrollState({
        scrollable: maxScroll > 80,
        scrolledDown: y > 180,
        nearBottom: maxScroll > 0 && y >= maxScroll - 120,
      });
    };

    updateScrollState();
    const rafId = window.requestAnimationFrame(updateScrollState);
    const resizeObserver =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => updateScrollState())
        : null;
    if (resizeObserver && document.body) {
      resizeObserver.observe(document.body);
    }
    window.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', updateScrollState, { passive: true });
    return () => {
      window.cancelAnimationFrame(rafId);
      resizeObserver?.disconnect();
      window.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [activeScreen, showIntro]);

  useEffect(() => {
    if (!showStartupSplash || splashMinDone) return;
    const timer = window.setTimeout(() => setSplashMinDone(true), 1650);
    return () => window.clearTimeout(timer);
  }, [showStartupSplash, splashMinDone]);

  useEffect(() => {
    if (showStartupSplash && splashMinDone && authReady) {
      setShowStartupSplash(false);
    }
  }, [showStartupSplash, splashMinDone, authReady]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    window.setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4000);
  };

  const triggerBrowserNotification = (notif: AppNotification) => {
    if (
      typeof window === 'undefined' ||
      !('Notification' in window) ||
      Notification.permission !== 'granted' ||
      !pushNotifsEnabledRef.current
    ) {
      return;
    }
    try {
      const nativeNotif = new Notification(notif.title, {
        body: notif.body,
        icon: '/pwa-192x192.png',
        tag: notif.id,
      });
      nativeNotif.onclick = () => {
        window.focus();
        nativeNotif.close();
      };
    } catch {
      // Ignore environments that block Notification constructor directly
    }
  };

  const showLiveAlert = (notif: AppNotification) => {
    setLiveBannerNotif(notif);
    triggerBrowserNotification(notif);
    window.setTimeout(() => {
      setLiveBannerNotif((prev) => (prev?.id === notif.id ? null : prev));
    }, 6000);
  };

  const pushLocalNotification = (params: {
    title: string;
    body: string;
    type?: AppNotification['type'];
    jobId?: string;
  }) => {
    const item: AppNotification = {
      id: `local_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      recipientId: authUser?.uid || 'guest',
      senderId: 'system',
      jobId: params.jobId || '',
      title: params.title,
      body: params.body,
      type: params.type || 'system',
      read: false,
      createdAt: new Date(),
    };
    setLocalNotifications((prev) => [item, ...prev].slice(0, 20));
    showLiveAlert(item);
  };

  // Startup connection check & public listeners
  useEffect(() => {
    testConnection();

    const unsubTechs = subscribePublicTechnicians((techs) => {
      setLiveTechnicians(techs);
    });
    const unsubOpen = subscribeOpenJobs((jobs) => {
      setLiveOpenJobs(jobs);
    });
    const unsubReviews = subscribeReviews((revs) => {
      setReviews(revs);
    });

    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      setAuthUser(user);
      setAuthReady(true);

      if (!user) {
        setUserProfile(null);
        setUserContact(null);
        setMyTechProfile(null);
        setMyCustomerJobs([]);
        setMyTechnicianJobs([]);
        setNotifications([]);
        return;
      }

      try {
        const pendingMeta = pendingLoginMetaRef.current;
        const [profileResult, contactResult, techProf] = await Promise.all([
          fetchUserProfile(user.uid),
          fetchUserPrivateContact(user.uid),
          fetchMyTechnicianProfile(user.uid),
        ]);

        let resolvedProfile = profileResult;
        let resolvedContact = contactResult;

        if (!resolvedProfile) {
          const initialName = user.displayName?.trim() || user.email?.split('@')[0] || 'Member';
          const initialRole: MarketplaceRole =
            pendingMeta?.preferredRole === 'technician' ||
            pendingMeta?.accountType === 'technician'
              ? 'technician'
              : 'both';
          await upsertUserProfile({
            uid: user.uid,
            displayName: initialName,
            role: initialRole,
            neighborhood: 'Central District',
            countryCode: regionRef.current.code,
            currencyCode: currencyRef.current,
            avatarUrl: user.photoURL || undefined,
            exists: false,
          });
          resolvedProfile = await fetchUserProfile(user.uid);
          setUserProfile(resolvedProfile);
          try {
            await createNotification({
              recipientId: user.uid,
              senderId: user.uid,
              jobId: '',
              title: 'Welcome to Your Need Notifications',
              body: 'Live repair booking updates, technician ETAs, quote approvals, and chat alerts will appear here.',
              type: 'system',
            });
          } catch {
            // Non-fatal welcome notification
          }
          if (initialRole === 'technician' && !detectAdminPortalRequest()) {
            setActiveRoleView('technician');
          }
        } else {
          setUserProfile(resolvedProfile);
          if (resolvedProfile.role === 'technician' && !detectAdminPortalRequest()) {
            setActiveRoleView('technician');
          }
          if (resolvedProfile.countryCode) {
            setRegion(getRegionByCode(resolvedProfile.countryCode));
          }
          if (resolvedProfile.currencyCode) {
            setCurrencyCode(resolvedProfile.currencyCode);
          }
        }

        const pendingPhone = pendingMeta?.phone?.trim() || '';
        if (pendingPhone && pendingPhone !== (resolvedContact?.phone || '')) {
          await upsertUserPrivateContact({
            uid: user.uid,
            phone: pendingPhone,
            streetAddress: resolvedContact?.streetAddress || 'Not provided yet',
            exists: Boolean(resolvedContact),
          });
          resolvedContact = await fetchUserPrivateContact(user.uid);
        }

        setUserContact(resolvedContact);
        setMyTechProfile(techProf);

        // Save verified email, phone number, customer/technician/organization & login count in Firestore
        const isNewSessionLogin =
          Boolean(pendingMeta) || !loginRecordedSessionRef.current.has(user.uid);
        await upsertLoginRecord({
          uid: user.uid,
          displayName:
            resolvedProfile?.displayName ||
            user.displayName?.trim() ||
            user.email?.split('@')[0] ||
            'Member',
          email: user.email || '',
          emailVerified: Boolean(user.emailVerified),
          phone: pendingPhone || resolvedContact?.phone || '',
          accountType: pendingMeta?.accountType,
          organizationName: pendingMeta?.organizationName?.trim() || '',
          role: resolvedProfile?.role || 'both',
          neighborhood: resolvedProfile?.neighborhood || 'Central District',
          countryCode: resolvedProfile?.countryCode || regionRef.current.code,
          isNewLogin: isNewSessionLogin,
        });
        loginRecordedSessionRef.current.add(user.uid);
        pendingLoginMetaRef.current = null;
      } catch (err) {
        console.error('Error hydrating profile:', err);
      }
    });

    return () => {
      unsubTechs();
      unsubOpen();
      unsubReviews();
      unsubAuth();
    };
  }, []);

  // User-specific Firestore subscriptions
  useEffect(() => {
    if (!authUser) {
      seenNotifIdsRef.current = new Set();
      notifHydratedRef.current = false;
      return;
    }
    const unsubCust = subscribeCustomerJobs(authUser.uid, (jobs) => {
      setMyCustomerJobs(jobs);
    });
    const unsubTech = subscribeTechnicianJobs(authUser.uid, (jobs) => {
      setMyTechnicianJobs(jobs);
    });
    const unsubNotifs = subscribeUserNotifications(authUser.uid, (items) => {
      if (!notifHydratedRef.current) {
        items.forEach((n) => seenNotifIdsRef.current.add(n.id));
        notifHydratedRef.current = true;
      } else {
        const incomingNew = items.find(
          (n) => !n.read && !seenNotifIdsRef.current.has(n.id)
        );
        items.forEach((n) => seenNotifIdsRef.current.add(n.id));
        if (incomingNew) {
          showLiveAlert(incomingNew);
        }
      }
      setNotifications(items);
    });
    return () => {
      unsubCust();
      unsubTech();
      unsubNotifs();
    };
  }, [authUser]);

  // Admin subscriptions (strictly gated)
  useEffect(() => {
    if (!isAdmin) {
      setAdminUsers([]);
      setAdminLoginRecords([]);
      setAdminTechnicians([]);
      setAdminJobs([]);
      setAdminReports([]);
      return;
    }
    const unsubUsers = subscribeAllUsersAdmin(setAdminUsers);
    const unsubLoginRecords = subscribeAllLoginRecordsAdmin(setAdminLoginRecords);
    const unsubTechs = subscribeAllTechniciansAdmin(setAdminTechnicians);
    const unsubJobs = subscribeAllJobsAdmin(setAdminJobs);
    const unsubReports = subscribeAllReportsAdmin(setAdminReports);
    return () => {
      unsubUsers();
      unsubLoginRecords();
      unsubTechs();
      unsubJobs();
      unsubReports();
    };
  }, [isAdmin]);

  // Sync Account form values when profile loads
  useEffect(() => {
    if (userProfile) {
      setAccountName(userProfile.displayName);
      setAccountNeighborhood(userProfile.neighborhood);
      setAccountRole(userProfile.role);
    }
    if (userContact) {
      setAccountPhone(userContact.phone);
      setAccountAddress(userContact.streetAddress);
    }
  }, [userProfile, userContact]);

  // Keep selectedJob synced with real-time updates
  useEffect(() => {
    if (!selectedJob) return;
    const allLive = [...liveOpenJobs, ...myCustomerJobs, ...myTechnicianJobs];
    const updated = allLive.find((j) => j.id === selectedJob.id);
    if (updated) {
      setSelectedJob(updated);
    }
  }, [liveOpenJobs, myCustomerJobs, myTechnicianJobs, selectedJob]);

  // Derived data & Analytics
  const usingSampleDirectory = liveTechnicians.length === 0;
  const technicians = useMemo(() => {
    const base = liveTechnicians.length > 0 ? liveTechnicians : SAMPLE_TECHNICIANS;
    return base.map((tech, idx) => {
      const convertedTech = tech.isSample
        ? {
            ...tech,
            neighborhood: regionShowcase.neighborhoods[idx % regionShowcase.neighborhoods.length],
            visitFee: convertUsdToRegionAmount(tech.visitFee, region),
            currencyCode,
            countryCode: region.code,
          }
        : tech;
      const techReviews = reviews.filter((r) => r.technicianId === tech.uid);
      if (techReviews.length === 0) return convertedTech;
      const avg =
        techReviews.reduce((sum, r) => sum + r.rating, 0) / techReviews.length;
      return {
        ...convertedTech,
        ratingAvg: Math.round(avg * 10) / 10,
        completedJobsCount: Math.max(convertedTech.completedJobsCount, techReviews.length),
      };
    });
  }, [liveTechnicians, reviews, region, currencyCode, regionShowcase]);

  const topFiveStarReviewByTechId = useMemo(() => {
    const map = new Map<string, Review>();
    const sourceReviews = usingSampleDirectory ? [...reviews, ...SAMPLE_REVIEWS] : reviews;

    const fiveStarSorted = sourceReviews
      .filter((r) => Number(r.rating) >= 5 && Boolean(r.comment && r.comment.trim()))
      .sort((a, b) => {
        const bMs = b.createdAt ? getTimestampMillis(b.createdAt) : Date.now();
        const aMs = a.createdAt ? getTimestampMillis(a.createdAt) : Date.now();
        return bMs - aMs;
      });

    for (const review of fiveStarSorted) {
      if (!map.has(review.technicianId)) {
        map.set(review.technicianId, review);
      }
    }
    return map;
  }, [reviews, usingSampleDirectory]);

  const openJobs = useMemo(() => {
    const base =
      liveOpenJobs.length > 0
        ? liveOpenJobs
        : SAMPLE_OPEN_JOBS.map((j, idx) => ({
            ...j,
            neighborhood: regionShowcase.neighborhoods[idx % regionShowcase.neighborhoods.length],
            estimatedBudget: convertUsdToRegionAmount(j.estimatedBudget, region),
            inspectionFee: convertUsdToRegionAmount(j.inspectionFee || 12, region),
            currencyCode,
            countryCode: region.code,
          }));
    return [...base].sort((a, b) => {
      const urgencyScore = { urgent_today: 0, within_24h: 1, flexible: 2 };
      return urgencyScore[a.urgency] - urgencyScore[b.urgency];
    });
  }, [liveOpenJobs, region, currencyCode, regionShowcase]);

  const filteredTechnicians = useMemo(() => {
    return technicians.filter((tech) => {
      if (availableOnly && !tech.isAvailable) return false;
      if (selectedCategory !== 'all') {
        const catLabel = CATEGORY_MAP[selectedCategory];
        const catShort = CATEGORY_SHORT_MAP[selectedCategory];
        const matchesCat = tech.specialties.some(
          (s) =>
            s.toLowerCase().includes(catShort.toLowerCase()) ||
            s.toLowerCase().includes(catLabel.toLowerCase())
        );
        if (!matchesCat) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const hay = `${tech.displayName} ${tech.neighborhood} ${tech.specialties.join(' ')} ${tech.bio}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [technicians, availableOnly, selectedCategory, searchQuery]);

  const filteredOpenJobs = useMemo(() => {
    return openJobs.filter((job) => {
      if (dismissedOpenJobIds[job.id]) return false;
      if (selectedCategory !== 'all' && job.applianceCategory !== selectedCategory) {
        return false;
      }
      if (urgencyFilter !== 'all' && job.urgency !== urgencyFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const hay = `${job.issueTitle} ${job.issueDescription} ${job.neighborhood} ${CATEGORY_MAP[job.applianceCategory]}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [openJobs, dismissedOpenJobIds, selectedCategory, urgencyFilter, searchQuery]);

  // Technician Business & Earnings Analytics
  const pendingRequestsForTech = useMemo(() => {
    if (!authUser) return [];
    return liveOpenJobs.filter(
      (j) =>
        j.customerId !== authUser.uid &&
        !dismissedOpenJobIds[j.id] &&
        (j.targetTechnicianId === '' || j.targetTechnicianId === authUser.uid)
    );
  }, [liveOpenJobs, authUser, dismissedOpenJobIds]);

  const activeTechJobs = useMemo(
    () =>
      myTechnicianJobs.filter(
        (j) =>
          j.status === 'accepted' ||
          j.status === 'en_route' ||
          j.status === 'arrived' ||
          j.status === 'in_progress'
      ),
    [myTechnicianJobs]
  );

  const completedTechJobs = useMemo(
    () => myTechnicianJobs.filter((j) => j.status === 'completed'),
    [myTechnicianJobs]
  );

  const todayCompletedCount = useMemo(() => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    return completedTechJobs.filter((j) => getTimestampMillis(j.updatedAt || j.createdAt) >= startOfDay).length;
  }, [completedTechJobs]);

  const monthlyEarnings = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    return completedTechJobs
      .filter((j) => getTimestampMillis(j.updatedAt || j.createdAt) >= startOfMonth)
      .reduce((sum, j) => sum + (j.quotedFee || j.estimatedBudget || 0), 0);
  }, [completedTechJobs]);

  const myTechFeedback = useMemo(() => {
    if (!authUser) return [];
    return reviews.filter((r) => r.technicianId === authUser.uid);
  }, [reviews, authUser]);

  const mergedNotifications = useMemo(
    () => [...notifications, ...localNotifications],
    [notifications, localNotifications]
  );

  const unreadNotifCount = useMemo(
    () => mergedNotifications.filter((n) => !n.read).length,
    [mergedNotifications]
  );

  const handleRequestPushPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setBrowserNotifPermission('unsupported');
      showToast('In-app live notifications are active.');
      return;
    }
    if (Notification.permission === 'granted') {
      const next = !pushNotifsEnabled;
      setPushNotifsEnabled(next);
      try {
        localStorage.setItem(STORAGE_PUSH_NOTIFS_KEY, next ? 'enabled' : 'disabled');
      } catch {
        // Ignore storage error
      }
      showToast(next ? 'Desktop & mobile push alerts enabled.' : 'Desktop push alerts paused (in-app alerts remain active).');
      return;
    }
    if (Notification.permission === 'denied') {
      setBrowserNotifPermission('denied');
      showToast('Notifications are blocked in your browser site settings.');
      return;
    }
    try {
      const permission = await Notification.requestPermission();
      setBrowserNotifPermission(permission);
      if (permission === 'granted') {
        setPushNotifsEnabled(true);
        try {
          localStorage.setItem(STORAGE_PUSH_NOTIFS_KEY, 'enabled');
        } catch {
          // Ignore storage error
        }
        pushLocalNotification({
          title: 'Notifications Enabled',
          body: 'You will now receive instant alerts for technician ETAs, quotes, and messages.',
          type: 'system',
        });
      } else {
        showToast('Browser permission declined. In-app alerts remain active.');
      }
    } catch {
      showToast('Unable to request browser notification permission.');
    }
  };

  const handleSendTestNotification = async () => {
    if (authUser && authUser.emailVerified) {
      try {
        await createNotification({
          recipientId: authUser.uid,
          senderId: authUser.uid,
          jobId: '',
          title: 'Live Alert Check',
          body: 'Your Need notifications are active and synced in real time.',
          type: 'system',
        });
        return;
      } catch {
        // Fall through to local preview notification
      }
    }
    pushLocalNotification({
      title: 'Live Alert Preview',
      body: 'Booking updates, technician arrival ETAs, and chat alerts will pop up just like this.',
      type: 'booking',
    });
  };

  const handleMarkAllNotificationsRead = async () => {
    setLocalNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    const unreadRemoteIds = notifications.filter((n) => !n.read).map((n) => n.id);
    if (unreadRemoteIds.length > 0) {
      await markAllNotificationsRead(unreadRemoteIds);
    }
    showToast('All notifications marked as read.');
  };

  const handleNotificationClick = async (notif: AppNotification) => {
    setNotifOpen(false);
    setLiveBannerNotif(null);
    if (notif.id.startsWith('local_')) {
      setLocalNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
      );
    } else if (!notif.read) {
      await markNotificationRead(notif.id);
    }
    if (notif.jobId) {
      const found = [...myCustomerJobs, ...myTechnicianJobs, ...liveOpenJobs].find(
        (j) => j.id === notif.jobId
      );
      if (found) {
        setSelectedJob(found);
        return;
      }
    }
    setMessagesInitialTab('updates');
    navigateTo('messages');
  };

  // Handlers
  const handleApplyRegionLanguage = async (
    nextCountry: CountryRegion,
    nextCurrency: string,
    nextLang: string
  ) => {
    setRegion(nextCountry);
    setCurrencyCode(nextCurrency);
    setLanguage(nextLang);
    localStorage.setItem(STORAGE_REGION_KEY, nextCountry.code);
    localStorage.setItem(STORAGE_CURRENCY_KEY, nextCurrency);
    localStorage.setItem(STORAGE_LANG_KEY, nextLang);

    if (authUser && userProfile) {
      await upsertUserProfile({
        uid: authUser.uid,
        displayName: userProfile.displayName,
        role: userProfile.role,
        neighborhood: userProfile.neighborhood,
        countryCode: nextCountry.code,
        currencyCode: nextCurrency,
        avatarUrl: userProfile.avatarUrl,
        exists: true,
      });
    }
    showToast(`${nextCountry.name} · ${nextCurrency} · ${getLanguageOption(nextLang).nativeName}`);
  };

  const openAuthGate = (reason: string) => {
    setAuthReason(reason);
    setAuthError('');
    setAuthModalOpen(true);
  };

  const handleGoogleSignIn = async (
    preferredRole?: 'customer' | 'technician',
    meta?: LoginIntentMeta
  ) => {
    setAuthLoading(true);
    setAuthError('');
    pendingLoginMetaRef.current = meta
      ? { ...meta, preferredRole: preferredRole || meta.preferredRole }
      : preferredRole
        ? {
            accountType: preferredRole === 'technician' ? 'technician' : 'customer',
            preferredRole,
          }
        : { accountType: 'customer', preferredRole: 'customer' };
    try {
      await signInWithPopup(auth, googleProvider);
      setAuthModalOpen(false);
      setShowIntro(false);
      if (adminPortalRequested) {
        setActiveRoleView('admin');
        navigateTo('bookings');
      } else if (preferredRole === 'technician') {
        setActiveRoleView('technician');
        setMobileTab('workbench');
        navigateTo('technician_dashboard');
      } else {
        setActiveRoleView('customer');
        if (activeScreen === 'auth' || activeScreen === 'technician_dashboard') {
          navigateTo('home');
        }
      }
      showToast('Signed in and login record saved.');
    } catch (err) {
      pendingLoginMetaRef.current = null;
      const message =
        err instanceof Error ? err.message : 'Unable to complete Google sign-in.';
      setAuthError(message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    if (authUser) {
      loginRecordedSessionRef.current.delete(authUser.uid);
    }
    await signOut(auth);
    setActiveRoleView(adminPortalRequested ? 'admin' : 'customer');
    showToast('Signed out.');
  };

  const handleStartRequest = (
    tech: TechnicianProfile | null = null,
    draft: AiBookingDraft | null = null
  ) => {
    setTargetTechnician(tech);
    setAiBookingDraft(draft);
    setRequestSheetOpen(false);
    navigateTo('booking');
  };

  const handleCreateRepairJob = async (payload: {
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
  }) => {
    if (!authUser) {
      openAuthGate('Sign in with Google to submit your repair request.');
      return;
    }
    setSubmitting(true);
    try {
      await createRepairJobWithContact({
        customerId: authUser.uid,
        ...payload,
      });
      await upsertLoginRecord({
        uid: authUser.uid,
        displayName: payload.customerName || userProfile?.displayName || authUser.displayName || 'Member',
        email: authUser.email || '',
        emailVerified: Boolean(authUser.emailVerified),
        phone: payload.phone,
        role: userProfile?.role || 'both',
        neighborhood: payload.neighborhood || userProfile?.neighborhood || 'Central District',
        countryCode: payload.countryCode || region.code,
        isNewLogin: false,
      });
      setRequestSheetOpen(false);
      setTargetTechnician(null);
      setAiBookingDraft(null);
      setActiveRoleView('customer');
      setMobileTab('requests');
      navigateTo('bookings');
      showToast('Repair request posted! Local technicians have been notified.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveTechnicianProfile = async (payload: {
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
  }) => {
    if (!authUser) {
      openAuthGate('Sign in with Google to publish your technician profile.');
      return;
    }
    setSubmitting(true);
    try {
      await Promise.all([
        upsertTechnicianProfile({
          uid: authUser.uid,
          displayName: payload.displayName,
          neighborhood: payload.neighborhood,
          countryCode: payload.countryCode,
          currencyCode: payload.currencyCode,
          specialties: payload.specialties,
          acceptedPayments: payload.acceptedPayments,
          spokenLanguages: payload.spokenLanguages,
          bio: payload.bio,
          visitFee: payload.visitFee,
          responseTimeMins: payload.responseTimeMins,
          isAvailable: payload.isAvailable,
          isPublic: true,
          avatarUrl: authUser.photoURL || undefined,
          phoneVerified: payload.phoneVerified,
          verificationStatus: payload.verificationStatus,
          idType: payload.idType,
          idLast4: payload.idLast4,
          yearsExperience: payload.yearsExperience,
          serviceRadiusKm: payload.serviceRadiusKm,
          exists: Boolean(myTechProfile),
        }),
        upsertUserPrivateContact({
          uid: authUser.uid,
          phone: payload.phone,
          streetAddress: userContact?.streetAddress || payload.neighborhood,
          exists: Boolean(userContact),
        }),
        upsertLoginRecord({
          uid: authUser.uid,
          displayName: payload.displayName,
          email: authUser.email || '',
          emailVerified: Boolean(authUser.emailVerified),
          phone: payload.phone,
          accountType: 'technician',
          role: userProfile?.role || 'both',
          neighborhood: payload.neighborhood,
          countryCode: payload.countryCode,
          isNewLogin: false,
        }),
      ]);
      const [updatedTech, updatedContact] = await Promise.all([
        fetchMyTechnicianProfile(authUser.uid),
        fetchUserPrivateContact(authUser.uid),
      ]);
      setMyTechProfile(updatedTech);
      setUserContact(updatedContact);
      setTechSetupOpen(false);
      setActiveRoleView('technician');
      setMobileTab('workbench');
      navigateTo('technician_dashboard');
      showToast('Technician profile & verification details saved.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleDuty = async () => {
    if (!authUser || !myTechProfile) return;
    const nextState = !myTechProfile.isAvailable;
    setMyTechProfile({ ...myTechProfile, isAvailable: nextState });
    await toggleTechnicianDuty(authUser.uid, nextState);
    showToast(nextState ? 'You are now Available for new jobs.' : 'Marked as Off Duty.');
  };

  const handleAcceptJob = async (
    job: RepairJob,
    eta: string,
    quotedFee: number,
    inspectionFee: number,
    techPhone: string
  ) => {
    if (!authUser || !myTechProfile) return;
    setSubmitting(true);
    try {
      await acceptRepairJob({
        jobId: job.id,
        customerId: job.customerId,
        issueTitle: job.issueTitle,
        technicianId: authUser.uid,
        technicianName: myTechProfile.displayName,
        technicianEta: eta,
        quotedFee,
        inspectionFee,
        technicianPhone: techPhone || userContact?.phone || '',
      });
      showToast('Job accepted! Customer notified and visit details unlocked.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRejectJob = async (job: RepairJob, reason: string) => {
    if (!authUser) return;
    setSubmitting(true);
    try {
      await rejectRepairJob({
        job,
        technicianId: authUser.uid,
        reason,
      });
      setSelectedJob(null);
      showToast('Direct request declined. Customer notified.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReopenJob = async (job: RepairJob) => {
    setSubmitting(true);
    try {
      await reopenRejectedJob(job.id);
      showToast('Request re-opened to all nearby technicians.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApproveQuote = async (job: RepairJob) => {
    if (!authUser) return;
    setSubmitting(true);
    try {
      await approveJobQuote({
        jobId: job.id,
        customerId: authUser.uid,
        technicianId: job.technicianId,
        issueTitle: job.issueTitle,
      });
      showToast('Final price approved! Technician can proceed with repair.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdvanceStatus = async (
    job: RepairJob,
    nextStatus: Extract<JobStatus, 'accepted' | 'en_route' | 'arrived' | 'in_progress' | 'completed'>,
    eta: string,
    quotedFee: number,
    inspectionFee: number,
    paymentStatus: PaymentStatus,
    workSummary?: string,
    partsReplaced?: string,
    warrantyDays?: number
  ) => {
    setSubmitting(true);
    try {
      await advanceRepairJobStatus({
        job,
        nextStatus,
        technicianEta: eta,
        quotedFee,
        inspectionFee,
        priceApproved: Boolean(job.priceApproved),
        paymentStatus,
        workSummary,
        partsReplaced,
        warrantyDays,
      });
      showToast(`Live tracking updated: ${STATUS_LABELS[nextStatus]}.`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSettlePayment = async (job: RepairJob, paymentMethod: PaymentMethod) => {
    setSubmitting(true);
    try {
      await settleJobPayment({ job, paymentMethod });
      showToast(`Payment confirmed via ${PAYMENT_METHOD_MAP[paymentMethod]}.`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelJob = async (job: RepairJob, reason: string) => {
    setSubmitting(true);
    try {
      await cancelRepairJob(job.id, reason, {
        customerId: job.customerId,
        technicianId: job.technicianId,
        issueTitle: job.issueTitle,
      });
      setSelectedJob(null);
      showToast('Repair request cancelled.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReview = async (job: RepairJob, rating: number, comment: string) => {
    if (!authUser) return;
    setSubmitting(true);
    try {
      await submitJobReview({
        jobId: job.id,
        customerId: authUser.uid,
        customerName: userProfile?.displayName || authUser.displayName || 'Homeowner',
        technicianId: job.technicianId,
        applianceCategory: job.applianceCategory,
        rating,
        comment,
      });
      showToast('Thank you! Your verified review has been saved.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReport = async (payload: {
    targetType: 'technician' | 'job' | 'user';
    targetId: string;
    targetName: string;
    reason: ReportReason;
    details: string;
  }) => {
    if (!authUser) {
      openAuthGate('Sign in with Google to submit a safety or dispute report.');
      return;
    }
    setSubmitting(true);
    try {
      await submitReportComplaint({
        reporterId: authUser.uid,
        reporterName: userProfile?.displayName || authUser.displayName || 'Member',
        ...payload,
      });
      setReportTarget(null);
      showToast('Report submitted. Our trust & safety admin team will review it.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdminVerifyTechnician = async (
    techId: string,
    verificationStatus: VerificationStatus,
    isPublic: boolean
  ) => {
    await adminUpdateTechnicianVerification({ techId, verificationStatus, isPublic });
    showToast(`Technician status updated (${verificationStatus}).`);
  };

  const handleAdminUpdateReport = async (
    reportId: string,
    status: ReportStatus,
    adminNote: string
  ) => {
    await adminUpdateReportStatus({ reportId, status, adminNote });
    showToast(`Report marked as ${status}.`);
  };

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authUser) return;
    setSavingAccount(true);
    try {
      await Promise.all([
        upsertUserProfile({
          uid: authUser.uid,
          displayName: accountName,
          role: accountRole,
          neighborhood: accountNeighborhood,
          countryCode: region.code,
          currencyCode,
          avatarUrl: authUser.photoURL || undefined,
          exists: Boolean(userProfile),
        }),
        upsertUserPrivateContact({
          uid: authUser.uid,
          phone: accountPhone,
          streetAddress: accountAddress,
          exists: Boolean(userContact),
        }),
        upsertLoginRecord({
          uid: authUser.uid,
          displayName: accountName,
          email: authUser.email || '',
          emailVerified: Boolean(authUser.emailVerified),
          phone: accountPhone,
          accountType: accountRole === 'technician' ? 'technician' : undefined,
          role: accountRole,
          neighborhood: accountNeighborhood,
          countryCode: region.code,
          isNewLogin: false,
        }),
      ]);
      const [refreshedProfile, refreshedContact] = await Promise.all([
        fetchUserProfile(authUser.uid),
        fetchUserPrivateContact(authUser.uid),
      ]);
      setUserProfile(refreshedProfile);
      setUserContact(refreshedContact);
      showToast('Account details saved.');
    } finally {
      setSavingAccount(false);
    }
  };

  const readyTechCount = technicians.filter((tItem) => tItem.isAvailable).length;
  const recentCombinedJobs = [...myCustomerJobs, ...myTechnicianJobs];
  const recentFeedJobs =
    recentCombinedJobs.length > 0 ? recentCombinedJobs : openJobs.slice(0, 3);
  const currentUserDisplay =
    userProfile?.displayName || authUser?.displayName || '';

  const isSubScreen =
    activeScreen === 'service_detail' ||
    activeScreen === 'booking' ||
    activeScreen === 'settings' ||
    activeScreen === 'auth';

  const screenTitleMap: Record<AppScreen, string> = {
    home: 'YourNeed',
    technician_dashboard: 'Technician Dashboard',
    explore: 'Explore Services',
    service_detail: 'Service Details',
    booking: 'Book Service',
    bookings: 'My Bookings',
    messages: 'Messages',
    profile: 'Profile',
    settings: 'Settings',
    auth: 'Sign In & Register',
  };

  const activeNavTab: AppScreen =
    activeScreen === 'service_detail' || activeScreen === 'booking'
      ? previousScreen === 'explore'
        ? 'explore'
        : previousScreen === 'bookings'
          ? 'bookings'
          : previousScreen === 'technician_dashboard'
            ? 'technician_dashboard'
            : 'home'
      : activeScreen === 'settings' || activeScreen === 'auth'
        ? 'profile'
        : activeScreen;

  const navItems: {
    id: AppScreen;
    label: string;
    icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
    badge?: number;
  }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'explore', label: 'Explore', icon: Compass },
    {
      id: 'bookings',
      label: 'Bookings',
      icon: CalendarCheck2,
      badge: pendingRequestsForTech.length > 0 ? pendingRequestsForTech.length : undefined,
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: MessageSquare,
      badge: unreadNotifCount > 0 ? unreadNotifCount : undefined,
    },
    { id: 'profile', label: 'Profile', icon: UserIcon },
  ];

  return (
    <MotionConfig reducedMotion="user">
      <AmbientBackground />
      <div
        id="top"
        className="relative z-10 min-h-[100dvh] flex bg-[#F8FAFC]/80 dark:bg-[#07130F]/80 text-[#18231E] dark:text-[#FFFDF8] transition-colors duration-200 overflow-x-clip"
      >
        {/* ----------------------------------------------------------------- */}
        {/* Desktop App Sidebar (Spacious Navigation Rail on lg+)             */}
        {/* ----------------------------------------------------------------- */}
        <aside className="hidden lg:flex lg:flex-col lg:justify-between w-72 shrink-0 h-[100dvh] sticky top-0 bg-[#FFFDF8]/92 dark:bg-[#071B16]/92 backdrop-blur-xl border-r border-[#075E36]/12 dark:border-white/[0.08] p-6 z-30 shadow-[6px_0_32px_-20px_rgba(7,27,22,0.4)]">
          <div className="space-y-7">
            <button
              type="button"
              onClick={() => navigateTo('home')}
              className="w-full text-left px-2.5 py-1.5 font-brand text-xl font-extrabold tracking-wide uppercase flex items-center gap-3"
            >
              <BrandLogoMark size="sm" animated={true} interactive={true} />
              <LetterSweepBrand text={t('brand')} />
            </button>

            <button
              type="button"
              onClick={() => handleStartRequest(null, null)}
              className="w-full min-h-[48px] px-5 rounded-xl yn-btn-saffron text-xs sm:text-sm flex items-center justify-center gap-2.5"
            >
              <Plus className="w-4 h-4" />
              <span>Book a Service</span>
            </button>

            <nav aria-label="Desktop app navigation" className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = activeNavTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => navigateTo(item.id)}
                    className={`w-full min-h-[46px] px-4 rounded-xl text-sm font-semibold flex items-center justify-between transition-all ${
                      active
                        ? 'bg-gradient-to-r from-[#FF9933]/18 via-[#FFFDF8]/10 to-[#35C46A]/14 border border-[#FF9933]/35 text-[#E87516] dark:text-[#FFD28A] shadow-sm'
                        : 'text-[#4D5E57] dark:text-[#E8EDF2]/75 hover:text-[#18231E] dark:hover:text-[#FFFDF8] hover:bg-[#E8EDF2]/65 dark:hover:bg-[#101A17]'
                    }`}
                  >
                    <span className="flex items-center gap-3.5">
                      <Icon
                        className={`w-4 h-4 ${
                          active ? 'text-[#E87516] dark:text-[#FF9933]' : 'text-[#075E36] dark:text-[#35C46A]'
                        }`}
                        strokeWidth={active ? 2.3 : 1.9}
                      />
                      <span>{item.label}</span>
                    </span>
                    {item.badge ? (
                      <span className="px-2 py-0.5 rounded-md bg-[#FF9933] text-[#07130F] text-[11px] font-bold tabular-nums">
                        {item.badge}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </nav>

            <div className="pt-5 border-t border-[#075E36]/12 dark:border-white/[0.08] space-y-2">
              <p className="px-4 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#4D5E57] dark:text-[#E8EDF2]/55">
                Workspace
              </p>
              <button
                type="button"
                onClick={() => {
                  setActiveRoleView('technician');
                  navigateTo('technician_dashboard');
                }}
                className={`w-full min-h-[44px] px-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-between gap-2.5 transition-all ${
                  activeScreen === 'technician_dashboard'
                    ? 'bg-[#138808]/16 border border-[#35C46A]/40 text-[#075E36] dark:text-[#7DFF9B]'
                    : 'text-[#4D5E57] dark:text-[#E8EDF2]/75 hover:text-[#18231E] dark:hover:text-[#FFFDF8] hover:bg-[#E8EDF2]/65 dark:hover:bg-[#101A17]'
                }`}
              >
                <span className="flex items-center gap-3.5">
                  <Wrench className="w-4 h-4 text-[#138808] dark:text-[#35C46A]" />
                  <span>Technician Dashboard</span>
                </span>
                {pendingRequestsForTech.length > 0 ? (
                  <span className="px-2 py-0.5 rounded-md bg-[#138808] text-[#FFFDF8] text-[10px] font-bold tabular-nums">
                    {pendingRequestsForTech.length}
                  </span>
                ) : null}
              </button>

              <button
                type="button"
                onClick={() => navigateTo('settings')}
                className={`w-full min-h-[44px] px-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-3.5 transition-all ${
                  activeScreen === 'settings'
                    ? 'bg-[#FF9933]/16 border border-[#FF9933]/35 text-[#E87516] dark:text-[#FFD28A]'
                    : 'text-[#4D5E57] dark:text-[#E8EDF2]/75 hover:text-[#18231E] dark:hover:text-[#FFFDF8] hover:bg-[#E8EDF2]/65 dark:hover:bg-[#101A17]'
                }`}
              >
                <Settings className="w-4 h-4 text-[#E87516] dark:text-[#FFB866]" />
                <span>Settings</span>
              </button>

              <button
                type="button"
                onClick={() => setAiBotOpen(true)}
                className="w-full min-h-[44px] px-4 rounded-xl text-xs sm:text-sm font-semibold text-[#4D5E57] dark:text-[#E8EDF2]/75 hover:text-[#18231E] dark:hover:text-[#FFFDF8] hover:bg-[#E8EDF2]/65 dark:hover:bg-[#101A17] flex items-center gap-3.5 transition-colors"
              >
                <Bot className="w-4 h-4 text-[#E87516] dark:text-[#FF9933]" />
                <span>AI Concierge</span>
              </button>

              <button
                type="button"
                onClick={() => setHelpOpen(true)}
                className="w-full min-h-[44px] px-4 rounded-xl text-xs sm:text-sm font-semibold text-[#4D5E57] dark:text-[#E8EDF2]/75 hover:text-[#18231E] dark:hover:text-[#FFFDF8] hover:bg-[#E8EDF2]/65 dark:hover:bg-[#101A17] flex items-center gap-3.5 transition-colors"
              >
                <HelpCircle className="w-4 h-4 text-[#075E36] dark:text-[#35C46A]" />
                <span>Help &amp; Safety</span>
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-[#075E36]/12 dark:border-white/[0.08]">
            <button
              type="button"
              onClick={() => (authUser ? navigateTo('profile') : navigateTo('auth'))}
              className="w-full p-3 rounded-xl bg-[#E8EDF2]/75 dark:bg-[#101A17] border border-[#075E36]/10 dark:border-white/[0.08] text-left flex items-center gap-3 hover:border-[#FF9933]/40 transition-colors"
            >
              <div className="w-9 h-9 rounded-xl bg-[#071B16] border border-[#FF9933]/40 text-[#FFD28A] text-xs font-bold flex items-center justify-center shrink-0">
                {authUser ? (currentUserDisplay || 'M').slice(0, 2).toUpperCase() : <UserIcon className="w-4 h-4" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-[#18231E] dark:text-[#FFFDF8] truncate">
                  {authUser ? currentUserDisplay || 'Account' : 'Sign In / Register'}
                </p>
                <p className="text-[11px] text-[#4D5E57] dark:text-[#E8EDF2]/60 truncate">
                  {region.name} · {currencyCode}
                </p>
              </div>
            </button>
          </div>
        </aside>

        {/* ----------------------------------------------------------------- */}
        {/* Main App Workspace Column                                         */}
        {/* ----------------------------------------------------------------- */}
        <div className="flex-1 min-w-0 flex flex-col pb-24 lg:pb-14">
          {/* Compact, Frosted Tricolour App Top Bar */}
          <header className="sticky top-0 z-30 h-16 bg-[#FFFDF8]/90 dark:bg-[#07130F]/92 backdrop-blur-xl border-b border-[#075E36]/10 dark:border-white/[0.08] px-5 sm:px-8 lg:px-10 flex items-center justify-between gap-4 relative">
            <div
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0 h-[1.5px] yn-tricolor-bar opacity-55 pointer-events-none"
            />
            <div className="flex items-center gap-3 min-w-0">
              {isSubScreen ? (
                <button
                  type="button"
                  onClick={() => navigateTo(previousScreen || 'home')}
                  aria-label="Go back"
                  className="min-h-[42px] min-w-[42px] rounded-xl bg-[#E8EDF2] dark:bg-[#101A17] border border-[#075E36]/15 dark:border-[#FF9933]/30 flex items-center justify-center text-[#E87516] dark:text-[#FFB866] shrink-0"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => navigateTo('home')}
                  aria-label="Your Need Home"
                  className="lg:hidden shrink-0 rounded-full focus:outline-none"
                >
                  <BrandLogoMark size="xs" animated={true} interactive={true} />
                </button>
              )}
              <h1 className="font-brand text-base sm:text-lg font-bold tracking-wide uppercase truncate yn-tricolor-text">
                {screenTitleMap[activeScreen]}
              </h1>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setNotifOpen((v) => !v)}
                aria-label="Open notifications"
                aria-expanded={notifOpen}
                className="relative min-h-[42px] min-w-[42px] rounded-xl bg-[#E8EDF2]/80 dark:bg-[#101A17] border border-[#075E36]/15 dark:border-white/[0.1] flex items-center justify-center text-[#18231E] dark:text-[#FFFDF8] hover:border-[#FF9933]/50 transition-colors"
              >
                <Bell className={`w-4 h-4 text-[#E87516] dark:text-[#FF9933] ${unreadNotifCount > 0 ? 'animate-pulse' : ''}`} />
                {unreadNotifCount > 0 ? (
                  <span className="absolute -top-1 -right-1 px-1.5 min-w-[18px] h-[18px] rounded-full bg-[#FF9933] text-[#07130F] text-[10px] font-bold flex items-center justify-center tabular-nums shadow-sm">
                    {unreadNotifCount}
                  </span>
                ) : null}
              </button>

              <button
                type="button"
                onClick={() => handleStartRequest(null, null)}
                className="lg:hidden min-h-[42px] px-4 rounded-xl yn-btn-saffron text-xs inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Book</span>
              </button>

              {/* Secondary Menu for Less-Frequent Global Actions */}
              <div ref={moreMenuRef} className="relative">
                <button
                  type="button"
                  aria-label="More options"
                  aria-expanded={moreMenuOpen}
                  onClick={() => setMoreMenuOpen((v) => !v)}
                  className="min-h-[42px] min-w-[42px] rounded-xl bg-[#E8EDF2]/80 dark:bg-[#101A17] border border-[#075E36]/15 dark:border-white/[0.1] flex items-center justify-center text-[#18231E] dark:text-[#FFFDF8] hover:border-[#35C46A]/50 transition-colors"
                >
                  <MoreVertical className="w-4 h-4 text-[#4D5E57] dark:text-[#E8EDF2]/75" />
                </button>

                {moreMenuOpen ? (
                  <div className="absolute right-0 mt-2.5 w-64 rounded-2xl bg-[#FFFDF8] dark:bg-[#071B16] border border-[#075E36]/15 dark:border-[#FF9933]/25 shadow-2xl p-2 z-50 space-y-1 backdrop-blur-xl">
                    <button
                      type="button"
                      onClick={() => {
                        setMoreMenuOpen(false);
                        setActiveRoleView('technician');
                        navigateTo('technician_dashboard');
                      }}
                      className="w-full min-h-[40px] px-3 rounded-xl text-left text-xs font-semibold text-[#075E36] dark:text-[#7DFF9B] hover:bg-[#E8EDF2] dark:hover:bg-[#101A17] flex items-center justify-between gap-2"
                    >
                      <span className="flex items-center gap-2.5">
                        <Wrench className="w-4 h-4 text-[#138808] dark:text-[#35C46A]" />
                        <span>Technician Dashboard</span>
                      </span>
                      {pendingRequestsForTech.length > 0 ? (
                        <span className="px-1.5 py-0.5 rounded-md bg-[#138808] text-[#FFFDF8] text-[10px] font-bold tabular-nums">
                          {pendingRequestsForTech.length}
                        </span>
                      ) : null}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setMoreMenuOpen(false);
                        setActiveRoleView('customer');
                        navigateTo('home');
                      }}
                      className="w-full min-h-[40px] px-3 rounded-xl text-left text-xs font-semibold text-[#18231E] dark:text-[#FFFDF8] hover:bg-[#E8EDF2] dark:hover:bg-[#101A17] flex items-center gap-2.5"
                    >
                      <Home className="w-4 h-4 text-[#E87516] dark:text-[#FF9933]" />
                      <span>Customer Dashboard</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setMoreMenuOpen(false);
                        setAiBotOpen(true);
                      }}
                      className="w-full min-h-[40px] px-3 rounded-xl text-left text-xs font-semibold text-[#18231E] dark:text-[#FFFDF8] hover:bg-[#E8EDF2] dark:hover:bg-[#101A17] flex items-center gap-2.5"
                    >
                      <Bot className="w-4 h-4 text-[#E87516] dark:text-[#FF9933]" />
                      <span>AI Service Concierge</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setMoreMenuOpen(false);
                        setRegionModalOpen(true);
                      }}
                      className="w-full min-h-[40px] px-3 rounded-xl text-left text-xs font-semibold text-[#18231E] dark:text-[#FFFDF8] hover:bg-[#E8EDF2] dark:hover:bg-[#101A17] flex items-center justify-between gap-2"
                    >
                      <span className="flex items-center gap-2.5">
                        <Globe className="w-4 h-4 text-[#075E36] dark:text-[#35C46A]" />
                        <span>Region &amp; Currency</span>
                      </span>
                      <span className="text-[11px] text-[#4D5E57] dark:text-[#E8EDF2]/65">{currencyCode}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setMoreMenuOpen(false);
                        navigateTo('settings');
                      }}
                      className="w-full min-h-[40px] px-3 rounded-xl text-left text-xs font-semibold text-[#18231E] dark:text-[#FFFDF8] hover:bg-[#E8EDF2] dark:hover:bg-[#101A17] flex items-center gap-2.5"
                    >
                      <Settings className="w-4 h-4 text-[#E87516] dark:text-[#FFB866]" />
                      <span>Settings &amp; Preferences</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        toggleScrollbars();
                        setMoreMenuOpen(false);
                      }}
                      className="w-full min-h-[40px] px-3 rounded-xl text-left text-xs font-semibold text-[#18231E] dark:text-[#FFFDF8] hover:bg-[#E8EDF2] dark:hover:bg-[#101A17] flex items-center justify-between gap-2"
                    >
                      <span className="flex items-center gap-2.5">
                        <ArrowUpDown className="w-4 h-4 text-[#075E36] dark:text-[#35C46A]" />
                        <span>Scrollbar Display</span>
                      </span>
                      <span className="text-[11px] text-[#E87516] dark:text-[#FFB866]">
                        {showScrollbars ? 'Visible' : 'Hidden'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setMoreMenuOpen(false);
                        setHelpOpen(true);
                      }}
                      className="w-full min-h-[40px] px-3 rounded-xl text-left text-xs font-semibold text-[#18231E] dark:text-[#FFFDF8] hover:bg-[#E8EDF2] dark:hover:bg-[#101A17] flex items-center gap-2.5"
                    >
                      <HelpCircle className="w-4 h-4 text-[#075E36] dark:text-[#35C46A]" />
                      <span>Help &amp; Safety Policies</span>
                    </button>

                    {isAdmin ? (
                      <button
                        type="button"
                        onClick={() => {
                          setMoreMenuOpen(false);
                          setActiveRoleView('admin');
                          navigateTo('bookings');
                        }}
                        className="w-full min-h-[40px] px-3 rounded-xl text-left text-xs font-semibold text-[#E87516] dark:text-[#FFD28A] hover:bg-[#E8EDF2] dark:hover:bg-[#101A17] flex items-center gap-2.5 border-t border-[#075E36]/12 dark:border-white/[0.08] mt-1 pt-1"
                      >
                        <Shield className="w-4 h-4 text-[#FF9933]" />
                        <span>Admin Directory Console</span>
                      </button>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>
          </header>

          {/* Toast Notification */}
          <AnimatePresence>
            {toastMessage ? (
              <motion.div
                key="app-toast"
                initial={{ opacity: 0, y: -14, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -14, scale: 0.96 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                role="status"
                className="fixed top-16 right-4 left-4 sm:left-auto sm:w-96 z-40 rounded-2xl bg-[#071B16]/95 backdrop-blur-xl border border-[#FF9933]/40 text-[#FFFDF8] px-4 py-3 text-sm shadow-2xl flex items-center justify-between gap-3"
              >
                <span>{toastMessage}</span>
                <button
                  type="button"
                  onClick={() => setToastMessage(null)}
                  className="text-[#FFB866] hover:underline text-xs font-semibold shrink-0"
                >
                  Dismiss
                </button>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {/* Main Screen Container */}
          <main className="flex-1 w-full max-w-5xl mx-auto px-5 sm:px-8 lg:px-10 pt-8 pb-12 space-y-8">
            {/* Direct Admin Saved Directory Portal Access Guard */}
            {adminPortalRequested && !isAdmin ? (
              <section
                aria-label="Admin Saved Directory Sign-In"
                className="rounded-2xl yn-tricolor-border bg-[#071B16]/95 text-[#FFFDF8] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[#FFB866] text-xs font-bold uppercase tracking-wider">
                    <Shield className="w-4 h-4 text-[#FF9933]" />
                    <span>Admin Saved Directory Portal</span>
                  </div>
                  <h2 className="text-base font-bold text-[#FFFDF8] font-display">
                    {!authUser
                      ? `Sign in as ${ADMIN_EMAIL} to view saved records`
                      : `Signed in as ${authUser.email} — Admin required`}
                  </h2>
                </div>
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {!authUser ? (
                    <button
                      type="button"
                      disabled={authLoading}
                      onClick={() => handleGoogleSignIn()}
                      className="min-h-[42px] px-4 rounded-xl yn-btn-saffron text-xs"
                    >
                      {authLoading ? 'Signing in...' : 'Sign In as Admin'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="min-h-[42px] px-4 rounded-xl yn-btn-saffron text-xs"
                    >
                      Switch Account
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setAdminPortalRequested(false);
                      setActiveRoleView('customer');
                    }}
                    className="min-h-[42px] px-3.5 rounded-xl bg-[#101A17] border border-white/15 text-xs font-semibold text-[#FFFDF8]"
                  >
                    Dismiss
                  </button>
                </div>
              </section>
            ) : null}

            <AnimatePresence mode="wait">
              <motion.div
                key={activeScreen}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              >
                {activeScreen === 'home' ? (
                  <AppHomeScreen
                    displayName={currentUserDisplay}
                    isSignedIn={Boolean(authUser)}
                    region={region}
                    currencyCode={currencyCode}
                    readyTechCount={readyTechCount}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    onSubmitSearch={() => navigateTo('explore')}
                    onSelectCategory={(cat) => setSelectedCategory(cat)}
                    onOpenExplore={() => navigateTo('explore')}
                    onOpenBooking={(tech) => handleStartRequest(tech || null, null)}
                    onOpenTechSetup={() => {
                      if (!authUser) {
                        openAuthGate(
                          'Sign in with Google to register your verified technician profile and claim local jobs.'
                        );
                      } else {
                        setTechSetupOpen(true);
                      }
                    }}
                    onOpenAiAssistant={() => setAiBotOpen(true)}
                    onOpenUrgentExplore={() => {
                      setUrgencyFilter('urgent_today');
                      navigateTo('explore');
                    }}
                    onOpenRegionModal={() => setRegionModalOpen(true)}
                    onOpenTechDetail={(tech) => {
                      setServiceDetailTarget({ type: 'technician', technician: tech });
                      navigateTo('service_detail');
                    }}
                    onOpenExampleDetail={(ex) => {
                      setServiceDetailTarget({ type: 'example', example: ex });
                      navigateTo('service_detail');
                    }}
                    onOpenBookingsTab={() => navigateTo('bookings')}
                    onOpenJobDetail={(job) => setSelectedJob(job)}
                    technicians={technicians}
                    topFiveStarReviewByTechId={topFiveStarReviewByTechId}
                    examples={regionShowcase.examples}
                    recentJobs={recentFeedJobs}
                  />
                ) : null}

                {activeScreen === 'technician_dashboard' ? (
                  <TechnicianDashboardScreen
                    displayName={currentUserDisplay}
                    isSignedIn={Boolean(authUser)}
                    region={region}
                    currencyCode={currencyCode}
                    currentUid={authUser?.uid || null}
                    myTechProfile={myTechProfile}
                    myTechnicianJobs={myTechnicianJobs}
                    pendingRequestsForTech={pendingRequestsForTech}
                    openCommunityJobs={openJobs}
                    todayCompletedCount={todayCompletedCount}
                    monthlyEarnings={monthlyEarnings}
                    myTechFeedback={myTechFeedback}
                    onToggleDuty={handleToggleDuty}
                    onOpenTechSetup={() => {
                      if (!authUser) {
                        openAuthGate(
                          'Sign in with Google to set up your verified technician profile.'
                        );
                      } else {
                        setTechSetupOpen(true);
                      }
                    }}
                    onOpenAuth={(reason) => openAuthGate(reason)}
                    onOpenJobDetail={(job) => setSelectedJob(job)}
                    onOpenInvoice={(job) => setInvoiceJob(job)}
                    onOpenMessages={() => navigateTo('messages')}
                    onOpenExplore={() => navigateTo('explore')}
                    onOpenAiAssistant={() => setAiBotOpen(true)}
                    onSwitchToCustomerDashboard={() => {
                      setActiveRoleView('customer');
                      navigateTo('home');
                    }}
                  />
                ) : null}

                {activeScreen === 'explore' ? (
                  <AppExploreScreen
                    region={region}
                    currencyCode={currencyCode}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    selectedCategory={selectedCategory}
                    onSelectCategory={setSelectedCategory}
                    availableOnly={availableOnly}
                    onToggleAvailableOnly={() => setAvailableOnly((v) => !v)}
                    urgencyFilter={urgencyFilter}
                    onSelectUrgency={setUrgencyFilter}
                    filteredTechnicians={filteredTechnicians}
                    filteredOpenJobs={filteredOpenJobs}
                    topFiveStarReviewByTechId={topFiveStarReviewByTechId}
                    currentUid={authUser?.uid || null}
                    onOpenTechDetail={(tech) => {
                      setServiceDetailTarget({ type: 'technician', technician: tech });
                      navigateTo('service_detail');
                    }}
                    onBookTechnician={(tech) => handleStartRequest(tech, null)}
                    onReportTech={(tech) => {
                      if (!authUser) {
                        openAuthGate('Sign in with Google to report a suspicious account.');
                        return;
                      }
                      setReportTarget({
                        targetType: 'technician',
                        targetId: tech.uid,
                        targetName: tech.displayName,
                      });
                    }}
                    onOpenJobDetail={(job) => setSelectedJob(job)}
                    onOpenBooking={() => handleStartRequest(null, null)}
                  />
                ) : null}

                {activeScreen === 'service_detail' ? (
                  <AppServiceDetailScreen
                    target={serviceDetailTarget}
                    region={region}
                    currencyCode={currencyCode}
                    reviews={reviews}
                    onBack={() => navigateTo(previousScreen || 'explore')}
                    onBookTechnician={(tech) => handleStartRequest(tech, null)}
                    onBookExample={(ex) => {
                      setSelectedCategory(ex.category);
                      handleStartRequest(null, {
                        category: ex.category,
                        issueTitle: ex.title,
                        issueDescription: `Need service for: ${ex.title} in ${ex.area}.`,
                        urgency: 'within_24h',
                      });
                    }}
                    onReportTech={(tech) => {
                      if (!authUser) {
                        openAuthGate('Sign in with Google to report a suspicious account.');
                        return;
                      }
                      setReportTarget({
                        targetType: 'technician',
                        targetId: tech.uid,
                        targetName: tech.displayName,
                      });
                    }}
                  />
                ) : null}

                {activeScreen === 'booking' ? (
                  <RequestRepairSheet
                    open={true}
                    embedded={true}
                    isSignedIn={Boolean(authUser)}
                    region={region}
                    currencyCode={currencyCode}
                    defaultName={userProfile?.displayName || authUser?.displayName || ''}
                    defaultNeighborhood={userProfile?.neighborhood || ''}
                    defaultPhone={userContact?.phone || ''}
                    defaultAddress={userContact?.streetAddress || ''}
                    targetTechnician={targetTechnician}
                    initialDraft={aiBookingDraft}
                    availableTechCount={readyTechCount}
                    submitting={submitting}
                    onClose={() => {
                      setTargetTechnician(null);
                      setAiBookingDraft(null);
                      navigateTo(previousScreen || 'home');
                    }}
                    onRequireAuth={() =>
                      openAuthGate(
                        'Sign in with Google to post your repair request and keep your address protected.'
                      )
                    }
                    onSubmit={handleCreateRepairJob}
                  />
                ) : null}

                {activeScreen === 'bookings' ? (
                  <AppBookingsScreen
                    activeRoleView={activeRoleView}
                    onChangeRoleView={setActiveRoleView}
                    isAdmin={isAdmin}
                    authReady={authReady}
                    isSignedIn={Boolean(authUser)}
                    region={region}
                    currencyCode={currencyCode}
                    myCustomerJobs={myCustomerJobs}
                    myTechnicianJobs={myTechnicianJobs}
                    myTechProfile={myTechProfile}
                    pendingRequestsForTech={pendingRequestsForTech}
                    todayCompletedCount={todayCompletedCount}
                    monthlyEarnings={monthlyEarnings}
                    myTechFeedback={myTechFeedback}
                    adminUsers={adminUsers}
                    adminLoginRecords={adminLoginRecords}
                    adminTechnicians={adminTechnicians}
                    adminJobs={adminJobs}
                    adminReports={adminReports}
                    databaseId={firebaseConfig.firestoreDatabaseId}
                    firebaseConsoleUrl={`https://console.firebase.google.com/project/${firebaseConfig.projectId}/firestore/databases/${firebaseConfig.firestoreDatabaseId}/data`}
                    adminPortalUrl={
                      typeof window !== 'undefined'
                        ? `${window.location.origin}/?view=admin-records`
                        : '/?view=admin-records'
                    }
                    onVerifyTechnician={handleAdminVerifyTechnician}
                    onUpdateReport={handleAdminUpdateReport}
                    onOpenBooking={() => handleStartRequest(null, null)}
                    onOpenAuth={(reason) => openAuthGate(reason)}
                    onOpenJobDetail={(job) => setSelectedJob(job)}
                    onOpenInvoice={(job) => setInvoiceJob(job)}
                    onOpenTechSetup={() => setTechSetupOpen(true)}
                    onOpenTechnicianDashboard={() => {
                      setActiveRoleView('technician');
                      navigateTo('technician_dashboard');
                    }}
                    onToggleDuty={handleToggleDuty}
                  />
                ) : null}

                {activeScreen === 'messages' ? (
                  <AppMessagesScreen
                    currentUid={authUser?.uid || null}
                    currentName={currentUserDisplay || 'Member'}
                    myCustomerJobs={myCustomerJobs}
                    myTechnicianJobs={myTechnicianJobs}
                    notifications={mergedNotifications}
                    initialTab={messagesInitialTab}
                    onMarkAllRead={handleMarkAllNotificationsRead}
                    onOpenJobDetail={(job) => setSelectedJob(job)}
                    onOpenAiAssistant={() => setAiBotOpen(true)}
                    onOpenAuth={(reason) => openAuthGate(reason)}
                  />
                ) : null}

                {activeScreen === 'profile' ? (
                  <AppProfileScreen
                    isSignedIn={Boolean(authUser)}
                    email={authUser?.email || ''}
                    avatarUrl={userProfile?.avatarUrl || authUser?.photoURL || undefined}
                    userProfile={userProfile}
                    myTechProfile={myTechProfile}
                    isAdmin={isAdmin}
                    region={region}
                    currencyCode={currencyCode}
                    bookingsCount={myCustomerJobs.length}
                    techJobsCount={myTechnicianJobs.length}
                    accountName={accountName}
                    accountNeighborhood={accountNeighborhood}
                    accountRole={accountRole}
                    accountPhone={accountPhone}
                    accountAddress={accountAddress}
                    savingAccount={savingAccount}
                    onAccountNameChange={setAccountName}
                    onAccountNeighborhoodChange={setAccountNeighborhood}
                    onAccountRoleChange={setAccountRole}
                    onAccountPhoneChange={setAccountPhone}
                    onAccountAddressChange={setAccountAddress}
                    onSaveAccount={handleSaveAccount}
                    onOpenTechnicianDashboard={() => {
                      setActiveRoleView('technician');
                      navigateTo('technician_dashboard');
                    }}
                    onOpenTechSetup={() => {
                      if (!authUser) {
                        openAuthGate(
                          'Sign in with Google to register your service provider profile.'
                        );
                      } else {
                        setTechSetupOpen(true);
                      }
                    }}
                    onOpenSettings={() => navigateTo('settings')}
                    onOpenAdminConsole={() => {
                      setActiveRoleView('admin');
                      navigateTo('bookings');
                    }}
                    onOpenHelp={() => setHelpOpen(true)}
                    onOpenAiAssistant={() => setAiBotOpen(true)}
                    onOpenAuthScreen={() => navigateTo('auth')}
                    onSignOut={handleSignOut}
                  />
                ) : null}

                {activeScreen === 'settings' ? (
                  <AppSettingsScreen
                    region={region}
                    currencyCode={currencyCode}
                    languageNativeName={langOption.nativeName}
                    theme={theme}
                    showScrollbars={showScrollbars}
                    pushNotifsEnabled={pushNotifsEnabled}
                    browserNotifPermission={browserNotifPermission}
                    installLabel={t('installApp')}
                    onBack={() => navigateTo('profile')}
                    onOpenRegionModal={() => setRegionModalOpen(true)}
                    onToggleTheme={toggleTheme}
                    onToggleScrollbars={toggleScrollbars}
                    onTogglePushNotifs={handleRequestPushPermission}
                    onOpenHelp={() => setHelpOpen(true)}
                  />
                ) : null}

                {activeScreen === 'auth' ? (
                  <AppAuthScreen
                    loading={authLoading}
                    errorMessage={authError}
                    onBack={() => navigateTo(previousScreen || 'profile')}
                    onSignIn={handleGoogleSignIn}
                  />
                ) : null}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>

        <OfflineIndicator />

        {/* Comfortable Floating Quick-Scroll Control */}
        <AnimatePresence>
          {scrollState.scrollable && !showIntro ? (
            <motion.button
              key={scrollState.scrolledDown ? 'scroll-up-btn' : 'scroll-down-btn'}
              type="button"
              initial={{ opacity: 0, scale: 0.88, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.88, y: 10 }}
              transition={{ duration: 0.2 }}
              aria-label={scrollState.scrolledDown ? 'Scroll to top' : 'Scroll down smoothly'}
              onClick={() => {
                if (scrollState.scrolledDown) {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                  window.scrollBy({
                    top: Math.round(window.innerHeight * 0.72),
                    behavior: 'smooth',
                  });
                }
              }}
              className="fixed bottom-20 lg:bottom-6 right-4 z-30 min-h-[44px] min-w-[44px] px-3 rounded-full bg-[#071B16]/95 border border-[#FF9933]/45 text-[#FFD28A] shadow-xl backdrop-blur-md hover:bg-[#101A17] hover:border-[#FF9933] transition-colors flex items-center justify-center gap-1.5 text-xs font-semibold"
            >
              {scrollState.scrolledDown ? (
                <>
                  <ArrowUp className="w-4 h-4" />
                  <span className="hidden sm:inline">Top</span>
                </>
              ) : (
                <>
                  <ArrowDown className="w-4 h-4" />
                  <span className="hidden sm:inline">Scroll</span>
                </>
              )}
            </motion.button>
          ) : null}
        </AnimatePresence>

        {/* Fixed 5-Tab Mobile Bottom Navigation Bar */}
        <nav
          aria-label="Mobile app navigation"
          className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FFFDF8]/95 dark:bg-[#07130F]/95 backdrop-blur-xl border-t border-[#075E36]/12 dark:border-white/[0.08] pb-safe px-1.5"
        >
          <div className="grid grid-cols-5 h-16 items-center gap-1">
            {navItems.map((tab) => {
              const Icon = tab.icon;
              const active = activeNavTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => navigateTo(tab.id)}
                  className={`relative min-h-[48px] h-full flex flex-col items-center justify-center gap-1 transition-colors ${
                    active
                      ? 'text-[#E87516] dark:text-[#FF9933]'
                      : 'text-[#4D5E57] dark:text-[#E8EDF2]/65 hover:text-[#18231E] dark:hover:text-[#FFFDF8]'
                  }`}
                >
                  {active ? (
                    <motion.span
                      layoutId="mobile-tab-indicator"
                      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                      className="absolute top-0 w-10 h-0.5 rounded-full yn-tricolor-bar"
                    />
                  ) : null}
                  <div className="relative">
                    <motion.div
                      animate={{ scale: active ? 1.08 : 1, y: active ? -1 : 0 }}
                      transition={{ duration: 0.18 }}
                    >
                      <Icon className="w-5 h-5" strokeWidth={active ? 2.2 : 1.8} />
                    </motion.div>
                    {tab.badge ? (
                      <span className="absolute -top-1.5 -right-2.5 px-1 min-w-[16px] h-[16px] rounded-full bg-[#FF9933] text-[#07130F] text-[9px] font-bold flex items-center justify-center tabular-nums shadow-sm">
                        {tab.badge}
                      </span>
                    ) : null}
                  </div>
                  <span className="text-[11px] font-semibold tracking-tight truncate max-w-full px-1">
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Modals & Action Sheets */}
        <RegionLanguageModal
          open={regionModalOpen}
          selectedCountry={region}
          selectedCurrency={currencyCode}
          selectedLanguage={language}
          onClose={() => setRegionModalOpen(false)}
          onApply={handleApplyRegionLanguage}
        />

        <IntroLaunchScreen
          open={showIntro}
          isAuthenticated={Boolean(authUser)}
          userDisplayName={userProfile?.displayName || authUser?.displayName || undefined}
          authLoading={authLoading}
          authError={authError}
          region={region}
          currencyCode={currencyCode}
          theme={theme}
          onToggleTheme={toggleTheme}
          onSignIn={handleGoogleSignIn}
          onContinueToApp={(preferredRole) => {
            if (preferredRole === 'technician') {
              setActiveRoleView('technician');
              setMobileTab('workbench');
              navigateTo('technician_dashboard');
            } else {
              setActiveRoleView('customer');
              setMobileTab('discover');
              navigateTo('home');
            }
            setPageTransitioning(true);
            setShowIntro(false);
            window.setTimeout(() => setPageTransitioning(false), 450);
          }}
          onOpenAiAssistant={() => {
            setShowIntro(false);
            setAiBotOpen(true);
          }}
          onOpenHelp={() => {
            setShowIntro(false);
            setHelpOpen(true);
          }}
        />

        <NotificationCenterDrawer
          open={notifOpen}
          isSignedIn={Boolean(authUser)}
          notifications={mergedNotifications}
          browserPermission={browserNotifPermission}
          pushEnabled={pushNotifsEnabled}
          onClose={() => setNotifOpen(false)}
          onNotificationClick={handleNotificationClick}
          onMarkAllRead={handleMarkAllNotificationsRead}
          onRequestPushPermission={handleRequestPushPermission}
          onSendTestNotification={handleSendTestNotification}
          onOpenMessagesScreen={() => {
            setMessagesInitialTab('updates');
            navigateTo('messages');
          }}
          onOpenAuth={() =>
            openAuthGate('Sign in with Google to receive live repair notifications.')
          }
        />

        <LiveNotificationBanner
          notification={liveBannerNotif}
          onDismiss={() => setLiveBannerNotif(null)}
          onOpen={handleNotificationClick}
        />

        <StartupLogoSplash
          visible={showStartupSplash}
          theme={theme}
          onSkip={() => {
            setSplashMinDone(true);
            setShowStartupSplash(false);
          }}
        />

        <PageTransitionLoader
          visible={(!authReady && !showStartupSplash) || pageTransitioning}
          label={
            !authReady
              ? 'Connecting encrypted concierge session...'
              : 'Entering Your Need Dashboard...'
          }
        />

        <AuthGateModal
          open={authModalOpen}
          reason={authReason}
          loading={authLoading}
          errorMessage={authError}
          onClose={() => setAuthModalOpen(false)}
          onSignIn={handleGoogleSignIn}
        />

        <RequestRepairSheet
          open={requestSheetOpen}
          isSignedIn={Boolean(authUser)}
          region={region}
          currencyCode={currencyCode}
          defaultName={userProfile?.displayName || authUser?.displayName || ''}
          defaultNeighborhood={userProfile?.neighborhood || ''}
          defaultPhone={userContact?.phone || ''}
          defaultAddress={userContact?.streetAddress || ''}
          targetTechnician={targetTechnician}
          initialDraft={aiBookingDraft}
          availableTechCount={readyTechCount}
          submitting={submitting}
          onClose={() => {
            setRequestSheetOpen(false);
            setTargetTechnician(null);
            setAiBookingDraft(null);
          }}
          onRequireAuth={() =>
            openAuthGate(
              'Sign in with Google to post your repair request and keep your address protected.'
            )
          }
          onSubmit={handleCreateRepairJob}
        />

        <TechnicianSetupSheet
          open={techSetupOpen}
          existingProfile={myTechProfile}
          region={region}
          currencyCode={currencyCode}
          defaultName={userProfile?.displayName || authUser?.displayName || ''}
          defaultNeighborhood={userProfile?.neighborhood || 'Central District'}
          defaultPhone={userContact?.phone || ''}
          submitting={submitting}
          onClose={() => setTechSetupOpen(false)}
          onSubmit={handleSaveTechnicianProfile}
        />

        <JobDetailSheet
          job={selectedJob}
          currentUid={authUser?.uid || null}
          currentName={userProfile?.displayName || authUser?.displayName || 'Member'}
          myTechnicianProfile={myTechProfile}
          myPhone={userContact?.phone || ''}
          existingReview={
            selectedJob ? reviews.find((r) => r.jobId === selectedJob.id) || null : null
          }
          submitting={submitting}
          onClose={() => setSelectedJob(null)}
          onRequireAuth={openAuthGate}
          onOpenTechSetup={() => {
            setSelectedJob(null);
            setTechSetupOpen(true);
          }}
          onAcceptJob={handleAcceptJob}
          onRejectJob={handleRejectJob}
          onReopenJob={handleReopenJob}
          onApproveQuote={handleApproveQuote}
          onAdvanceStatus={handleAdvanceStatus}
          onSettlePayment={handleSettlePayment}
          onCancelJob={handleCancelJob}
          onSubmitReview={handleSubmitReview}
          onOpenInvoice={(j) => setInvoiceJob(j)}
          onOpenReport={(target) => setReportTarget(target)}
        />

        <DigitalInvoiceModal
          job={invoiceJob}
          onClose={() => setInvoiceJob(null)}
          onReportDispute={(j) => {
            setInvoiceJob(null);
            setReportTarget({
              targetType: 'job',
              targetId: j.id,
              targetName: j.issueTitle,
            });
          }}
        />

        <ReportComplaintModal
          open={Boolean(reportTarget)}
          targetType={reportTarget?.targetType || 'technician'}
          targetId={reportTarget?.targetId || ''}
          targetName={reportTarget?.targetName || ''}
          submitting={submitting}
          onClose={() => setReportTarget(null)}
          onSubmit={handleSubmitReport}
        />

        <AiRepairBotDrawer
          open={aiBotOpen}
          regionName={region.name}
          currencyCode={currencyCode}
          languageName={langOption.nativeName}
          roleView={activeRoleView === 'technician' ? 'technician' : 'customer'}
          onClose={() => setAiBotOpen(false)}
          onBookRepair={(draft) => handleStartRequest(null, draft || null)}
        />

        <HelpCenterModal
          open={helpOpen}
          regionName={region.name}
          currencyCode={currencyCode}
          onClose={() => setHelpOpen(false)}
          onOpenAiBot={() => setAiBotOpen(true)}
          onPostRepair={() => handleStartRequest(null, null)}
        />
      </div>
    </MotionConfig>
  );
}
