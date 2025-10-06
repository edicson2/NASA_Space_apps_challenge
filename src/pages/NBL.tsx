import { useState } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Play, Droplets, Waves, ExternalLink } from "lucide-react";
import { AspectRatio } from "../components/ui/aspect-ratio";

export function NBL() {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 50, y: 50 });

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setPosition({
        x: Math.max(5, Math.min(95, x)),
        y: Math.max(5, Math.min(95, y)),
      });
    }
  };
  const comparisons = [
    {
      aspect: "Pressure",
      underwater: "1-2 atmospheres",
      space: "Vacuum (0 atm)",
    },
    {
      aspect: "Movement",
      underwater: "Neutral buoyancy",
      space: "True weightlessness",
    },
    {
      aspect: "Duration",
      underwater: "6-7 hours typical",
      space: "6-8 hours EVA",
    },
    {
      aspect: "Visibility",
      underwater: "Limited by water clarity",
      space: "Crystal clear",
    },
    {
      aspect: "Temperature",
      underwater: "~30°C (86°F)",
      space: "-157°C to 121°C",
    },
  ];

  // Earth benefits section removed per request

  return (
    <div className="min-h-screen pt-24 pb-12">
      {/* Hero Section with Pool Background */}
      <div
        className="relative h-[40vh] bg-cover bg-center"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1533774121866-e73552547cfe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc3Ryb25hdXQlMjB1bmRlcndhdGVyJTIwdHJhaW5pbmclMjBwb29sfGVufDF8fHx8MTc1OTU5MzU5NHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral')`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a4a7a]/80 to-background" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white space-y-4 px-6">
            <Droplets className="h-16 w-16 mx-auto" />
            <h1 className="text-5xl">Neutral Buoyancy Laboratory</h1>
            <p className="text-xl max-w-2xl">
              Training astronauts underwater to prepare for the challenges of
              spacewalks
            </p>
          </div>
        </div>
      </div>

  <div className="max-w-7xl mx-auto px-6 -mt-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Video Player */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl">Astronaut Training Video</h2>
                <a
                  href="https://www.youtube.com/watch?v=4514z--Zbfk"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-[#0B3D91] hover:underline"
                >
                  Watch on YouTube
                </a>
              </div>

              {/* Responsive YouTube embed */}
              <AspectRatio ratio={16 / 9}>
                <iframe
                  src="https://www.youtube.com/embed/4514z--Zbfk?rel=0&modestbranding=1&color=white"
                  title="Astronaut Training Video"
                  className="w-full h-full rounded-lg border"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </AspectRatio>

              <p className="text-sm text-muted-foreground">
                Watch astronauts practice spacewalk procedures in the world's
                largest indoor pool, located at NASA's Johnson Space Center. The
                NBL holds 6.2 million gallons of water and contains full-scale
                ISS modules.
              </p>
            </Card>

            

            {/* Inline Weightless Wonders Embed */}
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl">Weightless Wonders Game</h2>
                <a
                  href={`${import.meta.env.BASE_URL}games/weightless-wonders/index.html`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-[#0B3D91] hover:underline"
                >
                  Open in new tab <ExternalLink className="h-4 w-4" />
                </a>
              </div>
              <p className="text-sm text-muted-foreground">
                <strong>Play directly inside the page. Use W/A/S/D or Arrow keys to move. Press P to pause.</strong>
              </p>
              <p className="text-sm text-muted-foreground">
                Weightless Wonders is an immersive educational web game designed to teach players key concepts about gravity and movement in space.
              </p>
              {/* Slightly more vertical and horizontal space */}
              <div className="-mx-4 sm:-mx-6 md:-mx-8">
                <AspectRatio ratio={5 / 4}>
                  <iframe
                    src={`${import.meta.env.BASE_URL}games/weightless-wonders/index.html`}
                    title="Weightless Wonders Game"
                    className="w-full h-full rounded-md border"
                    allow="autoplay; fullscreen"
                  />
                </AspectRatio>
              </div>
            </Card>
          </div>

          {/* Right Column: Info Panel */}
          <div className="space-y-6">
            <Card className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Waves className="h-5 w-5 text-[#0B3D91]" />
                <h3 className="text-xl">About the NBL</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                The Neutral Buoyancy Laboratory is NASA's premier astronaut
                training facility. By carefully adjusting weights on the
                spacesuit, trainers create a neutral buoyancy environment that
                closely simulates the weightlessness experienced during
                spacewalks.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Pool Depth</span>
                  <span>40 feet (12.2 m)</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Water Volume</span>
                  <span>6.2 million gallons</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Location</span>
                  <span>Houston, TX</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">
                    Training Duration
                  </span>
                  <span>6-7 hours typical</span>
                </div>
              </div>
            </Card>

            {/* Comparison Table */}
            <Card className="p-6 space-y-4">
              <h3 className="text-xl">Underwater vs. Space</h3>
              <div className="space-y-2 text-sm">
                {comparisons.map((item, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-3 gap-2 py-2 border-b border-border last:border-0"
                  >
                    <span className="font-semibold">{item.aspect}</span>
                    <span className="text-muted-foreground text-xs">
                      {item.underwater}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {item.space}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Earth Benefits Section removed */}
      </div>
    </div>
  );
}
