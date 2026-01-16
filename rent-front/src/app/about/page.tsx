export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-16">
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">About RentYourNeeds</h1>
        <p className="text-lg text-gray-600">Your trusted marketplace for premium rentals</p>
      </div>
      
      <div className="prose prose-lg max-w-none">
        <p>
          RentYourNeeds is a revolutionary rental marketplace that connects people who need items 
          with those who have them available for rent. We believe in the sharing economy and 
          sustainable consumption.
        </p>
        
        <h2>Our Mission</h2>
        <p>
          To make quality products accessible to everyone while promoting sustainable consumption 
          and reducing waste through the sharing economy.
        </p>
        
        <h2>Why Choose Us?</h2>
        <ul>
          <li>Verified products and trusted sellers</li>
          <li>Competitive pricing and flexible rental periods</li>
          <li>Full insurance coverage on all rentals</li>
          <li>24/7 customer support</li>
        </ul>
      </div>
    </div>
  );
}