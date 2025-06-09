import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useLocation } from 'wouter';
import { ArrowLeft, Download, ExternalLink, FileText, Video, BookOpen, Lightbulb, X } from 'lucide-react';

interface WebinarContent {
  overview: string;
  keyTopics: string[];
  presenter: string;
  audience: string;
}

interface Webinar {
  id: number;
  title: string;
  description: string;
  duration: string;
  date: string;
  videoUrl: string;
  content: WebinarContent;
}

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

const webinars: Webinar[] = [
  {
    id: 1,
    title: "AI Fundamentals for Small Business Owners",
    description: "60-minute overview of AI technologies and their practical applications.",
    duration: "60 minutes",
    date: "Available On-Demand",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    content: {
      overview: "This comprehensive webinar covers the essential AI technologies that small business owners need to understand in 2024.",
      keyTopics: [
        "Introduction to Machine Learning and AI",
        "Practical AI Applications for Small Business",
        "Cost-Benefit Analysis of AI Implementation",
        "Getting Started: First Steps and Quick Wins",
        "Common Misconceptions About AI",
        "Q&A Session with Real Business Examples"
      ],
      presenter: "Sarah Johnson, AI Solutions Consultant",
      audience: "Small business owners with 5-100 employees"
    }
  },
  {
    id: 2,
    title: "Calculating AI ROI: A Live Workshop",
    description: "Interactive session on measuring and projecting AI investment returns.",
    duration: "45 minutes",
    date: "Available On-Demand",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    content: {
      overview: "Learn how to calculate and project return on investment for AI initiatives using real business scenarios.",
      keyTopics: [
        "ROI Calculation Methodologies",
        "Direct Cost Savings Measurement",
        "Productivity Gain Quantification",
        "Long-term Value Assessment",
        "Risk Factors and Mitigation",
        "Live Calculation Exercise"
      ],
      presenter: "Michael Chen, Business Analytics Expert",
      audience: "Business owners and financial decision makers"
    }
  },
  {
    id: 3,
    title: "Common AI Implementation Pitfalls",
    description: "Learn from real case studies of what works and what doesn't.",
    duration: "50 minutes",
    date: "Available On-Demand",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    content: {
      overview: "Avoid costly mistakes by learning from businesses that have successfully (and unsuccessfully) implemented AI solutions.",
      keyTopics: [
        "Top 10 AI Implementation Failures",
        "Data Quality Issues and Solutions",
        "Change Management Challenges",
        "Vendor Selection Mistakes",
        "Success Stories and Lessons Learned",
        "Best Practices Checklist"
      ],
      presenter: "Dr. Amanda Rodriguez, AI Implementation Specialist",
      audience: "Business leaders planning AI initiatives"
    }
  }
];

