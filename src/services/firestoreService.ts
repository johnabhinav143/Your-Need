import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  Unsubscribe,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import {
  AccountCategory,
  ApplianceCategory,
  AppNotification,
  JobMessage,
  JobPrivateContact,
  JobStatus,
  JobTechPrivateContact,
  JobUrgency,
  LoginRecord,
  MarketplaceRole,
  NotificationType,
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
} from '../types';

function clampString(value: string, maxLen: number): string {
  return value.trim().slice(0, maxLen);
}

function clampNumber(value: number, min: number, max: number): number {
  const num = Number(value);
  if (!Number.isFinite(num)) return min;
  return Math.min(max, Math.max(min, Math.round(num * 100) / 100));
}

function generateId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now()}_${rand}`.replace(/[^a-zA-Z0-9_-]/g, '');
}

// ---------------------------------------------------------------------------
// Subscriptions
// ---------------------------------------------------------------------------
export function subscribePublicTechnicians(
  onData: (techs: TechnicianProfile[]) => void
): Unsubscribe {
  const path = 'technicians';
  const q = query(collection(db, path), where('isPublic', '==', true));
  return onSnapshot(
    q,
    (snapshot) => {
      const items: TechnicianProfile[] = snapshot.docs.map((d) => d.data() as TechnicianProfile);
      items.sort((a, b) => Number(b.isAvailable) - Number(a.isAvailable));
      onData(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export function subscribeOpenJobs(onData: (jobs: RepairJob[]) => void): Unsubscribe {
  const path = 'repair_jobs';
  const q = query(collection(db, path), where('status', '==', 'open'));
  return onSnapshot(
    q,
    (snapshot) => {
      const items: RepairJob[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<RepairJob, 'id'>),
      }));
      onData(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export function subscribeCustomerJobs(
  customerId: string,
  onData: (jobs: RepairJob[]) => void
): Unsubscribe {
  const path = 'repair_jobs';
  const q = query(collection(db, path), where('customerId', '==', customerId));
  return onSnapshot(
    q,
    (snapshot) => {
      const items: RepairJob[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<RepairJob, 'id'>),
      }));
      onData(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export function subscribeTechnicianJobs(
  technicianId: string,
  onData: (jobs: RepairJob[]) => void
): Unsubscribe {
  const path = 'repair_jobs';
  const q = query(collection(db, path), where('technicianId', '==', technicianId));
  return onSnapshot(
    q,
    (snapshot) => {
      const items: RepairJob[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<RepairJob, 'id'>),
      }));
      onData(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export function subscribeReviews(onData: (reviews: Review[]) => void): Unsubscribe {
  const path = 'reviews';
  const q = query(collection(db, path), where('rating', '>=', 1));
  return onSnapshot(
    q,
    (snapshot) => {
      const items: Review[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Review, 'id'>),
      }));
      onData(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export function subscribeJobMessages(
  jobId: string,
  roleFilter: 'customer' | 'technician',
  userId: string,
  onData: (messages: JobMessage[]) => void
): Unsubscribe {
  const path = `repair_jobs/${jobId}/messages`;
  const fieldName = roleFilter === 'customer' ? 'customerId' : 'technicianId';
  const q = query(collection(db, path), where(fieldName, '==', userId));
  return onSnapshot(
    q,
    (snapshot) => {
      const items: JobMessage[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<JobMessage, 'id'>),
      }));
      items.sort((a, b) => {
        const ta = (a.createdAt as { toMillis?: () => number } | undefined)?.toMillis?.() ?? 0;
        const tb = (b.createdAt as { toMillis?: () => number } | undefined)?.toMillis?.() ?? 0;
        return ta - tb;
      });
      onData(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export function subscribeUserNotifications(
  userId: string,
  onData: (items: AppNotification[]) => void
): Unsubscribe {
  const path = 'notifications';
  const q = query(collection(db, path), where('recipientId', '==', userId));
  return onSnapshot(
    q,
    (snapshot) => {
      const items: AppNotification[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<AppNotification, 'id'>),
      }));
      items.sort((a, b) => {
        const ta = (a.createdAt as { toMillis?: () => number } | undefined)?.toMillis?.() ?? 0;
        const tb = (b.createdAt as { toMillis?: () => number } | undefined)?.toMillis?.() ?? 0;
        return tb - ta;
      });
      onData(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export function subscribeMyReports(
  reporterId: string,
  onData: (items: ReportComplaint[]) => void
): Unsubscribe {
  const path = 'reports';
  const q = query(collection(db, path), where('reporterId', '==', reporterId));
  return onSnapshot(
    q,
    (snapshot) => {
      const items: ReportComplaint[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<ReportComplaint, 'id'>),
      }));
      onData(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

// ---------------------------------------------------------------------------
// Admin Subscriptions & Actions
// ---------------------------------------------------------------------------
export function subscribeAllUsersAdmin(onData: (items: UserProfile[]) => void): Unsubscribe {
  const path = 'users';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      onData(snapshot.docs.map((d) => d.data() as UserProfile));
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export function subscribeAllTechniciansAdmin(
  onData: (items: TechnicianProfile[]) => void
): Unsubscribe {
  const path = 'technicians';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      onData(snapshot.docs.map((d) => d.data() as TechnicianProfile));
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export function subscribeAllJobsAdmin(onData: (items: RepairJob[]) => void): Unsubscribe {
  const path = 'repair_jobs';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      onData(
        snapshot.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<RepairJob, 'id'>),
        }))
      );
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export function subscribeAllReportsAdmin(
  onData: (items: ReportComplaint[]) => void
): Unsubscribe {
  const path = 'reports';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const items: ReportComplaint[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<ReportComplaint, 'id'>),
      }));
      items.sort((a, b) => {
        const ta = (a.createdAt as { toMillis?: () => number } | undefined)?.toMillis?.() ?? 0;
        const tb = (b.createdAt as { toMillis?: () => number } | undefined)?.toMillis?.() ?? 0;
        return tb - ta;
      });
      onData(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export function subscribeAllLoginRecordsAdmin(
  onData: (items: LoginRecord[]) => void
): Unsubscribe {
  const path = 'login_records';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const items: LoginRecord[] = snapshot.docs.map((d) => d.data() as LoginRecord);
      items.sort((a, b) => {
        const ta = (a.lastLoginAt as { toMillis?: () => number } | undefined)?.toMillis?.() ?? 0;
        const tb = (b.lastLoginAt as { toMillis?: () => number } | undefined)?.toMillis?.() ?? 0;
        return tb - ta;
      });
      onData(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function adminUpdateTechnicianVerification(params: {
  techId: string;
  verificationStatus: VerificationStatus;
  isPublic: boolean;
}): Promise<void> {
  const path = `technicians/${params.techId}`;
  try {
    await updateDoc(doc(db, 'technicians', params.techId), {
      verificationStatus: params.verificationStatus,
      isPublic: params.isPublic,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function adminUpdateReportStatus(params: {
  reportId: string;
  status: ReportStatus;
  adminNote: string;
}): Promise<void> {
  const path = `reports/${params.reportId}`;
  try {
    await updateDoc(doc(db, 'reports', params.reportId), {
      status: params.status,
      adminNote: clampString(params.adminNote, 300),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// ---------------------------------------------------------------------------
// User Profile & Private Contact
// ---------------------------------------------------------------------------
export async function fetchUserProfile(uid: string): Promise<UserProfile | null> {
  const path = `users/${uid}`;
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    return snap.exists() ? (snap.data() as UserProfile) : null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function fetchUserPrivateContact(uid: string): Promise<UserPrivateContact | null> {
  const path = `users/${uid}/private/contact`;
  try {
    const snap = await getDoc(doc(db, 'users', uid, 'private', 'contact'));
    return snap.exists() ? (snap.data() as UserPrivateContact) : null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function upsertUserProfile(params: {
  uid: string;
  displayName: string;
  role: MarketplaceRole;
  neighborhood: string;
  countryCode?: string;
  currencyCode?: string;
  avatarUrl?: string;
  exists: boolean;
}): Promise<void> {
  const path = `users/${params.uid}`;
  const ref = doc(db, 'users', params.uid);
  const safeName = clampString(params.displayName, 60) || 'Member';
  const safeNeighborhood = clampString(params.neighborhood, 80) || 'Central District';
  const safeAvatar = params.avatarUrl ? clampString(params.avatarUrl, 500) : '';

  try {
    const payload: Record<string, unknown> = {
      displayName: safeName.length >= 2 ? safeName : 'Member',
      role: params.role,
      neighborhood: safeNeighborhood.length >= 2 ? safeNeighborhood : 'Central District',
      updatedAt: serverTimestamp(),
    };
    if (params.countryCode) payload.countryCode = clampString(params.countryCode, 5);
    if (params.currencyCode) payload.currencyCode = clampString(params.currencyCode, 4);
    if (safeAvatar) payload.avatarUrl = safeAvatar;

    if (!params.exists) {
      payload.uid = params.uid;
      payload.createdAt = serverTimestamp();
      await setDoc(ref, payload);
    } else {
      await updateDoc(ref, payload);
    }
  } catch (error) {
    handleFirestoreError(error, params.exists ? OperationType.UPDATE : OperationType.CREATE, path);
  }
}

export async function upsertUserPrivateContact(params: {
  uid: string;
  phone: string;
  streetAddress: string;
  exists: boolean;
}): Promise<void> {
  const path = `users/${params.uid}/private/contact`;
  const ref = doc(db, 'users', params.uid, 'private', 'contact');
  try {
    if (!params.exists) {
      await setDoc(ref, {
        uid: params.uid,
        phone: clampString(params.phone, 30),
        streetAddress: clampString(params.streetAddress, 180),
        updatedAt: serverTimestamp(),
      });
    } else {
      await updateDoc(ref, {
        phone: clampString(params.phone, 30),
        streetAddress: clampString(params.streetAddress, 180),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, params.exists ? OperationType.UPDATE : OperationType.CREATE, path);
  }
}

export async function upsertLoginRecord(params: {
  uid: string;
  displayName: string;
  email: string;
  emailVerified: boolean;
  phone?: string;
  accountType?: AccountCategory;
  organizationName?: string;
  role: MarketplaceRole;
  neighborhood: string;
  countryCode: string;
  isNewLogin?: boolean;
}): Promise<void> {
  if (!params.email || !params.emailVerified) return;

  const path = `login_records/${params.uid}`;
  const ref = doc(db, 'login_records', params.uid);
  const safeName = clampString(params.displayName, 60) || 'Member';
  const safeEmail = clampString(params.email, 120);
  const safeNeighborhood = clampString(params.neighborhood, 80) || 'Central District';
  const safeCountry = clampString(params.countryCode, 5) || 'US';

  try {
    const existingSnap = await getDoc(ref);
    const existingData = existingSnap.exists() ? (existingSnap.data() as LoginRecord) : null;

    const incomingPhone = clampString(params.phone || '', 30);
    const mergedPhone = incomingPhone || existingData?.phone || '';

    const incomingOrg = clampString(params.organizationName || '', 80);
    const mergedOrg = incomingOrg || existingData?.organizationName || '';

    const resolvedAccountType: AccountCategory =
      params.accountType ||
      (mergedOrg ? 'organization' : existingData?.accountType) ||
      (params.role === 'technician' ? 'technician' : 'customer');

    if (!existingSnap.exists()) {
      await setDoc(ref, {
        uid: params.uid,
        displayName: safeName.length >= 2 ? safeName : 'Member',
        email: safeEmail,
        emailVerified: true,
        phone: mergedPhone,
        accountType: resolvedAccountType,
        organizationName: mergedOrg,
        role: params.role,
        neighborhood: safeNeighborhood,
        countryCode: safeCountry,
        loginCount: 1,
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      const prevCount = Number(existingData?.loginCount || 1);
      const nextCount = params.isNewLogin ? prevCount + 1 : Math.max(1, prevCount);
      const updatePayload: Record<string, unknown> = {
        displayName: safeName.length >= 2 ? safeName : existingData?.displayName || 'Member',
        email: safeEmail,
        emailVerified: true,
        phone: mergedPhone,
        accountType: resolvedAccountType,
        organizationName: mergedOrg,
        role: params.role,
        neighborhood: safeNeighborhood,
        countryCode: safeCountry,
        loginCount: nextCount,
        updatedAt: serverTimestamp(),
      };
      if (params.isNewLogin) {
        updatePayload.lastLoginAt = serverTimestamp();
      }
      await updateDoc(ref, updatePayload);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// ---------------------------------------------------------------------------
// Technician Profile
// ---------------------------------------------------------------------------
export async function fetchMyTechnicianProfile(uid: string): Promise<TechnicianProfile | null> {
  const path = `technicians/${uid}`;
  try {
    const snap = await getDoc(doc(db, 'technicians', uid));
    return snap.exists() ? (snap.data() as TechnicianProfile) : null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function upsertTechnicianProfile(params: {
  uid: string;
  displayName: string;
  neighborhood: string;
  countryCode: string;
  currencyCode: string;
  specialties: string[];
  acceptedPayments: PaymentMethod[];
  spokenLanguages: string[];
  bio: string;
  visitFee: number;
  responseTimeMins: number;
  isAvailable: boolean;
  isPublic: boolean;
  avatarUrl?: string;
  phoneVerified?: boolean;
  verificationStatus?: VerificationStatus;
  idType?: string;
  idLast4?: string;
  yearsExperience?: number;
  serviceRadiusKm?: number;
  exists: boolean;
}): Promise<void> {
  const path = `technicians/${params.uid}`;
  const ref = doc(db, 'technicians', params.uid);
  const cleanSpecialties = params.specialties
    .map((s) => clampString(s, 60))
    .filter((s) => s.length >= 2)
    .slice(0, 12);
  const safeSpecialties = cleanSpecialties.length > 0 ? cleanSpecialties : ['Home Wiring & Inverter'];
  const safePayments: PaymentMethod[] =
    params.acceptedPayments.length > 0 ? params.acceptedPayments.slice(0, 6) : ['cash'];
  const safeLangs = params.spokenLanguages
    .map((l) => clampString(l, 30))
    .filter((l) => l.length >= 2)
    .slice(0, 6);
  const safeName = clampString(params.displayName, 60);
  const safeNeighborhood = clampString(params.neighborhood, 80);
  const safeAvatar = params.avatarUrl ? clampString(params.avatarUrl, 500) : '';

  // Prevent self-escalation to 'verified' from owner writes
  const safeVerification: VerificationStatus =
    params.verificationStatus === 'verified' && params.exists
      ? 'verified'
      : params.verificationStatus === 'pending'
        ? 'pending'
        : 'unverified';

  try {
    const payload: Record<string, unknown> = {
      displayName: safeName.length >= 2 ? safeName : 'Technician',
      neighborhood: safeNeighborhood.length >= 2 ? safeNeighborhood : 'Central District',
      countryCode: clampString(params.countryCode, 5) || 'US',
      currencyCode: clampString(params.currencyCode, 4) || 'USD',
      specialties: safeSpecialties,
      acceptedPayments: safePayments,
      bio: clampString(params.bio, 400),
      visitFee: clampNumber(params.visitFee, 0, 10000000),
      responseTimeMins: clampNumber(params.responseTimeMins, 5, 240),
      isAvailable: Boolean(params.isAvailable),
      isPublic: Boolean(params.isPublic),
      phoneVerified: Boolean(params.phoneVerified),
      verificationStatus: safeVerification,
      idType: clampString(params.idType || '', 40),
      idLast4: clampString(params.idLast4 || '', 10),
      yearsExperience: clampNumber(params.yearsExperience ?? 2, 0, 60),
      serviceRadiusKm: clampNumber(params.serviceRadiusKm ?? 10, 1, 100),
      updatedAt: serverTimestamp(),
    };
    if (safeLangs.length > 0) {
      payload.spokenLanguages = safeLangs;
    }
    if (safeAvatar) {
      payload.avatarUrl = safeAvatar;
    }

    if (!params.exists) {
      payload.uid = params.uid;
      payload.ratingAvg = 0;
      payload.completedJobsCount = 0;
      if (payload.verificationStatus === 'verified') {
        payload.verificationStatus = 'pending';
      }
      payload.createdAt = serverTimestamp();
      await setDoc(ref, payload);
    } else {
      await updateDoc(ref, payload);
    }
  } catch (error) {
    handleFirestoreError(error, params.exists ? OperationType.UPDATE : OperationType.CREATE, path);
  }
}

export async function toggleTechnicianDuty(uid: string, isAvailable: boolean): Promise<void> {
  const path = `technicians/${uid}`;
  try {
    await updateDoc(doc(db, 'technicians', uid), {
      isAvailable,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// ---------------------------------------------------------------------------
// Notifications Helper
// ---------------------------------------------------------------------------
export async function createNotification(params: {
  recipientId: string;
  senderId: string;
  jobId?: string;
  title: string;
  body: string;
  type: NotificationType;
}): Promise<void> {
  if (!params.recipientId || params.recipientId.startsWith('sample-')) return;
  const notifId = generateId('notif');
  const path = `notifications/${notifId}`;
  try {
    await setDoc(doc(db, 'notifications', notifId), {
      recipientId: params.recipientId,
      senderId: params.senderId,
      jobId: clampString(params.jobId || '', 128),
      title: clampString(params.title, 100) || 'Update',
      body: clampString(params.body, 250) || 'New update on Your Need.',
      type: params.type,
      read: false,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function markNotificationRead(notifId: string): Promise<void> {
  const path = `notifications/${notifId}`;
  try {
    await updateDoc(doc(db, 'notifications', notifId), {
      read: true,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function markAllNotificationsRead(notifIds: string[]): Promise<void> {
  const uniqueIds = Array.from(new Set(notifIds.filter((id) => Boolean(id) && !id.startsWith('local_'))));
  if (uniqueIds.length === 0) return;

  try {
    for (let i = 0; i < uniqueIds.length; i += 450) {
      const batch = writeBatch(db);
      const chunk = uniqueIds.slice(i, i + 450);
      for (const notifId of chunk) {
        batch.update(doc(db, 'notifications', notifId), { read: true });
      }
      await batch.commit();
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, 'notifications/batch');
  }
}

// ---------------------------------------------------------------------------
// Repair Jobs & Isolated Contacts
// ---------------------------------------------------------------------------
export async function createRepairJobWithContact(params: {
  customerId: string;
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
  targetTechnicianId?: string;
  mediaUrl?: string;
  mediaType?: 'none' | 'image' | 'video';
  mediaLabel?: string;
  phone: string;
  streetAddress: string;
  accessNote: string;
}): Promise<string> {
  const jobId = generateId('job');
  const jobPath = `repair_jobs/${jobId}`;
  const contactPath = `repair_jobs/${jobId}/private/contact`;

  const safeTitle = clampString(params.issueTitle, 100);
  const safeDesc = clampString(params.issueDescription, 500);
  const safeName = clampString(params.customerName, 60);
  const safeNeighborhood = clampString(params.neighborhood, 80);
  const safeSlot = clampString(params.preferredSlot, 60);
  const safeMediaUrl =
    params.mediaUrl && params.mediaUrl.length <= 240000 ? params.mediaUrl : '';
  const safeMediaType: 'none' | 'image' | 'video' =
    safeMediaUrl && params.mediaType ? params.mediaType : 'none';

  const batch = writeBatch(db);
  batch.set(doc(db, 'repair_jobs', jobId), {
    customerId: params.customerId,
    customerName: safeName.length >= 2 ? safeName : 'Homeowner',
    neighborhood: safeNeighborhood.length >= 2 ? safeNeighborhood : 'Local Area',
    countryCode: clampString(params.countryCode, 5) || 'US',
    currencyCode: clampString(params.currencyCode, 4) || 'USD',
    applianceCategory: params.applianceCategory,
    issueTitle: safeTitle.length >= 4 ? safeTitle : 'Home Repair Request',
    issueDescription: safeDesc.length >= 5 ? safeDesc : 'Needs inspection and repair.',
    urgency: params.urgency,
    preferredSlot: safeSlot.length >= 2 ? safeSlot : 'Today',
    estimatedBudget: clampNumber(params.estimatedBudget, 0, 10000000),
    inspectionFee: clampNumber(params.inspectionFee, 0, 10000000),
    priceApproved: false,
    paymentMethod: params.paymentMethod,
    paymentStatus: 'pending',
    status: 'open',
    targetTechnicianId: params.targetTechnicianId ? clampString(params.targetTechnicianId, 128) : '',
    technicianId: '',
    technicianName: '',
    technicianEta: '',
    quotedFee: 0,
    mediaUrl: safeMediaUrl,
    mediaType: safeMediaType,
    mediaLabel: clampString(params.mediaLabel || '', 120),
    workSummary: '',
    partsReplaced: '',
    warrantyDays: 0,
    cancellationReason: '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  const safePhone = clampString(params.phone, 30);
  const safeAddress = clampString(params.streetAddress, 180);
  batch.set(doc(db, 'repair_jobs', jobId, 'private', 'contact'), {
    customerId: params.customerId,
    phone: safePhone.length >= 5 ? safePhone : 'Provided in chat',
    streetAddress: safeAddress.length >= 5 ? safeAddress : safeNeighborhood,
    accessNote: clampString(params.accessNote, 200),
    updatedAt: serverTimestamp(),
  });

  try {
    await batch.commit();
    if (params.targetTechnicianId) {
      await createNotification({
        recipientId: params.targetTechnicianId,
        senderId: params.customerId,
        jobId,
        title: 'New Direct Repair Request',
        body: `${safeName} requested ${safeTitle} in ${safeNeighborhood}.`,
        type: 'booking',
      });
    }
    return jobId;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${jobPath} & ${contactPath}`);
  }
}

