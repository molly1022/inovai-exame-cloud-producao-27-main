import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DatabaseContext {
  clinicaId: string | null;
  databaseName: string | null;
  subdominio: string | null;
  isInitialized: boolean;
  error: string | null;
}

const DatabaseContext = createContext<DatabaseContext>({
  clinicaId: null,
  databaseName: null,
  subdominio: null,
  isInitialized: false,
  error: null
});

interface DatabaseProviderProps {
  children: React.ReactNode;
}

/**
 * Provider para contexto de banco de dados por tenant
 * Gerencia a conexão e contexto do banco específico da clínica
 */
export const DatabaseProvider = ({ children }: DatabaseProviderProps) => {
  const [context, setContext] = useState<DatabaseContext>({
    clinicaId: null,
    databaseName: null,
    subdominio: null,
    isInitialized: false,
    error: null
  });

  useEffect(() => {
    const initializeDatabaseContext = () => {
      try {
        // Recuperar informações do localStorage (definidas pelo SubdomainGuard)
        const clinicaId = localStorage.getItem('tenant_id') || localStorage.getItem('clinica_id');
        const databaseName = localStorage.getItem('database_name');
        const subdominio = localStorage.getItem('tenant_subdominio');

        if (!clinicaId || !databaseName || !subdominio) {
          throw new Error('Contexto de banco de dados não encontrado');
        }

        console.log('🔧 Inicializando contexto de database:', {
          clinicaId,
          databaseName,
          subdominio
        });

        setContext({
          clinicaId,
          databaseName,
          subdominio,
          isInitialized: true,
          error: null
        });

      } catch (error: any) {
        console.error('❌ Erro ao inicializar contexto de database:', error);
        setContext(prev => ({
          ...prev,
          isInitialized: false,
          error: error.message
        }));
      }
    };

    initializeDatabaseContext();
  }, []);

  return (
    <DatabaseContext.Provider value={context}>
      {children}
    </DatabaseContext.Provider>
  );
};

/**
 * Hook para usar o contexto de banco de dados por tenant
 */
export const useDatabasePerTenant = () => {
  const context = useContext(DatabaseContext);
  
  if (!context) {
    throw new Error('useDatabasePerTenant deve ser usado dentro de DatabaseProvider');
  }

  // Funções auxiliares para queries isoladas por tenant
  const queryWithTenant = (table: any) => {
    if (!context.clinicaId) {
      throw new Error('Contexto de clínica não encontrado');
    }

    // Por enquanto, ainda usar o sistema RLS existente
    // Futuramente, isso será substituído por conexão dinâmica com database específico
    return supabase.from(table);
  };

  const getClinicaContext = () => {
    return {
      clinicaId: context.clinicaId,
      databaseName: context.databaseName,
      subdominio: context.subdominio
    };
  };

  const isReady = () => {
    return context.isInitialized && !context.error && context.clinicaId;
  };

  return {
    ...context,
    queryWithTenant,
    getClinicaContext,
    isReady
  };
};