import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Settings } from '../types';
import { 
  Atom, LogOut, Shield, User as UserIcon, BookOpen, Video, Home, 
  Sparkles, Calendar, Phone, Activity, Clock, X, CheckCircle, 
  AlertCircle, ChevronRight, HelpCircle, MapPin, Settings as SettingsIcon,
  Sun, Moon, Copy, CheckCheck, Headphones, MessageSquare, ExternalLink,
  ShieldCheck, Mail, Layers
} from 'lucide-react';
import LogoImage from '../assets/images/science_studio_logo_1784521830593.jpg';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenAuth: () => void;
  settings?: Settings;
  onUpdateUser?: (updatedUser: User) => void;
  onOpenRoutine?: () => void;
  onOpenContact?: () => void;
}

export default function Navbar({
  user,
  onLogout,
  currentTab,
  setCurrentTab,
  onOpenAuth,
  settings,
  onUpdateUser,
  onOpenRoutine,
  onOpenContact
}: NavbarProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('#user-profile-menu-container')) {
        setShowProfileMenu(false);
      }
    };
    if (showProfileMenu) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showProfileMenu]);

  // Helper to switch to lab section
  const scrollToPlayground = () => {
    setCurrentTab('lab');
  };

  return (
    <header className="w-full z-50 sticky top-0 backdrop-blur-2xl bg-[#060b18]/90 border-b border-cyan-500/20 shadow-[0_4px_30px_rgba(0,0,0,0.6)] transition-all duration-300" id="app-header">
      {/* High-visibility glowing neon accent divider line at the very bottom of header */}
      <div className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_2px_12px_rgba(34,211,238,0.7)]" />

      {/* Floating Glassmorphism Navbar (Responsive Full-Width & Balanced Spacing) */}
      <div className="w-full max-w-[1920px] mx-auto px-3 sm:px-6 lg:px-8 xl:px-12 py-3 sm:py-3.5">
        <nav className="flex items-center justify-between gap-4 lg:gap-6 w-full">
            
            {/* Brand Logo with Rounded Frame & Glow */}
            <div 
              onClick={() => {
                if (user?.role === 'admin') {
                  setCurrentTab('admin');
                } else if (user) {
                  setCurrentTab('classroom');
                } else {
                  setCurrentTab('home');
                }
              }} 
              className="flex items-center gap-3 sm:gap-4 cursor-pointer group py-0.5 shrink-0"
              id="nav-logo"
            >
              <div className="relative w-11 h-11 sm:w-14 sm:h-14 rounded-full overflow-hidden border-2 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.4)] group-hover:scale-105 group-hover:border-emerald-400 group-hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] transition-all duration-300 bg-slate-900 shrink-0">
                <img 
                  src={settings?.academyLogoUrl || LogoImage} 
                  alt="Science Studio Logo" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex flex-col justify-center">
                <span className="font-display font-black text-sm sm:text-lg md:text-xl lg:text-2xl tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-emerald-300 flex items-center gap-1.5 leading-tight uppercase drop-shadow-[0_2px_10px_rgba(34,211,238,0.3)] truncate max-w-[160px] xs:max-w-[220px] sm:max-w-none">
                  {settings?.academyName || "SCIENCE STUDIO by Sakib"}
                </span>
                <div className="text-[10px] sm:text-xs font-mono tracking-wider sm:tracking-widest text-emerald-400 font-bold uppercase mt-0.5 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block shrink-0" />
                  <span className="truncate">by Sakib Sir • Science Portal</span>
                </div>
              </div>
            </div>

            {/* Desktop 4 Main Navigation Items Container (Enlarged, Centered & Well-Adjusted Spacing) */}
            <div className="hidden lg:flex items-center justify-center gap-2 xl:gap-3.5 font-display bg-[#081224]/85 backdrop-blur-xl border border-cyan-500/30 p-1.5 rounded-2xl shadow-[0_0_25px_rgba(0,0,0,0.5)]">
              
              {/* 1. Home button */}
              {(!user || user.role !== 'admin') && (
                <button
                  id="nav-tab-home"
                  onClick={() => {
                    setCurrentTab('home');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`flex items-center gap-2.5 px-4.5 xl:px-6 py-2.5 xl:py-3 rounded-xl transition-all duration-300 font-black text-base xl:text-lg cursor-pointer ${
                    currentTab === 'home'
                      ? 'text-cyan-300 bg-cyan-500/25 border-2 border-cyan-400 shadow-[0_0_25px_rgba(34,211,238,0.4)] scale-[1.03]'
                      : 'text-slate-200 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/20'
                  }`}
                >
                  <Home className="w-5.5 h-5.5 xl:w-6 xl:h-6 text-cyan-400 shrink-0" />
                  <span className="whitespace-nowrap">হোম</span>
                </button>
              )}

              {/* 2. Virtual Lab Button */}
              {(!user || user.role !== 'admin') && (
                <button
                  onClick={scrollToPlayground}
                  className={`flex items-center gap-2.5 px-4.5 xl:px-6 py-2.5 xl:py-3 rounded-xl transition-all duration-300 font-black text-base xl:text-lg cursor-pointer ${
                    currentTab === 'lab'
                      ? 'text-cyan-300 bg-cyan-500/25 border-2 border-cyan-400 shadow-[0_0_25px_rgba(34,211,238,0.4)] scale-[1.03]'
                      : 'text-slate-200 hover:text-cyan-300 hover:bg-cyan-500/10 border border-transparent hover:border-cyan-500/30'
                  }`}
                >
                  <Atom className="w-5.5 h-5.5 xl:w-6 xl:h-6 text-cyan-400 animate-spin-slow shrink-0" />
                  <span className="whitespace-nowrap">ভার্চুয়াল ল্যাব</span>
                </button>
              )}

              {/* 3. Routine Schedule Button */}
              {!(currentTab === 'admin' || currentTab === 'admin-settings') && (
                <button
                  onClick={() => onOpenRoutine?.()}
                  className="flex items-center gap-2.5 px-4.5 xl:px-6 py-2.5 xl:py-3 rounded-xl text-slate-200 hover:text-emerald-300 hover:bg-emerald-500/15 transition-all duration-300 font-black text-base xl:text-lg cursor-pointer border border-transparent hover:border-emerald-500/30"
                >
                  <Calendar className="w-5.5 h-5.5 xl:w-6 xl:h-6 text-emerald-400 shrink-0" />
                  <span className="whitespace-nowrap">ক্লাস রুটিন</span>
                </button>
              )}

              {/* 4. Helpline direct button */}
              <button
                onClick={() => onOpenContact?.()}
                className="flex items-center gap-2.5 px-4.5 xl:px-6 py-2.5 xl:py-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 hover:border-amber-400 text-amber-300 hover:text-amber-200 transition-all font-black text-base xl:text-lg cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.25)] hover:shadow-[0_0_20px_rgba(245,158,11,0.4)]"
                title="সরাসরি একাডেমি হেল্পলাইন"
              >
                <Phone className="w-5 h-5 xl:w-5.5 xl:h-5.5 text-amber-400 shrink-0" />
                <span className="whitespace-nowrap">হেল্পলাইন</span>
              </button>

              {/* Classroom / Admin Panel button if logged in */}
              {user && (
                <button
                  id="nav-tab-classroom"
                  onClick={() => setCurrentTab(user.role === 'admin' ? 'admin' : 'classroom')}
                  className={`flex items-center gap-2.5 px-4.5 xl:px-6 py-2.5 xl:py-3 rounded-xl transition-all duration-300 font-black text-base xl:text-lg cursor-pointer ${
                    currentTab === 'classroom' || currentTab === 'admin'
                      ? 'text-cyan-300 bg-cyan-500/25 border-2 border-cyan-400 shadow-[0_0_25px_rgba(34,211,238,0.4)] scale-[1.03]'
                      : 'text-slate-200 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/20'
                  }`}
                >
                  {user.role === 'admin' ? (
                    <>
                      <Shield className="w-5.5 h-5.5 text-rose-400 animate-pulse shrink-0" />
                      <span className="whitespace-nowrap">অ্যাডমিন প্যানেল</span>
                    </>
                  ) : (
                    <>
                      <BookOpen className="w-5.5 h-5.5 text-cyan-400 shrink-0" />
                      <span className="whitespace-nowrap">আমার ক্লাসরুম</span>
                    </>
                  )}
                </button>
              )}

              {/* Settings button: Admin only */}
              {user && user.role === 'admin' && !(currentTab === 'admin' || currentTab === 'admin-settings') && (
                <button
                  id="nav-tab-settings"
                  onClick={() => setCurrentTab('admin-settings')}
                  className={`flex items-center gap-2.5 px-4.5 xl:px-6 py-2.5 xl:py-3 rounded-xl transition-all duration-300 font-black text-base xl:text-lg cursor-pointer ${
                    currentTab === 'admin-settings'
                      ? 'text-cyan-300 bg-cyan-500/25 border-2 border-cyan-400 shadow-[0_0_25px_rgba(34,211,238,0.4)] scale-[1.03]'
                      : 'text-slate-200 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/20'
                  }`}
                >
                  <SettingsIcon className="w-5.5 h-5.5 text-cyan-400 shrink-0" />
                  <span className="whitespace-nowrap">সেটিংস</span>
                </button>
              )}
            </div>

            {/* Profile / Auth Button Section (Guaranteed visible on both Mobile and Desktop) */}
            <div className="relative flex items-center gap-2 sm:gap-3 shrink-0" id="user-profile-menu-container">

              {user ? (
                <>
                  <div 
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center gap-1.5 sm:gap-2 bg-slate-900/90 hover:bg-slate-800/90 border border-cyan-500/30 hover:border-cyan-400/60 rounded-xl py-1 px-1.5 sm:px-2.5 cursor-pointer transition-all shadow-sm"
                  >
                    <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg overflow-hidden flex items-center justify-center shrink-0 ${user.role === 'admin' ? 'bg-rose-500/15 border border-rose-500/40 text-rose-400' : 'bg-cyan-500/15 border border-cyan-500/40 text-cyan-400'}`}>
                      {user.photoUrl || user.avatarUrl ? (
                        <img src={user.photoUrl || user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                      ) : user.role === 'admin' ? (
                        <Shield className="w-4 h-4" />
                      ) : (
                        <UserIcon className="w-4 h-4" />
                      )}
                    </div>
                    
                    <div className="text-left">
                      <div className="text-[11px] sm:text-xs font-bold text-gray-200 leading-none truncate max-w-[85px] xs:max-w-[100px] md:max-w-[130px]">{user.name}</div>
                      <span className={`text-[7.5px] sm:text-[8px] font-mono px-1 rounded-sm uppercase mt-0.5 inline-block font-semibold ${
                        user.role === 'admin' 
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/20' 
                          : !user.isApproved
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/20'
                      }`}>
                        {user.role === 'admin' ? 'অ্যাডমিন' : (!user.isApproved ? 'অনুমোদন অপেক্ষমাণ' : (user.studentClass || 'শিক্ষার্থী'))}
                      </span>
                    </div>

                    <button
                      id="logout-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        onLogout();
                      }}
                      className="p-1 text-rose-400 hover:text-rose-300 rounded-lg hover:bg-rose-500/20 transition-all cursor-pointer ml-0.5"
                      title="লগআউট করুন"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Direct Mobile Header Quick Logout Button */}
                  <button
                    onClick={onLogout}
                    className="flex sm:hidden p-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 font-bold text-[10px] items-center gap-1 cursor-pointer transition-all active:scale-95"
                    title="লগআউট করুন"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-400" />
                    <span className="leading-none">লগআউট</span>
                  </button>

                  {/* Profile Quick Dropdown Popover */}
                  <AnimatePresence>
                    {showProfileMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-64 rounded-2xl bg-[#091022] border border-cyan-500/30 p-3 shadow-2xl backdrop-blur-2xl z-50 text-left"
                      >
                        <div className="flex items-center gap-2.5 pb-2.5 mb-2.5 border-b border-white/10">
                          <div className={`w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center shrink-0 ${user.role === 'admin' ? 'bg-rose-500/20 text-rose-400' : 'bg-cyan-500/20 text-cyan-400'}`}>
                            {user.photoUrl || user.avatarUrl ? (
                              <img src={user.photoUrl || user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                              <UserIcon className="w-5 h-5" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-bold text-white truncate">{user.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono truncate">{user.phone || user.email || 'স্টুডেন্ট আইডি'}</div>
                            <span className="inline-block text-[8px] font-mono font-bold text-cyan-300 bg-cyan-500/20 px-1.5 py-0.5 rounded mt-0.5">
                              {user.role === 'admin' ? 'MAIN ADMIN' : `${user.studentClass || 'Class'} • রোল: ${user.studentRoll || 'N/A'}`}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <button
                            type="button"
                            onClick={() => {
                              setCurrentTab(user.role === 'admin' ? 'admin' : 'classroom');
                              setShowProfileMenu(false);
                            }}
                            className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:text-cyan-300 hover:bg-cyan-500/15 transition-all text-left"
                          >
                            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                            <span>{user.role === 'admin' ? 'অ্যাডমিন ড্যাশবোর্ড' : 'আমার ক্লাসরুম ও প্রোফাইল'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              onOpenRoutine?.();
                              setShowProfileMenu(false);
                            }}
                            className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:text-emerald-300 hover:bg-emerald-500/15 transition-all text-left"
                          >
                            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                            <span>সাপ্তাহিক ক্লাস রুটিন</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              onOpenContact?.();
                              setShowProfileMenu(false);
                            }}
                            className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:text-amber-300 hover:bg-amber-500/15 transition-all text-left"
                          >
                            <Phone className="w-3.5 h-3.5 text-amber-400" />
                            <span>হেল্পলাইন ও যোগাযোগ</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              onLogout();
                              setShowProfileMenu(false);
                            }}
                            className="w-full flex items-center gap-2 px-2.5 py-2.5 rounded-xl text-xs font-bold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-all text-left mt-2 cursor-pointer shadow-sm"
                          >
                            <LogOut className="w-4 h-4 text-rose-400" />
                            <span>লগআউট করুন (Logout)</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <button
                  id="open-auth-btn"
                  onClick={onOpenAuth}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-display font-bold text-xs sm:text-sm transition-all duration-300 cursor-pointer border border-cyan-400/40 whitespace-nowrap shrink-0 shadow-[0_0_15px_rgba(34,211,238,0.3)] btn-shine flex items-center gap-1.5"
                >
                  <UserIcon className="w-3.5 h-3.5 text-white" />
                  <span>লগইন / একাউন্ট</span>
                </button>
              )}
            </div>
        </nav>
      </div>

      {/* 3. MOBILE FLOATING FIXED BOTTOM NAVIGATION DOCK (Fixed at bottom on scroll with Home, Lab, Routine, Helpline, Classroom, Logout) */}
      <div 
        id="mobile-bottom-fixed-dock"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-[100] bg-[#060b18]/95 backdrop-blur-2xl border-t-2 border-cyan-500/40 px-1.5 py-1.5 shadow-[0_-12px_40px_rgba(0,0,0,0.9)] safe-area-pb"
      >
        <div className="grid grid-cols-6 items-center justify-items-center gap-0.5 max-w-md mx-auto w-full">
          
          {/* 1. Home */}
          <button
            onClick={() => {
              setCurrentTab('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex flex-col items-center justify-center gap-0.5 w-full min-h-[48px] py-1 rounded-xl transition-all duration-200 cursor-pointer ${
              currentTab === 'home'
                ? 'text-cyan-300 font-black bg-cyan-500/25 border border-cyan-400/60 shadow-[0_0_12px_rgba(34,211,238,0.35)] scale-105'
                : 'text-slate-400 hover:text-slate-200 active:scale-95'
            }`}
          >
            <Home className={`w-4 h-4 shrink-0 ${currentTab === 'home' ? 'text-cyan-300' : 'text-slate-400'}`} />
            <span className="text-[9.5px] font-sans font-bold leading-none">হোম</span>
          </button>

          {/* 2. Virtual Lab */}
          <button
            onClick={() => {
              setCurrentTab('lab');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex flex-col items-center justify-center gap-0.5 w-full min-h-[48px] py-1 rounded-xl transition-all duration-200 cursor-pointer ${
              currentTab === 'lab'
                ? 'text-cyan-300 font-black bg-cyan-500/25 border border-cyan-400/60 shadow-[0_0_12px_rgba(34,211,238,0.35)] scale-105'
                : 'text-slate-400 hover:text-slate-200 active:scale-95'
            }`}
          >
            <Atom className={`w-4 h-4 shrink-0 ${currentTab === 'lab' ? 'text-cyan-300 animate-spin-slow' : 'text-slate-400'}`} />
            <span className="text-[9.5px] font-sans font-bold leading-none">ল্যাব</span>
          </button>

          {/* 3. Class Routine */}
          <button
            onClick={() => onOpenRoutine?.()}
            className="flex flex-col items-center justify-center gap-0.5 w-full min-h-[48px] py-1 rounded-xl transition-all duration-200 text-slate-400 hover:text-emerald-300 hover:bg-emerald-500/10 active:scale-95 cursor-pointer"
          >
            <Calendar className="w-4 h-4 shrink-0 text-emerald-400" />
            <span className="text-[9.5px] font-sans font-bold leading-none">রুটিন</span>
          </button>

          {/* 4. Helpline (Fixed on bottom bar) */}
          <button
            onClick={() => onOpenContact?.()}
            className="flex flex-col items-center justify-center gap-0.5 w-full min-h-[48px] py-1 rounded-xl transition-all duration-200 text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 active:scale-95 cursor-pointer"
          >
            <Phone className="w-4 h-4 shrink-0 text-amber-400 animate-pulse" />
            <span className="text-[9.5px] font-sans font-bold leading-none">হেল্পলাইন</span>
          </button>

          {/* 5. Classroom / Admin Panel */}
          <button
            onClick={() => {
              if (user) {
                setCurrentTab(user.role === 'admin' ? 'admin' : 'classroom');
              } else {
                onOpenAuth();
              }
            }}
            className={`flex flex-col items-center justify-center gap-0.5 w-full min-h-[48px] py-1 rounded-xl transition-all duration-200 cursor-pointer ${
              currentTab === 'classroom' || currentTab === 'admin' || currentTab === 'admin-settings'
                ? 'text-cyan-300 font-black bg-cyan-500/25 border border-cyan-400/60 shadow-[0_0_12px_rgba(34,211,238,0.35)] scale-105'
                : 'text-slate-400 hover:text-slate-200 active:scale-95'
            }`}
          >
            {user?.role === 'admin' ? (
              <Shield className={`w-4 h-4 shrink-0 ${currentTab === 'admin' || currentTab === 'admin-settings' ? 'text-rose-400' : 'text-slate-400'}`} />
            ) : (
              <BookOpen className={`w-4 h-4 shrink-0 ${currentTab === 'classroom' ? 'text-cyan-300' : 'text-slate-400'}`} />
            )}
            <span className="text-[9.5px] font-sans font-bold leading-none truncate max-w-[52px]">
              {user ? (user.role === 'admin' ? 'অ্যাডমিন' : 'ক্লাস') : 'ক্লাস'}
            </span>
          </button>

          {/* 6. LOGOUT (When Logged in) / LOGIN (When Guest) */}
          {user ? (
            <button
              onClick={onLogout}
              className="flex flex-col items-center justify-center gap-0.5 w-full min-h-[48px] py-1 rounded-xl transition-all duration-200 text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 active:scale-95 cursor-pointer shadow-sm"
              title="লগআউট করুন"
            >
              <LogOut className="w-4 h-4 shrink-0 text-rose-400" />
              <span className="text-[9.5px] font-sans font-extrabold leading-none text-rose-300">লগআউট</span>
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex flex-col items-center justify-center gap-0.5 w-full min-h-[48px] py-1 rounded-xl transition-all duration-200 text-cyan-300 bg-cyan-500/15 border border-cyan-500/30 active:scale-95 cursor-pointer"
            >
              <UserIcon className="w-4 h-4 shrink-0 text-cyan-300 animate-pulse" />
              <span className="text-[9.5px] font-sans font-bold leading-none">লগইন</span>
            </button>
          )}

        </div>
      </div>

    </header>
  );
}

