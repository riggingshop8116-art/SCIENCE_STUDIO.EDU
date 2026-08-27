-- =============================================================================
-- SUPABASE POSTGRESQL SCHEMA & COMPLETE DATA ENTRY FOR SCIENCE STUDIO
-- =============================================================================
-- Run this complete script in your Supabase SQL Editor (https://supabase.com -> Project -> SQL Editor).
-- It creates all required tables, adds missing columns with ALTER TABLE, enables RLS with public access, and seeds initial data.

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------------------------------
-- 2. CREATE / UPDATE TABLES & COLUMNS
-- -----------------------------------------------------------------------------

-- App Users Table (Students, Admins, Profile details, Payments, Enrolled Courses)
CREATE TABLE IF NOT EXISTS public.app_users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'student',
  is_approved BOOLEAN DEFAULT false,
  phone TEXT DEFAULT '',
  student_class TEXT DEFAULT '',
  student_roll TEXT DEFAULT '',
  photo_url TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  course TEXT DEFAULT '',
  enrolled_courses JSONB DEFAULT '[]'::jsonb,
  transaction_id TEXT DEFAULT '',
  payment_method TEXT DEFAULT '',
  sender_phone TEXT DEFAULT '',
  payment_amount NUMERIC DEFAULT 0,
  data JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.app_users ADD COLUMN IF NOT EXISTS phone TEXT DEFAULT '';
ALTER TABLE public.app_users ADD COLUMN IF NOT EXISTS student_class TEXT DEFAULT '';
ALTER TABLE public.app_users ADD COLUMN IF NOT EXISTS student_roll TEXT DEFAULT '';
ALTER TABLE public.app_users ADD COLUMN IF NOT EXISTS photo_url TEXT DEFAULT '';
ALTER TABLE public.app_users ADD COLUMN IF NOT EXISTS avatar_url TEXT DEFAULT '';
ALTER TABLE public.app_users ADD COLUMN IF NOT EXISTS course TEXT DEFAULT '';
ALTER TABLE public.app_users ADD COLUMN IF NOT EXISTS enrolled_courses JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.app_users ADD COLUMN IF NOT EXISTS transaction_id TEXT DEFAULT '';
ALTER TABLE public.app_users ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT '';
ALTER TABLE public.app_users ADD COLUMN IF NOT EXISTS sender_phone TEXT DEFAULT '';
ALTER TABLE public.app_users ADD COLUMN IF NOT EXISTS payment_amount NUMERIC DEFAULT 0;
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

-- Payments Table (Tracks individual course payment transactions)
CREATE TABLE IF NOT EXISTS public.app_payments (
  id TEXT PRIMARY KEY,
  user_id TEXT DEFAULT '',
  user_name TEXT DEFAULT '',
  user_email TEXT DEFAULT '',
  user_phone TEXT DEFAULT '',
  course_title TEXT DEFAULT '',
  course_id TEXT DEFAULT '',
  transaction_id TEXT DEFAULT '',
  payment_method TEXT DEFAULT '',
  sender_phone TEXT DEFAULT '',
  amount NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'pending',
  data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.app_payments ADD COLUMN IF NOT EXISTS user_id TEXT DEFAULT '';
ALTER TABLE public.app_payments ADD COLUMN IF NOT EXISTS user_name TEXT DEFAULT '';
ALTER TABLE public.app_payments ADD COLUMN IF NOT EXISTS user_email TEXT DEFAULT '';
ALTER TABLE public.app_payments ADD COLUMN IF NOT EXISTS user_phone TEXT DEFAULT '';
ALTER TABLE public.app_payments ADD COLUMN IF NOT EXISTS course_title TEXT DEFAULT '';
ALTER TABLE public.app_payments ADD COLUMN IF NOT EXISTS course_id TEXT DEFAULT '';
ALTER TABLE public.app_payments ADD COLUMN IF NOT EXISTS transaction_id TEXT DEFAULT '';
ALTER TABLE public.app_payments ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT '';
ALTER TABLE public.app_payments ADD COLUMN IF NOT EXISTS sender_phone TEXT DEFAULT '';
ALTER TABLE public.app_payments ADD COLUMN IF NOT EXISTS amount NUMERIC DEFAULT 0;
ALTER TABLE public.app_payments ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE public.app_payments ADD COLUMN IF NOT EXISTS data JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.app_payments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());

-- Hero Banners Table (Custom Hero Section Banners & Carousel Slides)
CREATE TABLE IF NOT EXISTS public.app_hero_banners (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT DEFAULT '',
  badge TEXT DEFAULT '',
  tag TEXT DEFAULT '',
  image TEXT DEFAULT '',
  subject TEXT DEFAULT '',
  accent_gradient TEXT DEFAULT '',
  border_glow TEXT DEFAULT '',
  glow_color TEXT DEFAULT '',
  action_button_text TEXT DEFAULT '',
  action_button_link TEXT DEFAULT '',
  is_active BOOLEAN DEFAULT true,
  banner_order INT DEFAULT 0,
  data JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.app_hero_banners ADD COLUMN IF NOT EXISTS subtitle TEXT DEFAULT '';
ALTER TABLE public.app_hero_banners ADD COLUMN IF NOT EXISTS badge TEXT DEFAULT '';
ALTER TABLE public.app_hero_banners ADD COLUMN IF NOT EXISTS tag TEXT DEFAULT '';
ALTER TABLE public.app_hero_banners ADD COLUMN IF NOT EXISTS image TEXT DEFAULT '';
ALTER TABLE public.app_hero_banners ADD COLUMN IF NOT EXISTS subject TEXT DEFAULT '';
ALTER TABLE public.app_hero_banners ADD COLUMN IF NOT EXISTS accent_gradient TEXT DEFAULT '';
ALTER TABLE public.app_hero_banners ADD COLUMN IF NOT EXISTS border_glow TEXT DEFAULT '';
ALTER TABLE public.app_hero_banners ADD COLUMN IF NOT EXISTS glow_color TEXT DEFAULT '';
ALTER TABLE public.app_hero_banners ADD COLUMN IF NOT EXISTS action_button_text TEXT DEFAULT '';
ALTER TABLE public.app_hero_banners ADD COLUMN IF NOT EXISTS action_button_link TEXT DEFAULT '';
ALTER TABLE public.app_hero_banners ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.app_hero_banners ADD COLUMN IF NOT EXISTS banner_order INT DEFAULT 0;
ALTER TABLE public.app_hero_banners ADD COLUMN IF NOT EXISTS data JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.app_hero_banners ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());

-- Classes Table (Video masterclasses, course category, thumbnails)
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

-- Notes Table (PDF Lecture materials, course association)
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

-- Courses Table (Published courses with pricing, duration, class level, features)
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

-- Settings Table (Comprehensive column schema + JSONB backup)
CREATE TABLE IF NOT EXISTS public.settings (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  data JSONB DEFAULT '{}'::jsonb,
  academy_name TEXT DEFAULT '',
  announcement TEXT DEFAULT '',
  hero_title TEXT DEFAULT '',
  hero_subtitle TEXT DEFAULT '',
  hero_sub_english TEXT DEFAULT '',
  hero_join_button_text TEXT DEFAULT '',
  hero_explore_button_text TEXT DEFAULT '',
  hero_classroom_bg_url TEXT DEFAULT '',
  hero_badge_text TEXT DEFAULT '',
  announcement_badge TEXT DEFAULT '',
  marquee_notice_2 TEXT DEFAULT '',
  marquee_notice_3 TEXT DEFAULT '',
  marquee_notice_4 TEXT DEFAULT '',
  marquee_notice_5 TEXT DEFAULT '',
  subjects JSONB DEFAULT '[]'::jsonb,
  class_levels JSONB DEFAULT '[]'::jsonb,
  course_durations JSONB DEFAULT '[]'::jsonb,
  default_course_features JSONB DEFAULT '[]'::jsonb,
  contact_phone TEXT DEFAULT '',
  contact_email TEXT DEFAULT '',
  contact_address TEXT DEFAULT '',
  footer_description TEXT DEFAULT '',
  routine JSONB DEFAULT '[]'::jsonb,
  academy_logo_url TEXT DEFAULT '',
  admin_name TEXT DEFAULT '',
  admin_bio TEXT DEFAULT '',
  admin_photo_url TEXT DEFAULT '',
  admin_designation TEXT DEFAULT '',
  admin_education TEXT DEFAULT '',
  bkash_number TEXT DEFAULT '',
  nagad_number TEXT DEFAULT '',
  rocket_number TEXT DEFAULT '',
  payment_instructions TEXT DEFAULT '',
  facebook_url TEXT DEFAULT '',
  youtube_url TEXT DEFAULT '',
  telegram_url TEXT DEFAULT '',
  whatsapp_number TEXT DEFAULT '',
  helpline_time TEXT DEFAULT '',
  orbit_section_badge TEXT DEFAULT '',
  orbit_section_title TEXT DEFAULT '',
  orbit_section_subtitle TEXT DEFAULT '',
  orbit_auto_rotate BOOLEAN DEFAULT true,
  orbit_speed_seconds NUMERIC DEFAULT 6,
  insights_total_students TEXT DEFAULT '',
  insights_active_percent TEXT DEFAULT '',
  insights_success_rate TEXT DEFAULT '',
  insights_success_rate_label TEXT DEFAULT '',
  insights_total_courses TEXT DEFAULT '',
  insights_total_notes TEXT DEFAULT '',
  insights_bullet_1 TEXT DEFAULT '',
  insights_bullet_2 TEXT DEFAULT '',
  insights_bullet_3 TEXT DEFAULT '',
  insights_register_button_text TEXT DEFAULT '',
  pillars_section_badge TEXT DEFAULT '',
  pillars_section_title TEXT DEFAULT '',
  pillars_section_subtitle TEXT DEFAULT '',
  pillar_1_title TEXT DEFAULT '',
  pillar_1_badge TEXT DEFAULT '',
  pillar_1_description TEXT DEFAULT '',
  pillar_2_title TEXT DEFAULT '',
  pillar_2_badge TEXT DEFAULT '',
  pillar_2_description TEXT DEFAULT '',
  pillar_3_title TEXT DEFAULT '',
  pillar_3_badge TEXT DEFAULT '',
  pillar_3_description TEXT DEFAULT '',
  mentor_experience TEXT DEFAULT '',
  mentor_guidance TEXT DEFAULT '',
  lab_section_badge TEXT DEFAULT '',
  lab_section_title TEXT DEFAULT '',
  lab_section_subtitle TEXT DEFAULT '',
  hero_banners JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Add all settings columns dynamically if table already exists
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS config JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS data JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS academy_name TEXT DEFAULT '';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS announcement TEXT DEFAULT '';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS hero_title TEXT DEFAULT '';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS hero_subtitle TEXT DEFAULT '';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS hero_sub_english TEXT DEFAULT '';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS hero_join_button_text TEXT DEFAULT '';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS hero_explore_button_text TEXT DEFAULT '';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS hero_classroom_bg_url TEXT DEFAULT '';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS hero_badge_text TEXT DEFAULT '';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS announcement_badge TEXT DEFAULT '';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS marquee_notice_2 TEXT DEFAULT '';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS marquee_notice_3 TEXT DEFAULT '';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS marquee_notice_4 TEXT DEFAULT '';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS marquee_notice_5 TEXT DEFAULT '';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS subjects JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS class_levels JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS course_durations JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS default_course_features JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS contact_phone TEXT DEFAULT '';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS contact_email TEXT DEFAULT '';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS contact_address TEXT DEFAULT '';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS footer_description TEXT DEFAULT '';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS routine JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS academy_logo_url TEXT DEFAULT '';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS admin_name TEXT DEFAULT '';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS admin_bio TEXT DEFAULT '';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS admin_photo_url TEXT DEFAULT '';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS admin_designation TEXT DEFAULT '';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS admin_education TEXT DEFAULT '';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS bkash_number TEXT DEFAULT '';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS nagad_number TEXT DEFAULT '';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS rocket_number TEXT DEFAULT '';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS payment_instructions TEXT DEFAULT '';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS facebook_url TEXT DEFAULT '';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS youtube_url TEXT DEFAULT '';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS telegram_url TEXT DEFAULT '';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS whatsapp_number TEXT DEFAULT '';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS helpline_time TEXT DEFAULT '';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS orbit_section_badge TEXT DEFAULT '';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS orbit_section_title TEXT DEFAULT '';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS orbit_section_subtitle TEXT DEFAULT '';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS orbit_auto_rotate BOOLEAN DEFAULT true;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS orbit_speed_seconds NUMERIC DEFAULT 6;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS insights_total_students TEXT DEFAULT '';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS insights_active_percent TEXT DEFAULT '';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS insights_success_rate TEXT DEFAULT '';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS insights_success_rate_label TEXT DEFAULT '';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS insights_total_courses TEXT DEFAULT '';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS insights_total_notes TEXT DEFAULT '';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS insights_bullet_1 TEXT DEFAULT '';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS insights_bullet_2 TEXT DEFAULT '';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS insights_bullet_3 TEXT DEFAULT '';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS insights_register_button_text TEXT DEFAULT '';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS pillars_section_badge TEXT DEFAULT '';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS pillars_section_title TEXT DEFAULT '';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS pillars_section_subtitle TEXT DEFAULT '';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS pillar_1_title TEXT DEFAULT '';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS pillar_1_badge TEXT DEFAULT '';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS pillar_1_description TEXT DEFAULT '';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS pillar_2_title TEXT DEFAULT '';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS pillar_2_badge TEXT DEFAULT '';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS pillar_2_description TEXT DEFAULT '';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS pillar_3_title TEXT DEFAULT '';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS pillar_3_badge TEXT DEFAULT '';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS pillar_3_description TEXT DEFAULT '';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS mentor_experience TEXT DEFAULT '';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS mentor_guidance TEXT DEFAULT '';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS lab_section_badge TEXT DEFAULT '';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS lab_section_title TEXT DEFAULT '';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS lab_section_subtitle TEXT DEFAULT '';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS hero_banners JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());

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
ALTER TABLE public.app_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_hero_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routine ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public full access app_users" ON public.app_users;
DROP POLICY IF EXISTS "Public full access app_payments" ON public.app_payments;
DROP POLICY IF EXISTS "Public full access app_hero_banners" ON public.app_hero_banners;
DROP POLICY IF EXISTS "Public full access app_classes" ON public.app_classes;
DROP POLICY IF EXISTS "Public full access app_notes" ON public.app_notes;
DROP POLICY IF EXISTS "Public full access app_courses" ON public.app_courses;
DROP POLICY IF EXISTS "Public full access settings" ON public.settings;
DROP POLICY IF EXISTS "Public full access routine" ON public.routine;

CREATE POLICY "Public full access app_users" ON public.app_users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access app_payments" ON public.app_payments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access app_hero_banners" ON public.app_hero_banners FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access app_classes" ON public.app_classes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access app_notes" ON public.app_notes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access app_courses" ON public.app_courses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access settings" ON public.settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access routine" ON public.routine FOR ALL USING (true) WITH CHECK (true);

-- -----------------------------------------------------------------------------
-- 4. STORAGE BUCKETS & POLICIES (for Videos, Images & PDFs)
-- -----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('course-videos', 'course-videos', true),
  ('course-images', 'course-images', true),
  ('pdf-materials', 'pdf-materials', true)
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
INSERT INTO public.app_users (id, name, email, role, is_approved, phone, student_class, photo_url, avatar_url, enrolled_courses, transaction_id, payment_method, sender_phone, payment_amount, data)
VALUES 
  ('usr_super_admin', 'সাকিব হাসান (Super Admin)', 'mdshakibhossen2050@gmail.com', 'admin', true, '01700000000', 'Founder & Faculty', '', '', '[]'::jsonb, '', '', '', 0, '{"id": "usr_super_admin", "name": "সাকিব হাসান (Super Admin)", "role": "admin", "email": "mdshakibhossen2050@gmail.com", "password": "SHAKIB@2050#", "isApproved": true, "createdAt": "2026-07-22T01:24:32.407Z"}'::jsonb),
  ('usr_admin', 'Dr. Sayeed Rahman', 'admin@sciencestudio.com', 'admin', true, '01700000000', 'Faculty', '', '', '[]'::jsonb, '', '', '', 0, '{"id": "usr_admin", "name": "Dr. Sayeed Rahman", "role": "admin", "email": "admin@sciencestudio.com", "password": "admin123", "isApproved": true, "createdAt": "2026-07-22T01:24:32.407Z"}'::jsonb),
  ('usr_student', 'Afridi Hasan', 'student@sciencestudio.com', 'student', true, '01800000000', 'HSC 1st Year', '', '', '["পদার্থবিজ্ঞান ১ম পত্র: স্পেশাল মাস্টারব্যাচ ২০২৬"]'::jsonb, 'TRX987654321', 'bKash', '01800000000', 1500, '{"id": "usr_student", "name": "Afridi Hasan", "role": "student", "email": "student@sciencestudio.com", "password": "student123", "isApproved": true, "studentClass": "HSC 1st Year", "createdAt": "2026-07-22T01:24:32.407Z"}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  is_approved = EXCLUDED.is_approved,
  phone = EXCLUDED.phone,
  student_class = EXCLUDED.student_class,
  photo_url = EXCLUDED.photo_url,
  avatar_url = EXCLUDED.avatar_url,
  enrolled_courses = EXCLUDED.enrolled_courses,
  transaction_id = EXCLUDED.transaction_id,
  payment_method = EXCLUDED.payment_method,
  sender_phone = EXCLUDED.sender_phone,
  payment_amount = EXCLUDED.payment_amount,
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

-- Seed Settings Configuration
INSERT INTO public.settings (
  id, 
  academy_name, 
  announcement, 
  hero_title, 
  hero_subtitle, 
  hero_sub_english, 
  hero_join_button_text, 
  hero_explore_button_text, 
  subjects, 
  class_levels, 
  course_durations, 
  default_course_features, 
  contact_phone, 
  contact_email, 
  contact_address, 
  footer_description, 
  admin_name, 
  admin_bio, 
  admin_photo_url, 
  admin_designation, 
  admin_education, 
  bkash_number, 
  nagad_number, 
  rocket_number, 
  payment_instructions,
  orbit_section_badge,
  orbit_section_title,
  orbit_section_subtitle,
  orbit_auto_rotate,
  orbit_speed_seconds,
  insights_total_students,
  insights_active_percent,
  insights_success_rate,
  insights_success_rate_label,
  insights_total_courses,
  insights_total_notes,
  insights_bullet_1,
  insights_bullet_2,
  insights_bullet_3,
  insights_register_button_text,
  pillars_section_badge,
  pillars_section_title,
  pillars_section_subtitle,
  pillar_1_title,
  pillar_1_badge,
  pillar_1_description,
  pillar_2_title,
  pillar_2_badge,
  pillar_2_description,
  pillar_3_title,
  pillar_3_badge,
  pillar_3_description,
  mentor_experience,
  mentor_guidance,
  hero_badge_text,
  announcement_badge,
  helpline_time,
  lab_section_badge,
  lab_section_subtitle,
  config
)
VALUES (
  1,
  'SCIENCE STUDIO by Sakib',
  'ADMISSIONS NOW OPEN FOR ACADEMIC YEAR 2026',
  'Innovate, Educate & Explore with Science Studio by Sakib',
  'বিজ্ঞান চর্চাকে সহজ, আনন্দদায়ক এবং প্রযুক্তিনির্ভর করতে সাকিব স্যারের এই বিশেষ উদ্যোগ।',
  'Experience premium science coaching with high-fidelity interactive simulation play desks, curated video masterclasses, and concise PDF materials by Sakib Sir.',
  'ভর্তি হন / রেজিস্ট্রেশন করুন',
  'এক্সপ্লোর ফিচার',
  '["Physics", "Chemistry", "Biology", "Mathematics", "General Science"]'::jsonb,
  '["HSC", "HSC 1st Year", "HSC 2nd Year", "Class 9-10 (SSC)", "Class 10", "Class 9", "Class 8", "Admission Test"]'::jsonb,
  '["০৬ মাস (২৪টি লাইভ ক্লাস)", "১২ মাস (ফুল একাডেমিক কোর্স)", "০৩ মাস (ক্র্যাশ কোর্স)", "১৫ দিন (স্পেশাল রিভিশন)"]'::jsonb,
  '["রেকর্ডেড ও লাইভ ভিডিও ক্লাস", "অধ্যায়ভিত্তিক এইচডি পিডিএফ লেকচার শিট", "সাপ্তাহিক অনলাইন প্র্যাকটিস কুইজ ও এক্সাম", "২৪/৭ ডাউট সলভিং ও মেন্টর সাপোর্ট"]'::jsonb,
  '+৮৮০ ১৭০০-০০০০০০, +৮৮০ ১৯০০-০০০০০০',
  'support@sciencestudio.com',
  'বিজ্ঞান পার্ক রোড, ফার্মগেট, ঢাকা - ১২১৫',
  'সাকিব স্যারের তত্ত্ববধানে পরিচালিত একটি আধুনিক ও প্রযুক্তিনির্ভর বিজ্ঞান শিক্ষা কেন্দ্র।',
  'সাকিব হাসান (Sakib Hasan)',
  'পদার্থবিজ্ঞান ও গণিত শিক্ষায় ৭+ বছরের অভিজ্ঞতা সম্পন্ন একজন নিবেদিতপ্রাণ শিক্ষক।',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=60',
  'Founder & Chief Mentor',
  'বি.এস.সি. (ইঞ্জিনিয়ারিং), বুয়েট (BUET)',
  '+৮৮০ ১৭০০-০০০০০০',
  '+৮৮০ ১৭০০-০০০০০০',
  '+৮৮০ ১৭০০-০০০০০০',
  'বিকাশ, নগদ বা রকেট পার্সোনাল নম্বরে সেন্ড মানি করুন এবং ট্রানজেকশন আইডি প্রদান করুন।',
  'ACADEMY SHOWCASE & INTERACTIVE ORBIT',
  'সাকিব স্যারের পাবলিশড কোর্সসমূহ ও একাডেমি ইকোসিস্টেম',
  'বিজ্ঞানকে ভিজ্যুয়াল ল্যাব ও আধুনিক প্রযুক্তির মাধ্যমে অনুধাবন করো।',
  true,
  6,
  '১,৪৫০+',
  '৯৮%',
  '৯৯.২%',
  'প্লাস পাওয়ার হার',
  '১৪+',
  '৩৫০+',
  'সাকিব স্যারের নিজস্ব থ্রিডি ভিজ্যুয়াল ল্যাব সেশন',
  '২৪/৭ অনলাইন ও অফলাইন স্পেশাল ডাউট সলভ',
  'এইচএসসি ও অ্যাডমিশন ফোকাসড মডেল টেস্ট',
  'ফ্রী রেজিস্ট্রেশন ও ক্লাস অ্যাক্সেস পান',
  'LEADERSHIP & PEDAGOGY PILLARS',
  'সাকিব স্যারের একাডেমি ও মেন্টরশিপের মূল স্তম্ভসমূহ',
  'ব্যক্তিগত যত্ন, আধুনিক প্রযুক্তি এবং নিরবচ্ছিন্ন নির্দেশনার মাধ্যমে প্রতিটি শিক্ষার্থীকে পৌঁছে দেওয়া হয় তাদের কাঙ্ক্ষিত সফলতায়।',
  'ইন্টারেক্টিভ ভিডিও ও সিমুলেশন ক্লাস',
  '3D LAB RECORDED',
  'যেকোনো জটিল বৈজ্ঞানিক টপিক সহজে ভিজ্যুয়ালাইজ করার জন্য রয়েছে প্রিমিয়াম এইচডি ভিডিও ক্লাস।',
  'অধ্যায়ভিত্তিক PDF নোট ও ফর্মুলা বুক',
  '৩৫+ শিট',
  'পরীক্ষার দ্রুত ও নির্ভুল রিভিশনের জন্য প্রতিটি অধ্যায়ের শেষে ডাউনলোডযোগ্য রঙিন হ্যান্ডরাইটিং শিট।',
  '২৪/৭ মেন্টর সাপোর্ট ও ডাউট সলভ ডেস্ক',
  'LIVE ASSISTANCE',
  'পড়ালেখার যেকোনো অস্পষ্টতায় সরাসরি প্রশ্ন করার সুযোগ এবং শিক্ষার্থীর অগ্রগতি ট্র্যাকিং।',
  '১০+ বছরের অভিজ্ঞতা',
  '১০০% পার্সোনাল গাইডেন্স',
  'প্রযুক্তিনির্ভর আধুনিক বিজ্ঞান একাডেমি • SCIENCE STUDIO',
  'নির্দেশনা ও নোটিশ',
  'সকাল ৯:০০ - রাত ১০:০০ (প্রতিদিন)',
  'INTERACTIVE VIRTUAL LAB & PLAYGROUND',
  'পড়াশোনা হোক আনন্দের ও গবেষণাধর্মী! পদার্থ, রসায়ন, জীববিজ্ঞান ও গণিতের গুরুত্বপূর্ণ টপিকগুলো নিজে পরিবর্তন করে প্র্যাকটিক্যাল জ্ঞান অর্জন করুন।',
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
  academy_name = EXCLUDED.academy_name,
  announcement = EXCLUDED.announcement,
  hero_title = EXCLUDED.hero_title,
  hero_subtitle = EXCLUDED.hero_subtitle,
  hero_sub_english = EXCLUDED.hero_sub_english,
  hero_join_button_text = EXCLUDED.hero_join_button_text,
  hero_explore_button_text = EXCLUDED.hero_explore_button_text,
  subjects = EXCLUDED.subjects,
  class_levels = EXCLUDED.class_levels,
  course_durations = EXCLUDED.course_durations,
  default_course_features = EXCLUDED.default_course_features,
  contact_phone = EXCLUDED.contact_phone,
  contact_email = EXCLUDED.contact_email,
  contact_address = EXCLUDED.contact_address,
  footer_description = EXCLUDED.footer_description,
  admin_name = EXCLUDED.admin_name,
  admin_bio = EXCLUDED.admin_bio,
  admin_photo_url = EXCLUDED.admin_photo_url,
  admin_designation = EXCLUDED.admin_designation,
  admin_education = EXCLUDED.admin_education,
  bkash_number = EXCLUDED.bkash_number,
  nagad_number = EXCLUDED.nagad_number,
  rocket_number = EXCLUDED.rocket_number,
  payment_instructions = EXCLUDED.payment_instructions,
  orbit_section_badge = EXCLUDED.orbit_section_badge,
  orbit_section_title = EXCLUDED.orbit_section_title,
  orbit_section_subtitle = EXCLUDED.orbit_section_subtitle,
  orbit_auto_rotate = EXCLUDED.orbit_auto_rotate,
  orbit_speed_seconds = EXCLUDED.orbit_speed_seconds,
  insights_total_students = EXCLUDED.insights_total_students,
  insights_active_percent = EXCLUDED.insights_active_percent,
  insights_success_rate = EXCLUDED.insights_success_rate,
  insights_success_rate_label = EXCLUDED.insights_success_rate_label,
  insights_total_courses = EXCLUDED.insights_total_courses,
  insights_total_notes = EXCLUDED.insights_total_notes,
  insights_bullet_1 = EXCLUDED.insights_bullet_1,
  insights_bullet_2 = EXCLUDED.insights_bullet_2,
  insights_bullet_3 = EXCLUDED.insights_bullet_3,
  insights_register_button_text = EXCLUDED.insights_register_button_text,
  pillars_section_badge = EXCLUDED.pillars_section_badge,
  pillars_section_title = EXCLUDED.pillars_section_title,
  pillars_section_subtitle = EXCLUDED.pillars_section_subtitle,
  pillar_1_title = EXCLUDED.pillar_1_title,
  pillar_1_badge = EXCLUDED.pillar_1_badge,
  pillar_1_description = EXCLUDED.pillar_1_description,
  pillar_2_title = EXCLUDED.pillar_2_title,
  pillar_2_badge = EXCLUDED.pillar_2_badge,
  pillar_2_description = EXCLUDED.pillar_2_description,
  pillar_3_title = EXCLUDED.pillar_3_title,
  pillar_3_badge = EXCLUDED.pillar_3_badge,
  pillar_3_description = EXCLUDED.pillar_3_description,
  mentor_experience = EXCLUDED.mentor_experience,
  mentor_guidance = EXCLUDED.mentor_guidance,
  hero_badge_text = EXCLUDED.hero_badge_text,
  announcement_badge = EXCLUDED.announcement_badge,
  helpline_time = EXCLUDED.helpline_time,
  lab_section_badge = EXCLUDED.lab_section_badge,
  lab_section_subtitle = EXCLUDED.lab_section_subtitle,
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

