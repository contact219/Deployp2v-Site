const fs = require('fs');
const path = require('path');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const INDUSTRIES = [
  { name: 'Dental Practices', slug: 'dental' },
  { name: 'Law Firms', slug: 'law-firms' },
  { name: 'Accounting Firms', slug: 'accounting' },
  { name: 'Pet Services', slug: 'pet-services' },
  { name: 'Home Services', slug: 'home-services' },
  { name: 'Photography Studios', slug: 'photography' },
  { name: 'Event Planning', slug: 'event-planning' },
  { name: 'Landscaping', slug: 'landscaping' },
  { name: 'Auto Repair Shops', slug: 'auto-repair' },
  { name: 'Bakeries', slug: 'bakeries' }
];

async function generateIndustryPage() {
  const industryDir = path.join(__dirname, '../client/public/content/industries');
  
  // Get existing industry pages
  const existingPages = fs.existsSync(industryDir)
    ? fs.readdirSync(industryDir).map(f => f.replace('.md', ''))
    : [];

  // Find industries not yet covered
  const availableIndustries = INDUSTRIES.filter(ind => !existingPages.includes(ind.slug));

  if (availableIndustries.length === 0) {
    console.log('All predefined industries have been covered.');
    return;
  }

  const industry = availableIndustries[Math.floor(Math.random() * availableIndustries.length)];
  console.log(`Generating industry page for: ${industry.name}`);

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
          content: `You are a content writer for DeployP2V, an AI services company helping small and medium businesses adopt AI solutions. Write compelling industry-specific landing pages that speak directly to business owners in that industry.`
        },
        {
          role: 'user',
          content: `Write a landing page for ${industry.name} businesses.

Format as markdown with:
1. A compelling headline (# h1) that speaks to their pain points
2. A brief intro about challenges in their industry
3. "How AI Can Help" section with 4-5 specific use cases
4. "Benefits" section with bullet points
5. "Why DeployP2V" section
6. A strong call-to-action

Make it specific to ${industry.name} with real examples and pain points they face. Around 600-800 words.`
        }
      ],
      max_tokens: 1500,
      temperature: 0.7
    })
  });

  const data = await response.json();
  
  if (!data.choices || !data.choices[0]) {
    console.error('Failed to generate content:', data);
    process.exit(1);
  }

  const content = data.choices[0].message.content;
  const filepath = path.join(industryDir, `${industry.slug}.md`);

  if (!fs.existsSync(industryDir)) {
    fs.mkdirSync(industryDir, { recursive: true });
  }

  // Add frontmatter
  const frontmatter = `---
title: "AI Solutions for ${industry.name}"
industry: "${industry.name}"
slug: "${industry.slug}"
description: "Discover how DeployP2V helps ${industry.name.toLowerCase()} leverage AI to streamline operations and grow their business."
keywords: ["AI", "${industry.name}", "automation", "small business"]
---

`;

  fs.writeFileSync(filepath, frontmatter + content);
  console.log(`Industry page created: ${filepath}`);
}

generateIndustryPage().catch(console.error);
