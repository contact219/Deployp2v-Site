import matter from 'gray-matter';

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

// List of blog posts (we need to know the filenames)
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
      const { data, content: markdown } = matter(text);
      posts.push({
        slug: data.slug,
        title: data.title,
        date: data.date,
        author: data.author,
        description: data.description,
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
      const { data, content: markdown } = matter(text);
      pages.push({
        slug: data.slug,
        title: data.title,
        description: data.description,
        keywords: data.keywords || [],
        hero: data.hero,
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
