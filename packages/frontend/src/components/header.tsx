"use client";

import { Bell, Menu } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Sidebar from "./sidebar";
import { useAuth } from "@/contexts/auth-context";
import Link from "next/link";
import { User, LogOut, Settings } from "lucide-react";

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="bg-background border-b border-border py-3 px-4 md:px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <button className="p-2 md:hidden text-foreground">
                <Menu size={20} />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <Sidebar />
            </SheetContent>
          </Sheet>

          <div className="md:hidden">
            <h2 className="text-primaryGreen font-bold text-xl">AgroScope</h2>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="relative p-2 rounded-full hover:bg-muted transition-colors">
            <Bell size={20} className="text-foreground" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-primaryGreen rounded-full"></span>
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={user?.avatar || "https://placehold.co/32x32"}
                    alt="Foto do usuário"
                  />
                  <AvatarFallback className="bg-primaryGreen text-white">
                    {user?.name
                      ?.split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .toUpperCase() || "AG"}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left hidden md:block">
                  <p className="text-sm font-medium text-foreground">
                    {user?.name || "Usuário"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {user?.role || "Agrônomo"}
                  </p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Configurações</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
