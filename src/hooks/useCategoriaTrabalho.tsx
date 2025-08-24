import { useState, useEffect } from "react";
import { toast } from "sonner";

interface CategoriaTrabalho {
  id: string;
  nome: string;
  ativo: boolean;
}

export const useCategoriaTrabalho = () => {
  const [categorias, setCategorias] = useState<CategoriaTrabalho[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategorias();
  }, []);

  const fetchCategorias = async () => {
    try {
      setLoading(true);
      
      // Dados de demonstração
      const categoriasDemo: CategoriaTrabalho[] = [
        { id: '1', nome: 'Consulta Geral', ativo: true },
        { id: '2', nome: 'Exame de Rotina', ativo: true },
        { id: '3', nome: 'Procedimento Cirúrgico', ativo: true },
        { id: '4', nome: 'Emergência', ativo: true }
      ];
      
      setCategorias(categoriasDemo);
      
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      toast.error("Erro ao carregar categorias de trabalho");
    } finally {
      setLoading(false);
    }
  };

  const createCategoria = async (nome: string) => {
    try {
      const novaCategoria: CategoriaTrabalho = {
        id: Date.now().toString(),
        nome,
        ativo: true
      };
      
      setCategorias(prev => [...prev, novaCategoria]);
      toast.success("Categoria criada com sucesso (demonstração)");
      
      return { success: true, data: novaCategoria };
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      toast.error("Erro ao criar categoria");
      return { success: false, error };
    }
  };

  const updateCategoria = async (id: string, dados: Partial<CategoriaTrabalho>) => {
    try {
      setCategorias(prev => prev.map(cat => 
        cat.id === id ? { ...cat, ...dados } : cat
      ));
      
      toast.success("Categoria atualizada com sucesso (demonstração)");
      return { success: true };
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error);
      toast.error("Erro ao atualizar categoria");
      return { success: false, error };
    }
  };

  const deleteCategoria = async (id: string) => {
    try {
      setCategorias(prev => prev.filter(cat => cat.id !== id));
      toast.success("Categoria removida com sucesso (demonstração)");
      return { success: true };
    } catch (error) {
      console.error('Erro ao deletar categoria:', error);
      toast.error("Erro ao deletar categoria");
      return { success: false, error };
    }
  };

  return {
    categorias,
    loading,
    createCategoria,
    updateCategoria,
    deleteCategoria,
    refetch: fetchCategorias
  };
};