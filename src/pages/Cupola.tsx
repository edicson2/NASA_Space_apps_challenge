import { useState, useEffect } from "react";
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
  RefreshCw,
  Calendar,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import CupolaEarthSimulation from "../components/couplaFiles/CupolaEarthSimulation";
import CupolaScene from "./CupolaScene";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../components/ui/carousel";

// NASA API types
interface NASAImageData {
  nasa_id: string;
  title: string;
  description?: string;
  date_created: string;
  keywords?: string[];
  center?: string;
  photographer?: string;
}

interface NASAImageItem {
  data: NASAImageData[];
  links?: Array<{ href: string; rel: string; render?: string }>;
  href: string;
}

interface NASAImage {
  nasa_id: string;
  title: string;
  description: string;
  thumbnail: string;
  date: string;
  keywords: string[];
  photographer?: string;
}

export function Cupola({
  onNavigate,
}: {
  onNavigate?: (page: string) => void;
}) {
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [nasaImages, setNasaImages] = useState<NASAImage[]>([]);
  const [allNasaImages, setAllNasaImages] = useState<NASAImage[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [carouselLoading, setCarouselLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<NASAImage | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  // Fetch NASA images related to Cupola and ISS Earth views
  const fetchNASAImages = async (page = 1, pageSize = 50) => {
    if (page === 1) {
      setLoading(true);
      setError(null);
      setCurrentPage(1);
      setCurrentImageIndex(0);
    } else {
      setCarouselLoading(true);
    }

    try {
      // Search for Cupola and ISS Earth observation images
      const response = await fetch(
        `https://images-api.nasa.gov/search?q=ISS cupola earth&media_type=image&page=${page}&page_size=${pageSize}`
      );

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();

      if (data.collection?.items) {
        const images: NASAImage[] = data.collection.items
          .filter((item: NASAImageItem) => item.links && item.links.length > 0)
          .map((item: NASAImageItem) => ({
            nasa_id: item.data[0].nasa_id,
            title: item.data[0].title,
            description: item.data[0].description || "No description available",
            thumbnail: item.links?.[0]?.href || "",
            date: item.data[0].date_created,
            keywords: item.data[0].keywords || [],
            photographer: item.data[0].photographer,
          }));

        if (page === 1) {
          setAllNasaImages(images);
          setNasaImages(images.slice(0, 4));
        } else {
          setAllNasaImages((prev) => [...prev, ...images]);
        }
      } else if (page === 1) {
        throw new Error("No images found");
      }
    } catch (err) {
      console.error("Error fetching NASA images:", err);
      if (page === 1) {
        setError("Failed to load NASA images. Using fallback gallery.");
        // Fallback to placeholder images
        const fallbackImages = [
          {
            nasa_id: "fallback-1",
            title: "ISS Cupola View",
            description: "View from the International Space Station Cupola",
            thumbnail:
              "https://images.unsplash.com/photo-1722850998715-91dcb2b7d327?w=400",
            date: new Date().toISOString(),
            keywords: ["ISS", "Cupola"],
          },
          {
            nasa_id: "fallback-2",
            title: "Earth Observation",
            description: "Earth observation from ISS",
            thumbnail:
              "https://images.unsplash.com/photo-1685427454855-8291928a6d7d?w=400",
            date: new Date().toISOString(),
            keywords: ["Earth", "ISS"],
          },
          {
            nasa_id: "fallback-3",
            title: "Cupola Window",
            description: "ISS Cupola observation module",
            thumbnail:
              "https://images.unsplash.com/photo-1636565214233-6d1019dfbc36?w=400",
            date: new Date().toISOString(),
            keywords: ["Cupola"],
          },
          {
            nasa_id: "fallback-4",
            title: "Space View",
            description: "View from space",
            thumbnail:
              "https://images.unsplash.com/photo-1688413399498-e35ed74b554f?w=400",
            date: new Date().toISOString(),
            keywords: ["Space"],
          },
        ];
        setAllNasaImages(fallbackImages);
        setNasaImages(fallbackImages);
      }
    } finally {
      if (page === 1) {
        setLoading(false);
      } else {
        setCarouselLoading(false);
      }
    }
  };

  // Handle next images in carousel
  const handleNextImages = async () => {
    const nextIndex = currentImageIndex + 4;

    // If we need more images and haven't exhausted the API
    if (nextIndex >= allNasaImages.length && currentPage < 50) {
      await fetchNASAImages(currentPage + 1);
      setCurrentPage((prev) => prev + 1);
    }

    // Check if we've reached the end of all available images
    if (nextIndex >= allNasaImages.length) {
      // Reset to beginning
      setCurrentImageIndex(0);
      setNasaImages(allNasaImages.slice(0, 4));
    } else {
      // Show next 4 images
      setCurrentImageIndex(nextIndex);
      setNasaImages(allNasaImages.slice(nextIndex, nextIndex + 4));
    }
  };

  // Handle previous images in carousel
  const handlePrevImages = () => {
    const prevIndex = currentImageIndex - 4;

    if (prevIndex < 0) {
      // Go to the last set of images
      const lastSetIndex = Math.floor((allNasaImages.length - 1) / 4) * 4;
      setCurrentImageIndex(lastSetIndex);
      setNasaImages(allNasaImages.slice(lastSetIndex, lastSetIndex + 4));
    } else {
      setCurrentImageIndex(prevIndex);
      setNasaImages(allNasaImages.slice(prevIndex, prevIndex + 4));
    }
  };

  useEffect(() => {
    fetchNASAImages();
  }, []);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Date unavailable";
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <Eye className="h-16 w-16 mx-auto text-[#0B3D91]" />
          <h1 className="text-4xl font-bold">ISS Cupola Observatory</h1>
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
                <h2 className="text-2xl font-semibold">Cupola 3D Viewer</h2>
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
                    size="sm"
                    className="bg-[#0B3D91] text-white hover:bg-[#0B3D91]/90"
                    onClick={() => onNavigate && onNavigate("cupola-viewer")}
                  >
                    Open Interactive 3D
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

            {/* NASA Photo Gallery with API Integration */}
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">
                  NASA Cupola Photo Gallery
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchNASAImages()}
                  disabled={loading}
                >
                  <RefreshCw
                    className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
                  />
                  Refresh
                </Button>
              </div>

              {error && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
                  {error}
                </div>
              )}

              {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="aspect-square rounded-lg bg-gray-200 animate-pulse"
                    />
                  ))}
                </div>
              ) : (
                <div className="relative">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {nasaImages.map((image) => (
                      <Dialog key={image.nasa_id}>
                        <DialogTrigger asChild>
                          <div
                            className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform shadow-lg group relative"
                            onClick={() => setSelectedImage(image)}
                          >
                            <ImageWithFallback
                              src={image.thumbnail}
                              alt={image.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                              <Eye className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <div className="absolute bottom-2 left-2 right-2 bg-black/80 backdrop-blur-sm rounded px-2 py-1">
                              <p className="text-white text-xs font-medium truncate">
                                {image.title}
                              </p>
                              <p className="text-white/70 text-xs">
                                {formatDate(image.date)}
                              </p>
                            </div>
                          </div>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl">
                          <DialogHeader>
                            <DialogTitle className="text-xl">
                              {image.title}
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <img
                              src={image.thumbnail}
                              alt={image.title}
                              className="w-full rounded-lg"
                            />
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                <span>{formatDate(image.date)}</span>
                                {image.photographer && (
                                  <>
                                    <span>•</span>
                                    <Camera className="h-4 w-4" />
                                    <span>{image.photographer}</span>
                                  </>
                                )}
                              </div>
                              <p className="text-muted-foreground leading-relaxed">
                                {image.description.length > 200
                                  ? `${image.description.substring(0, 200)}...`
                                  : image.description}
                                {image.description.length > 200 && (
                                  <button
                                    onClick={() =>
                                      window.open(
                                        `https://images.nasa.gov/details-${image.nasa_id}`,
                                        "_blank"
                                      )
                                    }
                                    className="cursor-pointer text-[#0B3D91] hover:text-[#fff] underline mt-[10px] font-medium"
                                  >
                                    click here for full details
                                  </button>
                                )}
                              </p>
                              {image.keywords.length > 0 && (
                                <div className="flex flex-wrap gap-2 pt-2">
                                  {image.keywords
                                    .slice(0, 6)
                                    .map((keyword, idx) => (
                                      <span
                                        key={idx}
                                        className="px-2 py-1 bg-[#0B3D91]/10 text-[#0B3D91] rounded text-xs"
                                      >
                                        {keyword}
                                      </span>
                                    ))}
                                </div>
                              )}
                              <div className="flex gap-2 pt-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    window.open(
                                      `https://images.nasa.gov/details-${image.nasa_id}`,
                                      "_blank"
                                    )
                                  }
                                >
                                  View on NASA.gov
                                </Button>
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    ))}
                  </div>

                  {/* Navigation buttons */}
                  <div
                    className="flex justify-center items-center gap-4"
                    style={{ marginTop: "10px" }}
                  >
                    <Button
                      onClick={handlePrevImages}
                      disabled={carouselLoading}
                      className="bg-[#0B3D91] hover:bg-[#0B3D91]/90 text-white"
                      size="sm"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>
                        {Math.floor(currentImageIndex / 4) + 1} of{" "}
                        {Math.ceil(allNasaImages.length / 4)}
                      </span>
                      {carouselLoading && (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      )}
                    </div>

                    <Button
                      onClick={handleNextImages}
                      disabled={carouselLoading}
                      className="bg-[#0B3D91] hover:bg-[#0B3D91]/90 text-white"
                      size="sm"
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Right: Info Panel */}
          <div className="space-y-6">
            <Card className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-[#0B3D91]" />
                <h3 className="text-xl font-semibold">
                  Current Earth Location
                </h3>
              </div>

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
              <h3 className="text-xl font-semibold">Cupola Facts</h3>
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
            <h2 className="text-3xl font-bold">How Cupola Benefits Earth</h2>
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
                  <h3 className="text-xl font-semibold">{benefit.title}</h3>
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
