export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  author: string;
  description: string;
  keywords: string[];
  content: string;
}

export interface IndustryPage {
  slug: string;
  title: string;
  description: string;
  keywords: string[];
  hero: string;
  content: string;
}

// Simple frontmatter parser for browser
function parseFrontmatter(text: string): { data: Record<string, any>; content: string } {
  const lines = text.split('\n');
  
  if (lines[0].trim() !== '---') {
    return { data: {}, content: text };
  }
  
  let endIndex = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '---') {
      endIndex = i;
      break;
    }
  }
  
  if (endIndex === -1) {
    return { data: {}, content: text };
  }
  
  const frontmatterLines = lines.slice(1, endIndex);
  const content = lines.slice(endIndex + 1).join('\n').trim();
  
  const data: Record<string, any> = {};
  let currentKey = '';
  let inArray = false;
  let arrayValues: string[] = [];
  
  for (const line of frontmatterLines) {
    // Check for array item
    if (line.match(/^\s+-\s+/)) {
      const value = line.replace(/^\s+-\s+/, '').trim().replace(/^["']|["']$/g, '');
      arrayValues.push(value);
      continue;
    }
    
    // Save previous array if we were in one
    if (inArray && currentKey) {
      data[currentKey] = arrayValues;
      arrayValues = [];
      inArray = false;
    }
    
    // Check for key: value
    const match = line.match(/^([\w]+):\s*(.*)$/);
    if (match) {
      currentKey = match[1];
      const value = match[2].trim().replace(/^["']|["']$/g, '');
      
      if (value === '') {
        // This might be an array
        inArray = true;
        arrayValues = [];
      } else {
        data[currentKey] = value;
      }
    }
  }
  
  // Save final array if we were in one
  if (inArray && currentKey) {
    data[currentKey] = arrayValues;
  }
  
  return { data, content };
}

// List of blog posts
const BLOG_FILES = [
  'ai-automation-small-business-2026.md',
  'chatbots-customer-service-roi.md',
];

// List of industry pages
const INDUSTRY_FILES = [
  'restaurants.md',
  'retail.md',
  'professional-services.md',
  'healthcare.md',
  'real-estate.md',
  'automotive.md',
  'fitness.md',
  'salons.md',
];

export async function getBlogPosts(): Promise<BlogPost[]> {
  const posts: BlogPost[] = [];
  
  for (const file of BLOG_FILES) {
    try {
      const response = await fetch(`/content/blog/${file}`);
      if (!response.ok) continue;
      const text = await response.text();
      const { data, content: markdown } = parseFrontmatter(text);
      posts.push({
        slug: data.slug || file.replace('.md', ''),
        title: data.title || 'Untitled',
        date: data.date || '',
        author: data.author || 'DeployP2V Team',
        description: data.description || '',
        keywords: data.keywords || [],
        content: markdown,
      });
    } catch (e) {
      console.error(`Failed to load blog post ${file}:`, e);
    }
  }
  
  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  const posts = await getBlogPosts();
  return posts.find(p => p.slug === slug) || null;
}

export async function getIndustryPages(): Promise<IndustryPage[]> {
  const pages: IndustryPage[] = [];
  
  for (const file of INDUSTRY_FILES) {
    try {
      const response = await fetch(`/content/industries/${file}`);
      if (!response.ok) continue;
      const text = await response.text();
      const { data, content: markdown } = parseFrontmatter(text);
      pages.push({
        slug: data.slug || file.replace('.md', ''),
        title: data.title || 'Untitled',
        description: data.description || '',
        keywords: data.keywords || [],
        hero: data.hero || '',
        content: markdown,
      });
    } catch (e) {
      console.error(`Failed to load industry page ${file}:`, e);
    }
  }
  
  return pages;
}

export async function getIndustryPage(slug: string): Promise<IndustryPage | null> {
  const pages = await getIndustryPages();
  return pages.find(p => p.slug === slug) || null;
}
