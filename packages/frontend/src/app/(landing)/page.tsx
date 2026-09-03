'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/auth-context';
import Footer from './components/footer';
import HowItWorks from './components/how-it-works';
import FirstHero from './components/landing-first-hero';
import WhyChoose from './components/why-choose';

export default function LandingPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/analytics');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || isAuthenticated) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-full pb-16 md:pb-0 bg-gradient-to-r from-[#3c493b] via-[#253528] to-[#19601f]">
      <FirstHero />

      <WhyChoose />

      <HowItWorks />

      <Footer />
    </div>
  );
}
