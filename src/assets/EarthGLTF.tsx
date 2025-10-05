// EarthGLTF.tsx
import React, { Suspense } from "react";
import { useGLTF, Html } from "@react-three/drei";

export default function EarthGLTF(props: { path?: string; scale?: number }) {
  const path = props.path ?? "/models/earth/scene.gltf";
  const { scene } = useGLTF(path) as any; // useGLTF typing ok in your TS project

  return (
    <Suspense fallback={<Html center>Loading Earth...</Html>}>
      <primitive object={scene} scale={props.scale ?? 1.5} />
    </Suspense>
  );
}
