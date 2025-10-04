import { Sun, Moon } from 'lucide-react';
import { Button } from './ui/button';
import { ISSTracker } from './ISSTracker';

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
}

export function Navigation({ currentPage, onNavigate, theme, onThemeToggle }: NavigationProps) {
  const navLinks = [
    { name: 'Home', id: 'home' },
    { name: 'Cupola', id: 'cupola' },
    { name: 'NBL', id: 'nbl' },
    { name: 'Learn', id: 'learn' },
    { name: 'About', id: 'about' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left: Logo */}
          <button 
            onClick={() => onNavigate('home')}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="w-10 h-10 rounded-full bg-[#0B3D91] flex items-center justify-center">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="white"/>
              </svg>
            </div>
            <span className="font-semibold">Window to the World</span>
          </button>

          {/* Center: Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => onNavigate(link.id)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  currentPage === link.id
                    ? 'bg-[#0B3D91] text-white'
                    : 'text-foreground hover:bg-accent'
                }`}
              >
                {link.name}
              </button>
            ))}
          </div>

          {/* Right: Theme Toggle & ISS Tracker */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onThemeToggle}
              className="rounded-full"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
            
            <ISSTracker />
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex flex-wrap gap-2 mt-4">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => onNavigate(link.id)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                currentPage === link.id
                  ? 'bg-[#0B3D91] text-white'
                  : 'text-foreground hover:bg-accent'
              }`}
            >
              {link.name}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
