import { useState } from 'react';

/**
 * Hook temporário para inicialização de tenant
 * Simula inicialização até as clínicas operacionais estarem configuradas
 */
export const useTenantInitializer = () => {
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const initializeTenant = async (tenantId: string) => {
    setLoading(true);
    console.log('🔧 Inicializando tenant (mock):', tenantId);
    
    // Simular inicialização
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Configurar dados básicos no localStorage
    localStorage.setItem('tenant_id', tenantId);
    localStorage.setItem('clinica_id', tenantId);
    
    setInitialized(true);
    setLoading(false);
    
    return { success: true };
  };

  return {
    initializeTenant,
    loading,
    initialized
  };
};