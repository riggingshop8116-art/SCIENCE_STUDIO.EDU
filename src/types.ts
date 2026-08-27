/**
 * Science Studio Types & Interfaces
 */

export type UserRole = 'student' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  isApproved?: boolean;
  course?: string;
  enrolledCourseTitles?: string[];
  enrolledCourseIds?: string[];
  transactionId?: string;
  paymentMethod?: string;
  senderPhone?: string;
  studentClass?: string;
  studentRoll?: string;
  photoUrl?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface Class {
  id: string;
  title: string;
  subject: string;
  courseId?: string;
  courseTitle?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  description: string;
  createdAt: string;
}

export interface Note {
  id: string;
  title: string;
  subject: string;
  courseId?: string;
  courseTitle?: string;
  pdfUrl: string;
  description: string;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface AdminStats {
  totalStudents: number;
  totalClasses: number;
  totalNotes: number;
  subjectDistribution: {
    subject: string;
    classes: number;
    notes: number;
  }[];
}

export interface RoutineItem {
  id: string;
  day: string;
  subject: string;
  time: string;
}

export interface Course {
  id: string;
  title: string;
  subject: string;
  classLevel?: string;
  imageUrl?: string;
  price: number;
  originalPrice?: number;
  duration?: string;
  description: string;
  features?: string[];
  badge?: string;
  rating?: number;
  enrolled?: string;
  enrolledCount?: number;
  createdAt: string;
}

export interface Settings {
  academyName: string;
  announcement: string;
  heroTitle: string;
  heroSubtitle: string;
  heroSubEnglish: string;
  heroJoinButtonText?: string;
  heroExploreButtonText?: string;
  heroClassroomBgUrl?: string;
  subjects: string[];
  contactPhone: string;
  contactEmail: string;
  contactAddress: string;
  footerDescription: string;
  routine?: RoutineItem[];
  routineList?: RoutineItem[];
  academyLogoUrl?: string;
  adminName?: string;
  adminBio?: string;
  adminPhotoUrl?: string;
  adminDesignation?: string;
  adminEducation?: string;
  classLevels?: string[];
  courseDurations?: string[];
  defaultCourseFeatures?: string[];
  bkashNumber?: string;
  nagadNumber?: string;
  rocketNumber?: string;
  paymentInstructions?: string;

  // Orbit & Ecosystem Section Settings
  orbitSectionBadge?: string;
  orbitSectionTitle?: string;
  orbitSectionSubtitle?: string;
  orbitAutoRotate?: boolean;
  orbitSpeedSeconds?: number;

  // Academic Insights Settings
  insightsTotalStudents?: string;
  insightsActivePercent?: string;
  insightsSuccessRate?: string;
  insightsSuccessRateLabel?: string;
  insightsTotalCourses?: string;
  insightsTotalNotes?: string;
  insightsBullet1?: string;
  insightsBullet2?: string;
  insightsBullet3?: string;
  insightsRegisterButtonText?: string;

  // Leadership & Pedagogy Pillars
  pillarsSectionBadge?: string;
  pillarsSectionTitle?: string;
  pillarsSectionSubtitle?: string;
  pillar1Title?: string;
  pillar1Badge?: string;
  pillar1Description?: string;
  pillar2Title?: string;
  pillar2Badge?: string;
  pillar2Description?: string;
  pillar3Title?: string;
  pillar3Badge?: string;
  pillar3Description?: string;
  mentorExperience?: string;
  mentorGuidance?: string;

  // Header & Hero Extra Badges
  heroBadgeText?: string;
  announcementBadge?: string;
  marqueeNotice2?: string;
  marqueeNotice3?: string;
  marqueeNotice4?: string;
  marqueeNotice5?: string;

  // Social and Helpline Time
  facebookUrl?: string;
  youtubeUrl?: string;
  telegramUrl?: string;
  whatsappNumber?: string;
  helplineTime?: string;

  // Virtual Lab Section Customization
  labSectionBadge?: string;
  labSectionTitle?: string;
  labSectionSubtitle?: string;
  
  // Hero Banners
  heroBanners?: HeroBanner[];
}

export interface HeroBanner {
  id: string;
  title: string;
  subtitle?: string;
  badge?: string;
  tag?: string;
  image: string;
  subject?: string;
  accentGradient?: string;
  borderGlow?: string;
  glowColor?: string;
  actionButtonText?: string;
  actionButtonLink?: string;
  isActive?: boolean;
  order?: number;
  createdAt?: string;
}

