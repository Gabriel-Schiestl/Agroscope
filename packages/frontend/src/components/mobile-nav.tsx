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
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border py-2 px-4 z-10">
      <div className="flex justify-between items-center">
        <Link href="/dashboard" className="flex flex-col items-center">
          <Home
            size={20}
            className={
              isActive("/dashboard") ? "text-primaryGreen" : "text-foreground"
            }
          />
          <span className="text-xs mt-1">Dashboard</span>
        </Link>
        <Link href="/clients" className="flex flex-col items-center">
          <Users
            size={20}
            className={
              isActive("/clients") ? "text-primaryGreen" : "text-foreground"
            }
          />
          <span className="text-xs mt-1">Clientes</span>
        </Link>
        <Link href="/settings" className="flex flex-col items-center">
          <Settings
            size={20}
            className={
              isActive("/settings") ? "text-primaryGreen" : "text-foreground"
            }
          />
          <span className="text-xs mt-1">Config</span>
        </Link>
      </div>
    </div>
  );
}
