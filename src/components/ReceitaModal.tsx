import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ReceitaModalProps {
  isOpen: boolean;
  onClose: () => void;
  receita?: any;
  medicoId?: string;
  clinicaId?: string;
  onSuccess?: () => void;
}

export const ReceitaModal = ({ isOpen, onClose, receita, medicoId, clinicaId, onSuccess }: ReceitaModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Receita Médica</DialogTitle>
        </DialogHeader>
        <div className="p-4">
          <p>Modal de receita em modo demonstração.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReceitaModal;