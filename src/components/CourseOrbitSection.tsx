import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, BookOpen, Award, FileText, RotateCw, Sparkles, 
  ChevronRight, GraduationCap, CheckCircle2, Atom, 
  Star, ShieldCheck, ArrowRight, Dna, Compass, Zap, Activity, Flame
} from 'lucide-react';
import { Course, Settings } from '../types';
import { SCIENCE_3D_BANNERS } from '../utils/science3DAssets';

interface CourseOrbitSectionProps {
  onJoinClick?: () => void;
  coursesList?: Course[];
  settings?: Settings;
  classesCount?: number;
  notesCount?: number;
}

// Helper to determine subject styling, banner and icon
function getSubjectStyling(subjectName?: string) {
  const name = (subjectName || '').toLowerCase();
  if (name.includes('phys') || name.includes('পদার্থ')) {
    return {
      color: 'from-cyan-500 to-blue-600',
      iconBg: 'bg-cyan-500/20 border-cyan-400/30 text-cyan-300',
      accentColor: 'text-cyan-400',
      banner: SCIENCE_3D_BANNERS.particleAccelerator,
      icon: Atom,
      symbol: '🌌'
    };
  }
  if (name.includes('chem') || name.includes('রসায়ন') || name.includes('রসায়ন')) {
    return {
      color: 'from-emerald-500 to-teal-600',
      iconBg: 'bg-emerald-500/20 border-emerald-400/30 text-emerald-300',
      accentColor: 'text-emerald-400',
      banner: SCIENCE_3D_BANNERS.chemistryHub,
      icon: Zap,
      symbol: '⚛️'
    };
  }
  if (name.includes('bio') || name.includes('জীব')) {
    return {
      color: 'from-rose-500 to-pink-600',
      iconBg: 'bg-rose-500/20 border-rose-400/30 text-rose-300',
      accentColor: 'text-rose-400',
      banner: SCIENCE_3D_BANNERS.bioCell,
      icon: Dna,
      symbol: '🧬'
    };
  }
  if (name.includes('math') || name.includes('গণিত') || name.includes('উচ্চতর')) {
    return {
      color: 'from-amber-500 to-orange-600',
      iconBg: 'bg-amber-500/20 border-amber-400/30 text-amber-300',
      accentColor: 'text-amber-400',
      banner: SCIENCE_3D_BANNERS.mathStudio,
      icon: Compass,
      symbol: '📐'
    };
  }
  if (name.includes('ict') || name.includes('আইসিটি') || name.includes('কম্পিউটার')) {
    return {
      color: 'from-cyan-400 to-teal-500',
      iconBg: 'bg-cyan-400/20 border-cyan-300/30 text-cyan-200',
      accentColor: 'text-cyan-300',
      banner: SCIENCE_3D_BANNERS.laserOptics,
      icon: Activity,
      symbol: '💻'
    };
  }
  return {
    color: 'from-purple-500 to-indigo-600',
    iconBg: 'bg-purple-500/20 border-purple-400/30 text-purple-300',
    accentColor: 'text-purple-400',
    banner: SCIENCE_3D_BANNERS.heroFull,
    icon: Atom,
    symbol: '🔭'
  };
}

