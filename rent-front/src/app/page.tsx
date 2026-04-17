import { Hero } from '@/components/layout/Hero';
import { OffersCarousel } from '@/components/home/OffersCarousel';
import { CustomerReviews } from '@/components/home/CustomerReviews';
import { HouseShowcase } from '@/components/home/HouseShowcase';

export default function HomePage() {
  return (
    <div className="space-y-16">
      <Hero />
      <OffersCarousel />
      <HouseShowcase />
      <CustomerReviews />
    </div>
  );
}