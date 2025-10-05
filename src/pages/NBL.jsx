// src/pages/NBL.jsx
import React, { useState, useRef, useEffect, useMemo, Suspense } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import {
  Play,
  Droplets,
  Users,
  Waves,
  Heart,
  Cpu,
  ExternalLink,
  Orbit as OrbitIcon,
  Anchor,
  Gamepad2,
} from "lucide-react";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html, useGLTF, Stars } from "@react-three/drei";
import * as THREE from "three";
import { Physics, useSphere, usePlane } from "@react-three/cannon";

/* -------------------------------------------------------------------------- */
/*                              Vite asset helper                             */
/* -------------------------------------------------------------------------- */
const asset = (p) => {
  const base = (import.meta?.env?.BASE_URL || "/").replace(/\/+$/, "");
  const path = p.startsWith("/") ? p : `/${p}`;
  return `${base}${path}`;
};

/* -------------------------------------------------------------------------- */
/*     3D SIMULATION — Astronaut in Water vs Space (Cannon.js physics)        */
/* -------------------------------------------------------------------------- */

/** Background: pool or stars (pool via safe TextureLoader) */
function SimBackground({ mode }) {
  const meshRef = useRef();
  const [tex, setTex] = useState(null);

  useEffect(() => {
    if (mode !== "WATER") return;
    const loader = new THREE.TextureLoader();
    const url = asset("/textures/pool.jpg");
    let isMounted = true;
    loader.load(
      url,
      (t) => {
        if (!isMounted) return;
        t.wrapS = t.wrapT = THREE.RepeatWrapping;
        t.repeat.set(8, 8);
        setTex(t);
      },
      undefined,
      () => {
        // Fallback: leave tex as null – we’ll just render a colored plane
        setTex(null);
      }
    );
    return () => {
      isMounted = false;
    };
  }, [mode]);

  if (mode === "WATER") {
    return (
      <mesh ref={meshRef} position={[0, -5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[200, 200]} />
        {tex ? (
          <meshStandardMaterial map={tex} color="#5ec1ff" />
        ) : (
          <meshStandardMaterial color="#0a4a7a" />
        )}
      </mesh>
    );
  }
  return <Stars radius={200} depth={60} count={8000} factor={4} fade />;
}

/** Floating bubbles in water mode */
function Bubbles({ count = 80 }) {
  const group = useRef();
  const speeds = useMemo(
    () => new Array(count).fill(0).map(() => 0.2 + Math.random() * 0.6),
    [count]
  );

  useFrame((_, dt) => {
    if (!group.current) return;
    for (let i = 0; i < count; i++) {
      const child = group.current.children[i];
      child.position.y += speeds[i] * dt * 4;
      if (child.position.y > 10) {
        child.position.y = -6 - Math.random() * 4;
        child.position.x = (Math.random() - 0.5) * 18;
        child.position.z = (Math.random() - 0.5) * 18;
      }
      child.rotation.y += 0.4 * dt;
    }
  });

  return (
    <group ref={group}>
      {new Array(count).fill(0).map((_, i) => (
        <mesh
          key={i}
          position={[
            (Math.random() - 0.5) * 18,
            -6 - Math.random() * 4,
            (Math.random() - 0.5) * 18,
          ]}
          scale={0.12 + Math.random() * 0.25}
        >
          <sphereGeometry args={[0.3, 12, 12]} />
          <meshStandardMaterial
            color="white"
            transparent
            opacity={0.25}
            roughness={0.2}
          />
        </mesh>
      ))}
    </group>
  );
}

function Ground({ y = -5 }) {
  usePlane(() => ({
    type: "Static",
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, y, 0],
  }));
  return null;
}

