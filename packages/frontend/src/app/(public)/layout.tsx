"use client";

import PublicRoutes from "../../components/PublicRoutes";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PublicRoutes>{children}</PublicRoutes>;
}
