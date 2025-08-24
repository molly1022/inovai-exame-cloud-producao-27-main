import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Database } from 'lucide-react';
import { TenantGuard } from './TenantGuard';

interface AdicionarFilaEsperaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

export const AdicionarFilaEsperaModal: React.FC<AdicionarFilaEsperaModalProps> = ({ 
  open, 
  onOpenChange, 
  onSaved 
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Adicionar à Lista de Espera</DialogTitle>
        </DialogHeader>
        
        <TenantGuard requiresOperationalDB={true}>
          <ModalContent onSaved={onSaved} onOpenChange={onOpenChange} />
        </TenantGuard>
      </DialogContent>
    </Dialog>
  );
};

const ModalContent: React.FC<{ onSaved: () => void; onOpenChange: (open: boolean) => void }> = ({ onSaved, onOpenChange }) => {
  const { toast } = useToast();

  return (
    <div className="space-y-4">
      <Alert>
        <Database className="h-4 w-4" />
        <AlertDescription>
          <strong>Funcionalidade Temporariamente Indisponível</strong>
          <br />
          Este recurso requer acesso ao banco operacional da clínica específica.
          <br />
          <span className="text-sm text-muted-foreground">
            Para usar esta função, acesse através do subdomínio da clínica (ex: clinica-memorial.sistema.com)
          </span>
        </AlertDescription>
      </Alert>
      
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Entendi
        </Button>
      </DialogFooter>
    </div>
  );
};

export default AdicionarFilaEsperaModal;