import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useClinica } from '@/hooks/useClinica';
import { useTenantSystem } from '@/hooks/useTenantSystem';
import { 
  CreditCard, 
  Calendar, 
  DollarSign, 
  Clock,
  CheckCircle,
  AlertTriangle,
  Users
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface FaturaMensal {
  id: string;
  mes_referencia: string;
  total_medicos: number;
  medicos_extras: number;
  valor_total: number;
  status: 'pendente' | 'pago' | 'vencida';
  data_vencimento: string;
  data_pagamento?: string;
  created_at: string;
}

interface FaturaMedicosModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FaturaMedicosModal = ({ isOpen, onClose }: FaturaMedicosModalProps) => {
  const { toast } = useToast();
  const { clinica } = useClinica();
  const { query } = useTenantSystem();
  const [faturas, setFaturas] = useState<FaturaMensal[]>([]);
  const [loading, setLoading] = useState(true);
  const [assinatura, setAssinatura] = useState<any>(null);

  useEffect(() => {
    if (isOpen && clinica?.id) {
      fetchFaturas();
      fetchAssinatura();
    }
  }, [isOpen, clinica?.id]);

  const fetchAssinatura = async () => {
    if (!clinica?.id) return;

    const { data } = await query('assinaturas')
      .select('*')
      .eq('clinica_id', clinica.id)
      .eq('status', 'ativa')
      .single();

    setAssinatura(data);
  };

  const fetchFaturas = async () => {
    if (!clinica?.id) return;

    try {
      setLoading(true);
      
      // FUNCIONALIDADE TEMPORARIAMENTE DESABILITADA
      // As faturas de médicos foram removidas na migração database-per-tenant
      setFaturas([]);
      console.log('Faturas desabilitadas temporariamente');
    } catch (error) {
      console.error('Erro ao buscar faturas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as faturas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const gerarFaturaMensal = async () => {
    if (!clinica?.id) return;

    try {
      const hoje = new Date();
      const mesReferencia = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      
      // Funcionalidade temporariamente desabilitada - requer função RPC
      console.log('Gerar fatura temporariamente desabilitado');
      toast({
        title: "Funcionalidade em desenvolvimento",
        description: "A geração de faturas será implementada em breve",
      });

      fetchFaturas();
    } catch (error) {
      console.error('Erro ao gerar fatura:', error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar a fatura",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string, dataVencimento: string) => {
    const hoje = new Date();
    const vencimento = new Date(dataVencimento);
    
    if (status === 'pago') {
      return <Badge className="bg-green-100 text-green-800 border-green-300"><CheckCircle className="h-3 w-3 mr-1" />Pago</Badge>;
    }
    
    if (status === 'pendente' && vencimento < hoje) {
      return <Badge className="bg-red-100 text-red-800 border-red-300"><AlertTriangle className="h-3 w-3 mr-1" />Vencida</Badge>;
    }
    
    if (status === 'pendente') {
      return <Badge className="bg-orange-100 text-orange-800 border-orange-300"><Clock className="h-3 w-3 mr-1" />Pendente</Badge>;
    }

    return <Badge variant="outline">{status}</Badge>;
  };

  // Verificar se é plano multi-mês
  const isPlanoMultiMes = assinatura?.periodo_meses > 1;

  if (!isPlanoMultiMes) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-blue-600" />
              Faturas de Médicos
            </DialogTitle>
          </DialogHeader>
          
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              O sistema de faturas mensais separadas para médicos está disponível apenas para planos trimestrais, semestrais e anuais.
              <br /><br />
              No seu plano mensal atual, os médicos extras são cobrados junto com a mensalidade principal.
            </AlertDescription>
          </Alert>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-blue-600" />
            Faturas Mensais de Médicos
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações do Plano */}
          <Alert>
            <Calendar className="h-4 w-4" />
            <AlertDescription>
              Você possui um plano <strong>{assinatura?.tipo_plano}</strong> de <strong>{assinatura?.periodo_meses} meses</strong>.
              <br />
              Os médicos extras são cobrados mensalmente em faturas separadas.
            </AlertDescription>
          </Alert>

          {/* Ações */}
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Histórico de Faturas</h3>
            <Button onClick={gerarFaturaMensal} className="bg-blue-600 hover:bg-blue-700">
              Gerar Fatura do Mês Atual
            </Button>
          </div>

          {/* Resumo Rápido */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-600" />
                  Faturas Pendentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-700">
                  {faturas.filter(f => f.status === 'pendente').length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-red-600" />
                  Valor Pendente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-700">
                  R$ {faturas
                    .filter(f => f.status === 'pendente')
                    .reduce((sum, f) => sum + f.valor_total, 0)
                    .toFixed(2)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  Médicos Extras Atuais
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-700">
                  {faturas.length > 0 ? faturas[0].medicos_extras : 0}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabela de Faturas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Histórico de Faturas</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-muted-foreground">Carregando faturas...</p>
                </div>
              ) : faturas.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Nenhuma fatura encontrada</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Clique em "Gerar Fatura do Mês Atual" para criar a primeira fatura
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mês de Referência</TableHead>
                      <TableHead>Total Médicos</TableHead>
                      <TableHead>Médicos Extras</TableHead>
                      <TableHead>Valor Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Vencimento</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {faturas.map((fatura) => (
                      <TableRow key={fatura.id}>
                        <TableCell>
                          {format(new Date(fatura.mes_referencia + '-01'), 'MMMM yyyy', { locale: ptBR })}
                        </TableCell>
                        <TableCell>{fatura.total_medicos}</TableCell>
                        <TableCell>
                          <span className="font-medium text-blue-600">
                            {fatura.medicos_extras}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">
                            R$ {fatura.valor_total.toFixed(2)}
                          </span>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(fatura.status, fatura.data_vencimento)}
                        </TableCell>
                        <TableCell>
                          {format(new Date(fatura.data_vencimento), 'dd/MM/yyyy', { locale: ptBR })}
                        </TableCell>
                        <TableCell>
                          {fatura.status === 'pendente' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 border-green-300 hover:bg-green-50"
                            >
                              Pagar
                            </Button>
                          )}
                          {fatura.status === 'pago' && fatura.data_pagamento && (
                            <span className="text-sm text-muted-foreground">
                              Pago em {format(new Date(fatura.data_pagamento), 'dd/MM/yyyy', { locale: ptBR })}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};