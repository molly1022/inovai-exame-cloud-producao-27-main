/**
 * Análise de uso de tabelas no projeto
 * Comparação entre tabelas definidas no banco vs tabelas efetivamente utilizadas
 */

// Lista completa das 56 tabelas definidas no banco de dados
export const TABELAS_BANCO = [
  'admin_logs',
  'admin_operacoes_log',
  'admin_profiles',
  'admin_sessions',
  'admin_trials_dashboard',
  'admin_users',
  'agendamentos',
  'agendamentos_historico',
  'anotacoes_medicas',
  'assinaturas',
  'atestados_medicos',
  'categorias_exames',
  'chamadas_lista_espera',
  'clinic_mfa',
  'clinic_sessions',
  'clinicas',
  'clinicas_central',
  'cobranca_detalhada',
  'codigos_recuperacao',
  'configuracoes_automacao',
  'configuracoes_clinica',
  'configuracoes_email',
  'configuracoes_sistema',
  'convenios',
  'email_lembretes',
  'exames',
  'exames_valores',
  'faturas_medicos_mensais',
  'funcionarios',
  'funcionarios_login',
  'funcionarios_logs',
  'funcionarios_sessoes',
  'inscricoes_pendentes',
  'lista_espera_agendamentos',
  'login_attempts',
  'logs_acesso',
  'medicos',
  'medicos_indisponibilidade',
  'medicos_login',
  'medicos_logs',
  'medicos_sessoes',
  'notificacoes_pagamento',
  'pacientes',
  'planos_assinatura',
  'planos_configuracao',
  'reagendamentos',
  'receitas_medicas',
  'repasses_medicos',
  'security_audit_logs',
  'security_logs',
  'status_transition_log',
  'teleconsulta_mensagens',
  'teleconsulta_participantes',
  'teleconsultas',
  'teleconsultas_uso_mensal',
  'user_preferences',
  'usuarios'
];

// Tabelas efetivamente utilizadas no código (baseado na análise dos arquivos)
export const TABELAS_UTILIZADAS = [
  // Core - Gestão da clínica
  'clinicas',
  'configuracoes_clinica',
  'assinaturas',
  
  // Usuários e autenticação
  'pacientes',
  'medicos',
  'funcionarios',
  'medicos_login',
  'funcionarios_login',
  'funcionarios_sessoes',
  'medicos_sessoes',
  
  // Agendamentos e consultas
  'agendamentos',
  'agendamentos_historico',
  'lista_espera_agendamentos',
  'chamadas_lista_espera',
  'reagendamentos',
  
  // Exames e documentos
  'exames',
  'categorias_exames',
  'exames_valores',
  'atestados_medicos',
  'receitas_medicas',
  'anotacoes_medicas',
  
  // Convênios e planos
  'convenios',
  'planos_assinatura',
  'planos_configuracao',
  
  // Financeiro
  'faturas_medicos_mensais',
  'repasses_medicos',
  'cobranca_detalhada',
  
  // Comunicação
  'email_lembretes',
  'configuracoes_email',
  
  // Telemedicina
  'teleconsultas',
  'teleconsulta_participantes',
  'teleconsulta_mensagens',
  'teleconsultas_uso_mensal',
  
  // Sistema multi-tenant
  'clinicas_central',
  'inscricoes_pendentes',
  
  // Logs e auditoria
  'logs_acesso',
  'funcionarios_logs',
  'medicos_logs',
  'security_logs',
  
  // Admin
  'admin_logs',
  'admin_users',
  'admin_profiles',
  'admin_sessions',
  'admin_trials_dashboard',
  'admin_operacoes_log',
  
  // Configurações
  'configuracoes_automacao',
  'configuracoes_sistema',
  'user_preferences',
  
  // Médicos especialidades
  'medicos_indisponibilidade',
  
  // Notificações
  'notificacoes_pagamento',
  'codigos_recuperacao'
];

// Tabelas definidas mas aparentemente não utilizadas
export const TABELAS_NAO_UTILIZADAS = TABELAS_BANCO.filter(
  tabela => !TABELAS_UTILIZADAS.includes(tabela)
);

// Estatísticas
export const ESTATISTICAS_USO = {
  total_tabelas_banco: TABELAS_BANCO.length,
  total_tabelas_utilizadas: TABELAS_UTILIZADAS.length,
  total_tabelas_nao_utilizadas: TABELAS_NAO_UTILIZADAS.length,
  percentual_utilizacao: Math.round((TABELAS_UTILIZADAS.length / TABELAS_BANCO.length) * 100),
  
  // Categorização por área
  categorias: {
    core: ['clinicas', 'configuracoes_clinica', 'assinaturas'],
    usuarios: ['pacientes', 'medicos', 'funcionarios', 'medicos_login', 'funcionarios_login'],
    agendamentos: ['agendamentos', 'agendamentos_historico', 'lista_espera_agendamentos'],
    exames: ['exames', 'categorias_exames', 'exames_valores'],
    documentos: ['atestados_medicos', 'receitas_medicas', 'anotacoes_medicas'],
    financeiro: ['faturas_medicos_mensais', 'repasses_medicos', 'cobranca_detalhada'],
    telemedicina: ['teleconsultas', 'teleconsulta_participantes', 'teleconsulta_mensagens'],
    admin: ['admin_logs', 'admin_users', 'admin_profiles', 'admin_sessions'],
    sistema: ['clinicas_central', 'inscricoes_pendentes', 'logs_acesso'],
    comunicacao: ['email_lembretes', 'configuracoes_email', 'notificacoes_pagamento'],
    seguranca: ['security_logs', 'codigos_recuperacao']
  }
};

/**
 * Função para gerar relatório de uso das tabelas
 */
export const gerarRelatorioUso = () => {
  console.log('=== RELATÓRIO DE USO DAS TABELAS ===');
  console.log(`Total de tabelas no banco: ${ESTATISTICAS_USO.total_tabelas_banco}`);
  console.log(`Tabelas efetivamente utilizadas: ${ESTATISTICAS_USO.total_tabelas_utilizadas}`);
  console.log(`Tabelas não utilizadas: ${ESTATISTICAS_USO.total_tabelas_nao_utilizadas}`);
  console.log(`Percentual de utilização: ${ESTATISTICAS_USO.percentual_utilizacao}%`);
  
  console.log('\n=== TABELAS NÃO UTILIZADAS ===');
  TABELAS_NAO_UTILIZADAS.forEach(tabela => {
    console.log(`- ${tabela}`);
  });
  
  console.log('\n=== UTILIZAÇÃO POR CATEGORIA ===');
  Object.entries(ESTATISTICAS_USO.categorias).forEach(([categoria, tabelas]) => {
    const utilizadas = tabelas.filter(t => TABELAS_UTILIZADAS.includes(t));
    console.log(`${categoria.toUpperCase()}: ${utilizadas.length}/${tabelas.length} tabelas utilizadas`);
  });
  
  return ESTATISTICAS_USO;
};