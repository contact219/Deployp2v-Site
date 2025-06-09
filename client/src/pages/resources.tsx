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
  onDownload: (resource: typeof resources[0]) => void;
}

const ResourceCard: React.FC<ResourceCardProps> = ({ resource, onDownload }) => (
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
          onClick={() => onDownload(resource)}
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
  const [selectedResource, setSelectedResource] = useState<typeof resources[0] | null>(null);
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
  const [emailInput, setEmailInput] = useState('');

  const handleDownload = (resource: typeof resources[0]) => {
    setSelectedResource(resource);
    setIsResourceModalOpen(true);
  };

  const downloadResource = (resource: typeof resources[0], email: string) => {
    if (!email) {
      alert('Please enter your email address to download the resource.');
      return;
    }

    // Create downloadable content based on the resource
    let content = '';
    let filename = '';

    switch (resource.id) {
      case 1:
        content = generateAIImplementationGuide();
        filename = 'AI-Implementation-Guide-for-Small-Business.pdf';
        break;
      case 2:
        content = generateROIWorksheet();
        filename = 'ROI-Calculation-Worksheet.xlsx';
        break;
      case 3:
        content = generateReadinessChecklist();
        filename = 'AI-Readiness-Assessment-Checklist.pdf';
        break;
      case 4:
        content = generateIndustryUseCases();
        filename = 'Industry-Specific-AI-Use-Cases.pdf';
        break;
      case 5:
        content = generateVendorTemplate();
        filename = 'AI-Vendor-Evaluation-Template.xlsx';
        break;
      case 6:
        content = generateChangeManagementGuide();
        filename = 'Change-Management-for-AI-Implementation.pdf';
        break;
      default:
        content = generateGenericGuide(resource);
        filename = `${resource.title.replace(/[^a-zA-Z0-9]/g, '-')}.pdf`;
    }

    // Create and trigger download
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Close modal
    setIsResourceModalOpen(false);
    setSelectedResource(null);
  };

  const generateAIImplementationGuide = () => {
    return `AI IMPLEMENTATION GUIDE FOR SMALL BUSINESS
===============================================

TABLE OF CONTENTS
1. Introduction to AI for Small Business
2. Pre-Implementation Assessment
3. Technology Selection Framework
4. Budget Planning & ROI Estimation
5. Implementation Roadmap
6. Success Metrics & KPIs
7. Common Pitfalls to Avoid
8. Resources & Next Steps

CHAPTER 1: INTRODUCTION TO AI FOR SMALL BUSINESS
=============================================

What is Artificial Intelligence?
Artificial Intelligence (AI) refers to computer systems that can perform tasks typically requiring human intelligence. For small businesses, AI offers practical solutions to automate routine tasks, improve decision-making, and enhance customer experiences.

Key AI Technologies for Small Business:
• Chatbots and Virtual Assistants
• Predictive Analytics
• Process Automation (RPA)
• Natural Language Processing
• Computer Vision

Benefits of AI Implementation:
• Reduced operational costs (20-40% average savings)
• Improved efficiency and productivity
• Enhanced customer service and satisfaction
• Better data-driven decision making
• Competitive advantage in the marketplace

CHAPTER 2: PRE-IMPLEMENTATION ASSESSMENT
======================================

Business Readiness Checklist:
□ Clear business objectives and pain points identified
□ Current processes documented and analyzed
□ Data quality and availability assessed
□ Team capabilities and training needs evaluated
□ Budget and timeline established
□ Leadership buy-in secured

Process Analysis Framework:
1. Identify repetitive, time-consuming tasks
2. Evaluate data requirements for each process
3. Assess potential for automation
4. Calculate current costs and inefficiencies
5. Prioritize based on ROI potential

CHAPTER 3: TECHNOLOGY SELECTION FRAMEWORK
=======================================

Selection Criteria:
• Business fit and alignment with goals
• Technical complexity and requirements
• Implementation timeline and effort
• Cost considerations (initial and ongoing)
• Vendor reputation and support
• Scalability and future growth potential

Technology Comparison Matrix:
[See detailed comparison chart in appendix]

Vendor Evaluation Process:
1. Create RFP with specific requirements
2. Request demonstrations and trials
3. Check references from similar businesses
4. Evaluate technical support and training
5. Review contracts and terms carefully

CHAPTER 4: BUDGET PLANNING & ROI ESTIMATION
==========================================

Cost Components:
• Software licensing fees
• Implementation and setup costs
• Training and change management
• Ongoing maintenance and support
• Hardware and infrastructure upgrades

ROI Calculation Framework:
ROI = (Gains - Costs) / Costs × 100

Typical ROI Timelines:
• Simple automation: 3-6 months
• Advanced analytics: 6-12 months
• Complex implementations: 12-24 months

CHAPTER 5: IMPLEMENTATION ROADMAP
================================

Phase 1: Foundation (Weeks 1-4)
• Finalize vendor selection
• Set up infrastructure
• Prepare data and integrations
• Train core team members

Phase 2: Pilot Implementation (Weeks 5-8)
• Deploy in limited scope
• Monitor performance closely
• Gather user feedback
• Make necessary adjustments

Phase 3: Full Rollout (Weeks 9-16)
• Expand to full organization
• Provide comprehensive training
• Establish monitoring and optimization processes
• Document lessons learned

Phase 4: Optimization (Ongoing)
• Regular performance reviews
• Continuous improvement initiatives
• Explore additional use cases
• Plan for scaling and expansion

CHAPTER 6: SUCCESS METRICS & KPIs
===============================

Key Performance Indicators:
• Time savings (hours saved per week/month)
• Cost reduction (percentage and dollar amounts)
• Error reduction (accuracy improvements)
• Customer satisfaction scores
• Employee productivity metrics
• Revenue impact

Measurement Framework:
1. Establish baseline metrics before implementation
2. Set up automated tracking and reporting
3. Regular review meetings (weekly/monthly)
4. Quarterly business impact assessments
5. Annual ROI and strategy reviews

CHAPTER 7: COMMON PITFALLS TO AVOID
=================================

Implementation Mistakes:
• Starting too big or too complex
• Insufficient data preparation
• Inadequate user training
• Poor change management
• Unrealistic expectations
• Vendor lock-in without proper evaluation

Best Practices:
• Start small and scale gradually
• Invest in data quality and preparation
• Prioritize user adoption and training
• Maintain realistic timelines and expectations
• Plan for ongoing optimization and improvement

CHAPTER 8: RESOURCES & NEXT STEPS
===============================

Recommended Reading:
• "Artificial Intelligence for People in a Hurry" by Neil Reddy
• "The AI Advantage" by Thomas Davenport
• "Prediction Machines" by Ajay Agrawal

Industry Resources:
• Small Business Administration AI Resources
• Industry-specific AI user groups
• Local business incubators and accelerators
• AI vendor partner programs

Getting Professional Help:
When to consider hiring consultants:
• Complex multi-system integrations
• Large-scale organizational change
• Industry-specific compliance requirements
• Limited internal technical expertise

Next Steps:
1. Complete the AI Readiness Assessment
2. Use the ROI Calculator to estimate potential returns
3. Schedule consultations with 3-5 vendors
4. Develop your implementation timeline
5. Secure budget and leadership approval

APPENDIX: TEMPLATES AND WORKSHEETS
=================================

A. Business Process Analysis Template
B. Vendor Evaluation Scorecard
C. Implementation Timeline Template
D. ROI Calculation Worksheet
E. Training Plan Template
F. Success Metrics Dashboard

---
This guide was created by DeployP2V to help small businesses successfully implement AI solutions.
For personalized guidance, contact us at contact@deployp2v.com or call 214-604-5735.

© 2024 DeployP2V. All rights reserved.`;
  };

  const generateROIWorksheet = () => {
    return `AI ROI CALCULATION WORKSHEET
===========================

BUSINESS INFORMATION
Company Name: ________________
Industry: ____________________
Number of Employees: __________
Monthly Revenue: $____________

CURRENT STATE ANALYSIS
======================

Manual Process Costs:
• Hours spent on manual data entry per week: ______
• Average hourly wage: $______
• Weekly labor cost for manual tasks: $______
• Annual labor cost: $______

Error Costs:
• Estimated errors per month: ______
• Average cost per error: $______
• Monthly error cost: $______
• Annual error cost: $______

Opportunity Costs:
• Hours spent on non-strategic tasks: ______
• Value of strategic work per hour: $______
• Monthly opportunity cost: $______
• Annual opportunity cost: $______

TOTAL CURRENT ANNUAL COSTS: $______

AI IMPLEMENTATION COSTS
========================

Initial Costs:
• Software licensing (first year): $______
• Implementation and setup: $______
• Training and change management: $______
• Hardware/infrastructure: $______

TOTAL INITIAL INVESTMENT: $______

Ongoing Annual Costs:
• Software licensing (annual): $______
• Maintenance and support: $______
• Additional training: $______

TOTAL ANNUAL ONGOING COSTS: $______

PROJECTED BENEFITS
==================

Labor Savings:
• Expected reduction in manual hours: _____%
• Annual labor savings: $______

Error Reduction:
• Expected error reduction: _____%
• Annual error cost savings: $______

Efficiency Gains:
• Expected productivity improvement: _____%
• Annual value of efficiency gains: $______

Revenue Impact:
• Expected revenue increase: _____%
• Annual additional revenue: $______

TOTAL ANNUAL BENEFITS: $______

ROI CALCULATION
===============

Year 1:
Net Benefit = Total Benefits - (Initial Investment + Ongoing Costs)
Net Benefit = $______ - ($______ + $______)
Net Benefit = $______

ROI Year 1 = (Net Benefit / Total Investment) × 100
ROI Year 1 = ($______ / $______) × 100 = _____%

Year 2 and Beyond:
Net Annual Benefit = Total Benefits - Ongoing Costs
Net Annual Benefit = $______ - $______ = $______

ROI (Ongoing) = (Net Annual Benefit / Ongoing Costs) × 100
ROI (Ongoing) = ($______ / $______) × 100 = _____%

Payback Period:
Payback Period = Initial Investment / Net Annual Benefit
Payback Period = $______ / $______ = ______ months

3-YEAR PROJECTION
=================

Year 1: $______
Year 2: $______
Year 3: $______

Total 3-Year Net Benefit: $______
Total 3-Year ROI: _____%

RISK FACTORS
============

Low Risk Scenarios (multiply benefits by 0.8):
Conservative Benefits: $______
Conservative ROI: _____%

High Risk Scenarios (multiply benefits by 0.6):
Pessimistic Benefits: $______
Pessimistic ROI: _____%

DECISION FRAMEWORK
==================

Proceed if:
□ ROI exceeds 150% in first year
□ Payback period is less than 18 months
□ Conservative scenario still shows positive ROI
□ Strategic benefits align with business goals

Consider alternatives if:
□ ROI is less than 100% in first year
□ Payback period exceeds 24 months
□ High risk scenarios show negative ROI
□ Implementation complexity is very high

NOTES AND ASSUMPTIONS
=====================

Key Assumptions:
• _________________________________
• _________________________________
• _________________________________

Risk Mitigation Strategies:
• _________________________________
• _________________________________
• _________________________________

Next Steps:
□ Validate assumptions with vendors
□ Get detailed implementation timeline
□ Secure budget approval
□ Plan pilot implementation

---
Worksheet completed by: ________________
Date: ________________
Review date: ________________`;
  };

  const generateReadinessChecklist = () => {
    return `AI READINESS ASSESSMENT CHECKLIST
==================================

Complete this comprehensive checklist to determine if your business is ready for AI implementation.

SECTION 1: BUSINESS STRATEGY & OBJECTIVES
========================================

Strategic Alignment:
□ Clear business objectives defined
□ AI use cases identified and prioritized
□ Expected outcomes and success metrics established
□ Leadership commitment and buy-in secured
□ Budget allocated for AI initiatives

Organizational Readiness:
□ Change management process in place
□ Communication plan developed
□ Training resources identified
□ Timeline and milestones established
□ Risk assessment completed

SECTION 2: DATA INFRASTRUCTURE
==============================

Data Quality:
□ Data sources identified and cataloged
□ Data quality assessed and documented
□ Data cleaning processes established
□ Data governance policies in place
□ Data security measures implemented

Data Accessibility:
□ Data easily accessible and queryable
□ APIs and integrations available
□ Data formats standardized
□ Historical data sufficient for training
□ Real-time data feeds established

SECTION 3: TECHNICAL INFRASTRUCTURE
===================================

IT Systems:
□ Current systems documented and assessed
□ Integration capabilities evaluated
□ Scalability requirements defined
□ Security requirements established
□ Backup and disaster recovery plans in place

Technical Resources:
□ IT staff capabilities assessed
□ External vendor relationships established
□ Cloud infrastructure considered
□ Network bandwidth adequate
□ Hardware requirements identified

SECTION 4: HUMAN RESOURCES
==========================

Team Capabilities:
□ AI project team assembled
□ Roles and responsibilities defined
□ Skills gap analysis completed
□ Training plan developed
□ Change champions identified

User Adoption:
□ End user needs assessed
□ User experience design considered
□ Training materials prepared
□ Support processes established
□ Feedback mechanisms in place

SECTION 5: FINANCIAL READINESS
==============================

Budget Planning:
□ Total cost of ownership calculated
□ ROI projections completed
□ Funding sources identified
□ Financial approval process defined
□ Ongoing cost commitments understood

Cost Management:
□ Budget tracking processes in place
□ Cost control measures established
□ Vendor payment terms negotiated
□ Hidden costs identified and planned for
□ Financial reporting requirements defined

SECTION 6: LEGAL & COMPLIANCE
=============================

Regulatory Compliance:
□ Industry regulations identified
□ Compliance requirements understood
□ Legal review process established
□ Data privacy laws considered
□ Audit trail requirements defined

Risk Management:
□ AI ethics policy developed
□ Bias detection measures planned
□ Transparency requirements addressed
□ Liability and insurance considered
□ Vendor compliance verified

SECTION 7: VENDOR SELECTION
===========================

Vendor Evaluation:
□ Vendor selection criteria defined
□ RFP process established
□ Reference checks completed
□ Technical evaluations conducted
□ Contract terms negotiated

Implementation Support:
□ Implementation methodology reviewed
□ Support and maintenance terms defined
□ Training and documentation requirements
□ Change management support available
□ Success measurement approach agreed

SCORING GUIDE
=============

Count the number of checked items in each section:

Section 1 (Business Strategy): ___/10
Section 2 (Data Infrastructure): ___/10
Section 3 (Technical Infrastructure): ___/10
Section 4 (Human Resources): ___/10
Section 5 (Financial Readiness): ___/10
Section 6 (Legal & Compliance): ___/10
Section 7 (Vendor Selection): ___/10

TOTAL SCORE: ___/70

READINESS ASSESSMENT
===================

60-70 points: READY TO PROCEED
Your organization shows strong readiness for AI implementation. You can proceed with confidence to the vendor selection and implementation phases.

45-59 points: MOSTLY READY
Your organization is largely prepared but has some gaps to address. Focus on completing the unchecked items before proceeding.

30-44 points: PREPARATION NEEDED
Significant preparation is required before AI implementation. Develop a plan to address the gaps identified in this assessment.

Below 30 points: NOT READY
Substantial foundational work is needed. Consider engaging consultants to help prepare your organization for AI implementation.

PRIORITY ACTIONS
================

Based on your assessment, focus on these priority areas:

High Priority (Score < 7):
□ Section ___: _________________________
□ Section ___: _________________________
□ Section ___: _________________________

Medium Priority (Score 7-8):
□ Section ___: _________________________
□ Section ___: _________________________

Low Priority (Score 9-10):
□ Section ___: _________________________

NEXT STEPS
==========

1. Address high-priority gaps first
2. Develop detailed action plans for each area
3. Set target dates for completion
4. Reassess readiness quarterly
5. Proceed with AI implementation when ready

RESOURCES FOR IMPROVEMENT
=========================

Business Strategy:
• Strategic planning workshops
• AI strategy consulting
• Executive training programs

Data Infrastructure:
• Data quality assessment tools
• Data governance consulting
• Data integration platforms

Technical Infrastructure:
• IT assessment services
• Cloud migration planning
• Security audits

Human Resources:
• AI training programs
• Change management consulting
• Skills development workshops

---
Assessment completed by: ________________
Date: ________________
Review date: ________________
Overall readiness score: ___/70`;
  };

  const generateIndustryUseCases = () => {
    return `INDUSTRY-SPECIFIC AI USE CASES
=============================

This comprehensive guide provides real-world examples of AI applications across various industries, helping you identify opportunities for your specific business sector.

RETAIL & E-COMMERCE
===================

Customer Experience:
• Personalized product recommendations
• Dynamic pricing optimization
• Virtual shopping assistants
• Voice commerce integration
• Augmented reality try-on experiences

Operations:
• Inventory demand forecasting
• Supply chain optimization
• Automated reordering systems
• Fraud detection and prevention
• Customer sentiment analysis

Case Study - Fashion Retailer:
Company: Mid-size fashion retailer (500 employees)
Implementation: AI-powered inventory management
Results: 30% reduction in overstock, 25% improvement in sales
Timeline: 6 months
Investment: $75,000
Annual Savings: $180,000

RESTAURANTS & FOOD SERVICE
===========================

Customer Service:
• Automated order taking and processing
• Menu optimization based on preferences
• Delivery route optimization
• Customer feedback analysis
• Loyalty program personalization

Operations:
• Food waste reduction through demand forecasting
• Kitchen workflow optimization
• Staff scheduling optimization
• Supplier cost analysis
• Health and safety compliance monitoring

Case Study - Restaurant Chain:
Company: Regional pizza chain (25 locations)
Implementation: AI demand forecasting and inventory
Results: 35% reduction in food waste, 20% cost savings
Timeline: 4 months
Investment: $45,000
Annual Savings: $120,000

HEALTHCARE & WELLNESS
======================

Patient Care:
• Appointment scheduling optimization
• Symptom checking and triage
• Treatment recommendation systems
• Patient monitoring and alerts
• Medical image analysis

Administration:
• Insurance claim processing
• Medical record management
• Billing and coding automation
• Staff scheduling optimization
• Compliance monitoring

Case Study - Medical Practice:
Company: Multi-specialty clinic (50 providers)
Implementation: AI-powered scheduling and patient triage
Results: 40% reduction in wait times, 30% increase in patient satisfaction
Timeline: 3 months
Investment: $35,000
Annual Savings: $95,000

REAL ESTATE
===========

Sales & Marketing:
• Property valuation and pricing
• Lead qualification and scoring
• Market trend analysis
• Virtual property tours
• Automated marketing campaigns

Operations:
• Property management automation
• Maintenance request routing
• Tenant screening and evaluation
• Lease agreement processing
• Investment analysis and recommendations

Case Study - Real Estate Agency:
Company: Residential real estate firm (20 agents)
Implementation: AI lead scoring and automated follow-up
Results: 45% increase in conversion rates, 25% time savings
Timeline: 2 months
Investment: $25,000
Annual Revenue Increase: $150,000

PROFESSIONAL SERVICES
======================

Client Services:
• Document analysis and review
• Contract management and analysis
• Client communication automation
• Meeting scheduling and coordination
• Proposal generation and customization

Operations:
• Project management and resource allocation
• Time tracking and billing optimization
• Knowledge management systems
• Quality assurance and compliance
• Performance analytics and reporting

Case Study - Accounting Firm:
Company: CPA firm (30 professionals)
Implementation: AI document processing and analysis
Results: 50% faster document review, 35% cost reduction
Timeline: 5 months
Investment: $55,000
Annual Savings: $140,000

MANUFACTURING
=============

Production:
• Predictive maintenance scheduling
• Quality control and defect detection
• Production planning and scheduling
• Supply chain optimization
• Equipment performance monitoring

Operations:
• Inventory management and optimization
• Energy consumption optimization
• Safety monitoring and compliance
• Demand forecasting and planning
• Cost analysis and reduction

Case Study - Manufacturing Company:
Company: Auto parts manufacturer (200 employees)
Implementation: Predictive maintenance and quality control
Results: 25% reduction in downtime, 40% fewer defects
Timeline: 8 months
Investment: $125,000
Annual Savings: $280,000

CONSTRUCTION
============

Project Management:
• Project scheduling and resource allocation
• Cost estimation and budget tracking
• Risk assessment and mitigation
• Progress monitoring and reporting
• Subcontractor management

Operations:
• Equipment maintenance and scheduling
• Material procurement optimization
• Safety compliance monitoring
• Quality assurance and inspection
• Document management and control

Case Study - Construction Firm:
Company: Commercial construction (100 employees)
Implementation: AI project scheduling and resource optimization
Results: 20% faster project completion, 15% cost savings
Timeline: 6 months
Investment: $85,000
Annual Savings: $195,000

IMPLEMENTATION ROADMAP BY INDUSTRY
==================================

Phase 1: Quick Wins (1-3 months)
• Customer service chatbots
• Automated scheduling systems
• Basic data analytics and reporting
• Email automation and follow-up
• Simple process automation

Phase 2: Operational Efficiency (3-6 months)
• Inventory management optimization
• Predictive analytics for demand
• Advanced customer segmentation
• Workflow automation
• Performance monitoring systems

Phase 3: Strategic Advantages (6-12 months)
• Predictive maintenance systems
• Advanced pricing optimization
• Personalization engines
• Integrated business intelligence
• Custom AI applications

COST-BENEFIT ANALYSIS BY INDUSTRY
=================================

Small Business (10-50 employees):
• Initial Investment: $25,000 - $75,000
• Implementation Time: 2-6 months
• Expected ROI: 200-400% within 18 months
• Break-even Point: 6-12 months

Medium Business (50-200 employees):
• Initial Investment: $75,000 - $200,000
• Implementation Time: 4-8 months
• Expected ROI: 250-500% within 24 months
• Break-even Point: 8-15 months

Large Business (200+ employees):
• Initial Investment: $200,000 - $500,000
• Implementation Time: 6-12 months
• Expected ROI: 300-600% within 36 months
• Break-even Point: 12-18 months

SUCCESS FACTORS BY INDUSTRY
===========================

Common Success Factors:
1. Strong leadership commitment
2. Clear implementation strategy
3. Adequate data quality and quantity
4. Proper training and change management
5. Realistic timeline and expectations

Industry-Specific Factors:

Retail: Focus on customer experience and inventory optimization
Healthcare: Prioritize compliance and patient safety
Manufacturing: Emphasize predictive maintenance and quality control
Professional Services: Leverage document automation and analytics
Construction: Optimize project management and resource allocation

GETTING STARTED
===============

1. Identify your industry-specific pain points
2. Review relevant case studies and use cases
3. Assess your organization's readiness
4. Develop a phased implementation plan
5. Select appropriate vendors and partners
6. Start with pilot projects and scale gradually

---
This guide was compiled by DeployP2V based on real client implementations and industry research.
For industry-specific consultation, contact us at contact@deployp2v.com or call 214-604-5735.

© 2024 DeployP2V. All rights reserved.`;
  };

  const generateVendorTemplate = () => {
    return `AI VENDOR EVALUATION TEMPLATE
============================

Use this comprehensive template to evaluate and compare AI vendors for your business needs.

VENDOR INFORMATION
==================

Vendor Name: _______________________
Contact Person: ____________________
Phone: ____________________________
Email: ____________________________
Website: __________________________
Company Size: ______________________
Years in Business: __________________
Headquarters Location: ______________

SOLUTION OVERVIEW
=================

Product/Service Name: ________________
Technology Type: ____________________
Target Industries: __________________
Deployment Model: ___________________
Integration Capabilities: ____________
Customization Options: ______________

TECHNICAL EVALUATION
====================

Functionality (Score 1-10):
□ Meets core requirements: ____
□ Advanced features available: ____
□ User interface quality: ____
□ Mobile accessibility: ____
□ API availability: ____
□ Integration ease: ____
□ Customization flexibility: ____
□ Performance and speed: ____
□ Reliability and uptime: ____
□ Security features: ____

Technical Score: ____/100

BUSINESS EVALUATION
===================

Business Fit (Score 1-10):
□ Industry experience: ____
□ Company size alignment: ____
□ Use case relevance: ____
□ Scalability potential: ____
□ Strategic alignment: ____
□ Growth support: ____
□ Geographic coverage: ____
□ Language support: ____
□ Regulatory compliance: ____
□ Business model fit: ____

Business Score: ____/100

VENDOR CAPABILITY
=================

Company Strength (Score 1-10):
□ Financial stability: ____
□ Market reputation: ____
□ Customer base size: ____
□ Technology innovation: ____
□ Partnership ecosystem: ____
□ Research & development: ____
□ Industry recognition: ____
□ Leadership team: ____
□ Company culture: ____
□ Long-term viability: ____

Vendor Score: ____/100

SUPPORT & SERVICES
==================

Implementation Support (Score 1-10):
□ Implementation methodology: ____
□ Project management: ____
□ Training programs: ____
□ Documentation quality: ____
□ Go-live support: ____
□ Data migration assistance: ____
□ Change management help: ____
□ Timeline reliability: ____
□ Resource availability: ____
□ Success tracking: ____

Support Score: ____/100

COST ANALYSIS
=============

Pricing Structure:
□ One-time license fee: $________
□ Monthly subscription: $________
□ Annual subscription: $________
□ Implementation costs: $________
□ Training costs: $________
□ Customization costs: $________
□ Integration costs: $________
□ Ongoing support costs: $________
□ Additional user costs: $________
□ Hidden fees: $________

Total Year 1 Cost: $________
Total Year 2 Cost: $________
Total Year 3 Cost: $________

Cost Competitiveness (Score 1-10):
□ Initial cost reasonableness: ____
□ Ongoing cost predictability: ____
□ Value for money: ____
□ Cost transparency: ____
□ Flexible pricing options: ____

Cost Score: ____/50

RISK ASSESSMENT
===============

Risk Factors (Score 1-10, lower is better):
□ Technology complexity: ____
□ Implementation difficulty: ____
□ Data security concerns: ____
□ Vendor dependency: ____
□ Integration challenges: ____
□ User adoption barriers: ____
□ Compliance risks: ____
□ Performance risks: ____
□ Support quality risks: ____
□ Exit strategy difficulty: ____

Risk Score: ____/100 (lower is better)

REFERENCE CHECKS
================

Reference Company 1:
Company Name: ______________________
Industry: __________________________
Implementation Date: ________________
Contact Person: ____________________
Phone/Email: _______________________

Key Questions and Responses:
1. Overall satisfaction (1-10): ____
2. Implementation experience: _______
3. Ongoing support quality: _________
4. Would you choose again? __________
5. Biggest benefits realized: _______
6. Biggest challenges faced: ________
7. Recommendations for success: _____

Reference Company 2:
[Repeat same format]

Reference Company 3:
[Repeat same format]

TRIAL/PILOT EVALUATION
======================

Trial Period: From _______ To _______
Trial Scope: ______________________
Trial Objectives: __________________

Trial Results:
□ Functionality validation: ____/10
□ Performance evaluation: ____/10
□ User experience: ____/10
□ Integration testing: ____/10
□ Support responsiveness: ____/10

Trial Score: ____/50

CONTRACT TERMS
==============

Contract Terms (Score 1-10):
□ Contract length flexibility: ____
□ Termination clauses: ____
□ Service level agreements: ____
□ Data ownership rights: ____
□ Liability limitations: ____
□ Intellectual property terms: ____
□ Renewal conditions: ____
□ Price escalation clauses: ____
□ Change management process: ____
□ Dispute resolution: ____

Contract Score: ____/100

FINAL SCORING
=============

Technical Evaluation: ____/100 x 0.25 = ____
Business Evaluation: ____/100 x 0.20 = ____
Vendor Capability: ____/100 x 0.15 = ____
Support & Services: ____/100 x 0.15 = ____
Cost Analysis: ____/50 x 0.10 = ____
Risk Assessment: ____/100 x -0.10 = ____
Trial Evaluation: ____/50 x 0.15 = ____
Contract Terms: ____/100 x 0.10 = ____

TOTAL WEIGHTED SCORE: ____/100

DECISION MATRIX
===============

Proceed Recommendations:
□ Score > 80: Strong recommendation
□ Score 70-80: Recommended with conditions
□ Score 60-70: Consider with risk mitigation
□ Score < 60: Not recommended

Additional Considerations:
□ Strategic importance: _______________
□ Unique differentiators: _____________
□ Partnership potential: ______________
□ Innovation roadmap: ________________

FINAL RECOMMENDATION
====================

Recommendation: ____________________
Key Strengths: _____________________
Areas of Concern: __________________
Conditions for Selection: ___________
Next Steps: _______________________

Evaluation Completed By: ____________
Date: _____________________________
Review Date: ______________________

---
This evaluation template was created by DeployP2V to help businesses make informed vendor selection decisions.
For assistance with vendor evaluation, contact us at contact@deployp2v.com or call 214-604-5735.

© 2024 DeployP2V. All rights reserved.`;
  };

  const generateChangeManagementGuide = () => {
    return `CHANGE MANAGEMENT FOR AI IMPLEMENTATION
=====================================

A comprehensive guide to successfully managing organizational change during AI implementation.

TABLE OF CONTENTS
1. Understanding Change Management in AI Context
2. Stakeholder Analysis and Engagement
3. Communication Strategy and Planning
4. Training and Development Programs
5. Resistance Management
6. Implementation Timeline and Milestones
7. Success Measurement and Evaluation
8. Sustaining Change Long-term

CHAPTER 1: UNDERSTANDING CHANGE MANAGEMENT
=========================================

What is Change Management?
Change management is the structured approach to transitioning individuals, teams, and organizations from a current state to a desired future state with AI-enhanced processes.

Why Change Management Matters for AI:
• AI implementations often require significant process changes
• Employee resistance can derail even the best technical solutions
• Successful adoption depends on user acceptance and engagement
• ROI is directly tied to effective change management

The Change Curve:
1. Initial Resistance - Natural reaction to new technology
2. Exploration - Learning about AI capabilities and benefits
3. Commitment - Decision to embrace the change
4. Integration - AI becomes part of daily workflow
5. Optimization - Continuous improvement and innovation

Key Success Factors:
• Strong leadership commitment and visibility
• Clear communication about benefits and impacts
• Comprehensive training and support programs
• Early wins and quick successes
• Ongoing monitoring and adjustment

CHAPTER 2: STAKEHOLDER ANALYSIS
==============================

Stakeholder Identification:

Primary Stakeholders:
• Executive leadership team
• IT department and administrators
• End users and operators
• Customers and clients
• Key suppliers and partners

Secondary Stakeholders:
• Human resources department
• Finance and accounting team
• Legal and compliance team
• Operations managers
• External consultants and vendors

Stakeholder Analysis Matrix:

High Influence, High Interest (Manage Closely):
• CEO and senior executives
• Department heads
• Key system users
• IT leadership

High Influence, Low Interest (Keep Satisfied):
• Board members
• Financial stakeholders
• Regulatory bodies
• Major customers

Low Influence, High Interest (Keep Informed):
• End users
• Support staff
• Administrative personnel
• Internal champions

Low Influence, Low Interest (Monitor):
• Temporary staff
• Contractors
• Remote workers
• External advisors

CHAPTER 3: COMMUNICATION STRATEGY
=================================

Communication Principles:
• Transparency and honesty about changes
• Regular and consistent messaging
• Multiple communication channels
• Two-way communication and feedback
• Tailored messages for different audiences

Communication Timeline:

Phase 1: Awareness (Months 1-2)
• Announce AI initiative and vision
• Explain business case and benefits
• Address initial concerns and questions
• Establish communication channels

Phase 2: Understanding (Months 2-4)
• Provide detailed implementation plans
• Share training schedules and resources
• Communicate roles and responsibilities
• Gather feedback and concerns

Phase 3: Participation (Months 4-6)
• Involve stakeholders in design decisions
• Share pilot results and learnings
• Provide regular progress updates
• Celebrate early wins and successes

Phase 4: Commitment (Months 6-8)
• Reinforce benefits and value
• Address remaining resistance
• Share success stories and testimonials
• Prepare for full rollout

Communication Channels:
• Town hall meetings and presentations
• Email updates and newsletters
• Intranet portals and dashboards
• Team meetings and workshops
• One-on-one conversations
• Training sessions and webinars

CHAPTER 4: TRAINING AND DEVELOPMENT
===================================

Training Strategy:
• Assess current skills and capabilities
• Identify training needs and gaps
• Develop comprehensive training programs
• Provide multiple learning modalities
• Offer ongoing support and resources

Training Program Components:

1. Executive Briefings (2-4 hours)
• AI strategy and business case
• Leadership roles and responsibilities
• Change management principles
• Success measurement and reporting

2. Manager Training (1-2 days)
• AI technology overview
• Change leadership skills
• Team communication strategies
• Performance management considerations

3. End User Training (3-5 days)
• System functionality and features
• New process workflows
• Hands-on practice and simulation
• Troubleshooting and support resources

4. Technical Training (1-2 weeks)
• System administration and maintenance
• Integration and customization
• Security and compliance requirements
• Advanced features and capabilities

Training Delivery Methods:
• Instructor-led classroom sessions
• Virtual webinars and online courses
• Self-paced e-learning modules
• Hands-on workshops and labs
• Mentoring and coaching programs
• Job aids and reference materials

CHAPTER 5: RESISTANCE MANAGEMENT
===============================

Common Sources of Resistance:
• Fear of job displacement or change
• Lack of understanding about AI benefits
• Concerns about technology complexity
• Previous negative change experiences
• Insufficient training and support
• Poor communication and leadership

Resistance Identification:
• Monitor engagement and participation levels
• Conduct regular surveys and feedback sessions
• Observe behavioral changes and patterns
• Track system usage and adoption metrics
• Listen for concerns and complaints
• Identify influential resisters and champions

Resistance Management Strategies:

Education and Communication:
• Provide clear, factual information
• Address misconceptions and fears
• Share success stories and benefits
• Offer multiple information sources
• Encourage questions and dialogue

Participation and Involvement:
• Include resisters in planning and design
• Seek input and feedback regularly
• Create opportunities for influence
• Assign meaningful roles and responsibilities
• Recognize contributions and ideas

Facilitation and Support:
• Provide comprehensive training programs
• Offer ongoing coaching and mentoring
• Create peer support networks
• Establish help desk and support systems
• Remove barriers and obstacles

Negotiation and Agreement:
• Discuss concerns and issues openly
• Find mutually acceptable solutions
• Offer incentives and rewards
• Create win-win scenarios
• Document agreements and commitments

CHAPTER 6: IMPLEMENTATION TIMELINE
=================================

Change Management Milestones:

Months 1-2: Foundation Setting
• Stakeholder analysis completed
• Communication strategy developed
• Change management team established
• Initial awareness campaign launched
• Baseline metrics established

Months 2-4: Preparation Phase
• Training programs developed and tested
• Communication plan fully executed
• Pilot group selected and prepared
• Support systems established
• Risk mitigation strategies implemented

Months 4-6: Pilot Implementation
• Pilot rollout with selected users
• Intensive support and monitoring
• Feedback collection and analysis
• Process refinements and adjustments
• Success stories documented

Months 6-8: Full Rollout
• Organization-wide implementation
• Comprehensive training delivery
• Ongoing support and communication
• Performance monitoring and measurement
• Continuous improvement initiatives

Months 8-12: Optimization
• Usage and adoption analysis
• Advanced training and development
• Process optimization and enhancement
• Culture integration and reinforcement
• Long-term sustainability planning

CHAPTER 7: SUCCESS MEASUREMENT
=============================

Key Performance Indicators:

Adoption Metrics:
• System login frequency and duration
• Feature utilization rates
• Process completion rates
• Error rates and accuracy improvements
• Productivity measurements

Engagement Metrics:
• Training completion rates
• Feedback survey responses
• Support ticket volumes
• User satisfaction scores
• Change readiness assessments

Business Impact Metrics:
• Cost savings and efficiency gains
• Revenue improvements
• Customer satisfaction scores
• Quality improvements
• Time savings measurements

Measurement Framework:
1. Establish baseline measurements
2. Set specific, measurable targets
3. Implement regular monitoring
4. Analyze trends and patterns
5. Report progress and results
6. Adjust strategies as needed

CHAPTER 8: SUSTAINING CHANGE
============================

Sustainability Strategies:
• Embed AI into organizational culture
• Align performance management systems
• Continue training and development
• Maintain communication and engagement
• Monitor and reinforce behaviors
• Plan for continuous improvement

Cultural Integration:
• Update job descriptions and roles
• Revise performance evaluation criteria
• Incorporate AI into strategic planning
• Celebrate successes and achievements
• Share best practices and learnings
• Foster innovation and experimentation

Continuous Improvement:
• Regular process reviews and assessments
• User feedback collection and analysis
• Technology updates and enhancements
• Advanced training and skill development
• New use case identification and implementation
• Knowledge sharing and collaboration

Long-term Success Factors:
• Leadership commitment and support
• Organizational learning and adaptation
• Employee engagement and satisfaction
• Customer value and satisfaction
• Financial performance and ROI
• Innovation and competitive advantage

---
This change management guide was developed by DeployP2V based on successful AI implementations across various industries.
For change management consulting and support, contact us at contact@deployp2v.com or call 214-604-5735.

© 2024 DeployP2V. All rights reserved.`;
  };

  const generateGenericGuide = (resource: typeof resources[0]) => {
    return `${resource.title.toUpperCase()}
${'='.repeat(resource.title.length)}

OVERVIEW
========

${resource.description}

This ${resource.type.toLowerCase()} provides comprehensive guidance for small businesses looking to leverage AI technologies effectively.

KEY BENEFITS
============

• Practical, actionable insights
• Industry-specific recommendations
• Step-by-step implementation guidance
• Real-world examples and case studies
• Cost-benefit analysis frameworks

GETTING STARTED
===============

1. Review your current business processes
2. Identify automation opportunities
3. Assess your technical readiness
4. Develop an implementation plan
5. Choose the right technology partners

For personalized guidance and support, contact DeployP2V:
Email: contact@deployp2v.com
Phone: 214-604-5735
Location: Wylie, TX

© 2024 DeployP2V. All rights reserved.`;
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
              <ResourceCard key={resource.id} resource={resource} onDownload={handleDownload} />
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
          
          {selectedTool && selectedTool.id === 2 && selectedTool.content && 'sections' in selectedTool.content && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <p className="text-gray-300 text-lg">
                  Complete this audit to identify AI automation opportunities in your business
                </p>
              </div>
              
              {(selectedTool.content as any).sections.map((section: any, sectionIndex: number) => (
                <div key={sectionIndex} className="bg-gray-700 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-white mb-4">{section.title}</h3>
                  <div className="space-y-4">
                    {section.questions.map((question: string, questionIndex: number) => (
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

          {selectedTool && selectedTool.id === 3 && selectedTool.content && 'technologies' in selectedTool.content && (
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
                    {(selectedTool.content as any).technologies.map((tech: any, index: number) => (
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
                {(selectedTool.content as any).technologies.map((tech: any, index: number) => (
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

      {/* Resource Download Modal */}
      <Dialog open={isResourceModalOpen} onOpenChange={setIsResourceModalOpen}>
        <DialogContent className="max-w-2xl w-full bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white text-xl mb-4">
              {selectedResource?.title}
            </DialogTitle>
          </DialogHeader>
          
          {selectedResource && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-indigo-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <p className="text-gray-300 mb-4">{selectedResource.description}</p>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-700 p-3 rounded">
                    <div className="text-gray-400 text-sm">Type</div>
                    <div className="text-white font-medium">{selectedResource.type}</div>
                  </div>
                  <div className="bg-gray-700 p-3 rounded">
                    <div className="text-gray-400 text-sm">Length</div>
                    <div className="text-white font-medium">{selectedResource.pages}</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="text-white font-semibold mb-3">What's Included:</h3>
                <ul className="space-y-2">
                  {selectedResource.id === 1 && (
                    <>
                      <li className="flex items-start text-gray-300 text-sm">
                        <span className="w-2 h-2 bg-indigo-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Step-by-step AI implementation roadmap
                      </li>
                      <li className="flex items-start text-gray-300 text-sm">
                        <span className="w-2 h-2 bg-indigo-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Technology selection framework
                      </li>
                      <li className="flex items-start text-gray-300 text-sm">
                        <span className="w-2 h-2 bg-indigo-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Budget planning templates
                      </li>
                      <li className="flex items-start text-gray-300 text-sm">
                        <span className="w-2 h-2 bg-indigo-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Success metrics and KPIs
                      </li>
                    </>
                  )}
                  {selectedResource.id === 2 && (
                    <>
                      <li className="flex items-start text-gray-300 text-sm">
                        <span className="w-2 h-2 bg-indigo-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Cost-benefit analysis worksheet
                      </li>
                      <li className="flex items-start text-gray-300 text-sm">
                        <span className="w-2 h-2 bg-indigo-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        ROI projection formulas
                      </li>
                      <li className="flex items-start text-gray-300 text-sm">
                        <span className="w-2 h-2 bg-indigo-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Risk assessment matrix
                      </li>
                    </>
                  )}
                  {selectedResource.id === 3 && (
                    <>
                      <li className="flex items-start text-gray-300 text-sm">
                        <span className="w-2 h-2 bg-indigo-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Comprehensive readiness checklist
                      </li>
                      <li className="flex items-start text-gray-300 text-sm">
                        <span className="w-2 h-2 bg-indigo-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Infrastructure requirements
                      </li>
                      <li className="flex items-start text-gray-300 text-sm">
                        <span className="w-2 h-2 bg-indigo-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Team capability assessment
                      </li>
                    </>
                  )}
                  {selectedResource.id === 4 && (
                    <>
                      <li className="flex items-start text-gray-300 text-sm">
                        <span className="w-2 h-2 bg-indigo-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        15+ industry-specific examples
                      </li>
                      <li className="flex items-start text-gray-300 text-sm">
                        <span className="w-2 h-2 bg-indigo-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Implementation timelines
                      </li>
                      <li className="flex items-start text-gray-300 text-sm">
                        <span className="w-2 h-2 bg-indigo-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Cost estimates by use case
                      </li>
                    </>
                  )}
                  {selectedResource.id === 5 && (
                    <>
                      <li className="flex items-start text-gray-300 text-sm">
                        <span className="w-2 h-2 bg-indigo-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Vendor comparison matrix
                      </li>
                      <li className="flex items-start text-gray-300 text-sm">
                        <span className="w-2 h-2 bg-indigo-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Key questions to ask vendors
                      </li>
                      <li className="flex items-start text-gray-300 text-sm">
                        <span className="w-2 h-2 bg-indigo-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Contract negotiation tips
                      </li>
                    </>
                  )}
                  {selectedResource.id === 6 && (
                    <>
                      <li className="flex items-start text-gray-300 text-sm">
                        <span className="w-2 h-2 bg-indigo-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Change management strategies
                      </li>
                      <li className="flex items-start text-gray-300 text-sm">
                        <span className="w-2 h-2 bg-indigo-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Training program templates
                      </li>
                      <li className="flex items-start text-gray-300 text-sm">
                        <span className="w-2 h-2 bg-indigo-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Communication guidelines
                      </li>
                    </>
                  )}
                </ul>
              </div>
              
              <div className="bg-yellow-900/20 border border-yellow-600 p-4 rounded-lg">
                <div className="flex items-start">
                  <div className="w-5 h-5 bg-yellow-600 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-white text-xs font-bold">!</span>
                  </div>
                  <div>
                    <h4 className="text-yellow-400 font-semibold mb-1">Free Resource Download</h4>
                    <p className="text-gray-300 text-sm">
                      Provide your email to receive this free resource and join our newsletter for more AI insights.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
                <div className="flex gap-3">
                  <Button 
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                    onClick={() => {
                      if (selectedResource) {
                        downloadResource(selectedResource, emailInput);
                        setEmailInput('');
                      }
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Now
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setIsResourceModalOpen(false)}
                    className="text-gray-300 border-gray-600 hover:bg-gray-700"
                  >
                    Cancel
                  </Button>
                </div>
                <p className="text-xs text-gray-400 text-center">
                  We respect your privacy. Unsubscribe at any time.
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}