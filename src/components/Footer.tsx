import React from 'react';
import { 
  Atom, Mail, Phone, MapPin, Sparkles, Shield, Calendar, 
  Clock, ArrowUpRight, CheckCircle2, ChevronRight, Zap
} from 'lucide-react';
import { User, Settings } from '../types';
import LogoImage from '../assets/images/science_studio_logo_1784521830593.jpg';

interface FooterProps {
  settings: Settings;
  user: User | null;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenAuth: () => void;
  onOpenAdminAuth?: () => void;
  onOpenRoutine: () => void;
  onOpenContact: () => void;
}

export default function Footer({
  settings,
  user,
  currentTab,
  setCurrentTab,
  onOpenAuth,
  onOpenAdminAuth,
  onOpenRoutine,
  onOpenContact,
}: FooterProps) {
  const isCompactView = currentTab === 'admin' || currentTab === 'admin-settings';

  return (
    <footer className="relative w-full border-t border-cyan-500/30 bg-[#080c16]/95 backdrop-blur-2xl text-slate-200 overflow-hidden shrink-0 z-20">
      {/* High-visibility multi-color neon laser top border line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-500 via-emerald-400 to-indigo-500 shadow-[0_0_15px_rgba(34,211,238,0.8)]" />

      {/* Subtle ambient glowing spots in footer background */}
      <div className="absolute top-[-50px] left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-50px] right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 py-10 md:py-14 relative z-10">
        {!isCompactView && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10 pb-12 border-b border-white/10">
            
            {/* Col 1: Brand & Identity */}
            <div className="space-y-4">
              <div 
                onClick={() => setCurrentTab('home')}
                className="flex items-center gap-3 cursor-pointer group w-fit"
              >
                <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-cyan-400 shadow-[0_0_18px_rgba(34,211,238,0.4)] group-hover:scale-105 group-hover:border-emerald-400 transition-all duration-300 shrink-0">
                  <img 
                    src={LogoImage} 
                    alt="Science Studio Sakib Sir" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <h3 className="font-display font-black text-base text-white tracking-wider leading-tight">
                    {settings.academyName || "SCIENCE STUDIO by Sakib"}
                  </h3>
                  <p className="text-[10px] font-mono font-bold text-emerald-400 tracking-wider uppercase mt-0.5">
                    Premium Science Coaching
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {settings.footerDescription}
              </p>

              {/* Live Status Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] font-medium shadow-[0_0_12px_rgba(16,185,129,0.15)]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
                <span>অনলাইন ল্যাব ও পোর্টালে ভর্তি কার্যক্রম চলমান</span>
              </div>
            </div>

            {/* Col 2: Academic Subjects */}
            <div className="space-y-3.5">
              <h4 className="text-white font-display font-bold text-xs uppercase tracking-wider flex items-center gap-2">
                <Atom className="w-4 h-4 text-cyan-400" />
                <span>আমাদের কোর্স বিষয়সমূহ</span>
              </h4>
              <ul className="space-y-2 text-xs font-sans text-slate-300">
                {(settings.subjects || ["Physics", "Chemistry", "Biology", "Higher Math"]).map((sub, idx) => (
                  <li 
                    key={idx}
                    onClick={() => setCurrentTab('lab')}
                    className="flex items-center gap-2 hover:text-cyan-300 hover:translate-x-1 transition-all cursor-pointer group"
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-cyan-500 group-hover:text-cyan-300" />
                    <span>{sub} স্পেশাল প্র্যাকটিক্যাল ব্যাচ</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 3: Academic Features & Support */}
            <div className="space-y-3.5">
              <h4 className="text-white font-display font-bold text-xs uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>বিশেষ ফিচারসমূহ</span>
              </h4>
              <ul className="space-y-2 text-xs font-sans text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>ইন্টারেক্টিভ ভার্চুয়াল ল্যাব প্লে-ডেস্ক</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>অধ্যায়ভিত্তিক HD ভিডিও ও লেকচার নোট</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>২৪/৭ ডাউট ক্লিয়ারিং মেন্টরশিপ</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>সাপ্তাহিক মডেল টেস্ট ও র‍্যাঙ্কিং বোর্ড</span>
                </li>
              </ul>
            </div>

            {/* Col 4: Contact & Hotline Card */}
            <div className="space-y-3.5">
              <h4 className="text-white font-display font-bold text-xs uppercase tracking-wider flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-400" />
                <span>যোগাযোগ ও একাডেমি ঠিকানা</span>
              </h4>

              <div className="p-4 rounded-2xl bg-slate-900/90 border border-cyan-500/20 space-y-3 text-xs shadow-lg">
                <div className="flex items-start gap-2.5 text-slate-300">
                  <MapPin className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span className="leading-snug">{settings.contactAddress}</span>
                </div>

                <div className="flex items-center gap-2.5 text-slate-300">
                  <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-mono font-semibold text-emerald-300">{settings.contactPhone}</span>
                </div>

                <div className="flex items-center gap-2.5 text-slate-300">
                  <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="font-mono text-cyan-300">{settings.contactEmail}</span>
                </div>

                {/* Clean Contact Info without helpline and routine buttons */}
                <div className="pt-2 border-t border-white/10 flex items-center gap-2 text-[11px] text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400/80 animate-pulse shrink-0" />
                  <span>সরাসরি যোগাযোগ ও ক্লাসরুম কাউন্সেলিং ডেস্ক</span>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Bottom Copyright & Discreet Portal Access Bar */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>
              © {new Date().getFullYear()} {(settings.academyName || "SCIENCE STUDIO").toUpperCase()}. ALL RIGHTS RESERVED.
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 sm:gap-4">
            <span className="hover:text-cyan-300 transition-colors cursor-pointer">গোপনীয়তা নীতি (Privacy)</span>
            <span>•</span>
            <span className="hover:text-cyan-300 transition-colors cursor-pointer">ব্যবহারের শর্তাবলী (Terms)</span>
            <span>•</span>
            
            {/* Admin Portal Symbol Link (Discreet Icon Only - Exclusively on Home Page Footer) */}
            {currentTab === 'home' && (
              <button
                onClick={() => {
                  if (user?.role === 'admin') {
                    setCurrentTab('admin');
                  } else if (onOpenAdminAuth) {
                    onOpenAdminAuth();
                  } else {
                    onOpenAuth();
                  }
                }}
                className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-rose-500/20 border border-slate-700/70 hover:border-rose-500/50 text-slate-400 hover:text-rose-300 transition-all cursor-pointer shadow-sm hover:shadow-[0_0_12px_rgba(244,63,94,0.3)] group inline-flex items-center justify-center"
                title="এডমিন প্যানেল"
                aria-label="এডমিন প্যানেল"
                id="footer-admin-portal-button"
              >
                <Shield className="w-3.5 h-3.5 group-hover:scale-110 transition-transform text-slate-400 group-hover:text-rose-400" />
              </button>
            )}
          </div>
        </div>

      </div>
    </footer>
  );
}
