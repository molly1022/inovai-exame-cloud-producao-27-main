
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface Convenio {
  id: string;
  nome: string;
  cor: string;
}

interface ConvenioFilterProps {
  convenios: Convenio[];
  selectedConvenio: string;
  onConvenioChange: (convenioId: string) => void;
  loading?: boolean;
}

const ConvenioFilter = ({ convenios, selectedConvenio, onConvenioChange, loading }: ConvenioFilterProps) => {
  if (loading) {
    return (
      <div className="space-y-2">
        <Label>Convênio</Label>
        <div className="animate-pulse bg-gray-200 h-10 rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label>Filtrar por Convênio</Label>
      <Select value={selectedConvenio} onValueChange={onConvenioChange}>
        <SelectTrigger>
          <SelectValue placeholder="Selecione um convênio" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos os convênios</SelectItem>
          <SelectItem value="particular">Apenas particulares</SelectItem>
          {convenios.map((convenio) => (
            <SelectItem key={convenio.id} value={convenio.id}>
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: convenio.cor }}
                />
                {convenio.nome}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ConvenioFilter;
