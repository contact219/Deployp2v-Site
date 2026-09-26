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

const FALLBACK_TOPIC = 'AI Innovation Tips for Small Business Owners';

function normalizeTitle(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

// Reads each existing post's own frontmatter `title`, not its filename.
// The model picks its own slug wording independently of the requested
// topic on every run, so two runs of the *same* topic can end up as
// differently-slugged files — a slug-substring check never catches that
// (this is exactly how "5 Ways AI Can Help Your Restaurant Reduce Food
// Waste" ended up published three times under three different slugs).
function getExistingTitles(blogDir) {
  const files = fs.existsSync(blogDir)
    ? fs.readdirSync(blogDir).filter(f => f.endsWith('.md'))
    : [];
  const titles = new Set();
  for (const file of files) {
    const raw = fs.readFileSync(path.join(blogDir, file), 'utf-8');
    const match = raw.match(/^title:\s*"?(.*?)"?\s*$/m);
    if (match) titles.add(normalizeTitle(match[1]));
  }
  return titles;
}

async function generateBlogPost() {
  const blogDir = path.join(__dirname, '../client/public/content/blog');
  const existingTitles = getExistingTitles(blogDir);

  const availableTopics = BLOG_TOPICS.filter(topic => !existingTitles.has(normalizeTitle(topic)));

  if (availableTopics.length === 0 && existingTitles.has(normalizeTitle(FALLBACK_TOPIC))) {
    console.log('Every topic in BLOG_TOPICS (and the fallback topic) already has a published post. Skipping this run instead of generating another duplicate — add new topics to BLOG_TOPICS.');
    return;
  }

  const topic = availableTopics[Math.floor(Math.random() * availableTopics.length)] || FALLBACK_TOPIC;

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
  
  // Check for API errors
  if (!response.ok) {
    console.error('OpenAI API Error:', data.error?.message || JSON.stringify(data));
    process.exit(1);
  }
  
  if (!data.choices || !data.choices[0] || !data.choices[0].message) {
    console.error('Unexpected API response:', JSON.stringify(data, null, 2));
    process.exit(1);
  }
  
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
