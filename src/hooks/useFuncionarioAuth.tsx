
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import SecurityUtils from '@/utils/securityUtils';

interface FuncionarioAuthState {
  isAuthenticated: boolean;
  funcionarioEmail: string | null;
  funcionarioId: string | null;
  funcionarioNome: string | null;
}

export const useFuncionarioAuth = () => {
  const [authState, setAuthState] = useState<FuncionarioAuthState>({
    isAuthenticated: false,
    funcionarioEmail: null,
    funcionarioId: null,
    funcionarioNome: null,
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    const funcionarioLoggedIn = localStorage.getItem('funcionario_logged');
    const funcionarioEmail = localStorage.getItem('funcionario_email');
    const funcionarioId = localStorage.getItem('funcionario_id');
    const funcionarioNome = localStorage.getItem('funcionario_nome');
    
    if (funcionarioLoggedIn === 'true' && funcionarioEmail && funcionarioId) {
      setAuthState({
        isAuthenticated: true,
        funcionarioEmail,
        funcionarioId,
        funcionarioNome,
      });
    }
    setLoading(false);
  };

  const login = async (cpf: string, senha: string) => {
    try {
      // Sanitizar entradas usando SecurityUtils
      const sanitizedCpf = SecurityUtils.sanitizeInput(cpf.replace(/\D/g, ''));
      const sanitizedSenha = SecurityUtils.sanitizeInput(senha);

      SecurityUtils.secureLog('info', 'Iniciando login de funcionário demo');

      // Demo: simular login de funcionário
      if (sanitizedCpf === '12345678901' && sanitizedSenha === 'demo123') {
        const funcionarioDemo = {
          id: 'func-demo-1',
          nome_completo: 'João Funcionário Demo',
          email: 'funcionario@demo.com',
          cpf: sanitizedCpf,
          ativo: true
        };

        const clinicaDemo = {
          id: 'clinica-demo-1',
          nome: 'Clínica Demo',
          subdominio: 'demo'
        };

        SecurityUtils.secureLog('info', 'Login de funcionário demo autorizado');

        // Configurar contexto da clínica
        localStorage.setItem('tenant_id', clinicaDemo.id);
        localStorage.setItem('clinica_id', clinicaDemo.id);
        localStorage.setItem('clinica_nome', clinicaDemo.nome);
        localStorage.setItem('tenant_subdominio', clinicaDemo.subdominio);

        // Salvar dados do funcionário
        localStorage.setItem('funcionario_logged', 'true');
        localStorage.setItem('funcionario_auth_token', `func_${Date.now()}_${Math.random()}`);
        localStorage.setItem('funcionario_email', funcionarioDemo.email);
        localStorage.setItem('funcionario_id', funcionarioDemo.id);
        localStorage.setItem('funcionario_nome', funcionarioDemo.nome_completo);
        
        // Atualizar estado
        setAuthState({
          isAuthenticated: true,
          funcionarioEmail: funcionarioDemo.email,
          funcionarioId: funcionarioDemo.id,
          funcionarioNome: funcionarioDemo.nome_completo,
        });

        // Registrar login demo
        await registrarLogin(funcionarioDemo.id, clinicaDemo.id);

        toast({
          title: "Login realizado com sucesso!",
          description: `Bem-vindo, ${funcionarioDemo.nome_completo}! (Demo)`,
        });

        return { success: true };
      } else {
        SecurityUtils.secureLog('warn', 'Credenciais demo incorretas');
        toast({
          title: "Credenciais incorretas",
          description: "Use CPF: 123.456.789-01 e Senha: demo123",
          variant: "destructive"
        });
        return { success: false };
      }
    } catch (error) {
      SecurityUtils.secureLog('error', 'Erro demo no login de funcionário', SecurityUtils.maskSensitiveData(error));
      toast({
        title: "Erro no login",
        description: "Ocorreu um erro durante o login. Tente novamente.",
        variant: "destructive"
      });
      return { success: false };
    }
  };

  const registrarLogin = async (funcionarioId: string, clinicaId: string) => {
    try {
      // Demo: simular registro de login
      console.log('Login funcionário demo registrado:', funcionarioId, clinicaId);
    } catch (error) {
      SecurityUtils.secureLog('error', 'Erro demo ao registrar login', SecurityUtils.maskSensitiveData(error));
    }
  };

  const logout = async () => {
    const funcionarioId = localStorage.getItem('funcionario_id');
    
    // Demo: registrar logout
    if (funcionarioId) {
      console.log('Logout funcionário demo:', funcionarioId);
    }

    // Limpar dados do funcionário e tenant
    localStorage.removeItem('funcionario_logged');
    localStorage.removeItem('funcionario_auth_token');
    localStorage.removeItem('funcionario_email');
    localStorage.removeItem('funcionario_id');
    localStorage.removeItem('funcionario_nome');
    localStorage.removeItem('tenant_id');
    localStorage.removeItem('clinica_id');
    localStorage.removeItem('clinica_nome');
    localStorage.removeItem('tenant_subdominio');
    
    setAuthState({
      isAuthenticated: false,
      funcionarioEmail: null,
      funcionarioId: null,
      funcionarioNome: null,
    });

    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso",
    });
  };

  return {
    ...authState,
    loading,
    login,
    logout,
    checkAuthStatus
  };
};
