// CupolaViewer.jsx
import React from "react";
import { Button } from "../components/ui/button";
import { ArrowLeft } from "lucide-react";
import CupolaScene from "./CupolaScene";

export default function CupolaViewer({ onNavigate }) {
  return (
    <div className="flex flex-col h-full w-full bg-black">
      {/* Header */}
      <header className="flex-shrink-0 px-6 py-4 border-b border-border bg-background">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => onNavigate && onNavigate("cupola")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-semibold text-white">
              Interactive Cupola + Earth Viewer
            </h1>
          </div>
        </div>
      </header>

      {/* Scene container */}
      <div style={{ flex: 1, width: "100%", height: "100vh" }}>
        <CupolaScene />
      </div>

      {/* Footer */}
      <footer className="flex-shrink-0 px-6 py-3 border-t border-border bg-background">
        <div className="max-w-7xl mx-auto text-sm text-muted-foreground space-y-1">
          <p>
            Use <strong>OrbitControls</strong> to rotate and zoom, or press{" "}
            <strong>E</strong> to enter first-person mode inside the Cupola.
          </p>
          <p>
            Walk with <strong>W A S D</strong>, look around with the mouse, and
            press <strong>ESC</strong> to exit FP mode.
          </p>
          <p>
            Hover over the Earth to see <strong>latitude/longitude</strong>{" "}
            coordinates in real-time.
          </p>
        </div>
      </footer>
    </div>
  );
}
