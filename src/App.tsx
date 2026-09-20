import React, { useState, useEffect } from 'react';
import { User, Class, Note, Course, AuthResponse, Settings } from './types';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import AuthModal from './components/AuthModal';
import StudentDashboard from './components/StudentDashboard';
import AdminDashboard from './components/AdminDashboard';
import ScienceBackground from './components/ScienceBackground';
import InteractiveScience from './components/InteractiveScience';
import RoutineContactModals from './components/RoutineContactModals';
import Footer from './components/Footer';
import { Atom, Compass, Mail, Phone, MapPin, Sparkles, Shield } from 'lucide-react';

const defaultSettings: Settings = {
  academyName: "SCIENCE STUDIO by Sakib",
  announcement: "ADMISSIONS NOW OPEN FOR ACADEMIC YEAR 2026",
  heroTitle: "Innovate, Educate & Explore with Science Studio by Sakib",
  heroSubtitle: "বিজ্ঞান চর্চাকে সহজ, আনন্দদায়ক এবং প্রযুক্তিনির্ভর করতে সাকিব স্যারের এই বিশেষ উদ্যোগ। Science Studio by Sakib-এ রয়েছে সেরা মানের ভিডিও লেকচার, ইন্টারেক্টিভ সিমুলেটর এবং সার্বক্ষণিক ডাউট সলভ মেন্টরশিপ।",
  heroSubEnglish: "Experience premium science coaching with high-fidelity interactive simulation play desks, curated video masterclasses, and concise PDF materials by Sakib Sir.",
  subjects: ["Physics", "Chemistry", "Biology", "Mathematics", "General Science"],
  contactPhone: "+৮৮০ ১৭০০-০০০০০০, +৮৮০ ১৯০০-০০০০০০",
  contactEmail: "support@sciencestudio.com",
  contactAddress: "বিজ্ঞান পার্ক রোড, ফার্মগেট, ঢাকা - ১২১৫",
  footerDescription: "সাকিব স্যারের তত্ত্ববধানে পরিচালিত একটি আধুনিক ও প্রযুক্তিনির্ভর বিজ্ঞান শিক্ষা কেন্দ্র। আমরা প্রতিটি স্টুডেন্টের মেধা বিকাশে এবং বিজ্ঞানকে সহজভাবে বোঝার সুব্যবস্থা নিশ্চিত করি।"
};

