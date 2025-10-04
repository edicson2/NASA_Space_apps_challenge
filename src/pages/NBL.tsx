import { useState } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Play, Droplets, Users, Waves, Heart, Cpu } from 'lucide-react';

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
      setPosition({ x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)) });
    }
  };

  const comparisons = [
    { aspect: 'Pressure', underwater: '1-2 atmospheres', space: 'Vacuum (0 atm)' },
    { aspect: 'Movement', underwater: 'Neutral buoyancy', space: 'True weightlessness' },
    { aspect: 'Duration', underwater: '6-7 hours typical', space: '6-8 hours EVA' },
    { aspect: 'Visibility', underwater: 'Limited by water clarity', space: 'Crystal clear' },
    { aspect: 'Temperature', underwater: '~30°C (86°F)', space: '-157°C to 121°C' },
  ];

  const earthBenefits = [
    {
      icon: Cpu,
      title: 'Underwater Robotics',
      description: 'NBL-developed technologies advance ROV capabilities for deep-sea exploration and industrial applications.',
    },
    {
      icon: Heart,
      title: 'Medical Simulation',
      description: 'Training techniques from NBL improve surgical procedures and emergency medical response protocols.',
    },
    {
      icon: Users,
      title: 'Team Coordination',
      description: 'Communication strategies developed for astronauts enhance crisis management and team performance.',
    },
  ];

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
              Training astronauts underwater to prepare for the challenges of spacewalks
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Video Player */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl">Astronaut Training Video</h2>
                <Button size="sm" className="bg-[#0B3D91] hover:bg-[#0B3D91]/90">
                  <Play className="h-4 w-4 mr-2" />
                  Watch Full Session
                </Button>
              </div>
              
              <div className="aspect-video bg-gradient-to-br from-[#0a4a7a] to-[#0B3D91] rounded-lg flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                  {[...Array(20)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-2 h-2 bg-white rounded-full animate-pulse"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 2}s`,
                        animationDuration: `${2 + Math.random() * 2}s`,
                      }}
                    />
                  ))}
                </div>
                <Button size="lg" className="relative z-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm border-2 border-white/40">
                  <Play className="h-8 w-8 mr-2" />
                  Play Training Video
                </Button>
              </div>

              <p className="text-sm text-muted-foreground">
                Watch astronauts practice spacewalk procedures in the world's largest indoor pool, 
                located at NASA's Johnson Space Center. The NBL holds 6.2 million gallons of water 
                and contains full-scale ISS modules.
              </p>
            </Card>

            {/* Microgravity Simulation */}
            <Card className="p-6 space-y-4">
              <h2 className="text-2xl">Interactive Microgravity Simulation</h2>
              <p className="text-sm text-muted-foreground">
                Try dragging the astronaut around! In the NBL, divers adjust weights to achieve neutral buoyancy, 
                simulating the weightless environment of space.
              </p>
              
              <div 
                className="relative aspect-video bg-gradient-to-br from-[#0a4a7a]/20 to-[#0B3D91]/20 rounded-lg border-2 border-dashed border-border overflow-hidden cursor-move"
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
                  Drag the astronaut to simulate movement
                </div>
                
                <div
                  className="absolute w-16 h-16 cursor-grab active:cursor-grabbing transition-transform hover:scale-110"
                  style={{
                    left: `${position.x}%`,
                    top: `${position.y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  onMouseDown={handleMouseDown}
                >
                  <Users className="w-full h-full text-[#0B3D91] drop-shadow-lg" />
                </div>

                {/* Floating bubbles effect */}
                {[...Array(15)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-3 h-3 bg-white/30 rounded-full animate-pulse"
                    style={{
                      left: `${Math.random() * 100}%`,
                      bottom: '-10%',
                      animation: `float ${5 + Math.random() * 5}s infinite ease-in-out`,
                      animationDelay: `${Math.random() * 3}s`,
                    }}
                  />
                ))}
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
                The Neutral Buoyancy Laboratory is NASA's premier astronaut training facility. 
                By carefully adjusting weights on the spacesuit, trainers create a neutral buoyancy 
                environment that closely simulates the weightlessness experienced during spacewalks.
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
                  <span className="text-muted-foreground">Training Duration</span>
                  <span>6-7 hours typical</span>
                </div>
              </div>
            </Card>

            {/* Comparison Table */}
            <Card className="p-6 space-y-4">
              <h3 className="text-xl">Underwater vs. Space</h3>
              <div className="space-y-2 text-sm">
                {comparisons.map((item, index) => (
                  <div key={index} className="grid grid-cols-3 gap-2 py-2 border-b border-border last:border-0">
                    <span className="font-semibold">{item.aspect}</span>
                    <span className="text-muted-foreground text-xs">{item.underwater}</span>
                    <span className="text-muted-foreground text-xs">{item.space}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Earth Benefits Section */}
        <div className="mt-12 space-y-6">
          <div className="text-center">
            <h2 className="text-3xl">How NBL Research Benefits Earth</h2>
            <p className="text-muted-foreground mt-2">
              Technologies and techniques developed for astronaut training have far-reaching applications
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {earthBenefits.map((benefit) => (
              <Card key={benefit.title} className="p-6 space-y-4 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 rounded-lg bg-[#0B3D91]/10 flex items-center justify-center">
                  <benefit.icon className="h-6 w-6 text-[#0B3D91]" />
                </div>
                <h3 className="text-xl">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0% { transform: translateY(0) translateX(0); opacity: 0.3; }
          50% { transform: translateY(-200px) translateX(20px); opacity: 0.6; }
          100% { transform: translateY(-400px) translateX(-10px); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
