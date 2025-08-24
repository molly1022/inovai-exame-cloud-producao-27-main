import { useEffect } from 'react';

/**
 * Hook para garantir isolamento correto dos dados por clínica
 * Configura o contexto do tenant antes de fazer operações no banco
 */
export const useTenantId = () => {
  const tenantId = localStorage.getItem('clinica_id') || localStorage.getItem('tenant_id');

  useEffect(() => {
    const setupTenant = () => {
      if (tenantId) {
        try {
          // Garantir consistência nas chaves do localStorage
          console.log('🔧 Configurando tenant:', tenantId);
          
          localStorage.setItem('clinica_id', tenantId);
          localStorage.setItem('tenant_id', tenantId);
          
        } catch (error) {
          console.warn('⚠️ Não foi possível configurar o contexto do tenant:', error);
        }
      }
    };

    setupTenant();
  }, [tenantId]);

  const getClinicaId = (): string | null => {
    const id = localStorage.getItem('clinica_id') || localStorage.getItem('tenant_id');
    if (!id) {
      console.error('❌ ID da clínica não encontrado - usuário não autenticado');
      return null;
    }
    return id;
  };

  const ensureClinicaId = (): string => {
    const id = getClinicaId();
    if (!id) {
      throw new Error('ID da clínica não encontrado. Faça login novamente.');
    }
    return id;
  };

  return {
    tenantId,
    clinicaId: tenantId, // Alias para compatibilidade
    getClinicaId,
    getTenantId: getClinicaId, // Alias para compatibilidade  
    ensureClinicaId,
    isAuthenticated: !!tenantId,
    isValid: !!tenantId // Alias para compatibilidade
  };
};