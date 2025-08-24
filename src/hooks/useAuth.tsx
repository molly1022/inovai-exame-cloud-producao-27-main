import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useTenantId } from '@/hooks/useTenantId';

interface AuthState {
  isAuthenticated: boolean;
  clinicaEmail: string | null;
  clinicaId: string | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    clinicaEmail: null,
    clinicaId: null
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { clinicaId, isValid: isTenantValid } = useTenantId();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    try {
      const clinicaLoggedIn = localStorage.getItem('clinica_logged');
      const clinicaEmail = localStorage.getItem('clinica_email');
      const clinicaId = localStorage.getItem('clinica_id');
      const sessionToken = localStorage.getItem('clinica_session_token');
      
      if (clinicaLoggedIn === 'true' && clinicaEmail && clinicaId && sessionToken) {
        setAuthState({
          isAuthenticated: true,
          clinicaEmail: clinicaEmail,
          clinicaId: clinicaId
        });
      } else {
        // Limpar dados inválidos ou incompletos
        localStorage.clear();
      }
    } catch (error) {
      console.error('Erro ao verificar status de autenticação:', error);
      localStorage.clear();
    }
    setLoading(false);
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('Tentativa de login:', { email });
      
      // Validação simples para demonstração
      if (!email || !password) {
        toast({
          title: "Campos obrigatórios",
          description: "Email e senha são obrigatórios",
          variant: "destructive"
        });
        return { success: false };
      }

      // Obter tenantId sempre, mesmo se tenant não estiver totalmente carregado
      const tenantId = clinicaId;
      if (!isTenantValid || !tenantId) {
        toast({
          title: "Erro",
          description: "Clínica não encontrada para este subdomínio",
          variant: "destructive"
        });
        return { success: false };
      }

      // Simulação de login para demonstração
      // Em produção, isso faria verificação real com banco de dados
      console.log('Sistema em modo demonstração - login simulado');
      
      // Salvar sessão simulada
      localStorage.setItem('clinica_logged', 'true');
      localStorage.setItem('clinica_email', email);
      localStorage.setItem('clinica_id', tenantId);
      localStorage.setItem('clinica_session_token', 'demo_token_' + Date.now());
      
      setAuthState({
        isAuthenticated: true,
        clinicaEmail: email,
        clinicaId: tenantId
      });

      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo ao dashboard da clínica!",
      });

      return { success: true };

    } catch (error: any) {
      console.error('Erro no login:', error);
      toast({
        title: "Erro",
        description: "Erro interno do sistema. Tente novamente.",
        variant: "destructive"
      });
      return { success: false };
    }
  };

  const logout = () => {
    try {
      // Limpeza de todos os dados
      localStorage.clear();
      
      setAuthState({
        isAuthenticated: false,
        clinicaEmail: null,
        clinicaId: null
      });

      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso",
      });
    } catch (error) {
      console.error('Erro durante logout:', error);
    }
  };

  return {
    ...authState,
    loading,
    login,
    logout,
    checkAuthStatus
  };
};