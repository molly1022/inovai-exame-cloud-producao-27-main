import { useState } from "react";
import { toast } from "sonner";
import { useClinica } from "@/hooks/useClinica";

export const useAtestadoPDF = () => {
  const [loading, setLoading] = useState(false);
  const { clinica } = useClinica();

  const gerarAtestadoPDF = async (atestadoId: string) => {
    try {
      setLoading(true);
      console.log('Tentativa de gerar PDF do atestado:', atestadoId);

      // Simulação para demonstração
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Funcionalidade disponível apenas com banco operacional conectado");
      
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.error("Erro ao gerar PDF do atestado. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return {
    gerarAtestadoPDF,
    loading
  };
};