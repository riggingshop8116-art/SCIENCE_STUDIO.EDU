import React, { useEffect, useState } from 'react';

// Define a type for floating science items
interface ScienceItem {
  id: number;
  type: 'formula' | 'symbol' | 'molecule' | 'diagram';
  content: React.ReactNode;
  x: number; // percentage width
  y: number; // percentage height
  scale: number;
  rotation: number;
  opacity: number;
  animDuration: string;
  animDelay: string;
}

export default function ScienceBackground() {
  const [items, setItems] = useState<ScienceItem[]>([]);

  useEffect(() => {
    // Generate science elements with randomized, balanced coordinates and vibrant opacities
    const generatedItems: ScienceItem[] = [
      // 1. Einstein's Energy Equation
      {
        id: 1,
        type: 'formula',
        content: (
          <svg width="120" height="36" viewBox="0 0 120 36">
            <text x="10" y="24" className="font-mono text-[16px] font-black fill-cyan-400/70 select-none">
              E = mc²
            </text>
          </svg>
        ),
        x: 5,
        y: 12,
        scale: 1.1,
        rotation: -5,
        opacity: 0.22,
        animDuration: '24s',
        animDelay: '0s',
      },
      // 2. Wave Equation / Calculus
      {
        id: 2,
        type: 'formula',
        content: (
          <svg width="170" height="36" viewBox="0 0 170 36">
            <text x="10" y="24" className="font-mono text-[14px] font-bold fill-emerald-400/70 select-none">
              iℏ(∂/∂t)Ψ = ĤΨ
            </text>
          </svg>
        ),
        x: 82,
        y: 14,
        scale: 1.05,
        rotation: 3,
        opacity: 0.20,
        animDuration: '28s',
        animDelay: '-4s',
      },
      // 3. DNA Double Helix
      {
        id: 3,
        type: 'diagram',
        content: (
          <svg width="50" height="130" viewBox="0 0 50 130" className="stroke-cyan-500/60 fill-none stroke-[2]">
            <path d="M 12,10 C 35,30 35,45 12,65 C -10,85 -10,100 12,120" />
            <path d="M 35,10 C 12,30 12,45 35,65 C 55,85 55,100 35,120" />
            {/* Rungs of DNA ladder */}
            <line x1="20" y1="22" x2="27" y2="22" className="stroke-emerald-500/60 stroke-[2]" />
            <line x1="23" y1="38" x2="23" y2="38" className="stroke-cyan-400/60 stroke-[3]" />
            <line x1="18" y1="54" x2="29" y2="54" className="stroke-amber-400/60 stroke-[2]" />
            <line x1="18" y1="76" x2="29" y2="76" className="stroke-emerald-500/60 stroke-[2]" />
            <line x1="23" y1="92" x2="23" y2="92" className="stroke-cyan-400/60 stroke-[3]" />
            <line x1="20" y1="108" x2="27" y2="108" className="stroke-indigo-400/60 stroke-[2]" />
          </svg>
        ),
        x: 90,
        y: 45,
        scale: 0.95,
        rotation: 12,
        opacity: 0.18,
        animDuration: '32s',
        animDelay: '-2s',
      },
      // 4. Benzene Ring / Organic Chemistry structure
      {
        id: 4,
        type: 'molecule',
        content: (
          <svg width="110" height="110" viewBox="0 0 110 110" className="stroke-cyan-400/60 fill-none stroke-[1.8]">
            {/* Hexagon */}
            <polygon points="55,15 88,34 88,72 55,91 22,72 22,34" />
            {/* Inner Ring */}
            <circle cx="55" cy="53" r="25" className="stroke-emerald-400/50 stroke-dasharray-4" />
            {/* Hydroxyl/Side Chains */}
            <line x1="55" y1="15" x2="55" y2="2" className="stroke-amber-400/50" />
            <line x1="88" y1="72" x2="102" y2="80" className="stroke-cyan-400/50" />
            <line x1="22" y1="72" x2="8" y2="80" className="stroke-cyan-400/50" />
            <text x="47" y="-2" className="font-mono text-[10px] fill-amber-400/70 font-bold">OH</text>
            <text x="103" y="87" className="font-mono text-[9px] fill-cyan-400/70 font-bold">CH₃</text>
          </svg>
        ),
        x: 3,
        y: 65,
        scale: 0.95,
        rotation: -15,
        opacity: 0.18,
        animDuration: '30s',
        animDelay: '-10s',
      },
      // 5. Bohr's Atom Model with glowing electrons
      {
        id: 5,
        type: 'symbol',
        content: (
          <svg width="130" height="130" viewBox="0 0 130 130" className="stroke-emerald-400/60 fill-none stroke-[1.5]">
            <circle cx="65" cy="65" r="10" className="fill-emerald-400/20 stroke-emerald-400/60 stroke-[1.5]" />
            {/* Orbits */}
            <ellipse cx="65" cy="65" rx="50" ry="20" transform="rotate(30, 65, 65)" className="stroke-cyan-400/40" />
            <ellipse cx="65" cy="65" rx="50" ry="20" transform="rotate(90, 65, 65)" className="stroke-emerald-400/40" />
            <ellipse cx="65" cy="65" rx="50" ry="20" transform="rotate(150, 65, 65)" className="stroke-indigo-400/40" />
            {/* Electron dots */}
            <circle cx="22" cy="40" r="3" className="fill-cyan-400/70" />
            <circle cx="65" cy="15" r="3" className="fill-emerald-400/70" />
            <circle cx="108" cy="90" r="3" className="fill-amber-400/70" />
          </svg>
        ),
        x: 78,
        y: 70,
        scale: 1.0,
        rotation: 45,
        opacity: 0.20,
        animDuration: '24s',
        animDelay: '-5s',
      },
      // 6. Physics Wave Interferometer
      {
        id: 6,
        type: 'diagram',
        content: (
          <svg width="150" height="85" viewBox="0 0 150 85" className="stroke-slate-500 fill-none stroke-[1.2]">
            {/* Axis */}
            <line x1="10" y1="42" x2="140" y2="42" className="stroke-slate-700/60" />
            <line x1="15" y1="10" x2="15" y2="75" className="stroke-slate-700/60" />
            {/* Sine wave */}
            <path d="M 15,42 Q 35,15 55,42 T 95,42 T 135,42" className="stroke-cyan-500/50 stroke-[1.5]" />
            {/* Secondary wave */}
            <path d="M 15,42 Q 30,25 45,42 T 75,42 T 105,42 T 135,42" className="stroke-emerald-500/40 stroke-dasharray-2 stroke-[1.2]" />
            <text x="125" y="36" className="font-mono text-[9px] fill-cyan-400/50 font-bold">λ = v/f</text>
          </svg>
        ),
        x: 42,
        y: 12,
        scale: 0.95,
        rotation: 0,
        opacity: 0.16,
        animDuration: '32s',
        animDelay: '-12s',
      },
      // 7. Lab Flask & Chemical Reaction
      {
        id: 7,
        type: 'symbol',
        content: (
          <svg width="85" height="105" viewBox="0 0 85 105" className="stroke-cyan-500/50 fill-none stroke-[1.8]">
            <path d="M 35,20 L 35,35 L 15,78 A 10,10 0 0,0 24,92 L 58,92 A 10,10 0 0,0 67,78 L 47,35 L 47,20" />
            <line x1="30" y1="20" x2="52" y2="20" className="stroke-[2] stroke-cyan-400/60" />
            {/* Liquid level */}
            <path d="M 21,68 Q 41,62 61,68 L 59,78 L 23,78 Z" className="fill-cyan-500/15 stroke-none" />
          </svg>
        ),
        x: 10,
        y: 36,
        scale: 0.9,
        rotation: -8,
        opacity: 0.16,
        animDuration: '24s',
        animDelay: '-3s',
      },
      // 8. Integration & Pendulum formula
      {
        id: 8,
        type: 'formula',
        content: (
          <div className="font-mono text-[11px] font-bold text-slate-400 bg-slate-950/60 p-2 rounded-lg border border-cyan-500/20 backdrop-blur-sm select-none space-y-0.5">
            <div className="text-cyan-400/70 flex items-center gap-1.5">
              <span>T = 2π√(l / g)</span>
            </div>
            <div className="text-emerald-400/70 text-[10px]">∫_a^b f(x) dx</div>
          </div>
        ),
        x: 44,
        y: 84,
        scale: 0.95,
        rotation: -2,
        opacity: 0.18,
        animDuration: '36s',
        animDelay: '-8s',
      },
      // 9. Optics Prism Refraction Spectrum
      {
        id: 9,
        type: 'diagram',
        content: (
          <svg width="120" height="90" viewBox="0 0 120 90" className="stroke-cyan-500/40 fill-none stroke-[1.2]">
            {/* Prism triangle */}
            <polygon points="50,15 15,75 85,75" className="stroke-cyan-400/50 stroke-[1.5] fill-cyan-500/5" />
            {/* White beam entering */}
            <line x1="0" y1="60" x2="32" y2="48" className="stroke-slate-300/40 stroke-[1.5]" />
            {/* Refracted rays inside */}
            <line x1="32" y1="48" x2="68" y2="52" className="stroke-amber-400/40 stroke-[1.2]" />
            {/* Rainbow rays exiting */}
            <line x1="68" y1="52" x2="115" y2="35" className="stroke-rose-400/40 stroke-[1.5]" />
            <line x1="68" y1="52" x2="115" y2="55" className="stroke-emerald-400/40 stroke-[1.5]" />
            <line x1="68" y1="52" x2="115" y2="75" className="stroke-cyan-400/40 stroke-[1.5]" />
          </svg>
        ),
        x: 28,
        y: 48,
        scale: 0.95,
        rotation: 4,
        opacity: 0.18,
        animDuration: '28s',
        animDelay: '-14s',
      },
      // 10. Quantum Constants Card
      {
        id: 10,
        type: 'formula',
        content: (
          <div className="font-mono text-[10px] text-cyan-400/70 space-y-0.5 bg-slate-950/60 p-2 rounded-lg border border-emerald-500/20 backdrop-blur-sm select-none">
            <div className="font-bold text-amber-400/70 text-[9px] tracking-wider uppercase border-b border-white/5 pb-0.5">
              ⚡ Universal Constants
            </div>
            <div>c = 2.998 × 10⁸ m/s</div>
            <div className="text-emerald-400/70">h = 6.626 × 10⁻³⁴ J·s</div>
          </div>
        ),
        x: 78,
        y: 4,
        scale: 0.95,
        rotation: -1,
        opacity: 0.18,
        animDuration: '24s',
        animDelay: '-1s',
      },
      // 11. Magnetic Field Loop Diagram
      {
        id: 11,
        type: 'diagram',
        content: (
          <svg width="110" height="80" viewBox="0 0 110 80" className="stroke-emerald-500/40 fill-none stroke-[1.2]">
            <rect x="40" y="25" width="30" height="30" rx="4" className="fill-rose-500/10 stroke-rose-400/40 stroke-[1.5]" />
            <text x="48" y="44" className="font-mono text-[10px] fill-rose-400/60 font-bold">N  S</text>
            {/* Magnetic field arcs */}
            <path d="M 40,30 Q 15,10 40,50" className="stroke-cyan-500/40 stroke-dasharray-3" />
            <path d="M 70,30 Q 95,10 70,50" className="stroke-cyan-500/40 stroke-dasharray-3" />
          </svg>
        ),
        x: 60,
        y: 38,
        scale: 0.9,
        rotation: -6,
        opacity: 0.15,
        animDuration: '30s',
        animDelay: '-6s',
      }
    ];

    setItems(generatedItems);
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none select-none overflow-hidden bg-[#040812]" id="science-ambient-background">
      {/* 1. Enhanced Blueprint Grid Lines (Clean, subtle & non-distracting) */}
      <div 
        className="absolute inset-0 opacity-[0.035]" 
        style={{
          backgroundImage: `
            linear-gradient(to right, #22d3ee 1px, transparent 1px),
            linear-gradient(to bottom, #22d3ee 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />

      {/* 2. Soft Ambient Vignette & Deep Radial Glows */}
      <div className="absolute top-[5%] left-[15%] w-[36rem] h-[36rem] rounded-full bg-cyan-600/[0.04] blur-[160px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[8%] w-[40rem] h-[40rem] rounded-full bg-emerald-600/[0.03] blur-[170px] pointer-events-none" />
      <div className="absolute top-[40%] left-[55%] w-[32rem] h-[32rem] rounded-full bg-blue-600/[0.03] blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[35%] left-[5%] w-[32rem] h-[32rem] rounded-full bg-amber-500/[0.06] blur-[130px] animate-pulse pointer-events-none" style={{ animationDuration: '16s' }} />

      {/* 4. Floating Particles / Glowing Star Nodes */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-1.5 h-1.5 bg-cyan-300 rounded-full shadow-[0_0_10px_#22d3ee] animate-ping" style={{ animationDuration: '3s' }} />
        <div className="absolute top-2/3 left-1/5 w-2 h-2 bg-emerald-300 rounded-full shadow-[0_0_12px_#34d399] animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute top-1/2 right-1/4 w-1.5 h-1.5 bg-amber-300 rounded-full shadow-[0_0_10px_#fcd34d] animate-ping" style={{ animationDuration: '5s' }} />
        <div className="absolute bottom-1/4 right-1/3 w-2 h-2 bg-indigo-400 rounded-full shadow-[0_0_12px_#818cf8] animate-pulse" style={{ animationDuration: '3.5s' }} />
      </div>

      {/* 5. Randomized Interactive Floating Science Doodles & Formulas Layer */}
      {items.map((item) => {
        return (
          <div
            key={item.id}
            className="absolute transition-transform duration-1000 ease-out"
            style={{
              left: `${item.x}%`,
              top: `${item.y}%`,
              transform: `scale(${item.scale}) rotate(${item.rotation}deg)`,
              opacity: item.opacity,
              animation: `scienceFloat ${item.animDuration} ease-in-out infinite alternate`,
              animationDelay: item.animDelay,
            }}
          >
            {item.content}
          </div>
        );
      })}

      {/* Embedded CSS for Science Floats to support native high-fidelity animation */}
      <style>{`
        @keyframes scienceFloat {
          0% {
            transform: translateY(0px) rotate(0deg) scale(1);
          }
          50% {
            transform: translateY(-20px) rotate(4deg) scale(1.04);
          }
          100% {
            transform: translateY(15px) rotate(-4deg) scale(0.96);
          }
        }
      `}</style>
    </div>
  );
}

