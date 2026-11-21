import {
  ApplianceCategory,
  JobStatus,
  JobUrgency,
  PaymentMethod,
  RepairJob,
  ReportReason,
  Review,
  TechnicianProfile,
  VerificationStatus,
} from './types';

export const ADMIN_EMAIL = 'johnabhinav143@gmail.com';

export const HERO_IMAGE_URL = '/src/assets/images/hero_appliance_technician_1795149800717.jpg';

export const REPAIR_IMAGE_FAN = '/src/assets/images/repair_fan_electrical_1795155023508.jpg';
export const REPAIR_IMAGE_AC = '/src/assets/images/repair_ac_cooling_1795155023606.jpg';
export const REPAIR_IMAGE_FRIDGE = '/src/assets/images/repair_fridge_kitchen_1795155023652.jpg';
export const REPAIR_IMAGE_WASHER = '/src/assets/images/repair_plumbing_washer_1795155023226.jpg';

export const CATEGORY_EXAMPLE_IMAGES: Record<ApplianceCategory, string> = {
  fan: REPAIR_IMAGE_FAN,
  electrical: REPAIR_IMAGE_FAN,
  ac: REPAIR_IMAGE_AC,
  fridge: REPAIR_IMAGE_FRIDGE,
  microwave: REPAIR_IMAGE_FRIDGE,
  water_purifier: REPAIR_IMAGE_FRIDGE,
  washing_machine: REPAIR_IMAGE_WASHER,
  plumbing: REPAIR_IMAGE_WASHER,
  geyser: REPAIR_IMAGE_WASHER,
  tv_electronics: HERO_IMAGE_URL,
  carpentry: HERO_IMAGE_URL,
  other: HERO_IMAGE_URL,
};

export const CATEGORY_INSPECTION_USD: Record<ApplianceCategory, number> = {
  fan: 10,
  ac: 18,
  fridge: 16,
  washing_machine: 15,
  electrical: 14,
  microwave: 14,
  geyser: 15,
  tv_electronics: 18,
  water_purifier: 12,
  plumbing: 14,
  carpentry: 12,
  other: 12,
};

export interface RegionalRepairExample {
  id: string;
  category: ApplianceCategory;
  title: string;
  area: string;
  imageUrl: string;
  etaLabel: string;
  baseUsdCost: number;
}

export interface RegionShowcase {
  heroImage: string;
  heroCaption: string;
  neighborhoods: [string, string, string];
  examples: RegionalRepairExample[];
}

const COUNTRY_NEIGHBORHOODS: Record<string, [string, string, string]> = {
  IN: ['Indiranagar, Bengaluru', 'Bandra West, Mumbai', 'Madhapur, Hyderabad'],
  US: ['Midtown Central', 'Riverside Heights', 'West Park'],
  GB: ['Camden Town, London', 'Didsbury, Manchester', 'Stockbridge, Edinburgh'],
  AE: ['Dubai Marina', 'Al Reem Island, Abu Dhabi', 'Jumeirah Lakes'],
  SA: ['Al Olaya, Riyadh', 'Al Hamra, Jeddah', 'Corniche, Khobar'],
  DE: ['Mitte, Berlin', 'Schwabing, Munich', 'Eimsbüttel, Hamburg'],
  FR: ['Le Marais, Paris', 'Presqu’île, Lyon', 'Castellane, Marseille'],
  ES: ['Salamanca, Madrid', 'Eixample, Barcelona', 'Triana, Seville'],
  IT: ['Brera, Milan', 'Prati, Rome', 'Chiaia, Naples'],
  JP: ['Shibuya, Tokyo', 'Namba, Osaka', 'Tenjin, Fukuoka'],
  KR: ['Gangnam, Seoul', 'Haeundae, Busan', 'Yeonnam, Seoul'],
  SG: ['Tanjong Pagar', 'Tampines Central', 'Holland Village'],
  AU: ['Surry Hills, Sydney', 'Fitzroy, Melbourne', 'New Farm, Brisbane'],
  CA: ['Queen West, Toronto', 'Kitsilano, Vancouver', 'Plateau, Montreal'],
  BR: ['Pinheiros, São Paulo', 'Copacabana, Rio', 'Savassi, Belo Horizonte'],
  MX: ['Roma Norte, CDMX', 'Providencia, Guadalajara', 'San Pedro, Monterrey'],
  NG: ['Victoria Island, Lagos', 'Wuse II, Abuja', 'GRA, Port Harcourt'],
  KE: ['Kilimani, Nairobi', 'Westlands, Nairobi', 'Nyali, Mombasa'],
  ZA: ['Sandton, Johannesburg', 'Sea Point, Cape Town', 'Umhlanga, Durban'],
  BD: ['Gulshan, Dhaka', 'Dhanmondi, Dhaka', 'Agrabad, Chattogram'],
  PK: ['DHA, Lahore', 'Clifton, Karachi', 'F-7, Islamabad'],
  ID: ['Kemang, Jakarta', 'Seminyak, Bali', 'Dago, Bandung'],
  PH: ['BGC, Manila', 'Makati Central', 'IT Park, Cebu'],
  TR: ['Kadıköy, Istanbul', 'Çankaya, Ankara', 'Alsancak, İzmir'],
  EG: ['Zamalek, Cairo', 'Maadi, Cairo', 'Smouha, Alexandria'],
};

