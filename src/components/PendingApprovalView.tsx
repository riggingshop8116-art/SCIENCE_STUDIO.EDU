import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Clock, 
  Hourglass, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw, 
  Edit3, 
  Phone, 
  MessageCircle, 
  ExternalLink, 
  LogOut, 
  Home, 
  BookOpen, 
  Sparkles, 
  Copy, 
  Check, 
  ShoppingBag, 
  Lock, 
  CheckCheck,
  Send,
  X,
  CreditCard,
  PhoneCall,
  Info,
  Calendar,
  Layers
} from 'lucide-react';
import { User, Course, Settings } from '../types';

interface PendingApprovalViewProps {
  user: User;
  settings?: Settings;
  coursesList: Course[];
  onUpdateUser?: (updatedUser: User) => void;
  onLogout?: () => void;
  onOpenPaymentModal?: (course: Course) => void;
}

export default function PendingApprovalView({
  user,
  settings,
  coursesList,
  onUpdateUser,
  onLogout,
  onOpenPaymentModal
}: PendingApprovalViewProps) {
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'info' | 'error'; text: string } | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showEditTrxModal, setShowEditTrxModal] = useState(false);
  const [showOtherCourses, setShowOtherCourses] = useState(false);

  // Edit TrxID Form state
  const [editTrxId, setEditTrxId] = useState(user.transactionId || '');
  const [editPaymentMethod, setEditPaymentMethod] = useState<'bkash' | 'nagad' | 'rocket'>(
    (user.paymentMethod as any) || 'bkash'
  );
  const [editSenderPhone, setEditSenderPhone] = useState(user.senderPhone || user.phone || '');
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');

  // Handle Copy to clipboard
  const handleCopy = (text: string, fieldName: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Real-time live status checker
  const handleCheckStatus = async (isManual = true) => {
    if (checkingStatus) return;
    if (isManual) setCheckingStatus(true);

    try {
      const token = localStorage.getItem('science_studio_token') || `token-${user.id}`;
      const res = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await res.json();
          if (data?.user) {
            if (data.user.isApproved) {
              setStatusMessage({
                type: 'success',
                text: '🎉 অভিনন্দন! আপনার অ্যাকাউন্টটি সফলভাবে অ্যাডমিন কর্তৃক অনুমোদিত হয়েছে। ক্লাসরুম আনলক করা হচ্ছে...'
              });
              if (onUpdateUser) {
                onUpdateUser(data.user);
              }
              return;
            } else if (isManual) {
              setStatusMessage({
                type: 'info',
                text: '⏳ আপনার অ্যাকাউন্টটি এখনো অ্যাডমিন পর্যালোচনায় রয়েছে। সাধারণত ১৫-৩০ মিনিটের মধ্যে ভেরিফিকেশন সম্পন্ন হয়।'
              });
            }
          }
        }
      } else if (isManual) {
        setStatusMessage({
          type: 'error',
          text: 'স্ট্যাটাস পরীক্ষা করতে সমস্যা হচ্ছে। ইন্টারনেট সংযোগ পরীক্ষা করুন।'
        });
      }
    } catch (err) {
      if (isManual) {
        setStatusMessage({
          type: 'error',
          text: 'সার্ভারে সংযোগ পেতে সমস্যা হয়েছে।'
        });
      }
    } finally {
      if (isManual) {
        setTimeout(() => setCheckingStatus(false), 600);
      }
    }
  };

  // Auto poll status every 12 seconds in the background
  useEffect(() => {
    const interval = setInterval(() => {
      handleCheckStatus(false);
    }, 12000);
    return () => clearInterval(interval);
  }, [user.id]);

  // Handle Edit Transaction Submission
  const handleEditTrxSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError('');
    setEditSuccess('');

    const cleanPhone = editSenderPhone.replace(/\D/g, '');
    if (!editSenderPhone.trim()) {
      setEditError('প্রেরক মোবাইল নম্বর দেওয়া আবশ্যক।');
      return;
    }
    if (cleanPhone.length !== 11) {
      setEditError('মোবাইল নম্বরটি ১১ ডিজিটের হতে হবে (যেমন: 01712345678)।');
      return;
    }
    if (!editTrxId.trim()) {
      setEditError('ট্রানজেকশন আইডি (TrxID) দেওয়া আবশ্যক।');
      return;
    }

    setEditSubmitting(true);

    try {
      const token = localStorage.getItem('science_studio_token') || `token-${user.id}`;
      const res = await fetch('/api/user/enroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          courseTitle: user.enrolledCourseTitles?.[0] || 'বিজ্ঞান স্টুডিও কোর্স',
          transactionId: editTrxId.trim(),
          paymentMethod: editPaymentMethod,
          senderPhone: editSenderPhone.trim()
        })
      });

      if (res.ok) {
        const updatedUserData = await res.json();
        const updatedUser: User = {
          ...user,
          transactionId: editTrxId.trim(),
          paymentMethod: editPaymentMethod,
          senderPhone: editSenderPhone.trim(),
          ...(updatedUserData || {})
        };
        if (onUpdateUser) {
          onUpdateUser(updatedUser);
        }
        setEditSuccess('✅ আপনার ট্রানজেকশন তথ্য সফলভাবে আপডেট হয়েছে!');
        setTimeout(() => {
          setShowEditTrxModal(false);
          setEditSuccess('');
        }, 1500);
      } else {
        const data = await res.json();
        throw new Error(data.error || 'তথ্য আপডেট করতে সমস্যা হয়েছে।');
      }
    } catch (err: any) {
      setEditError(err.message || 'তথ্য আপডেট করতে ব্যর্থ হয়েছে।');
    } finally {
      setEditSubmitting(false);
    }
  };

  // Determine user enrolled courses display
  const enrolledCoursesDisplay = (user.enrolledCourseTitles && user.enrolledCourseTitles.length > 0)
    ? user.enrolledCourseTitles
    : ['Science Studio Special Batch'];

  // Format date helper
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'সম্প্রতি';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('bn-BD', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateStr;
    }
  };

  const studentDisplayName = (() => {
    const raw = (user?.name || '').trim();
    if (raw && raw.toLowerCase() !== 'student' && raw.toLowerCase() !== 'user' && raw !== 'স্টুডেন্ট') {
      return raw;
    }
    if (user?.email && user.email.includes('@')) {
      const prefix = user.email.split('@')[0];
      return prefix.charAt(0).toUpperCase() + prefix.slice(1);
    }
    return 'শিক্ষার্থী';
  })();

  const helplineNumber = settings?.contactPhone || '01700-000000';
  const whatsappNumber = settings?.whatsappNumber || settings?.contactPhone || '01700-000000';
  const cleanWhatsApp = whatsappNumber.replace(/[^\d+]/g, '').replace(/^0/, '880');
  const whatsappUrl = `https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent(
    `আসসালামু আলাইকুম স্যার, আমি Science Studio-তে ভর্তি হয়েছি।\nনাম: ${studentDisplayName}\nইমেইল: ${user.email}\nকোর্স: ${enrolledCoursesDisplay.join(', ')}\nTrxID: ${user.transactionId || 'N/A'}\nদয়া করে আমার অ্যাকাউন্টটি অনুমোদন (Approve) করে দিন। ধন্যবাদ!`
  )}`;

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10 animate-fade-in" id="pending-approval-screen">
      
      {/* Dynamic Toast / Status Banner */}
      <AnimatePresence>
        {statusMessage && (
          <motion.div
            initial={{ opacity: 0, y: -15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.98 }}
            className={`mb-6 p-4 rounded-2xl border flex items-center justify-between gap-3 shadow-xl backdrop-blur-xl ${
              statusMessage.type === 'success'
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                : statusMessage.type === 'error'
                ? 'bg-rose-500/20 border-rose-400 text-rose-200'
                : 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
            }`}
          >
            <div className="flex items-center gap-3">
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : statusMessage.type === 'error' ? (
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              ) : (
                <Hourglass className="w-5 h-5 text-cyan-400 animate-spin-slow shrink-0" />
              )}
              <span className="text-sm font-semibold">{statusMessage.text}</span>
            </div>
            <button
              onClick={() => setStatusMessage(null)}
              className="p-1 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Glassmorphic Pending Approval Container */}
      <div className="relative rounded-3xl bg-gradient-to-b from-[#0e172a]/95 via-[#0b1222]/95 to-[#080d1a]/95 border-2 border-amber-500/40 shadow-[0_0_50px_rgba(245,158,11,0.15)] overflow-hidden backdrop-blur-2xl p-6 sm:p-8 md:p-10">
        
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Accent Strip */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-orange-400 to-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.6)]" />

        {/* Header Block: Animated Pending Badge & Title */}
        <div className="relative z-10 flex flex-col items-center text-center space-y-4 mb-8">
          
          {/* Animated Pulsing Icon */}
          <div className="relative">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-amber-500/20 via-orange-500/15 to-transparent border-2 border-amber-400/50 flex items-center justify-center text-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.3)] animate-pulse">
              <Hourglass className="w-10 h-10 sm:w-12 sm:h-12 animate-spin-slow" />
            </div>
            <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-slate-900 border-2 border-amber-400 text-amber-300">
              <Clock className="w-4 h-4" />
            </div>
          </div>

          {/* Pending Status Chip */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-400/50 text-amber-300 font-mono text-xs sm:text-sm font-bold uppercase tracking-wider shadow-[0_0_20px_rgba(245,158,11,0.2)]">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping inline-block" />
            <span>অ্যাডমিন অনুমোদনের অপেক্ষায় রয়েছে (Approval Pending)</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-extrabold text-white leading-tight max-w-3xl">
            আপনার এনরোল করা কোর্সটি অ্যাডমিন অনুমোদনের অপেক্ষায় আছে
          </h1>

          {/* Descriptive Subtext */}
          <p className="text-slate-300 text-xs sm:text-sm sm:leading-relaxed max-w-2xl font-sans">
            প্রিয় <strong className="text-cyan-300 font-bold">{studentDisplayName}</strong>, সায়েন্স স্টুডিওতে আপনার রেজিস্ট্রেশন ও পেমেন্ট সংক্রান্ত তথ্য সফলভাবে ডাটাবেজে জমা হয়েছে। অ্যাডমিন / সাকিব স্যার আপনার ট্রানজেকশন তথ্য (TrxID) যাচাই করা মাত্র আপনার ক্লাসরুম ও সকল লেকচার স্বয়ংক্রিয়ভাবে আনলক হয়ে যাবে।
          </p>

          {/* Live Action Bar: Check Live Status & Helpline */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => handleCheckStatus(true)}
              disabled={checkingStatus}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-display font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:scale-[1.02] active:scale-95 disabled:opacity-60"
              title="স্ট্যাটাস রিফ্রেশ করতে ক্লিক করুন"
            >
              <RefreshCw className={`w-4 h-4 ${checkingStatus ? 'animate-spin' : ''}`} />
              <span>{checkingStatus ? 'যাচাই করা হচ্ছে...' : 'অনুমোদনের স্ট্যাটাস পরীক্ষা করুন'}</span>
            </button>

            <button
              onClick={() => setShowEditTrxModal(true)}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 hover:border-cyan-400 text-slate-200 font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer shadow-md active:scale-95"
              title="TrxID বা পেমেন্ট তথ্য পরিবর্তন করুন"
            >
              <Edit3 className="w-4 h-4 text-cyan-400" />
              <span>ট্রানজেকশন তথ্য সংশোধন</span>
            </button>
          </div>
        </div>

        {/* 4-Step Approval Progress Tracker */}
        <div className="mb-8 p-4 sm:p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
          <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>ভেরিফিকেশন ও আনলক প্রক্রিয়া (Enrollment Stages)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 sm:gap-2">
            {/* Step 1 */}
            <div className="flex items-center sm:flex-col sm:items-center sm:text-center gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-slate-950 font-bold flex items-center justify-center shrink-0">
                <Check className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-emerald-300">১. রেজিস্ট্রেশন সম্পন্ন</div>
                <div className="text-[10px] text-slate-400">অ্যাকাউন্ট তৈরি হয়েছে</div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-center sm:flex-col sm:items-center sm:text-center gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-slate-950 font-bold flex items-center justify-center shrink-0">
                <Check className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-emerald-300">২. পেমেন্ট ও TrxID সাবমিট</div>
                <div className="text-[10px] text-slate-400">{user.transactionId ? 'তথ্য সংরক্ষিত' : 'পেমেন্ট সম্পন্ন'}</div>
              </div>
            </div>

            {/* Step 3 - Active */}
            <div className="flex items-center sm:flex-col sm:items-center sm:text-center gap-3 p-3 rounded-xl bg-amber-500/20 border-2 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)] animate-pulse">
              <div className="w-8 h-8 rounded-full bg-amber-400 text-slate-950 font-bold flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-amber-300">৩. অ্যাডমিন ভেরিফিকেশন</div>
                <div className="text-[10px] text-amber-200/80 font-bold">চলমান রয়েছে (Processing)</div>
              </div>
            </div>

            {/* Step 4 - Locked */}
            <div className="flex items-center sm:flex-col sm:items-center sm:text-center gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-700/60 opacity-60">
              <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 font-bold flex items-center justify-center shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-300">৪. ক্লাসরুম আনলক</div>
                <div className="text-[10px] text-slate-500">অনুমোদনের পর সক্রিয় হবে</div>
              </div>
            </div>
          </div>
        </div>

        {/* Two-Column Grid: Submitted Details Summary & Direct Helpline Support */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mb-8">
          
          {/* Left Column: Submitted Application Summary Card */}
          <div className="lg:col-span-7 bg-[#0c1427]/90 border border-cyan-500/30 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">আপনার জমা দেওয়া তথ্যসমূহ</h3>
              </div>
              <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded">
                ভেরিফিকেশন অপেক্ষমাণ
              </span>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              {/* Student Name */}
              <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                <span className="text-slate-400 font-medium">শিক্ষার্থীর নাম:</span>
                <span className="text-white font-bold">{studentDisplayName}</span>
              </div>

              {/* Email */}
              <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                <span className="text-slate-400 font-medium">নিবন্ধিত ইমেইল:</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-cyan-300 font-mono font-semibold">{user.email}</span>
                  <button
                    onClick={() => handleCopy(user.email, 'email')}
                    className="p-1 text-slate-400 hover:text-cyan-300 transition-colors"
                    title="ইমেইল কপি করুন"
                  >
                    {copiedField === 'email' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                <span className="text-slate-400 font-medium">মোবাইল নম্বর:</span>
                <span className="text-white font-mono font-semibold">{user.phone || user.senderPhone || 'প্রদত্ত'}</span>
              </div>

              {/* Enrolled Courses */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-1.5 border-b border-white/5 gap-1">
                <span className="text-slate-400 font-medium">এনরোল করা কোর্স:</span>
                <div className="flex flex-wrap gap-1 justify-end">
                  {enrolledCoursesDisplay.map((crs, idx) => (
                    <span key={idx} className="bg-cyan-500/15 border border-cyan-400/40 text-cyan-200 font-bold px-2 py-0.5 rounded text-xs">
                      {crs}
                    </span>
                  ))}
                </div>
              </div>

              {/* Payment Method */}
              <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                <span className="text-slate-400 font-medium">পেমেন্ট মেথড:</span>
                <span className="text-emerald-400 font-mono font-bold uppercase bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">
                  {user.paymentMethod ? user.paymentMethod.toUpperCase() : 'বিকাশ / নগদ / রকেট'}
                </span>
              </div>

              {/* Transaction ID */}
              <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                <span className="text-slate-400 font-medium">ট্রানজেকশন আইডি (TrxID):</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-amber-300 font-mono font-bold tracking-wider bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded">
                    {user.transactionId || 'অ্যাডমিন পর্যালোচনায়'}
                  </span>
                  {user.transactionId && (
                    <button
                      onClick={() => handleCopy(user.transactionId!, 'trx')}
                      className="p-1 text-slate-400 hover:text-amber-300 transition-colors"
                      title="TrxID কপি করুন"
                    >
                      {copiedField === 'trx' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
              </div>

              {/* Sender Phone */}
              {user.senderPhone && (
                <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                  <span className="text-slate-400 font-medium">প্রেরক মোবাইল নম্বর:</span>
                  <span className="text-slate-200 font-mono">{user.senderPhone}</span>
                </div>
              )}

              {/* Date */}
              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-400 font-medium">আবেদনের তারিখ:</span>
                <span className="text-slate-300 font-mono text-xs">{formatDate(user.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Direct Fast-Track Support & Helpline */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Urgent Support / WhatsApp Card */}
            <div className="bg-gradient-to-br from-emerald-950/40 via-slate-900/90 to-teal-950/40 border border-emerald-500/30 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl">
              <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
                <MessageCircle className="w-5 h-5 text-emerald-400" />
                <span>দ্রুত অনুমোদনের জন্য সরাসরি যোগাযোগ</span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                জরুরিভিত্তিতে অ্যাকাউন্ট দ্রুত ভেরিফাই করাতে চান? নিচের হোয়াটসঅ্যাপ বাটনে ক্লিক করে সরাসরি সাকিব স্যার বা অ্যাডমিনের সাথে মেসেজে যোগাযোগ করুন।
              </p>

              <div className="space-y-2.5">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.35)] transition-all cursor-pointer hover:scale-[1.02] active:scale-95"
                >
                  <MessageCircle className="w-4 h-4 fill-slate-950" />
                  <span>হোয়াটসঅ্যাপে দ্রুত মেসেজ পাঠান (WhatsApp)</span>
                </a>

                {settings?.contactPhone && (
                  <a
                    href={`tel:${settings.contactPhone.split(',')[0].trim()}`}
                    className="w-full py-2.5 px-4 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <PhoneCall className="w-4 h-4 text-amber-400" />
                    <span>সরাসরি কল করুন: {settings.contactPhone.split(',')[0]}</span>
                  </a>
                )}
              </div>
            </div>

            {/* Information Tips Card */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5 space-y-2 text-xs text-slate-300">
              <div className="text-cyan-300 font-bold flex items-center gap-1.5">
                <Info className="w-4 h-4 text-cyan-400" />
                <span>মনে রাখবেন (Important Notes):</span>
              </div>
              <ul className="space-y-1.5 text-slate-300 pl-4 list-disc marker:text-cyan-400">
                <li>ভেরিফিকেশন সম্পন্ন হলে আপনি এই পেইজে স্বয়ংক্রিয়ভাবে সম্পূর্ণ ড্যাশবোর্ড দেখতে পাবেন।</li>
                <li>পেজ রিলোড করার প্রয়োজন নেই; সিস্টেম প্রতি ১০ সেকেন্ড পর পর ব্যাকগ্রাউন্ডে চেক করে।</li>
                <li>যেকোনো সহায়তায় হেল্পলাইন নম্বরে যোগাযোগ করুন।</li>
              </ul>
            </div>

          </div>

        </div>

        {/* Bottom Actions: Toggle Browse Other Courses, Logout */}
        <div className="pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
          <button
            onClick={() => setShowOtherCourses(!showOtherCourses)}
            className="px-4 py-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 text-cyan-400" />
            <span>{showOtherCourses ? 'অন্যান্য কোর্স তালিকা লুকান' : 'অন্যান্য কোর্সসমূহ দেখুন / আরো এনরোল করুন'}</span>
          </button>

          {onLogout && (
            <button
              onClick={onLogout}
              className="px-4 py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-300 font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95 ml-auto"
            >
              <LogOut className="w-4 h-4 text-rose-400" />
              <span>লগআউট করুন (Logout)</span>
            </button>
          )}
        </div>

        {/* Collapsible Section: Browse & Enroll in other courses */}
        <AnimatePresence>
          {showOtherCourses && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-8 pt-8 border-t border-white/10 overflow-hidden"
            >
              <div className="mb-6">
                <h3 className="text-xl font-display font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                  <span>বিজ্ঞান স্টুডিওর অন্যান্য চলমান কোর্সসমূহ</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  আপনি চাইলে অপেক্ষমাণ থাকাকালীন সময়েও অতিরিক্ত অন্য কোনো কোর্সে এনরোল করতে পারবেন।
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {coursesList.map((course) => (
                  <div
                    key={course.id}
                    className="bg-[#0b1222]/90 rounded-2xl border border-white/10 hover:border-cyan-500/40 transition-all overflow-hidden flex flex-col justify-between group shadow-lg"
                  >
                    <div>
                      <div className="relative h-36 w-full overflow-hidden bg-slate-900">
                        <img
                          src={course.imageUrl || 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=800&auto=format&fit=crop&q=80'}
                          alt={course.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-2 left-2 flex gap-1">
                          <span className="bg-cyan-500/80 backdrop-blur-md text-slate-950 font-bold px-2 py-0.5 rounded text-[10px] font-mono">
                            {course.subject}
                          </span>
                        </div>
                      </div>

                      {/* Course Features Highlight - Directly Beneath Banner */}
                      {(() => {
                        const activeFeatures = (course.features && Array.isArray(course.features) && course.features.length > 0)
                          ? course.features
                          : (settings?.defaultCourseFeatures && Array.isArray(settings.defaultCourseFeatures) && settings.defaultCourseFeatures.length > 0
                              ? settings.defaultCourseFeatures
                              : ['রেকর্ডেড ও লাইভ ভিডিও ক্লাস', 'অধ্যায়ভিত্তিক এইচডি পিডিএফ লেকচার শিট', 'সাপ্তাহিক অনলাইন পরীক্ষা', '২৪/৭ ডাউট সলভ']);

                        return (
                          <div className="mx-3 mt-3 p-2.5 rounded-xl bg-slate-950/80 border border-cyan-500/30 space-y-1.5 shadow-inner">
                            <div className="text-[10px] font-mono font-bold text-cyan-300 flex items-center gap-1.5">
                              <Sparkles className="w-3 h-3 text-cyan-400" />
                              <span>কোর্সের বৈশিষ্ট্যসমূহ:</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {activeFeatures.map((feat, fIdx) => (
                                <span
                                  key={fIdx}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/30 text-[10px] text-cyan-200 font-sans"
                                  title={feat}
                                >
                                  <Check className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
                                  <span className="truncate max-w-[140px] sm:max-w-[160px]">{feat}</span>
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })()}

                      <div className="p-4 space-y-2">
                        <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                          {course.title}
                        </h4>
                        <p className="text-slate-400 text-xs line-clamp-2">
                          {course.description}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 pt-0 border-t border-white/5 mt-2 flex items-center justify-between">
                      <span className="text-base font-bold text-cyan-400">
                        ৳{course.price?.toLocaleString('bn-BD')}
                      </span>
                      {onOpenPaymentModal && (
                        <button
                          onClick={() => onOpenPaymentModal(course)}
                          className="px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>এনরোল</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* Edit Transaction Modal */}
      <AnimatePresence>
        {showEditTrxModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-[#0e1628] border-2 border-cyan-400/60 rounded-3xl max-w-md w-full p-6 space-y-5 relative shadow-2xl text-slate-100"
            >
              <button
                onClick={() => {
                  setShowEditTrxModal(false);
                  setEditError('');
                  setEditSuccess('');
                }}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl bg-slate-900 border border-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-1 pr-6">
                <h3 className="text-lg font-display font-bold text-white flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-cyan-400" />
                  <span>ট্রানজেকশন তথ্য সংশোধন</span>
                </h3>
                <p className="text-xs text-slate-300">
                  ভুল TrxID বা প্রেরক নম্বর দিয়ে থাকলে এখানে সঠিক তথ্য দিয়ে আপডেট করুন।
                </p>
              </div>

              {editError && (
                <div className="p-3 bg-rose-500/20 border border-rose-500/40 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{editError}</span>
                </div>
              )}

              {editSuccess && (
                <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{editSuccess}</span>
                </div>
              )}

              <form onSubmit={handleEditTrxSubmit} className="space-y-4">
                {/* Payment Method Selector */}
                <div>
                  <label className="block text-xs font-mono font-semibold text-slate-300 mb-1.5">
                    পেমেন্ট মেথড (Payment Method):
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['bkash', 'nagad', 'rocket'] as const).map((method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setEditPaymentMethod(method)}
                        className={`py-2 px-3 rounded-xl text-xs font-bold font-mono uppercase transition-all border ${
                          editPaymentMethod === method
                            ? 'bg-cyan-500/25 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.3)]'
                            : 'bg-slate-900/80 border-slate-700 text-slate-400 hover:border-slate-500'
                        }`}
                      >
                        {method}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sender Phone */}
                <div>
                  <label className="block text-xs font-mono font-semibold text-slate-300 mb-1">
                    প্রেরক মোবাইল নম্বর (Sender Phone):
                  </label>
                  <input
                    type="tel"
                    value={editSenderPhone}
                    onChange={(e) => setEditSenderPhone(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-400 font-mono"
                    required
                  />
                </div>

                {/* Transaction ID */}
                <div>
                  <label className="block text-xs font-mono font-semibold text-slate-300 mb-1">
                    সঠিক TrxID / ট্রানজেকশন আইডি:
                  </label>
                  <input
                    type="text"
                    value={editTrxId}
                    onChange={(e) => setEditTrxId(e.target.value)}
                    placeholder="e.g. 9J87X1K2M9"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-400 font-mono uppercase"
                    required
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowEditTrxModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    disabled={editSubmitting}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 disabled:opacity-60 cursor-pointer shadow-md"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{editSubmitting ? 'সেভ হচ্ছে...' : 'তথ্য আপডেট করুন'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