export async function cancelRepairJob(
  jobId: string,
  reason = 'Cancelled by customer',
  notifyMeta?: { customerId: string; technicianId?: string; issueTitle?: string }
): Promise<void> {
  const path = `repair_jobs/${jobId}`;
  try {
    await updateDoc(doc(db, 'repair_jobs', jobId), {
      status: 'cancelled',
      cancellationReason: clampString(reason, 200),
      updatedAt: serverTimestamp(),
    });
    if (notifyMeta?.technicianId && notifyMeta.customerId) {
      await createNotification({
        recipientId: notifyMeta.technicianId,
        senderId: notifyMeta.customerId,
        jobId,
        title: 'Repair Booking Cancelled',
        body: `Customer cancelled "${notifyMeta.issueTitle || 'repair request'}": ${clampString(reason, 120)}`,
        type: 'status',
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function rejectRepairJob(params: {
  job: RepairJob;
  technicianId: string;
  reason?: string;
}): Promise<void> {
  const path = `repair_jobs/${params.job.id}`;
  try {
    await updateDoc(doc(db, 'repair_jobs', params.job.id), {
      status: 'rejected',
      cancellationReason: clampString(params.reason || 'Technician unavailable for this slot', 200),
      updatedAt: serverTimestamp(),
    });
    await createNotification({
      recipientId: params.job.customerId,
      senderId: params.technicianId,
      jobId: params.job.id,
      title: 'Request Declined — Re-open to Nearby Pros',
      body: `The selected technician declined "${params.job.issueTitle}". You can broadcast it to all nearby pros.`,
      type: 'status',
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function reopenRejectedJob(jobId: string): Promise<void> {
  const path = `repair_jobs/${jobId}`;
  try {
    await updateDoc(doc(db, 'repair_jobs', jobId), {
      status: 'open',
      targetTechnicianId: '',
      cancellationReason: '',
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function acceptRepairJob(params: {
  jobId: string;
  customerId: string;
  issueTitle: string;
  technicianId: string;
  technicianName: string;
  technicianEta: string;
  quotedFee: number;
  inspectionFee?: number;
  technicianPhone?: string;
}): Promise<void> {
  const path = `repair_jobs/${params.jobId}`;
  try {
    await updateDoc(doc(db, 'repair_jobs', params.jobId), {
      status: 'accepted',
      technicianId: params.technicianId,
      technicianName: clampString(params.technicianName, 60) || 'Technician',
      technicianEta: clampString(params.technicianEta, 60) || '45 mins',
      quotedFee: clampNumber(params.quotedFee, 0, 10000000),
      inspectionFee: clampNumber(params.inspectionFee ?? 0, 0, 10000000),
      priceApproved: false,
      updatedAt: serverTimestamp(),
    });
    await createNotification({
      recipientId: params.customerId,
      senderId: params.technicianId,
      jobId: params.jobId,
      title: 'Technician Accepted Your Request',
      body: `${params.technicianName} accepted "${params.issueTitle}" (ETA ${params.technicianEta}). Please review and approve the quote.`,
      type: 'booking',
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }

  const safePhone = params.technicianPhone ? clampString(params.technicianPhone, 30) : '';
  if (safePhone.length >= 5) {
    const techContactPath = `repair_jobs/${params.jobId}/private/tech_contact`;
    try {
      await setDoc(doc(db, 'repair_jobs', params.jobId, 'private', 'tech_contact'), {
        technicianId: params.technicianId,
        phone: safePhone,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, techContactPath);
    }
  }
}

export async function approveJobQuote(params: {
  jobId: string;
  customerId: string;
  technicianId: string;
  issueTitle: string;
}): Promise<void> {
  const path = `repair_jobs/${params.jobId}`;
  try {
    await updateDoc(doc(db, 'repair_jobs', params.jobId), {
      priceApproved: true,
      updatedAt: serverTimestamp(),
    });
    if (params.technicianId) {
      await createNotification({
        recipientId: params.technicianId,
        senderId: params.customerId,
        jobId: params.jobId,
        title: 'Final Price Approved',
        body: `Customer approved the quoted price for "${params.issueTitle}". You may begin repair.`,
        type: 'quote',
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function advanceRepairJobStatus(params: {
  job: RepairJob;
  nextStatus: Extract<JobStatus, 'accepted' | 'en_route' | 'arrived' | 'in_progress' | 'completed'>;
  technicianEta: string;
  quotedFee: number;
  inspectionFee: number;
  priceApproved: boolean;
  paymentStatus: PaymentStatus;
  workSummary?: string;
  partsReplaced?: string;
  warrantyDays?: number;
}): Promise<void> {
  const path = `repair_jobs/${params.job.id}`;
  const quoteChanged = clampNumber(params.quotedFee, 0, 10000000) !== params.job.quotedFee;
  try {
    await updateDoc(doc(db, 'repair_jobs', params.job.id), {
      status: params.nextStatus,
      technicianEta: clampString(params.technicianEta, 60),
      quotedFee: clampNumber(params.quotedFee, 0, 10000000),
      inspectionFee: clampNumber(params.inspectionFee, 0, 10000000),
      priceApproved: quoteChanged ? false : Boolean(params.priceApproved),
      paymentStatus: params.paymentStatus,
      workSummary: clampString(params.workSummary ?? params.job.workSummary ?? '', 400),
      partsReplaced: clampString(params.partsReplaced ?? params.job.partsReplaced ?? '', 250),
      warrantyDays: clampNumber(params.warrantyDays ?? params.job.warrantyDays ?? 0, 0, 1825),
      updatedAt: serverTimestamp(),
    });

    const statusTitles: Record<string, string> = {
      accepted: 'Quote Updated',
      en_route: 'Technician Is Travelling',
      arrived: 'Technician Has Arrived',
      in_progress: 'Service Started',
      completed: 'Work Completed & Invoice Ready',
    };
    await createNotification({
      recipientId: params.job.customerId,
      senderId: params.job.technicianId,
      jobId: params.job.id,
      title: statusTitles[params.nextStatus] || 'Job Status Updated',
      body: `${params.job.technicianName} updated "${params.job.issueTitle}" to ${statusTitles[params.nextStatus] || params.nextStatus}.`,
      type: 'status',
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function settleJobPayment(params: {
  job: RepairJob;
  paymentMethod: PaymentMethod;
}): Promise<void> {
  const path = `repair_jobs/${params.job.id}`;
  try {
    await updateDoc(doc(db, 'repair_jobs', params.job.id), {
      paymentMethod: params.paymentMethod,
      paymentStatus: 'paid',
      updatedAt: serverTimestamp(),
    });
    if (params.job.technicianId) {
      await createNotification({
        recipientId: params.job.technicianId,
        senderId: params.job.customerId,
        jobId: params.job.id,
        title: 'Payment Confirmed',
        body: `Customer settled payment for "${params.job.issueTitle}".`,
        type: 'payment',
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function fetchJobPrivateContact(jobId: string): Promise<JobPrivateContact | null> {
  const path = `repair_jobs/${jobId}/private/contact`;
  try {
    const snap = await getDoc(doc(db, 'repair_jobs', jobId, 'private', 'contact'));
    return snap.exists() ? (snap.data() as JobPrivateContact) : null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function fetchJobTechPrivateContact(
  jobId: string
): Promise<JobTechPrivateContact | null> {
  const path = `repair_jobs/${jobId}/private/tech_contact`;
  try {
    const snap = await getDoc(doc(db, 'repair_jobs', jobId, 'private', 'tech_contact'));
    return snap.exists() ? (snap.data() as JobTechPrivateContact) : null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

// ---------------------------------------------------------------------------
// Messages, Reviews & Reports
// ---------------------------------------------------------------------------
export async function sendJobMessage(params: {
  jobId: string;
  senderId: string;
  senderName: string;
  senderRole: 'customer' | 'technician';
  customerId: string;
  technicianId: string;
  text: string;
}): Promise<void> {
  const msgId = generateId('msg');
  const path = `repair_jobs/${params.jobId}/messages/${msgId}`;
  const cleanText = clampString(params.text, 500);
  if (!cleanText) return;

  try {
    await setDoc(doc(db, 'repair_jobs', params.jobId, 'messages', msgId), {
      senderId: params.senderId,
      senderName: clampString(params.senderName, 60) || 'Member',
      senderRole: params.senderRole,
      customerId: params.customerId,
      technicianId: params.technicianId,
      text: cleanText,
      createdAt: serverTimestamp(),
    });
    const recipientId =
      params.senderRole === 'customer' ? params.technicianId : params.customerId;
    if (recipientId && recipientId !== params.senderId && !recipientId.startsWith('sample-')) {
      try {
        await createNotification({
          recipientId,
          senderId: params.senderId,
          jobId: params.jobId,
          title: `New Message from ${clampString(params.senderName, 40) || 'Member'}`,
          body: cleanText.slice(0, 160),
          type: 'system',
        });
      } catch {
        // Non-fatal if chat notification fails
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function submitJobReview(params: {
  jobId: string;
  customerId: string;
  customerName: string;
  technicianId: string;
  applianceCategory: ApplianceCategory;
  rating: number;
  comment: string;
}): Promise<void> {
  const path = `reviews/${params.jobId}`;
  const safeComment = clampString(params.comment, 400);
  try {
    await setDoc(doc(db, 'reviews', params.jobId), {
      jobId: params.jobId,
      customerId: params.customerId,
      customerName: clampString(params.customerName, 60) || 'Homeowner',
      technicianId: params.technicianId,
      applianceCategory: params.applianceCategory,
      rating: clampNumber(params.rating, 1, 5),
      comment: safeComment.length >= 2 ? safeComment : 'Completed cleanly.',
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function submitReportComplaint(params: {
  reporterId: string;
  reporterName: string;
  targetType: 'technician' | 'job' | 'user';
  targetId: string;
  targetName: string;
  reason: ReportReason;
  details: string;
}): Promise<string> {
  const reportId = generateId('rep');
  const path = `reports/${reportId}`;
  const safeDetails = clampString(params.details, 500);
  try {
    await setDoc(doc(db, 'reports', reportId), {
      reporterId: params.reporterId,
      reporterName: clampString(params.reporterName, 60) || 'Member',
      targetType: params.targetType,
      targetId: clampString(params.targetId, 128) || 'unknown',
      targetName: clampString(params.targetName, 80) || 'Account',
      reason: params.reason,
      details: safeDetails.length >= 5 ? safeDetails : 'Submitted for safety & pricing review.',
      status: 'open',
      adminNote: '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return reportId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}
