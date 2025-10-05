import React, { useRef, useState, useEffect, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  PointerLockControls,
  useGLTF,
  Html,
} from "@react-three/drei";
import * as THREE from "three";

// Type definitions
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

// Cupola Model Component
const CupolaModel: React.FC<CupolaModelProps> = ({ onMeshesLoaded }) => {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF("/public/cupola_2/scene.glb");

  useEffect(() => {
    if (!scene || !groupRef.current) return;

    const modelClone = scene.clone(true);

    modelClone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        if (mesh.material) {
          const material = mesh.material as THREE.MeshStandardMaterial;
          const materialName = material.name ? material.name.toLowerCase() : "";
          const meshName = mesh.name ? mesh.name.toLowerCase() : "";

          mesh.material = material.clone();
          const mat = mesh.material as THREE.MeshStandardMaterial;

          if (
            materialName.includes("glass") ||
            materialName.includes("window") ||
            meshName.includes("glass") ||
            meshName.includes("window")
          ) {
            mat.transparent = true;
            mat.opacity = 0.2;
            mat.side = THREE.DoubleSide;
            mat.depthWrite = false;
          } else {
            mat.transparent = true;
            mat.opacity = 0.85;
            mat.side = THREE.DoubleSide;
            mat.depthWrite = false;
          }
        }
      }
    });

    const box = new THREE.Box3().setFromObject(modelClone);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const targetSize = 5;
    const scale = targetSize / maxDim;
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

    const meshes: THREE.Mesh[] = [];
    modelClone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        meshes.push(child as THREE.Mesh);
      }
    });

    if (onMeshesLoaded) {
      onMeshesLoaded(meshes);
    }
  }, [scene, onMeshesLoaded]);

  return (
    // @ts-ignore: groupRef.current may be a THREE.Group, allow primitive usage
    <primitive object={groupRef.current ?? new THREE.Group()} ref={groupRef} />
  );
};

// Lights Component
const Lights: React.FC = () => {
  return (
    <>
      {/* @ts-ignore: using three.js spotlight JSX from drei/three, ignore type mismatch */}
      <spotLight
        position={[0, 25, 0]}
        intensity={3000}
        angle={0.22}
        penumbra={1}
        distance={100}
        castShadow={false}
      />
    </>
  );
};

// First Person Movement Component
interface FirstPersonMovementProps {
  enabled: boolean;
}

