"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart2, Settings, HelpCircle, LogOut, History } from "lucide-react";
import { useAuth } from "../contexts/auth-context";

export default function Sidebar() {
  const { logout } = useAuth();
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(`${path}/`);
  };

  return (
    <div className="w-64 bg-[#19241b] border-r border-border h-full flex flex-col">
      <div className="p-4 border-b border-border">
        <h2 className="text-primaryGreen font-bold text-xl">AgroScope</h2>
        <p className="text-sm text-muted-foreground">Gestão Agronômica</p>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          <li>
            <Link
              href="/analytics"
              className={`flex text-white items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                isActive("/analytics")
                  ? "bg-primaryGreen/10 font-medium"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              <BarChart2 size={18} />
              <span>Análises</span>
            </Link>
          </li>
          <li>
            <Link
              href="/history"
              className={`flex text-white items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                isActive("/history")
                  ? "bg-primaryGreen/10 font-medium"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              <History size={18} />
              <span>Histórico</span>
            </Link>
          </li>
        </ul>
      </nav>

      <div className="p-4 border-t border-border">
        <ul className="space-y-1">
          <li>
            <Link
              href="/help"
              className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-white ${
                isActive("/help")
                  ? "bg-primaryGreen/10 font-medium"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              <HelpCircle size={18} />
              <span>Ajuda</span>
            </Link>
          </li>
          <li>
            <Link
              href="/settings"
              className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-white ${
                isActive("/settings")
                  ? "bg-primaryGreen/10 font-medium"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              <Settings size={18} />
              <span>Configurações</span>
            </Link>
          </li>
          <li>
            <button
              onClick={logout}
              className="flex w-full items-center gap-3 px-3 py-2 rounded-md text-white hover:bg-muted transition-colors"
            >
              <LogOut size={18} />
              <span>Sair</span>
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}
