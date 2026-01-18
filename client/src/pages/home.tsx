import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useLocation } from 'wouter';
import ChatbotWidget from '@/components/ChatbotWidget';
import { 
  MessageSquare, 
  BarChart3, 
  Grid3X3, 
  Edit3, 
  FileText, 
  Globe, 
  Users, 
  Calendar, 
  Monitor,
  CheckCircle,
  Mail,
  Phone,
  MapPin,
  Zap,
  DollarSign,
  HeadphonesIcon,
  Shield,
  Settings,
  Heart,
  Menu,
  X
} from 'lucide-react';

// SVG Logo Component
const DeployP2VLogo = () => (
  <svg className="w-8 h-8 text-indigo-500" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
  </svg>
);

// Common classes - optimized for mobile
const commonClasses = {
  container: 'container mx-auto px-4 sm:px-6 lg:px-8',
  btnPrimary: 'bg-indigo-600 text-white px-4 py-3 sm:px-6 rounded-lg shadow-lg hover:bg-indigo-700 transition duration-300 ease-in-out touch-manipulation',
  btnSecondary: 'bg-white text-indigo-600 border border-indigo-600 px-4 py-3 sm:px-6 rounded-lg shadow-md hover:bg-indigo-50 transition duration-300 ease-in-out touch-manipulation',
  sectionHeading: 'text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-8 sm:mb-12 text-white',
};

interface ServiceCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ icon, title, description }) => (
  <div className="service-card p-6 sm:p-8 rounded-xl text-center">
    <div className="flex justify-center mb-4 sm:mb-6">
      <div className="w-10 h-10 sm:w-12 sm:h-12 text-indigo-400">
        {icon}
      </div>
    </div>
    <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-white">{title}</h3>
    <p className="text-sm sm:text-base text-gray-300">{description}</p>
  </div>
);

interface PricingCardProps {
  type: string;
  name: string;
  price: string;
  features: string[];
  isFeatured?: boolean;
  onContactClick: () => void;
}

const PricingCard: React.FC<PricingCardProps> = ({ 
  type, 
  name, 
  price, 
  features, 
  isFeatured = false, 
  onContactClick 
}) => (
  <div className={`pricing-card bg-gray-700 p-6 sm:p-8 rounded-xl border border-gray-600 ${isFeatured ? 'relative border-indigo-500' : ''}`}>
    {isFeatured && (
      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
        <span className="bg-indigo-600 text-white px-3 py-1 sm:px-4 rounded-full text-xs sm:text-sm font-semibold">Most Popular</span>
      </div>
    )}
    <div className="text-center mb-6 sm:mb-8">
      <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">{name}</h3>
      <div className="text-3xl sm:text-4xl font-bold text-indigo-400 mb-2">{price}</div>
      <p className="text-sm sm:text-base text-gray-300">{type}</p>
    </div>
    <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
      {features.map((feature, index) => (
        <li key={index} className="flex items-start text-gray-300 text-sm sm:text-base">
          <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2 sm:mr-3 mt-0.5 flex-shrink-0" />
          <span>{feature}</span>
        </li>
      ))}
    </ul>
    <Button 
      onClick={onContactClick} 
      className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition duration-300 font-semibold touch-manipulation"
    >
      {name === 'Enterprise' ? 'Contact Sales' : name === 'Professional' ? 'Choose Professional' : 'Get Started'}
    </Button>
  </div>
);

