import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MedicoAuthState {
  isAuthenticated: boolean;
  medico: any | null;
  loading: boolean;
}

export const useMedicoAuth = () => {
  const [authState, setAuthState] = useState<MedicoAuthState>({
    isAuthenticated: false,
    medico: null,
    loading: true
  });
  const { toast } = useToast();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    try {
      const medicoAuth = localStorage.getItem('medicoAuth');
      
      if (medicoAuth) {
        const parsedData = JSON.parse(medicoAuth);
        if (parsedData.authenticated) {
          setAuthState({
            isAuthenticated: true,
            medico: parsedData,
            loading: false
          });
          console.log('✅ Médico autenticado encontrado:', parsedData.nome);
          return;
        }
      }
      
      console.log('ℹ️ Nenhuma sessão de médico válida encontrada');
      setAuthState({
        isAuthenticated: false,
        medico: null,
        loading: false
      });
    } catch (error) {
      console.error('Erro ao verificar status de autenticação do médico:', error);
      localStorage.removeItem('medicoAuth');
      setAuthState({
        isAuthenticated: false,
        medico: null,
        loading: false
      });
    }
  };

  const login = async (cpf: string, senha: string) => {
    try {
      // Sanitizar CPF
      const cpfLimpo = cpf.replace(/\D/g, '');
      
      console.log('🔐 Tentando autenticar médico demo:', { cpf: cpfLimpo });
      
      // Demo: simular login de médico
      if (cpfLimpo === '12345678901' && senha === 'medico123') {
        const medicoDemo = {
          id: 'medico-demo-1',
          nome_completo: 'Dr. João Médico Demo',
          cpf: cpfLimpo,
          crm: '12345-SP',
          especialidade: 'Cardiologia',
          ativo: true
        };

        console.log('✅ Médico demo encontrado:', medicoDemo.nome_completo);

        // Configurar contexto da clínica demo
        const clinicaDemo = {
          id: 'clinica-demo-1'
        };

        localStorage.setItem('tenant_id', clinicaDemo.id);
        localStorage.setItem('clinica_id', clinicaDemo.id);

        // Salvar dados do médico
        const authData = {
          id: medicoDemo.id,
          nome: medicoDemo.nome_completo,
          cpf: medicoDemo.cpf,
          crm: medicoDemo.crm,
          especialidade: medicoDemo.especialidade,
          authenticated: true,
          loginTime: new Date().toISOString()
        };

        localStorage.setItem('medicoAuth', JSON.stringify(authData));

        // Atualizar estado
        setAuthState({
          isAuthenticated: true,
          medico: authData,
          loading: false
        });

        // Demo: simular registro de sessão
        console.log('Demo: Sessão de médico registrada');

        toast({
          title: "Login realizado com sucesso!",
          description: `Bem-vindo, Dr(a) ${medicoDemo.nome_completo}! (Demo)`,
        });

        return true;
      } else {
        console.log('❌ Credenciais demo incorretas');
        toast({
          title: "Credenciais incorretas",
          description: "Use CPF: 123.456.789-01 e Senha: medico123 (Demo)",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error('Erro demo no login do médico:', error);
      toast({
        title: "Erro no login",
        description: "Ocorreu um erro durante o login. Tente novamente.",
        variant: "destructive"
      });
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('medicoAuth');
    localStorage.removeItem('tenant_id');
    localStorage.removeItem('clinica_id');
    
    setAuthState({
      isAuthenticated: false,
      medico: null,
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