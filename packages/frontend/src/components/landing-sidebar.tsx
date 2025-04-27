"use client";

import Link from "next/link";
import {
  Home,
  Users,
  Map,
  BarChart2,
  Calendar,
  HelpCircle,
  LogIn,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthModal } from "@/contexts/auth-modal-context";

export default function LandingSidebar() {
  const { openLogin } = useAuthModal();

  return (
    <div className="w-64 bg-white border-r border-mediumGray/20 h-full flex flex-col">
      <div className="p-4 border-b border-mediumGray/20">
        <h2 className="text-primaryGreen font-bold text-xl">AgroScope</h2>
        <p className="text-sm text-mediumGray">Gestão Agronômica</p>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          <li>
            <Link
              href="/"
              className="flex items-center gap-3 px-3 py-2 rounded-md bg-lightGreen text-white hover:bg-primaryGreen transition-colors"
            >
              <Home size={18} />
              <span>Início</span>
            </Link>
          </li>
          <li>
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-3 py-2 rounded-md text-darkGray hover:bg-lightGray transition-colors"
            >
              <BarChart2 size={18} />
              <span>Dashboard</span>
            </Link>
          </li>
          <li>
            <Link
              href="/planos"
              className="flex items-center gap-3 px-3 py-2 rounded-md text-darkGray hover:bg-lightGray transition-colors"
            >
              <Map size={18} />
              <span>Planos</span>
            </Link>
          </li>
          <li>
            <Link
              href="/sobre"
              className="flex items-center gap-3 px-3 py-2 rounded-md text-darkGray hover:bg-lightGray transition-colors"
            >
              <Users size={18} />
              <span>Sobre Nós</span>
            </Link>
          </li>
          <li>
            <Link
              href="/contato"
              className="flex items-center gap-3 px-3 py-2 rounded-md text-darkGray hover:bg-lightGray transition-colors"
            >
              <Calendar size={18} />
              <span>Contato</span>
            </Link>
          </li>
        </ul>

        <div className="mt-6 mb-4">
          <Link href="/settings">
            <Button className="w-full bg-primaryGreen hover:bg-lightGreen text-white py-6 flex items-center justify-center gap-2">
              <Settings size={20} />
              <span className="font-medium text-base">CONFIGURAÇÕES</span>
            </Button>
          </Link>
        </div>
      </nav>

      <div className="p-4 border-t border-mediumGray/20">
        <ul className="space-y-1">
          <li>
            <Link
              href="/ajuda"
              className="flex items-center gap-3 px-3 py-2 rounded-md text-darkGray hover:bg-lightGray transition-colors"
            >
              <HelpCircle size={18} />
              <span>Ajuda</span>
            </Link>
          </li>
          <li>
            <button
              onClick={openLogin}
              className="flex w-full items-center gap-3 px-3 py-2 rounded-md text-darkGray hover:bg-lightGray transition-colors"
            >
              <LogIn size={18} />
              <span>Entrar</span>
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}
