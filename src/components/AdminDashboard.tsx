import React, { useState, useEffect, useMemo } from 'react';
import { User, Class, Note, AdminStats, Settings, RoutineItem, Course, HeroBanner } from '../types';
import { formatVideoEmbedUrl, isIframeVideoUrl } from '../utils/videoHelper';
import LogoImage from '../assets/images/science_studio_logo_1784521830593.jpg';

// Bespoke 3D Science Studio & Space Physics Concept Banners for Section Backgrounds & Hero Carousel
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
import bannerPhysicsLab from '../assets/images/hero_physics_quantum_lab_1787477039417.jpg';
import bannerChemistryHub from '../assets/images/hero_chemistry_molecular_hub_1787477057681.jpg';
import bannerMathStudio from '../assets/images/hero_mathematics_calculus_studio_1787477075299.jpg';
import bannerBiologyGenetics from '../assets/images/hero_biology_genetics_lab_1787477092542.jpg';
import coachingClassroomBg from '../assets/images/coaching_classroom_students_1787474667001.jpg';
import sakibStudioBg from '../assets/images/science_studio_sakib_bg_1787476852835.jpg';
import { 
  Atom,
  Users, 
  Video, 
  FileText, 
  Plus, 
  Trash2, 
  UserX, 
  UserCheck, 
  Shield,
  ShieldAlert, 
  Sparkles, 
  BookOpen, 
  Upload, 
  Activity, 
  Check,
  CheckCircle,
  AlertCircle,
  Settings as SettingsIcon,
  Save,
  Trash,
  Calendar,
  Lock,
  Unlock,
  Mail,
  Phone,
  CreditCard,
  ShoppingBag,
  Image as ImageIcon,
  Search,
  Eye,
  Play,
  Filter,
  Layers,
  ExternalLink,
  Globe,
  Download,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  RotateCcw,
  Sun,
  Moon
} from 'lucide-react';
import { downloadPdfFile, openPdfInBrowser } from '../utils/pdfHelper';
import { compressImageFile } from '../utils/imageHelper';
import { supabase } from '../lib/supabase';

interface AdminDashboardProps {
  user: User;
  classes: Class[];
  notes: Note[];
  onRefreshData: () => void;
  settings?: Settings;
  onRefreshSettings?: () => void;
  initialSection?: 'dashboard' | 'settings';
}

