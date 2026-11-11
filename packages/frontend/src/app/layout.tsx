import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./globals.css";
import { AuthProvider } from "../contexts/auth-context";
import { AuthModalProvider } from "../contexts/auth-modal-context";
import { ThemeProvider } from "../components/theme-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "AgroScope - Diagnóstico de Doenças em Plantas",
  description:
    "Diagnóstico de doenças em folhas de café, soja, tomate, trigo e milho por foto, com inteligência artificial, para o pequeno produtor rural.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${inter.variable} font-inter bg-lightGray`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <AuthModalProvider>{children}</AuthModalProvider>
          </AuthProvider>
          <ToastContainer position="top-right" autoClose={4000} />
        </ThemeProvider>
      </body>
    </html>
  );
}
