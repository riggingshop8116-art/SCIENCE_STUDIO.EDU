-- =============================================================================
-- SUPABASE POSTGRESQL SCHEMA & COMPLETE DATA ENTRY FOR SCIENCE STUDIO BY SAKIB
-- =============================================================================
-- এই সম্পূর্ণ স্ক্রিপ্টটি Supabase SQL Editor (https://supabase.com -> Project -> SQL Editor)-এ রান করুন।
-- এটি সকল প্রয়োজনীয় টেবিল (app_settings, app_users, app_courses, app_classes, app_notes, routine, settings)
-- এবং স্টোরেজ বাকেটস (course-images, avatars, handnotes-pdf, course-videos) সঠিকভাবে তৈরি বা আপডেট করবে,
-- Row Level Security (RLS) পাবলিক পারমিশন পলিসি নিশ্চিত করবে এবং অ্যাডমিন প্যানেল থেকে সমস্ত সেভ/ডিলিট 
-- অপারেশন যেন শতভাগ স্বয়ংক্রিয়ভাবে সুপাবেসে পারসিস্ট হয় তা নিশ্চিত করবে।

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------------------------------
-- 2. CREATE / UPDATE TABLES
-- -----------------------------------------------------------------------------

-- A. App Settings Table (Primary Singleton Settings Table used by backend)
CREATE TABLE IF NOT EXISTS public.app_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  "academyName" TEXT DEFAULT 'SCIENCE STUDIO by Sakib',
  "announcement" TEXT DEFAULT 'ADMISSIONS NOW OPEN FOR ACADEMIC YEAR 2026',
  "showAnnouncement" BOOLEAN DEFAULT true,
  "contactPhone" TEXT DEFAULT '',
  "contactEmail" TEXT DEFAULT '',
  "whatsappNumber" TEXT DEFAULT '',
  "facebookPage" TEXT DEFAULT '',
  "youtubeChannel" TEXT DEFAULT '',
  "bkashNumber" TEXT DEFAULT '',
  "nagadNumber" TEXT DEFAULT '',
  "rocketNumber" TEXT DEFAULT '',
  "routineText" TEXT DEFAULT '',
  "routineImageUrl" TEXT DEFAULT '',
  "updatedAt" TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  "heroTitle" TEXT DEFAULT '',
  "heroSubtitle" TEXT DEFAULT '',
  "heroSubEnglish" TEXT DEFAULT '',
  "heroJoinButtonText" TEXT DEFAULT 'ভর্তি হন / রেজিস্ট্রেশন করুন',
  "heroExploreButtonText" TEXT DEFAULT 'কোর্সসমূহ দেখুন',
  "heroClassroomBgUrl" TEXT DEFAULT '',
  "adminName" TEXT DEFAULT '',
  "adminBio" TEXT DEFAULT '',
  "adminPhotoUrl" TEXT DEFAULT '',
  "adminDesignation" TEXT DEFAULT '',
  "adminEducation" TEXT DEFAULT '',
  "contactAddress" TEXT DEFAULT '',
  "footerDescription" TEXT DEFAULT '',
  "paymentInstructions" TEXT DEFAULT '',
  "subjects" JSONB DEFAULT '["Physics", "Chemistry", "Biology", "Mathematics", "General Science"]'::jsonb
);

ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS "academyName" TEXT DEFAULT 'SCIENCE STUDIO by Sakib';
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS "announcement" TEXT DEFAULT 'ADMISSIONS NOW OPEN FOR ACADEMIC YEAR 2026';
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS "showAnnouncement" BOOLEAN DEFAULT true;
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS "contactPhone" TEXT DEFAULT '';
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS "contactEmail" TEXT DEFAULT '';
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS "whatsappNumber" TEXT DEFAULT '';
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS "facebookPage" TEXT DEFAULT '';
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS "youtubeChannel" TEXT DEFAULT '';
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS "bkashNumber" TEXT DEFAULT '';
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS "nagadNumber" TEXT DEFAULT '';
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS "rocketNumber" TEXT DEFAULT '';
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS "routineText" TEXT DEFAULT '';
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS "routineImageUrl" TEXT DEFAULT '';
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMPTZ DEFAULT timezone('utc'::text, now());
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS "heroTitle" TEXT DEFAULT '';
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS "heroSubtitle" TEXT DEFAULT '';
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS "heroSubEnglish" TEXT DEFAULT '';
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS "heroJoinButtonText" TEXT DEFAULT 'ভর্তি হন / রেজিস্ট্রেশন করুন';
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS "heroExploreButtonText" TEXT DEFAULT 'কোর্সসমূহ দেখুন';
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS "heroClassroomBgUrl" TEXT DEFAULT '';
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS "adminName" TEXT DEFAULT '';
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS "adminBio" TEXT DEFAULT '';
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS "adminPhotoUrl" TEXT DEFAULT '';
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS "adminDesignation" TEXT DEFAULT '';
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS "adminEducation" TEXT DEFAULT '';
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS "contactAddress" TEXT DEFAULT '';
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS "footerDescription" TEXT DEFAULT '';
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS "paymentInstructions" TEXT DEFAULT '';
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS "subjects" JSONB DEFAULT '["Physics", "Chemistry", "Biology", "Mathematics", "General Science"]'::jsonb;

