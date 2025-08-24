import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export const useGoogleAuth = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        }
      });

      if (error) {
        console.error('Erro no login com Google:', error);
        toast({
          title: "Erro no login",
          description: "Não foi possível fazer login com Google. Tente novamente.",
          variant: "destructive"
        });
        return;
      }

      // O redirecionamento será automático
      toast({
        title: "Redirecionando...",
        description: "Fazendo login com Google",
      });

    } catch (error) {
      console.error('Erro inesperado:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado no login com Google",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  

  const signUpWithGoogle = async (clinicData: any) => {
    try {
      setLoading(true);
      
      // Primeiro, fazer o login com Google
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/nova-clinica?step=complete`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        }
      });

      if (error) {
        console.error('Erro no cadastro com Google:', error);
        toast({
          title: "Erro no cadastro",
          description: "Não foi possível cadastrar com Google. Tente novamente.",
          variant: "destructive"
        });
        return;
      }

      // Salvar dados da clínica no localStorage para completar após o login
      localStorage.setItem('pending_clinic_data', JSON.stringify(clinicData));

      toast({
        title: "Redirecionando...",
        description: "Fazendo cadastro com Google",
      });

    } catch (error) {
      console.error('Erro inesperado:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado no cadastro com Google",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    signInWithGoogle,
    signUpWithGoogle,
    loading
  };
};