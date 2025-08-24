import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Relatorios = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Relatórios</h1>
        <Button>Gerar Relatório</Button>
      </div>
      
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <p className="text-gray-500">Sistema em modo demonstração</p>
            <p className="text-sm text-gray-400">Relatórios simplificados</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Relatorios;