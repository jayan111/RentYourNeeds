export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-16">
      <h1 className="text-3xl sm:text-4xl font-bold mb-8">Privacy Policy</h1>
      
      <div className="prose prose-lg max-w-none space-y-6">
        <p className="text-gray-600 text-sm">Last updated: January 1, 2024</p>
        
        <section>
          <h2 className="text-2xl font-bold mb-4">Information We Collect</h2>
          <p>We collect information you provide directly to us, such as when you create an account, make a rental, or contact us.</p>
        </section>
        
        <section>
          <h2 className="text-2xl font-bold mb-4">How We Use Your Information</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>To provide and maintain our services</li>
            <li>To process transactions and send related information</li>
            <li>To send you technical notices and support messages</li>
            <li>To communicate with you about products, services, and events</li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-2xl font-bold mb-4">Information Sharing</h2>
          <p>We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.</p>
        </section>
        
        <section>
          <h2 className="text-2xl font-bold mb-4">Data Security</h2>
          <p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
        </section>
        
        <section>
          <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
          <p>If you have questions about this Privacy Policy, please contact us at privacy@rentyourneeds.com.</p>
        </section>
      </div>
    </div>
  );
}