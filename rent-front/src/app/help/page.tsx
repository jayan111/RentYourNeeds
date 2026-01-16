export default function HelpPage() {
  const faqs = [
    {
      question: "How do I rent an item?",
      answer: "Browse our products, select your desired item, choose rental dates, and complete the checkout process."
    },
    {
      question: "What if an item is damaged during rental?",
      answer: "Report any damage immediately. Our insurance covers accidental damage, but intentional damage may result in charges."
    },
    {
      question: "How do I return an item?",
      answer: "Items can be returned to our pickup locations or via our delivery service during business hours."
    },
    {
      question: "Can I extend my rental period?",
      answer: "Yes, you can extend your rental through your account dashboard, subject to availability."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-16">
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">Help Center</h1>
        <p className="text-lg text-gray-600">Find answers to common questions</p>
      </div>
      
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="card">
                <h3 className="font-semibold mb-2">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>
        
        <section>
          <h2 className="text-2xl font-bold mb-6">Need More Help?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="card text-center">
              <h3 className="font-semibold mb-2">Contact Support</h3>
              <p className="text-gray-600 mb-4">Get help from our support team</p>
              <a href="/contact" className="btn-primary inline-block">Contact Us</a>
            </div>
            <div className="card text-center">
              <h3 className="font-semibold mb-2">Live Chat</h3>
              <p className="text-gray-600 mb-4">Chat with us in real-time</p>
              <button className="btn-secondary">Start Chat</button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}