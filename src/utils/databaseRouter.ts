/**
 * Utilitário para demonstrar como o sistema roteia automaticamente
 * entre banco administrativo central e bancos operacionais das clínicas
 */

import { adminSupabase } from '@/integrations/supabase/adminClient';
import { supabase } from '@/integrations/supabase/client';

/**
 * Exemplos de uso do roteamento automático de banco
 */
export class DatabaseRouter {
  
  /**
   * Exemplo: Operação administrativa
   * SEMPRE usa o banco central (tgydssyqgmifcuajacgo.supabase.co)
   */
  static async buscarTodasClinicas() {
    console.log('🏛️ OPERAÇÃO ADMINISTRATIVA - Usando banco central');
    
    const { data, error } = await (adminSupabase as any)
      .from('clinicas_central')
      .select('*')
      .order('data_criacao', { ascending: false });
      
    return { data, error };
  }

  /**
   * Exemplo: Operação de clínica
   * USA o banco da clínica específica (Memorial com RLS por enquanto)
   */
  static async buscarPacientesClinica() {
    console.log('🏥 OPERAÇÃO DA CLÍNICA - Usando banco operacional');
    
    // Mock data - operational tables not in central database
    const data = [
      { id: '1', nome: 'João Silva', created_at: new Date().toISOString() },
      { id: '2', nome: 'Maria Oliveira', created_at: new Date().toISOString() }
    ];
    const error = null;
      
    return { data, error };
  }

  /**
   * Exemplo: Criação de nova clínica
   * SEMPRE usa o banco administrativo central
   */
  static async criarNovaClinica(dadosClinica: any) {
    console.log('🏗️ CRIANDO CLÍNICA - Usando banco administrativo central');
    
    // 1. Registrar no banco central
    const { data: clinicaCentral, error: erroClinica } = await (adminSupabase as any)
      .from('clinicas_central')
      .insert(dadosClinica)
      .select()
      .single();
      
    if (erroClinica) return { data: null, error: erroClinica };

    // 2. Registrar monitoramento
    const { error: erroMonitor } = await (adminSupabase as any)
      .from('database_connections_monitor')
      .insert({
        clinica_central_id: clinicaCentral.id,
        database_name: dadosClinica.database_name,
        status: 'created'
      });

    // 3. Log da operação
    await (adminSupabase as any)
      .from('admin_operacoes_log')
      .insert({
        admin_user_id: '00000000-0000-0000-0000-000000000000',
        operacao: 'CRIAR_CLINICA_EXEMPLO',
        clinica_central_id: clinicaCentral.id,
        detalhes: { exemplo: 'Demonstração do roteamento' },
        sucesso: !erroMonitor
      });

    return { data: clinicaCentral, error: erroMonitor };
  }

  /**
   * Exemplo: Operação híbrida
   * Busca dados administrativos E operacionais
   */
  static async relatorioDashboardAdmin() {
    console.log('📊 RELATÓRIO HÍBRIDO - Usando ambos os bancos');
    
    // Dados administrativos (banco central)
    const { data: estatisticasClinicas } = await (adminSupabase as any)
      .from('clinicas_central')
      .select('id, nome_clinica, status, plano_contratado');
      
    // Mock data - operational tables not in central database
    const totalPacientes = [{ count: 150 }];
    const totalAgendamentos = [{ count: 89 }];

    return {
      clinicas: estatisticasClinicas,
      totalPacientes,
      totalAgendamentos
    };
  }
}

/**
 * Tabelas que SEMPRE usam o banco administrativo central
 */
export const TABELAS_ADMINISTRATIVAS = [
  'clinicas_central',
  'clinicas_inovai',
  'database_connections_monitor', 
  'admin_operacoes_log',
  'configuracoes_sistema_central',
  'admin_users',
  'admin_profiles',
  'admin_sessions'
] as const;

/**
 * Tabelas que usam o banco operacional da clínica
 */
export const TABELAS_OPERACIONAIS = [
  'clinicas',
  'pacientes',
  'medicos',
  'agendamentos',
  'exames',
  'funcionarios',
  'convenios',
  'configuracoes_clinica',
  'assinaturas'
] as const;

/**
 * Helper para identificar o tipo de tabela
 */
export function isAdministrativeTable(tableName: string): boolean {
  return TABELAS_ADMINISTRATIVAS.includes(tableName as any);
}

export function isOperationalTable(tableName: string): boolean {
  return TABELAS_OPERACIONAIS.includes(tableName as any);
}

/**
 * Exemplo de uso correto da arquitetura
 */
export const ExemplosUso = {
  
  // ✅ CORRETO: Operação administrativa
  async listarClinicasAdmin() {
    return await (adminSupabase as any).from('clinicas_central').select('*');
  },
  
  // ✅ DEMO: Operação da clínica (mock data)
  async listarPacientes() {
    return { data: [{ id: '1', nome: 'João Silva' }], error: null };
  },
  
  // ❌ ERRADO: Não fazer isso
  async exemploErrado() {
    // NUNCA usar supabase para tabelas administrativas
    // return await supabase.from('clinicas_central').select('*');
    
    // NUNCA usar adminSupabase para tabelas operacionais
    // return await adminSupabase.from('pacientes').select('*');
  }
};