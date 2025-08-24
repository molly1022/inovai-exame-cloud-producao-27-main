import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  FileText, 
  Eye, 
  Grid3X3, 
  List, 
  Download,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ExamsTableProps {
  exames: any[];
  onViewExame: (exame: any) => void;
  loading?: boolean;
}

const ExamsTable = ({ exames, onViewExame, loading }: ExamsTableProps) => {
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [selectedExames, setSelectedExames] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortField, setSortField] = useState<'data_exame' | 'tipo' | 'paciente_nome'>('data_exame');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const sortedExames = [...exames].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    if (sortField === 'data_exame') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }
    
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const totalPages = Math.ceil(sortedExames.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentExames = sortedExames.slice(startIndex, endIndex);

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleSelectExame = (exameId: string) => {
    setSelectedExames(prev => 
      prev.includes(exameId) 
        ? prev.filter(id => id !== exameId)
        : [...prev, exameId]
    );
  };

  const handleSelectAll = () => {
    if (selectedExames.length === currentExames.length) {
      setSelectedExames([]);
    } else {
      setSelectedExames(currentExames.map(exame => exame.id));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'disponivel':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'em_analise':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'entregue':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'disponivel': return 'Disponível';
      case 'pendente': return 'Pendente';
      case 'em_analise': return 'Em Análise';
      case 'entregue': return 'Entregue';
      default: return 'Indefinido';
    }
  };

  const renderPagination = () => (
    <div className="flex items-center justify-between pt-4">
      <div className="flex items-center space-x-2">
        <span className="text-sm text-muted-foreground">
          Mostrando {startIndex + 1} a {Math.min(endIndex, sortedExames.length)} de {sortedExames.length} exames
        </span>
        <Select
          value={itemsPerPage.toString()}
          onValueChange={(value) => {
            setItemsPerPage(Number(value));
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className="w-20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">5</SelectItem>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="50">50</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(1)}
          disabled={currentPage === 1}
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm">
          Página {currentPage} de {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(totalPages)}
          disabled={currentPage === totalPages}
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  const renderCardsView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {currentExames.map((exame) => (
        <Card key={exame.id} className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{exame.tipo}</CardTitle>
              <Badge className={getStatusColor(exame.status || 'pendente')}>
                {getStatusLabel(exame.status || 'pendente')}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm text-muted-foreground">
              <strong>Paciente:</strong> {exame.paciente_nome}
            </div>
            <div className="text-sm text-muted-foreground">
              <strong>Médico:</strong> {exame.medico_nome}
            </div>
            <div className="text-sm text-muted-foreground">
              <strong>Data:</strong> {new Date(exame.data_exame).toLocaleDateString('pt-BR')}
            </div>
            {exame.arquivo_nome && (
              <div className="flex items-center space-x-2 text-sm text-blue-600">
                <FileText className="h-4 w-4" />
                <span className="truncate">{exame.arquivo_nome}</span>
              </div>
            )}
            <div className="flex justify-end pt-2">
              <Button
                size="sm"
                onClick={() => onViewExame(exame)}
                className="flex items-center space-x-2"
              >
                <Eye className="h-4 w-4" />
                <span>Visualizar</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderTableView = () => (
    <div className="rounded-lg border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left">
                <Checkbox
                  checked={selectedExames.length === currentExames.length && currentExames.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted"
                onClick={() => handleSort('tipo')}
              >
                Tipo {sortField === 'tipo' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted"
                onClick={() => handleSort('paciente_nome')}
              >
                Paciente {sortField === 'paciente_nome' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Médico
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted"
                onClick={() => handleSort('data_exame')}
              >
                Data {sortField === 'data_exame' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Arquivo
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {currentExames.map((exame) => (
              <tr key={exame.id} className="hover:bg-muted/50">
                <td className="px-4 py-3">
                  <Checkbox
                    checked={selectedExames.includes(exame.id)}
                    onCheckedChange={() => handleSelectExame(exame.id)}
                  />
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                  {exame.tipo}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  {exame.paciente_nome}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  {exame.medico_nome}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  {new Date(exame.data_exame).toLocaleDateString('pt-BR')}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <Badge className={getStatusColor(exame.status || 'pendente')}>
                    {getStatusLabel(exame.status || 'pendente')}
                  </Badge>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  {exame.arquivo_nome ? (
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-blue-500" />
                      <span className="truncate max-w-[100px]">{exame.arquivo_nome}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Sem arquivo</span>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewExame(exame)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Lista de Exames</CardTitle>
            <p className="text-sm text-muted-foreground">
              {sortedExames.length} exame(s) encontrado(s)
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {selectedExames.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  {selectedExames.length} selecionado(s)
                </span>
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Selecionados
                </Button>
              </div>
            )}
            <div className="flex rounded-md border">
              <Button
                variant={viewMode === 'table' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('table')}
                className="rounded-r-none"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'cards' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('cards')}
                className="rounded-l-none"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {exames.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Nenhum exame encontrado com os filtros aplicados
            </p>
          </div>
        ) : (
          <>
            {viewMode === 'table' ? renderTableView() : renderCardsView()}
            {sortedExames.length > itemsPerPage && renderPagination()}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ExamsTable;