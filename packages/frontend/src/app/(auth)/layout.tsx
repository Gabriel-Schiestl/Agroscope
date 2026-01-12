// "use client";

// import type React from "react";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import { useAuth } from "../../contexts/auth-context";

// export default function AuthLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   const { auth, isLoading } = useAuth();
//   const router = useRouter();
//   const [mounted, setMounted] = useState(false);

//   useEffect(() => {
//     setMounted(true);
//   }, []);

//   useEffect(() => {
//     if (mounted && !isLoading && auth) {
//       router.push("/dashboard");
//     }
//   }, [auth, isLoading, router, mounted]);

//   if (!mounted || isLoading) {
//     return (
//       <div className="flex h-screen items-center justify-center">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primaryGreen"></div>
//       </div>
//     );
//   }

//   return children;
// }
