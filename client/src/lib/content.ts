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

export async function getBlogPosts(): Promise<BlogPost[]> {
  const modules = import.meta.glob('/public/content/blog/*.md', { as: 'raw' });
  const posts: BlogPost[] = [];
  
  for (const path in modules) {
    const content = await modules[path]();
    const { data, content: markdown } = matter(content);
    posts.push({
      slug: data.slug,
      title: data.title,
      date: data.date,
      author: data.author,
      description: data.description,
      keywords: data.keywords || [],
      content: markdown,
    });
  }
  
  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  const posts = await getBlogPosts();
  return posts.find(p => p.slug === slug) || null;
}

export async function getIndustryPages(): Promise<IndustryPage[]> {
  const modules = import.meta.glob('/public/content/industries/*.md', { as: 'raw' });
  const pages: IndustryPage[] = [];
  
  for (const path in modules) {
    const content = await modules[path]();
    const { data, content: markdown } = matter(content);
    pages.push({
      slug: data.slug,
      title: data.title,
      description: data.description,
      keywords: data.keywords || [],
      hero: data.hero,
      content: markdown,
    });
  }
  
  return pages;
}

export async function getIndustryPage(slug: string): Promise<IndustryPage | null> {
  const pages = await getIndustryPages();
  return pages.find(p => p.slug === slug) || null;
}
