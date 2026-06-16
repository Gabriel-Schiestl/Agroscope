"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, Settings } from "lucide-react";
import { useAuth } from "../contexts/auth-context";

export default function MobileNav() {
  const { logout } = useAuth();
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(`${path}/`);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#19241b]  py-2 px-4 z-10">
      <div className="flex justify-between items-center text-white">
        <Link href="/" className="flex flex-col items-center">
          <Home
            size={20}
            className=
             "text-primaryGreen"
            
          />
          <span className="text-xs mt-1">Início</span>
        </Link>
        <Link href="/clients" className="flex flex-col items-center">
          <Users
            size={20}
            className=
             "text-primaryGreen"
          />
          <span className="text-xs mt-1">Análise</span>
        </Link>
        <Link href="/settings" className="flex flex-col items-center">
          <Settings
            size={20}
           className=
             "text-primaryGreen"
            
          />
          <span className="text-xs mt-1">Config</span>
        </Link>
      </div>
    </div>
  );
}
