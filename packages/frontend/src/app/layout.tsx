import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./globals.css";
import { AuthProvider } from "../contexts/auth-context";
import { AuthModalProvider } from "../contexts/auth-modal-context";

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
        <AuthProvider>
          <AuthModalProvider>{children}</AuthModalProvider>
        </AuthProvider>
        <ToastContainer position="top-right" autoClose={4000} />
      </body>
    </html>
  );
}
