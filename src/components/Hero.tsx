import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, Video, Users, Sparkles, ChevronRight, ChevronLeft, ShieldCheck, CheckCircle2, Star, Zap, FlaskConical, Award,
  GraduationCap, BookOpen, MonitorPlay, MessageSquare, CheckCircle, ArrowRight, Atom, Dna, Compass, Activity, Play, Pause,
  Clock, Tag, Layers, Stethoscope, Eye, RefreshCw, Cpu, Orbit, Globe2, Telescope, Lightbulb
} from 'lucide-react';
import CourseOrbitSection from './CourseOrbitSection';
import AnnouncementBanner from './AnnouncementBanner';
import InteractiveScience from './InteractiveScience';
import Hero3DCanvas from './Hero3DCanvas';
import { Settings, Course } from '../types';

// Bespoke 3D Science Studio & Space Physics Concept Banners
import bannerScienceHeroFull from '../assets/images/science_hero_banner_1787479588801.jpg';
import bannerBlackHoleSpacetime from '../assets/images/space_blackhole_spacetime_1787480086847.jpg';
import bannerParticleAccelerator from '../assets/images/quantum_particle_accelerator_1787480103836.jpg';
import bannerCosmicNebula from '../assets/images/cosmic_nebula_astrophysics_1787480119149.jpg';
import bannerLaserOptics from '../assets/images/optics_laser_electromagnetic_1787480133446.jpg';
import bannerMolecularDNA from '../assets/images/molecular_dna_quantum_bio_1787480146520.jpg';
import bannerBioCellOrganelle from '../assets/images/bio_cell_organelle_3d_1787480529503.jpg';
import bannerNeuroSynapse from '../assets/images/neuro_synapse_brain_3d_1787480544302.jpg';
import bannerElectromagnetismFlux from '../assets/images/electromagnetism_flux_3d_1787480559721.jpg';
import bannerThermodynamicsEntropy from '../assets/images/thermodynamics_quantum_entropy_1787480572868.jpg';
import bannerSolarFusion from '../assets/images/astrophysics_solar_fusion_1787480588065.jpg';

import banner3DScienceStudio from '../assets/images/science_3d_banner_1787479248876.jpg';
import scienceStudioLogo from '../assets/images/science_studio_logo_1784521830593.jpg';
import bannerPhysicsLab from '../assets/images/hero_physics_quantum_lab_1787477039417.jpg';
import bannerChemistryHub from '../assets/images/hero_chemistry_molecular_hub_1787477057681.jpg';
import bannerMathStudio from '../assets/images/hero_mathematics_calculus_studio_1787477075299.jpg';
import bannerBiologyGenetics from '../assets/images/hero_biology_genetics_lab_1787477092542.jpg';

interface HeroProps {
  onJoinClick: () => void;
  onExploreClick: () => void;
  isLoggedIn: boolean;
  settings?: Settings;
  courses?: Course[];
  notesCount?: number;
  classesCount?: number;
  onOpenRoutine?: () => void;
  onOpenContact?: () => void;
  onExploreLab?: () => void;
}

interface ProcessedSlide {
  id: string;
  courseId?: string;
  tabLabel: string;
  tabIcon: any;
  subject: string;
  badge: string;
  title: string;
  classLevel?: string;
  descBengali: string;
  descEnglish?: string;
  image: string;
  price: number;
  originalPrice?: number;
  duration: string;
  enrolledCount: number;
  rating: number;
  features: string[];
  themeColor: string;
  glowColor: string;
  accentBorder: string;
  btnPrimaryText: string;
  btnSecondaryText: string;
}

