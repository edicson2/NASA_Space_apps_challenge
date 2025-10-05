import { useEffect, useRef, ReactNode } from "react";

interface SplashCursorWrapperProps {
  children: ReactNode;
}

export default function SplashCursorWrapper({
  children,
}: SplashCursorWrapperProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

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

    const particles: Particle[] = [];
    const colors = ["#4a9eff", "#7bb3ff", "#a8d0ff", "#ffffff", "#00d9ff"];

    const createSplash = (x: number, y: number) => {
      const particleCount = 15;
      for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount;
        const speed = Math.random() * 3 + 2;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          maxLife: 1,
          size: Math.random() * 4 + 2,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
    };

    const handleClick = (e: MouseEvent) => {
      createSplash(e.clientX, e.clientY);
    };

    window.addEventListener("click", handleClick);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        // Update particle
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.98; // Friction
        p.vy *= 0.98;
        p.life -= 0.02;

        // Remove dead particles
        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        // Draw particle with glow effect
        const opacity = p.life;

        // Outer glow
        ctx.shadowBlur = 15;
        ctx.shadowColor = p.color;

        // Main particle
        ctx.fillStyle = p.color;
        ctx.globalAlpha = opacity;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();

        // Inner bright spot
        ctx.fillStyle = "#ffffff";
        ctx.globalAlpha = opacity * 0.5;
        ctx.beginPath();
        ctx.arc(p.x, p.y, (p.size * p.life) / 2, 0, Math.PI * 2);
        ctx.fill();

        // Reset shadow
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      }

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("click", handleClick);
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-50"
        style={{ mixBlendMode: "screen" }}
      />
      {children}
    </>
  );
}
