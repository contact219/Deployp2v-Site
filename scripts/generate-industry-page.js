import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const POTENTIAL_INDUSTRIES = [
  'Legal Services',
  'Accounting & Tax',
  'Home Services',
  'Pet Services',
  'Education & Tutoring',
  'Event Planning',
  'Photography',
  'Cleaning Services',
  'Landscaping',
  'Food Trucks'
];

async function generateIndustryPage() {
  const industryDir = path.join(__dirname, '../client/public/content/industries');
  const existingPages = fs.existsSync(industryDir)
    ? fs.readdirSync(industryDir).map(f => f.replace('.md', ''))
    : [];

  const availableIndustries = POTENTIAL_INDUSTRIES.filter(industry => {
    const slug = industry.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return !existingPages.includes(slug);
  });

  if (availableIndustries.length === 0) {
    console.log('All predefined industries have pages. Skipping generation.');
    return;
  }

  const industry = availableIndustries[Math.floor(Math.random() * availableIndustries.length)];
  console.log(`Generating industry page for: ${industry}`);

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
          content: `You are a content writer for DeployP2V, an AI automation company. Create compelling industry landing pages. Output ONLY valid markdown with YAML frontmatter.`
        },
        {
          role: 'user',
          content: `Write an industry landing page for: "${industry}"

Format:
---
title: "AI Solutions for ${industry}"
slug: ${industry.toLowerCase().replace(/[^a-z0-9]+/g, '-')}
description: "Description here (150-160 chars)"
keywords:
  - keyword1
  - keyword2
hero: "Catchy hero tagline"
---

# Content with proper markdown

Include:
- Industry-specific pain points
- How AI/automation helps
- Specific use cases (3-5)
- Benefits and ROI
- Call to action for DeployP2V`
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    })
  });

  const data = await response.json();
  const content = data.choices[0].message.content;

  const slugMatch = content.match(/slug:\s*([\w-]+)/);
  const slug = slugMatch ? slugMatch[1] : industry.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  if (!fs.existsSync(industryDir)) {
    fs.mkdirSync(industryDir, { recursive: true });
  }

  const filePath = path.join(industryDir, `${slug}.md`);
  fs.writeFileSync(filePath, content);
  console.log(`Industry page saved to: ${filePath}`);

  updateContentLoader('industry', `${slug}.md`);
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

generateIndustryPage().catch(console.error);