// Fallback published courses data if dynamic courses list is empty
const DEFAULT_COURSES: Array<{
  id: string;
  title: string;
  subject: string;
  classLevel: string;
  badge: string;
  enrolled: string;
  rating: number;
  price: string;
  color: string;
  iconBg: string;
  banner: string;
  fallbackBanner?: string;
  icon: any;
  symbol: string;
  description: string;
  features: string[];
}> = [
  {
    id: 'c-physics-master',
    title: 'HSC Physics 3D Simulation Masterclass',
    subject: 'পদার্থবিজ্ঞান',
    classLevel: 'একাদশ - দ্বাদশ শ্রেণি',
    badge: 'সেরা সেলার',
    enrolled: '৪৫০+ শিক্ষার্থী',
    rating: 4.9,
    price: '৳ ১২৫০',
    color: 'from-cyan-500 to-blue-600',
    iconBg: 'bg-cyan-500/20 border-cyan-400/30 text-cyan-300',
    banner: SCIENCE_3D_BANNERS.particleAccelerator,
    fallbackBanner: SCIENCE_3D_BANNERS.particleAccelerator,
    icon: Atom,
    symbol: '🌌',
    description: 'ভেক্টর, গতিবিদ্যা ও তরঙ্গ বিজ্ঞানের শতভাগ ভিজ্যুয়াল ল্যাব সিমুলেশনসহ এ টু জেড কোর্স।',
    features: ['৩০+ থ্রিডি ল্যাব ক্লাস', 'অধ্যায়ভিত্তিক PDF নোট', 'প্রতি সপ্তাহে লাইভ ডাউট সলভ']
  },
  {
    id: 'c-chem-reactor',
    title: 'Chemistry Organic & Inorganic Reactor',
    subject: 'রসায়নবিজ্ঞান',
    classLevel: 'এইচএসসি ও ভর্তি পরীক্ষা',
    badge: 'পপুলার',
    enrolled: '৩৮০+ শিক্ষার্থী',
    rating: 4.8,
    price: '৳ ১২০০',
    color: 'from-emerald-500 to-teal-600',
    iconBg: 'bg-emerald-500/20 border-emerald-400/30 text-emerald-300',
    banner: SCIENCE_3D_BANNERS.chemistryHub,
    fallbackBanner: SCIENCE_3D_BANNERS.chemistryHub,
    icon: Zap,
    symbol: '⚛️',
    description: 'জৈব রসায়নের মেকানিজম এবং রাসায়নিক বিক্রিয়া মুখস্থ না করে সহজে আয়ত্ত করার স্পেশাল ব্যাচ।',
    features: ['জৈব রাসায়নিক শর্টকাট', 'বোর্ড ও মেডিকেল প্রশ্ন সমাধান', 'হ্যান্ডরাইটিং ফর্মুলা শিট']
  },
  {
    id: 'c-biology-genetics',
    title: 'Biology 3D Anatomy & Cellular Master',
    subject: 'জীববিজ্ঞান',
    classLevel: 'একাদশ - দ্বাদশ শ্রেণি',
    badge: 'হট কোর্স',
    enrolled: '৩১০+ শিক্ষার্থী',
    rating: 4.9,
    price: '৳ ১১৫০',
    color: 'from-rose-500 to-pink-600',
    iconBg: 'bg-rose-500/20 border-rose-400/30 text-rose-300',
    banner: SCIENCE_3D_BANNERS.bioCell,
    fallbackBanner: SCIENCE_3D_BANNERS.bioCell,
    icon: Dna,
    symbol: '🧬',
    description: 'কোষ অঙ্গাণু, ডিএনএ রেপ্লিকেশন ও মানব শারীরতত্ত্বের হাই-ডেফিনিশন এনিমেশন ভিত্তিক প্রিপারেশন।',
    features: ['হাই-রেজুলেশন ডায়াগ্রাম', 'মেডিকেল স্পেশাল গাইড', 'সাপ্তাহিক ওএমআর মডেল টেস্ট']
  },
  {
    id: 'c-math-calculus',
    title: 'Higher Math Calculus & Vector 3D',
    subject: 'উচ্চতর গণিত',
    classLevel: 'এইচএসসি ২০২৬ স্পেশাল',
    badge: 'অ্যাডভান্সড',
    enrolled: '৪২০+ শিক্ষার্থী',
    rating: 4.9,
    price: '৳ ১৩০০',
    color: 'from-amber-500 to-orange-600',
    iconBg: 'bg-amber-500/20 border-amber-400/30 text-amber-300',
    banner: SCIENCE_3D_BANNERS.mathStudio,
    fallbackBanner: SCIENCE_3D_BANNERS.mathStudio,
    icon: Compass,
    symbol: '📐',
    description: 'ডিফারেন্সিয়েশন ও ইন্টিগ্রেশনের ভয় দূর করে ভিজ্যুয়াল গ্রাফিক্স দিয়ে অংক সমাধানের ম্যাজিক প্রযুক্তি।',
    features: ['২০০+ জটিল সমস্যা সমাধান', 'অ্যাডমিশন স্ট্যান্ডার্ড ট্রিকস', 'প্র্যাকটিস প্রবলেম ব্যাংক']
  },
  {
    id: 'c-medical-booster',
    title: 'Medical & University Admission Science Pack',
    subject: 'অ্যাডমিশন স্পেশাল',
    classLevel: 'এইচএসসি পরীক্ষার্থী',
    badge: 'ফ্ল্যাগশিপ',
    enrolled: '৫২০+ শিক্ষার্থী',
    rating: 5.0,
    price: '৳ ১৫০০',
    color: 'from-purple-500 to-indigo-600',
    iconBg: 'bg-purple-500/20 border-purple-400/30 text-purple-300',
    banner: SCIENCE_3D_BANNERS.heroFull,
    fallbackBanner: SCIENCE_3D_BANNERS.heroFull,
    icon: Award,
    symbol: '🏆',
    description: 'বুয়েট, মেডিকেল ও ঢাবি ক-ইউনিটের শীর্ষ স্থান অর্জনের জন্য সাকিব স্যারের পার্সোনাল গাইডলাইন ব্যাচ।',
    features: ['সরাসরি সাকিব স্যারের মেন্টরশিপ', 'ডেইলি ওএমআর অ্যাসেসমেন্ট', 'স্পেশাল প্রশ্ন ব্যাংক সমাধান']
  },
  {
    id: 'c-ict-computer',
    title: 'ICT & Computational Science HSC',
    subject: 'আইসিটি',
    classLevel: 'একাদশ ও দ্বাদশ শ্রেণি',
    badge: 'ফ্রী রিসোর্স সহ',
    enrolled: '২৯০+ শিক্ষার্থী',
    rating: 4.7,
    price: '৳ ৯৯০',
    color: 'from-cyan-400 to-teal-500',
    iconBg: 'bg-cyan-400/20 border-cyan-300/30 text-cyan-200',
    banner: SCIENCE_3D_BANNERS.laserOptics,
    fallbackBanner: SCIENCE_3D_BANNERS.laserOptics,
    icon: Activity,
    symbol: '💻',
    description: 'C প্রোগ্রামিং, ডাটাবেজ ও লজিক গেট সহজে শেখার জন্য প্র্যাকটিক্যাল কোডিং ও অ্যানিমেশন ক্লাস।',
    features: ['লাইভ প্রোগ্রামিং ল্যাব', 'এইচএসসি প্র্যাকটিক্যাল সলভ', 'শর্টকাট নোটস']
  }
];

