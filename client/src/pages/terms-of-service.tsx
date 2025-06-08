import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';

export default function TermsOfService() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 shadow-md py-4">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <button 
            onClick={() => setLocation('/')} 
            className="flex items-center space-x-2 text-2xl font-bold text-indigo-400"
          >
            <svg className="w-8 h-8 text-indigo-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
            <span>DeployP2V</span>
          </button>
          <Button 
            onClick={() => setLocation('/')}
            variant="outline"
            className="text-indigo-400 border-indigo-400 hover:bg-indigo-400 hover:text-white"
          >
            Back to Home
          </Button>
        </div>
      </header>

      {/* Terms of Service Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-center">Terms of Service</h1>
        <div className="prose prose-invert max-w-none">
          <p className="text-gray-300 mb-8 text-center">
            <strong>Last updated:</strong> {new Date().toLocaleDateString()}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-white">1. Acceptance of Terms</h2>
            <p className="text-gray-300">
              By accessing and using DeployP2V's website and services, you accept and agree to be bound by 
              the terms and provision of this agreement. If you do not agree to abide by the above, please 
              do not use this service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-white">2. Description of Service</h2>
            <p className="text-gray-300 mb-4">
              DeployP2V provides AI solutions and consulting services for small businesses, including but not limited to:
            </p>
            <ul className="list-disc pl-6 text-gray-300">
              <li>AI-powered customer support systems</li>
              <li>Predictive analytics and data processing</li>
              <li>Automated workflow solutions</li>
              <li>Custom AI application development</li>
              <li>AI consulting and implementation services</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-white">3. Service Availability</h2>
            <p className="text-gray-300">
              We strive to provide reliable service but cannot guarantee 100% uptime. Services may be 
              temporarily unavailable due to maintenance, updates, or circumstances beyond our control. 
              We will provide reasonable notice for planned maintenance when possible.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-white">4. User Responsibilities</h2>
            <p className="text-gray-300 mb-4">You agree to:</p>
            <ul className="list-disc pl-6 text-gray-300">
              <li>Provide accurate and complete information when using our services</li>
              <li>Use our services in compliance with applicable laws and regulations</li>
              <li>Not attempt to gain unauthorized access to our systems or services</li>
              <li>Not use our services for illegal, harmful, or malicious purposes</li>
              <li>Maintain the confidentiality of any login credentials provided</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-white">5. Payment Terms</h2>
            <p className="text-gray-300 mb-4">
              For paid services:
            </p>
            <ul className="list-disc pl-6 text-gray-300">
              <li>Payment is due according to the billing schedule agreed upon in your service contract</li>
              <li>Late payments may result in service suspension or termination</li>
              <li>All fees are non-refundable unless otherwise specified in writing</li>
              <li>Prices are subject to change with 30 days' notice</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-white">6. Intellectual Property</h2>
            <p className="text-gray-300 mb-4">
              DeployP2V retains ownership of all proprietary technologies, software, and methodologies. 
              Custom solutions developed for clients remain the property of DeployP2V unless otherwise 
              specified in a separate agreement.
            </p>
            <p className="text-gray-300">
              You retain ownership of your data and content provided to us, granting us a license to 
              use it solely for providing our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-white">7. Data Protection and Privacy</h2>
            <p className="text-gray-300">
              We are committed to protecting your data and privacy. Our data handling practices are 
              governed by our Privacy Policy. By using our services, you consent to the collection 
              and use of information in accordance with our Privacy Policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-white">8. Limitation of Liability</h2>
            <p className="text-gray-300">
              DeployP2V shall not be liable for any indirect, incidental, special, consequential, or 
              punitive damages, including without limitation, loss of profits, data, use, goodwill, 
              or other intangible losses, resulting from your use of our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-white">9. Service Level Agreement</h2>
            <p className="text-gray-300 mb-4">
              We strive to provide high-quality service and will make reasonable efforts to:
            </p>
            <ul className="list-disc pl-6 text-gray-300">
              <li>Respond to support inquiries within 24 hours during business days</li>
              <li>Maintain service availability of 99% or higher</li>
              <li>Provide advance notice of scheduled maintenance</li>
              <li>Implement appropriate security measures to protect your data</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-white">10. Termination</h2>
            <p className="text-gray-300">
              Either party may terminate services with 30 days' written notice. DeployP2V reserves 
              the right to terminate services immediately for breach of terms, non-payment, or 
              misuse of services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-white">11. Modifications to Terms</h2>
            <p className="text-gray-300">
              We reserve the right to modify these terms at any time. Changes will be effective 
              immediately upon posting to our website. Your continued use of our services after 
              changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-white">12. Governing Law</h2>
            <p className="text-gray-300">
              These terms shall be governed by and construed in accordance with the laws of the 
              State of California, without regard to its conflict of law provisions.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-white">13. Contact Information</h2>
            <p className="text-gray-300">
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <div className="bg-gray-800 p-4 rounded-lg mt-4">
              <p className="text-gray-300">
                <strong>Email:</strong> legal@deployp2v.com<br/>
                <strong>Address:</strong> DeployP2V AI Solutions<br/>
                123 Innovation Drive, Tech Valley, CA 94025<br/>
                <strong>Phone:</strong> (555) 123-4567
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}