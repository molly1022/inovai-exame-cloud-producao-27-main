
import { useState } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar, Filter } from "lucide-react";

interface DateRangeFilterProps {
  onFilterChange: (dateRange: { dataInicio: string; dataFim: string }) => void;
  defaultStartDate?: string;
  defaultEndDate?: string;
}

const DateRangeFilter = ({ onFilterChange, defaultStartDate = '', defaultEndDate = '' }: DateRangeFilterProps) => {
  const [dataInicio, setDataInicio] = useState(defaultStartDate);
  const [dataFim, setDataFim] = useState(defaultEndDate);

  const handleApplyFilter = () => {
    onFilterChange({ dataInicio, dataFim });
  };

  const handleClearFilter = () => {
    setDataInicio('');
    setDataFim('');
    onFilterChange({ dataInicio: '', dataFim: '' });
  };

  return (
    <div className="flex flex-wrap items-end gap-4 p-4 border rounded-lg bg-gray-50">
      <div className="flex items-center gap-2 mb-2">
        <Calendar className="h-4 w-4 text-gray-600" />
        <span className="text-sm font-medium text-gray-700">Filtrar por período</span>
      </div>
      
      <div className="flex flex-wrap gap-4">
        <div className="space-y-1">
          <Label htmlFor="data-inicio" className="text-xs">Data Início</Label>
          <Input
            id="data-inicio"
            type="date"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
            className="w-40"
          />
        </div>
        
        <div className="space-y-1">
          <Label htmlFor="data-fim" className="text-xs">Data Fim</Label>
          <Input
            id="data-fim"
            type="date"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
            className="w-40"
          />
        </div>
        
        <div className="flex gap-2">
          <Button onClick={handleApplyFilter} size="sm" className="flex items-center gap-1">
            <Filter className="h-3 w-3" />
            Aplicar
          </Button>
          <Button onClick={handleClearFilter} size="sm" variant="outline">
            Limpar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DateRangeFilter;
