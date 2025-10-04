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
    <div className="flex flex-col h-screen bg-red-900">
      <header className="px-6 py-4 border-b border-border">
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

      <main className="flex-1 w-full h-screen min-h-screen">
        <div className=" w-full h-full">
          <div className="w-full h-full rounded-none overflow-hidden">
            <CupolaScene />
          </div>
        </div>
      </main>

      <footer className="px-6 py-3">
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
