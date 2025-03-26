"use client";
import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="w-full flex justify-between items-center px-6 py-3 shadow-md bg-primaryGreen">
      {/* Logo no canto esquerdo */}
      <div className="flex items-center">
        <Image
          src="/assets/logo.png"
          alt="Logo"
          width={42}
          height={42}
          className="h-10 w-10"
        />
        <span className="ml-2 text-white text-lg font-semibold">agroscope</span>
      </div>

      {/* Botões no canto direito */}
      <div className="flex items-center space-x-4">
        <Link href="/login" className="text-white hover:underline">
          Entrar
        </Link>
        <Link
          href="/signin"
          className="border border-white text-white px-3 py-1 rounded-md hover:bg-white hover:text-[#5A9134] transition"
        >
          Cadastrar
        </Link>
      </div>
    </nav>
  );
}