const HOT_CLIMATE_CODES = new Set(['IN', 'AE', 'SA', 'QA', 'KW', 'OM', 'BH', 'EG', 'SG', 'MY', 'ID', 'PH', 'TH', 'VN', 'PK', 'BD', 'LK', 'NG']);
const COOL_EURO_CODES = new Set(['GB', 'DE', 'FR', 'IT', 'ES', 'NL', 'CH', 'SE', 'NO', 'DK', 'PL', 'IE', 'BE', 'AT', 'RU', 'UA']);

export function getRegionShowcase(countryCode: string, countryName: string): RegionShowcase {
  const code = countryCode.toUpperCase();
  const neighborhoods = COUNTRY_NEIGHBORHOODS[code] || [
    `Central ${countryName}`,
    `Metro District, ${countryName}`,
    `Parkside, ${countryName}`,
  ];

  const isHotClimate = HOT_CLIMATE_CODES.has(code);
  const isEuro = COOL_EURO_CODES.has(code);

  const heroImage = isHotClimate
    ? code === 'IN' || code === 'BD' || code === 'PK' || code === 'LK'
      ? REPAIR_IMAGE_FAN
      : REPAIR_IMAGE_AC
    : isEuro
      ? REPAIR_IMAGE_WASHER
      : HERO_IMAGE_URL;

  const heroCaption = isHotClimate
    ? `Fast fan, AC cooling & electrical fixes across ${countryName}`
    : isEuro
      ? `Certified washer, kitchen & home appliance repairs across ${countryName}`
      : `Verified neighborhood appliance & home repair specialists in ${countryName}`;

  const examples: RegionalRepairExample[] = isHotClimate
    ? [
        {
          id: `${code}-ex-1`,
          category: 'fan',
          title: 'Ceiling fan capacitor & speed regulator fix',
          area: neighborhoods[0],
          imageUrl: REPAIR_IMAGE_FAN,
          etaLabel: '~25 min arrival',
          baseUsdCost: 18,
        },
        {
          id: `${code}-ex-2`,
          category: 'ac',
          title: 'Split AC deep jet wash & refrigerant check',
          area: neighborhoods[1],
          imageUrl: REPAIR_IMAGE_AC,
          etaLabel: '~35 min arrival',
          baseUsdCost: 45,
        },
        {
          id: `${code}-ex-3`,
          category: 'fridge',
          title: 'Double-door fridge cooling & thermostat repair',
          area: neighborhoods[2],
          imageUrl: REPAIR_IMAGE_FRIDGE,
          etaLabel: '~40 min arrival',
          baseUsdCost: 35,
        },
        {
          id: `${code}-ex-4`,
          category: 'washing_machine',
          title: 'Front-load washer drain pump & valve service',
          area: neighborhoods[0],
          imageUrl: REPAIR_IMAGE_WASHER,
          etaLabel: '~45 min arrival',
          baseUsdCost: 30,
        },
      ]
    : [
        {
          id: `${code}-ex-1`,
          category: 'washing_machine',
          title: 'Washer spin bearing & water inlet valve fix',
          area: neighborhoods[0],
          imageUrl: REPAIR_IMAGE_WASHER,
          etaLabel: '~30 min arrival',
          baseUsdCost: 45,
        },
        {
          id: `${code}-ex-2`,
          category: 'fridge',
          title: 'Stainless fridge compressor & seal diagnostic',
          area: neighborhoods[1],
          imageUrl: REPAIR_IMAGE_FRIDGE,
          etaLabel: '~35 min arrival',
          baseUsdCost: 55,
        },
        {
          id: `${code}-ex-3`,
          category: 'ac',
          title: 'Climate split AC airflow & leak service',
          area: neighborhoods[2],
          imageUrl: REPAIR_IMAGE_AC,
          etaLabel: '~40 min arrival',
          baseUsdCost: 60,
        },
        {
          id: `${code}-ex-4`,
          category: 'fan',
          title: 'Ceiling fan motor balance & wall switch wiring',
          area: neighborhoods[0],
          imageUrl: REPAIR_IMAGE_FAN,
          etaLabel: '~25 min arrival',
          baseUsdCost: 35,
        },
      ];

  return {
    heroImage,
    heroCaption,
    neighborhoods,
    examples,
  };
}

