import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

interface ChatMessage {
  id: string;
  type: 'bot' | 'user';
  message: string;
  timestamp: Date;
  buttons?: ChatButton[];
}

interface ChatButton {
  id: string;
  text: string;
  action: string;
}

interface UserProfile {
  name?: string;
  email?: string;
  company?: string;
  industry?: string;
  businessSize?: string;
  currentChallenges?: string[];
  aiReadinessScore?: number;
  leadScore?: number;
  techLevel?: string;
  budget?: string;
}

interface ChatbotWidgetProps {
  onBookAppointment?: () => void;
}

export default function ChatbotWidget({ onBookAppointment }: ChatbotWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'bot',
      message: "Hi! I'm DeployP2V's AI assistant. I can help you discover the perfect AI solutions for your business, assess your AI readiness, and connect you with our experts. What brings you here today?",
      timestamp: new Date(),
      buttons: [
        { id: 'learn_services', text: 'Learn About AI Services', action: 'show_services' },
        { id: 'ai_assessment', text: 'AI Readiness Assessment', action: 'start_assessment' },
        { id: 'book_consultation', text: 'Book Free Consultation', action: 'book_appointment' },
        { id: 'get_resources', text: 'Download Resources', action: 'show_resources' }
      ]
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>({});
  const [conversationState, setConversationState] = useState<string>('initial');
  const [assessmentStep, setAssessmentStep] = useState<number>(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const aiResponses = {
    services: [
      "We offer AI-powered customer support with intelligent chatbots that provide 24/7 assistance to your customers.",
      "Our predictive analytics services help you forecast sales, understand customer behavior, and optimize marketing campaigns.",
      "We provide automated data entry and reporting solutions that eliminate manual work and reduce errors.",
      "Our AI-enhanced CRM systems include lead prioritization and customer sentiment analysis.",
      "We develop automated scheduling and booking systems that optimize appointment times using AI.",
      "Our market research and trend analysis services use AI to track competitors and customer sentiment.",
      "We create custom internal productivity applications for document processing and workflow automation."
    ],
    pricing: [
      "Our Starter plan is $299/month and includes 1 AI solution implementation with basic customization and email support.",
      "The Professional plan at $599/month includes up to 3 AI solutions, advanced customization, and priority support.",
      "Our Enterprise plan offers unlimited AI solutions, dedicated support, and custom development - contact us for pricing.",
      "All our solutions are designed to pay for themselves through improved efficiency and cost savings."
    ],
    benefits: [
      "Our clients typically see 40% improvement in operational efficiency within the first 6 months.",
      "AI automation can reduce manual data entry time by up to 80% and eliminate human errors.",
      "24/7 AI customer support can handle 70-90% of routine inquiries without human intervention.",
      "Predictive analytics can increase sales conversion rates by 15-25% through better lead targeting.",
      "AI scheduling systems reduce booking conflicts and optimize staff utilization by 30%."
    ],
    implementation: [
      "We handle the entire implementation process from planning to deployment and training.",
      "Most AI solutions are deployed within 2-4 weeks with minimal disruption to your business.",
      "We provide comprehensive training for your team and ongoing support to ensure success.",
      "All solutions are customized to your specific industry and business needs."
    ],
    consultation: [
      "I can help you schedule a free 30-minute consultation with our AI specialists.",
      "During the consultation, we'll analyze your specific business needs and challenges.",
      "We'll provide a customized AI strategy and implementation roadmap for your business.",
      "Would you like me to help you book a consultation? I'll need your contact information."
    ],
    resources: [
      "📋 AI Implementation Checklist - A step-by-step guide to prepare your business for AI",
      "📊 ROI Calculator - Calculate potential savings and efficiency gains from AI automation",
      "📖 Small Business AI Guide - Complete guide to AI solutions for different industries",
      "📈 Case Studies - Real examples of how Texas businesses transformed with AI",
      "🎯 AI Readiness Assessment - Evaluate your business's readiness for AI implementation"
    ],
    industries: {
      healthcare: "For healthcare practices, we specialize in patient scheduling automation, automated appointment reminders, insurance claim processing, and patient communication systems.",
      retail: "For retail businesses, we offer inventory management AI, customer behavior analytics, personalized marketing automation, and chatbots for customer service.",
      professional: "For professional services, we provide client portal automation, document processing, automated billing systems, and lead qualification chatbots.",
      manufacturing: "For manufacturing, we offer predictive maintenance systems, quality control automation, supply chain optimization, and production planning AI.",
      restaurants: "For restaurants, we provide automated ordering systems, inventory management, customer feedback analysis, and staff scheduling optimization."
    }
  };

  const assessmentQuestions = [
    {
      question: "What's your primary business industry?",
      options: ["Healthcare", "Retail", "Professional Services", "Manufacturing", "Restaurant/Food", "Other"],
      field: "industry"
    },
    {
      question: "How many employees does your business have?",
      options: ["1-5", "6-20", "21-50", "51-100", "100+"],
      field: "businessSize"
    },
    {
      question: "What's your biggest operational challenge?",
      options: ["Customer Service", "Data Management", "Scheduling", "Marketing", "Inventory", "Administrative Tasks"],
      field: "currentChallenges"
    },
    {
      question: "How tech-savvy is your team?",
      options: ["Very tech-savvy", "Moderately comfortable", "Basic computer skills", "Need significant support"],
      field: "techLevel"
    },
    {
      question: "What's your monthly budget for business improvements?",
      options: ["Under $500", "$500-$1000", "$1000-$2000", "$2000+"],
      field: "budget"
    }
  ];

  const calculateLeadScore = (profile: UserProfile): number => {
    let score = 0;
    
    // Budget scoring
    if (profile.budget === "$2000+") score += 30;
    else if (profile.budget === "$1000-$2000") score += 20;
    else if (profile.budget === "$500-$1000") score += 10;
    
    // Business size scoring
    if (profile.businessSize === "100+") score += 25;
    else if (profile.businessSize === "51-100") score += 20;
    else if (profile.businessSize === "21-50") score += 15;
    else if (profile.businessSize === "6-20") score += 10;
    
    // Industry scoring (higher value industries)
    if (profile.industry === "Healthcare" || profile.industry === "Professional Services") score += 20;
    else if (profile.industry === "Manufacturing" || profile.industry === "Retail") score += 15;
    
    // Challenge alignment
    if (profile.currentChallenges?.includes("Customer Service") || 
        profile.currentChallenges?.includes("Data Management") ||
        profile.currentChallenges?.includes("Administrative Tasks")) score += 15;
    
    return Math.min(score, 100);
  };

  const calculateAIReadiness = (profile: UserProfile): number => {
    let readiness = 0;
    
    // Tech level
    if (profile.techLevel === "Very tech-savvy") readiness += 40;
    else if (profile.techLevel === "Moderately comfortable") readiness += 30;
    else if (profile.techLevel === "Basic computer skills") readiness += 20;
    else readiness += 10;
    
    // Business size (larger = more ready)
    if (profile.businessSize === "100+") readiness += 30;
    else if (profile.businessSize === "51-100") readiness += 25;
    else if (profile.businessSize === "21-50") readiness += 20;
    else if (profile.businessSize === "6-20") readiness += 15;
    else readiness += 10;
    
    // Budget readiness
    if (profile.budget === "$2000+") readiness += 30;
    else if (profile.budget === "$1000-$2000") readiness += 20;
    else if (profile.budget === "$500-$1000") readiness += 15;
    else readiness += 5;
    
    return Math.min(readiness, 100);
  };

  const handleButtonClick = async (action: string, buttonId?: string) => {
    setIsTyping(true);
    
    let response = "";
    let buttons: ChatButton[] = [];
    
    switch (action) {
      case 'show_services':
        response = "Here are our core AI services for small businesses:\n\n🤖 AI Customer Support & Chatbots\n📊 Predictive Analytics & Sales Forecasting\n⚡ Business Process Automation\n📝 Document Processing & Data Entry\n🎯 AI-Enhanced CRM Systems\n📅 Automated Scheduling & Booking\n📈 Market Research & Trend Analysis\n\nWhich area interests you most?";
        buttons = [
          { id: 'customer_support', text: 'Customer Support', action: 'detail_customer_support' },
          { id: 'analytics', text: 'Analytics & Forecasting', action: 'detail_analytics' },
          { id: 'automation', text: 'Process Automation', action: 'detail_automation' },
          { id: 'all_services', text: 'Learn About All Services', action: 'show_all_services' }
        ];
        break;
        
      case 'start_assessment':
        setConversationState('assessment');
        setAssessmentStep(0);
        response = `Let's assess your business's AI readiness! This will help me recommend the best solutions for you.\n\n${assessmentQuestions[0].question}`;
        buttons = assessmentQuestions[0].options.map((option, index) => ({
          id: `q0_${index}`,
          text: option,
          action: `answer_${assessmentQuestions[0].field}_${option}`
        }));
        break;
        
      case 'show_resources':
        response = "Here are valuable resources I can provide:\n\n" + aiResponses.resources.join('\n\n') + "\n\nWhich resource would you like to access?";
        buttons = [
          { id: 'roi_calc', text: 'ROI Calculator', action: 'provide_roi_calculator' },
          { id: 'checklist', text: 'Implementation Checklist', action: 'provide_checklist' },
          { id: 'guide', text: 'AI Guide', action: 'provide_guide' },
          { id: 'case_studies', text: 'Case Studies', action: 'provide_case_studies' }
        ];
        break;
        
      case 'book_appointment':
        if (onBookAppointment) {
          setTimeout(() => onBookAppointment(), 1000);
          response = "Perfect! Let me open our consultation booking form for you. You can also reach us directly:\n\n📞 (214) 604-5735\n📧 tsparks@deployp2v.com\n📍 Wylie, TX\n\nOur consultations are completely free and typically last 30 minutes.";
        }
        break;
        
      case 'provide_roi_calculator':
        response = "Here's a quick ROI estimate based on typical results:\n\n💰 Average cost savings: 25-40%\n⚡ Efficiency improvement: 30-50%\n⏱️ Time saved per week: 10-20 hours\n📈 Typical ROI: 200-400% in first year\n\nFor a personalized ROI calculation, I'd recommend scheduling a consultation where we can analyze your specific business metrics.";
        buttons = [
          { id: 'book_after_roi', text: 'Schedule ROI Analysis', action: 'book_appointment' },
          { id: 'more_resources', text: 'More Resources', action: 'show_resources' }
        ];
        break;
    }
    
    // Handle assessment answers
    if (action.startsWith('answer_')) {
      const parts = action.split('_');
      const field = parts[1];
      const value = parts.slice(2).join('_');
      
      setUserProfile(prev => ({ ...prev, [field]: value }));
      
      const nextStep = assessmentStep + 1;
      if (nextStep < assessmentQuestions.length) {
        setAssessmentStep(nextStep);
        response = `Great! ${assessmentQuestions[nextStep].question}`;
        buttons = assessmentQuestions[nextStep].options.map((option, index) => ({
          id: `q${nextStep}_${index}`,
          text: option,
          action: `answer_${assessmentQuestions[nextStep].field}_${option}`
        }));
      } else {
        // Assessment complete
        const updatedProfile = { ...userProfile, [field]: value };
        const aiReadiness = calculateAIReadiness(updatedProfile);
        const leadScore = calculateLeadScore(updatedProfile);
        
        setUserProfile(prev => ({ ...prev, aiReadinessScore: aiReadiness, leadScore }));
        setConversationState('assessment_complete');
        
        response = `🎉 Assessment Complete!\n\nYour AI Readiness Score: ${aiReadiness}/100\n\nBased on your answers:\n${generatePersonalizedRecommendations(updatedProfile, aiReadiness)}\n\nWould you like to discuss a customized AI strategy for your business?`;
        buttons = [
          { id: 'book_strategy', text: 'Schedule Strategy Call', action: 'book_appointment' },
          { id: 'learn_more', text: 'Learn More About Solutions', action: 'show_services' },
          { id: 'get_resources_post', text: 'Download Resources', action: 'show_resources' }
        ];
      }
    }
    
    setTimeout(() => {
      const botMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'bot',
        message: response,
        timestamp: new Date(),
        buttons: buttons.length > 0 ? buttons : undefined
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const generatePersonalizedRecommendations = (profile: UserProfile, readiness: number): string => {
    let recommendations = "";
    
    if (readiness >= 80) {
      recommendations += "✅ Your business is highly ready for AI implementation!\n";
    } else if (readiness >= 60) {
      recommendations += "🟡 Your business has good potential for AI adoption with some preparation.\n";
    } else {
      recommendations += "🔄 We recommend starting with basic automation to build your AI foundation.\n";
    }
    
    // Industry-specific recommendations
    if (profile.industry && aiResponses.industries[profile.industry.toLowerCase() as keyof typeof aiResponses.industries]) {
      recommendations += "\n" + aiResponses.industries[profile.industry.toLowerCase() as keyof typeof aiResponses.industries];
    }
    
    // Challenge-specific recommendations
    if (profile.currentChallenges?.includes("Customer Service")) {
      recommendations += "\n\n🤖 Recommended: AI Chatbot for 24/7 customer support";
    }
    if (profile.currentChallenges?.includes("Data Management")) {
      recommendations += "\n\n📊 Recommended: Automated data processing and reporting";
    }
    if (profile.currentChallenges?.includes("Scheduling")) {
      recommendations += "\n\n📅 Recommended: AI-powered scheduling optimization";
    }
    
    return recommendations;
  };

  const getAIResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    // Collect name/email during conversation
    if (conversationState === 'collecting_info') {
      if (input.includes('@')) {
        setUserProfile(prev => ({ ...prev, email: userInput }));
        return "Thank you! I have your email. What's your name so I can personalize our conversation?";
      }
      if (!userProfile.name && !input.includes('@')) {
        setUserProfile(prev => ({ ...prev, name: userInput }));
        return `Nice to meet you, ${userInput}! Now I can provide more personalized recommendations. What would you like to explore?`;
      }
    }
    
    // Industry-specific responses
    Object.keys(aiResponses.industries).forEach(industry => {
      if (input.includes(industry)) {
        return aiResponses.industries[industry as keyof typeof aiResponses.industries];
      }
    });
    
    // Standard keyword matching with enhanced responses
    if (input.includes('book') || input.includes('schedule') || input.includes('appointment') || 
        input.includes('consultation') || input.includes('meeting') || input.includes('call')) {
      if (onBookAppointment) {
        setTimeout(() => onBookAppointment(), 1000);
        return "I'd be happy to help you schedule a consultation! Let me open our booking form for you. You can also call us directly at (214) 604-5735 or email tsparks@deployp2v.com.";
      }
      return aiResponses.consultation[Math.floor(Math.random() * aiResponses.consultation.length)];
    }
    
    if (input.includes('service') || input.includes('solution') || input.includes('what do you') ||
        input.includes('help with') || input.includes('offer')) {
      return aiResponses.services[Math.floor(Math.random() * aiResponses.services.length)];
    }
    
    if (input.includes('price') || input.includes('cost') || input.includes('pricing') || 
        input.includes('plan') || input.includes('how much')) {
      return aiResponses.pricing[Math.floor(Math.random() * aiResponses.pricing.length)];
    }
    
    if (input.includes('benefit') || input.includes('result') || input.includes('roi') || 
        input.includes('save') || input.includes('efficiency') || input.includes('improve')) {
      return aiResponses.benefits[Math.floor(Math.random() * aiResponses.benefits.length)];
    }
    
    if (input.includes('resource') || input.includes('download') || input.includes('guide') || 
        input.includes('checklist') || input.includes('calculator')) {
      return "I can provide several valuable resources: " + aiResponses.resources.join(', ') + ". Which would you like to access?";
    }
    
    if (input.includes('assessment') || input.includes('ready') || input.includes('evaluate')) {
      return "I can help you assess your business's AI readiness! This quick evaluation will help determine the best AI solutions for your specific situation. Would you like to start the assessment?";
    }
    
    // Default responses based on conversation state
    const personalizedResponses = [
      userProfile.name ? `${userProfile.name}, I'm here to help you discover the perfect AI solutions for your business. What specific challenges are you facing?` :
      "I can help you discover AI solutions tailored to your business needs. What industry are you in?",
      "Our AI solutions are designed to solve real business problems. What's your biggest operational challenge right now?",
      "Would you like to take our AI readiness assessment to get personalized recommendations, or would you prefer to learn about specific services?",
      "I can provide industry-specific recommendations, download resources, or help you schedule a consultation. What interests you most?"
    ];
    
    return personalizedResponses[Math.floor(Math.random() * personalizedResponses.length)];
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      message: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const input = inputValue;
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      const botResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        message: getAIResponse(input),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Chat Widget Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-indigo-600 hover:bg-indigo-700 shadow-lg z-50 p-0 touch-manipulation"
        >
          <MessageCircle className="h-6 w-6 text-white" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-80 sm:w-96 h-96 bg-gray-800 border-gray-600 shadow-xl z-50 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-600">
            <div className="flex items-center space-x-2">
              <Bot className="h-5 w-5 text-indigo-400" />
              <span className="font-semibold text-white text-sm">DeployP2V Assistant</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white p-1 h-auto"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages */}
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg text-sm ${
                    message.type === 'user'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-700 text-gray-200'
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    {message.type === 'bot' && <Bot className="h-4 w-4 mt-0.5 text-indigo-400 flex-shrink-0" />}
                    {message.type === 'user' && <User className="h-4 w-4 mt-0.5 flex-shrink-0" />}
                    <div className="flex-1">
                      <span className="leading-relaxed whitespace-pre-line">{message.message}</span>
                      {message.buttons && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {message.buttons.map((button) => (
                            <Button
                              key={button.id}
                              variant="outline"
                              size="sm"
                              onClick={() => handleButtonClick(button.action, button.id)}
                              className="text-xs bg-gray-600 border-gray-500 text-gray-200 hover:bg-gray-500 hover:text-white"
                            >
                              {button.text}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-700 text-gray-200 p-3 rounded-lg text-sm max-w-[80%]">
                  <div className="flex items-center space-x-2">
                    <Bot className="h-4 w-4 text-indigo-400" />
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </CardContent>

          {/* Input */}
          <div className="p-4 border-t border-gray-600">
            <div className="flex space-x-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about AI services..."
                className="flex-1 bg-gray-700 border-gray-600 text-white placeholder-gray-400 text-sm"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 p-2 touch-manipulation"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </>
  );
}