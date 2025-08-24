import { useState } from 'react';
import { adminSupabase } from '@/integrations/supabase/adminClient';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook para operações administrativas
 * USA APENAS o banco administrativo central
 */
export const useAdminOperations = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  /**
   * Buscar todas as clínicas centrais com estatísticas
   */
  const fetchClinicasWithStats = async () => {
    try {
      setLoading(true);
      console.log('🔍 Buscando clínicas com estatísticas no banco administrativo central...');
      
      // Por enquanto, buscar clínicas simples até termos a função criada
      const { data, error } = await adminSupabase
        .from('clinicas_central')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      console.log('✅ Clínicas carregadas:', data?.length);
      return data || [];
    } catch (error) {
      console.error('❌ Erro ao buscar clínicas com estatísticas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as estatísticas das clínicas.",
        variant: "destructive"
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  /**
   * Buscar clínicas Inovai
   */
  const fetchClinicasInovai = async () => {
    try {
      setLoading(true);
      console.log('🔍 Buscando clínicas Inovai no banco administrativo central...');
      
      const { data, error } = await (adminSupabase as any)
        .from('clinicas_inovai')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      console.log('✅ Clínicas Inovai carregadas:', data?.length);
      return data || [];
    } catch (error) {
      console.error('❌ Erro ao buscar clínicas Inovai:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as clínicas Inovai.",
        variant: "destructive"
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  /**
   * Criar nova clínica no banco administrativo central
   */
  const createClinicaInovai = async (clinicaData: any) => {
    try {
      setLoading(true);
      console.log('📝 Criando clínica Inovai no banco administrativo central...');
      
      const { data, error } = await (adminSupabase as any)
        .from('clinicas_inovai')
        .insert([clinicaData])
        .select()
        .single();

      if (error) throw error;
      
      console.log('✅ Clínica Inovai criada:', data);
      return data;
    } catch (error) {
      console.error('❌ Erro ao criar clínica Inovai:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a clínica Inovai.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Atualizar clínica Inovai
   */
  const updateClinicaInovai = async (id: string, updates: any) => {
    try {
      setLoading(true);
      console.log('📝 Atualizando clínica Inovai no banco administrativo central...');
      
      const { data, error } = await (adminSupabase as any)
        .from('clinicas_inovai')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      console.log('✅ Clínica Inovai atualizada:', data);
      return data;
    } catch (error) {
      console.error('❌ Erro ao atualizar clínica Inovai:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a clínica Inovai.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Deletar clínica Inovai
   */
  const deleteClinicaInovai = async (id: string) => {
    try {
      setLoading(true);
      console.log('🗑️ Removendo clínica Inovai do banco administrativo central...');
      
      const { error } = await (adminSupabase as any)
        .from('clinicas_inovai')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      console.log('✅ Clínica Inovai removida');
      return true;
    } catch (error) {
      console.error('❌ Erro ao remover clínica Inovai:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover a clínica Inovai.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Buscar logs administrativos
   */
  const fetchAdminLogs = async (limit = 100) => {
    try {
      setLoading(true);
      console.log('🔍 Buscando logs administrativos...');
      
      const { data, error } = await (adminSupabase as any)
        .from('admin_operacoes_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      
      console.log('✅ Logs administrativos carregados:', data?.length);
      return data || [];
    } catch (error) {
      console.error('❌ Erro ao buscar logs administrativos:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    fetchClinicasWithStats,
    fetchClinicasInovai,
    createClinicaInovai,
    updateClinicaInovai,
    deleteClinicaInovai,
    fetchAdminLogs
  };
};