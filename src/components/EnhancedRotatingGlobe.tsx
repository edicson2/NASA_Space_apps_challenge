import { useRef, useEffect, useState } from "react";
import * as THREE from "three";

export default function EnhancedRotatingGlobe() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const earthRef = useRef<THREE.Mesh | null>(null);
  const cloudsRef = useRef<THREE.Mesh | null>(null);

  const mouseRef = useRef({
    x: 0,
    y: 0,
    isDragging: false,
    lastX: 0,
    lastY: 0,
  });
  const rotationRef = useRef({ x: 0, y: 0, velocity: 0.002 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup with black background for space
    const scene = new THREE.Scene();
    scene.background = null; // Transparent background
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      50,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5;
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
    });
    renderer.setSize(
      containerRef.current.clientWidth,
      containerRef.current.clientHeight
    );
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting - adjusted for better Earth visibility
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
    sunLight.position.set(5, 3, 5);
    scene.add(sunLight);

    // Add a subtle fill light from the opposite side
    const fillLight = new THREE.DirectionalLight(0x4488ff, 0.3);
    fillLight.position.set(-5, -3, -5);
    scene.add(fillLight);

    // Create Earth with better material
    const earthGeometry = new THREE.SphereGeometry(1.5, 64, 64);

    // Load textures
    const textureLoader = new THREE.TextureLoader();

    // Earth material with proper settings for visibility
    const earthMaterial = new THREE.MeshStandardMaterial({
      map: textureLoader.load(
        "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_2048.jpg",
        () => setIsLoading(false)
      ),
      roughness: 0.9,
      metalness: 0.1,
      bumpMap: textureLoader.load(
        "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_normal_2048.jpg"
      ),
      bumpScale: 0.03,
    });

    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earth);
    earthRef.current = earth;

    // Create clouds layer - more subtle
    const cloudsGeometry = new THREE.SphereGeometry(1.52, 64, 64);
    const cloudsMaterial = new THREE.MeshStandardMaterial({
      map: textureLoader.load(
        "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_clouds_1024.png"
      ),
      transparent: true,
      opacity: 0.3,
      depthWrite: false,
    });
    const clouds = new THREE.Mesh(cloudsGeometry, cloudsMaterial);
    scene.add(clouds);
    cloudsRef.current = clouds;

    // Add stars in the background
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.7,
      transparent: true,
      opacity: 0.8,
    });

    const starsVertices = [];
    for (let i = 0; i < 1000; i++) {
      const x = (Math.random() - 0.5) * 2000;
      const y = (Math.random() - 0.5) * 2000;
      const z = -Math.random() * 2000 - 100;
      starsVertices.push(x, y, z);
    }

    starsGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(starsVertices, 3)
    );

    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);

    // Mouse event handlers
    const handleMouseDown = (e: MouseEvent) => {
      mouseRef.current.isDragging = true;
      mouseRef.current.lastX = e.clientX;
      mouseRef.current.lastY = e.clientY;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;

      if (mouseRef.current.isDragging) {
        const deltaX = e.clientX - mouseRef.current.lastX;
        const deltaY = e.clientY - mouseRef.current.lastY;

        rotationRef.current.y += deltaX * 0.005;
        rotationRef.current.x += deltaY * 0.005;

        // Limit vertical rotation
        rotationRef.current.x = Math.max(
          -Math.PI / 3,
          Math.min(Math.PI / 3, rotationRef.current.x)
        );

        mouseRef.current.lastX = e.clientX;
        mouseRef.current.lastY = e.clientY;
      }
    };

    const handleMouseUp = () => {
      mouseRef.current.isDragging = false;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomSpeed = 0.002;
      camera.position.z += e.deltaY * zoomSpeed;
      camera.position.z = Math.max(3, Math.min(10, camera.position.z));
    };

    renderer.domElement.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    renderer.domElement.addEventListener("wheel", handleWheel, {
      passive: false,
    });

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return;

      camera.aspect =
        containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(
        containerRef.current.clientWidth,
        containerRef.current.clientHeight
      );
    };
    window.addEventListener("resize", handleResize);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      if (earth && clouds) {
        // Apply rotations
        if (!mouseRef.current.isDragging) {
          rotationRef.current.y += rotationRef.current.velocity;
        }

        earth.rotation.y = rotationRef.current.y;
        earth.rotation.x = rotationRef.current.x;

        // Clouds rotate slightly faster
        clouds.rotation.y = rotationRef.current.y * 1.1;
        clouds.rotation.x = rotationRef.current.x;
      }

      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      renderer.domElement.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      renderer.domElement.removeEventListener("wheel", handleWheel);
      window.removeEventListener("resize", handleResize);

      renderer.dispose();
      earthGeometry.dispose();
      earthMaterial.dispose();
      cloudsGeometry.dispose();
      cloudsMaterial.dispose();
      starsGeometry.dispose();
      starsMaterial.dispose();

      if (
        containerRef.current &&
        renderer.domElement.parentNode === containerRef.current
      ) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-transparent">
          <div className="text-white text-xl">Loading Earth...</div>
        </div>
      )}

      {/* Instructions overlay */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-black/40 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20">
        <p className="text-white/90 text-sm font-light">
          🖱️ Drag to rotate • 🔍 Scroll to zoom
        </p>
      </div>
    </div>
  );
}
