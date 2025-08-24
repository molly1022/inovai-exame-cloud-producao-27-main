
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";

const agendamentosData = [
  { month: "Jan", Clínica: 78, Sistema: 99 },
  { month: "Fev", Clínica: 85, Sistema: 120 },
  { month: "Mar", Clínica: 90, Sistema: 142 },
  { month: "Abr", Clínica: 80, Sistema: 154 },
  { month: "Mai", Clínica: 86, Sistema: 170 },
  { month: "Jun", Clínica: 102, Sistema: 192 }
];
const entregasExamesData = [
  { month: "Jan", Clínica: 65, Sistema: 88 },
  { month: "Fev", Clínica: 71, Sistema: 101 },
  { month: "Mar", Clínica: 73, Sistema: 115 },
  { month: "Abr", Clínica: 60, Sistema: 121 },
  { month: "Mai", Clínica: 66, Sistema: 139 },
  { month: "Jun", Clínica: 72, Sistema: 157 }
];

const chartColors = {
  Sistema: "#a78bfa", // purple-400
  Clínica: "#6366f1", // indigo-500
};

export function MetricChartSection() {
  return (
    <section className="py-12">
      <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 text-transparent bg-gradient-to-r from-blue-400 to-purple-300 bg-clip-text">
        Impacto direto na performance da sua clínica
      </h2>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-[#191933]/80 rounded-2xl p-6 shadow-xl border border-[#30204c]/60">
          <h3 className="font-bold text-xl mb-2 text-[#a78bfa]">Agendamentos por mês</h3>
          <p className="text-gray-300 mb-4">Veja como clínicas aumentaram o número de agendamentos após adotar o sistema:</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={agendamentosData}>
              <CartesianGrid stroke="#29295c" strokeDasharray="3 3" />
              <XAxis dataKey="month" stroke="#a78bfa" />
              <YAxis stroke="#8884d8" />
              <Tooltip contentStyle={{ background: "#1e1936", border: "none", color: "#fff", borderRadius: 8 }} />
              <Line
                type="monotone"
                dataKey="Clínica"
                stroke={chartColors.Clínica}
                strokeWidth={3}
                dot={{ r: 4, fill: chartColors.Clínica }}
              />
              <Line
                type="monotone"
                dataKey="Sistema"
                stroke={chartColors.Sistema}
                strokeWidth={3}
                dot={{ r: 4, fill: chartColors.Sistema }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-[#191933]/80 rounded-2xl p-6 shadow-xl border border-[#30204c]/60">
          <h3 className="font-bold text-xl mb-2 text-[#a78bfa]">Tempo médio de entrega de exames</h3>
          <p className="text-gray-300 mb-4">Redução do tempo para entregar exames aos pacientes:</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={entregasExamesData}>
              <CartesianGrid stroke="#29295c" strokeDasharray="3 3" />
              <XAxis dataKey="month" stroke="#a78bfa" />
              <YAxis stroke="#8884d8" />
              <Tooltip contentStyle={{ background: "#1e1936", border: "none", color: "#fff", borderRadius: 8 }} />
              <Line
                type="monotone"
                dataKey="Clínica"
                stroke={chartColors.Clínica}
                strokeWidth={3}
                dot={{ r: 4, fill: chartColors.Clínica }}
              />
              <Line
                type="monotone"
                dataKey="Sistema"
                stroke={chartColors.Sistema}
                strokeWidth={3}
                dot={{ r: 4, fill: chartColors.Sistema }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  )
}