-- B. Legacy / Fallback Settings Table
CREATE TABLE IF NOT EXISTS public.settings (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- C. App Users Table
CREATE TABLE IF NOT EXISTS public.app_users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT DEFAULT '',
  password TEXT NOT NULL DEFAULT '',
  role TEXT DEFAULT 'student',
  "isApproved" BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT false,
  course TEXT DEFAULT '',
  batch TEXT DEFAULT '',
  student_class TEXT DEFAULT '',
  "enrolledCourseTitles" JSONB DEFAULT '[]'::jsonb,
  enrolled_courses JSONB DEFAULT '[]'::jsonb,
  "enrolledCourseIds" JSONB DEFAULT '[]'::jsonb,
  "transactionId" TEXT DEFAULT '',
  transaction_id TEXT DEFAULT '',
  "paymentMethod" TEXT DEFAULT '',
  payment_method TEXT DEFAULT '',
  "senderPhone" TEXT DEFAULT '',
  sender_phone TEXT DEFAULT '',
  avatar TEXT DEFAULT '',
  photo_url TEXT DEFAULT '',
  "joinedAt" TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  "lastLoginAt" TIMESTAMPTZ,
  "deviceInfo" JSONB DEFAULT '{}'::jsonb,
  data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.app_users ADD COLUMN IF NOT EXISTS phone TEXT DEFAULT '';
ALTER TABLE public.app_users ADD COLUMN IF NOT EXISTS password TEXT NOT NULL DEFAULT '';
ALTER TABLE public.app_users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'student';
ALTER TABLE public.app_users ADD COLUMN IF NOT EXISTS "isApproved" BOOLEAN DEFAULT false;
ALTER TABLE public.app_users ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT false;
ALTER TABLE public.app_users ADD COLUMN IF NOT EXISTS course TEXT DEFAULT '';
ALTER TABLE public.app_users ADD COLUMN IF NOT EXISTS batch TEXT DEFAULT '';
ALTER TABLE public.app_users ADD COLUMN IF NOT EXISTS student_class TEXT DEFAULT '';
ALTER TABLE public.app_users ADD COLUMN IF NOT EXISTS "enrolledCourseTitles" JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.app_users ADD COLUMN IF NOT EXISTS enrolled_courses JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.app_users ADD COLUMN IF NOT EXISTS "enrolledCourseIds" JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.app_users ADD COLUMN IF NOT EXISTS "transactionId" TEXT DEFAULT '';
ALTER TABLE public.app_users ADD COLUMN IF NOT EXISTS transaction_id TEXT DEFAULT '';
ALTER TABLE public.app_users ADD COLUMN IF NOT EXISTS "paymentMethod" TEXT DEFAULT '';
ALTER TABLE public.app_users ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT '';
ALTER TABLE public.app_users ADD COLUMN IF NOT EXISTS "senderPhone" TEXT DEFAULT '';
ALTER TABLE public.app_users ADD COLUMN IF NOT EXISTS sender_phone TEXT DEFAULT '';
ALTER TABLE public.app_users ADD COLUMN IF NOT EXISTS avatar TEXT DEFAULT '';
ALTER TABLE public.app_users ADD COLUMN IF NOT EXISTS photo_url TEXT DEFAULT '';
ALTER TABLE public.app_users ADD COLUMN IF NOT EXISTS "joinedAt" TIMESTAMPTZ DEFAULT timezone('utc'::text, now());
ALTER TABLE public.app_users ADD COLUMN IF NOT EXISTS "lastLoginAt" TIMESTAMPTZ;
ALTER TABLE public.app_users ADD COLUMN IF NOT EXISTS "deviceInfo" JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.app_users ADD COLUMN IF NOT EXISTS data JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.app_users ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());
ALTER TABLE public.app_users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());

