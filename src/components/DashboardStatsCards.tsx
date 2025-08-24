import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, Calendar, CheckCircle, DollarSign, TrendingUp, Clock, Database } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from '@/lib/utils';
import MiniSparkline from './MiniSparkline';
import EmailControlCard from './EmailControlCard';
import { TenantGuard } from './TenantGuard';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface DashboardStatsCardsProps {
  onExamesTodayChange?: (examesToday: number) => void;
}

const DashboardStatsCards = ({ onExamesTodayChange }: DashboardStatsCardsProps) => {
  return (
    <TenantGuard requiresOperationalDB={true}>
      <DashboardStatsCardsContent onExamesTodayChange={onExamesTodayChange} />
    </TenantGuard>
  );
};

const DashboardStatsCardsContent = ({ onExamesTodayChange }: DashboardStatsCardsProps) => {
  const mockStats = {
    pacientes: 1247,
    exames: 3856,
    agendamentos: 156,
    consultasConcluidas: 89
  };

  const chartData = {
    pacientes: [850, 920, 1050, 1180, 1200, 1220, 1247],
    exames: [2100, 2450, 2800, 3200, 3500, 3700, 3856],
    agendamentos: [120, 135, 145, 150, 148, 152, 156],
    consultasConcluidas: [65, 72, 78, 82, 85, 87, 89],
    faturamento: [15000, 17500, 19200, 21800, 23500, 25200, 28700]
  };

  return (
    <div className="space-y-4">
      <Alert>
        <Database className="h-4 w-4" />
        <AlertDescription>
          <strong>Demonstração do Dashboard</strong> - Dados reais estarão disponíveis quando acessado via subdomínio da clínica específica.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 opacity-75">
        {/* Total de Pacientes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pacientes Totais</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.pacientes.toLocaleString()}</div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">+12% este mês</p>
              <MiniSparkline data={chartData.pacientes} color="blue" />
            </div>
          </CardContent>
        </Card>

        {/* Total de Exames */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Exames Realizados</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.exames.toLocaleString()}</div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">+18% este mês</p>
              <MiniSparkline data={chartData.exames} color="green" />
            </div>
          </CardContent>
        </Card>

        {/* Agendamentos Hoje */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agendamentos Hoje</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.agendamentos}</div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">+5% em relação a ontem</p>
              <MiniSparkline data={chartData.agendamentos} color="orange" />
            </div>
          </CardContent>
        </Card>

        {/* Consultas Concluídas */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concluídas Hoje</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.consultasConcluidas}</div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Taxa: 57%</p>
              <MiniSparkline data={chartData.consultasConcluidas} color="purple" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Faturamento e E-mail Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 opacity-75">
        {/* Faturamento do Mês */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faturamento do Mês</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(287500)}</div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                +15% em relação ao mês anterior
              </p>
              <MiniSparkline data={chartData.faturamento} color="emerald" />
            </div>
          </CardContent>
        </Card>

        {/* E-mail Control Card */}
        <EmailControlCard />
      </div>
    </div>
  );
};

export default DashboardStatsCards;