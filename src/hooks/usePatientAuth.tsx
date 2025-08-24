import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PatientAuthState {
  isAuthenticated: boolean;
  paciente: any | null;
  loading: boolean;
}

export const usePatientAuth = () => {
  const [authState, setAuthState] = useState<PatientAuthState>({
    isAuthenticated: false,
    paciente: null,
    loading: true
  });
  const { toast } = useToast();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    try {
      const pacienteLoggedIn = localStorage.getItem('paciente_logged');
      const pacienteData = localStorage.getItem('paciente_data');
      
      if (pacienteLoggedIn === 'true' && pacienteData) {
        const parsedData = JSON.parse(pacienteData);
        setAuthState({
          isAuthenticated: true,
          paciente: parsedData,
          loading: false
        });
      } else {
        setAuthState({
          isAuthenticated: false,
          paciente: null,
          loading: false
        });
      }
    } catch (error) {
      console.error('Erro ao verificar status de autenticação do paciente:', error);
      setAuthState({
        isAuthenticated: false,
        paciente: null,
        loading: false
      });
    }
  };

  const login = async (cpf: string, senha: string) => {
    try {
      // Sanitizar CPF
      const cpfLimpo = cpf.replace(/\D/g, '');
      
      console.log('🔐 Demo: Tentando autenticar paciente:', { cpf: cpfLimpo });
      
      // Demo: simular busca de paciente
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const pacienteDemo = {
        id: 'pac_123',
        nome: 'João Silva',
        cpf: cpfLimpo,
        email: 'joao@example.com',
        telefone: '(11) 99999-9999',
        senha_acesso: 'demo123'
      };

      console.log('✅ Demo: Paciente encontrado:', pacienteDemo.nome);

      // Demo: verificar senha
      if (pacienteDemo.senha_acesso !== senha) {
        console.log('❌ Demo: Senha incorreta');
        toast({
          title: "Senha incorreta",
          description: "A senha informada está incorreta.",
          variant: "destructive"
        });
        return false;
      }

      console.log('✅ Demo: Paciente autenticado com sucesso');

      // Demo: simular dados da clínica
      const clinicaId = 'clinica_demo_123';
      localStorage.setItem('tenant_id', clinicaId);
      localStorage.setItem('clinica_id', clinicaId);

      // Salvar dados do paciente (sem a senha)
      const authData = {
        id: pacienteDemo.id,
        nome: pacienteDemo.nome,
        cpf: pacienteDemo.cpf,
        email: pacienteDemo.email,
        telefone: pacienteDemo.telefone,
        authenticated: true,
        loginTime: new Date().toISOString()
      };

      localStorage.setItem('paciente_logged', 'true');
      localStorage.setItem('paciente_data', JSON.stringify(authData));

      // Atualizar estado
      setAuthState({
        isAuthenticated: true,
        paciente: authData,
        loading: false
      });

      toast({
        title: "Login realizado com sucesso!",
        description: `Bem-vindo(a), ${pacienteDemo.nome}!`,
      });

      return true;
    } catch (error) {
      console.error('Erro no login do paciente:', error);
      toast({
        title: "Erro no login",
        description: "Ocorreu um erro durante o login. Tente novamente.",
        variant: "destructive"
      });
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('paciente_logged');
    localStorage.removeItem('paciente_data');
    localStorage.removeItem('tenant_id');
    localStorage.removeItem('clinica_id');
    
    setAuthState({
      isAuthenticated: false,
      paciente: null,
      loading: false
    });

    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso",
    });
  };

  return {
    ...authState,
    login,
    logout,
    checkAuthStatus
  };
};