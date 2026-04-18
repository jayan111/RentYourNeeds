'use client';

import { motion } from 'framer-motion';
import { Search, FileCheck, CreditCard, Truck } from 'lucide-react';

const STEPS = [
  {
    icon: Search,
    step: '01',
    title: 'Choose Your Product',
    desc: 'Browse from 500+ premium furniture & appliances. Filter by category, price, and tenure.',
    color: 'bg-blue-50 text-blue-600',
    border: 'border-blue-200',
  },
  {
    icon: FileCheck,
    step: '02',
    title: 'Select Tenure & KYC',
    desc: 'Pick 3 to 24 months. Complete a quick KYC with PAN + ID proof. Takes just 2 minutes.',
    color: 'bg-purple-50 text-purple-600',
    border: 'border-purple-200',
  },
  {
    icon: CreditCard,
    step: '03',
    title: 'Pay First Month',
    desc: 'Pay only the first month\'s rent. Zero security deposit, zero hidden charges.',
    color: 'bg-green-50 text-green-600',
    border: 'border-green-200',
  },
  {
    icon: Truck,
    step: '04',
    title: 'Free Delivery & Setup',
    desc: 'We deliver, install, and set up everything at your doorstep — completely free.',
    color: 'bg-orange-50 text-orange-600',
    border: 'border-orange-200',
  },
];

export function HowItWorks() {
  return (
    <section className="bg-gray-50 py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">How It Works</h2>
          <p className="text-gray-500">Get your products delivered in 4 simple steps</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map(({ icon: Icon, step, title, desc, color, border }, i) => (
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`bg-white rounded-2xl p-6 border-2 ${border} relative`}
            >
              <span className="absolute top-4 right-4 text-4xl font-black text-gray-100 select-none">{step}</span>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
