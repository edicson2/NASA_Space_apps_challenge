import React, { useEffect, useRef } from "react";

type CursorTrailProps = {
  color?: string;
  size?: number; // base particle size
  decay?: number; // particle fade speed
  maxParticles?: number;
};

export default function CursorTrail({
  color = "rgba(255,255,255,0.85)",
  size = 24,
  decay = 0.02,
  maxParticles = 60,
}: CursorTrailProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<
    { x: number; y: number; r: number; life: number; dx: number; dy: number }[]
  >([]);
  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    let raf = 0;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.ceil(canvas.clientWidth * dpr);
      canvas.height = Math.ceil(canvas.clientHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      // push new particle
      particlesRef.current.push({
        x,
        y,
        r: size * (0.6 + Math.random() * 0.8),
        life: 1,
        dx: (Math.random() - 0.5) * 0.8,
        dy: (Math.random() - 0.5) * 0.8,
      });
      // trim
      if (particlesRef.current.length > maxParticles) {
        particlesRef.current.splice(
          0,
          particlesRef.current.length - maxParticles
        );
      }
    };

    window.addEventListener("mousemove", onMove);

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const p = particlesRef.current;
      for (let i = 0; i < p.length; i++) {
        const part = p[i];
        part.life -= decay;
        part.x += part.dx;
        part.y += part.dy;
        const alpha = Math.max(0, part.life);
        const gradient = ctx.createRadialGradient(
          part.x,
          part.y,
          0,
          part.x,
          part.y,
          part.r
        );
        gradient.addColorStop(
          0,
          color.replace(")", `, ${alpha})`).replace("rgb", "rgba")
        );
        gradient.addColorStop(1, `rgba(255,255,255,0)`);
        ctx.fillStyle = gradient as unknown as string;
        ctx.beginPath();
        ctx.arc(
          part.x,
          part.y,
          part.r * (0.6 + Math.random() * 0.4),
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
      // remove dead
      particlesRef.current = particlesRef.current.filter((q) => q.life > 0);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
    };
  }, [size, decay, color, maxParticles]);

  // overlay canvas positioned absolutely to fill parent
  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 30,
      }}
    />
  );
}
