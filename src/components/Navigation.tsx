import { useState, useEffect, useRef } from "react";
import { Sun, Moon, Menu } from "lucide-react";
import { Button } from "./ui/button";
import { ISSTracker } from "./ISSTracker";
import { useIsMobile } from "./ui/use-mobile";
import styles from "../components/styles/navigation.module.css";

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  theme: "light" | "dark";
  onThemeToggle: () => void;
}

export function Navigation({
  currentPage,
  onNavigate,
  theme,
  onThemeToggle,
}: NavigationProps) {
  const isMobile = useIsMobile();
  const [isExpanded, setIsExpanded] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const navLinks = [
    { name: "Home", id: "home" },
    { name: "Cupola", id: "cupola" },
    { name: "NBL", id: "nbl" },
    // { name: "Learn", id: "learn" },
    // { name: "About", id: "about" },
  ];

  // Idle hide logic
  useEffect(() => {
    const showNav = () => setIsExpanded(true);
    const hideNav = () => {
      if (!isHovering) setIsExpanded(false);
    };

    const resetTimer = () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
      hideTimer.current = setTimeout(hideNav, 3000);
    };

    const handleActivity = () => {
      showNav();
      resetTimer();
    };

    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("click", handleActivity);
    window.addEventListener("keydown", handleActivity);
    window.addEventListener("scroll", handleActivity);

    resetTimer();

    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("click", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("scroll", handleActivity);
    };
  }, [isHovering]);

  return (
    <>
      {/* Collapsed Menu Ball */}
      {!isExpanded && (
        <div
          className={styles.collapsedMenu}
          onMouseEnter={() => {
            setIsHovering(true);
            setIsExpanded(true);
          }}
          onMouseLeave={() => setIsHovering(false)}
        >
          <button
            className={styles.menuButton}
            onClick={() => setIsExpanded(true)}
          >
            <Menu className="w-7 h-7 text-white drop-shadow-lg" />
          </button>
        </div>
      )}

      {/* Expanded Navigation */}
      {isExpanded && (
        <nav
          className={styles.navbar}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <div className="relative">
            {/* Glass & Shadow Layers */}
            <div
              className={`${styles.navBackground} ${
                theme === "dark" ? styles.dark : ""
              }`}
            />
            <div className={styles.backdropLayer} />
            <div className={styles.borderLayer} />
            <div className={styles.shadowLayer} />

            {/* Navbar Content */}
            <div className={styles.navContent}>
              {/* Logo */}
              <button
                onClick={() => onNavigate("home")}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                <img
                  src="/nasa/NASA_logo.png"
                  alt="NASA Logo"
                  className="w-10 h-10 object-cover rounded-full"
                />
                <span className={styles.logoText}>
                  Team Alpha Super Awesome Cool Dynamite Wolf Squadron
                </span>
              </button>

              {/* Desktop Links (only show on desktop) */}
              {!isMobile && (
                <div className={styles.navLinks}>
                  {navLinks.map((link) => (
                    <button
                      key={link.id}
                      onClick={() => onNavigate(link.id)}
                      className={`${styles.navLink} ${
                        currentPage === link.id
                          ? styles.active
                          : styles.inactive
                      }`}
                    >
                      {link.name}
                    </button>
                  ))}
                </div>
              )}

              {/* Right Controls */}
              {/* <div className={styles.rightControls}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onThemeToggle}
                  className={styles.themeButton}
                >
                  {theme === "dark" ? (
                    <Sun className="h-5 w-5" />
                  ) : (
                    <Moon className="h-5 w-5" />
                  )}
                </Button>
                <ISSTracker />
              </div> */}
            </div>

            {/* Mobile Links (only show on mobile) */}
            {isMobile && (
              <div className={styles.mobileLinks}>
                {navLinks.map((link) => (
                  <button
                    key={link.id}
                    onClick={() => onNavigate(link.id)}
                    className={`${styles.mobileLink} ${
                      currentPage === link.id ? styles.active : styles.inactive
                    }`}
                  >
                    {link.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </nav>
      )}
    </>
  );
}
