
import { BarChart, Bar, ResponsiveContainer, XAxis, Tooltip, CartesianGrid } from "recharts";

interface AgendamentosSemanaBarChartProps {
  data: { dia: string; agendamentos: number }[];
}

const COLORS = [
  "#a78bfa", // purple-400
  "#818cf8", // indigo-400
  "#c7d2fe", // indigo-200
  "#6366f1", // indigo-500
  "#8b5cf6", // purple-500
  "#c4b5fd", // purple-300
  "#60a5fa", // blue-400
];

const AgendamentosSemanaBarChart = ({ data }: AgendamentosSemanaBarChartProps) => {
  return (
    <div className="w-full h-40">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey="dia"
            tick={{ fontSize: 12, fill: "#6366f1" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{ background: "#ede9fe", border: "none", color: "#3730a3", borderRadius: 8, fontSize: 14 }}
            cursor={{ fill: "#818cf815" }}
            labelStyle={{ color: "#3730a3" }}
          />
          <Bar dataKey="agendamentos" radius={[6, 6, 0, 0]}>
            {data.map((entry, index) => (
              <rect
                key={index}
                x={0}
                y={0}
                width={0}
                height={0}
                style={{ display: "none" }}
              />
            ))}
            {/* O recharts vai desenhar as barras, não é necessário desenhar manualmente os rects */}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AgendamentosSemanaBarChart;
