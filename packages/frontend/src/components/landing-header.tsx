"use client";

import { Menu } from "lucide-react";
import { Button } from "../components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "../components/ui/sheet";
import { useAuthModal } from "../contexts/auth-modal-context";
import LandingSidebar from "./landing-sidebar";
import Link from "next/link";

export default function LandingHeader() {
  const { openLogin, openSignup } = useAuthModal();

  return (
    <header className="bg-[#19241b] border-b border-mediumGray/20 py-[14px] px-4 md:px-6 fixed top-0 left-0 z-50 w-full">
      <div className="flex items-center justify-between max-w-[1400px] mx-auto w-full">
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <button className="p-2 md:hidden text-primaryGreen">
                <Menu size={20} />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <LandingSidebar />
            </SheetContent>
          </Sheet>

          <Link href="/analytics">
            <div>
              <h2 className="text-[#4dae50] font-bold text-xl">AgroScope</h2>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="hidden md:flex"
            onClick={openLogin}
          >
            Entrar
          </Button>

          <Button
            className="bg-primaryGreen hover:bg-[#334f36]"
            size="sm"
            onClick={openSignup}
          >
            Criar Conta
          </Button>
        </div>
      </div>
    </header>
  );
}
