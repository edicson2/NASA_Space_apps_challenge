// CupolaScene.jsx
import React, { useRef, useState, useEffect, Suspense, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  PointerLockControls,
  useGLTF,
  Html,
} from "@react-three/drei";
import * as THREE from "three";

import SpyglassMap from "../components/spyglassFiles/spyglassMap/SpyglassMap";

/** ---------------------------
 * Shader-based Starfield (full background)
 * --------------------------- */
function StarfieldBackground() {
  const meshRef = useRef();

  const material = useMemo(() => {
    const vertex = `
      varying vec3 vWorldPosition;
      void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * viewMatrix * worldPosition;
      }
    `;
    const fragment = `
      precision highp float;
      varying vec3 vWorldPosition;
      uniform float uTime;

      float hash(vec3 p) { return fract(sin(dot(p, vec3(127.1,311.7, 74.7))) * 43758.5453123); }
      float noise(vec3 p){
        vec3 i = floor(p); 
        vec3 f = fract(p);
        float n = mix(
          mix(mix(hash(i + vec3(0,0,0)), hash(i + vec3(1,0,0)), f.x),
              mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
          mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
              mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z
        );
        return n;
      }
      void main() {
        vec3 dir = normalize(vWorldPosition);

        float density = 150.0;
        float n = noise(dir * density);
        float stars = smoothstep(0.995, 1.0, n);

        float twinkle = 0.5 + 0.5 * sin(uTime + n * 50.0);
        float brightness = stars * (0.7 + 0.3 * twinkle);

        float glow = pow(noise(dir * 4.0), 3.0) * 0.15;

        vec3 col = vec3(glow) + vec3(brightness);
        gl_FragColor = vec4(col, 1.0);
      }
    `;
    const uniforms = { uTime: { value: 0 } };
    return new THREE.ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      uniforms,
      side: THREE.BackSide,
      depthWrite: false,
      transparent: true, // ✅ keep stars blending
    });
  }, []);

  useFrame((_, dt) => {
    if (material) material.uniforms.uTime.value += dt * 0.6;
    if (meshRef.current) meshRef.current.rotation.y += dt * 0.002;
  });

  return (
    <mesh ref={meshRef} renderOrder={-1}>
      <sphereGeometry args={[2000, 64, 64]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}

/** ---------------------------
 * Cupola Model (GLB)
 * --------------------------- */
const CupolaModel = () => {
  const group = useRef(null);

  // ✅ Vite-safe path
  const gltfPath = `${import.meta.env.BASE_URL}cupola_2/scene.glb`;
  const { scene } = useGLTF(gltfPath);

  useEffect(() => {
    if (scene && group.current) {
      const modelClone = scene.clone(true);

      modelClone.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          const mat = (
            child.material || new THREE.MeshStandardMaterial()
          ).clone();
          mat.side = THREE.DoubleSide;
          mat.transparent = true;

          const nm = (child.name || "").toLowerCase();
          const mm = (mat.name || "").toLowerCase();
          const looksLikeGlass =
            nm.includes("glass") ||
            nm.includes("window") ||
            mm.includes("glass") ||
            mm.includes("window");

          if (looksLikeGlass) {
            mat.opacity = 0.25;
            mat.depthWrite = false;
            mat.ior = 1.2;
            mat.metalness = 0.0;
            mat.roughness = 0.1;
          } else {
            mat.opacity = 1.0;
            mat.metalness = 0.1;
            mat.roughness = 0.7;
          }
          child.material = mat;
        }
      });

      // Clear old model and add new one
      while (group.current.children.length > 0) {
        group.current.remove(group.current.children[0]);
      }

      modelClone.rotation.x = Math.PI;
      modelClone.scale.setScalar(0.9); // 🔽 10% smaller Cupola

      group.current.add(modelClone);
    }
  }, [scene]);

  return <group ref={group} />;
};

/** ---------------------------
 * Lights
 * --------------------------- */
function Lights() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[20, 20, 20]}
        intensity={2.0}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[-20, -10, -20]} intensity={0.4} />
    </>
  );
}

/** ---------------------------
 * Earth
 * --------------------------- */
/** ---------------------------
 * Earth
 * --------------------------- */
