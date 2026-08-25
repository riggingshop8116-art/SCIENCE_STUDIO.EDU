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

  // Authentication & session recovery
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem('science_studio_token');
      if (!token) {
        setLoading(false);
        return;
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
          // Auto route to active area
          if (data.user.role === 'admin') {
            setCurrentTab('admin');
          } else {
            setCurrentTab('classroom');
          }
        } else if (!response.ok) {
          // Token expired or invalid
          localStorage.removeItem('science_studio_token');
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
    
    // Success redirect logic
    if (authData.user.role === 'admin') {
      setCurrentTab('admin');
    } else {
      setCurrentTab('classroom');
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('science_studio_token');
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
      <main className="flex-1 pb-28 lg:pb-0 w-full">
        {currentTab === 'home' && (
          <Hero
            onJoinClick={() => {
              setAuthModalIsAdmin(false);
              setAuthModalInitialMode('register');
              setAuthModalOpen(true);
            }}
            onExploreClick={() => setCurrentTab(user?.role === 'admin' ? 'admin' : 'classroom')}
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

      {/* High-Fidelity Futuristic Footer */}
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
