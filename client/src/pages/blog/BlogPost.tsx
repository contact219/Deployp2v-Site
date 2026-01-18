import { useEffect, useState } from 'react';
import { useParams, Link } from 'wouter';
import { Helmet } from 'react-helmet-async';
import { getBlogPost, BlogPost as BlogPostType } from '../../lib/content';
import { MarkdownRenderer } from '../../components/MarkdownRenderer';

export function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPostType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      getBlogPost(slug).then((data) => {
        setPost(data);
        setLoading(false);
      });
    }
  }, [slug]);

  if (loading) {
    return <div className="container mx-auto px-4 py-12">Loading...</div>;
  }

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold">Post not found</h1>
        <Link href="/blog" className="text-blue-600 hover:text-blue-800">← Back to blog</Link>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{post.title} | DeployP2V Blog</title>
        <meta name="description" content={post.description} />
        <meta name="keywords" content={post.keywords.join(', ')} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.description} />
        <meta property="og:type" content="article" />
      </Helmet>
      <article className="container mx-auto px-4 py-12 max-w-4xl">
        <Link href="/blog" className="text-blue-600 hover:text-blue-800 mb-6 inline-block">← Back to blog</Link>
        <header className="mb-8">
          <time className="text-gray-500">{post.date}</time>
          <span className="mx-2 text-gray-300">•</span>
          <span className="text-gray-500">{post.author}</span>
        </header>
        <MarkdownRenderer content={post.content} />
      </article>
    </>
  );
}
