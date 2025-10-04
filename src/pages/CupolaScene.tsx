// import React, { useRef, useState, useEffect, Suspense } from "react";
// import { Canvas, useFrame, useThree } from "@react-three/fiber";
// import {
//   OrbitControls,
//   PointerLockControls,
//   useGLTF,
//   Html,
// } from "@react-three/drei";
// import * as THREE from "three";

// // Type definitions
// interface MoveState {
//   forward: boolean;
//   backward: boolean;
//   left: boolean;
//   right: boolean;
// }

// interface CupolaModelProps {
//   onMeshesLoaded?: (meshes: THREE.Mesh[]) => void;
// }

// interface ObjectInfo {
//   name: string;
//   type: string;
//   position: { x: number; y: number; z: number };
// }

// interface CupolaSceneProps {
//   className?: string;
//   style?: React.CSSProperties;
//   cameraPosition?: [number, number, number];
//   onObjectClick?: (obj: THREE.Object3D) => void;
// }

// // Cupola Model Component
// const CupolaModel: React.FC<CupolaModelProps> = ({ onMeshesLoaded }) => {
//   const groupRef = useRef<THREE.Group>(null);
//   const { scene } = useGLTF("/public/cupola_2/scene.glb ");

//   useEffect(() => {
//     if (!scene || !groupRef.current) return;

//     // Calculate bounding box to center and scale properly
//     const box = new THREE.Box3().setFromObject(scene);
//     const center = box.getCenter(new THREE.Vector3());
//     const size = box.getSize(new THREE.Vector3());

//     // Get the largest dimension
//     const maxDim = Math.max(size.x, size.y, size.z) || 1;

//     // Scale to fit nicely in view
//     const targetSize = 5;
//     const scale = targetSize / maxDim;

//     // Clone and transform the model
//     const modelClone = scene.clone(true);
//     modelClone.scale.setScalar(scale);
//     modelClone.position.set(
//       -center.x * scale,
//       -center.y * scale + 1.05,
//       -center.z * scale
//     );

//     // Rotate 180 degrees vertically (around X axis)
//     modelClone.rotation.x = Math.PI;

//     // Enable shadows
//     modelClone.traverse((child) => {
//       if ((child as THREE.Mesh).isMesh) {
//         const mesh = child as THREE.Mesh;
//         mesh.castShadow = true;
//         mesh.receiveShadow = true;
//       }
//     });

//     // Clear and add to group
//     while (groupRef.current.children.length > 0) {
//       groupRef.current.remove(groupRef.current.children[0]);
//     }
//     groupRef.current.add(modelClone);

//     // Collect clickable meshes
//     const meshes: THREE.Mesh[] = [];
//     modelClone.traverse((child) => {
//       if ((child as THREE.Mesh).isMesh) {
//         meshes.push(child as THREE.Mesh);
//       }
//     });

//     if (onMeshesLoaded) {
//       onMeshesLoaded(meshes);
//     }

//     console.log("Cupola loaded! Size:", size, "Scale:", scale);
//     console.log("Clickable objects:", meshes.length);
//   }, [scene, onMeshesLoaded]);

//   return <group ref={groupRef} />;
// };

// // Lights Component
// const Lights: React.FC = () => {
//   return (
//     <>
//       <spotLight
//         position={[0, 25, 0]}
//         intensity={3000}
//         angle={0.22}
//         penumbra={1}
//         distance={100}
//         castShadow={false}
//       />
//     </>
//   );
// };

// // Ground Component (optional)
// const Ground: React.FC = () => {
//   return (
//     <mesh rotation-x={-Math.PI / 2} receiveShadow>
//       <planeGeometry args={[20, 20, 32, 32]} />
//       <meshStandardMaterial color="#555555" side={THREE.DoubleSide} />
//     </mesh>
//   );
// };

// // First Person Movement Component
// interface FirstPersonMovementProps {
//   enabled: boolean;
// }

// const FirstPersonMovement: React.FC<FirstPersonMovementProps> = ({
//   enabled,
// }) => {
//   const { camera } = useThree();
//   const velocityRef = useRef(new THREE.Vector3());
//   const moveRef = useRef<MoveState>({
//     forward: false,
//     backward: false,
//     left: false,
//     right: false,
//   });

