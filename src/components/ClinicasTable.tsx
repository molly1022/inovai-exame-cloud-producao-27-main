import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { MoreVertical, Search, Eye, Edit, Trash2, Globe } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ClinicaCentral {
  id: string;
  nome: string;
  cnpj: string | null;
  email: string;
  telefone: string | null;
  endereco: string | null;
  subdominio: string;
  status: 'ativa' | 'inativa' | 'suspensa' | 'bloqueada';
  plano_id: string | null;
  database_url: string | null;
  database_name: string | null;
  configuracoes: any;
  limites: any;
  created_at: string;
  updated_at: string;
  expires_at: string | null;
  last_access: string | null;
}

interface PlanoSistema {
  id: string;
  nome: string;
  descricao: string | null;
  preco: number;
  periodicidade: 'mensal' | 'anual' | 'lifetime';
  limites: any;
  recursos: any;
  ativo: boolean;
  ordem: number;
}

interface ClinicasTableProps {
  clinicas: ClinicaCentral[];
  planos: PlanoSistema[];
  onRefresh: () => void;
}

export function ClinicasTable({ clinicas, planos, onRefresh }: ClinicasTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const filteredClinicas = clinicas.filter(clinica =>
    clinica.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    clinica.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    clinica.subdominio.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativa': return 'bg-green-500 hover:bg-green-600';
      case 'inativa': return 'bg-gray-500 hover:bg-gray-600'; 
      case 'suspensa': return 'bg-yellow-500 hover:bg-yellow-600';
      case 'bloqueada': return 'bg-red-500 hover:bg-red-600';
      default: return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ativa': return 'Ativa';
      case 'inativa': return 'Inativa';
      case 'suspensa': return 'Suspensa';
      case 'bloqueada': return 'Bloqueada';
      default: return status;
    }
  };

  const getPlanName = (planoId: string | null) => {
    if (!planoId) return 'Sem plano';
    const plano = planos.find(p => p.id === planoId);
    return plano ? plano.nome : 'Plano não encontrado';
  };

  const handleStatusChange = async (clinicaId: string, novoStatus: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('clinicas_central')
        .update({ status: novoStatus })
        .eq('id', clinicaId);

      if (error) throw error;

      // Log da ação (simplificado para single-tenant)
      console.log('Status alterado:', {
        acao: 'status_alterado',
        clinica_id: clinicaId,
        dados_novos: { status: novoStatus },
        nivel: 'info'
      });

      toast({
        title: "Status atualizado",
        description: `Status da clínica alterado para ${getStatusLabel(novoStatus)}`
      });

      onRefresh();
    } catch (error: any) {
      console.error('Erro ao alterar status:', error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar o status da clínica",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAcessarClinica = (subdominio: string) => {
    const url = `https://${subdominio}.somosinovai.com`;
    window.open(url, '_blank');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Clínicas Cadastradas ({filteredClinicas.length})</span>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar clínicas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-64"
              />
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Subdomínio</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead>Último acesso</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClinicas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    {searchTerm ? 'Nenhuma clínica encontrada com os filtros aplicados' : 'Nenhuma clínica cadastrada'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredClinicas.map((clinica) => (
                  <TableRow key={clinica.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div>{clinica.nome}</div>
                        {clinica.cnpj && (
                          <div className="text-xs text-muted-foreground">{clinica.cnpj}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <code className="bg-muted px-2 py-1 rounded text-xs">
                          {clinica.subdominio}.somosinovai.com
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleAcessarClinica(clinica.subdominio)}
                          className="h-6 w-6 p-0"
                        >
                          <Globe className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>{clinica.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getPlanName(clinica.plano_id)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-white ${getStatusColor(clinica.status)}`}>
                        {getStatusLabel(clinica.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(clinica.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      {clinica.last_access 
                        ? format(new Date(clinica.last_access), 'dd/MM/yyyy HH:mm', { locale: ptBR })
                        : 'Nunca'
                      }
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => handleAcessarClinica(clinica.subdominio)}>
                            <Globe className="mr-2 h-4 w-4" />
                            Acessar Clínica
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            Ver Detalhes
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleStatusChange(clinica.id, 'ativa')}
                            disabled={loading || clinica.status === 'ativa'}
                          >
                            Ativar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleStatusChange(clinica.id, 'suspensa')}
                            disabled={loading || clinica.status === 'suspensa'}
                          >
                            Suspender
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleStatusChange(clinica.id, 'bloqueada')}
                            disabled={loading || clinica.status === 'bloqueada'}
                            className="text-red-600"
                          >
                            Bloquear
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}