const FirstPersonMovement: React.FC<FirstPersonMovementProps> = ({
  enabled,
}) => {
  const { camera } = useThree();
  const velocityRef = useRef(new THREE.Vector3());
  const moveRef = useRef<MoveState>({
    forward: false,
    backward: false,
    left: false,
    right: false,
  });

  const speed = 20;
  const damping = 6.0;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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

    const handleKeyUp = (e: KeyboardEvent) => {
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

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useFrame((_, delta) => {
    if (!enabled) return;

    const direction = new THREE.Vector3();
    direction.z =
      Number(moveRef.current.backward) - Number(moveRef.current.forward);
    direction.x = Number(moveRef.current.right) - Number(moveRef.current.left);
    direction.normalize();

    velocityRef.current.x -= velocityRef.current.x * damping * delta;
    velocityRef.current.z -= velocityRef.current.z * damping * delta;

    velocityRef.current.x += direction.x * speed * delta;
    velocityRef.current.z += direction.z * speed * delta;

    const forward = new THREE.Vector3(0, 0, -1);
    forward.applyQuaternion(camera.quaternion);
    forward.y = 0;
    forward.normalize();

    const right = new THREE.Vector3(1, 0, 0);
    right.applyQuaternion(camera.quaternion);
    right.y = 0;
    right.normalize();

    camera.position.addScaledVector(forward, -velocityRef.current.z * delta);
    camera.position.addScaledVector(right, velocityRef.current.x * delta);
  });

  return null;
};

// Click Detection Component
interface ClickDetectionProps {
  clickableObjects: THREE.Mesh[];
  onObjectClick: (obj: THREE.Object3D) => void;
  fpMode: boolean;
}

const ClickDetection: React.FC<ClickDetectionProps> = ({
  clickableObjects,
  onObjectClick,
  fpMode,
}) => {
  const { camera, gl } = useThree();

  useEffect(() => {
    if (clickableObjects.length === 0) return;

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (event: MouseEvent) => {
      if (fpMode) return;

      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      const intersects = raycaster.intersectObjects(clickableObjects, true);

      if (intersects.length > 0) {
        const clickedObject = intersects[0].object;
        onObjectClick(clickedObject);
      }
    };

    gl.domElement.addEventListener("click", handleClick);

    return () => {
      gl.domElement.removeEventListener("click", handleClick);
    };
  }, [clickableObjects, camera, gl, onObjectClick, fpMode]);

  return null;
};

// Instructions Panel Component with Terminal Design
interface InstructionsPanelProps {
  onHide: () => void;
}

const InstructionsPanel: React.FC<InstructionsPanelProps> = ({ onHide }) => {
  return (
    <div
      style={{
        position: "fixed",
        top: "100px",
        left: "20px",
        background: "rgba(0, 0, 0, 0.9)",
        border: "2px solid #10b981",
        borderRadius: "8px",
        color: "#10b981",
        padding: "12px",
        maxWidth: "300px",
        zIndex: 100,
        fontFamily: "monospace",
        fontSize: "13px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "12px",
        }}
      >
        <span style={{ fontSize: "18px" }}>🚀</span>
        <span style={{ fontWeight: "bold", fontSize: "15px" }}>
          CONTROL PANEL
        </span>
        <span style={{ fontSize: "14px" }}>🛸</span>
      </div>

      <div style={{ marginBottom: "12px" }}>
        <div
          style={{
            color: "#06b6d4",
            fontWeight: "bold",
            marginBottom: "6px",
            fontSize: "12px",
          }}
        >
          🌍 ORBIT MODE (DEFAULT):
        </div>
        <div
          style={{ fontSize: "11px", lineHeight: "1.5", paddingLeft: "8px" }}
        >
          <div>Left Mouse - Rotate view</div>
          <div>Right Mouse - Pan</div>
          <div>Scroll - Zoom in/out</div>
          <div>Click Object - View details</div>
        </div>
      </div>

      <div style={{ marginBottom: "12px" }}>
        <div
          style={{
            color: "#06b6d4",
            fontWeight: "bold",
            marginBottom: "6px",
            fontSize: "12px",
          }}
        >
          👨‍🚀 FIRST-PERSON MODE:
        </div>
        <div
          style={{ fontSize: "11px", lineHeight: "1.5", paddingLeft: "8px" }}
        >
          <div>Press E - Enter FP mode</div>
          <div>W/A/S/D - Move around</div>
          <div>Mouse - Look around</div>
          <div>ESC - Exit FP mode</div>
        </div>
      </div>

      <button
        onClick={onHide}
        style={{
          width: "100%",
          background: "transparent",
          color: "#10b981",
          border: "1px solid #10b981",
          padding: "6px",
          borderRadius: "4px",
          cursor: "pointer",
          fontFamily: "monospace",
          fontWeight: "bold",
          fontSize: "11px",
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(16, 185, 129, 0.2)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
        }}
      >
        ✨ HIDE CONTROLS ✨
      </button>
    </div>
  );
};

// Info Panel Component with Terminal Design
interface InfoPanelProps {
  info: ObjectInfo | null;
  onClose: () => void;
}

const InfoPanel: React.FC<InfoPanelProps> = ({ info, onClose }) => {
  if (!info) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        background: "rgba(0, 0, 0, 0.9)",
        border: "2px solid #06b6d4",
        borderRadius: "8px",
        color: "#06b6d4",
        padding: "16px",
        maxWidth: "320px",
        zIndex: 150,
        fontFamily: "monospace",
        fontSize: "14px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "16px",
        }}
      >
        <span style={{ fontSize: "20px" }}>📡</span>
        <span style={{ fontWeight: "bold", fontSize: "16px" }}>
          OBJECT DATA
        </span>
      </div>

      <div
        style={{ marginBottom: "12px", fontSize: "12px", lineHeight: "1.8" }}
      >
        <div>
          <span style={{ color: "#10b981" }}>Name:</span> {info.name}
        </div>
        <div>
          <span style={{ color: "#10b981" }}>Type:</span> {info.type}
        </div>
        <div>
          <span style={{ color: "#10b981" }}>Position:</span>
        </div>
        <div style={{ paddingLeft: "16px" }}>
          X: {info.position.x.toFixed(2)}
        </div>
        <div style={{ paddingLeft: "16px" }}>
          Y: {info.position.y.toFixed(2)}
        </div>
        <div style={{ paddingLeft: "16px" }}>
          Z: {info.position.z.toFixed(2)}
        </div>
      </div>

      <button
        onClick={onClose}
        style={{
          width: "100%",
          background: "transparent",
          color: "#06b6d4",
          border: "1px solid #06b6d4",
          padding: "8px",
          borderRadius: "4px",
          cursor: "pointer",
          fontFamily: "monospace",
          fontWeight: "bold",
          fontSize: "12px",
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(6, 182, 212, 0.2)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
        }}
      >
        CLOSE
      </button>
    </div>
  );
};

