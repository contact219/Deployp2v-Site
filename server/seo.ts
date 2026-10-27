import fs from "fs";
import path from "path";
import matter from "gray-matter";

export const SITE_URL = "https://deployp2v.com";
const OG_IMAGE = `${SITE_URL}/og-image.png`;

export type RouteSeo = {
  title: string;
  description: string;
  /** Absolute canonical URL. */
  canonical: string;
  ogType?: string;
  noindex?: boolean;
  jsonLd?: unknown;
  /** When set, respond with a 301 to this path instead of rendering. */
  redirect?: string;
};

/** Old blog slugs that were consolidated. Kept as real 301s so nothing that
 *  was bookmarked or indexed dead-ends. Mirrors the client-side redirects in
 *  client/src/App.tsx. */
const REDIRECTS: Record<string, string> = {
  "/blog/5-ways-ai-reduce-food-waste": "/blog/ai-reduce-food-waste-restaurant",
  "/blog/reduce-food-waste-ai": "/blog/ai-reduce-food-waste-restaurant",
};

type StaticRoute = Omit<RouteSeo, "canonical">;

const STATIC_ROUTES: Record<string, StaticRoute> = {
  "/": {
    title:
      "DeployP2V — The busywork runs itself now. | AI Automation for Small Business, Wylie TX",
    description:
      "DeployP2V (Possibility to Velocity): The busywork runs itself now. Done-for-you AI agents that answer calls, chase invoices, and follow up on every lead — live in 5–7 days, from $149/mo. Wylie, TX.",
  },
  "/blog": {
    title: "Blog | AI Automation Insights for Small Business — DeployP2V",
    description:
      "Practical AI automation guides for small business owners — where automation actually pays off, real ROI numbers, and how to choose the right tools for your size.",
  },
  "/industries": {
    title: "Industries We Serve | DeployP2V - AI Solutions",
    description:
      "AI automation solutions tailored for restaurants, retail, healthcare, real estate, automotive, fitness, salons, and professional services.",
  },
  "/faq": {
    title: "FAQ | DeployP2V - AI Solutions for Small Business",
    description:
      "Frequently asked questions about AI solutions, pricing, security, and implementation for small businesses.",
  },
  "/case-studies": {
    title: "Case Studies | Real Results from Texas Small Businesses — DeployP2V",
    description:
      "Real automation results from Texas small businesses — 15 hrs/wk of admin removed at a medical practice, $2,400/mo of labor recovered at a BBQ kitchen, 25 extra closings a quarter for a Dallas realty team.",
  },
  "/contact": {
    title: "Contact Us | DeployP2V - AI Solutions",
    description:
      "Get in touch with DeployP2V for AI automation solutions. Free 15-minute fit call and a plain-English plan with a fixed price. Wylie, Texas · (214) 604-5735.",
  },
  "/roi-calculator": {
    title: "AI ROI Calculator | What Automation Could Save You — DeployP2V",
    description:
      "Work out what your business could save with AI automation. Enter your industry, team size, revenue and hours lost to manual tasks to get an ROI estimate.",
  },
  "/resources": {
    title: "Free AI Resources, Guides & Templates — DeployP2V",
    description:
      "Free AI implementation guides, ROI worksheets, readiness checklists and industry use cases for small business owners — plus on-demand webinars and planning tools.",
  },
  "/privacy-policy": {
    title: "Privacy Policy | DeployP2V",
    description:
      "How DeployP2V collects, uses and protects your information, and the choices available to you.",
  },
  "/terms-of-service": {
    title: "Terms of Service | DeployP2V",
    description: "The terms that govern use of the DeployP2V website and services.",
  },
  // Internal - reachable, but must never be indexed.
  "/admin": {
    title: "Admin | DeployP2V",
    description: "DeployP2V administration.",
    noindex: true,
  },
  "/admin/crm": {
    title: "CRM | DeployP2V",
    description: "DeployP2V CRM.",
    noindex: true,
  },
};

type Frontmatter = {
  title?: string;
  slug?: string;
  description?: string;
  date?: string;
  author?: string;
};

function loadFrontmatter(dir: string): Record<string, Frontmatter> {
  const out: Record<string, Frontmatter> = {};
  if (!fs.existsSync(dir)) return out;
  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith(".md")) continue;
    try {
      const raw = fs.readFileSync(path.join(dir, file), "utf-8");
      out[file.replace(/\.md$/, "")] = matter(raw).data as Frontmatter;
    } catch {
      /* a malformed post should not take the site down */
    }
  }
  return out;
}

const esc = (value: string): string =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/** react-helmet-async adopts tags carrying data-rh="true" on hydration, so
 *  these are replaced rather than duplicated when React takes over. */
const RH = 'data-rh="true"';

