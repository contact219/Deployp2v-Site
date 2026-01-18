import { useEffect, useState } from 'react';
import { useParams, Link } from 'wouter';
import { Helmet } from 'react-helmet-async';
import { getIndustryPage, IndustryPage as IndustryPageType } from '../../lib/content';
import { MarkdownRenderer } from '../../components/MarkdownRenderer';

export function IndustryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<IndustryPageType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      getIndustryPage(slug).then((data) => {
        setPage(data);
        setLoading(false);
      });
    }
  }, [slug]);

  if (loading) {
    return <div className="container mx-auto px-4 py-12">Loading...</div>;
  }

  if (!page) {
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold">Industry not found</h1>
        <Link href="/industries" className="text-blue-600 hover:text-blue-800">← Back to industries</Link>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{page.title} | DeployP2V</title>
        <meta name="description" content={page.description} />
        <meta name="keywords" content={page.keywords.join(', ')} />
        <meta property="og:title" content={page.title} />
        <meta property="og:description" content={page.description} />
      </Helmet>
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="container mx-auto px-4">
          <Link href="/industries" className="text-blue-200 hover:text-white mb-4 inline-block">← All Industries</Link>
          <h1 className="text-4xl font-bold mb-4">{page.hero}</h1>
          <p className="text-xl text-blue-100">{page.description}</p>
        </div>
      </div>
      <article className="container mx-auto px-4 py-12 max-w-4xl">
        <MarkdownRenderer content={page.content} />
      </article>
    </>
  );
}
