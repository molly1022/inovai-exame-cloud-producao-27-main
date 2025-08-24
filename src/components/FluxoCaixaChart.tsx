
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp } from 'lucide-react';

interface FluxoCaixaChartProps {
  data: Array<{
    periodo: string;
    recebido: number;
    aReceber: number;
    meta?: number;
  }>;
  tipo?: 'bar' | 'line';
}

const FluxoCaixaChart = ({ data, tipo = 'bar' }: FluxoCaixaChartProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const totalRecebido = data.reduce((sum, item) => sum + item.recebido, 0);
  const totalAReceber = data.reduce((sum, item) => sum + item.aReceber, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Fluxo de Caixa
        </CardTitle>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Recebido: {formatCurrency(totalRecebido)}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>A Receber: {formatCurrency(totalAReceber)}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          {tipo === 'bar' ? (
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="periodo" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={formatCurrency}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="recebido" 
                fill="#10b981" 
                name="Valores Recebidos"
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="aReceber" 
                fill="#3b82f6" 
                name="Valores a Receber"
                radius={[4, 4, 0, 0]}
              />
              {data.some(item => item.meta) && (
                <Bar 
                  dataKey="meta" 
                  fill="#f59e0b" 
                  name="Meta"
                  radius={[4, 4, 0, 0]}
                  opacity={0.7}
                />
              )}
            </BarChart>
          ) : (
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="periodo" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={formatCurrency}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="recebido" 
                stroke="#10b981" 
                strokeWidth={3}
                name="Valores Recebidos"
                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="aReceber" 
                stroke="#3b82f6" 
                strokeWidth={3}
                name="Valores a Receber"
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              />
              {data.some(item => item.meta) && (
                <Line 
                  type="monotone" 
                  dataKey="meta" 
                  stroke="#f59e0b" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Meta"
                  dot={{ fill: '#f59e0b', strokeWidth: 2, r: 3 }}
                />
              )}
            </LineChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default FluxoCaixaChart;
