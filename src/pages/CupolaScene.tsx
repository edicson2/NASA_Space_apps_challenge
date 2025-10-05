import React, { useRef, useState, useEffect, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  PointerLockControls,
  useGLTF,
  Html,
} from "@react-three/drei";
import * as THREE from "three";

// Types
interface MoveState {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
}

interface CupolaModelProps {
  onMeshesLoaded?: (meshes: THREE.Mesh[]) => void;
}

interface ObjectInfo {
  name: string;
  type: string;
  position: { x: number; y: number; z: number };
}

interface CupolaSceneProps {
  className?: string;
  style?: React.CSSProperties;
  cameraPosition?: [number, number, number];
  onObjectClick?: (obj: THREE.Object3D) => void;
}

// Canvas Error Boundary
class CanvasErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError)
      return <div style={{ color: "red" }}>Failed to load 3D scene.</div>;
    return this.props.children;
  }
}

// Cupola Model
const CupolaModel: React.FC<CupolaModelProps> = ({ onMeshesLoaded }) => {
  const groupRef = useRef<THREE.Group>(null);

  const modelPath = import.meta.env.DEV
    ? "/cupola_2/scene.glb"
    : "/futuristic-landing-page-ui/cupola_2/scene.glb";

  const { scene } = useGLTF(modelPath);

  useEffect(() => {
    if (!scene || !groupRef.current) return;

    const modelClone = scene.clone(true);

    // Setup materials
    modelClone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        if (mesh.material) {
          const material = (
            mesh.material as THREE.MeshStandardMaterial
          ).clone();
          const name = mesh.name.toLowerCase();
          material.transparent = true;
          material.opacity =
            name.includes("glass") || name.includes("window") ? 0.2 : 0.85;
          material.side = THREE.DoubleSide;
          material.depthWrite = false;
          mesh.material = material;
        }
      }
    });

    // Center & scale
    const box = new THREE.Box3().setFromObject(modelClone);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const scale = 5 / maxDim;
    modelClone.scale.setScalar(scale);
    modelClone.rotation.x = Math.PI;

    const rotatedBox = new THREE.Box3().setFromObject(modelClone);
    const rotatedCenter = rotatedBox.getCenter(new THREE.Vector3());
    modelClone.position.set(
      -rotatedCenter.x,
      -rotatedCenter.y + 1.05,
      -rotatedCenter.z
    );

    while (groupRef.current.children.length > 0) {
      groupRef.current.remove(groupRef.current.children[0]);
    }
    groupRef.current.add(modelClone);

    // Collect clickable meshes
    const meshes: THREE.Mesh[] = [];
    modelClone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) meshes.push(child as THREE.Mesh);
    });

    if (onMeshesLoaded) onMeshesLoaded(meshes);
  }, [scene, onMeshesLoaded]);

  return (
    <primitive object={groupRef.current ?? new THREE.Group()} ref={groupRef} />
  );
};

// Lights
const Lights: React.FC = () => (
  <spotLight
    position={[0, 25, 0]}
    intensity={3}
    angle={0.22}
    penumbra={1}
    distance={100}
    castShadow={false}
  />
);

// First-Person Movement
const FirstPersonMovement: React.FC<{ enabled: boolean }> = ({ enabled }) => {
  const { camera } = useThree();
  const velocityRef = useRef(new THREE.Vector3());
  const moveRef = useRef<MoveState>({
    forward: false,
    backward: false,
    left: false,
    right: false,
  });
  const speed = 20;
  const damping = 6;

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      switch (e.code) {
        case "KeyW":
          moveRef.current.forward = true;
          break;
        case "KeyS":
          moveRef.current.backward = true;
          break;
        case "KeyA":
          moveRef.current.left = true;
          break;
        case "KeyD":
          moveRef.current.right = true;
          break;
      }
    };
    const up = (e: KeyboardEvent) => {
      switch (e.code) {
        case "KeyW":
          moveRef.current.forward = false;
          break;
        case "KeyS":
          moveRef.current.backward = false;
          break;
        case "KeyA":
          moveRef.current.left = false;
          break;
        case "KeyD":
          moveRef.current.right = false;
          break;
      }
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  useFrame((_, delta) => {
    if (!enabled) return;
    const dir = new THREE.Vector3(
      Number(moveRef.current.right) - Number(moveRef.current.left),
      0,
      Number(moveRef.current.backward) - Number(moveRef.current.forward)
    ).normalize();

    velocityRef.current.x -= velocityRef.current.x * damping * delta;
    velocityRef.current.z -= velocityRef.current.z * damping * delta;

    velocityRef.current.x += dir.x * speed * delta;
    velocityRef.current.z += dir.z * speed * delta;

    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(
      camera.quaternion
    );
    forward.y = 0;
    forward.normalize();
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
    right.y = 0;
    right.normalize();

    camera.position.addScaledVector(forward, -velocityRef.current.z * delta);
    camera.position.addScaledVector(right, velocityRef.current.x * delta);
  });

  return null;
};

// Click Detection
const ClickDetection: React.FC<{
  clickableObjects: THREE.Mesh[];
  onObjectClick: (obj: THREE.Object3D) => void;
  fpMode: boolean;
}> = ({ clickableObjects, onObjectClick, fpMode }) => {
  const { camera, gl } = useThree();
  useEffect(() => {
    if (!clickableObjects.length) return;
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const handleClick = (e: MouseEvent) => {
      if (fpMode) return;
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(clickableObjects, true);
      if (intersects.length) onObjectClick(intersects[0].object);
    };
    gl.domElement.addEventListener("click", handleClick);
    return () => gl.domElement.removeEventListener("click", handleClick);
  }, [clickableObjects, camera, gl, onObjectClick, fpMode]);
  return null;
};

