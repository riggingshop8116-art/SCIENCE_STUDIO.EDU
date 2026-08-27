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
  CheckCheck,
  Key,
  Filter,
  ArrowDown,
  ArrowRight,
  Layers,
  HelpCircle
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
    return user.enrolledCourseTitles && user.enrolledCourseTitles.length > 0
      ? user.enrolledCourseTitles
      : [];
  });

  useEffect(() => {
    if (user.enrolledCourseTitles) {
      setEnrolledCourses(user.enrolledCourseTitles);
    }
  }, [user.enrolledCourseTitles]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch('/api/courses');
        if (res.ok) {
          const data: Course[] = await res.json();
          setCoursesList(data);
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

      const updatedEnrolled = enrolledCourses.includes(courseTitle) ? enrolledCourses : [...enrolledCourses, courseTitle];
      setEnrolledCourses(updatedEnrolled);
      try {
        localStorage.setItem(`scicenter_enrolled_${user.id}`, JSON.stringify(updatedEnrolled));
      } catch (err) {
        console.error(err);
      }

      if (onUpdateUser) {
        onUpdateUser({
          ...user,
          enrolledCourseTitles: updatedEnrolled,
          transactionId: transactionId.trim(),
          paymentMethod: paymentMethod,
          senderPhone: senderPhone.trim(),
          isApproved: false
        });
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
  const rawEnrolledTitles = React.useMemo(() => {
    const list: string[] = [];
    if (user.enrolledCourseTitles && Array.isArray(user.enrolledCourseTitles)) {
      user.enrolledCourseTitles.forEach(t => {
        if (t && typeof t === 'string' && t.trim() && !list.includes(t.trim())) {
          list.push(t.trim());
        }
      });
    }
    if (user.course && typeof user.course === 'string' && user.course.trim()) {
      if (!list.includes(user.course.trim())) {
        list.push(user.course.trim());
      }
    }
    if (Array.isArray(enrolledCourses)) {
      enrolledCourses.forEach(c => {
        if (c && typeof c === 'string' && c.trim() && !list.includes(c.trim())) {
          list.push(c.trim());
        }
      });
    }
    return list;
  }, [user.enrolledCourseTitles, user.course, enrolledCourses]);

  // Filter against active courses in coursesList so deleted courses are auto-removed for student
  const userEnrolledTitles = React.useMemo(() => {
    const activeCourseTitles = coursesList.map(c => c.title.trim().toLowerCase());
    return coursesList.length > 0
      ? rawEnrolledTitles.filter(t => activeCourseTitles.includes(t.trim().toLowerCase()))
      : rawEnrolledTitles;
  }, [coursesList, rawEnrolledTitles]);

  // Filter courses for dropdown: ONLY show courses that the student is enrolled in!
  const displayDropdownCourses = React.useMemo(() => {
    return coursesList.filter(c => 
      userEnrolledTitles.some(t => t.trim().toLowerCase() === c.title.trim().toLowerCase())
    );
  }, [coursesList, userEnrolledTitles]);

  // Filter video classes and notes: ONLY show content matching student's enrolled course(s) and class level if selected
  const filteredClasses = React.useMemo(() => {
    return classes.filter(cls => {
      const belongsToEnrolledCourse = userEnrolledTitles.length === 0 || 
                                     !cls.courseTitle || 
                                     userEnrolledTitles.some(t => t.trim().toLowerCase() === cls.courseTitle?.trim().toLowerCase());
      if (!belongsToEnrolledCourse) return false;

      if (selectedClassFilter !== 'All') {
        const parentCourse = coursesList.find(c => c.title.trim().toLowerCase() === cls.courseTitle?.trim().toLowerCase());
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
      const belongsToEnrolledCourse = userEnrolledTitles.length === 0 || 
                                     !note.courseTitle || 
                                     userEnrolledTitles.some(t => t.trim().toLowerCase() === note.courseTitle?.trim().toLowerCase());
      if (!belongsToEnrolledCourse) return false;

      if (selectedClassFilter !== 'All') {
        const parentCourse = coursesList.find(c => c.title.trim().toLowerCase() === note.courseTitle?.trim().toLowerCase());
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

  // User is considered pending approval ONLY if they have enrolled in a course or submitted transaction details, AND are not yet approved by admin.
  // Newly registered students without any course enrollment / transaction submission will see their account page & unlocked classroom & available courses.
  const hasEnrolledOrTrx = Boolean(
    (user.enrolledCourseTitles && user.enrolledCourseTitles.length > 0) ||
    (enrolledCourses && enrolledCourses.length > 0) ||
    (user.transactionId && user.transactionId.trim().length > 0)
  );
  const isPendingApproval = !user.isApproved && hasEnrolledOrTrx;

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
              <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full font-bold ${
                user.isApproved 
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' 
                  : isPendingApproval
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}>
                {user.isApproved ? 'Active Student' : isPendingApproval ? 'Pending Approval' : 'Registered Student'}
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
                : isPendingApproval
                  ? 'আপনার কোর্স এনরোলমেন্ট বর্তমানে অ্যাডমিন অনুমোদনের অপেক্ষায় রয়েছে। ভেরিফিকেশন সম্পন্ন হলে স্বয়ংক্রিয়ভাবে পূর্ণ ক্লাসরুম আনলক হবে।'
                  : 'স্বাগতম! যেকোনো কোর্সে এনরোল করে সম্পূর্ণ প্রিমিয়াম ক্লাসরুম আনলক করুন। নিচে সকল কোর্স ও ক্লাসরুমের উপকরণ দেওয়া হলো।'}
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

      {isPendingApproval ? (
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
              setPaymentError('');
            }}
          />
        </div>
      ) : (
        <>
          {/* Eligibility / Status Banner */}
          {user.isApproved ? (
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
                  ✓ Eligible Active Student
                </span>
              </div>
            </div>
          ) : null}

          {/* Dedicated Unlock Classroom: Left Div (Your Classroom is Locked) + Right Div (3-Branch Vertical Line Tree) */}
          {!user.isApproved && (
            <div className="mb-8 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#061224]/95 via-[#0a1b38]/90 to-[#041021]/95 border-2 border-amber-500/30 hover:border-cyan-500/40 shadow-[0_0_50px_rgba(245,158,11,0.12)] relative overflow-hidden transition-all">
              {/* Ambient glowing orbs */}
              <div className="absolute -top-24 -right-24 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
                {/* Left Div: YOUR CLASSROOM IS LOCKED (Centered Large Lock Icon) & Directing Arrow */}
                <div className="lg:col-span-5 bg-gradient-to-b from-amber-950/40 via-slate-900/90 to-slate-950/90 border-2 border-amber-500/40 rounded-2xl p-6 sm:p-7 flex flex-col justify-between items-center text-center shadow-2xl relative overflow-hidden group">
                  {/* Glow corner */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
                  
                  <div className="space-y-4 w-full flex flex-col items-center">
                    {/* Centered Large Lock Icon with pulse & ping aura */}
                    <div className="relative mx-auto mb-1">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-amber-500/30 via-orange-500/20 to-amber-500/10 border-2 border-amber-400/70 flex items-center justify-center text-amber-300 shadow-[0_0_35px_rgba(245,158,11,0.5)]">
                        <Lock className="w-10 h-10 sm:w-12 sm:h-12 animate-pulse text-amber-300" />
                      </div>
                      <span className="absolute -top-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500"></span>
                      </span>
                    </div>

                    <div className="flex flex-col items-center">
                      <span className="text-[10px] font-mono font-extrabold uppercase px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 inline-block tracking-wider mb-1.5">
                        ACCESS RESTRICTED
                      </span>
                      <h2 className="text-xl sm:text-2xl font-display font-extrabold text-white leading-tight">
                        ইউর ক্লাসরুম ইজ লক
                      </h2>
                      <p className="text-xs font-mono text-amber-400/90 font-bold mt-0.5">
                        Your Classroom is Locked
                      </p>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans max-w-sm mx-auto">
                      প্রিয় শিক্ষার্থী, সায়েন্স স্টুডিওর প্রিমিয়াম ভিডিও লেকচার, এক্সক্লুসিভ রিভিশন পিডিএফ শিট ও লাইভ ক্লাস বর্তমানে লক রয়েছে। ক্লাসরুমের সম্পূর্ণ এক্সেস আনলক করতে অনুগ্রহ করে ডানের ৩টি সহজ ধাপ সম্পন্ন করুন।
                    </p>
                  </div>

                  {/* Dynamic Arrow Indicator Pointing to the Right Steps */}
                  <div className="pt-6 mt-4 border-t border-white/10 space-y-3 w-full">
                    <div className="p-3 sm:p-3.5 rounded-xl bg-gradient-to-r from-amber-500/15 via-cyan-500/15 to-emerald-500/15 border border-amber-400/40 flex items-center justify-between gap-2 shadow-inner">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-amber-200">
                          👉 গাইডলাইন অনুসরণ করুন:
                        </span>
                        <span className="text-xs text-cyan-300 font-bold hidden sm:inline">
                          ডানের ৩টি ধাপ সম্পন্ন করুন
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-cyan-300 font-mono text-xs font-bold animate-pulse">
                        <span className="hidden xs:inline">ধাপসমূহ</span>
                        <ChevronRight className="w-4 h-4 text-cyan-300" />
                        <ChevronRight className="w-4 h-4 text-cyan-300 -ml-2.5" />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const el = document.getElementById('courses-section');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:from-amber-300 hover:to-orange-300 text-slate-950 font-display font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all cursor-pointer active:scale-95 group-hover:shadow-[0_0_25px_rgba(245,158,11,0.5)]"
                    >
                      <ShoppingBag className="w-4 h-4 text-slate-950" />
                      <span>কোর্স তালিকা দেখুন ও এনরোল করুন (Step 1)</span>
                    </button>
                  </div>
                </div>

                {/* Right Div: Vertical Dotted Spine Line connecting directly 1 to 2, and 2 to 3 */}
                <div className="lg:col-span-7 bg-[#0c162c]/90 border border-cyan-500/30 rounded-2xl p-5 sm:p-7 shadow-xl flex flex-col justify-between">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                        <Key className="w-5 h-5 animate-pulse" />
                      </div>
                      <div>
                        <h3 className="text-base sm:text-lg font-display font-extrabold text-white">
                          আনলক ক্লাসরুম প্রক্রিয়া (Unlock Classroom)
                        </h3>
                        <p className="text-xs text-slate-400">
                          নিচের ৩টি ধাপ ক্রমানুসারে সম্পন্ন করুন
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Vertical Timeline Tree with Centered Dotted Lines connecting 1 to 2, and 2 to 3 */}
                  <div className="space-y-4">
                    {/* Step 1 */}
                    <div className="relative flex items-start gap-3 sm:gap-4 group">
                      {/* Node column with centered vertical dotted line connecting 1 to 2 */}
                      <div className="flex flex-col items-center shrink-0">
                        {/* Node 1 */}
                        <div className="relative z-10 w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#091326] border-2 border-cyan-400 text-cyan-300 font-mono font-bold text-sm sm:text-base flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.4)] group-hover:scale-105 transition-transform">
                          ১
                        </div>
                        {/* Centered dotted line between 1 and 2 */}
                        <div className="w-0 h-14 sm:h-12 border-l-2 border-dashed border-cyan-400/60 my-1" />
                      </div>

                      {/* Step Card 1 */}
                      <div className="flex-1 p-3.5 sm:p-4 rounded-xl bg-white/[0.04] border border-white/10 hover:border-cyan-400/50 hover:bg-cyan-950/20 transition-all duration-300 space-y-1 shadow-md">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                            শাখা ১ : কোর্স নির্বাচন করুন
                          </h4>
                          <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
                            Step 01
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          নিচের কোর্স তালিকা থেকে আপনার শ্রেণী ও বিষয় অনুযায়ী কাঙ্ক্ষিত কোর্সটি বেছে নিয়ে <strong>'এনরোল করুন'</strong> বাটনে চাপুন।
                        </p>
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div className="relative flex items-start gap-3 sm:gap-4 group">
                      {/* Node column with centered vertical dotted line connecting 2 to 3 */}
                      <div className="flex flex-col items-center shrink-0">
                        {/* Node 2 */}
                        <div className="relative z-10 w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#091326] border-2 border-pink-400 text-pink-300 font-mono font-bold text-sm sm:text-base flex items-center justify-center shadow-[0_0_15px_rgba(244,114,182,0.4)] group-hover:scale-105 transition-transform">
                          ২
                        </div>
                        {/* Centered dotted line between 2 and 3 */}
                        <div className="w-0 h-14 sm:h-12 border-l-2 border-dashed border-pink-400/60 my-1" />
                      </div>

                      {/* Step Card 2 */}
                      <div className="flex-1 p-3.5 sm:p-4 rounded-xl bg-white/[0.04] border border-white/10 hover:border-pink-400/50 hover:bg-pink-950/20 transition-all duration-300 space-y-1 shadow-md">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-pink-300 transition-colors">
                            শাখা ২ : পেমেন্ট ও TrxID সাবমিট
                          </h4>
                          <span className="text-[10px] font-mono uppercase text-pink-400 font-bold px-2 py-0.5 rounded bg-pink-500/10 border border-pink-500/20">
                            Step 02
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          বিকাশ/নগদ/রকেটে কোর্স ফি Send Money করে আপনার প্রেরক নম্বর ও SMS-এ প্রাপ্ত <strong>Transaction ID (TrxID)</strong> সাবমিট করুন।
                        </p>
                      </div>
                    </div>

                    {/* Step 3 */}
                    <div className="relative flex items-start gap-3 sm:gap-4 group">
                      {/* Node column for Node 3 (Terminal node) */}
                      <div className="flex flex-col items-center shrink-0">
                        {/* Node 3 */}
                        <div className="relative z-10 w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#091326] border-2 border-emerald-400 text-emerald-300 font-mono font-bold text-sm sm:text-base flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.4)] group-hover:scale-105 transition-transform">
                          ৩
                        </div>
                      </div>

                      {/* Step Card 3 */}
                      <div className="flex-1 p-3.5 sm:p-4 rounded-xl bg-white/[0.04] border border-white/10 hover:border-emerald-400/50 hover:bg-emerald-950/20 transition-all duration-300 space-y-1 shadow-md">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                            শাখা ৩ : ভেরিফিকেশন ও ক্লাসরুম আনলক
                          </h4>
                          <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                            Step 03
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          অ্যাডমিন কর্তৃক আপনার পেমেন্ট ভেরিফাই সম্পন্ন হওয়া মাত্রই আপনার সম্পূর্ণ ক্লাসরুম ও স্টাডি মেটেরিয়াল স্বয়ংক্রিয়ভাবে আনলক হয়ে যাবে!
                        </p>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Published Courses Section (কোর্সসমূহ) - Only shown for unapproved students to enroll */}
          {!user.isApproved && coursesList.length > 0 && (
            <div id="courses-section" className="mb-10 p-6 sm:p-7 rounded-3xl bg-[#081224]/80 backdrop-blur-xl border border-cyan-500/20 shadow-2xl space-y-6 scroll-mt-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-5">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-teal-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400 shrink-0 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-display font-extrabold text-white flex items-center gap-2.5">
                      <span>কোর্সসমূহ (Available Courses)</span>
                      <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        {displayCoursesList.length} টি কোর্স
                      </span>
                    </h2>
                    <p className="text-xs text-slate-300 mt-0.5">
                      আপনার প্রয়োজনীয় কোর্সে এনরোল করে সম্পূর্ণ প্রিমিয়াম ক্লাসরুম আনলক করুন
                    </p>
                  </div>
                </div>

                {/* Class Level Dropdown Menu */}
                {classOptions.length > 0 && (
                  <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    <div className="relative flex items-center gap-2 w-full sm:w-auto">
                      <div className="flex items-center gap-1.5 text-xs font-mono text-cyan-300 font-bold shrink-0">
                        <Filter className="w-4 h-4 text-cyan-400" />
                        <span>শ্রেণী ফিল্টার:</span>
                      </div>

                      <div className="relative flex-1 sm:flex-initial">
                        <select
                          value={selectedClassFilter}
                          onChange={(e) => setSelectedClassFilter(e.target.value)}
                          className="w-full sm:w-64 appearance-none pl-3.5 pr-9 py-2 rounded-xl bg-slate-900/90 border-2 border-cyan-500/40 hover:border-cyan-400 text-white font-mono text-xs font-bold focus:outline-none focus:ring-2 focus:ring-cyan-400/50 shadow-inner cursor-pointer transition-all"
                        >
                          <option value="All" className="bg-slate-900 text-white">
                            সকল শ্রেণী ({coursesList.length} টি কোর্স)
                          </option>
                          {classOptions.map(clsName => {
                            const count = coursesList.filter(c => c.classLevel?.trim().toLowerCase() === clsName.trim().toLowerCase()).length;
                            return (
                              <option key={clsName} value={clsName} className="bg-slate-900 text-white">
                                {clsName} ({count} টি কোর্স)
                              </option>
                            );
                          })}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-cyan-400 text-[10px]">
                          ▼
                        </div>
                      </div>

                      {selectedClassFilter !== 'All' && (
                        <button
                          type="button"
                          onClick={() => setSelectedClassFilter('All')}
                          className="px-2.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white text-xs font-mono transition-all cursor-pointer"
                          title="ফিল্টার রিসেট করুন"
                        >
                          সব দেখুন
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Courses Grid */}
              {displayCoursesList.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-white/5 border border-white/10 space-y-3">
                  <BookOpen className="w-10 h-10 text-slate-500 mx-auto" />
                  <p className="text-sm font-semibold text-slate-300">
                    "{selectedClassFilter}" শ্রেণীর জন্য বর্তমানে কোনো কোর্স পাওয়া যায়নি।
                  </p>
                  <button
                    type="button"
                    onClick={() => setSelectedClassFilter('All')}
                    className="px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-bold font-mono hover:bg-cyan-500/30 transition-all cursor-pointer"
                  >
                    সকল কোর্স দেখুন
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
                  {displayCoursesList.map((course) => {
                    const isEnrolledInThis = userEnrolledTitles.includes(course.title);
                    return (
                      <div
                        key={course.id}
                        className="group relative rounded-2xl bg-gradient-to-b from-slate-900/90 to-[#0a1428]/95 border-2 border-white/10 hover:border-cyan-400/60 p-4 sm:p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-[0_0_30px_rgba(34,211,238,0.2)] hover:-translate-y-1 overflow-hidden"
                      >
                        {/* Top Badges & Image */}
                        <div className="space-y-3.5">
                          {course.imageUrl ? (
                            <div className="w-full h-36 rounded-xl overflow-hidden border border-white/10 relative group-hover:border-cyan-400/40 transition-colors bg-slate-950">
                              <img
                                src={course.imageUrl}
                                alt={course.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                              <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
                                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-950/80 text-cyan-300 border border-cyan-400/40 backdrop-blur-md">
                                  {course.subject}
                                </span>
                                {course.classLevel && (
                                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-400/40 backdrop-blur-md">
                                    {course.classLevel}
                                  </span>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                                {course.subject}
                              </span>
                              {course.classLevel && (
                                <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/30">
                                  {course.classLevel}
                                </span>
                              )}
                            </div>
                          )}

                          <div>
                            <h3 className="text-base sm:text-lg font-display font-extrabold text-white group-hover:text-cyan-300 transition-colors line-clamp-2">
                              {course.title}
                            </h3>
                            {course.description && (
                              <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                                {course.description}
                              </p>
                            )}
                          </div>

                          {/* Features checklist */}
                          {course.features && course.features.length > 0 && (
                            <ul className="space-y-1 text-[11px] text-slate-300 font-sans">
                              {course.features.slice(0, 3).map((feat, idx) => (
                                <li key={idx} className="flex items-center gap-1.5">
                                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                  <span className="truncate">{feat}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>

                        {/* Price & Action Button */}
                        <div className="pt-4 mt-4 border-t border-white/10 space-y-3">
                          <div className="flex items-baseline justify-between">
                            <div>
                              <span className="text-[10px] font-mono text-slate-400 block">কোর্স ফি</span>
                              <div className="flex items-baseline gap-2">
                                <span className="text-lg sm:text-xl font-display font-black text-cyan-300">
                                  ৳{course.price.toLocaleString('bn-BD')}
                                </span>
                                {course.originalPrice && course.originalPrice > course.price && (
                                  <span className="text-xs text-slate-500 line-through">
                                    ৳{course.originalPrice.toLocaleString('bn-BD')}
                                  </span>
                                )}
                              </div>
                            </div>
                            {course.duration && (
                              <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                                <Clock className="w-3 h-3 text-cyan-400" />
                                <span>{course.duration}</span>
                              </span>
                            )}
                          </div>

                          {isEnrolledInThis && user.isApproved ? (
                            <div className="w-full py-2.5 px-3 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold font-mono flex items-center justify-center gap-1.5 shadow-sm">
                              <CheckCircle className="w-4 h-4 text-emerald-400" />
                              <span>এনরোলকৃত (Active)</span>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedCourseForPayment(course);
                                setPaymentSuccessMessage('');
                                setPaymentError('');
                              }}
                              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 font-display font-black text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(34,211,238,0.3)] transition-all cursor-pointer active:scale-95 group-hover:shadow-[0_0_25px_rgba(34,211,238,0.5)]"
                            >
                              <CreditCard className="w-4 h-4 text-slate-950" />
                              <span>এনরোল করুন (Enroll Now)</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* When user is approved: show Control Panel & Main Video Player Grid */}
          {user.isApproved && (
            <>
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
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-400/50 text-slate-300 hover:text-cyan-300 transition-all cursor-pointer shadow-sm active:scale-95 flex items-center gap-1 text-xs font-semibold"
                  title="বাম দিকে স্ক্রল করুন"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>পূর্বে</span>
                </button>
                <button
                  type="button"
                  onClick={() => scrollNotes('right')}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-400/50 text-slate-300 hover:text-cyan-300 transition-all cursor-pointer shadow-sm active:scale-95 flex items-center gap-1 text-xs font-semibold"
                  title="ডান দিকে স্ক্রল করুন"
                >
                  <span>পরবর্তী</span>
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
        <div className="lg:col-span-5 xl:col-span-4 space-y-4 lg:sticky lg:top-20">
          
          {/* Playlist Header */}
          <div className="px-4.5 py-4 rounded-2xl bg-[#091326]/90 backdrop-blur-md border border-cyan-500/25 shadow-lg flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center text-cyan-400 shrink-0">
                <Video className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-sm sm:text-base text-white flex items-center gap-1.5">
                  আপলোডকৃত ক্লাস তালিকা
                </h3>
                <p className="text-slate-400 text-[11px] font-sans">
                  উপরে থেকে নিচে স্ক্রল করে ক্লাস নির্বাচন করুন
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-400/30 text-xs font-mono font-bold shrink-0 shadow-sm">
              {filteredClasses.length} Classes
            </span>
          </div>

          {/* Top-to-Bottom Playlist with Large Banners and Dedicated Scroll Container */}
          <div className="space-y-4 max-h-[640px] lg:max-h-[calc(100vh-190px)] overflow-y-auto pr-2 custom-scrollbar overscroll-contain rounded-2xl">
            {filteredClasses.length > 0 ? (
              filteredClasses.map((cls, idx) => {
                const isActive = activeVideo?.id === cls.id;
                
                // Get the best banner URL: explicit cover banner -> youtube thumbnail -> parent course image -> gradient graphic
                let bannerUrl = cls.thumbnailUrl?.trim() || '';
                if (!bannerUrl && cls.videoUrl) {
                  let ytId = '';
                  if (cls.videoUrl.includes('youtube.com/watch')) {
                    const match = cls.videoUrl.match(/[?&]v=([^&#]+)/);
                    if (match && match[1]) ytId = match[1];
                  } else if (cls.videoUrl.includes('youtu.be/')) {
                    ytId = cls.videoUrl.split('youtu.be/')[1]?.split('?')[0]?.split('&')[0]?.split('#')[0] || '';
                  } else if (cls.videoUrl.includes('youtube.com/embed/')) {
                    ytId = cls.videoUrl.split('embed/')[1]?.split('?')[0]?.split('&')[0]?.split('#')[0] || '';
                  }
                  if (ytId) {
                    bannerUrl = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
                  }
                }
                if (!bannerUrl && cls.courseTitle) {
                  const parentCourse = coursesList.find(c => c.title.trim().toLowerCase() === cls.courseTitle?.trim().toLowerCase());
                  if (parentCourse?.imageUrl) {
                    bannerUrl = parentCourse.imageUrl;
                  }
                }

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
                    className={`rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden group relative ${
                      isActive
                        ? 'bg-gradient-to-br from-[#0c223d] via-[#09172c] to-[#061020] border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.3)] ring-1 ring-cyan-400/70 scale-[1.01]'
                        : 'bg-[#091326]/90 hover:bg-[#0d1d36]/90 border-white/10 hover:border-cyan-500/40 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]'
                    }`}
                  >
                    {/* 1. Large 16:9 Banner Image Header */}
                    <div className="w-full aspect-[16/9] relative overflow-hidden bg-slate-950 border-b border-white/10 select-none">
                      {bannerUrl ? (
                        <img 
                          src={bannerUrl} 
                          alt={cls.title} 
                          referrerPolicy="no-referrer"
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
                          <span className="text-[10px] font-mono font-bold uppercase bg-slate-950/85 backdrop-blur-md text-cyan-300 border border-cyan-400/40 px-2.5 py-0.5 rounded-lg shadow-sm">
                            {cls.subject}
                          </span>
                          {cls.courseTitle && (
                            <span className="text-[10px] font-mono font-semibold bg-purple-950/85 backdrop-blur-md text-purple-300 border border-purple-400/40 px-2.5 py-0.5 rounded-lg truncate max-w-[150px] shadow-sm">
                              📚 {cls.courseTitle}
                            </span>
                          )}
                        </div>

                        {/* Bookmark Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleBookmark(cls.id);
                          }}
                          className="pointer-events-auto p-1.5 rounded-lg bg-slate-950/85 backdrop-blur-md border border-white/15 text-slate-300 hover:text-cyan-300 hover:border-cyan-400/50 transition-all shadow cursor-pointer active:scale-95"
                          title="বুকমার্ক করুন"
                        >
                          <Bookmark className={`w-3.5 h-3.5 ${bookmarkedIds.includes(cls.id) ? 'fill-cyan-400 text-cyan-400' : ''}`} />
                        </button>
                      </div>

                      {/* Center Play Overlay / Now Playing Status Indicator */}
                      <div className="absolute inset-0 bg-slate-950/35 group-hover:bg-slate-950/15 transition-all flex items-center justify-center">
                        {isActive ? (
                          <div className="px-3.5 py-1.5 rounded-full bg-cyan-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.8)] border border-cyan-300 animate-pulse">
                            <span className="w-2 h-2 rounded-full bg-slate-950 animate-ping" />
                            <span>▶ চলমান ক্লাস (Playing)</span>
                          </div>
                        ) : (
                          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-slate-950/85 backdrop-blur-md border border-white/30 text-white flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:bg-cyan-500 group-hover:text-slate-950 group-hover:border-cyan-300 transition-all">
                            <Play className="w-5 h-5 ml-0.5 fill-current" />
                          </div>
                        )}
                      </div>

                      {/* Bottom Banner Info Bar */}
                      <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-[10px] font-mono text-slate-200 bg-slate-950/85 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
                        <span className="flex items-center gap-1 text-slate-300">
                          <Clock className="w-3 h-3 text-cyan-400" />
                          {new Date(cls.createdAt).toLocaleDateString()}
                        </span>
                        <span className="font-bold text-cyan-300">ক্লাস #{idx + 1}</span>
                      </div>
                    </div>

                    {/* 2. Card Content Body with Professional Spacing & Padding */}
                    <div className="p-4 sm:p-4.5 space-y-2.5">
                      <h4 className={`font-display font-bold text-sm sm:text-[15px] line-clamp-2 leading-snug transition-colors ${
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
                      <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs">
                        <span className={`font-medium flex items-center gap-1.5 text-[11px] ${
                          isActive ? 'text-cyan-400 font-bold' : 'text-slate-400'
                        }`}>
                          {isActive ? '✓ বর্তমানে চলছে' : 'প্লে করতে ক্লিক করুন'}
                        </span>
                        
                        <div className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
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
    </>
  )}

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

  {/* Universal Payment Modal for Enrollment */}
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
  );
}
