import { useState } from 'react';

/**
 * Hook temporário para preferências do usuário
 * Simula gerenciamento de preferências até as clínicas operacionais estarem configuradas
 */
export const useUserPreferences = () => {
  const [preferences, setPreferences] = useState<Record<string, any>>({
    theme: 'light',
    language: 'pt-BR',
    notifications: true,
    dashboard_layout: 'cards'
  });
  const [loading, setLoading] = useState(false);

  const getPreference = (key: string, defaultValue?: any) => {
    return preferences[key] || defaultValue;
  };

  const setPreference = async (key: string, value: any) => {
    setLoading(true);
    console.log('⚙️ Salvando preferência (mock):', key, value);
    
    // Simular salvamento
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setPreferences(prev => ({ ...prev, [key]: value }));
    setLoading(false);
    
    return { success: true };
  };

  const loadPreferences = async () => {
    setLoading(true);
    console.log('📥 Carregando preferências (mock)');
    
    // Simular carregamento
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setLoading(false);
    return { success: true, data: preferences };
  };

  const updatePreference = setPreference; // Alias para compatibilidade

  return {
    preferences,
    getPreference,
    setPreference,
    updatePreference,
    loadPreferences,
    loading
  };
};