-- D. App Courses Table
CREATE TABLE IF NOT EXISTS public.app_courses (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  instructor TEXT DEFAULT 'SAKIB HOSEN (Founder & Chief Science Mentor)',
  supervisor TEXT DEFAULT 'SAKIB HOSEN (Founder & Chief Science Mentor)',
  description TEXT DEFAULT '',
  price NUMERIC DEFAULT 0,
  "originalPrice" NUMERIC DEFAULT 0,
  original_price NUMERIC DEFAULT 0,
  "imageUrl" TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  batch TEXT DEFAULT '',
  class_level TEXT DEFAULT '',
  schedule TEXT DEFAULT '',
  duration TEXT DEFAULT '',
  featured BOOLEAN DEFAULT false,
  "isLive" BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active',
  "orderIndex" INT DEFAULT 0,
  features JSONB DEFAULT '[]'::jsonb,
  badge TEXT DEFAULT '',
  rating NUMERIC DEFAULT 5.0,
  "enrolledCount" INT DEFAULT 0,
  enrolled_count INT DEFAULT 0,
  data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.app_courses ADD COLUMN IF NOT EXISTS instructor TEXT DEFAULT 'SAKIB HOSEN (Founder & Chief Science Mentor)';
ALTER TABLE public.app_courses ADD COLUMN IF NOT EXISTS supervisor TEXT DEFAULT 'SAKIB HOSEN (Founder & Chief Science Mentor)';
ALTER TABLE public.app_courses ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '';
ALTER TABLE public.app_courses ADD COLUMN IF NOT EXISTS price NUMERIC DEFAULT 0;
ALTER TABLE public.app_courses ADD COLUMN IF NOT EXISTS "originalPrice" NUMERIC DEFAULT 0;
ALTER TABLE public.app_courses ADD COLUMN IF NOT EXISTS original_price NUMERIC DEFAULT 0;
ALTER TABLE public.app_courses ADD COLUMN IF NOT EXISTS "imageUrl" TEXT DEFAULT '';
ALTER TABLE public.app_courses ADD COLUMN IF NOT EXISTS image_url TEXT DEFAULT '';
ALTER TABLE public.app_courses ADD COLUMN IF NOT EXISTS batch TEXT DEFAULT '';
ALTER TABLE public.app_courses ADD COLUMN IF NOT EXISTS class_level TEXT DEFAULT '';
ALTER TABLE public.app_courses ADD COLUMN IF NOT EXISTS schedule TEXT DEFAULT '';
ALTER TABLE public.app_courses ADD COLUMN IF NOT EXISTS duration TEXT DEFAULT '';
ALTER TABLE public.app_courses ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;
ALTER TABLE public.app_courses ADD COLUMN IF NOT EXISTS "isLive" BOOLEAN DEFAULT false;
ALTER TABLE public.app_courses ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE public.app_courses ADD COLUMN IF NOT EXISTS "orderIndex" INT DEFAULT 0;
ALTER TABLE public.app_courses ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.app_courses ADD COLUMN IF NOT EXISTS badge TEXT DEFAULT '';
ALTER TABLE public.app_courses ADD COLUMN IF NOT EXISTS rating NUMERIC DEFAULT 5.0;
ALTER TABLE public.app_courses ADD COLUMN IF NOT EXISTS "enrolledCount" INT DEFAULT 0;
ALTER TABLE public.app_courses ADD COLUMN IF NOT EXISTS enrolled_count INT DEFAULT 0;
ALTER TABLE public.app_courses ADD COLUMN IF NOT EXISTS data JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.app_courses ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());
ALTER TABLE public.app_courses ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());

-- E. App Classes Table
CREATE TABLE IF NOT EXISTS public.app_classes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  "videoUrl" TEXT NOT NULL,
  video_url TEXT DEFAULT '',
  "thumbnailUrl" TEXT DEFAULT '',
  thumbnail_url TEXT DEFAULT '',
  "courseTitle" TEXT DEFAULT '',
  course_title TEXT DEFAULT '',
  "courseId" TEXT DEFAULT '',
  course_id TEXT DEFAULT '',
  description TEXT DEFAULT '',
  duration TEXT DEFAULT '',
  "orderIndex" INT DEFAULT 0,
  "isFree" BOOLEAN DEFAULT false,
  "pdfUrl" TEXT DEFAULT '',
  "driveUrl" TEXT DEFAULT '',
  data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.app_classes ADD COLUMN IF NOT EXISTS video_url TEXT DEFAULT '';
