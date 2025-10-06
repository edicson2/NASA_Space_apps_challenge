import React, { useEffect, useRef, ReactNode } from "react";
import SplashCursor from "./SplashCursor";

interface EnhancedSplashCursorWrapperProps {
  children: ReactNode;
  trailColors?: string[];
  splashColors?: string[];
  zIndex?: number;
}

export default function EnhancedSplashCursorWrapper({
  children,
  trailColors,
  splashColors,
  zIndex = 50,
}: EnhancedSplashCursorWrapperProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);

  interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    maxLife: number;
    size: number;
    color: string;
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    // Sizing with device pixel ratio
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = window.innerWidth;
      const height = window.innerHeight;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    // NASA Space-themed color palette - subtle yet visible
    const defaultSplash = [
      "#6B9BD1", // Soft space blue
      "#A8C5E6", // Light stellar blue
      "#E8F1F8", // Whisper white-blue
      "#94B8D6", // Calm nebula blue
      "#7BA8CC", // Gentle cosmic blue
    ];
    const colors =
      Array.isArray(splashColors) && splashColors.length > 0
        ? splashColors
        : defaultSplash;

    // Create subtle splash effect
    const createSplash = (x: number, y: number) => {
      const particleCount = 12; // Reduced for subtlety
      const baseSpeed = 2.5; // Slower, gentler movement

      for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount;
        const speedVariation = 0.6 + Math.random() * 0.4;
        const speed = baseSpeed * speedVariation;

        particlesRef.current.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          maxLife: 1,
          size: Math.random() * 2 + 1.5, // Smaller particles
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
    };

    const handleClick = (e: MouseEvent) => {
      createSplash(e.clientX, e.clientY);
    };

    window.addEventListener("click", handleClick);

    // Optimized animation loop
    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      rafRef.current = requestAnimationFrame(animate);

      const deltaTime = Math.min((currentTime - lastTime) / 16.67, 2);
      lastTime = currentTime;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const particles = particlesRef.current;

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        // Smoother physics
        p.x += p.vx * deltaTime;
        p.y += p.vy * deltaTime;
        p.vx *= 0.96; // Slightly faster decay for subtlety
        p.vy *= 0.96;
        p.vy += 0.03 * deltaTime; // Gentler gravity
        p.life -= 0.012 * deltaTime; // Slightly longer life

        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        const lifeFactor = p.life / p.maxLife;
        const opacity = Math.pow(lifeFactor, 1.2) * 0.7; // More subtle opacity

        const radius = p.size * lifeFactor;

        // Softer glow
        ctx.shadowBlur = 12 * lifeFactor;
        ctx.shadowColor = p.color;

        // Main particle
        ctx.globalAlpha = opacity;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fill();

        // Subtle inner core
        ctx.shadowBlur = 0;
        ctx.globalAlpha = opacity * 0.4;
        ctx.fillStyle = "#E8F1F8";
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius * 0.3, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("click", handleClick);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      particlesRef.current = [];
    };
  }, [splashColors]);

  return (
    <>
      {/* Fluid cursor trail - NASA themed */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex,
          isolation: "isolate",
        }}
      >
        <SplashCursor
          BACK_COLOR={{ r: 0.01, g: 0.02, b: 0.05 }} // Deep space black
          COLOR_PALETTE={[
            { r: 0.42, g: 0.61, b: 0.82 }, // NASA blue tones
            { r: 0.58, g: 0.73, b: 0.85 },
            { r: 0.51, g: 0.25, b: 0.5 }, // Subtle white
            { r: 0.48, g: 0.66, b: 0.8 },
          ]}
          TRANSPARENT={true}
          DENSITY_DISSIPATION={3} // Faster dissipation for subtlety
          VELOCITY_DISSIPATION={2.5} // Smoother trail fade
          SPLAT_RADIUS={0.12} // Smaller, more controlled
          SPLAT_FORCE={2500} // Gentler force
        />
      </div>

      {/* Click splash particles */}
      <canvas
        ref={canvasRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          zIndex: zIndex + 1,
          mixBlendMode: "screen",
          pointerEvents: "none",
          isolation: "isolate",
        }}
      />

      {/* App content */}
      {children}
    </>
  );
}
