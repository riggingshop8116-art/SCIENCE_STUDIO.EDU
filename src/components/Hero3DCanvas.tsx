import React, { useEffect, useRef } from 'react';

interface Hero3DCanvasProps {
  className?: string;
}

export default function Hero3DCanvas({ className = '' }: Hero3DCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 600);

    const handleResize = () => {
      if (!canvas) return;
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
      const rect = canvas.getBoundingClientRect();
      targetMouseX = ((e.clientX - rect.left) / width - 0.5) * 2;
      targetMouseY = ((e.clientY - rect.top) / height - 0.5) * 2;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // 3D Particles
    const particleCount = 65;
    const particles: {
      x: number;
      y: number;
      z: number;
      baseX: number;
      baseY: number;
      baseZ: number;
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
        baseX: x,
        baseY: y,
        baseZ: z,
        size: 1.5 + Math.random() * 2.5,
        color: colors[i % colors.length],
        speed: 0.003 + Math.random() * 0.007,
        pulse: Math.random() * Math.PI * 2,
      });
    }

    // 3D Rings for Atom / Quantum Orbits
    const rings = [
      { radiusX: 180, radiusY: 70, tiltX: 0.9, tiltY: 0.4, speed: 0.012, angle: 0, color: 'rgba(34, 211, 238, 0.45)', electronPos: 0 },
      { radiusX: 210, radiusY: 80, tiltX: -0.8, tiltY: 0.6, speed: -0.015, angle: 1.2, color: 'rgba(56, 189, 248, 0.4)', electronPos: 2.1 },
      { radiusX: 240, radiusY: 90, tiltX: 0.3, tiltY: -0.9, speed: 0.01, angle: 2.4, color: 'rgba(52, 211, 153, 0.35)', electronPos: 4.2 },
      { radiusX: 160, radiusY: 60, tiltX: -0.5, tiltY: -0.7, speed: -0.018, angle: 3.6, color: 'rgba(245, 158, 11, 0.35)', electronPos: 1.5 },
    ];

    let globalRotation = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse parallax
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      globalRotation += 0.008;

      const fov = 450;
      const centerX = width * 0.72; // Center 3D visual towards right side of container
      const centerY = height * 0.5;

      // 1. Draw glowing 3D Nucleus in center
      const nucleusPulse = Math.sin(globalRotation * 2) * 4;
      const nucleusRad = 22 + nucleusPulse;
      
      const grad = ctx.createRadialGradient(centerX, centerY, 2, centerX, centerY, nucleusRad * 2.5);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
      grad.addColorStop(0.2, 'rgba(34, 211, 238, 0.8)');
      grad.addColorStop(0.5, 'rgba(14, 165, 233, 0.4)');
      grad.addColorStop(1, 'rgba(14, 165, 233, 0)');
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, nucleusRad * 2.5, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      // 2. Draw 3D Rings & Orbiting Electrons
      rings.forEach((ring) => {
        ring.angle += ring.speed;
        ring.electronPos += Math.abs(ring.speed) * 1.6;

        ctx.save();
        ctx.translate(centerX, centerY);
        
        // Apply 3D rotation & parallax
        const rotY = globalRotation * 0.5 + mouseX * 0.4;
        const rotX = mouseY * 0.4;

        ctx.strokeStyle = ring.color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();

        const ringPoints: { x: number; y: number; z: number }[] = [];
        const segments = 64;

        for (let s = 0; s <= segments; s++) {
          const theta = (s / segments) * Math.PI * 2;
          
          let rx = Math.cos(theta) * ring.radiusX;
          let ry = Math.sin(theta) * ring.radiusY;
          let rz = 0;

          // Apply ring tilt
          const y1 = ry * Math.cos(ring.tiltX) - rz * Math.sin(ring.tiltX);
          const z1 = ry * Math.sin(ring.tiltX) + rz * Math.cos(ring.tiltX);
          const x1 = rx * Math.cos(ring.tiltY) + z1 * Math.sin(ring.tiltY);
          const z2 = -rx * Math.sin(ring.tiltY) + z1 * Math.cos(ring.tiltY);

          // Apply global rot
          const x2 = x1 * Math.cos(rotY) - z2 * Math.sin(rotY);
          const z3 = x1 * Math.sin(rotY) + z2 * Math.cos(rotY);
          const y3 = y1 * Math.cos(rotX) - z3 * Math.sin(rotX);
          const zFinal = y1 * Math.sin(rotX) + z3 * Math.cos(rotX);

          const scale = fov / (fov + zFinal);
          const projX = x2 * scale;
          const projY = y3 * scale;

          ringPoints.push({ x: projX, y: projY, z: zFinal });

          if (s === 0) {
            ctx.moveTo(projX, projY);
          } else {
            ctx.lineTo(projX, projY);
          }
        }
        ctx.stroke();

        // Draw Electron on this ring
        const eIndex = Math.floor(((ring.electronPos % (Math.PI * 2)) / (Math.PI * 2)) * ringPoints.length) % ringPoints.length;
        const electron = ringPoints[eIndex];
        if (electron) {
          const eSize = Math.max(2, 5 * (fov / (fov + electron.z)));
          ctx.beginPath();
          ctx.arc(electron.x, electron.y, eSize, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 12;
          ctx.fill();
          ctx.shadowBlur = 0;
        }

        ctx.restore();
      });

      // 3. Draw 3D Floating Particles
      particles.forEach((p) => {
        p.pulse += 0.04;
        
        // 3D rotation math
        const cosY = Math.cos(globalRotation * 0.3 + mouseX * 0.3);
        const sinY = Math.sin(globalRotation * 0.3 + mouseX * 0.3);
        const cosX = Math.cos(mouseY * 0.3);
        const sinX = Math.sin(mouseY * 0.3);

        const x1 = p.baseX * cosY - p.baseZ * sinY;
        const z1 = p.baseX * sinY + p.baseZ * cosY;
        const y1 = p.baseY * cosX - z1 * sinX;
        const z2 = p.baseY * sinX + z1 * cosX;

        const scale = fov / (fov + z2);
        const projX = centerX + x1 * scale;
        const projY = centerY + y1 * scale;
        const projSize = Math.max(0.5, p.size * scale * (0.8 + Math.sin(p.pulse) * 0.2));

        if (z2 > -fov && projX > 0 && projX < width && projY > 0 && projY < height) {
          const alpha = Math.min(1, Math.max(0.1, (scale - 0.5) * 1.5));
          ctx.beginPath();
          ctx.arc(projX, projY, projSize, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = alpha * 0.7;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.globalAlpha = 1.0;
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className={`absolute inset-0 pointer-events-none w-full h-full ${className}`} 
      style={{ zIndex: 1 }}
    />
  );
}
