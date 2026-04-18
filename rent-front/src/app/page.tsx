import { Hero } from '@/components/layout/Hero';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { TrendingProducts } from '@/components/home/TrendingProducts';
import { PackageBanner } from '@/components/home/PackageBanner';
import { HowItWorks } from '@/components/home/HowItWorks';
import { HouseShowcase } from '@/components/home/HouseShowcase';
import { CustomerReviews } from '@/components/home/CustomerReviews';

export default function HomePage() {
  return (
    <div>
      <Hero />
      <CategoryGrid />
      <TrendingProducts />
      <PackageBanner />
      <HowItWorks />
      <HouseShowcase />
      <CustomerReviews />
    </div>
  );
}
