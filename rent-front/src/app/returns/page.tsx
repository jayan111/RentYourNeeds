export default function ReturnsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-16">
      <h1 className="text-3xl sm:text-4xl font-bold mb-8">Returns & Refunds</h1>
      
      <div className="prose prose-lg max-w-none space-y-8">
        <section>
          <h2 className="text-2xl font-bold mb-4">Return Policy</h2>
          <p>Items must be returned by the agreed-upon return date in the same condition as received.</p>
          
          <h3 className="text-xl font-semibold mt-6 mb-3">Return Process</h3>
          <ol className="list-decimal pl-6 space-y-2">
            <li>Clean the item and ensure all accessories are included</li>
            <li>Package the item securely in original packaging if available</li>
            <li>Drop off at designated return location or schedule pickup</li>
            <li>Receive confirmation of successful return</li>
          </ol>
        </section>
        
        <section>
          <h2 className="text-2xl font-bold mb-4">Late Returns</h2>
          <p>Late returns will incur additional daily charges at the standard rental rate until the item is returned.</p>
        </section>
        
        <section>
          <h2 className="text-2xl font-bold mb-4">Refund Policy</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Cancellations made 24+ hours before pickup: Full refund</li>
            <li>Cancellations made within 24 hours: 50% refund</li>
            <li>No-shows or same-day cancellations: No refund</li>
            <li>Refunds are processed within 5-7 business days</li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-2xl font-bold mb-4">Damage Claims</h2>
          <p>If an item is returned damaged, you will be notified within 48 hours with photos and repair estimates. Our insurance may cover accidental damage.</p>
        </section>
      </div>
    </div>
  );
}