export const CATEGORY_OPTIONS: {
  id: ApplianceCategory;
  label: string;
  shortLabel: string;
  typicalIssue: string;
}[] = [
  { id: 'fan', label: 'Ceiling & Exhaust Fans', shortLabel: 'Fans', typicalIssue: 'Slow spin, humming, capacitor swap' },
  { id: 'ac', label: 'Air Conditioner (AC)', shortLabel: 'AC', typicalIssue: 'Low cooling, water leak, gas refill' },
  { id: 'fridge', label: 'Refrigerator & Freezer', shortLabel: 'Fridge', typicalIssue: 'Not cooling, compressor click, frost' },
  { id: 'washing_machine', label: 'Washing Machine & Dryer', shortLabel: 'Washer', typicalIssue: 'Drain jam, spin vibration, drum lock' },
  { id: 'electrical', label: 'Home Wiring & Inverter', shortLabel: 'Wiring', typicalIssue: 'Tripping breaker, burnt socket, UPS' },
  { id: 'microwave', label: 'Microwave, Oven & Chimney', shortLabel: 'Kitchen', typicalIssue: 'Not heating, chimney motor, igniter' },
  { id: 'geyser', label: 'Water Heater / Geyser', shortLabel: 'Geyser', typicalIssue: 'No hot water, thermostat trip, leak' },
  { id: 'tv_electronics', label: 'TV, Audio & Smart Home', shortLabel: 'TV & Tech', typicalIssue: 'No display, wall mount, Wi-Fi setup' },
  { id: 'water_purifier', label: 'RO Water Purifier', shortLabel: 'RO Filter', typicalIssue: 'Low flow, filter change, TDS check' },
  { id: 'plumbing', label: 'Plumbing & Water Pump', shortLabel: 'Plumbing', typicalIssue: 'Pipe leak, tap valve, motor pump' },
  { id: 'carpentry', label: 'Doors, Locks & Furniture', shortLabel: 'Carpentry', typicalIssue: 'Hinges, smart lock, cabinet repair' },
  { id: 'other', label: 'All Other Home Repairs', shortLabel: 'Other', typicalIssue: 'Mixer, iron, vacuum, custom fix' },
];

export const CATEGORY_MAP: Record<ApplianceCategory, string> = CATEGORY_OPTIONS.reduce(
  (acc, item) => ({ ...acc, [item.id]: item.label }),
  {} as Record<ApplianceCategory, string>
);

export const CATEGORY_SHORT_MAP: Record<ApplianceCategory, string> = CATEGORY_OPTIONS.reduce(
  (acc, item) => ({ ...acc, [item.id]: item.shortLabel }),
  {} as Record<ApplianceCategory, string>
);