export default function Hero({ 
  onJoinClick, 
  onExploreClick, 
  isLoggedIn, 
  settings, 
  courses = [],
  notesCount = 0,
  classesCount = 0,
  onOpenRoutine = () => {},
  onOpenContact = () => {},
  onExploreLab = () => {}
}: HeroProps) {

  // Helper to pick icons and colors based on subject
  const getSubjectMeta = (subject: string = '') => {
    const s = subject.toLowerCase();
    if (s.includes('physic') || s.includes('পদার্থ')) {
      return {
        icon: Atom,
        color: '#0284c7', // Sky blue
        glow: 'rgba(56, 189, 248, 0.35)',
        border: 'border-sky-500/40',
        defaultImg: bannerPhysicsLab,
        pillColor: 'text-sky-300'
      };
    } else if (s.includes('chem') || s.includes('রসায়ন')) {
      return {
        icon: FlaskConical,
        color: '#059669', // Emerald
        glow: 'rgba(16, 185, 129, 0.35)',
        border: 'border-emerald-500/40',
        defaultImg: bannerChemistryHub,
        pillColor: 'text-emerald-300'
      };
    } else if (s.includes('math') || s.includes('গণিত')) {
      return {
        icon: Compass,
        color: '#d97706', // Amber
        glow: 'rgba(245, 158, 11, 0.35)',
        border: 'border-amber-500/40',
        defaultImg: bannerMathStudio,
        pillColor: 'text-amber-300'
      };
    } else if (s.includes('bio') || s.includes('জীব')) {
      return {
        icon: Dna,
        color: '#0d9488', // Teal
        glow: 'rgba(20, 184, 166, 0.35)',
        border: 'border-teal-500/40',
        defaultImg: bannerBiologyGenetics,
        pillColor: 'text-teal-300'
      };
    } else if (s.includes('med') || s.includes('admission') || s.includes('ভর্তি')) {
      return {
        icon: Stethoscope,
        color: '#e11d48', // Rose
        glow: 'rgba(244, 63, 94, 0.35)',
        border: 'border-rose-500/40',
        defaultImg: "https://images.unsplash.com/photo-1576086213369-97a306d36557?w=800&auto=format&fit=crop&q=80",
        pillColor: 'text-rose-300'
      };
    }
    return {
      icon: Sparkles,
      color: '#06b6d4', // Cyan
      glow: 'rgba(6, 182, 212, 0.35)',
      border: 'border-cyan-500/40',
      defaultImg: banner3DScienceStudio,
      pillColor: 'text-cyan-300'
    };
  };

  // Convert courses to rich slides
  const slides: ProcessedSlide[] = useMemo(() => {
    if (courses && courses.length > 0) {
      return courses.map((crs, idx) => {
        const meta = getSubjectMeta(crs.subject);
        return {
          id: crs.id || `course-slide-${idx}`,
          courseId: crs.id,
          tabLabel: crs.title.length > 20 ? crs.title.substring(0, 20) + '...' : crs.title,
          tabIcon: meta.icon,
          subject: crs.subject || 'Science',
          badge: crs.badge || `${crs.subject} স্পেশাল ব্যাচ`,
          title: crs.title,
          classLevel: crs.classLevel || 'HSC & SSC',
          descBengali: crs.description || 'বিজ্ঞান চর্চাকে সহজ, আনন্দদায়ক এবং প্রযুক্তিনির্ভর করতে সাকিব স্যারের এই বিশেষ উদ্যোগ। Science Studio by Sakib-এ রয়েছে সেরা মানের ভিডিও লেকচার, ইন্টারেক্টিভ সিমুলেটর এবং সার্বক্ষণিক ডাউট সলভ মেন্টরশিপ।',
          descEnglish: 'Experience premium science coaching with high-fidelity interactive simulation play desks, curated video masterclasses, and concise PDF materials by Sakib Sir.',
          image: crs.imageUrl || meta.defaultImg,
          price: crs.price || 1200,
          originalPrice: crs.originalPrice || (crs.price ? Math.round(crs.price * 1.35) : 1600),
          duration: crs.duration || '১২ মাস (ফুল একাডেমিক কোর্স)',
          enrolledCount: crs.enrolledCount || 380,
          rating: crs.rating || 5,
          features: [
            'স্মার্ট ক্লাসরুম লার্নিং',
            'অধ্যায়ভিত্তিক PDF নোট',
            '২৪/৭ ডাউট সলভ ডেস্ক',
            'সাকিব স্যারের মেন্টরশিপ'
          ],
          themeColor: meta.color,
          glowColor: meta.glow,
          accentBorder: meta.border,
          btnPrimaryText: 'ভর্তি হন / রেজিস্ট্রেশন করুন',
          btnSecondaryText: 'সাপ্তাহিক ক্লাস রুটিন দেখুন'
        };
      });
    }

    // Default 5 Flagship Academy Courses
    return [
      {
        id: 'crs_flagship_science',
        tabLabel: 'সায়েন্স স্টুডিও ফ্ল্যাগশিপ',
        tabIcon: Atom,
        subject: 'All Sciences',
        badge: 'ফ্ল্যাগশিপ সায়েন্স ব্যাচ',
        title: 'Science Studio by Sakib • 3D Visual Masterclass',
        classLevel: 'HSC, SSC & Admission',
        descBengali: 'বিজ্ঞান চর্চাকে সহজ, আনন্দদায়ক এবং প্রযুক্তিনির্ভর করতে সাকিব স্যারের এই বিশেষ উদ্যোগ। Science Studio by Sakib-এ রয়েছে সেরা মানের ভিডিও লেকচার, ইন্টারেক্টিভ সিমুলেটর এবং সার্বক্ষণিক ডাউট সলভ মেন্টরশিপ।',
        descEnglish: 'Experience premium science coaching with high-fidelity interactive simulation play desks, curated video masterclasses, and concise PDF materials by Sakib Sir.',
        image: banner3DScienceStudio,
        price: 1250,
        originalPrice: 1800,
        duration: '১২ মাস (ফুল একাডেমিক কোর্স)',
        enrolledCount: 520,
        rating: 5,
        features: [
          'স্মার্ট ক্লাসরুম লার্নিং',
          'অধ্যায়ভিত্তিক PDF নোট',
          '২৪/৭ ডাউট সলভ ডেস্ক',
          'সাকিব স্যারের মেন্টরশিপ'
        ],
        themeColor: '#06b6d4',
        glowColor: 'rgba(6, 182, 212, 0.4)',
        accentBorder: 'border-cyan-500/40',
        btnPrimaryText: 'ভর্তি হন / রেজিস্ট্রেশন করুন',
        btnSecondaryText: 'সাপ্তাহিক ক্লাস রুটিন দেখুন'
      },
      {
        id: 'crs_phys_master',
        tabLabel: 'পদার্থবিজ্ঞান ৩ডি',
        tabIcon: Atom,
        subject: 'Physics',
        badge: 'সেরা সেলার • HSC Physics',
        title: 'HSC Physics 3D Simulation Masterclass',
        classLevel: 'HSC 1st & 2nd Paper',
        descBengali: 'বিজ্ঞান চর্চাকে সহজ, আনন্দদায়ক এবং প্রযুক্তিনির্ভর করতে সাকিব স্যারের এই বিশেষ উদ্যোগ। Science Studio by Sakib-এ রয়েছে সেরা মানের ভিডিও লেকচার, ইন্টারেক্টিভ সিমুলেটর এবং সার্বক্ষণিক ডাউট সলভ মেন্টরশিপ।',
        descEnglish: 'Experience premium science coaching with high-fidelity interactive simulation play desks, curated video masterclasses, and concise PDF materials by Sakib Sir.',
        image: bannerPhysicsLab,
        price: 1250,
        originalPrice: 1800,
        duration: '১২ মাস (ফুল একাডেমিক কোর্স)',
        enrolledCount: 450,
        rating: 5,
        features: [
          'স্মার্ট ক্লাসরুম লার্নিং',
          'অধ্যায়ভিত্তিক PDF নোট',
          '২৪/৭ ডাউট সলভ ডেস্ক',
          'সাকিব স্যারের মেন্টরশিপ'
        ],
        themeColor: '#0284c7',
        glowColor: 'rgba(56, 189, 248, 0.35)',
        accentBorder: 'border-sky-500/40',
        btnPrimaryText: 'ভর্তি হন / রেজিস্ট্রেশন করুন',
        btnSecondaryText: 'সাপ্তাহিক ক্লাস রুটিন দেখুন'
      },
      {
        id: 'crs_chem_reactor',
        tabLabel: 'রসায়ন রিঅ্যাক্টর',
        tabIcon: FlaskConical,
        subject: 'Chemistry',
        badge: 'পপুলার • HSC Chemistry',
        title: 'Chemistry Organic & Inorganic Reactor 3D',
        classLevel: 'HSC 1st & 2nd Paper',
        descBengali: 'বিজ্ঞান চর্চাকে সহজ, আনন্দদায়ক এবং প্রযুক্তিনির্ভর করতে সাকিব স্যারের এই বিশেষ উদ্যোগ। Science Studio by Sakib-এ রয়েছে সেরা মানের ভিডিও লেকচার, ইন্টারেক্টিভ সিমুলেটর এবং সার্বক্ষণিক ডাউট সলভ মেন্টরশিপ।',
        descEnglish: 'Experience premium science coaching with high-fidelity interactive simulation play desks, curated video masterclasses, and concise PDF materials by Sakib Sir.',
        image: bannerChemistryHub,
        price: 1200,
        originalPrice: 1600,
        duration: '১২ মাস (ফুল একাডেমিক কোর্স)',
        enrolledCount: 380,
        rating: 5,
        features: [
          'স্মার্ট ক্লাসরুম লার্নিং',
          'অধ্যায়ভিত্তিক PDF নোট',
          '২৪/৭ ডাউট সলভ ডেস্ক',
          'সাকিব স্যারের মেন্টরশিপ'
        ],
        themeColor: '#059669',
        glowColor: 'rgba(16, 185, 129, 0.35)',
        accentBorder: 'border-emerald-500/40',
        btnPrimaryText: 'ভর্তি হন / রেজিস্ট্রেশন করুন',
        btnSecondaryText: 'সাপ্তাহিক ক্লাস রুটিন দেখুন'
      },
      {
        id: 'crs_math_calculus',
        tabLabel: 'উচ্চতর গণিত',
        tabIcon: Compass,
        subject: 'Mathematics',
        badge: 'অ্যাডভান্সড • Higher Math',
        title: 'Higher Math Calculus & Vector 3D',
        classLevel: 'HSC Higher Mathematics',
        descBengali: 'বিজ্ঞান চর্চাকে সহজ, আনন্দদায়ক এবং প্রযুক্তিনির্ভর করতে সাকিব স্যারের এই বিশেষ উদ্যোগ। Science Studio by Sakib-এ রয়েছে সেরা মানের ভিডিও লেকচার, ইন্টারেক্টিভ সিমুলেটর এবং সার্বক্ষণিক ডাউট সলভ মেন্টরশিপ।',
        descEnglish: 'Experience premium science coaching with high-fidelity interactive simulation play desks, curated video masterclasses, and concise PDF materials by Sakib Sir.',
        image: bannerMathStudio,
        price: 1300,
        originalPrice: 1700,
        duration: '১২ মাস (ফুল একাডেমিক কোর্স)',
        enrolledCount: 420,
        rating: 5,
        features: [
          'স্মার্ট ক্লাসরুম লার্নিং',
          'অধ্যায়ভিত্তিক PDF নোট',
          '২৪/৭ ডাউট সলভ ডেস্ক',
          'সাকিব স্যারের মেন্টরশিপ'
        ],
        themeColor: '#d97706',
        glowColor: 'rgba(245, 158, 11, 0.35)',
        accentBorder: 'border-amber-500/40',
        btnPrimaryText: 'ভর্তি হন / রেজিস্ট্রেশন করুন',
        btnSecondaryText: 'সাপ্তাহিক ক্লাস রুটিন দেখুন'
      },
      {
        id: 'crs_bio_cellular',
        tabLabel: 'জীববিজ্ঞান এনাটমি',
        tabIcon: Dna,
        subject: 'Biology',
        badge: 'হট কোর্স • HSC Biology',
        title: 'Biology 3D Anatomy & Cellular Master',
        classLevel: 'HSC 1st & 2nd Paper',
        descBengali: 'বিজ্ঞান চর্চাকে সহজ, আনন্দদায়ক এবং প্রযুক্তিনির্ভর করতে সাকিব স্যারের এই বিশেষ উদ্যোগ। Science Studio by Sakib-এ রয়েছে সেরা মানের ভিডিও লেকচার, ইন্টারেক্টিভ সিমুলেটর এবং সার্বক্ষণিক ডাউট সলভ মেন্টরশিপ।',
        descEnglish: 'Experience premium science coaching with high-fidelity interactive simulation play desks, curated video masterclasses, and concise PDF materials by Sakib Sir.',
        image: bannerBiologyGenetics,
        price: 1150,
        originalPrice: 1500,
        duration: '১২ মাস (ফুল একাডেমিক কোর্স)',
        enrolledCount: 310,
        rating: 5,
        features: [
          'স্মার্ট ক্লাসরুম লার্নিং',
          'অধ্যায়ভিত্তিক PDF নোট',
          '২৪/৭ ডাউট সলভ ডেস্ক',
          'সাকিব স্যারের মেন্টরশিপ'
        ],
        themeColor: '#0d9488',
        glowColor: 'rgba(20, 184, 166, 0.35)',
        accentBorder: 'border-teal-500/40',
        btnPrimaryText: 'ভর্তি হন / রেজিস্ট্রেশন করুন',
        btnSecondaryText: 'সাপ্তাহিক ক্লাস রুটিন দেখুন'
      }
    ];
  }, [courses]);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const slideIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Default 8 Scientific Concept Banners
  const defaultScienceBanners = useMemo(() => [
    {
      id: 'bio-cell',
      title: 'ইউক্যারিওটিক সেল ও সাইটোলজি ৩ডি ল্যাব',
      subtitle: 'মাইটোকন্ড্রিয়া, এটিপি সংশ্লেষণ, কোষ অঙ্গাণু ও এন্ডোপ্লাজমিক জালিকা (Eukaryotic Cell Organelles, Mitochondria ATP & Endoplasmic Reticulum)',
      badge: '3D CELL BIOLOGY',
      tag: 'কোষ অঙ্গাণু ও সাইটোলজি',
      image: bannerBioCellOrganelle,
      accentGradient: 'from-emerald-400 via-teal-300 to-amber-300',
      borderGlow: 'rgba(16,185,129,0.5)',
      glowColor: 'emerald',
      icon: Activity
    },
    {
      id: 'neuro-synapse',
      title: 'নিউরন সাইন্যাপ্স ও হিউম্যান ব্রেন বায়োলজি',
      subtitle: 'অ্যাকশন পটেনশিয়াল, নিউরোট্রান্সমিটার ও স্নায়ুতন্ত্রের সিগন্যালিং (Neural Synaptic Action Potentials & Neurotransmitter Dynamics)',
      badge: 'NEUROBIOLOGY & BRAIN',
      tag: 'স্নায়ুবিজ্ঞান ও মানব ফিজিওলজি',
      image: bannerNeuroSynapse,
      accentGradient: 'from-cyan-400 via-sky-300 to-indigo-300',
      borderGlow: 'rgba(56,189,248,0.5)',
      glowColor: 'cyan',
      icon: Zap
    },
    {
      id: 'electromagnetism-flux',
      title: 'ইলেক্ট্রোম্যাগনেটিজম ও চৌম্বক ফ্লাক্স সিমুলেটর',
      subtitle: 'তড়িৎ চৌম্বকীয় আবেশ, লরেঞ্জ বল, কয়েল ও চৌম্বক বলরেখা (Electromagnetic Induction, Lorentz Force & Magnetic Field Vectors)',
      badge: 'ELECTROMAGNETISM 3D',
      tag: 'তড়িৎ ও চুম্বকবিদ্যা',
      image: bannerElectromagnetismFlux,
      accentGradient: 'from-blue-400 via-cyan-300 to-teal-300',
      borderGlow: 'rgba(59,130,246,0.5)',
      glowColor: 'blue',
      icon: Cpu
    },
    {
      id: 'thermodynamics-entropy',
      title: 'থার্মোডাইনামিক্স ও গ্যাসীয় গতিতত্ত্ব',
      subtitle: 'তাপগতিবিদ্যার সূত্র, এনট্রপি ওয়েভফর্ম ও গ্যাসীয় অণুর গতিতত্ত্ব (Thermodynamics, Entropy Waveforms & Molecular Kinetic Theory)',
      badge: 'THERMODYNAMICS 3D',
      tag: 'তাপ ও গতিতত্ত্ব',
      image: bannerThermodynamicsEntropy,
      accentGradient: 'from-orange-400 via-amber-300 to-cyan-300',
      borderGlow: 'rgba(249,115,22,0.5)',
      glowColor: 'amber',
      icon: Sparkles
    },
    {
      id: 'molecular-dna',
      title: 'মলিকিউলার জেনেটিক্স ও ডিএনএ ৩ডি ইউনিভার্স',
      subtitle: 'ডিএনএ ডাবল হেলিক্স, রাসায়নিক বন্ধন ও বংশগতিবিদ্যা (DNA Double Helix & Molecular Genetics)',
      badge: 'BIO-PHYSICS & GENETICS',
      tag: 'ডিএনএ ও জেনেটিক্স',
      image: bannerMolecularDNA,
      accentGradient: 'from-blue-400 via-teal-300 to-emerald-300',
      borderGlow: 'rgba(56,189,248,0.5)',
      glowColor: 'teal',
      icon: Dna
    },
    {
      id: 'quantum-atom',
      title: 'কোয়ান্টাম অ্যাটমিক স্টুডিও ও অরবিটাল সিমুলেটর',
      subtitle: 'পারমাণবিক মডেল, ইলেকট্রন অরবিট ও কোয়ান্টাম শক্তিস্তর (Atomic Model & Orbital Simulation)',
      badge: 'QUANTUM PHYSICS',
      tag: 'পরমাণু মডেল ও তরঙ্গ',
      image: bannerScienceHeroFull,
      accentGradient: 'from-cyan-400 via-teal-300 to-blue-400',
      borderGlow: 'rgba(34,211,238,0.5)',
      glowColor: 'cyan',
      icon: Atom
    },
    {
      id: 'space-blackhole',
      title: 'মহাকর্ষীয় লেন্সিং ও ব্ল্যাকহোল অ্যাস্ট্রোফিজিক্স',
      subtitle: 'স্থান-কাল বক্রতা, সাধারণ আপেক্ষিকতা ও ইভেন্ট হরাইজন (Gravitational Lensing & Spacetime Curvature)',
      badge: 'ASTROPHYSICS & RELATIVITY',
      tag: 'স্থান-কাল ও মহাকর্ষ',
      image: bannerBlackHoleSpacetime,
      accentGradient: 'from-amber-400 via-rose-300 to-cyan-300',
      borderGlow: 'rgba(245,158,11,0.5)',
      glowColor: 'amber',
      icon: Orbit
    },
    {
      id: 'solar-fusion',
      title: 'স্টেলার নিউক্লিয়ার ফিউশন ও কসমিক এনার্জি',
      subtitle: 'নক্ষত্রের কেন্দ্রভাগ, হাইড্রোজেন প্লাজমা ফিউশন ও সৌর বিকিরণ (Nuclear Fusion & Coronal Flares)',
      badge: 'NUCLEAR ASTROPHYSICS',
      tag: 'নিউক্লিয়ার ফিজিক্স',
      image: bannerSolarFusion,
      accentGradient: 'from-rose-400 via-amber-300 to-yellow-200',
      borderGlow: 'rgba(244,63,94,0.5)',
      glowColor: 'rose',
      icon: Globe2
    }
  ], []);

  // Use Dynamic Admin-Configured Hero Banners if available, otherwise default presets
  const scienceBanners = useMemo(() => {
    if (settings?.heroBanners && Array.isArray(settings.heroBanners) && settings.heroBanners.length > 0) {
      const activeCustomBanners = settings.heroBanners.filter(b => b.isActive !== false);
      if (activeCustomBanners.length > 0) {
        return activeCustomBanners.map(b => {
          const sub = (b.subject || '').toLowerCase();
          let icon = Sparkles;
          if (sub.includes('bio') || sub.includes('জীব')) icon = Activity;
          else if (sub.includes('chem') || sub.includes('রসায়ন')) icon = Dna;
          else if (sub.includes('phys') || sub.includes('পদার্থ')) icon = Atom;
          else if (sub.includes('math') || sub.includes('গণিত')) icon = Compass;
          else if (sub.includes('space') || sub.includes('astro')) icon = Orbit;

          return {
            id: b.id,
            title: b.title || 'Science Studio Hero Banner',
            subtitle: b.subtitle || '',
            badge: b.badge || 'SCIENCE STUDIO',
            tag: b.tag || b.subject || 'সায়েন্স স্টুডিও',
            image: b.image || bannerScienceHeroFull,
            accentGradient: b.accentGradient || 'from-cyan-400 via-teal-300 to-blue-400',
            borderGlow: b.borderGlow || 'rgba(34,211,238,0.5)',
            glowColor: b.glowColor || 'cyan',
            icon: icon
          };
        });
      }
    }
    return defaultScienceBanners;
  }, [settings?.heroBanners, defaultScienceBanners]);

  // Scientific Banner Auto-Rotation Timer (Changes smoothly every 5.5 seconds)
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  useEffect(() => {
    const bannerInterval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % scienceBanners.length);
    }, 5500);

    return () => clearInterval(bannerInterval);
  }, [scienceBanners.length]);

  const activeBanner = scienceBanners[currentBannerIndex] || scienceBanners[0];

  // Keep currentSlide within valid bounds
  useEffect(() => {
    if (currentSlide >= slides.length) {
      setCurrentSlide(0);
    }
  }, [slides.length, currentSlide]);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  // Auto-play timer for courses
  useEffect(() => {
    if (isPaused) {
      if (slideIntervalRef.current) clearInterval(slideIntervalRef.current);
      return;
    }

    slideIntervalRef.current = setInterval(() => {
      nextSlide();
    }, 7000);

    return () => {
      if (slideIntervalRef.current) clearInterval(slideIntervalRef.current);
    };
  }, [isPaused, nextSlide]);

  const activeSlide = slides[currentSlide] || slides[0];

  const handleActionPrimary = () => {
    if (isLoggedIn) {
      onExploreClick();
    } else {
      onJoinClick();
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-73px)] flex flex-col items-center justify-start px-3 sm:px-6 lg:px-8 xl:px-12 overflow-hidden py-4 sm:py-8">
      
      {/* ==================== 1. MAIN 3D ANIMATED HERO SHOWCASE WITH ROTATING SPACE & PHYSICS BANNERS ==================== */}
      <div 
        className="w-full max-w-[1700px] mx-auto z-10"
      >
        {/* Main Hero Card Frame - Fixed, Steady & Stable with Active 3D Theme Accent */}
        <div 
          className="relative w-full rounded-3xl overflow-hidden border border-cyan-500/40 shadow-[0_25px_60px_rgba(0,0,0,0.85)] bg-[#030712] group/card flex flex-col justify-between transition-all duration-700"
          style={{
            boxShadow: `0 20px 60px -15px ${activeBanner.borderGlow || 'rgba(6,182,212,0.3)'}`
          }}
        >
          {/* ================= 1. BACKGROUND ROTATING SPACE, BIOLOGY & PHYSICS 3D BANNERS (100% FULL-BLEED) ================= */}
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            {/* Animated crossfading background 3D images covering the entire hero div */}
            {scienceBanners.map((b, index) => {
              const isActive = index === currentBannerIndex;
              return (
                <div
                  key={b.id}
                  className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                    isActive ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  }`}
                >
                  <img 
                    src={b.image} 
                    alt={b.title} 
                    className="w-full h-full object-cover object-center sm:object-right transform transition-transform duration-[8000ms] ease-out scale-105"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.src = banner3DScienceStudio;
                    }}
                  />
                </div>
              );
            })}

            {/* High-Contrast Gradient Layers: Preserves text readability on left while letting the 3D art on right shine vibrantly */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#030712]/95 via-[#030712]/75 md:via-[#030712]/55 to-[#030712]/20 z-[1] pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#030712]/95 via-transparent to-[#030712]/60 z-[1] pointer-events-none" />
            <div className="absolute inset-0 bg-cyan-950/10 mix-blend-overlay z-[1] pointer-events-none" />
            
            {/* Ambient Neon Pulses with Dynamic Theme Glow */}
            <div 
              className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full opacity-20 filter blur-3xl animate-pulse pointer-events-none z-[1] transition-all duration-1000"
              style={{ backgroundColor: activeBanner.borderGlow || 'rgba(34,211,238,0.4)' }}
            />
          </div>

          {/* 2. Real-time Interactive 3D Particle & Quantum Orbital Canvas (Subtle overlay above banner) */}
          <Hero3DCanvas className="opacity-30 pointer-events-none z-[2]" />

          {/* ================= 3. FOREGROUND CONTENT LAYERED DIRECTLY ON TOP OF FULL-BLEED ROTATING BANNERS ================= */}
          <div className="relative z-10 w-full min-h-[580px] lg:min-h-[660px] p-6 sm:p-8 md:p-10 lg:p-14 flex flex-col justify-between">
            
            {/* Top Navigation & Scientific Concept Indicator Row */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6 sm:mb-8">
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Animated 3D Logo Badge */}
                <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-950/90 border border-cyan-400/50 text-cyan-300 text-xs sm:text-sm font-mono font-semibold tracking-wider shadow-[0_0_20px_rgba(34,211,238,0.3)] backdrop-blur-md">
                  <div className="w-5 h-5 rounded-full overflow-hidden border border-cyan-400/60 shadow-sm shrink-0">
                    <img 
                      src={scienceStudioLogo} 
                      alt="Science Studio Logo" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.src = banner3DScienceStudio;
                      }}
                    />
                  </div>
                  <span className="text-white font-bold">Science Studio by Sakib</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                </div>

                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-medium backdrop-blur-md shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>৩ডি ভিজ্যুয়াল লার্নিং</span>
                </span>

                <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-mono backdrop-blur-md">
                  <Zap className="w-3 h-3 text-cyan-400" />
                  <span>HSC • SSC • Admission</span>
                </span>
              </div>

              {/* Active Scientific Concept Indicator Pill (Space, Biology & Physics Concept Name) */}
              <div className="flex items-center gap-2.5 flex-wrap">
                {/* Dynamic Concept Title Display */}
                <div 
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-950/90 border text-xs font-mono font-bold backdrop-blur-md shadow-lg transition-all duration-500"
                  style={{
                    borderColor: activeBanner.borderGlow || 'rgba(34,211,238,0.5)',
                    boxShadow: `0 0 15px -3px ${activeBanner.borderGlow || 'rgba(34,211,238,0.4)'}`
                  }}
                >
                  {React.createElement(activeBanner.icon || Atom, {
                    className: "w-4 h-4 animate-pulse",
                    style: { color: activeBanner.glowColor === 'emerald' ? '#34d399' : activeBanner.glowColor === 'amber' ? '#fbbf24' : activeBanner.glowColor === 'rose' ? '#fb7185' : '#22d3ee' }
                  })}
                  <span className="text-white font-bold">{activeBanner.badge}</span>
                  <span className="hidden sm:inline text-slate-500">•</span>
                  <span className="hidden sm:inline font-sans font-medium text-slate-200">{activeBanner.tag}</span>
                </div>

                {/* Banner Pagination Switcher with Prev/Next Controls & Dots */}
                <div className="flex items-center gap-1.5 bg-slate-950/85 px-2.5 py-1.5 rounded-full border border-white/15 backdrop-blur-md shadow-md">
                  <button
                    onClick={() => setCurrentBannerIndex((prev) => (prev - 1 + scienceBanners.length) % scienceBanners.length)}
                    title="Previous Scientific 3D Banner"
                    className="w-5 h-5 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer transition-all text-xs"
                  >
                    ‹
                  </button>

                  <div className="flex items-center gap-1 px-1">
                    {scienceBanners.map((b, idx) => (
                      <button
                        key={b.id}
                        onClick={() => setCurrentBannerIndex(idx)}
                        title={`${idx + 1}. ${b.title} (${b.badge})`}
                        className={`h-2 rounded-full transition-all duration-500 cursor-pointer ${
                          idx === currentBannerIndex 
                            ? 'w-5 bg-gradient-to-r shadow-[0_0_12px_rgba(34,211,238,0.9)]' 
                            : 'w-1.5 bg-slate-600 hover:bg-slate-400'
                        } ${idx === currentBannerIndex ? b.accentGradient : ''}`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={() => setCurrentBannerIndex((prev) => (prev + 1) % scienceBanners.length)}
                    title="Next Scientific 3D Banner"
                    className="w-5 h-5 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer transition-all text-xs"
                  >
                    ›
                  </button>
                </div>
              </div>
            </div>

            {/* Main Center Content (Full Width, Crisp & Balanced over Full-Bleed 3D Banner) */}
            <div className="w-full max-w-4xl my-auto text-left py-2">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
                className="space-y-4 sm:space-y-5"
              >
                {/* 1. Main Heading (Exact Requested Heading) */}
                <h1 className="font-serif font-bold text-2xl sm:text-4xl md:text-5xl lg:text-[46px] xl:text-[52px] tracking-normal text-white leading-[1.16] drop-shadow-[0_4px_30px_rgba(0,0,0,0.95)]">
                  Innovate, Educate & Explore with <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-teal-200 to-amber-300 drop-shadow-[0_0_25px_rgba(34,211,238,0.4)]">Science Studio by Sakib</span>
                </h1>

                {/* 2. Main Bengali Description (Exact Requested Bengali text) */}
                <p className="text-slate-100 text-sm sm:text-base md:text-[17px] lg:text-[18px] leading-relaxed font-sans font-normal max-w-3xl drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
                  বিজ্ঞান চর্চাকে সহজ, আনন্দদায়ক এবং প্রযুক্তিনির্ভর করতে সাকিব স্যারের এই বিশেষ উদ্যোগ। Science Studio by Sakib-এ রয়েছে সেরা মানের ভিডিও লেকচার, ইন্টারেক্টিভ সিমুলেটর এবং সার্বক্ষণিক ডাউট সলভ মেন্টরশিপ।
                </p>

                {/* 3. English Subtitle Description (Exact Requested English text) */}
                <p className="text-xs sm:text-sm md:text-[15px] text-cyan-200/95 font-serif italic leading-relaxed max-w-3xl drop-shadow-sm">
                  Experience premium science coaching with high-fidelity interactive simulation play desks, curated video masterclasses, and concise PDF materials by Sakib Sir.
                </p>

                {/* 4. The 4 Requested Feature Points (Glassmorphic Cards directly over background banner) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 max-w-3xl">
                  {/* Feature 1 */}
                  <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-950/80 hover:bg-slate-900/90 border border-cyan-500/40 hover:border-cyan-400 text-slate-100 text-xs sm:text-sm font-medium shadow-xl backdrop-blur-xl transition-all group/item">
                    <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 flex items-center justify-center shrink-0 shadow-inner group-hover/item:scale-110 transition-transform">
                      <MonitorPlay className="w-4 h-4" />
                    </div>
                    <span className="font-semibold text-white">স্মার্ট ক্লাসরুম লার্নিং</span>
                  </div>

                  {/* Feature 2 */}
                  <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-950/80 hover:bg-slate-900/90 border border-emerald-500/40 hover:border-emerald-400 text-slate-100 text-xs sm:text-sm font-medium shadow-xl backdrop-blur-xl transition-all group/item">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 flex items-center justify-center shrink-0 shadow-inner group-hover/item:scale-110 transition-transform">
                      <FileText className="w-4 h-4" />
                    </div>
                    <span className="font-semibold text-white">অধ্যায়ভিত্তিক PDF নোট</span>
                  </div>

                  {/* Feature 3 */}
                  <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-950/80 hover:bg-slate-900/90 border border-amber-500/40 hover:border-amber-400 text-slate-100 text-xs sm:text-sm font-medium shadow-xl backdrop-blur-xl transition-all group/item">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/30 text-amber-300 flex items-center justify-center shrink-0 shadow-inner group-hover/item:scale-110 transition-transform">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <span className="font-semibold text-white">২৪/৭ ডাউট সলভ ডেস্ক</span>
                  </div>

                  {/* Feature 4 */}
                  <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-950/80 hover:bg-slate-900/90 border border-purple-500/40 hover:border-purple-400 text-slate-100 text-xs sm:text-sm font-medium shadow-xl backdrop-blur-xl transition-all group/item">
                    <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-400/30 text-purple-300 flex items-center justify-center shrink-0 shadow-inner group-hover/item:scale-110 transition-transform">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <span className="font-semibold text-white">সাকিব স্যারের মেন্টরশিপ</span>
                  </div>
                </div>

                {/* 5. Requested Action Buttons */}
                <div className="flex flex-wrap items-center gap-3.5 pt-3">
                  {/* Primary Button */}
                  <button
                    id="hero-enroll-primary-btn"
                    onClick={handleActionPrimary}
                    className="px-7 sm:px-9 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm sm:text-base tracking-wide transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_35px_rgba(6,182,212,0.45)] transform hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <span>ভর্তি হন / রেজিস্ট্রেশন করুন</span>
                    <ArrowRight className="w-4 h-4 text-white" />
                  </button>

                  {/* Secondary Button */}
                  <button
                    type="button"
                    id="hero-weekly-routine-btn"
                    onClick={onOpenRoutine}
                    className="px-5 sm:px-7 py-3.5 rounded-xl bg-slate-950/90 hover:bg-slate-900 border border-white/25 hover:border-cyan-400 text-slate-100 hover:text-white font-medium text-sm sm:text-base transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-xl backdrop-blur-xl transform hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <BookOpen className="w-4 h-4 text-cyan-300" />
                    <span>সাপ্তাহিক ক্লাস রুটিন দেখুন</span>
                  </button>

                  {/* 3D Lab Simulation Trigger Button */}
                  <button
                    type="button"
                    onClick={onExploreLab}
                    className="px-5 sm:px-6 py-3.5 rounded-xl bg-cyan-950/70 hover:bg-cyan-900/80 border border-cyan-400/40 hover:border-cyan-300 text-cyan-200 hover:text-white font-medium text-sm sm:text-base transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg backdrop-blur-xl"
                  >
                    <Cpu className="w-4 h-4 text-cyan-400" />
                    <span>ভার্চুয়াল ৩ডি ল্যাব</span>
                  </button>
                </div>
              </motion.div>
            </div>

          </div>

          {/* Bottom Bar: Academy Highlights & Scientific Concept Subtitle */}
          <div className="relative z-10 flex items-center justify-between px-5 sm:px-7 md:px-9 lg:px-12 py-3 bg-slate-950/85 border-t border-white/10 flex-wrap gap-4">
            
            {/* Academy Features Tagline & Current Scientific Concept Details */}
            <div className="flex items-center gap-4 text-xs font-mono text-slate-300 flex-wrap">
              <span className="flex items-center gap-1.5 text-cyan-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>ভিজ্যুয়াল কনসেপ্ট ক্লিয়ারিং</span>
              </span>
              <span className="hidden sm:inline text-slate-600">•</span>
              <span className="hidden sm:flex items-center gap-1.5 text-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>এক্সক্লুসিভ প্র্যাকটিস বুকলেট</span>
              </span>
              <span className="hidden md:inline text-slate-600">•</span>
              <span className="hidden md:flex items-center gap-1.5 text-amber-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                <span>সরাসরি সাকিব স্যারের তত্ত্বাবধান</span>
              </span>
              <span className="hidden lg:inline text-slate-600">•</span>
              <span className="hidden lg:inline text-slate-400 font-sans italic">
                {activeBanner.title}: {activeBanner.subtitle}
              </span>
            </div>

            {/* Scroll Indicator */}
            <div className="flex items-center gap-1.5 text-slate-300/80 text-xs font-mono tracking-widest uppercase">
              <span className="opacity-80">EXPLORE MORE</span>
              <motion.div
                animate={{ y: [0, 4, 0] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                className="text-sm text-cyan-300"
              >
                ↓
              </motion.div>
            </div>
          </div>

        </div>

        {/* ==================== 2. ANNOUNCEMENT & MARQUEE STRIP ==================== */}
        <div className="w-full my-4 sm:my-6">
          <AnnouncementBanner 
            settings={settings}
            onOpenRoutine={onOpenRoutine}
            onOpenContact={onOpenContact}
            onJoinClick={onJoinClick}
          />
        </div>

        {/* ==================== 3. 3D INTERACTIVE SCIENCE & CYTOLOGY LAB (DIRECTLY BELOW HERO/ANNOUNCEMENT) ==================== */}
        <div className="w-full my-6 sm:my-10" id="hero-interactive-science-lab">
          <InteractiveScience settings={settings} />
        </div>

        {/* ==================== 4. COURSE ORBIT & ACADEMY INSIGHTS SECTION ==================== */}
        <div className="my-6 sm:my-10 w-full" id="course-orbit-main-container">
          <CourseOrbitSection 
            onJoinClick={onJoinClick}
            settings={settings}
            coursesList={courses}
          />
        </div>

        {/* ==================== 5. ACADEMIC LEADERSHIP & LEARNING PILLARS SECTION ==================== */}
        <div className="my-6 sm:my-12 w-full" id="mentor-learning-pillars-container">
          <div className="w-full p-5 sm:p-8 lg:p-10 rounded-3xl bg-[#0b1329]/95 border border-slate-800/90 hover:border-slate-700/80 backdrop-blur-2xl shadow-2xl relative overflow-hidden text-left">
            
            {/* Background 3D Science Watermark & Glowing Circles */}
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-1/2 right-10 -translate-y-1/2 w-64 h-64 opacity-5 pointer-events-none">
              <Atom className="w-full h-full text-cyan-400 animate-spin-slow" />
            </div>

            {/* Section Header */}
            <div className="text-center mb-8 relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 text-xs font-mono uppercase tracking-widest mb-3 backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span>{settings?.pillarsSectionBadge || "LEADERSHIP & PEDAGOGY PILLARS"}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-extrabold text-white tracking-tight leading-tight">
                {settings?.pillarsSectionTitle || (
                  <>
                    সাকিব স্যারের একাডেমি ও <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-400">মেন্টরশিপের মূল স্তম্ভসমূহ</span>
                  </>
                )}
              </h2>
              <p className="mt-2 text-slate-300 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed text-center font-sans">
                {settings?.pillarsSectionSubtitle || "ব্যক্তিগত যত্ন, আধুনিক প্রযুক্তি এবং নিরবচ্ছিন্ন নির্দেশনার মাধ্যমে প্রতিটি শিক্ষার্থীকে পৌঁছে দেওয়া হয় তাদের কাঙ্ক্ষিত সফলতায়।"}
              </p>
            </div>

            {/* 1. MENTOR PROFILE & LEADERSHIP (CENTER ALIGNED & CIRCULAR AVATAR) */}
            <div className="w-full mb-6 relative z-10">
              <div className="w-full p-5 sm:p-8 md:p-10 rounded-3xl bg-gradient-to-b from-[#0e172c]/95 via-[#0b1428]/95 to-[#091122]/95 border border-slate-800/90 hover:border-cyan-500/30 backdrop-blur-xl shadow-xl relative overflow-hidden group">
                
                {/* Header row inside card */}
                <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/10 flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                    <span className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider">মেন্টরশিপ ও অ্যাকাডেমিক লিডারশিপ</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3.5 py-1 rounded-full bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 text-xs font-mono font-bold flex items-center gap-1.5 shadow-sm">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      <span>VERIFIED LEAD EDUCATOR</span>
                    </span>
                  </div>
                </div>

                {/* Main Profile Info: Center Aligned with Circular Profile Photo */}
                <div className="flex flex-col items-center justify-center text-center max-w-3xl mx-auto space-y-4">
                  {/* Circular Avatar Frame with Outer Glow Ring */}
                  <div className="relative group-hover:scale-105 transition-transform duration-300">
                    <div className="w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-full p-1 bg-gradient-to-tr from-cyan-400 via-teal-400 to-blue-500 shadow-[0_0_30px_rgba(34,211,238,0.4)]">
                      <div className="w-full h-full rounded-full overflow-hidden bg-slate-900 border-2 border-slate-950">
                        <img 
                          src={settings?.adminPhotoUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=500&auto=format&fit=crop&q=60"} 
                          alt={settings?.adminName || "সাকিব স্যার"} 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=500&auto=format&fit=crop&q=60";
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Name and Designation */}
                  <div className="space-y-2">
                    <h3 className="text-white font-display font-black text-2xl sm:text-3xl md:text-4xl tracking-tight">
                      {settings?.adminName || "সাকিব স্যার"}
                    </h3>
                    
                    <div className="flex items-center justify-center gap-2 flex-wrap pt-0.5">
                      {settings?.adminDesignation && (
                        <span className="inline-block px-3 py-1 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 text-xs font-mono font-bold">
                          {settings.adminDesignation}
                        </span>
                      )}
                      {settings?.adminEducation && (
                        <span className="text-cyan-300/90 font-mono text-xs font-medium px-2.5 py-0.5 rounded-full bg-slate-800/80 border border-slate-700/60">
                          {settings.adminEducation}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Highlights Badges (Personal Guidance & Experience) */}
                  <div className="flex items-center justify-center gap-3 flex-wrap pt-1">
                    <span className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-sans font-bold shadow-sm">
                      <ShieldCheck className="w-4 h-4 text-cyan-400" />
                      <span>{settings?.mentorGuidance || "১০০% পার্সোনাল গাইডেন্স"}</span>
                    </span>
                    <span className="px-3.5 py-1.5 rounded-xl bg-amber-500/15 border border-amber-400/35 text-amber-300 text-xs font-mono font-bold shadow-sm">
                      {settings?.mentorExperience || "১০+ বছরের অভিজ্ঞতা"}
                    </span>
                  </div>

                  {/* Bio Description - Center Aligned */}
                  <div className="pt-2">
                    {settings?.adminBio ? (
                      <p className="text-slate-300 text-xs sm:text-sm md:text-base leading-relaxed font-sans max-w-2xl mx-auto">
                        {settings.adminBio}
                      </p>
                    ) : (
                      <p className="text-slate-300 text-xs sm:text-sm md:text-base leading-relaxed font-sans max-w-2xl mx-auto">
                        পদার্থবিজ্ঞান, রসায়ন ও উচ্চতর গণিতকে মুখস্থবিদ্যার গণ্ডি থেকে বের করে বাস্তব ক্লাসরুম ও ভিজ্যুয়াল ব্যাখ্যার মাধ্যমে সহজে হৃদয়ঙ্গম করানোর ক্ষেত্রে নিবেদিতপ্রাণ মেন্টর। প্রতিটি শিক্ষার্থীর ব্যক্তিগত দুর্বলতা চিহ্নিত করে পরিকল্পিত নির্দেশনায় পৌঁছে দেওয়া হয় কাঙ্ক্ষিত সফলতায়।
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. BOTTOM 3 RECTANGULAR PILLAR CARDS WITH 3D BANNERS & VISUALS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 relative z-10 w-full">
              
              {/* Rectangular Card 1: Video Classes */}
              <div className="rounded-2xl bg-gradient-to-b from-[#0e172c]/95 to-[#0b1329]/95 border border-slate-800/90 hover:border-cyan-500/40 backdrop-blur-xl transition-all duration-300 group flex flex-col justify-between shadow-lg hover:shadow-xl hover:-translate-y-1 relative overflow-hidden">
                {/* 3D Visual Header Strip */}
                <div className="h-20 w-full relative overflow-hidden border-b border-white/10">
                  <img 
                    src={bannerParticleAccelerator} 
                    alt="Video Classes 3D" 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-60"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0e172c] via-[#0e172c]/40 to-transparent" />
                  <div className="absolute top-2.5 left-3 flex items-center gap-1.5">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 backdrop-blur-md">
                      {settings?.pillar1Badge || "HD RECORDED 3D"}
                    </span>
                  </div>
                </div>

                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-400/30 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(34,211,238,0.2)] shrink-0">
                        <Video className="w-5 h-5" />
                      </div>
                      <h4 className="text-white font-display font-bold text-base sm:text-lg leading-snug">
                        {settings?.pillar1Title || "ইন্টারেক্টিভ ভিডিও ও ডিজিটাল ক্লাস"}
                      </h4>
                    </div>
                    <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                      {settings?.pillar1Description || "যেকোনো জটিল বৈজ্ঞানিক টপিক সহজে ভিজ্যুয়ালাইজ করার জন্য রয়েছে প্রিমিয়াম এইচডি ভিডিও ক্লাস, থ্রিডি অ্যানিমেশন ও লাইভ সেশনের আর্কাইভ।"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Rectangular Card 2: Lecture Notes */}
              <div className="rounded-2xl bg-gradient-to-b from-[#0e172c]/95 to-[#0b1329]/95 border border-slate-800/90 hover:border-emerald-500/40 backdrop-blur-xl transition-all duration-300 group flex flex-col justify-between shadow-lg hover:shadow-xl hover:-translate-y-1 relative overflow-hidden">
                {/* 3D Visual Header Strip */}
                <div className="h-20 w-full relative overflow-hidden border-b border-white/10">
                  <img 
                    src={bannerMolecularDNA} 
                    alt="Notes 3D" 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-60"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0e172c] via-[#0e172c]/40 to-transparent" />
                  <div className="absolute top-2.5 left-3 flex items-center gap-1.5">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 backdrop-blur-md">
                      {settings?.pillar2Badge || (notesCount ? `${notesCount}+ শিট` : "৩৫+ শিট")}
                    </span>
                  </div>
                </div>

                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-400/30 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(16,185,129,0.2)] shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <h4 className="text-white font-display font-bold text-base sm:text-lg leading-snug">
                        {settings?.pillar2Title || "অধ্যায়ভিত্তিক PDF নোট ও ফর্মুলা বুক"}
                      </h4>
                    </div>
                    <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                      {settings?.pillar2Description || "পরীক্ষার দ্রুত ও নির্ভুল রিভিশনের জন্য প্রতিটি অধ্যায়ের শেষে ডাউনলোডযোগ্য রঙিন হ্যান্ডরাইটিং শিট, শর্টকাট ট্রিকস ও প্র্যাকটিস বুকলেট।"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Rectangular Card 3: 24/7 Mentor Doubt Solving Desk */}
              <div className="rounded-2xl bg-gradient-to-b from-[#0e172c]/95 to-[#0b1329]/95 border border-slate-800/90 hover:border-purple-500/40 backdrop-blur-xl transition-all duration-300 group flex flex-col justify-between shadow-lg hover:shadow-xl hover:-translate-y-1 relative overflow-hidden">
                {/* 3D Visual Header Strip */}
                <div className="h-20 w-full relative overflow-hidden border-b border-white/10">
                  <img 
                    src={bannerNeuroSynapse} 
                    alt="Doubt Desk 3D" 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-60"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0e172c] via-[#0e172c]/40 to-transparent" />
                  <div className="absolute top-2.5 left-3 flex items-center gap-1.5">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30 backdrop-blur-md">
                      {settings?.pillar3Badge || "LIVE 24/7 ASSISTANCE"}
                    </span>
                  </div>
                </div>

                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-400/30 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(168,85,247,0.2)] shrink-0">
                        <Users className="w-5 h-5" />
                      </div>
                      <h4 className="text-white font-display font-bold text-base sm:text-lg leading-snug">
                        {settings?.pillar3Title || "২৪/৭ মেন্টর সাপোর্ট ও ডাউট সলভ ডেস্ক"}
                      </h4>
                    </div>
                    <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                      {settings?.pillar3Description || "পড়ালেখার যেকোনো অস্পষ্টতায় সরাসরি প্রশ্ন করার সুযোগ, স্পেশাল প্রবলেম সলভিং সেশন এবং শিক্ষার্থীর পারফরম্যান্স ও অগ্রগতি ট্র্যাকিং।"}
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
