import Link from 'next/link';
import { Laptop, Home, Camera, Car } from 'lucide-react';

const categories = [
  { name: 'Electronics', icon: Laptop, href: '/products?category=electronics' },
  { name: 'Furniture', icon: Home, href: '/products?category=furniture' },
  { name: 'Photography', icon: Camera, href: '/products?category=photography' },
  { name: 'Vehicles', icon: Car, href: '/products?category=vehicles' },
];

export function Categories() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h2 className="text-3xl font-bold text-center mb-12">Popular Categories</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <Link
              key={category.name}
              href={category.href}
              className="card text-center hover:shadow-lg transition-shadow group"
            >
              <Icon className="w-12 h-12 mx-auto mb-4 text-primary-600 group-hover:text-primary-700" />
              <h3 className="font-semibold text-lg">{category.name}</h3>
            </Link>
          );
        })}
      </div>
    </section>
  );
}