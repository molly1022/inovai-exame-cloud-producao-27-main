import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FileText, User, Stethoscope, Calendar, Clock, MapPin, Phone, Mail } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AtestadoViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  atestado: any;
  clinica: any;
}

const AtestadoViewModal = ({ isOpen, onClose, atestado, clinica }: AtestadoViewModalProps) => {
  if (!atestado) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Visualizar Atestado Médico
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6" id="atestado-content">
          {/* Cabeçalho da Clínica */}
          <Card>
            <CardHeader className="text-center bg-blue-50">
              <CardTitle className="text-xl text-blue-800">
                {clinica?.nome || 'Clínica Médica'}
              </CardTitle>
              <div className="text-sm text-gray-600 space-y-1">
                {clinica?.endereco && (
                  <div className="flex items-center justify-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {clinica.endereco}
                  </div>
                )}
                <div className="flex items-center justify-center gap-4">
                  {clinica?.telefone && (
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {clinica.telefone}
                    </div>
                  )}
                  {clinica?.email && (
                    <div className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {clinica.email}
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Título do Documento */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">ATESTADO MÉDICO</h2>
            <Badge variant="outline" className="text-sm">
              Documento nº {atestado.id?.substring(0, 8).toUpperCase()}
            </Badge>
          </div>

          {/* Informações do Médico */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Stethoscope className="h-5 w-5 text-green-600" />
                Médico Responsável
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div><strong>Nome:</strong> {atestado.medico?.nome_completo}</div>
              {atestado.medico?.crm && (
                <div><strong>CRM:</strong> {atestado.medico.crm}</div>
              )}
              {atestado.medico?.coren && (
                <div><strong>COREN:</strong> {atestado.medico.coren}</div>
              )}
              {atestado.medico?.especialidade && (
                <div><strong>Especialidade:</strong> {atestado.medico.especialidade}</div>
              )}
            </CardContent>
          </Card>

          {/* Informações do Paciente */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5 text-blue-600" />
                Dados do Paciente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div><strong>Nome:</strong> {atestado.paciente?.nome}</div>
              <div><strong>CPF:</strong> {atestado.paciente?.cpf}</div>
              {atestado.paciente?.data_nascimento && (
                <div>
                  <strong>Data de Nascimento:</strong> {' '}
                  {format(new Date(atestado.paciente.data_nascimento), "dd/MM/yyyy")}
                </div>
              )}
            </CardContent>
          </Card>

          <Separator />

          {/* Conteúdo do Atestado */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold mb-4">DECLARAÇÃO MÉDICA</h3>
            </div>

            <div className="space-y-4 text-justify leading-relaxed">
              <p>
                Atesto para os devidos fins que o(a) paciente <strong>{atestado.paciente?.nome}</strong>,
                portador(a) do CPF <strong>{atestado.paciente?.cpf}</strong>, esteve sob meus cuidados médicos.
              </p>

              <div className="bg-white p-4 rounded border-l-4 border-blue-500">
                <p className="font-medium mb-2">Condição médica e justificativa:</p>
                <p>{atestado.observacoes}</p>
              </div>

              {atestado.cid && (
                <p>
                  <strong>CID:</strong> {atestado.cid}
                </p>
              )}

              <div className="flex items-center gap-6 bg-white p-4 rounded">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Data de Início</p>
                    <p className="font-medium">
                      {format(new Date(atestado.data_inicio_afastamento), "dd/MM/yyyy")}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-red-600" />
                  <div>
                    <p className="text-sm text-gray-600">Data de Fim</p>
                    <p className="font-medium">
                      {format(new Date(atestado.data_fim_afastamento), "dd/MM/yyyy")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Período</p>
                    <p className="font-medium">
                      {atestado.dias_afastamento} {atestado.dias_afastamento === 1 ? 'dia' : 'dias'}
                    </p>
                  </div>
                </div>
              </div>

              <p>
                Recomendo o afastamento das atividades habituais pelo período especificado acima,
                para adequado tratamento e recuperação.
              </p>
            </div>
          </div>

          {/* Rodapé com Data e Assinatura */}
          <div className="text-center space-y-4">
            <p className="text-sm text-gray-600">
              Emitido em {format(new Date(atestado.data_emissao), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </p>
            
            <div className="mt-12 mb-8">
              <div className="border-t-2 border-gray-400 w-80 mx-auto mb-2"></div>
              <p className="text-sm font-medium">{atestado.medico?.nome_completo}</p>
              <p className="text-xs text-gray-600">
                {atestado.medico?.crm ? `CRM: ${atestado.medico.crm}` : `COREN: ${atestado.medico?.coren}`}
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
          <Button onClick={handlePrint}>
            <FileText className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AtestadoViewModal;