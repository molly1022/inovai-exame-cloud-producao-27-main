import { Separator } from '@/components/ui/separator';
import { FileText } from 'lucide-react';
import AtestadosTable from '@/components/AtestadosTable';

const AtestadosMedicos = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <FileText className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold">Atestados Médicos</h1>
            <p className="text-gray-600">
              Gerencie atestados médicos emitidos pela clínica
            </p>
          </div>
        </div>
        <Separator />
      </div>

      <AtestadosTable />
    </div>
  );
};

export default AtestadosMedicos;