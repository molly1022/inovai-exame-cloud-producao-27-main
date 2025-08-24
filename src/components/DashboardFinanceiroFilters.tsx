
import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Filter, RotateCcw } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export interface FilterState {
  periodo: 'hoje' | 'semana_atual' | 'mes_atual' | 'ultimos_3_meses' | 'ano_atual' | 'personalizado';
  statusFinanceiro: 'todos' | 'recebidos' | 'a_receber_futuro' | 'a_receber_vencido' | 'parcial';
  medicoId: string;
  convenioId: string;
  tipoExame: string;
  dataInicio?: Date;
  dataFim?: Date;
}

interface DashboardFinanceiroFiltersProps {
  onFiltersChange: (filters: FilterState) => void;
  medicos?: Array<{ id: string; nome_completo: string }>;
  convenios?: Array<{ id: string; nome: string }>;
  categorias?: Array<{ id: string; nome: string }>;
  initialFilters?: FilterState;
}

const DashboardFinanceiroFilters = ({
  onFiltersChange,
  medicos = [],
  convenios = [],
  categorias = [],
  initialFilters
}: DashboardFinanceiroFiltersProps) => {
  const [localFilters, setLocalFilters] = useState<FilterState>(
    initialFilters || {
      periodo: 'mes_atual',
      statusFinanceiro: 'todos',
      medicoId: 'todos',
      convenioId: 'todos',
      tipoExame: 'todos'
    }
  );

  // Sincronizar com filtros externos
  useEffect(() => {
    if (initialFilters) {
      setLocalFilters(initialFilters);
    }
  }, [initialFilters]);

  const updateFilter = useCallback((key: keyof FilterState, value: any) => {
    const newFilters = {
      ...localFilters,
      [key]: value
    };
    
    console.log('Atualizando filtro:', key, '=', value);
    setLocalFilters(newFilters);
    
    // Aplicar filtros IMEDIATAMENTE
    onFiltersChange(newFilters);
  }, [localFilters, onFiltersChange]);

  const resetFilters = useCallback(() => {
    const defaultFilters: FilterState = {
      periodo: 'mes_atual',
      statusFinanceiro: 'todos',
      medicoId: 'todos',
      convenioId: 'todos',
      tipoExame: 'todos',
      dataInicio: undefined,
      dataFim: undefined
    };
    console.log('Resetando filtros');
    setLocalFilters(defaultFilters);
    onFiltersChange(defaultFilters);
  }, [onFiltersChange]);

  const setQuickPeriod = useCallback((periodo: FilterState['periodo']) => {
    console.log('Aplicando período rápido:', periodo);
    const hoje = new Date();
    let dataInicio: Date | undefined;
    let dataFim: Date | undefined;

    switch (periodo) {
      case 'hoje':
        dataInicio = hoje;
        dataFim = hoje;
        break;
      case 'semana_atual':
        const inicioSemana = new Date(hoje);
        inicioSemana.setDate(hoje.getDate() - hoje.getDay());
        const fimSemana = new Date(inicioSemana);
        fimSemana.setDate(inicioSemana.getDate() + 6);
        dataInicio = inicioSemana;
        dataFim = fimSemana;
        break;
      case 'mes_atual':
        dataInicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        dataFim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
        break;
      case 'ultimos_3_meses':
        dataInicio = new Date(hoje.getFullYear(), hoje.getMonth() - 3, hoje.getDate());
        dataFim = hoje;
        break;
      case 'ano_atual':
        dataInicio = new Date(hoje.getFullYear(), 0, 1);
        dataFim = new Date(hoje.getFullYear(), 11, 31);
        break;
    }

    const newFilters = {
      ...localFilters,
      periodo,
      dataInicio,
      dataFim
    };
    
    console.log('Novos filtros após período:', newFilters);
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  }, [localFilters, onFiltersChange]);

  const isFiltersActive = React.useMemo(() => {
    return localFilters.statusFinanceiro !== 'todos' ||
           localFilters.medicoId !== 'todos' ||
           localFilters.convenioId !== 'todos' ||
           localFilters.tipoExame !== 'todos' ||
           localFilters.periodo !== 'mes_atual' ||
           localFilters.dataInicio ||
           localFilters.dataFim;
  }, [localFilters]);

  const periodoOptions = [
    { key: 'hoje', label: 'Hoje' },
    { key: 'semana_atual', label: 'Esta Semana' },
    { key: 'mes_atual', label: 'Este Mês' },
    { key: 'ultimos_3_meses', label: 'Últimos 3 Meses' },
    { key: 'ano_atual', label: 'Este Ano' }
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            <span>Filtros Avançados</span>
          </div>
          {isFiltersActive && (
            <Button
              variant="outline"
              size="sm"
              onClick={resetFilters}
              className="text-xs"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Limpar
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filtros Rápidos de Período */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Período Rápido</label>
          <div className="flex flex-wrap gap-2">
            {periodoOptions.map(({ key, label }) => (
              <Button
                key={key}
                variant={localFilters.periodo === key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setQuickPeriod(key as FilterState['periodo'])}
                className={localFilters.periodo === key ? 'bg-blue-600 text-white' : ''}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Status Financeiro */}
          <div>
            <label className="text-sm font-medium mb-2 block">Status Financeiro</label>
            <Select 
              value={localFilters.statusFinanceiro} 
              onValueChange={(value) => updateFilter('statusFinanceiro', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Status</SelectItem>
                <SelectItem value="recebidos">Recebidos</SelectItem>
                <SelectItem value="a_receber_futuro">A Receber (Futuro)</SelectItem>
                <SelectItem value="a_receber_vencido">A Receber (Vencido)</SelectItem>
                <SelectItem value="parcial">Pagamento Parcial</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Médicos */}
          {medicos.length > 0 && (
            <div>
              <label className="text-sm font-medium mb-2 block">Médico</label>
              <Select 
                value={localFilters.medicoId} 
                onValueChange={(value) => updateFilter('medicoId', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Médicos</SelectItem>
                  {medicos.map((medico) => (
                    <SelectItem key={medico.id} value={medico.id}>
                      {medico.nome_completo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Convênios */}
          {convenios.length > 0 && (
            <div>
              <label className="text-sm font-medium mb-2 block">Convênio</label>
              <Select 
                value={localFilters.convenioId} 
                onValueChange={(value) => updateFilter('convenioId', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Convênios</SelectItem>
                  <SelectItem value="particular">Particular</SelectItem>
                  {convenios.map((convenio) => (
                    <SelectItem key={convenio.id} value={convenio.id}>
                      {convenio.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Categorias de Exames */}
          <div>
            <label className="text-sm font-medium mb-2 block">Categoria de Exame</label>
            <Select 
              value={localFilters.tipoExame} 
              onValueChange={(value) => updateFilter('tipoExame', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecionar categoria..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas as Categorias</SelectItem>
                {categorias.map((categoria) => (
                  <SelectItem key={categoria.id} value={categoria.nome}>
                    {categoria.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Datas Personalizadas */}
        {localFilters.periodo === 'personalizado' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Data Início</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {localFilters.dataInicio ? format(localFilters.dataInicio, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={localFilters.dataInicio}
                    onSelect={(date) => updateFilter('dataInicio', date)}
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
                    {localFilters.dataFim ? format(localFilters.dataFim, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={localFilters.dataFim}
                    onSelect={(date) => updateFilter('dataFim', date)}
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        )}

        {/* Indicador de filtros ativos */}
        {isFiltersActive && (
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-700 font-medium mb-2">
              Filtros aplicados - {Object.values(localFilters).filter(v => v && v !== 'todos').length} filtro(s) ativo(s)
            </p>
            <div className="flex flex-wrap gap-1">
              {localFilters.periodo !== 'mes_atual' && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                  Período: {periodoOptions.find(p => p.key === localFilters.periodo)?.label}
                </span>
              )}
              {localFilters.statusFinanceiro !== 'todos' && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                  Status: {localFilters.statusFinanceiro}
                </span>
              )}
              {localFilters.medicoId !== 'todos' && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                  Médico selecionado
                </span>
              )}
              {localFilters.convenioId !== 'todos' && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                  Convênio selecionado
                </span>
              )}
              {localFilters.tipoExame !== 'todos' && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                  Categoria selecionada
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DashboardFinanceiroFilters;
