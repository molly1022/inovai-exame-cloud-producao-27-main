import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { FileText, AlertTriangle } from "lucide-react";
import { TenantGuard } from '@/components/TenantGuard';

interface EnhancedExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  exam?: any;
}

const EnhancedExamModal = ({ isOpen, onClose, onSuccess, exam }: EnhancedExamModalProps) => {
  return (
    <TenantGuard>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {exam ? 'Editar Exame' : 'Cadastrar Exame'}
            </DialogTitle>
          </DialogHeader>
          
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              📋 Sistema de Exames - Disponível apenas dentro de uma clínica específica.
              Esta funcionalidade permite cadastrar e gerenciar exames de uma clínica.
            </AlertDescription>
          </Alert>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </TenantGuard>
  );
};

export default EnhancedExamModal;