import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SITE_URL = 'https://deployp2v.com';

function generateSitemap() {
  const blogDir = path.join(__dirname, '../client/public/content/blog');
  const industryDir = path.join(__dirname, '../client/public/content/industries');

  const urls = [
    { loc: '/', priority: '1.0', changefreq: 'weekly' },
    { loc: '/blog', priority: '0.8', changefreq: 'daily' },
    { loc: '/industries', priority: '0.8', changefreq: 'weekly' },
    { loc: '/contact', priority: '0.7', changefreq: 'monthly' },
  ];

  // Add blog posts
  if (fs.existsSync(blogDir)) {
    const blogFiles = fs.readdirSync(blogDir).filter(f => f.endsWith('.md'));
    for (const file of blogFiles) {
      const slug = file.replace('.md', '');
      urls.push({
        loc: `/blog/${slug}`,
        priority: '0.6',
        changefreq: 'monthly'
      });
    }
  }

  // Add industry pages
  if (fs.existsSync(industryDir)) {
    const industryFiles = fs.readdirSync(industryDir).filter(f => f.endsWith('.md'));
    for (const file of industryFiles) {
      const slug = file.replace('.md', '');
      urls.push({
        loc: `/industries/${slug}`,
        priority: '0.7',
        changefreq: 'monthly'
      });
    }
  }

  const today = new Date().toISOString().split('T')[0];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${SITE_URL}${url.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  const sitemapPath = path.join(__dirname, '../client/public/sitemap.xml');
  fs.writeFileSync(sitemapPath, sitemap);
  console.log(`Sitemap generated with ${urls.length} URLs: ${sitemapPath}`);
}

generateSitemap();
