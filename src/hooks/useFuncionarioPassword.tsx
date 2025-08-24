
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useFuncionarioPassword = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const criarLoginFuncionario = async (funcionarioId: string, cpf: string, senha: string) => {
    try {
      setLoading(true);
      
      // Demo: simular criação/atualização de login
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Sucesso",
        description: "Login demo criado/atualizado para o funcionário!"
      });

      return { success: true };
    } catch (error) {
      console.error('Erro demo ao criar/atualizar login do funcionário:', error);
      toast({
        title: "Erro",
        description: "Erro demo ao configurar senha do funcionário",
        variant: "destructive"
      });
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  const obterSenhaAtual = async (funcionarioId: string) => {
    try {
      // Demo: retornar senha padrão
      return 'demo123';
    } catch (error) {
      console.error('Erro demo ao obter senha do funcionário:', error);
      return '';
    }
  };

  return {
    criarLoginFuncionario,
    obterSenhaAtual,
    loading
  };
};
