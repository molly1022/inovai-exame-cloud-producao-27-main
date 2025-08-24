import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useClinica } from "@/hooks/useClinica";

interface AutomacaoConfig {
  auto_confirmacao_minutos: number;
  tolerancia_atraso_minutos: number;
  tempo_minimo_consulta_minutos: number;
  horario_inicio: string;
  horario_fim: string;
  dias_funcionamento: number[];
  ativo: boolean;
}

export const useAutomacaoConfig = () => {
  const [config, setConfig] = useState<AutomacaoConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { clinica } = useClinica();

  const fetchConfig = async () => {
    try {
      setLoading(true);
      
      // Retornar configuração padrão para demonstração
      const defaultConfig: AutomacaoConfig = {
        auto_confirmacao_minutos: 30,
        tolerancia_atraso_minutos: 15,
        tempo_minimo_consulta_minutos: 10,
        horario_inicio: '08:00',
        horario_fim: '18:00',
        dias_funcionamento: [1, 2, 3, 4, 5],
        ativo: true
      };
      
      setConfig(defaultConfig);
      
    } catch (error) {
      console.error('Erro ao buscar configuração:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar configurações de automação"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = async (newConfig: Partial<AutomacaoConfig>) => {
    try {
      setLoading(true);
      
      // Simular atualização para demonstração
      if (config) {
        const updatedConfig = { ...config, ...newConfig };
        setConfig(updatedConfig);
        
        toast({
          title: "Sucesso",
          description: "Configurações atualizadas (modo demonstração)"
        });
      }
      
    } catch (error) {
      console.error('Erro ao atualizar configuração:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar configurações"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  return {
    config,
    loading,
    updateConfig,
    refetch: fetchConfig
  };
};