"use client";
import { getHeader } from "@/actions/fetch-action";
import { WeddingPlannerWrapper } from "@/component/table-charts/wedding-planner";
import { SiteFooter } from "@/components/custom/common/site-footer";
import { SiteHeader } from "@/components/custom/common/site-header";
import { BenefitsSection } from "@/components/custom/home/BenefitsSection";
import { CallToActionSection } from "@/components/custom/home/call-to-action-sections";
import { EventTypesSection } from "@/components/custom/home/EventTypesSection";
import { FAQSection } from "@/components/custom/home/faq-section";
import { FeaturesSection } from "@/components/custom/home/features-sections";
import { FinalCTASection } from "@/components/custom/home/FinalCTASection";
import { GuestBenefitsSection } from "@/components/custom/home/GuestBenefitsSection";
import { HeroSection } from "@/components/custom/home/hero-sections";
import HeroSlider from "@/components/custom/home/Hero-Slider";
import { HowItWorksSection } from "@/components/custom/home/how-it-work-sections";
import { PricingSection } from "@/components/custom/home/Price-section";
import { ReliabilitySupportSection } from "@/components/custom/home/ReliabilitySupportSection";
import { TestimonialsSection } from "@/components/custom/home/testimonials-section";
import { ValuePropositionSection } from "@/components/custom/home/ValuePropositionSection";
import { Metadata } from "next";
import TawkMessengerReact from "@tawk.to/tawk-messenger-react";
import Script from "next/script";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col  ">
      <Script
        id="chatwoot-widget"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
      (function(d,t) {
        var BASE_URL="https://ohsitapp-chatwoot.6ybj83.easypanel.host";
        var g=d.createElement(t),s=d.getElementsByTagName(t)[0];
        g.src=BASE_URL+"/packs/js/sdk.js";
        g.async = true;
        s.parentNode.insertBefore(g,s);
        g.onload=function(){
          window.chatwootSDK.run({
            websiteToken: 'eaeAYuk7x9HrPRrAHsVyMmh2',
            baseUrl: BASE_URL
          })
        }
      })(document,"script");
    `,
        }}
      />
      <main className="flex-1">
        {/*  <HeroSlider /> */}
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        {/*   <CallToActionSection /> */}
        <ValuePropositionSection />
        {/*   <BenefitsSection /> */}
        <GuestBenefitsSection />
        <ReliabilitySupportSection />
        <EventTypesSection />
        <FinalCTASection />

        <PricingSection />
        {/*   <TestimonialsSection /> */}
        <FAQSection />
      </main>
    </div>
  );
}
