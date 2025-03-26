"use client";

import {
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

const dataLine = [
  { day: "Seg", análises: 10 },
  { day: "Ter", análises: 20 },
  { day: "Qua", análises: 15 },
  { day: "Qui", análises: 25 },
  { day: "Sex", análises: 30 },
  { day: "Sáb", análises: 40 },
  { day: "Dom", análises: 35 },
];

export function CustomLineChart() {
  return (
    <div className="p-4 bg-white rounded-2xl shadow-md">
      <h3 className="text-lg font-semibold mb-4 text-gray-700">
        Tendência de Diagnósticos
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={dataLine}>
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="análises"
            stroke="#15803d"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