export const PAYMENT_METHOD_OPTIONS: {
  id: PaymentMethod;
  label: string;
  shortLabel: string;
  description: string;
}[] = [
  { id: 'cash', label: 'Cash on Completion', shortLabel: 'Cash', description: 'Pay directly after testing repair' },
  { id: 'upi_qr', label: 'UPI / Instant QR Pay', shortLabel: 'UPI / QR', description: 'Scan technician QR on site' },
  { id: 'card', label: 'Credit or Debit Card', shortLabel: 'Card', description: 'Tap or card terminal' },
  { id: 'bank_transfer', label: 'Bank Transfer (IBAN / NEFT)', shortLabel: 'Bank', description: 'Direct local bank transfer' },
  { id: 'wallet', label: 'Mobile Wallet (Apple / Google Pay)', shortLabel: 'Wallet', description: 'Digital wallet checkout' },
];

export const PAYMENT_METHOD_MAP: Record<PaymentMethod, string> = PAYMENT_METHOD_OPTIONS.reduce(
  (acc, item) => ({ ...acc, [item.id]: item.shortLabel }),
  {} as Record<PaymentMethod, string>
);

export const URGENCY_LABELS: Record<JobUrgency, string> = {
  urgent_today: 'Priority Urgent Today',
  within_24h: 'Within 24 hours',
  flexible: 'Flexible schedule',
};

export const STATUS_LABELS: Record<JobStatus, string> = {
  open: 'Open for technicians',
  accepted: 'Request accepted',
  en_route: 'Technician travelling',
  arrived: 'Technician arrived',
  in_progress: 'Service started',
  completed: 'Work completed',
  cancelled: 'Cancelled',
  rejected: 'Declined by technician',
};

export const VERIFICATION_LABELS: Record<VerificationStatus, string> = {
  verified: 'Verified Pro',
  pending: 'Verification Pending',
  unverified: 'Unverified',
};

export const REPORT_REASON_OPTIONS: { id: ReportReason; label: string }[] = [
  { id: 'suspicious_account', label: 'Suspicious or fake account' },
  { id: 'pricing_dispute', label: 'Overcharging / unclear pricing' },
  { id: 'poor_quality', label: 'Poor repair quality' },
  { id: 'no_show', label: 'Technician no-show or severe delay' },
  { id: 'safety_concern', label: 'Safety or misconduct concern' },
  { id: 'other', label: 'Other complaint' },
];

export const CANCELLATION_POLICY_TEXT =
  'Free cancellation anytime before the technician marks Travelling. Once arriving on site, an inspection/visiting fee may apply to cover technician travel.';

export const REFUND_DISPUTE_POLICY_TEXT =
  'Every completed job includes an itemized Digital Invoice and recorded payment status. Pricing or quality disputes can be filed directly for admin review and refund resolution.';

