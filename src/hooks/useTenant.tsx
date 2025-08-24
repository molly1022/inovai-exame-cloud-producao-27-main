
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Tenant {
  id: string;
  nome: string;
  subdominio: string;
  email: string;
  telefone?: string;
  endereco?: string;
  foto_perfil_url?: string;
}

export const useTenant = () => {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Buscar dados da clínica baseado no tenant_id armazenado após login
  useEffect(() => {
    let isMounted = true;

    const fetchTenant = async () => {
      try {
        // Buscar tenant_id do localStorage (definido após login)
        const tenantId = localStorage.getItem('tenant_id');
        
        if (!tenantId) {
          console.log('❌ Nenhum tenant_id encontrado - usuário não logado');
          setError('Usuário não autenticado');
          setTenant(null);
          setLoading(false);
          return;
        }

        console.log('🔄 Buscando clínica por ID:', tenantId);
        
      const { data, error } = await supabase
        .from('clinicas_central')
        .select('*')
        .eq('id', tenantId)
        .single();

        if (!isMounted) return;

        if (error) {
          console.error('❌ Erro ao buscar clínica:', error);
          setError('Clínica não encontrada');
          setTenant(null);
        } else {
          console.log('✅ Clínica encontrada:', data.nome);
          setTenant(data);
          setError(null);
          
          // Garantir consistência dos dados no localStorage
          localStorage.setItem('tenant_id', data.id);
          localStorage.setItem('clinica_id', data.id);
          localStorage.setItem('clinica_nome', data.nome);
          if (data.subdominio) {
            localStorage.setItem('tenant_subdominio', data.subdominio);
          }
        }
      } catch (err) {
        if (!isMounted) return;
        console.error('💥 Erro na busca:', err);
        setError('Erro ao conectar com o servidor');
        setTenant(null);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchTenant();

    return () => {
      isMounted = false;
    };
  }, []);

  const isTenantValid = () => {
    return tenant !== null && !error;
  };

  const getTenantId = () => {
    return tenant?.id || localStorage.getItem('tenant_id') || '';
  };

  const clearAllAuth = () => {
    // Lista completa de todas as chaves possíveis de autenticação
    const authKeys = [
      'isAuthenticated',
      'clinicaEmail',
      'clinicaNome',
      'tenant_id',
      'clinica_id',
      'tenant_subdominio',
      'funcionario_logged',
      'funcionario_email',
      'funcionario_nome',
      'funcionario_id',
      'funcionario_clinica_id',
      'funcionario_auth_token',
      'medicoAuth',
      'paciente_logged',
      'paciente_id',
      'paciente_nome'
    ];

    // Remover todas as chaves de uma vez
    authKeys.forEach(key => {
      localStorage.removeItem(key);
    });

    console.log('🧹 Todos os dados de autenticação foram limpos');
  };

  const logout = () => {
    console.log('🚪 Iniciando logout...');
    
    // Limpar todos os dados de autenticação
    clearAllAuth();
    
    // Resetar estados locais
    setTenant(null);
    setError(null);
    setLoading(false);
    
    console.log('✅ Logout concluído - redirecionando para página inicial');
    
    // Forçar redirecionamento para página inicial
    window.location.href = '/';
  };

  return {
    tenant,
    subdominio: tenant?.subdominio || '',
    loading,
    error,
    isTenantValid,
    getTenantId,
    logout,
    clearAllAuth
  };
};
