
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Printer, X, AlertTriangle, FileText } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useClinica } from '@/hooks/useClinica';

interface ReceitaViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  receita: any;
}

const ReceitaViewModal = ({ isOpen, onClose, receita }: ReceitaViewModalProps) => {
  const { clinica } = useClinica();
  const [logoError, setLogoError] = useState(false);

  if (!receita) return null;

  const getTipoReceitaLabel = (tipo: string) => {
    return tipo === 'controle_especial' ? 'Receita de Controle Especial' : 'Receita Básica';
  };

  const getTipoReceitaBadge = (tipo: string) => {
    if (tipo === 'controle_especial') {
      return (
        <Badge className="bg-orange-100 text-orange-800 border-orange-300">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Controle Especial
        </Badge>
      );
    }
    return (
      <Badge className="bg-blue-100 text-blue-800 border-blue-300">
        <FileText className="h-3 w-3 mr-1" />
        Receita Básica
      </Badge>
    );
  };

  // Função para formatar o endereço completo
  const formatarEnderecoCompleto = (paciente: any) => {
    if (!paciente) return '';
    
    const enderecoParts = [];
    
    if (paciente.endereco_completo) {
      enderecoParts.push(paciente.endereco_completo);
    }
    
    if (paciente.numero) {
      enderecoParts.push(`Nº ${paciente.numero}`);
    }
    
    if (paciente.complemento) {
      enderecoParts.push(paciente.complemento);
    }
    
    if (paciente.bairro) {
      enderecoParts.push(`Bairro: ${paciente.bairro}`);
    }
    
    if (paciente.cidade || paciente.estado) {
      const cidadeEstado = [paciente.cidade, paciente.estado].filter(Boolean).join(' - ');
      if (cidadeEstado) {
        enderecoParts.push(cidadeEstado);
      }
    }
    
    if (paciente.cep) {
      enderecoParts.push(`CEP: ${paciente.cep}`);
    }
    
    return enderecoParts.join(', ');
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const logoUrl = clinica?.foto_perfil_url;
      
      // Converter logo para base64 para evitar problemas de carregamento na impressão
      const getLogoBase64 = async () => {
        if (!logoUrl || logoError) return '';
        
        try {
          const response = await fetch(logoUrl);
          const blob = await response.blob();
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
          });
        } catch (error) {
          console.error('Erro ao carregar logo:', error);
          return '';
        }
      };

      const generatePrintContent = (logoBase64: string = '') => {
        const isControleEspecial = receita.tipo_receita === 'controle_especial';
        const tipoReceitaTitle = isControleEspecial ? 'RECEITA DE CONTROLE ESPECIAL' : 'RECEITA MÉDICA';
        
        const enderecoCompleto = formatarEnderecoCompleto(receita.pacientes);
        
        const logoImg = logoBase64 ? 
          `<img src="${logoBase64}" alt="Logo da Clínica" class="logo">` : 
          '';

        return `
          <!DOCTYPE html>
          <html>
            <head>
              <title>${tipoReceitaTitle}</title>
              <style>
                @media print {
                  @page {
                    margin: 15mm 10mm;
                    size: A4;
                  }
                  
                  body {
                    -webkit-print-color-adjust: exact !important;
                    color-adjust: exact !important;
                    print-color-adjust: exact !important;
                  }
                  
                  .logo {
                    max-width: 80px !important;
                    max-height: 50px !important;
                    object-fit: contain !important;
                    display: block !important;
                  }
                  
                  .break-avoid {
                    page-break-inside: avoid !important;
                    break-inside: avoid !important;
                  }
                }
                
                body { 
                  font-family: Arial, sans-serif; 
                  margin: 0; 
                  padding: 15px;
                  line-height: 1.3;
                  font-size: 11px;
                }
                .header { 
                  display: flex;
                  align-items: center;
                  justify-content: space-between;
                  border-bottom: 2px solid #333; 
                  padding-bottom: 10px; 
                  margin-bottom: 15px;
                  ${isControleEspecial ? 'border-color: #ea580c;' : ''}
                }
                .logo-section {
                  flex: 1;
                  min-height: 50px;
                  display: flex;
                  align-items: center;
                }
                .logo {
                  max-width: 80px;
                  max-height: 50px;
                  object-fit: contain;
                  display: block;
                }
                .clinic-info { 
                  flex: 2;
                  text-align: center;
                }
                .clinic-name {
                  font-size: 16px; 
                  font-weight: bold;
                  margin-bottom: 3px;
                }
                .clinic-details {
                  font-size: 10px;
                  color: #666;
                  margin-bottom: 3px;
                }
                .prescription-title {
                  font-size: 14px; 
                  font-weight: bold;
                  color: ${isControleEspecial ? '#ea580c' : '#333'};
                  ${isControleEspecial ? 'text-transform: uppercase;' : ''}
                }
                .info-section { 
                  margin: 10px 0; 
                  padding: 8px; 
                  background: #f8f8f8;
                  border-radius: 3px;
                  font-size: 10px;
                }
                .doctor-info { 
                  display: flex;
                  justify-content: space-between;
                  align-items: flex-start;
                  gap: 15px;
                }
                .patient-info { 
                  display: flex;
                  justify-content: space-between;
                  align-items: flex-start;
                  gap: 15px;
                }
                .patient-address {
                  margin-top: 8px;
                  padding: 6px;
                  background: #e8f4fd;
                  border-left: 3px solid #2563eb;
                  border-radius: 2px;
                  font-size: 9px;
                }
                .prescription { 
                  margin: 15px 0; 
                  padding: 12px; 
                  border: 2px solid ${isControleEspecial ? '#ea580c' : '#ccc'};
                  min-height: 120px;
                  border-radius: 3px;
                  ${isControleEspecial ? 'background: #fff7ed;' : ''}
                  font-size: 11px;
                }
                .observations { 
                  margin: 10px 0; 
                  padding: 8px; 
                  background: #f9f9f9;
                  border-radius: 3px;
                  font-size: 10px;
                }
                .signature { 
                  margin-top: 20px; 
                  text-align: center;
                  font-size: 10px;
                }
                .signature-line { 
                  border-top: 1px solid #333; 
                  width: 250px; 
                  margin: 25px auto 8px;
                }
                .control-warning {
                  background: #fef3c7;
                  border: 1px solid #f59e0b;
                  padding: 8px;
                  margin: 10px 0;
                  border-radius: 3px;
                  font-weight: bold;
                  text-align: center;
                  color: #92400e;
                  font-size: 9px;
                }
                .tipo-badge {
                  display: inline-block;
                  padding: 2px 6px;
                  border-radius: 3px;
                  font-size: 9px;
                  font-weight: bold;
                  margin-left: 8px;
                  ${isControleEspecial 
                    ? 'background: #fed7aa; color: #9a3412; border: 1px solid #fdba74;' 
                    : 'background: #dbeafe; color: #1e40af; border: 1px solid #93c5fd;'
                  }
                }
                .address-label {
                  font-weight: bold;
                  color: #2563eb;
                  margin-bottom: 3px;
                }
                .flex-row {
                  display: flex;
                  gap: 10px;
                  align-items: flex-start;
                }
                .flex-col {
                  flex: 1;
                }
                .compact-section {
                  margin: 8px 0;
                  padding: 6px;
                  background: #f5f5f5;
                  border-radius: 3px;
                }
              </style>
            </head>
            <body>
              <div class="header break-avoid">
                <div class="logo-section">
                  ${logoImg}
                </div>
                <div class="clinic-info">
                  <div class="clinic-name">${clinica?.nome || 'Clínica Médica'}</div>
                  ${clinica?.endereco ? `<div class="clinic-details">${clinica.endereco}</div>` : ''}
                  ${clinica?.telefone ? `<div class="clinic-details">Tel: ${clinica.telefone}</div>` : ''}
                  ${clinica?.email ? `<div class="clinic-details">Email: ${clinica.email}</div>` : ''}
                  <div class="prescription-title">
                    ${tipoReceitaTitle}
                    <span class="tipo-badge">${getTipoReceitaLabel(receita.tipo_receita || 'basica')}</span>
                  </div>
                </div>
                <div style="flex: 1;"></div>
              </div>
              
              <div class="flex-row break-avoid">
                <div class="flex-col">
                  <div class="compact-section">
                    <strong>Médico:</strong> Dr(a). ${receita.medicos?.nome_completo || 'N/A'}<br/>
                    ${receita.medicos?.crm ? `<strong>CRM:</strong> ${receita.medicos.crm} ` : ''}
                    ${receita.medicos?.coren ? `<strong>COREN:</strong> ${receita.medicos.coren} ` : ''}
                    ${receita.medicos?.especialidade ? `<br/><strong>Especialidade:</strong> ${receita.medicos.especialidade}` : ''}
                    ${receita.medicos?.setor ? `<br/><strong>Setor:</strong> ${receita.medicos.setor}` : ''}
                  </div>
                </div>
                
                <div class="flex-col">
                  <div class="compact-section">
                    <strong>Paciente:</strong> ${receita.pacientes?.nome || 'N/A'}<br/>
                    <strong>CPF:</strong> ${receita.pacientes?.cpf || 'N/A'}<br/>
                    <strong>Data:</strong> ${new Date(receita.data_emissao).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              </div>

              ${enderecoCompleto ? `
                <div class="patient-address break-avoid">
                  <div class="address-label">📍 Endereço do Paciente:</div>
                  ${enderecoCompleto}
                </div>
              ` : ''}
              
              ${isControleEspecial ? `
                <div class="control-warning break-avoid">
                  ⚠️ RECEITA DE CONTROLE ESPECIAL - MEDICAMENTOS CONTROLADOS ⚠️
                </div>
              ` : ''}
              
              <div class="prescription break-avoid">
                <strong>PRESCRIÇÃO MÉDICA:</strong><br/><br/>
                ${receita.medicamentos.replace(/\n/g, '<br/>')}
              </div>
              
              ${receita.observacoes ? `
                <div class="observations break-avoid">
                  <strong>OBSERVAÇÕES:</strong><br/>
                  ${receita.observacoes.replace(/\n/g, '<br/>')}
                </div>
              ` : ''}
              
              ${isControleEspecial ? `
                <div class="control-warning break-avoid" style="margin-top: 15px; font-size: 9px;">
                  Esta receita deve ser retida pela farmácia conforme legislação vigente. Validade: 30 dias.<br/>
                  Lei nº 6.360/76 e Portaria SVS/MS nº 344/98
                </div>
              ` : ''}
              
              <div class="signature break-avoid">
                <div class="signature-line"></div>
                Assinatura e Carimbo do Médico
              </div>
              
              <div style="margin-top: 15px; font-size: 9px; color: #666; text-align: center;">
                Receita emitida em ${new Date().toLocaleString('pt-BR')}
              </div>
            </body>
          </html>
        `;
      };

      // Carregar logo e gerar conteúdo
      if (logoUrl && !logoError) {
        getLogoBase64().then((logoBase64: any) => {
          printWindow.document.write(generatePrintContent(logoBase64));
          printWindow.document.close();
          
          // Aguardar o carregamento das imagens antes de imprimir
          setTimeout(() => {
            printWindow.print();
          }, 1000);
        });
      } else {
        printWindow.document.write(generatePrintContent());
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  const enderecoCompleto = formatarEnderecoCompleto(receita.pacientes);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            Visualizar Receita Médica
            {getTipoReceitaBadge(receita.tipo_receita || 'basica')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Aviso para Receitas de Controle Especial */}
          {receita.tipo_receita === 'controle_especial' && (
            <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
                <div>
                  <h3 className="font-semibold text-orange-900">Receita de Controle Especial</h3>
                  <p className="text-sm text-orange-800">
                    Esta receita segue as normas para medicamentos controlados e psicotrópicos
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Cabeçalho com Logo e Informações da Clínica */}
          <div className="flex items-center justify-between border-b-2 border-gray-300 pb-4">
            <div className="flex-1 min-h-[80px] flex items-center">
              {clinica?.foto_perfil_url && !logoError && (
                <img 
                  src={clinica.foto_perfil_url} 
                  alt="Logo da Clínica" 
                  className="max-w-[120px] max-h-[80px] object-contain"
                  onError={() => setLogoError(true)}
                />
              )}
            </div>
            <div className="flex-2 text-center">
              <h2 className="text-xl font-bold mb-1">{clinica?.nome || 'Clínica Médica'}</h2>
              {clinica?.endereco && <p className="text-sm text-gray-600 mb-1">{clinica.endereco}</p>}
              {clinica?.telefone && <p className="text-sm text-gray-600 mb-1">Tel: {clinica.telefone}</p>}
              {clinica?.email && <p className="text-sm text-gray-600 mb-2">Email: {clinica.email}</p>}
              <h3 className={`text-lg font-semibold ${
                receita.tipo_receita === 'controle_especial' ? 'text-orange-800' : 'text-gray-800'
              }`}>
                {getTipoReceitaLabel(receita.tipo_receita || 'basica').toUpperCase()}
              </h3>
            </div>
            <div className="flex-1"></div>
          </div>

          {/* Informações do Médico */}
          <div className="bg-gray-50 p-4 rounded">
            <h3 className="font-semibold mb-2">Médico:</h3>
            <p><strong>Nome:</strong> Dr(a). {receita.medicos?.nome_completo || 'N/A'}</p>
            {receita.medicos?.crm && <p><strong>CRM:</strong> {receita.medicos.crm}</p>}
            {receita.medicos?.coren && <p><strong>COREN:</strong> {receita.medicos.coren}</p>}
            {receita.medicos?.especialidade && <p><strong>Especialidade:</strong> {receita.medicos.especialidade}</p>}
            {receita.medicos?.setor && <p><strong>Setor:</strong> {receita.medicos.setor}</p>}
          </div>

          {/* Informações do Paciente */}
          <div className="bg-blue-50 p-4 rounded">
            <h3 className="font-semibold mb-2">Paciente:</h3>
            <p><strong>Nome:</strong> {receita.pacientes?.nome || 'N/A'}</p>
            <p><strong>CPF:</strong> {receita.pacientes?.cpf || 'N/A'}</p>
            <p><strong>Data de Emissão:</strong> {new Date(receita.data_emissao).toLocaleDateString('pt-BR')}</p>
            
            {/* Endereço Completo do Paciente */}
            {enderecoCompleto && (
              <div className="mt-3 p-3 bg-blue-100 rounded border-l-4 border-blue-500">
                <h4 className="font-medium text-blue-900 mb-1">📍 Endereço Completo:</h4>
                <div className="text-sm text-blue-800">
                  {enderecoCompleto}
                </div>
              </div>
            )}
          </div>

          {/* Prescrições */}
          <div className={`border p-4 rounded min-h-[200px] ${
            receita.tipo_receita === 'controle_especial' 
              ? 'border-orange-300 bg-orange-50' 
              : 'border-gray-300'
          }`}>
            <h3 className="font-semibold mb-3">PRESCRIÇÃO MÉDICA:</h3>
            <div className="whitespace-pre-wrap">{receita.medicamentos}</div>
          </div>

          {/* Observações */}
          {receita.observacoes && (
            <div className="bg-yellow-50 p-4 rounded">
              <h3 className="font-semibold mb-2">OBSERVAÇÕES MÉDICAS:</h3>
              <div className="whitespace-pre-wrap">{receita.observacoes}</div>
            </div>
          )}

          {/* Aviso adicional para controle especial */}
          {receita.tipo_receita === 'controle_especial' && (
            <div className="bg-yellow-100 border border-yellow-400 p-4 rounded">
              <p className="text-sm text-yellow-800 font-medium text-center">
                ⚠️ Esta receita deve ser retida pela farmácia conforme legislação vigente.<br />
                Validade: 30 dias a partir da data de emissão.<br />
                Lei nº 6.360/76 e Portaria SVS/MS nº 344/98
              </p>
            </div>
          )}

          {/* Assinatura */}
          <div className="text-center mt-8 pt-8 border-t border-gray-200">
            <div className="w-80 mx-auto border-t border-gray-400 mt-12 mb-2"></div>
            <p className="text-sm text-gray-600">Assinatura e Carimbo do Médico</p>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              Fechar
            </Button>
            <Button 
              onClick={handlePrint}
              className={
                receita.tipo_receita === 'controle_especial'
                  ? "bg-gradient-to-r from-orange-600 to-red-600 text-white hover:from-orange-700 hover:to-red-700"
                  : "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
              }
            >
              <Printer className="h-4 w-4 mr-2" />
              Imprimir Receita
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReceitaViewModal;
