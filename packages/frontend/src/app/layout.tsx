import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/auth-context";
import { AuthModalProvider } from "@/contexts/auth-modal-context";
import "leaflet/dist/leaflet.css";
import CSRFInitializer from "./components/CSRFInitializer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "AgroScope - Gestão Agronômica",
  description: "Plataforma de gestão para agrônomos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} font-inter bg-lightGray`}>
        <CSRFInitializer />
        <AuthProvider>
          <AuthModalProvider>{children}</AuthModalProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
