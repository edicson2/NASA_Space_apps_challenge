import { useRef, useEffect } from "react";
import * as THREE from "three";
import nasaGlobe from "../assets/images/nasaGlobe.jpg";

export default function RotatingGlobe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rotationRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);

    const texture = new THREE.TextureLoader().load(nasaGlobe);
    const geometry = new THREE.SphereGeometry(3, 64, 64);
    const material = new THREE.MeshBasicMaterial({ map: texture });
    const globe = new THREE.Mesh(geometry, material);
    scene.add(globe);
    camera.position.z = 8;

    const onMouseMove = (e: MouseEvent) => {
      rotationRef.current.y = (e.clientX / window.innerWidth - 0.5) * 0.8;
      rotationRef.current.x = (e.clientY / window.innerHeight - 0.5) * 0.8;
    };
    window.addEventListener("mousemove", onMouseMove);

    const animate = () => {
      requestAnimationFrame(animate);
      globe.rotation.y += 0.002 + rotationRef.current.y * 0.01; // smooth spin
      globe.rotation.x += rotationRef.current.x * 0.005;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      renderer.dispose();
      texture.dispose();
      geometry.dispose();
      material.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} className="w-full h-full" />;
}
