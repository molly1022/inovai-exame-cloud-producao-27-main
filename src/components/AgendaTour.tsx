
import React, { useState } from 'react';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';
import { Button } from "@/components/ui/button";
import { 
  PartyPopper, 
  Plus, 
  Calendar, 
  Zap, 
  Search, 
  Target, 
  Eye, 
  FileText, 
  DoorOpen, 
  Play, 
  CheckCircle, 
  X, 
  Printer, 
  DollarSign,
  UserCheck,
  AlertTriangle,
  Clock
} from "lucide-react";

interface AgendaTourProps {
  onTourComplete?: () => void;
}

const AgendaTour = ({ onTourComplete }: AgendaTourProps) => {
  const [run, setRun] = useState(false);

  const steps: Step[] = [
    {
      target: 'body',
      content: (
        <div className="p-4" style={{ padding: '15px' }}>
          <h3 className="text-2xl font-bold mb-4 text-white flex items-center gap-2">
            <PartyPopper className="h-6 w-6 text-blue-400" />
            Bem-vindo ao Sistema de Agenda!
          </h3>
          <p className="text-gray-200 leading-relaxed mb-4 text-base">
            Este tutorial vai te ensinar como usar todas as funcionalidades da agenda de forma simples e eficiente.
          </p>
          <div className="mt-4 p-4 bg-blue-900/30 rounded-xl border-l-4 border-blue-400 shadow-sm">
            <p className="text-sm text-blue-200 font-medium flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Dica: Você pode pular este tutorial a qualquer momento!
            </p>
          </div>
        </div>
      ),
      placement: 'center',
    },
    {
      target: '[data-tour="novo-agendamento"]',
      content: (
        <div className="p-4" style={{ padding: '15px' }}>
          <h4 className="font-bold mb-3 text-green-400 text-lg flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Criar Novo Agendamento
          </h4>
          <p className="text-gray-200 mb-3 leading-relaxed">
            Clique neste botão para agendar uma nova consulta ou exame.
          </p>
          <div className="bg-green-900/30 p-3 rounded-xl border-l-4 border-green-400 shadow-sm">
            <p className="text-sm text-green-200 font-medium flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Disponível em qualquer tela da agenda!
            </p>
          </div>
        </div>
      ),
    },
    {
      target: '[data-tour="calendario"]',
      content: (
        <div className="p-4" style={{ padding: '15px' }}>
          <h4 className="font-bold mb-3 text-blue-400 text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Navegação por Calendário
          </h4>
          <p className="text-gray-200 mb-3 leading-relaxed">
            Use o calendário para navegar entre datas e visualizar agendamentos de diferentes dias.
          </p>
          <ul className="text-sm text-gray-200 space-y-2 bg-blue-900/30 p-3 rounded-lg">
            <li className="flex items-center gap-2">
              <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
              Clique em qualquer data para visualizar
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
              Navegue por meses usando as setas
            </li>
          </ul>
        </div>
      ),
    },
    {
      target: '[data-tour="navegacao-data"]',
      content: (
        <div className="p-4" style={{ padding: '15px' }}>
          <h4 className="font-bold mb-3 text-purple-400 text-lg flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Navegação Rápida
          </h4>
          <p className="text-gray-200 leading-relaxed">
            Use estas setas para navegar rapidamente entre os dias sem precisar abrir o calendário.
          </p>
        </div>
      ),
    },
    {
      target: '[data-tour="busca"]',
      content: (
        <div className="p-4" style={{ padding: '15px' }}>
          <h4 className="font-bold mb-3 text-orange-400 text-lg flex items-center gap-2">
            <Search className="h-5 w-5" />
            Buscar Paciente
          </h4>
          <p className="text-gray-200 mb-3 leading-relaxed">
            Digite o nome ou CPF do paciente para encontrar agendamentos rapidamente.
          </p>
          <div className="bg-orange-900/30 p-3 rounded-xl border-l-4 border-orange-400 shadow-sm">
            <p className="text-sm text-orange-200 font-medium flex items-center gap-2">
              <Zap className="h-4 w-4" />
              A busca funciona em tempo real!
            </p>
          </div>
        </div>
      ),
    },
    {
      target: '[data-tour="filtro-status"]',
      content: (
        <div className="p-4" style={{ padding: '15px' }}>
          <h4 className="font-bold mb-3 text-indigo-400 text-lg flex items-center gap-2">
            <Target className="h-5 w-5" />
            Filtros de Status
          </h4>
          <p className="text-gray-200 mb-3 leading-relaxed">
            Filtre os agendamentos por status para ter uma visão organizada:
          </p>
          <ul className="text-sm text-gray-200 space-y-2 bg-indigo-900/30 p-3 rounded-lg">
            <li className="flex items-center gap-2">
              <FileText className="h-3 w-3 text-blue-400" />
              Agendados
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-3 w-3 text-green-400" />
              Confirmados
            </li>
            <li className="flex items-center gap-2">
              <DoorOpen className="h-3 w-3 text-teal-400" />
              Paciente chegou
            </li>
            <li className="flex items-center gap-2">
              <Play className="h-3 w-3 text-yellow-400" />
              Em andamento
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-3 w-3 text-purple-400" />
              Concluídos
            </li>
          </ul>
        </div>
      ),
    },
    {
      target: '[data-tour="toggle-view"]',
      content: (
        <div className="p-4" style={{ padding: '15px' }}>
          <h4 className="font-bold mb-3 text-teal-400 text-lg flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Alternar Visualização
          </h4>
          <p className="text-gray-200 mb-3 leading-relaxed">
            Escolha entre duas formas de visualizar seus agendamentos:
          </p>
          <ul className="text-sm text-gray-200 space-y-2 bg-teal-900/30 p-3 rounded-lg">
            <li className="flex items-center gap-2">
              <FileText className="h-3 w-3 text-teal-400" />
              <strong>Lista:</strong> Visualização organizada por categorias
            </li>
            <li className="flex items-center gap-2">
              <Clock className="h-3 w-3 text-teal-400" />
              <strong>Grade:</strong> Visualização por horários
            </li>
          </ul>
        </div>
      ),
    },
    {
      target: '[data-tour="agendamento-card"]',
      content: (
        <div className="p-4" style={{ padding: '15px' }}>
          <h4 className="font-bold mb-3 text-gray-200 text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Card do Agendamento
          </h4>
          <p className="text-gray-200 mb-3 leading-relaxed">
            Cada agendamento exibe informações importantes:
          </p>
          <ul className="text-sm text-gray-200 space-y-2 bg-gray-800/50 p-3 rounded-lg">
            <li className="flex items-center gap-2">
              <Clock className="h-3 w-3 text-blue-400" />
              Data e horário
            </li>
            <li className="flex items-center gap-2">
              <UserCheck className="h-3 w-3 text-green-400" />
              Nome do paciente
            </li>
            <li className="flex items-center gap-2">
              <UserCheck className="h-3 w-3 text-purple-400" />
              Médico responsável
            </li>
            <li className="flex items-center gap-2">
              <FileText className="h-3 w-3 text-orange-400" />
              Tipo de exame
            </li>
            <li className="flex items-center gap-2">
              <DollarSign className="h-3 w-3 text-yellow-400" />
              Informações de pagamento
            </li>
          </ul>
        </div>
      ),
    },
    {
      target: '[data-tour="acoes-agendamento"]',
      content: (
        <div className="p-4" style={{ padding: '15px' }}>
          <h4 className="font-bold mb-4 text-red-400 text-lg flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Ações do Agendamento
          </h4>
          <p className="text-gray-200 mb-4 leading-relaxed">
            Use estes botões para gerenciar o fluxo do atendimento:
          </p>
          <div className="space-y-3">
            <div className="bg-teal-900/30 p-3 rounded-xl border-l-4 border-teal-400 shadow-sm">
              <p className="text-sm font-semibold text-teal-200 flex items-center gap-2">
                <DoorOpen className="h-4 w-4" />
                <strong>Confirmar Chegada:</strong> Quando o paciente chegar na clínica
              </p>
            </div>
            <div className="bg-yellow-900/30 p-3 rounded-xl border-l-4 border-yellow-400 shadow-sm">
              <p className="text-sm font-semibold text-yellow-200 flex items-center gap-2">
                <Play className="h-4 w-4" />
                <strong>Iniciar:</strong> <span className="text-red-400">Apenas o médico pode fazer</span> - Quando estiver pronto para atender
              </p>
            </div>
            <div className="bg-purple-900/30 p-3 rounded-xl border-l-4 border-purple-400 shadow-sm">
              <p className="text-sm font-semibold text-purple-200 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <strong>Concluir:</strong> <span className="text-red-400">Apenas o médico pode fazer</span> - Ao finalizar a consulta
              </p>
            </div>
            <div className="bg-red-900/30 p-3 rounded-xl border-l-4 border-red-400 shadow-sm">
              <p className="text-sm font-semibold text-red-200 flex items-center gap-2">
                <X className="h-4 w-4" />
                <strong>Cancelar Consulta:</strong> Para cancelar o agendamento quando necessário
              </p>
            </div>
            <div className="bg-blue-900/30 p-3 rounded-xl border-l-4 border-blue-400 shadow-sm">
              <p className="text-sm font-semibold text-blue-200 flex items-center gap-2">
                <Printer className="h-4 w-4" />
                <strong>Imprimir Comprovante:</strong> Gerar comprovante para o paciente
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      target: '[data-tour="acoes-agendamento"]',
      content: (
        <div className="p-4" style={{ padding: '15px' }}>
          <h4 className="font-bold mb-4 text-green-400 text-lg flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Verificação de Pagamento
          </h4>
          <div className="bg-green-900/30 p-4 rounded-xl border-2 border-green-400 shadow-lg mb-4">
            <h5 className="font-bold text-green-200 mb-3 text-center flex items-center justify-center gap-2">
              <Search className="h-4 w-4" />
              IMPORTANTE: Verificar Pagamento
            </h5>
            <div className="space-y-3">
              <div className="bg-gray-800/70 p-3 rounded-lg border border-green-400/30">
                <p className="text-sm text-green-200 font-semibold flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  <strong>Totalmente Pago:</strong> Consulta quitada no agendamento
                </p>
              </div>
              <div className="bg-yellow-900/50 p-3 rounded-lg border border-yellow-400/50">
                <p className="text-sm text-yellow-200 font-semibold flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  <strong>Pagamento Parcial:</strong> Clique no botão de pagamento para finalizar
                </p>
              </div>
              <div className="bg-red-900/50 p-3 rounded-lg border border-red-400/50">
                <p className="text-sm text-red-200 font-semibold flex items-center gap-2">
                  <X className="h-4 w-4" />
                  <strong>Não Pago:</strong> Registre o pagamento antes de concluir
                </p>
              </div>
            </div>
          </div>
          <div className="bg-blue-900/30 p-3 rounded-lg border border-blue-400/30">
            <p className="text-sm text-blue-200 font-medium flex items-center gap-2">
              <Zap className="h-4 w-4" />
              <strong>Dica:</strong> Sempre verifique o status de pagamento antes de finalizar a consulta!
            </p>
          </div>
        </div>
      ),
    },
    {
      target: 'body',
      content: (
        <div className="p-4" style={{ padding: '15px' }}>
          <h3 className="text-2xl font-bold mb-4 text-green-400 flex items-center gap-2">
            <PartyPopper className="h-6 w-6" />
            Parabéns! Tutorial Concluído
          </h3>
          <div className="bg-green-900/30 p-5 rounded-xl border-2 border-green-400 shadow-lg mb-4">
            <h4 className="font-bold text-green-200 mb-3 text-lg flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Fluxo do Atendimento - Passo a Passo:
            </h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-2 bg-gray-800/30 rounded-lg">
                <span className="text-xl font-bold text-green-400">1</span>
                <div>
                  <p className="font-semibold text-green-200">Paciente chega na clínica</p>
                  <p className="text-sm text-gray-300">Clique em "Confirmar Chegada"</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-2 bg-gray-800/30 rounded-lg">
                <span className="text-xl font-bold text-yellow-400">2</span>
                <div>
                  <p className="font-semibold text-yellow-200">Verificar se está pago</p>
                  <p className="text-sm text-gray-300">Confirme o pagamento antes de continuar</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-2 bg-gray-800/30 rounded-lg">
                <span className="text-xl font-bold text-blue-400">3</span>
                <div>
                  <p className="font-semibold text-blue-200">Médico inicia consulta</p>
                  <p className="text-sm text-red-300">⚠️ Somente o médico pode iniciar</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-2 bg-gray-800/30 rounded-lg">
                <span className="text-xl font-bold text-purple-400">4</span>
                <div>
                  <p className="font-semibold text-purple-200">Médico finaliza consulta</p>
                  <p className="text-sm text-red-300">⚠️ Somente o médico pode finalizar</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-2 bg-gray-800/30 rounded-lg">
                <span className="text-xl font-bold text-gray-400">5</span>
                <div>
                  <p className="font-semibold text-gray-200">Imprimir comprovante</p>
                  <p className="text-sm text-gray-300">Entregue o comprovante ao paciente</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-blue-900/30 p-4 rounded-xl border border-blue-400/30 shadow-sm">
            <p className="text-sm text-blue-200 font-medium flex items-center gap-2">
              <Zap className="h-4 w-4" />
              <strong>Lembrete:</strong> Acesse este tutorial novamente clicando no botão "Tutorial" no topo da tela.
            </p>
          </div>
        </div>
      ),
      placement: 'center',
    },
  ];

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRun(false);
      onTourComplete?.();
    }
  };

  return (
    <>
      <Button
        onClick={() => setRun(true)}
        variant="outline"
        size="sm"
        className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border-blue-300 text-blue-700 shadow-md hover:shadow-lg transition-all duration-300"
        title="Tutorial Interativo - Aprenda a usar a agenda"
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline font-medium">Tutorial</span>
      </Button>

      <Joyride
        steps={steps}
        run={run}
        continuous={true}
        showProgress={false}
        showSkipButton={true}
        callback={handleJoyrideCallback}
        styles={{
          options: {
            primaryColor: '#3B82F6',
            backgroundColor: 'rgb(37, 37, 37)',
            arrowColor: 'rgb(37, 37, 37)',
            textColor: '#ffffff',
            width: 450,
            zIndex: 10000,
          },
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
          },
          spotlight: {
            backgroundColor: 'transparent',
            border: '3px solid #3B82F6',
            borderRadius: '12px',
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.4)',
          },
          tooltip: {
            borderRadius: '16px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(59, 130, 246, 0.3)',
            fontSize: '14px',
            padding: '0',
            filter: 'drop-shadow(0 20px 13px rgb(0 0 0 / 0.3))',
            backgroundColor: 'rgb(37, 37, 37)',
            color: '#ffffff',
          },
          tooltipContainer: {
            textAlign: 'left',
          },
          tooltipTitle: {
            fontSize: '18px',
            fontWeight: '700',
            marginBottom: '12px',
            color: '#ffffff',
          },
          buttonNext: {
            backgroundColor: '#3B82F6',
            borderRadius: '10px',
            padding: '10px 20px',
            fontSize: '14px',
            fontWeight: '600',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
            transition: 'all 0.2s ease',
            color: '#ffffff',
            marginBottom: '15px',
          },
          buttonBack: {
            color: '#9CA3AF',
            marginRight: '12px',
            fontWeight: '500',
            marginBottom: '15px',
          },
          buttonSkip: {
            color: '#6B7280',
            fontSize: '13px',
            fontWeight: '500',
            marginBottom: '15px',
          },
        }}
        locale={{
          back: 'Voltar',
          close: 'Fechar',
          last: 'Finalizar',
          next: 'Próxima Etapa',
          skip: 'Pular Tutorial',
        }}
        floaterProps={{
          disableAnimation: false,
        }}
      />
    </>
  );
};

export default AgendaTour;
