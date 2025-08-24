import { useState, useEffect } from 'react';
import { adminSupabase } from '@/integrations/supabase/adminClient';

interface ClinicaInfo {
  id: string;
  nome_clinica: string;
  subdominio: string;
  database_name: string;
  status: 'ativa' | 'suspensa' | 'cancelada';
  plano_contratado: string;
}

interface SubdomainRoutingState {
  clinica: ClinicaInfo | null;
  loading: boolean;
  error: string | null;
  isValidSubdomain: boolean;
}

/**
 * Hook para gerenciar roteamento baseado em subdomínio
 * Detecta o subdomínio e carrega informações da clínica correspondente
 */
export const useSubdomainRouting = () => {
  const [state, setState] = useState<SubdomainRoutingState>({
    clinica: null,
    loading: true,
    error: null,
    isValidSubdomain: false
  });

  useEffect(() => {
    const detectAndLoadClinica = async () => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));

        // Detectar subdomínio
        const hostname = window.location.hostname;
        let subdominio = '';

        console.log('🔍 Detectando subdomínio para hostname:', hostname);

        // Verificar se é ambiente de desenvolvimento ou produção
        if (hostname.includes('localhost') || hostname.includes('127.0.0.1') || hostname.includes('lovable.app')) {
          // Ambiente de desenvolvimento - usar subdomínio padrão para testes
          subdominio = 'bancomodelo';
          console.log('🧪 Ambiente de desenvolvimento - usando subdomínio banco modelo:', subdominio);
        } else {
          // Ambiente de produção - extrair subdomínio real de somosinovai.com
          const parts = hostname.split('.');
          if (parts.length >= 3 && parts.slice(-2).join('.') === 'somosinovai.com') {
            subdominio = parts[0];
            console.log('🌐 Ambiente de produção - subdomínio extraído:', subdominio, 'do domínio somosinovai.com');
          } else {
            throw new Error(`Domínio inválido: ${hostname}. Esperado: *.somosinovai.com`);
          }
        }

        if (!subdominio) {
          throw new Error('Não foi possível determinar o subdomínio');
        }

        // Buscar informações da clínica no sistema central
        console.log('📡 Buscando clínica para subdomínio:', subdominio);

        const { data, error } = await (adminSupabase as any)
          .from('clinicas_central')
          .select('*')
          .eq('subdominio', subdominio)
          .single();

        if (error) {
          console.error('❌ Erro ao buscar clínica:', error);
          throw new Error(`Clínica não encontrada para subdomínio: ${subdominio}`);
        }

        if (!data) {
          throw new Error(`Nenhuma clínica encontrada para o subdomínio: ${subdominio}`);
        }

        // Verificar se a clínica está ativa
        if (data.status !== 'ativa') {
          throw new Error(`Clínica está ${data.status}. Contate o suporte.`);
        }

        console.log('✅ Clínica encontrada:', data.nome_clinica);

        // Configurar contexto da clínica para o sistema legacy
        localStorage.setItem('tenant_id', data.id);
        localStorage.setItem('clinica_id', data.id);
        localStorage.setItem('clinica_nome', data.nome_clinica);
        localStorage.setItem('tenant_subdominio', data.subdominio);
        localStorage.setItem('database_name', data.database_name);
        
        // Inicializar conexão no factory
        await import('@/services/databaseConnectionFactory').then(({ dbConnectionFactory }) => {
          dbConnectionFactory.getConnection(data.subdominio);
        });

        // Atualizar último acesso no banco administrativo central
        await (adminSupabase as any)
          .from('clinicas_central')
          .update({ ultimo_acesso: new Date().toISOString() })
          .eq('id', data.id);

        setState({
          clinica: data as any,
          loading: false,
          error: null,
          isValidSubdomain: true
        });

      } catch (error: any) {
        console.error('💥 Erro no roteamento por subdomínio:', error);
        setState({
          clinica: null,
          loading: false,
          error: error.message,
          isValidSubdomain: false
        });
      }
    };

    detectAndLoadClinica();
  }, []);

  const getCurrentSubdomain = () => {
    const hostname = window.location.hostname;
    
    if (hostname.includes('localhost') || hostname.includes('127.0.0.1') || hostname.includes('lovable.app')) {
      return 'bancomodelo'; // Subdomínio padrão para desenvolvimento
    }
    
    const parts = hostname.split('.');
    return parts.length >= 3 ? parts[0] : '';
  };

  const buildClinicUrl = (subdominio: string, path: string = '') => {
    const protocol = window.location.protocol;
    const isLocal = window.location.hostname.includes('localhost') || 
                   window.location.hostname.includes('127.0.0.1') ||
                   window.location.hostname.includes('lovable.app');
    
    if (isLocal) {
      // Em desenvolvimento, usar parâmetro query ou redirecionamento simulado
      return `${protocol}//${window.location.host}${path}?clinic=${subdominio}`;
    }
    
    // Em produção, usar subdomínio real com domínio correto
    const domain = 'somosinovai.com';
    return `${protocol}//${subdominio}.${domain}${path}`;
  };

  return {
    ...state,
    getCurrentSubdomain,
    buildClinicUrl
  };
};