// Instructions Panel
const InstructionsPanel: React.FC<{ onHide: () => void }> = ({ onHide }) => (
  <div
    style={{
      position: "fixed",
      top: 20,
      left: 20,
      background: "rgba(0,0,0,0.85)",
      backdropFilter: "blur(10px)",
      color: "white",
      padding: 20,
      borderRadius: 12,
      border: "1px solid rgba(100,150,255,0.4)",
      maxWidth: 320,
      zIndex: 100,
    }}
  >
    <h2 style={{ margin: 0, marginBottom: 15, color: "#66bbff" }}>Controls</h2>
    <p>Use mouse to orbit, click objects to view info, press E for FP mode</p>
    <button
      onClick={onHide}
      style={{
        marginTop: 10,
        background: "#0066cc",
        color: "white",
        padding: "8px 12px",
        border: "none",
        borderRadius: 6,
      }}
    >
      Hide
    </button>
  </div>
);

// Info Panel
const InfoPanel: React.FC<{ info: ObjectInfo | null; onClose: () => void }> = ({
  info,
  onClose,
}) => {
  if (!info) return null;
  return (
    <div
      style={{
        position: "fixed",
        top: "50%",
        right: 30,
        transform: "translateY(-50%)",
        background: "rgba(0,0,0,0.8)",
        padding: 20,
        borderRadius: 10,
        color: "white",
        zIndex: 150,
      }}
    >
      <h3 style={{ color: "#66bbff" }}>Object Details</h3>
      <p>
        <strong>Name:</strong> {info.name}
      </p>
      <p>
        <strong>Type:</strong> {info.type}
      </p>
      <p>
        <strong>Position:</strong> ({info.position.x.toFixed(2)},{" "}
        {info.position.y.toFixed(2)}, {info.position.z.toFixed(2)})
      </p>
      <button
        onClick={onClose}
        style={{
          marginTop: 10,
          background: "#0066cc",
          color: "white",
          border: "none",
          padding: "8px 16px",
          borderRadius: 5,
        }}
      >
        Close
      </button>
    </div>
  );
};

// Main Scene
const CupolaScene: React.FC<CupolaSceneProps> = ({
  className,
  style,
  cameraPosition = [2, 3, 8],
  onObjectClick,
}) => {
  const [clickableObjects, setClickableObjects] = useState<THREE.Mesh[]>([]);
  const [info, setInfo] = useState<ObjectInfo | null>(null);
  const [fpMode, setFpMode] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);

  const handleObjectClick = (obj: THREE.Object3D) => {
    setInfo({
      name: obj.name || "Unnamed",
      type: obj.type,
      position: obj.position,
    });
    if (onObjectClick) onObjectClick(obj);
  };

  const handleMeshesLoaded = (meshes: THREE.Mesh[]) =>
    setClickableObjects(meshes);

  // Enter FP mode
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.code === "KeyE" && !fpMode) setFpMode(true);
    };
    return () => window.removeEventListener("keydown", down);
  }, [fpMode]);

  return (
    <div
      className={className}
      style={{
        width: "100%",
        height: "100%",
        minHeight: "100vh",
        position: "relative",
        ...style,
      }}
    >
      <Canvas
        camera={{ position: cameraPosition, fov: 45, near: 0.01, far: 1000 }}
        shadows
        gl={{ antialias: true }}
        dpr={window.devicePixelRatio}
      >
        <CanvasErrorBoundary>
          <Suspense
            fallback={
              <Html center>
                <div style={{ color: "white", fontSize: 20 }}>
                  Loading Cupola...
                </div>
              </Html>
            }
          >
            <Lights />
            <CupolaModel onMeshesLoaded={handleMeshesLoaded} />

            <ClickDetection
              clickableObjects={clickableObjects}
              onObjectClick={handleObjectClick}
              fpMode={fpMode}
            />

            {fpMode ? (
              <>
                <PointerLockControls
                  onLock={() => setFpMode(true)}
                  onUnlock={() => setFpMode(false)}
                />
                <FirstPersonMovement enabled={fpMode} />
              </>
            ) : (
              <OrbitControls
                enableDamping
                dampingFactor={0.05}
                enablePan
                minDistance={0.5}
                maxDistance={50}
                minPolarAngle={0}
                maxPolarAngle={Math.PI}
                target={[0, 1, 0]}
              />
            )}
          </Suspense>
        </CanvasErrorBoundary>
      </Canvas>

      {/* Instructions */}
      {showInstructions ? (
        <InstructionsPanel onHide={() => setShowInstructions(false)} />
      ) : (
        <button
          onClick={() => setShowInstructions(true)}
          style={{
            position: "fixed",
            top: 20,
            left: 20,
            background: "rgba(0,102,204,0.9)",
            color: "white",
            border: "none",
            padding: "10px 16px",
            borderRadius: "50%",
            cursor: "pointer",
            fontSize: 20,
            fontWeight: "bold",
            zIndex: 100,
          }}
        >
          ?
        </button>
      )}

      {/* Info Panel */}
      <InfoPanel info={info} onClose={() => setInfo(null)} />
    </div>
  );
};

// Preload GLTF
const modelPath = import.meta.env.DEV
  ? "/cupola_2/scene.glb"
  : "/futuristic-landing-page-ui/cupola_2/scene.glb";

useGLTF.preload(modelPath);

export default CupolaScene;
