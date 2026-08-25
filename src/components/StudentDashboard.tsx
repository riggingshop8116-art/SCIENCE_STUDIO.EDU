import React, { useState, useEffect, useRef } from 'react';
import { Class, Note, User, Settings, Course } from '../types';
import { downloadPdfFile, openPdfInBrowser } from '../utils/pdfHelper';
import { formatVideoEmbedUrl, isIframeVideoUrl } from '../utils/videoHelper';
import StudentProfileModal from './StudentProfileModal';
import PendingApprovalView from './PendingApprovalView';
import { 
  Video, 
  FileText, 
  Search, 
  BookOpen, 
  User as UserIcon, 
  Clock, 
  ChevronRight, 
  ChevronLeft,
  LogOut,
  Download, 
  ExternalLink, 
  Tag, 
  Sparkles, 
  Maximize2,
  Bookmark,
  Calendar,
  AlertCircle,
  Lock,
  Check,
  CheckCircle,
  X,
  CreditCard,
  ShieldCheck,
  ShoppingBag,
  Play,
  Sliders,
  Edit3,
  Camera,
  Copy,
  Phone,
  Hash,
  Shield,
  Zap,
  CheckCheck
} from 'lucide-react';

interface StudentDashboardProps {
  user: User;
  classes: Class[];
  notes: Note[];
  settings?: Settings;
  onUpdateUser?: (updatedUser: User) => void;
  onLogout?: () => void;
}