//   const speed = 20;
//   const damping = 6.0;

//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => {
//       switch (e.code) {
//         case "KeyW":
//           moveRef.current.forward = true;
//           break;
//         case "KeyS":
//           moveRef.current.backward = true;
//           break;
//         case "KeyA":
//           moveRef.current.left = true;
//           break;
//         case "KeyD":
//           moveRef.current.right = true;
//           break;
//       }
//     };

//     const handleKeyUp = (e: KeyboardEvent) => {
//       switch (e.code) {
//         case "KeyW":
//           moveRef.current.forward = false;
//           break;
//         case "KeyS":
//           moveRef.current.backward = false;
//           break;
//         case "KeyA":
//           moveRef.current.left = false;
//           break;
//         case "KeyD":
//           moveRef.current.right = false;
//           break;
//       }
//     };

//     window.addEventListener("keydown", handleKeyDown);
//     window.addEventListener("keyup", handleKeyUp);

//     return () => {
//       window.removeEventListener("keydown", handleKeyDown);
//       window.removeEventListener("keyup", handleKeyUp);
//     };
//   }, []);

//   useFrame((_, delta) => {
//     if (!enabled) return;

//     const direction = new THREE.Vector3();
//     direction.z =
//       Number(moveRef.current.backward) - Number(moveRef.current.forward);
//     direction.x = Number(moveRef.current.right) - Number(moveRef.current.left);
//     direction.normalize();

//     velocityRef.current.x -= velocityRef.current.x * damping * delta;
//     velocityRef.current.z -= velocityRef.current.z * damping * delta;

//     velocityRef.current.x += direction.x * speed * delta;
//     velocityRef.current.z += direction.z * speed * delta;

//     const forward = new THREE.Vector3(0, 0, -1);
//     forward.applyQuaternion(camera.quaternion);
//     forward.y = 0;
//     forward.normalize();

//     const right = new THREE.Vector3(1, 0, 0);
//     right.applyQuaternion(camera.quaternion);
//     right.y = 0;
//     right.normalize();

//     camera.position.addScaledVector(forward, -velocityRef.current.z * delta);
//     camera.position.addScaledVector(right, velocityRef.current.x * delta);
//   });

//   return null;
// };

// // Click Detection Component
// interface ClickDetectionProps {
//   clickableObjects: THREE.Mesh[];
//   onObjectClick: (obj: THREE.Object3D) => void;
//   fpMode: boolean;
// }

// const ClickDetection: React.FC<ClickDetectionProps> = ({
//   clickableObjects,
//   onObjectClick,
//   fpMode,
// }) => {
//   const { camera, gl } = useThree();

//   useEffect(() => {
//     if (clickableObjects.length === 0) return;

//     const raycaster = new THREE.Raycaster();
//     const mouse = new THREE.Vector2();

//     const handleClick = (event: MouseEvent) => {
//       // Don't handle clicks in pointer lock mode
//       if (fpMode) return;

//       // Calculate mouse position in normalized device coordinates
//       mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
//       mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

//       // Update raycaster
//       raycaster.setFromCamera(mouse, camera);

//       // Check for intersections
//       const intersects = raycaster.intersectObjects(clickableObjects, true);

//       if (intersects.length > 0) {
//         const clickedObject = intersects[0].object;
//         console.log("Clicked on:", clickedObject.name || "unnamed object");
//         onObjectClick(clickedObject);
//       }
//     };

//     gl.domElement.addEventListener("click", handleClick);

//     return () => {
//       gl.domElement.removeEventListener("click", handleClick);
//     };
//   }, [clickableObjects, camera, gl, onObjectClick, fpMode]);

//   return null;
// };

// // Info Panel Component
// interface InfoPanelProps {
//   info: ObjectInfo | null;
//   onClose: () => void;
// }

// const InfoPanel: React.FC<InfoPanelProps> = ({ info, onClose }) => {
//   if (!info) return null;

