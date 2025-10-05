// import React, { useEffect, useRef } from "react";

// type GlobeProps = {
//   src: string; // globe image path (jpg/png)
//   width?: number; // CSS width or undefined to be responsive
//   height?: number;
//   pointerInfluence?: number; // how strongly mouse moves affect rotation
//   autoSpeed?: number; // slow automatic spin (deg/sec)
// };

// export default function Globe({
//   src,
//   width = undefined,
//   height = undefined,
//   pointerInfluence = 0.08,
//   autoSpeed = 2 / 60, // degrees per frame ~ very slow
// }: GlobeProps) {
//   const containerRef = useRef<HTMLDivElement | null>(null);
//   const imgRef = useRef<HTMLImageElement | null>(null);

//   // rotation state (in degrees)
//   const rotRef = useRef({ x: 0, y: 0, vx: 0, vy: 0 });

//   useEffect(() => {
//     let raf = 0;
//     let last = performance.now();
//     let mouseX = 0;
//     let mouseY = 0;
//     const rect = () => containerRef.current?.getBoundingClientRect();

//     const onMove = (e: MouseEvent) => {
//       const r = rect();
//       if (!r) return;
//       // normalized -0.5..0.5
//       mouseX = (e.clientX - (r.left + r.width / 2)) / r.width;
//       mouseY = (e.clientY - (r.top + r.height / 2)) / r.height;
//     };

//     window.addEventListener("mousemove", onMove);

//     const loop = (now: number) => {
//       const dt = Math.min(32, now - last) / 1000;
//       last = now;

//       // pointer target velocities (degrees per second)
//       const targetVy = mouseX * 60 * pointerInfluence; // yaw (y axis)
//       const targetVx = -mouseY * 30 * pointerInfluence; // pitch (x axis)

//       // simple damping to smooth turning
//       rotRef.current.vy += (targetVy - rotRef.current.vy) * 0.08;
//       rotRef.current.vx += (targetVx - rotRef.current.vx) * 0.08;

//       // add auto spin (small)
//       rotRef.current.vy += autoSpeed * 360 * dt; // autoSpeed is in revolutions/sec fraction

//       // integrate
//       rotRef.current.y += rotRef.current.vy * dt;
//       rotRef.current.x += rotRef.current.vx * dt;

//       // clamp x (pitch) so it doesn't flip
//       rotRef.current.x = Math.max(-30, Math.min(30, rotRef.current.x));

//       if (imgRef.current) {
//         imgRef.current.style.transform = `rotateX(${rotRef.current.x}deg) rotateZ(${rotRef.current.y}deg)`;
//       }

//       raf = requestAnimationFrame(loop);
//     };
//     raf = requestAnimationFrame(loop);

//     return () => {
//       cancelAnimationFrame(raf);
//       window.removeEventListener("mousemove", onMove);
//     };
//   }, [pointerInfluence, autoSpeed]);

//   return (
//     <div
//       ref={containerRef}
//       style={{
//         width: width ?? "100%",
//         height: height ?? "100%",
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         perspective: 900,
//         overflow: "hidden",
//       }}
//     >
//       <img
//         ref={imgRef}
//         src={src}
//         alt="Globe"
//         draggable={false}
//         style={{
//           width: "70%", // tune: 70% of container width; adjust if you want bigger
//           maxWidth: 900,
//           height: "auto",
//           transformStyle: "preserve-3d",
//           transition: "filter 200ms ease",
//           willChange: "transform",
//           userSelect: "none",
//           pointerEvents: "none",
//         }}
//       />
//     </div>
//   );
// }

import { useState, useEffect, useRef } from "react";
import nasaGlobe from "../assets/images/nasaGlobe.jpg";

// Globe Component
type GlobeProps = {
  src: string;
  width?: number;
  height?: number;
  pointerInfluence?: number;
  autoSpeed?: number;
};

