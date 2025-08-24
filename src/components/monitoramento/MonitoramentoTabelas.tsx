
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Shield, Timer, Clock, BarChart, Users, Calendar, Heart } from "lucide-react";
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getAcaoBadgeColor, formatarDuracao, formatarMinutos, exportarRelatorio } from '@/utils/monitoramentoUtils';
import type { FuncionarioLog, FuncionarioSessao, HorarioTrabalho, ProdutividadeFuncionario, AbaTipo } from '@/types/monitoramento';

interface MonitoramentoTabelasProps {
  abaSelecionada: AbaTipo;
  loading: boolean;
  logs: FuncionarioLog[];
  sessoes: FuncionarioSessao[];
  horarioTrabalho: HorarioTrabalho[];
  produtividade: ProdutividadeFuncionario[];
  funcionarios: any[];
  getHistoricoFuncionario: (funcionarioId: string) => FuncionarioLog[];
}

export const MonitoramentoTabelas = ({
  abaSelecionada,
  loading,
  logs,
  sessoes,
  horarioTrabalho,
  produtividade,
  funcionarios,
  getHistoricoFuncionario
}: MonitoramentoTabelasProps) => {
  const handleExportar = () => {
    exportarRelatorio(abaSelecionada, logs, sessoes, horarioTrabalho, produtividade);
  };

  const getTitle = () => {
    switch (abaSelecionada) {
      case 'logs': return 'Logs de Atividades';
      case 'sessoes': return 'Sessões de Login';
      case 'horarios': return 'Horários de Trabalho';
      case 'produtividade': return 'Produtividade por Funcionário';
      case 'historico': return 'Histórico Completo de Atividades';
      default: return '';
    }
  };

  const getDescription = () => {
    switch (abaSelecionada) {
      case 'logs': return 'Histórico completo de ações realizadas pelos funcionários';
      case 'sessoes': return 'Controle de login e logout dos funcionários';
      case 'horarios': return 'Tempo de trabalho ativo da semana atual baseado em atividades reais';
      case 'produtividade': return 'Métricas de produtividade e eficiência dos funcionários do mês atual';
      case 'historico': return 'Atividades detalhadas por funcionário incluindo pacientes, exames e agendamentos';
      default: return '';
    }
  };

  const getAcaoIcon = (acao: string) => {
    if (acao.includes('PATIENT')) return <Users className="h-4 w-4" />;
    if (acao.includes('EXAM')) return <Heart className="h-4 w-4" />;
    if (acao.includes('APPOINTMENT')) return <Calendar className="h-4 w-4" />;
    return <Shield className="h-4 w-4" />;
  };

  const getAcaoLabel = (acao: string) => {
    switch (acao) {
      case 'CREATE_PATIENT': return 'Paciente Criado';
      case 'UPDATE_PATIENT': return 'Paciente Atualizado';
      case 'CREATE_EXAM': return 'Exame Criado';
      case 'UPDATE_EXAM': return 'Exame Atualizado';
      case 'CREATE_APPOINTMENT': return 'Agendamento Criado';
      case 'UPDATE_APPOINTMENT': return 'Agendamento Atualizado';
      default: return acao;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{getTitle()}</CardTitle>
          <Button onClick={handleExportar} variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </div>
        <CardDescription>{getDescription()}</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">Carregando...</div>
        ) : (
          <div className="overflow-x-auto">
            {abaSelecionada === 'logs' && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Funcionário</TableHead>
                    <TableHead>Ação</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>IP</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{log.funcionarios.nome_completo}</div>
                          <div className="text-sm text-gray-500">{log.funcionarios.funcao}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getAcaoBadgeColor(log.acao)}>
                          {log.acao}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {log.descricao || '-'}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div>{format(new Date(log.created_at), 'dd/MM/yyyy HH:mm')}</div>
                          <div className="text-sm text-gray-500">
                            {formatDistanceToNow(new Date(log.created_at), { addSuffix: true, locale: ptBR })}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Shield className="h-3 w-3" />
                          {log.ip_address || 'N/A'}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {abaSelecionada === 'sessoes' && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Funcionário</TableHead>
                    <TableHead>Login</TableHead>
                    <TableHead>Logout</TableHead>
                    <TableHead>Duração</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>IP de Acesso</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessoes.map((sessao) => (
                    <TableRow key={sessao.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{sessao.funcionarios.nome_completo}</div>
                          <div className="text-sm text-gray-500">{sessao.funcionarios.funcao}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div>{format(new Date(sessao.login_at), 'dd/MM/yyyy')}</div>
                          <div className="text-sm text-gray-500">
                            {format(new Date(sessao.login_at), 'HH:mm')}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {sessao.logout_at ? (
                          <div>
                            <div>{format(new Date(sessao.logout_at), 'dd/MM/yyyy')}</div>
                            <div className="text-sm text-gray-500">
                              {format(new Date(sessao.logout_at), 'HH:mm')}
                            </div>
                          </div>
                        ) : (
                          <Badge className="bg-green-100 text-green-800">
                            Ativa
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Timer className="h-3 w-3" />
                          {formatarDuracao(sessao.duracao_sessao)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={sessao.ativa ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                          {sessao.ativa ? 'Ativa' : 'Finalizada'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Shield className="h-3 w-3" />
                          {sessao.ip_address || 'N/A'}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {abaSelecionada === 'horarios' && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Funcionário</TableHead>
                    <TableHead>Tempo Trabalhado (Semana)</TableHead>
                    <TableHead>Sessões Ativas</TableHead>
                    <TableHead>Último Acesso</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {horarioTrabalho.map((horario) => (
                    <TableRow key={horario.funcionario_id}>
                      <TableCell>
                        <div className="font-medium">{horario.nome_completo}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span className="font-semibold">{formatarMinutos(horario.minutos_trabalhados)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={horario.sessoes_ativas > 0 ? "default" : "secondary"}>
                          {horario.sessoes_ativas} ativas
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div>{format(new Date(horario.ultimo_acesso), 'dd/MM/yyyy HH:mm')}</div>
                          <div className="text-sm text-gray-500">
                            {formatDistanceToNow(new Date(horario.ultimo_acesso), { addSuffix: true, locale: ptBR })}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {abaSelecionada === 'produtividade' && (
              <div>
                {produtividade.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <BarChart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum dado de produtividade encontrado para este mês.</p>
                    <p className="text-sm">Dados são calculados baseados em ações registradas nos logs.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Funcionário</TableHead>
                        <TableHead>Pacientes Adicionados</TableHead>
                        <TableHead>Exames Adicionados</TableHead>
                        <TableHead>Agendamentos Feitos</TableHead>
                        <TableHead>Total de Ações</TableHead>
                        <TableHead>Ações/Hora</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {produtividade.map((prod) => (
                        <TableRow key={prod.funcionario_id}>
                          <TableCell>
                            <div className="font-medium">{prod.nome_completo}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-blue-50">
                              <Users className="h-3 w-3 mr-1" />
                              {prod.pacientes_adicionados}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-green-50">
                              <Heart className="h-3 w-3 mr-1" />
                              {prod.exames_adicionados}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-purple-50">
                              <Calendar className="h-3 w-3 mr-1" />
                              {prod.agendamentos_feitos}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <BarChart className="h-4 w-4" />
                              <span className="font-semibold">{prod.total_acoes}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Timer className="h-4 w-4" />
                              <span className="font-medium text-green-600">{prod.media_acoes_por_hora}</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            )}

            {abaSelecionada === 'historico' && (
              <div className="space-y-6">
                {funcionarios.map((funcionario) => {
                  const historicoFuncionario = getHistoricoFuncionario(funcionario.id);
                  if (historicoFuncionario.length === 0) return null;

                  // Agrupar por tipo de ação
                  const pacientesAcoes = historicoFuncionario.filter(log => log.acao.includes('PATIENT'));
                  const examesAcoes = historicoFuncionario.filter(log => log.acao.includes('EXAM'));
                  const agendamentosAcoes = historicoFuncionario.filter(log => log.acao.includes('APPOINTMENT'));

                  return (
                    <Card key={funcionario.id}>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Users className="h-5 w-5" />
                          {funcionario.nome_completo}
                        </CardTitle>
                        <CardDescription>
                          {funcionario.funcao} • {historicoFuncionario.length} ações registradas
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {pacientesAcoes.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-blue-600 mb-3 flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              Pacientes ({pacientesAcoes.length})
                            </h4>
                            <div className="space-y-2">
                              {pacientesAcoes.slice(0, 5).map((log) => (
                                <div key={log.id} className="flex justify-between items-center p-2 bg-blue-50 rounded">
                                  <div>
                                    <Badge variant="outline" className="bg-blue-100">
                                      {getAcaoLabel(log.acao)}
                                    </Badge>
                                    <span className="ml-2 text-sm">{log.descricao || 'Ação realizada'}</span>
                                  </div>
                                  <span className="text-xs text-gray-500">
                                    {format(new Date(log.created_at), 'dd/MM HH:mm')}
                                  </span>
                                </div>
                              ))}
                              {pacientesAcoes.length > 5 && (
                                <p className="text-xs text-gray-500">+ {pacientesAcoes.length - 5} ações adicionais</p>
                              )}
                            </div>
                          </div>
                        )}

                        {examesAcoes.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-green-600 mb-3 flex items-center gap-2">
                              <Heart className="h-4 w-4" />
                              Exames ({examesAcoes.length})
                            </h4>
                            <div className="space-y-2">
                              {examesAcoes.slice(0, 5).map((log) => (
                                <div key={log.id} className="flex justify-between items-center p-2 bg-green-50 rounded">
                                  <div>
                                    <Badge variant="outline" className="bg-green-100">
                                      {getAcaoLabel(log.acao)}
                                    </Badge>
                                    <span className="ml-2 text-sm">{log.descricao || 'Ação realizada'}</span>
                                  </div>
                                  <span className="text-xs text-gray-500">
                                    {format(new Date(log.created_at), 'dd/MM HH:mm')}
                                  </span>
                                </div>
                              ))}
                              {examesAcoes.length > 5 && (
                                <p className="text-xs text-gray-500">+ {examesAcoes.length - 5} ações adicionais</p>
                              )}
                            </div>
                          </div>
                        )}

                        {agendamentosAcoes.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-purple-600 mb-3 flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              Agendamentos ({agendamentosAcoes.length})
                            </h4>
                            <div className="space-y-2">
                              {agendamentosAcoes.slice(0, 5).map((log) => (
                                <div key={log.id} className="flex justify-between items-center p-2 bg-purple-50 rounded">
                                  <div>
                                    <Badge variant="outline" className="bg-purple-100">
                                      {getAcaoLabel(log.acao)}
                                    </Badge>
                                    <span className="ml-2 text-sm">{log.descricao || 'Ação realizada'}</span>
                                  </div>
                                  <span className="text-xs text-gray-500">
                                    {format(new Date(log.created_at), 'dd/MM HH:mm')}
                                  </span>
                                </div>
                              ))}
                              {agendamentosAcoes.length > 5 && (
                                <p className="text-xs text-gray-500">+ {agendamentosAcoes.length - 5} ações adicionais</p>
                              )}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
                {funcionarios.filter(f => getHistoricoFuncionario(f.id).length > 0).length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum histórico de atividades encontrado.</p>
                    <p className="text-sm">Ações de pacientes, exames e agendamentos aparecerão aqui.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
