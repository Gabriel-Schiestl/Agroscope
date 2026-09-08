"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart2,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../contexts/auth-context";
import { cn } from "../lib/utils";

const COLLAPSED_STORAGE_KEY = "agroscope-sidebar-collapsed";

const NAV_ITEMS = [
  { href: "/analytics", label: "Análises", icon: BarChart2 },
  { href: "/settings", label: "Configurações", icon: Settings },
];

interface SidebarProps {
  /** Force the expanded layout and hide the collapse toggle — used inside the mobile Sheet, which has its own fixed width. */
  forceExpanded?: boolean;
}

export default function Sidebar({ forceExpanded = false }: SidebarProps) {
  const { logout } = useAuth();
  const pathname = usePathname();
  const [storedCollapsed, setStoredCollapsed] = useState(false);
  const collapsed = !forceExpanded && storedCollapsed;

  useEffect(() => {
    setStoredCollapsed(localStorage.getItem(COLLAPSED_STORAGE_KEY) === "1");
  }, []);

  const toggleCollapsed = () => {
    setStoredCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(COLLAPSED_STORAGE_KEY, next ? "1" : "0");
      return next;
    });
  };

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(`${path}/`);
  };

  return (
    <div
      className={cn(
        "bg-background border-r border-border h-full flex flex-col transition-[width] duration-200",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <div
        className={cn(
          "border-b border-border",
          collapsed ? "p-3 flex flex-col items-center gap-2" : "p-4 flex items-start justify-between gap-2"
        )}
      >
        {collapsed ? (
          <span className="text-primaryGreen font-bold text-xl leading-none" title="AgroScope">
            A
          </span>
        ) : (
          <div className="min-w-0">
            <h2 className="text-primaryGreen font-bold text-xl">AgroScope</h2>
            <p className="text-sm text-muted-foreground">Diagnóstico de Plantas</p>
          </div>
        )}
        {!forceExpanded && (
          <button
            onClick={toggleCollapsed}
            className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors flex-shrink-0"
            title={collapsed ? "Expandir menu" : "Recolher menu"}
            aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        )}
      </div>

      <nav className={cn("flex-1", collapsed ? "p-2" : "p-4")}>
        <ul className="space-y-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
            <li key={href}>
              <Link
                href={href}
                title={collapsed ? label : undefined}
                className={cn(
                  "flex items-center gap-3 py-2 rounded-md transition-colors",
                  collapsed ? "justify-center px-2" : "px-3",
                  isActive(href)
                    ? "bg-primaryGreen/10 text-primaryGreen font-medium"
                    : "text-foreground hover:bg-muted"
                )}
              >
                <Icon size={18} />
                {!collapsed && <span>{label}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className={cn("border-t border-border", collapsed ? "p-2" : "p-4")}>
        <ul className="space-y-1">
          <li>
            <button
              onClick={logout}
              title={collapsed ? "Sair" : undefined}
              className={cn(
                "flex w-full items-center gap-3 py-2 rounded-md text-foreground hover:bg-muted transition-colors",
                collapsed ? "justify-center px-2" : "px-3"
              )}
            >
              <LogOut size={18} />
              {!collapsed && <span>Sair</span>}
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}
