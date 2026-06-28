"use client";

import { Bell, Menu } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "../components/ui/sheet";
import Sidebar from "./sidebar";
import { useAuth } from "../contexts/auth-context";
import Link from "next/link";
import { User, LogOut, Settings } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Header() {
  const { auth, logout } = useAuth();

  return (
    <header className="bg-[#19241b] border-b border-mediumGray/20 py-3 px-4 md:px-6">
      <div className="flex items-center justify-between max-w-[1400px] mx-auto w-full">
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <button className="p-2 md:hidden text-primaryGreen">
                <Menu size={20} />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64 text-white">
              <Sidebar />
            </SheetContent>
          </Sheet>

          <Link href="/">
            <div>
              <h2 className="text-[#4dae50] font-bold text-xl pr-3">
                AgroScope
              </h2>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <button className="relative p-2 rounded-full] hover:bg-[#354a35] transition-colors">
            <Bell size={20} className="text-white" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-primaryGreen rounded-full"></span>
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={"https://placehold.co/32x32"}
                    alt="Foto do usuário"
                  />
                  <AvatarFallback className="bg-primaryGreen text-white">
                    {auth?.name
                      ?.split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .toUpperCase() || "AG"}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left hidden md:block">
                  <p className="text-sm font-medium text-primaryGreen">
                    {auth?.name || "Usuário"}
                  </p>
                  <p className="text-xs text-muted-foreground">{"Agrônomo"}</p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 bg-[#19241b] text-white border"
            >
              <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/settings#account">
                  <User className="mr-2 h-4 w-4" />
                  <span>Perfil</span>
                </Link>
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