export default function StudentDashboard({ user, classes, notes, settings, onUpdateUser, onLogout }: StudentDashboardProps) {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [activeVideo, setActiveVideo] = useState<Class | null>(classes[0] || null);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const notesScrollRef = useRef<HTMLDivElement>(null);

  const scrollNotes = (direction: 'left' | 'right') => {
    if (notesScrollRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      notesScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Video Player Ref & Settings state
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [selectedQuality, setSelectedQuality] = useState<string>('Auto (1080p)');
  const [showPlayerSettings, setShowPlayerSettings] = useState<boolean>(false);

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  useEffect(() => {
    setIsPlayingVideo(false);
    setShowPlayerSettings(false);
  }, [activeVideo?.id]);

  const getTargetPaymentNumber = () => {
    if (paymentMethod === 'bkash') return settings?.bkashNumber || '01700-000000';
    if (paymentMethod === 'nagad') return settings?.nagadNumber || '01700-000000';
    if (paymentMethod === 'rocket') return settings?.rocketNumber || '01700-000000';
    return '01700-000000';
  };

  // Courses and Payment modal states
  const [coursesList, setCoursesList] = useState<Course[]>([]);
  const [selectedCourseForPayment, setSelectedCourseForPayment] = useState<Course | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'bkash' | 'nagad' | 'rocket'>('bkash');
  const [senderPhone, setSenderPhone] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);
  const [paymentSuccessMessage, setPaymentSuccessMessage] = useState('');
  const [paymentError, setPaymentError] = useState('');
  const [copiedNumber, setCopiedNumber] = useState(false);

  const handleCopyNumber = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2200);
  };

  // Track enrolled course titles for student
  const [enrolledCourses, setEnrolledCourses] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`scicenter_enrolled_${user.id}`);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return user.enrolledCourseTitles && user.enrolledCourseTitles.length > 0
      ? user.enrolledCourseTitles
      : [];
  });

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch('/api/courses');
        if (res.ok) {
          const data: Course[] = await res.json();
          setCoursesList(data);

          // If no enrolled courses saved yet for this student, initialize with first course
          const saved = localStorage.getItem(`scicenter_enrolled_${user.id}`);
          if (!saved && (!user.enrolledCourseTitles || user.enrolledCourseTitles.length === 0) && data.length > 0) {
            const initialEnrolled = [data[0].title];
            setEnrolledCourses(initialEnrolled);
            try {
              localStorage.setItem(`scicenter_enrolled_${user.id}`, JSON.stringify(initialEnrolled));
            } catch (err) {
              console.error(err);
            }
          }
        }
      } catch (err) {
        console.warn("Notice: loading courses retry pending", err);
      }
    };
    fetchCourses();
  }, [user.id]);

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentError('');

    const cleanPhone = senderPhone.replace(/\D/g, '');
    if (!senderPhone.trim()) {
      setPaymentError('প্রেরক মোবাইল নম্বর দেওয়া বাধ্যতামূলক।');
      return;
    }

    if (cleanPhone.length !== 11) {
      setPaymentError('মোবাইল নম্বরটি অবশ্যই সঠিক ১১ ডিজিটের হতে হবে (যেমন: 01712345678)।');
      return;
    }

    if (!transactionId.trim()) {
      setPaymentError('ট্রানজেকশন আইডি (TrxID) দেওয়া বাধ্যতামূলক।');
      return;
    }

    setPaymentSubmitting(true);

    if (selectedCourseForPayment) {
      const courseTitle = selectedCourseForPayment.title;
      try {
        const tokenStr = localStorage.getItem('science_studio_token') || `token-${user.id}`;
        await fetch('/api/user/enroll', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${tokenStr}`
          },
          body: JSON.stringify({ 
            courseTitle,
            transactionId: transactionId.trim(),
            paymentMethod,
            senderPhone: senderPhone.trim()
          })
        });
      } catch (err) {
        console.error("Error registering course enrollment:", err);
      }

      if (!enrolledCourses.includes(courseTitle)) {
        const updated = [...enrolledCourses, courseTitle];
        setEnrolledCourses(updated);
        try {
          localStorage.setItem(`scicenter_enrolled_${user.id}`, JSON.stringify(updated));
        } catch (err) {
          console.error(err);
        }
      }
    }

    setTimeout(() => {
      setPaymentSubmitting(false);
      setPaymentSuccessMessage(`ধন্যবাদ ${user.name}! আপনার ${selectedCourseForPayment?.title} কোর্সের ফি সংক্রান্ত তথ্য (TrxID: ${transactionId}) সফলভাবে গৃহীত হয়েছে। সাকিব স্যার অথবা অ্যাডমিন ভেরিফাই করে দ্রুত ক্লাসরুম আনলক করবেন।`);
    }, 1000);
  };

  const subjects = ['All', ...(settings?.subjects || ['Physics', 'Chemistry', 'Biology', 'Mathematics', 'General Science'])];

  // Toggle local bookmarking
  const toggleBookmark = (id: string) => {
    if (bookmarkedIds.includes(id)) {
      setBookmarkedIds(bookmarkedIds.filter(item => item !== id));
    } else {
      setBookmarkedIds([...bookmarkedIds, id]);
    }
  };

  const [selectedCourseFilter, setSelectedCourseFilter] = useState('All');
  const [selectedClassFilter, setSelectedClassFilter] = useState('All');

  // Dynamically extract unique class levels from settings and published courses
  const classOptions = React.useMemo(() => {
    const setOfClasses = new Set<string>();

    // 1. Include class levels configured in admin settings
    if (settings?.classLevels && Array.isArray(settings.classLevels)) {
      settings.classLevels.forEach(cl => {
        if (cl && cl.trim()) setOfClasses.add(cl.trim());
      });
    }

    // 2. Include class levels present in published courses list
    coursesList.forEach(course => {
      if (course.classLevel && course.classLevel.trim()) {
        setOfClasses.add(course.classLevel.trim());
      }
    });

    return Array.from(setOfClasses);
  }, [settings?.classLevels, coursesList]);

  // Filter published courses based on selected class filter dropdown
  const displayCoursesList = React.useMemo(() => {
    if (selectedClassFilter === 'All') return coursesList;
    return coursesList.filter(course => {
      if (!course.classLevel) return false;
      return course.classLevel.trim().toLowerCase() === selectedClassFilter.trim().toLowerCase();
    });
  }, [coursesList, selectedClassFilter]);

  // Active enrolled titles for this student
  const rawEnrolledTitles = (user.enrolledCourseTitles && user.enrolledCourseTitles.length > 0)
    ? user.enrolledCourseTitles
    : enrolledCourses;

  // Filter against active courses in coursesList so deleted courses are auto-removed for student
  const userEnrolledTitles = React.useMemo(() => {
    const activeCourseTitles = coursesList.map(c => c.title);
    return coursesList.length > 0
      ? rawEnrolledTitles.filter(t => activeCourseTitles.includes(t))
      : rawEnrolledTitles;
  }, [coursesList, rawEnrolledTitles]);

  // Filter courses for dropdown: ONLY show courses that the student is enrolled in!
  const displayDropdownCourses = React.useMemo(() => {
    return coursesList.filter(c => userEnrolledTitles.includes(c.title));
  }, [coursesList, userEnrolledTitles]);

  // Filter video classes and notes: ONLY show content matching student's enrolled course(s) and class level if selected
  const filteredClasses = React.useMemo(() => {
    return classes.filter(cls => {
      const belongsToEnrolledCourse = !cls.courseTitle || userEnrolledTitles.includes(cls.courseTitle);
      if (!belongsToEnrolledCourse) return false;

      if (selectedClassFilter !== 'All') {
        const parentCourse = coursesList.find(c => c.title === cls.courseTitle);
        if (parentCourse && parentCourse.classLevel && parentCourse.classLevel.trim().toLowerCase() !== selectedClassFilter.trim().toLowerCase()) {
          return false;
        }
      }

      const matchesSubject = selectedSubject === 'All' || cls.subject.toLowerCase() === selectedSubject.toLowerCase();
      const matchesCourse = selectedCourseFilter === 'All' || (cls.courseTitle && cls.courseTitle === selectedCourseFilter);
      const matchesSearch = cls.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            cls.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (cls.courseTitle && cls.courseTitle.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesSubject && matchesCourse && matchesSearch;
    });
  }, [classes, userEnrolledTitles, selectedClassFilter, coursesList, selectedSubject, selectedCourseFilter, searchQuery]);

  const filteredNotes = React.useMemo(() => {
    return notes.filter(note => {
      const belongsToEnrolledCourse = !note.courseTitle || userEnrolledTitles.includes(note.courseTitle);
      if (!belongsToEnrolledCourse) return false;

      if (selectedClassFilter !== 'All') {
        const parentCourse = coursesList.find(c => c.title === note.courseTitle);
        if (parentCourse && parentCourse.classLevel && parentCourse.classLevel.trim().toLowerCase() !== selectedClassFilter.trim().toLowerCase()) {
          return false;
        }
      }

      const matchesSubject = selectedSubject === 'All' || note.subject.toLowerCase() === selectedSubject.toLowerCase();
      const matchesCourse = selectedCourseFilter === 'All' || (note.courseTitle && note.courseTitle === selectedCourseFilter);
      const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            note.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (note.courseTitle && note.courseTitle.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesSubject && matchesCourse && matchesSearch;
    });
  }, [notes, userEnrolledTitles, selectedClassFilter, coursesList, selectedSubject, selectedCourseFilter, searchQuery]);

  // Auto-sync active video selection if deleted or list updated
  useEffect(() => {
    if (activeVideo && !filteredClasses.some(c => c.id === activeVideo.id)) {
      setActiveVideo(filteredClasses[0] || null);
    } else if (!activeVideo && filteredClasses.length > 0) {
      setActiveVideo(filteredClasses[0]);
    }
  }, [filteredClasses, activeVideo]);

  // Auto-sync active note modal if deleted
  useEffect(() => {
    if (activeNote && !filteredNotes.some(n => n.id === activeNote.id)) {
      setActiveNote(null);
    }
  }, [filteredNotes, activeNote]);

  // Simple PDF viewer emulator
  const handleOpenPDF = (note: Note) => {
    setActiveNote(note);
  };

  const handleDownloadPDF = (note: Note) => {
    downloadPdfFile(note.pdfUrl, note.title);
  };

  return (
    <div className="w-full max-w-[1800px] mx-auto px-2 sm:px-6 lg:px-10 xl:px-12 py-6 sm:py-8">
      {/* Student Welcome Header Banner */}
      <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div 
            onClick={() => setShowProfileModal(true)}
            className="relative w-16 h-16 rounded-2xl bg-cyan-500/10 border-2 border-cyan-400/60 overflow-hidden flex items-center justify-center shrink-0 cursor-pointer group shadow-[0_0_15px_rgba(34,211,238,0.2)]"
            title="প্রোফাইল পরিবর্তন করতে ক্লিক করুন"
          >
            {user.photoUrl || user.avatarUrl ? (
              <img 
                src={user.photoUrl || user.avatarUrl} 
                alt={user.name} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
            ) : (
              <UserIcon className="w-8 h-8 text-cyan-400" />
            )}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <Camera className="w-5 h-5 text-cyan-300" />
            </div>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-display font-bold text-white">স্বাগতম, {user.name}!</h1>
              <span className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded ${
                user.isApproved 
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' 
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}>
                {user.isApproved ? 'Active Student' : 'Pending Approval'}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-1">
              {user.studentClass && (
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>শ্রেণী: {user.studentClass}</span>
                </span>
              )}
              {user.phone && (
                <span className="text-xs font-mono text-slate-300">
                  📱 {user.phone}
                </span>
              )}
            </div>

            <p className="text-slate-300 text-xs mt-1.5 font-sans">
              {user.isApproved 
                ? 'আজকের ক্লাস এবং স্টাডি মেটেরিয়ালসমূহ নিচে দেওয়া হলো। আপনার বিজ্ঞান চর্চাকে আরও বেগবান করুন।'
                : 'আপনার অ্যাকাউন্টটি সফলভাবে তৈরি হয়েছে। বর্তমানে এটি অ্যাডমিন অনুমোদনের অপেক্ষায় রয়েছে।'}
            </p>
          </div>
        </div>
        
        {/* Profile Controls & Stats Panel */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto shrink-0">
          <button
            type="button"
            onClick={() => setShowProfileModal(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500/20 via-teal-500/20 to-emerald-500/20 hover:from-cyan-500/30 hover:to-emerald-500/30 border border-cyan-400/50 text-cyan-300 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md btn-shine group"
          >
            <Edit3 className="w-4 h-4 text-cyan-400 group-hover:rotate-12 transition-transform" />
            <span>প্রোফাইল এডিট</span>
          </button>

          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="px-3.5 py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md active:scale-95 group"
              title="অ্যাকাউন্ট থেকে লগআউট করুন"
            >
              <LogOut className="w-4 h-4 text-rose-400 group-hover:-translate-x-0.5 transition-transform" />
              <span>লগআউট (Logout)</span>
            </button>
          )}

          <div className="hidden xl:flex items-center gap-4 bg-white/5 p-2.5 rounded-xl border border-white/10 shrink-0 font-mono text-[11px] text-slate-300">
            <div className="space-y-0.5">
              <div><span className="text-cyan-400">EMAIL:</span> {user.email}</div>
              <div><span className="text-cyan-400">STUDENT ID:</span> {user.id}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Student Edit Profile Modal */}
      <StudentProfileModal
        user={user}
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onUpdateUser={(updated) => {
          if (onUpdateUser) onUpdateUser(updated);
        }}
        classLevels={settings?.classLevels}
      />

      {!user.isApproved ? (
        <div className="space-y-8 my-4 animate-fade-in">
          {/* Dedicated Pending Approval & Verification View */}
          <PendingApprovalView
            user={user}
            settings={settings}
            coursesList={displayCoursesList}
            onUpdateUser={onUpdateUser}
            onLogout={onLogout}
            onOpenPaymentModal={(course) => {
              setSelectedCourseForPayment(course);
              setPaymentSuccessMessage('');
            }}
          />

          {/* Payment Modal */}
          {selectedCourseForPayment && (
            <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
              <div className="bg-[#0a1122]/95 border-2 border-cyan-400/60 rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-6 relative shadow-[0_0_60px_rgba(34,211,238,0.25)] my-8 overflow-hidden">
                
                {/* Background Ambient Glows */}
                <div className="absolute -top-20 -right-20 w-56 h-56 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-20 -left-20 w-56 h-56 bg-pink-500/15 rounded-full blur-3xl pointer-events-none" />

                {/* Modal Close Button */}
                <button 
                  onClick={() => {
                    setSelectedCourseForPayment(null);
                    setPaymentError('');
                    setPaymentSuccessMessage('');
                  }}
                  className="absolute top-4 right-4 p-2.5 text-slate-400 hover:text-white rounded-2xl bg-slate-900/90 border-2 border-white/10 hover:border-cyan-400/60 hover:bg-cyan-500/15 hover:shadow-[0_0_20px_rgba(34,211,238,0.35)] transition-all duration-300 z-30 cursor-pointer group"
                  title="বন্ধ করুন (Close)"
                >
                  <X className="w-5 h-5 text-slate-400 group-hover:text-cyan-300 group-hover:scale-110 group-hover:rotate-90 transition-transform duration-300" />
                </button>

                {/* Modal Header */}
                <div className="relative z-10 space-y-3 pr-8 border-b border-white/10 pb-5">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-cyan-500/20 to-teal-500/20 border border-cyan-400/40 text-cyan-300 font-mono text-[11px] font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                    <span>সিকিউর পেমেন্ট গেটওয়ে (SSL Checkout)</span>
                  </div>

                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-xl sm:text-2xl font-display font-extrabold text-white leading-snug">
                        {selectedCourseForPayment.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1.5">
                        <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded">
                          {selectedCourseForPayment.subject}
                        </span>
                        {selectedCourseForPayment.classLevel && (
                          <span className="text-[10px] font-mono font-bold text-purple-300 bg-purple-500/10 border border-purple-500/30 px-2 py-0.5 rounded">
                            {selectedCourseForPayment.classLevel}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0 bg-slate-900/90 border border-cyan-500/40 px-3 py-2 rounded-2xl shadow-inner">
                      <span className="text-[9px] font-mono uppercase text-slate-400 block font-semibold">কোর্স ফি</span>
                      <span className="text-xl sm:text-2xl font-display font-black text-cyan-400">
                        ৳{selectedCourseForPayment.price.toLocaleString('bn-BD')}
                      </span>
                      {selectedCourseForPayment.originalPrice && (
                        <span className="text-[10px] text-slate-500 line-through block">
                          ৳{selectedCourseForPayment.originalPrice.toLocaleString('bn-BD')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Operator Selector Tabs */}
                <div className="relative z-10 space-y-2.5">
                  <label className="text-xs font-mono text-slate-200 font-bold flex items-center justify-between">
                    <span>পেমেন্ট মেথড বা অপারেটর নির্বাচন করুন:</span>
                    <span className="text-[10px] text-cyan-400 font-normal">Personal Send Money</span>
                  </label>
                  
                  <div className="grid grid-cols-3 gap-2.5">
                    {/* bKash */}
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentMethod('bkash');
                        setCopiedNumber(false);
                      }}
                      className={`p-3 sm:p-3.5 rounded-2xl border-2 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all duration-300 relative overflow-hidden group ${
                        paymentMethod === 'bkash' 
                          ? 'bg-gradient-to-br from-pink-500/25 via-pink-600/15 to-pink-950/40 border-pink-500 text-pink-300 font-bold shadow-[0_0_20px_rgba(236,72,153,0.35)] scale-[1.02]' 
                          : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:border-pink-500/40 hover:bg-pink-500/10'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-pink-500/20 border border-pink-400/50 flex items-center justify-center text-pink-400 font-black text-xs group-hover:scale-110 transition-transform">
                        bK
                      </div>
                      <span className="text-xs font-bold text-white">bKash</span>
                      <span className="text-[9px] opacity-80 font-mono">বিকাশ (Personal)</span>
                      {paymentMethod === 'bkash' && (
                        <div className="absolute top-1 right-1.5 w-2 h-2 rounded-full bg-pink-400 animate-ping" />
                      )}
                    </button>

                    {/* Nagad */}
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentMethod('nagad');
                        setCopiedNumber(false);
                      }}
                      className={`p-3 sm:p-3.5 rounded-2xl border-2 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all duration-300 relative overflow-hidden group ${
                        paymentMethod === 'nagad' 
                          ? 'bg-gradient-to-br from-amber-500/25 via-orange-600/15 to-orange-950/40 border-amber-500 text-amber-300 font-bold shadow-[0_0_20px_rgba(245,158,11,0.35)] scale-[1.02]' 
                          : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:border-amber-500/40 hover:bg-amber-500/10'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-400 font-black text-xs group-hover:scale-110 transition-transform">
                        NG
                      </div>
                      <span className="text-xs font-bold text-white">Nagad</span>
                      <span className="text-[9px] opacity-80 font-mono">নগদ (Personal)</span>
                      {paymentMethod === 'nagad' && (
                        <div className="absolute top-1 right-1.5 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                      )}
                    </button>

                    {/* Rocket */}
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentMethod('rocket');
                        setCopiedNumber(false);
                      }}
                      className={`p-3 sm:p-3.5 rounded-2xl border-2 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all duration-300 relative overflow-hidden group ${
                        paymentMethod === 'rocket' 
                          ? 'bg-gradient-to-br from-purple-500/25 via-purple-600/15 to-purple-950/40 border-purple-500 text-purple-300 font-bold shadow-[0_0_20px_rgba(168,85,247,0.35)] scale-[1.02]' 
                          : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:border-purple-500/40 hover:bg-purple-500/10'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-400/50 flex items-center justify-center text-purple-400 font-black text-xs group-hover:scale-110 transition-transform">
                        RK
                      </div>
                      <span className="text-xs font-bold text-white">Rocket</span>
                      <span className="text-[9px] opacity-80 font-mono">রকেট / Upay</span>
                      {paymentMethod === 'rocket' && (
                        <div className="absolute top-1 right-1.5 w-2 h-2 rounded-full bg-purple-400 animate-ping" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Receiver Info & One-click Copy Box */}
                <div className="relative z-10 p-4 sm:p-4.5 rounded-2xl bg-[#030712]/90 border-2 border-cyan-500/30 text-xs space-y-3 shadow-inner">
                  <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3">
                    <div className="space-y-0.5">
                      <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-cyan-400" />
                        <span>প্রাপক নম্বর ({paymentMethod.toUpperCase()} Personal):</span>
                      </span>
                      <span className="text-[10px] text-slate-400 block font-mono">
                        উক্ত নম্বরে সেন্ড মানি (Send Money) করুন
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <strong className="text-cyan-300 font-mono text-sm tracking-widest bg-cyan-500/10 px-3 py-1.5 rounded-xl border border-cyan-500/40 shadow-sm">
                        {getTargetPaymentNumber()}
                      </strong>
                      <button
                        type="button"
                        onClick={() => handleCopyNumber(getTargetPaymentNumber())}
                        className={`px-3 py-1.5 rounded-xl text-[11px] font-bold font-mono flex items-center gap-1.5 transition-all cursor-pointer border ${
                          copiedNumber
                            ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                            : 'bg-white/10 hover:bg-cyan-500/20 text-cyan-300 border-cyan-400/40 hover:border-cyan-400'
                        }`}
                        title="নম্বর কপি করুন"
                      >
                        {copiedNumber ? (
                          <>
                            <CheckCheck className="w-3.5 h-3.5" />
                            <span>কপি হয়েছে!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>কপি</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {settings?.paymentInstructions ? (
                    <p className="text-[11px] text-slate-300 leading-relaxed whitespace-pre-line bg-white/5 p-3 rounded-xl border border-white/5">
                      {settings.paymentInstructions}
                    </p>
                  ) : (
                    <div className="space-y-1.5 text-[11px] text-slate-300 font-sans leading-relaxed">
                      <div className="flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
                        <span>{paymentMethod.toUpperCase()} অ্যাপ অথবা ইউএসএসডি (*247#) থেকে <strong>'Send Money'</strong> অপশন বাছুন।</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
                        <span>প্রাপক নম্বর <strong className="text-cyan-300 font-mono">{getTargetPaymentNumber()}</strong> এবং পরিমাণ <strong className="text-amber-400 font-mono">৳{selectedCourseForPayment.price}</strong> লিখুন।</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
                        <span>সেন্ড মানি সফল হলে প্রেরক নম্বর ও SMS-এ প্রাপ্ত <strong>Transaction ID (TrxID)</strong> নিচে লিখুন।</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Payment Submission Form */}
                <form onSubmit={handlePaymentSubmit} className="relative z-10 space-y-4 text-xs">
                  {paymentSuccessMessage ? (
                    <div className="p-5 rounded-2xl bg-emerald-500/15 border-2 border-emerald-500/40 text-emerald-300 space-y-3 text-center shadow-[0_0_30px_rgba(16,185,129,0.2)] animate-fade-in">
                      <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
                      <h4 className="font-bold text-base text-white">পেমেন্ট রিকোয়েস্ট সফলভাবে জমা হয়েছে!</h4>
                      <p className="text-xs text-slate-200 leading-relaxed max-w-md mx-auto">
                        {paymentSuccessMessage}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCourseForPayment(null);
                          setPaymentSuccessMessage('');
                        }}
                        className="mt-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-extrabold cursor-pointer hover:from-emerald-400 hover:to-teal-400 transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                      >
                        ঠিক আছে (Done)
                      </button>
                    </div>
                  ) : (
                    <>
                      {paymentError && (
                        <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-semibold flex items-center gap-2.5 shadow-sm">
                          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                          <span>{paymentError}</span>
                        </div>
                      )}

                      <div className="space-y-1.5">
                        <label className="block text-slate-200 font-bold text-xs flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-cyan-400" />
                          <span>প্রেরক নম্বর (Sender Mobile Number) <span className="text-rose-400">*</span></span>
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            required
                            placeholder="যেমন: 017XXXXXXXX"
                            value={senderPhone}
                            onChange={(e) => setSenderPhone(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/90 border-2 border-cyan-500/30 text-white placeholder:text-slate-500 focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(34,211,238,0.25)] outline-none font-mono text-sm transition-all"
                          />
                          <Phone className="w-4 h-4 text-cyan-400/60 absolute left-3.5 top-3 pointer-events-none" />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-slate-200 font-bold text-xs flex items-center gap-1.5">
                          <Hash className="w-3.5 h-3.5 text-cyan-400" />
                          <span>ট্রানজেকশন আইডি (Transaction ID / TrxID) <span className="text-rose-400">*</span></span>
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            required
                            placeholder="যেমন: 9J82KSLA10"
                            value={transactionId}
                            onChange={(e) => setTransactionId(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/90 border-2 border-cyan-500/30 text-white placeholder:text-slate-500 focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(34,211,238,0.25)] outline-none font-mono uppercase text-sm transition-all"
                          />
                          <Hash className="w-4 h-4 text-cyan-400/60 absolute left-3.5 top-3 pointer-events-none" />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={paymentSubmitting}
                        className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_0_30px_rgba(34,211,238,0.4)] disabled:opacity-50 btn-shine hover:scale-[1.01]"
                      >
                        <CreditCard className="w-4 h-4 text-slate-950" />
                        <span>{paymentSubmitting ? 'প্রসেসিং করা হচ্ছে...' : 'পেমেন্ট সাবমিট করুন (Confirm Payment)'}</span>
                      </button>

                      <div className="pt-2 flex items-center justify-center gap-4 text-[10px] text-slate-400 font-mono border-t border-white/5">
                        <span className="flex items-center gap-1">
                          <Shield className="w-3 h-3 text-cyan-400" />
                          <span>256-Bit SSL Encrypted</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Zap className="w-3 h-3 text-amber-400" />
                          <span>Instant Admin Review</span>
                        </span>
                      </div>
                    </>
                  )}
                </form>
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Eligibility Banner & Notice */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900/90 to-cyan-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xl mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-emerald-400 font-mono uppercase tracking-wider block font-bold">
                  কোর্স অ্যাক্সেস কনফার্মেশন (Eligible Enrolled Course)
                </span>
                <span className="text-white text-xs sm:text-sm font-bold">
                  ইউ আর এলিজেবল ফর দা কোর্স: <span className="text-cyan-300 underline underline-offset-4 decoration-cyan-500/50">{selectedCourseFilter !== 'All' ? selectedCourseFilter : (enrolledCourses.length > 0 ? enrolledCourses.join(', ') : 'আপনার এনরোলকৃত কোর্স')}</span>
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] bg-emerald-500/20 text-emerald-200 border border-emerald-500/30 px-3 py-1 rounded-full font-mono">
                ✓ Eligible Student
              </span>
            </div>
          </div>

          {/* Control Panel: Search & Subject/Course Filters */}
          <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-4 mb-8 space-y-3">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              {/* Search bar */}
              <div className="relative w-full lg:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="সার্চ করুন (যেমন: Quantum, Carbon)..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-cyan-400 text-slate-200 text-sm outline-none transition-colors"
                />
              </div>

              {/* Course Display */}
              <div className="flex items-center gap-3 w-full sm:w-auto shrink-0 flex-wrap">
                {displayDropdownCourses.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-slate-300 font-mono flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                      এনরোলকৃত কোর্স:
                    </span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {displayDropdownCourses.map(c => (
                        <span key={c.id} className="px-3 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/35 text-emerald-300 text-xs font-bold font-sans flex items-center gap-1.5 shadow-sm">
                          <span>📚</span>
                          <span>{c.title}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Subject Pills */}
              <div className="flex flex-wrap gap-2 w-full lg:w-auto justify-start lg:justify-end overflow-x-auto pb-1 lg:pb-0">
                {subjects.map(subj => (
                  <button
                    key={subj}
                    onClick={() => setSelectedSubject(subj)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                      selectedSubject === subj
                        ? 'bg-cyan-500 text-slate-950 font-semibold shadow-[0_0_10px_rgba(34,211,238,0.4)]'
                        : 'bg-white/5 text-slate-300 border border-white/10 hover:text-white hover:border-cyan-500/20'
                    }`}
                  >
                    {subj === 'All' ? 'সব বিষয়' : subj}
                  </button>
                ))}
              </div>
            </div>
          </div>

      {/* Main Grid: Interactive Video Player (with Horizontal PDFs below) & Video Master List (Large Banners on Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 mb-12 items-start">
        
        {/* Left Column (8 of 12 cols on Desktop): Active Class Video Player & Horizontal PDF Notes Directly Below It */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-8" id="active-video-player-container">
          
          {/* 1. Active Lecture Video Player Card */}
          <div className="border border-white/10 rounded-2xl bg-white/5 overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2 text-cyan-400">
                <Video className="w-5 h-5" />
                <span className="font-mono text-xs font-semibold tracking-wider uppercase">Active Lecture Video Player</span>
              </div>
              {activeVideo && (
                <div className="flex items-center gap-2 flex-wrap">
                  {activeVideo.courseTitle && (
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 truncate max-w-[200px]">
                      📚 {activeVideo.courseTitle}
                    </span>
                  )}
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                    {activeVideo.subject}
                  </span>
                </div>
              )}
            </div>

            {/* Video Canvas frame */}
            {activeVideo ? (
              <div className="w-full bg-slate-950 border-b border-white/10 overflow-hidden shadow-2xl">
                <div className="aspect-video w-full bg-black relative group overflow-hidden">
                  {!isPlayingVideo && activeVideo.thumbnailUrl ? (
                    <div 
                      onClick={() => {
                        setIsPlayingVideo(true);
                        setTimeout(() => {
                          videoRef.current?.play().catch(() => {});
                        }, 50);
                      }}
                      className="absolute inset-0 z-10 cursor-pointer flex items-center justify-center bg-cover bg-center transition-all duration-300 select-none"
                      style={{ backgroundImage: `url(${activeVideo.thumbnailUrl})` }}
                    >
                      <div className="absolute inset-0 bg-slate-950/50 group-hover:bg-slate-950/30 transition-all" />
                      <div className="relative z-20 w-16 h-16 rounded-full bg-cyan-500/90 hover:bg-cyan-400 text-slate-950 flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.6)] transform group-hover:scale-110 transition-all border border-cyan-300">
                        <Play className="w-8 h-8 fill-slate-950 ml-1" />
                      </div>
                      <div className="absolute bottom-4 left-4 right-4 z-20 bg-slate-950/80 backdrop-blur-md p-3 rounded-xl border border-white/10 flex items-center justify-between text-xs text-slate-200">
                        <span className="font-semibold truncate">{activeVideo.title}</span>
                        <span className="text-cyan-400 font-bold shrink-0 ml-2">প্লে করুন ▶</span>
                      </div>
                    </div>
                  ) : null}

                  {(() => {
                    const embedUrl = formatVideoEmbedUrl(activeVideo.videoUrl);
                    const isIframe = isIframeVideoUrl(activeVideo.videoUrl);

                    if (isIframe) {
                      const finalSrc = embedUrl + (isPlayingVideo && activeVideo.thumbnailUrl ? (embedUrl.includes('?') ? '&autoplay=1' : '?autoplay=1') : '');
                      return (
                        <iframe
                          src={finalSrc}
                          title={activeVideo.title}
                          className="w-full h-full border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        />
                      );
                    }

                    if (activeVideo.videoUrl && activeVideo.videoUrl.startsWith('blob:')) {
                      return (
                        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-slate-900 text-rose-300">
                          <p className="font-bold text-sm mb-2">⚠️ ভিডিও লিঙ্কটি ব্রাউজারের অস্থায়ী মেমরি (Blob) থেকে তৈরি হয়েছিল</p>
                          <p className="text-xs text-slate-400 max-w-md">অ্যাডমিন প্যানেলে আপলোড মেকানিজম আপডেট করা হয়েছে। স্থায়ীভাবে সকল ডিভাইসে প্লে করার জন্য অনুগ্রহ করে অ্যাডমিন ড্যাশবোর্ড থেকে ভিডিওটি পুনরায় আপলোড করুন।</p>
                        </div>
                      );
                    }

                    return (
                      <video
                        ref={videoRef}
                        key={`${activeVideo.id}_${activeVideo.videoUrl}`}
                        poster={activeVideo.thumbnailUrl}
                        controls
                        controlsList="nodownload"
                        disablePictureInPicture
                        playsInline
                        preload="auto"
                        autoPlay={isPlayingVideo}
                        onContextMenu={(e) => e.preventDefault()}
                        className="w-full h-full object-contain select-none bg-black"
                        onError={(e) => {
                          console.warn("Video failed to play:", activeVideo.videoUrl, e);
                        }}
                      >
                        <source src={activeVideo.videoUrl} type="video/mp4" />
                        <source src={activeVideo.videoUrl} type="video/webm" />
                        <source src={activeVideo.videoUrl} type="video/ogg" />
                        <p className="p-4 text-center text-xs text-slate-400">
                          আপনার ডিভাইসে ভিডিওটি প্লে করা যাচ্ছে না। 
                          <a href={activeVideo.videoUrl} target="_blank" rel="noreferrer" className="text-cyan-400 underline ml-1 font-bold">
                            এখানে ক্লিক করুন
                          </a>
                        </p>
                      </video>
                    );
                  })()}
                </div>

                {/* Video Player Settings & Security Toolbar */}
                <div className="bg-slate-900/90 border-t border-white/10 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
                  {/* Security Badge */}
                  <div className="flex items-center gap-2 text-emerald-400 font-mono text-[11px]">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>সুরক্ষিত প্লেয়ার (ডাউনলোড নিষিদ্ধ)</span>
                  </div>

                  {/* Settings Trigger Button */}
                  <div className="relative flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowPlayerSettings(!showPlayerSettings)}
                      className={`px-3 py-1.5 rounded-lg border transition-all flex items-center gap-2 font-semibold cursor-pointer ${
                        showPlayerSettings
                          ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                          : 'bg-white/10 hover:bg-white/15 text-slate-200 border-white/15'
                      }`}
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>সেটিংস ({playbackSpeed}x • {selectedQuality})</span>
                      <ChevronRight className={`w-3.5 h-3.5 transition-transform ${showPlayerSettings ? 'rotate-90' : ''}`} />
                    </button>

                    {/* Settings Dropdown Popover */}
                    {showPlayerSettings && (
                      <div className="absolute right-0 bottom-full mb-2 w-72 bg-slate-950/95 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-4 shadow-2xl z-30 space-y-3.5 animate-fade-in text-slate-200">
                        <div className="flex items-center justify-between pb-2 border-b border-white/10">
                          <div className="flex items-center gap-1.5 text-cyan-400 font-bold text-xs">
                            <Sliders className="w-4 h-4" />
                            <span>ভিডিও সেটিংস (Video Settings)</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowPlayerSettings(false)}
                            className="p-1 text-slate-400 hover:text-white rounded-full cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Playback Speed Controls */}
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">
                            প্লেব্যাক স্পিড (Playback Speed)
                          </label>
                          <div className="grid grid-cols-3 gap-1.5">
                            {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
                              <button
                                key={speed}
                                type="button"
                                onClick={() => handleSpeedChange(speed)}
                                className={`py-1.5 px-2 rounded-lg text-[11px] font-mono transition-all cursor-pointer ${
                                  playbackSpeed === speed
                                    ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                                    : 'bg-white/5 hover:bg-white/10 text-slate-300'
                                }`}
                              >
                                {speed === 1 ? '1.0x (স্বাভাবিক)' : `${speed}x`}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Video Quality Controls */}
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">
                            ভিডিও কোয়ালিটি (Resolution Quality)
                          </label>
                          <div className="grid grid-cols-2 gap-1.5">
                            {['Auto (1080p)', '720p (HD)', '480p (SD)', '360p'].map((quality) => (
                              <button
                                key={quality}
                                type="button"
                                onClick={() => setSelectedQuality(quality)}
                                className={`py-1.5 px-2.5 rounded-lg text-[11px] font-mono transition-all flex items-center justify-between cursor-pointer ${
                                  selectedQuality === quality
                                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                                    : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-transparent'
                                }`}
                              >
                                <span>{quality}</span>
                                {selectedQuality === quality && <Check className="w-3 h-3 text-cyan-400" />}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="pt-2 border-t border-white/10 text-[10px] text-slate-400 flex items-center gap-1.5">
                          <Lock className="w-3 h-3 text-amber-400 shrink-0" />
                          <span>কপিরাইট ও ডাউনলোড সিকিউরিটি সক্রিয়</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="aspect-video w-full bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-slate-500 rounded-2xl border border-white/10">
                <AlertCircle className="w-12 h-12 text-cyan-500/30 mb-2" />
                <p>কোনো ভিডিও ক্লাস এভেলেবল নেই</p>
                <span className="text-xs text-slate-600 mt-1">Please upload science classes in administrative settings</span>
              </div>
            )}

            {/* Video description */}
            {activeVideo && (
              <div className="p-5 sm:p-6 bg-white/5">
                <div className="flex justify-between items-start gap-4 mb-3">
                  <h2 className="text-xl md:text-2xl font-display font-bold text-white leading-tight">
                    {activeVideo.title}
                  </h2>
                  <button 
                    onClick={() => toggleBookmark(activeVideo.id)}
                    className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer shrink-0"
                    title="Bookmark Class"
                  >
                    <Bookmark className={`w-5 h-5 ${bookmarkedIds.includes(activeVideo.id) ? 'fill-cyan-400 text-cyan-400' : ''}`} />
                  </button>
                </div>
                
                <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line border-t border-white/10 pt-4 font-sans">
                  {activeVideo.description}
                </p>

                <div className="flex items-center gap-4 text-xs font-mono text-slate-400 mt-4 pt-4 border-t border-white/10 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    আপলোড: {new Date(activeVideo.createdAt).toLocaleDateString()}
                  </span>
                  <span>•</span>
                  <span>Science Studio Digital Classroom</span>
                </div>
              </div>
            )}
          </div>

          {/* 2. PDF Lecture Notes Section (DISPLAYED HORIZONTALLY BELOW THE PLAYER FROM LEFT TO RIGHT) */}
          <div className="border border-white/10 rounded-2xl bg-white/5 p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <h3 className="font-display font-bold text-lg sm:text-xl text-white flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-rose-500 rounded-full" />
                  <FileText className="w-5 h-5 text-rose-400" />
                  লেকচার শিট ও পিডিএফ নোটস ({filteredNotes.length})
                </h3>
                <p className="text-slate-400 text-xs mt-1 font-sans">
                  👈 বাম থেকে ডানে স্ক্রল করে সব পিডিএফ নোটস পড়ুন ও ডাউনলোড করুন 👉
                </p>
              </div>

              {/* Left/Right Horizontal Scroll Navigation Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => scrollNotes('left')}
                  className="p-2 rounded-xl bg-white/5 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-400/50 text-slate-300 hover:text-cyan-300 transition-all cursor-pointer shadow-sm active:scale-95"
                  title="বাম দিকে স্ক্রল করুন"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollNotes('right')}
                  className="p-2 rounded-xl bg-white/5 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-400/50 text-slate-300 hover:text-cyan-300 transition-all cursor-pointer shadow-sm active:scale-95"
                  title="ডান দিকে স্ক্রল করুন"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Horizontal Scrollable Strip of PDFs (Left to Right) */}
            <div 
              ref={notesScrollRef}
              className="flex gap-4 overflow-x-auto pb-4 pt-1 custom-scrollbar snap-x scroll-smooth"
            >
              {filteredNotes.length > 0 ? (
                filteredNotes.map(note => (
                  <div 
                    key={note.id} 
                    className="w-[280px] sm:w-[320px] shrink-0 snap-start p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-white/10 hover:border-cyan-400/50 hover:shadow-[0_0_20px_rgba(34,211,238,0.15)] transition-all duration-300 flex flex-col justify-between group"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between mb-3 gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-mono uppercase bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-md font-bold">
                            {note.subject}
                          </span>
                          {note.courseTitle && (
                            <span className="text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-md truncate max-w-[130px]">
                              📚 {note.courseTitle}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.5 rounded flex items-center gap-1 shrink-0">
                          <FileText className="w-3 h-3" /> PDF
                        </span>
                      </div>

                      {/* PDF Card Preview Body */}
                      <div className="bg-slate-950/60 p-3 rounded-xl border border-white/5 mb-3 group-hover:border-cyan-500/20 transition-colors">
                        <h4 className="font-display font-bold text-sm sm:text-base text-white group-hover:text-cyan-300 transition-colors line-clamp-2 mb-1.5 leading-snug">
                          {note.title}
                        </h4>
                        <p className="text-slate-300 text-xs line-clamp-2 leading-relaxed font-sans">
                          {note.description || 'রিভিশন ও অনুশীলনের জন্য লেকচার শিট।'}
                        </p>
                      </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleOpenPDF(note)}
                        className="flex-1 py-2 px-3 rounded-xl bg-cyan-500/15 border border-cyan-500/30 hover:bg-cyan-500/30 hover:border-cyan-400 text-cyan-300 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                        <span>নোট পড়ুন (View)</span>
                      </button>
                      <button
                        onClick={() => handleDownloadPDF(note)}
                        className="p-2 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-400 hover:bg-cyan-500/15 text-slate-300 hover:text-cyan-300 transition-all cursor-pointer shrink-0 active:scale-95"
                        title="ডাউনলোড করুন"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openPdfInBrowser(note.pdfUrl)}
                        className="p-2 rounded-xl bg-white/5 border border-white/10 hover:border-purple-400 hover:bg-purple-500/15 text-slate-300 hover:text-purple-300 transition-all cursor-pointer shrink-0 active:scale-95"
                        title="ব্রাউজারে নতুন ট্যাবে খুলুন"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="w-full p-8 rounded-2xl border border-dashed border-white/10 text-center text-slate-400 text-sm">
                  বর্তমান ফিল্টারে কোনো পিডিএফ লেকচার নোট পাওয়া যায়নি।
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Column (4 of 12 cols on Desktop): UPLOADED CLASSES PLAYLIST WITH LARGE BANNERS (Top to Bottom) */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-4">
          
          {/* Playlist Header */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 shadow-lg flex items-center justify-between gap-2">
            <div>
              <h3 className="font-display font-bold text-base sm:text-lg text-white flex items-center gap-2">
                <span className="w-1.5 h-5 bg-cyan-400 rounded-full" />
                আপলোড করা সকল ক্লাস ({filteredClasses.length})
              </h3>
              <p className="text-slate-400 text-[11px] mt-0.5 font-sans">
                উপরে থেকে নিচে ক্রমানুসারে সাজানো (Class Playlist)
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-mono font-bold shrink-0">
              {filteredClasses.length} Classes
            </span>
          </div>

          {/* Top-to-Bottom Playlist with Large Banners */}
          <div className="space-y-4 max-h-[920px] overflow-y-auto pr-1.5 custom-scrollbar">
            {filteredClasses.length > 0 ? (
              filteredClasses.map((cls, idx) => {
                const isActive = activeVideo?.id === cls.id;
                return (
                  <div
                    key={cls.id}
                    onClick={() => {
                      setActiveVideo(cls);
                      setIsPlayingVideo(true);
                      // On mobile, scroll up to the player smoothly
                      if (window.innerWidth < 1024) {
                        document.getElementById('active-video-player-container')?.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    className={`rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden group ${
                      isActive
                        ? 'bg-gradient-to-br from-cyan-950/60 via-slate-900/90 to-slate-950 border-cyan-400 shadow-[0_0_25px_rgba(34,211,238,0.25)] ring-1 ring-cyan-400/60 scale-[1.01]'
                        : 'bg-slate-900/80 hover:bg-slate-800/90 border-white/10 hover:border-cyan-500/40 hover:shadow-[0_0_20px_rgba(34,211,238,0.15)]'
                    }`}
                  >
                    {/* 1. Large 16:9 Banner Image Header */}
                    <div className="w-full aspect-video sm:h-44 rounded-t-2xl relative overflow-hidden bg-slate-950 border-b border-white/10 select-none">
                      {cls.thumbnailUrl ? (
                        <img 
                          src={cls.thumbnailUrl} 
                          alt={cls.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-cyan-950 via-slate-900 to-blue-950 flex flex-col items-center justify-center p-4 text-center relative overflow-hidden">
                          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-cyan-500/10 rounded-full blur-xl" />
                          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 mb-2 shadow-lg group-hover:scale-110 transition-transform">
                            <Video className="w-6 h-6" />
                          </div>
                          <span className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider">{cls.subject} Masterclass</span>
                        </div>
                      )}

                      {/* Top Overlay Badges */}
                      <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1.5 pointer-events-none z-10">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-mono font-bold uppercase bg-slate-950/80 backdrop-blur-md text-cyan-300 border border-cyan-400/40 px-2 py-0.5 rounded-lg shadow-sm">
                            {cls.subject}
                          </span>
                          {cls.courseTitle && (
                            <span className="text-[10px] font-mono font-semibold bg-purple-950/85 backdrop-blur-md text-purple-300 border border-purple-400/40 px-2 py-0.5 rounded-lg truncate max-w-[150px] shadow-sm">
                              📚 {cls.courseTitle}
                            </span>
                          )}
                        </div>

                        {/* Bookmark Button (Allows click) */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleBookmark(cls.id);
                          }}
                          className="pointer-events-auto p-1.5 rounded-lg bg-slate-950/80 backdrop-blur-md border border-white/15 text-slate-300 hover:text-cyan-300 transition-colors shadow cursor-pointer"
                          title="বুকমার্ক করুন"
                        >
                          <Bookmark className={`w-3.5 h-3.5 ${bookmarkedIds.includes(cls.id) ? 'fill-cyan-400 text-cyan-400' : ''}`} />
                        </button>
                      </div>

                      {/* Center Play Overlay / Now Playing Status Indicator */}
                      <div className="absolute inset-0 bg-slate-950/40 group-hover:bg-slate-950/20 transition-all flex items-center justify-center">
                        {isActive ? (
                          <div className="px-3.5 py-1.5 rounded-full bg-cyan-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.8)] border border-cyan-300 animate-pulse">
                            <span className="w-2 h-2 rounded-full bg-slate-950 animate-ping" />
                            <span>▶ চলমান ক্লাস (Playing)</span>
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/30 text-white flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:bg-cyan-500 group-hover:text-slate-950 group-hover:border-cyan-300 transition-all">
                            <Play className="w-5 h-5 ml-0.5 fill-current" />
                          </div>
                        )}
                      </div>

                      {/* Bottom Banner Info Bar */}
                      <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-[10px] font-mono text-slate-200 bg-slate-950/85 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-cyan-400" />
                          {new Date(cls.createdAt).toLocaleDateString()}
                        </span>
                        <span className="font-bold text-cyan-300">ক্লাস #{idx + 1}</span>
                      </div>
                    </div>

                    {/* 2. Card Content Body */}
                    <div className="p-4 space-y-2.5">
                      <h4 className={`font-display font-bold text-sm sm:text-base line-clamp-2 leading-snug transition-colors ${
                        isActive ? 'text-cyan-300' : 'text-white group-hover:text-cyan-300'
                      }`}>
                        {cls.title}
                      </h4>

                      {cls.description && (
                        <p className="text-slate-300 text-xs line-clamp-2 font-sans leading-relaxed">
                          {cls.description}
                        </p>
                      )}

                      {/* Action & Status Row */}
                      <div className="flex items-center justify-between pt-2.5 border-t border-white/10 text-xs">
                        <span className={`font-semibold flex items-center gap-1 text-[11px] ${
                          isActive ? 'text-cyan-400 font-bold' : 'text-slate-400'
                        }`}>
                          {isActive ? '✓ বর্তমানে চলছে' : 'প্লে করতে ক্লিক করুন'}
                        </span>
                        
                        <div className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                          isActive 
                            ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.5)]'
                            : 'bg-white/5 group-hover:bg-cyan-500/20 text-cyan-400 border border-white/10 group-hover:border-cyan-400/50'
                        }`}>
                          <span>{isActive ? 'চলমান' : 'ক্লাস দেখুন'}</span>
                          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 rounded-2xl border border-dashed border-white/10 text-center text-slate-400 text-sm">
                কোনো ম্যাচিং ক্লাস পাওয়া যায়নি।
              </div>
            )}
          </div>

        </div>

      </div>

      {/* PDF Viewer Simulation Modal Modal */}
      {activeNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setActiveNote(null)} />
          
          <div className="relative w-full max-w-4xl h-[85vh] bg-slate-900 border border-white/10 rounded-2xl overflow-hidden z-10 flex flex-col shadow-2xl">
            {/* Header */}
            <div className="p-4 bg-slate-950 border-b border-white/10 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded bg-cyan-500/10 text-cyan-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-white font-display font-bold text-sm md:text-base">{activeNote.title}</h3>
                  <span className="text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-1.5 py-0.5 rounded uppercase">
                    {activeNote.subject}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openPdfInBrowser(activeNote.pdfUrl)}
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border border-white/10"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                  <span>ব্রাউজারে দেখুন</span>
                </button>
                <button
                  onClick={() => handleDownloadPDF(activeNote)}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-[0_0_12px_rgba(6,182,212,0.3)]"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>ডাউনলোড</span>
                </button>
                <button
                  onClick={() => setActiveNote(null)}
                  className="p-2 text-slate-400 hover:text-white rounded-xl bg-white/5 border border-white/10 hover:border-rose-400/60 hover:bg-rose-500/15 hover:shadow-[0_0_15px_rgba(244,63,94,0.3)] transition-all cursor-pointer group"
                  title="বন্ধ করুন (Close)"
                >
                  <X className="w-5 h-5 group-hover:scale-110 group-hover:rotate-90 transition-transform duration-300" />
                </button>
              </div>
            </div>

            {/* Simulated Document content body */}
            <div className="flex-1 overflow-y-auto p-6 md:p-12 bg-slate-900/60 text-slate-300 max-w-3xl mx-auto w-full border-x border-white/10 font-sans space-y-6">
              <div className="text-center pb-6 border-b border-white/10">
                <div className="text-[10px] font-mono tracking-widest text-cyan-400 mb-1 uppercase">Science Studio Lecture Resource</div>
                <h1 className="text-2xl md:text-3xl font-display font-bold text-white mb-2">{activeNote.title}</h1>
                <p className="text-slate-400 text-xs">{activeNote.description}</p>
              </div>

              {/* PDF Mock Content Body */}
              <div className="space-y-4 text-sm leading-relaxed">
                <h3 className="font-display font-bold text-white text-base">১. মূল আলোচনা ও বৈজ্ঞানিক তথ্য (Overview)</h3>
                <p>
                  বিজ্ঞান চর্চার অগ্রযাত্রায় বিজ্ঞানের তত্ত্বগুলো সঠিক পর্যবেক্ষণের মাধ্যমে প্রমাণিত। এই নোটে উক্ত বিষয়ের সব গুরুত্বপূর্ণ অংশগুলো সহজে সাজিয়ে দেওয়া হয়েছে যাতে পরীক্ষার প্রস্তুতি নেওয়া সহজ হয়।
                </p>
                
                <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/20 font-mono text-xs text-cyan-300 space-y-2">
                  <div className="font-semibold text-cyan-200">বিজ্ঞানের গুরুত্বপূর্ণ সমীকরণসমূহ (Key Equations):</div>
                  <div>• Physics Basic Relation: E = mc² (Einstein relation)</div>
                  <div>• Quantum energy packets: E = hν (Planck relation)</div>
                  <div>• Chemistry reaction constant: pH = -log[H+]</div>
                  <div>• DNA base pairings: A-T (Double Hydrogen Bond), G-C (Triple Hydrogen Bond)</div>
                </div>

                <h3 className="font-display font-bold text-white text-base">২. সৃজনশীল ও গাণিতিক প্রশ্নাবলী (Practice Questions)</h3>
                <p>
                  পরীক্ষায় সর্বাধিক কমন উপযোগী কিছু প্রশ্ন নিচে যুক্ত করা হলো। এই প্রশ্নগুলো নিজে সমাধান করার চেষ্টা করুন এবং যেকোনো সমস্যায় সরাসরি ডাউট ফোরাম বা ক্লাসরুমে শিক্ষকদের সহায়তা নিন।
                </p>

                <ul className="list-decimal list-inside space-y-2 text-slate-400 text-xs pl-2">
                  <li>প্লাংকের ধ্রুবক কী এবং এর মান কত? শক্তির বিকিরণ কোয়ান্টাম নীতি ব্যাখ্যা কর।</li>
                  <li>জৈব যৌগে হাইব্রিডাইজেশন কীভাবে ঘটে? অ্যালকেন এবং অ্যালকিনের রাসায়নিক বিক্রিয়া উদাহরণসহ বিশ্লেষণ কর।</li>
                  <li>মাইটোটিক কোষ বিভাজনের অ্যানাফেজ দশার প্রধান বৈশিষ্ট্যগুলো চিত্রসহ বর্ণনা কর।</li>
                </ul>

                <div className="p-4 rounded-lg bg-slate-950 border border-white/5 text-center text-xs text-slate-400 mt-8">
                  <p>© 2026 Science Studio. All rights reserved. For internal coaching purposes only.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )}
</div>
  );
}
