import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLocation } from 'wouter';
import { ArrowLeft, Download, ExternalLink, FileText, Video, BookOpen, Lightbulb } from 'lucide-react';

const resources = [
  {
    id: 1,
    title: "AI Implementation Guide for Small Business",
    description: "Complete step-by-step guide to planning and implementing AI solutions in your business.",
    type: "PDF Guide",
    category: "Implementation",
    downloadUrl: "#",
    featured: true,
    pages: "24 pages"
  },
  {
    id: 2,
    title: "ROI Calculation Worksheet",
    description: "Excel template to calculate expected ROI from AI investments before implementation.",
    type: "Excel Template",
    category: "Planning",
    downloadUrl: "#",
    featured: false,
    pages: "3 worksheets"
  },
  {
    id: 3,
    title: "AI Readiness Assessment Checklist",
    description: "Evaluate if your business is ready for AI implementation with this comprehensive checklist.",
    type: "PDF Checklist",
    category: "Assessment",
    downloadUrl: "#",
    featured: false,
    pages: "8 pages"
  },
  {
    id: 4,
    title: "Industry-Specific AI Use Cases",
    description: "Real examples of AI applications across different industries with implementation details.",
    type: "PDF Report",
    category: "Examples",
    downloadUrl: "#",
    featured: true,
    pages: "32 pages"
  },
  {
    id: 5,
    title: "AI Vendor Evaluation Template",
    description: "Framework for evaluating and comparing AI solution providers and technologies.",
    type: "Word Template",
    category: "Vendor Selection",
    downloadUrl: "#",
    featured: false,
    pages: "12 pages"
  },
  {
    id: 6,
    title: "Employee Training Playbook",
    description: "Best practices for training your team on new AI tools and processes.",
    type: "PDF Playbook",
    category: "Training",
    downloadUrl: "#",
    featured: false,
    pages: "18 pages"
  }
];

const webinars = [
  {
    id: 1,
    title: "AI Fundamentals for Small Business Owners",
    description: "60-minute overview of AI technologies and their practical applications.",
    duration: "60 minutes",
    date: "Available On-Demand",
    videoUrl: "#"
  },
  {
    id: 2,
    title: "Calculating AI ROI: A Live Workshop",
    description: "Interactive session on measuring and projecting AI investment returns.",
    duration: "45 minutes",
    date: "Available On-Demand",
    videoUrl: "#"
  },
  {
    id: 3,
    title: "Common AI Implementation Pitfalls",
    description: "Learn from real case studies of what works and what doesn't.",
    duration: "50 minutes",
    date: "Available On-Demand",
    videoUrl: "#"
  }
];

const tools = [
  {
    id: 1,
    title: "AI Cost Calculator",
    description: "Interactive tool to estimate AI implementation costs for your business size.",
    type: "Web Tool",
    url: "/roi-calculator"
  },
  {
    id: 2,
    title: "Business Process Audit Template",
    description: "Identify which processes in your business could benefit from AI automation.",
    type: "Interactive Form",
    url: "#"
  },
  {
    id: 3,
    title: "AI Technology Comparison Chart",
    description: "Compare different AI technologies and their suitability for various business needs.",
    type: "Interactive Chart",
    url: "#"
  }
];

interface ResourceCardProps {
  resource: typeof resources[0];
}

const ResourceCard: React.FC<ResourceCardProps> = ({ resource }) => (
  <Card className={`bg-gray-800 border-gray-700 h-full ${resource.featured ? 'border-indigo-500' : ''}`}>
    {resource.featured && (
      <div className="bg-indigo-600 text-white text-center py-2 text-sm font-semibold rounded-t-lg">
        Featured Resource
      </div>
    )}
    <CardHeader>
      <div className="flex justify-between items-start mb-2">
        <Badge variant="outline" className="text-indigo-400 border-indigo-400">
          {resource.category}
        </Badge>
        <span className="text-gray-400 text-sm">{resource.pages}</span>
      </div>
      <CardTitle className="text-white text-lg mb-2">{resource.title}</CardTitle>
      <p className="text-gray-300 text-sm">{resource.description}</p>
    </CardHeader>
    <CardContent>
      <div className="flex items-center justify-between">
        <div className="flex items-center text-gray-400 text-sm">
          <FileText className="w-4 h-4 mr-2" />
          {resource.type}
        </div>
        <Button 
          variant="outline"
          size="sm"
          className="text-indigo-400 border-indigo-400 hover:bg-indigo-400 hover:text-white"
        >
          <Download className="w-4 h-4 mr-2" />
          Download
        </Button>
      </div>
    </CardContent>
  </Card>
);

export default function Resources() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 shadow-md py-4">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <Button 
            onClick={() => setLocation('/')}
            variant="ghost"
            className="text-gray-300 hover:text-indigo-400"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <div className="flex items-center space-x-2 text-2xl font-bold text-indigo-400">
            <BookOpen className="w-8 h-8" />
            <span>Resources</span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-r from-indigo-900 to-purple-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Free AI Resources</h1>
          <p className="text-xl text-gray-200 max-w-3xl mx-auto">
            Everything you need to successfully plan, implement, and manage AI in your small business
          </p>
        </div>
      </section>

      {/* Downloadable Resources */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-white">Downloadable Guides & Templates</h2>
            <p className="text-xl text-gray-300">
              Comprehensive resources to guide your AI journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
        </div>
      </section>

      {/* Webinars Section */}
      <section className="py-16 bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-white">Educational Webinars</h2>
            <p className="text-xl text-gray-300">
              Learn from experts with our on-demand video content
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {webinars.map((webinar) => (
              <Card key={webinar.id} className="bg-gray-700 border-gray-600">
                <CardHeader>
                  <CardTitle className="text-white text-lg mb-2">{webinar.title}</CardTitle>
                  <p className="text-gray-300 text-sm">{webinar.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-400 text-sm">
                      <Video className="w-4 h-4 mr-2" />
                      {webinar.duration}
                    </div>
                    <div className="text-gray-400 text-sm">{webinar.date}</div>
                  </div>
                  <Button 
                    variant="outline"
                    className="w-full text-indigo-400 border-indigo-400 hover:bg-indigo-400 hover:text-white"
                  >
                    <Video className="w-4 h-4 mr-2" />
                    Watch Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Tools */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-white">Interactive Tools</h2>
            <p className="text-xl text-gray-300">
              Hands-on tools to help you plan and evaluate AI solutions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tools.map((tool) => (
              <Card key={tool.id} className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white text-lg mb-2">{tool.title}</CardTitle>
                  <p className="text-gray-300 text-sm">{tool.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-gray-400 text-sm">
                      <Lightbulb className="w-4 h-4 mr-2" />
                      {tool.type}
                    </div>
                    <Button 
                      onClick={() => setLocation(tool.url)}
                      variant="outline"
                      size="sm"
                      className="text-indigo-400 border-indigo-400 hover:bg-indigo-400 hover:text-white"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Try It
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4 text-white">Need Personalized Guidance?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            While these resources provide valuable insights, every business is unique. 
            Get personalized recommendations with a free consultation.
          </p>
          <Button 
            onClick={() => setLocation('/')}
            className="bg-indigo-600 text-white px-8 py-4 text-lg rounded-lg hover:bg-indigo-700 transition duration-300"
          >
            Schedule Free Consultation
          </Button>
        </div>
      </section>
    </div>
  );
}