export default function AdminDashboard({ 
  user, 
  classes, 
  notes, 
  onRefreshData,
  settings,
  onRefreshSettings,
  initialSection
}: AdminDashboardProps) {
  // Stats state
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [userList, setUserList] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const getAuthToken = () => localStorage.getItem('science_studio_token') || `token-${user.id}`;

  // Student Table Pagination, Search & Date Filter state
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState<'all' | 'approved' | 'pending'>('all');
  const [userStartDate, setUserStartDate] = useState('');
  const [userEndDate, setUserEndDate] = useState('');
  const [tempStartDate, setTempStartDate] = useState('');
  const [tempEndDate, setTempEndDate] = useState('');
  const [userItemsPerPage, setUserItemsPerPage] = useState<number | 'all'>(10);
  const [userCurrentPage, setUserCurrentPage] = useState(1);

  // Apply and Clear Date Filter Handlers
  const handleApplyDateFilter = () => {
    setUserStartDate(tempStartDate);
    setUserEndDate(tempEndDate);
    setUserCurrentPage(1);
  };

  const handleClearDateFilter = () => {
    setTempStartDate('');
    setTempEndDate('');
    setUserStartDate('');
    setUserEndDate('');
    setUserCurrentPage(1);
  };

  // Quick Date Preset Handler
  const setDatePreset = (preset: 'today' | '7days' | '30days' | 'thisMonth' | 'all') => {
    const now = new Date();
    const formatDate = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    if (preset === 'today') {
      const todayStr = formatDate(now);
      setTempStartDate(todayStr);
      setTempEndDate(todayStr);
      setUserStartDate(todayStr);
      setUserEndDate(todayStr);
    } else if (preset === '7days') {
      const past = new Date();
      past.setDate(now.getDate() - 6);
      const pastStr = formatDate(past);
      const nowStr = formatDate(now);
      setTempStartDate(pastStr);
      setTempEndDate(nowStr);
      setUserStartDate(pastStr);
      setUserEndDate(nowStr);
    } else if (preset === '30days') {
      const past = new Date();
      past.setDate(now.getDate() - 29);
      const pastStr = formatDate(past);
      const nowStr = formatDate(now);
      setTempStartDate(pastStr);
      setTempEndDate(nowStr);
      setUserStartDate(pastStr);
      setUserEndDate(nowStr);
    } else if (preset === 'thisMonth') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const firstStr = formatDate(firstDay);
      const nowStr = formatDate(now);
      setTempStartDate(firstStr);
      setTempEndDate(nowStr);
      setUserStartDate(firstStr);
      setUserEndDate(nowStr);
    } else if (preset === 'all') {
      setTempStartDate('');
      setTempEndDate('');
      setUserStartDate('');
      setUserEndDate('');
    }
    setUserCurrentPage(1);
  };

  // Modal State for User Delete & TrxID Edit
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeletingUser, setIsDeletingUser] = useState(false);
  const [deleteUserError, setDeleteUserError] = useState('');

  // Modal State for Course Delete
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [isDeletingCourse, setIsDeletingCourse] = useState(false);
  const [deleteCourseError, setDeleteCourseError] = useState('');

  // Modal State for Class Delete
  const [classToDelete, setClassToDelete] = useState<Class | null>(null);
  const [isDeletingClass, setIsDeletingClass] = useState(false);
  const [deleteClassError, setDeleteClassError] = useState('');

  // Modal State for Note Delete
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);
  const [isDeletingNote, setIsDeletingNote] = useState(false);
  const [deleteNoteError, setDeleteNoteError] = useState('');

  const [userToEditTrx, setUserToEditTrx] = useState<{ id: string; name: string; currentTrx: string } | null>(null);
  const [editTrxInput, setEditTrxInput] = useState('');
  const [isUpdatingTrx, setIsUpdatingTrx] = useState(false);

  // Filtered and Paginated User List
  const filteredUserList = useMemo(() => {
    return userList.filter(u => {
      const q = userSearchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.phone && u.phone.includes(q)) ||
        (u.id && u.id.toLowerCase().includes(q)) ||
        (u.transactionId && u.transactionId.toLowerCase().includes(q)) ||
        (u.enrolledCourseTitles && u.enrolledCourseTitles.some(t => t.toLowerCase().includes(q)));

      const matchesStatus = 
        userStatusFilter === 'all' ||
        (userStatusFilter === 'approved' && u.isApproved) ||
        (userStatusFilter === 'pending' && !u.isApproved);

      let matchesDate = true;
      if (u.createdAt) {
        const uDate = new Date(u.createdAt);
        if (userStartDate) {
          const start = new Date(userStartDate + 'T00:00:00');
          if (uDate < start) matchesDate = false;
        }
        if (userEndDate) {
          const end = new Date(userEndDate + 'T23:59:59');
          if (uDate > end) matchesDate = false;
        }
      }

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [userList, userSearchQuery, userStatusFilter, userStartDate, userEndDate]);

  const totalUsersCount = filteredUserList.length;
  const effectivePageSize = userItemsPerPage === 'all' ? (totalUsersCount || 1) : Number(userItemsPerPage);
  const totalPages = Math.max(1, Math.ceil(totalUsersCount / (userItemsPerPage === 'all' ? 1 : effectivePageSize)));

  const paginatedUserList = useMemo(() => {
    if (userItemsPerPage === 'all') return filteredUserList;
    const startIndex = (userCurrentPage - 1) * effectivePageSize;
    return filteredUserList.slice(startIndex, startIndex + effectivePageSize);
  }, [filteredUserList, userCurrentPage, effectivePageSize, userItemsPerPage]);

  // Tab/Section selection state
  const [activeTab, setActiveTab] = useState<'dashboard' | 'upload' | 'course-overview'>('dashboard');
  const [dashSubTab, setDashSubTab] = useState<'overview' | 'users' | 'settings' | 'routine' | 'courses' | 'hero-banners'>(() => {
    if (initialSection === 'settings') return 'settings';
    return 'overview';
  });

  // Hero Banners Management State
  const defaultAdminHeroBanners: HeroBanner[] = useMemo(() => [
    {
      id: 'bio-cell',
      title: 'ইউক্যারিওটিক সেল ও সাইটোলজি ৩ডি ল্যাব',
      subtitle: 'মাইটোকন্ড্রিয়া, এটিপি সংশ্লেষণ, কোষ অঙ্গাণু ও এন্ডোপ্লাজমিক জালিকা (Eukaryotic Cell Organelles, Mitochondria ATP & Endoplasmic Reticulum)',
      badge: '3D CELL BIOLOGY',
      tag: 'কোষ অঙ্গাণু ও সাইটোলজি',
      image: bannerBioCellOrganelle,
      subject: 'Biology',
      accentGradient: 'from-emerald-400 via-teal-300 to-amber-300',
      borderGlow: 'rgba(16,185,129,0.5)',
      glowColor: 'emerald',
      actionButtonText: 'ভর্তি হতে ক্লিক করুন',
      isActive: true,
      order: 1
    },
    {
      id: 'neuro-synapse',
      title: 'নিউরন সাইন্যাপ্স ও হিউম্যান ব্রেন বায়োলজি',
      subtitle: 'অ্যাকশন পটেনশিয়াল, নিউরোট্রান্সমিটার ও স্নায়ুতন্ত্রের সিগন্যালিং (Neural Synaptic Action Potentials & Neurotransmitter Dynamics)',
      badge: 'NEUROBIOLOGY & BRAIN',
      tag: 'স্নায়ুবিজ্ঞান ও মানব ফিজিওলজি',
      image: bannerNeuroSynapse,
      subject: 'Biology',
      accentGradient: 'from-cyan-400 via-sky-300 to-indigo-300',
      borderGlow: 'rgba(56,189,248,0.5)',
      glowColor: 'cyan',
      actionButtonText: 'ভর্তি হতে ক্লিক করুন',
      isActive: true,
      order: 2
    },
    {
      id: 'electromagnetism-flux',
      title: 'ইলেক্ট্রোম্যাগনেটিজম ও চৌম্বক ফ্লাক্স সিমুলেটর',
      subtitle: 'তড়িৎ চৌম্বকীয় আবেশ, লরেঞ্জ বল, কয়েল ও চৌম্বক বলরেখা (Electromagnetic Induction, Lorentz Force & Magnetic Field Vectors)',
      badge: 'ELECTROMAGNETISM 3D',
      tag: 'তড়িৎ ও চুম্বকবিদ্যা',
      image: bannerElectromagnetismFlux,
      subject: 'Physics',
      accentGradient: 'from-blue-400 via-cyan-300 to-teal-300',
      borderGlow: 'rgba(59,130,246,0.5)',
      glowColor: 'blue',
      actionButtonText: 'ভর্তি হতে ক্লিক করুন',
      isActive: true,
      order: 3
    },
    {
      id: 'thermodynamics-entropy',
      title: 'থার্মোডাইনামিক্স ও গ্যাসীয় গতিতত্ত্ব',
      subtitle: 'তাপগতিবিদ্যার সূত্র, এনট্রপি ওয়েভফর্ম ও গ্যাসীয় অণুর গতিতত্ত্ব (Thermodynamics, Entropy Waveforms & Molecular Kinetic Theory)',
      badge: 'THERMODYNAMICS 3D',
      tag: 'তাপ ও গতিতত্ত্ব',
      image: bannerThermodynamicsEntropy,
      subject: 'Physics',
      accentGradient: 'from-orange-400 via-amber-300 to-cyan-300',
      borderGlow: 'rgba(249,115,22,0.5)',
      glowColor: 'amber',
      actionButtonText: 'ভর্তি হতে ক্লিক করুন',
      isActive: true,
      order: 4
    },
    {
      id: 'molecular-dna',
      title: 'মলিকিউলার জেনেটিক্স ও ডিএনএ ৩ডি ইউনিভার্স',
      subtitle: 'ডিএনএ ডাবল হেলিক্স, রাসায়নিক বন্ধন ও বংশগতিবিদ্যা (DNA Double Helix & Molecular Genetics)',
      badge: 'BIO-PHYSICS & GENETICS',
      tag: 'ডিএনএ ও জেনেটিক্স',
      image: bannerMolecularDNA,
      subject: 'Chemistry',
      accentGradient: 'from-blue-400 via-teal-300 to-emerald-300',
      borderGlow: 'rgba(56,189,248,0.5)',
      glowColor: 'teal',
      actionButtonText: 'ভর্তি হতে ক্লিক করুন',
      isActive: true,
      order: 5
    },
    {
      id: 'quantum-atom',
      title: 'কোয়ান্টাম অ্যাটমিক স্টুডিও ও অরবিটাল সিমুলেটর',
      subtitle: 'পারমাণবিক মডেল, ইলেকট্রন অরবিট ও কোয়ান্টাম শক্তিস্তর (Atomic Model & Orbital Simulation)',
      badge: 'QUANTUM PHYSICS',
      tag: 'পরমাণু মডেল ও তরঙ্গ',
      image: bannerScienceHeroFull,
      subject: 'Physics',
      accentGradient: 'from-cyan-400 via-teal-300 to-blue-400',
      borderGlow: 'rgba(34,211,238,0.5)',
      glowColor: 'cyan',
      actionButtonText: 'ভর্তি হতে ক্লিক করুন',
      isActive: true,
      order: 6
    },
    {
      id: 'space-blackhole',
      title: 'মহাকর্ষীয় লেন্সিং ও ব্ল্যাকহোল অ্যাস্ট্রোফিজিক্স',
      subtitle: 'স্থান-কাল বক্রতা, সাধারণ আপেক্ষিকতা ও ইভেন্ট হরাইজন (Gravitational Lensing & Spacetime Curvature)',
      badge: 'ASTROPHYSICS & RELATIVITY',
      tag: 'স্থান-কাল ও মহাকর্ষ',
      image: bannerBlackHoleSpacetime,
      subject: 'Astrophysics',
      accentGradient: 'from-amber-400 via-rose-300 to-cyan-300',
      borderGlow: 'rgba(245,158,11,0.5)',
      glowColor: 'amber',
      actionButtonText: 'ভর্তি হতে ক্লিক করুন',
      isActive: true,
      order: 7
    },
    {
      id: 'solar-fusion',
      title: 'স্টেলার নিউক্লিয়ার ফিউশন ও কসমিক এনার্জি',
      subtitle: 'নক্ষত্রের কেন্দ্রভাগ, হাইড্রোজেন প্লাজমা ফিউশন ও সৌর বিকিরণ (Nuclear Fusion & Coronal Flares)',
      badge: 'NUCLEAR ASTROPHYSICS',
      tag: 'নিউক্লিয়ার ফিজিক্স',
      image: bannerSolarFusion,
      subject: 'Astrophysics',
      accentGradient: 'from-rose-400 via-amber-300 to-yellow-200',
      borderGlow: 'rgba(244,63,94,0.5)',
      glowColor: 'rose',
      actionButtonText: 'ভর্তি হতে ক্লিক করুন',
      isActive: true,
      order: 8
    }
  ], []);

  const heroPresetImages = useMemo(() => [
    { label: '3D Cell Biology & Cytology', image: bannerBioCellOrganelle, badge: '3D CELL BIOLOGY', subject: 'Biology', gradient: 'from-emerald-400 via-teal-300 to-amber-300', glow: 'emerald' },
    { label: 'Neurobiology & Synaptic Brain', image: bannerNeuroSynapse, badge: 'NEUROBIOLOGY & BRAIN', subject: 'Biology', gradient: 'from-cyan-400 via-sky-300 to-indigo-300', glow: 'cyan' },
    { label: 'Electromagnetism & Magnetic Flux', image: bannerElectromagnetismFlux, badge: 'ELECTROMAGNETISM 3D', subject: 'Physics', gradient: 'from-blue-400 via-cyan-300 to-teal-300', glow: 'blue' },
    { label: 'Thermodynamics & Molecular Entropy', image: bannerThermodynamicsEntropy, badge: 'THERMODYNAMICS 3D', subject: 'Physics', gradient: 'from-orange-400 via-amber-300 to-cyan-300', glow: 'amber' },
    { label: 'Molecular Genetics & DNA Helix', image: bannerMolecularDNA, badge: 'BIO-PHYSICS & GENETICS', subject: 'Chemistry', gradient: 'from-blue-400 via-teal-300 to-emerald-300', glow: 'teal' },
    { label: 'Quantum Atom & Orbital Studio', image: bannerScienceHeroFull, badge: 'QUANTUM PHYSICS', subject: 'Physics', gradient: 'from-cyan-400 via-teal-300 to-blue-400', glow: 'cyan' },
    { label: 'Astrophysics & Black Hole Relativity', image: bannerBlackHoleSpacetime, badge: 'ASTROPHYSICS & RELATIVITY', subject: 'Astrophysics', gradient: 'from-amber-400 via-rose-300 to-cyan-300', glow: 'amber' },
    { label: 'Stellar Solar Nuclear Fusion', image: bannerSolarFusion, badge: 'NUCLEAR ASTROPHYSICS', subject: 'Astrophysics', gradient: 'from-rose-400 via-amber-300 to-yellow-200', glow: 'rose' },
    { label: 'Quantum Particle Accelerator', image: bannerParticleAccelerator, badge: 'PARTICLE ACCELERATOR', subject: 'Physics', gradient: 'from-purple-400 via-indigo-300 to-cyan-300', glow: 'purple' },
    { label: 'Laser Optics & Light Waves', image: bannerLaserOptics, badge: 'OPTICS & PHOTONICS', subject: 'Physics', gradient: 'from-teal-400 via-cyan-300 to-blue-300', glow: 'cyan' },
    { label: 'Deep Cosmic Space Nebula', image: bannerCosmicNebula, badge: 'COSMIC ASTROPHYSICS', subject: 'Astrophysics', gradient: 'from-indigo-400 via-purple-300 to-pink-300', glow: 'indigo' },
    { label: 'Physics Quantum Lab Studio', image: bannerPhysicsLab, badge: 'PHYSICS QUANTUM LAB', subject: 'Physics', gradient: 'from-cyan-400 via-blue-300 to-teal-300', glow: 'cyan' },
    { label: 'Chemistry Molecular Hub', image: bannerChemistryHub, badge: 'CHEMISTRY MOLECULAR HUB', subject: 'Chemistry', gradient: 'from-emerald-400 via-cyan-300 to-teal-300', glow: 'emerald' },
    { label: 'Mathematics Calculus Studio', image: bannerMathStudio, badge: 'ADVANCED MATHEMATICS', subject: 'Mathematics', gradient: 'from-amber-400 via-orange-300 to-rose-300', glow: 'amber' },
    { label: 'Biology & Genetics Laboratory', image: bannerBiologyGenetics, badge: 'BIOLOGY & GENETICS', subject: 'Biology', gradient: 'from-teal-400 via-emerald-300 to-amber-300', glow: 'teal' },
    { label: 'Science Studio 3D Master Classroom', image: banner3DScienceStudio, badge: 'SCIENCE STUDIO 3D', subject: 'General Science', gradient: 'from-cyan-400 via-teal-300 to-blue-400', glow: 'cyan' },
    { label: 'Offline Coaching Classroom', image: coachingClassroomBg, badge: 'OFFLINE CLASSROOM', subject: 'General Science', gradient: 'from-sky-400 via-cyan-300 to-indigo-300', glow: 'cyan' },
    { label: 'Sakib Sir Studio Master Desk', image: sakibStudioBg, badge: 'SAKIB SIR MASTER DESK', subject: 'General Science', gradient: 'from-amber-400 via-cyan-300 to-teal-300', glow: 'amber' },
  ], []);

  const [heroBannersList, setHeroBannersList] = useState<HeroBanner[]>([]);
  const [bannerModalOpen, setBannerModalOpen] = useState(false);
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);
  const [bannerTitle, setBannerTitle] = useState('');
  const [bannerSubtitle, setBannerSubtitle] = useState('');
  const [bannerBadge, setBannerBadge] = useState('3D SCIENCE LAB');
  const [bannerTag, setBannerTag] = useState('');
  const [bannerImage, setBannerImage] = useState('');
  const [bannerImageMode, setBannerImageMode] = useState<'preset' | 'file' | 'link'>('preset');
  const [bannerSubject, setBannerSubject] = useState('Physics');
  const [bannerAccentGradient, setBannerAccentGradient] = useState('from-cyan-400 via-teal-300 to-blue-400');
  const [bannerBorderGlow, setBannerBorderGlow] = useState('rgba(34,211,238,0.5)');
  const [bannerGlowColor, setBannerGlowColor] = useState('cyan');
  const [bannerActionButtonText, setBannerActionButtonText] = useState('ভর্তি হতে ক্লিক করুন');
  const [bannerIsActive, setBannerIsActive] = useState(true);
  const [bannerOrder, setBannerOrder] = useState(1);
  const [bannerLoading, setBannerLoading] = useState(false);
  const [bannerSuccess, setBannerSuccess] = useState('');
  const [bannerError, setBannerError] = useState('');
  const [bannerToDelete, setBannerToDelete] = useState<HeroBanner | null>(null);
  const [isDeletingBanner, setIsDeletingBanner] = useState(false);
  const [isDragOverBannerImg, setIsDragOverBannerImg] = useState(false);

  // Dynamic Contextual Background Meta for Admin Dashboard Sections
  const sectionBgMeta = useMemo(() => {
    if (activeTab === 'upload') {
      return {
        image: bannerChemistryHub || bannerElectromagnetismFlux,
        label: 'কেমিস্ট্রি ল্যাব ও ইলেক্ট্রন ফ্লাক্স ব্যাকগ্রাউন্ড',
        badge: 'UPLOAD SECTION • CHEMISTRY HUB'
      };
    }
    if (activeTab === 'course-overview') {
      return {
        image: bannerMolecularDNA || bannerBiologyGenetics,
        label: 'মলিকিউলার ডিএনএ ও জেনেটিক্স ৩ডি ব্যাকগ্রাউন্ড',
        badge: 'COURSES OVERVIEW • GENETICS 3D'
      };
    }
    // activeTab === 'dashboard'
    switch (dashSubTab) {
      case 'overview':
        return {
          image: bannerCosmicNebula || bannerBlackHoleSpacetime,
          label: 'কসমিক অ্যাস্ট্রোফিজিক্স ও নেবুলা ব্যাকগ্রাউন্ড',
          badge: 'ADMIN OVERVIEW • COSMIC SPACE'
        };
      case 'users':
        return {
          image: bannerNeuroSynapse || bannerBioCellOrganelle,
          label: 'নিউরন সাইন্যাপ্স ও ব্রেন বায়োলজি ব্যাকগ্রাউন্ড',
          badge: 'STUDENT DIRECTORY • NEUROBIOLOGY'
        };
      case 'settings':
        return {
          image: bannerPhysicsLab || bannerLaserOptics,
          label: 'কোয়ান্টাম ফিজিক্স ল্যাব ব্যাকগ্রাউন্ড',
          badge: 'ACADEMY SETTINGS • QUANTUM LAB'
        };
      case 'routine':
        return {
          image: bannerMathStudio || bannerThermodynamicsEntropy,
          label: 'ক্যালকুলাস ও থার্মোডাইনামিক্স ব্যাকগ্রাউন্ড',
          badge: 'CLASS ROUTINE • CALCULUS STUDIO'
        };
      case 'courses':
        return {
          image: bannerParticleAccelerator || bannerSolarFusion,
          label: 'পার্টিকেল অ্যাক্সিলারেটর ও ফিউশন ব্যাকগ্রাউন্ড',
          badge: 'COURSE PUBLISHER • PARTICLE PHYSICS'
        };
      case 'hero-banners':
        return {
          image: banner3DScienceStudio || bannerScienceHeroFull,
          label: 'সায়েন্স স্টুডিও ৩ডি মাস্টার ব্যাকগ্রাউন্ড',
          badge: 'HERO BANNERS • 3D STUDIO'
        };
      default:
        return {
          image: bannerScienceHeroFull,
          label: 'সায়েন্স স্টুডিও ব্যাকগ্রাউন্ড',
          badge: 'ADMIN PORTAL'
        };
    }
  }, [activeTab, dashSubTab]);

  // Course Overview filter state
  const [overviewCourseId, setOverviewCourseId] = useState<string>('all');
  const [overviewSubject, setOverviewSubject] = useState<string>('all');
  const [overviewContentType, setOverviewContentType] = useState<'all' | 'video' | 'pdf'>('all');
  const [overviewSearchQuery, setOverviewSearchQuery] = useState<string>('');

  // Course Overview preview modals state
  const [previewVideo, setPreviewVideo] = useState<Class | null>(null);
  const [previewPdf, setPreviewPdf] = useState<Note | null>(null);

  // Courses state
  const [coursesList, setCoursesList] = useState<Course[]>([]);
  const [courseTitle, setCourseTitle] = useState('');
  const [courseSubject, setCourseSubject] = useState('Physics');
  const [courseClassLevel, setCourseClassLevel] = useState('HSC');
  const [customClassLevel, setCustomClassLevel] = useState('');
  const [courseImageUrl, setCourseImageUrl] = useState('');
  const [courseImageMode, setCourseImageMode] = useState<'file' | 'link'>('file');
  const [isDragOverCourseImg, setIsDragOverCourseImg] = useState(false);
  const [coursePrice, setCoursePrice] = useState('');
  const [courseOriginalPrice, setCourseOriginalPrice] = useState('');
  const [courseDuration, setCourseDuration] = useState('');
  const [courseDescription, setCourseDescription] = useState('');
  const [courseFeatures, setCourseFeatures] = useState('');
  const [courseLoading, setCourseLoading] = useState(false);
  const [courseSuccess, setCourseSuccess] = useState('');
  const [courseError, setCourseError] = useState('');

  const handleCourseImageFileChange = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setCourseError('অনুগ্রহ করে একটি সঠিক ইমেজ (JPG, PNG, WEBP, GIF) ফাইল নির্বাচন করুন।');
      return;
    }
    try {
      const compressedDataUrl = await compressImageFile(file, 1000, 1000, 0.75);
      setCourseImageUrl(compressedDataUrl);
      setCourseError('');
    } catch (err: any) {
      setCourseError('ইমেজ প্রসেস করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    }
  };

  // Settings Form State
  const [academyName, setAcademyName] = useState('');
  const [academyLogoUrl, setAcademyLogoUrl] = useState('');
  const [announcement, setAnnouncement] = useState('');
  const [heroTitle, setHeroTitle] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const [heroSubEnglish, setHeroSubEnglish] = useState('');
  const [subjects, setSubjects] = useState<string[]>([]);
  const [newSubject, setNewSubject] = useState('');

  // Course Publishing Static Options
  const [classLevels, setClassLevels] = useState<string[]>([]);
  const [newClassLevelSetting, setNewClassLevelSetting] = useState('');
  const [courseDurations, setCourseDurations] = useState<string[]>([]);
  const [newCourseDurationSetting, setNewCourseDurationSetting] = useState('');
  const [defaultCourseFeatures, setDefaultCourseFeatures] = useState<string[]>([]);
  const [newDefaultFeatureSetting, setNewDefaultFeatureSetting] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactAddress, setContactAddress] = useState('');
  const [footerDescription, setFooterDescription] = useState('');
  const [bkashNumber, setBkashNumber] = useState('');
  const [nagadNumber, setNagadNumber] = useState('');
  const [rocketNumber, setRocketNumber] = useState('');
  const [paymentInstructions, setPaymentInstructions] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminBio, setAdminBio] = useState('');
  const [adminPhotoUrl, setAdminPhotoUrl] = useState('');
  const [adminDesignation, setAdminDesignation] = useState('');
  const [adminEducation, setAdminEducation] = useState('');

  // Hero Section Buttons
  const [heroJoinButtonText, setHeroJoinButtonText] = useState('');
  const [heroExploreButtonText, setHeroExploreButtonText] = useState('');

  // Orbit & Ecosystem Section Settings
  const [orbitSectionBadge, setOrbitSectionBadge] = useState('');
  const [orbitSectionTitle, setOrbitSectionTitle] = useState('');
  const [orbitSectionSubtitle, setOrbitSectionSubtitle] = useState('');

  // Academic Insights Settings
  const [insightsTotalStudents, setInsightsTotalStudents] = useState('');
  const [insightsActivePercent, setInsightsActivePercent] = useState('');
  const [insightsSuccessRate, setInsightsSuccessRate] = useState('');
  const [insightsSuccessRateLabel, setInsightsSuccessRateLabel] = useState('');
  const [insightsTotalCourses, setInsightsTotalCourses] = useState('');
  const [insightsTotalNotes, setInsightsTotalNotes] = useState('');
  const [insightsBullet1, setInsightsBullet1] = useState('');
  const [insightsBullet2, setInsightsBullet2] = useState('');
  const [insightsBullet3, setInsightsBullet3] = useState('');

  // Leadership & Pedagogy Pillars Settings
  const [pillarsSectionBadge, setPillarsSectionBadge] = useState('');
  const [pillarsSectionTitle, setPillarsSectionTitle] = useState('');
  const [pillarsSectionSubtitle, setPillarsSectionSubtitle] = useState('');
  const [pillar1Title, setPillar1Title] = useState('');
  const [pillar1Badge, setPillar1Badge] = useState('');
  const [pillar1Description, setPillar1Description] = useState('');
  const [pillar2Title, setPillar2Title] = useState('');
  const [pillar2Badge, setPillar2Badge] = useState('');
  const [pillar2Description, setPillar2Description] = useState('');
  const [pillar3Title, setPillar3Title] = useState('');
  const [pillar3Badge, setPillar3Badge] = useState('');
  const [pillar3Description, setPillar3Description] = useState('');
  const [mentorExperience, setMentorExperience] = useState('');
  const [mentorGuidance, setMentorGuidance] = useState('');

  // Hero & Header Extra Customization
  const [heroBadgeText, setHeroBadgeText] = useState('');
  const [announcementBadge, setAnnouncementBadge] = useState('');
  const [marqueeNotice2, setMarqueeNotice2] = useState('');
  const [marqueeNotice3, setMarqueeNotice3] = useState('');
  const [marqueeNotice4, setMarqueeNotice4] = useState('');
  const [marqueeNotice5, setMarqueeNotice5] = useState('');

  // Social & Helpline Settings
  const [facebookUrl, setFacebookUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [telegramUrl, setTelegramUrl] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [helplineTime, setHelplineTime] = useState('');

  // Virtual Lab Section Customization
  const [labSectionBadge, setLabSectionBadge] = useState('');
  const [labSectionTitle, setLabSectionTitle] = useState('');
  const [labSectionSubtitle, setLabSectionSubtitle] = useState('');
  
  const [routine, setRoutine] = useState<RoutineItem[]>([]);
  const [newRoutineDay, setNewRoutineDay] = useState('');
  const [newRoutineSubject, setNewRoutineSubject] = useState('');
  const [newRoutineTime, setNewRoutineTime] = useState('');
  
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState('');
  const [hasInitializedSettings, setHasInitializedSettings] = useState(false);

  // Credentials Update State
  const [adminNewEmail, setAdminNewEmail] = useState('');
  const [adminNewPassword, setAdminNewPassword] = useState('');
  const [adminConfirmPassword, setAdminConfirmPassword] = useState('');
  const [credentialsLoading, setCredentialsLoading] = useState(false);
  const [credentialsSuccess, setCredentialsSuccess] = useState('');
  const [credentialsError, setCredentialsError] = useState('');

  const handleUpdateCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setCredentialsLoading(true);
    setCredentialsSuccess('');
    setCredentialsError('');

    if (!adminNewEmail && !adminNewPassword) {
      setCredentialsError('অনুগ্রহ করে ইমেইল অথবা পাসওয়ার্ড প্রদান করুন।');
      setCredentialsLoading(false);
      return;
    }

    if (adminNewPassword && adminNewPassword !== adminConfirmPassword) {
      setCredentialsError('পাসওয়ার্ড দুটি মেলেনি। অনুগ্রহ করে আবার যাচাই করুন।');
      setCredentialsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/admin/credentials', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({
          email: adminNewEmail || undefined,
          password: adminNewPassword || undefined
        })
      });

      if (response.ok) {
        setCredentialsSuccess('অ্যাডমিন লগইন তথ্য সফলভাবে পরিবর্তন করা হয়েছে!');
        setAdminNewEmail('');
        setAdminNewPassword('');
        setAdminConfirmPassword('');
      } else {
        const errData = await response.json();
        setCredentialsError(errData.error || 'তথ্য আপডেট করতে কোনো সমস্যা হয়েছে।');
      }
    } catch (err) {
      console.error(err);
      setCredentialsError('সার্ভার কানেকশন এরর। আবার চেষ্টা করুন।');
    } finally {
      setCredentialsLoading(false);
    }
  };

  // Synchronize initial section prop changes
  useEffect(() => {
    if (initialSection === 'settings') {
      setActiveTab('dashboard');
      setDashSubTab('settings');
    } else {
      setActiveTab('dashboard');
      setDashSubTab('overview');
    }
  }, [initialSection]);

  // Synchronize dynamic settings prop
  useEffect(() => {
    if (settings && !hasInitializedSettings) {
      setAcademyName(settings.academyName || '');
      setAcademyLogoUrl(settings.academyLogoUrl || '');
      setAnnouncement(settings.announcement || '');
      setHeroTitle(settings.heroTitle || '');
      setHeroSubtitle(settings.heroSubtitle || '');
      setHeroSubEnglish(settings.heroSubEnglish || '');
      setSubjects(settings.subjects || ["Physics", "Chemistry", "Biology", "Mathematics", "General Science"]);
      setClassLevels(settings.classLevels || ["HSC", "HSC 1st Year", "HSC 2nd Year", "Class 9-10 (SSC)", "Class 10", "Class 9", "Class 8", "Admission Test"]);
      setCourseDurations(settings.courseDurations || ["০৬ মাস (২৪টি লাইভ ক্লাস)", "১২ মাস (ফুল একাডেমিক কোর্স)", "০৩ মাস (ক্র্যাশ কোর্স)", "১৫ দিন (স্পেশাল রিভিশন)"]);
      setDefaultCourseFeatures(settings.defaultCourseFeatures || [
        "রেকর্ডেড ও লাইভ ভিডিও ক্লাস",
        "অধ্যায়ভিত্তিক এইচডি পিডিএফ লেকচার শিট",
        "সাপ্তাহিক অনলাইন প্র্যাকটিস কুইজ ও এক্সাম",
        "২৪/৭ ডাউট সলভিং ও মেন্টর সাপোর্ট"
      ]);
      setContactPhone(settings.contactPhone || '');
      setContactEmail(settings.contactEmail || '');
      setContactAddress(settings.contactAddress || '');
      setFooterDescription(settings.footerDescription || '');
      setBkashNumber(settings.bkashNumber !== undefined && settings.bkashNumber !== '' ? settings.bkashNumber : '+৮৮০ ১৭০০-০০০০০০');
      setNagadNumber(settings.nagadNumber !== undefined && settings.nagadNumber !== '' ? settings.nagadNumber : '+৮৮০ ১৭০০-০০০০০০');
      setRocketNumber(settings.rocketNumber !== undefined && settings.rocketNumber !== '' ? settings.rocketNumber : '+৮৮০ ১৭০০-০০০০০০');
      setPaymentInstructions(settings.paymentInstructions || '');
      setRoutine(settings.routine || []);
      setAdminName(settings.adminName || '');
      setAdminBio(settings.adminBio || '');
      setAdminPhotoUrl(settings.adminPhotoUrl || '');
      setAdminDesignation(settings.adminDesignation || '');
      setAdminEducation(settings.adminEducation || '');

      // Dynamic Section Settings Sync
      setHeroJoinButtonText(settings.heroJoinButtonText || 'ভর্তি হন / রেজিস্ট্রেশন করুন');
      setHeroExploreButtonText(settings.heroExploreButtonText || 'মাই ক্লাসরুম পোর্টালে যান');
      setOrbitSectionBadge(settings.orbitSectionBadge || 'ACADEMY SHOWCASE & INTERACTIVE ORBIT');
      setOrbitSectionTitle(settings.orbitSectionTitle || 'সাকিব স্যারের পাবলিশড কোর্সসমূহ ও একাডেমি ইকোসিস্টেম');
      setOrbitSectionSubtitle(settings.orbitSectionSubtitle || 'বিজ্ঞানকে ভিজ্যুয়াল ল্যাব ও আধুনিক প্রযুক্তির মাধ্যমে অনুধাবন করো। নিচে ইনসাইটস, ইন্টারেক্টিভ কোর্স অরবিট ও লাইভ কোর্স বিবরণী উপভোগ করো।');
      setInsightsTotalStudents(settings.insightsTotalStudents || '১,৪৫০+');
      setInsightsActivePercent(settings.insightsActivePercent || '↑ ৯৮% সক্রিয়');
      setInsightsSuccessRate(settings.insightsSuccessRate || '৯৯.২%');
      setInsightsSuccessRateLabel(settings.insightsSuccessRateLabel || 'প্লাস পাওয়ার হার');
      setInsightsTotalCourses(settings.insightsTotalCourses || '১৪+');
      setInsightsTotalNotes(settings.insightsTotalNotes || '৩৫০+');
      setInsightsBullet1(settings.insightsBullet1 || 'সাকিব স্যারের নিজস্ব থ্রিডি ভিজ্যুয়াল ল্যাব সেশন');
      setInsightsBullet2(settings.insightsBullet2 || '২৪/৭ অনলাইন ও অফলাইন স্পেশাল ডাউট সলভ');
      setInsightsBullet3(settings.insightsBullet3 || 'এইচএসসি ও অ্যাডমিশন ফোকাসড মডেল টেস্ট');
      setPillarsSectionBadge(settings.pillarsSectionBadge || 'LEADERSHIP & PEDAGOGY PILLARS');
      setPillarsSectionTitle(settings.pillarsSectionTitle || 'সাকিব স্যারের একাডেমি ও মেন্টরশিপের মূল স্তম্ভসমূহ');
      setPillarsSectionSubtitle(settings.pillarsSectionSubtitle || 'ব্যক্তিগত যত্ন, আধুনিক প্রযুক্তি এবং নিরবচ্ছিন্ন নির্দেশনার মাধ্যমে প্রতিটি শিক্ষার্থীকে পৌঁছে দেওয়া হয় তাদের কাঙ্ক্ষিত সফলতায়।');
      setPillar1Title(settings.pillar1Title || 'ইন্টারেক্টিভ ভিডিও ও সিমুলেশন ক্লাস');
      setPillar1Badge(settings.pillar1Badge || '3D LAB RECORDED');
      setPillar1Description(settings.pillar1Description || 'যেকোনো জটিল বৈজ্ঞানিক টপিক সহজে ভিজ্যুয়ালাইজ করার জন্য রয়েছে প্রিমিয়াম এইচডি ভিডিও ক্লাস, থ্রিডি অ্যানিমেশন ও লাইভ ল্যাব সেশনের আর্কাইভ।');
      setPillar2Title(settings.pillar2Title || 'অধ্যায়ভিত্তিক PDF নোট ও ফর্মুলা বুক');
      setPillar2Badge(settings.pillar2Badge || '৩৫+ শিট');
      setPillar2Description(settings.pillar2Description || 'পরীক্ষার দ্রুত ও নির্ভুল রিভিশনের জন্য প্রতিটি অধ্যায়ের শেষে ডাউনলোডযোগ্য রঙিন হ্যান্ডরাইটিং শিট, শর্টকাট ট্রিকস ও প্র্যাকটিস বুকলেট।');
      setPillar3Title(settings.pillar3Title || '২৪/৭ মেন্টর সাপোর্ট ও ডাউট সলভ ডেস্ক');
      setPillar3Badge(settings.pillar3Badge || 'LIVE ASSISTANCE');
      setPillar3Description(settings.pillar3Description || 'পড়ালেখার যেকোনো অস্পষ্টতায় সরাসরি প্রশ্ন করার সুযোগ, স্পেশাল প্রবলেম সলভিং সেশন এবং শিক্ষার্থীর পারফরম্যান্স ও অগ্রগতি ট্র্যাকিং।');
      setMentorExperience(settings.mentorExperience || '১০+ বছরের অভিজ্ঞতা');
      setMentorGuidance(settings.mentorGuidance || '১০০% পার্সোনাল গাইডেন্স');
      
      // Hero & Header Extra Sync
      setHeroBadgeText(settings.heroBadgeText || 'প্রযুক্তিনির্ভর আধুনিক বিজ্ঞান একাডেমি • SCIENCE STUDIO');
      setAnnouncementBadge(settings.announcementBadge || 'নির্দেশনা ও নোটিশ');
      setMarqueeNotice2(settings.marqueeNotice2 || '🔬 ভার্চুয়াল ল্যাবে পদার্থ, রসায়ন, জীব ও গণিতের ৩ডি ইন্টার-অ্যাক্টিভ সিমুলেশন ক্লাস উপলব্ধ।');
      setMarqueeNotice3(settings.marqueeNotice3 || '📅 প্রতি সপ্তাহের রুটিন অনুযায়ী অফলাইন ক্লাসরুম ও অনলাইন লাইভ সেশন অনুষ্ঠিত হয়।');
      setMarqueeNotice4(settings.marqueeNotice4 || '📚 প্রতিটি অধ্যায়ের প্র্যাকটিক্যাল হ্যান্ডনোট ও ফর্মুলা শিট ক্লাসরুম পোর্টাল থেকে ডাউনলোড করা যাবে।');
      setMarqueeNotice5(settings.marqueeNotice5 || '⚡ সার্বক্ষণিক ডাউট ক্লিয়ারিং ডেস্ক ও মেন্টরশিপের সুবিধা পেতে আপনার প্রোফাইল অ্যাক্টিভ রাখুন।');

      // Hero Banners Sync
      if (settings.heroBanners && Array.isArray(settings.heroBanners) && settings.heroBanners.length > 0) {
        setHeroBannersList(settings.heroBanners);
      } else {
        setHeroBannersList(defaultAdminHeroBanners);
      }

      // Social & Helpline Sync
      setFacebookUrl(settings.facebookUrl || 'https://facebook.com');
      setYoutubeUrl(settings.youtubeUrl || 'https://youtube.com');
      setTelegramUrl(settings.telegramUrl || 'https://t.me');
      setWhatsappNumber(settings.whatsappNumber || '+8801700000000');
      setHelplineTime(settings.helplineTime || 'সকাল ৯:০০ - রাত ১০:০০ (প্রতিদিন)');

      // Lab Customization Sync
      setLabSectionBadge(settings.labSectionBadge || 'INTERACTIVE VIRTUAL LAB & PLAYGROUND');
      setLabSectionTitle(settings.labSectionTitle || '');
      setLabSectionSubtitle(settings.labSectionSubtitle || 'পড়াশোনা হোক আনন্দের ও গবেষণাধর্মী! পদার্থ, রসায়ন, জীববিজ্ঞান ও গণিতের গুরুত্বপূর্ণ টপিকগুলো নিজে পরিবর্তন করে প্র্যাকটিক্যাল জ্ঞান অর্জন করুন।');

      setHasInitializedSettings(true);
    }
  }, [settings, hasInitializedSettings]);

  const handleAddSubject = () => {
    if (newSubject.trim() && !subjects.includes(newSubject.trim())) {
      setSubjects([...subjects, newSubject.trim()]);
      setNewSubject('');
    }
  };

  const handleRemoveSubject = (sub: string) => {
    setSubjects(subjects.filter(s => s !== sub));
  };

  const handleAddClassLevel = () => {
    if (newClassLevelSetting.trim() && !classLevels.includes(newClassLevelSetting.trim())) {
      setClassLevels([...classLevels, newClassLevelSetting.trim()]);
      setNewClassLevelSetting('');
    }
  };

  const handleRemoveClassLevel = (lvl: string) => {
    setClassLevels(classLevels.filter(l => l !== lvl));
  };

  const handleAddDurationSetting = () => {
    if (newCourseDurationSetting.trim() && !courseDurations.includes(newCourseDurationSetting.trim())) {
      setCourseDurations([...courseDurations, newCourseDurationSetting.trim()]);
      setNewCourseDurationSetting('');
    }
  };

  const handleRemoveDurationSetting = (dur: string) => {
    setCourseDurations(courseDurations.filter(d => d !== dur));
  };

  const handleAddDefaultFeature = () => {
    if (newDefaultFeatureSetting.trim() && !defaultCourseFeatures.includes(newDefaultFeatureSetting.trim())) {
      setDefaultCourseFeatures([...defaultCourseFeatures, newDefaultFeatureSetting.trim()]);
      setNewDefaultFeatureSetting('');
    }
  };

  const handleRemoveDefaultFeature = (feat: string) => {
    setDefaultCourseFeatures(defaultCourseFeatures.filter(f => f !== feat));
  };

  const handleAddRoutineItem = () => {
    if (!newRoutineDay.trim() || !newRoutineSubject.trim() || !newRoutineTime.trim()) return;
    const newItem: RoutineItem = {
      id: 'rtn_' + Math.random().toString(36).substring(2, 9),
      day: newRoutineDay.trim(),
      subject: newRoutineSubject.trim(),
      time: newRoutineTime.trim()
    };
    setRoutine([...routine, newItem]);
    setNewRoutineDay('');
    setNewRoutineSubject('');
    setNewRoutineTime('');
  };

  const handleRemoveRoutineItem = (id: string) => {
    setRoutine(routine.filter(item => item.id !== id));
  };

  // Hero Banners Management Handlers
  const handleOpenAddBannerModal = () => {
    const firstPreset = heroPresetImages[0];
    setEditingBannerId(null);
    setBannerTitle('');
    setBannerSubtitle('');
    setBannerBadge('3D SCIENCE LAB');
    setBannerTag('');
    setBannerImage(firstPreset ? firstPreset.image : '');
    setBannerImageMode('preset');
    setBannerSubject('Physics');
    setBannerAccentGradient('from-cyan-400 via-teal-300 to-blue-400');
    setBannerBorderGlow('rgba(34,211,238,0.5)');
    setBannerGlowColor('cyan');
    setBannerActionButtonText('ভর্তি হতে ক্লিক করুন');
    setBannerIsActive(true);
    setBannerOrder(heroBannersList.length + 1);
    setBannerError('');
    setBannerSuccess('');
    setBannerModalOpen(true);
  };

  const handleOpenEditBannerModal = (banner: HeroBanner) => {
    setEditingBannerId(banner.id);
    setBannerTitle(banner.title);
    setBannerSubtitle(banner.subtitle || '');
    setBannerBadge(banner.badge || '3D SCIENCE LAB');
    setBannerTag(banner.tag || '');
    setBannerImage(banner.image);
    setBannerImageMode('preset');
    setBannerSubject(banner.subject || 'Physics');
    setBannerAccentGradient(banner.accentGradient || 'from-cyan-400 via-teal-300 to-blue-400');
    setBannerBorderGlow(banner.borderGlow || 'rgba(34,211,238,0.5)');
    setBannerGlowColor(banner.glowColor || 'cyan');
    setBannerActionButtonText(banner.actionButtonText || 'ভর্তি হতে ক্লিক করুন');
    setBannerIsActive(banner.isActive !== false);
    setBannerOrder(banner.order || 1);
    setBannerError('');
    setBannerSuccess('');
    setBannerModalOpen(true);
  };

  const handleSelectPreset = (preset: typeof heroPresetImages[0]) => {
    setBannerImage(preset.image);
    if (!bannerBadge || bannerBadge === '3D SCIENCE LAB') setBannerBadge(preset.badge);
    if (!bannerSubject) setBannerSubject(preset.subject);
    setBannerAccentGradient(preset.gradient);
    setBannerGlowColor(preset.glow);
    if (preset.glow === 'cyan') setBannerBorderGlow('rgba(34,211,238,0.5)');
    else if (preset.glow === 'emerald') setBannerBorderGlow('rgba(16,185,129,0.5)');
    else if (preset.glow === 'blue') setBannerBorderGlow('rgba(59,130,246,0.5)');
    else if (preset.glow === 'amber') setBannerBorderGlow('rgba(245,158,11,0.5)');
    else if (preset.glow === 'rose') setBannerBorderGlow('rgba(244,63,94,0.5)');
    else if (preset.glow === 'teal') setBannerBorderGlow('rgba(20,184,166,0.5)');
    else if (preset.glow === 'purple' || preset.glow === 'indigo') setBannerBorderGlow('rgba(168,85,247,0.5)');
  };

  const handleBannerImageFileChange = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setBannerError('অনুগ্রহ করে একটি সঠিক ইমেজ ফাইল (JPG, PNG, WEBP) নির্বাচন করুন।');
      return;
    }
    try {
      const compressedDataUrl = await compressImageFile(file, 1600, 1000, 0.85);
      setBannerImage(compressedDataUrl);
      setBannerError('');
    } catch (err: any) {
      setBannerError('ইমেজ ফাইল প্রসেস করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    }
  };

  const persistHeroBanners = async (updatedList: HeroBanner[]) => {
    setHeroBannersList(updatedList);
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({
          heroBanners: updatedList
        })
      });
      if (!response.ok) {
        throw new Error('Failed to update hero banners');
      }
      onRefreshSettings?.();
      return true;
    } catch (err: any) {
      console.error('Error persisting hero banners:', err);
      setActionError('হিরো ব্যানার সেভ করতে সমস্যা হয়েছে: ' + err.message);
      return false;
    }
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerTitle.trim()) {
      setBannerError('অনুগ্রহ করে ব্যানারের মূল শিরোনাম (Title) প্রদান করুন।');
      return;
    }
    if (!bannerImage) {
      setBannerError('অনুগ্রহ করে ব্যানারের ব্যাকগ্রাউন্ড ইমেজ নির্বাচন বা আপলোড করুন।');
      return;
    }

    setBannerLoading(true);
    setBannerError('');
    setBannerSuccess('');

    const newBannerData: HeroBanner = {
      id: editingBannerId || ('banner_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6)),
      title: bannerTitle.trim(),
      subtitle: bannerSubtitle.trim() || undefined,
      badge: bannerBadge.trim() || undefined,
      tag: bannerTag.trim() || undefined,
      image: bannerImage,
      subject: bannerSubject,
      accentGradient: bannerAccentGradient,
      borderGlow: bannerBorderGlow,
      glowColor: bannerGlowColor,
      actionButtonText: bannerActionButtonText.trim() || 'ভর্তি হতে ক্লিক করুন',
      isActive: bannerIsActive,
      order: bannerOrder || (heroBannersList.length + 1)
    };

    let updatedList: HeroBanner[];
    if (editingBannerId) {
      updatedList = heroBannersList.map(b => b.id === editingBannerId ? newBannerData : b);
    } else {
      updatedList = [...heroBannersList, newBannerData];
    }

    const success = await persistHeroBanners(updatedList);
    setBannerLoading(false);
    if (success) {
      setBannerSuccess(editingBannerId ? 'ব্যানার সফলভাবে আপডেট হয়েছে!' : 'নতুন ব্যানার সফলভাবে তৈরি হয়েছে!');
      setTimeout(() => {
        setBannerModalOpen(false);
        setBannerSuccess('');
      }, 1000);
    } else {
      setBannerError('সার্ভারে সেভ করতে সমস্যা হয়েছে।');
    }
  };

  const handleToggleBannerActive = async (bannerId: string) => {
    const updatedList = heroBannersList.map(b => {
      if (b.id === bannerId) {
        return { ...b, isActive: b.isActive === false ? true : false };
      }
      return b;
    });
    await persistHeroBanners(updatedList);
  };

  const handleMoveBannerOrder = async (bannerId: string, direction: 'up' | 'down') => {
    const index = heroBannersList.findIndex(b => b.id === bannerId);
    if (index === -1) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === heroBannersList.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...heroBannersList];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    // re-assign order property
    const finalUpdated = updated.map((b, i) => ({ ...b, order: i + 1 }));
    await persistHeroBanners(finalUpdated);
  };

  const handleConfirmDeleteBanner = async () => {
    if (!bannerToDelete) return;
    setIsDeletingBanner(true);
    const updated = heroBannersList.filter(b => b.id !== bannerToDelete.id);
    await persistHeroBanners(updated);
    setIsDeletingBanner(false);
    setBannerToDelete(null);
  };

  const handleRestoreDefaultBanners = async () => {
    if (window.confirm('আপনি কি ডিফল্ট হিরো সায়েন্স ব্যানারগুলো ফিরিয়ে আনতে চান?')) {
      await persistHeroBanners(defaultAdminHeroBanners);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsLoading(true);
    setSettingsSuccess('');
    setActionError('');

    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({
          academyName,
          academyLogoUrl,
          announcement,
          heroTitle,
          heroSubtitle,
          heroSubEnglish,
          subjects,
          classLevels,
          courseDurations,
          defaultCourseFeatures,
          contactPhone,
          contactEmail,
          contactAddress,
          footerDescription,
          routine,
          adminName,
          adminBio,
          adminPhotoUrl,
          adminDesignation,
          adminEducation,
          bkashNumber,
          nagadNumber,
          rocketNumber,
          paymentInstructions,
          heroJoinButtonText,
          heroExploreButtonText,
          orbitSectionBadge,
          orbitSectionTitle,
          orbitSectionSubtitle,
          insightsTotalStudents,
          insightsActivePercent,
          insightsSuccessRate,
          insightsSuccessRateLabel,
          insightsTotalCourses,
          insightsTotalNotes,
          insightsBullet1,
          insightsBullet2,
          insightsBullet3,
          pillarsSectionBadge,
          pillarsSectionTitle,
          pillarsSectionSubtitle,
          pillar1Title,
          pillar1Badge,
          pillar1Description,
          pillar2Title,
          pillar2Badge,
          pillar2Description,
          pillar3Title,
          pillar3Badge,
          pillar3Description,
          mentorExperience,
          mentorGuidance,
          heroBadgeText,
          announcementBadge,
          marqueeNotice2,
          marqueeNotice3,
          marqueeNotice4,
          marqueeNotice5,
          facebookUrl,
          youtubeUrl,
          telegramUrl,
          whatsappNumber,
          helplineTime,
          labSectionBadge,
          labSectionTitle,
          labSectionSubtitle
        })
      });

      if (response.ok) {
        setSettingsSuccess('সবগুলো স্ট্যাটিক সেটিংস সফলভাবে সেভ করা হয়েছে!');
        if (onRefreshSettings) {
          onRefreshSettings();
        }
      } else {
        const errData = await response.json();
        setActionError(errData.error || 'সেটিংস সেভ করতে কোনো সমস্যা হয়েছে।');
      }
    } catch (err) {
      console.error(err);
      setActionError('সার্ভার কানেকশন এরর। আবার চেষ্টা করুন।');
    } finally {
      setSettingsLoading(false);
    }
  };

  // Course upload selection state
  const [selectedUploadCourseId, setSelectedUploadCourseId] = useState<string>('');
  const selectedUploadCourse = coursesList.find(c => c.id === selectedUploadCourseId);

  // Forms state: Add Class
  const [classTitle, setClassTitle] = useState('');
  const [classSubject, setClassSubject] = useState('Physics');
  const [classVideoUrl, setClassVideoUrl] = useState('');
  const [classThumbnailUrl, setClassThumbnailUrl] = useState('');
  const [thumbnailUploadMode, setThumbnailUploadMode] = useState<'file' | 'url' | 'link'>('file');
  const [classDescription, setClassDescription] = useState('');
  const [classLoading, setClassLoading] = useState(false);
  const [classSuccess, setClassSuccess] = useState('');
  
  // File upload state for Class Video
  const [classUploadMode, setClassUploadMode] = useState<'file' | 'link'>('file');
  const [classFile, setClassFile] = useState<File | null>(null);
  const [classIsUploading, setClassIsUploading] = useState(false);
  const [classUploadProgress, setClassUploadProgress] = useState(0);
  const [isDragOverClass, setIsDragOverClass] = useState(false);

  const handleClassThumbnailFileChange = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setActionError('অনুগ্রহ করে একটি সঠিক ইমেজ (JPG, PNG, WEBP) ফাইল নির্বাচন করুন।');
      return;
    }
    try {
      const compressedDataUrl = await compressImageFile(file, 1000, 1000, 0.75);
      setClassThumbnailUrl(compressedDataUrl);
      setActionError('');
    } catch (err: any) {
      setActionError('থাম্বনেইল প্রসেস করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    }
  };

  // Forms state: Add Note
  const [noteTitle, setNoteTitle] = useState('');
  const [noteSubject, setNoteSubject] = useState('Physics');
  const [notePdfUrl, setNotePdfUrl] = useState('');
  const [noteDescription, setNoteDescription] = useState('');
  const [noteLoading, setNoteLoading] = useState(false);
  const [noteSuccess, setNoteSuccess] = useState('');

  // File upload state for Note PDF
  const [noteUploadMode, setNoteUploadMode] = useState<'file' | 'link'>('file');
  const [noteFile, setNoteFile] = useState<File | null>(null);
  const [noteIsUploading, setNoteIsUploading] = useState(false);
  const [noteUploadProgress, setNoteUploadProgress] = useState(0);
  const [isDragOverNote, setIsDragOverNote] = useState(false);

  // General action message
  const [actionError, setActionError] = useState('');

  // Fetch admin dashboard data
  const fetchCourses = async () => {
    try {
      const res = await fetch('/api/courses');
      if (res.ok) {
        const data = await res.json();
        setCoursesList(data);
      }
    } catch (err) {
      console.warn("Notice: loading courses retry pending", err);
    }
  };

  const fetchStatsAndUsers = async (showLoader = false) => {
    if (showLoader) {
      setLoadingUsers(true);
    }
    const authToken = getAuthToken();
    try {
      // 1. Fetch Stats
      const statsRes = await fetch('/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      // 2. Fetch Users
      const usersRes = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUserList(usersData);
      }
    } catch (err) {
      console.warn("Notice: loading admin info retry pending", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchStatsAndUsers(true);
    fetchCourses();
  }, []);

  // Create/Publish course
  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setCourseLoading(true);
    setCourseSuccess('');
    setCourseError('');

    if (!courseTitle || !courseSubject || !coursePrice) {
      setCourseError('কোর্সের নাম, বিষয় এবং ফি (Price) প্রদান করা বাধ্যতামূলক।');
      setCourseLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({
          title: courseTitle,
          subject: courseSubject,
          classLevel: courseClassLevel === 'Custom' ? customClassLevel : courseClassLevel,
          imageUrl: courseImageUrl,
          price: Number(coursePrice),
          originalPrice: courseOriginalPrice ? Number(courseOriginalPrice) : undefined,
          duration: courseDuration,
          description: courseDescription,
          features: courseFeatures.split('\n').filter(Boolean)
        })
      });

      const responseText = await response.text();
      let data: any = {};
      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch {
        // Response was not valid JSON
      }

      if (!response.ok) {
        throw new Error(data.error || `কোর্স পাবলিশ করতে ব্যর্থ হয়েছে (স্ট্যাটাস: ${response.status})`);
      }

      setCourseSuccess('কোর্সটি সফলভাবে পাবলিশ করা হয়েছে!');
      setCourseTitle('');
      setCourseClassLevel('HSC');
      setCustomClassLevel('');
      setCourseImageUrl('');
      setCoursePrice('');
      setCourseOriginalPrice('');
      setCourseDuration('');
      setCourseDescription('');
      setCourseFeatures('');
      fetchCourses();
      if (onRefreshData) {
        onRefreshData();
      }
    } catch (err: any) {
      setCourseError(err.message || 'কোর্স পাবলিশ করতে সমস্যা হয়েছে।');
    } finally {
      setCourseLoading(false);
    }
  };

  // Open Delete Course Modal
  const handleOpenDeleteCourseModal = (courseItem: Course) => {
    setDeleteCourseError('');
    setCourseToDelete(courseItem);
  };

  // Confirm Delete Course API Call
  const handleConfirmDeleteCourse = async () => {
    if (!courseToDelete) return;
    setIsDeletingCourse(true);
    setDeleteCourseError('');
    try {
      const response = await fetch(`/api/courses/${courseToDelete.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getAuthToken()}` }
      });
      if (response.ok) {
        setCoursesList(prev => prev.filter(c => c.id !== courseToDelete.id));
        fetchCourses();
        onRefreshData();
        setCourseToDelete(null);
      } else {
        const errData = await response.json().catch(() => ({}));
        setDeleteCourseError(errData.error || 'কোর্স রিমুভ করতে ব্যর্থ হয়েছে');
      }
    } catch (err: any) {
      console.error("Error deleting course:", err);
      setDeleteCourseError(err.message || 'কোর্স রিমুভ করতে ত্রুটি ঘটেছে');
    } finally {
      setIsDeletingCourse(false);
    }
  };

  // Helper to safely parse API JSON response without crashing on HTML error pages
  const parseJsonResponse = async (res: Response) => {
    const contentType = res.headers.get('content-type') || '';
    let data: any = {};
    if (contentType.includes('application/json')) {
      try {
        data = await res.json();
      } catch {
        data = {};
      }
    } else {
      const text = await res.text().catch(() => '');
      if (!res.ok) {
        if (res.status === 413) {
          throw new Error('আপলোড করা ফাইলের সাইজ অনেক বড়। ফাইলটি ছোট করে পুনরায় চেষ্টা করুন অথবা ইউটিউব/গুগল ড্রাইভ লিংক ব্যবহার করুন।');
        }
        if (res.status === 504 || res.status === 502) {
          throw new Error('সার্ভার রেসপন্স করতে বেশি সময় নিয়েছে (টাইমআউট)। সরাসরি YouTube/Google Drive লিংক ব্যবহার করার অনুরোধ করা হচ্ছে।');
        }
        throw new Error(`সার্ভারে সমস্যা তৈরি হয়েছে (স্ট্যাটাস: ${res.status})।`);
      }
      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text || 'সফল রেসপন্স' };
      }
    }
    if (!res.ok) {
      throw new Error(data.error || data.message || `অনুরোধটি সম্পন্ন করা সম্ভব হয়নি (HTTP ${res.status})`);
    }
    return data;
  };

  // Helper function to upload files (video/pdf) directly to Supabase Storage with fast fallback
  const uploadMediaFile = async (
    file: File, 
    bucket: string, 
    onProgress?: (progress: number) => void
  ): Promise<string> => {
    const fileExt = file.name.split('.').pop() || (bucket === 'pdf-materials' ? 'pdf' : 'mp4');
    const cleanFileName = `${bucket.slice(0, 4)}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;

    if (onProgress) onProgress(20);

    // 1. Direct Client Upload to Supabase Storage
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(cleanFileName, file, {
          contentType: file.type || (bucket === 'pdf-materials' ? 'application/pdf' : 'video/mp4'),
          upsert: true
        });

      if (onProgress) onProgress(70);

      if (!error && data) {
        const { data: publicUrlData } = supabase.storage
          .from(bucket)
          .getPublicUrl(cleanFileName);

        if (publicUrlData?.publicUrl) {
          if (onProgress) onProgress(100);
          return publicUrlData.publicUrl;
        }
      } else {
        console.log('Client storage notice, using API fallback:', error?.message);
      }
    } catch (e) {
      console.log('Direct upload exception:', e);
    }

    // 2. Server API fallback
    if (onProgress) onProgress(50);
    const reader = new FileReader();
    const dataUrl = await new Promise<string>((resolve, reject) => {
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('ফাইল পড়তে ব্যর্থ হয়েছে।'));
      reader.readAsDataURL(file);
    });

    if (onProgress) onProgress(80);

    const response = await fetch('/api/upload-file', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-bucket': bucket,
        'x-filename': cleanFileName,
        'x-content-type': file.type || (bucket === 'pdf-materials' ? 'application/pdf' : 'video/mp4'),
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify({ data: dataUrl })
    });

    const resData = await parseJsonResponse(response);
    if (!resData.url) {
      throw new Error('ফাইল আপলোড লিঙ্ক তৈরি করা সম্ভব হয়নি।');
    }

    if (onProgress) onProgress(100);
    return resData.url;
  };

  // Handle file selections & direct uploads
  const handleClassFileChange = async (file: File) => {
    setActionError('');
    setClassFile(file);
    setClassIsUploading(true);
    setClassUploadProgress(10);
    
    try {
      const uploadedUrl = await uploadMediaFile(file, 'course-videos', (p) => setClassUploadProgress(p));
      setClassVideoUrl(uploadedUrl);
      setClassSuccess('ভিডিও সফলভাবে আপলোড হয়েছে!');
      setActionError('');
    } catch (err: any) {
      console.error('Video upload error:', err);
      setActionError(err.message || 'ভিডিও ফাইল আপলোড করতে সমস্যা হয়েছে। ইউটিউব বা ড্রাইভ লিংক ব্যবহারের চেষ্টা করুন।');
    } finally {
      setClassIsUploading(false);
    }
  };

  const handleNoteFileChange = async (file: File) => {
    setActionError('');
    setNoteFile(file);
    setNoteIsUploading(true);
    setNoteUploadProgress(10);
    
    try {
      const uploadedUrl = await uploadMediaFile(file, 'pdf-materials', (p) => setNoteUploadProgress(p));
      setNotePdfUrl(uploadedUrl);
      setNoteSuccess('পিডিএফ লেকচার শিট সফলভাবে আপলোড হয়েছে!');
      setActionError('');
    } catch (err: any) {
      console.error('Note upload error:', err);
      setActionError(err.message || 'পিডিএফ ফাইল আপলোড করতে সমস্যা হয়েছে।');
    } finally {
      setNoteIsUploading(false);
    }
  };

  // Handle adding a class video
  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (classUploadMode === 'file' && !classVideoUrl) {
      if (classFile) {
        try {
          setClassLoading(true);
          const uploadedUrl = await uploadMediaFile(classFile, 'course-videos', setClassUploadProgress);
          setClassVideoUrl(uploadedUrl);
        } catch (err: any) {
          setActionError(err.message || 'ভিডিও ফাইল আপলোড করা যায়নি।');
          setClassLoading(false);
          return;
        }
      } else {
        setActionError('দয়া করে প্রথমে একটি ভিডিও ফাইল নির্বাচন করুন বা ইউটিউব লিংক দিন!');
        return;
      }
    }
    if (classUploadMode === 'link' && !classVideoUrl) {
      setActionError('দয়া করে একটি ভিডিও লিংক প্রদান করুন!');
      return;
    }

    setClassLoading(true);
    setClassSuccess('');
    setActionError('');

    // Ensure link format is suitable for embed
    let formattedUrl = formatVideoEmbedUrl(classVideoUrl);

    try {
      const response = await fetch('/api/classes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({
          title: classTitle,
          subject: classSubject,
          courseId: selectedUploadCourse?.id,
          courseTitle: selectedUploadCourse?.title,
          videoUrl: formattedUrl,
          thumbnailUrl: classThumbnailUrl.trim() || undefined,
          description: classDescription
        })
      });

      const data = await parseJsonResponse(response);

      setClassSuccess('ক্লাসটি সফলভাবে যুক্ত হয়েছে!');
      setClassTitle('');
      setClassVideoUrl('');
      setClassThumbnailUrl('');
      setClassDescription('');
      setClassFile(null);
      setClassUploadProgress(0);
      onRefreshData(); // refresh parent states
    } catch (err: any) {
      setActionError(err.message || 'ক্লাস যুক্ত করতে সমস্যা তৈরি হয়েছে।');
    } finally {
      setClassLoading(false);
    }
  };

  // Handle adding a PDF note
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (noteUploadMode === 'file' && !notePdfUrl) {
      if (noteFile) {
        try {
          setNoteLoading(true);
          const uploadedUrl = await uploadMediaFile(noteFile, 'pdf-materials', setNoteUploadProgress);
          setNotePdfUrl(uploadedUrl);
        } catch (err: any) {
          setActionError(err.message || 'পিডিএফ লেকচার শিট আপলোড করা যায়নি।');
          setNoteLoading(false);
          return;
        }
      } else {
        setActionError('দয়া করে প্রথমে একটি পিডিএফ ফাইল নির্বাচন করুন!');
        return;
      }
    }
    if (noteUploadMode === 'link' && !notePdfUrl) {
      setActionError('দয়া করে একটি পিডিএফ লিংক প্রদান করুন!');
      return;
    }

    setNoteLoading(true);
    setNoteSuccess('');
    setActionError('');

    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({
          title: noteTitle,
          subject: noteSubject,
          courseId: selectedUploadCourse?.id,
          courseTitle: selectedUploadCourse?.title,
          pdfUrl: notePdfUrl || "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
          description: noteDescription
        })
      });

      const data = await parseJsonResponse(response);

      setNoteSuccess('পিডিএফ লেকচার শিট সফলভাবে যুক্ত হয়েছে!');
      setNoteTitle('');
      setNotePdfUrl('');
      setNoteDescription('');
      setNoteFile(null);
      setNoteUploadProgress(0);
      onRefreshData();
    } catch (err: any) {
      setActionError(err.message || 'পিডিএফ নোট যুক্ত করতে সমস্যা হয়েছে।');
    } finally {
      setNoteLoading(false);
    }
  };

  // Toggle user role (student <-> admin)
  const handleToggleRole = async (targetUser: User) => {
    setActionError('');
    const newRole = targetUser.role === 'admin' ? 'student' : 'admin';
    try {
      const response = await fetch(`/api/admin/users/${targetUser.id}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({ role: newRole })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update user role');
      }

      setUserList(prev => prev.map(u => u.id === targetUser.id ? { ...u, role: newRole } : u));
    } catch (err: any) {
      setActionError(err.message || 'Error updating user role');
      setTimeout(() => setActionError(''), 5000);
    }
  };

  // Toggle user approval status (Approved <-> Pending)
  const handleToggleApproval = async (targetUser: User) => {
    setActionError('');
    const newApprovalStatus = !targetUser.isApproved;
    try {
      const response = await fetch(`/api/admin/users/${targetUser.id}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({ 
          isApproved: newApprovalStatus,
          enrolledCourseTitles: targetUser.enrolledCourseTitles || []
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update approval status');
      }

      fetchStatsAndUsers();
    } catch (err: any) {
      setActionError(err.message || 'Error occurred while updating approval status');
    }
  };

  // Update user enrolled courses
  const handleAssignUserCourse = async (userId: string, newCourseTitles: string[]) => {
    setActionError('');
    try {
      const response = await fetch(`/api/admin/users/${userId}/courses`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({ enrolledCourseTitles: newCourseTitles })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update user courses');
      }

      fetchStatsAndUsers();
    } catch (err: any) {
      alert(err.message || 'কোর্স আপডেট করতে সমস্যা হয়েছে');
      setActionError(err.message || 'Error occurred while updating user courses');
    }
  };

  // Open Update user transaction modal
  const handleOpenTrxModal = (userItem: User, currentTrx: string) => {
    setUserToEditTrx({ id: userItem.id, name: userItem.name, currentTrx: currentTrx || '' });
    setEditTrxInput(currentTrx || '');
  };

  // Confirm Update Transaction ID
  const handleConfirmUpdateTrx = async () => {
    if (!userToEditTrx) return;
    setIsUpdatingTrx(true);
    try {
      const response = await fetch(`/api/admin/users/${userToEditTrx.id}/transaction`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({ transactionId: editTrxInput.trim() })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update transaction ID');
      }

      setUserToEditTrx(null);
      fetchStatsAndUsers();
    } catch (err: any) {
      alert(err.message || 'ট্রানজেকশন আইডি আপডেট করতে সমস্যা হয়েছে');
    } finally {
      setIsUpdatingTrx(false);
    }
  };

  // Open Delete User Modal
  const handleOpenDeleteModal = (userItem: User) => {
    if (userItem.id === 'usr_admin') {
      alert('প্রধান এডমিন অ্যাকাউন্ট ডিলিট করা নিষিদ্ধ!');
      return;
    }
    setDeleteUserError('');
    setUserToDelete(userItem);
  };

  // Confirm Delete user API Call
  const handleConfirmDeleteUser = async () => {
    if (!userToDelete) return;
    setIsDeletingUser(true);
    setDeleteUserError('');
    try {
      const response = await fetch(`/api/admin/users/${userToDelete.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getAuthToken()}` }
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete user');
      }

      setUserList(prev => prev.filter(u => u.id !== userToDelete.id));
      setUserToDelete(null);
      fetchStatsAndUsers();
    } catch (err: any) {
      setDeleteUserError(err.message || 'ইউজার ডিলিট করতে সমস্যা হয়েছে');
      setActionError(err.message || 'Error occurred while deleting user');
    } finally {
      setIsDeletingUser(false);
    }
  };

  // Open Delete Class Modal
  const handleOpenDeleteClassModal = (clsItem: Class) => {
    setDeleteClassError('');
    setClassToDelete(clsItem);
  };

  // Confirm Delete Class API Call
  const handleConfirmDeleteClass = async () => {
    if (!classToDelete) return;
    setIsDeletingClass(true);
    setDeleteClassError('');
    try {
      const response = await fetch(`/api/classes/${classToDelete.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getAuthToken()}` }
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete class');
      }

      fetchCourses();
      onRefreshData();
      setClassToDelete(null);
    } catch (err: any) {
      console.error("Error deleting class:", err);
      setDeleteClassError(err.message || 'ক্লাস ডিলেট করতে সমস্যা হয়েছে');
    } finally {
      setIsDeletingClass(false);
    }
  };

  // Open Delete Note Modal
  const handleOpenDeleteNoteModal = (noteItem: Note) => {
    setDeleteNoteError('');
    setNoteToDelete(noteItem);
  };

  // Confirm Delete Note API Call
  const handleConfirmDeleteNote = async () => {
    if (!noteToDelete) return;
    setIsDeletingNote(true);
    setDeleteNoteError('');
    try {
      const response = await fetch(`/api/notes/${noteToDelete.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getAuthToken()}` }
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete note');
      }

      fetchCourses();
      onRefreshData();
      setNoteToDelete(null);
    } catch (err: any) {
      console.error("Error deleting note:", err);
      setDeleteNoteError(err.message || 'নোট ডিলেট করতে সমস্যা হয়েছে');
    } finally {
      setIsDeletingNote(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full text-slate-100 overflow-hidden font-sans">
      {/* Dynamic Contextual Scientific Hero Banner Background with High-Legibility Overlay */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <img 
          src={sectionBgMeta.image} 
          alt="Admin Section Background" 
          className="w-full h-full object-cover object-center opacity-20 scale-105 transition-all duration-1000 blur-[1px]"
        />
        <div className="absolute inset-0 bg-[#070c18]/92 backdrop-blur-[2px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050811] via-[#070c18]/80 to-[#070c18]/95" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-slate-950/80" />
      </div>

      <div className="relative z-10 w-full max-w-[99vw] xl:max-w-[1800px] mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6 animate-fade-in space-y-4">
      
      {/* Contextual Active Background Indicator */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 rounded-2xl bg-[#0a1122]/90 border border-cyan-500/25 shadow-[0_0_15px_rgba(34,211,238,0.1)] text-xs">
        <div className="flex items-center gap-2 text-cyan-300 font-mono">
          <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse shrink-0" />
          <span className="hidden sm:inline text-slate-400">অ্যাডমিন ব্যাকগ্রাউন্ড থিম:</span>
          <span className="font-bold text-white tracking-wide">{sectionBgMeta.label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-[10px] uppercase font-mono font-bold tracking-wider">
            {sectionBgMeta.badge}
          </span>
        </div>
      </div>
      
      {actionError && (
        <div className="flex items-start gap-2 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm mb-6 max-w-xl">
          <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Sidebar and Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch">
        
        {/* Sidebar Nav */}
        <div className="col-span-1 lg:col-span-3 xl:col-span-3 flex flex-col">
          <div className="sticky top-4 sm:top-6 p-3.5 sm:p-5 rounded-3xl bg-[#0a1122]/95 backdrop-blur-2xl border-2 border-cyan-500/40 shadow-[0_0_30px_rgba(34,211,238,0.2)] flex flex-col gap-2.5 lg:gap-3.5 lg:min-h-[80vh]">
            
            {/* Sidebar Banner: Logo only (Display only) */}
            <div className="hidden lg:flex flex-col items-center justify-center gap-3 border-b border-cyan-500/20 pb-4 select-none pointer-events-none">
              {/* Logo Only */}
              <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.4)] bg-slate-900 shrink-0">
                <img 
                  src={LogoImage} 
                  alt="Science Studio Logo" 
                  className="w-full h-full object-cover pointer-events-none"
                  draggable={false}
                />
              </div>
              <div className="text-center">
                <h4 className="text-sm font-display font-bold text-white tracking-wide">SCIENCE STUDIO</h4>
                <p className="text-[11px] font-mono text-cyan-400 font-semibold">এডমিন কন্ট্রোল প্যানেল</p>
              </div>
            </div>

            <div className="px-1 sm:px-2 py-1 text-xs font-mono uppercase tracking-widest text-cyan-400 font-black flex items-center justify-between">
              <span>মেনু ও ন্যাভিগেশন</span>
              <span className="lg:hidden text-[10px] text-emerald-400 font-sans font-bold">অ্যাক্টিভ</span>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:flex lg:flex-col gap-2.5 sm:gap-3">
            <button
              onClick={() => {
                setActiveTab('dashboard');
                setDashSubTab('overview');
              }}
              className={`flex items-center gap-3 px-4 py-3 sm:px-4.5 sm:py-3.5 rounded-2xl font-bold transition-all duration-300 cursor-pointer text-sm sm:text-base group ${
                activeTab === 'dashboard' && (dashSubTab === 'overview' || dashSubTab === 'users')
                  ? 'text-cyan-300 bg-gradient-to-r from-cyan-500/30 to-teal-500/30 border-2 border-cyan-400 shadow-[0_0_25px_rgba(34,211,238,0.35)] scale-[1.02]'
                  : 'text-slate-200 hover:text-white hover:bg-gradient-to-r hover:from-cyan-500/15 hover:to-teal-500/15 border border-white/10 hover:border-cyan-400/60 hover:shadow-[0_0_15px_rgba(34,211,238,0.2)] hover:translate-x-1.5'
              }`}
            >
              <Activity className="w-5 h-5 sm:w-5.5 sm:h-5.5 text-cyan-400 group-hover:scale-115 transition-transform duration-300 shrink-0" />
              <span className="truncate">ড্যাশবোর্ড</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('dashboard');
                setDashSubTab('hero-banners');
              }}
              className={`flex items-center gap-3 px-4 py-3 sm:px-4.5 sm:py-3.5 rounded-2xl font-bold transition-all duration-300 cursor-pointer text-sm sm:text-base group ${
                activeTab === 'dashboard' && dashSubTab === 'hero-banners'
                  ? 'text-teal-300 bg-gradient-to-r from-teal-500/30 to-cyan-500/30 border-2 border-teal-400 shadow-[0_0_25px_rgba(20,184,166,0.35)] scale-[1.02]'
                  : 'text-slate-200 hover:text-white hover:bg-gradient-to-r hover:from-teal-500/15 hover:to-cyan-500/15 border border-white/10 hover:border-teal-400/60 hover:shadow-[0_0_15px_rgba(20,184,166,0.2)] hover:translate-x-1.5'
              }`}
            >
              <ImageIcon className="w-5 h-5 sm:w-5.5 sm:h-5.5 text-teal-400 group-hover:scale-115 transition-transform duration-300 shrink-0" />
              <span className="truncate">হিরো সেকশন</span>
            </button>

            <button
              onClick={() => setActiveTab('upload')}
              className={`flex items-center gap-3 px-4 py-3 sm:px-4.5 sm:py-3.5 rounded-2xl font-bold transition-all duration-300 cursor-pointer text-sm sm:text-base group ${
                activeTab === 'upload'
                  ? 'text-emerald-300 bg-gradient-to-r from-emerald-500/30 to-teal-500/30 border-2 border-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.35)] scale-[1.02]'
                  : 'text-slate-200 hover:text-white hover:bg-gradient-to-r hover:from-emerald-500/15 hover:to-teal-500/15 border border-white/10 hover:border-emerald-400/60 hover:shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:translate-x-1.5'
              }`}
            >
              <Upload className="w-5 h-5 sm:w-5.5 sm:h-5.5 text-emerald-400 group-hover:scale-115 transition-transform duration-300 shrink-0" />
              <span className="truncate">আপলোড</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('dashboard');
                setDashSubTab('settings');
              }}
              className={`flex items-center gap-3 px-4 py-3 sm:px-4.5 sm:py-3.5 rounded-2xl font-bold transition-all duration-300 cursor-pointer text-sm sm:text-base group ${
                activeTab === 'dashboard' && dashSubTab === 'settings'
                  ? 'text-amber-300 bg-gradient-to-r from-amber-500/30 to-orange-500/30 border-2 border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.35)] scale-[1.02]'
                  : 'text-slate-200 hover:text-white hover:bg-gradient-to-r hover:from-amber-500/15 hover:to-orange-500/15 border border-white/10 hover:border-amber-400/60 hover:shadow-[0_0_15px_rgba(245,158,11,0.2)] hover:translate-x-1.5'
              }`}
            >
              <SettingsIcon className="w-5 h-5 sm:w-5.5 sm:h-5.5 text-amber-400 animate-spin-slow group-hover:scale-115 transition-transform duration-300 shrink-0" />
              <span className="truncate">সেটিংস</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('dashboard');
                setDashSubTab('routine');
              }}
              className={`flex items-center gap-3 px-4 py-3 sm:px-4.5 sm:py-3.5 rounded-2xl font-bold transition-all duration-300 cursor-pointer text-sm sm:text-base group ${
                activeTab === 'dashboard' && dashSubTab === 'routine'
                  ? 'text-rose-300 bg-gradient-to-r from-rose-500/30 to-pink-500/30 border-2 border-rose-400 shadow-[0_0_25px_rgba(244,63,94,0.35)] scale-[1.02]'
                  : 'text-slate-200 hover:text-white hover:bg-gradient-to-r hover:from-rose-500/15 hover:to-pink-500/15 border border-white/10 hover:border-rose-400/60 hover:shadow-[0_0_15px_rgba(244,63,94,0.2)] hover:translate-x-1.5'
              }`}
            >
              <Calendar className="w-5 h-5 sm:w-5.5 sm:h-5.5 text-rose-400 group-hover:scale-115 transition-transform duration-300 shrink-0" />
              <span className="truncate">ক্লাস রুটিন</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('dashboard');
                setDashSubTab('courses');
              }}
              className={`flex items-center gap-3 px-4 py-3 sm:px-4.5 sm:py-3.5 rounded-2xl font-bold transition-all duration-300 cursor-pointer text-sm sm:text-base group ${
                activeTab === 'dashboard' && dashSubTab === 'courses'
                  ? 'text-violet-300 bg-gradient-to-r from-violet-500/30 to-purple-500/30 border-2 border-violet-400 shadow-[0_0_25px_rgba(139,92,246,0.35)] scale-[1.02]'
                  : 'text-slate-200 hover:text-white hover:bg-gradient-to-r hover:from-violet-500/15 hover:to-purple-500/15 border border-white/10 hover:border-violet-400/60 hover:shadow-[0_0_15px_rgba(139,92,246,0.2)] hover:translate-x-1.5'
              }`}
            >
              <BookOpen className="w-5 h-5 sm:w-5.5 sm:h-5.5 text-violet-400 group-hover:scale-115 transition-transform duration-300 shrink-0" />
              <span className="truncate">কোর্স পাবলিশ</span>
            </button>

            <button
              onClick={() => setActiveTab('course-overview')}
              className={`flex items-center gap-3 px-4 py-3 sm:px-4.5 sm:py-3.5 rounded-2xl font-bold transition-all duration-300 cursor-pointer text-sm sm:text-base group ${
                activeTab === 'course-overview'
                  ? 'text-cyan-300 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 border-2 border-cyan-400 shadow-[0_0_25px_rgba(34,211,238,0.35)] scale-[1.02]'
                  : 'text-slate-200 hover:text-white hover:bg-gradient-to-r hover:from-cyan-500/15 hover:to-blue-500/15 border border-white/10 hover:border-cyan-400/60 hover:shadow-[0_0_15px_rgba(34,211,238,0.2)] hover:translate-x-1.5'
              }`}
            >
              <Layers className="w-5 h-5 sm:w-5.5 sm:h-5.5 text-cyan-400 group-hover:scale-115 transition-transform duration-300 shrink-0" />
              <span className="truncate">কোর্স ওভারভিউ</span>
            </button>
            </div>
          </div>
        </div>

        {/* Content Panel Area */}
        <div className="col-span-1 lg:col-span-9 xl:col-span-9 space-y-6">

          {activeTab === 'dashboard' && (
            <>
              {/* Inner Dashboard Tabs (Only show Overview & Students list tabs when on Overview or Users view) */}
              {(dashSubTab === 'overview' || dashSubTab === 'users') && (
                <div className="flex flex-wrap items-center gap-3 border-b border-white/10 pb-4 mb-6">
                  <button
                    onClick={() => setDashSubTab('overview')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all duration-300 cursor-pointer text-xs ${
                      dashSubTab === 'overview'
                        ? 'text-cyan-400 bg-cyan-500/10 border border-cyan-500/25 shadow-[0_0_15px_rgba(6,182,212,0.1)]'
                        : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <Activity className="w-4 h-4 text-cyan-400" />
                    ওভারভিউ (Overview)
                  </button>
                  <button
                    onClick={() => setDashSubTab('users')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all duration-300 cursor-pointer text-xs ${
                      dashSubTab === 'users'
                        ? 'text-cyan-400 bg-cyan-500/10 border border-cyan-500/25 shadow-[0_0_15px_rgba(6,182,212,0.1)]'
                        : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <Users className="w-4 h-4 text-emerald-400" />
                    স্টুডেন্টস তালিকা (Students)
                  </button>
                </div>
              )}

              {dashSubTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-fade-in">
                  
                  {/* Card 1: Students count */}
                  <div className="p-6 rounded-3xl bg-[#0e172a]/90 backdrop-blur-xl border-2 border-cyan-500/40 hover:border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.15)] hover:shadow-[0_0_25px_rgba(34,211,238,0.3)] transition-all flex items-center justify-between group">
                    <div>
                      <span className="text-xs font-mono font-bold tracking-wider text-cyan-400 uppercase">মোট স্টুডেন্ট (Students)</span>
                      <h2 className="text-3xl font-display font-bold text-white mt-1 group-hover:text-cyan-300 transition-colors">
                        {stats ? stats.totalStudents : '...'}
                      </h2>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.25)] group-hover:scale-110 transition-transform">
                      <Users className="w-7 h-7" />
                    </div>
                  </div>

                  {/* Card 2: Videos count */}
                  <div className="p-6 rounded-3xl bg-[#0e172a]/90 backdrop-blur-xl border-2 border-teal-500/40 hover:border-teal-400 shadow-[0_0_20px_rgba(20,184,166,0.15)] hover:shadow-[0_0_25px_rgba(20,184,166,0.3)] transition-all flex items-center justify-between group">
                    <div>
                      <span className="text-xs font-mono font-bold tracking-wider text-teal-400 uppercase">আপলোডকৃত ক্লাস (Videos)</span>
                      <h2 className="text-3xl font-display font-bold text-white mt-1 group-hover:text-teal-300 transition-colors">
                        {stats ? stats.totalClasses : '...'}
                      </h2>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-teal-500/20 border border-teal-400/40 text-teal-300 shadow-[0_0_15px_rgba(20,184,166,0.25)] group-hover:scale-110 transition-transform">
                      <Video className="w-7 h-7" />
                    </div>
                  </div>

                  {/* Card 3: Notes count */}
                  <div className="p-6 rounded-3xl bg-[#0e172a]/90 backdrop-blur-xl border-2 border-indigo-500/40 hover:border-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.15)] hover:shadow-[0_0_25px_rgba(99,102,241,0.3)] transition-all flex items-center justify-between group">
                    <div>
                      <span className="text-xs font-mono font-bold tracking-wider text-indigo-400 uppercase">লেকচার শিট সংখ্যা (Notes)</span>
                      <h2 className="text-3xl font-display font-bold text-white mt-1 group-hover:text-indigo-300 transition-colors">
                        {stats ? stats.totalNotes : '...'}
                      </h2>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.25)] group-hover:scale-110 transition-transform">
                      <FileText className="w-7 h-7" />
                    </div>
                  </div>

                </div>
              )}
            </>
          )}

          {activeTab === 'upload' && (
            <>
              {/* Select Course for Upload Header Menu */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-cyan-950/80 via-slate-900/90 to-purple-950/80 border border-cyan-500/30 shadow-2xl mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-cyan-400" />
                    <h2 className="text-base font-display font-bold text-white">
                      সিলেক্ট কোর্স ফর আপলোড ভিডিও (Select Course for Upload Video)
                    </h2>
                  </div>
                  <p className="text-xs text-slate-300">
                    আপনার পাবলিশ করা কোনো একটি নির্দিষ্ট কোর্সের অধীনে ভিডিও বা পিডিএফ ক্লাস যুক্ত করতে ড্রপডাউন থেকে কোর্সটি সিলেক্ট করুন।
                  </p>
                </div>

                <div className="w-full md:w-80 shrink-0">
                  <label className="block text-[11px] font-mono text-cyan-300 font-semibold mb-1 uppercase tracking-wider">
                    কোর্স নির্বাচন করুন (Select Course)
                  </label>
                  <select
                    value={selectedUploadCourseId}
                    onChange={(e) => {
                      const cId = e.target.value;
                      setSelectedUploadCourseId(cId);
                      const foundCourse = coursesList.find(c => c.id === cId);
                      if (foundCourse) {
                        setClassSubject(foundCourse.subject);
                        setNoteSubject(foundCourse.subject);
                      }
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-cyan-500/40 text-white font-semibold text-xs focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all cursor-pointer shadow-inner"
                  >
                    <option value="">🌐 সাধারণ / নির্দিষ্ট কোনো কোর্স ছাড়া (General Class)</option>
                    {coursesList.map((course) => (
                      <option key={course.id} value={course.id}>
                        📚 {course.title} ({course.subject} - {course.classLevel || 'General'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {selectedUploadCourse && (
                <div className="p-3.5 bg-cyan-500/10 border border-cyan-500/30 rounded-xl mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-cyan-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>
                      সিলেক্টেড কোর্স: <strong className="text-white">{selectedUploadCourse.title}</strong> | বিষয়: <strong className="text-white">{selectedUploadCourse.subject}</strong> ({selectedUploadCourse.classLevel || 'General'})
                    </span>
                  </div>
                  <span className="text-[10px] bg-cyan-500/20 text-cyan-200 px-2 py-0.5 rounded font-mono">
                    ✓ বিষয় অটো-সেট করা হয়েছে ({selectedUploadCourse.subject})
                  </span>
                </div>
              )}

              {/* Grid Row 2: Add Forms (Double columns on desktop) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        
        {/* Form A: Add Video Class */}
        <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 mb-4 border-b border-white/10 pb-3">
              <Plus className="w-5 h-5" />
              <h3 className="font-display font-bold text-lg text-white">নতুন ভিডিও ক্লাস যুক্ত করুন</h3>
            </div>

            {classSuccess && (
              <div className="flex items-center gap-2 p-3 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs rounded-lg mb-4">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{classSuccess}</span>
              </div>
            )}

            <form onSubmit={handleAddClass} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">ক্লাসের শিরোনাম (Class Title)</label>
                  <input
                    type="text"
                    required
                    value={classTitle}
                    onChange={(e) => setClassTitle(e.target.value)}
                    placeholder="e.g. জৈব যৌগের নামকরণ"
                    className="w-full px-3 py-2 rounded bg-white/5 border border-white/10 focus:border-cyan-400 text-xs text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">বিষয় (Select Subject)</label>
                  <select
                    value={classSubject}
                    onChange={(e) => setClassSubject(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-slate-900 border border-white/10 focus:border-cyan-400 text-xs text-white outline-none"
                  >
                    {subjects.length > 0 ? (
                      subjects.map((sub, sidx) => (
                        <option key={sidx} value={sub}>{sub}</option>
                      ))
                    ) : (
                      <>
                        <option value="Physics">Physics (পদার্থবিজ্ঞান)</option>
                        <option value="Chemistry">Chemistry (রসায়ন)</option>
                        <option value="Biology">Biology (জীববিজ্ঞান)</option>
                        <option value="Mathematics">Mathematics (উচ্চতর গণিত)</option>
                        <option value="General Science">General Science (সাধারণ বিজ্ঞান)</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              {/* Upload Mode Selector Toggle */}
              <div className="flex bg-white/5 p-1 rounded-lg border border-white/10 text-xs gap-1">
                <button
                  type="button"
                  onClick={() => setClassUploadMode('file')}
                  className={`flex-1 py-1.5 rounded transition-all cursor-pointer font-semibold ${
                    classUploadMode === 'file'
                      ? 'bg-cyan-500 text-slate-950 shadow-[0_0_10px_rgba(34,211,238,0.3)]'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  ফাইল আপলোড করুন (File Upload)
                </button>
                <button
                  type="button"
                  onClick={() => setClassUploadMode('link')}
                  className={`flex-1 py-1.5 rounded transition-all cursor-pointer font-semibold ${
                    classUploadMode === 'link'
                      ? 'bg-cyan-500 text-slate-950 shadow-[0_0_10px_rgba(34,211,238,0.3)]'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  লিঙ্ক দিন (Video Link)
                </button>
              </div>

              {classUploadMode === 'file' ? (
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">ভিডিও ফাইল আপলোড করুন (Video File)</label>
                  
                  {!classFile ? (
                    <div
                      onDragOver={(e) => { e.preventDefault(); setIsDragOverClass(true); }}
                      onDragLeave={() => setIsDragOverClass(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDragOverClass(false);
                        const file = e.dataTransfer.files[0];
                        if (file && file.type.startsWith('video/')) {
                          handleClassFileChange(file);
                        } else {
                          setActionError('দয়া করে একটি সঠিক ভিডিও ফাইল (.mp4, .webm ইত্যাদি) ড্রপ করুন!');
                        }
                      }}
                      className={`h-32 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-all duration-300 relative group ${
                        isDragOverClass 
                          ? 'border-cyan-400 bg-cyan-500/10' 
                          : 'border-white/10 bg-white/5 hover:border-cyan-500/40'
                      }`}
                    >
                      <input
                        type="file"
                        accept="video/*"
                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleClassFileChange(file);
                        }}
                      />
                      <Upload className="w-8 h-8 text-cyan-400 group-hover:scale-110 transition-transform mb-2" />
                      <p className="text-xs text-white font-semibold">ভিডিও ফাইল ড্র্যাগ করে ছাড়ুন অথবা ব্রাউজ করুন</p>
                      <p className="text-[10px] text-slate-500 mt-1">Supports MP4, WebM up to 100MB</p>
                    </div>
                  ) : (
                    <div className="p-4 bg-[#11192e] border border-cyan-400/45 rounded-xl relative">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded-lg">
                            <Video className="w-5 h-5 animate-pulse" />
                          </div>
                          <div className="overflow-hidden">
                            <h5 className="text-xs font-semibold text-white truncate">{classFile.name}</h5>
                            <p className="text-[10px] text-slate-500 font-mono">{(classFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => { setClassFile(null); setClassVideoUrl(''); }}
                          className="text-[10px] text-rose-400 hover:text-rose-300 font-semibold uppercase bg-rose-500/10 px-2 py-1 rounded cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>

                      {/* Progress bar */}
                      <div className="mt-3">
                        <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 mb-1">
                          <span>{classIsUploading ? 'আপলোড হচ্ছে...' : 'আপলোড সম্পন্ন'}</span>
                          <span className="text-cyan-400 font-bold">{classUploadProgress}%</span>
                        </div>
                        <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-cyan-500 h-full rounded-full transition-all duration-300"
                            style={{ width: `${classUploadProgress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">ইউটিউব বা ভিডিও লিঙ্ক (YouTube Video URL)</label>
                  <input
                    type="url"
                    required
                    value={classVideoUrl}
                    onChange={(e) => setClassVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=Us8M_M3fRmo"
                    className="w-full px-3 py-2 rounded bg-white/5 border border-white/10 focus:border-cyan-400 text-xs text-white outline-none"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">ইউটিউবের রেগুলার লিঙ্ক বা এম্বেডেড লিঙ্ক যেকোনোটি ব্যবহার করা যাবে।</span>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-mono text-slate-400">🖼️ ভিডিও ব্যানার / কভার পিকচার (Class Thumbnail) [অপশনাল]</label>
                  <div className="flex items-center gap-1.5 bg-slate-900/80 p-0.5 rounded-lg border border-white/10">
                    <button
                      type="button"
                      onClick={() => setThumbnailUploadMode('file')}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                        thumbnailUploadMode === 'file' ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      ছবি আপলোড
                    </button>
                    <button
                      type="button"
                      onClick={() => setThumbnailUploadMode('link')}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                        thumbnailUploadMode === 'link' ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      URL লিঙ্ক
                    </button>
                  </div>
                </div>

                {thumbnailUploadMode === 'file' ? (
                  <div className="space-y-2">
                    <div 
                      onClick={() => document.getElementById('class-thumbnail-file-input')?.click()}
                      className="border-2 border-dashed border-white/15 hover:border-cyan-400/50 rounded-xl p-3 text-center cursor-pointer bg-white/5 hover:bg-white/10 transition-all"
                    >
                      <input
                        id="class-thumbnail-file-input"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            handleClassThumbnailFileChange(e.target.files[0]);
                          }
                        }}
                        className="hidden"
                      />
                      {classThumbnailUrl ? (
                        <div className="flex items-center justify-between gap-2 bg-slate-950 p-2 rounded-lg border border-white/10">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <img src={classThumbnailUrl} alt="Thumbnail preview" className="w-12 h-9 object-cover rounded border border-white/10" />
                            <span className="text-[11px] text-cyan-300 font-mono truncate">কভার ইমেজ আপলোড সফল হয়েছে!</span>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setClassThumbnailUrl('');
                            }}
                            className="p-1 text-slate-400 hover:text-rose-400 text-xs shrink-0"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="text-slate-400 text-xs py-1">
                          <p className="font-semibold text-slate-300">কভার ইমেজ বেছে নিতে ক্লিক করুন (Upload Banner)</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">JPG, PNG, WEBP (সর্বোচ্চ 5MB)</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <input
                    type="url"
                    value={classThumbnailUrl}
                    onChange={(e) => setClassThumbnailUrl(e.target.value)}
                    placeholder="e.g. https://images.unsplash.com/... (ছবি বা ব্যানার লিঙ্ক)"
                    className="w-full px-3 py-2 rounded bg-white/5 border border-white/10 focus:border-cyan-400 text-xs text-white outline-none"
                  />
                )}
                <span className="text-[10px] text-slate-500 mt-1 block">ভিডিও প্লে করার আগে কভার হিসেবে প্রদর্শিত হবে। প্লে বাটন চাপলে মূল ভিডিওটি প্লে হবে।</span>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">লেকচার বর্ণনা (Class Description)</label>
                <textarea
                  rows={3}
                  value={classDescription}
                  onChange={(e) => setClassDescription(e.target.value)}
                  placeholder="এই ক্লাসের মূল টপিক ও হোমওয়ার্ক নিয়ে বিস্তারিত লিখুন..."
                  className="w-full px-3 py-2 rounded bg-white/5 border border-white/10 focus:border-cyan-400 text-xs text-white outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={classLoading}
                className="w-full py-2.5 rounded bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 text-xs font-bold tracking-wider uppercase transition-colors flex items-center justify-center gap-1.5 cursor-pointer glow-btn"
              >
                {classLoading ? 'Saving...' : 'ভিডিও আপলোড করুন'}
              </button>
            </form>
          </div>
        </div>

        {/* Form B: Add PDF Note */}
        <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 mb-4 border-b border-white/10 pb-3">
              <Upload className="w-5 h-5" />
              <h3 className="font-display font-bold text-lg text-white">নতুন পিডিএফ লেকচার শিট আপলোড</h3>
            </div>

            {noteSuccess && (
              <div className="flex items-center gap-2 p-3 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs rounded-lg mb-4">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{noteSuccess}</span>
              </div>
            )}

            <form onSubmit={handleAddNote} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">শিটের শিরোনাম (Note Title)</label>
                  <input
                    type="text"
                    required
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    placeholder="e.g. কোয়ান্টাম সংখ্যা শিট"
                    className="w-full px-3 py-2 rounded bg-white/5 border border-white/10 focus:border-cyan-400 text-xs text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">বিষয় (Select Subject)</label>
                  <select
                    value={noteSubject}
                    onChange={(e) => setNoteSubject(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-slate-900 border border-white/10 focus:border-cyan-400 text-xs text-white outline-none"
                  >
                    {subjects.length > 0 ? (
                      subjects.map((sub, sidx) => (
                        <option key={sidx} value={sub}>{sub}</option>
                      ))
                    ) : (
                      <>
                        <option value="Physics">Physics (পদার্থবিজ্ঞান)</option>
                        <option value="Chemistry">Chemistry (রসায়ন)</option>
                        <option value="Biology">Biology (জীববিজ্ঞান)</option>
                        <option value="Mathematics">Mathematics (উচ্চতর গণিত)</option>
                        <option value="General Science">General Science (সাধারণ বিজ্ঞান)</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              {/* Upload Mode Selector Toggle for PDF */}
              <div className="flex bg-white/5 p-1 rounded-lg border border-white/10 text-xs gap-1">
                <button
                  type="button"
                  onClick={() => setNoteUploadMode('file')}
                  className={`flex-1 py-1.5 rounded transition-all cursor-pointer font-semibold ${
                    noteUploadMode === 'file'
                      ? 'bg-cyan-500 text-slate-950 shadow-[0_0_10px_rgba(34,211,238,0.3)]'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  ফাইল আপলোড করুন (File Upload)
                </button>
                <button
                  type="button"
                  onClick={() => setNoteUploadMode('link')}
                  className={`flex-1 py-1.5 rounded transition-all cursor-pointer font-semibold ${
                    noteUploadMode === 'link'
                      ? 'bg-cyan-500 text-slate-950 shadow-[0_0_10px_rgba(34,211,238,0.3)]'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  লিঙ্ক দিন (PDF Link)
                </button>
              </div>

              {noteUploadMode === 'file' ? (
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">পিডিএফ ফাইল আপলোড করুন (PDF File)</label>
                  
                  {!noteFile ? (
                    <div
                      onDragOver={(e) => { e.preventDefault(); setIsDragOverNote(true); }}
                      onDragLeave={() => setIsDragOverNote(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDragOverNote(false);
                        const file = e.dataTransfer.files[0];
                        if (file && file.type === 'application/pdf') {
                          handleNoteFileChange(file);
                        } else {
                          setActionError('দয়া করে একটি সঠিক পিডিএফ ফাইল (.pdf) ড্রপ করুন!');
                        }
                      }}
                      className={`h-32 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-all duration-300 relative group ${
                        isDragOverNote 
                          ? 'border-cyan-400 bg-cyan-500/10' 
                          : 'border-white/10 bg-white/5 hover:border-cyan-500/40'
                      }`}
                    >
                      <input
                        type="file"
                        accept="application/pdf"
                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleNoteFileChange(file);
                        }}
                      />
                      <Upload className="w-8 h-8 text-cyan-400 group-hover:scale-110 transition-transform mb-2" />
                      <p className="text-xs text-white font-semibold">পিডিএফ ফাইল ড্র্যাগ করে ছাড়ুন অথবা ব্রাউজ করুন</p>
                      <p className="text-[10px] text-slate-500 mt-1">Supports PDF format up to 25MB</p>
                    </div>
                  ) : (
                    <div className="p-4 bg-[#11192e] border border-cyan-400/45 rounded-xl relative">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded-lg">
                            <FileText className="w-5 h-5 animate-pulse" />
                          </div>
                          <div className="overflow-hidden">
                            <h5 className="text-xs font-semibold text-white truncate">{noteFile.name}</h5>
                            <p className="text-[10px] text-slate-500 font-mono">{(noteFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => { setNoteFile(null); setNotePdfUrl(''); }}
                          className="text-[10px] text-rose-400 hover:text-rose-300 font-semibold uppercase bg-rose-500/10 px-2 py-1 rounded cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>

                      {/* Progress bar */}
                      <div className="mt-3">
                        <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 mb-1">
                          <span>{noteIsUploading ? 'আপলোড হচ্ছে...' : 'আপলোড সম্পন্ন'}</span>
                          <span className="text-cyan-400 font-bold">{noteUploadProgress}%</span>
                        </div>
                        <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-cyan-500 h-full rounded-full transition-all duration-300"
                            style={{ width: `${noteUploadProgress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">পিডিএফ ডাউনলোড লিঙ্ক (PDF File Link / URL)</label>
                  <input
                    type="url"
                    value={notePdfUrl}
                    onChange={(e) => setNotePdfUrl(e.target.value)}
                    placeholder="https://example.com/lecture-note.pdf (ঐচ্ছিক)"
                    className="w-full px-3 py-2 rounded bg-white/5 border border-white/10 focus:border-cyan-400 text-xs text-white outline-none"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">খালি রাখলে স্টুডেন্টদের পড়ার সুবিধার্থে স্বয়ংক্রিয়ভাবে আমাদের ডেমো পিডিএফ যুক্ত হবে।</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">নোট সম্পর্কে বর্ণনা (Note Description)</label>
                <textarea
                  rows={3}
                  value={noteDescription}
                  onChange={(e) => setNoteDescription(e.target.value)}
                  placeholder="স্টাডি নোটের গুরুত্বপূর্ণ সূত্র ও তথ্য নিয়ে সংক্ষেপে লিখুন..."
                  className="w-full px-3 py-2 rounded bg-white/5 border border-white/10 focus:border-cyan-400 text-xs text-white outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={noteLoading}
                className="w-full py-2.5 rounded bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 text-xs font-bold tracking-wider uppercase transition-colors flex items-center justify-center gap-1.5 cursor-pointer glow-btn"
              >
                {noteLoading ? 'Saving...' : 'লেকচার শিট যুক্ত করুন'}
              </button>
            </form>
          </div>
        </div>

      </div>
        </>
      )}

      {/* Grid Row 3: Manage Users List */}
      {activeTab === 'dashboard' && dashSubTab === 'users' && (
        <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 mb-10 overflow-hidden shadow-xl animate-fade-in">
        
        {/* Header & Interactive Control Toolbar Card */}
        <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-4 sm:p-5 mb-6 shadow-2xl space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base sm:text-lg text-white flex items-center gap-2">
                  স্টুডেন্ট ডাটাবেস ও অ্যাকসেস কন্ট্রোল
                  <span className="text-xs bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono px-2.5 py-0.5 rounded-full font-bold">
                    {filteredUserList.length} / {userList.length} জন
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400">তারিখ রেঞ্জ, অ্যাকসেস স্ট্যাটাস ও তথ্য দিয়ে ফিল্টার ও সার্চ করুন</p>
              </div>
            </div>

            {/* Clear All Filters Button if any filter active */}
            {(userSearchQuery || userStatusFilter !== 'all' || userStartDate || userEndDate || tempStartDate || tempEndDate) && (
              <button
                type="button"
                onClick={() => {
                  setUserSearchQuery('');
                  setUserStatusFilter('all');
                  setTempStartDate('');
                  setTempEndDate('');
                  setUserStartDate('');
                  setUserEndDate('');
                  setUserCurrentPage(1);
                }}
                className="self-start md:self-auto px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm hover:scale-105 active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
                <span>ফিল্টার রিসেট করুন</span>
              </button>
            )}
          </div>

          {/* Interactive Filters Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 text-xs">
            {/* Search Input (Cols 5) */}
            <div className="lg:col-span-5 relative flex items-center">
              <Search className="w-4 h-4 text-cyan-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="নাম, ইমেইল, ফোন নম্বর বা TrxID দিয়ে সার্চ করুন..."
                value={userSearchQuery}
                onChange={(e) => {
                  setUserSearchQuery(e.target.value);
                  setUserCurrentPage(1);
                }}
                className="w-full pl-9 pr-8 py-2 bg-slate-950 border border-white/15 focus:border-cyan-400 rounded-xl text-white placeholder-slate-500 text-xs outline-none transition-all shadow-inner"
              />
              {userSearchQuery && (
                <button
                  type="button"
                  onClick={() => { setUserSearchQuery(''); setUserCurrentPage(1); }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Status Filter Interactive Segmented Pills (Cols 4) */}
            <div className="lg:col-span-4 flex items-center bg-slate-950 p-1 rounded-xl border border-white/10">
              <button
                type="button"
                onClick={() => { setUserStatusFilter('all'); setUserCurrentPage(1); }}
                className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-medium transition-all text-center cursor-pointer ${
                  userStatusFilter === 'all'
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                সকল
              </button>
              <button
                type="button"
                onClick={() => { setUserStatusFilter('approved'); setUserCurrentPage(1); }}
                className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-medium transition-all text-center cursor-pointer ${
                  userStatusFilter === 'approved'
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                অনুমোদিত
              </button>
              <button
                type="button"
                onClick={() => { setUserStatusFilter('pending'); setUserCurrentPage(1); }}
                className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-medium transition-all text-center cursor-pointer ${
                  userStatusFilter === 'pending'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                অপেক্ষমান
              </button>
            </div>

            {/* Per Page Selector (Cols 3) */}
            <div className="lg:col-span-3 flex items-center justify-between bg-slate-950 px-3 py-1.5 rounded-xl border border-white/10 text-slate-300">
              <span className="text-[11px] text-slate-400 font-mono">প্রতি পেজে:</span>
              <select
                value={userItemsPerPage}
                onChange={(e) => {
                  const val = e.target.value;
                  setUserItemsPerPage(val === 'all' ? 'all' : Number(val));
                  setUserCurrentPage(1);
                }}
                className="bg-transparent text-cyan-400 font-bold font-mono text-xs outline-none cursor-pointer"
              >
                <option value={5} className="bg-slate-900 text-white">৫ জন</option>
                <option value={10} className="bg-slate-900 text-white">১০ জন</option>
                <option value={20} className="bg-slate-900 text-white">২০ জন</option>
                <option value={50} className="bg-slate-900 text-white">৫০ জন</option>
                <option value="all" className="bg-slate-900 text-white">সকল</option>
              </select>
            </div>
          </div>

          {/* Professional Interactive Date Range Picker Bar with Explicit Filter Button */}
          <div className="pt-3 border-t border-white/10 bg-slate-950/80 p-3.5 rounded-xl border border-white/10 space-y-3">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              
              {/* Date Box & Filter Button Group (Fixed Dimensions, No Shift On Click) */}
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="flex items-center gap-1.5 text-amber-400 font-semibold text-xs shrink-0">
                  <Calendar className="w-4 h-4 text-amber-400" />
                  <span>তারিখ ক্যালেন্ডার:</span>
                </div>

                {/* Fixed Non-Shifting Calendar Box */}
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-colors shrink-0 ${
                  tempStartDate || tempEndDate || userStartDate || userEndDate
                    ? 'bg-amber-500/10 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.15)]' 
                    : 'bg-slate-900 border-white/10'
                }`}>
                  <span className="text-[11px] text-slate-400 font-medium shrink-0">From:</span>
                  <input
                    type="date"
                    value={tempStartDate}
                    onChange={(e) => setTempStartDate(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleApplyDateFilter()}
                    className="bg-slate-950 text-white border border-white/15 rounded-lg px-2 py-1 text-xs outline-none focus:border-cyan-400 font-mono cursor-pointer w-[125px] shrink-0"
                    title="শুরুর তারিখ (From Date)"
                  />

                  <ArrowRight className="w-3.5 h-3.5 text-amber-400/80 shrink-0" />

                  <span className="text-[11px] text-slate-400 font-medium shrink-0">To:</span>
                  <input
                    type="date"
                    value={tempEndDate}
                    onChange={(e) => setTempEndDate(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleApplyDateFilter()}
                    className="bg-slate-950 text-white border border-white/15 rounded-lg px-2 py-1 text-xs outline-none focus:border-cyan-400 font-mono cursor-pointer w-[125px] shrink-0"
                    title="শেষের তারিখ (To Date)"
                  />

                  {/* Reserved Clear Space to avoid layout jump */}
                  <button
                    type="button"
                    onClick={handleClearDateFilter}
                    className={`p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 rounded-md transition-colors cursor-pointer shrink-0 ${
                      !(tempStartDate || tempEndDate || userStartDate || userEndDate) ? 'invisible' : 'visible'
                    }`}
                    title="তারিখ মুছুন"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Explicit Action Filter Button */}
                <button
                  type="button"
                  onClick={handleApplyDateFilter}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_20px_rgba(6,182,212,0.5)] transition-all flex items-center gap-1.5 cursor-pointer shrink-0 active:scale-95"
                  title="ফিল্টার প্রয়োগ করুন"
                >
                  <Filter className="w-3.5 h-3.5 fill-slate-950" />
                  <span>ফিল্টার করুন</span>
                </button>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap items-center gap-1.5 text-[11px] shrink-0">
                <span className="text-slate-400 font-mono mr-1 hidden sm:inline">কুইক সিলেক্ট:</span>
                <button
                  type="button"
                  onClick={() => setDatePreset('today')}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-cyan-500/20 hover:text-cyan-300 hover:border-cyan-500/30 text-slate-300 border border-white/10 transition-all font-medium cursor-pointer"
                >
                  আজ
                </button>
                <button
                  type="button"
                  onClick={() => setDatePreset('7days')}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-cyan-500/20 hover:text-cyan-300 hover:border-cyan-500/30 text-slate-300 border border-white/10 transition-all font-medium cursor-pointer"
                >
                  গত ৭ দিন
                </button>
                <button
                  type="button"
                  onClick={() => setDatePreset('30days')}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-cyan-500/20 hover:text-cyan-300 hover:border-cyan-500/30 text-slate-300 border border-white/10 transition-all font-medium cursor-pointer"
                >
                  গত ৩০ দিন
                </button>
                <button
                  type="button"
                  onClick={() => setDatePreset('thisMonth')}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-cyan-500/20 hover:text-cyan-300 hover:border-cyan-500/30 text-slate-300 border border-white/10 transition-all font-medium cursor-pointer"
                >
                  এই মাস
                </button>
                <button
                  type="button"
                  onClick={() => setDatePreset('all')}
                  className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 transition-all font-medium cursor-pointer"
                >
                  সকল সময়
                </button>
              </div>
            </div>
          </div>
        </div>

        {loadingUsers ? (
          <div className="py-8 text-center text-slate-500 text-sm">স্টুডেন্টদের তালিকা লোড হচ্ছে...</div>
        ) : paginatedUserList.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs font-mono">
            কোনো স্টুডেন্ট পাওয়া যায়নি।
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/10 font-mono text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">নাম (Name)</th>
                    <th className="py-3 px-4">ইমেইল ও মোবাইল</th>
                    <th className="py-3 px-4">ট্রানজেকশন আইডি (TrxID)</th>
                    <th className="py-3 px-4">এনরোলকৃত কোর্স</th>
                    <th className="py-3 px-4">ইউজার রোল (Role)</th>
                    <th className="py-3 px-4">যোগদানের তারিখ</th>
                    <th className="py-3 px-4 text-right">অ্যাকশন (Actions)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                  {paginatedUserList.map(item => (
                    <tr key={item.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-white">{item.name}</td>
                      <td className="py-3.5 px-4 font-mono">
                        <div>{item.email}</div>
                        {item.phone && <div className="text-[11px] text-cyan-400 font-sans font-medium mt-0.5">📱 {item.phone}</div>}
                      </td>
                      <td className="py-3.5 px-4 font-mono">
                        {item.transactionId ? (
                          <div className="flex flex-col gap-1 max-w-[190px]">
                            <div className="bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[11px] font-bold px-2 py-1 rounded">
                              <span className="font-mono tracking-wider select-all truncate block" title={item.transactionId}>
                                💳 {item.transactionId}
                              </span>
                            </div>
                            {(item.paymentMethod || item.senderPhone) && (
                              <div className="text-[10px] text-slate-400 flex flex-wrap items-center gap-1">
                                {item.paymentMethod && (
                                  <span className="uppercase text-cyan-400 font-bold bg-cyan-500/10 px-1 rounded">
                                    {item.paymentMethod}
                                  </span>
                                )}
                                {item.senderPhone && (
                                  <span className="text-slate-300">
                                    📱 {item.senderPhone}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-500 text-[11px] italic">কোনো TrxID নেই</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-1.5 max-w-[240px]">
                          {item.enrolledCourseTitles && item.enrolledCourseTitles.length > 0 ? (
                            item.enrolledCourseTitles.map((title, idx) => {
                              const matchingCourse = coursesList.find(c => c.title.trim().toLowerCase() === title.trim().toLowerCase());
                              const priceDisplay = matchingCourse ? `৳${matchingCourse.price.toLocaleString('bn-BD')}` : 'নির্ধারিত';
                              return (
                                <div key={idx} className="bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-[11px] p-2 rounded-lg font-mono flex flex-col gap-0.5 shadow-sm">
                                  <span className="font-semibold text-white truncate">📚 {title}</span>
                                  <span className="text-[10px] text-amber-300 font-bold font-sans">
                                    কোর্স ফি: {priceDisplay}
                                  </span>
                                </div>
                              );
                            })
                          ) : (
                            <span className="text-slate-500 text-[11px] italic">কোনো কোর্স এনরোল করা নেই</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggleRole(item)}
                          title="রোল পরিবর্তন করতে ক্লিক করুন (Admin <-> Student)"
                          className="cursor-pointer transition-transform hover:scale-105"
                        >
                          {item.role === 'admin' ? (
                            <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center gap-1 w-fit hover:bg-rose-500/20">
                              <Shield className="w-3 h-3 text-rose-400" />
                              এডমিন
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded font-mono font-semibold text-[10px] uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/25 hover:bg-cyan-500/20">
                              স্টুডেন্ট
                            </span>
                          )}
                        </button>
                      </td>
                      <td className="py-3.5 px-4">
                        {new Date(item.createdAt).toLocaleDateString('bn-BD')}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleApproval(item)}
                            className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer border flex items-center gap-1 ${
                              item.isApproved
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                                : 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                            }`}
                            title={item.isApproved ? 'অনুমোদন বাতিল করতে ক্লিক করুন' : 'অনুমোদন দিতে ক্লিক করুন'}
                          >
                            {item.isApproved ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Approved (অনুমোদিত)</span>
                              </>
                            ) : (
                              <>
                                <Unlock className="w-3.5 h-3.5 text-amber-400" />
                                <span>Pending (অনুমোদন দিন)</span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => handleOpenDeleteModal(item)}
                            disabled={item.id === 'usr_admin'}
                            className={`p-1.5 rounded transition-all ${
                              item.id === 'usr_admin'
                                ? 'bg-slate-800 text-slate-600 border border-white/5 cursor-not-allowed opacity-50'
                                : 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 cursor-pointer border border-rose-500/20'
                            }`}
                            title={item.id === 'usr_admin' ? 'প্রধান এডমিন ডিলিট করা নিষিদ্ধ' : 'স্টুডেন্ট অ্যাকাউন্ট ডিলিট করুন'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bottom Pagination Bar */}
            {filteredUserList.length > 0 && userItemsPerPage !== 'all' && totalPages > 1 && (
              <div className="mt-5 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 font-mono">
                <div>
                  মোট <span className="text-cyan-400 font-bold">{totalUsersCount}</span> জনের মধ্যে{' '}
                  <span className="text-white font-bold">
                    {Math.min((userCurrentPage - 1) * (userItemsPerPage as number) + 1, totalUsersCount)} - {Math.min(userCurrentPage * (userItemsPerPage as number), totalUsersCount)}
                  </span>{' '}
                  জন দেখানো হচ্ছে
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setUserCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={userCurrentPage === 1}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>আগের</span>
                  </button>

                  <div className="flex items-center gap-1 mx-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                      <button
                        key={pageNum}
                        onClick={() => setUserCurrentPage(pageNum)}
                        className={`min-w-[28px] h-7 px-1.5 rounded-lg font-bold transition-all text-xs flex items-center justify-center cursor-pointer ${
                          userCurrentPage === pageNum
                            ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                            : 'bg-slate-900 border border-white/10 text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        পেইজ {pageNum}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setUserCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={userCurrentPage === totalPages}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <span>পরের</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
        </div>
      )}

      {/* Grid Row: Course Publisher Form */}
      {activeTab === 'dashboard' && dashSubTab === 'courses' && (
        <div className="space-y-8 animate-fade-in w-full">
            {/* Form to Add / Publish New Course */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl w-full">
              <div className="flex items-center gap-2 text-violet-400 mb-6 pb-2 border-b border-white/10">
                <BookOpen className="w-5 h-5 text-violet-400" />
                <h3 className="font-display font-bold text-lg text-white">নতুন কোর্স পাবলিশ করুন (Publish New Course)</h3>
              </div>

              {courseSuccess && (
                <div className="flex items-center gap-2 p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-lg mb-6">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>{courseSuccess}</span>
                </div>
              )}

              {courseError && (
                <div className="flex items-center gap-2 p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-lg mb-6">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{courseError}</span>
                </div>
              )}

              <form onSubmit={handleCreateCourse} className="space-y-4 text-xs text-slate-300">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">কোর্সের নাম / টাইটেল (Title) *</label>
                    <input
                      type="text"
                      required
                      value={courseTitle}
                      onChange={(e) => setCourseTitle(e.target.value)}
                      placeholder="e.g. পদার্থবিজ্ঞান ১ম পত্র: স্পেশাল মাস্টারব্যাচ ২০২৬"
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-cyan-400 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">বিষয় (Subject) *</label>
                    <select
                      value={courseSubject}
                      onChange={(e) => setCourseSubject(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-white focus:border-cyan-400 outline-none"
                    >
                      {subjects.map((sub, sidx) => (
                        <option key={sidx} value={sub}>{sub}</option>
                      ))}
                      {subjects.length === 0 && (
                        <>
                          <option value="Physics">Physics (পদার্থবিজ্ঞান)</option>
                          <option value="Chemistry">Chemistry (রসায়ন)</option>
                          <option value="Biology">Biology (জীববিজ্ঞান)</option>
                          <option value="Mathematics">Mathematics (উচ্চতর গণিত)</option>
                          <option value="General Science">General Science (সাধারণ বিজ্ঞান)</option>
                        </>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">ক্লাস / শ্রেণি (Class / Level) *</label>
                    <select
                      value={courseClassLevel}
                      onChange={(e) => setCourseClassLevel(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-white focus:border-cyan-400 outline-none"
                    >
                      {classLevels.map((lvl, lidx) => (
                        <option key={lidx} value={lvl}>{lvl}</option>
                      ))}
                      {classLevels.length === 0 && (
                        <>
                          <option value="HSC">এইচএসসি / একাদশ-দ্বাদশ (HSC)</option>
                          <option value="HSC 1st Year">এইচএসসি ১ম বর্ষ (HSC 1st Year)</option>
                          <option value="HSC 2nd Year">এইচএসসি ২য় বর্ষ (HSC 2nd Year)</option>
                          <option value="Class 9-10 (SSC)">নবম-দশম শ্রেণি / এসএসসি (SSC/9-10)</option>
                          <option value="Class 10">দশম শ্রেণি (Class 10)</option>
                          <option value="Class 9">নবম শ্রেণি (Class 9)</option>
                          <option value="Class 8">অষ্টম শ্রেণি (Class 8)</option>
                          <option value="Admission Test">এডমিশন টেস্ট (Admission Test)</option>
                        </>
                      )}
                      <option value="Custom">অন্যান্য / কাস্টম শ্রেণি (Custom)...</option>
                    </select>
                  </div>
                </div>

                {courseClassLevel === 'Custom' && (
                  <div className="p-3 bg-white/5 border border-white/10 rounded-xl animate-fade-in">
                    <label className="block text-cyan-300 font-semibold mb-1 text-[11px]">কাস্টম শ্রেণি বা ব্যাচের নাম লিখুন (Custom Class/Batch):</label>
                    <input
                      type="text"
                      required={courseClassLevel === 'Custom'}
                      value={customClassLevel}
                      onChange={(e) => setCustomClassLevel(e.target.value)}
                      placeholder="e.g. HSC 2026 Crash Course / Olympiad Batch"
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-white focus:border-cyan-400 outline-none text-xs"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">কোর্স ফি (Price BDT) *</label>
                    <input
                      type="number"
                      required
                      placeholder="1500"
                      value={coursePrice}
                      onChange={(e) => setCoursePrice(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-cyan-400 outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">পূর্বের ফি / ডিসকাউন্ট (Original Price BDT)</label>
                    <input
                      type="number"
                      placeholder="2000"
                      value={courseOriginalPrice}
                      onChange={(e) => setCourseOriginalPrice(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-cyan-400 outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">মেয়াদ / সময়কাল (Duration / Batch)</label>
                    <input
                      type="text"
                      placeholder="e.g. ৩ মাস (৫০+ ক্লাস)"
                      value={courseDuration}
                      onChange={(e) => setCourseDuration(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-cyan-400 outline-none"
                    />
                    {courseDurations && courseDurations.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        <span className="text-[10px] text-slate-400 font-mono self-center">সেটিংস টেমপ্লেট:</span>
                        {courseDurations.map((durOption, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setCourseDuration(durOption)}
                            className="text-[10px] bg-white/5 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-white/10 px-2 py-0.5 rounded cursor-pointer transition-all"
                            title="মেয়াদ সিলেক্ট করতে ক্লিক করুন"
                          >
                            + {durOption}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Course Cover Image: URL Link or Direct File Upload */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-slate-300 font-semibold text-xs">
                      কভার ছবি (Cover Image)
                    </label>
                    <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/10 text-[11px]">
                      <button
                        type="button"
                        onClick={() => setCourseImageMode('file')}
                        className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                          courseImageMode === 'file'
                            ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30 shadow'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        সরাসরি আপলোড (Upload File)
                      </button>
                      <button
                        type="button"
                        onClick={() => setCourseImageMode('link')}
                        className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                          courseImageMode === 'link'
                            ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30 shadow'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        ছবির লিঙ্ক (URL Link)
                      </button>
                    </div>
                  </div>

                  {courseImageMode === 'link' ? (
                    <div className="space-y-2">
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/photo-..."
                        value={courseImageUrl}
                        onChange={(e) => setCourseImageUrl(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-cyan-400 outline-none font-mono text-xs"
                      />
                      {courseImageUrl && (
                        <div className="flex items-center justify-between gap-3 p-2 bg-slate-950 border border-cyan-500/30 rounded-xl">
                          <div className="flex items-center gap-3 overflow-hidden text-left">
                            <img src={courseImageUrl} alt="Preview" className="w-12 h-12 object-cover rounded-lg shrink-0 border border-white/10" />
                            <div className="text-xs truncate">
                              <span className="text-emerald-400 font-bold block flex items-center gap-1">
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 inline" /> লিঙ্ক যুক্ত হয়েছে
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono truncate block">{courseImageUrl}</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setCourseImageUrl('')}
                            className="px-2.5 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-[10px] font-bold rounded border border-rose-500/30 cursor-pointer shrink-0"
                          >
                            রিমুভ
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div
                      onDragOver={(e) => { e.preventDefault(); setIsDragOverCourseImg(true); }}
                      onDragLeave={() => setIsDragOverCourseImg(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDragOverCourseImg(false);
                        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                          handleCourseImageFileChange(e.dataTransfer.files[0]);
                        }
                      }}
                      className={`border-2 border-dashed rounded-xl p-3.5 text-center transition-all ${
                        isDragOverCourseImg
                          ? 'border-cyan-400 bg-cyan-500/10'
                          : 'border-white/15 bg-white/5 hover:bg-white/10 hover:border-white/25'
                      }`}
                    >
                      <input
                        type="file"
                        id="courseImageFileInput"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleCourseImageFileChange(e.target.files[0]);
                          }
                        }}
                        className="hidden"
                      />

                      {courseImageUrl ? (
                        <div className="flex items-center justify-between gap-3 p-1">
                          <div className="flex items-center gap-3 overflow-hidden text-left">
                            <img 
                              src={courseImageUrl} 
                              alt="Cover Preview" 
                              className="w-16 h-12 object-cover rounded-lg border border-cyan-400/40 shrink-0 shadow-md"
                            />
                            <div className="text-xs truncate">
                              <span className="text-cyan-300 font-bold block flex items-center gap-1">
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 inline" /> কভার ছবি আপলোড সফল!
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono truncate block mt-0.5">
                                {courseImageUrl.startsWith('data:') ? 'Local Image File (Base64)' : courseImageUrl}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                document.getElementById('courseImageFileInput')?.click();
                              }}
                              className="px-2 py-1 rounded-md bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/30 text-[10px] font-bold transition-colors cursor-pointer"
                            >
                              পরিবর্তন
                            </button>
                            <button
                              type="button"
                              onClick={() => setCourseImageUrl('')}
                              className="px-2 py-1 rounded-md bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/30 text-[10px] font-bold transition-colors cursor-pointer"
                            >
                              রিমুভ
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label htmlFor="courseImageFileInput" className="cursor-pointer space-y-1 block py-1">
                          <Upload className="w-6 h-6 text-cyan-400 mx-auto" />
                          <p className="text-xs font-semibold text-slate-200">
                            কভার ছবি ড্রাগ করে ছেড়ে দিন অথবা ফাইল সিলেক্ট করতে ক্লিক করুন
                          </p>
                          <p className="text-[10px] text-slate-400">
                            JPG, PNG, WEBP বা GIF ফাইল সাপোর্টেড
                          </p>
                        </label>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">কোর্সের বিবরণ (Description)</label>
                  <textarea
                    rows={3}
                    placeholder="কোর্স সম্পর্কিত বিস্তারিত তথ্য লিখুন..."
                    value={courseDescription}
                    onChange={(e) => setCourseDescription(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-cyan-400 outline-none resize-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-slate-300 font-semibold text-xs">কোর্সের বৈশিষ্ট্যসমূহ (Features - প্রতি লাইনে একটি)</label>
                    {defaultCourseFeatures && defaultCourseFeatures.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          const combined = defaultCourseFeatures.join('\n');
                          setCourseFeatures(courseFeatures ? `${courseFeatures}\n${combined}` : combined);
                        }}
                        className="text-[10px] text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 px-2 py-0.5 rounded border border-cyan-500/20 transition-all font-semibold cursor-pointer"
                        title="সেটিংসের সকল ডিফল্ট ফিচার এক ক্লিকে ফর্ম-এ যুক্ত করুন"
                      >
                        + সেটিংসের সকল ফিচার যোগ করুন
                      </button>
                    )}
                  </div>
                  <textarea
                    rows={4}
                    placeholder={"৫০+ ইন্টারেক্টিভ ভিডিও ক্লাস\nঅধ্যায়ভিত্তিক সাজানো PDF শিট\nসাপ্তাহিক অনলাইন পরীক্ষা\n২৪/৭ ডাউট সলভিং মেন্টরশিপ"}
                    value={courseFeatures}
                    onChange={(e) => setCourseFeatures(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-cyan-400 outline-none font-sans resize-none text-xs"
                  />
                  {defaultCourseFeatures && defaultCourseFeatures.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      <span className="text-[10px] text-slate-400 font-mono self-center">এক ক্লিকে যোগ করুন:</span>
                      {defaultCourseFeatures.map((featOption, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            if (courseFeatures.includes(featOption)) return;
                            setCourseFeatures(courseFeatures ? `${courseFeatures}\n${featOption}` : featOption);
                          }}
                          className="text-[10px] bg-white/5 hover:bg-violet-500/20 text-slate-300 hover:text-violet-300 border border-white/10 px-2 py-0.5 rounded cursor-pointer transition-all"
                        >
                          + {featOption}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={courseLoading}
                    className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold flex items-center gap-2 transition-all cursor-pointer shadow-[0_0_15px_rgba(139,92,246,0.3)] disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                    {courseLoading ? 'পাবলিশ হচ্ছে...' : 'কোর্স পাবলিশ করুন (Publish Course)'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      {/* Course Overview Tab Panel */}
      {activeTab === 'course-overview' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Header Banner */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-cyan-950/80 to-purple-950/80 border border-cyan-500/30 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400">
                  <Layers className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-display font-bold text-white">
                    কোর্স ওভারভিউ ও রিসোর্স সেন্টার (Course Overview)
                  </h2>
                  <p className="text-xs text-slate-300">
                    আপনার আপলোডকৃত বিষয়ভিত্তিক ভিডিও ক্লাস ও পিডিএফ লেকচার শিটসমূহ কোর্স অনুযায়ী নিচে ক্যাটাগরাইজড করা হয়েছে।
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Stat Pill */}
            <div className="flex items-center gap-3 shrink-0 bg-white/5 border border-white/10 p-3 rounded-xl text-xs font-mono">
              <div className="text-center px-2">
                <span className="block text-cyan-400 font-bold text-base">{coursesList.length}</span>
                <span className="text-[10px] text-slate-400">কোর্স</span>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="text-center px-2">
                <span className="block text-emerald-400 font-bold text-base">{classes.length}</span>
                <span className="text-[10px] text-slate-400">ভিডিও</span>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="text-center px-2">
                <span className="block text-purple-400 font-bold text-base">{notes.length}</span>
                <span className="text-[10px] text-slate-400">পিডিএফ</span>
              </div>
            </div>
          </div>

          {/* Filter Toolbar */}
          <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-xl grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
            
            {/* Search Box */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="টাইটেল দিয়ে খুঁজুন..."
                value={overviewSearchQuery}
                onChange={(e) => setOverviewSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 text-white placeholder-slate-500 focus:border-cyan-400 outline-none"
              />
              {overviewSearchQuery && (
                <button
                  onClick={() => setOverviewSearchQuery('')}
                  className="absolute right-3 top-3 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Course Filter */}
            <div>
              <select
                value={overviewCourseId}
                onChange={(e) => setOverviewCourseId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white font-medium focus:border-cyan-400 outline-none cursor-pointer"
              >
                <option value="all">📚 সকল কোর্স (All Courses)</option>
                {coursesList.map((c) => (
                  <option key={c.id} value={c.id}>
                    📖 {c.title} ({c.subject})
                  </option>
                ))}
                <option value="general">🌐 সাধারণ ক্লাস (General / No Course)</option>
              </select>
            </div>

            {/* Subject Filter */}
            <div>
              <select
                value={overviewSubject}
                onChange={(e) => setOverviewSubject(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white font-medium focus:border-cyan-400 outline-none cursor-pointer"
              >
                <option value="all">🔬 সকল বিষয় (All Subjects)</option>
                {subjects.map((sub, sidx) => (
                  <option key={sidx} value={sub}>{sub}</option>
                ))}
              </select>
            </div>

            {/* Content Type Filter Toggle */}
            <div className="flex bg-slate-900 p-1 rounded-xl border border-white/10 font-medium text-[11px]">
              <button
                onClick={() => setOverviewContentType('all')}
                className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                  overviewContentType === 'all'
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_10px_rgba(34,211,238,0.3)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                সকল
              </button>
              <button
                onClick={() => setOverviewContentType('video')}
                className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                  overviewContentType === 'video'
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_10px_rgba(34,211,238,0.3)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                📹 ভিডিও ({classes.length})
              </button>
              <button
                onClick={() => setOverviewContentType('pdf')}
                className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                  overviewContentType === 'pdf'
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_10px_rgba(34,211,238,0.3)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                📄 পিডিএফ ({notes.length})
              </button>
            </div>

          </div>

          {/* Grouped Courses & Materials */}
          <div className="space-y-8">
            {/* Display list of courses */}
            {coursesList
              .filter(course => {
                if (overviewCourseId !== 'all' && overviewCourseId !== 'general' && course.id !== overviewCourseId) return false;
                if (overviewSubject !== 'all' && course.subject !== overviewSubject) return false;
                return true;
              })
              .map(course => {
                // Get classes & notes for this course
                const courseClasses = classes.filter(cls => {
                  const matchCourse = cls.courseId === course.id || cls.courseTitle === course.title;
                  const matchSubject = overviewSubject === 'all' || cls.subject === overviewSubject;
                  const matchQuery = !overviewSearchQuery || cls.title.toLowerCase().includes(overviewSearchQuery.toLowerCase()) || cls.description.toLowerCase().includes(overviewSearchQuery.toLowerCase());
                  return matchCourse && matchSubject && matchQuery;
                });

                const courseNotes = notes.filter(note => {
                  const matchCourse = note.courseId === course.id || note.courseTitle === course.title;
                  const matchSubject = overviewSubject === 'all' || note.subject === overviewSubject;
                  const matchQuery = !overviewSearchQuery || note.title.toLowerCase().includes(overviewSearchQuery.toLowerCase()) || note.description.toLowerCase().includes(overviewSearchQuery.toLowerCase());
                  return matchCourse && matchSubject && matchQuery;
                });

                const showVideos = overviewContentType === 'all' || overviewContentType === 'video';
                const showPdfs = overviewContentType === 'all' || overviewContentType === 'pdf';

                const totalItemsCount = (showVideos ? courseClasses.length : 0) + (showPdfs ? courseNotes.length : 0);

                if (totalItemsCount === 0 && (overviewCourseId !== 'all' || overviewSearchQuery)) {
                  return null;
                }

                return (
                  <div key={course.id} className="p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl space-y-6">
                    {/* Course Header Bar */}
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={course.imageUrl || 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=800&auto=format&fit=crop&q=80'} 
                          alt={course.title}
                          className="w-14 h-14 rounded-xl object-cover border border-cyan-500/30 shrink-0 shadow-lg"
                        />
                        <div>
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-mono font-bold uppercase">{course.subject}</span>
                            {course.classLevel && (
                              <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px] font-mono font-bold">{course.classLevel}</span>
                            )}
                          </div>
                          <h3 className="font-display font-bold text-base text-white">{course.title}</h3>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs font-mono flex-wrap">
                        <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-300 flex items-center gap-1.5">
                          <Video className="w-3.5 h-3.5 text-blue-400" />
                          <span>{courseClasses.length} ভিডিও</span>
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-300 flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-purple-400" />
                          <span>{courseNotes.length} পিডিএফ</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleOpenDeleteCourseModal(course)}
                          className="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 flex items-center gap-1.5 font-bold cursor-pointer transition-colors"
                          title="এই সম্পূর্ণ কোর্সটি ডিলিট করুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>কোর্স ডিলিট</span>
                        </button>
                      </div>
                    </div>

                    {/* Course Materials Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      
                      {/* Video Classes Column */}
                      {showVideos && (
                        <div className="space-y-3">
                          <h4 className="text-xs font-mono uppercase text-cyan-400 font-bold tracking-wider flex items-center gap-2 border-b border-white/5 pb-2">
                            <Video className="w-4 h-4 text-cyan-400" />
                            ভিডিও ক্লাস ({courseClasses.length})
                          </h4>

                          {courseClasses.length === 0 ? (
                            <div className="p-4 bg-slate-900/40 rounded-xl border border-white/5 text-slate-500 text-xs text-center italic">
                              এই কোর্সে কোনো ভিডিও ক্লাস আপলোড করা হয়নি।
                            </div>
                          ) : (
                            <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
                              {courseClasses.map(cls => (
                                <div key={cls.id} className="p-3.5 bg-slate-900/80 rounded-xl border border-white/10 hover:border-cyan-500/30 transition-all flex items-start justify-between gap-3 group">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <span className="bg-cyan-500/10 text-cyan-300 px-1.5 py-0.5 rounded text-[9px] font-mono uppercase font-bold">{cls.subject}</span>
                                      <span className="text-slate-500 text-[10px] font-mono">{cls.id}</span>
                                    </div>
                                    <h5 className="font-bold text-white text-xs line-clamp-1">{cls.title}</h5>
                                    {cls.description && (
                                      <p className="text-slate-400 text-[11px] line-clamp-1">{cls.description}</p>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <button
                                      onClick={() => setPreviewVideo(cls)}
                                      className="p-1.5 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-lg text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors"
                                      title="ভিডিও দেখুন"
                                    >
                                      <Play className="w-3.5 h-3.5 fill-cyan-400" />
                                      <span className="hidden sm:inline">প্লে</span>
                                    </button>
                                    <button
                                      onClick={() => handleOpenDeleteClassModal(cls)}
                                      className="p-1.5 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 rounded-lg cursor-pointer transition-colors"
                                      title="রিমুভ করুন"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* PDF Notes Column */}
                      {showPdfs && (
                        <div className="space-y-3">
                          <h4 className="text-xs font-mono uppercase text-purple-400 font-bold tracking-wider flex items-center gap-2 border-b border-white/5 pb-2">
                            <FileText className="w-4 h-4 text-purple-400" />
                            পিডিএফ লেকচার শিট ({courseNotes.length})
                          </h4>

                          {courseNotes.length === 0 ? (
                            <div className="p-4 bg-slate-900/40 rounded-xl border border-white/5 text-slate-500 text-xs text-center italic">
                              এই কোর্সে কোনো পিডিএফ শিট আপলোড করা হয়নি।
                            </div>
                          ) : (
                            <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
                              {courseNotes.map(note => (
                                <div key={note.id} className="p-3.5 bg-slate-900/80 rounded-xl border border-white/10 hover:border-purple-500/30 transition-all flex items-start justify-between gap-3 group">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <span className="bg-purple-500/10 text-purple-300 px-1.5 py-0.5 rounded text-[9px] font-mono uppercase font-bold">{note.subject}</span>
                                      <span className="text-slate-500 text-[10px] font-mono">{note.id}</span>
                                    </div>
                                    <h5 className="font-bold text-white text-xs line-clamp-1">{note.title}</h5>
                                    {note.description && (
                                      <p className="text-slate-400 text-[11px] line-clamp-1">{note.description}</p>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <button
                                      onClick={() => setPreviewPdf(note)}
                                      className="p-1.5 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 border border-purple-500/30 rounded-lg text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors"
                                      title="পিডিএফ দেখুন"
                                    >
                                      <Eye className="w-3.5 h-3.5" />
                                      <span className="hidden sm:inline">দেখুন</span>
                                    </button>
                                    <button
                                      onClick={() => downloadPdfFile(note.pdfUrl, note.title)}
                                      className="p-1.5 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-lg text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors"
                                      title="পিডিএফ ডাউনলোড করুন"
                                    >
                                      <Download className="w-3.5 h-3.5" />
                                      <span className="hidden sm:inline">ডাউনলোড</span>
                                    </button>
                                    <button
                                      onClick={() => handleOpenDeleteNoteModal(note)}
                                      className="p-1.5 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 rounded-lg cursor-pointer transition-colors"
                                      title="রিমুভ করুন"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                    </div>
                  </div>
                );
              })}

            {/* General Classes & Notes Section (Unassigned or General) */}
            {(overviewCourseId === 'all' || overviewCourseId === 'general') && (() => {
              const genClasses = classes.filter(cls => {
                if (cls.courseId) return false;
                const matchSubject = overviewSubject === 'all' || cls.subject === overviewSubject;
                const matchQuery = !overviewSearchQuery || cls.title.toLowerCase().includes(overviewSearchQuery.toLowerCase()) || cls.description.toLowerCase().includes(overviewSearchQuery.toLowerCase());
                return matchSubject && matchQuery;
              });

              const genNotes = notes.filter(note => {
                if (note.courseId) return false;
                const matchSubject = overviewSubject === 'all' || note.subject === overviewSubject;
                const matchQuery = !overviewSearchQuery || note.title.toLowerCase().includes(overviewSearchQuery.toLowerCase()) || note.description.toLowerCase().includes(overviewSearchQuery.toLowerCase());
                return matchSubject && matchQuery;
              });

              const showVideos = overviewContentType === 'all' || overviewContentType === 'video';
              const showPdfs = overviewContentType === 'all' || overviewContentType === 'pdf';

              if ((showVideos ? genClasses.length : 0) === 0 && (showPdfs ? genNotes.length : 0) === 0) {
                return null;
              }

              return (
                <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-cyan-500/20 shadow-2xl space-y-6">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400">
                        <Globe className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-base text-white">
                          সাধারণ / নির্দিষ্ট কোর্স ছাড়া কন্টেন্ট (General Classes & Notes)
                        </h3>
                        <p className="text-xs text-slate-400">যেসব ভিডিও বা পিডিএফ কোনো নির্দিষ্ট কোর্সে ট্যাগ করা হয়নি।</p>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-300 text-xs font-mono font-bold">
                      {genClasses.length + genNotes.length} টি আইটেম
                    </span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* General Videos */}
                    {showVideos && (
                      <div className="space-y-3">
                        <h4 className="text-xs font-mono uppercase text-cyan-400 font-bold tracking-wider flex items-center gap-2 border-b border-white/5 pb-2">
                          <Video className="w-4 h-4 text-cyan-400" />
                          সাধারণ ভিডিও ক্লাস ({genClasses.length})
                        </h4>
                        <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                          {genClasses.map(cls => (
                            <div key={cls.id} className="p-3.5 bg-slate-900/80 rounded-xl border border-white/10 flex items-start justify-between gap-3">
                              <div className="space-y-1">
                                <span className="bg-cyan-500/10 text-cyan-300 px-1.5 py-0.5 rounded text-[9px] font-mono uppercase font-bold">{cls.subject}</span>
                                <h5 className="font-bold text-white text-xs line-clamp-1">{cls.title}</h5>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  onClick={() => setPreviewVideo(cls)}
                                  className="p-1.5 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-lg text-xs cursor-pointer"
                                >
                                  <Play className="w-3.5 h-3.5 fill-cyan-400" />
                                </button>
                                <button
                                  onClick={() => handleOpenDeleteClassModal(cls)}
                                  className="p-1.5 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 rounded-lg cursor-pointer"
                                  title="রিমুভ করুন"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* General PDFs */}
                    {showPdfs && (
                      <div className="space-y-3">
                        <h4 className="text-xs font-mono uppercase text-purple-400 font-bold tracking-wider flex items-center gap-2 border-b border-white/5 pb-2">
                          <FileText className="w-4 h-4 text-purple-400" />
                          সাধারণ পিডিএফ শিট ({genNotes.length})
                        </h4>
                        <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                          {genNotes.map(note => (
                            <div key={note.id} className="p-3.5 bg-slate-900/80 rounded-xl border border-white/10 flex items-start justify-between gap-3">
                              <div className="space-y-1">
                                <span className="bg-purple-500/10 text-purple-300 px-1.5 py-0.5 rounded text-[9px] font-mono uppercase font-bold">{note.subject}</span>
                                <h5 className="font-bold text-white text-xs line-clamp-1">{note.title}</h5>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  onClick={() => setPreviewPdf(note)}
                                  className="p-1.5 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 border border-purple-500/30 rounded-lg text-xs cursor-pointer"
                                  title="পিডিএফ দেখুন"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => downloadPdfFile(note.pdfUrl, note.title)}
                                  className="p-1.5 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-lg text-xs cursor-pointer"
                                  title="পিডিএফ ডাউনলোড করুন"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleOpenDeleteNoteModal(note)}
                                  className="p-1.5 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 rounded-lg cursor-pointer"
                                  title="রিমুভ করুন"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

          </div>

          {/* Video Preview Modal */}
          {previewVideo && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
              <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl max-w-3xl w-full p-5 space-y-4 shadow-2xl relative">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-xs font-mono font-bold uppercase">{previewVideo.subject}</span>
                    <h3 className="text-sm font-bold text-white line-clamp-1">{previewVideo.title}</h3>
                  </div>
                  <button
                    onClick={() => setPreviewVideo(null)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center border border-white/10">
                  {(() => {
                    const embedUrl = formatVideoEmbedUrl(previewVideo.videoUrl);
                    const isIframe = isIframeVideoUrl(previewVideo.videoUrl);

                    if (isIframe) {
                      return (
                        <iframe
                          src={embedUrl}
                          className="w-full h-full border-0"
                          allowFullScreen
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        />
                      );
                    }

                    return (
                      <video
                        src={previewVideo.videoUrl}
                        controls
                        autoPlay
                        className="w-full h-full object-contain"
                      />
                    );
                  })()}
                </div>

                {previewVideo.description && (
                  <div className="text-xs text-slate-300 bg-white/5 p-3 rounded-xl">
                    <p className="font-semibold text-cyan-400 mb-1">লেকচার বিবরণ:</p>
                    <p className="leading-relaxed">{previewVideo.description}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PDF Preview Modal */}
          {previewPdf && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
              <div className="bg-slate-900 border border-purple-500/30 rounded-2xl max-w-2xl w-full p-5 space-y-4 shadow-2xl relative">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-xs font-mono font-bold uppercase">{previewPdf.subject}</span>
                    <h3 className="text-sm font-bold text-white line-clamp-1">{previewPdf.title}</h3>
                  </div>
                  <button
                    onClick={() => setPreviewPdf(null)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 bg-slate-950/80 border border-white/10 rounded-xl text-center space-y-4">
                  <FileText className="w-12 h-12 text-purple-400 mx-auto animate-pulse" />
                  <div>
                    <h4 className="text-sm font-bold text-white mb-1">{previewPdf.title}</h4>
                    <p className="text-xs text-slate-400 font-mono">আইডি: {previewPdf.id}</p>
                  </div>

                  <div className="flex flex-wrap justify-center gap-3 pt-2">
                    <button
                      onClick={() => openPdfInBrowser(previewPdf.pdfUrl)}
                      className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>পিডিএফ ব্রাউজারে দেখুন</span>
                    </button>
                    <button
                      onClick={() => downloadPdfFile(previewPdf.pdfUrl, previewPdf.title)}
                      className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                    >
                      <Download className="w-4 h-4" />
                      <span>ডাউনলোড করুন (Download PDF)</span>
                    </button>
                  </div>
                </div>

                {previewPdf.description && (
                  <div className="text-xs text-slate-300 bg-white/5 p-3 rounded-xl">
                    <p className="font-semibold text-purple-400 mb-1">শিটের বর্ণনা:</p>
                    <p className="leading-relaxed">{previewPdf.description}</p>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      )}

      {/* Settings Tab Panel */}
      {activeTab === 'dashboard' && dashSubTab === 'settings' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl w-full animate-fade-in">
          <div className="flex items-center gap-2 text-amber-400 mb-6 pb-2 border-b border-white/10">
            <SettingsIcon className="w-5 h-5 text-amber-400 animate-spin-slow" />
            <h3 className="font-display font-bold text-lg text-white">ওয়েবসাইটের স্ট্যাটিক সেটিংস পরিবর্তন (Settings)</h3>
          </div>

          {settingsSuccess && (
            <div className="flex items-center gap-2 p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-lg mb-6">
              <CheckCircle className="w-4 h-4 shrink-0 animate-bounce" />
              <span>{settingsSuccess}</span>
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="space-y-6 text-xs text-slate-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Academy Name */}
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1.5 font-semibold">প্রতিষ্ঠানের নাম (Academy Name)</label>
                <input
                  type="text"
                  required
                  value={academyName}
                  onChange={(e) => setAcademyName(e.target.value)}
                  placeholder="e.g. SCIENCE STUDIO by Sakib"
                  className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 focus:border-cyan-400 text-xs text-white outline-none"
                />
              </div>

              {/* Academy Logo Upload */}
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1.5 font-semibold flex items-center justify-between">
                  <span>একাডেমী লোগো (Academy Logo Upload / URL)</span>
                  {academyLogoUrl && (
                    <button
                      type="button"
                      onClick={() => setAcademyLogoUrl('')}
                      className="text-[10px] text-rose-400 hover:underline cursor-pointer"
                    >
                      লোগো রিমুভ
                    </button>
                  )}
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full border border-cyan-400/40 overflow-hidden bg-slate-900 shrink-0 flex items-center justify-center">
                    {academyLogoUrl ? (
                      <img src={academyLogoUrl} alt="Logo Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Atom className="w-5 h-5 text-cyan-400" />
                    )}
                  </div>
                  <div className="flex-1 flex gap-2">
                    <input
                      type="text"
                      value={academyLogoUrl}
                      onChange={(e) => setAcademyLogoUrl(e.target.value)}
                      placeholder="ইমেজ URL অথবা ফাইল ফাইল সিলেক্ট করুন"
                      className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-cyan-400 text-xs text-white outline-none font-mono"
                    />
                    <label className="px-3 py-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/30 text-cyan-300 font-bold text-xs cursor-pointer flex items-center gap-1 shrink-0 transition-all btn-shine">
                      <Upload className="w-3.5 h-3.5" />
                      <span>আপলোড</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              if (typeof reader.result === 'string') {
                                setAcademyLogoUrl(reader.result);
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Announcement Ticker & Header Badges Settings Card */}
              <div className="md:col-span-2 p-5 rounded-2xl bg-gradient-to-br from-amber-950/30 via-slate-900/70 to-slate-950/90 border border-amber-500/25 shadow-xl space-y-4">
                <div className="flex items-center gap-2.5 border-b border-amber-500/20 pb-3">
                  <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
                  <div>
                    <h3 className="text-xs font-mono text-amber-300 font-bold uppercase tracking-wider">
                      📢 স্ক্রল নোটিশ ও হেডার ব্যাজ সেটিংস (Announcement Ticker & Badges)
                    </h3>
                    <p className="text-[10px] text-slate-400">
                      ওয়েবসাইটের শীর্ষ হেডার নোটিশ ব্যাজ, মূল হিরো ব্যাজ এবং মারকি স্ক্রল নোটিশসমূহ পরিবর্তন করুন।
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-amber-300 mb-1.5 font-bold">
                      হিরো টপ ব্যাজ লেখা (Hero Badge Text)
                    </label>
                    <input
                      type="text"
                      value={heroBadgeText}
                      onChange={(e) => setHeroBadgeText(e.target.value)}
                      placeholder="e.g. প্রযুক্তিনির্ভর আধুনিক বিজ্ঞান একাডেমি • SCIENCE STUDIO"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-amber-500/30 focus:border-amber-400 text-xs text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-amber-300 mb-1.5 font-bold">
                      অ্যানাউন্সমেন্ট ব্যাজ লেখা (Announcement Badge Label)
                    </label>
                    <input
                      type="text"
                      value={announcementBadge}
                      onChange={(e) => setAnnouncementBadge(e.target.value)}
                      placeholder="e.g. নির্দেশনা ও নোটিশ"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-amber-500/30 focus:border-amber-400 text-xs text-white outline-none"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-mono text-slate-300 mb-1.5 font-semibold">
                      স্ক্রল নোটিশ ১ (Main Scrolling Notice 1) *
                    </label>
                    <input
                      type="text"
                      value={announcement}
                      onChange={(e) => setAnnouncement(e.target.value)}
                      placeholder="e.g. নতুন সেশন ২০২৬ ভর্তি চলছে! সীমিত আসনে ভর্তি হতে আজই যোগাযোগ করুন।"
                      className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-white/10 focus:border-amber-400 text-xs text-white outline-none"
                    />
                  </div>

                  <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 mb-1">স্ক্রল নোটিশ ২ (Marquee Notice 2)</label>
                      <input
                        type="text"
                        value={marqueeNotice2}
                        onChange={(e) => setMarqueeNotice2(e.target.value)}
                        placeholder="e.g. 🔬 ভার্চুয়াল ল্যাবে পদার্থ, রসায়ন, জীব ও গণিতের ৩ডি ইন্টারেক্টিভ সিমুলেশন ক্লাস উপলব্ধ।"
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/10 focus:border-amber-400 text-xs text-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 mb-1">স্ক্রল নোটিশ ৩ (Marquee Notice 3)</label>
                      <input
                        type="text"
                        value={marqueeNotice3}
                        onChange={(e) => setMarqueeNotice3(e.target.value)}
                        placeholder="e.g. 📅 প্রতি সপ্তাহের রুটিন অনুযায়ী অফলাইন ক্লাসরুম ও অনলাইন লাইভ সেশন অনুষ্ঠিত হয়।"
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/10 focus:border-amber-400 text-xs text-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 mb-1">স্ক্রল নোটিশ ৪ (Marquee Notice 4)</label>
                      <input
                        type="text"
                        value={marqueeNotice4}
                        onChange={(e) => setMarqueeNotice4(e.target.value)}
                        placeholder="e.g. 📚 প্রতিটি অধ্যায়ের প্র্যাকটিক্যাল হ্যান্ডনোট ও ফর্মুলা শিট ক্লাসরুম পোর্টাল থেকে ডাউনলোড করা যাবে।"
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/10 focus:border-amber-400 text-xs text-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 mb-1">স্ক্রল নোটিশ ৫ (Marquee Notice 5)</label>
                      <input
                        type="text"
                        value={marqueeNotice5}
                        onChange={(e) => setMarqueeNotice5(e.target.value)}
                        placeholder="e.g. ⚡ সার্বক্ষণিক ডাউট ক্লিয়ারিং ডেস্ক ও মেন্টরশিপের সুবিধা পেতে আপনার প্রোফাইল অ্যাক্টিভ রাখুন।"
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/10 focus:border-amber-400 text-xs text-white outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Hero Title */}
              <div className="md:col-span-2">
                <label className="block text-xs font-mono text-slate-400 mb-1.5 font-semibold">মূল ব্যানার শিরোনাম (Hero Main Title)</label>
                <input
                  type="text"
                  value={heroTitle}
                  onChange={(e) => setHeroTitle(e.target.value)}
                  placeholder="e.g. Innovate, Educate & Explore with Science Studio by Sakib"
                  className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 focus:border-cyan-400 text-xs text-white outline-none"
                />
              </div>

              {/* Hero Subtitle - Bangla */}
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1.5 font-semibold">মূল ব্যানার উপশিরোনাম - বাংলা (Hero Subtitle Bengali)</label>
                <textarea
                  rows={2}
                  value={heroSubtitle}
                  onChange={(e) => setHeroSubtitle(e.target.value)}
                  placeholder="বিজ্ঞান চর্চাকে সহজ, আনন্দদায়ক এবং প্রযুক্তিনির্ভর করতে সাকিব স্যারের এই বিশেষ উদ্যোগ..."
                  className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 focus:border-cyan-400 text-xs text-white outline-none resize-none"
                />
              </div>

              {/* Hero Subtitle - English */}
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1.5 font-semibold">মূল ব্যানার উপশিরোনাম - ইংরেজি (Hero Subtitle English)</label>
                <textarea
                  rows={2}
                  value={heroSubEnglish}
                  onChange={(e) => setHeroSubEnglish(e.target.value)}
                  placeholder="Experience premium science coaching with high-fidelity interactive simulation..."
                  className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 focus:border-cyan-400 text-xs text-white outline-none resize-none"
                />
              </div>

              {/* Hero Action Buttons Configuration */}
              <div className="md:col-span-2 p-5 rounded-2xl bg-gradient-to-br from-cyan-950/30 via-slate-900/60 to-slate-950/80 border border-cyan-500/25 shadow-xl space-y-4">
                <div className="flex items-center gap-2.5 border-b border-cyan-500/20 pb-3">
                  <Sparkles className="w-5 h-5 text-cyan-400 shrink-0" />
                  <div>
                    <h3 className="text-xs font-mono text-cyan-300 font-bold uppercase tracking-wider">
                      🎯 হিরো সেকশন বাটন ও অ্যাকশন টেক্সট (Hero CTA Buttons)
                    </h3>
                    <p className="text-[10px] text-slate-400">
                      লগইন না করা ভিজিটর এবং স্টুডেন্টদের জন্য মূল ব্যানারের অ্যাকশন বাটন টেক্সট কাস্টমাইজ করুন।
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-cyan-300 mb-1.5 font-bold">
                      ভর্তি/রেজিস্ট্রেশন বাটন টেক্সট (Join / Register Button)
                    </label>
                    <input
                      type="text"
                      value={heroJoinButtonText}
                      onChange={(e) => setHeroJoinButtonText(e.target.value)}
                      placeholder="e.g. ভর্তি হন / রেজিস্ট্রেশন করুন"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-cyan-500/30 focus:border-cyan-400 text-xs text-white outline-none"
                    />
                    <p className="text-[10px] text-cyan-400/80 mt-1">
                      ✓ এতে ক্লিক করলে সরাসরি ছাত্র-ছাত্রীদের রেজিস্ট্রেশন পেজ/পপআপ খুলবে।
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-cyan-300 mb-1.5 font-bold">
                      লগইনকৃত স্টুডেন্ট বাটন টেক্সট (Logged-in Classroom Button)
                    </label>
                    <input
                      type="text"
                      value={heroExploreButtonText}
                      onChange={(e) => setHeroExploreButtonText(e.target.value)}
                      placeholder="e.g. মাই ক্লাসরুম পোর্টালে যান"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-cyan-500/30 focus:border-cyan-400 text-xs text-white outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Course Orbit & Ecosystem Showcase Settings */}
              <div className="md:col-span-2 p-5 rounded-2xl bg-gradient-to-br from-blue-950/30 via-slate-900/60 to-slate-950/80 border border-blue-500/25 shadow-xl space-y-4">
                <div className="flex items-center gap-2.5 border-b border-blue-500/20 pb-3">
                  <Atom className="w-5 h-5 text-blue-400 shrink-0" />
                  <div>
                    <h3 className="text-xs font-mono text-blue-300 font-bold uppercase tracking-wider">
                      🪐 কোর্স অরবিট ও ইকোসিস্টেম শোকেস (Interactive Course Orbit Settings)
                    </h3>
                    <p className="text-[10px] text-slate-400">
                      আপনার আপলোড করা কোর্সসমূহ স্বয়ংক্রিয়ভাবে অরবিট অ্যানিমেশনে ঘুরবে। এই সেকশনের শিরোনাম ও টেক্সট নিয়ন্ত্রণ করুন।
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-blue-300 mb-1.5 font-bold">
                      সেকশন ব্যাজ টেক্সট (Orbit Badge Label)
                    </label>
                    <input
                      type="text"
                      value={orbitSectionBadge}
                      onChange={(e) => setOrbitSectionBadge(e.target.value)}
                      placeholder="e.g. ACADEMY SHOWCASE & INTERACTIVE ORBIT"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-blue-500/30 focus:border-blue-400 text-xs text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-blue-300 mb-1.5 font-bold">
                      সেকশন প্রধান শিরোনাম (Orbit Main Title)
                    </label>
                    <input
                      type="text"
                      value={orbitSectionTitle}
                      onChange={(e) => setOrbitSectionTitle(e.target.value)}
                      placeholder="e.g. সাকিব স্যারের পাবলিশড কোর্সসমূহ ও একাডেমি ইকোসিস্টেম"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-blue-500/30 focus:border-blue-400 text-xs text-white outline-none"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-mono text-blue-300 mb-1.5 font-bold">
                      সেকশন উপশিরোনাম (Orbit Section Subtitle)
                    </label>
                    <textarea
                      rows={2}
                      value={orbitSectionSubtitle}
                      onChange={(e) => setOrbitSectionSubtitle(e.target.value)}
                      placeholder="বিজ্ঞানকে ভিজ্যুয়াল ল্যাব ও আধুনিক প্রযুক্তির মাধ্যমে অনুধাবন করো..."
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-blue-500/30 focus:border-blue-400 text-xs text-white outline-none resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Academic Insights Dashboard Metrics Settings */}
              <div className="md:col-span-2 p-5 rounded-2xl bg-gradient-to-br from-emerald-950/30 via-slate-900/60 to-slate-950/80 border border-emerald-500/25 shadow-xl space-y-4">
                <div className="flex items-center gap-2.5 border-b border-emerald-500/20 pb-3">
                  <Activity className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <h3 className="text-xs font-mono text-emerald-300 font-bold uppercase tracking-wider">
                      📊 একাডেমিক ইনসাইটস ও স্ট্যাটিস্টিকস (Academic Insights & Stats Dashboard)
                    </h3>
                    <p className="text-[10px] text-slate-400">
                      অরবিট সেকশনের বাম পাশের লাইভ মেট্রিক্স, সাকসেস রেট এবং মূল হাইলাইটস পরিবর্তন করুন।
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono text-emerald-300 mb-1 font-bold">মোট স্টুডেন্ট সংখ্যা</label>
                    <input
                      type="text"
                      value={insightsTotalStudents}
                      onChange={(e) => setInsightsTotalStudents(e.target.value)}
                      placeholder="১,৪৫০+"
                      className="w-full px-3 py-2 rounded bg-slate-900 border border-emerald-500/30 text-xs text-white outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono text-emerald-300 mb-1 font-bold">সক্রিয়তার হার</label>
                    <input
                      type="text"
                      value={insightsActivePercent}
                      onChange={(e) => setInsightsActivePercent(e.target.value)}
                      placeholder="↑ ৯৮% সক্রিয়"
                      className="w-full px-3 py-2 rounded bg-slate-900 border border-emerald-500/30 text-xs text-white outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono text-emerald-300 mb-1 font-bold">সাকসেস রেট (%)</label>
                    <input
                      type="text"
                      value={insightsSuccessRate}
                      onChange={(e) => setInsightsSuccessRate(e.target.value)}
                      placeholder="৯৯.২%"
                      className="w-full px-3 py-2 rounded bg-slate-900 border border-emerald-500/30 text-xs text-white outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono text-emerald-300 mb-1 font-bold">সাকসেস লেবেল</label>
                    <input
                      type="text"
                      value={insightsSuccessRateLabel}
                      onChange={(e) => setInsightsSuccessRateLabel(e.target.value)}
                      placeholder="প্লাস পাওয়ার হার"
                      className="w-full px-3 py-2 rounded bg-slate-900 border border-emerald-500/30 text-xs text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono text-emerald-300 mb-1 font-bold">মোট পাবলিশড কোর্স</label>
                    <input
                      type="text"
                      value={insightsTotalCourses}
                      onChange={(e) => setInsightsTotalCourses(e.target.value)}
                      placeholder="১৪+"
                      className="w-full px-3 py-2 rounded bg-slate-900 border border-emerald-500/30 text-xs text-white outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono text-emerald-300 mb-1 font-bold">মোট লেকচার শিট PDF</label>
                    <input
                      type="text"
                      value={insightsTotalNotes}
                      onChange={(e) => setInsightsTotalNotes(e.target.value)}
                      placeholder="৩৫০+"
                      className="w-full px-3 py-2 rounded bg-slate-900 border border-emerald-500/30 text-xs text-white outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-white/5">
                  <span className="text-[11px] font-mono text-emerald-300 font-bold block">একাডেমিক ইনসাইটসের ৩টি হাইলাইটস বুলেট:</span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input
                      type="text"
                      value={insightsBullet1}
                      onChange={(e) => setInsightsBullet1(e.target.value)}
                      placeholder="বুলেট ১: সাকিব স্যারের নিজস্ব থ্রিডি ল্যাব"
                      className="w-full px-3 py-2 rounded bg-slate-900 border border-white/10 text-xs text-white outline-none"
                    />
                    <input
                      type="text"
                      value={insightsBullet2}
                      onChange={(e) => setInsightsBullet2(e.target.value)}
                      placeholder="বুলেট ২: ২৪/৭ ডাউট সলভ মেন্টরশিপ"
                      className="w-full px-3 py-2 rounded bg-slate-900 border border-white/10 text-xs text-white outline-none"
                    />
                    <input
                      type="text"
                      value={insightsBullet3}
                      onChange={(e) => setInsightsBullet3(e.target.value)}
                      placeholder="বুলেট ৩: এইচএসসি মডেল টেস্ট"
                      className="w-full px-3 py-2 rounded bg-slate-900 border border-white/10 text-xs text-white outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Leadership & Pedagogy Pillars Settings */}
              <div className="md:col-span-2 p-5 rounded-2xl bg-gradient-to-br from-purple-950/30 via-slate-900/60 to-slate-950/80 border border-purple-500/25 shadow-xl space-y-4">
                <div className="flex items-center gap-2.5 border-b border-purple-500/20 pb-3">
                  <Shield className="w-5 h-5 text-purple-400 shrink-0" />
                  <div>
                    <h3 className="text-xs font-mono text-purple-300 font-bold uppercase tracking-wider">
                      🏛️ মেন্টরশিপ ও পেডাগজি পিলার্স সেটিংস (Leadership & 3 Pillars)
                    </h3>
                    <p className="text-[10px] text-slate-400">
                      ল্যান্ডিং পেজের নিচের "মেন্টরশিপের মূল স্তম্ভসমূহ" সেকশনের বিবরণ ও ৩টি কার্ডের লেখা পরিবর্তন করুন।
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono text-purple-300 mb-1 font-bold">পিলার্স সেকশন ব্যাজ</label>
                    <input
                      type="text"
                      value={pillarsSectionBadge}
                      onChange={(e) => setPillarsSectionBadge(e.target.value)}
                      placeholder="LEADERSHIP & PEDAGOGY PILLARS"
                      className="w-full px-3 py-2 rounded bg-slate-900 border border-purple-500/30 text-xs text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono text-purple-300 mb-1 font-bold">পিলার্স সেকশন শিরোনাম</label>
                    <input
                      type="text"
                      value={pillarsSectionTitle}
                      onChange={(e) => setPillarsSectionTitle(e.target.value)}
                      placeholder="সাকিব স্যারের একাডেমি ও মেন্টরশিপের মূল স্তম্ভসমূহ"
                      className="w-full px-3 py-2 rounded bg-slate-900 border border-purple-500/30 text-xs text-white outline-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-mono text-purple-300 mb-1 font-bold">পিলার্স সেকশন উপশিরোনাম</label>
                    <textarea
                      rows={2}
                      value={pillarsSectionSubtitle}
                      onChange={(e) => setPillarsSectionSubtitle(e.target.value)}
                      placeholder="ব্যক্তিগত যত্ন, আধুনিক প্রযুক্তি এবং নিরবচ্ছিন্ন নির্দেশনার মাধ্যমে প্রতিটি শিক্ষার্থীকে..."
                      className="w-full px-3 py-2 rounded bg-slate-900 border border-purple-500/30 text-xs text-white outline-none resize-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  {/* Pillar 1 */}
                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-cyan-500/30 space-y-2">
                    <span className="text-xs font-mono font-bold text-cyan-300 block">১ম স্তম্ভ (Pillar 1)</span>
                    <input
                      type="text"
                      value={pillar1Title}
                      onChange={(e) => setPillar1Title(e.target.value)}
                      placeholder="ইন্টারেক্টিভ ভিডিও ও সিমুলেশন ক্লাস"
                      className="w-full px-2.5 py-1.5 rounded bg-black/40 border border-white/10 text-xs text-white outline-none"
                    />
                    <input
                      type="text"
                      value={pillar1Badge}
                      onChange={(e) => setPillar1Badge(e.target.value)}
                      placeholder="3D LAB RECORDED"
                      className="w-full px-2.5 py-1.5 rounded bg-black/40 border border-white/10 text-xs text-cyan-300 font-mono outline-none"
                    />
                    <textarea
                      rows={3}
                      value={pillar1Description}
                      onChange={(e) => setPillar1Description(e.target.value)}
                      placeholder="যেকোনো জটিল বৈজ্ঞানিক টপিক সহজে ভিজ্যুয়ালাইজ করার জন্য..."
                      className="w-full px-2.5 py-1.5 rounded bg-black/40 border border-white/10 text-xs text-slate-300 outline-none resize-none"
                    />
                  </div>

                  {/* Pillar 2 */}
                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-emerald-500/30 space-y-2">
                    <span className="text-xs font-mono font-bold text-emerald-300 block">২য় স্তম্ভ (Pillar 2)</span>
                    <input
                      type="text"
                      value={pillar2Title}
                      onChange={(e) => setPillar2Title(e.target.value)}
                      placeholder="অধ্যায়ভিত্তিক PDF নোট ও ফর্মুলা বুক"
                      className="w-full px-2.5 py-1.5 rounded bg-black/40 border border-white/10 text-xs text-white outline-none"
                    />
                    <input
                      type="text"
                      value={pillar2Badge}
                      onChange={(e) => setPillar2Badge(e.target.value)}
                      placeholder="৩৫+ শিট"
                      className="w-full px-2.5 py-1.5 rounded bg-black/40 border border-white/10 text-xs text-emerald-300 font-mono outline-none"
                    />
                    <textarea
                      rows={3}
                      value={pillar2Description}
                      onChange={(e) => setPillar2Description(e.target.value)}
                      placeholder="পরীক্ষার দ্রুত ও নির্ভুল রিভিশনের জন্য প্রতিটি অধ্যায়ের শেষে..."
                      className="w-full px-2.5 py-1.5 rounded bg-black/40 border border-white/10 text-xs text-slate-300 outline-none resize-none"
                    />
                  </div>

                  {/* Pillar 3 */}
                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-purple-500/30 space-y-2">
                    <span className="text-xs font-mono font-bold text-purple-300 block">৩য় স্তম্ভ (Pillar 3)</span>
                    <input
                      type="text"
                      value={pillar3Title}
                      onChange={(e) => setPillar3Title(e.target.value)}
                      placeholder="২৪/৭ মেন্টর সাপোর্ট ও ডাউট সলভ ডেস্ক"
                      className="w-full px-2.5 py-1.5 rounded bg-black/40 border border-white/10 text-xs text-white outline-none"
                    />
                    <input
                      type="text"
                      value={pillar3Badge}
                      onChange={(e) => setPillar3Badge(e.target.value)}
                      placeholder="LIVE ASSISTANCE"
                      className="w-full px-2.5 py-1.5 rounded bg-black/40 border border-white/10 text-xs text-purple-300 font-mono outline-none"
                    />
                    <textarea
                      rows={3}
                      value={pillar3Description}
                      onChange={(e) => setPillar3Description(e.target.value)}
                      placeholder="পড়ালেখার যেকোনো অস্পষ্টতায় সরাসরি প্রশ্ন করার সুযোগ..."
                      className="w-full px-2.5 py-1.5 rounded bg-black/40 border border-white/10 text-xs text-slate-300 outline-none resize-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/5">
                  <div>
                    <label className="block text-[11px] font-mono text-purple-300 mb-1 font-bold">মেন্টরশিপ অভিজ্ঞতা টেক্সট</label>
                    <input
                      type="text"
                      value={mentorExperience}
                      onChange={(e) => setMentorExperience(e.target.value)}
                      placeholder="১০+ বছরের অভিজ্ঞতা"
                      className="w-full px-3 py-2 rounded bg-slate-900 border border-purple-500/30 text-xs text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono text-purple-300 mb-1 font-bold">মেন্টরশিপ গাইডেন্স টেক্সট</label>
                    <input
                      type="text"
                      value={mentorGuidance}
                      onChange={(e) => setMentorGuidance(e.target.value)}
                      placeholder="১০০% পার্সোনাল গাইডেন্স"
                      className="w-full px-3 py-2 rounded bg-slate-900 border border-purple-500/30 text-xs text-white outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Info & Helpline Settings Card */}
              <div className="md:col-span-2 p-5 rounded-2xl bg-gradient-to-br from-cyan-950/40 via-slate-900/80 to-slate-950 border border-cyan-500/30 shadow-xl space-y-4">
                <div className="flex items-center gap-2.5 border-b border-cyan-500/20 pb-3">
                  <Phone className="w-5 h-5 text-cyan-400 shrink-0" />
                  <div>
                    <h3 className="text-xs font-mono text-cyan-300 font-bold uppercase tracking-wider">
                      📞 হেল্পলাইন ও কন্টাক্ট ইনফরমেশন সেটিংস (Helpline & Support Settings)
                    </h3>
                    <p className="text-[10px] text-slate-300">
                      ওয়েবসাইটের লাইভ অ্যানাউন্সমেন্ট বার, হেডার এবং হেল্পলাইন মডালে প্রদর্শিত মোবাইল নম্বর ও ঠিকানা ম্যানেজ করুন।
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-cyan-300 mb-1.5 font-bold">
                      হেল্পলাইন মোবাইল নম্বর (Helpline Contact Phone) *
                    </label>
                    <input
                      type="text"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="e.g. +৮৮০ ১৭০০-০০০০০০, +৮৮০ ১৯০০-০০০০০০"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-cyan-500/30 focus:border-cyan-400 text-xs text-white outline-none font-mono"
                    />
                    <p className="text-[10px] text-cyan-400/80 mt-1">
                      ✓ এই নম্বরটি হেডার বার এবং হেল্পলাইন পপ-আপে সাথে সাথে আপডেট হবে।
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-cyan-300 mb-1.5 font-bold">
                      হেল্পলাইন ইমেইল ঠিকানা (Support Email) *
                    </label>
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="e.g. support@sciencestudio.com"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-cyan-500/30 focus:border-cyan-400 text-xs text-white outline-none font-mono"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-mono text-cyan-300 mb-1.5 font-bold">
                      একাডেমীর ঠিকানা (Academy Location / Address) *
                    </label>
                    <input
                      type="text"
                      value={contactAddress}
                      onChange={(e) => setContactAddress(e.target.value)}
                      placeholder="e.g. বিজ্ঞান পার্ক রোড, ফার্মগেট, ঢাকা - ১২১৫"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-cyan-500/30 focus:border-cyan-400 text-xs text-white outline-none"
                    />
                  </div>

                  <div className="md:col-span-2 pt-3 border-t border-cyan-500/20">
                    <span className="text-[11px] font-mono font-bold text-cyan-300 uppercase tracking-wider block mb-2">
                      🌐 সোশ্যাল মিডিয়া ও হেল্পলাইন সময়সূচী (Social Media & Helpline Hours)
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] font-mono text-slate-400 mb-1">WhatsApp নম্বর</label>
                        <input
                          type="text"
                          value={whatsappNumber}
                          onChange={(e) => setWhatsappNumber(e.target.value)}
                          placeholder="+8801700000000"
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-xs text-white outline-none font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono text-slate-400 mb-1">Facebook পেজ / গ্রুপ URL</label>
                        <input
                          type="text"
                          value={facebookUrl}
                          onChange={(e) => setFacebookUrl(e.target.value)}
                          placeholder="https://facebook.com/..."
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-xs text-white outline-none font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono text-slate-400 mb-1">YouTube চ্যানেল URL</label>
                        <input
                          type="text"
                          value={youtubeUrl}
                          onChange={(e) => setYoutubeUrl(e.target.value)}
                          placeholder="https://youtube.com/..."
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-xs text-white outline-none font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono text-slate-400 mb-1">Telegram চ্যানেল URL</label>
                        <input
                          type="text"
                          value={telegramUrl}
                          onChange={(e) => setTelegramUrl(e.target.value)}
                          placeholder="https://t.me/..."
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-xs text-white outline-none font-mono"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-mono text-slate-400 mb-1">হেল্পলাইন সাপোর্ট সময়সূচী</label>
                        <input
                          type="text"
                          value={helplineTime}
                          onChange={(e) => setHelplineTime(e.target.value)}
                          placeholder="সকাল ৯:০০ - রাত ১০:০০ (প্রতিদিন)"
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-xs text-white outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Virtual Science Lab Section Customization Card */}
              <div className="md:col-span-2 p-5 rounded-2xl bg-gradient-to-br from-emerald-950/30 via-slate-900/70 to-slate-950/90 border border-emerald-500/25 shadow-xl space-y-4">
                <div className="flex items-center gap-2.5 border-b border-emerald-500/20 pb-3">
                  <Atom className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <h3 className="text-xs font-mono text-emerald-300 font-bold uppercase tracking-wider">
                      🔬 ভার্চুয়াল বিজ্ঞান ল্যাব সেকশন কাস্টমাইজেশন (Virtual Science Lab Section)
                    </h3>
                    <p className="text-[10px] text-slate-400">
                      হোমপেজের ইন্টারেক্টিভ সিমুলেশন ল্যাবের ব্যাজ, মূল শিরোনাম এবং বর্ণনা টেক্সট পরিবর্তন করুন।
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-emerald-300 mb-1.5 font-bold">
                      ল্যাব সেকশন ব্যাজ লেখা (Lab Section Badge)
                    </label>
                    <input
                      type="text"
                      value={labSectionBadge}
                      onChange={(e) => setLabSectionBadge(e.target.value)}
                      placeholder="e.g. INTERACTIVE VIRTUAL LAB & PLAYGROUND"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-emerald-500/30 focus:border-emerald-400 text-xs text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-emerald-300 mb-1.5 font-bold">
                      ল্যাব সেকশন শিরোনাম (Lab Section Title) [ঐচ্ছিক]
                    </label>
                    <input
                      type="text"
                      value={labSectionTitle}
                      onChange={(e) => setLabSectionTitle(e.target.value)}
                      placeholder="ফাঁকা রাখলে ডিফল্ট ডাইনামিক একাডেমি নাম সহ টাইটেল শো হবে"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-emerald-500/30 focus:border-emerald-400 text-xs text-white outline-none"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-mono text-slate-300 mb-1.5 font-semibold">
                      ল্যাব সেকশন বিবরণী (Lab Section Subtitle)
                    </label>
                    <textarea
                      rows={2}
                      value={labSectionSubtitle}
                      onChange={(e) => setLabSectionSubtitle(e.target.value)}
                      placeholder="পড়াশোনা হোক আনন্দের ও গবেষণাধর্মী! পদার্থ, রসায়ন, জীববিজ্ঞান ও গণিতের গুরুত্বপূর্ণ টপিকগুলো নিজে পরিবর্তন করে প্র্যাকটিক্যাল জ্ঞান অর্জন করুন।"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-white/10 focus:border-emerald-400 text-xs text-white outline-none resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Footer Description */}
              <div className="md:col-span-2">
                <label className="block text-xs font-mono text-slate-400 mb-1.5 font-semibold">ফুটার বিবরণী লেখা (Footer Description Text)</label>
                <textarea
                  rows={2}
                  value={footerDescription}
                  onChange={(e) => setFooterDescription(e.target.value)}
                  placeholder="সাকিব স্যারের তত্ত্বাবধানে এক দল নিবেদিতপ্রাণ শিক্ষক ও আধুনিক বিজ্ঞানাগারের সমন্বয়ে গঠিত..."
                  className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 focus:border-cyan-400 text-xs text-white outline-none resize-none"
                />
              </div>

              {/* Payment Info & Methods Settings Card */}
              <div className="md:col-span-2 p-5 rounded-2xl bg-gradient-to-br from-pink-950/40 via-purple-950/30 to-slate-950 border border-pink-500/30 shadow-xl space-y-4">
                <div className="flex items-center gap-2.5 border-b border-pink-500/20 pb-3">
                  <CreditCard className="w-5 h-5 text-pink-400 shrink-0" />
                  <div>
                    <h3 className="text-xs font-mono text-pink-300 font-bold uppercase tracking-wider">
                      💳 পেমেন্ট অ্যাকাউন্ট নম্বর ও নির্দেশনাবলী (Payment Settings)
                    </h3>
                    <p className="text-[10px] text-slate-300">
                      শিক্ষার্থীরা কোর্স কেনার সময় যে বিকাশ, নগদ, ও রকেট মোবাইল নম্বর এবং পেমেন্ট দিকনির্দেশনা দেখবে তা কাস্টমাইজ করুন।
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-pink-300 mb-1.5 font-bold">
                      বিকাশ নম্বর (bKash Personal)
                    </label>
                    <input
                      type="text"
                      value={bkashNumber}
                      onChange={(e) => setBkashNumber(e.target.value)}
                      placeholder="e.g. +৮৮০ ১৭০০-০০০০০০"
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-pink-500/30 focus:border-pink-400 text-xs text-white outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-amber-300 mb-1.5 font-bold">
                      নগদ নম্বর (Nagad Personal)
                    </label>
                    <input
                      type="text"
                      value={nagadNumber}
                      onChange={(e) => setNagadNumber(e.target.value)}
                      placeholder="e.g. +৮৮০ ১৭০০-০০০০০০"
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-amber-500/30 focus:border-amber-400 text-xs text-white outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-purple-300 mb-1.5 font-bold">
                      রকেট / উপায় নম্বর (Rocket/Upay Personal)
                    </label>
                    <input
                      type="text"
                      value={rocketNumber}
                      onChange={(e) => setRocketNumber(e.target.value)}
                      placeholder="e.g. +৮৮০ ১৭০০-০০০০০০"
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-purple-500/30 focus:border-purple-400 text-xs text-white outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1.5 font-semibold">
                    পেমেন্ট নির্দেশনাবলী (Payment Instructions) [অপশনাল]
                  </label>
                  <textarea
                    rows={3}
                    value={paymentInstructions}
                    onChange={(e) => setPaymentInstructions(e.target.value)}
                    placeholder="১. সেন্ড মানি করুন...&#10;২. ট্রানজেকশন আইডি কপি করুন...&#10;৩. ফরম পুরণ করে সাবমিট করুন।"
                    className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-white/10 focus:border-pink-400 text-xs text-white outline-none resize-none leading-relaxed"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">ফাঁকা রাখলে সিস্টেমে থাকা ডিফল্ট স্টেপ-বাই-স্টেপ নিয়মসমূহ প্রদর্শিত হবে।</p>
                </div>
              </div>

              {/* Subjects Editor (Dynamic list) */}
              <div className="md:col-span-2 p-4 rounded-xl bg-white/5 border border-white/10">
                <label className="block text-xs font-mono text-slate-300 mb-2 font-bold uppercase tracking-wider">বিষয় তালিকা পরিবর্তন (Dynamic Subjects List)</label>
                <p className="text-[10px] text-slate-400 mb-3">লেকচার আপলোড বা স্টুডেন্টদের ফিল্টার করার জন্য যে বিষয়গুলো ব্যবহার করা যাবে।</p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {subjects.map((sub, sidx) => (
                    <span 
                      key={sidx}
                      className="inline-flex items-center gap-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-2.5 py-1 rounded-lg text-[11px] font-semibold"
                    >
                      {sub}
                      <button
                        type="button"
                        onClick={() => handleRemoveSubject(sub)}
                        className="text-slate-400 hover:text-rose-400 text-xs font-bold shrink-0 cursor-pointer"
                        title="Remove Subject"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  {subjects.length === 0 && (
                    <span className="text-slate-500 text-[11px] italic">কোনো বিষয় যুক্ত করা নেই।</span>
                  )}
                </div>

                <div className="flex gap-2 max-w-sm">
                  <input
                    type="text"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    placeholder="e.g. ICT, Statistics"
                    className="flex-1 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 focus:border-cyan-400 text-xs text-white outline-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSubject();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddSubject}
                    className="px-4 py-1.5 rounded-lg bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 cursor-pointer text-xs"
                  >
                    যুক্ত করুন (Add)
                  </button>
                </div>
              </div>

              {/* Course Static Publishing Options Card */}
              <div className="md:col-span-2 p-5 rounded-2xl bg-gradient-to-br from-violet-950/30 via-slate-900/60 to-slate-950/80 border border-violet-500/20 shadow-xl space-y-5">
                <div className="flex items-center gap-2.5 border-b border-white/10 pb-3">
                  <BookOpen className="w-5 h-5 text-violet-400" />
                  <div>
                    <h3 className="text-xs font-mono text-violet-300 font-bold uppercase tracking-wider">পাবলিশ কোর্সের ডায়নামিক অপশনসমূহ (Course Static Options)</h3>
                    <p className="text-[10px] text-slate-400">কোর্স তৈরি করার ড্রপডাউন এবং ক্লিক সেটিংসে প্রদর্শিত শ্রেণি, মেয়াদ এবং ডিফল্ট ফিচারের তালিকা নিয়ন্ত্রণ করুন।</p>
                  </div>
                </div>

                {/* 1. Class / Level Options Manager */}
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-mono text-slate-200 font-bold uppercase tracking-wider">১. শ্রেণি / ক্লাস তালিকা (Class & Level Options)</label>
                    <span className="text-[10px] text-violet-400 font-mono">{classLevels.length} items</span>
                  </div>
                  <p className="text-[10px] text-slate-400">কোর্স পাবলিশ করার সময় যে শ্রেণি/লেভেল সিলেক্ট করা যাবে (e.g. HSC, HSC 1st Year, SSC, Class 10, Admission Test)।</p>

                  <div className="flex flex-wrap gap-1.5 py-1">
                    {classLevels.map((lvl, lidx) => (
                      <span
                        key={lidx}
                        className="inline-flex items-center gap-1.5 bg-violet-500/15 hover:bg-violet-500/25 text-violet-300 border border-violet-500/30 px-2.5 py-1 rounded-lg text-xs font-medium"
                      >
                        {lvl}
                        <button
                          type="button"
                          onClick={() => handleRemoveClassLevel(lvl)}
                          className="text-slate-400 hover:text-rose-400 text-xs font-bold cursor-pointer"
                          title="রিমুভ করুন"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                    {classLevels.length === 0 && (
                      <span className="text-slate-500 text-[11px] italic">কোনো শ্রেণি যুক্ত করা নেই।</span>
                    )}
                  </div>

                  <div className="flex gap-2 max-w-md pt-1">
                    <input
                      type="text"
                      value={newClassLevelSetting}
                      onChange={(e) => setNewClassLevelSetting(e.target.value)}
                      placeholder="e.g. HSC 2026 Batch, Medical Admission"
                      className="flex-1 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 focus:border-violet-400 text-xs text-white outline-none"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddClassLevel();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddClassLevel}
                      className="px-4 py-1.5 rounded-lg bg-violet-600 text-white font-bold hover:bg-violet-500 cursor-pointer text-xs transition-colors"
                    >
                      যুক্ত করুন (Add)
                    </button>
                  </div>
                </div>

                {/* 2. Course Durations Manager */}
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-mono text-slate-200 font-bold uppercase tracking-wider">২. কোর্সের মেয়াদ ও ব্যাচ টেমপ্লেট (Course Duration Templates)</label>
                    <span className="text-[10px] text-cyan-400 font-mono">{courseDurations.length} items</span>
                  </div>
                  <p className="text-[10px] text-slate-400">কোর্স পাবলিশ ফর্মে দ্রুত ১-ক্লিকে সিলেক্ট করার জন্য মেয়াদ টেমপ্লেট তালিকা।</p>

                  <div className="flex flex-wrap gap-1.5 py-1">
                    {courseDurations.map((dur, didx) => (
                      <span
                        key={didx}
                        className="inline-flex items-center gap-1.5 bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 px-2.5 py-1 rounded-lg text-xs font-medium"
                      >
                        {dur}
                        <button
                          type="button"
                          onClick={() => handleRemoveDurationSetting(dur)}
                          className="text-slate-400 hover:text-rose-400 text-xs font-bold cursor-pointer"
                          title="রিমুভ করুন"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                    {courseDurations.length === 0 && (
                      <span className="text-slate-500 text-[11px] italic">কোনো মেয়াদ টেমপ্লেট নেই।</span>
                    )}
                  </div>

                  <div className="flex gap-2 max-w-md pt-1">
                    <input
                      type="text"
                      value={newCourseDurationSetting}
                      onChange={(e) => setNewCourseDurationSetting(e.target.value)}
                      placeholder="e.g. ০৪ মাস (৪০টি লাইভ ক্লাস)"
                      className="flex-1 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 focus:border-cyan-400 text-xs text-white outline-none"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddDurationSetting();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddDurationSetting}
                      className="px-4 py-1.5 rounded-lg bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 cursor-pointer text-xs transition-colors"
                    >
                      যুক্ত করুন (Add)
                    </button>
                  </div>
                </div>

                {/* 3. Default Features Manager */}
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-mono text-slate-200 font-bold uppercase tracking-wider">৩. ডিফল্ট কোর্স বৈশিষ্ট্যসমূহ (Default Course Features)</label>
                    <span className="text-[10px] text-emerald-400 font-mono">{defaultCourseFeatures.length} items</span>
                  </div>
                  <p className="text-[10px] text-slate-400">কোর্স তৈরি করার ফর্মে দ্রুত ১-ক্লিকে যোগ করার জন্য কমন সুবিধা/হাইলাইটস তালিকা।</p>

                  <div className="flex flex-wrap gap-1.5 py-1">
                    {defaultCourseFeatures.map((feat, fidx) => (
                      <span
                        key={fidx}
                        className="inline-flex items-center gap-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-lg text-xs font-medium"
                      >
                        {feat}
                        <button
                          type="button"
                          onClick={() => handleRemoveDefaultFeature(feat)}
                          className="text-slate-400 hover:text-rose-400 text-xs font-bold cursor-pointer"
                          title="রিমুভ করুন"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                    {defaultCourseFeatures.length === 0 && (
                      <span className="text-slate-500 text-[11px] italic">কোনো ডিফল্ট বৈশিষ্ট্য নেই।</span>
                    )}
                  </div>

                  <div className="flex gap-2 max-w-md pt-1">
                    <input
                      type="text"
                      value={newDefaultFeatureSetting}
                      onChange={(e) => setNewDefaultFeatureSetting(e.target.value)}
                      placeholder="e.g. অফলাইন ও অনলাইন ডাউট সলভিং"
                      className="flex-1 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 focus:border-emerald-400 text-xs text-white outline-none"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddDefaultFeature();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddDefaultFeature}
                      className="px-4 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 cursor-pointer text-xs transition-colors"
                    >
                      যুক্ত করুন (Add)
                    </button>
                  </div>
                </div>
              </div>

              {/* Admin Profile Settings Card */}
              <div className="md:col-span-2 p-5 rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 shadow-lg">
                <div className="flex items-center gap-2 mb-3 border-b border-white/10 pb-2">
                  <Users className="w-5 h-5 text-cyan-400" />
                  <div>
                    <h3 className="text-xs font-mono text-slate-200 font-bold uppercase tracking-wider">অ্যাডমিন প্রোফাইল সেটিংস (Admin Profile Settings)</h3>
                    <p className="text-[10px] text-slate-400">আপনার ব্যক্তিগত প্রোফাইল তথ্য, ছবি ও শিক্ষাগত পরিচয় এখানে আপডেট করুন।</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  {/* Photo Upload & Preview Container */}
                  <div className="md:col-span-4 flex flex-col items-center justify-center p-4 bg-slate-900/60 rounded-xl border border-white/5 hover:border-cyan-500/20 transition-all">
                    <span className="text-[10px] font-mono font-semibold text-slate-300 mb-2">প্রোফাইল ছবি (Profile Photo)</span>
                    
                    <div 
                      onClick={() => document.getElementById('admin-photo-upload-input')?.click()}
                      className="group relative cursor-pointer flex flex-col items-center justify-center w-28 h-28 rounded-full border-2 border-dashed border-cyan-500/30 hover:border-cyan-400 bg-slate-950/60 hover:bg-slate-900/80 transition-all overflow-hidden shadow-inner"
                      title="ক্লিক করে ছবি সিলেক্ট করুন"
                    >
                      {adminPhotoUrl ? (
                        <>
                          <img 
                            src={adminPhotoUrl} 
                            alt="Admin Profile Preview" 
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.currentTarget.src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=500&auto=format&fit=crop&q=60";
                            }}
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                            <Upload className="w-5 h-5 text-cyan-400 mb-1 animate-bounce" />
                            <span className="text-[9px] font-sans font-bold">পরিবর্তন করুন</span>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center text-slate-500 p-2 text-center group-hover:text-cyan-400 transition-colors">
                          <Upload className="w-6 h-6 text-slate-400 group-hover:text-cyan-400 mb-1" />
                          <span className="text-[9px] font-semibold leading-tight font-sans">ক্লিক করুন</span>
                        </div>
                      )}
                    </div>

                    <input 
                      type="file" 
                      id="admin-photo-upload-input" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            if (typeof reader.result === 'string') {
                              setAdminPhotoUrl(reader.result);
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />

                    <div className="mt-2.5 text-center">
                      <button 
                        type="button"
                        onClick={() => document.getElementById('admin-photo-upload-input')?.click()}
                        className="px-3 py-1 rounded bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 text-cyan-300 font-sans font-bold text-[10px] cursor-pointer transition-all flex items-center gap-1 mx-auto"
                      >
                        <Upload className="w-3 h-3 text-cyan-400" />
                        ছবি সিলেক্ট করুন (Select Photo)
                      </button>
                      {adminPhotoUrl && (
                        <button 
                          type="button"
                          onClick={() => setAdminPhotoUrl('')}
                          className="mt-1 text-[9px] text-rose-400 hover:text-rose-300 font-semibold underline block mx-auto cursor-pointer"
                        >
                          ছবি বাদ দিন (Remove Photo)
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Inputs */}
                  <div className="md:col-span-8 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-mono text-slate-400 mb-1 font-semibold">এডমিনের নাম (Full Name)</label>
                        <input
                          type="text"
                          value={adminName}
                          onChange={(e) => setAdminName(e.target.value)}
                          placeholder="e.g. সাকিব হাসান (Sakib Hasan)"
                          className="w-full px-2.5 py-1.5 rounded-md bg-slate-900 border border-white/10 focus:border-cyan-400 text-xs text-white outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono text-slate-400 mb-1 font-semibold">পদবী / শিরোনাম (Designation / Title)</label>
                        <input
                          type="text"
                          value={adminDesignation}
                          onChange={(e) => setAdminDesignation(e.target.value)}
                          placeholder="e.g. Founder & Chief Mentor"
                          className="w-full px-2.5 py-1.5 rounded-md bg-slate-900 border border-white/10 focus:border-cyan-400 text-xs text-white outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono text-slate-400 mb-1 font-semibold">শিক্ষাগত পরিচয় (Educational Background)</label>
                      <input
                        type="text"
                        value={adminEducation}
                        onChange={(e) => setAdminEducation(e.target.value)}
                        placeholder="e.g. বি.এস.সি. (ইঞ্জিনিয়ারিং), বুয়েট (BUET)"
                        className="w-full px-2.5 py-1.5 rounded-md bg-slate-900 border border-white/10 focus:border-cyan-400 text-xs text-white outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono text-slate-400 mb-1 font-semibold">সংক্ষিপ্ত পরিচিতি / বায়ো (About / Bio)</label>
                      <textarea
                        rows={2}
                        value={adminBio}
                        onChange={(e) => setAdminBio(e.target.value)}
                        placeholder="আপনার পাঠদানের অভিজ্ঞতা এবং শিক্ষার্থীদের প্রতি অনুপ্রেরণামূলক কিছু কথা..."
                        className="w-full px-2.5 py-1.5 rounded-md bg-slate-900 border border-white/10 focus:border-cyan-400 text-xs text-white outline-none resize-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Routine Editor (Dynamic list) */}
              <div className="md:col-span-2 p-4 rounded-xl bg-white/5 border border-white/10">
                <label className="block text-xs font-mono text-slate-300 mb-2 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  ক্লাস রুটিন পরিবর্তন (Manage Class Routine)
                </label>
                <p className="text-[10px] text-slate-400 mb-4">সাপ্তাহিক ক্লাসের সময়সূচী পরিবর্তন বা নতুন ক্লাস সিডিউল যুক্ত করুন।</p>

                {/* List of current routine items */}
                <div className="space-y-2 mb-4 max-h-60 overflow-y-auto pr-1">
                  {routine.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-2.5 bg-slate-900/60 rounded-lg border border-white/5 hover:border-emerald-500/20 transition-all text-[11px]">
                      <div className="grid grid-cols-12 gap-2 flex-1">
                        <div className="col-span-3 font-bold text-emerald-400">{item.day}</div>
                        <div className="col-span-5 text-slate-200 font-semibold">{item.subject}</div>
                        <div className="col-span-4 text-slate-400 font-mono">{item.time}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveRoutineItem(item.id)}
                        className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded transition-colors ml-3 shrink-0 cursor-pointer"
                        title="Remove Routine Item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {routine.length === 0 && (
                    <div className="text-center p-4 text-slate-500 text-[11px] italic">কোনো ক্লাস রুটিন সিডিউল যুক্ত করা নেই।</div>
                  )}
                </div>

                {/* Form to add a new routine item */}
                <div className="bg-slate-900/30 p-3 rounded-lg border border-white/5 space-y-3">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">নতুন সিডিউল যুক্ত করুন (Add New Routine Entry)</span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-mono text-slate-400 mb-1 font-semibold">দিন (Day)</label>
                      <input
                        type="text"
                        value={newRoutineDay}
                        onChange={(e) => setNewRoutineDay(e.target.value)}
                        placeholder="e.g. শুক্রবার (Friday)"
                        className="w-full px-2.5 py-1.5 rounded bg-slate-900 border border-white/10 focus:border-cyan-400 text-xs text-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-slate-400 mb-1 font-semibold">ব্যাচ / বিষয়ের বিবরণ (Batch / Subject)</label>
                      <input
                        type="text"
                        value={newRoutineSubject}
                        onChange={(e) => setNewRoutineSubject(e.target.value)}
                        placeholder="e.g. পদার্থবিজ্ঞান ১ম পত্র স্পেশাল ব্যাচ"
                        className="w-full px-2.5 py-1.5 rounded bg-slate-900 border border-white/10 focus:border-cyan-400 text-xs text-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-slate-400 mb-1 font-semibold">সময় (Time)</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newRoutineTime}
                          onChange={(e) => setNewRoutineTime(e.target.value)}
                          placeholder="e.g. 🕒 বিকাল ৩:০০ - ৫:০০"
                          className="flex-1 px-2.5 py-1.5 rounded bg-slate-900 border border-white/10 focus:border-cyan-400 text-xs text-white outline-none"
                        />
                        <button
                          type="button"
                          onClick={handleAddRoutineItem}
                          className="px-4 py-1.5 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[11px] shrink-0 transition-all cursor-pointer"
                        >
                          যুক্ত করুন (Add)
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-white/10 pt-4 mt-6">
              <button
                type="button"
                onClick={() => setActiveTab('dashboard')}
                className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer text-xs font-semibold"
              >
                বাতিল করুন (Cancel)
              </button>
              <button
                type="submit"
                disabled={settingsLoading}
                className="px-6 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold flex items-center gap-2 disabled:opacity-50 transition-colors cursor-pointer text-xs shadow-[0_0_15px_rgba(34,211,238,0.25)]"
              >
                <Save className="w-4 h-4" />
                {settingsLoading ? 'সেভিং...' : 'সব পরিবর্তন সেভ করুন (Save Settings)'}
              </button>
            </div>
          </form>

          {/* Admin Credentials Card */}
          <div className="mt-8 pt-8 border-t border-white/10">
            <div className="flex items-center gap-2 text-rose-400 mb-6 pb-2 border-b border-white/10">
              <Lock className="w-5 h-5" />
              <h3 className="font-display font-bold text-base text-white">অ্যাডমিন লগইন তথ্য পরিবর্তন (Change Admin Credentials)</h3>
            </div>

            {credentialsSuccess && (
              <div className="flex items-center gap-2 p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-lg mb-6 animate-fade-in">
                <CheckCircle className="w-4 h-4 shrink-0 animate-bounce" />
                <span>{credentialsSuccess}</span>
              </div>
            )}

            {credentialsError && (
              <div className="flex items-center gap-2 p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-lg mb-6 animate-fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{credentialsError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateCredentials} className="space-y-4 w-full text-xs text-slate-300">
              <p className="text-[11px] text-slate-400 leading-relaxed">
                ইমেইল এবং পাসওয়ার্ড পরিবর্তন করুন। যদি কোনো তথ্য পরিবর্তন করতে না চান তবে খালি রাখুন।
              </p>
              
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1.5 font-semibold">নতুন ইমেইল এড্রেস (New Email Address)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-slate-500" />
                  </div>
                  <input
                    type="email"
                    value={adminNewEmail}
                    onChange={(e) => setAdminNewEmail(e.target.value)}
                    placeholder="e.g. newadmin@sciencestudio.com"
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-white/5 border border-white/10 focus:border-rose-400 text-xs text-white outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1.5 font-semibold">নতুন পাসওয়ার্ড (New Password)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-slate-500" />
                    </div>
                    <input
                      type="password"
                      value={adminNewPassword}
                      onChange={(e) => setAdminNewPassword(e.target.value)}
                      placeholder="কমপক্ষে ৬ ক্যারেক্টার"
                      className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-white/5 border border-white/10 focus:border-rose-400 text-xs text-white outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1.5 font-semibold">পাসওয়ার্ড নিশ্চিত করুন (Confirm Password)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-slate-500" />
                    </div>
                    <input
                      type="password"
                      value={adminConfirmPassword}
                      onChange={(e) => setAdminConfirmPassword(e.target.value)}
                      placeholder="আবার টাইপ করুন"
                      className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-white/5 border border-white/10 focus:border-rose-400 text-xs text-white outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={credentialsLoading}
                  className="px-6 py-2.5 rounded-lg bg-rose-500 hover:bg-rose-400 text-white font-bold flex items-center gap-2 disabled:opacity-50 transition-colors cursor-pointer text-xs shadow-[0_0_15px_rgba(244,63,94,0.25)]"
                >
                  <Save className="w-4 h-4" />
                  {credentialsLoading ? 'আপডেট হচ্ছে...' : 'লগইন তথ্য আপডেট করুন (Update Credentials)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Class Routine Tab Panel */}
      {activeTab === 'dashboard' && dashSubTab === 'routine' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl w-full animate-fade-in">
          <div className="flex items-center gap-2 text-rose-400 mb-6 pb-2 border-b border-white/10">
            <Calendar className="w-5 h-5 text-rose-400" />
            <h3 className="font-display font-bold text-lg text-white">ক্লাস রুটিন পরিবর্তন (Class Routine Settings)</h3>
          </div>

          {settingsSuccess && (
            <div className="flex items-center gap-2 p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-lg mb-6">
              <CheckCircle className="w-4 h-4 shrink-0 animate-bounce" />
              <span>{settingsSuccess}</span>
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="space-y-6 text-xs text-slate-300">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <label className="block text-xs font-mono text-slate-300 mb-2 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-400" />
                সাপ্তাহিক রুটিন তালিকা (Weekly Class Routine List)
              </label>
              <p className="text-[10px] text-slate-400 mb-4">সাপ্তাহিক ক্লাসের সময়সূচী পরিবর্তন বা নতুন ক্লাস সিডিউল যুক্ত করুন।</p>

              {/* List of current routine items */}
              <div className="space-y-2 mb-4 max-h-60 overflow-y-auto pr-1">
                {routine.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-2.5 bg-slate-900/60 rounded-lg border border-white/5 hover:border-emerald-500/20 transition-all text-[11px]">
                    <div className="grid grid-cols-12 gap-2 flex-1">
                      <div className="col-span-3 font-bold text-emerald-400">{item.day}</div>
                      <div className="col-span-5 text-slate-200 font-semibold">{item.subject}</div>
                      <div className="col-span-4 text-slate-400 font-mono">{item.time}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveRoutineItem(item.id)}
                      className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded transition-colors ml-3 shrink-0 cursor-pointer"
                      title="Remove Routine Item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                {routine.length === 0 && (
                  <div className="text-center p-4 text-slate-500 text-[11px] italic">কোনো ক্লাস রুটিন সিডিউল যুক্ত করা নেই।</div>
                )}
              </div>

              {/* Form to add a new routine item */}
              <div className="bg-slate-900/30 p-3 rounded-lg border border-white/5 space-y-3">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">নতুন সিডিউল যুক্ত করুন (Add New Routine Entry)</span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 mb-1 font-semibold">দিন (Day)</label>
                    <input
                      type="text"
                      value={newRoutineDay}
                      onChange={(e) => setNewRoutineDay(e.target.value)}
                      placeholder="e.g. শুক্রবার (Friday)"
                      className="w-full px-2.5 py-1.5 rounded bg-slate-900 border border-white/10 focus:border-cyan-400 text-xs text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 mb-1 font-semibold">ব্যাচ / বিষয়ের বিবরণ (Batch / Subject)</label>
                    <input
                      type="text"
                      value={newRoutineSubject}
                      onChange={(e) => setNewRoutineSubject(e.target.value)}
                      placeholder="e.g. পদার্থবিজ্ঞান ১ম পত্র স্পেশাল ব্যাচ"
                      className="w-full px-2.5 py-1.5 rounded bg-slate-900 border border-white/10 focus:border-cyan-400 text-xs text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 mb-1 font-semibold">সময় (Time)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newRoutineTime}
                        onChange={(e) => setNewRoutineTime(e.target.value)}
                        placeholder="e.g. 🕒 বিকাল ৩:০০ - ৫:০০"
                        className="flex-1 px-2.5 py-1.5 rounded bg-slate-900 border border-white/10 focus:border-cyan-400 text-xs text-white outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleAddRoutineItem}
                        className="px-4 py-1.5 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[11px] shrink-0 transition-all cursor-pointer"
                      >
                        যুক্ত করুন (Add)
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-white/10 pt-4 mt-6">
              <button
                type="submit"
                disabled={settingsLoading}
                className="px-6 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold flex items-center gap-2 disabled:opacity-50 transition-colors cursor-pointer text-xs shadow-[0_0_15px_rgba(34,211,238,0.25)]"
              >
                <Save className="w-4 h-4" />
                {settingsLoading ? 'সেভিং...' : 'সব পরিবর্তন সেভ করুন (Save Routine)'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Hero Banners Management Subtab */}
      {activeTab === 'dashboard' && dashSubTab === 'hero-banners' && (
        <div className="p-4 sm:p-6 rounded-3xl bg-[#0a1122]/95 border-2 border-teal-500/30 shadow-[0_0_30px_rgba(20,184,166,0.15)] backdrop-blur-2xl space-y-6 animate-fade-in">
          
          {/* Header Card */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-teal-500/20 pb-5">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-mono font-bold">
                <ImageIcon className="w-3.5 h-3.5 text-teal-400" />
                <span>HERO SECTION & 3D SCIENCE CAROUSEL MANAGER</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                🎬 হিরো সায়েন্স ব্যানার ও ক্যারোসেল স্লাইডার
              </h2>
              <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
                হোমপেজের প্রধান হিরো সেকশনে প্রদর্শিত ৩ডি সায়েন্স ব্যানারসমূহ ম্যানেজ করুন। নতুন ব্যানার যুক্ত করুন, ছবি পরিবর্তন করুন, সক্রিয়/নিষ্ক্রিয় করুন অথবা সিকোয়েন্স সাজান।
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={handleRestoreDefaultBanners}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-white/10 hover:border-teal-400/40 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
                title="ডিফল্ট ৩ডি ব্যানারগুলো পুনরায় নিয়ে আসুন"
              >
                <RotateCcw className="w-3.5 h-3.5 text-teal-400" />
                <span>ডিফল্ট রিস্টোর</span>
              </button>

              <button
                type="button"
                onClick={handleOpenAddBannerModal}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-[0_0_20px_rgba(20,184,166,0.4)]"
              >
                <Plus className="w-4 h-4 text-slate-950" />
                <span>নতুন ব্যানার যোগ করুন</span>
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-teal-500/20 flex flex-col justify-between">
              <span className="text-[11px] font-mono text-slate-400">মোট ব্যানার সংখ্যা</span>
              <span className="text-xl font-bold text-teal-300 font-mono mt-1">{heroBannersList.length}টি</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-emerald-500/20 flex flex-col justify-between">
              <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                হোমপেজে সক্রিয় ব্যানার
              </span>
              <span className="text-xl font-bold text-emerald-300 font-mono mt-1">
                {heroBannersList.filter(b => b.isActive !== false).length}টি
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-amber-500/20 flex flex-col justify-between">
              <span className="text-[11px] font-mono text-amber-400">পজ / নিষ্ক্রিয় ব্যানার</span>
              <span className="text-xl font-bold text-amber-300 font-mono mt-1">
                {heroBannersList.filter(b => b.isActive === false).length}টি
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-cyan-500/20 flex flex-col justify-between">
              <span className="text-[11px] font-mono text-cyan-400">অটো-স্লাইড টাইম</span>
              <span className="text-sm font-bold text-cyan-300 font-mono mt-1">প্রতি ৫ সেকেন্ডে</span>
            </div>
          </div>

          {/* Banners Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <span>বর্তমান হিরো ব্যানারসমূহ</span>
                <span className="px-2 py-0.5 rounded-md bg-teal-500/10 text-teal-300 text-[10px] font-mono font-bold">
                  {heroBannersList.length} টি স্লাইড
                </span>
              </h3>
              <span className="text-[11px] text-slate-400">
                💡 তীরচিহ্ন দিয়ে ব্যানারের ক্রম (Order) পরিবর্তন করুন
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {heroBannersList.map((banner, index) => {
                const isActive = banner.isActive !== false;
                return (
                  <div
                    key={banner.id || index}
                    className={`group relative rounded-2xl bg-slate-900/90 border transition-all duration-300 overflow-hidden flex flex-col justify-between ${
                      isActive 
                        ? 'border-teal-500/30 hover:border-teal-400/80 shadow-[0_0_20px_rgba(20,184,166,0.1)] hover:shadow-[0_0_25px_rgba(20,184,166,0.25)]' 
                        : 'border-white/10 opacity-70 hover:opacity-100'
                    }`}
                  >
                    {/* Image Preview Container */}
                    <div className="relative w-full aspect-[16/9] overflow-hidden bg-slate-950">
                      <img
                        src={banner.image}
                        alt={banner.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        onError={(e) => {
                          // Fallback to default
                          (e.target as HTMLImageElement).src = bannerScienceHeroFull;
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                      {/* Top Badges */}
                      <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2">
                        <span className="px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/20 text-white font-mono text-[10px] font-bold shadow-lg">
                          #{index + 1}
                        </span>

                        <div className="flex items-center gap-1.5">
                          {banner.subject && (
                            <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-mono font-bold backdrop-blur-md">
                              {banner.subject}
                            </span>
                          )}
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold backdrop-blur-md border ${
                              isActive
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            }`}
                          >
                            {isActive ? 'সক্রিয়' : 'পজড'}
                          </span>
                        </div>
                      </div>

                      {/* Bottom Image Tag */}
                      <div className="absolute bottom-2.5 left-2.5 right-2.5">
                        <span className="inline-block px-2.5 py-0.5 rounded-md bg-teal-500/20 text-teal-300 border border-teal-500/40 text-[10px] font-mono font-bold backdrop-blur-md">
                          {banner.badge || '3D SCIENCE LAB'}
                        </span>
                      </div>
                    </div>

                    {/* Banner Content Body */}
                    <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-white group-hover:text-teal-300 transition-colors line-clamp-1">
                          {banner.title}
                        </h4>
                        {banner.subtitle && (
                          <p className="text-xs text-slate-300 line-clamp-2 mt-1 leading-relaxed">
                            {banner.subtitle}
                          </p>
                        )}
                      </div>

                      {/* Controls Toolbar */}
                      <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                        {/* Order Reordering */}
                        <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-white/10">
                          <button
                            type="button"
                            onClick={() => handleMoveBannerOrder(banner.id, 'up')}
                            disabled={index === 0}
                            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
                            title="ব্যানারটি উপরে / আগে নিন"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <span className="text-[10px] font-mono text-teal-400 font-bold px-1">
                            {index + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleMoveBannerOrder(banner.id, 'down')}
                            disabled={index === heroBannersList.length - 1}
                            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
                            title="ব্যানারটি নিচে / পরে নিন"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-1.5">
                          {/* Active Toggle */}
                          <button
                            type="button"
                            onClick={() => handleToggleBannerActive(banner.id)}
                            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                              isActive
                                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                                : 'bg-slate-800 text-slate-400 border-white/10 hover:text-white hover:bg-slate-700'
                            }`}
                            title={isActive ? 'ব্যানারটি পজ করতে ক্লিক করুন' : 'ব্যানারটি সক্রিয় করতে ক্লিক করুন'}
                          >
                            {isActive ? 'পজ করুন' : 'চালু করুন'}
                          </button>

                          {/* Edit Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenEditBannerModal(banner)}
                            className="p-1.5 rounded-xl bg-teal-500/10 text-teal-300 border border-teal-500/30 hover:bg-teal-500/25 transition-all cursor-pointer"
                            title="ব্যানার এডিট করুন"
                          >
                            <SettingsIcon className="w-4 h-4" />
                          </button>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => setBannerToDelete(banner)}
                            className="p-1.5 rounded-xl bg-rose-500/10 text-rose-300 border border-rose-500/30 hover:bg-rose-500/25 transition-all cursor-pointer"
                            title="ব্যানার ডিলিট করুন"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

        </div> {/* End col-span-10 */}
      </div> {/* End grid-cols-12 */}

      {/* Hero Banner Add / Edit Modal */}
      {bannerModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in">
          <div className="bg-[#0a1122] border-2 border-teal-500/40 rounded-3xl max-w-4xl w-full p-5 sm:p-7 shadow-[0_0_50px_rgba(20,184,166,0.3)] relative my-8 space-y-5">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-teal-500/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    {editingBannerId ? 'হিরো ব্যানার এডিট ও কাস্টমাইজ' : 'নতুন ৩ডি হিরো ব্যানার যোগ করুন'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    ব্যানারের ছবি, শিরোনাম, উপশিরোনাম, বিষয় এবং লাইভ ভিজ্যুয়াল স্টাইল পরিবর্তন করুন।
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setBannerModalOpen(false)}
                className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
                title="বন্ধ করুন"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {bannerError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{bannerError}</span>
              </div>
            )}

            {bannerSuccess && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{bannerSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSaveBanner} className="space-y-5">
              
              {/* Live Preview Card */}
              <div className="p-4 rounded-2xl bg-slate-950/90 border border-teal-500/30 space-y-2.5">
                <span className="text-[11px] font-mono text-teal-300 font-bold uppercase tracking-wider block">
                  👁️ লাইভ হিরো ব্যানার প্রিভিউ (Live Preview)
                </span>
                
                <div className="relative rounded-2xl overflow-hidden aspect-[16/7] sm:aspect-[21/8] bg-slate-900 border border-white/10 shadow-2xl">
                  {bannerImage ? (
                    <img
                      src={bannerImage}
                      alt="Banner Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = bannerScienceHeroFull;
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs italic">
                      কোনো ছবি নির্বাচিত হয়নি
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/60 to-transparent" />
                  
                  {/* Content Overlay */}
                  <div className="absolute inset-0 p-4 sm:p-6 flex flex-col justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40 text-[10px] font-mono font-bold backdrop-blur-md">
                        {bannerBadge || '3D SCIENCE LAB'}
                      </span>
                      {bannerSubject && (
                        <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-mono font-bold backdrop-blur-md">
                          {bannerSubject}
                        </span>
                      )}
                    </div>

                    <div className="max-w-xl space-y-1 sm:space-y-2">
                      <h3 className="text-sm sm:text-xl font-bold text-white line-clamp-1">
                        {bannerTitle || 'ব্যানার শিরোনাম এখানে প্রদর্শিত হবে'}
                      </h3>
                      <p className="text-[11px] sm:text-xs text-slate-300 line-clamp-2">
                        {bannerSubtitle || 'ব্যানারের বিস্তারিত বৈজ্ঞানিক উপশিরোনাম ও বিবরণ এখানে সুন্দরভাবে দেখাবে...'}
                      </p>

                      <div className="pt-1">
                        <span className="inline-block px-3 py-1 rounded-lg bg-teal-500 text-slate-950 font-bold text-[11px] shadow-lg">
                          {bannerActionButtonText || 'ভর্তি হতে ক্লিক করুন'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Image Picker Mode */}
              <div className="space-y-3">
                <label className="block text-xs font-mono text-teal-300 font-bold uppercase tracking-wider">
                  ১. ব্যানার ব্যাকগ্রাউন্ড ইমেজ নির্বাচন (Select Background Image)
                </label>

                <div className="flex items-center gap-2 border-b border-white/10 pb-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setBannerImageMode('preset')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                      bannerImageMode === 'preset'
                        ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    🎨 ১৮টি ৩ডি সায়েন্স প্রিসেট (3D Science Presets)
                  </button>

                  <button
                    type="button"
                    onClick={() => setBannerImageMode('file')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                      bannerImageMode === 'file'
                        ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    📁 নতুন ফাইল আপলোড (Upload File)
                  </button>

                  <button
                    type="button"
                    onClick={() => setBannerImageMode('link')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                      bannerImageMode === 'link'
                        ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    🔗 ইমেজ লিংক (Image URL)
                  </button>
                </div>

                {/* Preset Picker Grid */}
                {bannerImageMode === 'preset' && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 max-h-56 overflow-y-auto p-2 bg-slate-950/60 rounded-2xl border border-white/10">
                    {heroPresetImages.map((preset, pidx) => {
                      const isSelected = bannerImage === preset.image;
                      return (
                        <button
                          key={pidx}
                          type="button"
                          onClick={() => handleSelectPreset(preset)}
                          className={`group relative rounded-xl overflow-hidden aspect-[16/10] border-2 transition-all cursor-pointer text-left ${
                            isSelected
                              ? 'border-teal-400 ring-2 ring-teal-400/50 scale-[1.02] shadow-[0_0_15px_rgba(20,184,166,0.4)]'
                              : 'border-white/10 hover:border-teal-400/50 opacity-80 hover:opacity-100'
                          }`}
                        >
                          <img
                            src={preset.image}
                            alt={preset.label}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                          <span className="absolute bottom-1 left-1 right-1 text-[9px] font-mono font-bold text-white line-clamp-1 drop-shadow">
                            {preset.label}
                          </span>
                          {isSelected && (
                            <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-teal-400 text-slate-950 flex items-center justify-center font-bold text-[10px]">
                              ✓
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* File Upload Mode */}
                {bannerImageMode === 'file' && (
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragOverBannerImg(true); }}
                    onDragLeave={() => setIsDragOverBannerImg(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragOverBannerImg(false);
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        handleBannerImageFileChange(e.dataTransfer.files[0]);
                      }
                    }}
                    className={`p-6 border-2 border-dashed rounded-2xl text-center transition-all cursor-pointer ${
                      isDragOverBannerImg
                        ? 'border-teal-400 bg-teal-500/10'
                        : 'border-white/20 bg-slate-950/60 hover:border-teal-400/50'
                    }`}
                  >
                    <Upload className="w-8 h-8 text-teal-400 mx-auto mb-2" />
                    <p className="text-xs text-white font-bold mb-1">
                      ইমেজ ফাইল ড্র্যাগ ও ড্রপ করুন অথবা ক্লিক করে ব্রাউজ করুন
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono mb-3">
                      JPG, PNG, WEBP ফরম্যাট সমর্থিত (অটোমেটিক অপটিমাইজেশন হবে)
                    </p>
                    <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold transition-all cursor-pointer">
                      <span>কম্পিউটার থেকে ছবি সিলেক্ট করুন</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleBannerImageFileChange(e.target.files[0]);
                          }
                        }}
                      />
                    </label>
                  </div>
                )}

                {/* Link Mode */}
                {bannerImageMode === 'link' && (
                  <div>
                    <input
                      type="text"
                      value={bannerImage}
                      onChange={(e) => setBannerImage(e.target.value)}
                      placeholder="https://example.com/banner-image.jpg"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 focus:border-teal-400 text-xs text-white font-mono outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Form Inputs Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Title */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-mono text-teal-300 mb-1.5 font-bold">
                    ব্যানার শিরোনাম (Banner Title) *
                  </label>
                  <input
                    type="text"
                    required
                    value={bannerTitle}
                    onChange={(e) => setBannerTitle(e.target.value)}
                    placeholder="e.g. ইউক্যারিওটিক সেল ও সাইটোলজি ৩ডি ল্যাব"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-white/10 focus:border-teal-400 text-xs text-white outline-none"
                  />
                </div>

                {/* Subtitle */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-mono text-slate-300 mb-1.5 font-bold">
                    ব্যানার উপশিরোনাম ও বৈজ্ঞানিক বিবরণ (Banner Subtitle / Description)
                  </label>
                  <textarea
                    rows={2}
                    value={bannerSubtitle}
                    onChange={(e) => setBannerSubtitle(e.target.value)}
                    placeholder="e.g. মাইটোকন্ড্রিয়া, এটিপি সংশ্লেষণ, কোষ অঙ্গাণু ও এন্ডোপ্লাজমিক জালিকা (Eukaryotic Cell Organelles...)"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-white/10 focus:border-teal-400 text-xs text-white outline-none resize-none leading-relaxed"
                  />
                </div>

                {/* Badge */}
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1.5 font-bold">
                    ব্যাজ লেখা (Badge Text)
                  </label>
                  <input
                    type="text"
                    value={bannerBadge}
                    onChange={(e) => setBannerBadge(e.target.value)}
                    placeholder="e.g. 3D CELL BIOLOGY"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-white/10 focus:border-teal-400 text-xs text-teal-300 font-mono outline-none"
                  />
                </div>

                {/* Subject Category */}
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1.5 font-bold">
                    বিষয় ক্যাটাগরি (Subject Category)
                  </label>
                  <select
                    value={bannerSubject}
                    onChange={(e) => setBannerSubject(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-white/10 focus:border-teal-400 text-xs text-white outline-none cursor-pointer"
                  >
                    <option value="Physics">Physics (পদার্থবিজ্ঞান)</option>
                    <option value="Chemistry">Chemistry (রসায়ন)</option>
                    <option value="Biology">Biology (জীববিজ্ঞান)</option>
                    <option value="Mathematics">Mathematics (উচ্চতর গণিত)</option>
                    <option value="Astrophysics">Astrophysics (মহাকাশ ও জ্যোতির্বিজ্ঞান)</option>
                    <option value="General Science">General Science (বিজ্ঞান স্টুডিও)</option>
                  </select>
                </div>

                {/* Action Button Text */}
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1.5 font-bold">
                    অ্যাকশন বাটন টেক্সট (Action Button Text)
                  </label>
                  <input
                    type="text"
                    value={bannerActionButtonText}
                    onChange={(e) => setBannerActionButtonText(e.target.value)}
                    placeholder="ভর্তি হতে ক্লিক করুন"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-white/10 focus:border-teal-400 text-xs text-white outline-none"
                  />
                </div>

                {/* Glow Color Theme */}
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1.5 font-bold">
                    গ্লো কালার থিম (Glow Theme)
                  </label>
                  <select
                    value={bannerGlowColor}
                    onChange={(e) => {
                      const color = e.target.value;
                      setBannerGlowColor(color);
                      if (color === 'cyan') {
                        setBannerAccentGradient('from-cyan-400 via-teal-300 to-blue-400');
                        setBannerBorderGlow('rgba(34,211,238,0.5)');
                      } else if (color === 'emerald') {
                        setBannerAccentGradient('from-emerald-400 via-teal-300 to-amber-300');
                        setBannerBorderGlow('rgba(16,185,129,0.5)');
                      } else if (color === 'blue') {
                        setBannerAccentGradient('from-blue-400 via-cyan-300 to-teal-300');
                        setBannerBorderGlow('rgba(59,130,246,0.5)');
                      } else if (color === 'amber') {
                        setBannerAccentGradient('from-amber-400 via-rose-300 to-cyan-300');
                        setBannerBorderGlow('rgba(245,158,11,0.5)');
                      } else if (color === 'rose') {
                        setBannerAccentGradient('from-rose-400 via-amber-300 to-yellow-200');
                        setBannerBorderGlow('rgba(244,63,94,0.5)');
                      } else if (color === 'purple') {
                        setBannerAccentGradient('from-purple-400 via-indigo-300 to-cyan-300');
                        setBannerBorderGlow('rgba(168,85,247,0.5)');
                      }
                    }}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-white/10 focus:border-teal-400 text-xs text-white outline-none cursor-pointer"
                  >
                    <option value="cyan">Cyan (আকাশি নীলাভ)</option>
                    <option value="emerald">Emerald (সবুজ বায়োলজি)</option>
                    <option value="blue">Blue (গভীর নীল ফিজিক্স)</option>
                    <option value="amber">Amber (কমলা অ্যাস্ট্রোফিজিক্স)</option>
                    <option value="rose">Rose (রোজ পিঙ্ক ফিউশন)</option>
                    <option value="purple">Purple (বেগুনি কোয়ান্টাম)</option>
                  </select>
                </div>

                {/* Active Checkbox */}
                <div className="sm:col-span-2 flex items-center gap-3 p-3 rounded-xl bg-slate-950/60 border border-white/10">
                  <input
                    type="checkbox"
                    id="bannerIsActiveCheck"
                    checked={bannerIsActive}
                    onChange={(e) => setBannerIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-teal-500 focus:ring-teal-400 cursor-pointer"
                  />
                  <label htmlFor="bannerIsActiveCheck" className="text-xs text-slate-200 font-semibold cursor-pointer">
                    হোমপেজের হিরো ক্যারোসেলে সরাসরি প্রদর্শন ও সক্রিয় রাখুন (Active on Carousel)
                  </label>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setBannerModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-xs transition-all cursor-pointer border border-white/10"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={bannerLoading}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-bold text-xs transition-all cursor-pointer shadow-[0_0_20px_rgba(20,184,166,0.3)] disabled:opacity-50 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{bannerLoading ? 'সেভ হচ্ছে...' : (editingBannerId ? 'আপডেট সেভ করুন' : 'নতুন ব্যানার সংরক্ষণ করুন')}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Delete Banner Confirmation Modal */}
      {bannerToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 border-2 border-rose-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-white text-center mb-2">
              হিরো ব্যানার ডিলিট নিশ্চিতকরণ
            </h3>

            <p className="text-xs text-slate-300 text-center mb-4 leading-relaxed">
              আপনি কি নিশ্চিতভাবে <span className="text-rose-400 font-bold">"{bannerToDelete.title}"</span> ব্যানারটি হোমপেজ থেকে মুছে ফেলতে চান?
            </p>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setBannerToDelete(null)}
                disabled={isDeletingBanner}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-xs transition-all duration-300 cursor-pointer border-2 border-white/10 hover:border-white/30 shadow-sm"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteBanner}
                disabled={isDeletingBanner}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 disabled:opacity-50"
              >
                {isDeletingBanner ? (
                  <span>ডিলিট হচ্ছে...</span>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>হ্যাঁ, ডিলিট করুন</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 border border-rose-500/30 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-white text-center mb-2">
              স্টুডেন্ট অ্যাকাউন্ট ডিলিট নিশ্চিতকরণ
            </h3>

            <p className="text-xs text-slate-300 text-center mb-4 leading-relaxed">
              আপনি কি নিশ্চিতভাবে <span className="text-rose-400 font-bold">"{userToDelete.name}"</span> ({userToDelete.email})-এর অ্যাকাউন্টটি স্থায়ীভাবে মুছে ফেলতে চান?
            </p>

            {deleteUserError && (
              <div className="p-3 mb-4 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-300 text-xs text-center font-mono">
                {deleteUserError}
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => { setUserToDelete(null); setDeleteUserError(''); }}
                disabled={isDeletingUser}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-xs transition-all duration-300 cursor-pointer border-2 border-white/10 hover:border-white/30 shadow-sm"
              >
                বাতিল (Cancel)
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteUser}
                disabled={isDeletingUser}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 disabled:opacity-50"
              >
                {isDeletingUser ? (
                  <span>ডিলিট হচ্ছে...</span>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>হ্যাঁ, ডিলিট করুন</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Course Confirmation Modal */}
      {courseToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 border border-rose-500/30 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-white text-center mb-2">
              কোর্স ডিলিট পারমিশন নিশ্চিতকরণ
            </h3>

            <p className="text-xs text-slate-300 text-center mb-4 leading-relaxed">
              আপনি কি নিশ্চিতভাবে <span className="text-rose-400 font-bold">"{courseToDelete.title}"</span> কোর্সটি এবং এর অন্তর্গত সমস্ত ভিডিও ক্লাস ও পিডিএফ নোটস স্থায়ীভাবে মুছে ফেলতে চান?
            </p>

            {deleteCourseError && (
              <div className="p-3 mb-4 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-300 text-xs text-center font-mono">
                {deleteCourseError}
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => { setCourseToDelete(null); setDeleteCourseError(''); }}
                disabled={isDeletingCourse}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-xs transition-all duration-300 cursor-pointer border-2 border-white/10 hover:border-white/30 shadow-sm"
              >
                বাতিল (Cancel)
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteCourse}
                disabled={isDeletingCourse}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 disabled:opacity-50"
              >
                {isDeletingCourse ? (
                  <span>ডিলিট হচ্ছে...</span>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>হ্যাঁ, ডিলিট করুন</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Class Confirmation Modal */}
      {classToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 border border-rose-500/30 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-white text-center mb-2">
              ক্লাস ডিলিট পারমিশন নিশ্চিতকরণ
            </h3>

            <p className="text-xs text-slate-300 text-center mb-4 leading-relaxed">
              আপনি কি নিশ্চিতভাবে ভিডিও ক্লাস <span className="text-rose-400 font-bold">"{classToDelete.title}"</span> স্থায়ীভাবে মুছে ফেলতে চান?
            </p>

            {deleteClassError && (
              <div className="p-3 mb-4 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-300 text-xs text-center font-mono">
                {deleteClassError}
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => { setClassToDelete(null); setDeleteClassError(''); }}
                disabled={isDeletingClass}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-xs transition-all duration-300 cursor-pointer border-2 border-white/10 hover:border-white/30 shadow-sm"
              >
                বাতিল (Cancel)
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteClass}
                disabled={isDeletingClass}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 disabled:opacity-50"
              >
                {isDeletingClass ? (
                  <span>ডিলিট হচ্ছে...</span>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>হ্যাঁ, ডিলিট করুন</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Note Confirmation Modal */}
      {noteToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 border border-rose-500/30 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-white text-center mb-2">
              পিডিএফ লেকচার শিট ডিলিট পারমিশন
            </h3>

            <p className="text-xs text-slate-300 text-center mb-4 leading-relaxed">
              আপনি কি নিশ্চিতভাবে পিডিএফ লেকচার শিট <span className="text-rose-400 font-bold">"{noteToDelete.title}"</span> স্থায়ীভাবে মুছে ফেলতে চান?
            </p>

            {deleteNoteError && (
              <div className="p-3 mb-4 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-300 text-xs text-center font-mono">
                {deleteNoteError}
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => { setNoteToDelete(null); setDeleteNoteError(''); }}
                disabled={isDeletingNote}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-xs transition-all duration-300 cursor-pointer border-2 border-white/10 hover:border-white/30 shadow-sm"
              >
                বাতিল (Cancel)
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteNote}
                disabled={isDeletingNote}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 disabled:opacity-50"
              >
                {isDeletingNote ? (
                  <span>ডিলিট হচ্ছে...</span>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>হ্যাঁ, ডিলিট করুন</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit TrxID Modal */}
      {userToEditTrx && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 border-2 border-cyan-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                💳 ট্রানজেকশন আইডি আপডেট
              </h3>
              <button
                onClick={() => setUserToEditTrx(null)}
                className="p-1.5 rounded-xl bg-slate-800 border border-white/10 text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/10 hover:border-cyan-400/50 transition-all cursor-pointer group"
                title="বন্ধ করুন (Close)"
              >
                <X className="w-4 h-4 group-hover:scale-110 group-hover:rotate-90 transition-transform duration-300" />
              </button>
            </div>

            <p className="text-xs text-slate-300 mb-3">
              স্টুডেন্ট: <span className="text-cyan-400 font-bold">{userToEditTrx.name}</span>
            </p>

            <label className="block text-xs text-slate-400 mb-1 font-mono">TrxID / পেমেন্ট রেফারেন্স:</label>
            <input
              type="text"
              value={editTrxInput}
              onChange={(e) => setEditTrxInput(e.target.value)}
              placeholder="e.g. BKASH123456"
              className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-white text-xs font-mono outline-none focus:border-cyan-400 mb-5"
            />

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setUserToEditTrx(null)}
                disabled={isUpdatingTrx}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-xs transition-all duration-300 cursor-pointer border-2 border-white/10 hover:border-white/30 shadow-sm"
              >
                বাতিল (Cancel)
              </button>
              <button
                type="button"
                onClick={handleConfirmUpdateTrx}
                disabled={isUpdatingTrx}
                className="flex-1 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
              >
                {isUpdatingTrx ? 'সেভ হচ্ছে...' : 'সেভ করুন'}
              </button>
            </div>
          </div>
        </div>
      )}

      </div>
    </div>
  );
}
