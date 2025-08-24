
import { format } from 'date-fns';
import type { FuncionarioLog, FuncionarioSessao, HorarioTrabalho, ProdutividadeFuncionario, AbaTipo } from '@/types/monitoramento';

export const getAcaoBadgeColor = (acao: string) => {
  switch (acao) {
    case 'LOGIN':
      return 'bg-green-100 text-green-800';
    case 'LOGOUT':
      return 'bg-red-100 text-red-800';
    case 'CREATE_PATIENT':
    case 'CREATE_EXAM':
    case 'CREATE_APPOINTMENT':
      return 'bg-blue-100 text-blue-800';
    case 'UPDATE_PATIENT':
    case 'UPDATE_EXAM':
    case 'UPDATE_APPOINTMENT':
      return 'bg-yellow-100 text-yellow-800';
    case 'DELETE_PATIENT':
    case 'DELETE_EXAM':
    case 'DELETE_APPOINTMENT':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const formatarDuracao = (duracao: string | null) => {
  if (!duracao) return '-';
  
  const match = duracao.match(/(\d+):(\d+):(\d+)/);
  if (!match) return duracao;
  
  const horas = parseInt(match[1]);
  const minutos = parseInt(match[2]);
  
  if (horas > 0) {
    return `${horas}h ${minutos}m`;
  } else {
    return `${minutos}m`;
  }
};

export const formatarMinutos = (minutos: number) => {
  const horas = Math.floor(minutos / 60);
  const mins = Math.round(minutos % 60);
  
  if (horas > 0) {
    return `${horas}h ${mins}m`;
  } else {
    return `${mins}m`;
  }
};

export const exportarRelatorio = (
  abaSelecionada: AbaTipo,
  logs: FuncionarioLog[],
  sessoes: FuncionarioSessao[],
  horarioTrabalho: HorarioTrabalho[],
  produtividade: ProdutividadeFuncionario[]
) => {
  let dataToExport: any[] = [];
  let headers = '';
  
  switch (abaSelecionada) {
    case 'logs':
      dataToExport = logs;
      headers = "Funcionário,Ação,Descrição,Data/Hora,IP\n";
      break;
    case 'sessoes':
      dataToExport = sessoes;
      headers = "Funcionário,Login,Logout,Duração,Status,IP\n";
      break;
    case 'horarios':
      dataToExport = horarioTrabalho;
      headers = "Funcionário,Minutos Trabalhados,Sessões Ativas,Último Acesso\n";
      break;
    case 'produtividade':
      dataToExport = produtividade;
      headers = "Funcionário,Pacientes,Exames,Agendamentos,Total Ações,Ações/Hora\n";
      break;
  }

  const csvContent = "data:text/csv;charset=utf-8," + headers + dataToExport.map(item => {
    switch (abaSelecionada) {
      case 'logs':
        const log = item as FuncionarioLog;
        return `${log.funcionarios.nome_completo},${log.acao},${log.descricao || ''},${format(new Date(log.created_at), 'dd/MM/yyyy HH:mm')},${log.ip_address || ''}`;
      case 'sessoes':
        const sessao = item as FuncionarioSessao;
        return `${sessao.funcionarios.nome_completo},${format(new Date(sessao.login_at), 'dd/MM/yyyy HH:mm')},${sessao.logout_at ? format(new Date(sessao.logout_at), 'dd/MM/yyyy HH:mm') : 'Ativa'},${formatarDuracao(sessao.duracao_sessao)},${sessao.ativa ? 'Ativa' : 'Finalizada'},${sessao.ip_address || ''}`;
      case 'horarios':
        const horario = item as HorarioTrabalho;
        return `${horario.nome_completo},${Math.round(horario.minutos_trabalhados)} min,${horario.sessoes_ativas},${format(new Date(horario.ultimo_acesso), 'dd/MM/yyyy HH:mm')}`;
      case 'produtividade':
        const prod = item as ProdutividadeFuncionario;
        return `${prod.nome_completo},${prod.pacientes_adicionados},${prod.exames_adicionados},${prod.agendamentos_feitos},${prod.total_acoes},${prod.media_acoes_por_hora}`;
      default:
        return '';
    }
  }).join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `relatorio_${abaSelecionada}_${format(new Date(), 'yyyy-MM-dd')}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
