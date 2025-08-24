
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface TemplatePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  templateName: string;
  templateHtml: string;
}

const TemplatePreviewModal = ({ isOpen, onClose, templateName, templateHtml }: TemplatePreviewModalProps) => {
  const getPreviewHtml = () => {
    const amanha = new Date();
    amanha.setDate(amanha.getDate() + 1);
    
    // Template de exemplo para pagamento
    const pagamentoInfoTeste = `
      <div class="payment-card">
        <h3>✅ Informações de Pagamento</h3>
        <p><strong>Status:</strong> <span class="money">Pagamento confirmado</span></p>
        <p><strong>Valor total:</strong> <span class="money">R$ 250,00</span></p>
        <p>✅ Sua consulta está totalmente quitada. Não é necessário levar dinheiro.</p>
      </div>
    `;
    
    return templateHtml
      // Variáveis de clínica
      .replace(/\{clinica_nome\}/g, 'Memorial Mangabeira')
      .replace(/\{nomeClinica\}/g, 'Memorial Mangabeira')
      .replace(/\{clinica_email\}/g, 'contato@memorialmangabeira.com.br')
      .replace(/\{clinica_telefone\}/g, '(83) 3333-4444')
      .replace(/\{clinica_endereco\}/g, 'Av. Principal, 123 - Mangabeira, João Pessoa - PB')
      
      // Variáveis de paciente
      .replace(/\{paciente_nome\}/g, 'Maria Silva')
      .replace(/\{nomePaciente\}/g, 'Maria Silva')
      
      // Variáveis de agendamento
      .replace(/\{data_agendamento\}/g, amanha.toLocaleDateString('pt-BR', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }))
      .replace(/\{dataAgendamento\}/g, amanha.toLocaleDateString('pt-BR', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }))
      .replace(/\{horario\}/g, '14:30')
      .replace(/\{tipo_exame\}/g, 'Ultrassom Abdominal')
      .replace(/\{tipoExame\}/g, 'Ultrassom Abdominal')
      
      // Variáveis de médico
      .replace(/\{medico_nome\}/g, 'Dr. João Santos')
      .replace(/\{nomeMedico\}/g, 'Dr. João Santos')
      .replace(/\{medico_crm\}/g, 'CRM 12345-PB')
      .replace(/\{medico_especialidade\}/g, 'Radiologista')
      
      // Variáveis de convênio
      .replace(/\{convenio_nome\}/g, 'Unimed')
      .replace(/\{numero_convenio_info\}/g, '- Nº 123456789')
      
      // Variáveis dinâmicas
      .replace(/\{pagamento_info\}/g, pagamentoInfoTeste)
      .replace(/\{data_envio\}/g, new Date().toLocaleDateString('pt-BR', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Preview do Template: {templateName}</DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="mt-4">
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h4 className="font-medium text-sm text-gray-700 mb-2">
              📧 Visualização do Email (dados de exemplo)
            </h4>
            <div className="text-xs text-gray-500 space-y-1">
              <p><strong>De:</strong> Memorial Mangabeira &lt;noreply@memorialmangabeira.pro&gt;</p>
              <p><strong>Para:</strong> Maria Silva &lt;maria.silva@email.com&gt;</p>
              <p><strong>Assunto:</strong> Lembrete: Consulta agendada para amanhã</p>
            </div>
          </div>
          
          <div 
            className="border rounded-lg p-4 bg-white max-h-96 overflow-y-auto"
            style={{ 
              minHeight: '300px',
              fontFamily: 'Arial, sans-serif'
            }}
            dangerouslySetInnerHTML={{ __html: getPreviewHtml() }}
          />
          
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              💡 <strong>Dica:</strong> As variáveis como {'{nomePaciente}'}, {'{dataAgendamento}'}, etc. 
              serão automaticamente substituídas pelos dados reais quando o email for enviado.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TemplatePreviewModal;
