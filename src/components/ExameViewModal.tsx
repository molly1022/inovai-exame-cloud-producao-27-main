
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Calendar, FileText, Eye, Image as ImageIcon } from "lucide-react";

interface ExameViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  exame: any;
}

const ExameViewModal = ({ isOpen, onClose, exame }: ExameViewModalProps) => {
  if (!exame) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'disponivel': return 'bg-green-100 text-green-800';
      case 'processando': return 'bg-yellow-100 text-yellow-800';
      case 'revisao': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDownloadLaudo = () => {
    if (exame.laudo_url) {
      const link = document.createElement('a');
      link.href = exame.laudo_url;
      link.download = exame.laudo_nome || 'laudo';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleViewLaudo = () => {
    if (exame.laudo_url) {
      window.open(exame.laudo_url, '_blank');
    }
  };

  const handleDownloadImage = (url: string, nome: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = nome || 'imagem';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleViewImage = (url: string) => {
    window.open(url, '_blank');
  };

  // Verificar se existem imagens nos novos campos ou nos campos antigos
  let imagensUrls = [];
  let imagensNomes = [];

  if (exame.imagens_urls && Array.isArray(exame.imagens_urls) && exame.imagens_urls.length > 0) {
    imagensUrls = exame.imagens_urls;
    imagensNomes = exame.imagens_nomes || [];
  } else if (exame.arquivo_url) {
    imagensUrls = [exame.arquivo_url];
    imagensNomes = [exame.arquivo_nome || 'Arquivo'];
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Detalhes do Exame
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Informações Básicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">{exame.tipo}</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {new Date(exame.data_exame).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <Badge className={getStatusColor(exame.status)}>
                    {exame.status?.charAt(0).toUpperCase() + exame.status?.slice(1)}
                  </Badge>
                </div>
              </div>

              {/* Paciente */}
              {exame.pacientes && (
                <div>
                  <h4 className="font-medium mb-2">Paciente:</h4>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="font-medium">{exame.pacientes.nome}</p>
                    <p className="text-sm text-gray-600">CPF: {exame.pacientes.cpf}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Laudo */}
            <div>
              <h4 className="font-medium mb-2">Laudo do Exame</h4>
              {exame.laudo_url ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-medium text-blue-900">📄 {exame.laudo_nome || 'Laudo do exame'}</p>
                      <p className="text-sm text-blue-700">Documento principal do exame</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button onClick={handleViewLaudo} size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-2" />
                      Visualizar
                    </Button>
                    <Button onClick={handleDownloadLaudo} size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Baixar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                  <FileText className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-500">Nenhum laudo anexado</p>
                </div>
              )}
            </div>
          </div>

          {/* Imagens do Exame */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Imagens do Exame ({imagensUrls.length})
            </h4>
            
            {imagensUrls.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {imagensUrls.map((url: string, index: number) => {
                  const nomeImagem = imagensNomes[index] || `Imagem ${index + 1}`;
                  
                  return (
                    <div key={index} className="border rounded-lg overflow-hidden bg-gray-50">
                      <div className="aspect-video relative">
                        <img 
                          src={url} 
                          alt={`Imagem ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder.svg';
                          }}
                        />
                      </div>
                      <div className="p-3">
                        <p className="text-sm font-medium mb-2 truncate" title={nomeImagem}>
                          🖼️ {nomeImagem}
                        </p>
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => handleViewImage(url)} 
                            size="sm" 
                            variant="outline"
                            className="flex-1"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Ver
                          </Button>
                          <Button 
                            onClick={() => handleDownloadImage(url, nomeImagem)} 
                            size="sm"
                            className="flex-1"
                          >
                            <Download className="h-3 w-3 mr-1" />
                            Baixar
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                <ImageIcon className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500">Nenhuma imagem anexada</p>
              </div>
            )}
          </div>

          {/* Médico */}
          {exame.medicos && (
            <div>
              <h4 className="font-medium mb-2">Médico Responsável:</h4>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="font-medium">{exame.medicos.nome_completo}</p>
                <p className="text-sm text-gray-600">CRM: {exame.medicos.crm}</p>
              </div>
            </div>
          )}

          {/* Comentários/Resultados */}
          {exame.comentarios && (
            <div>
              <h4 className="font-medium mb-2">Resultados/Observações:</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 whitespace-pre-wrap">{exame.comentarios}</p>
              </div>
            </div>
          )}

          {/* Informações Adicionais */}
          <div className="text-xs text-gray-500 border-t pt-4 space-y-1">
            <p>Exame realizado em: {new Date(exame.created_at).toLocaleString('pt-BR')}</p>
            {exame.updated_at !== exame.created_at && (
              <p>Última atualização: {new Date(exame.updated_at).toLocaleString('pt-BR')}</p>
            )}
          </div>

          <div className="flex justify-end">
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExameViewModal;
