import { useState, useEffect, useRef } from "react";
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
  Cloud,
  AlertTriangle,
  Lightbulb,
  Satellite,
} from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import CupolaEarthSimulation from "../components/couplaFiles/CupolaEarthSimulation";
import CupolaScene from "./CupolaScene";
import { initCupola } from "../../main";

export function Cupola() {
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const containerRef = useRef<HTMLDivElement | null>(null);

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

  useEffect(() => {
    if (!containerRef.current) return;
    const instance = initCupola(containerRef.current);
    return () => instance.dispose();
  }, []);

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

              {/* Embedded CupolaScene */}
              <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-border bg-black">
                <div className="absolute inset-0">
                  <CupolaScene />
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

              {/* D3 Globe Simulation */}
              <div className="aspect-video flex items-center justify-center bg-black rounded-lg overflow-hidden relative">
                <CupolaEarthSimulation />
                <div className="absolute bottom-2 left-2 right-2 bg-black/50 backdrop-blur-sm rounded px-2 py-1 text-white text-xs text-center">
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
