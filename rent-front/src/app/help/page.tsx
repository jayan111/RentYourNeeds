'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp, MessageCircle, Phone, Mail, FileCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const FAQ_SECTIONS = [
  {
    title: 'Getting Started',
    faqs: [
      {
        q: 'How does renting work?',
        a: 'Choose a product, select your tenure (3–24 months), complete a quick KYC (PAN + ID proof), and pay the first month\'s rent. We deliver and install everything free of charge.'
      },
      {
        q: 'What is KYC and why is it needed?',
        a: 'KYC (Know Your Customer) is a quick verification of your PAN card and one Government ID (Aadhaar, Driving Licence, or Passport). It takes under 2 minutes and is required once for your account.'
      },
      {
        q: 'Is there a security deposit?',
        a: 'No! We charge zero security deposit. You only pay the first month\'s rent to get started.'
      },
      {
        q: 'What cities do you deliver to?',
        a: 'We currently serve Ahmedabad, Mumbai, Delhi, Bangalore, Hyderabad, Pune, and Chennai. More cities coming soon!'
      },
    ]
  },
  {
    title: 'Tenure & Pricing',
    faqs: [
      {
        q: 'What tenure options are available?',
        a: 'You can choose from 3, 6, 12, or 24 months. Longer tenures come with discounts — 6 months saves 5%, 12 months saves 10%, and 24 months saves 15% on the monthly price.'
      },
      {
        q: 'Can I extend my rental tenure?',
        a: 'Yes! You can extend your tenure anytime from your Subscriptions dashboard. Your monthly rate remains the same as when you signed up.'
      },
      {
        q: 'Can I close my rental early?',
        a: 'You can return products before the tenure ends. An early closure fee of 1 month\'s rent applies. After 6 months, no closure fee is charged.'
      },
      {
        q: 'Is there a monthly or one-time payment option?',
        a: 'Both! One-time payment means you pay the full tenure amount upfront. Recurring auto-pay deducts monthly and saves you an additional 10%.'
      },
    ]
  },
  {
    title: 'Delivery & Maintenance',
    faqs: [
      {
        q: 'Is delivery and installation free?',
        a: 'Yes. We offer completely free delivery and professional installation for all products. Typical delivery takes 2–4 working days.'
      },
      {
        q: 'What if a product breaks down?',
        a: 'Raise a maintenance request from your account. Our technicians will fix or replace the product free of charge within 48 hours.'
      },
      {
        q: 'Can I relocate with my rented products?',
        a: 'Absolutely! We offer free relocation within the same city. For inter-city moves, a nominal charge applies — contact support for details.'
      },
    ]
  },
  {
    title: 'Damage & Returns',
    faqs: [
      {
        q: 'What happens if I damage a product?',
        a: 'Minor accidental damage is covered free. For major damage, a repair cost assessment will be shared before charging. Intentional damage is charged at full replacement cost.'
      },
      {
        q: 'How do I return a product at end of tenure?',
        a: 'Schedule a free pickup from your account dashboard. Our team will collect the product from your address at a convenient time.'
      },
      {
        q: 'What is the condition of rented products?',
        a: 'All products are quality-checked and rated Excellent, Very Good, or Good before delivery. You can see the condition grade on each product page.'
      },
    ]
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="font-medium text-gray-900 pr-4">{q}</span>
        {open ? <ChevronUp className="w-5 h-5 text-primary-600 flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />}
      </button>
      {open && (
        <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3 bg-gray-50">
          {a}
        </div>
      )}
    </div>
  );
}

export default function HelpPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="max-w-4xl mx-auto px-4 py-10"
    >
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Help Center</h1>
        <p className="text-gray-500">Everything you need to know about renting with RentYourNeeds</p>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
        {[
          { icon: MessageCircle, label: 'Live Chat', href: '#', color: 'bg-blue-50 text-blue-700' },
          { icon: Phone,         label: 'Call Us',   href: 'tel:+919876543210', color: 'bg-green-50 text-green-700' },
          { icon: Mail,          label: 'Email Us',  href: '/contact', color: 'bg-purple-50 text-purple-700' },
          { icon: FileCheck,     label: 'KYC Help',  href: '#kyc', color: 'bg-orange-50 text-orange-700' },
        ].map(({ icon: Icon, label, href, color }) => (
          <Link key={label} href={href}>
            <div className={`flex flex-col items-center gap-2 p-4 rounded-xl font-medium text-sm transition-all hover:scale-105 cursor-pointer ${color}`}>
              <Icon className="w-6 h-6" />
              {label}
            </div>
          </Link>
        ))}
      </div>

      {/* FAQ Sections */}
      <div className="space-y-8">
        {FAQ_SECTIONS.map(section => (
          <div key={section.title}>
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-primary-600 rounded-full" />
              {section.title}
            </h2>
            <div className="space-y-2">
              {section.faqs.map(faq => <FaqItem key={faq.q} q={faq.q} a={faq.a} />)}
            </div>
          </div>
        ))}
      </div>

      {/* Still need help */}
      <div className="mt-12 bg-primary-50 border border-primary-100 rounded-2xl p-6 text-center">
        <h3 className="font-bold text-gray-900 text-lg mb-2">Still have questions?</h3>
        <p className="text-gray-500 text-sm mb-4">Our support team is available Mon–Sat, 9am–7pm</p>
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <Link href="/contact">
            <button className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors">
              Contact Us
            </button>
          </Link>
          <button className="px-6 py-2.5 border border-primary-300 text-primary-700 hover:bg-primary-100 font-semibold rounded-lg transition-colors">
            Start Live Chat
          </button>
        </div>
      </div>
    </motion.div>
  );
}
