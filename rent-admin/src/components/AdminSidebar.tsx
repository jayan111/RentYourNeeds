'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Package,
  Archive,
  CreditCard,
  Settings,
  BarChart3,
  Wrench,
  FileText,
  AlertTriangle,
  User
} from 'lucide-react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
  { icon: Package, label: 'Products', href: '/products' },
  { icon: Users, label: 'Users', href: '/users' },
  { icon: Archive, label: 'Inventory', href: '/inventory' },
  { icon: FileText, label: 'Orders', href: '/orders' },
  { icon: CreditCard, label: 'Subscriptions', href: '/subscriptions' },
  { icon: Wrench, label: 'Maintenance', href: '/maintenance' },
  { icon: AlertTriangle, label: 'Damages', href: '/damages' },
  { icon: BarChart3, label: 'Analytics', href: '/analytics' },
  { icon: Settings, label: 'Settings', href: '/settings' },
  { icon: User, label: 'Profile', href: '/profile' }
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <motion.div
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      className="w-64 bg-white shadow-lg border-r border-gray-200"
    >
      <div className="p-6">
        <h1 className="text-xl font-bold text-gray-900">RentYourNeeds</h1>
        <p className="text-sm text-gray-500">Admin Panel</p>
      </div>
      
      <nav className="mt-6">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                href={item.href}
                className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.label}
              </Link>
            </motion.div>
          );
        })}
      </nav>
    </motion.div>
  );
}