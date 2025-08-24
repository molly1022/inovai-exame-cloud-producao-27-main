
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AgendamentoBarChartProps {
  data: Record<string, number>;
}

const STATUS_LABELS: Record<string, string> = {
  agendado: "Agendado",
  realizado: "Realizado",
  cancelado: "Cancelado",
  confirmado: "Confirmado",
  reagendado: "Reagendado"
};

const STATUS_COLORS: Record<string, string> = {
  agendado: "#3B82F6",
  realizado: "#22C55E",
  cancelado: "#ef4444",
  confirmado: "#A78BFA",
  reagendado: "#F59E42"
};

const AgendamentoBarChart = ({ data }: AgendamentoBarChartProps) => {
  const chartData = Object.entries(data).map(([status, qtd]) => ({
    status: STATUS_LABELS[status] || status,
    value: qtd,
    color: STATUS_COLORS[status] || "#6366F1"
  }));

  if (!chartData.length) {
    return <p className="text-center text-gray-400 py-8">Nenhum agendamento encontrado no período</p>;
  }

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="status" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="value">
            {chartData.map((entry, idx) => (
              <Cell key={`cell-${idx}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

import { Cell } from 'recharts';
export default AgendamentoBarChart;
