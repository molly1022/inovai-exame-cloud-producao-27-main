
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Filter, X } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface FiltrosAvancadosProps {
  filtros: any;
  onFiltrosChange: (filtros: any) => void;
  opcoes?: {
    convenios?: Array<{ id: string; nome: string }>;
    medicos?: Array<{ id: string; nome_completo: string }>;
    tipos?: string[];
    status?: string[];
  };
  showDateRange?: boolean;
  showConvenio?: boolean;
  showMedico?: boolean;
  showTipo?: boolean;
  showStatus?: boolean;
  showTermo?: boolean;
}

const FiltrosAvancados = ({
  filtros,
  onFiltrosChange,
  opcoes = {},
  showDateRange = true,
  showConvenio = true,
  showMedico = false,
  showTipo = false,
  showStatus = false,
  showTermo = true
}: FiltrosAvancadosProps) => {

  const filtrosRapidos = [
    { 
      label: 'Hoje', 
      onClick: () => {
        const hoje = new Date();
        onFiltrosChange({ ...filtros, dataInicio: hoje, dataFim: hoje });
      }
    },
    { 
      label: 'Esta Semana', 
      onClick: () => {
        const hoje = new Date();
        const inicioSemana = new Date(hoje);
        inicioSemana.setDate(hoje.getDate() - hoje.getDay());
        const fimSemana = new Date(inicioSemana);
        fimSemana.setDate(inicioSemana.getDate() + 6);
        onFiltrosChange({ ...filtros, dataInicio: inicioSemana, dataFim: fimSemana });
      }
    },
    { 
      label: 'Este Mês', 
      onClick: () => {
        const hoje = new Date();
        const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
        onFiltrosChange({ ...filtros, dataInicio: inicioMes, dataFim: fimMes });
      }
    },
    { 
      label: 'Últimos 30 dias', 
      onClick: () => {
        const hoje = new Date();
        const inicio = new Date(hoje);
        inicio.setDate(hoje.getDate() - 30);
        onFiltrosChange({ ...filtros, dataInicio: inicio, dataFim: hoje });
      }
    },
    { 
      label: 'Limpar', 
      onClick: () => onFiltrosChange({})
    }
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Filter className="h-5 w-5" />
          Filtros Avançados
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filtros Rápidos */}
        <div className="flex flex-wrap gap-2">
          {filtrosRapidos.map((filtro, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={filtro.onClick}
              className={filtro.label === 'Limpar' ? 'text-red-600 hover:text-red-700' : ''}
            >
              {filtro.label === 'Limpar' && <X className="h-4 w-4 mr-1" />}
              {filtro.label}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Termo de Busca */}
          {showTermo && (
            <div>
              <label className="text-sm font-medium mb-2 block">Buscar</label>
              <Input
                placeholder="Nome, CPF..."
                value={filtros.termo || ''}
                onChange={(e) => onFiltrosChange({ ...filtros, termo: e.target.value })}
              />
            </div>
          )}

          {/* Range de Datas */}
          {showDateRange && (
            <>
              <div>
                <label className="text-sm font-medium mb-2 block">Data Início</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filtros.dataInicio ? format(filtros.dataInicio, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={filtros.dataInicio}
                      onSelect={(date) => onFiltrosChange({ ...filtros, dataInicio: date })}
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Data Fim</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filtros.dataFim ? format(filtros.dataFim, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={filtros.dataFim}
                      onSelect={(date) => onFiltrosChange({ ...filtros, dataFim: date })}
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </>
          )}

          {/* Convênio */}
          {showConvenio && opcoes.convenios && opcoes.convenios.length > 0 && (
            <div>
              <label className="text-sm font-medium mb-2 block">Convênio</label>
              <Select 
                value={filtros.convenioId || 'todos'} 
                onValueChange={(value) => onFiltrosChange({ 
                  ...filtros, 
                  convenioId: value === 'todos' ? undefined : value 
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os convênios" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os convênios</SelectItem>
                  {opcoes.convenios.map((convenio) => (
                    <SelectItem key={convenio.id} value={convenio.id}>
                      {convenio.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Médico */}
          {showMedico && opcoes.medicos && opcoes.medicos.length > 0 && (
            <div>
              <label className="text-sm font-medium mb-2 block">Médico</label>
              <Select 
                value={filtros.medicoId || 'todos'} 
                onValueChange={(value) => onFiltrosChange({ 
                  ...filtros, 
                  medicoId: value === 'todos' ? undefined : value 
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os médicos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os médicos</SelectItem>
                  {opcoes.medicos.map((medico) => (
                    <SelectItem key={medico.id} value={medico.id}>
                      {medico.nome_completo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Tipo */}
          {showTipo && opcoes.tipos && opcoes.tipos.length > 0 && (
            <div>
              <label className="text-sm font-medium mb-2 block">Tipo</label>
              <Select 
                value={filtros.tipo || 'todos'} 
                onValueChange={(value) => onFiltrosChange({ 
                  ...filtros, 
                  tipo: value === 'todos' ? undefined : value 
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os tipos</SelectItem>
                  {opcoes.tipos.map((tipo) => (
                    <SelectItem key={tipo} value={tipo}>
                      {tipo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Status */}
          {showStatus && opcoes.status && opcoes.status.length > 0 && (
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select 
                value={filtros.status || 'todos'} 
                onValueChange={(value) => onFiltrosChange({ 
                  ...filtros, 
                  status: value === 'todos' ? undefined : value 
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os status</SelectItem>
                  {opcoes.status.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Indicador de filtros ativos */}
        {(filtros.dataInicio || filtros.dataFim || filtros.convenioId || filtros.termo || filtros.tipo || filtros.status || filtros.medicoId) && (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300 font-medium mb-2">
              Filtros aplicados:
            </p>
            <div className="flex flex-wrap gap-2">
              {filtros.dataInicio && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                  Início: {format(filtros.dataInicio, "dd/MM/yyyy", { locale: ptBR })}
                </span>
              )}
              {filtros.dataFim && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                  Fim: {format(filtros.dataFim, "dd/MM/yyyy", { locale: ptBR })}
                </span>
              )}
              {filtros.termo && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                  Busca: {filtros.termo}
                </span>
              )}
              {filtros.convenioId && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                  Convênio filtrado
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FiltrosAvancados;
