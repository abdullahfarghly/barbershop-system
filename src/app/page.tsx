import { HeroSection } from "@/components/home/hero-section";
import { QueueOverviewSection } from "@/components/home/queue-overview-section";
import { BookingCtaSection } from "@/components/home/booking-cta-section";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <QueueOverviewSection />
      <BookingCtaSection />
    </>
  );
}
