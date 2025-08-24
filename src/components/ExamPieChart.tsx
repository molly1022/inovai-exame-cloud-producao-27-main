
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface ExamPieChartProps {
  data: Record<string, number>;
}

const COLORS = [
  "#3B82F6",
  "#22C55E",
  "#A78BFA",
  "#EAB308",
  "#F87171",
  "#F59E42",
  "#14B8A6",
  "#6366F1",
  "#F472B6"
];

const ExamPieChart = ({ data }: ExamPieChartProps) => {
  const chartData = Object.entries(data).map(([tipo, qtd], idx) => ({
    name: tipo,
    value: qtd,
    color: COLORS[idx % COLORS.length]
  }));

  if (!chartData.length) {
    return <p className="text-center text-gray-400 py-8">Nenhum exame encontrado no período</p>;
  }

  return (
    <div className="w-full flex flex-col items-center">
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            dataKey="value"
            data={chartData}
            cx="50%"
            cy="50%"
            outerRadius={80}
            innerRadius={40}
            fill="#8884d8"
            label
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap gap-4 justify-center mt-2">
        {chartData.map(item => (
          <div key={item.name} className="flex items-center text-sm gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}/>
            {item.name}: <span className="font-semibold">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
export default ExamPieChart;