/** Astronaut model with physics */
function Astronaut({ mode }) {
  const { scene } = useGLTF(asset("/models/astronaut.glb")); // ✅ served from /public/models/astronaut.glb
  const [ref, api] = useSphere(() => ({
    args: [0.6],
    mass: 85,
    position: [0, 0.5, 0],
    linearDamping: mode === "WATER" ? 0.95 : 0.01,
    angularDamping: mode === "WATER" ? 0.9 : 0.01,
  }));

  useFrame(() => {
    if (mode === "WATER") {
      api.applyForce([0, 20, 0], [0, 0, 0]); // gentle buoyancy
    }
  });

  useEffect(() => {
    let keys = {};
    const onKeyDown = (e) => (keys[e.code] = true);
    const onKeyUp = (e) => (keys[e.code] = false);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    const thruster = setInterval(() => {
      if (mode !== "SPACE") return;
      const impulse = new THREE.Vector3();
      if (keys["KeyW"]) impulse.z -= 2.0;
      if (keys["KeyS"]) impulse.z += 2.0;
      if (keys["KeyA"]) impulse.x -= 2.0;
      if (keys["KeyD"]) impulse.x += 2.0;
      if (keys["KeyQ"]) impulse.y += 2.0;
      if (keys["KeyE"]) impulse.y -= 2.0;
      if (impulse.lengthSq() > 0) {
        api.applyImpulse([impulse.x, impulse.y, impulse.z], [0, 0, 0]);
      }
    }, 50);

    return () => {
      clearInterval(thruster);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [api, mode]);

  return (
    <group ref={ref}>
      {scene ? (
        <primitive object={scene} scale={0.6} rotation={[0, Math.PI, 0]} />
      ) : (
        <mesh>
          <capsuleGeometry args={[0.4, 0.9, 8, 16]} />
          <meshStandardMaterial color="white" />
        </mesh>
      )}
      <pointLight intensity={1} distance={6} color="#88ccff" />
    </group>
  );
}

function SimLights({ mode }) {
  return (
    <>
      <ambientLight intensity={mode === "WATER" ? 0.6 : 0.2} />
      <directionalLight
        position={[5, 10, 5]}
        intensity={mode === "WATER" ? 1.2 : 0.8}
        castShadow
      />
      <pointLight position={[-5, 3, -3]} intensity={0.25} />
    </>
  );
}

function NblSim({ mode }) {
  const gravity = useMemo(
    () => (mode === "WATER" ? [0, -0.6, 0] : [0, 0, 0]),
    [mode]
  );

  return (
    <div className="relative aspect-video rounded-lg overflow-hidden border border-border bg-black">
      <Canvas camera={{ position: [4, 2, 6], fov: 55 }}>
        <Suspense
          fallback={
            <Html center>
              <div style={{ color: "white" }}>Loading 3D…</div>
            </Html>
          }
        >
          <Physics gravity={gravity} iterations={15} broadphase="SAP">
            <SimLights mode={mode} />
            <SimBackground mode={mode} />
            {mode === "WATER" && <Ground y={-5} />}
            {mode === "WATER" && <Bubbles />}
            <Astronaut mode={mode} />
          </Physics>
          <OrbitControls enableDamping dampingFactor={0.05} />
        </Suspense>
      </Canvas>

      {/* On-canvas helper HUD */}
      <div className="pointer-events-none absolute bottom-3 left-3 text-xs text-white/80 bg-black/40 rounded px-2 py-1">
        {mode === "SPACE" ? (
          <div>Thrusters: W/A/S/D + Q/E — Orbit to look</div>
        ) : (
          <div>Neutral Buoyancy: bubbles + damping simulate water</div>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                     PAGE UI — layout + all original bits                   */
/* -------------------------------------------------------------------------- */

export function NBL() {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [mode, setMode] = useState("WATER"); // "WATER" | "SPACE"

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e) => {
    if (isDragging) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setPosition({
        x: Math.max(5, Math.min(95, x)),
        y: Math.max(5, Math.min(95, y)),
      });
    }
  };

  const comparisons = [
    { aspect: "Pressure", underwater: "1–2 atm", space: "Vacuum (0 atm)" },
    { aspect: "Movement", underwater: "Neutral buoyancy", space: "Weightless" },
    { aspect: "Duration", underwater: "6–7 hours", space: "6–8 hours EVA" },
    {
      aspect: "Visibility",
      underwater: "Water clarity limits",
      space: "Clear",
    },
    { aspect: "Temperature", underwater: "~30°C", space: "-157°C to 121°C" },
  ];

  const earthBenefits = [
    {
      icon: Cpu,
      title: "Underwater Robotics",
      description:
        "ROV control, buoyancy, and stability work inform offshore energy and deep-sea exploration.",
    },
    {
      icon: Heart,
      title: "Medical Simulation",
      description:
        "Checklists, haptics, and sim pedagogy advance surgical and emergency training.",
    },
    {
      icon: Users,
      title: "Team Coordination",
      description:
        "EVA comms & role clarity apply to disaster response and mission-critical operations.",
    },
  ];

  return (
    <div className="min-h-screen pt-24 pb-12">
      {/* Ensure keyframes for the 2D bubbles demo */}
      <style>{`
        @keyframes float {
          0%   { transform: translateY(0); opacity: 0; }
          20%  { opacity: 0.7; }
          100% { transform: translateY(-120%); opacity: 0; }
        }
      `}</style>

      {/* Hero */}
      <div
        className="relative h-[40vh] bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1533774121866-e73552547cfe?auto=format&fit=crop&w=1600&q=60')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a4a7a]/80 to-background" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white space-y-4 px-6">
            <Droplets className="h-16 w-16 mx-auto" />
            <h1 className="text-5xl">Neutral Buoyancy Laboratory</h1>
            <p className="text-xl max-w-2xl mx-auto">
              Train underwater to master spacewalks — then apply those lessons
              on Earth.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT — Video + 3D sim + 2D drag */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video card */}
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl">Astronaut Training Video</h2>
                <Button
                  size="sm"
                  className="bg-[#0B3D91] hover:bg-[#0B3D91]/90"
                  onClick={() =>
                    window.open(
                      "https://www.youtube.com/results?search_query=NASA+NBL+training",
                      "_blank",
                      "noopener,noreferrer"
                    )
                  }
                >
                  <Play className="h-4 w-4 mr-2" />
                  Watch Sessions
                </Button>
              </div>

              <div className="aspect-video bg-gradient-to-br from-[#0a4a7a] to-[#0B3D91] rounded-lg flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                  {[...Array(20)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-2 h-2 bg-white rounded-full"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        animation: `float ${
                          2 + Math.random() * 2
                        }s ease-in-out ${Math.random() * 2}s infinite`,
                      }}
                    />
                  ))}
                </div>
                <Button
                  size="lg"
                  className="relative z-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm border-2 border-white/40"
                  onClick={() =>
                    window.open(
                      "https://www.youtube.com/results?search_query=NASA+Neutral+Buoyancy+Laboratory",
                      "_blank",
                      "noopener,noreferrer"
                    )
                  }
                >
                  <Play className="h-8 w-8 mr-2" />
                  Play Training Video
                </Button>
              </div>

              <p className="text-sm text-muted-foreground">
                The NBL at Johnson Space Center holds 6.2 million gallons of
                water and houses full-scale ISS mockups. Divers help astronauts
                achieve neutral buoyancy for realistic EVA practice.
              </p>
            </Card>

            {/* 3D Sim (Cannon.js) */}
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl">
                  Interactive Microgravity Simulation (3D)
                </h2>
                <div className="flex items-center gap-2">
                  <Button
                    variant={mode === "WATER" ? "default" : "outline"}
                    onClick={() => setMode("WATER")}
                  >
                    <Anchor className="h-4 w-4 mr-2" />
                    Water / NBL
                  </Button>
                  <Button
                    variant={mode === "SPACE" ? "default" : "outline"}
                    onClick={() => setMode("SPACE")}
                  >
                    <OrbitIcon className="h-4 w-4 mr-2" />
                    Space / EVA
                  </Button>
                </div>
              </div>

              <NblSim mode={mode} />

              <ul className="text-xs text-muted-foreground space-y-1">
                <li>
                  <strong>WATER:</strong> High damping & gentle buoyancy; pool
                  plane + bubbles provide context.
                </li>
                <li>
                  <strong>SPACE:</strong> Zero gravity; use <b>W/A/S/D</b> +{" "}
                  <b>Q/E</b> for thruster impulses; Orbit mouse to look.
                </li>
              </ul>
            </Card>

            {/* Simple 2D Drag demo */}
            <Card className="p-6 space-y-4">
              <h2 className="text-2xl">Simple Drag Demo (2D)</h2>
              <p className="text-sm text-muted-foreground">
                Drag the astronaut icon to visualize controlled movement. In
                microgravity, small impulses lead to continued motion without
                friction.
              </p>

              <div
                className="relative aspect-video bg-gradient-to-br from-[#0a4a7a]/20 to-[#0B3D91]/20 rounded-lg border-2 border-dashed border-border overflow-hidden cursor-move"
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
                  Drag the astronaut to simulate movement
                </div>

                <div
                  className="absolute w-16 h-16 cursor-grab active:cursor-grabbing transition-transform hover:scale-110"
                  style={{
                    left: `${position.x}%`,
                    top: `${position.y}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                  onMouseDown={handleMouseDown}
                >
                  <Users className="w-full h-full text-[#0B3D91] drop-shadow-lg" />
                </div>

                {[...Array(15)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-3 h-3 bg-white/30 rounded-full"
                    style={{
                      left: `${Math.random() * 100}%`,
                      bottom: "-10%",
                      animation: `float ${5 + Math.random() * 5}s ease-in-out ${
                        Math.random() * 3
                      }s infinite`,
                    }}
                  />
                ))}
              </div>
            </Card>
          </div>

          {/* RIGHT — Info + Comparison + Play Game */}
          <div className="space-y-6">
            <Card className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Waves className="h-5 w-5 text-[#0B3D91]" />
                <h3 className="text-xl">About the NBL</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                NASA’s Neutral Buoyancy Laboratory simulates the weightless
                environment using neutral buoyancy in a massive pool with ISS
                mockups. Divers assist astronauts, and suits are weighted to
                float neither up nor down.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Pool Depth</span>
                  <span>40 ft (12.2 m)</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Water Volume</span>
                  <span>6.2 million gallons</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Location</span>
                  <span>Houston, TX (JSC)</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">
                    Training Duration
                  </span>
                  <span>6–7 hours typical</span>
                </div>
              </div>
            </Card>

            <Card className="p-6 space-y-4">
              <h3 className="text-xl">Underwater vs. Space</h3>
              <div className="space-y-2 text-sm">
                {comparisons.map((item, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-3 gap-2 py-2 border-b border-border last:border-0"
                  >
                    <span className="font-semibold">{item.aspect}</span>
                    <span className="text-muted-foreground text-xs">
                      {item.underwater}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {item.space}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            {/* 🎮 Play the external Weightless Wonders game */}
            <Card className="p-6 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xl">Weightless Wonders Game</h3>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    window.open(
                      "https://monaelel.github.io/Weightless-Wonders-game/",
                      "_blank",
                      "noopener,noreferrer"
                    )
                  }
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Play Game
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Explore weightlessness and orbital motion in a playful browser
                game.
              </p>
              <Button
                variant="secondary"
                className="w-full"
                onClick={() =>
                  window.open(
                    "https://monaelel.github.io/Weightless-Wonders-game/",
                    "_blank",
                    "noopener,noreferrer"
                  )
                }
              >
                <Gamepad2 className="h-4 w-4 mr-2" />
                Launch Game
              </Button>
            </Card>
          </div>
        </div>

        {/* Earth Benefits */}
        <div className="mt-12 space-y-6">
          <div className="text-center">
            <h2 className="text-3xl">How NBL Research Benefits Earth</h2>
            <p className="text-muted-foreground mt-2">
              Techniques from astronaut training improve robotics, medicine, and
              teamwork.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {earthBenefits.map((benefit) => (
              <Card
                key={benefit.title}
                className="p-6 space-y-4 hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 rounded-lg bg-[#0B3D91]/10 flex items-center justify-center">
                  <benefit.icon className="h-6 w-6 text-[#0B3D91]" />
                </div>
                <h3 className="text-xl">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {benefit.description}
                </p>
              </Card>
            ))}
          </div>
          ``
        </div>
      </div>
    </div>
  );
}

/* drei caches by URL; safe to preload when the asset exists in /public */
useGLTF.preload(asset("/models/astronaut.glb"));
