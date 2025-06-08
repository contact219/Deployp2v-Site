import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLocation } from 'wouter';
import { ArrowLeft, Calendar, Clock, ArrowRight, TrendingUp, Lightbulb, Users, Zap } from 'lucide-react';

const blogPosts = [
  {
    id: 1,
    title: "5 AI Tools Every Small Business Should Consider in 2024",
    excerpt: "Discover the most practical AI solutions that can transform your small business operations without breaking the bank.",
    category: "AI Tools",
    readTime: "8 min read",
    publishDate: "2024-01-15",
    featured: true,
    content: `Small businesses are increasingly turning to AI to stay competitive, but knowing where to start can be overwhelming. Here are five AI tools that offer the biggest impact for small businesses:

1. **AI-Powered Customer Support Chatbots**
Customer service chatbots can handle 80% of routine inquiries, providing instant responses 24/7. This frees up your team to focus on complex issues while improving customer satisfaction.

2. **Automated Data Entry and Invoice Processing**
AI can extract information from invoices, receipts, and forms automatically, reducing manual data entry by up to 90% and eliminating human errors.

3. **Predictive Analytics for Inventory Management**
AI algorithms can predict demand patterns, helping you maintain optimal inventory levels and reduce both stockouts and overstock situations.

4. **Email Marketing Automation with AI Personalization**
AI can analyze customer behavior to send personalized emails at optimal times, increasing open rates by 25-30% and conversion rates by 15-20%.

5. **Social Media Content Generation**
AI tools can help create engaging social media posts, suggest optimal posting times, and even generate images, saving hours of content creation time.

**Getting Started**
The key is to start small with one solution that addresses your biggest pain point. Focus on areas where you spend the most manual time or experience frequent errors.`
  },
  {
    id: 2,
    title: "How AI Can Reduce Operating Costs by 30% for Texas Small Businesses",
    excerpt: "Real examples of cost savings achieved by local businesses through strategic AI implementation.",
    category: "Cost Savings",
    readTime: "6 min read",
    publishDate: "2024-01-10",
    featured: false,
    content: `Texas small businesses are seeing significant cost reductions through AI implementation. Here's how they're achieving 20-30% operational cost savings:

**Labor Cost Reduction**
- Automated scheduling saves 10-15 hours weekly
- AI customer service reduces support staff needs by 40%
- Automated reporting eliminates manual data compilation

**Error Reduction Savings**
- Automated invoice processing reduces errors by 95%
- AI inventory management prevents costly stockouts
- Predictive maintenance prevents equipment failures

**Efficiency Improvements**
- AI-powered lead qualification increases conversion rates
- Automated follow-ups ensure no opportunities are missed
- Smart scheduling optimizes resource utilization

**Real Example: Dallas Restaurant Chain**
A local restaurant group reduced food waste by 35% using AI demand forecasting, saving $3,000 monthly. They also automated scheduling, reducing management time by 12 hours weekly.

**ROI Timeline**
Most businesses see positive ROI within 3-6 months, with full implementation costs recovered within the first year.`
  },
  {
    id: 3,
    title: "Common AI Implementation Mistakes and How to Avoid Them",
    excerpt: "Learn from others' mistakes to ensure your AI project succeeds from day one.",
    category: "Best Practices",
    readTime: "7 min read",
    publishDate: "2024-01-05",
    featured: false,
    content: `Avoiding these common pitfalls can save your business time, money, and frustration:

**Mistake #1: Starting Too Big**
Many businesses try to implement multiple AI solutions simultaneously. Start with one specific problem and expand gradually.

**Mistake #2: Insufficient Data Preparation**
AI needs clean, organized data to work effectively. Invest time in data cleaning before implementation.

**Mistake #3: Neglecting Employee Training**
Even the best AI solution fails without proper user adoption. Ensure comprehensive training for all users.

**Mistake #4: Choosing Complex Solutions First**
Begin with simple, proven solutions before moving to complex custom implementations.

**Mistake #5: Ignoring Integration Requirements**
Ensure AI solutions integrate seamlessly with existing systems to avoid workflow disruptions.

**Success Framework**
1. Identify specific problems to solve
2. Start with simple, proven solutions
3. Prepare data properly
4. Train users thoroughly
5. Measure results and optimize

**Getting Help**
Working with experienced AI consultants can help you avoid these mistakes and ensure successful implementation from the start.`
  },
  {
    id: 4,
    title: "The Future of AI in Small Business: Trends to Watch",
    excerpt: "Stay ahead of the curve with insights into emerging AI technologies for small businesses.",
    category: "Trends",
    readTime: "9 min read",
    publishDate: "2023-12-28",
    featured: false,
    content: `The AI landscape for small businesses is evolving rapidly. Here are key trends to watch:

**1. No-Code AI Solutions**
User-friendly platforms are making AI accessible to businesses without technical expertise. Drag-and-drop interfaces allow business owners to create custom AI solutions.

**2. Industry-Specific AI**
Specialized AI solutions for specific industries (restaurants, retail, healthcare) are becoming more sophisticated and affordable.

**3. Edge AI Computing**
Processing AI locally rather than in the cloud improves speed and reduces costs, especially for real-time applications.

**4. AI-Powered Business Intelligence**
Advanced analytics that provide actionable insights from business data, helping with strategic decision-making.

**5. Conversational AI Evolution**
Chatbots are becoming more sophisticated, handling complex conversations and integrating with business systems.

**Preparing Your Business**
- Start building clean data practices now
- Invest in employee digital literacy
- Stay informed about industry-specific solutions
- Consider AI readiness assessments

The businesses that start preparing now will have significant advantages as these technologies mature.`
  }
];