export default function Home() {
  const [, setLocation] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    message: ''
  });
  const { toast } = useToast();

  const contactMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await apiRequest('POST', '/api/contact', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Thank you for your interest! We will contact you within 24 hours.",
      });
      setFormData({
        name: '',
        email: '',
        company: '',
        phone: '',
        message: ''
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to submit form. Please try again.",
        variant: "destructive",
      });
    }
  });

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.message) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    contactMutation.mutate(formData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // Header scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const header = document.querySelector('header');
      if (header) {
        if (window.scrollY > 100) {
          header.style.backgroundColor = 'rgba(31, 41, 55, 0.95)';
          header.style.backdropFilter = 'blur(10px)';
        } else {
          header.style.backgroundColor = 'rgb(31, 41, 55)';
          header.style.backdropFilter = 'none';
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="font-sans bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 shadow-md py-3 sm:py-4 sticky top-0 z-50 transition-all duration-300">
        <div className={`${commonClasses.container} flex justify-between items-center`}>
          <button 
            onClick={() => scrollToSection('hero')} 
            className="flex items-center space-x-2 text-xl sm:text-2xl font-bold text-indigo-400 touch-manipulation"
          >
            <DeployP2VLogo />
            <span className="hidden xs:inline">DeployP2V</span>
          </button>
          <nav className="hidden md:flex space-x-6 lg:space-x-8">
            <button onClick={() => scrollToSection('services')} className="text-gray-300 hover:text-indigo-400 font-medium transition duration-200 touch-manipulation">Services</button>
            <button onClick={() => scrollToSection('pricing')} className="text-gray-300 hover:text-indigo-400 font-medium transition duration-200 touch-manipulation">Pricing</button>
            <button onClick={() => scrollToSection('why-us')} className="text-gray-300 hover:text-indigo-400 font-medium transition duration-200 touch-manipulation">Why Us?</button>
            <button onClick={() => scrollToSection('about')} className="text-gray-300 hover:text-indigo-400 font-medium transition duration-200 touch-manipulation">About</button>
            <button onClick={() => scrollToSection('contact')} className="text-gray-300 hover:text-indigo-400 font-medium transition duration-200 touch-manipulation">Contact</button>
          </nav>
          <div className="md:hidden">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
              className="text-gray-300 hover:text-indigo-400 focus:outline-none touch-manipulation p-2"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <nav className="md:hidden bg-gray-800 py-2 shadow-inner border-t border-gray-700">
            <button onClick={() => { scrollToSection('services'); setIsMobileMenuOpen(false); }} className="block w-full text-left px-6 py-3 text-gray-300 hover:bg-gray-700 transition duration-200 touch-manipulation">Services</button>
            <button onClick={() => { scrollToSection('pricing'); setIsMobileMenuOpen(false); }} className="block w-full text-left px-6 py-3 text-gray-300 hover:bg-gray-700 transition duration-200 touch-manipulation">Pricing</button>
            <button onClick={() => { scrollToSection('why-us'); setIsMobileMenuOpen(false); }} className="block w-full text-left px-6 py-3 text-gray-300 hover:bg-gray-700 transition duration-200 touch-manipulation">Why Us?</button>
            <button onClick={() => { scrollToSection('about'); setIsMobileMenuOpen(false); }} className="block w-full text-left px-6 py-3 text-gray-300 hover:bg-gray-700 transition duration-200 touch-manipulation">About</button>
            <button onClick={() => { scrollToSection('contact'); setIsMobileMenuOpen(false); }} className="block w-full text-left px-6 py-3 text-gray-300 hover:bg-gray-700 transition duration-200 touch-manipulation">Contact</button>
          </nav>
        )}
      </header>

      {/* Hero Section */}
      <section id="hero" className="gradient-bg text-white py-12 sm:py-16 md:py-24 lg:py-32 text-center rounded-b-3xl shadow-xl">
        <div className={`${commonClasses.container} max-w-4xl`}>
          <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-4 sm:mb-6 px-2">
            DeployP2V: Deploying Practical Vision with AI for Your Small Business
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8 md:mb-10 opacity-90 px-4 leading-relaxed">
            Unlock growth, enhance efficiency, and innovate with tailored Artificial Intelligence solutions designed specifically for small businesses.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 px-4 max-w-lg sm:max-w-none mx-auto">
            <Button 
              onClick={() => scrollToSection('contact')} 
              className={`${commonClasses.btnPrimary} w-full sm:w-auto text-center py-3 px-6 text-base font-semibold touch-manipulation`}
            >
              Get a Free AI Consultation
            </Button>
            <Button 
              onClick={() => scrollToSection('services')} 
              className={`${commonClasses.btnSecondary} w-full sm:w-auto text-center py-3 px-6 text-base font-semibold touch-manipulation`}
            >
              Explore Our Solutions
            </Button>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gray-900">
        <div className={commonClasses.container}>
          <h2 className={`${commonClasses.sectionHeading} text-center mb-8 sm:mb-12 md:mb-16`}>Our AI Solutions for Small Businesses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <ServiceCard
              icon={<MessageSquare className="w-full h-full" />}
              title="AI-Powered Customer Support"
              description="Automate inquiries with intelligent chatbots & virtual assistants, providing 24/7 support and freeing your staff."
            />
            <ServiceCard
              icon={<BarChart3 className="w-full h-full" />}
              title="Predictive Analytics for Sales & Marketing"
              description="Identify buying patterns, forecast sales, and personalize campaigns to boost your marketing ROI and lead generation."
            />
            <ServiceCard
              icon={<Grid3X3 className="w-full h-full" />}
              title="Automated Data Entry & Reporting"
              description="Streamline tedious data input, process invoices, and generate reports automatically, reducing errors and saving time."
            />
            <ServiceCard
              icon={<Edit3 className="w-full h-full" />}
              title="AI-Assisted Content Creation"
              description="Generate ideas, draft marketing copy, and create social media posts faster, scaling your content strategy easily."
            />
            <ServiceCard
              icon={<FileText className="w-full h-full" />}
              title="Automated Document Processing (OCR + AI)"
              description="Extract information from invoices, receipts, and contracts quickly using OCR and AI, reducing manual tasks."
            />
            <ServiceCard
              icon={<Globe className="w-full h-full" />}
              title="AI-Driven Market Research & Trend Analysis"
              description="Gain insights into market trends, competitor strategies, and customer sentiment to make informed business decisions."
            />
            <ServiceCard
              icon={<Users className="w-full h-full" />}
              title="AI-Enhanced Customer Portal/CRM Lite"
              description="Develop custom web portals with AI features for lead prioritization, sentiment analysis, and smart customer follow-ups."
            />
            <ServiceCard
              icon={<Calendar className="w-full h-full" />}
              title="Automated Scheduling & Booking Systems"
              description="Optimize appointment scheduling with AI, analyzing patterns to suggest optimal times and routing inquiries efficiently."
            />
            <ServiceCard
              icon={<Monitor className="w-full h-full" />}
              title="Internal Productivity & Automation Apps"
              description="Build custom web apps for internal use to automate repetitive tasks like document categorization or internal search."
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gray-800">
        <div className={commonClasses.container}>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-3 sm:mb-4 text-white">Simple, Transparent Pricing</h2>
          <p className="text-base sm:text-lg md:text-xl text-center mb-8 sm:mb-10 md:mb-12 text-gray-300 px-4">Choose the plan that fits your business needs</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
            <PricingCard
              type="Perfect for small businesses getting started with AI"
              name="Starter"
              price="$149/mo"
              features={[
                "AI Receptionist or Lead Assistant - Live in 7 days",
                "Basic customization & setup",
                "Email support",
                "Monthly performance reports"
              ]}
              onContactClick={() => scrollToSection('contact')}
            />
            <PricingCard
              type="Ideal for growing businesses ready to scale with AI"
              name="Professional"
              price="$599/mo"
              features={[
                "Up to 3 AI Solutions",
                "Advanced customization",
                "Priority phone & email support",
                "Weekly analytics & insights",
                "Integration support"
              ]}
              isFeatured
              onContactClick={() => scrollToSection('contact')}
            />
            <PricingCard
              type="For established businesses with complex AI needs"
              name="Enterprise"
              price="Custom"
              features={[
                "Unlimited AI Solutions",
                "Fully custom development",
                "Dedicated account manager",
                "24/7 phone support",
                "Real-time analytics dashboard"
              ]}
              onContactClick={() => scrollToSection('contact')}
            />
          </div>
        </div>
      </section>

      {/* Why Us Section */}
      <section id="why-us" className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gray-900">
        <div className={commonClasses.container}>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-3 sm:mb-4 text-white">Why Choose DeployP2V?</h2>
          <p className="text-base sm:text-lg md:text-xl text-center mb-10 sm:mb-12 md:mb-16 text-gray-300 px-4">We understand small business challenges and deliver practical AI solutions that work</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center p-4">
              <div className="bg-indigo-100 rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-white">Fast Implementation</h3>
              <p className="text-sm sm:text-base text-gray-300 leading-relaxed">Get up and running in weeks, not months. Our proven processes ensure quick deployment with minimal disruption to your business.</p>
            </div>

            <div className="text-center p-4">
              <div className="bg-indigo-100 rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-white">Affordable Solutions</h3>
              <p className="text-sm sm:text-base text-gray-300 leading-relaxed">Enterprise-grade AI without the enterprise price tag. Our solutions pay for themselves through improved efficiency and cost savings.</p>
            </div>

            <div className="text-center p-4">
              <div className="bg-indigo-100 rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <HeadphonesIcon className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-white">Personalized Support</h3>
              <p className="text-sm sm:text-base text-gray-300 leading-relaxed">Direct access to our AI experts who understand your business. No call centers or ticket systems - just real people who care about your success.</p>
            </div>

            <div className="text-center p-4">
              <div className="bg-indigo-100 rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-white">Proven Results</h3>
              <p className="text-sm sm:text-base text-gray-300 leading-relaxed">Our clients typically see 40% improvement in operational efficiency and 25% cost reduction within the first 6 months of implementation.</p>
            </div>

            <div className="text-center p-4">
              <div className="bg-indigo-100 rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Settings className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-white">Tailored Solutions</h3>
              <p className="text-sm sm:text-base text-gray-300 leading-relaxed">Every solution is customized for your specific industry and business needs. No cookie-cutter approaches - just AI that works for you.</p>
            </div>

            <div className="text-center p-4">
              <div className="bg-indigo-100 rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-white">Long-term Partnership</h3>
              <p className="text-sm sm:text-base text-gray-300 leading-relaxed">We're not just vendors - we're partners in your growth. Ongoing support, updates, and optimization to ensure continued success.</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gray-800">
        <div className={commonClasses.container}>
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 text-white">About DeployP2V</h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-8 sm:mb-10 md:mb-12 px-4 leading-relaxed">
              We're a team of AI specialists and business consultants dedicated to making artificial intelligence accessible and practical for small businesses. Our mission is to level the playing field by giving small companies the same AI advantages that large corporations enjoy.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 mb-10 sm:mb-12 md:mb-16">
              <div className="text-center p-4">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-indigo-400 mb-2">50+</div>
                <div className="text-sm sm:text-base text-gray-300">Small Businesses Served</div>
              </div>
              <div className="text-center p-4">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-indigo-400 mb-2">95%</div>
                <div className="text-sm sm:text-base text-gray-300">Client Satisfaction Rate</div>
              </div>
              <div className="text-center p-4">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-indigo-400 mb-2">2M+</div>
                <div className="text-sm sm:text-base text-gray-300">Hours Automated</div>
              </div>
            </div>

            <Card className="bg-gray-700 border-gray-600">
              <CardContent className="p-6 sm:p-8">
                <h3 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 text-white">Our Philosophy</h3>
                <p className="text-gray-300 text-base sm:text-lg leading-relaxed">
                  "AI shouldn't be complex or intimidating. We believe in creating solutions that are intuitive, effective, and designed specifically for the unique challenges that small businesses face. Every implementation is backed by real business outcomes, not just impressive technology."
                </p>
                <div className="mt-4 sm:mt-6">
                  <div className="text-indigo-400 font-semibold">- The DeployP2V Team</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gray-900">
        <div className={commonClasses.container}>
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8 sm:mb-10 md:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-white">Ready to Transform Your Business with AI?</h2>
              <p className="text-base sm:text-lg md:text-xl text-gray-300 px-4">Let's discuss how AI can solve your specific business challenges. Get a free consultation today.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
              {/* Contact Form */}
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6 sm:p-8">
                  <h3 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-white">Get Your Free AI Consultation</h3>
                  <form onSubmit={handleFormSubmit} className="space-y-4 sm:space-y-6">
                    <div>
                      <Label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">Full Name *</Label>
                      <Input 
                        type="text" 
                        id="name" 
                        name="name" 
                        required 
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-3 sm:px-4 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base touch-manipulation" 
                        placeholder="Your full name"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">Email Address *</Label>
                      <Input 
                        type="email" 
                        id="email" 
                        name="email" 
                        required 
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-3 py-3 sm:px-4 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base touch-manipulation" 
                        placeholder="your@email.com"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="company" className="block text-sm font-medium text-gray-300 mb-2">Company Name</Label>
                      <Input 
                        type="text" 
                        id="company" 
                        name="company" 
                        value={formData.company}
                        onChange={handleInputChange}
                        className="w-full px-3 py-3 sm:px-4 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base touch-manipulation" 
                        placeholder="Your company name"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">Phone Number</Label>
                      <Input 
                        type="tel" 
                        id="phone" 
                        name="phone" 
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-3 py-3 sm:px-4 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base touch-manipulation" 
                        placeholder="(555) 123-4567"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">Tell us about your business challenges *</Label>
                      <Textarea 
                        id="message" 
                        name="message" 
                        rows={4} 
                        required
                        value={formData.message}
                        onChange={handleInputChange}
                        className="w-full px-3 py-3 sm:px-4 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base touch-manipulation resize-none" 
                        placeholder="Describe your current challenges and how you think AI might help..."
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      disabled={contactMutation.isPending}
                      className="w-full bg-indigo-600 text-white py-3 px-4 sm:px-6 rounded-lg hover:bg-indigo-700 transition duration-300 font-semibold text-base touch-manipulation"
                    >
                      {contactMutation.isPending ? 'Submitting...' : 'Schedule Free Consultation'}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <div className="space-y-6 sm:space-y-8">
                <div>
                  <h3 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-white">Get in Touch</h3>
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center">
                      <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-400 mr-3 sm:mr-4 flex-shrink-0" />
                      <span className="text-sm sm:text-base text-gray-300 break-all">tsparks@deployp2v.com</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-400 mr-3 sm:mr-4 flex-shrink-0" />
                      <span className="text-sm sm:text-base text-gray-300">(214) 604-5735</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-400 mr-3 sm:mr-4 flex-shrink-0" />
                      <span className="text-sm sm:text-base text-gray-300">Wylie, TX</span>
                    </div>
                  </div>
                </div>

                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-4 sm:p-6">
                    <h4 className="text-base sm:text-lg font-semibold mb-3 text-white">What Happens Next?</h4>
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <div className="bg-indigo-600 text-white rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-xs sm:text-sm font-semibold mr-2 sm:mr-3 mt-0.5 flex-shrink-0">1</div>
                        <p className="text-xs sm:text-sm md:text-base text-gray-300 leading-relaxed">We'll review your submission and schedule a 30-minute discovery call</p>
                      </div>
                      <div className="flex items-start">
                        <div className="bg-indigo-600 text-white rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-xs sm:text-sm font-semibold mr-2 sm:mr-3 mt-0.5 flex-shrink-0">2</div>
                        <p className="text-xs sm:text-sm md:text-base text-gray-300 leading-relaxed">During the call, we'll analyze your specific needs and challenges</p>
                      </div>
                      <div className="flex items-start">
                        <div className="bg-indigo-600 text-white rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-xs sm:text-sm font-semibold mr-2 sm:mr-3 mt-0.5 flex-shrink-0">3</div>
                        <p className="text-xs sm:text-sm md:text-base text-gray-300 leading-relaxed">We'll provide a customized AI strategy and implementation roadmap</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="text-center">
                  <p className="text-gray-400 text-xs sm:text-sm leading-relaxed px-2">
                    Typically respond within 24 hours • No spam, ever • Your information is secure
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 py-12 border-t border-gray-700">
        <div className={commonClasses.container}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 text-2xl font-bold text-indigo-400 mb-4">
                <DeployP2VLogo />
                <span>DeployP2V</span>
              </div>
              <p className="text-gray-300 mb-6">
                Empowering small businesses with practical AI solutions that drive real results. Transform your operations, enhance efficiency, and unlock new growth opportunities.
              </p>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Services</h3>
              <ul className="space-y-2 text-gray-300">
                <li><button onClick={() => scrollToSection('services')} className="hover:text-indigo-400 transition duration-200">AI Customer Support</button></li>
                <li><button onClick={() => scrollToSection('services')} className="hover:text-indigo-400 transition duration-200">Predictive Analytics</button></li>
                <li><button onClick={() => scrollToSection('services')} className="hover:text-indigo-400 transition duration-200">Automation Solutions</button></li>
                <li><button onClick={() => scrollToSection('services')} className="hover:text-indigo-400 transition duration-200">Content Creation</button></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-gray-300">
                <li><button onClick={() => setLocation('/blog')} className="hover:text-indigo-400 transition duration-200">Blog</button></li>
                <li><button onClick={() => setLocation('/case-studies')} className="hover:text-indigo-400 transition duration-200">Case Studies</button></li>
                <li><button onClick={() => setLocation('/faq')} className="hover:text-indigo-400 transition duration-200">FAQ</button></li>
                <li><button onClick={() => setLocation('/resources')} className="hover:text-indigo-400 transition duration-200">Free Resources</button></li>
                <li><button onClick={() => setLocation('/roi-calculator')} className="hover:text-indigo-400 transition duration-200">ROI Calculator</button></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-300">
                <li><button onClick={() => scrollToSection('about')} className="hover:text-indigo-400 transition duration-200">About Us</button></li>
                <li><button onClick={() => scrollToSection('pricing')} className="hover:text-indigo-400 transition duration-200">Pricing</button></li>
                <li><button onClick={() => scrollToSection('contact')} className="hover:text-indigo-400 transition duration-200">Contact</button></li>
                <li><button onClick={() => setLocation('/privacy-policy')} className="hover:text-indigo-400 transition duration-200">Privacy Policy</button></li>
                <li><button onClick={() => setLocation('/terms-of-service')} className="hover:text-indigo-400 transition duration-200">Terms of Service</button></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 DeployP2V. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Chatbot Widget */}
      <ChatbotWidget onBookAppointment={() => scrollToSection('contact')} />
    </div>
  );
}
