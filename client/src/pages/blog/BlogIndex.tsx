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
