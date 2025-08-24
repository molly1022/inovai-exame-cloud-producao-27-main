import { useState, useEffect } from 'react';
import { adminSupabase, createClinicClient } from '@/integrations/supabase/adminClient';
import { supabase } from '@/integrations/supabase/client';

interface TenantSystemState {
  isInitialized: boolean;
  tenantId: string | null;
  clinicaId: string | null;
  subdominio: string | null;
  databaseName: string | null;
  isIsolated: boolean;
  loading: boolean;
  error: string | null;
}

/**
 * Hook unificado para gerenciar o sistema de multi-tenancy
 * Fornece acesso correto aos dados baseado no tenant
 */
export const useTenantSystem = () => {
  const [state, setState] = useState<TenantSystemState>({
    isInitialized: false,
    tenantId: null,
    clinicaId: null,
    subdominio: null,
    databaseName: null,
    isIsolated: false,
    loading: true,
    error: null,
  });

  useEffect(() => {
    initializeSystem();
  }, []);

  const initializeSystem = () => {
    try {
      // Recuperar dados do localStorage (definidos pelo TenantRouter)
      const tenantId = localStorage.getItem('tenant_id');
      const clinicaId = localStorage.getItem('clinica_id');
      const subdominio = localStorage.getItem('tenant_subdominio');
      const databaseName = localStorage.getItem('database_name');

      if (!tenantId || !subdominio) {
        throw new Error('Sistema não inicializado. Recarregue a página.');
      }

      // Verificar se temos banco isolado
      const clinicClient = createClinicClient(subdominio);
      const isIsolated = clinicClient !== null;

      setState({
        isInitialized: true,
        tenantId,
        clinicaId: clinicaId || tenantId,
        subdominio,
        databaseName,
        isIsolated,
        loading: false,
        error: null,
      });

      console.log(`🎯 Sistema Tenant inicializado:`, {
        tenantId,
        subdominio,
        isIsolated: isIsolated ? 'Banco isolado' : 'RLS compartilhado'
      });

    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message,
      }));
    }
  };

  /**
   * Obter cliente correto baseado na tabela
   */
  const getClient = (table?: string) => {
    // Tabelas administrativas sempre usam adminSupabase
    const adminTables = [
      'clinicas_central',
      'database_connections_monitor',
      'admin_operacoes_log',
      'configuracoes_sistema_central'
    ];

    if (table && adminTables.includes(table)) {
      return adminSupabase;
    }

    // Para tabelas operacionais, usar banco isolado se disponível
    if (state.isIsolated && state.subdominio) {
      const clinicClient = createClinicClient(state.subdominio);
      if (clinicClient) {
        return clinicClient;
      }
    }

    // Fallback para RLS no banco principal
    return supabase;
  };

  /**
   * Executar query com roteamento automático
   */
  const query = (table: string) => {
    const client = getClient(table);
    console.log(`📊 Query em "${table}" usando ${state.isIsolated ? 'banco isolado' : 'RLS compartilhado'}`);
    return client.from(table as any);
  };

  return {
    ...state,
    query,
    getClient,
    refresh: initializeSystem,
    // Helpers
    getTenantContext: () => ({
      tenantId: state.tenantId,
      clinicaId: state.clinicaId,
      subdominio: state.subdominio,
      databaseName: state.databaseName,
    }),
  };
};