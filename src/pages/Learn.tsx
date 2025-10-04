import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Eye, Rocket, Lightbulb, FileText, ClipboardCheck, BookOpen } from 'lucide-react';

export function Learn() {
  const lessons = [
    {
      id: 'earth-view',
      title: 'Seeing Earth from Above',
      icon: Eye,
      summary: 'Discover how astronauts observe Earth from the ISS Cupola and learn about the unique perspective space provides for environmental monitoring and scientific research.',
      level: 'Beginner',
      duration: '45 min',
      topics: ['Earth Observation', 'Photography', 'Climate Science'],
    },
    {
      id: 'microgravity',
      title: 'Living Without Gravity',
      icon: Rocket,
      summary: 'Explore the challenges and wonders of life in microgravity. Understand how astronauts adapt to weightlessness and conduct experiments in this unique environment.',
      level: 'Intermediate',
      duration: '60 min',
      topics: ['Physics', 'Human Biology', 'Space Medicine'],
    },
    {
      id: 'space-research',
      title: 'How Space Research Helps Earth',
      icon: Lightbulb,
      summary: 'Learn how ISS research and technologies developed for space exploration have practical applications that improve life on Earth, from medicine to materials science.',
      level: 'Advanced',
      duration: '75 min',
      topics: ['Innovation', 'Technology Transfer', 'Applied Science'],
    },
  ];

  const studentResources = [
    {
      title: 'Interactive Simulations',
      description: 'Hands-on activities to understand space concepts',
      items: ['Orbital Mechanics', 'Cupola View Simulator', 'Microgravity Lab'],
    },
    {
      title: 'Video Lessons',
      description: 'Curated content from NASA and astronauts',
      items: ['ISS Tours', 'Astronaut Interviews', 'Science Demonstrations'],
    },
    {
      title: 'Assessment Tools',
      description: 'Quizzes and projects to test understanding',
      items: ['Knowledge Checks', 'Research Projects', 'Peer Discussions'],
    },
  ];

  return (
    <div className="min-h-screen pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1>Educational Dashboard</h1>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
            Comprehensive learning resources for teachers and students exploring space science, 
            the ISS, and astronaut training.
          </p>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="lessons" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-2xl mx-auto">
            <TabsTrigger value="lessons">Lessons</TabsTrigger>
            <TabsTrigger value="students">For Students</TabsTrigger>
            <TabsTrigger value="teachers">For Teachers</TabsTrigger>
          </TabsList>

          {/* Lessons Tab */}
          <TabsContent value="lessons" className="space-y-8 mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {lessons.map((lesson) => (
                <Card key={lesson.id} className="p-6 space-y-6 hover:shadow-xl transition-shadow flex flex-col">
                  <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-[#0B3D91]/10 flex items-center justify-center">
                        <lesson.icon className="h-6 w-6 text-[#0B3D91]" />
                      </div>
                      <div>
                        <h3 className="text-lg">{lesson.title}</h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <span className="bg-accent px-2 py-0.5 rounded">{lesson.level}</span>
                          <span>{lesson.duration}</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground">{lesson.summary}</p>

                    <div className="flex flex-wrap gap-1">
                      {lesson.topics.map((topic) => (
                        <span key={topic} className="text-xs bg-accent px-2 py-1 rounded-full">
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-4 border-t">
                    <Button variant="outline" size="sm" className="text-xs">
                      <FileText className="h-3 w-3 mr-1" />
                      PDF
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs">
                      <ClipboardCheck className="h-3 w-3 mr-1" />
                      Quiz
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs">
                      <BookOpen className="h-3 w-3 mr-1" />
                      Cards
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students" className="space-y-8 mt-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {studentResources.map((resource) => (
                <Card key={resource.title} className="p-6 space-y-4">
                  <div>
                    <h3 className="text-lg">{resource.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{resource.description}</p>
                  </div>
                  <ul className="space-y-2">
                    {resource.items.map((item) => (
                      <li key={item} className="text-sm flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#0B3D91]" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full bg-[#0B3D91] hover:bg-[#0B3D91]/90">
                    Explore Resources
                  </Button>
                </Card>
              ))}
            </div>

            <Card className="p-8 bg-gradient-to-br from-[#0B3D91]/5 to-transparent">
              <div className="max-w-2xl">
                <h3 className="text-xl mb-4">Learning Path Recommendation</h3>
                <p className="text-muted-foreground mb-6">
                  Start with "Seeing Earth from Above" to understand orbital perspectives, then progress to 
                  "Living Without Gravity" for physics concepts, and finally explore "How Space Research Helps Earth" 
                  to connect space science with real-world applications.
                </p>
                <Button className="bg-[#0B3D91] hover:bg-[#0B3D91]/90">
                  Start Learning Journey
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* Teachers Tab */}
          <TabsContent value="teachers" className="space-y-8 mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6 space-y-4">
                <h3 className="text-xl">Lesson Plans</h3>
                <p className="text-sm text-muted-foreground">
                  Download complete lesson plans aligned with NGSS standards, including learning objectives, 
                  activities, and assessment rubrics.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#0B3D91]" />
                    Standards-aligned curriculum
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#0B3D91]" />
                    Differentiation strategies
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#0B3D91]" />
                    Extension activities
                  </li>
                </ul>
                <Button className="w-full bg-[#0B3D91] hover:bg-[#0B3D91]/90">
                  Download All Plans
                </Button>
              </Card>

              <Card className="p-6 space-y-4">
                <h3 className="text-xl">Classroom Activities</h3>
                <p className="text-sm text-muted-foreground">
                  Engaging hands-on activities that bring space science into your classroom, 
                  from simple demonstrations to complex projects.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#0B3D91]" />
                    Low-cost materials list
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#0B3D91]" />
                    Step-by-step guides
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#0B3D91]" />
                    Safety considerations
                  </li>
                </ul>
                <Button className="w-full bg-[#0B3D91] hover:bg-[#0B3D91]/90">
                  Browse Activities
                </Button>
              </Card>

              <Card className="p-6 space-y-4">
                <h3 className="text-xl">Assessment Tools</h3>
                <p className="text-sm text-muted-foreground">
                  Comprehensive assessment resources including quizzes, rubrics, and project guidelines 
                  to evaluate student understanding.
                </p>
                <Button className="w-full bg-[#0B3D91] hover:bg-[#0B3D91]/90">
                  Access Assessments
                </Button>
              </Card>

              <Card className="p-6 space-y-4">
                <h3 className="text-xl">Professional Development</h3>
                <p className="text-sm text-muted-foreground">
                  Resources to deepen your own understanding of space science and effective 
                  teaching strategies for STEM education.
                </p>
                <Button className="w-full bg-[#0B3D91] hover:bg-[#0B3D91]/90">
                  Explore Resources
                </Button>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