const tools = [
  {
    id: 1,
    title: "AI Cost Calculator",
    description: "Interactive tool to estimate AI implementation costs for your business size.",
    type: "Web Tool",
    url: "/roi-calculator",
    isExternal: true
  },
  {
    id: 2,
    title: "Business Process Audit Template",
    description: "Identify which processes in your business could benefit from AI automation.",
    type: "Interactive Form",
    url: "#",
    isExternal: false,
    content: {
      sections: [
        {
          title: "Administrative Processes",
          questions: [
            "How many hours per week do you spend on data entry?",
            "Do you manually process invoices or receipts?",
            "How much time is spent on scheduling and calendar management?",
            "Are customer inquiries handled manually?",
            "Do you create reports by manually compiling data?"
          ]
        },
        {
          title: "Customer Service",
          questions: [
            "What percentage of customer inquiries are repetitive?",
            "How quickly do you respond to customer emails?",
            "Do you have a knowledge base for common questions?",
            "Are customers waiting for responses during off-hours?",
            "How do you track customer satisfaction?"
          ]
        },
        {
          title: "Sales & Marketing",
          questions: [
            "How do you currently qualify leads?",
            "Do you personalize marketing communications?",
            "How do you track customer behavior on your website?",
            "Are you analyzing social media engagement?",
            "How do you determine optimal pricing?"
          ]
        },
        {
          title: "Operations",
          questions: [
            "Do you forecast demand for inventory?",
            "How do you schedule staff and resources?",
            "Are you monitoring equipment performance?",
            "Do you track and analyze operational costs?",
            "How do you identify process bottlenecks?"
          ]
        }
      ]
    }
  },
  {
    id: 3,
    title: "AI Technology Comparison Chart",
    description: "Compare different AI technologies and their suitability for various business needs.",
    type: "Interactive Chart",
    url: "#",
    isExternal: false,
    content: {
      technologies: [
        {
          name: "Chatbots & Virtual Assistants",
          bestFor: ["Customer Service", "Lead Qualification", "FAQ Handling"],
          complexity: "Low",
          cost: "$100-500/month",
          implementationTime: "1-2 weeks",
          businessSizes: ["Small", "Medium", "Large"],
          useCases: [
            "24/7 customer support",
            "Lead capture and qualification",
            "Appointment scheduling",
            "Order status inquiries"
          ]
        },
        {
          name: "Predictive Analytics",
          bestFor: ["Inventory Management", "Sales Forecasting", "Demand Planning"],
          complexity: "Medium",
          cost: "$500-2000/month",
          implementationTime: "4-8 weeks",
          businessSizes: ["Medium", "Large"],
          useCases: [
            "Sales forecasting",
            "Inventory optimization",
            "Customer behavior prediction",
            "Risk assessment"
          ]
        },
        {
          name: "Process Automation (RPA)",
          bestFor: ["Data Entry", "Report Generation", "Invoice Processing"],
          complexity: "Low-Medium",
          cost: "$300-1000/month",
          implementationTime: "2-4 weeks",
          businessSizes: ["Small", "Medium", "Large"],
          useCases: [
            "Automated data entry",
            "Invoice processing",
            "Report generation",
            "Email automation"
          ]
        },
        {
          name: "Computer Vision",
          bestFor: ["Quality Control", "Security", "Inventory Tracking"],
          complexity: "High",
          cost: "$1000-5000/month",
          implementationTime: "8-16 weeks",
          businessSizes: ["Medium", "Large"],
          useCases: [
            "Quality inspection",
            "Security monitoring",
            "Inventory counting",
            "Document scanning"
          ]
        },
        {
          name: "Natural Language Processing",
          bestFor: ["Document Analysis", "Sentiment Analysis", "Content Generation"],
          complexity: "Medium-High",
          cost: "$500-3000/month",
          implementationTime: "6-12 weeks",
          businessSizes: ["Medium", "Large"],
          useCases: [
            "Document classification",
            "Email sentiment analysis",
            "Content generation",
            "Language translation"
          ]
        }
      ]
    }
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
  const [selectedWebinar, setSelectedWebinar] = useState<Webinar | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [selectedTool, setSelectedTool] = useState<typeof tools[0] | null>(null);
  const [isToolModalOpen, setIsToolModalOpen] = useState(false);

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
                    onClick={() => {
                      setSelectedWebinar(webinar);
                      setIsVideoModalOpen(true);
                    }}
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
                      onClick={() => {
                        if (tool.isExternal) {
                          setLocation(tool.url);
                        } else {
                          setSelectedTool(tool);
                          setIsToolModalOpen(true);
                        }
                      }}
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

      {/* Video Modal */}
      <Dialog open={isVideoModalOpen} onOpenChange={setIsVideoModalOpen}>
        <DialogContent className="max-w-4xl w-full bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white text-xl mb-4">
              {selectedWebinar?.title}
            </DialogTitle>
          </DialogHeader>
          
          {selectedWebinar && (
            <div className="space-y-6">
              {/* Video Player */}
              <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
                <iframe
                  src={selectedWebinar.videoUrl}
                  title={selectedWebinar.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
              
              {/* Webinar Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column - Overview */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Overview</h3>
                  <p className="text-gray-300 mb-4">{selectedWebinar.content.overview}</p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center text-gray-400 text-sm">
                      <Video className="w-4 h-4 mr-2" />
                      Duration: {selectedWebinar.duration}
                    </div>
                    <div className="text-gray-400 text-sm">
                      <strong>Presenter:</strong> {selectedWebinar.content.presenter}
                    </div>
                    <div className="text-gray-400 text-sm">
                      <strong>Target Audience:</strong> {selectedWebinar.content.audience}
                    </div>
                  </div>
                </div>
                
                {/* Right Column - Key Topics */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Key Topics Covered</h3>
                  <ul className="space-y-2">
                    {selectedWebinar.content.keyTopics.map((topic, index) => (
                      <li key={index} className="flex items-start text-gray-300 text-sm">
                        <span className="w-2 h-2 bg-indigo-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        {topic}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              {/* Call to Action */}
              <div className="bg-gray-700 p-4 rounded-lg">
                <p className="text-gray-300 mb-3">
                  Ready to implement what you've learned? Get personalized guidance for your business.
                </p>
                <Button 
                  onClick={() => {
                    setIsVideoModalOpen(false);
                    setLocation('/');
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  Schedule Free Consultation
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Tool Modal */}
      <Dialog open={isToolModalOpen} onOpenChange={setIsToolModalOpen}>
        <DialogContent className="max-w-5xl w-full bg-gray-800 border-gray-700 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white text-xl mb-4">
              {selectedTool?.title}
            </DialogTitle>
          </DialogHeader>
          
          {selectedTool && selectedTool.id === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <p className="text-gray-300 text-lg">
                  Complete this audit to identify AI automation opportunities in your business
                </p>
              </div>
              
              {selectedTool.content.sections.map((section, sectionIndex) => (
                <div key={sectionIndex} className="bg-gray-700 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-white mb-4">{section.title}</h3>
                  <div className="space-y-4">
                    {section.questions.map((question, questionIndex) => (
                      <div key={questionIndex} className="space-y-2">
                        <label className="text-gray-300 font-medium">{question}</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          <Button variant="outline" size="sm" className="justify-start text-green-400 border-green-400 hover:bg-green-400 hover:text-white">
                            High Priority
                          </Button>
                          <Button variant="outline" size="sm" className="justify-start text-yellow-400 border-yellow-400 hover:bg-yellow-400 hover:text-white">
                            Medium Priority
                          </Button>
                          <Button variant="outline" size="sm" className="justify-start text-gray-400 border-gray-400 hover:bg-gray-400 hover:text-white">
                            Low Priority
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              
              <div className="bg-gray-700 p-6 rounded-lg text-center">
                <h3 className="text-xl font-semibold text-white mb-3">Get Your Personalized AI Strategy</h3>
                <p className="text-gray-300 mb-4">
                  Based on your audit responses, our AI experts can create a customized implementation roadmap for your business.
                </p>
                <Button 
                  onClick={() => {
                    setIsToolModalOpen(false);
                    setLocation('/');
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  Schedule Strategy Session
                </Button>
              </div>
            </div>
          )}

          {selectedTool && selectedTool.id === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <p className="text-gray-300 text-lg">
                  Compare AI technologies to find the best fit for your business needs
                </p>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-600">
                      <th className="text-left py-3 px-4 text-white font-semibold">Technology</th>
                      <th className="text-left py-3 px-4 text-white font-semibold">Best For</th>
                      <th className="text-left py-3 px-4 text-white font-semibold">Complexity</th>
                      <th className="text-left py-3 px-4 text-white font-semibold">Monthly Cost</th>
                      <th className="text-left py-3 px-4 text-white font-semibold">Implementation</th>
                      <th className="text-left py-3 px-4 text-white font-semibold">Business Size</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedTool.content.technologies.map((tech, index) => (
                      <tr key={index} className="border-b border-gray-700 hover:bg-gray-700">
                        <td className="py-4 px-4">
                          <div className="text-white font-medium">{tech.name}</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="space-y-1">
                            {tech.bestFor.map((item, i) => (
                              <Badge key={i} variant="secondary" className="mr-1 mb-1 text-xs">
                                {item}
                              </Badge>
                            ))}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <Badge 
                            variant={tech.complexity === 'Low' ? 'default' : tech.complexity === 'Medium' ? 'secondary' : 'destructive'}
                            className="text-xs"
                          >
                            {tech.complexity}
                          </Badge>
                        </td>
                        <td className="py-4 px-4 text-gray-300">{tech.cost}</td>
                        <td className="py-4 px-4 text-gray-300">{tech.implementationTime}</td>
                        <td className="py-4 px-4">
                          <div className="space-y-1">
                            {tech.businessSizes.map((size, i) => (
                              <Badge key={i} variant="outline" className="mr-1 mb-1 text-xs">
                                {size}
                              </Badge>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
                {selectedTool.content.technologies.map((tech, index) => (
                  <Card key={index} className="bg-gray-700 border-gray-600">
                    <CardHeader>
                      <CardTitle className="text-white text-lg">{tech.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <h4 className="text-sm font-semibold text-gray-300 mb-2">Common Use Cases:</h4>
                          <ul className="space-y-1">
                            {tech.useCases.map((useCase, i) => (
                              <li key={i} className="text-gray-400 text-sm flex items-start">
                                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                {useCase}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <div className="bg-gray-700 p-6 rounded-lg text-center">
                <h3 className="text-xl font-semibold text-white mb-3">Ready to Choose the Right AI Solution?</h3>
                <p className="text-gray-300 mb-4">
                  Let our experts help you select and implement the perfect AI technology for your specific business needs.
                </p>
                <Button 
                  onClick={() => {
                    setIsToolModalOpen(false);
                    setLocation('/');
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  Get Expert Consultation
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}