function Earth({ onHover, onClick }) {
  const earthTex = useMemo(() =>
    new THREE.TextureLoader().load(`${import.meta.env.BASE_URL}maps/Earth-1440x720.jpg`), []
  );
  const cloudsTex = useMemo(() =>
    new THREE.TextureLoader().load(`${import.meta.env.BASE_URL}maps/flat_earth_still_clouds.jpg`), []
  );

  const earthRef = useRef();
  const cloudRef = useRef();
  const EARTH_Z = -400;
  const EARTH_R = 200;

  const { camera, gl } = useThree();

  useFrame((_, dt) => {
    if (earthRef.current) earthRef.current.rotation.y += dt * 0.01;
    if (cloudRef.current) cloudRef.current.rotation.y += dt * 0.015;
  });

  useEffect(() => {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleMove = (event) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      if (earthRef.current) {
        earthRef.current.updateMatrixWorld(true);
        const intersects = raycaster.intersectObject(earthRef.current, true);
        if (intersects.length > 0) {
          const p = intersects[0].point.clone().sub(new THREE.Vector3(0, 0, EARTH_Z)).normalize();
          const lat = Math.asin(p.y) * (180 / Math.PI);
          const lon = Math.atan2(p.z, p.x) * (180 / Math.PI);
          onHover({
            lat: lat.toFixed(2),
            lon: lon.toFixed(2),
            x: event.clientX,
            y: event.clientY,
          });
        } else {
          onHover(null);
        }
      }
    };

    const handleClick = (event) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      if (earthRef.current) {
        earthRef.current.updateMatrixWorld(true);
        const intersects = raycaster.intersectObject(earthRef.current, true);
        if (intersects.length > 0) {
          const p = intersects[0].point.clone().sub(new THREE.Vector3(0, 0, EARTH_Z)).normalize();
          const lat = Math.asin(p.y) * (180 / Math.PI);
          const lon = Math.atan2(p.z, p.x) * (180 / Math.PI);
          onClick({ lat: lat.toFixed(2), lon: lon.toFixed(2), x: event.clientX, y: event.clientY });
        }
      }
    };

    gl.domElement.addEventListener("mousemove", handleMove);
    gl.domElement.addEventListener("click", handleClick);

    return () => {
      gl.domElement.removeEventListener("mousemove", handleMove);
      gl.domElement.removeEventListener("click", handleClick);
    };
  }, [camera, gl, onHover, onClick]);

  return (
    <>
      <mesh ref={earthRef} position={[0, 0, EARTH_Z]} castShadow receiveShadow>
        <sphereGeometry args={[EARTH_R, 128, 128]} />
        <meshStandardMaterial map={earthTex} />
      </mesh>

      <mesh ref={cloudRef} position={[0, 0, EARTH_Z]}>
        <sphereGeometry args={[EARTH_R + 0.6, 128, 128]} />
        <meshPhongMaterial
          map={cloudsTex}
          transparent
          opacity={0.4}
          depthWrite={false}
        />
      </mesh>
    </>
  );
}

/** ---------------------------
 * Tooltip
 * --------------------------- */
function Tooltip({ coords }) {
  if (!coords) return null;
  return (
    <div
      style={{
        position: "fixed",
        left: coords.x + 10,
        top: coords.y + 10,
        background: "rgba(0,0,0,0.7)",
        color: "white",
        padding: "4px 8px",
        borderRadius: 4,
        fontSize: 12,
        pointerEvents: "none",
        zIndex: 1000,
      }}
    >
      Lat: {coords.lat}° <br />
      Lon: {coords.lon}°
    </div>
  );
}

/** ---------------------------
 * Main Scene
 * --------------------------- */
export default function CupolaScene() {
  const [coords, setCoords] = useState(null);
  const [spyglassCoords, setSpyglassCoords] = useState(null); // ✅ store click

  const [fpMode, setFpMode] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      if (e.code === "KeyE") setFpMode((prev) => !prev);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
      <Canvas
        camera={{ position: [0, 1.5, 0], fov: 60, near: 0.1, far: 5000 }}
        shadows
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          outputEncoding: THREE.sRGBEncoding,
        }}
        dpr={[1, 2]}
      >
        <Suspense fallback={<Html center><div style={{ color: "white" }}>Loading Cupola…</div></Html>}>
          <StarfieldBackground />
          <Lights />
          <Earth onHover={setCoords} onClick={setSpyglassCoords} /> {/* ✅ */}
          <CupolaModel />
          {fpMode ? <PointerLockControls /> : <OrbitControls target={[0, 0, -80]} enableDamping dampingFactor={0.05} enableZoom={false} />}
        </Suspense>
      </Canvas>

      <Tooltip coords={coords} />

      {/* Spyglass overlay */}
      {spyglassCoords && (
  <SpyglassMap
    lat={parseFloat(spyglassCoords.lat)}
    lon={parseFloat(spyglassCoords.lon)}
    x={spyglassCoords.x}
    y={spyglassCoords.y}
  />
)}


    </>
  );
}


// ✅ Preload with Vite-safe path
useGLTF.preload(`${import.meta.env.BASE_URL}cupola_2/scene.glb`);
