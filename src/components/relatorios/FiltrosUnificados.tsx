
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Filter, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useDebounce } from "@/hooks/useDebounce";

interface FiltrosUnificadosProps {
  filtros: any;
  onFiltrosChange: (filtros: any) => void;
  opcoes: {
    convenios: any[];
    medicos: any[];
  };
}

const FiltrosUnificados = ({ filtros, onFiltrosChange, opcoes }: FiltrosUnificadosProps) => {
  // Debounce para busca de texto
  const debouncedTermoBusca = useDebounce(filtros.termoBusca || '', 300);

  const handleFiltroChange = (key: string, value: any) => {
    console.log('Filtro alterado:', key, value);
    onFiltrosChange({ ...filtros, [key]: value });
  };

  const limparFiltros = () => {
    console.log('Limpando filtros');
    onFiltrosChange({});
  };

  // Memorizar se há filtros ativos para evitar re-renderizações desnecessárias
  const temFiltrosAtivos = useMemo(() => {
    return Object.keys(filtros).some(key => 
      filtros[key] !== undefined && 
      filtros[key] !== null && 
      filtros[key] !== '' && 
      filtros[key] !== 'todos'
    );
  }, [filtros]);

  // Memorizar contador de filtros ativos
  const contadorFiltrosAtivos = useMemo(() => {
    return Object.keys(filtros).filter(key => 
      filtros[key] !== undefined && 
      filtros[key] !== null && 
      filtros[key] !== '' && 
      filtros[key] !== 'todos'
    ).length;
  }, [filtros]);

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros de Relatórios
            {contadorFiltrosAtivos > 0 && (
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {contadorFiltrosAtivos} ativo{contadorFiltrosAtivos > 1 ? 's' : ''}
              </span>
            )}
          </CardTitle>
          {temFiltrosAtivos && (
            <Button 
              onClick={limparFiltros}
              variant="outline" 
              size="sm"
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Limpar Filtros
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Busca por Paciente */}
          <div className="space-y-2">
            <Label>Buscar Paciente</Label>
            <Input
              placeholder="Nome ou CPF do paciente"
              value={filtros.termoBusca || ''}
              onChange={(e) => handleFiltroChange('termoBusca', e.target.value)}
              className="w-full"
            />
            {debouncedTermoBusca && (
              <p className="text-xs text-blue-600">
                Buscando por: "{debouncedTermoBusca}"
              </p>
            )}
          </div>

          {/* Data Início */}
          <div className="space-y-2">
            <Label>Data Início</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filtros.dataInicio ? format(filtros.dataInicio, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={filtros.dataInicio}
                  onSelect={(date) => handleFiltroChange('dataInicio', date)}
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Data Fim */}
          <div className="space-y-2">
            <Label>Data Fim</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filtros.dataFim ? format(filtros.dataFim, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={filtros.dataFim}
                  onSelect={(date) => handleFiltroChange('dataFim', date)}
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Médico */}
          <div className="space-y-2">
            <Label>Médico</Label>
            <Select
              value={filtros.medicoId || 'todos'}
              onValueChange={(value) => handleFiltroChange('medicoId', value === 'todos' ? undefined : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecionar médico" />
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

          {/* Convênio */}
          <div className="space-y-2">
            <Label>Convênio</Label>
            <Select
              value={filtros.convenioId || 'todos'}
              onValueChange={(value) => handleFiltroChange('convenioId', value === 'todos' ? undefined : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecionar convênio" />
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

          {/* Status do Pagamento */}
          <div className="space-y-2">
            <Label>Status Pagamento</Label>
            <Select
              value={filtros.statusPagamento || 'todos'}
              onValueChange={(value) => handleFiltroChange('statusPagamento', value === 'todos' ? undefined : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status do pagamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os status</SelectItem>
                <SelectItem value="pago">Pago</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="parcial">Parcial</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status do Agendamento */}
          <div className="space-y-2">
            <Label>Status Consulta</Label>
            <Select
              value={filtros.statusAgendamento || 'todos'}
              onValueChange={(value) => handleFiltroChange('statusAgendamento', value === 'todos' ? undefined : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status da consulta" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os status</SelectItem>
                <SelectItem value="agendado">Agendado</SelectItem>
                <SelectItem value="confirmado">Confirmado</SelectItem>
                <SelectItem value="concluido">Concluído</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
                <SelectItem value="faltou">Faltou</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Método de Pagamento */}
          <div className="space-y-2">
            <Label>Método Pagamento</Label>
            <Select
              value={filtros.metodoPagamento || 'todos'}
              onValueChange={(value) => handleFiltroChange('metodoPagamento', value === 'todos' ? undefined : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Método de pagamento" />
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
        </div>

        {temFiltrosAtivos && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-700">
              <strong>Filtros ativos ({contadorFiltrosAtivos}):</strong> Os relatórios estão sendo exibidos apenas com os dados que atendem aos critérios selecionados. Os dados são atualizados dinamicamente conforme você altera os filtros.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FiltrosUnificados;
