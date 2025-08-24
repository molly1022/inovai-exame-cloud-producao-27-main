import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useRepassesMedicos } from '@/hooks/useRepassesMedicos';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Users,
  CalendarDays,
  Filter
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface GestaoRepassesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GestaoRepassesModal = ({ isOpen, onClose }: GestaoRepassesModalProps) => {
  const { 
    repasses, 
    resumo, 
    loading, 
    marcarRepasePago, 
    marcarMultiplosRepassesPagos, 
    cancelarRepasse,
    fetchRepasses 
  } = useRepassesMedicos();
  
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [observacoesPagamento, setObservacoesPagamento] = useState('');
  const [filtroMes, setFiltroMes] = useState('');
  const [filtroMedico, setFiltroMedico] = useState('');

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const pendentes = repasses.filter(r => r.status === 'pendente').map(r => r.id);
      setSelectedItems(pendentes);
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedItems(prev => [...prev, id]);
    } else {
      setSelectedItems(prev => prev.filter(item => item !== id));
    }
  };

  const handleMarcarPagosLote = async () => {
    if (selectedItems.length === 0) return;
    
    // Mock para repasses - sistema multi-tenant em desenvolvimento
    console.log('Marcando repasses como pagos:', selectedItems, observacoesPagamento);
    setSelectedItems([]);
    setObservacoesPagamento('');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pendente':
        return <Badge variant="outline" className="text-orange-700 border-orange-300"><Clock className="h-3 w-3 mr-1" />Pendente</Badge>;
      case 'pago':
        return <Badge variant="outline" className="text-green-700 border-green-300"><CheckCircle className="h-3 w-3 mr-1" />Pago</Badge>;
      case 'cancelado':
        return <Badge variant="outline" className="text-red-700 border-red-300"><XCircle className="h-3 w-3 mr-1" />Cancelado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const repassesFiltrados = repasses.filter(repasse => {
    const matchMes = !filtroMes || repasse.mes_referencia.includes(filtroMes);
    const matchMedico = !filtroMedico || repasse.medicos?.nome_completo?.toLowerCase().includes(filtroMedico.toLowerCase());
    return matchMes && matchMedico;
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            Gestão de Repasses para Médicos
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="resumo" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="resumo">Resumo</TabsTrigger>
            <TabsTrigger value="repasses">Repasses</TabsTrigger>
            <TabsTrigger value="por-medico">Por Médico</TabsTrigger>
          </TabsList>

          <TabsContent value="resumo" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4 text-orange-600" />
                    Repasses Pendentes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-700">
                    R$ {resumo.totalPendente.toFixed(2)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Repasses Pagos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-700">
                    R$ {resumo.totalPago.toFixed(2)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                    Total do Mês
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-700">
                    R$ {resumo.totalMes.toFixed(2)}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="repasses" className="space-y-4">
            {/* Filtros */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filtros
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="filtro-mes">Mês de Referência</Label>
                    <Input
                      id="filtro-mes"
                      type="month"
                      value={filtroMes}
                      onChange={(e) => setFiltroMes(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="filtro-medico">Médico</Label>
                    <Input
                      id="filtro-medico"
                      placeholder="Buscar por nome do médico"
                      value={filtroMedico}
                      onChange={(e) => setFiltroMedico(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ações em Lote */}
            {selectedItems.length > 0 && (
              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-green-800">
                        {selectedItems.length} repasse(s) selecionado(s)
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedItems([])}
                      >
                        Limpar
                      </Button>
                    </div>
                    
                    <div>
                      <Label htmlFor="obs-pagamento">Observações do Pagamento (opcional)</Label>
                      <Textarea
                        id="obs-pagamento"
                        placeholder="Adicione observações sobre este pagamento..."
                        value={observacoesPagamento}
                        onChange={(e) => setObservacoesPagamento(e.target.value)}
                        rows={2}
                      />
                    </div>
                    
                    <Button
                      onClick={handleMarcarPagosLote}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Marcar {selectedItems.length} repasse(s) como pago(s)
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tabela de Repasses */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Lista de Repasses</CardTitle>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedItems.length === repasses.filter(r => r.status === 'pendente').length && repasses.filter(r => r.status === 'pendente').length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                    <span className="text-sm text-muted-foreground">Selecionar todos pendentes</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Médico</TableHead>
                      <TableHead>Consulta</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Valor Consulta</TableHead>
                      <TableHead>%</TableHead>
                      <TableHead>Repasse</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {repassesFiltrados.map((repasse) => (
                      <TableRow key={repasse.id}>
                        <TableCell>
                          {repasse.status === 'pendente' && (
                            <Checkbox
                              checked={selectedItems.includes(repasse.id)}
                              onCheckedChange={(checked) => handleSelectItem(repasse.id, checked as boolean)}
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{repasse.medicos?.nome_completo}</div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{repasse.agendamentos?.pacientes?.nome}</div>
                            <div className="text-sm text-muted-foreground">{repasse.agendamentos?.tipo_exame}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {repasse.agendamentos?.data_agendamento && 
                            format(new Date(repasse.agendamentos.data_agendamento), 'dd/MM/yyyy', { locale: ptBR })
                          }
                        </TableCell>
                        <TableCell>R$ {repasse.valor_consulta.toFixed(2)}</TableCell>
                        <TableCell>{repasse.percentual_repasse.toFixed(1)}%</TableCell>
                        <TableCell>
                          <span className="font-medium text-green-700">
                            R$ {repasse.valor_repasse.toFixed(2)}
                          </span>
                        </TableCell>
                        <TableCell>{getStatusBadge(repasse.status)}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {repasse.status === 'pendente' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => marcarRepasePago(repasse.id)}
                                  className="text-green-600 border-green-300 hover:bg-green-50"
                                >
                                  Pagar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => console.log('Cancelando repasse:', repasse.id)}
                                  className="text-red-600 border-red-300 hover:bg-red-50"
                                >
                                  Cancelar
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="por-medico" className="space-y-4">
            <div className="grid gap-4">
              {Object.entries(resumo.repassesPorMedico).map(([medicoId, dados]) => (
                <Card key={medicoId}>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Users className="h-5 w-5 text-blue-600" />
                      {dados.nome}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-700">
                          R$ {dados.totalPendente.toFixed(2)}
                        </div>
                        <div className="text-sm text-muted-foreground">Pendente</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-700">
                          R$ {dados.totalPago.toFixed(2)}
                        </div>
                        <div className="text-sm text-muted-foreground">Pago</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-700">
                          {dados.percentualMedio.toFixed(1)}%
                        </div>
                        <div className="text-sm text-muted-foreground">% de Repasse</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};