
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { AlertTriangle, Heart, Gift } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface CancelSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  clinicaId: string;
  onCancelComplete: () => void;
}

const CancelSubscriptionModal = ({ isOpen, onClose, clinicaId, onCancelComplete }: CancelSubscriptionModalProps) => {
  const [step, setStep] = useState(1);
  const [motivo, setMotivo] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const motivosCancelamento = [
    'Preço muito alto',
    'Não uso mais o sistema',
    'Encontrei uma alternativa melhor',
    'Problemas técnicos',
    'Fechamento da clínica',
    'Outro motivo'
  ];

  const ofertas = [
    {
      titulo: '50% de desconto por 3 meses',
      descricao: 'Continue usando com metade do preço',
      icone: Gift,
      valor: 'R$ 75,00/mês por 3 meses'
    },
    {
      titulo: 'Período de pausa gratuito',
      descricao: 'Pause sua assinatura por até 2 meses',
      icone: Heart,
      valor: 'Sem cobrança durante a pausa'
    }
  ];

  const handleRetentionOffer = (oferta: string) => {
    toast({
      title: "Oferta aplicada!",
      description: `${oferta} foi aplicada à sua conta. Você receberá um email com os detalhes.`,
    });
    onClose();
  };

  const handleConfirmCancel = async () => {
    if (!motivo) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um motivo para o cancelamento.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('cancel-subscription', {
        body: {
          clinicaId,
          motivo,
          feedback
        }
      });

      if (error) throw error;

      toast({
        title: "Assinatura cancelada",
        description: data.message || "Sua assinatura foi cancelada com sucesso.",
      });

      onCancelComplete();
      onClose();
    } catch (error) {
      console.error('Erro ao cancelar assinatura:', error);
      toast({
        title: "Erro no cancelamento",
        description: "Não foi possível cancelar a assinatura. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetModal = () => {
    setStep(1);
    setMotivo('');
    setFeedback('');
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        {step === 1 && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                Não queremos que você vá!
              </DialogTitle>
              <DialogDescription>
                Antes de cancelar, que tal uma dessas ofertas especiais?
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-3">
              {ofertas.map((oferta, index) => (
                <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                     onClick={() => handleRetentionOffer(oferta.titulo)}>
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <oferta.icone className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">{oferta.titulo}</h4>
                      <p className="text-sm text-gray-600">{oferta.descricao}</p>
                      <p className="text-sm font-medium text-green-600 mt-1">{oferta.valor}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={handleClose} className="flex-1">
                Manter Assinatura
              </Button>
              <Button variant="destructive" onClick={() => setStep(2)} className="flex-1">
                Continuar Cancelamento
              </Button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Cancelar Assinatura
              </DialogTitle>
              <DialogDescription>
                Nos ajude a melhorar: por que está cancelando?
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <RadioGroup value={motivo} onValueChange={setMotivo}>
                {motivosCancelamento.map((motivoItem) => (
                  <div key={motivoItem} className="flex items-center space-x-2">
                    <RadioGroupItem value={motivoItem} id={motivoItem} />
                    <Label htmlFor={motivoItem} className="text-sm">{motivoItem}</Label>
                  </div>
                ))}
              </RadioGroup>

              <div>
                <Label htmlFor="feedback">Comentários adicionais (opcional)</Label>
                <Textarea
                  id="feedback"
                  placeholder="Compartilhe suas sugestões ou experiência..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                Voltar
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleConfirmCancel}
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Cancelando...' : 'Confirmar Cancelamento'}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CancelSubscriptionModal;
