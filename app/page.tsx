import HeroSection from "@/components/landing/hero";
import FeaturesSection from "@/components/landing/featureSection";
import CTASection from "@/components/landing/ctaSection";
import Footer from "@/components/landing/footer";

export default function HomePage() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col">
      <HeroSection />
      <FeaturesSection/>
      <CTASection />
      <Footer />
    </div>
  );
}