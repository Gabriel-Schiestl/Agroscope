"use client";

import { Pie, PieChart, Cell, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = ["#16a34a", "#22c55e", "#4ade80"]; // Tons diferentes de verde

const dataPie = [
  { name: "Ferrugem", value: 40 },
  { name: "Cercosporiose", value: 35 },
  { name: "Saudável", value: 25 },
];

export function CustomPieChart() {
  return (
    <div className="p-4 bg-white rounded-2xl shadow-md">
      <h3 className="text-lg font-semibold mb-4 text-gray-700">
        Distribuição das Doenças
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={dataPie}
            cx="50%"
            cy="50%"
            outerRadius={100}
            fill="#22c55e"
            dataKey="value"
          >
            {dataPie.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