interface BlogPostCardProps {
  post: typeof blogPosts[0];
  onReadMore: (postId: number) => void;
}

const BlogPostCard: React.FC<BlogPostCardProps> = ({ post, onReadMore }) => (
  <Card className={`bg-gray-800 border-gray-700 h-full ${post.featured ? 'border-indigo-500' : ''}`}>
    {post.featured && (
      <div className="bg-indigo-600 text-white text-center py-2 text-sm font-semibold rounded-t-lg">
        Featured Article
      </div>
    )}
    <CardHeader>
      <div className="flex justify-between items-start mb-2">
        <Badge variant="outline" className="text-indigo-400 border-indigo-400">
          {post.category}
        </Badge>
        <div className="flex items-center text-gray-400 text-sm">
          <Clock className="w-4 h-4 mr-1" />
          {post.readTime}
        </div>
      </div>
      <CardTitle className="text-white text-xl mb-2">{post.title}</CardTitle>
      <div className="flex items-center text-gray-400 text-sm">
        <Calendar className="w-4 h-4 mr-2" />
        {new Date(post.publishDate).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}
      </div>
    </CardHeader>
    <CardContent>
      <p className="text-gray-300 mb-4">{post.excerpt}</p>
      <Button 
        onClick={() => onReadMore(post.id)}
        variant="outline"
        className="text-indigo-400 border-indigo-400 hover:bg-indigo-400 hover:text-white"
      >
        Read More <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </CardContent>
  </Card>
);

export default function Blog() {
  const [, setLocation] = useLocation();

  const handleReadMore = (postId: number) => {
    setLocation(`/blog/${postId}`);
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

      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-r from-indigo-900 to-purple-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">AI Insights for Small Business</h1>
          <p className="text-xl text-gray-200 max-w-3xl mx-auto">
            Stay informed with the latest trends, tips, and strategies for implementing AI in your small business
          </p>
          
          {/* Category Icons */}
          <div className="flex justify-center space-x-8 mt-12">
            <div className="text-center">
              <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <div className="text-sm text-gray-200">Growth</div>
            </div>
            <div className="text-center">
              <Lightbulb className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <div className="text-sm text-gray-200">Innovation</div>
            </div>
            <div className="text-center">
              <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <div className="text-sm text-gray-200">Best Practices</div>
            </div>
            <div className="text-center">
              <Zap className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <div className="text-sm text-gray-200">Efficiency</div>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-white">Latest Articles</h2>
            <p className="text-xl text-gray-300">
              Practical insights to help you succeed with AI
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {blogPosts.map((post) => (
              <BlogPostCard 
                key={post.id} 
                post={post} 
                onReadMore={handleReadMore}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-16 bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4 text-white">Stay Updated</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Get the latest AI insights and tips delivered to your inbox monthly
          </p>
          <div className="max-w-md mx-auto">
            <div className="flex gap-4">
              <input 
                type="email" 
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <Button className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition duration-300">
                Subscribe
              </Button>
            </div>
            <p className="text-gray-400 text-sm mt-2">No spam, unsubscribe anytime</p>
          </div>
        </div>
      </section>
    </div>
  );
}