ALTER TABLE public.app_classes ADD COLUMN IF NOT EXISTS "thumbnailUrl" TEXT DEFAULT '';
ALTER TABLE public.app_classes ADD COLUMN IF NOT EXISTS thumbnail_url TEXT DEFAULT '';
ALTER TABLE public.app_classes ADD COLUMN IF NOT EXISTS "courseTitle" TEXT DEFAULT '';
ALTER TABLE public.app_classes ADD COLUMN IF NOT EXISTS course_title TEXT DEFAULT '';
ALTER TABLE public.app_classes ADD COLUMN IF NOT EXISTS "courseId" TEXT DEFAULT '';
ALTER TABLE public.app_classes ADD COLUMN IF NOT EXISTS course_id TEXT DEFAULT '';
ALTER TABLE public.app_classes ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '';
ALTER TABLE public.app_classes ADD COLUMN IF NOT EXISTS duration TEXT DEFAULT '';
ALTER TABLE public.app_classes ADD COLUMN IF NOT EXISTS "orderIndex" INT DEFAULT 0;
ALTER TABLE public.app_classes ADD COLUMN IF NOT EXISTS "isFree" BOOLEAN DEFAULT false;
ALTER TABLE public.app_classes ADD COLUMN IF NOT EXISTS "pdfUrl" TEXT DEFAULT '';
ALTER TABLE public.app_classes ADD COLUMN IF NOT EXISTS "driveUrl" TEXT DEFAULT '';
ALTER TABLE public.app_classes ADD COLUMN IF NOT EXISTS data JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.app_classes ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());
ALTER TABLE public.app_classes ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());

-- F. App Notes Table
CREATE TABLE IF NOT EXISTS public.app_notes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  "pdfUrl" TEXT NOT NULL,
  pdf_url TEXT DEFAULT '',
  "courseTitle" TEXT DEFAULT '',
  course_title TEXT DEFAULT '',
  "courseId" TEXT DEFAULT '',
  course_id TEXT DEFAULT '',
  "fileSize" TEXT DEFAULT '',
  "pageCount" INT DEFAULT 0,
  "downloadCount" INT DEFAULT 0,
  description TEXT DEFAULT '',
  data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.app_notes ADD COLUMN IF NOT EXISTS pdf_url TEXT DEFAULT '';
ALTER TABLE public.app_notes ADD COLUMN IF NOT EXISTS "courseTitle" TEXT DEFAULT '';
ALTER TABLE public.app_notes ADD COLUMN IF NOT EXISTS course_title TEXT DEFAULT '';
ALTER TABLE public.app_notes ADD COLUMN IF NOT EXISTS "courseId" TEXT DEFAULT '';
ALTER TABLE public.app_notes ADD COLUMN IF NOT EXISTS course_id TEXT DEFAULT '';
ALTER TABLE public.app_notes ADD COLUMN IF NOT EXISTS "fileSize" TEXT DEFAULT '';
ALTER TABLE public.app_notes ADD COLUMN IF NOT EXISTS "pageCount" INT DEFAULT 0;
ALTER TABLE public.app_notes ADD COLUMN IF NOT EXISTS "downloadCount" INT DEFAULT 0;
ALTER TABLE public.app_notes ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '';
ALTER TABLE public.app_notes ADD COLUMN IF NOT EXISTS data JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.app_notes ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());
ALTER TABLE public.app_notes ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());

