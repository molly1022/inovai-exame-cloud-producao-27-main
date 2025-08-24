
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Clock, User } from "lucide-react";
import { formatTimeLocal } from '@/lib/utils';
import AgendamentoActionButtons from './AgendamentoActionButtons';
import { useIsMobile } from '@/hooks/use-mobile';
import { DndContext, useDroppable, useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { useAgendaDragDrop } from '@/hooks/useAgendaDragDrop';

interface Agendamento {
  id: string;
  tipo_exame: string;
  data_agendamento: string;
  status: string;
  observacoes?: string;
  pacientes?: {
    nome: string;
    cpf: string;
  };
  medicos?: {
    nome_completo: string;
    crm?: string;
  };
}

interface AgendaTimeGridProps {
  agendamentos: Agendamento[];
  onNewAgendamento: (timeSlot: string) => void;
  onUpdate: () => void;
  selectedDate: Date;
}


const getStatusColor = (status: string) => {
  switch (status) {
    case 'agendado': return 'bg-blue-100 border-blue-300';
    case 'confirmado': return 'bg-green-100 border-green-300';
    case 'paciente_chegou': return 'bg-yellow-100 border-yellow-300';
    case 'em_andamento': return 'bg-orange-100 border-orange-300';
    case 'concluido': return 'bg-gray-100 border-gray-300';
    case 'cancelado': return 'bg-red-100 border-red-300';
    case 'faltou': return 'bg-purple-100 border-purple-300';
    default: return 'bg-gray-100 border-gray-300';
  }
};

const DraggableAgendamento: React.FC<{ agendamento: Agendamento; timeSlot: string; isMobile: boolean; onUpdate: () => void; }> = ({ agendamento, timeSlot, isMobile, onUpdate }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `agendamento-${agendamento.id}`,
    data: { timeSlot },
  });
  const style: React.CSSProperties = transform ? {
    transform: CSS.Translate.toString(transform),
    zIndex: 50,
  } : {};

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`${isMobile ? 'p-2' : 'p-3'} rounded-lg border-2 cursor-move select-none ${getStatusColor(agendamento.status)}`}
    >
      <div className={`flex items-start justify-between gap-2 ${isMobile ? 'flex-col space-y-2' : ''}`}>
        <div className="flex-1 min-w-0">
          <div className={`flex items-center gap-2 ${isMobile ? 'mb-1' : 'mb-1'}`}>
            <span className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium truncate`}>
              {agendamento.tipo_exame}
            </span>
            <span className={`${isMobile ? 'text-xs px-1 py-0.5' : 'text-xs px-2 py-1'} bg-white rounded-full border`}>
              {agendamento.status}
            </span>
          </div>

          <div className={`flex items-center gap-2 ${isMobile ? 'text-xs' : 'text-xs'} text-gray-600 mb-1`}>
            <User className={`${isMobile ? 'h-3 w-3' : 'h-3 w-3'}`} />
            <span className="truncate">
              {agendamento.pacientes?.nome || 'Paciente não encontrado'}
            </span>
          </div>

          {agendamento.medicos && (
            <div className={`${isMobile ? 'text-xs' : 'text-xs'} text-gray-500`}>
              Dr(a). {agendamento.medicos.nome_completo}
            </div>
          )}

          {agendamento.observacoes && (
            <div className={`${isMobile ? 'text-xs' : 'text-xs'} text-gray-600 mt-1 italic`}>
              {agendamento.observacoes}
            </div>
          )}
        </div>

        <div className={`flex-shrink-0 ${isMobile ? 'w-full flex justify-end' : ''}`}>
          <AgendamentoActionButtons
            agendamento={agendamento}
            onUpdate={onUpdate}
            size="sm"
          />
        </div>
      </div>
    </div>
  );
};

const TimeSlotRow: React.FC<{ timeSlot: string; isPassed: boolean; isEmpty: boolean; onNew: (t: string) => void; isMobile: boolean; children: React.ReactNode; }> = ({ timeSlot, isPassed, isEmpty, onNew, isMobile, children }) => {
  const { setNodeRef, isOver } = useDroppable({ id: `slot-${timeSlot}` });
  return (
    <Card 
      key={timeSlot} 
      className={`border-l-4 ${
        isEmpty 
          ? (isPassed ? 'border-l-gray-400 opacity-60' : 'border-l-gray-300') 
          : 'border-l-blue-500'
      } ${isOver ? 'ring-2 ring-primary/40' : ''}`}
    >
      <CardContent className={isMobile ? 'p-2' : 'p-3'} ref={setNodeRef}>
        <div className={`flex items-center justify-between ${isMobile ? 'mb-1' : 'mb-2'}`}>
          <div className="flex items-center gap-2">
            <Clock className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} ${isPassed ? 'text-gray-400' : 'text-gray-500'}`} />
            <span className={`${isMobile ? 'text-sm' : ''} font-medium ${isPassed ? 'text-gray-400' : 'text-gray-700'}`}>
              {timeSlot}
            </span>
            {isPassed && <Badge variant="outline" className="text-xs bg-gray-100">Passou</Badge>}
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => onNew(timeSlot)}
            className={`text-xs ${isMobile ? 'px-2 py-1' : ''}`}
            disabled={isPassed}
          >
            <Plus className={`${isMobile ? 'h-3 w-3 mr-1' : 'h-3 w-3 mr-1'}`} />
            {isMobile ? '+' : 'Agendar'}
          </Button>
        </div>

        {children}
      </CardContent>
    </Card>
  );
};

