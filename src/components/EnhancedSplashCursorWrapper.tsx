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
      const dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap at 2 for performance
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

    // Color palette
    const defaultSplash = [
      "#4a9eff",
      "#7bb3ff",
      "#a8d0ff",
      "#ffffff",
      "#00d9ff",
    ];
    const colors =
      Array.isArray(splashColors) && splashColors.length > 0
        ? splashColors
        : defaultSplash;

    // Create splash effect
    const createSplash = (x: number, y: number) => {
      const particleCount = 20;
      const baseSpeed = 4;

      for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount;
        const speedVariation = 0.5 + Math.random() * 0.5;
        const speed = baseSpeed * speedVariation;

        particlesRef.current.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          maxLife: 1,
          size: Math.random() * 3 + 2,
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

      // Delta time for frame-rate independent animation
      const deltaTime = Math.min((currentTime - lastTime) / 16.67, 2); // Cap to prevent large jumps
      lastTime = currentTime;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const particles = particlesRef.current;

      // Update and draw particles in a single loop
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        // Physics update with delta time
        p.x += p.vx * deltaTime;
        p.y += p.vy * deltaTime;
        p.vx *= 0.98;
        p.vy *= 0.98;
        p.vy += 0.05 * deltaTime; // Subtle gravity
        p.life -= 0.015 * deltaTime;

        // Remove dead particles
        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        // Calculate opacity with easing
        const lifeFactor = p.life / p.maxLife;
        const opacity = Math.pow(lifeFactor, 0.8); // Ease out

        // Draw particle with glow
        const radius = p.size * lifeFactor;

        // Outer glow
        ctx.shadowBlur = 20 * lifeFactor;
        ctx.shadowColor = p.color;

        // Main particle
        ctx.globalAlpha = opacity;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fill();

        // Inner bright core
        ctx.shadowBlur = 0;
        ctx.globalAlpha = opacity * 0.6;
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius * 0.4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Reset context state
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
    };

    // Start animation
    rafRef.current = requestAnimationFrame(animate);

    // Cleanup
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
      {/* Fluid cursor trail */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex,
          isolation: "isolate", // Create stacking context
        }}
      >
        <SplashCursor
          BACK_COLOR={{ r: 0.04, g: 0.07, b: 0.16 }}
          COLOR_PALETTE={[
            { r: 0.3, g: 0.6, b: 1.0 },
            { r: 0.5, g: 0.8, b: 1.0 },
            { r: 1.0, g: 1.0, b: 1.0 },
            { r: 0.0, g: 0.8, b: 1.0 },
          ]}
          TRANSPARENT={true}
          DENSITY_DISSIPATION={2}
          VELOCITY_DISSIPATION={1.5}
          SPLAT_RADIUS={0.15}
          SPLAT_FORCE={4000}
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
