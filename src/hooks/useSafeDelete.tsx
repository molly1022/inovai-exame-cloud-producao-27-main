import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook temporário para exclusão segura
 * Simula verificação de dependências até as clínicas operacionais estarem configuradas
 */
export const useSafeDelete = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const checkDependencies = async (table: string, id: string) => {
    setLoading(true);
    console.log('🔍 Verificando dependências (mock):', table, id);
    
    // Simular verificação
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setLoading(false);
    
    // Simular algumas dependências encontradas ocasionalmente
    const hasDepencencies = Math.random() > 0.7;
    
    if (hasDepencencies) {
      return {
        canDelete: false,
        dependencies: [
          { table: 'agendamentos', count: Math.floor(Math.random() * 5) + 1 },
          { table: 'exames', count: Math.floor(Math.random() * 3) + 1 }
        ]
      };
    }

    return {
      canDelete: true,
      dependencies: []
    };
  };

  const safeDelete = async (table: string, id: string) => {
    setLoading(true);
    console.log('🗑️ Executando exclusão segura (mock):', table, id);
    
    // Simular processamento
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    toast({
      title: "Item excluído",
      description: "Item excluído com sucesso (modo demonstração)",
    });
    
    setLoading(false);
    return { success: true };
  };

  return {
    checkDependencies,
    safeDelete,
    loading
  };
};