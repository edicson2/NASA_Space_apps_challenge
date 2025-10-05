import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import EnhancedRotatingGlobe from "../components/EnhancedRotatingGlobe";
import AnimatedSpaceBackground from "../components/AnimatedSpaceBackground";

interface HomeProps {
  onNavigate: (page: string) => void;
}

export function Home({ onNavigate }: HomeProps) {
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
      {/* Animated Space Background */}
      <AnimatedSpaceBackground />
      {/* Background with parallax effect */}
      <div
        className="absolute inset-0 transition-transform duration-300 ease-out"
        style={{
          transform: `translate(${mousePosition.x}px, ${mousePosition.y}px) scale(1.05)`,
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
          <EnhancedRotatingGlobe />
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
              className="bg-[#0B3D91] hover:bg-[#0B3D91]/90 text-white px-8 py-6 shadow-2xl transition-all hover:scale-105 border-2 border-white/20"
            >
              Explore the Cupola
            </Button>
            <Button
              size="lg"
              onClick={() => onNavigate("nbl")}
              className="bg-[#0B3D91] hover:bg-[#0B3D91]/90 text-white px-8 py-6 shadow-2xl transition-all hover:scale-105 border-2 border-white/20"
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
    </div>
  );
}
