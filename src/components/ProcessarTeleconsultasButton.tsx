import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Video } from 'lucide-react';

export const ProcessarTeleconsultasButton = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleProcessar = async () => {
    setIsProcessing(true);
    
    try {
      console.log('Iniciando processamento de teleconsultas pendentes...');
      
      const { data, error } = await supabase.functions.invoke('processar-teleconsultas-pendentes');
      
      if (error) {
        console.error('Erro ao processar teleconsultas:', error);
        throw error;
      }
      
      console.log('Resultado do processamento:', data);
      
      toast({
        title: "Processamento Concluído",
        description: data.message || `${data.processadas} salas de teleconsulta criadas com sucesso!`,
      });
      
    } catch (error: any) {
      console.error('Erro no processamento:', error);
      toast({
        title: "Erro",
        description: "Erro ao processar teleconsultas. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Button 
      onClick={handleProcessar} 
      disabled={isProcessing}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      {isProcessing ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Video className="h-4 w-4" />
      )}
      {isProcessing ? 'Processando...' : 'Processar Teleconsultas'}
    </Button>
  );
};