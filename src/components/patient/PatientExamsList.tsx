
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Calendar, User, Eye, Download } from "lucide-react";

interface PatientExamsListProps {
  exames: any[];
  onExamView: (exame: any) => void;
  getStatusColor: (status: string) => string;
}

const PatientExamsList = ({ 
  exames, 
  onExamView, 
  getStatusColor 
}: PatientExamsListProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="h-5 w-5 text-green-600" />
          <span>Meus Exames</span>
        </CardTitle>
        <CardDescription>Resultados disponíveis para visualização</CardDescription>
      </CardHeader>
      <CardContent>
        {exames.length > 0 ? (
          <div className="space-y-4">
            {exames.map((exame) => (
              <div key={exame.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-2 md:space-y-0">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Badge className={getStatusColor(exame.status)}>
                        {exame.status}
                      </Badge>
                      <h3 className="font-semibold text-gray-900">{exame.tipo}</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>Data: {new Date(exame.data_exame).toLocaleDateString('pt-BR')}</span>
                      </div>
                      {exame.medicos && (
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4" />
                          <span>Dr(a). {exame.medicos.nome_completo}</span>
                        </div>
                      )}
                    </div>
                    {exame.comentarios && (
                      <p className="text-sm text-gray-500 mt-2">{exame.comentarios}</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onExamView(exame)}
                      className="flex items-center space-x-2"
                    >
                      <Eye className="h-4 w-4" />
                      <span>Visualizar</span>
                    </Button>
                    {exame.arquivo_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(exame.arquivo_url, '_blank')}
                        className="flex items-center space-x-2"
                      >
                        <Download className="h-4 w-4" />
                        <span>Download</span>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Nenhum exame disponível</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PatientExamsList;
