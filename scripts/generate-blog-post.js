import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  const blogDir = path.join(__dirname, '../client/public/content/blog');
  const existingPosts = fs.existsSync(blogDir)
    ? fs.readdirSync(blogDir).map(f => f.replace('.md', ''))
    : [];

  const availableTopics = BLOG_TOPICS.filter(topic => {
    const slug = topic.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 50);
    return !existingPosts.some(post => post.includes(slug.slice(0, 20)));
  });

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
          content: `You are a content writer for DeployP2V, an AI automation company helping small businesses. Write engaging, SEO-optimized blog posts. Output ONLY valid markdown with YAML frontmatter.`
        },
        {
          role: 'user',
          content: `Write a blog post about: "${topic}"

Format:
---
title: "Title Here"
slug: slug-here
date: "${new Date().toISOString().split('T')[0]}"
author: "DeployP2V Team"
description: "Meta description here (150-160 chars)"
keywords:
  - keyword1
  - keyword2
---

# Main content here with proper markdown formatting

Include:
- Engaging introduction
- 3-5 main sections with headers
- Practical tips and examples
- Call to action mentioning DeployP2V`
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    })
  });

  const data = await response.json();
  const content = data.choices[0].message.content;

  // Extract slug from content
  const slugMatch = content.match(/slug:\s*([\w-]+)/);
  const slug = slugMatch ? slugMatch[1] : `blog-post-${Date.now()}`;

  // Ensure directory exists
  if (!fs.existsSync(blogDir)) {
    fs.mkdirSync(blogDir, { recursive: true });
  }

  // Write file
  const filePath = path.join(blogDir, `${slug}.md`);
  fs.writeFileSync(filePath, content);
  console.log(`Blog post saved to: ${filePath}`);

  // Update content.ts with new file
  updateContentLoader('blog', `${slug}.md`);
}

function updateContentLoader(type, filename) {
  const contentPath = path.join(__dirname, '../client/src/lib/content.ts');
  let content = fs.readFileSync(contentPath, 'utf-8');

  const arrayName = type === 'blog' ? 'BLOG_FILES' : 'INDUSTRY_FILES';
  const regex = new RegExp(`(const ${arrayName} = \\[)([^\\]]*)(\\])`);

  content = content.replace(regex, (match, start, items, end) => {
    if (items.includes(filename)) return match;
    const newItems = items.trimEnd();
    const comma = newItems.endsWith(',') || newItems.trim() === '' ? '' : ',';
    return `${start}${newItems}${comma}\n  '${filename}',${end}`;
  });

  fs.writeFileSync(contentPath, content);
  console.log(`Updated content.ts with ${filename}`);
}

generateBlogPost().catch(console.error);
