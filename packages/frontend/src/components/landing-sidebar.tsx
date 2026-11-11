"use client";

import Link from "next/link";
import {
  Home,
  Info,
  Leaf,
  HelpCircle,
  FileText,
  LogIn,
  UserPlus,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { SheetClose } from "../components/ui/sheet";
import { useAuthModal } from "../contexts/auth-modal-context";

// Todos os itens apontam para páginas públicas existentes: nenhuma rota vazia ou
// que dependa de login (Configurações, Planos e Análises ficam no menu interno).
const NAV_ITEMS = [
  { href: "/", label: "Início", icon: Home },
  { href: "/#como-funciona", label: "Como funciona", icon: Leaf },
  { href: "/sobre", label: "Sobre Nós", icon: Info },
  { href: "/ajuda", label: "Ajuda", icon: HelpCircle },
  { href: "/termos", label: "Termos e Privacidade", icon: FileText },
];

const itemClass =
  "flex items-center gap-3 px-3 py-2 rounded-md text-foreground hover:bg-muted transition-colors";

export default function LandingSidebar() {
  const { openLogin, openSignup } = useAuthModal();

  return (
    <div className="w-64 bg-background border-r border-border h-full flex flex-col">
      <div className="p-4 border-b border-border">
        <h2 className="text-primaryGreen font-bold text-xl">AgroScope</h2>
        <p className="text-sm text-muted-foreground">Diagnóstico de Plantas</p>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
            <li key={href}>
              <SheetClose asChild>
                <Link href={href} className={itemClass}>
                  <Icon size={18} />
                  <span>{label}</span>
                </Link>
              </SheetClose>
            </li>
          ))}
        </ul>

        <div className="mt-6 mb-4">
          <SheetClose asChild>
            <Button
              onClick={openSignup}
              className="w-full bg-primaryGreen hover:bg-lightGreen text-white py-6 flex items-center justify-center gap-2"
            >
              <UserPlus size={20} />
              <span className="font-medium text-base">Criar Conta Grátis</span>
            </Button>
          </SheetClose>
        </div>
      </nav>

      <div className="p-4 border-t border-border">
        <SheetClose asChild>
          <button onClick={openLogin} className={`${itemClass} w-full`}>
            <LogIn size={18} />
            <span>Entrar</span>
          </button>
        </SheetClose>
      </div>
    </div>
  );
}
