/**
 * Utilitários para garantir consistência do sistema multi-tenant
 */

/**
 * Obtém o ID da clínica de forma consistente
 * Prioridade: tenant_id > clinica_id > null
 */
export const getConsistentClinicaId = (): string | null => {
  return localStorage.getItem('tenant_id') || 
         localStorage.getItem('clinica_id') || 
         null;
};

/**
 * Define o ID da clínica de forma consistente em todos os campos
 */
export const setConsistentClinicaId = (clinicaId: string): void => {
  localStorage.setItem('tenant_id', clinicaId);
  localStorage.setItem('clinica_id', clinicaId);
};

/**
 * Remove todos os IDs de clínica do localStorage
 */
export const clearClinicaId = (): void => {
  localStorage.removeItem('tenant_id');
  localStorage.removeItem('clinica_id');
};

/**
 * Verifica se existe um ID de clínica válido
 */
export const hasValidClinicaId = (): boolean => {
  const id = getConsistentClinicaId();
  return id !== null && id !== '';
};