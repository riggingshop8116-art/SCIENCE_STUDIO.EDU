import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, Atom, Dna, Compass, Sparkles, Play, Pause, RefreshCw } from 'lucide-react';

export type LabModuleType = 'wave' | 'atom' | 'dna' | 'circle';

interface HeroLabShowcaseProps {
  onExploreLab?: () => void;
}

export function HeroLabShowcase({ onExploreLab }: HeroLabShowcaseProps) {
  const [activeTab, setActiveTab] = useState<LabModuleType>('wave');
  const [time, setTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [speed, setSpeed] = useState<number>(1);

  // Auto transition tab every 7 seconds
  useEffect(() => {
    if (!isPlaying) return;
    const tabInterval = setInterval(() => {
      setActiveTab((prev) => {
        if (prev === 'wave') return 'atom';
        if (prev === 'atom') return 'dna';
        if (prev === 'dna') return 'circle';
        return 'wave';
      });
    }, 7000);

    return () => clearInterval(tabInterval);
  }, [isPlaying]);

  // Real-time animation frame loop
  useEffect(() => {
    if (!isPlaying) return;
    const animFrame = setInterval(() => {
      setTime((t) => t + 0.08 * speed);
    }, 30);

    return () => clearInterval(animFrame);
  }, [isPlaying, speed]);

  const tabs: { id: LabModuleType; label: string; icon: React.ComponentType<{ className?: string }>; color: string }[] = [
    { id: 'wave', label: 'তরঙ্গ গতি', icon: Activity, color: 'text-cyan-400' },
    { id: 'atom', label: 'পরমাণু মডেল', icon: Atom, color: 'text-amber-400' },
    { id: 'dna', label: 'ডিএনএ হেলিক্স', icon: Dna, color: 'text-emerald-400' },
    { id: 'circle', label: 'ত্রিকোণমিতি', icon: Compass, color: 'text-purple-400' },
  ];

  return (
    <div 
      className="w-full max-w-md lg:max-w-[420px] mx-auto rounded-2xl bg-[#091224]/95 border border-cyan-500/30 p-3.5 sm:p-4 shadow-2xl backdrop-blur-2xl relative overflow-hidden group hover:border-cyan-400/50 transition-all duration-500 text-left" 
      id="hero-unified-lab-card"
    >
      {/* Background ambient glow */}
      <div className="absolute -top-20 -right-20 w-48 h-48 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Row with Live Telemetry & Control */}
      <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2.5 mb-3 relative z-10">
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </span>
          <span className="text-[11px] font-mono font-bold tracking-wider text-cyan-300 uppercase">
            LIVE SIMULATION LAB
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1 px-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors text-[10px] flex items-center gap-1 cursor-pointer"
            title={isPlaying ? "অ্যানিমেশন পজ করুন" : "অ্যানিমেশন চালু করুন"}
          >
            {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 text-cyan-400" />}
            <span className="font-mono">{isPlaying ? 'PAUSE' : 'PLAY'}</span>
          </button>
          
          <button
            type="button"
            onClick={() => setSpeed(s => s === 1 ? 1.5 : s === 1.5 ? 0.6 : 1)}
            className="px-1.5 py-0.5 rounded-lg bg-white/5 hover:bg-white/10 text-cyan-300 border border-white/10 font-mono text-[10px] cursor-pointer"
            title="গতি পরিবর্তন করুন"
          >
            {speed}x
          </button>
        </div>
      </div>

      {/* Tab Selectors (4 Core Science Concepts) */}
      <div className="grid grid-cols-4 gap-1 p-1 bg-[#050b18] rounded-xl border border-white/10 mb-3 relative z-10">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1 py-1.5 px-1 rounded-lg text-[10.5px] font-medium transition-all cursor-pointer ${
                isActive 
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <Icon className={`w-3 h-3 ${isActive ? tab.color : 'text-slate-400'}`} />
              <span className="truncate text-[10px] sm:text-[10.5px]">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Dynamic Stage Display */}
      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {/* 1. PHYSICS WAVE SIMULATION */}
          {activeTab === 'wave' && (
            <motion.div
              key="wave"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-3.5"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <span className="text-cyan-400">🌌 তরঙ্গ মেকানিক্স ও স্পন্দন গতি (Physics Wave)</span>
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5 font-sans">
                    পর্যায়বৃত্ত তরঙ্গের বিস্তার (Amplitude), তরঙ্গদৈর্ঘ্য ($\lambda$) ও সাইন তরঙ্গের স্থানান্তর।
                  </p>
                </div>
              </div>

              {/* Wave SVG Stage */}
              <div className="relative h-44 sm:h-48 w-full bg-[#040814] rounded-2xl border border-cyan-500/30 overflow-hidden flex items-center justify-center shadow-inner">
                {/* Background Grid Coordinates */}
                <div className="absolute inset-0 opacity-15 bg-[linear-gradient(to_right,#06b6d4_1px,transparent_1px),linear-gradient(to_bottom,#06b6d4_1px,transparent_1px)] bg-[size:16px_16px]" />
                
                <svg className="w-full h-full p-2 relative z-10">
                  <defs>
                    <linearGradient id="main-wave-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
                      <stop offset="50%" stopColor="#38bdf8" stopOpacity="1" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.4" />
                    </linearGradient>
                  </defs>

                  {/* Base Center Axis Line */}
                  <line x1="0" y1="50%" x2="100%" y2="50%" stroke="rgba(255,255,255,0.15)" strokeDasharray="3 3" />

                  {/* Primary Sine Wave Curve */}
                  <path
                    d={(() => {
                      const points = [];
                      for (let x = 0; x <= 450; x += 3) {
                        const y = 88 + Math.sin(x * 0.03 + time * 1.2) * 36;
                        points.push(`${x === 0 ? 'M' : 'L'} ${x} ${y}`);
                      }
                      return points.join(' ');
                    })()}
                    fill="none"
                    stroke="url(#main-wave-gradient)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />

                  {/* Secondary Harmonic Wave */}
                  <path
                    d={(() => {
                      const points = [];
                      for (let x = 0; x <= 450; x += 4) {
                        const y = 88 + Math.sin(x * 0.06 - time * 0.8) * 18;
                        points.push(`${x === 0 ? 'M' : 'L'} ${x} ${y}`);
                      }
                      return points.join(' ');
                    })()}
                    fill="none"
                    stroke="rgba(147, 197, 253, 0.4)"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />

                  {/* Crest & Trough Tracking Markers */}
                  {(() => {
                    const focalX1 = 120;
                    const focalY1 = 88 + Math.sin(focalX1 * 0.03 + time * 1.2) * 36;
                    const focalX2 = 260;
                    const focalY2 = 88 + Math.sin(focalX2 * 0.03 + time * 1.2) * 36;

                    return (
                      <g>
                        <circle cx={focalX1} cy={focalY1} r="9" fill="#06b6d4" className="animate-ping opacity-50" />
                        <circle cx={focalX1} cy={focalY1} r="5" fill="#ffffff" stroke="#0891b2" strokeWidth="2" />
                        <circle cx={focalX2} cy={focalY2} r="5" fill="#38bdf8" stroke="#ffffff" strokeWidth="1.5" />
                      </g>
                    );
                  })()}
                </svg>
              </div>

              {/* Dynamic Telemetry Stats */}
              <div className="grid grid-cols-3 gap-2 text-xs font-mono text-slate-300 bg-white/5 p-3 rounded-xl border border-white/10">
                <div>
                  <span className="block text-[10px] text-slate-400 uppercase tracking-wider">বিস্তার (A)</span>
                  <span className="font-bold text-cyan-300 text-sm">{(36 + Math.sin(time) * 4).toFixed(1)} px</span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400 uppercase tracking-wider">কম্পাঙ্ক (f)</span>
                  <span className="font-bold text-cyan-300 text-sm">{(4.8 * speed).toFixed(1)} Hz</span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400 uppercase tracking-wider">তরঙ্গবেগ (v)</span>
                  <span className="font-bold text-emerald-400 text-sm">v = f · λ</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* 2. BOHR ATOMIC MODEL SIMULATION */}
          {activeTab === 'atom' && (
            <motion.div
              key="atom"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-3.5"
            >
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="text-amber-400">⚛️ বোর পরমাণু মডেল ও ইলেকট্রন কক্ষপথ (Bohr Atom)</span>
                </h4>
                <p className="text-xs text-slate-300 mt-0.5 font-sans">
                  ধনাত্মক নিউক্লিয়াসের চারদিকে নির্দিষ্ট শক্তিস্থরে ঘূর্ণায়মান ইলেকট্রনের ক্লাউড।
                </p>
              </div>

              {/* Atomic SVG Stage */}
              <div className="relative h-44 sm:h-48 w-full bg-[#040814] rounded-2xl border border-amber-500/30 overflow-hidden flex items-center justify-center shadow-inner">
                <svg className="w-44 h-44">
                  {/* Energy Level Orbits */}
                  <circle cx="88" cy="88" r="32" fill="none" stroke="rgba(245,158,11,0.25)" strokeWidth="1" strokeDasharray="3 3" />
                  <circle cx="88" cy="88" r="56" fill="none" stroke="rgba(245,158,11,0.2)" strokeWidth="1" />
                  <circle cx="88" cy="88" r="76" fill="none" stroke="rgba(245,158,11,0.12)" strokeWidth="1" />

                  {/* K-Shell Orbiting Electrons (n=1) */}
                  <g style={{ transformOrigin: '88px 88px', transform: `rotate(${time * 60}deg)` }}>
                    <circle cx="88" cy="56" r="4.5" fill="#38bdf8" stroke="#ffffff" strokeWidth="1" />
                    <circle cx="88" cy="120" r="4.5" fill="#38bdf8" stroke="#ffffff" strokeWidth="1" />
                  </g>

                  {/* L-Shell Orbiting Electrons (n=2) */}
                  <g style={{ transformOrigin: '88px 88px', transform: `rotate(${-time * 35}deg)` }}>
                    <circle cx="88" cy="32" r="4.5" fill="#fbbf24" stroke="#ffffff" strokeWidth="1" />
                    <circle cx="144" cy="88" r="4.5" fill="#fbbf24" stroke="#ffffff" strokeWidth="1" />
                    <circle cx="88" cy="144" r="4.5" fill="#fbbf24" stroke="#ffffff" strokeWidth="1" />
                    <circle cx="32" cy="88" r="4.5" fill="#fbbf24" stroke="#ffffff" strokeWidth="1" />
                  </g>

                  {/* M-Shell Valence Electron (n=3) */}
                  <g style={{ transformOrigin: '88px 88px', transform: `rotate(${time * 20}deg)` }}>
                    <circle cx="88" cy="12" r="5" fill="#34d399" stroke="#ffffff" strokeWidth="1.5" />
                  </g>

                  {/* Nucleus Core Cluster with Protons & Neutrons */}
                  <g transform="translate(88, 88)">
                    <circle cx="0" cy="0" r="16" fill="#ef4444" className="opacity-25 animate-ping" />
                    <circle cx="-4" cy="-4" r="5.5" fill="#ef4444" stroke="#090d16" strokeWidth="0.8" />
                    <circle cx="5" cy="-3" r="5.5" fill="#94a3b8" stroke="#090d16" strokeWidth="0.8" />
                    <circle cx="1" cy="5" r="5.5" fill="#ef4444" stroke="#090d16" strokeWidth="0.8" />
                    <circle cx="-5" cy="4" r="5.5" fill="#94a3b8" stroke="#090d16" strokeWidth="0.8" />
                    <circle cx="0" cy="0" r="5.5" fill="#ef4444" stroke="#ffffff" strokeWidth="0.8" />
                  </g>
                </svg>
              </div>

              {/* Dynamic Telemetry Stats */}
              <div className="grid grid-cols-3 gap-2 text-xs font-mono text-slate-300 bg-white/5 p-3 rounded-xl border border-white/10">
                <div>
                  <span className="block text-[10px] text-slate-400 uppercase tracking-wider">মৌল ও প্রতীক</span>
                  <span className="font-bold text-amber-300 text-sm">Nitrogen (₇N)</span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400 uppercase tracking-wider">ইলেকট্রন বিন্যাস</span>
                  <span className="font-bold text-amber-300 text-sm">2, 5 (K², L⁵)</span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400 uppercase tracking-wider">কোয়ান্টাম শক্তি</span>
                  <span className="font-bold text-cyan-400 text-sm">E = -13.6/n²</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* 3. DNA DOUBLE HELIX SIMULATION */}
          {activeTab === 'dna' && (
            <motion.div
              key="dna"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-3.5"
            >
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="text-emerald-400">🧬 ডিএনএ দ্বিসূত্রক হেলিক্স মডেল (DNA Double Helix)</span>
                </h4>
                <p className="text-xs text-slate-300 mt-0.5 font-sans">
                  এডিনিন, থাইমিন, গুয়ানিন ও সাইটোসিন (A-T, G-C) বেয়ার পেয়ারিং এবং ত্রিমাত্রিক হেলিকাল ঘূর্ণন।
                </p>
              </div>

              {/* DNA SVG Stage */}
              <div className="relative h-44 sm:h-48 w-full bg-[#040814] rounded-2xl border border-emerald-500/30 overflow-hidden flex items-center justify-center shadow-inner">
                <svg className="w-full h-full px-4">
                  {Array.from({ length: 13 }).map((_, idx) => {
                    const x = 24 + idx * 28;
                    const angle = time * 0.9 + idx * 0.55;
                    const y1 = 88 + Math.sin(angle) * 32;
                    const y2 = 88 - Math.sin(angle) * 32;
                    const isEven = idx % 2 === 0;

                    return (
                      <g key={idx}>
                        <line x1={x} y1={y1} x2={x} y2={y2} stroke="rgba(255,255,255,0.2)" strokeWidth="2.5" />
                        <line x1={x} y1={88} x2={x} y2={y1} stroke={isEven ? '#10b981' : '#38bdf8'} strokeWidth="3" />
                        <line x1={x} y1={88} x2={x} y2={y2} stroke={isEven ? '#ef4444' : '#a855f7'} strokeWidth="3" />
                        
                        <circle cx={x} cy={y1} r="5" fill={isEven ? '#10b981' : '#38bdf8'} stroke="#ffffff" strokeWidth="1" className="animate-pulse" />
                        <circle cx={x} cy={y2} r="5" fill={isEven ? '#ef4444' : '#a855f7'} stroke="#ffffff" strokeWidth="1" className="animate-pulse" />
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Dynamic Telemetry Stats */}
              <div className="grid grid-cols-3 gap-2 text-xs font-mono text-slate-300 bg-white/5 p-3 rounded-xl border border-white/10">
                <div>
                  <span className="block text-[10px] text-slate-400 uppercase tracking-wider">বেস পেয়ার্স</span>
                  <span className="font-bold text-emerald-300 text-sm">A = T | G ≡ C</span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400 uppercase tracking-wider">হেলিক্স পিচ</span>
                  <span className="font-bold text-emerald-300 text-sm">3.4 nm / turn</span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400 uppercase tracking-wider">ব্যাসার্ধ</span>
                  <span className="font-bold text-cyan-400 text-sm">r ≈ 1.0 nm</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* 4. UNIT CIRCLE & TRIGONOMETRY SIMULATION */}
          {activeTab === 'circle' && (
            <motion.div
              key="circle"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-3.5"
            >
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="text-purple-400">📐 ত্রিকোণমিতিক একক বৃত্ত ও কোণ অনুপাত (Unit Circle)</span>
                </h4>
                <p className="text-xs text-slate-300 mt-0.5 font-sans">
                  কোণ $\theta$ পরিবর্তনের সাথে $\sin(\theta)$ এবং $\cos(\theta)$ এর ত্রিকোণমিতিক মান নির্দেশ।
                </p>
              </div>

              {/* Unit Circle SVG Stage */}
              <div className="relative h-44 sm:h-48 w-full bg-[#040814] rounded-2xl border border-purple-500/30 overflow-hidden flex items-center justify-center shadow-inner">
                <svg className="w-44 h-44">
                  {/* Axis */}
                  <line x1="16" y1="88" x2="160" y2="88" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                  <line x1="88" y1="16" x2="88" y2="160" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />

                  {/* Main Circle radius 50 */}
                  <circle cx="88" cy="88" r="52" fill="none" stroke="rgba(168,85,247,0.4)" strokeWidth="2" />

                  {/* Rotating vector */}
                  {(() => {
                    const angleRad = (time * 20 * Math.PI) / 180;
                    const x = 88 + 52 * Math.cos(angleRad);
                    const y = 88 - 52 * Math.sin(angleRad);
                    return (
                      <g>
                        {/* Triangle Projection Area */}
                        <polygon points={`88,88 ${x},88 ${x},${y}`} fill="rgba(168,85,247,0.15)" />
                        
                        {/* Radius line (Hypotenuse) */}
                        <line x1="88" y1="88" x2={x} y2={y} stroke="#c084fc" strokeWidth="2.5" />
                        
                        {/* Cosine (Adjacent) */}
                        <line x1="88" y1="88" x2={x} y2="88" stroke="#38bdf8" strokeWidth="2.5" />
                        
                        {/* Sine (Opposite) */}
                        <line x1={x} y1="88" x2={x} y2={y} stroke="#ef4444" strokeWidth="2.5" />
                        
                        {/* Center Target Pointer */}
                        <circle cx={x} cy={y} r="5" fill="#ffffff" stroke="#c084fc" strokeWidth="2" />
                      </g>
                    );
                  })()}
                </svg>
              </div>

              {/* Dynamic Telemetry Stats */}
              <div className="grid grid-cols-3 gap-2 text-xs font-mono text-slate-300 bg-white/5 p-3 rounded-xl border border-white/10">
                <div>
                  <span className="block text-[10px] text-slate-400 uppercase tracking-wider">কোণ (θ)</span>
                  <span className="font-bold text-purple-300 text-sm">{((time * 20) % 360).toFixed(0)}°</span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400 uppercase tracking-wider">sin(θ)</span>
                  <span className="font-bold text-rose-400 text-sm">
                    {Math.sin((time * 20 * Math.PI) / 180).toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400 uppercase tracking-wider">cos(θ)</span>
                  <span className="font-bold text-cyan-400 text-sm">
                    {Math.cos((time * 20 * Math.PI) / 180).toFixed(2)}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Explore Link Button */}
      {onExploreLab && (
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-sans">
            সম্পূর্ণ সিমুলেটর ল্যাব দেখতে চান?
          </span>
          <button
            type="button"
            onClick={onExploreLab}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/40 text-cyan-300 text-xs font-semibold cursor-pointer transition-all hover:shadow-[0_0_15px_rgba(6,182,212,0.3)]"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>পূর্ণাঙ্গ ল্যাবে প্রবেশ করুন</span>
          </button>
        </div>
      )}
    </div>
  );
}

// Backward compatibility exports in case imported elsewhere
export const LeftAnimationPanel = () => <HeroLabShowcase />;
export const RightAnimationPanel = () => <HeroLabShowcase />;
