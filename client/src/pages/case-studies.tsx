import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLocation } from 'wouter';
import { ArrowLeft, TrendingUp, Clock, DollarSign, Users, CheckCircle } from 'lucide-react';

const caseStudies = [
  {
    id: 1,
    title: "Local Restaurant Chain Automation",
    industry: "Food Service",
    company: "Texas BBQ Co.",
    challenge: "Manual order processing and inventory management consuming 15+ hours weekly, leading to frequent stockouts and order errors.",
    solution: "Implemented AI-powered inventory prediction system and automated order processing workflow with real-time stock monitoring.",
    results: [
      "75% reduction in manual inventory tasks",
      "40% decrease in stockouts",
      "90% improvement in order accuracy",
      "$2,400 monthly savings in labor costs"
    ],
    timeline: "6 weeks",
    roi: "320%",
    testimonial: "DeployP2V transformed our operations. We went from spending hours on inventory to having it run automatically. Our customers are happier and we're more profitable.",
    clientRole: "Operations Manager"
  },
  {
    id: 2,
    title: "Real Estate Lead Management",
    industry: "Real Estate",
    company: "Premier Properties Dallas",
    challenge: "Struggling to qualify and follow up with 200+ monthly leads, resulting in missed opportunities and inconsistent client communication.",
    solution: "Deployed AI chatbot for initial lead qualification and automated follow-up system with personalized email sequences based on buyer preferences.",
    results: [
      "60% increase in qualified leads",
      "85% faster initial response time",
      "45% improvement in conversion rate",
      "25 additional closings per quarter"
    ],
    timeline: "4 weeks",
    roi: "450%",
    testimonial: "The AI system handles our leads 24/7 and never misses a follow-up. Our conversion rates have skyrocketed and clients love the instant responses.",
    clientRole: "Sales Director"
  },
  {
    id: 3,
    title: "Healthcare Practice Optimization",
    industry: "Healthcare",
    company: "Family Medical Center",
    challenge: "Patient appointment scheduling conflicts, insurance verification delays, and manual reminder processes causing operational inefficiencies.",
    solution: "Implemented intelligent scheduling system with automatic insurance verification and AI-powered patient communication platform.",
    results: [
      "50% reduction in scheduling conflicts",
      "70% faster insurance verification",
      "35% decrease in no-shows",
      "15 hours weekly saved on admin tasks"
    ],
    timeline: "8 weeks",
    roi: "280%",
    testimonial: "Our staff can now focus on patient care instead of administrative tasks. The system handles scheduling seamlessly and patients appreciate the automated reminders.",
    clientRole: "Practice Manager"
  },
  {
    id: 4,
    title: "E-commerce Customer Support",
    industry: "Retail",
    company: "Artisan Crafts Online",
    challenge: "Overwhelmed customer service team handling 500+ daily inquiries, with 60% being repetitive questions about orders, shipping, and returns.",
    solution: "Deployed intelligent customer support chatbot with order tracking integration and escalation protocols for complex issues.",
    results: [
      "80% of inquiries resolved automatically",
      "90% reduction in response time",
      "40% increase in customer satisfaction",
      "60% reduction in support ticket volume"
    ],
    timeline: "3 weeks",
    roi: "380%",
    testimonial: "The AI handles most customer questions instantly, day or night. Our team can focus on complex issues while customers get immediate help.",
    clientRole: "Customer Service Manager"
  }
];

interface CaseStudyCardProps {
  study: typeof caseStudies[0];
}

const CaseStudyCard: React.FC<CaseStudyCardProps> = ({ study }) => (
  <Card className="bg-gray-800 border-gray-700 h-full">
    <CardHeader>
      <div className="flex justify-between items-start mb-2">
        <Badge variant="outline" className="text-indigo-400 border-indigo-400 mb-2">
          {study.industry}
        </Badge>
        <div className="text-right">
          <div className="text-2xl font-bold text-green-400">{study.roi} ROI</div>
          <div className="text-sm text-gray-400">in {study.timeline}</div>
        </div>
      </div>
      <CardTitle className="text-white text-xl mb-2">{study.title}</CardTitle>
      <p className="text-gray-400 text-sm">{study.company}</p>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <div>
          <h4 className="text-white font-semibold mb-2">Challenge</h4>
          <p className="text-gray-300 text-sm">{study.challenge}</p>
        </div>
        
        <div>
          <h4 className="text-white font-semibold mb-2">Solution</h4>
          <p className="text-gray-300 text-sm">{study.solution}</p>
        </div>
        
        <div>
          <h4 className="text-white font-semibold mb-2">Results</h4>
          <ul className="space-y-1">
            {study.results.map((result, index) => (
              <li key={index} className="flex items-center text-sm text-gray-300">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                {result}
              </li>
            ))}
          </ul>
        </div>
        
        <div className="bg-gray-700 rounded-lg p-4 mt-4">
          <p className="text-gray-300 italic text-sm mb-2">"{study.testimonial}"</p>
          <p className="text-indigo-400 text-sm font-medium">- {study.clientRole}, {study.company}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function CaseStudies() {
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
            <svg className="w-8 h-8 text-indigo-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
            <span>DeployP2V</span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-r from-indigo-900 to-purple-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Success Stories</h1>
          <p className="text-xl text-gray-200 max-w-3xl mx-auto">
            See how small businesses across Texas are transforming their operations with AI solutions
          </p>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-12 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">350%</div>
              <div className="text-gray-200 text-sm">Average ROI</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <Clock className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">5 weeks</div>
              <div className="text-gray-200 text-sm">Average Implementation</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <DollarSign className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">$50k+</div>
              <div className="text-gray-200 text-sm">Annual Savings</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <Users className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">100%</div>
              <div className="text-gray-200 text-sm">Client Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* Case Studies */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-white">Real Results from Real Businesses</h2>
            <p className="text-xl text-gray-300">
              Discover how AI is helping Texas small businesses thrive
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {caseStudies.map((study) => (
              <CaseStudyCard key={study.id} study={study} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4 text-white">Ready to Write Your Success Story?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join these successful Texas businesses and transform your operations with AI
          </p>
          <Button 
            onClick={() => setLocation('/')}
            className="bg-indigo-600 text-white px-8 py-4 text-lg rounded-lg hover:bg-indigo-700 transition duration-300"
          >
            Get Your Free Consultation
          </Button>
        </div>
      </section>
    </div>
  );
}