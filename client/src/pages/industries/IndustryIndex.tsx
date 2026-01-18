import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { Helmet } from 'react-helmet-async';
import { getIndustryPages, IndustryPage } from '../../lib/content';

export function IndustryIndex() {
  const [industries, setIndustries] = useState<IndustryPage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getIndustryPages().then((data) => {
      setIndustries(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="container mx-auto px-4 py-12">Loading...</div>;
  }

  return (
    <>
      <Helmet>
        <title>Industries We Serve | DeployP2V - AI Solutions</title>
        <meta name="description" content="AI automation solutions tailored for restaurants, retail, healthcare, real estate, automotive, fitness, salons, and professional services." />
      </Helmet>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">Industries We Serve</h1>
        <p className="text-xl text-gray-600 mb-12">
          Tailored AI solutions for your specific industry needs
        </p>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {industries.map((industry) => (
            <Link key={industry.slug} href={`/industries/${industry.slug}`}>
              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
                <h2 className="text-xl font-semibold mb-3 text-gray-900">{industry.title}</h2>
                <p className="text-gray-600 mb-4">{industry.description}</p>
                <span className="text-blue-600 font-medium">Learn more →</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
