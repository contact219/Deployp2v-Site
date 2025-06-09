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

// Common classes
const commonClasses = {
  container: 'container mx-auto px-4 sm:px-6 lg:px-8',
  btnPrimary: 'bg-indigo-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-indigo-700 transition duration-300 ease-in-out transform hover:scale-105',
  btnSecondary: 'bg-white text-indigo-600 border border-indigo-600 px-6 py-3 rounded-lg shadow-md hover:bg-indigo-50 transition duration-300 ease-in-out transform hover:scale-105',
  sectionHeading: 'text-4xl font-bold text-center mb-12 text-white',
};

interface ServiceCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ icon, title, description }) => (
  <div className="service-card p-8 rounded-xl text-center">
    <div className="flex justify-center mb-6">
      <div className="w-12 h-12 text-indigo-400">
        {icon}
      </div>
    </div>
    <h3 className="text-xl font-semibold mb-4 text-white">{title}</h3>
    <p className="text-gray-300">{description}</p>
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
  <div className={`pricing-card bg-gray-700 p-8 rounded-xl border border-gray-600 ${isFeatured ? 'relative border-indigo-500' : ''}`}>
    {isFeatured && (
      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
        <span className="bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-semibold">Most Popular</span>
      </div>
    )}
    <div className="text-center mb-8">
      <h3 className="text-2xl font-bold text-white mb-2">{name}</h3>
      <div className="text-4xl font-bold text-indigo-400 mb-2">{price}</div>
      <p className="text-gray-300">{type}</p>
    </div>
    <ul className="space-y-4 mb-8">
      {features.map((feature, index) => (
        <li key={index} className="flex items-center text-gray-300">
          <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
          {feature}
        </li>
      ))}
    </ul>
    <Button 
      onClick={onContactClick} 
      className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition duration-300 font-semibold"
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
      <header className="bg-gray-800 shadow-md py-4 sticky top-0 z-50 transition-all duration-300">
        <div className={`${commonClasses.container} flex justify-between items-center`}>
          <button 
            onClick={() => scrollToSection('hero')} 
            className="flex items-center space-x-2 text-2xl font-bold text-indigo-400"
          >
            <DeployP2VLogo />
            <span>DeployP2V</span>
          </button>
          <nav className="hidden md:flex space-x-8">
            <button onClick={() => scrollToSection('services')} className="text-gray-300 hover:text-indigo-400 font-medium transition duration-200">Services</button>
            <button onClick={() => scrollToSection('pricing')} className="text-gray-300 hover:text-indigo-400 font-medium transition duration-200">Pricing</button>
            <button onClick={() => scrollToSection('why-us')} className="text-gray-300 hover:text-indigo-400 font-medium transition duration-200">Why DeployP2V?</button>
            <button onClick={() => scrollToSection('about')} className="text-gray-300 hover:text-indigo-400 font-medium transition duration-200">About Us</button>
            <button onClick={() => scrollToSection('contact')} className="text-gray-300 hover:text-indigo-400 font-medium transition duration-200">Contact</button>
          </nav>
          <div className="md:hidden">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
              className="text-gray-300 hover:text-indigo-400 focus:outline-none"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <nav className="md:hidden bg-gray-800 py-2 shadow-inner">
            <button onClick={() => scrollToSection('services')} className="block w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-700 transition duration-200">Services</button>
            <button onClick={() => scrollToSection('pricing')} className="block w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-700 transition duration-200">Pricing</button>
            <button onClick={() => scrollToSection('why-us')} className="block w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-700 transition duration-200">Why DeployP2V?</button>
            <button onClick={() => scrollToSection('about')} className="block w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-700 transition duration-200">About Us</button>
            <button onClick={() => scrollToSection('contact')} className="block w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-700 transition duration-200">Contact</button>
          </nav>
        )}
      </header>

      {/* Hero Section */}
      <section id="hero" className="gradient-bg text-white py-20 md:py-32 text-center rounded-b-3xl shadow-xl">
        <div className={`${commonClasses.container} max-w-4xl`}>
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
            DeployP2V: Deploying Practical Vision with AI for Your Small Business
          </h1>
          <p className="text-xl md:text-2xl mb-10 opacity-90">
            Unlock growth, enhance efficiency, and innovate with tailored Artificial Intelligence solutions designed specifically for small businesses.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Button onClick={() => scrollToSection('contact')} className={commonClasses.btnPrimary}>
              Get a Free AI Consultation
            </Button>
            <Button onClick={() => scrollToSection('services')} className={commonClasses.btnSecondary}>
              Explore Our Solutions
            </Button>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-16 md:py-24 bg-gray-900">
        <div className={commonClasses.container}>
          <h2 className={commonClasses.sectionHeading}>Our AI Solutions for Small Businesses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
      <section id="pricing" className="py-16 md:py-24 bg-gray-800">
        <div className={commonClasses.container}>
          <h2 className="text-4xl font-bold text-center mb-4 text-white">Simple, Transparent Pricing</h2>
          <p className="text-xl text-center mb-12 text-gray-300">Choose the plan that fits your business needs</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <PricingCard
              type="Perfect for small businesses getting started with AI"
              name="Starter"
              price="$299/mo"
              features={[
                "1 AI Solution Implementation",
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
      <section id="why-us" className="py-16 md:py-24 bg-gray-900">
        <div className={commonClasses.container}>
          <h2 className="text-4xl font-bold text-center mb-4 text-white">Why Choose DeployP2V?</h2>
          <p className="text-xl text-center mb-16 text-gray-300">We understand small business challenges and deliver practical AI solutions that work</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-indigo-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <Zap className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-white">Fast Implementation</h3>
              <p className="text-gray-300">Get up and running in weeks, not months. Our proven processes ensure quick deployment with minimal disruption to your business.</p>
            </div>

            <div className="text-center">
              <div className="bg-indigo-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <DollarSign className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-white">Affordable Solutions</h3>
              <p className="text-gray-300">Enterprise-grade AI without the enterprise price tag. Our solutions pay for themselves through improved efficiency and cost savings.</p>
            </div>

            <div className="text-center">
              <div className="bg-indigo-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <HeadphonesIcon className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-white">Personalized Support</h3>
              <p className="text-gray-300">Direct access to our AI experts who understand your business. No call centers or ticket systems - just real people who care about your success.</p>
            </div>

            <div className="text-center">
              <div className="bg-indigo-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-white">Proven Results</h3>
              <p className="text-gray-300">Our clients typically see 40% improvement in operational efficiency and 25% cost reduction within the first 6 months of implementation.</p>
            </div>

            <div className="text-center">
              <div className="bg-indigo-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <Settings className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-white">Tailored Solutions</h3>
              <p className="text-gray-300">Every solution is customized for your specific industry and business needs. No cookie-cutter approaches - just AI that works for you.</p>
            </div>

            <div className="text-center">
              <div className="bg-indigo-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <Heart className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-white">Long-term Partnership</h3>
              <p className="text-gray-300">We're not just vendors - we're partners in your growth. Ongoing support, updates, and optimization to ensure continued success.</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 md:py-24 bg-gray-800">
        <div className={commonClasses.container}>
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6 text-white">About DeployP2V</h2>
            <p className="text-xl text-gray-300 mb-12">
              We're a team of AI specialists and business consultants dedicated to making artificial intelligence accessible and practical for small businesses. Our mission is to level the playing field by giving small companies the same AI advantages that large corporations enjoy.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <div className="text-center">
                <div className="text-4xl font-bold text-indigo-400 mb-2">50+</div>
                <div className="text-gray-300">Small Businesses Served</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-indigo-400 mb-2">95%</div>
                <div className="text-gray-300">Client Satisfaction Rate</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-indigo-400 mb-2">2M+</div>
                <div className="text-gray-300">Hours Automated</div>
              </div>
            </div>

            <Card className="bg-gray-700 border-gray-600">
              <CardContent className="p-8">
                <h3 className="text-2xl font-semibold mb-4 text-white">Our Philosophy</h3>
                <p className="text-gray-300 text-lg">
                  "AI shouldn't be complex or intimidating. We believe in creating solutions that are intuitive, effective, and designed specifically for the unique challenges that small businesses face. Every implementation is backed by real business outcomes, not just impressive technology."
                </p>
                <div className="mt-6">
                  <div className="text-indigo-400 font-semibold">- The DeployP2V Team</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 md:py-24 bg-gray-900">
        <div className={commonClasses.container}>
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 text-white">Ready to Transform Your Business with AI?</h2>
              <p className="text-xl text-gray-300">Let's discuss how AI can solve your specific business challenges. Get a free consultation today.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-semibold mb-6 text-white">Get Your Free AI Consultation</h3>
                  <form onSubmit={handleFormSubmit} className="space-y-6">
                    <div>
                      <Label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">Full Name *</Label>
                      <Input 
                        type="text" 
                        id="name" 
                        name="name" 
                        required 
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
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
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
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
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
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
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
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
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                        placeholder="Describe your current challenges and how you think AI might help..."
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      disabled={contactMutation.isPending}
                      className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 transition duration-300 font-semibold"
                    >
                      {contactMutation.isPending ? 'Submitting...' : 'Schedule Free Consultation'}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-semibold mb-6 text-white">Get in Touch</h3>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <Mail className="w-6 h-6 text-indigo-400 mr-4" />
                      <span className="text-gray-300">tsparks@deployp2v.com</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="w-6 h-6 text-indigo-400 mr-4" />
                      <span className="text-gray-300">(214) 604-5735</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-6 h-6 text-indigo-400 mr-4" />
                      <span className="text-gray-300">Wylie, TX</span>
                    </div>
                  </div>
                </div>

                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <h4 className="text-lg font-semibold mb-3 text-white">What Happens Next?</h4>
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <div className="bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">1</div>
                        <p className="text-gray-300">We'll review your submission and schedule a 30-minute discovery call</p>
                      </div>
                      <div className="flex items-start">
                        <div className="bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">2</div>
                        <p className="text-gray-300">During the call, we'll analyze your specific needs and challenges</p>
                      </div>
                      <div className="flex items-start">
                        <div className="bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">3</div>
                        <p className="text-gray-300">We'll provide a customized AI strategy and implementation roadmap</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="text-center">
                  <p className="text-gray-400 text-sm">
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

      {/* Floating Contact Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button 
          onClick={() => scrollToSection('contact')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        >
          <MessageSquare className="w-5 h-5 mr-2" />
          Free Consultation
        </Button>
      </div>
    </div>
  );
}
