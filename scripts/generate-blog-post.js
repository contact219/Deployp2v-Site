const fs = require('fs');
const path = require('path');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const BLOG_TOPICS = [
  'How AI Chatbots Are Revolutionizing Customer Service for Small Businesses',
  'The ROI of Automation: Real Numbers for Local Business Owners',
  'AI-Powered Inventory Management: A Game Changer for Retail',
  '5 Ways AI Can Help Your Restaurant Reduce Food Waste',
  'Why Small Businesses Need AI Now More Than Ever',
  'Automating Appointment Scheduling: Save Hours Every Week',
  'AI Marketing on a Budget: Strategies That Actually Work',
  'The Future of Local Business: AI Trends for 2026',
  'How to Choose the Right AI Tools for Your Business Size',
  'Customer Data Analytics: Making Smarter Decisions with AI'
];

async function generateBlogPost() {
  // Get existing blog posts to avoid duplicates
  const blogDir = path.join(__dirname, '../client/public/content/blog');
  const existingPosts = fs.existsSync(blogDir) 
    ? fs.readdirSync(blogDir).map(f => f.replace('.md', ''))
    : [];

  // Filter out topics that might already exist (simple check)
  const availableTopics = BLOG_TOPICS.filter(topic => {
    const slug = topic.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 50);
    return !existingPosts.some(post => post.includes(slug.slice(0, 20)));
  });

  if (availableTopics.length === 0) {
    console.log('All predefined topics have been covered. Generating new topic...');
  }

  const topic = availableTopics[Math.floor(Math.random() * availableTopics.length)] 
    || 'AI Innovation Tips for Small Business Owners';

  console.log(`Generating blog post about: ${topic}`);

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a content writer for DeployP2V, an AI services company helping small and medium businesses adopt AI solutions. Write engaging, practical blog posts that provide real value to local business owners. Focus on actionable advice and real-world examples. Keep the tone professional but approachable.`
        },
        {
          role: 'user',
          content: `Write a blog post about: "${topic}"

Format the response as markdown with:
1. A compelling title (use # for h1)
2. A brief intro paragraph
3. 3-5 main sections with h2 headers (##)
4. Practical tips or examples in each section
5. A conclusion with a call-to-action mentioning DeployP2V

Keep it around 800-1000 words. Make it SEO-friendly with natural keyword usage.`
        }
      ],
      max_tokens: 2000,
      temperature: 0.7
    })
  });

  const data = await response.json();
  
  if (!data.choices || !data.choices[0]) {
    console.error('Failed to generate content:', data);
    process.exit(1);
  }

  const content = data.choices[0].message.content;
  
  // Generate slug from topic
  const date = new Date().toISOString().split('T')[0];
  const slug = topic.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50);
  
  const filename = `${slug}.md`;
  const filepath = path.join(blogDir, filename);

  // Ensure directory exists
  if (!fs.existsSync(blogDir)) {
    fs.mkdirSync(blogDir, { recursive: true });
  }

  // Add frontmatter
  const frontmatter = `---
title: "${topic}"
date: "${date}"
author: "DeployP2V Team"
description: "Learn about ${topic.toLowerCase()} and how AI can transform your small business operations."
keywords: ["AI", "small business", "automation", "DeployP2V"]
---

`;

  fs.writeFileSync(filepath, frontmatter + content);
  console.log(`Blog post created: ${filepath}`);
}

generateBlogPost().catch(console.error);
