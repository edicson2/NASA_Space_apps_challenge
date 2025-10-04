import { useState } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  RotateCw,
  ZoomIn,
  ZoomOut,
  Eye,
  MapPin,
  Camera,
  Satellite,
  Cloud,
  AlertTriangle,
  Lightbulb,
} from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
// Import the local SVG asset for the simulated map grid
// Place your SVG file at src/assets/grid.svg
// NOTE: replaced static import with inline data URI to avoid missing-file errors
export function Cupola() {
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);

  // Inline SVG grid data URI (small repeating grid). Safe fallback when ../assets/grid.svg is missing.
  const gridSvgString = `<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'>
    <rect width='100%' height='100%' fill='transparent'/>
    <g stroke='rgba(255,255,255,0.06)' stroke-width='0.6'>
      <path d='M 40 0 L 0 0 0 40' />
      <path d='M 20 0 L 20 40 M 0 20 L 40 20' stroke='rgba(255,255,255,0.04)' stroke-width='0.5'/>
    </g>
  </svg>`;
  const gridDataUri = `data:image/svg+xml;utf8,${encodeURIComponent(
    gridSvgString
  )}`;

  const cupolaFacts = [
    { label: "Windows", value: "7 (6 side + 1 top)" },
    { label: "Diameter", value: "3 meters (9.8 ft)" },
    { label: "Installed", value: "February 2010" },
    { label: "Mass", value: "1,805 kg (3,979 lb)" },
    { label: "Purpose", value: "Earth observation & robotics" },
  ];

  const earthBenefits = [
    {
      icon: Camera,
      title: "Satellite Imaging",
      description:
        "Advanced imaging techniques refined through Cupola observations improve Earth monitoring satellites.",
    },
    {
      icon: AlertTriangle,
      title: "Disaster Monitoring",
      description:
        "Real-time disaster assessment capabilities help coordinate emergency response efforts worldwide.",
    },
    {
      icon: Cloud,
      title: "Climate Research",
      description:
        "Atmospheric and oceanic observations contribute to climate models and weather prediction.",
    },
  ];

  const gallery = [
    {
      id: 1,
      url: "https://images.unsplash.com/photo-1722850998715-91dcb2b7d327?w=400",
    },
    {
      id: 2,
      url: "https://images.unsplash.com/photo-1685427454855-8291928a6d7d?w=400",
    },
    {
      id: 3,
      url: "https://images.unsplash.com/photo-1636565214233-6d1019dfbc36?w=400",
    },
    {
      id: 4,
      url: "https://images.unsplash.com/photo-1688413399498-e35ed74b554f?w=400",
    },
  ];

  return (
    <div className="min-h-screen pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <Eye className="h-16 w-16 mx-auto text-[#0B3D91]" />
          <h1>ISS Cupola Observatory</h1>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
            The most stunning window to Earth, offering astronauts a 360-degree
            view of our planet and the cosmos beyond.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: 3D Viewer Area */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl">Cupola 3D Viewer</h2>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setRotation((r) => r - 15)}
                  >
                    <RotateCw className="h-4 w-4 mr-1" />
                    Rotate
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setZoom((z) => Math.min(z + 0.2, 2))}
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setZoom((z) => Math.max(z - 0.2, 0.6))}
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* 3D Viewer Placeholder */}
              <div className="relative aspect-square bg-gradient-to-br from-background to-accent rounded-lg overflow-hidden border-2 border-border">
                <div
                  className="absolute inset-0 flex items-center justify-center transition-transform duration-500"
                  style={{
                    transform: `rotate(${rotation}deg) scale(${zoom})`,
                  }}
                >
                  {/* Simplified Cupola visualization */}
                  <div className="relative w-64 h-64">
                    {/* Center window */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-gradient-to-br from-[#0B3D91] to-[#1e5bb8] border-4 border-white/20 shadow-2xl flex items-center justify-center">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 opacity-50" />
                    </div>

                    {/* Surrounding windows */}
                    {[0, 60, 120, 180, 240, 300].map((angle, i) => {
                      const rad = (angle * Math.PI) / 180;
                      const x = Math.cos(rad) * 100;
                      const y = Math.sin(rad) * 100;
                      return (
                        <div
                          key={i}
                          className="absolute w-16 h-20 rounded-lg bg-gradient-to-br from-[#0B3D91]/80 to-[#1e5bb8]/80 border-2 border-white/20 shadow-xl"
                          style={{
                            left: `calc(50% + ${x}px)`,
                            top: `calc(50% + ${y}px)`,
                            transform: "translate(-50%, -50%)",
                          }}
                        >
                          <div className="w-full h-full bg-gradient-to-br from-blue-400/30 to-blue-600/30 rounded-lg" />
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="absolute bottom-4 left-4 right-4 bg-background/80 backdrop-blur-sm rounded-lg p-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      Interactive 3D Model
                    </span>
                    <span className="text-[#0B3D91] font-semibold">
                      Rotation: {rotation}° | Zoom: {zoom.toFixed(1)}x
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                Use the controls above to rotate and zoom the Cupola model. The
                Cupola module provides astronauts with a panoramic view of Earth
                and is used for observing and guiding robotic operations.
              </p>
            </Card>

            {/* Photo Gallery */}
            <Card className="p-6 space-y-4">
              <h2 className="text-2xl">NASA Cupola Photo Gallery</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {gallery.map((photo) => (
                  <div
                    key={photo.id}
                    className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform shadow-lg"
                  >
                    <ImageWithFallback
                      src={photo.url}
                      alt={`Cupola view ${photo.id}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full">
                <Camera className="h-4 w-4 mr-2" />
                View Full Gallery
              </Button>
            </Card>
          </div>

          {/* Right: Info Panel */}
          <div className="space-y-6">
            <Card className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-[#0B3D91]" />
                <h3 className="text-xl">Current Earth Location</h3>
              </div>

              {/* Simulated map */}
              <div className="aspect-video bg-gradient-to-br from-blue-500 to-green-500 rounded-lg relative overflow-hidden">
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `url("${gridDataUri}")`,
                    backgroundRepeat: "repeat",
                    backgroundSize: "auto",
                  }}
                />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <Satellite className="h-8 w-8 text-white animate-pulse" />
                </div>
                <div className="absolute bottom-2 left-2 right-2 bg-black/50 backdrop-blur-sm rounded px-2 py-1 text-white text-xs">
                  <div>Lat: 25.84° N</div>
                  <div>Lon: -80.27° W</div>
                  <div className="text-white/60">Over: Atlantic Ocean</div>
                </div>
              </div>
            </Card>

            <Card className="p-6 space-y-4">
              <h3 className="text-xl">Cupola Facts</h3>
              <div className="space-y-2 text-sm">
                {cupolaFacts.map((fact, index) => (
                  <div
                    key={index}
                    className="flex justify-between py-2 border-b border-border last:border-0"
                  >
                    <span className="text-muted-foreground">{fact.label}</span>
                    <span className="font-semibold text-right">
                      {fact.value}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Did You Know Modal */}
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full bg-[#0B3D91] hover:bg-[#0B3D91]/90">
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Did You Know?
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Fascinating Cupola Facts</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 text-sm">
                  <div className="space-y-2">
                    <h4 className="font-semibold">
                      Most Photographed Location
                    </h4>
                    <p className="text-muted-foreground">
                      The Cupola is the most photographed location on the ISS,
                      capturing hundreds of thousands of images of Earth for
                      scientific research and public engagement.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Built in Italy</h4>
                    <p className="text-muted-foreground">
                      The Cupola was manufactured by the European Space Agency
                      in Turin, Italy, and launched to the ISS on Space Shuttle
                      Endeavour in 2010.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Robotic Control Center</h4>
                    <p className="text-muted-foreground">
                      Beyond observation, the Cupola serves as the primary
                      control station for the ISS robotic arm, crucial for
                      capturing visiting spacecraft and conducting repairs.
                    </p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Earth Benefits Section */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl">How Cupola Benefits Earth</h2>
            <p className="text-muted-foreground mt-2">
              Technologies and insights from the Cupola module improve life on
              our planet
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {earthBenefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <Card
                  key={benefit.title}
                  className="p-6 space-y-4 hover:shadow-lg transition-shadow"
                >
                  <div className="w-12 h-12 rounded-lg bg-[#0B3D91]/10 flex items-center justify-center">
                    <Icon className="h-6 w-6 text-[#0B3D91]" />
                  </div>
                  <h3 className="text-xl">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {benefit.description}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
