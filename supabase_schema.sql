-- =============================================================================
-- SUPABASE POSTGRESQL SCHEMA & COMPLETE DATA ENTRY FOR SCIENCE STUDIO
-- =============================================================================
-- Run this complete script in your Supabase SQL Editor (https://supabase.com -> Project -> SQL Editor).
-- It creates all required tables, handles column type conversions safely, enables RLS with public access, and seeds initial data.

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------------------------------
-- 2. CREATE / UPDATE TABLES
-- -----------------------------------------------------------------------------

-- App Users Table (Supports students and admins, profile, class, and enrolled courses)
CREATE TABLE IF NOT EXISTS public.app_users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'student',
  is_approved BOOLEAN DEFAULT false,
  phone TEXT DEFAULT '',
  student_class TEXT DEFAULT '',
  photo_url TEXT DEFAULT '',
  enrolled_courses JSONB DEFAULT '[]'::jsonb,
  transaction_id TEXT DEFAULT '',
  payment_method TEXT DEFAULT '',
  sender_phone TEXT DEFAULT '',
  data JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.app_users ADD COLUMN IF NOT EXISTS phone TEXT DEFAULT '';
ALTER TABLE public.app_users ADD COLUMN IF NOT EXISTS student_class TEXT DEFAULT '';
ALTER TABLE public.app_users ADD COLUMN IF NOT EXISTS photo_url TEXT DEFAULT '';
ALTER TABLE public.app_users ADD COLUMN IF NOT EXISTS enrolled_courses JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.app_users ADD COLUMN IF NOT EXISTS transaction_id TEXT DEFAULT '';
ALTER TABLE public.app_users ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT '';
ALTER TABLE public.app_users ADD COLUMN IF NOT EXISTS sender_phone TEXT DEFAULT '';
ALTER TABLE public.app_users ADD COLUMN IF NOT EXISTS data JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.app_users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());

-- Ensure UNIQUE constraint exists on email column for ON CONFLICT (email)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'app_users_email_key'
  ) THEN
    ALTER TABLE public.app_users ADD CONSTRAINT app_users_email_key UNIQUE (email);
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- FIX: Safely convert column "enrolled_courses" from text[] to JSONB if it was created as text[] or array
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'app_users' 
      AND column_name = 'enrolled_courses' 
      AND data_type != 'jsonb'
  ) THEN
    ALTER TABLE public.app_users ALTER COLUMN enrolled_courses DROP DEFAULT;
    ALTER TABLE public.app_users ALTER COLUMN enrolled_courses TYPE JSONB USING to_jsonb(enrolled_courses);
    ALTER TABLE public.app_users ALTER COLUMN enrolled_courses SET DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- Classes Table (Supports Video masterclasses, course category, thumbnails)
CREATE TABLE IF NOT EXISTS public.app_classes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT DEFAULT '',
  course_id TEXT DEFAULT '',
  course_title TEXT DEFAULT '',
  description TEXT DEFAULT '',
  data JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.app_classes ADD COLUMN IF NOT EXISTS thumbnail_url TEXT DEFAULT '';
ALTER TABLE public.app_classes ADD COLUMN IF NOT EXISTS course_id TEXT DEFAULT '';
ALTER TABLE public.app_classes ADD COLUMN IF NOT EXISTS course_title TEXT DEFAULT '';
ALTER TABLE public.app_classes ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '';
ALTER TABLE public.app_classes ADD COLUMN IF NOT EXISTS data JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.app_classes ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());

-- Notes Table (Supports PDF Lecture materials, course association)
CREATE TABLE IF NOT EXISTS public.app_notes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  pdf_url TEXT NOT NULL,
  description TEXT DEFAULT '',
  course_id TEXT DEFAULT '',
  course_title TEXT DEFAULT '',
  data JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.app_notes ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '';
ALTER TABLE public.app_notes ADD COLUMN IF NOT EXISTS course_id TEXT DEFAULT '';
ALTER TABLE public.app_notes ADD COLUMN IF NOT EXISTS course_title TEXT DEFAULT '';
ALTER TABLE public.app_notes ADD COLUMN IF NOT EXISTS data JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.app_notes ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());

