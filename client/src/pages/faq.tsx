import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import { useState } from 'react';

const faqs = [
  {
    question: "What is AI and how can it help my small business?",
    answer: "AI (Artificial Intelligence) refers to computer systems that can perform tasks typically requiring human intelligence. For small businesses, AI can automate repetitive tasks, provide customer insights, improve decision-making, enhance customer service, and increase operational efficiency. Common applications include chatbots for customer support, predictive analytics for sales forecasting, and automated data entry systems."
  },
  {
    question: "How long does it take to implement an AI solution?",
    answer: "Implementation timelines vary depending on the complexity of the solution. Simple AI tools like chatbots can be deployed in 2-4 weeks, while more complex systems like predictive analytics or custom automation may take 6-12 weeks. We provide a detailed timeline during your consultation based on your specific needs."
  },
  {
    question: "Do I need technical expertise to use AI solutions?",
    answer: "No technical expertise is required. We design all our AI solutions to be user-friendly and intuitive. We provide comprehensive training and ongoing support to ensure your team can effectively use and manage the AI tools. Our solutions are built for business users, not technical experts."
  },
  {
    question: "What's the difference between your pricing plans?",
    answer: "Our Starter plan ($149/mo) includes an AI Receptionist or Lead Assistant live in 7 days with basic customization, perfect for businesses new to AI. The Professional plan ($599/mo) offers up to three AI solutions with advanced features and priority support, ideal for growing businesses. Enterprise plans are custom-priced and include unlimited solutions with dedicated support for established businesses with complex needs."
  },
  {
    question: "How do you ensure my business data is secure?",
    answer: "Data security is our top priority. We use enterprise-grade encryption, secure cloud infrastructure, and follow industry best practices for data protection. We're compliant with relevant data protection regulations and never share your data with third parties. All AI processing is done securely, and you maintain full ownership of your data."
  },
  {
    question: "Can AI solutions integrate with my existing software?",
    answer: "Yes, our AI solutions are designed to integrate seamlessly with popular business software including CRMs, accounting systems, e-commerce platforms, and productivity tools. We assess your current tech stack during consultation and ensure smooth integration with minimal disruption to your operations."
  },
  {
    question: "What kind of ROI can I expect from AI implementation?",
    answer: "ROI varies by business and implementation, but our clients typically see 20-40% improvements in operational efficiency, 15-30% reduction in manual tasks, and 10-25% increase in customer satisfaction scores within the first 6 months. We provide detailed ROI projections during your consultation based on your specific use case."
  },
  {
    question: "Do you provide training and ongoing support?",
    answer: "Absolutely. All plans include comprehensive training for your team, user documentation, and ongoing support. Professional and Enterprise plans include priority support with faster response times. We also provide regular check-ins to optimize performance and answer questions as your business grows."
  },
  {
    question: "What happens if the AI solution doesn't work for my business?",
    answer: "We offer a 30-day satisfaction guarantee. If you're not satisfied with the solution within the first month, we'll work with you to modify the approach or provide a full refund. Our consultation process is designed to ensure the right fit before implementation begins."
  },
  {
    question: "Can I scale my AI solutions as my business grows?",
    answer: "Yes, our solutions are designed to scale with your business. You can easily upgrade your plan, add new AI capabilities, or increase processing capacity as needed. We regularly review your usage and recommend optimizations or expansions to maximize value."
  },
  {
    question: "What industries do you serve?",
    answer: "We work with small businesses across various industries including retail, professional services, healthcare, real estate, manufacturing, hospitality, and e-commerce. Our solutions are customized to meet industry-specific needs and compliance requirements."
  },
  {
    question: "How do I get started with DeployP2V?",
    answer: "Getting started is simple: fill out our contact form to request a free consultation, we'll schedule a 30-minute discovery call to understand your needs, then provide a customized AI strategy and implementation plan. There's no obligation, and we'll clearly explain costs and timelines before any work begins."
  }
];

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer, isOpen, onToggle }) => (
  <div className="border border-gray-700 rounded-lg">
    <button
      onClick={onToggle}
      className="w-full px-6 py-4 text-left flex justify-between items-center bg-gray-800 hover:bg-gray-750 transition-colors rounded-lg"
    >
      <h3 className="text-lg font-semibold text-white pr-4">{question}</h3>
      <ChevronDown 
        className={`w-5 h-5 text-indigo-400 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
      />
    </button>
    {isOpen && (
      <div className="px-6 py-4 bg-gray-700 rounded-b-lg">
        <p className="text-gray-300 leading-relaxed">{answer}</p>
      </div>
    )}
  </div>
);

export default function FAQ() {
  const [, setLocation] = useLocation();
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

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

      {/* FAQ Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-xl text-gray-300">
            Everything you need to know about AI solutions for your small business
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              question={faq.question}
              answer={faq.answer}
              isOpen={openItems.includes(index)}
              onToggle={() => toggleItem(index)}
            />
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="bg-gray-800 rounded-lg p-8">
            <h2 className="text-2xl font-semibold mb-4 text-white">Still have questions?</h2>
            <p className="text-gray-300 mb-6">
              Can't find what you're looking for? Get in touch with our team for personalized answers.
            </p>
            <Button 
              onClick={() => setLocation('/')}
              className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 transition duration-300"
            >
              Contact Us
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}