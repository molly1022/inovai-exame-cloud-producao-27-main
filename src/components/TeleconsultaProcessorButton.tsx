import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Video, Loader2, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const TeleconsultaProcessorButton = () => {
  const [processing, setProcessing] = useState(false);

  const processarTeleconsultas = async () => {
    setProcessing(true);
    
    try {
      toast.info('Processando teleconsultas pendentes...');
      
      const { data, error } = await supabase.functions.invoke('processar-teleconsultas-pendentes');
      
      if (error) {
        console.error('Erro ao processar teleconsultas:', error);
        toast.error('Erro ao processar teleconsultas');
        return;
      }
      
      if (data) {
        const { processadas, total_pendentes, message } = data;
        
        if (processadas > 0) {
          toast.success(`✅ ${message} (${processadas}/${total_pendentes})`);
        } else {
          toast.info('Nenhuma teleconsulta pendente encontrada');
        }
      }
      
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast.error('Erro inesperado ao processar teleconsultas');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Button
      onClick={processarTeleconsultas}
      disabled={processing}
      variant="outline"
      size="sm"
      className="flex items-center gap-2"
    >
      {processing ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Video className="h-4 w-4" />
      )}
      {processing ? 'Processando...' : 'Criar Salas Pendentes'}
    </Button>
  );
};

export default TeleconsultaProcessorButton;