export const SAMPLE_TECHNICIANS: TechnicianProfile[] = [
  {
    uid: 'sample-tech-liam',
    displayName: 'Liam Carter',
    neighborhood: 'Central District',
    countryCode: 'US',
    currencyCode: 'USD',
    specialties: ['Air Conditioner (AC)', 'Ceiling & Exhaust Fans', 'Home Wiring & Inverter'],
    acceptedPayments: ['cash', 'card', 'wallet', 'bank_transfer'],
    spokenLanguages: ['English', 'Spanish'],
    bio: 'Licensed residential electrician and split-AC specialist. Carries fan capacitors, MCB breakers, and leak gauges on every call.',
    visitFee: 25,
    responseTimeMins: 25,
    isAvailable: true,
    isPublic: true,
    ratingAvg: 4.9,
    completedJobsCount: 142,
    phoneVerified: true,
    verificationStatus: 'verified',
    idType: 'Trade License',
    idLast4: '8421',
    yearsExperience: 8,
    serviceRadiusKm: 12,
    avatarUrl: '/src/assets/images/tech_avatar_arjun_1795149800368.jpg',
    isSample: true,
  },
  {
    uid: 'sample-tech-sarah',
    displayName: 'Sarah Patel',
    neighborhood: 'Riverside & Metro',
    countryCode: 'IN',
    currencyCode: 'USD',
    specialties: ['Refrigerator & Freezer', 'Microwave, Oven & Chimney', 'RO Water Purifier'],
    acceptedPayments: ['upi_qr', 'cash', 'card', 'wallet'],
    spokenLanguages: ['English', 'Hindi', 'Telugu'],
    bio: 'Cooling and kitchen appliance technician focused on fast same-day compressor diagnostics, thermostat swaps, and purifier servicing.',
    visitFee: 30,
    responseTimeMins: 35,
    isAvailable: true,
    isPublic: true,
    ratingAvg: 4.8,
    completedJobsCount: 98,
    phoneVerified: true,
    verificationStatus: 'verified',
    idType: 'National ID',
    idLast4: '3109',
    yearsExperience: 6,
    serviceRadiusKm: 10,
    avatarUrl: '/src/assets/images/tech_avatar_maria_1795149800187.jpg',
    isSample: true,
  },
  {
    uid: 'sample-tech-mark',
    displayName: 'Mark Alvarez',
    neighborhood: 'West Park & South',
    countryCode: 'GB',
    currencyCode: 'USD',
    specialties: ['Washing Machine & Dryer', 'Water Heater / Geyser', 'Plumbing & Water Pump'],
    acceptedPayments: ['cash', 'card', 'bank_transfer', 'wallet'],
    spokenLanguages: ['English', 'Portuguese'],
    bio: '12 years fixing front-load washers, water heaters, plumbing pumps, and home panels with clear upfront estimates.',
    visitFee: 20,
    responseTimeMins: 40,
    isAvailable: true,
    isPublic: true,
    ratingAvg: 4.9,
    completedJobsCount: 214,
    phoneVerified: true,
    verificationStatus: 'verified',
    idType: 'Trade Certificate',
    idLast4: '5510',
    yearsExperience: 12,
    serviceRadiusKm: 15,
    avatarUrl: '/src/assets/images/tech_avatar_david_1795149800834.jpg',
    isSample: true,
  },
];

export const SAMPLE_REVIEWS: Review[] = [
  {
    id: 'sample-rev-liam-1',
    jobId: 'sample-job-liam-1',
    customerId: 'sample-cust-101',
    customerName: 'Hannah M.',
    technicianId: 'sample-tech-liam',
    applianceCategory: 'ac',
    rating: 5,
    comment: 'Arrived in 20 minutes, fixed our split AC capacitor cleanly, and kept the final bill exact to the quote.',
    createdAt: '2026-11-20T18:30:00Z',
  },
  {
    id: 'sample-rev-liam-2',
    jobId: 'sample-job-liam-2',
    customerId: 'sample-cust-102',
    customerName: 'Owen T.',
    technicianId: 'sample-tech-liam',
    applianceCategory: 'fan',
    rating: 5,
    comment: 'Balanced two noisy bedroom ceiling fans and replaced a faulty regulator safely.',
    createdAt: '2026-11-12T10:00:00Z',
  },
  {
    id: 'sample-rev-sarah-1',
    jobId: 'sample-job-sarah-1',
    customerId: 'sample-cust-103',
    customerName: 'Rohan S.',
    technicianId: 'sample-tech-sarah',
    applianceCategory: 'fridge',
    rating: 5,
    comment: 'Diagnosed the fridge thermostat fault right away, showed the sealed part before fitting, and verified cooling.',
    createdAt: '2026-11-20T14:15:00Z',
  },
  {
    id: 'sample-rev-mark-1',
    jobId: 'sample-job-mark-1',
    customerId: 'sample-cust-104',
    customerName: 'Claire B.',
    technicianId: 'sample-tech-mark',
    applianceCategory: 'washing_machine',
    rating: 5,
    comment: 'Replaced the front-load washer drain pump with zero mess and shared a 90-day digital warranty receipt.',
    createdAt: '2026-11-19T16:40:00Z',
  },
  {
    id: 'sample-rev-mark-2',
    jobId: 'sample-job-mark-2',
    customerId: 'sample-cust-105',
    customerName: 'Nadia K.',
    technicianId: 'sample-tech-mark',
    applianceCategory: 'plumbing',
    rating: 4,
    comment: 'Fixed the pump pressure valve neatly.',
    createdAt: '2026-11-20T20:00:00Z',
  },
];

