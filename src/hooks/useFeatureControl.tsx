import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useClinica } from './useClinica';

interface AssinaturaInfo {
  id: string;
  tipo_plano: string;
  status: string;
  valor: number;
  periodo_meses: number;
  dias_restantes: number;
}

export const useFeatureControl = () => {
  const [assinatura, setAssinatura] = useState<AssinaturaInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const { clinica } = useClinica();

  useEffect(() => {
    if (clinica?.id) {
      fetchAssinatura();
    }
  }, [clinica]);

  const fetchAssinatura = async () => {
    try {
      // Dados demo para demonstração
      const assinaturaDemo: AssinaturaInfo = {
        id: 'demo-1',
        tipo_plano: 'avancado_medico',
        status: 'ativa',
        valor: 299.00,
        periodo_meses: 1,
        dias_restantes: 25
      };
      
      console.log('Assinatura demo carregada');
      setAssinatura(assinaturaDemo);
    } catch (error) {
      console.error('Erro demo ao buscar assinatura:', error);
      setAssinatura(null);
    } finally {
      setLoading(false);
    }
  };

  const [planoFuncionalidades, setPlanoFuncionalidades] = useState<string[]>([]);

  // Demo: Configurar funcionalidades baseado no plano demo
  useEffect(() => {
    if (assinatura?.tipo_plano) {
      const funcionalidades = getFeaturesBlockedByPlan(assinatura.tipo_plano);
      setPlanoFuncionalidades(funcionalidades);
    }
  }, [assinatura]);

  const getFeaturesBlockedByPlan = (tipoPlano: string): string[] => {
    console.log('Verificando funcionalidades bloqueadas para o plano:', tipoPlano);
    
    // Usar funcionalidades do banco de dados se disponível
    if (planoFuncionalidades.length > 0) {
      return planoFuncionalidades;
    }

    // Fallback para lógica hardcoded
    switch (tipoPlano) {
      case 'basico':
      case 'basico_medico':
        return ['emails', 'relatorios', 'monitoramento', 'telemedicina', 'usuarios_multiplos', 'convenios'];
      case 'intermediario_medico':
        return ['monitoramento', 'telemedicina', 'usuarios_multiplos'];
      case 'avancado_medico':
        return []; // Todas as funcionalidades liberadas
      case 'trial':
        return ['emails', 'relatorios', 'monitoramento', 'telemedicina', 'usuarios_multiplos', 'convenios'];
      default:
        console.warn('Tipo de plano não reconhecido:', tipoPlano);
        return ['emails', 'relatorios', 'monitoramento', 'telemedicina', 'usuarios_multiplos', 'convenios'];
    }
  };

  const planoFeatures = assinatura ? getFeaturesBlockedByPlan(assinatura.tipo_plano) : planoFuncionalidades;
  
  const isFeatureBlocked = useCallback((feature: string): boolean => {
    if (!assinatura) {
      console.log('Nenhuma assinatura encontrada, bloqueando funcionalidade:', feature);
      return true;
    }

    if (assinatura.status === 'vencida' || assinatura.status === 'cancelada') {
      console.log('Assinatura vencida/cancelada, bloqueando funcionalidade:', feature);
      return true;
    }

    const isBlocked = planoFeatures.includes(feature);
    console.log(`Funcionalidade ${feature} para plano ${assinatura.tipo_plano}:`, isBlocked ? 'BLOQUEADA' : 'LIBERADA');
    return isBlocked;
  }, [assinatura, planoFeatures]);

  const getPlanName = (tipoPlano: string): string => {
    switch (tipoPlano) {
      case 'basico_medico': return 'Básico';
      case 'intermediario_medico': return 'Intermediário';
      case 'avancado_medico': return 'Avançado';
      case 'trial': return 'Trial';
      default: return 'Desconhecido';
    }
  };

  const canAddMoreDoctors = useCallback((): boolean => {
    if (!assinatura) return false;
    
    // No modelo por médico, sempre pode adicionar mais médicos
    // A cobrança é automática baseada na quantidade
    return assinatura.status === 'ativa';
  }, [assinatura]);

  const getDoctorPrice = (): number => {
    if (!assinatura) return 175.00;
    
    // Valor fixo de R$ 175 por médico extra (acima do primeiro)
    return 175.00;
  };

  const calculateTotalDoctorCost = async (): Promise<number> => {
    if (!assinatura) return 0;

    try {
      // Demo: simular 2 médicos ativos
      const totalMedicos = 2;
      
      // Valor base do plano
      const valorBasePlano = getBasePlanPrice();
      
      // Médicos extras (acima do primeiro) custam R$ 175 cada
      const extraDoctors = Math.max(0, totalMedicos - 1);
      
      return valorBasePlano + (extraDoctors * 175.00);
    } catch (error) {
      console.error('Erro demo ao calcular custo dos médicos:', error);
      return 0;
    }
  };

  const getBasePlanPrice = (): number => {
    if (!assinatura) return 125.00;
    
    // Retornar valor base do plano (sem médicos extras)
    switch (assinatura.tipo_plano) {
      case 'basico_medico': return 125.00;
      case 'intermediario_medico': return 190.00;
      case 'avancado_medico': return 299.00;
      default: return 125.00;
    }
  };

  const getAdditionalDoctorPrice = (): number => {
    return 175.00; // Preço fixo por médico adicional (acima do primeiro)
  };

  const getPlanFeatures = (tipoPlano: string): string[] => {
    switch (tipoPlano) {
      case 'basico_medico':
        return [
          'Agenda e agendamentos completos',
          'Cadastro ilimitado de pacientes', 
          'Exames básicos e laudos',
          'Prontuários eletrônicos',
          'Portal do paciente',
          'Backup automático',
          'Suporte técnico'
        ];
      case 'intermediario_medico':
        return [
          'Todas as funcionalidades do Básico',
          'Sistema de emails automáticos',
          'Relatórios básicos de faturamento',
          'Atestados e receitas médicas',
          'Controle de convênios',
          'Dashboard financeiro',
          'Configurações avançadas'
        ];
      case 'avancado_medico':
        return [
          'Todas as funcionalidades anteriores',
          'Sistema de telemedicina completo',
          'Relatórios avançados e analytics',
          'Monitoramento de funcionários',
          'API para integrações',
          'Configurações personalizadas',
          'Suporte prioritário'
        ];
      default:
        return ['Funcionalidades básicas'];
    }
  };

  return {
    isFeatureBlocked,
    planoFeatures,
    canAddMoreDoctors,
    getDoctorPrice,
    getBasePlanPrice,
    getAdditionalDoctorPrice,
    calculateTotalDoctorCost,
    getPlanName,
    getPlanFeatures,
    assinatura,
    loading,
    refetch: fetchAssinatura
  };
};