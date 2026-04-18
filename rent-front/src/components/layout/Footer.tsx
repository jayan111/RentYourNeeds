import Link from 'next/link';
import { MapPin, Phone, Mail, Facebook, Instagram, Twitter, Youtube } from 'lucide-react';

const FURNITURE_LINKS = [
  { label: 'Sofa on Rent', href: '/products?search=sofa' },
  { label: 'Bed on Rent', href: '/products?search=bed' },
  { label: 'Wardrobe on Rent', href: '/products?search=wardrobe' },
  { label: 'Study Table on Rent', href: '/products?search=study+table' },
  { label: 'Mattress on Rent', href: '/products?search=mattress' },
];

const APPLIANCE_LINKS = [
  { label: 'Refrigerator on Rent', href: '/products?search=refrigerator' },
  { label: 'Washing Machine on Rent', href: '/products?search=washing+machine' },
  { label: 'AC on Rent', href: '/products?search=ac' },
  { label: 'TV on Rent', href: '/products?search=tv' },
  { label: 'Water Purifier on Rent', href: '/products?search=water+purifier' },
];

const COMPANY_LINKS = [
  { label: 'About Us', href: '/about' },
  { label: 'How It Works', href: '/#how-it-works' },
  { label: 'Packages', href: '/products?category=packages' },
  { label: 'Careers', href: '/about' },
];

const SUPPORT_LINKS = [
  { label: 'Help Center', href: '/help' },
  { label: 'Contact Us', href: '/contact' },
  { label: 'Returns & Refunds', href: '/returns' },
  { label: 'Track Order', href: '/orders' },
];

const POLICY_LINKS = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
  { label: 'Shipping Policy', href: '/returns' },
];

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      {/* Main footer grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="text-2xl font-black text-white">
              RentYour<span className="text-primary-400">Needs</span>
            </Link>
            <p className="text-gray-400 text-sm mt-3 leading-relaxed">
              Premium rental marketplace. Furniture & appliances delivered to your doorstep.
            </p>
            <div className="mt-4 space-y-2 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary-400 flex-shrink-0" />
                <span>Ahmedabad, Gujarat, India</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary-400 flex-shrink-0" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary-400 flex-shrink-0" />
                <span>hello@rentyourneeds.com</span>
              </div>
            </div>
            {/* Social */}
            <div className="flex gap-3 mt-5">
              {[
                { icon: Facebook, href: '#' },
                { icon: Instagram, href: '#' },
                { icon: Twitter, href: '#' },
                { icon: Youtube, href: '#' },
              ].map(({ icon: Icon, href }) => (
                <Link key={href + Icon.name} href={href} className="w-8 h-8 bg-gray-800 hover:bg-primary-600 rounded-lg flex items-center justify-center transition-colors">
                  <Icon className="w-4 h-4" />
                </Link>
              ))}
            </div>
          </div>

          {/* Furniture */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Furniture</h4>
            <ul className="space-y-2.5">
              {FURNITURE_LINKS.map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className="text-gray-400 hover:text-white text-sm transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Appliances */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Appliances</h4>
            <ul className="space-y-2.5">
              {APPLIANCE_LINKS.map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className="text-gray-400 hover:text-white text-sm transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Company</h4>
            <ul className="space-y-2.5">
              {COMPANY_LINKS.map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className="text-gray-400 hover:text-white text-sm transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
            <h4 className="font-semibold text-white mt-6 mb-4 text-sm uppercase tracking-wider">Policies</h4>
            <ul className="space-y-2.5">
              {POLICY_LINKS.map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className="text-gray-400 hover:text-white text-sm transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Need Help?</h4>
            <ul className="space-y-2.5 mb-6">
              {SUPPORT_LINKS.map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className="text-gray-400 hover:text-white text-sm transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
            {/* App store badges placeholder */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 transition-colors rounded-lg px-3 py-2 cursor-pointer">
                <div className="text-2xl">🍎</div>
                <div>
                  <p className="text-[10px] text-gray-400">Download on the</p>
                  <p className="text-xs font-semibold">App Store</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 transition-colors rounded-lg px-3 py-2 cursor-pointer">
                <div className="text-2xl">▶️</div>
                <div>
                  <p className="text-[10px] text-gray-400">Get it on</p>
                  <p className="text-xs font-semibold">Google Play</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-gray-500">
          <p>© {new Date().getFullYear()} RentYourNeeds. All rights reserved.</p>
          <p>Made with ❤️ in India</p>
        </div>
      </div>
    </footer>
  );
}
