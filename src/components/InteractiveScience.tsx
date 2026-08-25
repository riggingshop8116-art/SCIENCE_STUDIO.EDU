import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Sliders, Play, Pause, RefreshCw, Zap, Atom, Dna, 
  Compass, Flame, Activity, CheckCircle2
} from 'lucide-react';
import { Settings } from '../types';
import { SCIENCE_3D_BANNERS, SUBJECT_THEMES } from '../utils/science3DAssets';

interface InteractiveScienceProps {
  settings?: Settings;
}

export default function InteractiveScience({ settings }: InteractiveScienceProps) {
  const [activeSubject, setActiveSubject] = useState<'physics' | 'chemistry' | 'biology' | 'math' | 'electromagnetism' | 'thermodynamics'>('physics');

  // Physics States (Wave Oscilloscope)
  const [waveAmplitude, setWaveAmplitude] = useState<number>(32);
  const [waveFrequency, setWaveFrequency] = useState<number>(0.05);
  const [waveSpeed, setWaveSpeed] = useState<number>(0.08);
  const [isPlayingPhysics, setIsPlayingPhysics] = useState<boolean>(true);
  const [physicsTime, setPhysicsTime] = useState<number>(0);

  // Chemistry States (Atom & Molecular Orbital Builder)
  const [protons, setProtons] = useState<number>(3);
  const [neutrons, setNeutrons] = useState<number>(4);
  const [electrons, setElectrons] = useState<number>(3);

  // Biology States (DNA Double Helix & Cell)
  const [dnaSpeed, setDnaSpeed] = useState<number>(1);
  const [isDnaRotating, setIsDnaRotating] = useState<boolean>(true);
  const [dnaTime, setDnaTime] = useState<number>(0);

  // Math States (Unit Circle / Sine Wave / Calculus)
  const [mathAngle, setMathAngle] = useState<number>(45);

  // Electromagnetism States
  const [magneticField, setMagneticField] = useState<number>(50);
  const [currentIntensity, setCurrentIntensity] = useState<number>(40);

  // Thermodynamics States (PV Gas Cylinder)
  const [gasPressure, setGasPressure] = useState<number>(50);
  const [gasTemperature, setGasTemperature] = useState<number>(300);

  // Animation loops
  useEffect(() => {
    let animId: number;
    const loop = () => {
      if (isPlayingPhysics) {
        setPhysicsTime(t => t + waveSpeed);
      }
      if (isDnaRotating) {
        setDnaTime(t => t + (dnaSpeed * 0.03));
      }
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPlayingPhysics, isDnaRotating, waveSpeed, dnaSpeed]);

  // Get Chemical Element Name based on Proton Count
  const getElementName = (pCount: number) => {
    const elements: { [key: number]: { name: string; symbol: string; mass: number; desc: string; color: string; bgGrad: string } } = {
      1: { name: 'Hydrogen (হাইড্রোজেন)', symbol: 'H', mass: 1, desc: 'মহাবিশ্বের সবচেয়ে হালকা এবং প্রচুর পরিমাণে থাকা মৌলিক গ্যাস।', color: 'from-cyan-400 to-blue-500', bgGrad: 'from-cyan-950/90 to-blue-950/90' },
      2: { name: 'Helium (হিলিয়াম)', symbol: 'He', mass: 4, desc: 'নিষ্ক্রিয় গ্যাস, হালকা বেলুন এবং ক্রায়োজেনিক্সে ব্যবহৃত হয়।', color: 'from-amber-400 to-orange-500', bgGrad: 'from-amber-950/90 to-orange-950/90' },
      3: { name: 'Lithium (লিথিয়াম)', symbol: 'Li', mass: 7, desc: 'সবচেয়ে হালকা ধাতু, রিচার্জেবল ব্যাটারির অন্যতম প্রধান উপাদান।', color: 'from-emerald-400 to-teal-500', bgGrad: 'from-emerald-950/90 to-teal-950/90' },
      4: { name: 'Beryllium (বেরিলিয়াম)', symbol: 'Be', mass: 9, desc: 'মহাকাশযান এবং এক্স-রে টিউবে ব্যবহৃত শক্তিশালী ক্ষারীয় মৃত্তিকা ধাতু।', color: 'from-pink-400 to-rose-500', bgGrad: 'from-pink-950/90 to-rose-950/90' },
      5: { name: 'Boron (বোরন)', symbol: 'B', mass: 11, desc: 'গ্লাস ও সিরামিক তৈরিতে এবং সেমিকন্ডাক্টরে ব্যবহৃত উপধাতু।', color: 'from-purple-400 to-indigo-500', bgGrad: 'from-purple-950/90 to-indigo-950/90' },
      6: { name: 'Carbon (কার্বন)', symbol: 'C', mass: 12, desc: 'জৈব যৌগের মূল ভিত্তি এবং হীরা ও গ্রাফাইটের রূপভেদ।', color: 'from-slate-300 to-slate-500', bgGrad: 'from-slate-900 to-slate-950' },
      7: { name: 'Nitrogen (নাইট্রোজেন)', symbol: 'N', mass: 14, desc: 'বায়ুমণ্ডলের প্রায় ৭৮% গঠন করে এবং প্রোটিনের মূল উপাদান।', color: 'from-blue-400 to-cyan-500', bgGrad: 'from-blue-950/90 to-cyan-950/90' },
      8: { name: 'Oxygen (অক্সিজেন)', symbol: 'O', mass: 16, desc: 'জীবের শ্বসনক্রিয়া ও দহনের জন্য অপরিহার্য মৌলিক গ্যাস।', color: 'from-rose-400 to-red-500', bgGrad: 'from-rose-950/90 to-red-950/90' }
    };
    return elements[pCount] || { name: `মৌল (Z=${pCount})`, symbol: 'El', mass: pCount * 2, desc: 'কাস্টম নিউক্লিয়ার কনফিগারেশন।', color: 'from-cyan-500 to-blue-600', bgGrad: 'from-cyan-950 to-blue-950' };
  };

  const elementInfo = getElementName(protons);
  const currentTheme = SUBJECT_THEMES[activeSubject] || SUBJECT_THEMES.physics;

  return (
    <div className="w-full max-w-[1800px] mx-auto px-1 sm:px-3 lg:px-6 py-4 sm:py-6" id="science-playground">
      {/* SINGLE MAIN CONTAINER DIV WITH HIGH-CONTRAST 3D VISUAL BACKDROP */}
      <div 
        className="w-full p-3.5 sm:p-6 lg:p-8 xl:p-10 rounded-2xl sm:rounded-3xl bg-[#0b1329]/95 border border-slate-800/90 hover:border-slate-700/80 backdrop-blur-2xl shadow-2xl relative overflow-hidden transition-all duration-500"
        style={{
          boxShadow: `0 0 35px -5px ${currentTheme.borderGlow}`
        }}
      >
        {/* Subtle Ambient 3D Theme Backdrop Lighting */}
        <div 
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors duration-700"
          style={{ backgroundColor: currentTheme.glowColor === 'emerald' ? '#10b981' : currentTheme.glowColor === 'rose' ? '#f43f5e' : currentTheme.glowColor === 'amber' ? '#f59e0b' : '#06b6d4' }}
        />

        {/* Section Header with 3D Hologram Badge */}
        <div className="text-center mb-6 sm:mb-8 relative z-10">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 text-[10px] sm:text-xs font-mono uppercase tracking-widest mb-2 sm:mb-3 backdrop-blur-md shadow-lg">
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-cyan-400 animate-spin-slow" />
            <span>{settings?.labSectionBadge || '3D VIRTUAL SCIENCE LAB & SIMULATION STAGE'}</span>
          </div>
          <h2 className="text-xl sm:text-3xl lg:text-4xl font-display font-extrabold text-white tracking-tight leading-tight">
            {settings?.labSectionTitle ? (
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-400">
                {settings.labSectionTitle}
              </span>
            ) : (
              <>ভার্চুয়াল ৩ডি সায়েন্স ল্যাব ও <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-400">ইন্টারেক্টিভ সিমুলেশন</span></>
            )}
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm mt-1.5 sm:mt-2 max-w-2xl mx-auto font-sans leading-relaxed">
            {settings?.labSectionSubtitle || 'মুখস্থবিদ্যা নয়, প্র্যাকটিক্যাল ভিজ্যুয়ালাইজেশন! নিচে বিষয় নির্বাচন করে ৩ডি ক্যানভাসে প্যারামিটার পরিবর্তন করে বিজ্ঞান চর্চা করুন।'}
          </p>
        </div>

        {/* 3D Visual Subject Banners Bar (Quick Visual Selectors) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 mb-6 relative z-10">
          {[
            { id: 'physics', name: 'পদার্থবিজ্ঞান', sub: 'Wave & Particle', icon: Atom, img: SCIENCE_3D_BANNERS.particleAccelerator, color: 'border-cyan-400/40 text-cyan-300' },
            { id: 'chemistry', name: 'রসায়নবিজ্ঞান', sub: 'Atom & Orbitals', icon: Zap, img: SCIENCE_3D_BANNERS.chemistryHub, color: 'border-emerald-400/40 text-emerald-300' },
            { id: 'biology', name: 'জীববিজ্ঞান', sub: 'Cell & DNA Helix', icon: Dna, img: SCIENCE_3D_BANNERS.bioCell, color: 'border-rose-400/40 text-rose-300' },
            { id: 'math', name: 'উচ্চতর গণিত', sub: 'Calculus & Vector', icon: Compass, img: SCIENCE_3D_BANNERS.mathStudio, color: 'border-amber-400/40 text-amber-300' },
            { id: 'electromagnetism', name: 'তড়িৎ ও চৌম্বক', sub: 'Magnetic Flux', icon: Activity, img: SCIENCE_3D_BANNERS.electromagnetism, color: 'border-purple-400/40 text-purple-300' },
            { id: 'thermodynamics', name: 'তাপগতিবিদ্যা', sub: 'PV Entropy Lab', icon: Flame, img: SCIENCE_3D_BANNERS.thermodynamics, color: 'border-orange-400/40 text-orange-300' }
          ].map((subj) => {
            const isSel = activeSubject === subj.id;
            return (
              <button
                key={subj.id}
                type="button"
                onClick={() => setActiveSubject(subj.id as any)}
                className={`relative rounded-xl overflow-hidden p-2.5 sm:p-3 text-left transition-all duration-300 group cursor-pointer border ${
                  isSel 
                    ? 'border-cyan-400 bg-cyan-950/80 shadow-[0_0_20px_rgba(34,211,238,0.35)] scale-[1.02]' 
                    : 'border-slate-800 bg-slate-950/70 hover:border-slate-600 hover:bg-slate-900/80'
                }`}
              >
                {/* Background 3D image preview thumbnail */}
                <img 
                  src={subj.img} 
                  alt={subj.name}
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-35 transition-opacity"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />

                <div className="relative z-10 flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg bg-white/10 ${subj.color} backdrop-blur-md shrink-0`}>
                    <subj.icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white font-display truncate">{subj.name}</div>
                    <div className="text-[9px] font-mono text-slate-400 truncate">{subj.sub}</div>
                  </div>
                </div>

                {isSel && (
                  <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                )}
              </button>
            );
          })}
        </div>

        {/* Main Lab Simulation Stage Card */}
        <div className="bg-slate-950/95 rounded-2xl border border-slate-800/90 overflow-hidden shadow-2xl backdrop-blur-xl relative z-10">
          
          {/* Top 3D Concept Banner Bar for Active Subject */}
          <div className="relative h-28 sm:h-36 md:h-40 overflow-hidden border-b border-white/10 flex items-center px-4 sm:px-6 md:px-8">
            <img 
              src={currentTheme.banner} 
              alt={currentTheme.name}
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover opacity-35 filter brightness-110"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />

            <div className="relative z-10 flex flex-col justify-center max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[10px] sm:text-xs font-mono font-bold text-cyan-300 w-fit backdrop-blur-md mb-1.5">
                <span>{currentTheme.symbol}</span>
                <span>{currentTheme.badge}</span>
              </div>
              <h3 className="text-lg sm:text-2xl md:text-3xl font-display font-black text-white leading-tight">
                {currentTheme.nameBangla} <span className="text-cyan-400">৩ডি ভার্চুয়াল সিমুলেটর</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 font-sans mt-0.5 line-clamp-1">
                {currentTheme.tagline}
              </p>
            </div>

            {/* Right side live status indicator */}
            <div className="hidden sm:flex absolute right-6 items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-cyan-400/30 text-cyan-300 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>LIVE 60FPS SIMULATION</span>
            </div>
          </div>

          {/* Simulator Visualizer & Controls Grid */}
          <div className="p-4 sm:p-6 md:p-8">
            <AnimatePresence mode="wait">
              
              {/* 1. PHYSICS EXPERIENCE (Wave & Frequency Simulator) */}
              {activeSubject === 'physics' && (
                <motion.div
                  key="physics"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-stretch"
                >
                  {/* Visualizer Stage */}
                  <div className="lg:col-span-7 flex flex-col justify-between">
                    <div className="relative w-full h-60 sm:h-72 rounded-2xl bg-[#090d16] border border-white/10 overflow-hidden flex items-center justify-center shadow-inner">
                      
                      {/* SVG Wave Oscilloscope */}
                      <svg className="w-full h-full absolute inset-0" viewBox="0 0 500 260" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="wave-grad-3d" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.3" />
                            <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.9" />
                            <stop offset="100%" stopColor="#818cf8" stopOpacity="0.4" />
                          </linearGradient>
                          <pattern id="grid-physics" width="25" height="25" patternUnits="userSpaceOnUse">
                            <path d="M 25 0 L 0 0 0 25" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                          </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid-physics)" />

                        {/* Central Equilibrium Axis */}
                        <line x1="0" y1="130" x2="500" y2="130" stroke="rgba(34,211,238,0.25)" strokeDasharray="6,6" strokeWidth="1.5" />
                        <line x1="250" y1="0" x2="250" y2="260" stroke="rgba(34,211,238,0.15)" strokeDasharray="6,6" strokeWidth="1.5" />

                        {/* Main Dynamic Harmonic Wave Path */}
                        <path
                          d={(() => {
                            let points = [];
                            for (let x = 0; x <= 500; x += 2) {
                              const y = 130 + Math.sin(x * waveFrequency + physicsTime) * waveAmplitude;
                              points.push(`${x === 0 ? 'M' : 'L'} ${x} ${y}`);
                            }
                            return points.join(' ');
                          })()}
                          fill="none"
                          stroke="url(#wave-grad-3d)"
                          strokeWidth="4"
                          strokeLinecap="round"
                        />

                        {/* Oscillating Quantum Wave Particle */}
                        {(() => {
                          const px = 250;
                          const py = 130 + Math.sin(px * waveFrequency + physicsTime) * waveAmplitude;
                          return (
                            <g>
                              <circle cx={px} cy={py} r="14" fill="#22d3ee" className="animate-ping opacity-40" />
                              <circle cx={px} cy={py} r="7" fill="#38bdf8" stroke="#ffffff" strokeWidth="2.5" />
                              <line x1={px} y1="130" x2={px} y2={py} stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="2,2" />
                            </g>
                          );
                        })()}
                      </svg>

                      {/* On-Stage Diagnostic Overlay */}
                      <div className="absolute top-3 left-3 text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-3 py-1.5 rounded-lg border border-cyan-500/30 backdrop-blur-md">
                        y(x,t) = A·sin(kx - ωt + φ)
                      </div>

                      <div className="absolute bottom-3 right-3 text-[10px] font-mono text-slate-300 bg-slate-900/80 px-3 py-1 rounded-lg border border-white/10">
                        λ = {(2 * Math.PI / Math.max(0.01, waveFrequency)).toFixed(1)} px
                      </div>
                    </div>

                    <div className="mt-3.5 p-3.5 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-300 font-sans leading-relaxed flex items-start gap-2.5">
                      <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-white">পদার্থবিজ্ঞান তত্ত্ব: </span>
                        তরঙ্গ মাধ্যমের কণাগুলোর স্পন্দনগতির মাধ্যমে শক্তি ও ভরবেগ সঞ্চালন করে। বিস্তার (A) বাড়ালে তরঙ্গের তীব্রতা (I ∝ A²) বৃদ্ধি পায়।
                      </div>
                    </div>
                  </div>

                  {/* Interactive Controls */}
                  <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Sliders className="w-4 h-4 text-cyan-400" />
                        <span className="font-display font-bold text-xs tracking-wider text-slate-200 uppercase">তরঙ্গ প্যারামিটার নিয়ন্ত্রণ</span>
                      </div>

                      {/* Amplitude slider */}
                      <div className="space-y-1 mb-3">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-300">বিস্তার (Amplitude A):</span>
                          <span className="font-mono text-cyan-400 font-bold">{waveAmplitude} px</span>
                        </div>
                        <input
                          type="range"
                          min="8"
                          max="80"
                          value={waveAmplitude}
                          onChange={(e) => setWaveAmplitude(Number(e.target.value))}
                          className="w-full h-2 rounded-lg bg-slate-800 appearance-none cursor-pointer accent-cyan-400"
                        />
                      </div>

                      {/* Frequency slider */}
                      <div className="space-y-1 mb-3">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-300">কম্পাঙ্ক (Frequency f):</span>
                          <span className="font-mono text-cyan-400 font-bold">{(waveFrequency * 100).toFixed(0)} Hz</span>
                        </div>
                        <input
                          type="range"
                          min="0.01"
                          max="0.15"
                          step="0.01"
                          value={waveFrequency}
                          onChange={(e) => setWaveFrequency(Number(e.target.value))}
                          className="w-full h-2 rounded-lg bg-slate-800 appearance-none cursor-pointer accent-cyan-400"
                        />
                      </div>

                      {/* Velocity slider */}
                      <div className="space-y-1 mb-4">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-300">তরঙ্গ দ্রুতি (Velocity v):</span>
                          <span className="font-mono text-cyan-400 font-bold">{(waveSpeed * 100).toFixed(0)} m/s</span>
                        </div>
                        <input
                          type="range"
                          min="0.01"
                          max="0.25"
                          step="0.01"
                          value={waveSpeed}
                          onChange={(e) => setWaveSpeed(Number(e.target.value))}
                          className="w-full h-2 rounded-lg bg-slate-800 appearance-none cursor-pointer accent-cyan-400"
                        />
                      </div>

                      {/* Presets */}
                      <div className="text-[11px] font-mono text-slate-400 mb-1.5">কুইক ল্যাব প্রিসেট:</div>
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        <button
                          type="button"
                          onClick={() => { setWaveAmplitude(32); setWaveFrequency(0.05); setWaveSpeed(0.08); }}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-cyan-950 border border-white/10 hover:border-cyan-400/40 text-[11px] text-slate-200 font-medium cursor-pointer transition-all"
                        >
                          🌊 স্ট্যান্ডার্ড
                        </button>
                        <button
                          type="button"
                          onClick={() => { setWaveAmplitude(20); setWaveFrequency(0.12); setWaveSpeed(0.15); }}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-cyan-950 border border-white/10 hover:border-cyan-400/40 text-[11px] text-slate-200 font-medium cursor-pointer transition-all"
                        >
                          ⚡ হাই ফ্রিকোয়েন্সি
                        </button>
                        <button
                          type="button"
                          onClick={() => { setWaveAmplitude(65); setWaveFrequency(0.03); setWaveSpeed(0.05); }}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-cyan-950 border border-white/10 hover:border-cyan-400/40 text-[11px] text-slate-200 font-medium cursor-pointer transition-all"
                        >
                          📈 হাই বিস্তার
                        </button>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2.5 pt-2 border-t border-white/10">
                      <button
                        onClick={() => setIsPlayingPhysics(!isPlayingPhysics)}
                        className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                      >
                        {isPlayingPhysics ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        <span>{isPlayingPhysics ? 'সিমুলেশন থামান' : 'সিমুলেশন চালান'}</span>
                      </button>
                      <button
                        onClick={() => {
                          setWaveAmplitude(32);
                          setWaveFrequency(0.05);
                          setWaveSpeed(0.08);
                          setPhysicsTime(0);
                        }}
                        className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-300 hover:text-white cursor-pointer"
                        title="রিসেট"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* 2. CHEMISTRY EXPERIENCE (Atom & Bohr Model) */}
              {activeSubject === 'chemistry' && (
                <motion.div
                  key="chemistry"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-stretch"
                >
                  {/* Visualizer Stage */}
                  <div className="lg:col-span-7 flex flex-col justify-between">
                    <div className="relative w-full h-60 sm:h-72 rounded-2xl bg-[#090d16] border border-white/10 overflow-hidden flex items-center justify-center shadow-inner">
                      
                      {/* SVG Bohr Atom Model */}
                      <svg className="w-56 h-56 sm:w-64 sm:h-64" viewBox="0 0 250 250">
                        {/* Orbital Rings */}
                        <circle cx="125" cy="125" r="50" fill="none" stroke="rgba(16,185,129,0.25)" strokeWidth="1.5" strokeDasharray="4,4" />
                        <circle cx="125" cy="125" r="90" fill="none" stroke="rgba(16,185,129,0.18)" strokeWidth="1.5" strokeDasharray="6,6" />
                        
                        {/* Electron Shells */}
                        {Array.from({ length: electrons }).map((_, index) => {
                          const rotationOffset = (index * 360) / electrons;
                          const duration = 5 + (index * 1.5);
                          return (
                            <g key={index} style={{ transformOrigin: '125px 125px', transform: `rotate(${rotationOffset}deg)` }}>
                              <circle
                                cx="125"
                                cy="125"
                                r={index < 2 ? 50 : 90}
                                fill="none"
                                stroke="rgba(34,211,238,0.12)"
                                strokeWidth="1.5"
                              />
                              <circle cx="125" cy={index < 2 ? 75 : 35} r="6" fill="#34d399" stroke="#ffffff" strokeWidth="1.5" className="animate-pulse">
                                <animateTransform
                                  attributeName="transform"
                                  type="rotate"
                                  from="0 125 125"
                                  to="360 125 125"
                                  dur={`${duration}s`}
                                  repeatCount="indefinite"
                                />
                              </circle>
                            </g>
                          );
                        })}

                        {/* Nucleus Center (Protons & Neutrons clump) */}
                        <g transform="translate(125, 125)">
                          <circle cx="0" cy="0" r="22" fill="#ef4444" className="opacity-20 animate-ping" />
                          
                          {Array.from({ length: protons + neutrons }).map((_, i) => {
                            const angle = (i * 2.39996) * (180 / Math.PI);
                            const radius = Math.min(13, Math.sqrt(i) * 3.5);
                            const isProton = i % 2 === 0 ? (protons > Math.floor(i / 2)) : !(neutrons > Math.floor(i / 2));
                            return (
                              <circle
                                key={i}
                                cx={radius * Math.cos(angle)}
                                cy={radius * Math.sin(angle)}
                                r="4"
                                fill={isProton ? '#ef4444' : '#64748b'}
                                stroke="#090d16"
                                strokeWidth="0.8"
                              />
                            );
                          })}
                        </g>
                      </svg>

                      <div className="absolute top-3 left-3 text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-lg border border-emerald-500/30">
                        BOHR ATOMIC STAGE (Z={protons})
                      </div>

                      <div className="absolute top-3 right-3 text-[10px] font-mono text-slate-300 flex flex-col items-end gap-1 bg-slate-900/80 p-2 rounded-lg border border-white/10">
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>Protons ({protons})</span>
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-500 inline-block"></span>Neutrons ({neutrons})</span>
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block"></span>Electrons ({electrons})</span>
                      </div>
                    </div>

                    <div className="mt-3.5 p-3.5 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-300 font-sans leading-relaxed flex items-start gap-2.5">
                      <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-white">রসায়নবিজ্ঞান তত্ত্ব: </span>
                        পরমাণুর প্রোটন সংখ্যা (Z) মৌলটির পরিচিতি নির্ধারণ করে। প্রথম শক্তিস্তরে সর্বোচ্চ ২টি এবং দ্বিতীয় শক্তিস্তরে ৮টি ইলেকট্রন থাকতে পারে (২n² সূত্র)।
                      </div>
                    </div>
                  </div>

                  {/* Chemistry Controls */}
                  <div className="lg:col-span-5 flex flex-col justify-between space-y-3.5">
                    {/* Element Identity Card */}
                    <div className={`p-4 rounded-2xl bg-gradient-to-br ${elementInfo.bgGrad} border border-emerald-500/30 text-white shadow-xl`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-mono text-xs font-bold bg-white/15 px-2 py-0.5 rounded text-emerald-300">Z = {protons}</span>
                          <h4 className="font-display font-black text-lg text-white mt-1">{elementInfo.name}</h4>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-2xl font-display font-extrabold text-emerald-300 shadow-inner">
                          {elementInfo.symbol}
                        </div>
                      </div>
                      <p className="text-xs mt-1.5 text-slate-200 leading-relaxed font-sans">{elementInfo.desc}</p>
                      <div className="mt-3 pt-2.5 border-t border-white/10 flex justify-between text-xs font-mono font-bold text-emerald-300">
                        <span>ভর সংখ্যা: ~{elementInfo.mass} u</span>
                        <span>চার্জ: {protons - electrons === 0 ? 'নিরপেক্ষ (Neutral)' : `${protons - electrons > 0 ? '+' : ''}${protons - electrons}`}</span>
                      </div>
                    </div>

                    {/* Particle Adjusters */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs py-1 border-b border-white/5">
                        <span className="text-slate-300">প্রোটন সংখ্যা (Protons):</span>
                        <div className="flex items-center gap-2">
                          <button onClick={() => setProtons(p => Math.max(1, p - 1))} className="w-7 h-7 rounded bg-slate-800 hover:bg-rose-500/30 text-white font-bold cursor-pointer">-</button>
                          <span className="w-6 text-center font-mono font-bold text-white">{protons}</span>
                          <button onClick={() => setProtons(p => Math.min(8, p + 1))} className="w-7 h-7 rounded bg-slate-800 hover:bg-rose-500/30 text-white font-bold cursor-pointer">+</button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs py-1 border-b border-white/5">
                        <span className="text-slate-300">নিউট্রন সংখ্যা (Neutrons):</span>
                        <div className="flex items-center gap-2">
                          <button onClick={() => setNeutrons(n => Math.max(0, n - 1))} className="w-7 h-7 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold cursor-pointer">-</button>
                          <span className="w-6 text-center font-mono font-bold text-white">{neutrons}</span>
                          <button onClick={() => setNeutrons(n => Math.min(8, n + 1))} className="w-7 h-7 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold cursor-pointer">+</button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs py-1 border-b border-white/5">
                        <span className="text-slate-300">ইলেকট্রন সংখ্যা (Electrons):</span>
                        <div className="flex items-center gap-2">
                          <button onClick={() => setElectrons(e => Math.max(1, e - 1))} className="w-7 h-7 rounded bg-slate-800 hover:bg-emerald-500/30 text-white font-bold cursor-pointer">-</button>
                          <span className="w-6 text-center font-mono font-bold text-white">{electrons}</span>
                          <button onClick={() => setElectrons(e => Math.min(8, e + 1))} className="w-7 h-7 rounded bg-slate-800 hover:bg-emerald-500/30 text-white font-bold cursor-pointer">+</button>
                        </div>
                      </div>
                    </div>

                    {/* Quick Elements */}
                    <div className="grid grid-cols-4 gap-1.5 pt-1">
                      <button onClick={() => { setProtons(1); setNeutrons(0); setElectrons(1); }} className="px-2 py-1 rounded bg-slate-900 hover:bg-emerald-950 border border-white/10 text-xs font-mono font-bold text-white">¹H</button>
                      <button onClick={() => { setProtons(2); setNeutrons(2); setElectrons(2); }} className="px-2 py-1 rounded bg-slate-900 hover:bg-emerald-950 border border-white/10 text-xs font-mono font-bold text-white">⁴He</button>
                      <button onClick={() => { setProtons(6); setNeutrons(6); setElectrons(6); }} className="px-2 py-1 rounded bg-slate-900 hover:bg-emerald-950 border border-white/10 text-xs font-mono font-bold text-white">¹²C</button>
                      <button onClick={() => { setProtons(8); setNeutrons(8); setElectrons(8); }} className="px-2 py-1 rounded bg-slate-900 hover:bg-emerald-950 border border-white/10 text-xs font-mono font-bold text-white">¹⁶O</button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* 3. BIOLOGY EXPERIENCE (DNA Double Helix & Cytology) */}
              {activeSubject === 'biology' && (
                <motion.div
                  key="biology"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-stretch"
                >
                  {/* Visualizer Stage */}
                  <div className="lg:col-span-7 flex flex-col justify-between">
                    <div className="relative w-full h-60 sm:h-72 rounded-2xl bg-[#090d16] border border-white/10 overflow-hidden flex items-center justify-center shadow-inner">
                      
                      {/* SVG DNA Helix */}
                      <svg className="w-full h-44 px-4" viewBox="0 0 450 160" preserveAspectRatio="xMidYMid meet">
                        {Array.from({ length: 18 }).map((_, index) => {
                          const x = 20 + index * 24;
                          const angle = dnaTime + (index * 0.45);
                          const y1 = 80 + Math.sin(angle) * 38;
                          const y2 = 80 - Math.sin(angle) * 38;
                          
                          const isPair1 = index % 2 === 0;
                          const color1 = isPair1 ? '#10b981' : '#22d3ee';
                          const color2 = isPair1 ? '#ef4444' : '#a855f7';

                          return (
                            <g key={index}>
                              <line x1={x} y1={y1} x2={x} y2={y2} stroke="rgba(255,255,255,0.12)" strokeWidth="2.5" />
                              <line x1={x} y1={y1} x2={x} y2={80} stroke={color1} strokeWidth="3.5" />
                              <line x1={x} y1={80} x2={x} y2={y2} stroke={color2} strokeWidth="3.5" />
                              <circle cx={x} cy={y1} r="5" fill="#ffffff" stroke={color1} strokeWidth="2" className="animate-pulse" />
                              <circle cx={x} cy={y2} r="5" fill="#ffffff" stroke={color2} strokeWidth="2" className="animate-pulse" />
                            </g>
                          );
                        })}
                      </svg>

                      <div className="absolute top-3 left-3 text-[10px] font-mono text-rose-400 bg-rose-950/80 px-3 py-1 rounded-lg border border-rose-500/30">
                        DNA SEQUENCING LAB: ACTIVE
                      </div>

                      <div className="absolute bottom-3 right-3 text-[9px] font-mono text-slate-300 flex gap-2 bg-slate-900/80 p-2 rounded-lg border border-white/10">
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-emerald-500"></span>A</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-rose-500"></span>T</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-cyan-400"></span>C</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-purple-400"></span>G</span>
                      </div>
                    </div>

                    <div className="mt-3.5 p-3.5 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-300 font-sans leading-relaxed flex items-start gap-2.5">
                      <Sparkles className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-white">জীববিজ্ঞান তত্ত্ব: </span>
                        ওয়াটসন ও ক্রিক (১৯৫৩) মডেল অনুসারে ডিএনএ একটি দ্বিসূত্রক ডাবল হেলিক্স। এডেনিন সবসময় থাইমিনের সাথে ২টি এবং গুয়ানিন সাইটোসিনের সাথে ৩টি হাইড্রোজেন বন্ড তৈরি করে।
                      </div>
                    </div>
                  </div>

                  {/* Biology Controls */}
                  <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Sliders className="w-4 h-4 text-rose-400" />
                        <span className="font-display font-bold text-xs tracking-wider text-slate-200 uppercase">ডিএনএ ও কোষতত্ত্ব কন্ট্রোলার</span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-300">ঘূর্ণন বেগ (Rotation Speed):</span>
                          <span className="font-mono text-rose-400 font-bold">{dnaSpeed}x</span>
                        </div>
                        <input
                          type="range"
                          min="0.2"
                          max="3.0"
                          step="0.1"
                          value={dnaSpeed}
                          onChange={(e) => setDnaSpeed(Number(e.target.value))}
                          className="w-full h-2 rounded-lg bg-slate-800 appearance-none cursor-pointer accent-rose-400"
                        />
                      </div>

                      {/* Fact Box */}
                      <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-xs space-y-1.5">
                        <div className="text-rose-300 font-bold flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5" />
                          <span>হাইলাইটস ও কোষতত্ত্ব ফ্যাক্টস</span>
                        </div>
                        <p className="text-slate-300 text-[11px] leading-relaxed">
                          • ডিএনএ-র প্রতিটি পূর্ণাঙ্গ প্যাঁচের দৈর্ঘ্য ৩৪ Å (3.4 nm)।<br />
                          • মানুষের জিনোমে প্রায় ৩ বিলিয়ন ক্ষারজোড় (Base pairs) রয়েছে।
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setIsDnaRotating(!isDnaRotating)}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                    >
                      {isDnaRotating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      <span>{isDnaRotating ? 'ঘূর্ণন থামান' : 'ঘূর্ণন চালান'}</span>
                    </button>
                  </div>
                </motion.div>
              )}

              {/* 4. MATHEMATICS EXPERIENCE (Trigonometric Unit Circle & Vectors) */}
              {activeSubject === 'math' && (
                <motion.div
                  key="math"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-stretch"
                >
                  {/* Visualizer Stage */}
                  <div className="lg:col-span-7 flex flex-col justify-between">
                    <div className="relative w-full h-60 sm:h-72 rounded-2xl bg-[#090d16] border border-white/10 overflow-hidden flex items-center justify-center shadow-inner">
                      
                      {/* SVG Trigonometric Unit Circle */}
                      <svg className="w-56 h-56 sm:w-64 sm:h-64" viewBox="0 0 240 240">
                        {/* Axes */}
                        <line x1="10" y1="120" x2="230" y2="120" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
                        <line x1="120" y1="10" x2="120" y2="230" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
                        
                        {/* Unit Circle */}
                        <circle cx="120" cy="120" r="80" fill="none" stroke="rgba(245,158,11,0.4)" strokeWidth="2" />
                        
                        {/* Vector Line */}
                        {(() => {
                          const rad = (mathAngle * Math.PI) / 180;
                          const px = 120 + Math.cos(rad) * 80;
                          const py = 120 - Math.sin(rad) * 80;
                          return (
                            <g>
                              {/* Triangle */}
                              <line x1="120" y1="120" x2={px} y2={py} stroke="#fbbf24" strokeWidth="3" />
                              <line x1={px} y1={py} x2={px} y2="120" stroke="#38bdf8" strokeWidth="2" strokeDasharray="3,3" />
                              <line x1="120" y1="120" x2={px} y2="120" stroke="#34d399" strokeWidth="2" />
                              
                              {/* Point Dot */}
                              <circle cx={px} cy={py} r="6" fill="#fbbf24" stroke="#ffffff" strokeWidth="2" />
                            </g>
                          );
                        })()}
                      </svg>

                      <div className="absolute top-3 left-3 text-[10px] font-mono text-amber-400 bg-amber-950/80 px-3 py-1 rounded-lg border border-amber-500/30">
                        UNIT CIRCLE: θ = {mathAngle}°
                      </div>
                    </div>

                    <div className="mt-3.5 p-3.5 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-300 font-sans leading-relaxed flex items-start gap-2.5">
                      <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-white">গণিত তত্ত্ব: </span>
                        একক বৃত্তে (Unit Circle) যেকোনো বিন্দুর কার্তেসীয় স্থানাঙ্ক হলো (cos θ, sin θ)। পিথাগোরাস উপপাদ্য অনুযায়ী sin² θ + cos² θ = ১।
                      </div>
                    </div>
                  </div>

                  {/* Math Controls */}
                  <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Sliders className="w-4 h-4 text-amber-400" />
                        <span className="font-display font-bold text-xs tracking-wider text-slate-200 uppercase">কোণ ও ভেক্টর পরিবর্তন</span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-300">কোণ (Angle θ):</span>
                          <span className="font-mono text-amber-400 font-bold">{mathAngle}° ({(mathAngle * Math.PI / 180).toFixed(2)} rad)</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="360"
                          value={mathAngle}
                          onChange={(e) => setMathAngle(Number(e.target.value))}
                          className="w-full h-2 rounded-lg bg-slate-800 appearance-none cursor-pointer accent-amber-400"
                        />
                      </div>

                      {/* Value outputs */}
                      <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-xs space-y-2">
                        <div className="flex justify-between">
                          <span className="text-slate-300 font-mono">sin({mathAngle}°):</span>
                          <span className="font-mono font-bold text-sky-300">{Math.sin(mathAngle * Math.PI / 180).toFixed(4)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-300 font-mono">cos({mathAngle}°):</span>
                          <span className="font-mono font-bold text-emerald-300">{Math.cos(mathAngle * Math.PI / 180).toFixed(4)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-300 font-mono">tan({mathAngle}°):</span>
                          <span className="font-mono font-bold text-amber-300">
                            {Math.abs(Math.cos(mathAngle * Math.PI / 180)) < 0.001 ? 'অসীম (∞)' : Math.tan(mathAngle * Math.PI / 180).toFixed(4)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-1.5">
                      <button onClick={() => setMathAngle(30)} className="px-2 py-1.5 rounded bg-slate-900 hover:bg-amber-950 border border-white/10 text-xs font-mono font-bold text-white">30°</button>
                      <button onClick={() => setMathAngle(45)} className="px-2 py-1.5 rounded bg-slate-900 hover:bg-amber-950 border border-white/10 text-xs font-mono font-bold text-white">45°</button>
                      <button onClick={() => setMathAngle(60)} className="px-2 py-1.5 rounded bg-slate-900 hover:bg-amber-950 border border-white/10 text-xs font-mono font-bold text-white">60°</button>
                      <button onClick={() => setMathAngle(90)} className="px-2 py-1.5 rounded bg-slate-900 hover:bg-amber-950 border border-white/10 text-xs font-mono font-bold text-white">90°</button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* 5. ELECTROMAGNETISM EXPERIENCE */}
              {activeSubject === 'electromagnetism' && (
                <motion.div
                  key="electromagnetism"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-stretch"
                >
                  <div className="lg:col-span-7 flex flex-col justify-between">
                    <div className="relative w-full h-60 sm:h-72 rounded-2xl bg-[#090d16] border border-white/10 overflow-hidden flex items-center justify-center shadow-inner">
                      <svg className="w-full h-full" viewBox="0 0 450 240">
                        {/* Magnetic flux lines */}
                        {Array.from({ length: 9 }).map((_, i) => {
                          const y = 30 + i * 22;
                          return (
                            <g key={i}>
                              <line x1="30" y1={y} x2="420" y2={y} stroke="rgba(168,85,247,0.35)" strokeWidth="1.5" strokeDasharray="5,5" />
                              <polygon points={`230,${y-4} 240,${y} 230,${y+4}`} fill="#c084fc" />
                            </g>
                          );
                        })}
                        {/* Lorentz Conductor Wire with current */}
                        <rect x="210" y="20" width="30" height="200" rx="6" fill="#38bdf8" stroke="#ffffff" strokeWidth="2" />
                        <text x="225" y="125" fill="#ffffff" fontSize="12" fontWeight="bold" textAnchor="middle">I →</text>
                      </svg>
                      <div className="absolute top-3 left-3 text-[10px] font-mono text-purple-400 bg-purple-950/80 px-3 py-1 rounded-lg border border-purple-500/30">
                        LORENTZ FORCE: F = I·(L × B)
                      </div>
                    </div>
                    <div className="mt-3.5 p-3.5 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-300 font-sans leading-relaxed flex items-start gap-2.5">
                      <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-white">তড়িৎ-চুম্বকত্ব তত্ত্ব: </span>
                        চৌম্বক ক্ষেত্রে গতিশীল চার্জ বা তড়িৎবাহী তারের ওপর প্রযুক্ত লরেঞ্জ বল (F) চৌম্বক ক্ষেত্র ও বিদ্যুৎ প্রবাহের সাথে সমকোণে ক্রিয়া করে (ফ্লেমিং-এর বাম হস্ত নিয়ম)।
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-300">চৌম্বক ক্ষেত্র (Magnetic Field B):</span>
                          <span className="font-mono text-purple-400 font-bold">{magneticField} Tesla</span>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="100"
                          value={magneticField}
                          onChange={(e) => setMagneticField(Number(e.target.value))}
                          className="w-full h-2 rounded-lg bg-slate-800 appearance-none cursor-pointer accent-purple-400"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-300">তড়িৎ প্রবাহ (Current I):</span>
                          <span className="font-mono text-cyan-400 font-bold">{currentIntensity} Amp</span>
                        </div>
                        <input
                          type="range"
                          min="5"
                          max="100"
                          value={currentIntensity}
                          onChange={(e) => setCurrentIntensity(Number(e.target.value))}
                          className="w-full h-2 rounded-lg bg-slate-800 appearance-none cursor-pointer accent-cyan-400"
                        />
                      </div>

                      <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-500/30 text-xs space-y-1.5">
                        <div className="text-purple-300 font-bold">গণনাকৃত মোট বল (Total Force F):</div>
                        <div className="text-xl font-display font-black text-white">
                          {((magneticField * currentIntensity) / 100).toFixed(2)} Newton
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* 6. THERMODYNAMICS EXPERIENCE */}
              {activeSubject === 'thermodynamics' && (
                <motion.div
                  key="thermodynamics"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-stretch"
                >
                  <div className="lg:col-span-7 flex flex-col justify-between">
                    <div className="relative w-full h-60 sm:h-72 rounded-2xl bg-[#090d16] border border-white/10 overflow-hidden flex items-center justify-center shadow-inner">
                      {/* Piston & Gas molecules */}
                      <svg className="w-56 h-56" viewBox="0 0 200 200">
                        {/* Cylinder */}
                        <rect x="30" y="30" width="140" height="140" rx="4" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
                        {/* Piston Head */}
                        <rect x="32" y={40 + (100 - gasPressure) * 0.7} width="136" height="15" fill="#f97316" stroke="#ffffff" strokeWidth="1" />
                        {/* Heat glow */}
                        <rect x="32" y="165" width="136" height="5" fill="#ef4444" className="animate-pulse" />
                      </svg>
                      <div className="absolute top-3 left-3 text-[10px] font-mono text-orange-400 bg-orange-950/80 px-3 py-1 rounded-lg border border-orange-500/30">
                        IDEAL GAS: P·V = n·R·T
                      </div>
                    </div>
                    <div className="mt-3.5 p-3.5 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-300 font-sans leading-relaxed flex items-start gap-2.5">
                      <Sparkles className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-white">তাপগতিবিদ্যা তত্ত্ব: </span>
                        আদর্শ গ্যাস সমীকরণ অনুযায়ী স্থির তাপমাত্রায় গ্যাসের চাপ তার আয়তনের ব্যস্তানুপাতিক (বয়েল-এর সূত্র)।
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-300">গ্যাসীয় চাপ (Pressure P):</span>
                          <span className="font-mono text-orange-400 font-bold">{gasPressure} kPa</span>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="90"
                          value={gasPressure}
                          onChange={(e) => setGasPressure(Number(e.target.value))}
                          className="w-full h-2 rounded-lg bg-slate-800 appearance-none cursor-pointer accent-orange-400"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-300">পরম তাপমাত্রা (Temperature T):</span>
                          <span className="font-mono text-red-400 font-bold">{gasTemperature} Kelvin</span>
                        </div>
                        <input
                          type="range"
                          min="100"
                          max="600"
                          step="10"
                          value={gasTemperature}
                          onChange={(e) => setGasTemperature(Number(e.target.value))}
                          className="w-full h-2 rounded-lg bg-slate-800 appearance-none cursor-pointer accent-red-400"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

        </div>

      </div>
    </div>
  );
}