//   return (
//     <div
//       style={{
//         position: "fixed",
//         top: "50%",
//         right: 30,
//         transform: "translateY(-50%)",
//         background: "rgba(0, 0, 0, 0.8)",
//         backdropFilter: "blur(10px)",
//         color: "white",
//         padding: 20,
//         borderRadius: 10,
//         border: "1px solid rgba(100, 150, 255, 0.5)",
//         maxWidth: 300,
//         zIndex: 150,
//         fontFamily: "Arial, sans-serif",
//       }}
//     >
//       <h3 style={{ marginTop: 0, color: "#66bbff" }}>Object Details</h3>
//       <p>
//         <strong>Name:</strong> {info.name}
//       </p>
//       <p>
//         <strong>Type:</strong> {info.type}
//       </p>
//       <p>
//         <strong>Position:</strong> ({info.position.x.toFixed(2)},{" "}
//         {info.position.y.toFixed(2)}, {info.position.z.toFixed(2)})
//       </p>
//       <button
//         onClick={onClose}
//         style={{
//           marginTop: 10,
//           background: "#0066cc",
//           color: "white",
//           border: "none",
//           padding: "8px 16px",
//           borderRadius: 5,
//           cursor: "pointer",
//         }}
//       >
//         Close
//       </button>
//     </div>
//   );
// };

// // Main Scene Component
// const CupolaScene: React.FC<CupolaSceneProps> = ({
//   className,
//   style,
//   cameraPosition = [2, 3, 8],
//   onObjectClick,
// }) => {
//   const [clickableObjects, setClickableObjects] = useState<THREE.Mesh[]>([]);
//   const [info, setInfo] = useState<ObjectInfo | null>(null);
//   const [fpMode, setFpMode] = useState(false);

//   const handleObjectClick = (obj: THREE.Object3D) => {
//     const objectInfo: ObjectInfo = {
//       name: obj.name || "Unnamed",
//       type: obj.type,
//       position: {
//         x: obj.position.x,
//         y: obj.position.y,
//         z: obj.position.z,
//       },
//     };
//     setInfo(objectInfo);

//     if (onObjectClick) {
//       onObjectClick(obj);
//     }
//   };

//   const handleMeshesLoaded = (meshes: THREE.Mesh[]) => {
//     setClickableObjects(meshes);
//   };

//   return (
//     <div
//       className={className}
//       style={{ width: "100%", height: "100%", position: "relative", ...style }}
//     >
//       <Canvas
//         camera={{
//           position: cameraPosition,
//           fov: 45,
//           near: 0.01,
//           far: 1000,
//         }}
//         shadows
//         gl={{
//           antialias: true,
//           pixelRatio: window.devicePixelRatio,
//         }}
//       >
//         <color attach="background" args={["#000000"]} />

//         <Suspense
//           fallback={
//             <Html center>
//               <div style={{ color: "white", fontSize: "20px" }}>
//                 Loading Cupola...
//               </div>
//             </Html>
//           }
//         >
//           <Lights />
//           {/* <Ground /> */}
//           <CupolaModel onMeshesLoaded={handleMeshesLoaded} />

//           <ClickDetection
//             clickableObjects={clickableObjects}
//             onObjectClick={handleObjectClick}
//             fpMode={fpMode}
//           />

//           {fpMode ? (
//             <>
//               <PointerLockControls
//                 onLock={() => {
//                   console.log("Pointer locked");
//                   setFpMode(true);
//                 }}
//                 onUnlock={() => {
//                   console.log("Pointer unlocked");
//                   setFpMode(false);
//                 }}
//               />
//               <FirstPersonMovement enabled={fpMode} />
//             </>
//           ) : (
//             <OrbitControls
//               enableDamping
//               dampingFactor={0.05}
//               enablePan
//               minDistance={0.5}
//               maxDistance={50}
//               minPolarAngle={0}
//               maxPolarAngle={Math.PI}
//               target={[0, 1, 0]}
//             />
//           )}
//         </Suspense>
//       </Canvas>

//       <InfoPanel info={info} onClose={() => setInfo(null)} />

