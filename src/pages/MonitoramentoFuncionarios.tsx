
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Activity, RefreshCw } from "lucide-react";
import { useMonitoramentoData } from '@/hooks/useMonitoramentoData';
import { MonitoramentoCards } from '@/components/monitoramento/MonitoramentoCards';
import { MonitoramentoFiltros } from '@/components/monitoramento/MonitoramentoFiltros';
import { MonitoramentoTabs } from '@/components/monitoramento/MonitoramentoTabs';
import { MonitoramentoTabelas } from '@/components/monitoramento/MonitoramentoTabelas';
import type { AbaTipo } from '@/types/monitoramento';
import { FeaturePageGate } from '@/components/FeaturePageGate';

const MonitoramentoFuncionarios = () => {
  return (
    <FeaturePageGate
      feature="monitoramento"
      featureName="Monitoramento de Funcionários"
      description="Controle detalhado das atividades dos funcionários com logs, sessões e análise de produtividade."
      requiredPlan="avancado_medico"
    >
      <MonitoramentoContent />
    </FeaturePageGate>
  );
};

const MonitoramentoContent = () => {
  const [abaSelecionada, setAbaSelecionada] = useState<AbaTipo>('logs');
  
  const {
    logs,
    sessoes,
    funcionarios,
    horarioTrabalho,
    produtividade,
    loading,
    filtroFuncionario,
    setFiltroFuncionario,
    filtroAcao,
    setFiltroAcao,
    filtroDataInicio,
    setFiltroDataInicio,
    filtroDataFim,
    setFiltroDataFim,
    recarregarDados,
    aplicarFiltros,
    limparFiltros,
    getHistoricoFuncionario
  } = useMonitoramentoData();

  const handleAplicarFiltros = () => {
    aplicarFiltros(abaSelecionada);
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 text-white p-2 rounded-lg">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Monitoramento de Funcionários</h1>
            <p className="text-gray-600">Controle e auditoria das atividades dos funcionários</p>
          </div>
        </div>
        <Button onClick={recarregarDados} variant="outline" className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Recarregar
        </Button>
      </div>

      <MonitoramentoCards 
        funcionarios={funcionarios}
        sessoes={sessoes}
        logs={logs}
      />

      <MonitoramentoFiltros
        funcionarios={funcionarios}
        filtroFuncionario={filtroFuncionario}
        setFiltroFuncionario={setFiltroFuncionario}
        filtroAcao={filtroAcao}
        setFiltroAcao={setFiltroAcao}
        filtroDataInicio={filtroDataInicio}
        setFiltroDataInicio={setFiltroDataInicio}
        filtroDataFim={filtroDataFim}
        setFiltroDataFim={setFiltroDataFim}
        abaSelecionada={abaSelecionada}
        aplicarFiltros={handleAplicarFiltros}
        limparFiltros={limparFiltros}
      />

      <MonitoramentoTabs
        abaSelecionada={abaSelecionada}
        setAbaSelecionada={setAbaSelecionada}
      />

      <MonitoramentoTabelas
        abaSelecionada={abaSelecionada}
        loading={loading}
        logs={logs}
        sessoes={sessoes}
        horarioTrabalho={horarioTrabalho}
        produtividade={produtividade}
        funcionarios={funcionarios}
        getHistoricoFuncionario={getHistoricoFuncionario}
      />
    </div>
  );
};

export default MonitoramentoFuncionarios;
