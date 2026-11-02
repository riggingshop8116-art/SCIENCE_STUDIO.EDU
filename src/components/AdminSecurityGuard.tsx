import React from 'react';
import { Shield, Lock, ArrowRight, Home, BookOpen, AlertOctagon, KeyRound } from 'lucide-react';

interface AdminSecurityGuardProps {
  onOpenAdminLogin: () => void;
  onReturnHome: () => void;
  onReturnClassroom?: () => void;
  isStudentLoggedIn?: boolean;
  userEmail?: string;
}

export default function AdminSecurityGuard({
  onOpenAdminLogin,
  onReturnHome,
  onReturnClassroom,
  isStudentLoggedIn = false,
  userEmail = ''
}: AdminSecurityGuardProps) {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Ambient background security glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 sm:w-[500px] h-96 sm:h-[500px] bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-lg w-full bg-slate-900/90 border border-rose-500/30 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-2xl text-center space-y-6">
        {/* Animated Security Shield Icon */}
        <div className="relative mx-auto w-20 h-20 sm:w-24 sm:h-24">
          <div className="w-full h-full rounded-3xl bg-gradient-to-br from-rose-500/20 via-slate-800 to-indigo-500/20 border-2 border-rose-500/40 flex items-center justify-center text-rose-400 shadow-[0_0_30px_rgba(244,63,94,0.3)]">
            <Shield className="w-10 h-10 sm:w-12 sm:h-12 text-rose-400" />
          </div>
          <div className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-slate-950 border border-rose-500/60 text-amber-400 shadow-md">
            <Lock className="w-4 h-4" />
          </div>
        </div>

        {/* Path & Badge */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 font-mono text-xs font-semibold uppercase tracking-wider">
            <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
            <span>Restricted Area • /admin</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-white font-display">
            এডমিন অ্যাক্সেস সুরক্ষিত
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans max-w-md mx-auto">
            {isStudentLoggedIn ? (
              <>
                আপনি বর্তমানে শিক্ষার্থী হিসেবে লগইন আছেন{' '}
                <strong className="text-cyan-300 font-mono">({userEmail || 'শিক্ষার্থী'})</strong>। এই ড্যাশবোর্ডটি শুধুমাত্র Science Studio-র অনুমোদিত অ্যাডমিনের জন্য সংরক্ষিত।
              </>
            ) : (
              'সায়েন্স স্টুডিওর প্রশাসনিক পোর্টালে প্রবেশ করতে আপনার অনুমোদিত অ্যাডমিন আইডি ও পাসওয়ার্ড দিয়ে লগইন সম্পন্ন করুন।'
            )}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <button
            type="button"
            onClick={onOpenAdminLogin}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-rose-500 via-rose-600 to-indigo-600 hover:from-rose-400 hover:to-indigo-500 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all shadow-[0_0_20px_rgba(244,63,94,0.4)] cursor-pointer active:scale-95 group"
          >
            <KeyRound className="w-4 h-4 text-white group-hover:rotate-45 transition-transform" />
            <span>{isStudentLoggedIn ? 'অন্য অ্যাডমিন আইডিতে লগইন করুন' : 'এডমিন লগইন করুন'}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
            {isStudentLoggedIn && onReturnClassroom && (
              <button
                type="button"
                onClick={onReturnClassroom}
                className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-cyan-500/30 text-cyan-300 font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-cyan-400" />
                <span>আমার ক্লাসরুমে যান</span>
              </button>
            )}

            <button
              type="button"
              onClick={onReturnHome}
              className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 hover:text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Home className="w-4 h-4 text-slate-400" />
              <span>হোম পেজে ফিরে যান</span>
            </button>
          </div>
        </div>

        {/* Security watermark footer */}
        <div className="pt-4 border-t border-white/5 flex items-center justify-center gap-3 text-[11px] font-mono text-slate-500">
          <span>SUPABASE AUTH GUARD</span>
          <span>•</span>
          <span>ROLE-BASED PERMISSION</span>
        </div>
      </div>
    </div>
  );
}
