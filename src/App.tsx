import { useState, useEffect } from "react";
import { Navigation } from "./components/Navigation";
import { Footer } from "./components/Footer";
import { About } from "./pages/About";
import { Learn } from "./pages/Learn";
import { NBL } from "./pages/NBL";
import { Cupola } from "./pages/Cupola";
import CupolaViewer from "./pages/CupolaViewer"; // <-- new import
import { Home } from "./pages/Home";

export default function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  // Initialize theme
  useEffect(() => {
    const savedTheme =
      (localStorage.getItem("theme") as "light" | "dark") || "dark";
    setTheme(savedTheme);
    document.documentElement.classList.toggle("dark", savedTheme === "dark");
  }, []);

  const handleThemeToggle = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return <Home onNavigate={handleNavigate} />;
      case "about":
        return <About />;
      case "learn":
        return <Learn />;
      case "nbl":
        return <NBL />;
      case "cupola":
        // pass navigation handler so Cupola can navigate to the viewer page
        return <Cupola onNavigate={handleNavigate} />;
      case "cupola-viewer":
        return (
          <div className="h-screen w-screen">
            <CupolaViewer onNavigate={handleNavigate} />
          </div>
        ); // new viewer page
      default:
        return <Home onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="max-h-full min-h-screen bg-background text-foreground">
      <Navigation
        currentPage={currentPage}
        onNavigate={handleNavigate}
        theme={theme}
        onThemeToggle={handleThemeToggle}
      />

      <main>{renderPage()}</main>

      {currentPage === "home" && <Footer />}
    </div>
  );
}
