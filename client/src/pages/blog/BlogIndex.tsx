import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { Helmet } from 'react-helmet-async';
import { getBlogPosts, BlogPost } from '../../lib/content';

export function BlogIndex() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBlogPosts().then((data) => {
      setPosts(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="container mx-auto px-4 py-12">Loading...</div>;
  }

  return (
    <>
      <Helmet>
        <title>Blog | DeployP2V - AI Solutions for Small Business</title>
        <meta name="description" content="Expert insights on AI automation, small business technology, and digital transformation strategies." />
        <link rel="canonical" href="https://deployp2v.com/blog" />
        <meta property="og:title" content="DeployP2V Blog | AI Solutions for Small Business" />
        <meta property="og:description" content="Expert insights on AI automation, small business technology, and digital transformation strategies." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://deployp2v.com/blog" />
        <meta property="og:image" content="https://deployp2v.com/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="DeployP2V Blog | AI Solutions for Small Business" />
        <meta name="twitter:description" content="Expert insights on AI automation, small business technology, and digital transformation strategies." />
        <meta name="twitter:image" content="https://deployp2v.com/og-image.png" />
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Blog',
            name: 'DeployP2V Blog',
            description: 'Expert insights on AI automation, small business technology, and digital transformation strategies.',
            url: 'https://deployp2v.com/blog',
            publisher: {
              '@type': 'Organization',
              name: 'DeployP2V',
              logo: {
                '@type': 'ImageObject',
                url: 'https://deployp2v.com/logo.png'
              }
            },
            blogPost: posts.map((p) => ({
              '@type': 'BlogPosting',
              headline: p.title,
              description: p.description,
              datePublished: p.date,
              url: `https://deployp2v.com/blog/${p.slug}`,
              author: {
                '@type': 'Organization',
                name: 'DeployP2V'
              }
            }))
          })}
        </script>

      </Helmet>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">Blog</h1>
        <p className="text-xl text-gray-600 mb-12">
          Expert insights on AI automation and small business technology
        </p>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <article key={post.slug} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6">
                <time className="text-sm text-gray-500">{post.date}</time>
                <h2 className="text-xl font-semibold mt-2 mb-3">
                  <Link href={`/blog/${post.slug}`} className="hover:text-blue-600">
                    {post.title}
                  </Link>
                </h2>
                <p className="text-gray-600 mb-4">{post.description}</p>
                <Link href={`/blog/${post.slug}`} className="text-blue-600 hover:text-blue-800 font-medium">
                  Read more →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </>
  );
}
