import { useState, useEffect } from 'react';
import { Satellite } from 'lucide-react';

export function ISSTracker() {
  const [position, setPosition] = useState({ lat: 0, lon: 0 });
  const [velocity, setVelocity] = useState(7.66); // km/s average

  useEffect(() => {
    // Simulate ISS position updates (in a real app, this would call the ISS API)
    const interval = setInterval(() => {
      setPosition({
        lat: Math.sin(Date.now() / 10000) * 51.6, // ISS orbital inclination is 51.6°
        lon: ((Date.now() / 100) % 360) - 180,
      });
      setVelocity(7.66 + (Math.random() - 0.5) * 0.1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="hidden lg:flex items-center gap-2 bg-accent/50 px-4 py-2 rounded-lg border border-border">
      <Satellite className="h-4 w-4 text-[#0B3D91] animate-pulse" />
      <div className="text-xs">
        <div className="font-semibold">ISS Position</div>
        <div className="text-muted-foreground">
          {position.lat.toFixed(2)}°, {position.lon.toFixed(2)}° • {velocity.toFixed(2)} km/s
        </div>
      </div>
    </div>
  );
}