export const SAMPLE_OPEN_JOBS: RepairJob[] = [
  {
    id: 'sample-job-1',
    customerId: 'sample-customer-1',
    customerName: 'Elena R.',
    neighborhood: 'Central Heights',
    countryCode: 'US',
    currencyCode: 'USD',
    applianceCategory: 'fan',
    issueTitle: 'Bedroom ceiling fan running at half speed & humming',
    issueDescription: 'Fan blades spin very slowly even on speed 5 and motor housing feels warm. Likely needs a capacitor check.',
    urgency: 'urgent_today',
    preferredSlot: 'Today, 4:00 PM – 7:00 PM',
    estimatedBudget: 35,
    inspectionFee: 10,
    priceApproved: false,
    paymentMethod: 'upi_qr',
    paymentStatus: 'pending',
    status: 'open',
    targetTechnicianId: '',
    technicianId: '',
    technicianName: '',
    technicianEta: '',
    quotedFee: 0,
    isSample: true,
  },
  {
    id: 'sample-job-2',
    customerId: 'sample-customer-2',
    customerName: 'Daniel K.',
    neighborhood: 'Riverside East',
    countryCode: 'US',
    currencyCode: 'USD',
    applianceCategory: 'ac',
    issueTitle: 'Split AC blowing warm air and dripping indoors',
    issueDescription: 'Indoor unit started dripping water along the wall this morning and compressor outside cycles off after 2 minutes.',
    urgency: 'urgent_today',
    preferredSlot: 'Today, ASAP',
    estimatedBudget: 65,
    inspectionFee: 18,
    priceApproved: false,
    paymentMethod: 'card',
    paymentStatus: 'pending',
    status: 'open',
    targetTechnicianId: '',
    technicianId: '',
    technicianName: '',
    technicianEta: '',
    quotedFee: 0,
    isSample: true,
  },
  {
    id: 'sample-job-3',
    customerId: 'sample-customer-3',
    customerName: 'Priya N.',
    neighborhood: 'West Park Avenue',
    countryCode: 'US',
    currencyCode: 'USD',
    applianceCategory: 'plumbing',
    issueTitle: 'Kitchen sink mixer tap leaking & water pump pressure low',
    issueDescription: 'Pressure drops sharply when shower and kitchen tap run together; check valve or motor capacitor may need service.',
    urgency: 'within_24h',
    preferredSlot: 'Tomorrow morning, 9:00 AM – 12:00 PM',
    estimatedBudget: 50,
    inspectionFee: 14,
    priceApproved: false,
    paymentMethod: 'cash',
    paymentStatus: 'pending',
    status: 'open',
    targetTechnicianId: '',
    technicianId: '',
    technicianName: '',
    technicianEta: '',
    quotedFee: 0,
    isSample: true,
  },
];

export function formatTimestamp(ts: unknown): string {
  if (!ts) return 'Just now';
  try {
    const date =
      typeof ts === 'object' && ts !== null && 'toDate' in ts && typeof (ts as { toDate: () => Date }).toDate === 'function'
        ? (ts as { toDate: () => Date }).toDate()
        : new Date(String(ts));
    if (Number.isNaN(date.getTime())) return 'Recently';
    const diffMs = Date.now() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return 'Recently';
  }
}

export function getTimestampMillis(ts: unknown): number {
  if (!ts) return 0;
  try {
    if (typeof ts === 'object' && ts !== null && 'toMillis' in ts && typeof (ts as { toMillis: () => number }).toMillis === 'function') {
      return (ts as { toMillis: () => number }).toMillis();
    }
    const d = new Date(String(ts)).getTime();
    return Number.isNaN(d) ? 0 : d;
  } catch {
    return 0;
  }
}
