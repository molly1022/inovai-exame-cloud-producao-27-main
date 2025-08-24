# Sistema de Escala Médica (Bloqueios de Agenda)

Este documento descreve como funciona a escala médica (indisponibilidades/bloqueios), os arquivos envolvidos no frontend, as funções de banco utilizadas e o fluxo completo de validação na criação/edição de agendamentos.

## Visão Geral
A Escala Médica permite registrar períodos de indisponibilidade de médicos (dia inteiro ou horários específicos). Esses bloqueios são considerados no momento de criar ou editar um agendamento, impedindo marcações em datas/horários bloqueados.

- Tipos de bloqueio:
  - dia_completo: médico indisponível em todo o(s) dia(s) do intervalo informado
  - horario_especifico: médico indisponível apenas entre horário_inicio e horário_fim, dentro do intervalo de datas

## Arquivos e Componentes Envolvidos

Frontend:
- src/pages/EscalaMedicos.tsx
  - Página administrativa para visualizar bloqueios e abrir o modal de criação
- src/components/BloqueioMedicoModal.tsx
  - Modal para criar novos bloqueios (seleção de médico, intervalo, tipo, motivo)
- src/pages/FilaEspera.tsx
  - Página acessória (fila de espera). Não interfere diretamente na escala, mas foi ajustada tipagem
- src/components/AgendamentoModal.tsx
  - Modal principal de criação/edição de agendamentos (usa o hook abaixo)
- src/hooks/useAgendamentoForm.tsx
  - Hook que centraliza validações e submissão do agendamento (inclui checagem de indisponibilidade e de conflitos)
- src/components/AgendamentoFormFields.tsx
  - Campos do formulário (data, horário, médico etc.)

Backend (Supabase):
- Tabela: medicos_indisponibilidade
  - Campos usados: medico_id, tipo_bloqueio, data_inicio, data_fim, horario_inicio, horario_fim, motivo, clinica_id, ativo
- Função RPC: public.verificar_disponibilidade_medico(p_medico_id uuid, p_data date, p_horario time)
  - Retorna boolean informando se o médico está disponível (true) ou indisponível (false) considerando bloqueios ativos
- Função RPC: public.verificar_conflitos_agendamento(...)
  - Retorna JSON com detalhes de conflitos com outros agendamentos (se houver)

## Como a Agenda “sabe” da escala e bloqueia marcações
Durante a submissão do agendamento (criar/editar), o hook useAgendamentoForm executa, nesta ordem:

1) Checagem de disponibilidade do médico (escala/bloqueios)
   - Chamada: rpc('verificar_disponibilidade_medico', { p_medico_id, p_data, p_horario })
   - Se retornar false (indisponível), o fluxo é interrompido, é exibido um toast “Médico indisponível”, e o agendamento NÃO é salvo

2) Checagem de conflitos com outros agendamentos
   - Chamada: rpc('verificar_conflitos_agendamento', { p_medico_id, p_data_agendamento, p_horario_inicio, p_horario_fim, p_agendamento_excluir })
   - Se existir conflito, o fluxo é interrompido com um toast informativo

3) Persistência do agendamento
   - Se passou pelas validações acima, o registro é inserido/atualizado na tabela agendamentos

Importante: a validação de indisponibilidade ocorre tanto na criação quanto na edição (quando houver médico e data definidos).

## Fluxo Completo (Passo a passo)
1. Usuário abre a página Escala de Médicos (src/pages/EscalaMedicos.tsx) e cria bloqueios via BloqueioMedicoModal
2. Os bloqueios são salvos em medicos_indisponibilidade
3. No modal de agendamento (AgendamentoModal + AgendamentoFormFields), ao submeter:
   - Valida campos obrigatórios e pagamento
   - Chama verificar_disponibilidade_medico
   - Se disponível, chama verificar_conflitos_agendamento
   - Se sem conflitos, grava em agendamentos
4. Agenda atualiza a lista/visão conforme implementação existente

## Pontos de Integração (Modais e Páginas)
- BloqueioMedicoModal
  - Cria registros de indisponibilidade que serão respeitados pelo agendamento
- AgendamentoModal (usa useAgendamentoForm)
  - Intercepta a submissão e impede gravação quando há bloqueio
- EscalaMedicos
  - Lista bloqueios existentes e oferece ação para inserir novos
- Demais páginas/grades de agenda
  - Continuam funcionando normalmente; a regra é aplicada no momento de salvar

## Mensagens ao Usuário
- “Médico indisponível: Há um bloqueio na escala do médico para a data/horário selecionados.”
- “Conflito de horário: Médico já possui consulta no horário. Primeiro conflito: …”

## Erros Comuns e Soluções
- Selecionar horário sem informar médico: checagens de disponibilidade/conflito são executadas apenas quando há médico
- Edição que muda médico/data/horário para um período bloqueado: a validação impede salvar

## Como Testar
1. Crie um bloqueio dia_completo para um médico em uma data
2. Tente agendar o mesmo médico nessa data: deve bloquear
3. Crie um bloqueio horario_especifico dentro de um intervalo do dia
4. Tente agendar dentro do intervalo: deve bloquear; fora do intervalo: deve permitir (salvo se houver conflitos)

## Extensões Futuras (opcional)
- Indicar visualmente na grade os períodos bloqueados (somente visual)
- Relatórios de bloqueios por médico/período

## Referências (DB)
- Tabela: medicos_indisponibilidade
- Funções RPC: verificar_disponibilidade_medico, verificar_conflitos_agendamento

## Notas de Segurança
- As validações rodam no backend (via RPC), garantindo a regra mesmo se o frontend for burlado
- RLS deve continuar isolando dados por clínica conforme políticas já existentes
