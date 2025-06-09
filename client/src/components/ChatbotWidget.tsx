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
      message: "Hi! I'm DeployP2V's AI assistant. I can help you learn about our AI solutions for small businesses and schedule a consultation. What can I help you with today?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
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
    ]
  };

  const getAIResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    // Booking/consultation keywords
    if (input.includes('book') || input.includes('schedule') || input.includes('appointment') || 
        input.includes('consultation') || input.includes('meeting') || input.includes('call')) {
      if (onBookAppointment) {
        setTimeout(() => onBookAppointment(), 1000);
        return "I'd be happy to help you schedule a consultation! Let me open our booking form for you. You can also call us directly at (214) 604-5735 or email tsparks@deployp2v.com.";
      }
      return aiResponses.consultation[Math.floor(Math.random() * aiResponses.consultation.length)];
    }
    
    // Services keywords
    if (input.includes('service') || input.includes('solution') || input.includes('chatbot') || 
        input.includes('automation') || input.includes('ai') || input.includes('what do you') ||
        input.includes('help with') || input.includes('offer')) {
      return aiResponses.services[Math.floor(Math.random() * aiResponses.services.length)];
    }
    
    // Pricing keywords
    if (input.includes('price') || input.includes('cost') || input.includes('pricing') || 
        input.includes('plan') || input.includes('how much')) {
      return aiResponses.pricing[Math.floor(Math.random() * aiResponses.pricing.length)];
    }
    
    // Benefits keywords
    if (input.includes('benefit') || input.includes('result') || input.includes('roi') || 
        input.includes('save') || input.includes('efficiency') || input.includes('improve')) {
      return aiResponses.benefits[Math.floor(Math.random() * aiResponses.benefits.length)];
    }
    
    // Implementation keywords
    if (input.includes('implement') || input.includes('how long') || input.includes('timeline') || 
        input.includes('process') || input.includes('setup')) {
      return aiResponses.implementation[Math.floor(Math.random() * aiResponses.implementation.length)];
    }
    
    // Contact information
    if (input.includes('contact') || input.includes('phone') || input.includes('email') || 
        input.includes('address') || input.includes('location')) {
      return "You can reach us at (214) 604-5735 or email tsparks@deployp2v.com. We're located in Wylie, TX and serve businesses throughout Texas. Would you like to schedule a consultation?";
    }
    
    // Greeting responses
    if (input.includes('hello') || input.includes('hi') || input.includes('hey')) {
      return "Hello! I'm here to help you learn about our AI solutions for small businesses. We offer services like AI customer support, predictive analytics, automation, and more. What would you like to know?";
    }
    
    // Default responses
    const defaultResponses = [
      "I can help you learn about our AI solutions including customer support automation, predictive analytics, data processing, and more. What specific area interests you?",
      "We specialize in making AI accessible for small businesses. Our services include chatbots, automation, CRM enhancement, and scheduling systems. What would you like to know more about?",
      "I'd be happy to help! We offer AI solutions that typically improve efficiency by 40% and reduce costs by 25%. Would you like to hear about a specific service or schedule a consultation?",
      "Our AI solutions are designed specifically for small businesses. We can help with customer support, sales forecasting, data automation, and more. What challenges is your business facing?"
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
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
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      const botResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        message: getAIResponse(inputValue),
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
                    <span className="leading-relaxed">{message.message}</span>
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