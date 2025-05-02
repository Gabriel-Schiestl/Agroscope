"use client";

import PublicRoutes from "../../components/PublicRoutes";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PublicRoutes>{children}</PublicRoutes>;
}
