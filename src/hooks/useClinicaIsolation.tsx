import { createContext, useContext, useEffect, useState } from 'react';

interface ClinicaContextType {
  clinicaId: string | null;
  setCurrentClinicId: (id: string) => void;
  clearClinicaContext: () => void;
}

const ClinicaContext = createContext<ClinicaContextType | undefined>(undefined);

export const ClinicaIsolationProvider = ({ children }: { children: React.ReactNode }) => {
  const [clinicaId, setClinicaId] = useState<string | null>(null);

  useEffect(() => {
    // Verificar se há uma clínica já logada
    const storedClinicaId = localStorage.getItem('clinica_id') || localStorage.getItem('tenant_id');
    if (storedClinicaId) {
      setCurrentClinicId(storedClinicaId);
    }
  }, []);

  const setCurrentClinicId = (id: string) => {
    setClinicaId(id);
    
    // Garantir consistência no localStorage
    localStorage.setItem('clinica_id', id);
    localStorage.setItem('tenant_id', id);
    
    console.log('✅ Contexto da clínica definido:', id);
  };

  const clearClinicaContext = () => {
    setClinicaId(null);
    localStorage.removeItem('clinica_id');
    localStorage.removeItem('tenant_id');
    localStorage.removeItem('clinica_nome');
    
    console.log('✅ Contexto da clínica limpo');
  };

  return (
    <ClinicaContext.Provider value={{
      clinicaId,
      setCurrentClinicId,
      clearClinicaContext
    }}>
      {children}
    </ClinicaContext.Provider>
  );
};

export const useClinicaIsolation = () => {
  const context = useContext(ClinicaContext);
  if (context === undefined) {
    throw new Error('useClinicaIsolation deve ser usado dentro de ClinicaIsolationProvider');
  }
  return context;
};