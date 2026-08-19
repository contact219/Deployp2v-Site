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
        { id: 'book_consultation', text: 'Book a free 15-min call', action: 'book_appointment' },
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
  const sentLeadKeysRef = useRef<Set<string>>(new Set());

  // FAB discipline (all viewports, mobile included): the launcher hides
  // while the page is scrolling and slides back after ~1s of scroll idle,
  // so it never sits over copy or CTA rows mid-read at any scroll
  // position. It also waits out the first second after load so it never
  // pops over the hero before the visitor has seen it. The open chat
  // window is never auto-hidden.
  const [fabHidden, setFabHidden] = useState(true);
  const fabIdleTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    const show = () => setFabHidden(false);
    fabIdleTimer.current = window.setTimeout(show, 1000);
    const onScroll = () => {
      setFabHidden(true);
      window.clearTimeout(fabIdleTimer.current);
      fabIdleTimer.current = window.setTimeout(show, 1000);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.clearTimeout(fabIdleTimer.current);
    };
  }, []);

  // Corner-clearance guard: the launcher lives in the bottom-right corner,
  // so while the TrustBar marquee row or a closing CTA band (#final-cta /
  // #contact / footer) occupies the bottom ~30% of the viewport, the
  // launcher stays hidden entirely. Structurally it can never overlap
  // those rows — no offset tuning involved. rootMargin -70% top shrinks
  // the observation root to the viewport's bottom band.
  const [cornerBlocked, setCornerBlocked] = useState(false);
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const targets = Array.from(
      document.querySelectorAll('#hero, #trustbar, #final-cta, #contact, footer'),
    );
    if (targets.length === 0) return;
    const inCorner = new Set<Element>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) inCorner.add(entry.target);
          else inCorner.delete(entry.target);
        }
        setCornerBlocked(inCorner.size > 0);
      },
      { rootMargin: '-70% 0px 0px 0px' },
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, []);

  // Persist a qualified lead to the server. Fire-and-forget: chat behavior
  // never changes if the request fails. Deduped so the same profile state
  // isn't submitted twice.
  const submitChatbotLead = (profile: UserProfile, summary?: string) => {
    const hasEmail = Boolean(profile.email);
    const hasAssessment = profile.aiReadinessScore !== undefined;
    if (!hasEmail && !hasAssessment) return;

    const key = `${profile.email ?? ''}|${profile.aiReadinessScore ?? ''}|${profile.leadScore ?? ''}`;
    if (sentLeadKeysRef.current.has(key)) return;
    sentLeadKeysRef.current.add(key);

    const challenges = profile.currentChallenges
      ? Array.isArray(profile.currentChallenges)
        ? profile.currentChallenges
        : [profile.currentChallenges as unknown as string]
      : undefined;

    fetch('/api/chatbot-lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: profile.name,
        email: profile.email,
        company: profile.company,
        industry: profile.industry,
        businessSize: profile.businessSize,
        currentChallenges: challenges,
        techLevel: profile.techLevel,
        budget: profile.budget,
        aiReadinessScore: profile.aiReadinessScore,
        leadScore: profile.leadScore,
        transcriptSummary: summary,
      }),
    }).catch(() => {
      // Allow a retry on the next qualifying event if this attempt failed.
      sentLeadKeysRef.current.delete(key);
    });
  };

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
      "Our Starter plan is $149/month and includes an AI Receptionist or Lead Assistant - live in 7 days with basic customization and email support.",
      "The Professional plan at $499/month includes everything in Starter plus up to 3 AI Agents, advanced customization & workflows, integrations, and priority support.",
      "Our Enterprise plan offers unlimited AI agents, fully custom AI development, dedicated account manager, 24/7 priority support, and security/compliance/SLA options - contact us for custom pricing.",
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
          response = "Perfect! Let me open our consultation booking form for you. You can also reach us directly:\n\n📞 (214) 604-5735\n📧 tsparks@deployp2v.com\n📍 Wylie, TX\n\nThe call is completely free and takes about 15 minutes.";
        }
        break;
        
      case 'provide_roi_calculator':
        response = "Here's a quick ROI estimate based on typical results:\n\n💰 Average cost savings: 25-40%\n⚡ Efficiency improvement: 30-50%\n⏱️ Time saved per week: 10-20 hours\n📈 Typical ROI: 200-400% in first year\n\nFor a personalized ROI calculation, I'd recommend scheduling a consultation where we can analyze your specific business metrics.";
        buttons = [
          { id: 'book_after_roi', text: 'Book a free 15-min call', action: 'book_appointment' },
          { id: 'more_resources', text: 'More Resources', action: 'show_resources' }
        ];
        break;

      case 'detail_customer_support':
        response = "AI Customer Support & Chatbots:\n\n🤖 24/7 automated customer service\n💬 Intelligent chatbots that understand context\n📞 Multi-channel support (website, social media, email)\n🎯 Lead qualification and routing\n📊 Customer sentiment analysis\n🔄 Seamless handoff to human agents when needed\n\nTypical results: 70-90% of inquiries handled automatically, 50% reduction in response time, 24/7 availability.\n\nWould you like to see how this works for your industry?";
        buttons = [
          { id: 'industry_demo', text: 'Industry-Specific Demo', action: 'show_industry_demo' },
          { id: 'pricing_cs', text: 'See Pricing', action: 'show_pricing_details' },
          { id: 'book_cs_demo', text: 'Book a free 15-min call', action: 'book_appointment' }
        ];
        break;

      case 'detail_analytics':
        response = "Predictive Analytics & Sales Forecasting:\n\n📈 Sales trend prediction and forecasting\n🎯 Customer behavior analysis\n💡 Marketing campaign optimization\n🔍 Lead scoring and prioritization\n📊 Performance dashboards and reporting\n🎪 Market trend identification\n\nTypical results: 15-25% increase in conversion rates, 30% better lead qualification, 40% improvement in marketing ROI.\n\nWhich aspect interests you most?";
        buttons = [
          { id: 'lead_scoring', text: 'Lead Scoring', action: 'detail_lead_scoring' },
          { id: 'sales_forecast', text: 'Sales Forecasting', action: 'detail_sales_forecast' },
          { id: 'marketing_opt', text: 'Marketing Optimization', action: 'detail_marketing' }
        ];
        break;

      case 'detail_automation':
        response = "Business Process Automation:\n\n⚡ Automated data entry and processing\n📄 Document classification and routing\n📧 Email automation and responses\n📝 Invoice processing and accounting\n🔄 Workflow optimization\n📋 Task scheduling and management\n\nTypical results: 80% reduction in manual data entry, 60% faster document processing, 90% fewer errors.\n\nWhat processes would you like to automate?";
        buttons = [
          { id: 'data_entry', text: 'Data Entry Automation', action: 'detail_data_entry' },
          { id: 'document_proc', text: 'Document Processing', action: 'detail_documents' },
          { id: 'workflow_opt', text: 'Workflow Optimization', action: 'detail_workflow' }
        ];
        break;

      case 'show_all_services':
        response = "Complete AI Solutions Portfolio:\n\n🤖 AI Customer Support & Chatbots\n📊 Predictive Analytics & Forecasting\n⚡ Business Process Automation\n📝 Document Processing & OCR\n🎯 AI-Enhanced CRM Systems\n📅 Automated Scheduling & Booking\n📈 Market Research & Analysis\n💼 Internal Productivity Apps\n\nAll solutions are:\n✅ Customized for your industry\n✅ Implemented in 2-4 weeks\n✅ Backed by ongoing support\n✅ Designed to pay for themselves\n\nReady to get started?";
        buttons = [
          { id: 'start_assessment', text: 'Take AI Assessment', action: 'start_assessment' },
          { id: 'book_consultation', text: 'Book a free 15-min call', action: 'book_appointment' },
          { id: 'see_pricing', text: 'View Pricing', action: 'show_pricing_details' }
        ];
        break;

      case 'show_pricing_details':
        response = "Our Transparent Pricing:\n\n🚀 STARTER - $149/month\n• AI Receptionist or Lead Assistant - Live in 7 days\n• Basic customization\n• Email support\n• Monthly reports\n\n💼 PROFESSIONAL - $499/month\n• Everything in Starter, plus:\n• Up to 3 AI Agents\n• Advanced customization & workflows\n• CRM, calendar, email, or website integrations\n• Weekly analytics & insights\n• Priority phone & email support\n\n🏢 ENTERPRISE - Custom pricing\n• Unlimited AI agents\n• Fully custom AI development\n• Dedicated account manager\n• 24/7 priority support\n• Real-time analytics dashboard\n• Security, compliance & SLA options\n• Best for: Enterprises, franchises, internal AI systems\n\nAll plans include free consultation and setup. Most clients see ROI within 3-6 months.";
        buttons = [
          { id: 'book_pricing', text: 'Book a free 15-min call', action: 'book_appointment' },
          { id: 'roi_details', text: 'Calculate My ROI', action: 'provide_roi_calculator' }
        ];
        break;

      // Second-level detail handlers
      case 'detail_lead_scoring':
        response = "AI Lead Scoring System:\n\n🎯 Automatic lead qualification based on behavior\n📊 Scoring algorithms trained on your successful sales\n🔄 Real-time lead prioritization\n📈 Integration with your existing CRM\n💡 Predictive buying intent analysis\n📋 Customizable scoring criteria\n\nResults: 30% improvement in conversion rates, 50% better sales team efficiency.\n\nWant to see how this works with your current leads?";
        buttons = [
          { id: 'demo_scoring', text: 'Book a free 15-min call', action: 'book_appointment' },
          { id: 'integration_help', text: 'CRM Integration Info', action: 'show_integration_details' }
        ];
        break;

      case 'detail_sales_forecast':
        response = "Predictive Sales Forecasting:\n\n📈 AI-powered revenue predictions\n📊 Seasonal trend analysis\n🎯 Pipeline probability scoring\n📅 Monthly/quarterly forecasting\n💰 Revenue optimization recommendations\n📉 Risk factor identification\n\nResults: 85% forecast accuracy, 25% improvement in revenue planning.\n\nReady to improve your sales predictions?";
        buttons = [
          { id: 'forecast_demo', text: 'Book a free 15-min call', action: 'book_appointment' },
          { id: 'accuracy_info', text: 'Accuracy Details', action: 'show_accuracy_details' }
        ];
        break;

      case 'detail_marketing':
        response = "AI Marketing Optimization:\n\n📱 Campaign performance analysis\n🎯 Audience segmentation and targeting\n💰 Budget allocation optimization\n📊 A/B testing automation\n🔄 Real-time campaign adjustments\n📈 ROI tracking and reporting\n\nResults: 40% improvement in marketing ROI, 60% better targeting accuracy.\n\nWhich marketing channels do you want to optimize?";
        buttons = [
          { id: 'channel_analysis', text: 'Channel Analysis', action: 'show_channel_details' },
          { id: 'marketing_demo', text: 'Book a free 15-min call', action: 'book_appointment' }
        ];
        break;

      case 'detail_data_entry':
        response = "Automated Data Entry Solutions:\n\n⚡ OCR document scanning and processing\n📄 Form data extraction and validation\n🔄 Database integration and sync\n📊 Real-time data verification\n🎯 Custom field mapping\n📋 Error detection and correction\n\nResults: 80% reduction in manual entry time, 95% accuracy improvement.\n\nWhat types of documents do you process most?";
        buttons = [
          { id: 'document_types', text: 'Document Types', action: 'show_document_options' },
          { id: 'data_demo', text: 'Book a free 15-min call', action: 'book_appointment' }
        ];
        break;

      case 'detail_documents':
        response = "Document Processing Automation:\n\n📄 Invoice and receipt processing\n📋 Contract analysis and extraction\n📊 Report generation automation\n🔍 Document classification\n📁 Automated filing and organization\n✅ Compliance checking\n\nResults: 70% faster document processing, 90% reduction in filing errors.\n\nWhich document types need automation?";
        buttons = [
          { id: 'invoice_processing', text: 'Invoice Processing', action: 'show_invoice_details' },
          { id: 'contract_analysis', text: 'Contract Analysis', action: 'show_contract_details' }
        ];
        break;

      case 'detail_workflow':
        response = "Workflow Optimization with AI:\n\n🔄 Process mapping and analysis\n⚡ Bottleneck identification\n📋 Task automation and routing\n👥 Team coordination optimization\n📊 Performance monitoring\n🎯 Continuous improvement recommendations\n\nResults: 45% faster task completion, 60% improvement in team efficiency.\n\nWhat workflows cause the most delays?";
        buttons = [
          { id: 'workflow_analysis', text: 'Book a free 15-min call', action: 'book_appointment' },
          { id: 'process_mapping', text: 'Process Mapping Info', action: 'show_process_details' }
        ];
        break;

      // Generic fallback for unhandled actions
      default:
        if (action.startsWith('show_') || action.startsWith('detail_')) {
          response = "I'd be happy to provide more details about this! Let me connect you with one of our AI specialists who can give you comprehensive information and answer all your questions.\n\nYou can also explore our other services or take our AI readiness assessment.";
          buttons = [
            { id: 'specialist_call', text: 'Book a free 15-min call', action: 'book_appointment' },
            { id: 'back_services', text: 'Back to Services', action: 'show_services' },
            { id: 'take_assessment', text: 'Take Assessment', action: 'start_assessment' }
          ];
        }
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
        submitChatbotLead(
          { ...updatedProfile, aiReadinessScore: aiReadiness, leadScore },
          'Completed the AI readiness assessment in the website chatbot.'
        );
        
        response = `🎉 Assessment Complete!\n\nYour AI Readiness Score: ${aiReadiness}/100\n\nBased on your answers:\n${generatePersonalizedRecommendations(updatedProfile, aiReadiness)}\n\nWould you like to discuss a customized AI strategy for your business?`;
        buttons = [
          { id: 'book_strategy', text: 'Book a free 15-min call', action: 'book_appointment' },
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

    // If the visitor shares an email anywhere in the conversation, capture it
    // and persist the lead so a real person can follow up.
    const emailMatch = input.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/);
    if (emailMatch && emailMatch[0] !== userProfile.email) {
      const updatedProfile = { ...userProfile, email: emailMatch[0] };
      setUserProfile(prev => ({ ...prev, email: emailMatch[0] }));
      submitChatbotLead(updatedProfile, 'Shared their email in the website chatbot.');
    }

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
          aria-label="Chat with DeployP2V"
          // Brand system (round 5): dark ink launcher with a volt mark — no
          // indigo. Small on mobile (44px = minimum touch target, never
          // smaller) with a safe-area-aware bottom margin; z-40 keeps it
          // under the sticky header (z-50). While the page scrolls it slides
          // out of the corner and returns after ~1s idle (fabHidden), and it
          // stays out whenever the marquee or a CTA band owns the corner
          // (cornerBlocked).
          className={`fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 h-11 w-11 md:bottom-6 md:right-6 md:h-14 md:w-14 rounded-full bg-ink hover:bg-ink-2 border border-[rgba(198,246,40,0.5)] hover:border-volt shadow-[0_8px_32px_rgba(8,12,22,0.5)] z-40 p-0 touch-manipulation transition-[transform,opacity] duration-300 ease-out ${
            fabHidden || cornerBlocked ? 'translate-y-24 opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'
          }`}
        >
          <MessageCircle className="h-5 w-5 md:h-6 md:w-6 text-volt" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-4 right-4 w-[calc(100vw-2rem)] max-w-sm sm:w-96 md:bottom-6 md:right-6 h-96 bg-ink-2 border-[rgba(246,247,242,0.14)] shadow-xl z-40 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[rgba(246,247,242,0.14)]">
            <div className="flex items-center space-x-2">
              <Bot className="h-5 w-5 text-volt" />
              <span className="font-semibold text-mist text-sm">DeployP2V Assistant</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-mist-muted hover:text-mist p-1 h-auto"
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
                      ? 'bg-mist text-ink'
                      : 'bg-ink-3 text-mist'
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    {message.type === 'bot' && <Bot className="h-4 w-4 mt-0.5 text-mist-muted flex-shrink-0" />}
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
                              className="text-xs bg-ink border-[rgba(246,247,242,0.25)] text-mist hover:bg-ink-3 hover:border-[rgba(246,247,242,0.5)] hover:text-mist"
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
                <div className="bg-ink-3 text-mist p-3 rounded-lg text-sm max-w-[80%]">
                  <div className="flex items-center space-x-2">
                    <Bot className="h-4 w-4 text-mist-muted" />
                    <div className="flex space-x-1">
                      {/* Activity dots — volt is the live/action color */}
                      <div className="w-2 h-2 bg-volt rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-volt rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-volt rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </CardContent>

          {/* Input */}
          <div className="p-4 border-t border-[rgba(246,247,242,0.14)]">
            <div className="flex space-x-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about AI services..."
                className="flex-1 bg-ink-3 border-[rgba(246,247,242,0.22)] text-mist placeholder:text-mist-muted text-sm"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                className="bg-volt hover:bg-volt-bright text-ink p-2 touch-manipulation"
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