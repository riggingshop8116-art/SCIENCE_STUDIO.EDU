import React, { useEffect, useRef } from 'react';

interface Hero3DCanvasProps {
  className?: string;
}

export default function Hero3DCanvas({ className = '' }: Hero3DCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    // On mobile devices or low-powered touch devices, bypass continuous canvas rendering entirely to prevent memory exhaustion and browser tab crashes
    const isMobile = typeof window !== 'undefined' && (window.innerWidth < 768 || ('ontouchstart' in window) || (navigator.maxTouchPoints > 0));
    if (isMobile) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    let ctx: CanvasRenderingContext2D | null = null;
    try {
      ctx = canvas.getContext('2d', { alpha: true });
    } catch {
      return;
    }
    if (!ctx) return;

    let animationFrameId: number;
    let isDestroyed = false;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 600);

    const handleResize = () => {
      if (!canvas || isDestroyed) return;
      width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.height = canvas.parentElement?.clientHeight || 600;
    };

    window.addEventListener('resize', handleResize);

    // Mouse coordinates for 3D parallax tilt
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      if (isDestroyed) return;
      const rect = canvas.getBoundingClientRect();
      targetMouseX = ((e.clientX - rect.left) / width - 0.5) * 2;
      targetMouseY = ((e.clientY - rect.top) / height - 0.5) * 2;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Desktop Particles (lightweight count for silky 30fps)
    const particleCount = 28;
    const particles: {
      x: number;
      y: number;
      z: number;
      size: number;
      color: string;
      speed: number;
      pulse: number;
    }[] = [];

    const colors = ['#22d3ee', '#38bdf8', '#34d399', '#f59e0b', '#818cf8'];

    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const radius = 120 + Math.random() * 260;

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);

      particles.push({
        x,
        y,
        z,
        size: 1.5 + Math.random() * 2,
        color: colors[i % colors.length],
        speed: 0.003 + Math.random() * 0.005,
        pulse: Math.random() * Math.PI * 2,
      });
    }

    // 3D Rings for Atom / Quantum Orbits
    const rings = [
      { radiusX: 180, radiusY: 70, tiltX: 0.9, tiltY: 0.4, speed: 0.012, angle: 0, color: 'rgba(34, 211, 238, 0.45)', electronPos: 0 },
      { radiusX: 210, radiusY: 80, tiltX: -0.8, tiltY: 0.6, speed: -0.015, angle: 1.2, color: 'rgba(56, 189, 248, 0.4)', electronPos: 2.1 },
      { radiusX: 240, radiusY: 90, tiltX: 0.3, tiltY: -0.9, speed: 0.01, angle: 2.4, color: 'rgba(52, 211, 153, 0.35)', electronPos: 4.2 }
    ];

    let globalRotation = 0;
    let lastRenderTime = 0;
    const TARGET_FPS_INTERVAL = 1000 / 30; // 30 FPS throttle prevents 100% CPU lock

    const render = (timestamp: number) => {
      if (isDestroyed) return;

      // Throttle to 30fps and pause when document is hidden or modal is open
      if (document.hidden || (document.body && document.body.classList.contains('auth-modal-open'))) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      const elapsed = timestamp - lastRenderTime;
      if (elapsed < TARGET_FPS_INTERVAL) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }
      lastRenderTime = timestamp - (elapsed % TARGET_FPS_INTERVAL);

      try {
        if (!ctx) return;
        ctx.clearRect(0, 0, width, height);

        // Smooth mouse parallax
        mouseX += (targetMouseX - mouseX) * 0.05;
        mouseY += (targetMouseY - mouseY) * 0.05;
        globalRotation += 0.008;

        const fov = 450;
        const centerX = width * 0.72;
        const centerY = height * 0.5;

        // 1. Draw glowing 3D Nucleus in center
        const nucleusPulse = Math.sin(globalRotation * 2) * 4;
        const nucleusRad = 22 + nucleusPulse;

        ctx.save();
        ctx.translate(centerX, centerY);
        const grad = ctx.createRadialGradient(0, 0, 2, 0, 0, nucleusRad);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.3, '#22d3ee');
        grad.addColorStop(0.7, '#0284c7');
        grad.addColorStop(1, 'transparent');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, nucleusRad, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // 2. Draw 3D Orbit Rings & Electrons
        rings.forEach((ring) => {
          ring.angle += ring.speed;
          ring.electronPos += Math.abs(ring.speed) * 1.8;

          ctx.save();
          ctx.translate(centerX, centerY);
          ctx.rotate(ring.angle * 0.3 + mouseX * 0.2);

          ctx.beginPath();
          ctx.ellipse(0, 0, ring.radiusX, ring.radiusY, ring.tiltX + mouseY * 0.1, 0, Math.PI * 2);
          ctx.strokeStyle = ring.color;
          ctx.lineWidth = 1.2;
          ctx.stroke();

          // Orbiting Electron
          const ex = Math.cos(ring.electronPos) * ring.radiusX;
          const ey = Math.sin(ring.electronPos) * ring.radiusY;

          ctx.beginPath();
          ctx.arc(ex, ey, 3.5, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();

          ctx.restore();
        });

        // 3. Render floating quantum 3D particles
        particles.forEach((p) => {
          p.pulse += 0.02;
          const cosR = Math.cos(globalRotation * p.speed * 40 + mouseX * 0.4);
          const sinR = Math.sin(globalRotation * p.speed * 40 + mouseX * 0.4);

          const x1 = p.x * cosR - p.z * sinR;
          const z1 = p.z * cosR + p.x * sinR;

          const cosTilt = Math.cos(mouseY * 0.3);
          const sinTilt = Math.sin(mouseY * 0.3);
          const y1 = p.y * cosTilt - z1 * sinTilt;
          const z2 = z1 * cosTilt + p.y * sinTilt;

          const scale = fov / (fov + z2);
          const projX = centerX + x1 * scale;
          const projY = centerY + y1 * scale;
          const projSize = Math.max(0.5, p.size * scale * (0.8 + Math.sin(p.pulse) * 0.2));

          if (z2 > -fov && projX > 0 && projX < width && projY > 0 && projY < height) {
            const alpha = Math.min(1, Math.max(0.1, (scale - 0.5) * 1.5));
            ctx.beginPath();
            ctx.arc(projX, projY, projSize, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = alpha * 0.85;
            ctx.fill();
            ctx.globalAlpha = 1.0;
          }
        });
      } catch {
        // Recover silently if context is lost
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      isDestroyed = true;
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className={`absolute inset-0 pointer-events-none w-full h-full overflow-hidden ${className}`}>
      {/* Fallback ambient glowing field for mobile & desktop */}
      <div className="absolute top-1/3 right-1/4 w-72 h-72 rounded-full bg-cyan-500/10 filter blur-3xl pointer-events-none animate-pulse" />
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 pointer-events-none w-full h-full hidden md:block" 
        style={{ zIndex: 1 }}
      />
    </div>
  );
}
