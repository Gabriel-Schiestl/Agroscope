"use client";

import { CustomPieChart } from "../../components/ui/charts/PieChart";
import { CustomBarChart } from "../../components/ui/charts/BarChart";
import { CustomLineChart } from "../../components/ui/charts/LineChart";
import Sidebar from "../../components/Sidebar";

export default function DashboardPage() {
  return (
    <div className="flex">
      {/* Sidebar */}
      <Sidebar />
      {/* Conteúdo do Dashboard */}
      <div className="p-6 flex-1">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CustomPieChart />
          <CustomBarChart />
          <CustomLineChart />
        </div>
      </div>
    </div>
  );
}
