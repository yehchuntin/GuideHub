
export enum UserRole {
  TRAVELER = 'TRAVELER',
  GUIDE = 'GUIDE',
}

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: UserRole; // Current active role
}

export interface Review {
  id: string;
  reviewerName: string;
  reviewerAvatar?: string;
  rating: number; // 1-5
  comment: string;
  date: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
  isSystem?: boolean; // For AI suggestions like "Where should we meet?"
}

// --- Pricing Schema ---
export interface AddOnService {
  id: string;
  name: string;
  price: number;
  description: string;
}

export interface PricingSchema {
  basePrice: number; // e.g. Half Day
  fullDayPrice?: number;
  currency: string;
  perPerson: boolean; // if false, price is per group
  addOns: AddOnService[];
}

// --- Content Schema ---
export interface PublicContent {
  title: string;
  summary: string;
  highlights: string[];
  itineraryOverview: string[];
  included: string[];
  excluded: string[];
  meetingPoint: string;
  transportation: string;
  images: string[];
}

export interface PrivateContent {
  secretSpots: string[];
  detailedRoute: string;
  logisticsNotes: string;
  weatherBackupPlan: string;
}

// --- Tour Entity ---
export interface Tour {
  id: string;
  guideId: string;
  category: 'Culture' | 'Food' | 'Nature' | 'Photography' | 'Adventure' | 'Night' | 'Driving';
  durationHours: number;
  maxGroupSize: number;
  languages: string[];
  pricing: PricingSchema;
  publicData: PublicContent;
  privateData: PrivateContent;
  rating: number;
  reviewCount: number;
  isActive: boolean;
}

// --- Guide Profile ---
export interface GuideProfile {
  id: string; // Same as User uid
  name: string;
  isTeam: boolean;
  location: string;
  serviceArea: string[];
  languages: string[];
  bio: string;
  tags: string[]; // e.g. "Photography", "Driver", "History Buff"
  availabilityText: string; // Simple text for MVP e.g. "Weekends and Mon-Wed"
  avatarUrl: string;
  verified: boolean;
  totalEarnings: number;
  responseRate: number;
  reviews: Review[]; // Embedded reviews for simplicity
}

// --- Booking ---
export interface Booking {
  id: string;
  tourId: string;
  tourTitle: string;
  tourImage: string;
  guideId: string;
  guideName: string;
  travelerName: string;
  date: string;
  timeSlot: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  totalPrice: number;
  selectedAddOns: string[];
  guestCount: number;
}

// --- AI & Search ---
export interface TravelerRequest {
  location: string;
  date: string;
  groupSize: number;
  interests: string[];
  budgetRange: 'Low' | 'Medium' | 'High';
}

export interface MatchResult {
  tourId: string;
  matchScore: number;
  aiReasoning: string;
}
