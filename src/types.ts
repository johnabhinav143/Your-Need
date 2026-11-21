export type ApplianceCategory =
  | 'fan'
  | 'ac'
  | 'fridge'
  | 'washing_machine'
  | 'electrical'
  | 'microwave'
  | 'geyser'
  | 'tv_electronics'
  | 'water_purifier'
  | 'plumbing'
  | 'carpentry'
  | 'other';

export type PaymentMethod =
  | 'cash'
  | 'upi_qr'
  | 'card'
  | 'bank_transfer'
  | 'wallet';

export type PaymentStatus = 'pending' | 'paid';

export type JobUrgency = 'urgent_today' | 'within_24h' | 'flexible';

export type JobStatus =
  | 'open'
  | 'accepted'
  | 'en_route'
  | 'arrived'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'rejected';

export type MarketplaceRole = 'customer' | 'technician' | 'both';

export type ActiveRoleView = 'customer' | 'technician' | 'admin';

export type MobileTab = 'discover' | 'requests' | 'workbench' | 'account';

export type AppScreen =
  | 'home'
  | 'technician_dashboard'
  | 'explore'
  | 'service_detail'
  | 'booking'
  | 'bookings'
  | 'messages'
  | 'profile'
  | 'settings'
  | 'auth';

export type VerificationStatus = 'unverified' | 'pending' | 'verified';

export type ReportReason =
  | 'suspicious_account'
  | 'pricing_dispute'
  | 'poor_quality'
  | 'no_show'
  | 'safety_concern'
  | 'other';

export type ReportStatus = 'open' | 'investigating' | 'resolved' | 'dismissed';

export type NotificationType = 'booking' | 'status' | 'quote' | 'payment' | 'system';

export interface UserProfile {
  uid: string;
  displayName: string;
  role: MarketplaceRole;
  neighborhood: string;
  countryCode?: string;
  currencyCode?: string;
  avatarUrl?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface UserPrivateContact {
  uid: string;
  phone: string;
  streetAddress: string;
  updatedAt?: unknown;
}

export type AccountCategory = 'customer' | 'technician' | 'organization';

export interface LoginIntentMeta {
  preferredRole?: 'customer' | 'technician';
  accountType?: AccountCategory;
  phone?: string;
  organizationName?: string;
}

export interface LoginRecord {
  uid: string;
  displayName: string;
  email: string;
  emailVerified: boolean;
  phone: string;
  accountType: AccountCategory;
  organizationName: string;
  role: MarketplaceRole;
  neighborhood: string;
  countryCode: string;
  loginCount: number;
  createdAt?: unknown;
  lastLoginAt?: unknown;
  updatedAt?: unknown;
}

export interface TechnicianProfile {
  uid: string;
  displayName: string;
  neighborhood: string;
  countryCode: string;
  currencyCode: string;
  specialties: string[];
  acceptedPayments: PaymentMethod[];
  spokenLanguages?: string[];
  bio: string;
  visitFee: number;
  responseTimeMins: number;
  isAvailable: boolean;
  isPublic: boolean;
  ratingAvg: number;
  completedJobsCount: number;
  avatarUrl?: string;
  phoneVerified?: boolean;
  verificationStatus?: VerificationStatus;
  idType?: string;
  idLast4?: string;
  yearsExperience?: number;
  serviceRadiusKm?: number;
  createdAt?: unknown;
  updatedAt?: unknown;
  isSample?: boolean;
}

export interface RepairJob {
  id: string;
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
  inspectionFee?: number;
  priceApproved?: boolean;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: JobStatus;
  targetTechnicianId: string;
  technicianId: string;
  technicianName: string;
  technicianEta: string;
  quotedFee: number;
  mediaUrl?: string;
  mediaType?: 'none' | 'image' | 'video';
  mediaLabel?: string;
  workSummary?: string;
  partsReplaced?: string;
  warrantyDays?: number;
  cancellationReason?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
  isSample?: boolean;
}

export interface JobPrivateContact {
  customerId: string;
  phone: string;
  streetAddress: string;
  accessNote: string;
  updatedAt?: unknown;
}

export interface JobTechPrivateContact {
  technicianId: string;
  phone: string;
  updatedAt?: unknown;
}

export interface JobMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'customer' | 'technician';
  customerId: string;
  technicianId: string;
  text: string;
  createdAt?: unknown;
}

export interface Review {
  id: string;
  jobId: string;
  customerId: string;
  customerName: string;
  technicianId: string;
  applianceCategory: ApplianceCategory;
  rating: number;
  comment: string;
  createdAt?: unknown;
}

export interface ReportComplaint {
  id: string;
  reporterId: string;
  reporterName: string;
  targetType: 'technician' | 'job' | 'user';
  targetId: string;
  targetName: string;
  reason: ReportReason;
  details: string;
  status: ReportStatus;
  adminNote: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface AppNotification {
  id: string;
  recipientId: string;
  senderId: string;
  jobId: string;
  title: string;
  body: string;
  type: NotificationType;
  read: boolean;
  createdAt?: unknown;
}

export interface AiBookingDraft {
  category: ApplianceCategory;
  issueTitle: string;
  issueDescription: string;
  urgency: JobUrgency;
}
