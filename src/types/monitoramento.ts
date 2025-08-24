
export interface FuncionarioLog {
  id: string;
  funcionario_id: string;
  acao: string;
  descricao: string;
  detalhes: any;
  tabela_afetada: string;
  registro_id: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
  funcionarios: {
    nome_completo: string;
    funcao: string;
  };
}

export interface FuncionarioSessao {
  id: string;
  funcionario_id: string;
  login_at: string;
  logout_at: string | null;
  ip_address: string;
  duracao_sessao: string | null;
  ativa: boolean;
  funcionarios: {
    nome_completo: string;
    funcao: string;
  };
}

export interface HorarioTrabalho {
  funcionario_id: string;
  nome_completo: string;
  minutos_trabalhados: number;
  sessoes_ativas: number;
  ultimo_acesso: string;
}

export interface ProdutividadeFuncionario {
  funcionario_id: string;
  nome_completo: string;
  pacientes_adicionados: number;
  exames_adicionados: number;
  agendamentos_feitos: number;
  total_acoes: number;
  media_acoes_por_hora: number;
}

export type AbaTipo = 'logs' | 'sessoes' | 'horarios' | 'produtividade' | 'historico';
