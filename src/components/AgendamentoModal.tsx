
import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon } from "lucide-react";
import { useAgendamentoForm } from '@/hooks/useAgendamentoForm';
import { useConvenios } from '@/hooks/useConvenios';
import AgendamentoFormFields from './AgendamentoFormFields';
import { useIsMobile } from '@/hooks/use-mobile';

interface AgendamentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  agendamento?: any;
  pacientes: any[];
  medicos: any[];
  selectedDate?: Date;
  selectedTime?: string;
  mode?: 'create' | 'edit' | 'view';
}

const AgendamentoModal = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  agendamento, 
  pacientes, 
  medicos, 
  selectedDate, 
  selectedTime,
  mode = 'create'
}: AgendamentoModalProps) => {
  
  console.log('=== AGENDAMENTO MODAL PROPS ===');
  console.log('isOpen:', isOpen);
  console.log('mode:', mode);
  console.log('selectedDate:', selectedDate);
  console.log('selectedTime:', selectedTime);
  console.log('agendamento:', agendamento);

  const isMobile = useIsMobile();

  const handleModalSuccess = () => {
    console.log('=== MODAL SUCCESS CALLBACK ===');
    onSuccess();
    onClose();
  };

  const { 
    formData, 
    loading, 
    updateField, 
    handleSubmit, 
    resetForm 
  } = useAgendamentoForm({ 
    agendamento, 
    onSuccess: handleModalSuccess,
    selectedDate, 
    selectedTime 
  });

  const { convenios, loading: conveniosLoading, refetch: refetchConvenios } = useConvenios();

  // Reset form quando modal fecha
  useEffect(() => {
    if (!isOpen) {
      console.log('Modal fechado - resetando form');
      resetForm();
    }
  }, [isOpen, resetForm]);

  // Recarregar dados quando modal abre
  useEffect(() => {
    if (isOpen) {
      refetchConvenios(); // Recarregar convenios
    }
  }, [isOpen, refetchConvenios]);

  // Log dos dados do formulário para debug
  useEffect(() => {
    console.log('=== FORM DATA ATUAL ===');
    console.log(formData);
  }, [formData]);

  const getModalTitle = () => {
    switch (mode) {
      case 'view': return 'Visualizar Agendamento';
      case 'edit': return 'Editar Agendamento';
      default: return 'Novo Agendamento';
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    console.log('=== SUBMIT DO MODAL ===');
    e.preventDefault();
    await handleSubmit(e);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`
        ${isMobile 
          ? 'w-[95vw] max-w-[95vw] h-[90vh] max-h-[90vh] m-2' 
          : 'max-w-2xl max-h-[90vh]'
        } 
        overflow-y-auto
      `}>
        <DialogHeader className={isMobile ? 'pb-2' : ''}>
          <DialogTitle className={`flex items-center gap-2 ${isMobile ? 'text-lg' : ''}`}>
            <CalendarIcon className={`${isMobile ? 'h-5 w-5' : 'h-6 w-6'} text-blue-600`} />
            <span>{getModalTitle()}</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleFormSubmit} className={`space-y-4 ${isMobile ? 'space-y-3' : 'space-y-6'}`}>
          <AgendamentoFormFields
            formData={formData}
            updateField={updateField}
            pacientes={pacientes}
            medicos={medicos}
            convenios={convenios}
            conveniosLoading={conveniosLoading}
            mode={mode}
          />

          <div className={`
            flex gap-2 pt-4 
            ${isMobile 
              ? 'flex-col-reverse space-y-reverse space-y-2' 
              : 'flex-row justify-end space-x-2'
            }
          `}>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              disabled={loading}
              className={isMobile ? 'w-full' : ''}
            >
              {mode === 'view' ? 'Fechar' : 'Cancelar'}
            </Button>
            {mode !== 'view' && (
              <Button 
                type="submit" 
                disabled={loading}
                className={isMobile ? 'w-full' : ''}
              >
                {loading ? 'Salvando...' : (agendamento?.id ? 'Atualizar' : 'Criar')}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AgendamentoModal;