// Quick Facts Panel Component
interface QuickFactsPanelProps {
  onClose: () => void;
}

const QuickFactsPanel: React.FC<QuickFactsPanelProps> = ({ onClose }) => {
  return (
    <div
      style={{
        position: "fixed",
        top: "100px",
        right: "20px",
        background: "rgba(0, 0, 0, 0.95)",
        border: "2px solid #10b981",
        borderRadius: "8px",
        color: "#10b981",
        padding: "16px",
        maxWidth: "400px",
        zIndex: 150,
        fontFamily: "monospace",
        fontSize: "12px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "14px",
          borderBottom: "1px solid #10b981",
          paddingBottom: "10px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "18px" }}>🔬</span>
          <span
            style={{ fontWeight: "bold", fontSize: "14px", color: "#10b981" }}
          >
            CUPOLA MODULE
          </span>
        </div>
        <button
          onClick={onClose}
          style={{
            background: "transparent",
            border: "1px solid #10b981",
            color: "#10b981",
            padding: "2px 8px",
            borderRadius: "3px",
            cursor: "pointer",
            fontFamily: "monospace",
            fontSize: "10px",
            fontWeight: "bold",
          }}
        >
          ESC
        </button>
      </div>

      <div style={{ marginBottom: "12px" }}>
        <div
          style={{ color: "#06b6d4", fontWeight: "bold", marginBottom: "6px" }}
        >
          📊 SPECIFICATIONS:
        </div>
        <div
          style={{ fontSize: "11px", lineHeight: "1.6", paddingLeft: "8px" }}
        >
          <div>
            <span style={{ color: "#fbbf24" }}>Mass:</span> 4,136 pounds
          </div>
          <div>
            <span style={{ color: "#fbbf24" }}>Height:</span> 4.7 feet
          </div>
          <div>
            <span style={{ color: "#fbbf24" }}>Diameter:</span> 9.8 feet
          </div>
        </div>
      </div>

      <div style={{ marginBottom: "12px" }}>
        <div
          style={{ color: "#06b6d4", fontWeight: "bold", marginBottom: "6px" }}
        >
          📸 OBSERVATION:
        </div>
        <div
          style={{ fontSize: "11px", lineHeight: "1.6", paddingLeft: "8px" }}
        >
          Station crew members frequently point their cameras outside the cupola
          and photograph landmarks on Earth.
        </div>
      </div>

      <div style={{ marginBottom: "0" }}>
        <div
          style={{ color: "#06b6d4", fontWeight: "bold", marginBottom: "6px" }}
        >
          🦾 ROBOTICS:
        </div>
        <div
          style={{ fontSize: "11px", lineHeight: "1.6", paddingLeft: "8px" }}
        >
          Astronauts can use the cupola's robotics workstation to command the
          Canadarm2 to reach out, grapple, and install spacecraft.
        </div>
      </div>
    </div>
  );
};

// Main Scene Component
const CupolaScene: React.FC<CupolaSceneProps> = ({
  className,
  style,
  cameraPosition = [2, 3, 8],
  onObjectClick,
}) => {
  const [clickableObjects, setClickableObjects] = useState<THREE.Mesh[]>([]);
  const [info, setInfo] = useState<ObjectInfo | null>(null);
  const [fpMode, setFpMode] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showQuickFacts, setShowQuickFacts] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleObjectClick = (obj: THREE.Object3D) => {
    const objectInfo: ObjectInfo = {
      name: obj.name || "Unnamed",
      type: obj.type,
      position: {
        x: obj.position.x,
        y: obj.position.y,
        z: obj.position.z,
      },
    };
    setInfo(objectInfo);

    if (onObjectClick) {
      onObjectClick(obj);
    }
  };

  const handleMeshesLoaded = (meshes: THREE.Mesh[]) => {
    setClickableObjects(meshes);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "KeyE" && !fpMode) {
        setFpMode(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [fpMode]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.play().catch((error) => {
        console.log("Audio autoplay blocked:", error);
      });
      setIsAudioPlaying(true);
    }
  }, []);

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isAudioPlaying) {
        audioRef.current.pause();
        setIsAudioPlaying(false);
      } else {
        audioRef.current.play().catch((error) => {
          console.log("Audio play failed:", error);
        });
        setIsAudioPlaying(true);
      }
    }
  };

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
        camera={{
          position: cameraPosition,
          fov: 45,
          near: 0.01,
          far: 1000,
        }}
        shadows
        gl={{
          antialias: true,
        }}
        dpr={window.devicePixelRatio}
      >
        {/* Set background color using gl prop or useEffect instead of <color /> */}

        <Suspense
          fallback={
            <Html center>
              <div
                style={{
                  color: "#10b981",
                  fontSize: "20px",
                  fontFamily: "monospace",
                }}
              >
                LOADING CUPOLA...
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
      </Canvas>

      {showInstructions ? (
        <InstructionsPanel onHide={() => setShowInstructions(false)} />
      ) : (
        <button
          onClick={() => setShowInstructions(true)}
          style={{
            position: "fixed",
            top: "100px",
            left: "20px",
            background: "rgba(0, 0, 0, 0.9)",
            border: "2px solid #10b981",
            color: "#10b981",
            width: "45px",
            height: "45px",
            borderRadius: "50%",
            cursor: "pointer",
            fontSize: "18px",
            fontWeight: "bold",
            fontFamily: "monospace",
            zIndex: 100,
            transition: "all 0.2s",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(16, 185, 129, 0.2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(0, 0, 0, 0.9)";
          }}
        >
          ?
        </button>
      )}

      <button
        onClick={toggleAudio}
        style={{
          position: "fixed",
          top: showInstructions ? "520px" : "160px",
          left: "20px",
          background: "rgba(0, 0, 0, 0.9)",
          border: "2px solid #10b981",
          color: "#10b981",
          width: "45px",
          height: "45px",
          borderRadius: "50%",
          cursor: "pointer",
          fontSize: "18px",
          fontFamily: "monospace",
          zIndex: 100,
          transition: "all 0.3s ease",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(16, 185, 129, 0.2)";
          e.currentTarget.style.transform = "scale(1.05)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(0, 0, 0, 0.9)";
          e.currentTarget.style.transform = "scale(1)";
        }}
      >
        {isAudioPlaying ? "🔊" : "🔇"}
      </button>

      <InfoPanel info={info} onClose={() => setInfo(null)} />

      {showQuickFacts && (
        <QuickFactsPanel onClose={() => setShowQuickFacts(false)} />
      )}

      <button
        onClick={() => setShowQuickFacts(!showQuickFacts)}
        style={{
          position: "fixed",
          top: "100px",
          right: "20px",
          background: "rgba(0, 0, 0, 0.9)",
          border: "2px solid #10b981",
          color: "#10b981",
          padding: "10px 16px",
          borderRadius: "6px",
          cursor: "pointer",
          fontSize: "12px",
          fontWeight: "bold",
          fontFamily: "monospace",
          zIndex: 100,
          transition: "all 0.2s",
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(16, 185, 129, 0.2)";
          e.currentTarget.style.transform = "scale(1.05)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(0, 0, 0, 0.9)";
          e.currentTarget.style.transform = "scale(1)";
        }}
      >
        <span>🔬</span>
        <span>QUICK FACTS</span>
      </button>

      <audio
        ref={audioRef}
        src="/public/cupola_2/cupola.mp3"
        loop
        preload="auto"
      />
    </div>
  );
};

useGLTF.preload("/cupola_2/scene.glb");

export default CupolaScene;
