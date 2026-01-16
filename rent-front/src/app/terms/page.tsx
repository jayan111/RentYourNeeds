export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-16">
      <h1 className="text-3xl sm:text-4xl font-bold mb-8">Terms of Service</h1>
      
      <div className="prose prose-lg max-w-none space-y-6">
        <p className="text-gray-600 text-sm">Last updated: January 1, 2024</p>
        
        <section>
          <h2 className="text-2xl font-bold mb-4">Acceptance of Terms</h2>
          <p>By accessing and using RentYourNeeds, you accept and agree to be bound by the terms and provision of this agreement.</p>
        </section>
        
        <section>
          <h2 className="text-2xl font-bold mb-4">Rental Terms</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>All rentals are subject to availability</li>
            <li>Rental periods are calculated from pickup to return</li>
            <li>Late returns may incur additional fees</li>
            <li>Damage to rental items may result in repair or replacement charges</li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-2xl font-bold mb-4">User Responsibilities</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Provide accurate and complete information</li>
            <li>Use rental items responsibly and as intended</li>
            <li>Return items in the same condition as received</li>
            <li>Report any issues or damages immediately</li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-2xl font-bold mb-4">Limitation of Liability</h2>
          <p>RentYourNeeds shall not be liable for any indirect, incidental, special, consequential, or punitive damages.</p>
        </section>
        
        <section>
          <h2 className="text-2xl font-bold mb-4">Contact Information</h2>
          <p>For questions about these Terms of Service, please contact us at legal@rentyourneeds.com.</p>
        </section>
      </div>
    </div>
  );
}