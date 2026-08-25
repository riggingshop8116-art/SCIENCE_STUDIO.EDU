import React from 'react';
import { motion } from 'motion/react';
import { Megaphone, Calendar, Phone, ArrowRight, Bell, Sparkles, ShieldCheck, Zap } from 'lucide-react';
import { Settings } from '../types';

interface AnnouncementBannerProps {
  settings?: Settings;
  onOpenRoutine?: () => void;
  onOpenContact?: () => void;
  onJoinClick?: () => void;
}

export default function AnnouncementBanner({
  settings,
  onOpenRoutine,
  onOpenContact,
  onJoinClick
}: AnnouncementBannerProps) {
  const primaryNotice = settings?.announcement || 'নতুন শিক্ষাবর্ষ ২০২৬ ভর্তি কার্যক্রম চলছে! পদার্থবিজ্ঞান, রসায়ন, জীববিজ্ঞান ও গণিতে সীমিত আসনে আসন সংরক্ষণ করুন।';
  
  // Array of instructions & guidelines to scroll in marquee format
  const marqueeItems = [
    primaryNotice,
    settings?.marqueeNotice2 || '🔬 ভার্চুয়াল ল্যাবে পদার্থ, রসায়ন, জীব ও গণিতের ৩ডি ইন্টার-অ্যাক্টিভ সিমুলেশন ক্লাস উপলব্ধ।',
    settings?.marqueeNotice3 || '📅 প্রতি সপ্তাহের রুটিন অনুযায়ী অফলাইন ক্লাসরুম ও অনলাইন লাইভ সেশন অনুষ্ঠিত হয়।',
    settings?.marqueeNotice4 || '📚 প্রতিটি অধ্যায়ের প্র্যাকটিক্যাল হ্যান্ডনোট ও ফর্মুলা শিট ক্লাসরুম পোর্টাল থেকে ডাউনলোড করা যাবে।',
    settings?.marqueeNotice5 || '⚡ সার্বক্ষণিক ডাউট ক্লিয়ারিং ডেস্ক ও মেন্টরশিপের সুবিধা পেতে আপনার প্রোফাইল অ্যাক্টিভ রাখুন।'
  ].filter(Boolean);

  return (
    <div className="w-full mx-auto px-1 sm:px-2" id="hero-marquee-announcement-strip">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full rounded-2xl bg-gradient-to-r from-[#081224]/95 via-[#0b1830]/95 to-[#081224]/95 border border-cyan-500/25 p-2.5 sm:p-3.5 shadow-xl overflow-hidden backdrop-blur-2xl"
      >
        <div className="relative z-10 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5 sm:gap-4">
          
          {/* Left: Megaphone Badge & Continuous Infinite Marquee Ticker */}
          <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0 w-full overflow-hidden">
            
            {/* Animated Megaphone Badge */}
            <div className="shrink-0 flex items-center gap-1.5 sm:gap-2.5 px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-xl sm:rounded-2xl bg-amber-500/20 border border-amber-400/50 sm:border-2 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.25)]">
              <Megaphone className="w-4 h-4 sm:w-6 sm:h-6 text-amber-400 animate-pulse shrink-0" />
              <span className="text-xs sm:text-base md:text-lg font-mono font-black uppercase tracking-wide text-amber-300 whitespace-nowrap">
                {settings?.announcementBadge || 'নির্দেশনা ও নোটিশ'}
              </span>
            </div>

            {/* Seamless Infinite Marquee Ticker Wrapper */}
            <div className="flex-1 overflow-hidden relative cursor-default mask-marquee py-1 min-w-0">
              <div className="animate-marquee-infinite flex items-center gap-8 sm:gap-14">
                {/* First Set of Items */}
                {marqueeItems.map((item, idx) => (
                  <div key={`m1-${idx}`} className="inline-flex items-center gap-2.5 sm:gap-3.5 text-sm sm:text-base md:text-lg font-sans font-bold text-slate-100 shrink-0 tracking-wide drop-shadow-md">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee] shrink-0 animate-ping" />
                    <span className="leading-snug">{item}</span>
                    <span className="text-cyan-400/70 ml-2.5 sm:ml-3.5 font-mono text-sm sm:text-lg">✦</span>
                  </div>
                ))}

                {/* Duplicate Set for Seamless Infinite Looping */}
                {marqueeItems.map((item, idx) => (
                  <div key={`m2-${idx}`} className="inline-flex items-center gap-2.5 sm:gap-3.5 text-sm sm:text-base md:text-lg font-sans font-bold text-slate-100 shrink-0 tracking-wide drop-shadow-md">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee] shrink-0 animate-ping" />
                    <span className="leading-snug">{item}</span>
                    <span className="text-cyan-400/70 ml-2.5 sm:ml-3.5 font-mono text-sm sm:text-lg">✦</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Interactive Quick Action Buttons */}
          <div className="flex items-center justify-end gap-2 sm:gap-3 shrink-0 w-full lg:w-auto pt-1.5 lg:pt-0 border-t lg:border-t-0 border-white/10">
            {onOpenContact && (
              <button
                type="button"
                onClick={onOpenContact}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 hover:border-amber-400/70 text-amber-300 text-xs sm:text-sm font-sans font-bold transition-all cursor-pointer shadow-sm shrink-0"
                title="সরাসরি একাডেমি হেল্পলাইন"
              >
                <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0" />
                <span className="whitespace-nowrap">যোগাযোগ</span>
              </button>
            )}

            {onJoinClick && (
              <button
                type="button"
                onClick={onJoinClick}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-1.5 sm:py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs sm:text-sm font-sans font-extrabold transition-all cursor-pointer shadow-[0_0_20px_rgba(6,182,212,0.35)] hover:shadow-cyan-500/50 shrink-0 btn-shine"
              >
                <span className="whitespace-nowrap">ভর্তি হতে ক্লিক করুন</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