// 30 Minutes Inactivity Timeout in milliseconds
const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000;

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [classes, setClasses] = useState<Class[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalIsAdmin, setAuthModalIsAdmin] = useState(false);
  const [authModalInitialMode, setAuthModalInitialMode] = useState<'login' | 'register'>('login');
  const [routineModalOpen, setRoutineModalOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [sessionExpiredMessage, setSessionExpiredMessage] = useState<string | null>(null);

  // User activity tracker: records last interaction timestamp in localStorage
  useEffect(() => {
    let lastSaved = 0;
    const recordActivity = () => {
      const now = Date.now();
      if (now - lastSaved > 5000) {
        lastSaved = now;
        localStorage.setItem('science_studio_last_active', String(now));
      }
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];
    events.forEach(evt => window.addEventListener(evt, recordActivity, { passive: true }));

    return () => {
      events.forEach(evt => window.removeEventListener(evt, recordActivity));
    };
  }, []);

  // Save current active tab so user can resume exactly where they left off before timeout
  useEffect(() => {
    if (user && currentTab) {
      localStorage.setItem('science_studio_saved_tab', currentTab);
    }
  }, [currentTab, user]);

  // Periodic inactivity monitor: auto logouts user if idle for more than 30 minutes
  useEffect(() => {
    if (!user) return;

    const inactivityInterval = setInterval(() => {
      const lastActiveStr = localStorage.getItem('science_studio_last_active');
      if (lastActiveStr) {
        const lastActive = parseInt(lastActiveStr, 10);
        if (!isNaN(lastActive) && Date.now() - lastActive > INACTIVITY_TIMEOUT_MS) {
          handleLogout();
          setSessionExpiredMessage("নিরাপত্তার স্বার্থে দীর্ঘক্ষণ নিষ্ক্রিয় থাকার কারণে আপনার আইডিটি স্বয়ংক্রিয়ভাবে লগআউট করা হয়েছে। ক্লাসরুমে প্রবেশ করতে পুনরায় লগইন করুন।");
          setAuthModalInitialMode('login');
          setAuthModalOpen(true);
        }
      }
    }, 10000);

    return () => clearInterval(inactivityInterval);
  }, [user]);

  // Fetch static website settings & courses
  const fetchSettingsAndCourses = async () => {
    try {
      const [settingsRes, coursesRes] = await Promise.all([
        fetch('/api/settings').catch(() => null),
        fetch('/api/courses').catch(() => null)
      ]);

      if (settingsRes && settingsRes.ok) {
        const contentType = settingsRes.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await settingsRes.json();
          if (data && typeof data === 'object') {
            setSettings(prev => ({ ...prev, ...data }));
          }
        }
      }

      if (coursesRes && coursesRes.ok) {
        const contentType = coursesRes.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const courseData = await coursesRes.json();
          if (Array.isArray(courseData)) {
            setCourses(courseData);
          }
        }
      }

      // Also refetch current user info if logged in to keep profile in sync
      const token = localStorage.getItem('science_studio_token');
      if (token) {
        const meResponse = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (meResponse.ok) {
          const meContentType = meResponse.headers.get('content-type');
          if (meContentType && meContentType.includes('application/json')) {
            const meData = await meResponse.json();
            if (meData?.user) {
              setUser(meData.user);
            }
          }
        }
      }
    } catch (err) {
      console.warn("Notice: transient error fetching settings or courses");
    }
  };

  useEffect(() => {
    fetchSettingsAndCourses();
    const settingsInterval = setInterval(() => {
      fetchSettingsAndCourses();
    }, 15000);
    return () => clearInterval(settingsInterval);
  }, []);

  // Authentication & session recovery with inactivity validation
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem('science_studio_token');
      // Rule: New device or unauthenticated visitor always starts on Homepage ('home')
      if (!token) {
        setCurrentTab('home');
        setLoading(false);
        return;
      }

      // Check if session has expired due to inactivity
      const lastActiveStr = localStorage.getItem('science_studio_last_active');
      const now = Date.now();
      if (lastActiveStr) {
        const lastActive = parseInt(lastActiveStr, 10);
        if (!isNaN(lastActive) && now - lastActive > INACTIVITY_TIMEOUT_MS) {
          localStorage.removeItem('science_studio_token');
          localStorage.removeItem('science_studio_last_active');
          localStorage.removeItem('science_studio_saved_tab');
          setUser(null);
          setCurrentTab('home');
          setSessionExpiredMessage("নিরাপত্তার স্বার্থে দীর্ঘক্ষণ নিষ্ক্রিয় থাকার কারণে আপনার আইডিটি স্বয়ংক্রিয়ভাবে লগআউট করা হয়েছে। ক্লাসরুমে প্রবেশ করতে পুনরায় লগইন করুন।");
          setLoading(false);
          return;
        }
      }

      try {
        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const contentType = response.headers.get('content-type');
        if (response.ok && contentType && contentType.includes('application/json')) {
          const data = await response.json();
          setUser(data.user);
          localStorage.setItem('science_studio_last_active', String(Date.now()));

          // State Preservation: Return user to the exact tab they were working on before leaving
          const savedTab = localStorage.getItem('science_studio_saved_tab');
          if (savedTab && ['home', 'classroom', 'admin', 'lab', 'admin-settings'].includes(savedTab)) {
            if (savedTab.startsWith('admin') && data.user.role !== 'admin') {
              setCurrentTab('classroom');
            } else {
              setCurrentTab(savedTab);
            }
          } else {
            setCurrentTab(data.user.role === 'admin' ? 'admin' : 'classroom');
          }
        } else if (!response.ok) {
          // Token expired or invalid
          localStorage.removeItem('science_studio_token');
          localStorage.removeItem('science_studio_saved_tab');
          setCurrentTab('home');
        }
      } catch (err) {
        console.warn("Notice: session restoration retry pending", err);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  // Fetch classes and notes
  const fetchContent = async () => {
    const token = localStorage.getItem('science_studio_token') || (user ? `token-${user.id}` : null);
    if (!token) return;

    try {
      // Fetch classes
      const classRes = await fetch('/api/classes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const classContentType = classRes.headers.get('content-type');
      if (classRes.ok && classContentType && classContentType.includes('application/json')) {
        const classData = await classRes.json();
        setClasses(classData);
      }

      // Fetch notes
      const noteRes = await fetch('/api/notes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const noteContentType = noteRes.headers.get('content-type');
      if (noteRes.ok && noteContentType && noteContentType.includes('application/json')) {
        const noteData = await noteRes.json();
        setNotes(noteData);
      }
    } catch (err) {
      console.warn("Notice: content fetch retry pending", err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchContent();
      const interval = setInterval(() => {
        fetchContent();
      }, 6000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleAuthSuccess = (authData: AuthResponse) => {
    setUser(authData.user);
    localStorage.setItem('science_studio_token', authData.token);
    localStorage.setItem('science_studio_last_active', String(Date.now()));
    setSessionExpiredMessage(null);
    
    // Resume preserved tab if available, else route to default
    const savedTab = localStorage.getItem('science_studio_saved_tab');
    if (savedTab && savedTab !== 'home' && (!savedTab.startsWith('admin') || authData.user.role === 'admin')) {
      setCurrentTab(savedTab);
    } else {
      setCurrentTab(authData.user.role === 'admin' ? 'admin' : 'classroom');
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('science_studio_token');
    localStorage.removeItem('science_studio_last_active');
    localStorage.removeItem('science_studio_saved_tab');
    setClasses([]);
    setNotes([]);
    setCurrentTab('home');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex flex-col items-center justify-center text-white relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative flex flex-col items-center justify-center p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl max-w-sm w-full mx-4">
          <div className="relative flex items-center justify-center mb-6">
            <Atom className="w-12 h-12 text-cyan-400 animate-spin" />
            <div className="absolute w-20 h-20 border border-cyan-500/20 rounded-full animate-ping" />
          </div>
          <p className="font-mono text-xs tracking-widest text-cyan-400 animate-pulse uppercase">
            Initializing Science Studio by Sakib...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#0b0f19] text-gray-200 relative overflow-x-hidden">
      
      {/* Immersive Science Ambient Background Layer */}
      <ScienceBackground />
      
      {/* Session Expired Inactivity Notification Banner */}
      {sessionExpiredMessage && (
        <div className="bg-amber-500/15 border-b border-amber-500/30 text-amber-200 px-4 py-2.5 flex items-center justify-between gap-3 text-xs sm:text-sm font-sans z-50 backdrop-blur-md">
          <div className="flex items-center gap-2 max-w-4xl mx-auto">
            <Shield className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{sessionExpiredMessage}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                setAuthModalIsAdmin(false);
                setAuthModalInitialMode('login');
                setAuthModalOpen(true);
                setSessionExpiredMessage(null);
              }}
              className="px-3 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-lg text-xs transition-colors cursor-pointer"
            >
              পুনরায় লগইন
            </button>
            <button 
              type="button"
              onClick={() => setSessionExpiredMessage(null)}
              className="p-1 hover:bg-white/10 rounded-md text-amber-400 cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Top Navigation */}
      <Navbar
        user={user}
        onLogout={handleLogout}
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenAuth={() => {
          setAuthModalIsAdmin(false);
          setAuthModalInitialMode('login');
          setAuthModalOpen(true);
        }}
        settings={settings}
        onUpdateUser={(updatedUser) => setUser(updatedUser)}
        onOpenRoutine={() => setRoutineModalOpen(true)}
        onOpenContact={() => setContactModalOpen(true)}
      />

      {/* Main Dynamic Workspace Section */}
      <main className={`flex-1 w-full ${currentTab === 'admin' || currentTab === 'admin-settings' ? 'pb-0' : 'pb-28 lg:pb-0'}`}>
        {currentTab === 'home' && (
          <Hero
            onJoinClick={() => {
              setAuthModalIsAdmin(false);
              setAuthModalInitialMode('register');
              setAuthModalOpen(true);
            }}
            onExploreClick={() => {
              if (!user) {
                setAuthModalIsAdmin(false);
                setAuthModalInitialMode('login');
                setAuthModalOpen(true);
              } else {
                setCurrentTab(user?.role === 'admin' ? 'admin' : 'classroom');
              }
            }}
            isLoggedIn={!!user}
            settings={settings}
            courses={courses}
            onOpenRoutine={() => setRoutineModalOpen(true)}
            onOpenContact={() => setContactModalOpen(true)}
            onExploreLab={() => {
              setCurrentTab('lab');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentTab === 'lab' && (
          <div className="w-full max-w-[1800px] mx-auto px-2 sm:px-4 lg:px-8 py-6 sm:py-8 animate-fade-in">
            <InteractiveScience settings={settings} />
          </div>
        )}

        {currentTab === 'classroom' && user && (
          <StudentDashboard
            user={user}
            classes={classes}
            notes={notes}
            settings={settings}
            onUpdateUser={(updatedUser) => setUser(updatedUser)}
            onLogout={handleLogout}
          />
        )}

        {(currentTab === 'admin' || currentTab === 'admin-settings') && user && user.role === 'admin' && (
          <AdminDashboard
            user={user}
            classes={classes}
            notes={notes}
            onRefreshData={fetchContent}
            settings={settings}
            onRefreshSettings={fetchSettingsAndCourses}
            initialSection={currentTab === 'admin-settings' ? 'settings' : 'dashboard'}
          />
        )}
      </main>

      {/* High-Fidelity Futuristic Footer - Displayed on public & student views */}
      {currentTab !== 'admin' && currentTab !== 'admin-settings' && (
        <Footer
          settings={settings}
          user={user}
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          onOpenAuth={() => {
            setAuthModalIsAdmin(false);
            setAuthModalInitialMode('login');
            setAuthModalOpen(true);
          }}
          onOpenAdminAuth={() => {
            setAuthModalIsAdmin(true);
            setAuthModalInitialMode('login');
            setAuthModalOpen(true);
          }}
          onOpenRoutine={() => setRoutineModalOpen(true)}
          onOpenContact={() => setContactModalOpen(true)}
        />
      )}

      {/* Auth Portal Dialog */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
        isAdminMode={authModalIsAdmin}
        initialMode={authModalInitialMode}
      />

      {/* Global Weekly Routine & Helpline Modals */}
      <RoutineContactModals
        routineModalOpen={routineModalOpen}
        onCloseRoutine={() => setRoutineModalOpen(false)}
        contactModalOpen={contactModalOpen}
        onCloseContact={() => setContactModalOpen(false)}
        settings={settings}
      />
    </div>
  );
}
