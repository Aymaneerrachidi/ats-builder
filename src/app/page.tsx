import { Cta } from "@/components/landing/cta";
import { Faq } from "@/components/landing/faq";
import { Features } from "@/components/landing/features";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Marquee } from "@/components/landing/marquee";
import { Pricing } from "@/components/landing/pricing";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";
import { TemplatesPreview } from "@/components/landing/templates-preview";
import { Testimonials } from "@/components/landing/testimonials";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <Marquee />
        <HowItWorks />
        <Features />
        <TemplatesPreview />
        <Pricing />
        <Testimonials />
        <Faq />
        <Cta />
      </main>
      <SiteFooter />
    </div>
  );
}
