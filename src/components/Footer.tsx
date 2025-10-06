import { Github, Twitter, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-background border-t border-border mt-20">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {/* NASA Logo */}
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-[#0B3D91] flex items-center justify-center">
              <img
                src="https://science.nasa.gov/wp-content/themes/nasa-child/assets/images/nasa-logo.svg"
                alt="NASA Logo"
                // className="w-10 h-10 object-contain"
              />
            </div>
            <div>
              <div className="font-semibold">NASA</div>
              <div className="text-xs text-muted-foreground">
                Educational Resources
              </div>
            </div>
          </div>

          {/* Open Data Disclaimer */}
          <div className="text-center text-sm text-muted-foreground">
            <p>This educational platform uses NASA's open data and APIs.</p>
            <p className="mt-1">
              Alpha Super Awesome Cool Dynamite Wolf Squadron
            </p>
            <p className="mt-1 text-xs">
              Linh Tran • Joshua Onyema • Ishaq Omotosho • Edicson Garcia •
              Manuel Alejandro Vergas Peña
            </p>
            <p className="mt-2 text-xs">
              © 2025 Window to the World • NASA Space Apps Challenge 2025
            </p>
          </div>

          {/* Social Links */}
          <div className="flex items-center justify-end gap-4">
            <a
              href="https://github.com/edicson2/NASA_Space_apps_challenge"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