function Globe({
  src,
  width = undefined,
  height = undefined,
  pointerInfluence = 0.08,
  autoSpeed = 2 / 60,
}: GlobeProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const rotRef = useRef({ x: 0, y: 0, vx: 0, vy: 0 });

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let mouseX = 0;
    let mouseY = 0;
    const rect = () => containerRef.current?.getBoundingClientRect();

    const onMove = (e: MouseEvent) => {
      const r = rect();
      if (!r) return;
      mouseX = (e.clientX - (r.left + r.width / 2)) / r.width;
      mouseY = (e.clientY - (r.top + r.height / 2)) / r.height;
    };

    window.addEventListener("mousemove", onMove);

    const loop = (now: number) => {
      const dt = Math.min(32, now - last) / 1000;
      last = now;

      const targetVy = mouseX * 60 * pointerInfluence;
      const targetVx = -mouseY * 30 * pointerInfluence;

      rotRef.current.vy += (targetVy - rotRef.current.vy) * 0.08;
      rotRef.current.vx += (targetVx - rotRef.current.vx) * 0.08;
      rotRef.current.vy += autoSpeed * 360 * dt;

      rotRef.current.y += rotRef.current.vy * dt;
      rotRef.current.x += rotRef.current.vx * dt;
      rotRef.current.x = Math.max(-30, Math.min(30, rotRef.current.x));

      if (imgRef.current) {
        imgRef.current.style.transform = `rotateX(${rotRef.current.x}deg) rotateZ(${rotRef.current.y}deg)`;
      }

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
    };
  }, [pointerInfluence, autoSpeed]);

  return (
    <div
      ref={containerRef}
      style={{
        width: width ?? "100%",
        height: height ?? "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        perspective: 900,
        overflow: "hidden",
      }}
    >
      <img
        ref={imgRef}
        src={src}
        alt="Globe"
        draggable={false}
        style={{
          width: "70%",
          maxWidth: 900,
          height: "auto",
          transformStyle: "preserve-3d",
          transition: "filter 200ms ease",
          willChange: "transform",
          userSelect: "none",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

// SplashCursor Component (placeholder)
function SplashCursor() {
  return null;
}

// Button Component (placeholder)
function Button({
  children,
  onClick,
  size,
  className,
}: {
  children: React.ReactNode;
  onClick: () => void;
  size?: string;
  className?: string;
}) {
  return (
    <button onClick={onClick} className={className}>
      {children}
    </button>
  );
}

interface HomeProps {
  onNavigate: (page: string) => void;
}

export default function Home({ onNavigate }: HomeProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      setMousePosition({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#0a1128]">
      <SplashCursor />

      {/* Background with parallax effect */}
      <div
        className="absolute inset-0 transition-transform duration-300 ease-out"
        style={{
          transform: `translate(${mousePosition.x}px, ${mousePosition.y}px) scale(1.1)`,
        }}
      >
        {/* Globe Container */}
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
          <Globe src={nasaGlobe} pointerInfluence={0.12} autoSpeed={3 / 60} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a1128]/70 via-[#0a1128]/50 to-[#0a1128]/80" />
      </div>

      {/* NASA 25th Anniversary Badge - Top Right */}
      <div className="absolute top-24 right-8 z-20">
        <div className="relative">
          <div className="flex flex-col items-center gap-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-6 py-4">
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-[#FF0000] flex items-center justify-center">
                <svg
                  className="w-8 h-8"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                    fill="white"
                  />
                </svg>
              </div>
              <div className="text-white">
                <div className="text-xs opacity-90">NASA</div>
                <div className="font-semibold">25th Anniversary</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-center pt-20">
        <div className="max-w-4xl mx-auto space-y-8">
          <h1
            className="text-6xl md:text-7xl lg:text-8xl tracking-tight text-white drop-shadow-2xl"
            style={{
              fontFamily: "Inter, system-ui, sans-serif",
              fontWeight: 700,
            }}
          >
            Window to the World
          </h1>

          <p
            className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto drop-shadow-lg"
            style={{
              fontFamily: "Inter, system-ui, sans-serif",
              fontWeight: 300,
            }}
          >
            Experience sight and weightlessness aboard the ISS.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
            <Button
              size="lg"
              onClick={() => onNavigate("cupola")}
              className="bg-[#0B3D91] hover:bg-[#0B3D91]/90 text-white px-8 py-6 shadow-2xl transition-all hover:scale-105 border-2 border-white/20 rounded-lg cursor-pointer"
            >
              Explore the Cupola
            </Button>
            <Button
              size="lg"
              onClick={() => onNavigate("nbl")}
              className="bg-[#0B3D91] hover:bg-[#0B3D91]/90 text-white px-8 py-6 shadow-2xl transition-all hover:scale-105 border-2 border-white/20 rounded-lg cursor-pointer"
            >
              Dive into the NBL
            </Button>
          </div>

          <div className="pt-12 max-w-2xl mx-auto">
            <p
              className="text-white/80 leading-relaxed"
              style={{ fontFamily: "Inter, system-ui, sans-serif" }}
            >
              Embark on an immersive journey through the International Space
              Station's most iconic window and explore the Neutral Buoyancy
              Laboratory where astronauts train for their missions. Discover the
              wonders of space exploration through cutting-edge educational
              experiences.
            </p>
          </div>
        </div>
      </div>

      {/* Subtle stars decoration */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-60 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