-- Courses Table (Supports published courses with pricing, duration, class level, features)
CREATE TABLE IF NOT EXISTS public.app_courses (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  class_level TEXT DEFAULT '',
  price NUMERIC DEFAULT 0,
  original_price NUMERIC DEFAULT 0,
  duration TEXT DEFAULT '',
  description TEXT DEFAULT '',
  badge TEXT DEFAULT '',
  rating NUMERIC DEFAULT 5.0,
  enrolled_count INT DEFAULT 0,
  features JSONB DEFAULT '[]'::jsonb,
  image_url TEXT DEFAULT '',
  data JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.app_courses ADD COLUMN IF NOT EXISTS class_level TEXT DEFAULT '';
ALTER TABLE public.app_courses ADD COLUMN IF NOT EXISTS price NUMERIC DEFAULT 0;
ALTER TABLE public.app_courses ADD COLUMN IF NOT EXISTS original_price NUMERIC DEFAULT 0;
ALTER TABLE public.app_courses ADD COLUMN IF NOT EXISTS duration TEXT DEFAULT '';
ALTER TABLE public.app_courses ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '';
ALTER TABLE public.app_courses ADD COLUMN IF NOT EXISTS badge TEXT DEFAULT '';
ALTER TABLE public.app_courses ADD COLUMN IF NOT EXISTS rating NUMERIC DEFAULT 5.0;
ALTER TABLE public.app_courses ADD COLUMN IF NOT EXISTS enrolled_count INT DEFAULT 0;
ALTER TABLE public.app_courses ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.app_courses ADD COLUMN IF NOT EXISTS image_url TEXT DEFAULT '';
ALTER TABLE public.app_courses ADD COLUMN IF NOT EXISTS data JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.app_courses ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());

