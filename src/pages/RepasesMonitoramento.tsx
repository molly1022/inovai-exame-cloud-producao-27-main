import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { DollarSign, TrendingUp, Calendar, Filter, FileText, Download } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface RepasseData {
  id: string;
  medico_id: string;
  medico_nome: string;
  valor_consulta: number;
  percentual_repasse: number;
  valor_repasse: number;
  mes_referencia: string;
  status: string;
  data_pagamento?: string;
  agendamento_id: string;
}

interface ResumoMedico {
  medico_id: string;
  medico_nome: string;
  total_consultas: number;
  total_repasses: number;
  percentual_medio: number;
  status_geral: string;
}

export default function RepassesMonitoramento() {
  const [repasses, setRepasses] = useState<RepasseData[]>([]);
  const [resumos, setResumos] = useState<ResumoMedico[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    mes_referencia: format(new Date(), 'yyyy-MM'),
    medico_id: '',
    status: ''
  });

  const fetchRepasses = async () => {
    try {
      setLoading(true);
      
      // Mock data para repasses
      console.log('🏥 Simulando busca de repasses:', filtros);
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockRepasses: RepasseData[] = [
        {
          id: '1',
          medico_id: 'medico1',
          medico_nome: 'Dr. João Silva',
          valor_consulta: 150.00,
          percentual_repasse: 70,
          valor_repasse: 105.00,
          mes_referencia: filtros.mes_referencia || format(new Date(), 'yyyy-MM'),
          status: 'pendente',
          agendamento_id: 'agend1'
        },
        {
          id: '2',
          medico_id: 'medico2',
          medico_nome: 'Dra. Maria Santos',
          valor_consulta: 200.00,
          percentual_repasse: 65,
          valor_repasse: 130.00,
          mes_referencia: filtros.mes_referencia || format(new Date(), 'yyyy-MM'),
          status: 'pago',
          data_pagamento: new Date().toISOString(),
          agendamento_id: 'agend2'
        }
      ];

      // Aplicar filtros
      let repassesFiltrados = mockRepasses;
      
      if (filtros.medico_id) {
        repassesFiltrados = repassesFiltrados.filter(r => r.medico_id === filtros.medico_id);
      }

      if (filtros.status) {
        repassesFiltrados = repassesFiltrados.filter(r => r.status === filtros.status);
      }

      setRepasses(repassesFiltrados);

      // Calcular resumos por médico
      const resumosPorMedico = repassesFiltrados.reduce((acc, repasse) => {
        const medicoId = repasse.medico_id;
        
        if (!acc[medicoId]) {
          acc[medicoId] = {
            medico_id: medicoId,
            medico_nome: repasse.medico_nome,
            total_consultas: 0,
            total_repasses: 0,
            percentual_medio: 0,
            status_geral: 'pendente'
          };
        }

        acc[medicoId].total_consultas += 1;
        acc[medicoId].total_repasses += repasse.valor_repasse;
        acc[medicoId].percentual_medio = repasse.percentual_repasse;

        return acc;
      }, {} as Record<string, ResumoMedico>);

      setResumos(Object.values(resumosPorMedico));
      toast.success('Dados de repasses carregados (modo demonstração)');

    } catch (error) {
      console.error('Erro ao buscar repasses:', error);
      toast.error('Erro ao carregar dados de repasses');
    } finally {
      setLoading(false);
    }
  };

  const marcarComoPago = async (repasseId: string) => {
    try {
      console.log('💰 Simulando marcação como pago do repasse:', repasseId);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Simular atualização local
      setRepasses(prev => prev.map(r => 
        r.id === repasseId 
          ? { ...r, status: 'pago', data_pagamento: new Date().toISOString() }
          : r
      ));

      toast.success('Repasse marcado como pago (modo demonstração)!');
    } catch (error) {
      console.error('Erro ao marcar repasse como pago:', error);
      toast.error('Erro ao atualizar status do repasse');
    }
  };

  const gerarRelatorio = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('gerar-relatorio-repasses', {
        body: filtros
      });

      if (error) throw error;

      toast.success('Relatório gerado com sucesso!');
      // Implementar download do PDF aqui
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      toast.error('Erro ao gerar relatório');
    }
  };

  useEffect(() => {
    fetchRepasses();
  }, [filtros]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pago': return 'bg-green-500';
      case 'pendente': return 'bg-yellow-500';
      case 'cancelado': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const totalRepasses = repasses.reduce((sum, r) => sum + r.valor_repasse, 0);
  const totalPendente = repasses.filter(r => r.status === 'pendente').reduce((sum, r) => sum + r.valor_repasse, 0);
  const totalPago = repasses.filter(r => r.status === 'pago').reduce((sum, r) => sum + r.valor_repasse, 0);

  return (
    <div className="space-y-6">
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Repasses</p>
                <p className="text-2xl font-bold">R$ {totalRepasses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold text-yellow-600">R$ {totalPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
              <Calendar className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pagos</p>
                <p className="text-2xl font-bold text-green-600">R$ {totalPago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Médicos Ativos</p>
                <p className="text-2xl font-bold">{resumos.length}</p>
              </div>
              <FileText className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium">Mês/Ano</label>
              <Input
                type="month"
                value={filtros.mes_referencia}
                onChange={(e) => setFiltros(prev => ({ ...prev, mes_referencia: e.target.value }))}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Status</label>
              <Select value={filtros.status} onValueChange={(value) => setFiltros(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="pago">Pago</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button onClick={gerarRelatorio} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Gerar Relatório
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumo por Médico */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo por Médico</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Carregando...</div>
          ) : resumos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum repasse encontrado para o período selecionado
            </div>
          ) : (
            <div className="space-y-3">
              {resumos.map((resumo) => (
                <div key={resumo.medico_id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{resumo.medico_nome}</p>
                    <p className="text-sm text-muted-foreground">
                      {resumo.total_consultas} consultas • {resumo.percentual_medio}% de repasse
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">R$ {resumo.total_repasses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lista Detalhada de Repasses */}
      <Card>
        <CardHeader>
          <CardTitle>Repasses Detalhados</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Carregando...</div>
          ) : repasses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum repasse encontrado
            </div>
          ) : (
            <div className="space-y-2">
              {repasses.map((repasse) => (
                <div key={repasse.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-3">
                    <Badge className={getStatusColor(repasse.status)}>
                      {repasse.status.toUpperCase()}
                    </Badge>
                    <div>
                      <p className="font-medium">{repasse.medico_nome}</p>
                      <p className="text-sm text-muted-foreground">
                        Consulta R$ {repasse.valor_consulta.toFixed(2)} • {repasse.percentual_repasse}%
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-bold">R$ {repasse.valor_repasse.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(repasse.mes_referencia), 'MMM/yyyy', { locale: ptBR })}
                      </p>
                    </div>
                    {repasse.status === 'pendente' && (
                      <Button
                        onClick={() => marcarComoPago(repasse.id)}
                        size="sm"
                        variant="outline"
                      >
                        Marcar como Pago
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}