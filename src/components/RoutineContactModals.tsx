import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, Clock, X, Sparkles, Phone, Headphones, Mail, MapPin, 
  Copy, Check, MessageSquare, ExternalLink, ShieldCheck 
} from 'lucide-react';
import { Settings } from '../types';

interface RoutineContactModalsProps {
  routineModalOpen: boolean;
  onCloseRoutine: () => void;
  contactModalOpen: boolean;
  onCloseContact: () => void;
  settings?: Settings;
}

export default function RoutineContactModals({
  routineModalOpen,
  onCloseRoutine,
  contactModalOpen,
  onCloseContact,
  settings
}: RoutineContactModalsProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const customRoutine = (settings?.routineList && settings.routineList.length > 0)
    ? settings.routineList
    : (settings?.routine && settings.routine.length > 0)
      ? settings.routine
      : null;

  const routineList = customRoutine || [
    { id: '1', day: 'শনিবার ও মঙ্গলবার', time: 'বিকাল ৪:৩০ - ৬:০০', subject: 'পদার্থবিজ্ঞান ১ম ও ২য় পত্র (Physics Masterclass)' },
    { id: '2', day: 'রবিবার ও বুধবার', time: 'বিকাল ৪:৩০ - ৬:০০', subject: 'রসায়ন ১ম ও ২য় পত্র (Chemistry Concept & Reactions)' },
    { id: '3', day: 'সোমবার ও বৃহস্পতিবার', time: 'সন্ধ্যা ৬:৩০ - ৮:০০', subject: 'উচ্চতর গণিত ও জীববিজ্ঞান (Higher Math & Biology)' },
    { id: '4', day: 'শুক্রবার (সাপ্তাহিক)', time: 'সকাল ৯:০০ - ১২:০০', subject: 'মডেল টেস্ট, কুইজ সলভ ও স্পেশাল ৩ডি ল্যাব ওয়ার্কশপ' }
  ];

  const primaryPhone = settings?.contactPhone ? settings.contactPhone.split(',')[0].trim() : '+8801700000000';
  const cleanWhatsApp = primaryPhone.replace(/[^0-9+]/g, '');

  return (
    <>
      {/* 1. WEEKLY ROUTINE TIMETABLE MODAL */}
      <AnimatePresence>
        {routineModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xl animate-fade-in overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl bg-[#0a1122]/95 border-2 border-emerald-400/60 rounded-3xl overflow-hidden shadow-[0_0_60px_rgba(16,185,129,0.25)] my-8 p-6 sm:p-7 space-y-6 text-left"
            >
              {/* Ambient Background Glows */}
              <div className="absolute -top-24 -right-24 w-60 h-60 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />

              {/* Modal Header */}
              <div className="relative z-10 flex items-start justify-between border-b border-white/10 pb-4">
                <div className="space-y-2 pr-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/40 text-emerald-300 font-mono text-[11px] font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                    <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                    <span>সাপ্তাহিক ক্লাস রুটিন (WEEKLY TIMETABLE)</span>
                  </div>
                  <h3 className="font-display font-extrabold text-xl sm:text-2xl text-white">
                    সাকিব স্যারের ব্যাচ সময়সূচী
                  </h3>
                  <p className="text-xs text-slate-300">
                    অফলাইন ক্লাসরুম ও অনলাইন লাইভ পোর্টালে একই সাথে প্রযোজ্য
                  </p>
                </div>

                <button 
                  onClick={onCloseRoutine}
                  className="p-2.5 rounded-2xl bg-slate-900/90 border-2 border-white/10 hover:border-emerald-400/60 hover:bg-emerald-500/15 hover:shadow-[0_0_20px_rgba(16,185,129,0.35)] transition-all duration-300 cursor-pointer group shrink-0"
                  title="বন্ধ করুন (Close)"
                >
                  <X className="w-5 h-5 text-slate-400 group-hover:text-emerald-300 group-hover:scale-110 group-hover:rotate-90 transition-transform duration-300" />
                </button>
              </div>

              {/* Routine Body / Schedule Cards */}
              <div className="relative z-10 space-y-3 font-sans text-xs max-h-[60vh] overflow-y-auto pr-1">
                {routineList.map((item, idx) => (
                  <div 
                    key={item.id || idx} 
                    className="p-4 rounded-2xl bg-[#030712]/90 border-2 border-emerald-500/30 hover:border-emerald-400/80 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-bold flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                        {idx + 1}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-emerald-400 block font-sans">
                          {item.day}
                        </span>
                        <h4 className="text-sm font-bold text-white mt-0.5 group-hover:text-emerald-200 transition-colors">
                          {item.subject}
                        </h4>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-400/40 text-emerald-300 font-mono text-xs font-bold flex items-center gap-1.5 shadow-sm">
                        <Clock className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{item.time}</span>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Directive Callout Box */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent border border-emerald-500/30 flex items-start gap-3 mt-4">
                  <Sparkles className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="space-y-1 text-xs">
                    <div className="font-bold text-emerald-300">শিক্ষার্থীদের জন্য বিশেষ নির্দেশনা:</div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      অফলাইন ক্লাসের পাশাপাশি সকল ক্লাসের রেকর্ডিং ও লেকচার শিট পোর্টালে সঙ্গে সঙ্গেই যুক্ত হয়। রুটিন পরিবর্তন হলে এসএমএস ও নোটিফিকেশনের মাধ্যমে জানিয়ে দেওয়া হবে।
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="relative z-10 pt-3 border-t border-white/10 flex justify-end">
                <button 
                  onClick={onCloseRoutine}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs transition-all cursor-pointer shadow-[0_0_20px_rgba(16,185,129,0.35)] btn-shine"
                >
                  ঠিক আছে, বন্ধ করুন
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. HELPLINE & CONTACT MODAL */}
      <AnimatePresence>
        {contactModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xl animate-fade-in overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-[#0a1122]/95 border-2 border-cyan-400/60 rounded-3xl overflow-hidden shadow-[0_0_60px_rgba(34,211,238,0.25)] my-8 p-6 sm:p-7 space-y-6 text-left"
            >
              {/* Ambient Background Glows */}
              <div className="absolute -top-24 -right-24 w-60 h-60 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

              {/* Header */}
              <div className="relative z-10 flex items-start justify-between border-b border-white/10 pb-4">
                <div className="space-y-2 pr-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-400/40 text-cyan-300 font-mono text-[11px] font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                    <Headphones className="w-3.5 h-3.5 text-cyan-400" />
                    <span>২৪/৭ স্টুডেন্ট সাপোর্ট ও যোগাযোগ</span>
                  </div>
                  <h3 className="font-display font-extrabold text-xl sm:text-2xl text-white">
                    সায়েন্স স্টুডিও হেল্পলাইন
                  </h3>
                  <p className="text-xs text-slate-300">
                    সরাসরি সাকিব স্যারের একাডেমী ও সেন্ট্রাল সাপোর্ট টীম
                  </p>
                </div>

                <button 
                  onClick={onCloseContact}
                  className="p-2.5 rounded-2xl bg-slate-900/90 border-2 border-white/10 hover:border-cyan-400/60 hover:bg-cyan-500/15 hover:shadow-[0_0_20px_rgba(34,211,238,0.35)] transition-all duration-300 cursor-pointer group shrink-0"
                  title="বন্ধ করুন (Close)"
                >
                  <X className="w-5 h-5 text-slate-400 group-hover:text-cyan-300 group-hover:scale-110 group-hover:rotate-90 transition-transform duration-300" />
                </button>
              </div>

              {/* Body */}
              <div className="relative z-10 space-y-3.5 font-sans text-xs">
                
                {/* Phone Hotline Card */}
                <div className="p-4 rounded-2xl bg-[#030712]/90 border-2 border-cyan-500/30 hover:border-cyan-400 transition-all space-y-3 shadow-inner">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 shrink-0">
                        <Phone className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] text-cyan-400 font-bold uppercase font-mono block">
                          অফিশিয়াল হটলাইন (Hotline)
                        </span>
                        <strong className="text-sm sm:text-base font-bold text-white font-mono block mt-0.5">
                          {settings?.contactPhone || "+৮৮০ ১৭০০-০০০০০০, +৮৮০ ১৯০০-০০০০০০"}
                        </strong>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-mono font-bold shrink-0">
                      ● লাইভ সচল
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                    <button
                      onClick={() => handleCopy(settings?.contactPhone || "+৮৮০ ১৭০০-০০০০০০", 'phone')}
                      className="flex-1 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {copiedKey === 'phone' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                      <span>{copiedKey === 'phone' ? 'কপি হয়েছে' : 'নাম্বার কপি করুন'}</span>
                    </button>

                    <a
                      href={`https://wa.me/${cleanWhatsApp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2 px-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-emerald-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                      <span>হোয়াটসঅ্যাপ চ্যাট</span>
                    </a>
                  </div>
                </div>

                {/* Email Address */}
                <div className="p-3.5 rounded-2xl bg-[#030712]/90 border border-white/10 hover:border-cyan-500/40 transition-all flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-cyan-400 shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-mono block">অফিশিয়াল ইমেইল</span>
                      <span className="text-xs font-bold text-white font-mono">{settings?.contactEmail || "support@sciencestudio.com"}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopy(settings?.contactEmail || "support@sciencestudio.com", 'email')}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition-colors cursor-pointer"
                    title="ইমেইল কপি করুন"
                  >
                    {copiedKey === 'email' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                {/* Physical Location */}
                <div className="p-3.5 rounded-2xl bg-[#030712]/90 border border-white/10 hover:border-cyan-500/40 transition-all flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-cyan-400 shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">অ্যাকাডেমিক ক্যাম্পাস ঠিকানা</span>
                    <span className="text-xs text-slate-200 font-sans leading-relaxed">{settings?.contactAddress || "বিজ্ঞান পার্ক রোড, ফার্মগেট, ঢাকা - ১২১৫"}</span>
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="relative z-10 pt-3 border-t border-white/10 flex justify-end">
                <button 
                  onClick={onCloseContact}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-xs transition-all cursor-pointer shadow-[0_0_20px_rgba(6,182,212,0.35)] btn-shine"
                >
                  বন্ধ করুন
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
