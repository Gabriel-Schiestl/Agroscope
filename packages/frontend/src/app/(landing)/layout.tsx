import type React from "react";
import LandingHeader from "@/components/landing-header";
import LandingMobileNav from "@/components/landing-mobile-nav";
import AuthModals from "@/components/auth-modals";

export default function LandingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col min-h-screen w-full">
      <LandingHeader />
      <main className="flex-1 overflow-auto">{children}</main>
      <div className="md:hidden">
        <LandingMobileNav />
      </div>
      <AuthModals />
    </div>
  );
}
