import React from "react";
import { Button } from "../components/ui/button";
import { ArrowLeft } from "lucide-react";
import CupolaScene from "./CupolaScene";

export default function CupolaViewer({
  onNavigate,
}: {
  onNavigate?: (page: string) => void;
}) {
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
              Interactive Cupola Viewer
            </h1>
          </div>
        </div>
      </header>

      {/* Main 3D Scene - fills remaining space */}
      {/* <main className="flex-1 relative overflow-hidden min-h-0">
        <CupolaScene />
      </main> */}
      <div className="">
        <CupolaScene />
      </div>
      {/* Footer */}
      <footer className="flex-shrink-0 px-6 py-3 border-t border-border bg-background">
        <div className="max-w-7xl mx-auto">
          <p className="text-sm text-muted-foreground">
            Use Orbit controls or press E to enter first-person mode. Click
            objects to view details.
          </p>
        </div>
      </footer>
    </div>
  );
}
