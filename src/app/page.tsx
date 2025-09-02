"use client";
import { WeddingPlannerWrapper } from "@/component/table-charts/wedding-planner";
import { SiteFooter } from "@/components/custom/common/site-footer";
import { SiteHeader } from "@/components/custom/common/site-header";
import { BenefitsSection } from "@/components/custom/home/BenefitsSection";
import { CallToActionSection } from "@/components/custom/home/call-to-action-sections";
import { FAQSection } from "@/components/custom/home/faq-section";
import { FeaturesSection } from "@/components/custom/home/features-sections";
import { HeroSection } from "@/components/custom/home/hero-sections";
import { HowItWorksSection } from "@/components/custom/home/how-it-work-sections";
import { PricingSection } from "@/components/custom/home/Price-section";
import { TestimonialsSection } from "@/components/custom/home/testimonials-section";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col  ">
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <CallToActionSection />
        <BenefitsSection />
        <PricingSection />
        <TestimonialsSection />
        <FAQSection />
      </main>
    </div>
  );
}
