import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useFuncionarioExamesMock } from '@/hooks/useFuncionarioMock';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Badge } from '@/components/ui/badge';
import { Calendar, Search, Filter, FileText, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const FuncionarioExames = () => {
  const { exames, loading } = useFuncionarioExamesMock();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    document.title = 'Exames | Sistema Clínica';
  }, []);

  const filteredExames = exames.filter(exame => {
    const matchesSearch = !searchTerm || 
      exame.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exame.paciente_nome.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || exame.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pendente':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
      case 'em_andamento':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Em Andamento</Badge>;
      case 'concluido':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Concluído</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Exames</h1>
          <p className="text-muted-foreground">
            Gerenciamento de exames da clínica
          </p>
        </div>
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
          Modo Simulação
        </Badge>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar por tipo de exame ou paciente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-input rounded-md bg-background text-sm"
            >
              <option value="">Todos os status</option>
              <option value="pendente">Pendente</option>
              <option value="em_andamento">Em Andamento</option>
              <option value="concluido">Concluído</option>
            </select>

            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('');
              }}
            >
              <Filter className="w-4 h-4 mr-2" />
              Limpar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Exames */}
      <Card>
        <CardHeader>
          <CardTitle>Exames Cadastrados ({filteredExames.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredExames.length > 0 ? (
              filteredExames.map((exame) => (
                <div key={exame.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium">{exame.tipo}</h3>
                      <p className="text-sm text-muted-foreground">
                        Paciente: {exame.paciente_nome}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Data: {format(new Date(exame.data_exame), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {getStatusBadge(exame.status)}
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4 mr-2" />
                        Visualizar
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-medium">Nenhum exame encontrado</h3>
                <p className="text-sm text-muted-foreground">
                  {searchTerm || statusFilter 
                    ? 'Tente ajustar os filtros de busca.' 
                    : 'Nenhum exame cadastrado no momento.'
                  }
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Aviso sobre modo simulação */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-yellow-800">
            <FileText className="h-4 w-4" />
            <span className="text-sm font-medium">Sistema Multi-Tenant em Desenvolvimento</span>
          </div>
          <p className="text-sm text-yellow-700 mt-2">
            Os dados de exames exibidos são simulados. O sistema está sendo preparado para conectar com os bancos específicos por clínica.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default FuncionarioExames;