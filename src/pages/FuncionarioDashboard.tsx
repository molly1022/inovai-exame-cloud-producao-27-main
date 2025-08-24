import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFuncionarioDashboardMock } from '@/hooks/useFuncionarioMock';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Users, UserCheck, Calendar, FileText } from 'lucide-react';

const FuncionarioDashboard = () => {
  const { stats, pacientes, medicos, loading } = useFuncionarioDashboardMock();

  useEffect(() => {
    document.title = 'Dashboard Funcionário | Sistema Clínica';
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Dashboard Funcionário</h1>
          <p className="text-muted-foreground">
            Visão geral das atividades da clínica
          </p>
        </div>
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
          Modo Simulação
        </Badge>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Pacientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPacientes}</div>
            <p className="text-xs text-muted-foreground">
              +5% desde o mês passado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Médicos Ativos</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMedicos}</div>
            <p className="text-xs text-muted-foreground">
              Todos disponíveis hoje
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agendamentos Hoje</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.agendamentosHoje}</div>
            <p className="text-xs text-muted-foreground">
              8 confirmados, 4 pendentes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Exames Pendentes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.examesPendentes}</div>
            <p className="text-xs text-muted-foreground">
              Para processamento
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pacientes Recentes */}
        <Card>
          <CardHeader>
            <CardTitle>Pacientes Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pacientes.map((paciente: any) => (
                <div key={paciente.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{paciente.nome}</p>
                    <p className="text-sm text-muted-foreground">{paciente.telefone}</p>
                  </div>
                  <Badge variant="outline">
                    {paciente.last_visit ? format(new Date(paciente.last_visit), 'dd/MM', { locale: ptBR }) : 'Novo'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Médicos da Equipe */}
        <Card>
          <CardHeader>
            <CardTitle>Equipe Médica</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {medicos.map((medico: any) => (
                <div key={medico.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{medico.nome_completo}</p>
                    <p className="text-sm text-muted-foreground">{medico.especialidade}</p>
                  </div>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    Disponível
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Aviso sobre modo simulação */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-yellow-800">
            <FileText className="h-4 w-4" />
            <span className="text-sm font-medium">Sistema Multi-Tenant em Desenvolvimento</span>
          </div>
          <p className="text-sm text-yellow-700 mt-2">
            Os dados exibidos são simulados. O sistema multi-tenant está sendo implementado para conectar com bancos específicos por clínica.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default FuncionarioDashboard;