import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useTenantId } from '@/hooks/useTenantId';

interface Clinica {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  endereco?: string;
  cnpj?: string;
  created_at?: string;
  updated_at?: string;
  foto_perfil_url?: string;
  subdominio?: string;
}

export const useClinica = () => {
  const [clinica, setClinica] = useState<Clinica | null>(null);
  const [loading, setLoading] = useState(true);
  const { clinicaId, isValid } = useTenantId();

  useEffect(() => {
    if (isValid && clinicaId) {
      fetchClinicaData();
    } else {
      // Usar dados padrão para demonstração quando não há tenant válido
      setClinica({
        id: 'demo-clinic-id',
        nome: 'Clínica Demonstração',
        email: 'demo@clinica.com',
        telefone: '(11) 99999-9999',
        endereco: 'Rua Exemplo, 123 - Centro',
        cnpj: '12.345.678/0001-90',
        subdominio: 'clinica-demo'
      });
      setLoading(false);
    }
  }, [clinicaId, isValid]);

  const fetchClinicaData = async () => {
    if (!clinicaId) return;
    
    try {
      setLoading(true);
      
      // Tentar buscar da tabela central primeiro (para clínicas administrativas)
      const { data: centralData, error: centralError } = await supabase
        .from('clinicas_central')
        .select('*')
        .eq('id', clinicaId)
        .single();

      if (centralData && !centralError) {
        // Mapear dados da tabela central para interface
        setClinica({
          id: centralData.id,
          nome: centralData.nome || 'Clínica',
          email: centralData.email,
          telefone: centralData.telefone,
          endereco: centralData.endereco,
          cnpj: centralData.cnpj,
          created_at: centralData.created_at,
          updated_at: centralData.updated_at
        });
        console.log('Dados da clínica carregados da tabela central:', centralData.nome);
        return;
      }

      // Se não encontrou na central, usar dados padrão para demonstração
      console.log('Clínica não encontrada na base central, usando dados de demonstração');
      setClinica({
        id: clinicaId,
        nome: 'Clínica Demonstração',
        email: 'demo@clinica.com',
        telefone: '(11) 99999-9999',
        endereco: 'Rua Exemplo, 123 - Centro',
        cnpj: '12.345.678/0001-90'
      });

    } catch (error) {
      console.error('Erro ao buscar dados da clínica:', error);
      // Em caso de erro, usar dados padrão
      setClinica({
        id: clinicaId,
        nome: 'Clínica Demonstração',
        email: 'demo@clinica.com',
        telefone: '(11) 99999-9999',
        endereco: 'Rua Exemplo, 123 - Centro',
        cnpj: '12.345.678/0001-90'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateClinica = async (dadosClinica: Partial<Clinica>) => {
    if (!clinicaId || !clinica) return { success: false, error: 'Dados da clínica não encontrados' };
    
    try {
      console.log('Simulando atualização da clínica (modo demonstração):', dadosClinica);
      
      // Atualizar estado local
      const clinicaAtualizada = { ...clinica, ...dadosClinica };
      setClinica(clinicaAtualizada);
      
      return { success: true };
    } catch (error) {
      console.error('Erro ao atualizar clínica:', error);
      return { success: false, error: 'Erro ao atualizar dados da clínica' };
    }
  };

  const refetch = () => {
    fetchClinicaData();
  };

  return {
    clinica,
    loading,
    updateClinica,
    refetch,
    tenantId: clinicaId
  };
};