import { Card } from "../components/ui/card";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { User, Database, Satellite, Globe } from "lucide-react";

export function About() {
  const team = [
    { name: "Linh Tran", role: "Project Lead", initials: "LT" },
    { name: "Edicson Garcia", role: "Data Engineer", initials: "EG" },
    { name: "Manuel Alejandro Peña", role: "Project Manager", initials: "MP" },
    { name: "Joshua Onyema", role: "UX Designer", initials: "JO" },
    { name: "Ishaq Omotosho", role: "Frontend Developer", initials: "IO" },
  ];

  const apis = [
    {
      name: "ISS Current Location API",
      icon: Satellite,
      description: "Real-time ISS position tracking",
      link: "https://api.nasa.gov",
    },
    {
      name: "NASA Image and Video Library",
      icon: Globe,
      description: "Access to NASA's media archives",
      link: "https://images.nasa.gov/docs/images.nasa.gov_api_docs.pdf",
    },
    {
      name: "Earth Observatory API",
      icon: Database,
      description: "Earth science data and imagery",
      link: "https://api.nasa.gov",
    },
  ];

  return (
    <div className="min-h-screen pt-24 pb-12 px-6">
      <div className="max-w-6xl mx-auto space-y-16">
        {/* NASA 25th Anniversary Section */}
        <section className="text-center space-y-6">
          <div className="inline-flex items-center gap-4 bg-gradient-to-r from-[#0B3D91] to-[#1e5bb8] px-12 py-8 rounded-2xl shadow-2xl">
            <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center">
              <svg
                className="w-12 h-12"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                  fill="#0B3D91"
                />
              </svg>
            </div>
            <div className="text-left text-white">
              <div className="text-sm opacity-90">Celebrating</div>
              <div className="text-3xl">NASA 25th Anniversary</div>
              <div className="text-sm opacity-90">
                International Space Station
              </div>
            </div>
          </div>

          <p className="text-muted-foreground max-w-3xl mx-auto">
            For over two decades, the International Space Station has been a
            beacon of international cooperation and scientific discovery. This
            educational platform celebrates NASA's achievements and makes space
            exploration accessible to learners worldwide.
          </p>
        </section>

        {/* Mission Statement */}
        <section className="text-center max-w-3xl mx-auto space-y-4">
          <h2>Our Mission</h2>
          <p className="text-muted-foreground">
            Window to the World is an educational initiative dedicated to
            bringing the wonder of space exploration into classrooms and homes.
            Through interactive experiences and real NASA data, we inspire the
            next generation of scientists, engineers, and explorers.
          </p>
        </section>

        {/* Development Team */}
        <section className="space-y-6">
          <div className="text-center">
            <h2>Development Team</h2>
            <p className="text-muted-foreground mt-2">
              Meet the passionate individuals behind this project
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member) => (
              <Card
                key={member.name}
                className="p-6 text-center space-y-4 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-center">
                  <Avatar className="h-20 w-20 bg-[#0B3D91]">
                    <AvatarFallback className="text-white text-xl">
                      {member.initials}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div>
                  <h3 className="text-lg">{member.name}</h3>
                  <p className="text-sm text-muted-foreground">{member.role}</p>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* NASA Open APIs */}
        <section className="space-y-6">
          <div className="text-center">
            <h2>NASA Open APIs & Data Sources</h2>
            <p className="text-muted-foreground mt-2">
              Powered by NASA's commitment to open data and public access
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {apis.map((api) => (
              <Card
                key={api.name}
                className="p-6 space-y-4 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-[#0B3D91]/10 flex items-center justify-center">
                    <api.icon className="h-6 w-6 text-[#0B3D91]" />
                  </div>
                  <h3 className="text-lg">{api.name}</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  {api.description}
                </p>
                <a
                  href={api.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-sm text-[#0B3D91] hover:underline"
                >
                  View Documentation →
                </a>
              </Card>
            ))}
          </div>
        </section>

        {/* Additional Info */}
        <section className="bg-accent/30 rounded-2xl p-8 text-center space-y-4">
          <h3>Open Source & Educational Use</h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            This project is built for educational purposes using publicly
            available NASA data. All content is freely accessible and designed
            to inspire learning about space exploration, science, and
            technology. We encourage educators to use these resources in their
            classrooms.
          </p>
        </section>
      </div>
    </div>
  );
}
