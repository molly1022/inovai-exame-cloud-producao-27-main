import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Clock, AlertCircle, Database, Zap, Shield } from "lucide-react";

const MigrationStatusPanel = () => {
  const [migrationPhase] = useState(1); // Fase atual: 1 (Limpeza concluída)
  
  const phases = [
    {
      id: 1,
      name: "Limpeza e Preparação",
      status: "completed",
      description: "Remover tabelas não utilizadas e consolidar autenticação",
      items: [
        { name: "Remover 10 tabelas não utilizadas", completed: true },
        { name: "Consolidar funções de autenticação", completed: true },
        { name: "Corrigir políticas RLS", completed: true },
        { name: "Criar sistema de monitoramento", completed: true }
      ]
    },
    {
      id: 2,
      name: "Sistema Central",
      status: "in_progress",
      description: "Factory de conexões, painel administrativo e monitoramento",
      items: [
        { name: "Factory de conexões dinâmicas", completed: true },
        { name: "Painel administrativo expandido", completed: true },
        { name: "Sistema de monitoramento de DB", completed: true },
        { name: "Hooks de conexão por tenant", completed: true }
      ]
    },
    {
      id: 3,
      name: "Migração dos Dados",
      status: "pending",
      description: "Extrair dados por clínica e criar bancos individuais",
      items: [
        { name: "Script de extração por clinica_id", completed: false },
        { name: "Criação automatizada de bancos", completed: false },
        { name: "Migração gradual dos dados", completed: false },
        { name: "Atualização do frontend", completed: false }
      ]
    },
    {
      id: 4,
      name: "Finalização",
      status: "pending",
      description: "Testes, monitoramento e otimizações finais",
      items: [
        { name: "Testes de isolamento", completed: false },
        { name: "Validação de performance", completed: false },
        { name: "Sistema de backup", completed: false },
        { name: "Documentação final", completed: false }
      ]
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      completed: "default",
      in_progress: "secondary",
      pending: "secondary"
    };

    const labels: Record<string, string> = {
      completed: "Concluído",
      in_progress: "Em Andamento",
      pending: "Pendente"
    };

    return (
      <Badge variant={variants[status] || "outline"}>
        {labels[status] || status}
      </Badge>
    );
  };

  const calculateProgress = () => {
    const totalItems = phases.reduce((acc, phase) => acc + phase.items.length, 0);
    const completedItems = phases.reduce((acc, phase) => 
      acc + phase.items.filter(item => item.completed).length, 0
    );
    return Math.round((completedItems / totalItems) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Card de Resumo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Migração Database-per-Tenant
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Progresso Geral</span>
                <span className="font-medium">{calculateProgress()}%</span>
              </div>
              <Progress value={calculateProgress()} className="h-2" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">
                  {phases.filter(p => p.status === 'completed').length} Fases Concluídas
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-yellow-600" />
                <span className="text-sm">
                  {phases.filter(p => p.status === 'in_progress').length} Em Andamento
                </span>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-gray-400" />
                <span className="text-sm">
                  {phases.filter(p => p.status === 'pending').length} Pendentes
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fases da Migração */}
      <div className="grid gap-4">
        {phases.map((phase, index) => (
          <Card key={phase.id} className={phase.status === 'in_progress' ? 'border-primary' : ''}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
                    <span className="text-sm font-medium">{phase.id}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">{phase.name}</h3>
                    <p className="text-sm text-muted-foreground">{phase.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(phase.status)}
                  {getStatusBadge(phase.status)}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {phase.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="flex items-center gap-3 text-sm">
                    {item.completed ? (
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-muted-foreground flex-shrink-0" />
                    )}
                    <span className={item.completed ? 'text-foreground' : 'text-muted-foreground'}>
                      {item.name}
                    </span>
                  </div>
                ))}
              </div>
              
              {phase.status === 'in_progress' && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2 text-yellow-800">
                    <Zap className="h-4 w-4" />
                    <span className="text-sm font-medium">Fase Atual</span>
                  </div>
                  <p className="text-sm text-yellow-700 mt-1">
                    Implementando factory de conexões e sistema de monitoramento
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Próximos Passos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Próximos Passos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
              <div>
                <p className="font-medium">Fase 3: Migração dos Dados</p>
                <p className="text-muted-foreground">
                  Criar scripts de extração e migração gradual dos dados por clínica
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-muted-foreground mt-2 flex-shrink-0" />
              <div>
                <p className="font-medium">Atualização do Frontend</p>
                <p className="text-muted-foreground">
                  Remover 330+ referências a clinica_id e implementar conexão dinâmica
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-muted-foreground mt-2 flex-shrink-0" />
              <div>
                <p className="font-medium">Testes e Validação</p>
                <p className="text-muted-foreground">
                  Verificar isolamento, performance e criar sistema de monitoramento
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MigrationStatusPanel;