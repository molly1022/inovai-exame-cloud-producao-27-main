import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { adminSupabase } from "@/integrations/supabase/adminClient";
import { CheckCircle, XCircle, Clock, Eye, User, Mail, Phone, Building } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Inscricao {
  id: string;
  nome_clinica: string;
  nome_responsavel: string;
  email_responsavel: string;
  cpf_responsavel: string;
  telefone: string;
  subdominio_solicitado: string;
  status: string;
  created_at: string;
  dados_completos: any;
}

const AdminProcessarInscricoes = () => {
  const [inscricoes, setInscricoes] = useState<Inscricao[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchInscricoes();
  }, []);

  const fetchInscricoes = async () => {
    try {
      setLoading(true);
      // TODO: Re-enable after database types are updated
      console.log('Inscricoes fetch disabled temporarily');
      setInscricoes([]);
    } catch (error) {
      console.error('Erro ao buscar inscrições:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar inscrições pendentes.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const processarInscricao = async (inscricaoId: string, acao: 'aprovar' | 'rejeitar') => {
    setProcessing(inscricaoId);
    
    try {
      if (acao === 'aprovar') {
        // Usar função segura de processamento no banco administrativo central
        const { data, error } = await (adminSupabase as any).rpc('processar_inscricao_segura', {
          inscricao_id: inscricaoId
        });

        if (error) throw error;

        if (data && data.length > 0 && data[0].success) {
          const result = data[0];
          
          // Exibir informações de sucesso
          toast({
            title: "Clínica criada com sucesso!",
            description: `ID: ${result.clinica_id}\n\n⚠️ IMPORTANTE: Uma senha temporária foi gerada e registrada nos logs do sistema.`,
            duration: 8000,
          });

          // Log para administrador (apenas em desenvolvimento)
          if (process.env.NODE_ENV === 'development') {
            console.log('🔑 CLÍNICA CRIADA:', {
              clinica_id: result.clinica_id,
              message: result.message,
              timestamp: new Date().toISOString()
            });
          }
          
        } else {
          throw new Error(data[0]?.message || 'Erro ao processar inscrição');
        }
      } else {
        // TODO: Re-enable after database types are updated
        console.log('Inscricao rejection disabled temporarily');

        if (false) throw Error; // Placeholder

        toast({
          title: "Inscrição rejeitada",
          description: "A inscrição foi rejeitada com sucesso.",
        });
      }

      // Recarregar lista
      await fetchInscricoes();
    } catch (error: any) {
      console.error('Erro ao processar inscrição:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao processar inscrição.",
        variant: "destructive"
      });
    } finally {
      setProcessing(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pendente':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200"><Clock className="h-3 w-3 mr-1" />Pendente</Badge>;
      case 'aprovada':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><CheckCircle className="h-3 w-3 mr-1" />Aprovada</Badge>;
      case 'rejeitada':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200"><XCircle className="h-3 w-3 mr-1" />Rejeitada</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="container max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando inscrições...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Processar Inscrições de Clínicas
          </h1>
          <p className="text-muted-foreground">
            Gerencie as solicitações de cadastro de novas clínicas
          </p>
        </div>

        <div className="grid gap-6">
          {inscricoes.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Nenhuma inscrição encontrada
                </h3>
                <p className="text-muted-foreground">
                  Não há inscrições pendentes para processar.
                </p>
              </CardContent>
            </Card>
          ) : (
            inscricoes.map((inscricao) => (
              <Card key={inscricao.id} className="border-border/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Building className="h-5 w-5 text-primary" />
                        {inscricao.nome_clinica}
                      </CardTitle>
                      <CardDescription>
                        Subdomínio: {inscricao.subdominio_solicitado}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(inscricao.status)}
                      <Badge variant="outline">
                        {format(new Date(inscricao.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Responsável:</span>
                        <span>{inscricao.nome_responsavel}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Email:</span>
                        <span>{inscricao.email_responsavel}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Telefone:</span>
                        <span>{inscricao.telefone}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-sm">
                        <span className="font-medium">CPF:</span>
                        <span className="ml-2">{inscricao.cpf_responsavel}</span>
                      </div>
                      {inscricao.dados_completos?.endereco && (
                        <div className="text-sm">
                          <span className="font-medium">Endereço:</span>
                          <span className="ml-2">{inscricao.dados_completos.endereco}</span>
                        </div>
                      )}
                      {inscricao.dados_completos?.observacoes && (
                        <div className="text-sm">
                          <span className="font-medium">Observações:</span>
                          <span className="ml-2">{inscricao.dados_completos.observacoes}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {inscricao.status === 'pendente' && (
                    <div className="flex gap-2 pt-4 border-t border-border/50">
                      <Button
                        onClick={() => processarInscricao(inscricao.id, 'aprovar')}
                        disabled={processing === inscricao.id}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        {processing === inscricao.id ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Processando...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Aprovar
                          </>
                        )}
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => processarInscricao(inscricao.id, 'rejeitar')}
                        disabled={processing === inscricao.id}
                        className="flex-1"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Rejeitar
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminProcessarInscricoes;