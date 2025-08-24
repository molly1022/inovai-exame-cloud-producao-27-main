
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MedicoPasswordState {
  senhaAtual: string;
  loading: boolean;
  error: string;
}

export const useMedicoPassword = (medicoId?: string) => {
  const [passwordState, setPasswordState] = useState<MedicoPasswordState>({
    senhaAtual: '',
    loading: false,
    error: '',
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Reset imediato do estado quando medicoId muda ou é undefined
    setPasswordState({
      senhaAtual: '',
      loading: false,
      error: '',
    });

    if (!medicoId) {
      return;
    }

    const loadMedicoPassword = async () => {
      setPasswordState(prev => ({ ...prev, loading: true, error: '' }));
      
      try {
        console.log('Demo: Carregando senha para médico ID:', medicoId);
        
        // Demo: simular carregamento
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Demo: retornar senha padrão
        setPasswordState({
          senhaAtual: 'demo123',
          loading: false,
          error: '',
        });
      } catch (error) {
        console.error('Erro demo ao carregar senha do médico:', error);
        setPasswordState({
          senhaAtual: '',
          loading: false,
          error: 'Erro demo ao carregar senha do médico',
        });
      }
    };

    loadMedicoPassword();
  }, [medicoId]);

  const criarLoginMedico = async (medicoId: string, cpf: string, senha: string) => {
    try {
      setLoading(true);
      
      // Demo: simular criação/atualização de login
      console.log('Demo: Criando/atualizando login para médico:', medicoId);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Sucesso",
        description: "Login demo criado/atualizado para o médico!"
      });

      return { success: true };
    } catch (error) {
      console.error('Erro demo ao criar/atualizar login do médico:', error);
      toast({
        title: "Erro",
        description: "Erro demo ao configurar senha do médico",
        variant: "destructive"
      });
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  return {
    ...passwordState,
    criarLoginMedico,
    loading
  };
};
