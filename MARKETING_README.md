# DeployP2V Marketing Automation System

This document describes the autonomous marketing content system integrated into the DeployP2V website.

## Features

### 1. Google Analytics 4 (GA4) Integration
- Automatic page view tracking on route changes
- Event tracking helpers for lead capture and conversions
- Environment-based configuration

**Setup:**
1. Create a GA4 property at https://analytics.google.com/
2. Get your Measurement ID (starts with `G-`)
3. Add to Replit environment: `VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX`

### 2. Google Search Console
- Verification meta tag placeholder in `index.html`
- Sitemap automatically generated at `/sitemap.xml`
- robots.txt configured for search engines

**Setup:**
1. Go to https://search.google.com/search-console/
2. Add property for `deployp2v.com`
3. Choose "HTML tag" verification method
4. Replace `YOUR_VERIFICATION_CODE` in `client/index.html` with your code
5. Submit sitemap URL: `https://deployp2v.com/sitemap.xml`

### 3. Markdown-Based Content System

#### Blog Posts
- Location: `client/public/content/blog/`
- Route: `/blog` (index) and `/blog/:slug` (individual posts)
- Format: Markdown with YAML frontmatter

#### Industry Landing Pages
- Location: `client/public/content/industries/`
- Route: `/industries` (index) and `/industries/:slug` (individual pages)
- Current industries: Restaurants, Retail, Professional Services, Healthcare, Real Estate, Automotive, Fitness, Salons

### 4. Automated Content Generation (GitHub Actions)

The workflow `.github/workflows/generate-content.yml` runs daily at 6 AM UTC and:
1. Generates new blog posts using OpenAI
2. Generates new industry pages
3. Updates the sitemap
4. Creates a Pull Request for review

**Setup:**
1. Go to your GitHub repo Settings → Secrets and variables → Actions
2. Add secret: `OPENAI_API_KEY` with your OpenAI API key
3. The workflow will run automatically or can be triggered manually

### 5. Lead Capture Contact Form
- Route: `/contact`
- Integrated with existing SendGrid email setup
- Tracks submissions in GA4

## Scripts

```bash
# Generate a new blog post (requires OPENAI_API_KEY env var)
npm run generate:blog

# Generate a new industry page
npm run generate:industry

# Regenerate sitemap
npm run generate:sitemap

# Generate all content
npm run generate:all
```

## Environment Variables

| Variable | Description | Where to Set |
|----------|-------------|---------------|
| `VITE_GA_MEASUREMENT_ID` | GA4 Measurement ID | Replit Secrets |
| `OPENAI_API_KEY` | OpenAI API key for content generation | GitHub Secrets |

## File Structure

```
client/
├── public/
│   ├── content/
│   │   ├── blog/           # Markdown blog posts
│   │   └── industries/     # Markdown industry pages
│   ├── sitemap.xml         # Auto-generated sitemap
│   └── robots.txt          # Search engine directives
├── src/
│   ├── components/
│   │   ├── analytics/
│   │   │   └── GoogleAnalytics.tsx  # GA4 tracking
│   │   └── MarkdownRenderer.tsx     # Markdown display
│   ├── lib/
│   │   └── content.ts      # Content loading utilities
│   └── pages/
│       ├── blog/           # Blog components
│       ├── industries/     # Industry components
│       └── Contact.tsx     # Lead capture form
scripts/
├── generate-blog-post.js   # Blog generation script
├── generate-industry-page.js # Industry page generation
└── generate-sitemap.js     # Sitemap generation
.github/
└── workflows/
    └── generate-content.yml # Automated content workflow
```

## Next Steps

1. **Merge the PR** - Review and merge the `agent/autopilot-seo` branch
2. **Set up GA4** - Create property and add measurement ID
3. **Verify Search Console** - Add verification code and submit sitemap
4. **Add OpenAI key to GitHub** - Enable automated content generation
5. **Monitor performance** - Check GA4 for traffic and Search Console for indexing