//       <button
//         onClick={() => setFpMode((prev) => !prev)}
//         style={{
//           position: "fixed",
//           bottom: 30,
//           left: 30,
//           background: fpMode ? "#ff9800" : "#0066cc",
//           color: "white",
//           border: "none",
//           padding: "12px 24px",
//           borderRadius: 8,
//           fontWeight: 600,
//           fontSize: 16,
//           cursor: "pointer",
//           zIndex: 100,
//         }}
//       >
//         {fpMode ? "Exit First Person (ESC)" : "Enter First Person (Click)"}
//       </button>
//     </div>
//   );
// };

// // Preload the GLTF model
// useGLTF.preload("/public/cupola_2/scene.glb");

// export default CupolaScene;

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

    // Clone the scene
    const modelClone = scene.clone(true);

    // Traverse and setup materials for transparency
    modelClone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        // Make materials transparent
        if (mesh.material) {
          const material = mesh.material as THREE.MeshStandardMaterial;
          const materialName = material.name ? material.name.toLowerCase() : "";
          const meshName = mesh.name ? mesh.name.toLowerCase() : "";

          // Clone material to avoid affecting other instances
          mesh.material = material.clone();
          const mat = mesh.material as THREE.MeshStandardMaterial;

          // If it's glass/window, make it very transparent
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
            // For other parts, less transparent
            mat.transparent = true;
            mat.opacity = 0.85;
            mat.side = THREE.DoubleSide;
            mat.depthWrite = false;
          }

          console.log("Material:", materialName, "Mesh:", meshName);
        }
      }
    });

    // Calculate bounding box to center and scale properly
    const box = new THREE.Box3().setFromObject(modelClone);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    // Get the largest dimension
    const maxDim = Math.max(size.x, size.y, size.z) || 1;

    // Scale to fit nicely in view
    const targetSize = 5;
    const scale = targetSize / maxDim;
    modelClone.scale.setScalar(scale);

    // Rotate 180 degrees vertically (around X axis) BEFORE positioning
    modelClone.rotation.x = Math.PI;

    // Recalculate bounding box after rotation
    const rotatedBox = new THREE.Box3().setFromObject(modelClone);
    const rotatedCenter = rotatedBox.getCenter(new THREE.Vector3());

    // Center the model based on rotated position
    modelClone.position.set(
      -rotatedCenter.x,
      -rotatedCenter.y + 1.05,
      -rotatedCenter.z
    );

    // Clear and add to group
    while (groupRef.current.children.length > 0) {
      groupRef.current.remove(groupRef.current.children[0]);
    }
    groupRef.current.add(modelClone);

    // Collect clickable meshes
    const meshes: THREE.Mesh[] = [];
    modelClone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        meshes.push(child as THREE.Mesh);
      }
    });

    if (onMeshesLoaded) {
      onMeshesLoaded(meshes);
    }

    console.log("Cupola loaded! Size:", size, "Scale:", scale);
    console.log("Clickable objects:", meshes.length);
  }, [scene, onMeshesLoaded]);

  return <group ref={groupRef} />;
};

