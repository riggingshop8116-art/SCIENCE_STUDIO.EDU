import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Shield, Sparkles, Lock, Eye, CheckCircle2, UserCheck, Star } from 'lucide-react';

interface AnimatedCapAvatarProps {
  isPasswordFocused: boolean;
  showPassword: boolean;
  focusedField: 'name' | 'email' | 'phone' | 'password' | null;
  mode: 'login' | 'register' | 'admin';
  hasError?: boolean;
  isLoading?: boolean;
}

export default function AnimatedCapAvatar({
  isPasswordFocused,
  showPassword,
  focusedField,
  mode,
  hasError = false,
  isLoading = false
}: AnimatedCapAvatarProps) {
  const [blink, setBlink] = useState(false);

  // Periodically blink when eyes are not in password mode
  useEffect(() => {
    if (isPasswordFocused) return;

    const blinkInterval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 160);
    }, 4000);

    return () => clearInterval(blinkInterval);
  }, [isPasswordFocused]);

  // Refined palette based on academic mode
  const getThemeColors = () => {
    if (mode === 'admin') {
      return {
        capColor: '#881337',
        capTop: '#4c0519',
        capBorder: '#e11d48',
        capGlow: 'rgba(225, 29, 72, 0.18)',
        tasselColor: '#f59e0b',
        robeColor: '#1e1124',
        robeDark: '#0d0711',
        robeAccent: '#f43f5e',
        badgeColor: '#f59e0b',
        bgGradient: 'from-rose-950/30 via-slate-900/60 to-[#0c1222]',
        borderColor: 'border-rose-500/30',
        shadowGlow: 'shadow-[0_4px_24px_rgba(0,0,0,0.5)]',
        accentText: 'text-rose-300',
        badgeText: 'অ্যাকাডেমি অ্যাডমিন পোর্টাল'
      };
    }
    if (mode === 'register') {
      return {
        capColor: '#0f766e',
        capTop: '#042f2e',
        capBorder: '#14b8a6',
        capGlow: 'rgba(20, 184, 166, 0.18)',
        tasselColor: '#38bdf8',
        robeColor: '#0c1f2e',
        robeDark: '#06111a',
        robeAccent: '#10b981',
        badgeColor: '#fbbf24',
        bgGradient: 'from-emerald-950/30 via-slate-900/60 to-[#0c1222]',
        borderColor: 'border-emerald-500/30',
        shadowGlow: 'shadow-[0_4px_24px_rgba(0,0,0,0.5)]',
        accentText: 'text-emerald-300',
        badgeText: 'নতুন শিক্ষার্থী ভর্তি গেটওয়ে'
      };
    }
    // Default student login
    return {
      capColor: '#0369a1',
      capTop: '#082f49',
      capBorder: '#0ea5e9',
      capGlow: 'rgba(14, 165, 233, 0.18)',
      tasselColor: '#f59e0b',
      robeColor: '#0e1e38',
      robeDark: '#07101e',
      robeAccent: '#06b6d4',
      badgeColor: '#38bdf8',
      bgGradient: 'from-cyan-950/30 via-slate-900/60 to-[#0c1222]',
      borderColor: 'border-cyan-500/30',
      shadowGlow: 'shadow-[0_4px_24px_rgba(0,0,0,0.5)]',
      accentText: 'text-cyan-300',
      badgeText: 'স্টুডেন্ট ক্লাসরুম পোর্টাল'
    };
  };

  const theme = getThemeColors();

  // Helpful, organic human reaction status
  const getStatusMessage = () => {
    if (isLoading) {
      return {
        icon: <Sparkles className="w-3.5 h-3.5 text-cyan-300 animate-spin" />,
        text: 'তথ্য যাচাই করা হচ্ছে... অনুগ্রহ করে অপেক্ষা করুন'
      };
    }
    if (hasError) {
      return {
        icon: <Lock className="w-3.5 h-3.5 text-rose-400" />,
        text: 'প্রদত্ত তথ্যে গরমিল দেখা যাচ্ছে। অনুগ্রহ করে পুনরায় দেখুন।'
      };
    }
    if (isPasswordFocused && !showPassword) {
      return {
        icon: <Lock className="w-3.5 h-3.5 text-amber-400" />,
        text: 'পাসওয়ার্ডটি গোপন ও নিরাপদ রাখা হচ্ছে'
      };
    }
    if (isPasswordFocused && showPassword) {
      return {
        icon: <Eye className="w-3.5 h-3.5 text-cyan-300" />,
        text: 'পাসওয়ার্ড স্পষ্টভাবে দৃশ্যমান'
      };
    }
    if (focusedField === 'email') {
      return {
        icon: <Sparkles className="w-3.5 h-3.5 text-cyan-400" />,
        text: 'আপনার অ্যাকাউন্টের নিবন্ধিত ইমেইল লিখুন'
      };
    }
    if (focusedField === 'name') {
      return {
        icon: <UserCheck className="w-3.5 h-3.5 text-emerald-400" />,
        text: 'শিক্ষার্থীর সার্টিফিকেটের সাথে মিলিয়ে পূর্ণ নাম লিখুন'
      };
    }
    if (focusedField === 'phone') {
      return {
        icon: <Sparkles className="w-3.5 h-3.5 text-emerald-400" />,
        text: '১১ ডিজিটের সক্রিয় মোবাইল নম্বর লিখুন'
      };
    }
    if (mode === 'register') {
      return {
        icon: <Star className="w-3.5 h-3.5 text-emerald-400" />,
        text: '১ মিনিটে সহজে রেজিস্ট্রেশন সম্পন্ন করুন'
      };
    }
    if (mode === 'admin') {
      return {
        icon: <Shield className="w-3.5 h-3.5 text-rose-400" />,
        text: 'প্রশাসনিক অ্যাক্সেসের জন্য ক্রেডেনশিয়াল দিন'
      };
    }
    return {
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />,
      text: 'ক্লাসরুম ও লেকচার শিট অ্যাক্সেস করতে লগইন করুন'
    };
  };

  const status = getStatusMessage();

  // Cap animation tilt
  const capTilt = isPasswordFocused
    ? showPassword
      ? 3
      : -2
    : focusedField === 'email' || focusedField === 'phone'
    ? 1.5
    : 0;

  // Pupil offsets for eye gaze
  let pupilOffsetX = 0;
  let pupilOffsetY = 0;
  if (focusedField === 'email' || focusedField === 'name' || focusedField === 'phone') {
    pupilOffsetY = 2;
    pupilOffsetX = focusedField === 'phone' ? 1.5 : -1.5;
  }

  return (
    <div
      className={`relative w-full rounded-2xl overflow-hidden border ${theme.borderColor} ${theme.shadowGlow} bg-gradient-to-b ${theme.bgGradient} p-3 sm:p-4 mb-4 select-none transition-all duration-300`}
    >
      {/* Top Academic Status Strip */}
      <div className="relative z-10 flex items-center justify-between gap-2 mb-1">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-900/90 border border-white/10 text-[11px] font-sans text-slate-300 shadow-sm backdrop-blur-md">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 inline-block" />
          <span className="font-medium">{theme.badgeText}</span>
        </div>

        <div className="text-[10px] font-mono font-bold tracking-wider text-slate-400 bg-black/40 px-2 py-0.5 rounded-md border border-white/5">
          {mode === 'admin' ? 'ADMIN ACCESS' : (mode === 'register' ? 'ADMISSION PORTAL' : 'STUDENT DESK')}
        </div>
      </div>

      {/* Main Animated Avatar Canvas */}
      <div className="relative flex items-center justify-center h-36 sm:h-40 py-1">
        <svg
          viewBox="0 0 200 175"
          className="w-56 sm:w-64 h-full drop-shadow-[0_8px_20px_rgba(0,0,0,0.5)] overflow-visible"
        >
          <defs>
            {/* Skin Tone Gradient */}
            <linearGradient id="faceGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fdf0e6" />
              <stop offset="60%" stopColor="#fcd3b6" />
              <stop offset="100%" stopColor="#f6b896" />
            </linearGradient>

            {/* Hand Gradient */}
            <linearGradient id="handGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fef3e8" />
              <stop offset="60%" stopColor="#fcd3b6" />
              <stop offset="100%" stopColor="#f5aa82" />
            </linearGradient>

            {/* Robe Gradient */}
            <linearGradient id="robeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={theme.robeColor} />
              <stop offset="100%" stopColor={theme.robeDark} />
            </linearGradient>

            {/* Cap Brim Gradient */}
            <linearGradient id="capGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={theme.capBorder} />
              <stop offset="50%" stopColor={theme.capColor} />
              <stop offset="100%" stopColor={theme.capTop} />
            </linearGradient>

            {/* Cap Gold Tassel Gradient */}
            <linearGradient id="tasselGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>

            {/* Shadow Filter */}
            <filter id="avatarShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="rgba(0,0,0,0.4)" />
            </filter>
          </defs>

          {/* Ambient Glow behind Avatar */}
          <circle cx="100" cy="88" r="50" fill={theme.capGlow} className="blur-xl opacity-50 pointer-events-none" />

          {/* 1. Scholar Robe & Body */}
          <g id="avatar-body">
            {/* Robe Main Torso */}
            <path
              d="M 44 170 C 48 124 60 114 76 112 Q 100 118 124 112 C 140 114 152 124 156 170 Z"
              fill="url(#robeGrad)"
              stroke={theme.robeAccent}
              strokeWidth="1.5"
              strokeOpacity="0.4"
            />

            {/* Left & Right Shoulder Base Joints */}
            <circle cx="60" cy="120" r="14" fill="url(#robeGrad)" stroke={theme.robeAccent} strokeWidth="1" strokeOpacity="0.3" />
            <circle cx="140" cy="120" r="14" fill="url(#robeGrad)" stroke={theme.robeAccent} strokeWidth="1" strokeOpacity="0.3" />

            {/* Robe Collar & Inner Shirt */}
            <path
              d="M 76 112 L 100 142 L 124 112 Z"
              fill="#070c18"
              stroke={theme.robeAccent}
              strokeWidth="1.2"
              strokeOpacity="0.6"
            />

            {/* Academic Necktie Ribbon */}
            <path
              d="M 97 122 L 103 122 L 105 148 L 100 155 L 95 148 Z"
              fill="url(#tasselGrad)"
            />

            {/* Academy Chest Pin */}
            <circle cx="120" cy="134" r="5.5" fill="#0f172a" stroke={theme.tasselColor} strokeWidth="1.2" />
            <circle cx="120" cy="134" r="2.8" fill={theme.tasselColor} />
          </g>

          {/* 2. Head & Facial Features */}
          <g id="avatar-head">
            {/* Ears */}
            <circle cx="68" cy="84" r="8.5" fill="url(#faceGrad)" />
            <circle cx="68" cy="84" r="4.5" fill="#fca5a5" opacity="0.35" />
            <circle cx="132" cy="84" r="8.5" fill="url(#faceGrad)" />
            <circle cx="132" cy="84" r="4.5" fill="#fca5a5" opacity="0.35" />

            {/* Head Contour */}
            <circle cx="100" cy="80" r="32" fill="url(#faceGrad)" stroke="#fbcfe8" strokeWidth="0.5" filter="url(#avatarShadow)" />

            {/* Hair under cap */}
            <path
              d="M 76 68 Q 84 75 92 68 Q 100 77 108 68 Q 116 75 124 68"
              stroke="#334155"
              strokeWidth="3.2"
              strokeLinecap="round"
              fill="none"
            />

            {/* Soft Cheeks */}
            <motion.ellipse
              cx="79"
              cy="92"
              rx="5.5"
              ry="3"
              fill="#f43f5e"
              animate={{
                opacity: isPasswordFocused ? 0.75 : 0.35,
                scale: isPasswordFocused ? 1.2 : 1
              }}
              transition={{ duration: 0.25 }}
            />
            <motion.ellipse
              cx="121"
              cy="92"
              rx="5.5"
              ry="3"
              fill="#f43f5e"
              animate={{
                opacity: isPasswordFocused ? 0.75 : 0.35,
                scale: isPasswordFocused ? 1.2 : 1
              }}
              transition={{ duration: 0.25 }}
            />

            {/* Eyes */}
            <g id="avatar-eyes">
              {/* LEFT EYE */}
              <g transform="translate(84, 82)">
                {isPasswordFocused ? (
                  // Closed relaxed arc in password mode
                  <g>
                    <path
                      d="M -6 1 Q 0 -4 6 1"
                      fill="none"
                      stroke="#1e293b"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />
                    <line x1="-4" y1="-1" x2="-6" y2="-3.5" stroke="#1e293b" strokeWidth="1.2" strokeLinecap="round" />
                    <line x1="0" y1="-2.5" x2="0" y2="-5" stroke="#1e293b" strokeWidth="1.2" strokeLinecap="round" />
                    <line x1="4" y1="-1" x2="6" y2="-3.5" stroke="#1e293b" strokeWidth="1.2" strokeLinecap="round" />
                  </g>
                ) : (
                  // Open natural eye with pupil tracking
                  <>
                    <ellipse cx="0" cy="0" rx="6.5" ry="8" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.5" />
                    <motion.g
                      animate={{
                        x: pupilOffsetX,
                        y: pupilOffsetY,
                        scaleY: blink ? 0.1 : 1
                      }}
                      transition={{ duration: 0.12 }}
                    >
                      <circle cx="0" cy="0" r="5" fill="#0f172a" />
                      <circle cx="-1.5" cy="-2" r="1.8" fill="#ffffff" />
                      <circle cx="1.2" cy="1.2" r="1" fill="#38bdf8" />
                    </motion.g>
                  </>
                )}
              </g>

              {/* RIGHT EYE */}
              <g transform="translate(116, 82)">
                {isPasswordFocused && !showPassword ? (
                  // Closed relaxed arc
                  <g>
                    <path
                      d="M -6 1 Q 0 -4 6 1"
                      fill="none"
                      stroke="#1e293b"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />
                    <line x1="-4" y1="-1" x2="-6" y2="-3.5" stroke="#1e293b" strokeWidth="1.2" strokeLinecap="round" />
                    <line x1="0" y1="-2.5" x2="0" y2="-5" stroke="#1e293b" strokeWidth="1.2" strokeLinecap="round" />
                    <line x1="4" y1="-1" x2="6" y2="-3.5" stroke="#1e293b" strokeWidth="1.2" strokeLinecap="round" />
                  </g>
                ) : isPasswordFocused && showPassword ? (
                  // Peeking open eye when password is shown
                  <>
                    <ellipse cx="0" cy="0" rx="7.5" ry="9" fill="#ffffff" stroke="#38bdf8" strokeWidth="1" />
                    <circle cx="0" cy="0" r="5.2" fill="#0f172a" />
                    <circle cx="-1.5" cy="-2.5" r="2.2" fill="#ffffff" />
                    <polygon points="1,-2 2,-4 3,-2 5,-2 3.5,-0.5 4,1.5 2,0.5 0,1.5 0.5,-0.5 -1,-2" fill="#fbbf24" />
                  </>
                ) : (
                  // Normal open eye with pupil tracking & greeting shine
                  <>
                    <ellipse cx="0" cy="0" rx="6.5" ry="8" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.5" />
                    <motion.g
                      animate={{
                        x: pupilOffsetX,
                        y: pupilOffsetY,
                        scaleY: blink ? 0.1 : 1
                      }}
                      transition={{ duration: 0.12 }}
                    >
                      <circle cx="0" cy="0" r="5" fill="#0f172a" />
                      <circle cx="-1.5" cy="-2" r="1.8" fill="#ffffff" />
                      <circle cx="1.2" cy="1.2" r="1" fill="#38bdf8" />
                    </motion.g>
                  </>
                )}
              </g>
            </g>

            {/* Natural Mouth */}
            <g id="avatar-mouth" transform="translate(100, 98)">
              {isPasswordFocused && !showPassword ? (
                <path
                  d="M -5 -1 Q -2.5 3 0 0 Q 2.5 3 5 -1"
                  fill="none"
                  stroke="#991b1b"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              ) : isPasswordFocused && showPassword ? (
                <ellipse cx="0" cy="1" rx="4" ry="4.5" fill="#be123c" stroke="#881337" strokeWidth="0.8" />
              ) : hasError ? (
                <path
                  d="M -4 2 Q -1 -1 2 2 Q 4 -1 5 2"
                  fill="none"
                  stroke="#991b1b"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              ) : (
                <path
                  d="M -5 0 Q 0 5 5 0"
                  fill="none"
                  stroke="#991b1b"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              )}
            </g>
          </g>

          {/* 3. Scholar Graduation Cap on Head */}
          <motion.g
            id="academic-cap"
            initial={false}
            animate={{
              rotate: capTilt,
              y: isPasswordFocused ? -1 : 0,
              transformOrigin: '100px 50px'
            }}
            transition={{
              type: 'spring',
              stiffness: 280,
              damping: 24
            }}
          >
            {/* Cap Base Band */}
            <path
              d="M 72 58 C 72 46 128 46 128 58 C 128 66 72 66 72 58 Z"
              fill={theme.capTop}
              stroke={theme.capBorder}
              strokeWidth="1.8"
            />

            {/* Front Cap Emblem */}
            <g transform="translate(100, 56)">
              <circle cx="0" cy="0" r="4.5" fill={theme.tasselColor} />
              {mode === 'admin' ? (
                <path d="M -2 -2 L 2 -2 L 2 0.5 L 0 2.5 L -2 0.5 Z" fill="#881337" />
              ) : mode === 'register' ? (
                <polygon points="0,-2.5 0.8,-0.8 2.5,-0.8 1.2,0.4 1.6,2.2 0,1.1 -1.6,2.2 -1.2,0.4 -2.5,-0.8 -0.8,-0.8" fill="#064e3b" />
              ) : (
                <circle cx="0" cy="0" r="1.8" fill="#082f49" />
              )}
            </g>

            {/* Mortarboard Diamond Top */}
            <polygon
              points="100,26 156,43 100,56 44,43"
              fill="url(#capGrad)"
              stroke={theme.capBorder}
              strokeWidth="2"
              filter="url(#avatarShadow)"
            />

            {/* Inner Top Highlight */}
            <polygon
              points="100,30 148,43 100,53 52,43"
              fill="none"
              stroke="#ffffff"
              strokeWidth="0.6"
              strokeOpacity="0.3"
            />

            {/* Central Golden Button */}
            <circle cx="100" cy="41" r="4.2" fill="url(#tasselGrad)" stroke="#78350f" strokeWidth="0.8" />

            {/* Golden Cap Tassel Ribbon */}
            <motion.path
              d="M 100 41 Q 62 48 56 68 L 54 84"
              fill="none"
              stroke="url(#tasselGrad)"
              strokeWidth="2.2"
              strokeLinecap="round"
              animate={{
                d: isPasswordFocused
                  ? 'M 100 41 Q 60 52 50 72 L 48 88'
                  : 'M 100 41 Q 62 48 56 68 L 54 84'
              }}
              transition={{ duration: 0.25 }}
            />
            {/* Tassel Fringe Pom */}
            <motion.g
              animate={{
                x: isPasswordFocused ? -5 : 0,
                y: isPasswordFocused ? 4 : 0
              }}
              transition={{ duration: 0.25 }}
            >
              <rect x="50" y="80" width="7" height="12" rx="2" fill="url(#tasselGrad)" stroke="#78350f" strokeWidth="0.6" />
              <line x1="52" y1="92" x2="52" y2="96" stroke="#fbbf24" strokeWidth="0.8" />
              <line x1="54" y1="92" x2="54" y2="97" stroke="#fbbf24" strokeWidth="0.8" />
              <line x1="56" y1="92" x2="56" y2="96" stroke="#fbbf24" strokeWidth="0.8" />
            </motion.g>
          </motion.g>

          {/* 4. LEFT ARM & HAND */}
          <g id="avatar-left-arm-group">
            <circle cx="60" cy="120" r="14" fill="url(#robeGrad)" stroke={theme.robeAccent} strokeWidth="1.2" strokeOpacity="0.4" />

            {!isPasswordFocused ? (
              // IDLE MODE: Left Arm Resting Naturally Along Body
              <g key="left-arm-static">
                <path
                  d="M 50 120 C 44 134 40 148 44 158 L 54 158 C 58 148 64 134 70 120 Z"
                  fill="url(#robeGrad)"
                  stroke={theme.robeAccent}
                  strokeWidth="1.2"
                  strokeOpacity="0.4"
                />

                <path
                  d="M 43 158 L 55 158"
                  stroke="url(#tasselGrad)"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                />

                <g transform="translate(48, 160)">
                  <path
                    d="M -5 0 C -6 4 -5 9 -2 11 C 1 12 5 11 6 8 C 7 5 6 1 5 0 Z"
                    fill="url(#handGrad)"
                    stroke="#fca5a5"
                    strokeWidth="0.6"
                  />
                  <path d="M 4 2 C 7 3 8 6 6 8 C 4 8 3 5 3 3 Z" fill="url(#handGrad)" stroke="#d97706" strokeWidth="0.6" />
                  <path d="M 2 8 L 3 13 C 3 14 1 14 1 13 L 0 8 Z" fill="url(#handGrad)" stroke="#d97706" strokeWidth="0.6" />
                  <path d="M 0 8 L 0 15 C 0 16 -2 16 -2 15 L -2 8 Z" fill="url(#handGrad)" stroke="#d97706" strokeWidth="0.6" />
                  <path d="M -2 8 L -3 14 C -3 15 -5 15 -5 14 L -4 8 Z" fill="url(#handGrad)" stroke="#d97706" strokeWidth="0.6" />
                  <path d="M -4 7 L -6 12 C -6 13 -8 12 -7 11 L -5 6 Z" fill="url(#handGrad)" stroke="#d97706" strokeWidth="0.6" />
                </g>
              </g>
            ) : (
              // PASSWORD MODE: Left Arm Raised & Covering Left Eye
              <motion.g
                key="left-arm-covering"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 280, damping: 24 }}
              >
                <path
                  d="M 50 124 C 42 110 44 96 58 88 L 72 82 L 80 92 C 70 100 64 114 68 126 Z"
                  fill="url(#robeGrad)"
                  stroke={theme.robeAccent}
                  strokeWidth="1.2"
                  strokeOpacity="0.4"
                />

                <path
                  d="M 71 81 L 81 91"
                  stroke="url(#tasselGrad)"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                />

                <g transform="translate(84, 82)">
                  <ellipse cx="0" cy="2" rx="14" ry="11" fill="rgba(0,0,0,0.25)" />
                  <ellipse cx="0" cy="0" rx="12" ry="9" fill="url(#handGrad)" stroke="#d97706" strokeWidth="0.7" />
                  <path d="M 8 1 C 12 3 12 6 9 8 C 7 9 6 6 7 2 Z" fill="url(#handGrad)" stroke="#d97706" strokeWidth="0.7" />
                  <path d="M 5 -4 C 7 -9 5 -12 2 -11 C 0 -10 2 -6 2 -3 Z" fill="url(#handGrad)" stroke="#d97706" strokeWidth="0.7" />
                  <path d="M 1 -5 C 1 -11 -2 -14 -4 -13 C -6 -12 -3 -7 -2 -4 Z" fill="url(#handGrad)" stroke="#d97706" strokeWidth="0.7" />
                  <path d="M -3 -5 C -4 -10 -7 -13 -9 -11 C -10 -9 -7 -6 -5 -3 Z" fill="url(#handGrad)" stroke="#d97706" strokeWidth="0.7" />
                  <path d="M -7 -3 C -10 -7 -13 -8 -13 -6 C -13 -4 -10 -2 -8 -1 Z" fill="url(#handGrad)" stroke="#d97706" strokeWidth="0.7" />
                </g>
              </motion.g>
            )}
          </g>

          {/* 5. RIGHT ARM & HAND */}
          <g id="avatar-right-arm-group">
            <circle cx="140" cy="120" r="14" fill="url(#robeGrad)" stroke={theme.robeAccent} strokeWidth="1.2" strokeOpacity="0.4" />

            {!isPasswordFocused ? (
              // IDLE MODE: Right Arm Resting Naturally Along Body
              <g key="right-arm-static">
                <path
                  d="M 150 120 C 156 134 160 148 156 158 L 146 158 C 142 148 136 134 130 120 Z"
                  fill="url(#robeGrad)"
                  stroke={theme.robeAccent}
                  strokeWidth="1.2"
                  strokeOpacity="0.4"
                />

                <path
                  d="M 145 158 L 157 158"
                  stroke="url(#tasselGrad)"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                />

                <g transform="translate(152, 160)">
                  <path
                    d="M 5 0 C 6 4 5 9 2 11 C -1 12 -5 11 -6 8 C -7 5 -6 1 -5 0 Z"
                    fill="url(#handGrad)"
                    stroke="#fca5a5"
                    strokeWidth="0.6"
                  />
                  <path d="M -4 2 C -7 3 -8 6 -6 8 C -4 8 -3 5 -3 3 Z" fill="url(#handGrad)" stroke="#d97706" strokeWidth="0.6" />
                  <path d="M -2 8 L -3 13 C -3 14 -1 14 -1 13 L 0 8 Z" fill="url(#handGrad)" stroke="#d97706" strokeWidth="0.6" />
                  <path d="M 0 8 L 0 15 C 0 16 2 16 2 15 L 2 8 Z" fill="url(#handGrad)" stroke="#d97706" strokeWidth="0.6" />
                  <path d="M 2 8 L 3 14 C 3 15 5 15 5 14 L 4 8 Z" fill="url(#handGrad)" stroke="#d97706" strokeWidth="0.6" />
                  <path d="M 4 7 L 6 12 C 6 13 8 12 7 11 L 5 6 Z" fill="url(#handGrad)" stroke="#d97706" strokeWidth="0.6" />
                </g>
              </g>
            ) : (
              // PASSWORD MODE: Right Arm Moves to Cover Right Eye
              <motion.g
                key="right-arm-covering"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={
                  showPassword
                    ? { opacity: 1, rotate: -20, transformOrigin: '140px 120px' }
                    : { opacity: 1, rotate: 0, transformOrigin: '140px 120px' }
                }
                transition={{ type: 'spring', stiffness: 280, damping: 24 }}
              >
                <path
                  d="M 148 124 C 158 110 156 96 142 88 L 128 82 L 120 92 C 130 100 136 114 132 126 Z"
                  fill="url(#robeGrad)"
                  stroke={theme.robeAccent}
                  strokeWidth="1.2"
                  strokeOpacity="0.4"
                />

                <path
                  d="M 129 81 L 119 91"
                  stroke="url(#tasselGrad)"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                />

                <g transform="translate(116, 82)">
                  <ellipse cx="0" cy="2" rx="14" ry="11" fill="rgba(0,0,0,0.25)" />
                  <ellipse cx="0" cy="0" rx="12" ry="9" fill="url(#handGrad)" stroke="#d97706" strokeWidth="0.7" />
                  <path d="M -8 1 C -12 3 -12 6 -9 8 C -7 9 -6 6 -7 2 Z" fill="url(#handGrad)" stroke="#d97706" strokeWidth="0.7" />
                  <path d="M -5 -4 C -7 -9 -5 -12 -2 -11 C 0 -10 -2 -6 -2 -3 Z" fill="url(#handGrad)" stroke="#d97706" strokeWidth="0.7" />
                  <path d="M -1 -5 C -1 -11 2 -14 4 -13 C 6 -12 3 -7 2 -4 Z" fill="url(#handGrad)" stroke="#d97706" strokeWidth="0.7" />
                  <path d="M 3 -5 C 4 -10 7 -13 9 -11 C 10 -9 7 -6 5 -3 Z" fill="url(#handGrad)" stroke="#d97706" strokeWidth="0.7" />
                  <path d="M 7 -3 C 10 -7 13 -8 13 -6 C 13 -4 10 -2 8 -1 Z" fill="url(#handGrad)" stroke="#d97706" strokeWidth="0.7" />
                </g>
              </motion.g>
            )}
          </g>
        </svg>
      </div>

      {/* Dynamic Reaction Speech Pill */}
      <div className="relative z-10 mt-1 flex items-center justify-center">
        <motion.div
          key={status.text}
          initial={{ opacity: 0, scale: 0.96, y: 3 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-sans font-medium border backdrop-blur-md shadow-sm ${
            isPasswordFocused && !showPassword
              ? 'bg-slate-900/95 border-amber-500/40 text-amber-200'
              : isPasswordFocused && showPassword
              ? 'bg-slate-900/95 border-cyan-500/40 text-cyan-200'
              : hasError
              ? 'bg-slate-900/95 border-rose-500/40 text-rose-200'
              : 'bg-slate-900/90 border-slate-700/60 text-slate-200'
          }`}
        >
          {status.icon}
          <span className="leading-snug">{status.text}</span>
        </motion.div>
      </div>
    </div>
  );
}

