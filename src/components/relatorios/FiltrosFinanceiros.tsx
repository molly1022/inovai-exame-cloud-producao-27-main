
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Filter, X, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface FiltrosFinanceirosProps {
  filtros: any;
  onFiltrosChange: (filtros: any) => void;
  opcoes?: {
    convenios?: Array<{ id: string; nome: string }>;
    medicos?: Array<{ id: string; nome_completo: string }>;
  };
}

const FiltrosFinanceiros = ({
  filtros,
  onFiltrosChange,
  opcoes = {}
}: FiltrosFinanceirosProps) => {

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
      label: 'Limpar', 
      onClick: () => onFiltrosChange({})
    }
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Filter className="h-5 w-5" />
          Filtros Financeiros Avançados
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Range de Datas */}
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

          {/* Status de Pagamento */}
          <div>
            <label className="text-sm font-medium mb-2 block">Status Pagamento</label>
            <Select 
              value={filtros.statusPagamento || 'todos'} 
              onValueChange={(value) => onFiltrosChange({ 
                ...filtros, 
                statusPagamento: value === 'todos' ? undefined : value 
              })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos os status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os status</SelectItem>
                <SelectItem value="pago">Pago</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="parcial">Parcial</SelectItem>
                <SelectItem value="pagar_no_dia">Pagar no Dia</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Método de Pagamento */}
          <div>
            <label className="text-sm font-medium mb-2 block">Método Pagamento</label>
            <Select 
              value={filtros.metodoPagamento || 'todos'} 
              onValueChange={(value) => onFiltrosChange({ 
                ...filtros, 
                metodoPagamento: value === 'todos' ? undefined : value 
              })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos os métodos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os métodos</SelectItem>
                <SelectItem value="dinheiro">Dinheiro</SelectItem>
                <SelectItem value="cartao">Cartão</SelectItem>
                <SelectItem value="pix">PIX</SelectItem>
                <SelectItem value="transferencia">Transferência</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Convênio */}
          {opcoes.convenios && opcoes.convenios.length > 0 && (
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
                  <SelectItem value="particular">Particular</SelectItem>
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
          {opcoes.medicos && opcoes.medicos.length > 0 && (
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

          {/* Faixa de Valores */}
          <div>
            <label className="text-sm font-medium mb-2 block">Valor Mínimo</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={filtros.valorMinimo || ''}
                onChange={(e) => onFiltrosChange({ 
                  ...filtros, 
                  valorMinimo: e.target.value ? parseFloat(e.target.value) : undefined 
                })}
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Valor Máximo</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                type="number"
                step="0.01"
                placeholder="999.99"
                value={filtros.valorMaximo || ''}
                onChange={(e) => onFiltrosChange({ 
                  ...filtros, 
                  valorMaximo: e.target.value ? parseFloat(e.target.value) : undefined 
                })}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Indicador de filtros ativos */}
        {Object.keys(filtros).some(key => filtros[key] !== undefined && filtros[key] !== '') && (
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
              {filtros.statusPagamento && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                  Status: {filtros.statusPagamento}
                </span>
              )}
              {filtros.metodoPagamento && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                  Método: {filtros.metodoPagamento}
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FiltrosFinanceiros;
