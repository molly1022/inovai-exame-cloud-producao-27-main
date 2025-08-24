import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useClinica } from './useClinica';

interface ExamCategory {
  nome: string;
}

export const useExamCategorySearch = (searchTerm: string = '') => {
  const [categories, setCategories] = useState<ExamCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { clinica } = useClinica();

  useEffect(() => {
    const searchCategories = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Dados demo para demonstração
        const categoriesDemo: ExamCategory[] = [
          { nome: 'Consulta Geral' },
          { nome: 'Exame Cardiológico' },
          { nome: 'Ultrassom' },
          { nome: 'Radiografia' },
          { nome: 'Exame de Sangue' },
          { nome: 'Ressonância Magnética' },
          { nome: 'Tomografia' },
          { nome: 'Endoscopia' },
          { nome: 'Mamografia' },
          { nome: 'Eletrocardiograma' }
        ];

        // Filtrar por termo de busca
        const filteredCategories = searchTerm.trim()
          ? categoriesDemo.filter(category =>
              category.nome.toLowerCase().includes(searchTerm.toLowerCase())
            )
          : categoriesDemo;

        setCategories(filteredCategories);
      } catch (err: any) {
        console.error('Erro na busca de categorias:', err);
        setError('Erro ao carregar categorias de demonstração');
        setCategories([]);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce da busca
    const timeoutId = setTimeout(searchCategories, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, clinica?.id]);

  return { categories, isLoading, error };
};