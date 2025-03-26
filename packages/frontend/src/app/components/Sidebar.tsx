"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FaChartPie,
  FaCogs,
  FaBuilding,
  FaSearch,
  FaSignOutAlt,
} from "react-icons/fa";

export default function Sidebar() {
  const router = useRouter();

  const handleLogout = () => {
    router.push("/login"); // Redireciona para a tela de login
  };

  return (
    <div className="w-64 bg-white shadow-lg min-h-screen flex flex-col justify-between p-4">
      <div>
        <h2 className="text-xl font-bold text-green-700 mb-8">AgroScope</h2>
        <nav className="flex flex-col space-y-4">
          <Link
            href="/analyze"
            className="flex items-center gap-2 text-gray-700 hover:text-green-600 transition"
          >
            <FaSearch /> Analyze
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-gray-700 hover:text-green-600 transition"
          >
            <FaChartPie /> Dashboard
          </Link>
          <Link
            href="/api"
            className="flex items-center gap-2 text-gray-700 hover:text-green-600 transition"
          >
            <FaCogs /> API
          </Link>
          <Link
            href="/company"
            className="flex items-center gap-2 text-gray-700 hover:text-green-600 transition"
          >
            <FaBuilding /> Company
          </Link>
        </nav>
      </div>

      {/* Perfil do Usuário */}
      <div className="flex items-center justify-between p-3 border-t">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center bg-green-600 text-white rounded-full text-sm font-bold">
            A
          </div>
          <span className="text-gray-700 font-medium">Admin</span>
        </div>
        <button
          onClick={handleLogout}
          className="text-green-700 hover:text-red-700 transition"
        >
          <FaSignOutAlt size={18} />
        </button>
      </div>
    </div>
  );
}
