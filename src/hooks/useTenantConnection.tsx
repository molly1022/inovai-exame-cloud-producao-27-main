import { useState, useEffect } from 'react';
import { createClinicClient, adminSupabase } from '@/integrations/supabase/adminClient';
import { supabase } from '@/integrations/supabase/client';

interface TenantConnectionState {
  tenantId: string | null;
  subdominio: string | null;
  databaseName: string | null;
  isConnected: boolean;
  isIsolated: boolean; // true se usando banco isolado, false se usando RLS
  loading: boolean;
  error: string | null;
}

/**
 * Hook para gerenciar conexões dinâmicas por tenant
 * Implementa o sistema Database-per-Tenant
 */
export const useTenantConnection = () => {
  const [state, setState] = useState<TenantConnectionState>({
    tenantId: null,
    subdominio: null,
    databaseName: null,
    isConnected: false,
    isIsolated: false,
    loading: true,
    error: null
  });

  useEffect(() => {
    initializeConnection();
  }, []);

  const initializeConnection = async () => {
    try {
      // Recuperar contexto do localStorage (definido pelo TenantRouter)
      const tenantId = localStorage.getItem('tenant_id');
      const subdominio = localStorage.getItem('tenant_subdominio');
      const databaseName = localStorage.getItem('database_name');

      if (!tenantId || !subdominio) {
        throw new Error('Contexto do tenant não encontrado');
      }

      // Tentar conectar ao banco isolado
      const clinicClient = createClinicClient(subdominio);
      const isIsolated = clinicClient !== null;

      setState({
        tenantId,
        subdominio,
        databaseName,
        isConnected: true,
        isIsolated,
        loading: false,
        error: null
      });

      console.log(`🎯 Tenant conectado: ${subdominio} (${isIsolated ? 'Isolado' : 'RLS'})`);

    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message,
        isConnected: false
      }));
    }
  };

  /**
   * Obter cliente correto baseado na tabela e contexto
   */
  const getClient = (table: string) => {
    // Tabelas administrativas sempre usam adminSupabase
    const adminTables = [
      'clinicas_central',
      'database_connections_monitor',
      'admin_operacoes_log',
      'configuracoes_sistema_central'
    ];

    if (adminTables.includes(table)) {
      return adminSupabase;
    }

    // Para tabelas operacionais, usar banco isolado se disponível
    if (state.isIsolated && state.subdominio) {
      const clinicClient = createClinicClient(state.subdominio);
      if (clinicClient) {
        return clinicClient;
      }
    }

    // Fallback para RLS no banco memorial
    return supabase;
  };

  /**
   * Executar query com roteamento automático
   */
  const query = (table: string) => {
    const client = getClient(table);
    console.log(`📊 Query em ${table} usando ${state.isIsolated ? 'banco isolado' : 'RLS memorial'}`);
    return client.from(table as any);
  };

  /**
   * Reconectar em caso de erro
   */
  const reconnect = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    await initializeConnection();
  };

  return {
    ...state,
    query,
    getClient,
    reconnect,
    // Funções auxiliares
    isAdminTable: (table: string) => [
      'clinicas_central',
      'database_connections_monitor', 
      'admin_operacoes_log',
      'configuracoes_sistema_central'
    ].includes(table),
    
    getTenantContext: () => ({
      tenantId: state.tenantId,
      subdominio: state.subdominio,
      databaseName: state.databaseName
    })
  };
};