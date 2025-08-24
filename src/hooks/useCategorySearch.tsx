import { useState, useEffect } from 'react';

interface Category {
  id: string;
  nome: string;
  ativo?: boolean;
}

export const useCategorySearch = (searchTerm: string) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchTerm.trim()) {
      searchCategories(searchTerm);
    } else {
      setCategories([]);
    }
  }, [searchTerm]);

  const searchCategories = async (term: string) => {
    try {
      setLoading(true);
      
      // Dados de demonstração baseados no termo de busca
      const allCategories: Category[] = [
        { id: '1', nome: 'Consulta Geral', ativo: true },
        { id: '2', nome: 'Exame de Rotina', ativo: true },
        { id: '3', nome: 'Procedimento Cirúrgico', ativo: true },
        { id: '4', nome: 'Cardiologia', ativo: true },
        { id: '5', nome: 'Neurologia', ativo: true },
        { id: '6', nome: 'Dermatologia', ativo: true },
        { id: '7', nome: 'Oftalmologia', ativo: true },
        { id: '8', nome: 'Ortopedia', ativo: true }
      ];
      
      const filtered = allCategories.filter(cat => 
        cat.nome.toLowerCase().includes(term.toLowerCase())
      );
      
      setCategories(filtered);
      
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  return {
    categories,
    loading
  };
};