-- Settings Table (Singleton Configuration)
CREATE TABLE IF NOT EXISTS public.settings (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Class Routine Table
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
ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routine ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public full access app_users" ON public.app_users;
DROP POLICY IF EXISTS "Public full access app_classes" ON public.app_classes;
DROP POLICY IF EXISTS "Public full access app_notes" ON public.app_notes;
DROP POLICY IF EXISTS "Public full access app_courses" ON public.app_courses;
DROP POLICY IF EXISTS "Public full access settings" ON public.settings;
DROP POLICY IF EXISTS "Public full access routine" ON public.routine;

CREATE POLICY "Public full access app_users" ON public.app_users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access app_classes" ON public.app_classes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access app_notes" ON public.app_notes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access app_courses" ON public.app_courses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access settings" ON public.settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access routine" ON public.routine FOR ALL USING (true) WITH CHECK (true);

-- -----------------------------------------------------------------------------
-- 4. STORAGE BUCKETS & POLICIES (for Course Images, Avatars & Handnotes PDF)
-- -----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('course-images', 'course-images', true),
  ('avatars', 'avatars', true),
  ('handnotes-pdf', 'handnotes-pdf', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public storage select objects" ON storage.objects;
DROP POLICY IF EXISTS "Public storage insert objects" ON storage.objects;
DROP POLICY IF EXISTS "Public storage update objects" ON storage.objects;
DROP POLICY IF EXISTS "Public storage delete objects" ON storage.objects;

CREATE POLICY "Public storage select objects" ON storage.objects FOR SELECT USING (true);
CREATE POLICY "Public storage insert objects" ON storage.objects FOR INSERT WITH CHECK (true);
CREATE POLICY "Public storage update objects" ON storage.objects FOR UPDATE USING (true);
CREATE POLICY "Public storage delete objects" ON storage.objects FOR DELETE USING (true);

-- -----------------------------------------------------------------------------
-- 5. INSERT BACKEND SEED DATA
-- -----------------------------------------------------------------------------

-- Seed Users Data
INSERT INTO public.app_users (id, name, email, role, is_approved, phone, student_class, photo_url, enrolled_courses, transaction_id, payment_method, sender_phone, data)
VALUES 
  ('usr_admin', 'Dr. Sayeed Rahman', 'admin@sciencestudio.com', 'admin', true, '01700000000', 'Faculty', '', '[]'::jsonb, '', '', '', '{"id": "usr_admin", "name": "Dr. Sayeed Rahman", "role": "admin", "email": "admin@sciencestudio.com", "password": "admin123", "isApproved": true, "createdAt": "2026-07-22T01:24:32.407Z"}'::jsonb),
  ('usr_student', 'Afridi Hasan', 'student@sciencestudio.com', 'student', true, '01800000000', 'HSC 1st Year', '', '["পদার্থবিজ্ঞান ১ম পত্র - ভেক্টর ও বলবিদ্যা Masterclass"]'::jsonb, '', '', '', '{"id": "usr_student", "name": "Afridi Hasan", "role": "student", "email": "student@sciencestudio.com", "password": "student123", "isApproved": true, "studentClass": "HSC 1st Year", "createdAt": "2026-07-22T01:24:32.407Z"}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  is_approved = EXCLUDED.is_approved,
  student_class = EXCLUDED.student_class,
  photo_url = EXCLUDED.photo_url,
  enrolled_courses = EXCLUDED.enrolled_courses,
  data = EXCLUDED.data,
  updated_at = now();

-- Seed Video Classes Data
INSERT INTO public.app_classes (id, title, subject, video_url, thumbnail_url, course_id, course_title, description, data)
VALUES
  ('cls_1', 'Introduction to Quantum Mechanics', 'Physics', 'https://www.youtube.com/embed/Us8M_M3fRmo', '', '', '', 'In this session, we explore the basics of Quantum Mechanics, wave-particle duality, and Heisenberg''s Uncertainty Principle.', '{"id": "cls_1", "title": "Introduction to Quantum Mechanics", "subject": "Physics", "videoUrl": "https://www.youtube.com/embed/Us8M_M3fRmo", "description": "In this session, we explore the basics of Quantum Mechanics, wave-particle duality, and Heisenberg''s Uncertainty Principle."}'::jsonb),
  ('cls_2', 'Organic Chemistry: Carbon Compounds & Hybridization', 'Chemistry', 'https://www.youtube.com/embed/H0f3B_YAn4o', '', '', '', 'Deep dive into carbon structures, SP3/SP2/SP hybridization, and the basic principles of organic reactions.', '{"id": "cls_2", "title": "Organic Chemistry: Carbon Compounds & Hybridization", "subject": "Chemistry", "videoUrl": "https://www.youtube.com/embed/H0f3B_YAn4o", "description": "Deep dive into carbon structures, SP3/SP2/SP hybridization, and the basic principles of organic reactions."}'::jsonb),
  ('cls_3', 'Cell Division & Mitotic Phases', 'Biology', 'https://www.youtube.com/embed/f-ldPgEfAHI', '', '', '', 'An illustrated lecture of mitosis and meiosis. Perfect for visualizing the lifecycle of eukaryotic cells.', '{"id": "cls_3", "title": "Cell Division & Mitotic Phases", "subject": "Biology", "videoUrl": "https://www.youtube.com/embed/f-ldPgEfAHI", "description": "An illustrated lecture of mitosis and meiosis. Perfect for visualizing the lifecycle of eukaryotic cells."}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  subject = EXCLUDED.subject,
  video_url = EXCLUDED.video_url,
  thumbnail_url = EXCLUDED.thumbnail_url,
  course_id = EXCLUDED.course_id,
  course_title = EXCLUDED.course_title,
  description = EXCLUDED.description,
  data = EXCLUDED.data,
  updated_at = now();

-- Seed Lecture Notes Data
INSERT INTO public.app_notes (id, title, subject, pdf_url, description, course_id, course_title, data)
VALUES
  ('nte_1', 'Quantum Physics Formula Sheet & Core Concepts', 'Physics', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'A comprehensive reference sheet containing fundamental quantum equations, Schrödinger operators, and notes.', '', '', '{"id": "nte_1", "title": "Quantum Physics Formula Sheet & Core Concepts", "subject": "Physics", "pdfUrl": "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", "description": "A comprehensive reference sheet containing fundamental quantum equations, Schrödinger operators, and notes."}'::jsonb),
  ('nte_2', 'Alkanes, Alkenes, and Alkynes Functional Groups Guide', 'Chemistry', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'Essential reaction pathways and naming conventions (IUPAC rules) for hydrocarbons.', '', '', '{"id": "nte_2", "title": "Alkanes, Alkenes, and Alkynes Functional Groups Guide", "subject": "Chemistry", "pdfUrl": "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", "description": "Essential reaction pathways and naming conventions (IUPAC rules) for hydrocarbons."}'::jsonb),
  ('nte_3', 'DNA Replication & Enzyme Functions Study Note', 'Biology', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'Step-by-step notes covering helicase, DNA polymerase, RNA primase, ligase and okazaki fragments.', '', '', '{"id": "nte_3", "title": "DNA Replication & Enzyme Functions Study Note", "subject": "Biology", "pdfUrl": "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", "description": "Step-by-step notes covering helicase, DNA polymerase, RNA primase, ligase and okazaki fragments."}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  subject = EXCLUDED.subject,
  pdf_url = EXCLUDED.pdf_url,
  description = EXCLUDED.description,
  course_id = EXCLUDED.course_id,
  course_title = EXCLUDED.course_title,
  data = EXCLUDED.data,
  updated_at = now();

-- Seed Courses Data
INSERT INTO public.app_courses (id, title, subject, class_level, price, original_price, duration, description, features, image_url, data)
VALUES
  ('crs_1', 'পদার্থবিজ্ঞান ১ম পত্র: স্পেশাল মাস্টারব্যাচ ২০২৬', 'Physics', 'HSC', 1500, 2000, '৩ মাস (৫০+ লাইভ ও রেকর্ডেড ক্লাস)', 'এইচএসসি ও এডমিশন পরীক্ষার্থীদের জন্য সাকিব স্যারের বিশেষ পদার্থবিজ্ঞান কোর্স। সম্পূর্ণ সিলেবাস কভার ও প্রবলেম সলভিং মাস্টারক্লাস।', '["৫০+ ইন্টারেক্টিভ ভিডিও ক্লাস", "অধ্যায়ভিত্তিক সাজানো PDF শিট", "সাপ্তাহিক অনলাইন পরীক্ষা", "২৪/৭ ডাউট সলভিং মেন্টরশিপ"]'::jsonb, 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=800&auto=format&fit=crop&q=80', '{"id": "crs_1", "title": "পদার্থবিজ্ঞান ১ম পত্র: স্পেশাল মাস্টারব্যাচ ২০২৬", "subject": "Physics", "price": 1500, "originalPrice": 2000, "duration": "৩ মাস (৫০+ লাইভ ও রেকর্ডেড ক্লাস)", "features": ["৫০+ ইন্টারেক্টিভ ভিডিও ক্লাস", "অধ্যায়ভিত্তিক সাজানো PDF শিট", "সাপ্তাহিক অনলাইন পরীক্ষা", "২৪/৭ ডাউট সলভিং মেন্টরশিপ"]}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  subject = EXCLUDED.subject,
  class_level = EXCLUDED.class_level,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  duration = EXCLUDED.duration,
  description = EXCLUDED.description,
  features = EXCLUDED.features,
  image_url = EXCLUDED.image_url,
  data = EXCLUDED.data,
  updated_at = now();

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

-- Seed Settings Singleton Configuration
INSERT INTO public.settings (id, config)
VALUES (
  1,
  '{
    "academyName": "SCIENCE STUDIO by Sakib",
    "announcement": "ADMISSIONS NOW OPEN FOR ACADEMIC YEAR 2026",
    "heroTitle": "Innovate, Educate & Explore with Science Studio by Sakib",
    "heroSubtitle": "বিজ্ঞান চর্চাকে সহজ, আনন্দদায়ক এবং প্রযুক্তিনির্ভর করতে সাকিব স্যারের এই বিশেষ উদ্যোগ।",
    "heroSubEnglish": "Experience premium science coaching with high-fidelity interactive simulation play desks, curated video masterclasses, and concise PDF materials by Sakib Sir.",
    "heroJoinButtonText": "ভর্তি হন / রেজিস্ট্রেশন করুন",
    "heroExploreButtonText": "এক্সপ্লোর ফিচার",
    "subjects": ["Physics", "Chemistry", "Biology", "Mathematics", "General Science"],
    "contactPhone": "+৮৮০ ১৭০০-০০০০০০, +৮৮০ ১৯০০-০০০০০০",
    "contactEmail": "support@sciencestudio.com",
    "contactAddress": "বিজ্ঞান পার্ক রোড, ফার্মগেট, ঢাকা - ১২১৫",
    "footerDescription": "সাকিব স্যারের তত্ত্ববধানে পরিচালিত একটি আধুনিক ও প্রযুক্তিনির্ভর বিজ্ঞান শিক্ষা কেন্দ্র।",
    "adminName": "সাকিব হাসান (Sakib Hasan)",
    "adminBio": "পদার্থবিজ্ঞান ও গণিত শিক্ষায় ৭+ বছরের অভিজ্ঞতা সম্পন্ন একজন নিবেদিতপ্রাণ শিক্ষক।",
    "adminPhotoUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=60",
    "adminDesignation": "Founder & Chief Mentor",
    "adminEducation": "বি.এস.সি. (ইঞ্জিনিয়ারিং), বুয়েট (BUET)"
  }'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  config = EXCLUDED.config,
  updated_at = now();

-- -----------------------------------------------------------------------------
-- 6. AUTOMATIC AUTH USER DELETION TRIGGER & RPC
-- -----------------------------------------------------------------------------

-- Trigger function to delete user from Supabase Authentication (auth.users) when deleted from app_users
CREATE OR REPLACE FUNCTION public.handle_delete_app_user()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM auth.users WHERE email = OLD.email;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_app_user_deleted ON public.app_users;

CREATE TRIGGER on_app_user_deleted
  AFTER DELETE ON public.app_users
  FOR EACH ROW EXECUTE FUNCTION public.handle_delete_app_user();

-- RPC function to delete user directly from auth.users by email
CREATE OR REPLACE FUNCTION public.delete_auth_user(target_email TEXT)
RETURNS VOID AS $$
BEGIN
  DELETE FROM auth.users WHERE email = target_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

