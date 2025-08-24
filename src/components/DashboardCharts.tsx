
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { FileText, TrendingUp, PieChart as PieChartIcon } from "lucide-react";

const examsByTypeData = [
  { month: 'Jul', 'Raio-X': 45, 'Ultrassom': 32, 'Tomografia': 18, 'Ressonância': 12 },
  { month: 'Ago', 'Raio-X': 52, 'Ultrassom': 28, 'Tomografia': 22, 'Ressonância': 15 },
  { month: 'Set', 'Raio-X': 38, 'Ultrassom': 35, 'Tomografia': 25, 'Ressonância': 18 },
  { month: 'Out', 'Raio-X': 61, 'Ultrassom': 42, 'Tomografia': 30, 'Ressonância': 20 },
  { month: 'Nov', 'Raio-X': 55, 'Ultrassom': 38, 'Tomografia': 28, 'Ressonância': 16 },
  { month: 'Dez', 'Raio-X': 67, 'Ultrassom': 45, 'Tomografia': 35, 'Ressonância': 25 }
];

const newPatientsData = [
  { week: 'Sem 1', patients: 8 },
  { week: 'Sem 2', patients: 12 },
  { week: 'Sem 3', patients: 6 },
  { week: 'Sem 4', patients: 15 },
  { week: 'Sem 5', patients: 10 },
  { week: 'Sem 6', patients: 18 },
  { week: 'Sem 7', patients: 14 },
  { week: 'Sem 8', patients: 22 }
];

const examDistributionData = [
  { name: 'Raio-X', value: 338, color: '#3498db' },
  { name: 'Ultrassom', value: 220, color: '#2ecc71' },
  { name: 'Tomografia', value: 158, color: '#e74c3c' },
  { name: 'Ressonância', value: 106, color: '#f39c12' },
  { name: 'Outros', value: 89, color: '#9b59b6' }
];

const DashboardCharts = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
      {/* Exames por Tipo (Barras) */}
      <Card className="col-span-1 lg:col-span-2 xl:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <span>Exames por Tipo - Últimos 6 Meses</span>
          </CardTitle>
          <CardDescription>Distribuição mensal de exames realizados</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={examsByTypeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="Raio-X" fill="#3498db" />
              <Bar dataKey="Ultrassom" fill="#2ecc71" />
              <Bar dataKey="Tomografia" fill="#e74c3c" />
              <Bar dataKey="Ressonância" fill="#f39c12" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Distribuição de Exames (Donut) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <PieChartIcon className="h-5 w-5 text-green-600" />
            <span>Distribuição de Exames</span>
          </CardTitle>
          <CardDescription>Total de exames por tipo</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={examDistributionData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {examDistributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {examDistributionData.map((item) => (
              <div key={item.name} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-gray-600">{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Novos Pacientes (Linha) */}
      <Card className="col-span-1 lg:col-span-2 xl:col-span-3">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            <span>Novos Pacientes - Últimas 8 Semanas</span>
          </CardTitle>
          <CardDescription>Crescimento semanal da base de pacientes</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={newPatientsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="patients" 
                stroke="#9b59b6" 
                strokeWidth={3}
                dot={{ fill: '#9b59b6', strokeWidth: 2, r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardCharts;