export default function CourseOrbitSection({ 
  onJoinClick, 
  coursesList = [], 
  settings, 
  classesCount = 0, 
  notesCount = 0 
}: CourseOrbitSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isRotating, setIsRotating] = useState(false);
  const [autoRotate, setAutoRotate] = useState(settings?.orbitAutoRotate !== false);

  // Dynamic courses list from admin uploads with fallback to default courses (latest 6 courses)
  const displayCourses = useMemo(() => {
    if (coursesList && coursesList.length > 0) {
      const latestSix = coursesList.slice(0, 6);
      return latestSix.map((c, idx) => {
        const styling = getSubjectStyling(c.subject);
        const badgeList = ['সেরা সেলার', 'পপুলার', 'হট ব্যাচ', 'অ্যাডভান্সড', 'ফ্ল্যাগশিপ', 'স্পেশাল ব্যাচ'];
        const assignedBadge = (c as any).badge || badgeList[idx % badgeList.length];
        
        let formattedPrice = '৳ ১২০০';
        if (c.price !== undefined && c.price !== null) {
          formattedPrice = String(c.price).startsWith('৳') ? String(c.price) : `৳ ${c.price}`;
        }

        const features = (c.features && c.features.length > 0)
          ? c.features
          : ['এইচডি ভিডিও লেকচার', 'অধ্যায়ভিত্তিক PDF নোট', '২৪/৭ ডাউট সলভ'];

        const enrolledText = (c as any).enrolled || (c.enrolledCount ? `${c.enrolledCount}+ শিক্ষার্থী` : `${300 + (idx * 45)}+ শিক্ষার্থী`);
        const ratingVal = (c as any).rating || 4.9;

        // Prioritize actual uploaded banner / image from course object
        const rawUploadedBanner = (c as any).imageUrl || (c as any).bannerUrl || (c as any).banner || (c as any).thumbnailUrl || (c as any).image;
        const hasCustomBanner = Boolean(rawUploadedBanner && typeof rawUploadedBanner === 'string' && rawUploadedBanner.trim().length > 0);
        const finalBanner = hasCustomBanner ? rawUploadedBanner.trim() : styling.banner;

        return {
          id: c.id,
          title: c.title,
          subject: c.subject || 'বিজ্ঞান',
          classLevel: c.classLevel || 'HSC ও একাডেমি',
          badge: assignedBadge,
          enrolled: enrolledText,
          rating: ratingVal,
          price: formattedPrice,
          color: styling.color,
          iconBg: styling.iconBg,
          banner: finalBanner,
          fallbackBanner: styling.banner,
          hasCustomBanner,
          icon: styling.icon,
          symbol: styling.symbol,
          description: c.description || 'সাকিব স্যারের তত্ত্ববধানে পরিচালিত পূর্ণাঙ্গ বিজ্ঞান কোর্স ও ভিজ্যুয়াল সিমুলেশন ক্লাস।',
          features
        };
      });
    }
    return DEFAULT_COURSES;
  }, [coursesList]);

  const totalCourses = displayCourses.length;

  // Keep active index within range if courses count changes
  useEffect(() => {
    if (activeIndex >= totalCourses) {
      setActiveIndex(0);
    }
  }, [totalCourses, activeIndex]);

  // Function to switch to next course circular rotational
  const handleSwitchNext = () => {
    setIsRotating(true);
    setActiveIndex((prev) => (prev + 1) % totalCourses);
    setTimeout(() => setIsRotating(false), 500);
  };

  // Dynamic auto rotation timer based on admin settings
  const speedSeconds = settings?.orbitSpeedSeconds || 6;
  useEffect(() => {
    if (!autoRotate || totalCourses === 0) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % totalCourses);
    }, speedSeconds * 1000);
    return () => clearInterval(interval);
  }, [autoRotate, totalCourses, speedSeconds]);

  const activeCourse = displayCourses[activeIndex] || displayCourses[0] || DEFAULT_COURSES[0];

  // Dynamic Insight Stats from Settings or Live Props
  const totalStudentsCount = settings?.insightsTotalStudents || "১,৪৫০+";
  const activePercentText = settings?.insightsActivePercent || "৯৮%";
  const publishedCoursesText = coursesList && coursesList.length > 0 
    ? `${coursesList.length}+` 
    : (settings?.insightsTotalCourses || "১৪+");
  const successRateText = settings?.insightsSuccessRate || "৯৯.২%";
  const successRateLabelText = settings?.insightsSuccessRateLabel || "প্লাস পাওয়ার হার";
  const lectureSheetsText = notesCount && notesCount > 0 
    ? `${notesCount}+` 
    : (settings?.insightsTotalNotes || "৩৫০+");

  const bullet1 = settings?.insightsBullet1 || "সাকিব স্যারের নিজস্ব থ্রিডি ভিজ্যুয়াল ল্যাব সেশন";
  const bullet2 = settings?.insightsBullet2 || "২৪/৭ অনলাইন ও অফলাইন স্পেশাল ডাউট সলভ";
  const bullet3 = settings?.insightsBullet3 || "এইচএসসি ও অ্যাডমিশন ফোকাসড মডেল টেস্ট";
  const registerButtonText = settings?.insightsRegisterButtonText || "ফ্রী রেজিস্ট্রেশন ও কোর্স অ্যাক্সেস পান";

  const orbitBadge = settings?.orbitSectionBadge || "ACADEMY SHOWCASE & INTERACTIVE ORBIT";
  const orbitTitle = settings?.orbitSectionTitle || "সাকিব স্যারের পাবলিশড কোর্সসমূহ ও একাডেমি ইকোসিস্টেম";
  const orbitSubtitle = settings?.orbitSectionSubtitle || "বিজ্ঞানকে ভিজ্যুয়াল ল্যাব ও আধুনিক প্রযুক্তির মাধ্যমে অনুধাবন করো। নিচে ইনসাইটস, ইন্টারেক্টিভ কোর্স অরবিট ও লাইভ কোর্স বিবরণী উপভোগ করো।";

  return (
    <section className="relative py-4 sm:py-6 px-1 sm:px-3 lg:px-6 max-w-[1800px] mx-auto my-4 sm:my-6" id="courses-ecosystem">
      {/* Background Decorative Blur Spheres */}
      <div className="absolute top-1/2 left-10 -translate-y-1/2 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-10 -translate-y-1/2 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* SINGLE MAIN CONTAINER DIV WITH CLEAN SLEEK BORDERS */}
      <div className="w-full p-3.5 sm:p-6 lg:p-8 xl:p-10 rounded-2xl sm:rounded-3xl bg-[#0b1329]/95 border border-slate-800/90 hover:border-slate-700/80 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
        
        {/* Section Header Inside Main Div */}
        <div className="text-center mb-6 sm:mb-8 lg:mb-10 relative z-10">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 text-[10px] sm:text-xs font-mono uppercase tracking-widest mb-2 sm:mb-3 backdrop-blur-md">
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-cyan-400 animate-pulse" />
            <span>{orbitBadge}</span>
          </div>
          <h2 className="text-xl sm:text-3xl lg:text-4xl font-display font-extrabold text-white tracking-tight leading-tight">
            {orbitTitle}
          </h2>
          <p className="mt-1.5 sm:mt-2 text-slate-300 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
            {orbitSubtitle}
          </p>
        </div>

        {/* 3-ZONE MAIN GRID: Left (Insights) | Middle (Circular Orbit + Switch) | Right (Active Course Card with 3D Banner Header) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 xl:gap-8 items-stretch relative z-10">
          
          {/* ==================== 1. LEFT COLUMN (বামে): ACADEMIC INSIGHTS ==================== */}
          <div className="lg:col-span-4 flex flex-col justify-between p-4 sm:p-6 rounded-2xl bg-[#0e172c]/90 border border-slate-800/90 hover:border-cyan-500/30 shadow-xl backdrop-blur-xl relative group overflow-hidden">
            
            {/* Ambient 3D background watermark symbol */}
            <div className="absolute -top-10 -right-10 w-36 h-36 opacity-10 pointer-events-none">
              <Atom className="w-full h-full text-cyan-400 animate-spin-slow" />
            </div>

            <div>
              {/* Title & Live Beacon */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 flex items-center justify-center">
                    <Award className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider block">Real-time Overview</span>
                    <h3 className="text-base sm:text-lg font-display font-bold text-white leading-tight">একাডেমিক ইনসাইটস</h3>
                  </div>
                </div>
                <div className="px-2 sm:px-2.5 py-1 rounded-full bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 text-[10px] sm:text-[11px] font-mono font-semibold flex items-center gap-1.5 shrink-0">
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-cyan-400 animate-ping" />
                  <span>লাইভ আপডেট</span>
                </div>
              </div>

              {/* Stat Counters 2x2 Grid */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                {/* Stat 1: Total Students */}
                <div className="p-2.5 sm:p-3.5 rounded-xl bg-slate-900/90 border border-white/10 hover:border-cyan-400/40 transition-all duration-300 group/stat">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 flex items-center justify-center mb-1.5 group-hover/stat:scale-110 transition-transform">
                    <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                  <div className="text-lg sm:text-2xl font-display font-black text-white group-hover/stat:text-cyan-300 transition-colors">
                    {totalStudentsCount}
                  </div>
                  <div className="text-[10px] sm:text-[11px] font-semibold text-slate-300">এনরোল্ড স্টুডেন্ট</div>
                  <div className="text-[9px] text-cyan-400 font-mono mt-0.5">↑ {activePercentText} সক্রিয়</div>
                </div>

                {/* Stat 2: Total Courses */}
                <div className="p-2.5 sm:p-3.5 rounded-xl bg-slate-900/90 border border-white/10 hover:border-emerald-400/40 transition-all duration-300 group/stat">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 flex items-center justify-center mb-1.5 group-hover/stat:scale-110 transition-transform">
                    <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                  <div className="text-lg sm:text-2xl font-display font-black text-white group-hover/stat:text-emerald-300 transition-colors">
                    {publishedCoursesText}
                  </div>
                  <div className="text-[10px] sm:text-[11px] font-semibold text-slate-300">পাবলিশড কোর্স</div>
                  <div className="text-[9px] text-emerald-400 font-mono mt-0.5">এইচএসসি ও একাডেমি</div>
                </div>

                {/* Stat 3: Success Rate */}
                <div className="p-2.5 sm:p-3.5 rounded-xl bg-slate-900/90 border border-white/10 hover:border-amber-400/40 transition-all duration-300 group/stat">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-500/15 border border-amber-400/30 text-amber-300 flex items-center justify-center mb-1.5 group-hover/stat:scale-110 transition-transform">
                    <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                  <div className="text-lg sm:text-2xl font-display font-black text-white group-hover/stat:text-amber-300 transition-colors">
                    {successRateText}
                  </div>
                  <div className="text-[10px] sm:text-[11px] font-semibold text-slate-300">{successRateLabelText}</div>
                  <div className="text-[9px] text-amber-400 font-mono mt-0.5">বোর্ড ও একাডেমি</div>
                </div>

                {/* Stat 4: PDF & Lecture Sheets */}
                <div className="p-2.5 sm:p-3.5 rounded-xl bg-slate-900/90 border border-white/10 hover:border-purple-400/40 transition-all duration-300 group/stat">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-purple-500/15 border border-purple-400/30 text-purple-300 flex items-center justify-center mb-1.5 group-hover/stat:scale-110 transition-transform">
                    <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                  <div className="text-lg sm:text-2xl font-display font-black text-white group-hover/stat:text-purple-300 transition-colors">
                    {lectureSheetsText}
                  </div>
                  <div className="text-[10px] sm:text-[11px] font-semibold text-slate-300">লেকচার শিট PDF</div>
                  <div className="text-[9px] text-purple-400 font-mono mt-0.5">ডাউনলোডযোগ্য</div>
                </div>
              </div>

              {/* Feature Highlights with Science Symbols */}
              <div className="pt-3 space-y-1.5 sm:space-y-2">
                <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>{bullet1}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{bullet2}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
                  <Star className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{bullet3}</span>
                </div>
              </div>
            </div>

            {/* Quick Action Button */}
            {onJoinClick && (
              <div className="mt-4 pt-3 border-t border-white/10">
                <button
                  onClick={onJoinClick}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-display font-bold text-xs sm:text-sm transition-all duration-300 cursor-pointer shadow-lg hover:shadow-cyan-500/25 flex items-center justify-center gap-2 group/btn border border-cyan-400/30"
                >
                  <span>{registerButtonText}</span>
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            )}
          </div>

          {/* ==================== 2. MIDDLE COLUMN (মাঝে): CIRCULAR ORBITAL ANIMATION + SWITCH BUTTON ==================== */}
          <div className="lg:col-span-4 flex flex-col items-center justify-between p-3.5 sm:p-6 rounded-2xl bg-[#0e172c]/60 border-2 border-cyan-500/25 backdrop-blur-xl relative min-h-[380px] sm:min-h-[460px] overflow-hidden">
            
            {/* Stage Title with 3D Atom Icon */}
            <div className="w-full flex items-center justify-between text-[11px] sm:text-xs font-mono text-cyan-300/90 z-20 mb-2">
              <span className="flex items-center gap-1.5 font-bold">
                <Atom className="w-4 h-4 text-cyan-400 animate-spin" />
                প্ল্যানেটারি কোর্স অরবিট
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-400/30 text-[11px] font-bold">
                {totalCourses > 0 ? activeIndex + 1 : 0}/{totalCourses}
              </span>
            </div>

            {/* Circular Orbit Wheel Frame */}
            <div className="relative w-72 h-72 sm:w-84 sm:h-84 md:w-96 md:h-96 flex items-center justify-center my-auto">
              
              {/* Outer Glowing Pulsing Orbital Rings */}
              <div className="absolute inset-0 sm:inset-1 rounded-full border-2 border-dashed border-cyan-500/30 animate-spin-slow pointer-events-none" />
              <div className="absolute inset-5 sm:inset-7 rounded-full border border-teal-500/25 pointer-events-none" />
              <div className="absolute inset-11 sm:inset-14 rounded-full border border-blue-500/25 pointer-events-none" />
              
              {/* Circular Orbit Segments / Nodes */}
              {displayCourses.map((course, idx) => {
                const angleDeg = (idx - activeIndex) * (360 / Math.max(1, totalCourses));
                const angleRad = (angleDeg - 90) * (Math.PI / 180);
                
                const radius = 126; 
                const x = Math.cos(angleRad) * radius;
                const y = Math.sin(angleRad) * radius;

                const isActive = idx === activeIndex;
                const IconComponent = course.icon || Atom;

                return (
                  <motion.div
                    key={course.id || idx}
                    animate={{
                      x: x,
                      y: y,
                      scale: isActive ? 1.18 : 0.92,
                      opacity: isActive ? 1 : 0.82,
                      zIndex: isActive ? 30 : 10
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 150,
                      damping: 18
                    }}
                    onClick={() => {
                      setActiveIndex(idx);
                      setAutoRotate(false);
                    }}
                    className={`absolute w-15 h-15 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all border-2 backdrop-blur-lg select-none p-1 shadow-lg overflow-hidden group/node ${
                      isActive
                        ? 'bg-gradient-to-br from-cyan-500 via-teal-500 to-blue-600 border-white shadow-[0_0_30px_rgba(34,211,238,0.85)] text-white ring-2 ring-cyan-300'
                        : 'bg-slate-900/95 border-cyan-500/40 hover:border-cyan-300 text-slate-200 hover:text-white hover:scale-105 shadow-[0_0_15px_rgba(0,0,0,0.5)]'
                    }`}
                    title={`${course.title} - ${course.subject}`}
                  >
                    {/* Course banner background preview on node */}
                    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none rounded-2xl">
                      <img 
                        src={course.banner || course.fallbackBanner || SCIENCE_3D_BANNERS.particleAccelerator} 
                        alt="" 
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          const target = e.currentTarget;
                          const fallback = course.fallbackBanner || getSubjectStyling(course.subject).banner || SCIENCE_3D_BANNERS.heroFull;
                          if (target.src !== fallback) {
                            target.src = fallback;
                          }
                        }}
                        className={`w-full h-full object-cover transition-all duration-500 ${
                          isActive 
                            ? 'opacity-40 scale-110' 
                            : 'opacity-25 group-hover/node:opacity-50 group-hover/node:scale-105'
                        }`}
                      />
                      <div className={`absolute inset-0 ${isActive ? 'bg-gradient-to-t from-slate-950/80 via-cyan-950/30 to-transparent' : 'bg-slate-950/65'}`} />
                    </div>

                    <div className={`relative z-10 p-1 sm:p-1.5 rounded-xl mb-0.5 ${isActive ? 'bg-white/20' : 'bg-cyan-500/10 text-cyan-300'}`}>
                      <IconComponent className={`w-4 h-4 sm:w-5 sm:h-5 ${isActive ? 'animate-spin text-white' : 'text-cyan-400'}`} />
                    </div>
                    <span className="relative z-10 text-[8.5px] sm:text-[9.5px] md:text-[10.5px] font-black font-mono tracking-tight text-center px-0.5 truncate max-w-full leading-tight drop-shadow-sm">
                      {course.subject}
                    </span>

                    {/* Active Pulsing Indicator Badge */}
                    {isActive && (
                      <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 sm:h-4 sm:w-4 z-20">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-full w-full bg-cyan-300 border-2 border-slate-900"></span>
                      </span>
                    )}
                  </motion.div>
                );
              })}

              {/* CENTER HUB & "সুইচ এনাদার" BUTTON */}
              <div className="relative z-40 w-36 h-36 sm:w-44 sm:h-44 md:w-48 md:h-48 rounded-full bg-[#0a1122]/95 border-2 border-cyan-400/60 shadow-[0_0_40px_rgba(34,211,238,0.4)] flex flex-col items-center justify-center p-3 text-center backdrop-blur-2xl group/hub">
                
                {/* Inner Rotating Ring */}
                <div className="absolute inset-2 rounded-full border border-cyan-400/25 animate-spin-slow pointer-events-none" />

                {/* Center Core Badge */}
                <div className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-wider mb-1.5">
                  কোর্স {totalCourses > 0 ? activeIndex + 1 : 0}/{totalCourses}
                </div>

                {/* Main "SWITCH ANOTHER" Button */}
                <button
                  onClick={handleSwitchNext}
                  id="switch-course-btn"
                  className="px-3.5 sm:px-4 py-1.5 sm:py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-display font-black text-xs sm:text-sm tracking-wide transition-all duration-300 cursor-pointer shadow-[0_0_20px_rgba(34,211,238,0.45)] hover:shadow-[0_0_30px_rgba(34,211,238,0.8)] flex items-center gap-1.5 sm:gap-2 border border-cyan-300/50 group/btn transform active:scale-95"
                >
                  <RotateCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-white transition-transform duration-500 ${isRotating ? 'rotate-180' : 'group-hover/btn:rotate-90'}`} />
                  <span>সুইচ এনাদার</span>
                </button>

                <p className="text-[9px] sm:text-[10px] text-slate-300 mt-1.5 font-mono">
                  ক্লিক করে সুইচ করুন
                </p>
              </div>
            </div>

            {/* Mobile Horizontal Quick-Selector Bar */}
            <div className="w-full flex lg:hidden items-center gap-1.5 overflow-x-auto py-1 mt-2 no-scrollbar">
              {displayCourses.map((course, idx) => (
                <button
                  key={course.id || idx}
                  onClick={() => {
                    setActiveIndex(idx);
                    setAutoRotate(false);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-semibold whitespace-nowrap shrink-0 transition-all border ${
                    idx === activeIndex
                      ? 'bg-cyan-500 text-slate-950 border-cyan-300 font-bold shadow-sm'
                      : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
                  }`}
                >
                  {course.subject}
                </button>
              ))}
            </div>

            <div className="text-[9.5px] sm:text-[10px] text-cyan-400/80 font-mono mt-1 text-center">
              💡 যেকোনো নোডে ক্লিক করে সরাসরি সেই কোর্সের বিবরণ দেখা যাবে
            </div>
          </div>

          {/* ==================== 3. RIGHT COLUMN (ডানে): ACTIVE SELECTED COURSE CARD WITH 3D BANNER HEADER ==================== */}
          <div className="lg:col-span-4 flex flex-col justify-between rounded-2xl bg-[#0e172c]/90 border border-slate-800/90 hover:border-cyan-500/30 shadow-xl backdrop-blur-xl relative overflow-hidden group">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCourse.id || activeIndex}
                initial={{ opacity: 0, x: 20, scale: 0.96 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -20, scale: 0.96 }}
                transition={{ duration: 0.28 }}
                className="h-full flex flex-col justify-between"
              >
                {/* 3D Visual Header Banner for Course */}
                <div className="relative h-36 sm:h-44 md:h-48 w-full overflow-hidden border-b border-white/10 bg-[#0a1020]">
                  <img 
                    src={activeCourse.banner || activeCourse.fallbackBanner || SCIENCE_3D_BANNERS.particleAccelerator} 
                    alt={activeCourse.title}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      const target = e.currentTarget;
                      const fallback = activeCourse.fallbackBanner || getSubjectStyling(activeCourse.subject).banner || SCIENCE_3D_BANNERS.heroFull;
                      if (target.src !== fallback) {
                        target.src = fallback;
                      }
                    }}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0e172c] via-transparent to-black/25" />
                  
                  {/* Subject Badge over Image */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono border backdrop-blur-md ${activeCourse.iconBg} shadow-md`}>
                      {activeCourse.symbol} {activeCourse.subject}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-full bg-slate-950/85 border border-amber-400/40 text-amber-300 text-[10px] font-bold font-mono flex items-center gap-1 backdrop-blur-md shadow-sm">
                      <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
                      <span>{activeCourse.rating}</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-950/85 border border-cyan-400/40 text-cyan-300 text-[10px] font-bold font-mono backdrop-blur-md shadow-sm">
                      {activeCourse.badge}
                    </span>
                  </div>
                </div>

                {/* Upper Details */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Course Title */}
                    <h4 className="text-sm sm:text-base md:text-lg font-display font-black text-white leading-snug">
                      {activeCourse.title}
                    </h4>

                    {/* Instructor & Class Level */}
                    <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-300 font-sans">
                      <span className="text-cyan-400 font-bold flex items-center gap-1">
                        <GraduationCap className="w-3.5 h-3.5" />
                        {settings?.adminName || 'সাকিব স্যার'}
                      </span>
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-300 font-mono text-[11px]">{activeCourse.classLevel}</span>
                    </div>

                    <p className="text-slate-300 text-xs mt-2 leading-relaxed font-sans line-clamp-2">
                      {activeCourse.description}
                    </p>

                    {/* Key Features Pill List */}
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      {activeCourse.features.map((feat, fIdx) => (
                        <span 
                          key={fIdx}
                          className="px-2 py-0.5 rounded-md bg-slate-900/90 border border-white/10 text-slate-300 text-[10px] font-medium flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-2.5 h-2.5 text-cyan-400 shrink-0" />
                          <span>{feat}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Pricing & Enrollment Footer */}
                  <div className="flex items-center justify-between pt-3 mt-3.5 border-t border-white/10">
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase font-mono block">ভর্তি ফি</span>
                      <span className="text-base sm:text-lg font-display font-black text-cyan-300">{activeCourse.price}</span>
                    </div>

                    {onJoinClick && (
                      <button
                        onClick={onJoinClick}
                        className="px-3.5 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs transition-all duration-300 cursor-pointer shadow-md flex items-center gap-1.5 btn-shine"
                      >
                        <span>কোর্সে এনরোল করুন</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </div>
    </section>
  );
}