// Lights Component
const Lights: React.FC = () => {
  return (
    <>
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
      // Don't handle clicks in pointer lock mode
      if (fpMode) return;

      // Calculate mouse position in normalized device coordinates
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      // Update raycaster
      raycaster.setFromCamera(mouse, camera);

      // Check for intersections
      const intersects = raycaster.intersectObjects(clickableObjects, true);

      if (intersects.length > 0) {
        const clickedObject = intersects[0].object;
        console.log("Clicked on:", clickedObject.name || "unnamed object");
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

// Instructions Panel Component
interface InstructionsPanelProps {
  onHide: () => void;
}

const InstructionsPanel: React.FC<InstructionsPanelProps> = ({ onHide }) => {
  return (
    <div
      style={{
        position: "fixed",
        top: 20,
        left: 20,
        background: "rgba(0, 0, 0, 0.85)",
        backdropFilter: "blur(10px)",
        color: "white",
        padding: "20px 25px",
        borderRadius: 12,
        border: "1px solid rgba(100, 150, 255, 0.4)",
        maxWidth: 320,
        zIndex: 100,
        fontFamily: "'Segoe UI', Arial, sans-serif",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.5)",
      }}
    >
      <h2
        style={{
          margin: "0 0 15px 0",
          color: "#66bbff",
          fontSize: 18,
          fontWeight: 600,
        }}
      >
        Controls
      </h2>

      <div style={{ marginBottom: 12 }}>
        <strong style={{ color: "#88ccff" }}>Orbit Mode (Default):</strong>
        <ul style={{ margin: "5px 0", paddingLeft: 20, lineHeight: 1.6 }}>
          <li>
            <strong>Left Mouse:</strong> Rotate view
          </li>
          <li>
            <strong>Right Mouse:</strong> Pan
          </li>
          <li>
            <strong>Scroll:</strong> Zoom in/out
          </li>
          <li>
            <strong>Click Object:</strong> View details
          </li>
        </ul>
      </div>

      <div style={{ marginBottom: 12 }}>
        <strong style={{ color: "#88ccff" }}>First-Person Mode:</strong>
        <ul style={{ margin: "5px 0", paddingLeft: 20, lineHeight: 1.6 }}>
          <li>
            <strong>Press E:</strong> Enter FP mode
          </li>
          <li>
            <strong>W/A/S/D:</strong> Move around
          </li>
          <li>
            <strong>Mouse:</strong> Look around
          </li>
          <li>
            <strong>ESC:</strong> Exit FP mode
          </li>
        </ul>
      </div>

      <button
        onClick={onHide}
        style={{
          width: "100%",
          background: "#0066cc",
          color: "white",
          border: "none",
          padding: "8px 12px",
          borderRadius: 6,
          cursor: "pointer",
          fontWeight: 600,
          transition: "background 0.3s",
          marginTop: 5,
        }}
      >
        Hide Instructions
      </button>
    </div>
  );
};

// Info Panel Component
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
        top: "50%",
        right: 30,
        transform: "translateY(-50%)",
        background: "rgba(0, 0, 0, 0.8)",
        backdropFilter: "blur(10px)",
        color: "white",
        padding: 20,
        borderRadius: 10,
        border: "1px solid rgba(100, 150, 255, 0.5)",
        maxWidth: 300,
        zIndex: 150,
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h3 style={{ marginTop: 0, color: "#66bbff" }}>Object Details</h3>
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
          cursor: "pointer",
        }}
      >
        Close
      </button>
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
  const [showInstructions, setShowInstructions] = useState(true);

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

  // Handle E key to enter FP mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "KeyE" && !fpMode) {
        setFpMode(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
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
        camera={{
          position: cameraPosition,
          fov: 45,
          near: 0.01,
          far: 1000,
        }}
        shadows
        gl={{
          antialias: true,
          pixelRatio: window.devicePixelRatio,
        }}
      >
        <color attach="background" args={["#000000"]} />

        <Suspense
          fallback={
            <Html center>
              <div style={{ color: "white", fontSize: "20px" }}>
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
                onLock={() => {
                  console.log("Pointer locked - Press ESC to exit");
                  setFpMode(true);
                }}
                onUnlock={() => {
                  console.log("Pointer unlocked");
                  setFpMode(false);
                }}
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

      {/* Instructions Panel */}
      {showInstructions ? (
        <InstructionsPanel onHide={() => setShowInstructions(false)} />
      ) : (
        <button
          onClick={() => setShowInstructions(true)}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "rgba(0, 102, 204, 1)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "rgba(0, 102, 204, 0.9)")
          }
          style={{
            position: "fixed",
            top: 20,
            left: 20,
            background: "rgba(0, 102, 204, 0.9)",
            color: "white",
            border: "none",
            padding: "10px 16px",
            borderRadius: "50%",
            cursor: "pointer",
            fontSize: 20,
            fontWeight: "bold",
            zIndex: 100,
            transition: "background 0.3s",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.3)",
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

// Preload the GLTF model
useGLTF.preload("/public/cupola_2/scene.glb");

export default CupolaScene;
