const fs = require('fs');
const path = require('path');

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
    const blogPosts = fs.readdirSync(blogDir).filter(f => f.endsWith('.md'));
    blogPosts.forEach(post => {
      const slug = post.replace('.md', '');
      urls.push({
        loc: `/blog/${slug}`,
        priority: '0.6',
        changefreq: 'monthly'
      });
    });
  }

  // Add industry pages
  if (fs.existsSync(industryDir)) {
    const industryPages = fs.readdirSync(industryDir).filter(f => f.endsWith('.md'));
    industryPages.forEach(page => {
      const slug = page.replace('.md', '');
      urls.push({
        loc: `/industries/${slug}`,
        priority: '0.7',
        changefreq: 'monthly'
      });
    });
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

  // Also generate robots.txt
  const robotsTxt = `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;
  
  const robotsPath = path.join(__dirname, '../client/public/robots.txt');
  fs.writeFileSync(robotsPath, robotsTxt);
  console.log(`robots.txt generated: ${robotsPath}`);
}

generateSitemap();
