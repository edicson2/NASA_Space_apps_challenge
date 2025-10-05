import { useState } from "react";
import { Card } from "../components/ui/card";
import CupolaScene from "./CupolaScene";

export function Cupola({
  onNavigate,
}: {
  onNavigate?: (page: string) => void;
}) {
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);

  return (
    <div className="w-full h-screen fixed inset-0">
      <CupolaScene />
    </div>
  );
}