function renderTags(seo: RouteSeo): string {
  const tags = [
    `<title ${RH}>${esc(seo.title)}</title>`,
    `<meta ${RH} name="description" content="${esc(seo.description)}" />`,
    seo.noindex
      ? `<meta ${RH} name="robots" content="noindex, nofollow" />`
      : `<meta ${RH} name="robots" content="index, follow" />`,
    `<link ${RH} rel="canonical" href="${esc(seo.canonical)}" />`,
    `<meta ${RH} property="og:title" content="${esc(seo.title)}" />`,
    `<meta ${RH} property="og:description" content="${esc(seo.description)}" />`,
    `<meta ${RH} property="og:type" content="${seo.ogType ?? "website"}" />`,
    `<meta ${RH} property="og:url" content="${esc(seo.canonical)}" />`,
    `<meta ${RH} property="og:image" content="${OG_IMAGE}" />`,
    `<meta ${RH} property="og:site_name" content="DeployP2V" />`,
    `<meta ${RH} name="twitter:card" content="summary_large_image" />`,
    `<meta ${RH} name="twitter:title" content="${esc(seo.title)}" />`,
    `<meta ${RH} name="twitter:description" content="${esc(seo.description)}" />`,
    `<meta ${RH} name="twitter:image" content="${OG_IMAGE}" />`,
  ];
  if (seo.jsonLd) {
    tags.push(
      `<script ${RH} type="application/ld+json">${JSON.stringify(seo.jsonLd).replace(
        /</g,
        "\\u003c",
      )}</script>`,
    );
  }
  return tags.join("\n    ");
}

const SEO_BLOCK = /<!--seo:start-->[\s\S]*?<!--seo:end-->/;

export function createSeo(distPath: string) {
  const blog = loadFrontmatter(path.join(distPath, "content", "blog"));
  const industries = loadFrontmatter(path.join(distPath, "content", "industries"));

  function resolve(pathname: string): RouteSeo | null {
    const p = pathname.replace(/\/+$/, "") || "/";

    const redirect = REDIRECTS[p];
    if (redirect) {
      return {
        title: "Redirecting | DeployP2V",
        description: "",
        canonical: `${SITE_URL}${redirect}`,
        redirect,
      };
    }

    const staticHit = STATIC_ROUTES[p];
    if (staticHit) return { ...staticHit, canonical: `${SITE_URL}${p === "/" ? "/" : p}` };

    const blogMatch = /^\/blog\/([\w-]+)$/.exec(p);
    if (blogMatch && blog[blogMatch[1]]) {
      const post = blog[blogMatch[1]];
      const title = post.title ?? "DeployP2V Blog";
      const description = post.description ?? "";
      return {
        title: `${title} | DeployP2V Blog`,
        description,
        canonical: `${SITE_URL}/blog/${blogMatch[1]}`,
        ogType: "article",
        jsonLd: {
          "@context": "https://schema.org",
          "@type": "Article",
          headline: title,
          description,
          author: { "@type": "Organization", name: post.author || "DeployP2V" },
          datePublished: post.date,
          mainEntityOfPage: {
            "@type": "WebPage",
            "@id": `${SITE_URL}/blog/${blogMatch[1]}`,
          },
          image: OG_IMAGE,
          publisher: {
            "@type": "Organization",
            name: "DeployP2V",
            logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png` },
          },
        },
      };
    }

    const industryMatch = /^\/industries\/([\w-]+)$/.exec(p);
    if (industryMatch && industries[industryMatch[1]]) {
      const page = industries[industryMatch[1]];
      const title = page.title ?? "Industries";
      const description = page.description ?? "";
      return {
        title: `${title} | DeployP2V`,
        description,
        canonical: `${SITE_URL}/industries/${industryMatch[1]}`,
        jsonLd: {
          "@context": "https://schema.org",
          "@type": "Service",
          name: title,
          description,
          provider: {
            "@type": "Organization",
            name: "DeployP2V",
            url: SITE_URL,
          },
          areaServed: { "@type": "State", name: "Texas" },
        },
      };
    }

    return null;
  }

  /** Fill the <!--seo:start-->…<!--seo:end--> block with this route's tags. */
  function inject(html: string, seo: RouteSeo | null): string {
    const tags = seo
      ? renderTags(seo)
      : renderTags({
          title: "Page not found | DeployP2V",
          description: "That page does not exist.",
          canonical: `${SITE_URL}/`,
          noindex: true,
        });
    if (!SEO_BLOCK.test(html)) return html;
    return html.replace(SEO_BLOCK, `<!--seo:start-->\n    ${tags}\n    <!--seo:end-->`);
  }

  /** True for paths this app actually serves (so unknown URLs can 404). */
  function isKnownRoute(pathname: string): boolean {
    return resolve(pathname) !== null;
  }

  return { resolve, inject, isKnownRoute, blogSlugs: Object.keys(blog), industrySlugs: Object.keys(industries) };
}

export type Seo = ReturnType<typeof createSeo>;
