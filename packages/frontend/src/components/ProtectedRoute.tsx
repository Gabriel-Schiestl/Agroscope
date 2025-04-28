"use client";

import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireEngineer?: boolean;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({
  children,
  requireEngineer = false,
  requireAdmin = false,
}: ProtectedRouteProps) {
  const { auth, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push("/login");
      } else if (requireEngineer && !auth?.isEngineer) {
        router.push("/");
      } else if (requireAdmin && !auth?.isAdmin) {
        router.push("/");
      }
    }
  }, [isLoading, isAuthenticated, auth, router, requireEngineer, requireAdmin]);

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  if (requireEngineer && !auth?.isEngineer) {
    return null;
  }

  if (requireAdmin && !auth?.isAdmin) {
    return null;
  }

  return <>{children}</>;
}
