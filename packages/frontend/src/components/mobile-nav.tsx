"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart2, Settings } from "lucide-react";

export default function MobileNav() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(`${path}/`);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border py-2 px-4 z-10">
      <div className="flex justify-around items-center">
        <Link href="/analytics" className="flex flex-col items-center">
          <BarChart2
            size={20}
            className={
              isActive("/analytics") ? "text-primaryGreen" : "text-foreground"
            }
          />
          <span className="text-xs mt-1">Análises</span>
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
