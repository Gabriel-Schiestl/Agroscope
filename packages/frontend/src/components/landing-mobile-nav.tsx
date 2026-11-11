"use client";

import Link from "next/link";
import { Home, HelpCircle, LogIn, User } from "lucide-react";
import { useAuthModal } from "../contexts/auth-modal-context";

export default function LandingMobileNav() {
  const { openLogin, openSignup } = useAuthModal();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border py-2 px-4 z-10">
      <div className="flex justify-between items-center">
        <Link href="/" className="flex flex-col items-center">
          <Home size={20} className="text-primaryGreen" />
          <span className="text-xs mt-1">Início</span>
        </Link>

        <Link href="/ajuda" className="flex flex-col items-center">
          <HelpCircle size={20} className="text-primaryGreen" />
          <span className="text-xs mt-1">Ajuda</span>
        </Link>

        <button className="flex flex-col items-center" onClick={openLogin}>
          <LogIn size={20} className="text-primaryGreen" />
          <span className="text-xs mt-1">Entrar</span>
        </button>

        <button className="flex flex-col items-center" onClick={openSignup}>
          <User size={20} className="text-primaryGreen" />
          <span className="text-xs mt-1">Cadastro</span>
        </button>
      </div>
    </div>
  );
}
