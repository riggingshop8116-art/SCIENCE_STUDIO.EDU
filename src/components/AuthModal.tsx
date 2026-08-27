import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Lock, Mail, Phone as PhoneIcon, User as UserIcon, 
  AlertCircle, Shield, Eye, EyeOff, 
  ArrowRight, UserPlus, Sparkles, LogIn, CheckCircle2,
  HelpCircle, GraduationCap
} from 'lucide-react';
import { AuthResponse } from '../types';
import AnimatedCapAvatar from './AnimatedCapAvatar';
import { supabaseServer, canAttemptSupabase } from '../lib/supabaseSync';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (authData: AuthResponse) => void;
  isAdminMode?: boolean;
  initialMode?: 'login' | 'register';
}

export default function AuthModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  isAdminMode = false,
  initialMode = 'login'
}: AuthModalProps) {
  const [activeAdminMode, setActiveAdminMode] = useState(isAdminMode);
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Field focus tracking for interactive avatar animations
  const [focusedField, setFocusedField] = useState<'name' | 'email' | 'phone' | 'password' | null>(null);

  useEffect(() => {
    if (isOpen) {
      setActiveAdminMode(isAdminMode);
      setIsLogin(isAdminMode ? true : initialMode === 'login');
      setName('');
      setEmail('');
      setPhone('');
      setPassword('');
      setShowPassword(false);
      setError('');
      setFocusedField(null);
    }
  }, [isOpen, isAdminMode, initialMode]);

  const banglaToEnglishDigits = (str: string) => str.replace(/[০-৯]/g, d => '০১২৩৪৫৬৭৮৯'.indexOf(d).toString());

  const handlePhoneChange = (val: string) => {
    // Gracefully handle Bengali digits and filter out non-numeric characters
    const englishDigits = banglaToEnglishDigits(val);
    const cleaned = englishDigits.replace(/[^\d+]/g, '');
    setPhone(cleaned);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isLogin && !activeAdminMode) {
      if (!name.trim() || !email.trim() || !phone.trim() || !password.trim()) {
        setError('রেজিস্ট্রেশনের জন্য সবকটি তথ্য সঠিকভাবে পূরণ করা আবশ্যক।');
        return;
      }
      const cleanPhone = banglaToEnglishDigits(phone.trim()).replace(/\D/g, '');
      const phoneRegex = /^01[3-9]\d{8}$/;
      if (!phoneRegex.test(cleanPhone)) {
        setError('মোবাইল নম্বরটি অবশ্যই ১১ ডিজিটের বৈধ বাংলাদেশী নম্বর হতে হবে (যেমন: 01712345678)।');
        return;
      }
      if (password.trim().length < 6) {
        setError('পাসওয়ার্ডটি নিরাপত্তার জন্য কমপক্ষে ৬ অক্ষরের হতে হবে।');
        return;
      }
    } else {
      if (!email.trim() || !password.trim()) {
        setError('লগইন করার জন্য আপনার নিবন্ধিত ইমেইল ও পাসওয়ার্ড প্রদান করুন।');
        return;
      }
    }

    setLoading(true);
    setError('');

    const formattedPhone = banglaToEnglishDigits(phone.trim()).replace(/\D/g, '');
    const cleanEmail = email.trim().toLowerCase();
    const endpoint = (isLogin || activeAdminMode) ? '/api/auth/login' : '/api/auth/signup';
    const payload = (isLogin || activeAdminMode)
      ? { email: cleanEmail, password: password.trim(), expectedRole: activeAdminMode ? 'admin' : 'student' } 
      : { name: name.trim(), email: cleanEmail, phone: formattedPhone, password: password.trim() };

    try {
      let data: any = null;
      let networkError = false;

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        const responseText = await response.text();
        try {
          data = JSON.parse(responseText);
        } catch {
          data = null;
        }

        if (response.ok && data && (data.user || data.token)) {
          // Enforce role restrictions
          if (activeAdminMode && data.user?.role !== 'admin') {
            throw new Error('এই অ্যাকাউন্টের এডমিন অ্যাক্সেস নেই। এটি একটি স্টুডেন্ট অ্যাকাউন্ট।');
          }
          if (!activeAdminMode && data.user?.role === 'admin') {
            throw new Error('এটি একটি এডমিন (প্রশাসক) অ্যাকাউন্ট। অনুগ্রহ করে এডমিন পোর্টাল মোডে সুইচ করে লগইন করুন।');
          }

          onSuccess(data);
          onClose();
          setName('');
          setEmail('');
          setPhone('');
          setPassword('');
          setFocusedField(null);
          return;
        } else if (data && data.error) {
          const errStr = typeof data.error === 'string' ? data.error : (data.error.message || 'অনুরোধটি সম্পন্ন হয়নি।');
          throw new Error(errStr);
        } else {
          throw new Error(isLogin ? 'লগইন করতে সমস্যা হয়েছে। ইমেইল ও পাসওয়ার্ড সঠিক আছে কিনা পরীক্ষা করুন।' : 'রেজিস্ট্রেশন করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
        }
      } catch (fetchErr: any) {
        // If it's a specific validation/auth error from server, display it directly
        if (fetchErr.message && !fetchErr.message.includes('Failed to fetch') && !fetchErr.message.includes('NetworkError') && !fetchErr.message.includes('Load failed')) {
          throw fetchErr;
        }
        networkError = true;
      }

      // RESILIENT CLIENT-SIDE FALLBACK (Only when backend server is completely unreachable)
      if (networkError) {
        if (!isLogin && !activeAdminMode) {
          // Direct Student Registration
          const userId = 'usr_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
          const token = 'tok_' + Math.random().toString(36).substring(2, 12) + Date.now().toString(36);
          const fallbackUser = {
            id: userId,
            name: name.trim(),
            email: cleanEmail,
            phone: formattedPhone,
            role: 'student' as const,
            isApproved: false,
            token,
            enrolledCourseTitles: [],
            createdAt: new Date().toISOString()
          };

          if (canAttemptSupabase()) {
            try {
              await supabaseServer.auth.signUp({
                email: cleanEmail,
                password: password.trim(),
                options: {
                  data: { name: name.trim(), phone: formattedPhone, role: 'student' }
                }
              });
            } catch (sbAuthErr) {
              console.warn("Supabase Auth fallback notice:", sbAuthErr);
            }

            try {
              await supabaseServer.from('app_users').upsert({
                id: userId,
                name: name.trim(),
                email: cleanEmail,
                phone: formattedPhone,
                role: 'student',
                is_approved: false,
                enrolled_courses: [],
                data: { ...fallbackUser, password: password.trim() },
                updated_at: new Date().toISOString()
              }, { onConflict: 'id' });
            } catch (sbDbErr) {
              console.warn("Supabase DB upsert notice:", sbDbErr);
            }
          }

          const authPayload = { user: fallbackUser, token };
          onSuccess(authPayload);
          onClose();
          setName('');
          setEmail('');
          setPhone('');
          setPassword('');
          setFocusedField(null);
          return;
        } else {
          // Direct Student / Admin Login Fallback
          if (!activeAdminMode && canAttemptSupabase()) {
            try {
              const { data: authData } = await supabaseServer.auth.signInWithPassword({
                email: cleanEmail,
                password: password.trim()
              });

              if (authData?.user) {
                const { data: dbProfile } = await supabaseServer
                  .from('app_users')
                  .select('*')
                  .eq('email', cleanEmail)
                  .maybeSingle();

                const fallbackStudent = {
                  id: dbProfile?.id || authData.user.id,
                  name: dbProfile?.name || authData.user.user_metadata?.name || 'শিক্ষার্থী',
                  email: cleanEmail,
                  phone: dbProfile?.phone || authData.user.user_metadata?.phone || '',
                  role: 'student' as const,
                  isApproved: dbProfile?.is_approved ?? false,
                  enrolledCourseTitles: dbProfile?.enrolled_courses || [],
                  createdAt: dbProfile?.created_at || new Date().toISOString()
                };
                const token = 'tok_' + Math.random().toString(36).substring(2, 12);
                onSuccess({ user: fallbackStudent, token });
                onClose();
                return;
              }
            } catch (sbLoginErr) {
              console.warn("Supabase signIn fallback notice:", sbLoginErr);
            }
          }

          throw new Error('লগইন করতে সমস্যা হচ্ছে। অনুগ্রহ করে আপনার ইমেইল ও পাসওয়ার্ড সঠিক আছে কিনা পরীক্ষা করুন।');
        }
      }
    } catch (err: any) {
      let rawMsg = err?.message || 'অনুরোধ প্রক্রিয়াকরণে একটি ত্রুটি ঘটেছে।';
      if (typeof rawMsg !== 'string' || rawMsg.includes('<') || rawMsg.includes('{') || rawMsg.includes('SyntaxError')) {
        rawMsg = 'সার্ভারে সংযোগ করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।';
      }
      setError(rawMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Grounded Dark Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose} 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-0"
        />

        {/* Modal Container with Refined Academic Materials */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ type: "spring", stiffness: 350, damping: 30 }}
          className={`relative w-full max-w-lg my-auto p-5 sm:p-7 rounded-2xl bg-[#0c1222] border ${
            activeAdminMode 
              ? 'border-rose-500/40 shadow-[0_20px_50px_rgba(0,0,0,0.6)]' 
              : (!isLogin 
                  ? 'border-emerald-500/40 shadow-[0_20px_50px_rgba(0,0,0,0.6)]' 
                  : 'border-slate-700/80 shadow-[0_20px_50px_rgba(0,0,0,0.6)]')
          } z-10 text-white overflow-hidden`}
          id="auth-modal"
        >
          {/* Subtle Top Border Accent */}
          <div className={`absolute top-0 left-0 right-0 h-1 z-20 ${
            activeAdminMode 
              ? 'bg-rose-500' 
              : (!isLogin ? 'bg-emerald-500' : 'bg-cyan-500')
          }`} />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl bg-slate-900/80 border border-slate-700/60 hover:border-slate-500 hover:bg-slate-800 transition-all duration-150 cursor-pointer z-30 group"
            title="বন্ধ করুন (Close)"
            aria-label="Close modal"
          >
            <X className="w-4 h-4 group-hover:scale-105 transition-transform" />
          </button>

          {/* Segmented Control Switcher Tabs (Login vs Register) */}
          {!activeAdminMode && (
            <div className="relative z-10 grid grid-cols-2 gap-1 p-1 rounded-xl bg-slate-900/90 border border-slate-700/70 mb-4 max-w-xs mx-auto">
              <button
                type="button"
                onClick={() => { setIsLogin(true); setError(''); setFocusedField(null); }}
                className={`py-2 px-3 rounded-lg text-xs font-sans font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer select-none ${
                  isLogin 
                    ? 'bg-slate-800 text-white shadow-sm border border-slate-600/60 text-cyan-300' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <LogIn className={`w-3.5 h-3.5 ${isLogin ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>স্টুডেন্ট লগইন</span>
              </button>

              <button
                type="button"
                onClick={() => { setIsLogin(false); setError(''); setFocusedField(null); }}
                className={`py-2 px-3 rounded-lg text-xs font-sans font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer select-none ${
                  !isLogin 
                    ? 'bg-slate-800 text-white shadow-sm border border-slate-600/60 text-emerald-300' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <UserPlus className={`w-3.5 h-3.5 ${!isLogin ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>নতুন রেজিস্ট্রেশন</span>
              </button>
            </div>
          )}

          {/* Modal Header */}
          <div className="text-center mb-3 relative z-10">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center justify-center gap-2 font-display">
              {activeAdminMode ? (
                <>
                  <Shield className="w-5 h-5 text-rose-400" />
                  <span>হেড অফিস অ্যাডমিন পোর্টাল</span>
                </>
              ) : (
                isLogin ? (
                  <>
                    <GraduationCap className="w-5 h-5 text-cyan-400" />
                    <span>স্টুডেন্ট ক্লাসরুম লগইন</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-emerald-400" />
                    <span>নতুন শিক্ষার্থী ভর্তি ও রেজিস্ট্রেশন</span>
                  </>
                )
              )}
            </h2>
            <p className="text-slate-400 text-xs mt-1 font-sans leading-relaxed max-w-sm mx-auto">
              {activeAdminMode 
                ? 'সাকিব স্যারের একাডেমি এডমিন ও কন্ট্রোল প্যানেলে প্রবেশ করুন।' 
                : (isLogin 
                    ? 'আপনার নিবন্ধিত ইমেইল ও পাসওয়ার্ড প্রদান করে ক্লাসরুমে প্রবেশ করুন।' 
                    : 'সাকিব স্যারের একাডেমি পরিবারের সাথে যুক্ত হতে আপনার তথ্যগুলো পূরণ করুন।')}
            </p>
          </div>

          {/* Realistic Interactive Academic Avatar */}
          <div className="relative z-10">
            <AnimatedCapAvatar
              isPasswordFocused={focusedField === 'password'}
              showPassword={showPassword}
              focusedField={focusedField}
              mode={activeAdminMode ? 'admin' : (isLogin ? 'login' : 'register')}
              hasError={!!error}
              isLoading={loading}
            />
          </div>

          {/* Academic Context Notice Banner */}
          {!activeAdminMode && (
            <div className={`relative z-10 mb-4 p-2.5 rounded-xl border text-[11px] font-sans flex items-center justify-between gap-2 ${
              isLogin 
                ? 'bg-cyan-950/20 border-cyan-500/20 text-cyan-200' 
                : 'bg-emerald-950/20 border-emerald-500/20 text-emerald-200'
            }`}>
              <div className="flex items-center gap-2">
                <span className="shrink-0 p-1 rounded-md bg-slate-900/80 border border-white/5">
                  {isLogin ? <HelpCircle className="w-3.5 h-3.5 text-cyan-300" /> : <Sparkles className="w-3.5 h-3.5 text-emerald-300" />}
                </span>
                <span className="leading-snug">
                  {isLogin 
                    ? 'আপনি কি নতুন শিক্ষার্থী? ক্লাসরুম অ্যাক্সেস পেতে প্রথমে রেজিস্ট্রেশন সম্পন্ন করুন।' 
                    : '১ মিনিটে অ্যাকাউন্ট তৈরি করে ভিডিও লেকচার ও ল্যাব অ্যাক্সেস পান!'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                  setFocusedField(null);
                }}
                className={`shrink-0 font-bold underline px-2 py-1 rounded-md bg-white/5 hover:bg-white/10 transition-colors cursor-pointer ${
                  isLogin ? 'text-cyan-300' : 'text-emerald-300'
                }`}
              >
                {isLogin ? 'রেজিস্ট্রেশন করুন' : 'লগইন করুন'}
              </button>
            </div>
          )}

          {/* Error Message Display */}
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs mb-4 shadow-sm relative z-10"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span className="font-medium leading-snug">{error}</span>
            </motion.div>
          )}

          {/* Auth Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5 relative z-10">
            {!isLogin && !activeAdminMode && (
              <>
                <div>
                  <label className="block text-xs font-sans text-slate-300 mb-1 font-semibold flex items-center justify-between">
                    <span>শিক্ষার্থীর পূর্ণ নাম (Full Name) <span className="text-emerald-400">*</span></span>
                    <span className="text-[10px] text-slate-400 lowercase font-normal">সঠিক নাম লিখুন</span>
                  </label>
                  <div className="relative">
                    <UserIcon className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${
                      focusedField === 'name' ? 'text-emerald-400' : 'text-slate-500'
                    }`} />
                    <input
                      type="text"
                      required
                      value={name}
                      onFocus={() => setFocusedField('name')}
                      onBlur={() => setFocusedField(null)}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="যেমন: মোঃ সাকিব হাসান"
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border text-white text-sm outline-none transition-all placeholder:text-slate-500 ${
                        focusedField === 'name' 
                          ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm' 
                          : 'border-slate-700/80 hover:border-slate-600'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-sans text-slate-300 mb-1 font-semibold flex items-center justify-between">
                    <span>মোবাইল নম্বর (Mobile Number) <span className="text-emerald-400">*</span></span>
                    <span className="text-[10px] text-slate-400 lowercase font-normal">১১ ডিজিটের নম্বর</span>
                  </label>
                  <div className="relative">
                    <PhoneIcon className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${
                      focusedField === 'phone' ? 'text-emerald-400' : 'text-slate-500'
                    }`} />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onFocus={() => setFocusedField('phone')}
                      onBlur={() => setFocusedField(null)}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      placeholder="01712345678"
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border text-white text-sm outline-none transition-all font-mono placeholder:text-slate-500 ${
                        focusedField === 'phone' 
                          ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm' 
                          : 'border-slate-700/80 hover:border-slate-600'
                      }`}
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-sans text-slate-300 mb-1 font-semibold flex items-center justify-between">
                <span>ইমেইল এড্রেস (Email Address) <span className="text-cyan-400">*</span></span>
                <span className="text-[10px] text-slate-400 lowercase font-normal">আপনার সক্রিয় ইমেইল</span>
              </label>
              <div className="relative">
                <Mail className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${
                  focusedField === 'email' 
                    ? (activeAdminMode ? 'text-rose-400' : 'text-cyan-400') 
                    : 'text-slate-500'
                }`} />
                <input
                  type="email"
                  required
                  value={email}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={activeAdminMode ? "admin@sciencestudio.com" : "student@example.com"}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border text-white text-sm outline-none transition-all placeholder:text-slate-500 font-sans ${
                    focusedField === 'email' 
                      ? (activeAdminMode 
                          ? 'border-rose-500 ring-2 ring-rose-500/20 shadow-sm' 
                          : 'border-cyan-500 ring-2 ring-cyan-500/20 shadow-sm')
                      : 'border-slate-700/80 hover:border-slate-600'
                  }`}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-sans text-slate-300 font-semibold">
                  <span>গোপন পাসওয়ার্ড (Password) <span className="text-amber-400">*</span></span>
                </label>
                <span className="text-[10px] text-slate-400 font-sans">
                  নূন্যতম ৬ অক্ষর
                </span>
              </div>
              <div className="relative">
                <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${
                  focusedField === 'password' ? 'text-amber-400' : 'text-slate-500'
                }`} />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-900/90 border text-white text-sm outline-none transition-all font-mono placeholder:text-slate-500 ${
                    focusedField === 'password' 
                      ? 'border-amber-500 ring-2 ring-amber-500/20 shadow-sm' 
                      : 'border-slate-700/80 hover:border-slate-600'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                  title={showPassword ? "পাসওয়ার্ড লুকান" : "পাসওয়ার্ড দেখুন"}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4 text-amber-300" /> : <Eye className="w-4 h-4 text-slate-400" />}
                </button>
              </div>
            </div>

            {/* High-Contrast Tactile Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-6 rounded-xl font-sans font-bold text-sm text-white transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none mt-3 flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-[0.99] ${
                activeAdminMode 
                  ? 'bg-rose-600 hover:bg-rose-500 active:bg-rose-700' 
                  : (!isLogin 
                      ? 'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700' 
                      : 'bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700')
              }`}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>
                    {activeAdminMode 
                      ? 'এডমিন প্যানেলে প্রবেশ করুন' 
                      : (isLogin ? 'ক্লাসরুমে লগইন করুন' : 'রেজিস্ট্রেশন সম্পন্ন করুন')}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Modal Toggle Footer */}
          {!activeAdminMode && (
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-center text-xs text-slate-400 font-sans relative z-10 text-center">
              <div>
                {isLogin ? (
                  <p>
                    আপনি কি নতুন শিক্ষার্থী?{' '}
                    <button 
                      type="button"
                      onClick={() => { setIsLogin(false); setError(''); setFocusedField(null); }}
                      className="text-cyan-300 hover:text-cyan-200 font-semibold cursor-pointer underline ml-1"
                    >
                      এখনই রেজিস্ট্রেশন করুন (Register)
                    </button>
                  </p>
                ) : (
                  <p>
                    ইতিমধ্যে অ্যাকাউন্ট রয়েছে?{' '}
                    <button 
                      type="button"
                      onClick={() => { setIsLogin(true); setError(''); setFocusedField(null); }}
                      className="text-emerald-300 hover:text-emerald-200 font-semibold cursor-pointer underline ml-1"
                    >
                      সরাসরি লগইন করুন
                    </button>
                  </p>
                )}
              </div>
            </div>
          )}

          {activeAdminMode && (
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-center text-[11px] font-mono text-rose-400 relative z-10 text-center">
              <div className="flex items-center gap-1.5 uppercase tracking-wider font-semibold">
                <Shield className="w-3.5 h-3.5 text-rose-400" />
                <span>Sakib Sir Academic Admin Head Office</span>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
