import { Hero } from '@/components/layout/Hero';
import { OffersCarousel } from '@/components/home/OffersCarousel';
import { CustomerReviews } from '@/components/home/CustomerReviews';
import { HouseShowcase } from '@/components/home/HouseShowcase';
import { PageTransition, StaggerContainer, FadeInUp } from '@/components/ui/MotionComponents';

export default function HomePage() {
  return (
    <PageTransition>
      <StaggerContainer className="space-y-16">
        <FadeInUp>
          <Hero />
        </FadeInUp>
        <FadeInUp delay={0.2}>
          <OffersCarousel />
        </FadeInUp>
        <FadeInUp delay={0.4}>
          <HouseShowcase />
        </FadeInUp>
        <FadeInUp delay={0.6}>
          <CustomerReviews />
        </FadeInUp>
      </StaggerContainer>
    </PageTransition>
  );
}