-- G. Routine Table
CREATE TABLE IF NOT EXISTS public.routine (
  id TEXT PRIMARY KEY,
  day TEXT NOT NULL,
  subject TEXT NOT NULL,
  time TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- -----------------------------------------------------------------------------
-- 3. ENABLE ROW LEVEL SECURITY (RLS) & PUBLIC POLICIES
-- -----------------------------------------------------------------------------
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routine ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public full access app_settings" ON public.app_settings;
DROP POLICY IF EXISTS "Public full access settings" ON public.settings;
DROP POLICY IF EXISTS "Public full access app_users" ON public.app_users;
DROP POLICY IF EXISTS "Public full access app_courses" ON public.app_courses;
DROP POLICY IF EXISTS "Public full access app_classes" ON public.app_classes;
DROP POLICY IF EXISTS "Public full access app_notes" ON public.app_notes;
DROP POLICY IF EXISTS "Public full access routine" ON public.routine;

CREATE POLICY "Public full access app_settings" ON public.app_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access settings" ON public.settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access app_users" ON public.app_users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access app_courses" ON public.app_courses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access app_classes" ON public.app_classes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access app_notes" ON public.app_notes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access routine" ON public.routine FOR ALL USING (true) WITH CHECK (true);

-- -----------------------------------------------------------------------------
-- 4. STORAGE BUCKETS & POLICIES (Course Images, Avatars, Notes PDF, Course Videos)
-- -----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES 
  ('course-images', 'course-images', true, 524288000),
  ('avatars', 'avatars', true, 524288000),
  ('handnotes-pdf', 'handnotes-pdf', true, 524288000),
  ('course-videos', 'course-videos', true, 524288000)
ON CONFLICT (id) DO UPDATE SET public = true, file_size_limit = 524288000;

DROP POLICY IF EXISTS "Public storage select objects" ON storage.objects;
DROP POLICY IF EXISTS "Public storage insert objects" ON storage.objects;
DROP POLICY IF EXISTS "Public storage update objects" ON storage.objects;
DROP POLICY IF EXISTS "Public storage delete objects" ON storage.objects;

CREATE POLICY "Public storage select objects" ON storage.objects FOR SELECT USING (true);
CREATE POLICY "Public storage insert objects" ON storage.objects FOR INSERT WITH CHECK (true);
CREATE POLICY "Public storage update objects" ON storage.objects FOR UPDATE USING (true);
CREATE POLICY "Public storage delete objects" ON storage.objects FOR DELETE USING (true);

-- -----------------------------------------------------------------------------
-- 5. AUTOMATIC AUTH USER DELETION TRIGGER & RPC
-- -----------------------------------------------------------------------------

-- Trigger function to delete user from Supabase Authentication (auth.users) when deleted from app_users
CREATE OR REPLACE FUNCTION public.handle_delete_app_user()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM auth.users WHERE LOWER(TRIM(email)) = LOWER(TRIM(OLD.email));
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_app_user_deleted ON public.app_users;

CREATE TRIGGER on_app_user_deleted
  AFTER DELETE ON public.app_users
  FOR EACH ROW EXECUTE FUNCTION public.handle_delete_app_user();

-- RPC function to delete user directly from auth.users by email (case-insensitive)
CREATE OR REPLACE FUNCTION public.delete_auth_user(target_email TEXT)
RETURNS VOID AS $$
BEGIN
  DELETE FROM auth.users WHERE LOWER(TRIM(email)) = LOWER(TRIM(target_email));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execution to service_role, postgres, anon, authenticated
GRANT EXECUTE ON FUNCTION public.delete_auth_user(TEXT) TO postgres, service_role, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.handle_delete_app_user() TO postgres, service_role;

-- -----------------------------------------------------------------------------
-- 6. INSERT / UPDATE LIVE DATA
-- -----------------------------------------------------------------------------

-- Seed Super Admin and Primary Admin
INSERT INTO public.app_users (id, name, email, phone, password, role, "isApproved", is_approved, batch, "joinedAt", updated_at)
VALUES 
  ('usr_super_admin', 'SAKIB HOSEN', 'mdshakibhossen2050@gmail.com', '01913917414', 'SHAKIB@2050#', 'admin', true, true, 'Faculty', now(), now()),
  ('usr_admin', 'SAKIB HOSEN', 'admin@sciencestudio.com', '01913917414', 'admin123', 'admin', true, true, 'Faculty', now(), now())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  password = EXCLUDED.password,
  role = EXCLUDED.role,
  "isApproved" = EXCLUDED."isApproved",
  is_approved = EXCLUDED.is_approved,
  updated_at = now();

-- Seed Primary Settings in app_settings table
INSERT INTO public.app_settings (
  id,
  "academyName",
  "announcement",
  "showAnnouncement",
  "contactPhone",
  "contactEmail",
  "whatsappNumber",
  "bkashNumber",
  "nagadNumber",
  "rocketNumber",
  "heroTitle",
  "heroSubtitle",
  "heroSubEnglish",
  "heroJoinButtonText",
  "heroExploreButtonText",
  "adminName",
  "adminBio",
  "adminPhotoUrl",
  "adminDesignation",
  "adminEducation",
  "contactAddress",
  "footerDescription",
  "paymentInstructions",
  "subjects",
  "updatedAt"
)
VALUES (
  'default',
  'SCIENCE STUDIO by Sakib',
  'ADMISSIONS NOW OPEN FOR ACADEMIC YEAR 2026',
  true,
  '01913917414',
  'mdshakibhossen2050@gmail.com',
  '01913917414',
  '01913917414',
  '01624840625',
  '01954524102',
  'Innovate, Educate & Explore with Science Studio by Sakib',
  'বিজ্ঞান চর্চাকে সহজ, আনন্দদায়ক এবং প্রযুক্তিনির্ভর করতে সাকিব স্যারের এই বিশেষ উদ্যোগ। Science Studio by Sakib-এ রয়েছে সেরা মানের ভিডিও লেকচার, ইন্টারেক্টিভ সিমুলেটর এবং সার্বক্ষণিক ডাউট সলভ মেন্টরশিপ।',
  'Experience premium science coaching with high-fidelity interactive simulation play desks, curated video masterclasses, and concise PDF materials by Sakib Sir.',
  'ভর্তি হন / রেজিস্ট্রেশন করুন',
  'কোর্সসমূহ দেখুন',
  'SAKIB HOSEN',
  'পদার্থবিজ্ঞান ও গণিত শিক্ষায় ৭+ বছরের অভিজ্ঞতা সম্পন্ন একজন নিবেদিতপ্রাণ শিক্ষক ও মেন্টর।',
  'https://tcsblgpiufflkitislpz.supabase.co/storage/v1/object/public/course-images/admin_photo_1788245708574.jpg',
  'Founder & Chief Science Mentor',
  'BSC(HONS), DEPARTMENT OF CHEMISTRY.',
  'NAVY HOSPITAL GATE, CEPZ, NEW MOORING, CHATTOGRAM.',
  'সাকিব স্যারের তত্ত্বাবধানে পরিচালিত একটি আধুনিক ও প্রযুক্তিনির্ভর বিজ্ঞান শিক্ষা কেন্দ্র।',
  'বিকাশ/নগদ/রকেট সেন্ড মানি করে ট্রানজেকশন আইডি প্রদান করুন।',
  '["Physics", "Chemistry", "Biology", "Mathematics", "General Science"]'::jsonb,
  now()
)
ON CONFLICT (id) DO UPDATE SET
  "academyName" = EXCLUDED."academyName",
  "announcement" = EXCLUDED."announcement",
  "contactPhone" = EXCLUDED."contactPhone",
  "contactEmail" = EXCLUDED."contactEmail",
  "whatsappNumber" = EXCLUDED."whatsappNumber",
  "bkashNumber" = EXCLUDED."bkashNumber",
  "nagadNumber" = EXCLUDED."nagadNumber",
  "rocketNumber" = EXCLUDED."rocketNumber",
  "adminName" = EXCLUDED."adminName",
  "adminBio" = EXCLUDED."adminBio",
  "adminPhotoUrl" = EXCLUDED."adminPhotoUrl",
  "adminDesignation" = EXCLUDED."adminDesignation",
  "adminEducation" = EXCLUDED."adminEducation",
  "contactAddress" = EXCLUDED."contactAddress",
  "footerDescription" = EXCLUDED."footerDescription",
  "paymentInstructions" = EXCLUDED."paymentInstructions",
  "updatedAt" = now();

-- Seed Routine Data
INSERT INTO public.routine (id, day, subject, time)
VALUES
  ('rtn_1', 'শুক্রবার (Friday)', 'পদার্থবিজ্ঞান স্পেশাল ব্যাচ (Physics 1st Paper)', '🕒 বিকাল ৩:০০ - ৫:০০'),
  ('rtn_2', 'শনিবার (Saturday)', 'রসায়ন স্পেশাল ব্যাচ (Chemistry Orbit Lab)', '🕒 বিকাল ৩:০০ - ৫:০০'),
  ('rtn_3', 'সোমবার (Monday)', 'জীববিজ্ঞান প্র্যাকটিক্যাল + থিওরি (DNA Module)', '🕒 বিকাল ৪:০০ - ৫:৩০'),
  ('rtn_4', 'বুধবার (Wednesday)', 'উচ্চতর গণিত ও প্রবলেম সলভিং সেশন', '🕒 বিকাল ৩:০০ - ৫:০০')
ON CONFLICT (id) DO UPDATE SET
  day = EXCLUDED.day,
  subject = EXCLUDED.subject,
  time = EXCLUDED.time;