const AgendaTimeGrid = ({ agendamentos, onNewAgendamento, onUpdate, selectedDate }: AgendaTimeGridProps) => {
  const isMobile = useIsMobile();
  const { sensors, onDragEnd } = useAgendaDragDrop(selectedDate, onUpdate);

  // Gerar slots de horário das 22h às 7h (ordem decrescente - mais recentes primeiro)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 22; hour >= 7; hour--) {
      slots.push(`${String(hour).padStart(2, '0')}:30`);
      slots.push(`${String(hour).padStart(2, '0')}:00`);
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Agrupar agendamentos por horário - CORRIGIDO
  const getAgendamentosForSlot = (timeSlot: string) => {
    console.log(`Buscando agendamentos para slot ${timeSlot}`);
    
    return agendamentos.filter(agendamento => {
      const agendamentoTime = formatTimeLocal(agendamento.data_agendamento);
      console.log(`Comparando: ${agendamentoTime} === ${timeSlot}`);
      
      // Comparação mais flexível de horários
      const slotTime = timeSlot.padStart(5, '0'); // Garante formato HH:MM
      const appointmentTime = agendamentoTime.padStart(5, '0');
      
      return appointmentTime === slotTime;
    });
  };

  const handleNewAgendamento = (timeSlot: string) => {
    console.log(`Criando novo agendamento para ${timeSlot}`);
    onNewAgendamento(timeSlot);
  };


  // Verificar se o horário já passou
  const isTimeSlotPassed = (timeSlot: string) => {
    const now = new Date();
    const today = new Date(selectedDate);
    const [hours, minutes] = timeSlot.split(':').map(Number);
    
    const slotDateTime = new Date(today);
    slotDateTime.setHours(hours, minutes, 0, 0);
    
    return now > slotDateTime && today.toDateString() === now.toDateString();
  };

  return (
    <DndContext sensors={sensors} onDragEnd={onDragEnd}>
      <div className="space-y-2">
        <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold mb-4`}>
          Agenda do dia {selectedDate.toLocaleDateString('pt-BR')}
        </h3>
        
        <div className={`
          grid gap-2 
          ${isMobile 
            ? 'max-h-[60vh] overflow-y-auto pb-4' 
            : 'max-h-[600px] overflow-y-auto'
          }
        `}>
          {timeSlots.map((timeSlot) => {
            const agendamentosNoSlot = getAgendamentosForSlot(timeSlot);
            const isEmpty = agendamentosNoSlot.length === 0;
            const isPassed = isTimeSlotPassed(timeSlot);

            return (
              <TimeSlotRow
                key={timeSlot}
                timeSlot={timeSlot}
                isPassed={isPassed}
                isEmpty={isEmpty}
                onNew={handleNewAgendamento}
                isMobile={isMobile}
              >
                {isEmpty ? (
                  <div className={`text-xs italic ${isPassed ? 'text-gray-400' : 'text-gray-500'}`}>
                    {isPassed ? 'Horário já passou' : 'Horário disponível'}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {agendamentosNoSlot.map((agendamento) => (
                      <DraggableAgendamento
                        key={agendamento.id}
                        agendamento={agendamento}
                        timeSlot={timeSlot}
                        isMobile={isMobile}
                        onUpdate={onUpdate}
                      />
                    ))}
                  </div>
                )}
              </TimeSlotRow>
            );
          })}
        </div>
      </div>
    </DndContext>
  );
};

export default AgendaTimeGrid;
