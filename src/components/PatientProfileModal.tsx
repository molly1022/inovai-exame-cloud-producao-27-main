import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface PatientProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId?: string;
  paciente?: any;
  onUpdate?: () => void;
}

export const PatientProfileModal = ({ isOpen, onClose, patientId, paciente, onUpdate }: PatientProfileModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Perfil do Paciente</DialogTitle>
        </DialogHeader>
        <div className="p-4">
          <p>Modal de perfil do paciente em modo demonstração.</p>
          {patientId && <p className="text-sm text-muted-foreground">ID: {patientId}</p>}
          {paciente && <p className="text-sm text-muted-foreground">Paciente: {paciente.nome}</p>}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PatientProfileModal;