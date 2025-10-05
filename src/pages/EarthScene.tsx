import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const EarthScene: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(
    null
  );

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 3;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(
      mountRef.current.clientWidth,
      mountRef.current.clientHeight
    );
    mountRef.current.appendChild(renderer.domElement);

    const geometry = new THREE.SphereGeometry(1, 64, 64);
    const texture = new THREE.TextureLoader().load("/maps/Earth-1440x720.jpg");
    const material = new THREE.MeshPhongMaterial({ map: texture });
    const globe = new THREE.Mesh(geometry, material);
    scene.add(globe);

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 3, 5);
    scene.add(light);

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const toLatLon = (point: THREE.Vector3) => {
      const radius = point.length();
      const lat = 90 - (Math.acos(point.y / radius) * 180) / Math.PI;
      const lon =
        (((Math.atan2(point.z, point.x) * 180) / Math.PI + 180) % 360) - 180;
      return { lat, lon };
    };

    const animate = () => {
      requestAnimationFrame(animate);
      globe.rotation.y += 0.0008;
      renderer.render(scene, camera);
    };
    animate();

    const onMouseMove = (event: MouseEvent) => {
      const bounds = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
      mouse.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(globe);

      if (intersects.length > 0 && tooltipRef.current) {
        const point = intersects[0].point.clone().normalize();
        const { lat, lon } = toLatLon(point);
        tooltipRef.current.style.left = event.clientX + 15 + "px";
        tooltipRef.current.style.top = event.clientY + 15 + "px";
        tooltipRef.current.innerText = `Lat: ${lat.toFixed(
          2
        )}°, Lon: ${lon.toFixed(2)}°`;
        tooltipRef.current.style.display = "block";
      } else if (tooltipRef.current) {
        tooltipRef.current.style.display = "none";
      }
    };

    const onClick = (event: MouseEvent) => {
      const bounds = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
      mouse.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(globe);

      if (intersects.length > 0) {
        const point = intersects[0].point.clone().normalize();
        const { lat, lon } = toLatLon(point);
        setCoords({ lat, lon });
        console.log("Clicked coords:", lat, lon);
      }
    };

    renderer.domElement.addEventListener("mousemove", onMouseMove);
    renderer.domElement.addEventListener("click", onClick);

    return () => {
      renderer.domElement.removeEventListener("mousemove", onMouseMove);
      renderer.domElement.removeEventListener("click", onClick);
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div style={{ textAlign: "center" }}>
      <div
        ref={mountRef}
        style={{
          width: "800px",
          height: "600px",
          margin: "0 auto",
          position: "relative",
        }}
      />
      <div
        ref={tooltipRef}
        style={{
          position: "fixed",
          background: "rgba(255,255,255,0.8)",
          padding: "4px 8px",
          border: "1px solid black",
          borderRadius: "4px",
          fontSize: "14px",
          display: "none",
          pointerEvents: "none",
          zIndex: 10,
        }}
      />
      {coords && (
        <p>
          📍 Clicked → Latitude: {coords.lat.toFixed(2)}°, Longitude:{" "}
          {coords.lon.toFixed(2)}°
        </p>
      )}
    </div>
  );
};

export default EarthScene;
