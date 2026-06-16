"use client";

import Footer from "./::components/footer";
import HowItWorks from "./::components/how-it-works";
import FirstHero from "./::components/landing-first-hero";
import WhyChoose from "./::components/why-choose";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-full pb-12 md:pb-0 bg-gradient-to-r from-[#3c493b] via-[#253528] to-[#19601f]">
      <FirstHero />

      <WhyChoose />

      <HowItWorks />

      <Footer />
    </div>
  );
}
