import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Users, BarChart3, Settings, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AgendaPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  agendamentos: any[];
  medicos: any[];
  onUpdate: () => void;
}

const AgendaPlannerModal = ({
  isOpen,
  onClose,
  agendamentos,
  medicos,
  onUpdate
}: AgendaPlannerModalProps) => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Dados para visualização semanal
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Estatísticas da agenda
  const totalAgendamentos = agendamentos.length;
  const confirmados = agendamentos.filter(a => a.status === 'confirmado').length;
  const emAndamento = agendamentos.filter(a => a.status === 'em_andamento').length;
  const concluidos = agendamentos.filter(a => a.status === 'concluido').length;

  // Distribuição por médico
  const medicoStats = medicos.map(medico => {
    const agendamentosMedico = agendamentos.filter(a => a.medico_id === medico.id);
    return {
      nome: medico.nome_completo,
      total: agendamentosMedico.length,
      concluidos: agendamentosMedico.filter(a => a.status === 'concluido').length,
      pendentes: agendamentosMedico.filter(a => ['agendado', 'confirmado'].includes(a.status)).length
    };
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Agenda Planner - Sistema Avançado de Gestão
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="weekly" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Visão Semanal
            </TabsTrigger>
            <TabsTrigger value="doctors" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Por Médico
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Relatórios
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Configurações
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Agendamentos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{totalAgendamentos}</div>
                  <p className="text-xs text-muted-foreground">Hoje</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Confirmados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{confirmados}</div>
                  <p className="text-xs text-muted-foreground">Aguardando atendimento</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">{emAndamento}</div>
                  <p className="text-xs text-muted-foreground">Sendo atendidos</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Concluídos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{concluidos}</div>
                  <p className="text-xs text-muted-foreground">Finalizados</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Próximas Funcionalidades</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Lembretes Automáticos</p>
                    <p className="text-sm text-muted-foreground">SMS e WhatsApp para pacientes</p>
                  </div>
                  <Badge variant="outline">Em desenvolvimento</Badge>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <Users className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium">Lista de Espera Inteligente</p>
                    <p className="text-sm text-muted-foreground">Preenchimento automático de vagas</p>
                  </div>
                  <Badge variant="outline">Planejado</Badge>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                  <FileText className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="font-medium">Relatórios Avançados</p>
                    <p className="text-sm text-muted-foreground">Analytics completos da agenda</p>
                  </div>
                  <Badge variant="outline">Planejado</Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="weekly" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                Semana de {format(weekStart, "dd/MM", { locale: ptBR })} a {format(weekEnd, "dd/MM/yyyy", { locale: ptBR })}
              </h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">← Anterior</Button>
                <Button variant="outline" size="sm">Próxima →</Button>
              </div>
            </div>
            
            <div className="grid grid-cols-7 gap-2">
              {weekDays.map((day) => (
                <Card key={day.toISOString()} className="min-h-[120px]">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">
                      {format(day, "EEE dd", { locale: ptBR })}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1">
                    <div className="text-xs">
                      <Badge variant="secondary" className="text-xs">
                        {agendamentos.filter(a => 
                          format(new Date(a.data_agendamento), "yyyy-MM-dd") === format(day, "yyyy-MM-dd")
                        ).length} agendamentos
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="doctors" className="space-y-4">
            <h3 className="text-lg font-semibold">Distribuição por Médico</h3>
            <div className="space-y-3">
              {medicoStats.map((medico, index) => (
                <Card key={index}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{medico.nome}</p>
                        <p className="text-sm text-muted-foreground">
                          {medico.total} agendamentos total
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline">{medico.concluidos} concluídos</Badge>
                        <Badge variant="secondary">{medico.pendentes} pendentes</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <h3 className="text-lg font-semibold">Relatórios e Analytics</h3>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
                  <div>
                    <p className="font-medium">Relatórios Avançados</p>
                    <p className="text-sm text-muted-foreground">
                      Relatórios detalhados de desempenho, taxa de ocupação e análises preditivas estarão disponíveis em breve.
                    </p>
                  </div>
                  <Button variant="outline" disabled>
                    Em desenvolvimento
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <h3 className="text-lg font-semibold">Configurações do Planner</h3>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <Settings className="h-12 w-12 mx-auto text-muted-foreground" />
                  <div>
                    <p className="font-medium">Configurações Avançadas</p>
                    <p className="text-sm text-muted-foreground">
                      Configurações de notificações, bloqueios de horários e automações estarão disponíveis em breve.
                    </p>
                  </div>
                  <Button variant="outline" disabled>
                    Em desenvolvimento
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AgendaPlannerModal;