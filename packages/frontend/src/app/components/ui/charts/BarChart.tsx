"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

const dataBar = [
  { month: "Jan", análises: 30 },
  { month: "Fev", análises: 50 },
  { month: "Mar", análises: 40 },
  { month: "Abr", análises: 60 },
  { month: "Mai", análises: 80 },
];

export function CustomBarChart() {
  return (
    <div className="p-4 bg-white rounded-2xl shadow-md">
      <h3 className="text-lg font-semibold mb-4 text-gray-700">
        Análises por Mês
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={dataBar}>
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="análises" fill="#16a34a" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
